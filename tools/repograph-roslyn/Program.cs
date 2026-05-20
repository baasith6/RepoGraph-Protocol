using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Build.Locator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.MSBuild;

static void RegisterMsBuild()
{
    if (MSBuildLocator.IsRegistered) return;
    try
    {
        MSBuildLocator.RegisterDefaults();
        return;
    }
    catch (InvalidOperationException)
    {
        var instance = MSBuildLocator.QueryVisualStudioInstances().OrderByDescending(i => i.Version).FirstOrDefault();
        if (instance != null)
        {
            MSBuildLocator.RegisterInstance(instance);
            return;
        }
    }

    Console.Error.WriteLine(
        "MSBuild not found. Install .NET SDK with MSBuild or Visual Studio Build Tools.");
    Environment.Exit(2);
}

if (args.Length < 1)
{
    Console.Error.WriteLine("Usage: repograph-roslyn <repository-root>");
    Environment.Exit(1);
}

var root = Path.GetFullPath(args[0]);
if (!Directory.Exists(root))
{
    Console.Error.WriteLine($"Directory not found: {root}");
    Environment.Exit(1);
}

RegisterMsBuild();

var csprojFiles = Directory.GetFiles(root, "*.csproj", SearchOption.AllDirectories)
    .Where(p => !p.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
             && !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"))
    .ToList();

var result = new AnalysisResult();
var migrationTableMap = ScanMigrationFiles(root);

foreach (var csproj in csprojFiles)
{
    try
    {
        await AnalyzeProject(csproj, root, result, migrationTableMap);
    }
    catch (Exception ex)
    {
        result.Errors.Add($"{csproj}: {ex.Message}");
    }
}

var json = JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = false });
Console.WriteLine(json);

static Dictionary<string, string> ScanMigrationFiles(string root)
{
    var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    var migrationFiles = Directory.GetFiles(root, "*.cs", SearchOption.AllDirectories)
        .Where(p => p.Contains("Migrations", StringComparison.OrdinalIgnoreCase)
                 && !p.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
                 && !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"))
        .ToList();

    var createTableRegex = new Regex(
        @"CreateTable\s*\(\s*name:\s*""([^""]+)""",
        RegexOptions.Compiled);

    foreach (var file in migrationFiles)
    {
        var content = File.ReadAllText(file);
        foreach (Match m in createTableRegex.Matches(content))
        {
            var table = m.Groups[1].Value;
            if (!map.ContainsKey(table))
            {
                map[table] = Path.GetRelativePath(root, file).Replace('\\', '/');
            }
        }
    }

    return map;
}

static async Task AnalyzeProject(
    string csprojPath,
    string root,
    AnalysisResult result,
    Dictionary<string, string> migrationTableMap)
{
    using var workspace = MSBuildWorkspace.Create();
    var project = await workspace.OpenProjectAsync(csprojPath);
    var projectRel = Path.GetRelativePath(root, csprojPath).Replace('\\', '/');
    result.Projects.Add(projectRel);

    foreach (var document in project.Documents)
    {
        if (document.FilePath == null || !document.FilePath.EndsWith(".cs")) continue;

        var relPath = Path.GetRelativePath(root, document.FilePath).Replace('\\', '/');
        var tree = await document.GetSyntaxTreeAsync();
        if (tree == null) continue;

        var semantic = await document.GetSemanticModelAsync();
        if (semantic == null) continue;

        var rootNode = await tree.GetRootAsync();
        var usings = rootNode.DescendantNodes().OfType<UsingDirectiveSyntax>();
        foreach (var u in usings)
        {
            if (u.Name == null) continue;
            var symbol = semantic.GetSymbolInfo(u.Name).Symbol;
            var target = symbol?.ContainingAssembly?.Name ?? u.Name.ToString();
            result.Dependencies.Add(new FileDependency
            {
                Source = relPath,
                Target = target,
                Type = "using"
            });
        }

        foreach (var cls in rootNode.DescendantNodes().OfType<ClassDeclarationSyntax>())
        {
            var symbol = semantic.GetDeclaredSymbol(cls);
            if (symbol == null) continue;
            result.Symbols.Add(new SymbolInfo
            {
                File = relPath,
                Name = symbol.Name,
                Kind = "CLASS",
                Namespace = symbol.ContainingNamespace?.ToDisplayString() ?? ""
            });

            if (IsDbContext(symbol))
            {
                ExtractDatabaseFromDbContext(cls, relPath, symbol.Name, semantic, result, migrationTableMap, root);
            }

            if (InheritsController(symbol))
            {
                ExtractApiEndpoints(cls, relPath, symbol.Name, result);
            }
            else
            {
                ExtractEntityFromClass(cls, relPath, symbol, semantic, result, migrationTableMap);
            }
        }
    }

    foreach (var reference in project.ProjectReferences)
    {
        var refProject = project.Solution.GetProject(reference.ProjectId);
        if (refProject?.FilePath == null) continue;
        var refRel = Path.GetRelativePath(root, refProject.FilePath).Replace('\\', '/');
        result.Dependencies.Add(new FileDependency
        {
            Source = projectRel,
            Target = refRel,
            Type = "project-reference"
        });
    }
}

static bool IsDbContext(ISymbol symbol)
{
    if (symbol is not INamedTypeSymbol named) return false;
    var baseType = named.BaseType;
    while (baseType != null)
    {
        if (baseType.Name.Equals("DbContext", StringComparison.Ordinal))
            return true;
        baseType = baseType.BaseType;
    }
    return named.Name.EndsWith("DbContext", StringComparison.Ordinal);
}

static string RelPath(string root, string absoluteOrRelative)
{
    if (!Path.IsPathRooted(absoluteOrRelative))
        return absoluteOrRelative.Replace('\\', '/');
    return Path.GetRelativePath(root, absoluteOrRelative).Replace('\\', '/');
}

static void ExtractDatabaseFromDbContext(
    ClassDeclarationSyntax cls,
    string file,
    string contextName,
    SemanticModel semantic,
    AnalysisResult result,
    Dictionary<string, string> migrationTableMap,
    string root)
{
    foreach (var member in cls.Members.OfType<PropertyDeclarationSyntax>())
    {
        if (member.Type is not GenericNameSyntax generic
            || !generic.Identifier.Text.Equals("DbSet", StringComparison.Ordinal))
            continue;

        var entityTypeNode = generic.TypeArgumentList.Arguments.FirstOrDefault();
        if (entityTypeNode == null) continue;

        var typeSymbol = semantic.GetTypeInfo(entityTypeNode).Type as INamedTypeSymbol;
        var entityName = typeSymbol?.Name
            ?? (entityTypeNode is IdentifierNameSyntax id ? id.Identifier.Text : entityTypeNode.ToString());

        var table = InferTableName(entityName, migrationTableMap);
        var entityFile = typeSymbol != null
            ? RelPath(root, FindEntityDeclarationFile(typeSymbol, file))
            : file;
        var requiredFields = typeSymbol != null ? GetRequiredFields(typeSymbol) : [];
        var tenantScoped = requiredFields.Contains("TenantId", StringComparer.Ordinal);

        AddOrUpdateDatabaseEntity(result, new DatabaseEntityInfo
        {
            Name = entityName,
            File = entityFile,
            Table = table,
            DbContext = contextName,
            TenantScoped = tenantScoped,
            RequiredFields = requiredFields,
            MigrationFiles = FindMigrationsForTable(table, migrationTableMap)
        });
    }
}

static void ExtractEntityFromClass(
    ClassDeclarationSyntax cls,
    string file,
    INamedTypeSymbol symbol,
    SemanticModel semantic,
    AnalysisResult result,
    Dictionary<string, string> migrationTableMap)
{
    if (IsDbContext(symbol)) return;

    var isEntity =
        file.Contains("/Entities/", StringComparison.OrdinalIgnoreCase)
        || file.Contains("\\Entities\\", StringComparison.OrdinalIgnoreCase)
        || symbol.Name.EndsWith("Entity", StringComparison.Ordinal);

    if (!isEntity && !HasPersistenceShape(symbol)) return;

    var entityName = symbol.Name.Replace("Entity", "", StringComparison.Ordinal);
    if (string.IsNullOrEmpty(entityName)) entityName = symbol.Name;

    var table = InferTableName(symbol.Name, migrationTableMap);
    var requiredFields = GetRequiredFields(symbol);
    var tenantScoped = requiredFields.Contains("TenantId", StringComparer.Ordinal);

    AddOrUpdateDatabaseEntity(result, new DatabaseEntityInfo
    {
        Name = symbol.Name,
        File = file,
        Table = table,
        DbContext = "",
        TenantScoped = tenantScoped,
        RequiredFields = requiredFields,
        MigrationFiles = FindMigrationsForTable(table, migrationTableMap)
    });
}

static bool HasPersistenceShape(INamedTypeSymbol symbol)
{
    return symbol.GetMembers()
        .OfType<IPropertySymbol>()
        .Any(p => p.Name is "Id" or "TenantId" or "CreatedAt" or "UpdatedAt");
}

static string FindEntityDeclarationFile(INamedTypeSymbol typeSymbol, string fallback)
{
    foreach (var syntaxRef in typeSymbol.DeclaringSyntaxReferences)
    {
        var path = syntaxRef.SyntaxTree.FilePath;
        if (!string.IsNullOrEmpty(path))
            return path.Replace('\\', '/');
    }
    return fallback;
}

static List<string> GetRequiredFields(INamedTypeSymbol symbol)
{
    var fields = new List<string>();
    foreach (var prop in symbol.GetMembers().OfType<IPropertySymbol>())
    {
        if (prop.Name is "TenantId" or "CreatedAt" or "UpdatedAt" or "Id")
            fields.Add(prop.Name);
    }
    return fields;
}

static string InferTableName(string entityName, Dictionary<string, string> migrationTableMap)
{
    var stripped = entityName.Replace("Entity", "", StringComparison.Ordinal);
    if (migrationTableMap.Keys.FirstOrDefault(k =>
            k.Equals(stripped, StringComparison.OrdinalIgnoreCase)
            || k.Equals(stripped + "s", StringComparison.OrdinalIgnoreCase)) is { } match)
        return match;

    return stripped + "s";
}

static List<string> FindMigrationsForTable(string table, Dictionary<string, string> migrationTableMap)
{
    if (migrationTableMap.TryGetValue(table, out var file))
        return [file];
    return [];
}

static void AddOrUpdateDatabaseEntity(AnalysisResult result, DatabaseEntityInfo entity)
{
    var existing = result.DatabaseEntities.FirstOrDefault(e =>
        e.Name.Equals(entity.Name, StringComparison.Ordinal));
    if (existing != null)
    {
        if (string.IsNullOrEmpty(existing.DbContext) && !string.IsNullOrEmpty(entity.DbContext))
            existing.DbContext = entity.DbContext;
        if (string.IsNullOrEmpty(existing.Table) && !string.IsNullOrEmpty(entity.Table))
            existing.Table = entity.Table;
        if (entity.MigrationFiles.Count > 0)
            existing.MigrationFiles = entity.MigrationFiles;
        existing.TenantScoped = existing.TenantScoped || entity.TenantScoped;
        foreach (var f in entity.RequiredFields)
        {
            if (!existing.RequiredFields.Contains(f))
                existing.RequiredFields.Add(f);
        }
        return;
    }
    result.DatabaseEntities.Add(entity);
}

static bool InheritsController(ISymbol symbol)
{
    if (symbol is not INamedTypeSymbol named) return false;
    var baseType = named.BaseType;
    while (baseType != null)
    {
        if (baseType.Name.Contains("Controller", StringComparison.OrdinalIgnoreCase))
            return true;
        baseType = baseType.BaseType;
    }
    return false;
}

static void ExtractApiEndpoints(ClassDeclarationSyntax cls, string file, string className, AnalysisResult result)
{
    var routeAttr = cls.AttributeLists
        .SelectMany(a => a.Attributes)
        .FirstOrDefault(a => a.Name.ToString().Contains("Route"));

    var baseRoute = "";
    if (routeAttr?.ArgumentList?.Arguments.FirstOrDefault()?.Expression is LiteralExpressionSyntax lit)
    {
        baseRoute = lit.Token.ValueText;
    }

    foreach (var method in cls.Members.OfType<MethodDeclarationSyntax>())
    {
        var httpAttr = method.AttributeLists
            .SelectMany(a => a.Attributes)
            .FirstOrDefault(a =>
                a.Name.ToString().StartsWith("Http", StringComparison.OrdinalIgnoreCase));

        if (httpAttr == null) continue;

        var methodRoute = "";
        var routeArg = httpAttr.ArgumentList?.Arguments.FirstOrDefault()?.Expression as LiteralExpressionSyntax;
        if (routeArg != null) methodRoute = routeArg.Token.ValueText;

        var fullRoute = $"{baseRoute}/{methodRoute}".Replace("//", "/").TrimEnd('/');
        result.ApiEndpoints.Add(new ApiEndpointInfo
        {
            File = file,
            Controller = className,
            Method = method.Identifier.Text,
            Route = fullRoute
        });
    }
}

public class AnalysisResult
{
    public List<string> Projects { get; set; } = new();
    public List<FileDependency> Dependencies { get; set; } = new();
    public List<SymbolInfo> Symbols { get; set; } = new();
    public List<ApiEndpointInfo> ApiEndpoints { get; set; } = new();
    public List<DatabaseEntityInfo> DatabaseEntities { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}

public class FileDependency
{
    public string Source { get; set; } = "";
    public string Target { get; set; } = "";
    public string Type { get; set; } = "";
}

public class SymbolInfo
{
    public string File { get; set; } = "";
    public string Name { get; set; } = "";
    public string Kind { get; set; } = "";
    public string Namespace { get; set; } = "";
}

public class ApiEndpointInfo
{
    public string File { get; set; } = "";
    public string Controller { get; set; } = "";
    public string Method { get; set; } = "";
    public string Route { get; set; } = "";
}

public class DatabaseEntityInfo
{
    public string Name { get; set; } = "";
    public string File { get; set; } = "";
    public string Table { get; set; } = "";
    public string DbContext { get; set; } = "";
    public bool TenantScoped { get; set; }
    public List<string> RequiredFields { get; set; } = new();
    public List<string> MigrationFiles { get; set; } = new();
}
