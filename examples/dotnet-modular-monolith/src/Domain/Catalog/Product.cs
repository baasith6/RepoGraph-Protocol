namespace ModularMonolith.Domain.Catalog;

public sealed class Product
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
}
