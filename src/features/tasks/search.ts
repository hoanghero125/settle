import type { StoredTask } from "@/lib/contracts";

/** Makes Vietnamese queries work whether the user types accents or not. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi-VN")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function dateTerms(date: string | null): string[] {
  if (!date) return [];
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return [date];
  const monthNumber = String(Number(month));
  const dayNumber = String(Number(day));
  return [date, `${day}/${month}/${year}`, `${day}/${month}`, `${dayNumber}/${monthNumber}`, `ngay ${dayNumber} thang ${monthNumber} nam ${year}`];
}

function priorityTerms(task: StoredTask): string[] {
  if (task.done) return ["da xong", "hoan thanh"];
  return {
    act_now: ["can lam ngay", "khan", "uu tien cao"],
    has_deadline: ["co han", "uu tien trung binh"],
    info_only: ["chi de biet", "uu tien thap"],
  }[task.analysis.urgency];
}

/** Search titles, extracted content, dates and human-friendly priority names. */
export function taskMatchesQuery(task: StoredTask, query: string): boolean {
  const terms = normalizeSearchText(query).split(" ").filter(Boolean);
  if (terms.length === 0) return true;

  const { analysis } = task;
  const indexed = [
    analysis.docType,
    analysis.sender,
    analysis.summary,
    analysis.deadline?.label ?? "",
    analysis.deadline?.sourceText ?? "",
    ...dateTerms(analysis.deadline?.date ?? null),
    ...priorityTerms(task),
    ...analysis.keyFacts.flatMap((fact) => [fact.label, fact.value, fact.sourceText]),
    ...analysis.drafts.flatMap((draft) => [draft.recipient, draft.original, draft.vietnamese]),
  ];
  const haystack = normalizeSearchText(indexed.join(" "));
  return terms.every((term) => haystack.includes(term));
}
