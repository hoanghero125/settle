#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const PAPERS_DIR = path.resolve("src/fixtures/papers");
const EXPECTED_PATH = path.join(PAPERS_DIR, "expected.json");
const BASE_URL = (process.env.SETTLE_EVAL_URL ?? "http://localhost:3000").replace(/\/$/, "");
const MIME_TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

function mimeTypeFor(file) {
  const mimeType = MIME_TYPES[path.extname(file).toLowerCase()];
  if (!mimeType) throw new Error(`${file}: ảnh mẫu phải là JPG, PNG hoặc WebP.`);
  return mimeType;
}

async function imageDataUrl(file) {
  const image = await readFile(file);
  return `data:${mimeTypeFor(file)};base64,${image.toString("base64")}`;
}

function amountMatches(analysis, amount) {
  if (amount === undefined) return true;
  if (amount === null) return analysis.keyFacts.length === 0;
  const expected = String(amount).replaceAll(/\D/g, "");
  return analysis.keyFacts.some((fact) => `${fact.value}${fact.sourceText}`.replaceAll(/\D/g, "").includes(expected));
}

function failedChecks(analysis, expected) {
  const checks = [
    ["isPaperwork", analysis.isPaperwork === expected.isPaperwork],
    ["language", analysis.language === expected.language],
    ["country", analysis.country === expected.country],
    ["urgency", analysis.urgency === expected.urgency],
    ["deadline", (analysis.deadline?.date ?? null) === expected.deadline],
    ["amount", amountMatches(analysis, expected.amount)],
  ];
  return checks.filter(([, passed]) => !passed).map(([name]) => name);
}

async function evaluate(sample, now) {
  if (!sample.id || !sample.file || !sample.timeZone || !sample.expected) {
    throw new Error("expected.json: mỗi mẫu cần id, image, language và urgency.");
  }

  const startedAt = performance.now();
  const response = await fetch(`${BASE_URL}/api/process`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      image: await imageDataUrl(path.join(PAPERS_DIR, sample.file)),
      now,
      timeZone: sample.timeZone,
    }),
    signal: AbortSignal.timeout(55_000),
  });
  const elapsedMs = Math.round(performance.now() - startedAt);
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.analysis) return { id: sample.id, elapsedMs, failed: ["api_response"] };
  return { id: sample.id, elapsedMs, failed: failedChecks(payload.analysis, sample.expected) };
}

async function main() {
  let expectedJson;
  try {
    expectedJson = await readFile(EXPECTED_PATH, "utf8");
  } catch {
    throw new Error("Chưa có src/fixtures/papers/expected.json và bộ ảnh đã được phép dùng để đánh giá.");
  }
  const suite = JSON.parse(expectedJson);
  if (!suite.now || !Array.isArray(suite.papers) || suite.papers.length === 0) {
    throw new Error("src/fixtures/papers/expected.json phải là mảng không rỗng.");
  }

  const results = [];
  for (const sample of suite.papers) results.push(await evaluate(sample, suite.now));

  console.table(
    results.map((result) => ({
      id: result.id,
      ketQua: result.failed.length === 0 ? "Đúng" : `Sai: ${result.failed.join(", ")}`,
      thoiGianMs: result.elapsedMs,
    })),
  );
  const passed = results.filter((result) => result.failed.length === 0).length;
  const averageMs = Math.round(results.reduce((sum, result) => sum + result.elapsedMs, 0) / results.length);
  console.log(`Kết quả: ${passed}/${results.length} giấy đúng; thời gian trung bình ${averageMs}ms.`);
  if (passed !== results.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Không thể chạy bộ đánh giá.");
  process.exitCode = 1;
});
