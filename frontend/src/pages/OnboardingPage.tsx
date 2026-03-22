import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChipMultiSelect } from "../components/ChipMultiSelect";
import { StepProgress } from "../components/StepProgress";
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

const STEPS = 5;

function clonePrefs(p: UserPreferences): UserPreferences {
  return {
    ...p,
    dietaryRestrictions: [...p.dietaryRestrictions],
    healthGoals: [...p.healthGoals],
    cuisinePreferences: [...p.cuisinePreferences],
    lifestyleTags: [...p.lifestyleTags],
  };
}

export function OnboardingPage() {
  const { preferences, setPreferences } = usePreferences();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => clonePrefs(preferences));

  const summaryLines = useMemo(() => {
    const cook = COOKING_TIME_OPTIONS.find(
      (o) => o.value === draft.maxCookingTime,
    )?.label;
    const spice = SPICE_OPTIONS.find((o) => o.value === draft.spiceLevel)?.label;
    return [
      draft.dietaryRestrictions.length
        ? `Diet: ${draft.dietaryRestrictions.join(", ")}`
        : "Diet: (none selected)",
      draft.healthGoals.length
        ? `Health: ${draft.healthGoals.join(", ")}`
        : "Health goals: (none)",
      draft.cuisinePreferences.length
        ? `Cuisines: ${draft.cuisinePreferences.join(", ")}`
        : "Cuisines: (none)",
      spice ? `Spice: ${spice}` : "Spice: (not set)",
      cook ? `Time: ${cook}` : "Cooking time: (not set)",
      `Household: ${draft.householdSize} people`,
      draft.lifestyleTags.length
        ? `Lifestyle: ${draft.lifestyleTags.join(", ")}`
        : "Lifestyle: (none)",
    ];
  }, [draft]);

  if (preferences.onboardingComplete) {
    return <Navigate to="/home" replace />;
  }

  const canBack = step > 0;
  const isLast = step === STEPS - 1;

  function patch(partial: Partial<UserPreferences>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  function goNext() {
    if (step < STEPS - 1) setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function finish() {
    setPreferences({
      ...draft,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    });
    navigate("/home", { replace: true });
  }

  return (
    <div className="page page--onboarding">
      <div className="page-inner page-inner--narrow">
        <StepProgress current={step} total={STEPS} />

        {step === 0 && (
          <>
            <h1 className="page-title page-title--sm">Diet & health</h1>
            <p className="lede lede--compact">
              Select anything that applies. You can change this anytime.
            </p>
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
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="page-title page-title--sm">Taste & cuisine</h1>
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
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="page-title page-title--sm">Time you can spend</h1>
            <p className="lede lede--compact">
              We’ll prioritize recipes that fit your schedule.
            </p>
            <fieldset className="field-group">
              <legend className="field-label">Max cooking time</legend>
              <div className="option-list">
                {COOKING_TIME_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="option-row">
                    <input
                      type="radio"
                      name="cook"
                      checked={draft.maxCookingTime === value}
                      onChange={() => patch({ maxCookingTime: value })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="page-title page-title--sm">Household & lifestyle</h1>
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
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="page-title page-title--sm">Review</h1>
            <p className="lede lede--compact">
              Here’s what we’ll use for recipe ideas. You can edit anytime in
              settings.
            </p>
            <ul className="summary-list">
              {summaryLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        )}

        <div className="nav-row">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!canBack}
            onClick={goBack}
          >
            Back
          </button>
          {!isLast ? (
            <button type="button" className="btn btn--primary" onClick={goNext}>
              Next
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={finish}>
              Save & go to home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
