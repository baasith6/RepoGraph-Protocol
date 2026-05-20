namespace ModularMonolith.Domain.Orders;

public sealed class Order
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
}
