import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV ?? "development",
  /** Google AI Studio / Vertex key for recipe generation */
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || undefined,
  /** LogMeal APIUser token — https://docs.logmeal.com/ */
  logmealAPIUserToken: process.env.LOGMEAL_API_USER_TOKEN?.trim() || undefined,
};
