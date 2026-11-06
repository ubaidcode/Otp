import express from "express";
import { routes } from "./routes/index.js";
import { errors, rateLimit } from "./middleware/errors.js";
export function createApp(dependencies) {
  const app = express();
  app.disable("x-powered-by");
  app.use(rateLimit({ max: 300 }));
  app.use(express.json({ limit: "32kb" }));
  app.get("/health", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));
  app.use("/api", routes(dependencies));
  app.use((req, res) => res.status(404).json({ error: "Route not found" }));
  app.use(errors);
  return app;
}
