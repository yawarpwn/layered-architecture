import { ProductRepository } from "../persistence/product.repository.js";
import {
  type Product,
  type ProductCreateInput,
  type ProductUpdateInput,
  productSchema,
  productUpdateSchema,
} from "../types/index.js";
import { ZodError } from "zod";

export class ProductService {
  private repository = new ProductRepository();

  /**
   * Obtiene todos los productos
   */
  async getAllProducts(): Promise<Product[]> {
    return this.repository.findAll();
  }

  /**
   * Obtiene un producto por su ID
   */
  async getProductById(id: number): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  /**
   * Crea un nuevo producto
   */
  async createProduct(data: unknown): Promise<Product> {
    try {
      // Validar datos usando Zod
      const validatedData = productSchema.parse(data);

      // Aplicar lógica de negocio si es necesario

      // Guardar en la base de datos usando el repositorio
      return this.repository.create(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(
          `Datos de producto inválidos: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw error;
    }
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(id: number, data: unknown): Promise<Product> {
    try {
      // Verificar que el producto existe
      await this.getProductById(id);

      // Validar datos usando Zod (schema parcial)
      const validatedData = productUpdateSchema.parse(data);

      // Actualizar en la base de datos
      const updatedProduct = await this.repository.update(id, validatedData);
      if (!updatedProduct) {
        throw new Error(`No se pudo actualizar el producto con ID ${id}`);
      }

      return updatedProduct;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(
          `Datos de producto inválidos: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw error;
    }
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(id: number): Promise<boolean> {
    // Verificar que el producto existe
    await this.getProductById(id);

    // Eliminar el producto
    return this.repository.delete(id);
  }
}
