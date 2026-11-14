/**
 * Short, source-oriented cues for the three launch markets. They help OCR
 * interpretation but never replace text visible on the paper or legal advice.
 * The wording is grounded in the official-source evidence links in
 * docs/EVIDENCE.md; no phone number or web link is model output.
 */
export const COUNTRY_NOTES = `
Japan (JP)
- Common papers include 住民税 (resident tax), 国民健康保険 (national health insurance), 年金 (pension), and 給与明細 (payslip).
- Read 納期限 or 支払期限 as a due-date cue and 納付額 as an amount-due cue; preserve the exact surrounding source text.
- Convert 令和 N年 to Gregorian year 2018 + N. Treat other era dates as uncertain unless all parts are legible.
- A 納付書 may name a convenience store, bank, or other payment channel. Report only what the paper itself says.

South Korea (KR)
- Common papers include 국민건강보험 (national health insurance), 주민세 (resident tax), and 급여명세서 (payslip).
- Read 납부기한 as a payment-deadline cue and 납부할 금액 as an amount-due cue.
- Dates commonly use YYYY년 M월 D일 and are Gregorian; copy the original form into sourceText.
- Do not infer a penalty, benefit, or payment method when it is not written on the paper.

Taiwan (TW)
- Common papers include 綜合所得稅 (income tax), 全民健康保險 (national health insurance), and 薪資單 (payslip).
- Read 繳納期限 as a payment-deadline cue and 應納金額 as an amount-due cue.
- Convert 民國 N年 to Gregorian year 1911 + N when month and day are visible; otherwise mark the date uncertain.
- A payment slip may state a collection channel. Quote it rather than assuming a method.

For all other countries
- Identify only what is visibly supported. Leave country null when the country cannot be determined.
- Keep sourceText verbatim, put ambiguity in uncertain, and never produce a phone number, URL, or legal instruction.
`.trim();
