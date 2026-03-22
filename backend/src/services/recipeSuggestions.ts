import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import type { RecipeCard, RecipeRestrictions } from "../types/api.js";

const MOCK_RECIPES: RecipeCard[] = [
  {
    title: "Tomato & onion skillet",
    description: "Quick sauté using what the mock detector returned.",
    ingredientsUsed: ["tomato", "onion"],
    steps: [
      "Dice the tomato and onion.",
      "Sauté onion until soft, add tomato, salt, and pepper.",
      "Simmer 5 minutes and serve.",
    ],
    notes: "Replace this mock with Gemini by setting GEMINI_API_KEY in backend/.env",
  },
];

/** Single model — override with GEMINI_MODEL in .env (see Google’s quota docs for your key). */
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/** Cap how many ingredient names we send to limit input tokens. */
const MAX_INGREDIENTS_IN_PROMPT = 30;

function compactRestrictions(r: RecipeRestrictions): string {
  const parts: string[] = [];
  if (r.allergies?.length) parts.push(`allergies:${r.allergies.join("|")}`);
  if (r.diets?.length) parts.push(`diets:${r.diets.join("|")}`);
  return parts.length ? parts.join("; ") : "none";
}

function parseJsonFromGemini(text: string): unknown {
  let t = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  if (fenced) t = fenced[1].trim();
  return JSON.parse(t);
}

export async function suggestRecipes(
  ingredients: string[],
  restrictions: RecipeRestrictions,
): Promise<{ recipes: RecipeCard[]; source: "mock" | "gemini" }> {
  if (!env.geminiApiKey) {
    return { recipes: MOCK_RECIPES, source: "mock" };
  }

  const modelName = env.geminiModel ?? DEFAULT_GEMINI_MODEL;
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const ing = ingredients.slice(0, MAX_INGREDIENTS_IN_PROMPT).join(", ");
  const constraints = compactRestrictions(restrictions);

  const prompt = [
    "Cooking assistant; reduce food waste. JSON only.",
    `Ingredients: ${ing}`,
    `Dietary constraints: ${constraints}`,
    "Pantry staples allowed: oil, salt, pepper, common spices.",
    'Reply shape: {"recipes":[{"title":"","description":"","ingredientsUsed":[],"steps":[],"notes":""}]} — 2–4 recipes; respect constraints.',
  ].join("\n");

  let text: string;
  try {
    const result = await model.generateContent(prompt);
    text = result.response.text();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Gemini (${modelName}) failed: ${msg}`);
  }

  let parsed: unknown;
  try {
    parsed = parseJsonFromGemini(text);
  } catch {
    throw new Error(
      `Gemini (${modelName}) returned non-JSON; try again or shorten the request.`,
    );
  }

  const recipes = (parsed as { recipes?: RecipeCard[] }).recipes;
  if (!Array.isArray(recipes) || recipes.length === 0) {
    throw new Error(`Gemini (${modelName}) JSON missing recipes array`);
  }

  return { recipes, source: "gemini" };
}
