import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { productRoutes } from "./presentation/routes.js";
import { utilTest} from './utils/index.js'

const app = new Hono();

app.get("/", (c) => {
  return c.text("Test Hono!");
});
app.route("/api/products", productRoutes);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
    console.log(utilTest()
  },
);
