import OpenAI from "openai";

let client: OpenAI | null = null;

/**
 * Server only. Never import this from a client component: the key must not
 * reach the phone. Returns null when OPENAI_API_KEY is missing so the route
 * can answer with errorResponse("not_configured").
 */
export function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  client ??= new OpenAI({ timeout: 40_000, maxRetries: 1 });
  return client;
}
