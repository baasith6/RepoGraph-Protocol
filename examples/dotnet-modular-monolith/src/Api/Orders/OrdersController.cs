using ModularMonolith.Application.Orders;

namespace ModularMonolith.Api.Orders;

public static class OrdersController
{
    public static object Post(Guid productId) => PlaceOrderHandler.Handle(productId);
}
