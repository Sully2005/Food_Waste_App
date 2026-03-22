import type { DetectedFood } from "../types/api.js";
import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env.js";

const BASE_URL = "https://api.logmeal.com/v2";
const SEGMENTATION_URL = `${BASE_URL}/image/segmentation/complete`;
const INGREDIENTS_URL = `${BASE_URL}/nutrition/recipe/ingredients`;

/**
 * Strips a leading data-URL prefix so you can pass either raw base64 or a full data URL from the browser.
 */
export function normalizeBase64Image(input: string): string {
  return input.replace(/^data:image\/\w+;base64,/, "").trim();
}

async function segmentImageAndGetImageId(imageBase64: string): Promise<number> {
  const b64 = normalizeBase64Image(imageBase64);
  const buffer = Buffer.from(b64, "base64");
  const form = new FormData();
  form.append("image", buffer, { filename: "meal.jpg", contentType: "image/jpeg" });

  const token = env.logmealAPIUserToken;
  if (!token) {
    throw new Error("LOGMEAL_API_USER_TOKEN is not set");
  }

  const response = await axios.post(SEGMENTATION_URL, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`,
    },
    timeout: 30000,
  });

  const imageId = response.data?.imageId;
  if (typeof imageId !== "number") {
    throw new Error("LogMeal segmentation response missing imageId");
  }
  return imageId;
}

async function fetchIngredientNames(imageId: number): Promise<string[]> {
  const token = env.logmealAPIUserToken;
  if (!token) {
    throw new Error("LOGMEAL_API_USER_TOKEN is not set");
  }

  const resp = await axios.post(
    INGREDIENTS_URL,
    { imageId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    },
  );

  const foodName = resp.data?.foodName;
  if (!Array.isArray(foodName)) {
    throw new Error("LogMeal ingredients response missing foodName array");
  }

  return foodName.filter((x): x is string => typeof x === "string");
}

/**
 * Image → list of foods via LogMeal (segmentation → imageId → ingredients).
 * Without LOGMEAL_API_USER_TOKEN, returns mock items for local development.
 */
export async function detectFoodFromImage(imageBase64: string): Promise<{
  items: DetectedFood[];
  source: "mock" | "api";
}> {
  const b64 = normalizeBase64Image(imageBase64);
  if (!b64) {
    throw new Error("Empty image payload");
  }

  if (!env.logmealAPIUserToken) {
    return {
      items: [
        { name: "tomato", confidence: 0.9 },
        { name: "onion", confidence: 0.85 },
      ],
      source: "mock",
    };
  }

  const imageId = await segmentImageAndGetImageId(imageBase64);
  const names = await fetchIngredientNames(imageId);
  const items: DetectedFood[] = names.map((name) => ({ name }));

  return { items, source: "api" };
}
