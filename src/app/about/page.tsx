import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const steps = [
  { number: "01", icon: "camera" as const, title: "Chụp", text: "Chụp bất kỳ giấy tờ nào, bằng bất kỳ ngôn ngữ nào." },
  { number: "02", icon: "document" as const, title: "Settle xử lý", text: "Đọc nội dung, hạn chót và việc bạn cần làm trong vài giây." },
  { number: "03", icon: "check" as const, title: "Xong việc", text: "Đã xếp hồ sơ, đặt nhắc hạn và soạn sẵn câu trả lời." },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-paper text-ink">
      <section className="relative isolate border-b border-line">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[33rem] bg-[radial-gradient(ellipse_at_top,_var(--color-sheet)_0%,_transparent_70%)]" />
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8" aria-label="Điều hướng chính">
          <Link href="/about" className="flex items-center gap-2 text-xl font-bold tracking-tight"><span className="grid size-8 place-items-center rounded-lg bg-carbon text-base text-white">S</span>Settle</Link>
          <Link href="/app" className="rounded-full px-4 py-3 text-base font-semibold text-carbon active:bg-line/60">Mở ứng dụng</Link>
        </nav>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 md:grid-cols-[1fr_0.85fr] md:pb-24 md:pt-16">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-sheet px-3 py-2 text-sm font-semibold text-ink-soft"><span className="size-2 rounded-full bg-settled" /> Dành cho người Việt ở nước ngoài</p>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-6xl">Chụp giấy tờ. <span className="text-carbon">Settle</span> phần còn lại.</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft sm:text-xl">Thư từ cơ quan, hóa đơn hay biểu mẫu bằng ngôn ngữ xa lạ — Settle biến chúng thành việc đã được xử lý.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/app" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-carbon px-6 text-lg font-semibold text-white active:bg-carbon-deep"><Icon name="camera" className="size-5" /> Chụp giấy tờ</Link>
              <a href="#cach-hoat-dong" className="inline-flex min-h-14 items-center justify-center rounded-full border border-line bg-sheet px-6 text-lg font-semibold active:bg-line/40">Xem cách hoạt động</a>
            </div>
            <p className="mt-5 text-sm text-ink-soft">Không cần biết viết prompt. Không lưu giấy tờ của bạn.</p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-8 -z-10 rounded-full bg-carbon/10 blur-3xl" />
            <div className="rounded-[2rem] border-[7px] border-ink bg-ink p-1.5 shadow-2xl shadow-ink/15">
              <div className="overflow-hidden rounded-[1.55rem] bg-paper px-4 pb-5 pt-5">
                <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-ink" />
                <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><span className="grid size-7 place-items-center rounded-md bg-carbon text-xs text-white">S</span> Settle</div><span className="text-xs font-medium text-ink-soft">Hôm nay</span></div>
                <div className="mt-6 rounded-sheet border border-line bg-sheet p-4">
                  <div className="flex items-start justify-between gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-stamp text-white"><Icon name="document" className="size-5" /></div><span className="rotate-[-5deg] border-2 border-stamp px-2 py-1 text-[10px] font-bold tracking-wider text-stamp">CẦN LÀM NGAY</span></div>
                  <p className="mt-4 text-lg font-semibold">Thư từ cơ quan thuế</p><p className="mt-1 text-sm leading-relaxed text-ink-soft">Cần gửi bản xác nhận thu nhập trước hạn.</p>
                  <div className="mt-4 border-t border-line pt-3"><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Hạn chót</p><p className="mt-1 font-semibold text-stamp">27 tháng 11 · còn 5 ngày</p></div>
                </div>
                <div className="mt-3 rounded-sheet border border-settled/30 bg-settled-wash p-3"><div className="flex gap-2 text-sm font-semibold text-settled"><Icon name="check" className="size-5 shrink-0" /> Đã đặt nhắc 25 tháng 11</div><div className="mt-2 flex gap-2 text-sm font-semibold text-settled"><Icon name="check" className="size-5 shrink-0" /> Đã soạn sẵn thư trả lời</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cach-hoat-dong" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-carbon">Một tấm ảnh, ba việc đã xong</p>
        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end"><h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Giấy tờ không còn là việc phải tự lần mò.</h2><p className="max-w-sm text-lg leading-relaxed text-ink-soft">Settle không chỉ dịch. Settle biến thông tin thành hành động rõ ràng.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">{steps.map((step) => <article key={step.number} className="rounded-sheet border border-line bg-sheet p-6"><div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-xl bg-carbon/10 text-carbon"><Icon name={step.icon} className="size-6" /></span><span className="font-mono text-sm text-ink-soft">{step.number}</span></div><h3 className="mt-8 text-xl font-semibold">{step.title}</h3><p className="mt-2 text-lg leading-relaxed text-ink-soft">{step.text}</p></article>)}</div>
      </section>

      <section className="border-y border-line bg-sheet"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-carbon">Được làm để bạn yên tâm</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Hiểu đúng. Hành động đúng hạn.</h2></div><div className="space-y-6"><div className="border-b border-line pb-6"><h3 className="text-xl font-semibold">Đọc nhiều ngôn ngữ</h3><p className="mt-2 text-lg leading-relaxed text-ink-soft">Kết quả luôn bằng tiếng Việt. Thư trả lời được soạn bằng ngôn ngữ của giấy tờ.</p></div><div className="border-b border-line pb-6"><h3 className="text-xl font-semibold">Nhắc trước khi quá muộn</h3><p className="mt-2 text-lg leading-relaxed text-ink-soft">Hạn chót rõ ràng sẽ được đặt thành lời nhắc trên điện thoại của bạn.</p></div><div><h3 className="text-xl font-semibold">Bạn vẫn là người quyết định</h3><p className="mt-2 text-lg leading-relaxed text-ink-soft">Settle tự xếp và nhắc việc. Mọi tin nhắn gửi đi đều do bạn bấm xác nhận.</p></div></div></div></section>

      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 md:py-28"><p className="mx-auto grid size-14 place-items-center rounded-2xl bg-carbon text-2xl font-bold text-white">S</p><h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">Một tấm ảnh. Một việc bớt lo.</h2><p className="mt-5 text-lg leading-relaxed text-ink-soft">Mở Settle và xử lý giấy tờ tiếp theo của bạn ngay hôm nay.</p><Link href="/app" className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-carbon px-7 text-lg font-semibold text-white active:bg-carbon-deep"><Icon name="arrow-right" className="size-5" /> Bắt đầu với Settle</Link></section>
      <footer className="border-t border-line px-5 py-6 text-center text-sm text-ink-soft">© 2026 Settle · Chụp là xong việc giấy tờ.</footer>
    </main>
  );
}
