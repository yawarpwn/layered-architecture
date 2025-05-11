// src/persistence/productRepository.js
import { db } from "../database/client.js";
import { products } from "../database/schema.js";
import type { Product, NewProduct } from "../types/index.js";
import { eq } from "drizzle-orm";

export class ProductRepository {
  /**
   * Obtiene todos los productos
   */
  async findAll(): Promise<Product[]> {
    return db.select().from(products);
  }

  /**
   * Busca un producto por su ID
   */
  async findById(id: number): Promise<Product | undefined> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return result[0];
  }

  /**
   * Crea un nuevo producto
   */
  async create(data: NewProduct): Promise<Product> {
    const result = await db.insert(products).values(data).returning();
    return result[0];
  }

  /**
   * Actualiza un producto existente
   */
  async update(
    id: number,
    data: Partial<NewProduct>,
  ): Promise<Product | undefined> {
    const result = await db
      .update(products)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  /**
   * Elimina un producto
   */
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.changes > 0;
  }

  /**
   * Actualiza el stock de un producto
   */
  async updateStock(
    id: number,
    quantity: number,
  ): Promise<Product | undefined> {
    const product = await this.findById(id);
    if (!product) return undefined;

    const newStock = product.stock - quantity;
    if (newStock < 0)
      throw new Error(`No hay suficiente stock para el producto ID ${id}`);

    return this.update(id, { stock: newStock });
  }
}
