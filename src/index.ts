import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { productRoutes } from "./presentation/routes.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Test Hono!");
});
app.use("/api/products", productRoutes);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
