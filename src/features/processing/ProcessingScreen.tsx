import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SettleLogo } from "@/components/ui/SettleLogo";

export function ProcessingScreen({ image, onCancel }: { image: string | null; onCancel: () => void }) {
  const [takingLong, setTakingLong] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setTakingLong(true), 15_000);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-medium text-ink-soft">Settle đang làm việc</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Đọc giấy tờ</h1>
        </div>
        <SettleLogo size="sm" />
      </header>

      <section className="flex flex-1 flex-col justify-center py-8" aria-live="polite" aria-busy="true">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sheet border border-line bg-sheet">
          {image ? (
            <Image src={image} alt="Giấy tờ vừa chụp" fill sizes="(max-width: 448px) 100vw, 448px" unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-soft">
              <Icon name="camera" className="size-10" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 h-1/3 animate-scan bg-linear-to-b from-transparent via-carbon/40 to-transparent" />
          <div className="pointer-events-none absolute inset-0 border-y-2 border-carbon/60" />
        </div>

        <div className="mt-6 flex items-start gap-3">
          <span className="mt-2 size-2 shrink-0 rounded-full bg-carbon" />
          <div>
            <h2 className="text-lg font-semibold">{takingLong ? "Vẫn đang xử lý" : "Đang tìm hạn chót"}</h2>
            <p className="mt-1 text-lg leading-relaxed text-ink-soft">
              {takingLong
                ? "Bạn có thể hủy bất cứ lúc nào."
                : "Thường mất vài giây."}
            </p>
          </div>
        </div>
      </section>

      <Button variant="quiet" className="w-full" onClick={onCancel}>
        Hủy
      </Button>
    </div>
  );
}
