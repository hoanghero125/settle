import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SettleLogo } from "@/components/ui/SettleLogo";
import { Stamp } from "@/components/ui/Stamp";
import { confidenceLabel, draftActionLabel, formatFullDate } from "@/features/shared/presentation";
import type { Draft, PaperworkAnalysis, StoredTask, SupportContact } from "@/lib/contracts";

export type ReminderStatus = "scheduled" | "not-needed" | "needs-check" | "not-scheduled" | "not-available" | "cancelled";

type ResultScreenProps = {
  analysis: PaperworkAnalysis;
  task: StoredTask | null;
  reminderStatus: ReminderStatus;
  speaking: boolean;
  speechNotice: string;
  demoReminderNotice: string;
  showDemoReminder: boolean;
  supportContacts: SupportContact[];
  onBack: () => void;
  onUndoFiling: () => void;
  onUndoReminder: () => void;
  onShareDraft: (draft: Draft) => void;
  onSpeak: (text: string, language: string) => void;
  onScheduleDemoReminder: () => void;
  onOpenDraft: (draft: Draft) => void;
  onCopyDraft: (text: string) => void;
  copyNotice: string;
  feedbackVerdict: "up" | "down" | null;
  feedbackNotice: string;
  onFeedback: (verdict: "up" | "down") => void;
};

export function ResultScreen({
  analysis,
  task,
  reminderStatus,
  speaking,
  speechNotice,
  demoReminderNotice,
  showDemoReminder,
  supportContacts,
  onBack,
  onUndoFiling,
  onUndoReminder,
  onShareDraft,
  onSpeak,
  onScheduleDemoReminder,
  onOpenDraft,
  onCopyDraft,
  copyNotice,
  feedbackVerdict,
  feedbackNotice,
  onFeedback,
}: ResultScreenProps) {
  if (!analysis.isPaperwork) {
    return <NotPaperworkScreen message={analysis.notPaperworkReason ?? "Ảnh này không phải giấy tờ."} onBack={onBack} />;
  }

  const deadlineNeedsCheck = analysis.deadline?.confidence === "low";
  const reminder = reminderCopy(reminderStatus, analysis.deadline?.date);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-5">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-full text-carbon active:bg-line"
            aria-label="Quay lại Việc giấy tờ"
          >
            <Icon name="arrow-left" className="size-6" />
          </button>
          <p className="text-base font-medium text-ink-soft">Kết quả</p>
        </div>
        <SettleLogo size="sm" />
      </header>

      <section className="mt-5">
        <Stamp urgency={analysis.urgency} />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{analysis.docType}</h1>
        <p className="mt-2 text-lg leading-relaxed text-ink-soft">{analysis.sender}</p>
        <div className="mt-5 border-l-4 border-carbon pl-4">
          <p className="text-base leading-relaxed">{analysis.summary}</p>
          <button
            type="button"
            onClick={() => onSpeak(analysis.summary, "vi")}
            disabled={speaking}
            className="mt-3 inline-flex min-h-14 items-center gap-2 px-1 text-base font-semibold text-carbon active:text-carbon-deep disabled:opacity-50"
          >
            <Icon name="speaker" className="size-5" />
            {speaking ? "Đang phát" : "Nghe tóm tắt"}
          </button>
        </div>
        {speechNotice && <p className="mt-3 text-base leading-relaxed text-amber" role="status">{speechNotice}</p>}
      </section>

      <section className="mt-8" aria-labelledby="settle-done-heading">
        <h2 id="settle-done-heading" className="text-xl font-semibold">Đã xử lý</h2>
        <div className="mt-3 space-y-3">
          <ActionCard
            icon="document"
            title={task ? "Đã lưu" : "Đã bỏ khỏi danh sách"}
            detail={task ? "Trên thiết bị này." : "Không còn lưu trên thiết bị."}
            action={
              task ? (
                <Button variant="quiet" className="mt-2 w-full" onClick={onUndoFiling}>
                  Hoàn tác
                </Button>
              ) : undefined
            }
          />
          <ActionCard
            icon="calendar"
            title={reminder.title}
            detail={reminder.detail}
            tone={reminder.tone}
            action={
              task ? (
                <div className="mt-3 grid gap-2">
                  {reminderStatus === "scheduled" && task.reminderId !== null && (
                    <Button variant="quiet" className="w-full" onClick={onUndoReminder}>
                      Hoàn tác
                    </Button>
                  )}
                  {showDemoReminder && (
                    <Button variant="quiet" className="w-full" onClick={onScheduleDemoReminder}>
                      Thử nhắc sau 30 giây
                    </Button>
                  )}
                  {demoReminderNotice && <p className="text-center text-base text-ink-soft" role="status">{demoReminderNotice}</p>}
                </div>
              ) : undefined
            }
          />
        </div>
      </section>

      {deadlineNeedsCheck && analysis.deadline && (
        <section className="mt-6 rounded-sheet border border-amber bg-amber-wash p-5" aria-label="Hạn chót cần kiểm tra">
          <p className="text-lg font-semibold text-amber">Hạn chót cần kiểm tra</p>
          <p className="mt-1 text-lg leading-relaxed text-amber">
            Đọc được {formatFullDate(analysis.deadline.date)}, nhưng chưa đủ chắc để đặt nhắc.
          </p>
          <p className="mt-3 text-base leading-relaxed text-amber">“{analysis.deadline.sourceText}”</p>
        </section>
      )}

      {(analysis.keyFacts.length > 0 || analysis.deadline) && (
        <section className="mt-8" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-xl font-semibold">Trên giấy</h2>
          <dl className="mt-3 divide-y divide-line rounded-sheet border border-line bg-sheet px-5">
            {analysis.keyFacts.map((fact) => (
              <div key={`${fact.label}-${fact.sourceText}`} className="py-4">
                <dt className="text-base text-ink-soft">{fact.label}</dt>
                <dd className="mt-1 text-lg font-semibold">{fact.value}</dd>
                <dd className="mt-2 text-base leading-relaxed text-ink-soft">“{fact.sourceText}”</dd>
                {fact.confidence !== "high" && (
                  <dd className="mt-2 text-base font-medium text-amber">{confidenceLabel(fact.confidence)}</dd>
                )}
              </div>
            ))}
            {analysis.deadline && (
              <div className="py-4">
                <dt className="text-base text-ink-soft">{analysis.deadline.label}</dt>
                <dd className="mt-1 text-lg font-semibold">{formatFullDate(analysis.deadline.date)}</dd>
                <dd className="mt-2 text-base leading-relaxed text-ink-soft">“{analysis.deadline.sourceText}”</dd>
                {analysis.deadline.confidence !== "high" && (
                  <dd className="mt-2 text-base font-medium text-amber">{confidenceLabel(analysis.deadline.confidence)}</dd>
                )}
              </div>
            )}
          </dl>
        </section>
      )}

      {analysis.uncertain.length > 0 && (
        <section className="mt-6 rounded-sheet border border-amber bg-amber-wash p-5" aria-labelledby="check-heading">
          <h2 id="check-heading" className="text-lg font-semibold text-amber">Cần kiểm tra</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-lg leading-relaxed text-amber">
            {analysis.uncertain.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {supportContacts.length > 0 && (
        <section className="mt-8" aria-labelledby="support-heading">
          <details className="rounded-sheet border border-line bg-sheet">
            <summary id="support-heading" className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-5 text-lg font-semibold text-carbon">
              Hỗ trợ chính thức
              <span className="text-base font-medium text-ink-soft">{supportContacts.length} số</span>
            </summary>
            <div className="space-y-3 border-t border-line p-4">
            {supportContacts.map((contact) => (
              <article key={`${contact.organization}-${contact.phone}`} className="rounded-sheet border border-line p-4">
                <h3 className="text-base font-semibold leading-snug">{contact.organization}</h3>
                {contact.hours && <p className="mt-2 text-base leading-relaxed text-ink-soft">{contact.hours}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a href={`tel:${contact.phone}`} className="inline-flex min-h-14 items-center text-lg font-semibold text-carbon active:text-carbon-deep">
                    Gọi {contact.phone}
                  </a>
                  <a href={contact.source} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center text-base font-semibold text-carbon active:text-carbon-deep">
                    Xem nguồn chính thức
                  </a>
                </div>
              </article>
            ))}
            </div>
          </details>
        </section>
      )}

      {analysis.drafts.length > 0 && (
        <section className="mt-8" aria-labelledby="drafts-heading">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="drafts-heading" className="text-xl font-semibold">Bản soạn</h2>
            <p className="text-base text-ink-soft">{analysis.drafts.length} mẫu</p>
          </div>
          <div className="mt-3 space-y-3">
            {analysis.drafts.map((draft) => (
              <DraftCard
                key={`${draft.kind}-${draft.recipient}-${draft.original}`}
                draft={draft}
                language={analysis.language}
                speaking={speaking}
                onOpenDraft={onOpenDraft}
                onShareDraft={onShareDraft}
                onCopyDraft={onCopyDraft}
                onSpeak={onSpeak}
              />
            ))}
          </div>
          {copyNotice && <p className="mt-3 text-center text-base text-ink-soft" role="status">{copyNotice}</p>}
        </section>
      )}

      <section className="mt-8 rounded-sheet border border-line bg-sheet p-5" aria-labelledby="feedback-heading">
        <h2 id="feedback-heading" className="text-lg font-semibold">Hữu ích không?</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant={feedbackVerdict === "up" ? "primary" : "quiet"} onClick={() => onFeedback("up")}>
            Hữu ích
          </Button>
          <Button variant={feedbackVerdict === "down" ? "primary" : "quiet"} onClick={() => onFeedback("down")}>
            Chưa đúng
          </Button>
        </div>
        {feedbackNotice && <p className="mt-3 text-center text-base text-ink-soft" role="status">{feedbackNotice}</p>}
      </section>
    </div>
  );
}

function DraftCard({
  draft,
  language,
  speaking,
  onOpenDraft,
  onShareDraft,
  onCopyDraft,
  onSpeak,
}: {
  draft: Draft;
  language: string;
  speaking: boolean;
  onOpenDraft: (draft: Draft) => void;
  onShareDraft: (draft: Draft) => void;
  onCopyDraft: (text: string) => void;
  onSpeak: (text: string, language: string) => void;
}) {
  const displayAtCounter = canShowToClerk(draft);

  return (
    <article className="rounded-sheet border border-line bg-sheet p-5">
      <p className="text-base font-medium text-ink-soft">{draft.recipient}</p>
      <p className="mt-2 line-clamp-3 text-xl font-semibold leading-snug">{draft.original}</p>
      <p className="mt-3 line-clamp-2 text-base leading-relaxed text-ink-soft">{draft.vietnamese}</p>

      <div className="mt-5">
        {displayAtCounter ? (
          <Button className="w-full" onClick={() => onOpenDraft(draft)}>
            <Icon name="document" className="size-5" />
            Giơ cho người nhận
          </Button>
        ) : (
          <Button className="w-full" onClick={() => onShareDraft(draft)}>
            <Icon name="share" className="size-5" />
            {draftActionLabel(draft.kind)}
          </Button>
        )}

        <div className={`mt-2 grid gap-2 ${displayAtCounter ? "grid-cols-3" : "grid-cols-2"}`}>
          <DraftUtilityButton icon="speaker" label={speaking ? "Đang phát" : "Nghe"} onClick={() => onSpeak(draft.original, language)} disabled={speaking} />
          {displayAtCounter && <DraftUtilityButton icon="share" label="Chia sẻ" onClick={() => onShareDraft(draft)} />}
          <DraftUtilityButton icon="copy" label="Sao chép" onClick={() => onCopyDraft(draft.original)} />
        </div>
      </div>
    </article>
  );
}

function DraftUtilityButton({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: "speaker" | "share" | "copy";
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-14 items-center justify-center gap-2 rounded-sheet border border-line px-2 text-base font-semibold text-carbon active:bg-line/60 disabled:opacity-50"
    >
      <Icon name={icon} className="size-5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function canShowToClerk(draft: Draft): boolean {
  return draft.kind === "counter_phrase" || draft.kind === "phone_script";
}

function ActionCard({
  icon,
  title,
  detail,
  action,
  tone = "settled",
}: {
  icon: "document" | "calendar" | "check";
  title: string;
  detail: string;
  action?: ReactNode;
  tone?: "settled" | "amber";
}) {
  const isAmber = tone === "amber";
  return (
    <article className={isAmber ? "rounded-sheet border border-amber bg-amber-wash p-5" : "rounded-sheet border border-line bg-sheet p-5"}>
      <div className="flex items-start gap-3">
        <span className={isAmber ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-amber text-white" : "flex size-9 shrink-0 items-center justify-center rounded-full bg-settled-wash text-settled"}>
          <Icon name={icon} className="size-5" />
        </span>
        <div>
          <h3 className={isAmber ? "text-lg font-semibold text-amber" : "text-lg font-semibold"}>{title}</h3>
          <p className={isAmber ? "mt-1 text-base leading-relaxed text-amber" : "mt-1 text-base leading-relaxed text-ink-soft"}>{detail}</p>
        </div>
      </div>
      {action}
    </article>
  );
}

function reminderCopy(status: ReminderStatus, deadline: string | undefined) {
  if (status === "scheduled") {
    return { title: `Đã đặt nhắc ${deadline ? formatFullDate(deadline) : "hạn chót"}`, detail: "Nhắc trên điện thoại.", tone: "settled" as const };
  }
  if (status === "needs-check") {
    return { title: "Chưa đặt nhắc hạn", detail: "Hạn chót chưa rõ. Kiểm tra lại giấy.", tone: "amber" as const };
  }
  if (status === "not-scheduled") {
    return { title: "Mở bằng app để nhận nhắc hạn", detail: "Trang web không đặt được thông báo.", tone: "amber" as const };
  }
  if (status === "not-available") {
    return { title: "Chưa đặt nhắc hạn", detail: "Chưa có thời điểm nhắc hợp lệ.", tone: "amber" as const };
  }
  if (status === "cancelled") {
    return { title: "Đã hoàn tác nhắc hạn", detail: "Thông báo đã tắt.", tone: "amber" as const };
  }
  return { title: "Chưa cần đặt nhắc", detail: "Giấy này không có hạn chót.", tone: "settled" as const };
}

function NotPaperworkScreen({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-full text-carbon active:bg-line"
            aria-label="Quay lại Việc giấy tờ"
          >
            <Icon name="arrow-left" className="size-6" />
          </button>
          <p className="text-base font-medium text-ink-soft">Kết quả đã sẵn sàng</p>
        </div>
        <SettleLogo size="sm" />
      </header>
      <section className="flex flex-1 flex-col justify-center py-8">
        <div className="rounded-sheet border border-amber bg-amber-wash p-5">
          <h1 className="text-xl font-semibold text-amber">Chưa thấy giấy tờ trong ảnh</h1>
          <p className="mt-2 text-lg leading-relaxed text-amber">{message}</p>
        </div>
        <Button className="mt-6 w-full" onClick={onBack}>
          Về Việc giấy tờ
        </Button>
      </section>
    </div>
  );
}
