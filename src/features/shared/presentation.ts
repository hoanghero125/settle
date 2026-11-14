import type { Confidence, DraftKind, Urgency } from "@/lib/contracts";

const fullDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
});

/** Date-only values are deliberately read at noon to avoid a UTC day shift. */
function localDate(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

export function formatFullDate(date: string): string {
  const parsed = localDate(date);
  return Number.isNaN(parsed.getTime()) ? date : fullDateFormatter.format(parsed);
}

export function formatShortDate(date: string): string {
  const parsed = localDate(date);
  return Number.isNaN(parsed.getTime()) ? date : shortDateFormatter.format(parsed);
}

export function deadlineStatus(date: string): string {
  const today = new Date();
  const midnightToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const deadline = localDate(date).getTime();
  const days = Math.round((deadline - midnightToday) / 86_400_000);

  if (days < 0) return `Quá hạn ${Math.abs(days)} ngày`;
  if (days === 0) return "Hạn hôm nay";
  if (days === 1) return "Còn 1 ngày";
  return `Còn ${days} ngày`;
}

export function urgencyLabel(urgency: Urgency): string {
  return {
    act_now: "Cần làm ngay",
    has_deadline: "Có hạn",
    info_only: "Chỉ để biết",
  }[urgency];
}

export function urgencyTone(urgency: Urgency): string {
  return {
    act_now: "bg-stamp text-white",
    has_deadline: "bg-carbon text-white",
    info_only: "bg-line text-ink",
  }[urgency];
}

export function confidenceLabel(confidence: Confidence): string {
  return { high: "Đã đọc rõ", medium: "Nên kiểm tra", low: "Cần kiểm tra" }[confidence];
}

export function draftActionLabel(kind: DraftKind): string {
  return {
    message: "Gửi tin nhắn",
    email: "Gửi email",
    counter_phrase: "Chia sẻ câu nói",
    phone_script: "Chia sẻ kịch bản gọi",
  }[kind];
}
