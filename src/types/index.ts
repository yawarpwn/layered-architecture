// src/types/product.ts
import { z } from "zod";
import { products } from "../database/schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Definir tipos desde el esquema de la base de datos
export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;

// Esquema Zod para validación de productos
export const productSchema = z.object({
  name: z.string().min(1, "El nombre del producto es requerido"),
  description: z.string().optional(),
  price: z.number().positive("El precio debe ser mayor a cero"),
  stock: z.number().nonnegative("El stock no puede ser negativo").default(0),
});

// Esquema para actualización de productos (todos los campos opcionales)
export const productUpdateSchema = productSchema.partial();

// Tipo para la entrada de creación de productos validada
export type ProductCreateInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

// src/types/order.ts
import { orders, orderItems } from "../database/schema";

// Definir tipos desde el esquema de la base de datos
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;

// Esquema para validar items en un pedido
const orderItemSchema = z.object({
  productId: z.number().positive("ID de producto inválido"),
  quantity: z.number().positive("La cantidad debe ser mayor a cero"),
});

// Esquema para la creación de pedidos
export const orderCreateSchema = z.object({
  customerName: z.string().min(1, "El nombre del cliente es requerido"),
  customerEmail: z.string().email("Email inválido"),
  items: z.array(orderItemSchema).nonempty("Se requiere al menos un producto"),
});

// Esquema para actualización de estado de pedido
export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

// Tipos para las entradas validadas
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
