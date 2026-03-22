const base = "";

export async function getHealth() {
  const res = await fetch(`${base}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json() as Promise<{ ok: boolean; service: string }>;
}

/** Send a data URL or raw base64 string from a file input / canvas. */
export async function postFridgeDetect(imageBase64: string) {
  const res = await fetch(`${base}/api/fridge/detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err === "object" && err && "error" in err
        ? String((err as { error: unknown }).error)
        : `Detect failed: ${res.status}`,
    );
  }
  return res.json() as Promise<{
    items: { name: string; confidence?: number }[];
    source: string;
  }>;
}

export async function postRecipesRecommend(body: {
  ingredients: string[];
  restrictions?: { allergies?: string[]; diets?: string[] };
}) {
  const res = await fetch(`${base}/api/recipes/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err === "object" && err && "error" in err
        ? String((err as { error: unknown }).error)
        : `Recommend failed: ${res.status}`,
    );
  }
  return res.json() as Promise<{
    recipes: {
      title: string;
      description: string;
      ingredientsUsed: string[];
      steps: string[];
      notes?: string;
    }[];
    source: string;
  }>;
}
