import { Navigate, useNavigate } from "react-router-dom";
import { usePreferences } from "../hooks/usePreferences";

export function WelcomePage() {
  const { preferences } = usePreferences();
  const navigate = useNavigate();

  if (preferences.onboardingComplete) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="page page--welcome">
      <div className="page-inner">
        <p className="eyebrow">Fridge → recipes</p>
        <h1 className="page-title">Cook from what you already have</h1>
        <p className="lede">
          Tell us your diet, time, and tastes once. We use it to suggest meals
          that fit your life—starting with a quick photo of your fridge.
        </p>
        <button
          type="button"
          className="btn btn--primary btn--lg"
          onClick={() => navigate("/onboarding")}
        >
          Get started
        </button>
      </div>
    </div>
  );
}
