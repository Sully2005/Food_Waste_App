import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const env = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV ?? "development",
  /** Google AI Studio / Vertex key for recipe generation */
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || undefined,
  /**
   * Gemini model id (one only). Defaults to gemini-2.0-flash-lite in code if unset.
   * Set to whichever model has quota for your API key.
   */
  geminiModel: process.env.GEMINI_MODEL?.trim() || undefined,
  /** LogMeal APIUser token — https://docs.logmeal.com/ */
  logmealAPIUserToken: process.env.LOGMEAL_API_USER_TOKEN?.trim() || undefined,
};
