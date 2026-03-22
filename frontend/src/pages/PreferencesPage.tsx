import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChipMultiSelect } from "../components/ChipMultiSelect";
import { usePreferences } from "../hooks/usePreferences";
import {
  COOKING_TIME_OPTIONS,
  CUISINE_OPTIONS,
  DIETARY_OPTIONS,
  HEALTH_GOAL_OPTIONS,
  LIFESTYLE_OPTIONS,
  SPICE_OPTIONS,
  type UserPreferences,
} from "../types/preferences";

function clone(p: UserPreferences): UserPreferences {
  return {
    ...p,
    dietaryRestrictions: [...p.dietaryRestrictions],
    healthGoals: [...p.healthGoals],
    cuisinePreferences: [...p.cuisinePreferences],
    lifestyleTags: [...p.lifestyleTags],
  };
}

export function PreferencesPage() {
  const { preferences, setPreferences } = usePreferences();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => clone(preferences));
  const [savedFlash, setSavedFlash] = useState(false);

  if (!preferences.onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  function patch(partial: Partial<UserPreferences>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  function save() {
    setPreferences({
      ...draft,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <div className="page page--prefs">
      <header className="top-bar">
        <button
          type="button"
          className="btn btn--text"
          onClick={() => navigate("/home")}
        >
          ← Home
        </button>
        <span className="top-bar__title">My preferences</span>
        <span className="top-bar__spacer" />
      </header>

      <div className="page-inner page-inner--narrow">
        <p className="lede lede--compact">
          We use this profile to tailor recipes. Change anything below and save.
        </p>

        {savedFlash ? (
          <p className="banner ok" role="status">
            Saved.
          </p>
        ) : null}

        <section className="pref-section">
          <h2 className="pref-heading">Diet & health</h2>
          <ChipMultiSelect
            label="Dietary restrictions"
            options={DIETARY_OPTIONS}
            selected={draft.dietaryRestrictions}
            onChange={(dietaryRestrictions) => patch({ dietaryRestrictions })}
          />
          <ChipMultiSelect
            label="Health goals"
            hint="Optional"
            options={HEALTH_GOAL_OPTIONS}
            selected={draft.healthGoals}
            onChange={(healthGoals) => patch({ healthGoals })}
          />
        </section>

        <section className="pref-section">
          <h2 className="pref-heading">Taste & cuisine</h2>
          <ChipMultiSelect
            label="Cuisine preferences"
            options={CUISINE_OPTIONS}
            selected={draft.cuisinePreferences}
            onChange={(cuisinePreferences) => patch({ cuisinePreferences })}
          />
          <fieldset className="field-group">
            <legend className="field-label">Spice level</legend>
            <div className="chip-grid">
              {SPICE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`chip ${draft.spiceLevel === value ? "chip--on" : ""}`}
                  onClick={() =>
                    patch({
                      spiceLevel: draft.spiceLevel === value ? null : value,
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="pref-section">
          <h2 className="pref-heading">Time & household</h2>
          <fieldset className="field-group">
            <legend className="field-label">Max cooking time</legend>
            <div className="option-list">
              {COOKING_TIME_OPTIONS.map(({ value, label }) => (
                <label key={value} className="option-row">
                  <input
                    type="radio"
                    name="cook-pref"
                    checked={draft.maxCookingTime === value}
                    onChange={() => patch({ maxCookingTime: value })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field-group block">
            <span className="field-label">Household size (people)</span>
            <input
              className="input"
              type="number"
              min={1}
              max={20}
              value={draft.householdSize}
              onChange={(e) =>
                patch({
                  householdSize: Math.min(
                    20,
                    Math.max(1, Number(e.target.value) || 1),
                  ),
                })
              }
            />
          </label>
          <ChipMultiSelect
            label="Lifestyle"
            hint="Optional"
            options={LIFESTYLE_OPTIONS}
            selected={draft.lifestyleTags}
            onChange={(lifestyleTags) => patch({ lifestyleTags })}
          />
        </section>

        <div className="nav-row nav-row--single">
          <button type="button" className="btn btn--primary btn--lg" onClick={save}>
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
