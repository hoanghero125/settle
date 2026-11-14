/**
 * The only place model names live. They come from the environment because the
 * organiser's credit decides which models the key can call: run
 * `npm run check:models` and put the names in .env.local and in Vercel.
 */
export function getModels(): { vision: string; speech: string } | null {
  const vision = process.env.OPENAI_VISION_MODEL?.trim();
  const speech = process.env.OPENAI_TTS_MODEL?.trim();
  if (!vision || !speech) return null;
  return { vision, speech };
}
