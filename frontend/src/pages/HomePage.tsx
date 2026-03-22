import { Navigate, useNavigate } from "react-router-dom";
import { usePreferences } from "../hooks/usePreferences";

export function HomePage() {
  const { preferences } = usePreferences();
  const navigate = useNavigate();

  if (!preferences.onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page page--home">
      <header className="top-bar">
        <span className="logo-wordmark">FridgeChef</span>
        <button
          type="button"
          className="btn btn--text"
          onClick={() => navigate("/preferences")}
        >
          My preferences
        </button>
      </header>

      <div className="page-inner">
        <h1 className="page-title page-title--sm">What’s cooking?</h1>
        <p className="lede lede--compact">
          Snap your fridge and we’ll suggest recipes that match your tastes and
          schedule.
        </p>

        <button
          type="button"
          className="btn btn--primary btn--scan"
          onClick={() => navigate("/scan")}
        >
          <CameraGlyph />
          <span>
            <span className="btn-scan__title">Scan my fridge</span>
            <span className="btn-scan__sub">Use your camera to get started</span>
          </span>
        </button>

        <p className="muted small">
          Last updated:{" "}
          {new Date(preferences.updatedAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
    </div>
  );
}

function CameraGlyph() {
  return (
    <svg
      className="icon-camera"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
