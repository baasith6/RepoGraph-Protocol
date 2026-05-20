using ModularMonolith.Domain.Orders;

namespace ModularMonolith.Application.Orders;

public static class PlaceOrderHandler
{
    public static Order Handle(Guid productId) => new() { Id = Guid.NewGuid(), ProductId = productId };
}
