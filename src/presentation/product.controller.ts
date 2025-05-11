// src/presentation/controllers/productController.ts
import type { Context } from "hono";
import { ProductService } from "../business/product.service.js";

// Instanciar el servicio
const productService = new ProductService();

export const productController = {
  /**
   * Obtener todos los productos
   */
  async getAllProducts(c: Context) {
    try {
      const products = await productService.getAllProducts();
      return c.json({ success: true, data: products });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      console.error("Error al obtener productos:", message);
      return c.json({ success: false, error: message }, 500);
    }
  },

  /**
   * Obtener un producto por ID
   */
  async getProductById(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      if (isNaN(id)) {
        return c.json(
          { success: false, error: "ID de producto inválido" },
          400,
        );
      }

      const product = await productService.getProductById(id);
      return c.json({ success: true, data: product });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      const status = message.includes("no encontrado") ? 404 : 500;
      console.error(`Error al obtener producto ${c.req.param("id")}:`, message);
      return c.json({ success: false, error: message }, status);
    }
  },

  /**
   * Crear un nuevo producto
   */
  async createProduct(c: Context) {
    try {
      const data = await c.req.json();
      const product = await productService.createProduct(data);
      return c.json({ success: true, data: product }, 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      console.error("Error al crear producto:", message);
      return c.json({ success: false, error: message }, 400);
    }
  },

  /**
   * Actualizar un producto existente
   */
  async updateProduct(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      if (isNaN(id)) {
        return c.json(
          { success: false, error: "ID de producto inválido" },
          400,
        );
      }

      const data = await c.req.json();
      const product = await productService.updateProduct(id, data);
      return c.json({ success: true, data: product });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      const status = message.includes("no encontrado") ? 404 : 400;
      console.error(
        `Error al actualizar producto ${c.req.param("id")}:`,
        message,
      );
      return c.json({ success: false, error: message }, status);
    }
  },

  /**
   * Eliminar un producto
   */
  async deleteProduct(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      if (isNaN(id)) {
        return c.json(
          { success: false, error: "ID de producto inválido" },
          400,
        );
      }

      await productService.deleteProduct(id);
      return c.json({
        success: true,
        message: "Producto eliminado correctamente",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      const status = message.includes("no encontrado") ? 404 : 500;
      console.error(
        `Error al eliminar producto ${c.req.param("id")}:`,
        message,
      );
      return c.json({ success: false, error: message }, status);
    }
  },
};
