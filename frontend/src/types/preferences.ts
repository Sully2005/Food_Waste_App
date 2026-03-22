/** Serializable user profile for local storage and future recipe API. */

export type SpiceLevel = "mild" | "medium" | "hot";

export type MaxCookingTime = "under15" | "15-30" | "30-60" | "60plus";

export interface UserPreferences {
  dietaryRestrictions: string[];
  healthGoals: string[];
  cuisinePreferences: string[];
  spiceLevel: SpiceLevel | null;
  maxCookingTime: MaxCookingTime | null;
  householdSize: number;
  lifestyleTags: string[];
  onboardingComplete: boolean;
  updatedAt: string;
}

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Nut-free",
  "Halal",
  "Kosher",
  "Pescatarian",
  "No pork",
  "No beef",
] as const;

export const HEALTH_GOAL_OPTIONS = [
  "High protein",
  "Lower carb",
  "Heart-healthy",
  "Lower sodium",
  "More vegetables",
  "Weight management",
  "General wellness",
] as const;

export const CUISINE_OPTIONS = [
  "Italian",
  "Mexican",
  "Indian",
  "Chinese",
  "Japanese",
  "Thai",
  "Mediterranean",
  "American comfort",
  "Middle Eastern",
  "Korean",
  "French",
  "West African",
] as const;

export const SPICE_OPTIONS: { value: SpiceLevel; label: string }[] = [
  { value: "mild", label: "Mild" },
  { value: "medium", label: "Medium" },
  { value: "hot", label: "Hot" },
];

export const COOKING_TIME_OPTIONS: {
  value: MaxCookingTime;
  label: string;
}[] = [
  { value: "under15", label: "Under 15 minutes" },
  { value: "15-30", label: "15–30 minutes" },
  { value: "30-60", label: "30–60 minutes" },
  { value: "60plus", label: "Over 1 hour" },
];

export const LIFESTYLE_OPTIONS = [
  "Busy weeknights",
  "Meal prep",
  "Kid-friendly",
  "Budget-conscious",
  "Minimal cleanup",
  "One-pot meals",
] as const;

export function defaultPreferences(): UserPreferences {
  return {
    dietaryRestrictions: [],
    healthGoals: [],
    cuisinePreferences: [],
    spiceLevel: null,
    maxCookingTime: null,
    householdSize: 2,
    lifestyleTags: [],
    onboardingComplete: false,
    updatedAt: new Date(0).toISOString(),
  };
}

export function toApiPayload(p: UserPreferences) {
  return {
    dietaryRestrictions: p.dietaryRestrictions,
    healthGoals: p.healthGoals,
    cuisinePreferences: p.cuisinePreferences,
    spiceLevel: p.spiceLevel,
    maxCookingTime: p.maxCookingTime,
    householdSize: p.householdSize,
    lifestyleTags: p.lifestyleTags,
    updatedAt: p.updatedAt,
  };
}
