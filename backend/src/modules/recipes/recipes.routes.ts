import { Router } from "express";

export const recipesRouter = Router();

recipesRouter.get("/health", (_req, res) => {
  res.json({ ok: true, module: "recipes" });
});
