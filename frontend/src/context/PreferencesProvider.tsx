import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadPreferences, savePreferences } from "../lib/preferencesStorage";
import { defaultPreferences, type UserPreferences } from "../types/preferences";
import {
  PreferencesContext,
  type PreferencesContextValue,
} from "./preferences-context";

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() =>
    loadPreferences(),
  );

  const setPreferences = useCallback((p: UserPreferences) => {
    setPreferencesState(savePreferences(p));
  }, []);

  const updatePreferences = useCallback((partial: Partial<UserPreferences>) => {
    setPreferencesState((prev) => savePreferences({ ...prev, ...partial }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setPreferencesState((prev) =>
      savePreferences({ ...prev, onboardingComplete: true }),
    );
  }, []);

  const resetForDemo = useCallback(() => {
    setPreferencesState(savePreferences(defaultPreferences()));
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      setPreferences,
      updatePreferences,
      completeOnboarding,
      resetForDemo,
    }),
    [
      preferences,
      setPreferences,
      updatePreferences,
      completeOnboarding,
      resetForDemo,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
