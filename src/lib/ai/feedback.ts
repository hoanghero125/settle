import { Redis } from "@upstash/redis";
import type { FeedbackRequest } from "@/lib/contracts";

type Metric = "processed" | FeedbackRequest["verdict"];
export type FeedbackCounts = Record<Metric, number>;

const KEYS: Record<Metric, string> = {
  processed: "settle:metrics:processed",
  up: "settle:metrics:up",
  down: "settle:metrics:down",
};

const EMPTY_COUNTS: FeedbackCounts = { processed: 0, up: 0, down: 0 };
let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    redis = null;
    return redis;
  }

  redis = new Redis({
    url,
    token,
    enableTelemetry: false,
    signal: () => AbortSignal.timeout(750),
  });
  return redis;
}

function toCount(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

/**
 * Counter writes are best-effort. Missing Redis configuration or a transient
 * metrics failure must never turn a successful user action into an app error.
 */
export async function incrementMetric(metric: Metric): Promise<void> {
  try {
    await getRedis()?.incr(KEYS[metric]);
  } catch {
    // Deliberately silent: this module never receives document content to log.
  }
}

/** Returns only aggregate, anonymous counters; unavailable storage reads as zero. */
export async function getFeedbackCounts(): Promise<FeedbackCounts> {
  try {
    const values = await getRedis()?.mget<number[]>(KEYS.processed, KEYS.up, KEYS.down);
    if (!values) return { ...EMPTY_COUNTS };
    return {
      processed: toCount(values[0]),
      up: toCount(values[1]),
      down: toCount(values[2]),
    };
  } catch {
    return { ...EMPTY_COUNTS };
  }
}
