import { createOrder } from "../services/order.service.js";

export function postOrder(customerId: string, total: number) {
  return createOrder(customerId, total);
}
