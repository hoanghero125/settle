/**
 * The only place model names live. They come from the environment because the
 * organiser's credit decides which models the key can call: run
 * `npm run check:models` and put the names in .env.local and in Vercel.
 */
export function getVisionModel(): string | null {
  return process.env.OPENAI_VISION_MODEL?.trim() || null;
}

export function getSpeechModel(): string | null {
  return process.env.OPENAI_TTS_MODEL?.trim() || null;
}

export function getModels(): { vision: string; speech: string } | null {
  const vision = getVisionModel();
  const speech = getSpeechModel();
  if (!vision || !speech) return null;
  return { vision, speech };
}
