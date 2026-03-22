const base = "";

export async function getHealth() {
  const res = await fetch(`${base}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json() as Promise<{ ok: boolean; service: string }>;
}
