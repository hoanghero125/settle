import type { Urgency } from "@/lib/contracts";

const STAMPS: Record<Urgency, { text: string; tone: string }> = {
  act_now: { text: "CẦN LÀM NGAY", tone: "border-stamp text-stamp" },
  has_deadline: { text: "CÓ HẠN", tone: "border-carbon text-carbon" },
  info_only: { text: "CHỈ ĐỂ BIẾT", tone: "border-ink-soft text-ink-soft" },
};

/**
 * The rubber stamp is Settle's one loud element: it lands on the result the
 * way an office stamps a processed form. Use it once per screen.
 */
export function Stamp({ urgency }: { urgency: Urgency }) {
  const { text, tone } = STAMPS[urgency];
  return (
    <span
      className={`inline-block -rotate-3 animate-stamp rounded-md border-[3px] px-3 py-1 text-base font-bold tracking-wide ${tone}`}
    >
      {text}
    </span>
  );
}
