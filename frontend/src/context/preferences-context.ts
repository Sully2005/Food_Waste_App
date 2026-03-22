import { createContext } from "react";
import type { UserPreferences } from "../types/preferences";

export type PreferencesContextValue = {
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  completeOnboarding: () => void;
  resetForDemo: () => void;
};

export const PreferencesContext =
  createContext<PreferencesContextValue | null>(null);
