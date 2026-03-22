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

const RECIPE_JSON_INSTRUCTION = `Return a JSON object with this exact shape (no markdown):
{"recipes":[{"title":"string","description":"string","ingredientsUsed":["string"],"steps":["string"],"notes":"string optional"}]}
Use 2–4 recipes. Ingredients and steps must respect all allergies and diets.`;

export async function suggestRecipes(
  ingredients: string[],
  restrictions: RecipeRestrictions,
): Promise<{ recipes: RecipeCard[]; source: "mock" | "gemini" }> {
  if (!env.geminiApiKey) {
    return { recipes: MOCK_RECIPES, source: "mock" };
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = [
    "You are a cooking assistant helping reduce food waste.",
    "Suggest practical recipes using mainly these ingredients:",
    ingredients.join(", "),
    "Diet / restrictions:",
    JSON.stringify(restrictions),
    RECIPE_JSON_INSTRUCTION,
  ].join("\n");

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned non-JSON; try again or check the model response.");
  }

  const recipes = (parsed as { recipes?: RecipeCard[] }).recipes;
  if (!Array.isArray(recipes) || recipes.length === 0) {
    throw new Error("Gemini JSON missing recipes array");
  }

  return { recipes, source: "gemini" };
}
