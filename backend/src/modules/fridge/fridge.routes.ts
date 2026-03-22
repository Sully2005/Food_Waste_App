import { Router } from "express";
import { detectFoodFromImage } from "../../services/foodRecognition.js";

export const fridgeRouter = Router();

fridgeRouter.get("/health", (_req, res) => {
  res.json({ ok: true, module: "fridge" });
});

/** POST body: { imageBase64: string } — raw base64 or data:image/...;base64,... */
fridgeRouter.post("/detect", async (req, res, next) => {
  try {
    const imageBase64 = (req.body as { imageBase64?: unknown }).imageBase64;
    if (typeof imageBase64 !== "string" || !imageBase64.trim()) {
      res.status(400).json({ error: "imageBase64 (string) is required" });
      return;
    }
    const result = await detectFoodFromImage(imageBase64);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
