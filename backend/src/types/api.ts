export type DetectedFood = {
  name: string;
  /** 0–1 when the vision API provides it */
  confidence?: number;
};

export type RecipeRestrictions = {
  allergies?: string[];
  diets?: string[];
};

export type RecipeCard = {
  title: string;
  description: string;
  ingredientsUsed: string[];
  steps: string[];
  /** e.g. cross-contamination or substitution ideas */
  notes?: string;
};
