#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function usage() {
  console.log(`Usage:
  SETTLE_EVAL_URL=https://your-deployment node scripts/evaluate.mjs --manifest C:\\safe-path\\evaluation.json

Manifest shape:
[
  {
    "id": "jp-resident-tax-01",
    "imagePath": "./jp-resident-tax-01.jpg",
    "expected": {
      "isPaperwork": true,
      "language": "ja",
      "country": "JP",
      "docTypeIncludes": "thuế",
      "deadline": "2026-11-30",
      "minKeyFacts": 2
    }
  }
]`);
}

function getManifestPath() {
  const index = process.argv.indexOf("--manifest");
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function mimeTypeFor(imagePath) {
  const mimeType = MIME_TYPES[path.extname(imagePath).toLowerCase()];
  if (!mimeType) throw new Error("Ảnh bộ mẫu phải là JPG, PNG hoặc WebP.");
  return mimeType;
}

async function imageDataUrl(imagePath) {
  const image = await readFile(imagePath);
  return `data:${mimeTypeFor(imagePath)};base64,${image.toString("base64")}`;
}

function checkAnalysis(analysis, expected) {
  const checks = [
    ["isPaperwork", expected.isPaperwork === undefined || analysis.isPaperwork === expected.isPaperwork],
    ["language", expected.language === undefined || analysis.language === expected.language],
    ["country", expected.country === undefined || analysis.country === expected.country],
    [
      "docTypeIncludes",
      expected.docTypeIncludes === undefined || analysis.docType.toLowerCase().includes(expected.docTypeIncludes.toLowerCase()),
    ],
    ["deadline", expected.deadline === undefined || analysis.deadline?.date === expected.deadline],
    ["minKeyFacts", expected.minKeyFacts === undefined || analysis.keyFacts.length >= expected.minKeyFacts],
  ];

  return checks.filter(([, passed]) => !passed).map(([name]) => name);
}

async function processCase(baseUrl, manifestDirectory, sample) {
  if (!sample || typeof sample.id !== "string" || typeof sample.imagePath !== "string" || !sample.expected) {
    throw new Error("Mỗi mẫu phải có id, imagePath và expected.");
  }

  const imagePath = path.resolve(manifestDirectory, sample.imagePath);
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 55_000);
  try {
    const response = await fetch(`${baseUrl}/api/process`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        image: await imageDataUrl(imagePath),
        now: new Date().toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      signal: abort.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.analysis) {
      return { id: sample.id, failedChecks: ["api_response"] };
    }
    return { id: sample.id, failedChecks: checkAnalysis(payload.analysis, sample.expected) };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    usage();
    return;
  }

  const manifestPath = getManifestPath();
  const baseUrl = process.env.SETTLE_EVAL_URL?.replace(/\/$/, "");
  if (!manifestPath || !baseUrl) {
    usage();
    process.exitCode = 1;
    return;
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error("Manifest phải là một mảng mẫu không rỗng.");
  }

  const manifestDirectory = path.dirname(path.resolve(manifestPath));
  const results = [];
  for (const sample of manifest) results.push(await processCase(baseUrl, manifestDirectory, sample));

  for (const result of results) {
    const status = result.failedChecks.length === 0 ? "Đúng" : `Chưa đúng: ${result.failedChecks.join(", ")}`;
    console.log(`${result.id}: ${status}`);
  }

  const passed = results.filter((result) => result.failedChecks.length === 0).length;
  console.log(`Kết quả: ${passed}/${results.length} giấy đạt các tiêu chí đã khai báo.`);
  if (passed !== results.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Không thể chạy bộ đánh giá.");
  process.exitCode = 1;
});
