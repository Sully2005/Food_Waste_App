import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { fridgeRouter } from "./modules/fridge/fridge.routes.js";
import { recipesRouter } from "./modules/recipes/recipes.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "food-waste-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/fridge", fridgeRouter);
app.use("/api/recipes", recipesRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
