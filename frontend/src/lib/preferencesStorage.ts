import {
  defaultPreferences,
  type UserPreferences,
} from "../types/preferences";

const STORAGE_KEY = "food-waste-user-preferences-v1";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseStored(raw: string | null): UserPreferences | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!isRecord(data)) return null;
    const base = defaultPreferences();
    const dietaryRestrictions = data.dietaryRestrictions;
    const healthGoals = data.healthGoals;
    const cuisinePreferences = data.cuisinePreferences;
    const lifestyleTags = data.lifestyleTags;
    return {
      ...base,
      dietaryRestrictions: Array.isArray(dietaryRestrictions)
        ? dietaryRestrictions.filter((x) => typeof x === "string")
        : [],
      healthGoals: Array.isArray(healthGoals)
        ? healthGoals.filter((x) => typeof x === "string")
        : [],
      cuisinePreferences: Array.isArray(cuisinePreferences)
        ? cuisinePreferences.filter((x) => typeof x === "string")
        : [],
      spiceLevel:
        data.spiceLevel === "mild" ||
        data.spiceLevel === "medium" ||
        data.spiceLevel === "hot"
          ? data.spiceLevel
          : null,
      maxCookingTime:
        data.maxCookingTime === "under15" ||
        data.maxCookingTime === "15-30" ||
        data.maxCookingTime === "30-60" ||
        data.maxCookingTime === "60plus"
          ? data.maxCookingTime
          : null,
      householdSize:
        typeof data.householdSize === "number" &&
        data.householdSize >= 1 &&
        data.householdSize <= 20
          ? Math.floor(data.householdSize)
          : 2,
      lifestyleTags: Array.isArray(lifestyleTags)
        ? lifestyleTags.filter((x) => typeof x === "string")
        : [],
      onboardingComplete: data.onboardingComplete === true,
      updatedAt:
        typeof data.updatedAt === "string"
          ? data.updatedAt
          : base.updatedAt,
    };
  } catch {
    return null;
  }
}

export function loadPreferences(): UserPreferences {
  return parseStored(localStorage.getItem(STORAGE_KEY)) ?? defaultPreferences();
}

export function savePreferences(p: UserPreferences): UserPreferences {
  const next: UserPreferences = {
    ...p,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
