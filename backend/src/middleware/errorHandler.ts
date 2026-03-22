import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);
  const message =
    env.nodeEnv === "development" ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}
