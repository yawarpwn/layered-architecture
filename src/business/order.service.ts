// src/business/orderService.ts
import { OrderRepository } from "../persistence/order.repository";
import { ProductRepository } from "../persistence/product.repository";
import {
  Order,
  OrderCreateInput,
  OrderStatusUpdateInput,
  orderCreateSchema,
  orderStatusUpdateSchema,
} from "../types";
import { ZodError } from "zod";

export class OrderService {
  private orderRepository = new OrderRepository();
  private productRepository = new ProductRepository();

  /**
   * Obtiene todos los pedidos
   */
  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  /**
   * Obtiene un pedido por su ID con sus items
   */
  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error(`Pedido con ID ${id} no encontrado`);
    }
    return order;
  }

  /**
   * Obtiene un pedido completo con sus items
   */
  async getOrderWithItems(id: number) {
    const result = await this.orderRepository.getOrderWithItems(id);
    if (!result) {
      throw new Error(`Pedido con ID ${id} no encontrado`);
    }
    return result;
  }

  /**
   * Crea un nuevo pedido
   */
  async createOrder(data: unknown): Promise<Order> {
    try {
      // Validar datos de entrada
      const validatedData = orderCreateSchema.parse(data);

      // Calcular monto total y preparar items
      let totalAmount = 0;
      const orderItems = [];

      // Procesar cada item, verificar stock y calcular total
      for (const item of validatedData.items) {
        const product = await this.productRepository.findById(item.productId);

        if (!product) {
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para el producto "${product.name}"`,
          );
        }

        const lineTotal = product.price * item.quantity;
        totalAmount += lineTotal;

        // Crear item para el pedido
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        });

        // Actualizar el stock del producto
        await this.productRepository.updateStock(product.id, item.quantity);
      }

      // Crear el pedido con sus items
      const orderData = {
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        totalAmount,
        status: "pending" as const,
      };

      return this.orderRepository.createOrder(orderData, orderItems);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(
          `Datos de pedido inválidos: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw error;
    }
  }

  /**
   * Actualiza el estado de un pedido
   */
  async updateOrderStatus(id: number, data: unknown): Promise<Order> {
    try {
      // Verificar que el pedido existe
      await this.getOrderById(id);

      // Validar datos de estado
      const validatedData = orderStatusUpdateSchema.parse(data);

      // Actualizar estado
      const updatedOrder = await this.orderRepository.updateStatus(
        id,
        validatedData.status,
      );

      if (!updatedOrder) {
        throw new Error(
          `No se pudo actualizar el estado del pedido con ID ${id}`,
        );
      }

      return updatedOrder;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(
          `Datos de estado inválidos: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw error;
    }
  }
}
