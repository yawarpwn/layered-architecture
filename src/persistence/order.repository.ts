// src/persistence/orderRepository.ts
import { db } from "../database/client";
import { orders, orderItems, products } from "../database/schema";
import { Order, NewOrder, OrderItem, NewOrderItem } from "../types";
import { eq, and } from "drizzle-orm";

export class OrderRepository {
  /**
   * Obtiene todos los pedidos
   */
  async findAll(): Promise<Order[]> {
    return db.select().from(orders);
  }

  /**
   * Busca un pedido por su ID
   */
  async findById(id: number): Promise<Order | undefined> {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    return result[0];
  }

  /**
   * Obtiene los items de un pedido
   */
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  /**
   * Crea un nuevo pedido con sus items
   */
  async createOrder(
    orderData: NewOrder,
    items: NewOrderItem[],
  ): Promise<Order> {
    return db.transaction(async (tx) => {
      // Insertar el pedido
      const [order] = await tx.insert(orders).values(orderData).returning();

      // Insertar los items del pedido
      const orderItemsWithId = items.map((item) => ({
        ...item,
        orderId: order.id,
      }));

      await tx.insert(orderItems).values(orderItemsWithId);

      return order;
    });
  }

  /**
   * Actualiza el estado de un pedido
   */
  async updateStatus(
    id: number,
    status: Order["status"],
  ): Promise<Order | undefined> {
    const result = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  /**
   * Obtiene un pedido completo con sus items
   */
  async getOrderWithItems(
    id: number,
  ): Promise<{ order: Order; items: OrderItem[] } | undefined> {
    const order = await this.findById(id);
    if (!order) return undefined;

    const items = await this.getOrderItems(id);
    return { order, items };
  }
}
