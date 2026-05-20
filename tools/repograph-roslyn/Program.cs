using System.Text.Json;
using Microsoft.Build.Locator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.MSBuild;

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

MSBuildLocator.RegisterDefaults();

var csprojFiles = Directory.GetFiles(root, "*.csproj", SearchOption.AllDirectories)
    .Where(p => !p.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
             && !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"))
    .ToList();

var result = new AnalysisResult();

foreach (var csproj in csprojFiles)
{
    try
    {
        await AnalyzeProject(csproj, root, result);
    }
    catch (Exception ex)
    {
        result.Errors.Add($"{csproj}: {ex.Message}");
    }
}

var json = JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = false });
Console.WriteLine(json);

static async Task AnalyzeProject(string csprojPath, string root, AnalysisResult result)
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

            if (InheritsController(symbol))
            {
                ExtractApiEndpoints(cls, relPath, symbol.Name, result);
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
