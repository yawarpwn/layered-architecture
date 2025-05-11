// src/presentation/controllers/orderController.ts
import { Context } from "hono";
import { OrderService } from "../business/order.service";

// Instanciar el servicio
const orderService = new OrderService();

export const orderController = {
  /**
   * Obtener todos los pedidos
   */
  async getAllOrders(c: Context) {
    try {
      const orders = await orderService.getAllOrders();
      return c.json({ success: true, data: orders });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      console.error("Error al obtener pedidos:", message);
      return c.json({ success: false, error: message }, 500);
    }
  },

  /**
   * Obtener un pedido por ID con sus items
   */
  async getOrderById(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ success: false, error: "ID de pedido inválido" }, 400);
      }

      const result = await orderService.getOrderWithItems(id);
      return c.json({
        success: true,
        data: {
          order: result.order,
          items: result.items,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      const status = message.includes("no encontrado") ? 404 : 500;
      console.error(`Error al obtener pedido ${c.req.param("id")}:`, message);
      return c.json({ success: false, error: message }, status);
    }
  },

  /**
   * Crear un nuevo pedido
   */
  async createOrder(c: Context) {
    try {
      const data = await c.req.json();
      const order = await orderService.createOrder(data);
      return c.json({ success: true, data: order }, 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      console.error("Error al crear pedido:", message);
      return c.json({ success: false, error: message }, 400);
    }
  },

  /**
   * Actualizar el estado de un pedido
   */
  async updateOrderStatus(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({ success: false, error: "ID de pedido inválido" }, 400);
      }

      const data = await c.req.json();
      const order = await orderService.updateOrderStatus(id, data);
      return c.json({ success: true, data: order });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      const status = message.includes("no encontrado") ? 404 : 400;
      console.error(
        `Error al actualizar estado del pedido ${c.req.param("id")}:`,
        message,
      );
      return c.json({ success: false, error: message }, status);
    }
  },
};
