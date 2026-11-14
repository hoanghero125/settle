import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SettleLogo } from "@/components/ui/SettleLogo";
import { draftActionLabel } from "@/features/shared/presentation";
import type { Draft } from "@/lib/contracts";

type DraftDisplayScreenProps = {
  draft: Draft;
  language: string;
  speaking: boolean;
  copyNotice: string;
  onBack: () => void;
  onSpeak: (text: string, language: string) => void;
  onCopy: (text: string) => void;
  onShare: (draft: Draft) => void;
};

/** A counter-ready view: large enough to simply show a clerk instead of speaking. */
export function DraftDisplayScreen({
  draft,
  language,
  speaking,
  copyNotice,
  onBack,
  onSpeak,
  onCopy,
  onShare,
}: DraftDisplayScreenProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-14 min-w-14 items-center justify-center rounded-full text-carbon active:bg-line"
          aria-label="Quay lại kết quả"
        >
          <Icon name="arrow-left" className="size-6" />
        </button>
        <p className="text-base font-medium text-ink-soft">Nói hộ</p>
        <SettleLogo size="sm" />
      </header>

      <section className="flex flex-1 flex-col justify-center py-7" aria-live="polite">
        <p className="text-base font-medium text-ink-soft">Giơ màn hình này cho {draft.recipient}</p>
        <p className="mt-5 text-4xl font-semibold leading-tight tracking-tight">{draft.original}</p>
        <div className="mt-8 border-t border-line pt-5">
          <p className="text-base font-medium text-ink-soft">Nghĩa tiếng Việt</p>
          <p className="mt-2 text-xl leading-relaxed">{draft.vietnamese}</p>
        </div>
      </section>

      <footer className="grid shrink-0 gap-2 pb-1">
        <Button onClick={() => onSpeak(draft.original, language)} disabled={speaking}>
          <Icon name="speaker" className="size-5" />
          {speaking ? "Đang phát" : "Phát tiếng"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="quiet" onClick={() => onCopy(draft.original)}>
            <Icon name="copy" className="size-5" />
            Sao chép
          </Button>
          <Button variant="quiet" onClick={() => onShare(draft)}>
            <Icon name="share" className="size-5" />
            {draftActionLabel(draft.kind)}
          </Button>
        </div>
        {copyNotice && <p className="text-center text-base text-ink-soft" role="status">{copyNotice}</p>}
      </footer>
    </div>
  );
}
