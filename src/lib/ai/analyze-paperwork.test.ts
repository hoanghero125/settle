import { beforeEach, describe, expect, it, vi } from "vitest";
import { residentTaxJa } from "@/fixtures/analyses";
import { PaperworkAnalysisSchema, type ApiErrorCode, type ProcessRequest } from "@/lib/contracts";
import { getOpenAI } from "./client";
import { analyzePaperwork, PaperworkProcessingError } from "./analyze-paperwork";
import { getModels } from "./models";
import { IMAGE_UNREADABLE_REASON } from "./prompt";

vi.mock("./client", () => ({ getOpenAI: vi.fn() }));
vi.mock("./models", () => ({ getModels: vi.fn() }));

const input: ProcessRequest = {
  image: "data:image/jpeg;base64,AA==",
  now: "2026-11-24T10:00:00+09:00",
  timeZone: "Asia/Tokyo",
};

const mockedGetOpenAI = vi.mocked(getOpenAI);
const mockedGetModels = vi.mocked(getModels);
const parse = vi.fn();
const client = { responses: { parse } };

async function expectError(promise: Promise<unknown>, code: ApiErrorCode): Promise<void> {
  await expect(promise).rejects.toEqual(expect.objectContaining<Partial<PaperworkProcessingError>>({ code }));
}

describe("analyzePaperwork", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedGetOpenAI.mockReturnValue(client as never);
    mockedGetModels.mockReturnValue({ vision: "vision-model", speech: "speech-model" });
  });

  it("reports missing server configuration before calling OpenAI", async () => {
    mockedGetOpenAI.mockReturnValue(null);

    await expectError(analyzePaperwork(input), "not_configured");
    expect(parse).not.toHaveBeenCalled();
  });

  it("sends one non-persisted structured vision request", async () => {
    parse.mockResolvedValue({ output: [], output_parsed: residentTaxJa });

    await expect(analyzePaperwork(input)).resolves.toEqual(residentTaxJa);
    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse.mock.calls[0]?.[0]).toMatchObject({
      model: "vision-model",
      store: false,
      reasoning: { effort: "low" },
      input: [{ content: [{ type: "input_text" }, { type: "input_image", image_url: input.image }] }],
    });
    expect(parse.mock.calls[0]?.[1]).toMatchObject({ signal: expect.any(AbortSignal) });
  });

  it("removes an unsafe reminder from a low-confidence deadline", async () => {
    parse.mockResolvedValue({
      output: [],
      output_parsed: {
        ...residentTaxJa,
        deadline: { ...residentTaxJa.deadline, confidence: "low" },
      },
    });

    await expect(analyzePaperwork(input)).resolves.toMatchObject({ reminder: null });
  });

  it("normalizes Traditional Chinese papers from Taiwan to zh-TW", async () => {
    parse.mockResolvedValue({
      output: [],
      output_parsed: { ...residentTaxJa, language: "zh-Hant", country: "TW" },
    });

    await expect(analyzePaperwork(input)).resolves.toMatchObject({ language: "zh-TW" });
  });

  it("clears deadline data from a photograph that is not paperwork", async () => {
    parse.mockResolvedValue({
      output: [],
      output_parsed: {
        ...residentTaxJa,
        isPaperwork: false,
        notPaperworkReason: "Ảnh này không phải giấy tờ chính thức.",
      },
    });

    await expect(analyzePaperwork(input)).resolves.toMatchObject({
      urgency: "info_only",
      deadline: null,
      reminder: null,
    });
  });

  it("asks for another photo when the model marks the image unreadable", async () => {
    parse.mockResolvedValue({
      output: [],
      output_parsed: { ...residentTaxJa, isPaperwork: false, notPaperworkReason: IMAGE_UNREADABLE_REASON },
    });

    await expectError(analyzePaperwork(input), "image_unreadable");
  });

  it("maps an explicit model refusal to a typed error", async () => {
    parse.mockResolvedValue({
      output: [{ type: "message", content: [{ type: "refusal" }] }],
      output_parsed: null,
    });

    await expectError(analyzePaperwork(input), "model_refused");
  });

  it("retries exactly once when structured output is invalid", async () => {
    parse
      .mockResolvedValueOnce({ output: [], output_parsed: null })
      .mockResolvedValueOnce({ output: [], output_parsed: residentTaxJa });

    await expect(analyzePaperwork(input)).resolves.toEqual(residentTaxJa);
    expect(parse).toHaveBeenCalledTimes(2);
  });

  it("retries once when the SDK throws a ZodError while parsing structured output", async () => {
    const invalid = PaperworkAnalysisSchema.safeParse(null);
    if (invalid.success) throw new Error("Expected invalid structured output");

    parse.mockRejectedValueOnce(invalid.error).mockResolvedValueOnce({ output: [], output_parsed: residentTaxJa });

    await expect(analyzePaperwork(input)).resolves.toEqual(residentTaxJa);
    expect(parse).toHaveBeenCalledTimes(2);
  });

  it("reports invalid model output after a second ZodError", async () => {
    const invalid = PaperworkAnalysisSchema.safeParse(null);
    if (invalid.success) throw new Error("Expected invalid structured output");

    parse.mockRejectedValue(invalid.error);

    await expectError(analyzePaperwork(input), "invalid_model_output");
    expect(parse).toHaveBeenCalledTimes(2);
  });
});
