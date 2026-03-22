import { Router } from "express";
import { suggestRecipes } from "../../services/recipeSuggestions.js";
import type { RecipeRestrictions } from "../../types/api.js";

export const recipesRouter = Router();

recipesRouter.get("/health", (_req, res) => {
  res.json({ ok: true, module: "recipes" });
});

/**
 * POST body: { ingredients: string[], restrictions?: { allergies?: string[], diets?: string[] } }
 * Chained flow: use ingredient names from POST /api/fridge/detect (after mapping items → names).
 */
recipesRouter.post("/recommend", async (req, res, next) => {
  try {
    const body = req.body as {
      ingredients?: unknown;
      restrictions?: unknown;
    };
    if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
      res.status(400).json({ error: "ingredients (non-empty string[]) is required" });
      return;
    }
    const ingredients = body.ingredients.filter(
      (x): x is string => typeof x === "string" && x.trim().length > 0,
    );
    if (ingredients.length === 0) {
      res.status(400).json({ error: "ingredients must contain at least one non-empty string" });
      return;
    }

    let restrictions: RecipeRestrictions = {};
    if (body.restrictions && typeof body.restrictions === "object") {
      const r = body.restrictions as Record<string, unknown>;
      restrictions = {
        allergies: Array.isArray(r.allergies)
          ? r.allergies.filter((a): a is string => typeof a === "string")
          : undefined,
        diets: Array.isArray(r.diets)
          ? r.diets.filter((d): d is string => typeof d === "string")
          : undefined,
      };
    }

    const result = await suggestRecipes(ingredients, restrictions);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
