import { afterEach, describe, expect, it, vi } from "vitest";
import { getFeedbackCounts, incrementMetric } from "./feedback";

afterEach(() => {
  vi.doUnmock("@upstash/redis");
  vi.resetModules();
});

describe("feedback metrics without Redis", () => {
  it("does not fail the user flow when storage is absent", async () => {
    await expect(incrementMetric("processed")).resolves.toBeUndefined();
    await expect(incrementMetric("up")).resolves.toBeUndefined();
  });

  it("returns only anonymous aggregate defaults when storage is absent", async () => {
    await expect(getFeedbackCounts()).resolves.toEqual({ processed: 0, up: 0, down: 0 });
  });

  it("accepts Vercel KV variable aliases and disables Redis retries", async () => {
    const original = {
      upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
      upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
      kvUrl: process.env.KV_REST_API_URL,
      kvToken: process.env.KV_REST_API_TOKEN,
    };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.KV_REST_API_URL = "https://example.upstash.io";
    process.env.KV_REST_API_TOKEN = "test-token";

    const incr = vi.fn().mockResolvedValue(1);
    const Redis = vi.fn(function Redis() {
      return { incr };
    });
    vi.doMock("@upstash/redis", () => ({ Redis }));

    const metrics = await import("./feedback");
    await metrics.incrementMetric("processed");

    expect(Redis).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://example.upstash.io",
        token: "test-token",
        retry: false,
        enableTelemetry: false,
      }),
    );
    expect(incr).toHaveBeenCalledWith("settle:metrics:processed");

    if (original.upstashUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = original.upstashUrl;
    if (original.upstashToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = original.upstashToken;
    if (original.kvUrl === undefined) delete process.env.KV_REST_API_URL;
    else process.env.KV_REST_API_URL = original.kvUrl;
    if (original.kvToken === undefined) delete process.env.KV_REST_API_TOKEN;
    else process.env.KV_REST_API_TOKEN = original.kvToken;
  });
});
