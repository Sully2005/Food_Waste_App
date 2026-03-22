/**
 * Returns a data URL or raw base64 payload suitable for POST /api/fridge/detect.
 * Handles canvas captures (data URLs) and file-upload previews (blob URLs).
 */
export async function resolveImageBase64(previewUrl: string): Promise<string> {
  if (previewUrl.startsWith("data:")) {
    return previewUrl;
  }
  if (previewUrl.startsWith("blob:")) {
    const res = await fetch(previewUrl);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Could not read image"));
      };
      reader.onerror = () => reject(new Error("Could not read image"));
      reader.readAsDataURL(blob);
    });
  }
  throw new Error("Unsupported image URL; expected a data URL or blob URL.");
}
