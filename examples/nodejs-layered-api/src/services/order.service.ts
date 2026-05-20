import type { Order } from "../domain/order.js";

export function createOrder(customerId: string, total: number): Order {
  return { id: crypto.randomUUID(), customerId, total };
}
