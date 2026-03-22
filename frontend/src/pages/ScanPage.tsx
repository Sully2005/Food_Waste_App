import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { usePreferences } from "../hooks/usePreferences";
import { postFridgeDetect, postRecipesRecommend } from "../lib/api";
import { resolveImageBase64 } from "../lib/imageData";

type Phase = "camera" | "preview";

export function ScanPage() {
  const { preferences } = usePreferences();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  /** Blocks double-clicks before React re-renders `analyzing`. */
  const recipeRequestInFlight = useRef(false);
  const [phase, setPhase] = useState<Phase>("camera");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recipeSource, setRecipeSource] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<
    | {
        title: string;
        description: string;
        ingredientsUsed: string[];
        steps: string[];
        notes?: string;
      }[]
    | null
  >(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError(
          "Camera unavailable. Use upload below, or allow camera in your browser settings.",
        );
      }
    }
    start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!preferences.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    stopStream();
    setPreviewUrl(canvas.toDataURL("image/jpeg", 0.85));
    setPhase("preview");
  }

  async function retake() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPhase("camera");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError(
        "Camera unavailable. Use upload below, or allow camera in your browser settings.",
      );
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    stopStream();
    setPreviewUrl(url);
    setPhase("preview");
    setError(null);
  }

  async function findRecipes() {
    if (!previewUrl || recipeRequestInFlight.current) return;
    recipeRequestInFlight.current = true;
    setAnalyzing(true);
    setError(null);
    setRecipes(null);
    setRecipeSource(null);
    try {
      const imageBase64 = await resolveImageBase64(previewUrl);
      const detected = await postFridgeDetect(imageBase64);
      const ingredients = detected.items.map((i) => i.name);
      const result = await postRecipesRecommend({
        ingredients,
        restrictions: {
          diets: preferences.dietaryRestrictions,
          allergies: [],
        },
      });
      setRecipes(result.recipes);
      setRecipeSource(result.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not get recipes.");
    } finally {
      recipeRequestInFlight.current = false;
      setAnalyzing(false);
    }
  }

  function finish() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    navigate("/home");
  }

  return (
    <div className="page page--scan">
      <header className="top-bar">
        <button
          type="button"
          className="btn btn--text"
          onClick={() => navigate("/home")}
        >
          ← Back
        </button>
        <span className="top-bar__title">Scan fridge</span>
        <span className="top-bar__spacer" />
      </header>

      <div className="scan-body">
        {phase === "camera" && (
          <>
            <div className="video-wrap">
              <video ref={videoRef} playsInline muted className="video-feed" />
            </div>
            {error ? <p className="banner warn">{error}</p> : null}
            <div className="scan-actions">
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={capture}
              >
                Capture
              </button>
              <label className="btn btn--ghost btn--lg file-input-label">
                Upload photo
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onFileChange}
                />
              </label>
            </div>
          </>
        )}

        {phase === "preview" && previewUrl && (
          <>
            <div className="video-wrap">
              <img src={previewUrl} alt="Captured fridge" className="preview-img" />
            </div>
            <p className="lede lede--compact">
              Run ingredient detection and recipe ideas using your saved
              preferences (diets map to the API as restriction lists).
            </p>
            {error ? <p className="banner warn">{error}</p> : null}
            {recipes && recipes.length > 0 ? (
              <div className="recipe-preview-list">
                <p className="muted small">
                  Source: {recipeSource ?? "unknown"}
                </p>
                <ul className="recipe-cards">
                  {recipes.map((r) => (
                    <li key={r.title} className="recipe-card">
                      <h3 className="recipe-card__title">{r.title}</h3>
                      <p className="recipe-card__desc">{r.description}</p>
                      <p className="small">
                        <strong>Uses:</strong> {r.ingredientsUsed.join(", ")}
                      </p>
                      <ol className="recipe-card__steps">
                        {r.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                      {r.notes ? (
                        <p className="small muted">{r.notes}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="scan-actions">
              <button type="button" className="btn btn--ghost" onClick={retake}>
                Retake
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={analyzing}
                onClick={() => void findRecipes()}
              >
                {analyzing ? "Working…" : "Find recipes"}
              </button>
              <button type="button" className="btn btn--ghost" onClick={finish}>
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
