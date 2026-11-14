import type { PaperworkAnalysis } from "@/lib/contracts";

/**
 * Hand-written sample results for building the UI before the AI route exists.
 * Dev only (NEXT_PUBLIC_USE_MOCKS=1). Never demo with these: the brief requires real AI.
 */

export const residentTaxJa: PaperworkAnalysis = {
  isPaperwork: true,
  notPaperworkReason: null,
  language: "ja",
  languageName: "Tiếng Nhật",
  country: "JP",
  docType: "Giấy báo nộp thuế cư trú",
  sender: "Thành phố Yokohama (横浜市)",
  urgency: "act_now",
  summary:
    "Thành phố yêu cầu bạn nộp thuế cư trú kỳ 3. Mang giấy này ra cửa hàng tiện lợi hoặc ngân hàng để nộp trước hạn.",
  keyFacts: [
    { label: "Số tiền phải nộp", value: "34.500 yên", sourceText: "納付額 34,500円", confidence: "high" },
    { label: "Kỳ nộp", value: "Kỳ 3 năm 2026", sourceText: "令和8年度 第3期", confidence: "high" },
    { label: "Mã người nộp", value: "0123-4567-89", sourceText: "通知書番号 0123-4567-89", confidence: "medium" },
  ],
  deadline: { date: "2026-11-30", label: "Hạn nộp", sourceText: "納期限 令和8年11月30日", confidence: "high" },
  reminder: {
    remindAt: "2026-11-27T09:00:00+09:00",
    title: "Còn 3 ngày: nộp thuế cư trú",
    body: "34.500 yên, hạn 30/11. Mang giấy báo ra cửa hàng tiện lợi.",
  },
  drafts: [
    {
      kind: "counter_phrase",
      recipient: "Nhân viên cửa hàng tiện lợi",
      original: "この納付書で支払いをお願いします。",
      vietnamese: "Cho tôi thanh toán bằng giấy nộp tiền này.",
    },
    {
      kind: "phone_script",
      recipient: "Phòng thuế của thành phố",
      original: "住民税の支払いが難しいので、分割払いの相談をしたいです。",
      vietnamese: "Tôi khó nộp thuế cư trú một lần, tôi muốn hỏi về việc trả góp.",
    },
  ],
  uncertain: ["Mã người nộp bị mờ ở hai số cuối."],
};

export const healthInsuranceKo: PaperworkAnalysis = {
  isPaperwork: true,
  notPaperworkReason: null,
  language: "ko",
  languageName: "Tiếng Hàn",
  country: "KR",
  docType: "Giấy báo đóng bảo hiểm y tế",
  sender: "Cơ quan Bảo hiểm Y tế Quốc gia (국민건강보험공단)",
  urgency: "has_deadline",
  summary: "Đây là giấy báo phí bảo hiểm y tế tháng 11. Bạn cần đóng trước hạn để không bị tính phí chậm nộp.",
  keyFacts: [
    { label: "Số tiền phải đóng", value: "128.450 won", sourceText: "납부할 금액 128,450원", confidence: "high" },
    { label: "Tháng tính phí", value: "Tháng 11/2026", sourceText: "2026년 11월분", confidence: "high" },
  ],
  deadline: { date: "2026-12-10", label: "Hạn đóng", sourceText: "납부기한 2026.12.10", confidence: "high" },
  reminder: {
    remindAt: "2026-12-07T09:00:00+09:00",
    title: "Còn 3 ngày: đóng bảo hiểm y tế",
    body: "128.450 won, hạn 10/12.",
  },
  drafts: [
    {
      kind: "message",
      recipient: "Phòng nhân sự công ty",
      original: "건강보험료 고지서를 받았습니다. 회사에서 납부하는지 확인 부탁드립니다.",
      vietnamese: "Tôi đã nhận giấy báo phí bảo hiểm y tế. Nhờ công ty xác nhận giúp công ty có đóng khoản này không.",
    },
  ],
  uncertain: [],
};

export const notPaperwork: PaperworkAnalysis = {
  isPaperwork: false,
  notPaperworkReason: "Ảnh này không phải giấy tờ. Hãy chụp trọn một tờ thư, hóa đơn hoặc thông báo.",
  language: "und",
  languageName: "Không xác định",
  country: null,
  docType: "Không phải giấy tờ",
  sender: "",
  urgency: "info_only",
  summary: "",
  keyFacts: [],
  deadline: null,
  reminder: null,
  drafts: [],
  uncertain: [],
};

export const sampleAnalyses = { residentTaxJa, healthInsuranceKo, notPaperwork };
