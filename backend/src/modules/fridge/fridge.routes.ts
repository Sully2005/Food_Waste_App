import { Router } from "express";

export const fridgeRouter = Router();

fridgeRouter.get("/health", (_req, res) => {
  res.json({ ok: true, module: "fridge" });
});
