import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./client";

// Función para realizar migraciones
async function runMigrations() {
  console.log("Running migrations...");
  migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations completed.");
}

// Ejecutar migraciones si este archivo se ejecuta directamente
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

// Exportar para usar en scripts
export { runMigrations };
