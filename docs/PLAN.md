# Plan v5: Settle — "Snap it. Settled." (Android, Next.js + Capacitor)

## Bối cảnh

Hackathon 5 giờ, thời gian còn lại ít. Đề: trải nghiệm di động mà AI là thiết yếu, không phải chatbot; chỉ dùng OpenAI API. Cách chấm:

| Tiêu chí | Điểm | Mức cao nhất cần |
|---|---|---|
| 1. Demo AI trên điện thoại thật | 40 | Đóng hẳn rồi mở lại **app** trên máy thật, luồng AI chính chạy trực tiếp. Chỉ demo bằng trình duyệt, giả lập, ảnh, video = 0. |
| 2. Vấn đề thật | 35 | Người dùng và khó khăn rõ, **có bằng chứng**, AI giúp trực tiếp. |
| 3. Mở rộng thị trường | 25 | Cách tiếp cận người dùng đầu tiên và ra toàn cầu; có người dùng thật là lợi thế. "Ai cũng cần" = 0. |
| Bổ sung | — | UI/UX chỉn chu. BGK là CEO, thích AI **tự động hóa công việc**, không thích AI hỏi đáp. |

Đã chốt với bạn: tên **Settle**; người dùng là người Việt ở nước ngoài, không giới hạn nước; AI làm thay chứ không chỉ giải thích; chỉ demo Android; Bảo Hoàng là generalist; stack chọn theo tiêu chí chuyên nghiệp và nhanh nhất.

**Stack: Next.js + Capacitor.** Đội viết stack quen nhất; APK build một lần, sau đó mọi thay đổi lên máy demo qua Vercel trong khoảng một phút và rollback được ngay. Dự phòng nếu APK Capacitor không chạy ở giai đoạn khởi động: đóng gói bằng PWABuilder.

Tôi tự chọn (sửa nếu sai): Quốc Anh làm AI/backend, Nam Hải làm giao diện; có một máy Android trong tay trong 30 phút đầu.

## Sản phẩm

**Người dùng:** người Việt sống và làm việc ở nước ngoài, yếu ngôn ngữ sở tại. App tự nhận ngôn ngữ của giấy tờ; kết quả bằng tiếng Việt; bản soạn sẵn bằng ngôn ngữ của giấy tờ.
**Khó khăn:** thư từ chính quyền, thuế, bảo hiểm, bảng lương, hợp đồng bằng ngôn ngữ hành chính của nước sở tại. Hiện phải nhờ người đi trước hoặc phiên dịch, không thì bỏ qua và trễ hạn.
**Kết quả:** việc giấy tờ được xử lý, không chỉ được giải thích.

**Sau một tấm ảnh, AI tự làm ba việc (một lời gọi AI):**
1. **Xếp hồ sơ** — nhận ra loại giấy, nơi gửi, số tiền, hạn chót; đưa vào danh sách "Việc giấy tờ" xếp theo hạn.
2. **Đặt nhắc hạn** — tạo thông báo nhắc trên điện thoại trước hạn; có nút Hoàn tác.
3. **Soạn sẵn phần phải trả lời** — tin nhắn hoặc email bằng ngôn ngữ của giấy tờ kèm nghĩa tiếng Việt, hoặc câu nói tại quầy (chữ to, bấm phát tiếng). Người dùng bấm gửi.

Nguyên tắc: việc hoàn tác được thì AI tự làm; việc gửi ra ngoài thì AI soạn, người bấm.

**Màn hình:**
- **Trang chủ = Việc giấy tờ:** danh sách việc do AI lập, việc gần hạn nhất ở trên; nút lớn **Chụp giấy tờ**. Lưu trên máy nên mở lại app vẫn còn.
- **Đang xử lý:** ảnh vừa chụp với hiệu ứng quét.
- **Kết quả:** con dấu mức độ (CẦN LÀM NGAY / CÓ HẠN / CHỈ ĐỂ BIẾT); một câu "đây là gì", nghe đọc được; rồi ba khối "Settle đã làm": đã xếp hồ sơ, đã đặt nhắc, đã soạn sẵn. Số liệu kèm đoạn chữ gốc và mức tin cậy; mục không chắc hiện màu hổ phách và không tự đặt nhắc.

App không tư vấn pháp lý; số điện thoại hỗ trợ lấy từ file danh bạ đã kiểm chứng theo nước, không do model sinh ra; nước nào chưa có số đã kiểm chứng thì ẩn nút gọi.

**Không làm:** đăng nhập, chat hỏi đáp, nhập giọng nói, iOS.
**Chỉ làm nếu xong sớm:** chụp thẻ cư trú một lần, từ đó tự điền sẵn các tờ khai phải nộp lại.

## Cách lấy điểm tối đa

| Tiêu chí | Việc làm | Phụ trách |
|---|---|---|
| 1 (40) | APK do GitHub Actions build, cài lên máy Android **ngay giai đoạn khởi động**, trước khi có tính năng. Một lời gọi AI, mục tiêu dưới 10 giây. Demo: tắt hẳn app, mở lại, danh sách việc còn nguyên, chụp một giấy mới, đặt nhắc thử sau 30 giây để thông báo nổ ngay trước BGK. Chạy 4G. | Bảo Hoàng |
| 2 (35) | `docs/EVIDENCE.md`: số liệu có link nguồn; 3–5 giấy tờ thật từ người Việt đang ở nước ngoài gửi qua Messenger hôm nay kèm phản hồi; kết quả chạy bộ mẫu ("xử lý đúng N/M giấy"). | Bảo Hoàng + Quốc Anh |
| 3 (25) | Link web cho bạn bè ở nước ngoài dùng thật từ mốc kiểm tra; bộ đếm ẩn danh và 👍/👎. Người dùng đầu tiên: cộng đồng người Việt ở nước mà đội có người quen (ví dụ Nhật, Hàn, Đài), qua nhóm Facebook cộng đồng, công ty xuất khẩu lao động, trường tiếng. Khách trả tiền: nghiệp đoàn và công ty phái cử, đang trả lương phiên dịch cho đúng việc này. Toàn cầu: sản phẩm đã đọc mọi ngôn ngữ, chứng minh ngay trong demo bằng giấy tờ tiếng Nhật, Hàn, Trung và giấy tờ BGK tự đưa; mở rộng sang cộng đồng di cư khác chỉ cần đổi ngôn ngữ giao diện. | Bảo Hoàng |
| UI/UX | Hệ thiết kế có sẵn trong scaffold. Hướng thị giác: nền giấy ấm, xanh chàm, đỏ son của con dấu; chữ Be Vietnam Pro, chữ CJK dùng font hệ thống. Đủ trạng thái chờ, trống, lỗi. Cảm giác native: nút Back, splash, thanh trạng thái, rung phản hồi, chuyển cảnh. Một lượt rà thiết kế riêng trước giờ đóng băng. | Nam Hải |
| Tự động hóa | Mọi màn hình nói bằng động từ đã làm ("Đã đặt nhắc", "Đã soạn thư"), không phải lời giải thích. | Cả đội |

## Kiến trúc

Next.js (App Router) + TypeScript + Tailwind trên Vercel; Capacitor bọc bản đã deploy thành APK. Một bản deploy phục vụ cả app demo lẫn link web cho người dùng thật.

```
src/app/page.tsx                    luồng một trang: việc giấy tờ → đang xử lý → kết quả
src/app/api/process/route.ts        ảnh → PaperworkTask (vision + structured output)
src/app/api/speech/speak/route.ts   chữ → tiếng (tiếng Việt và ngôn ngữ của giấy tờ)
src/app/api/feedback/route.ts       👍/👎 + bộ đếm ẩn danh, không lưu nội dung
src/features/{tasks,processing,result}/   giao diện theo màn hình
src/components/ui/ + src/styles/    hệ thiết kế
src/lib/contracts/                  zod schema dùng chung client và server
src/lib/ai/                         OpenAI client, prompt, ghi chú giấy tờ theo nước, tên model ở một file
src/lib/api-client/                 fetch có kiểu: timeout, retry, công tắc mock chỉ dùng khi dev
src/lib/native/                     Capacitor: thông báo nhắc, share, Back, haptics
src/lib/store/                      danh sách việc lưu trên máy
src/data/support-contacts.json      đường dây hỗ trợ đã kiểm chứng, theo nước
src/fixtures/                       kết quả mẫu; bộ ảnh giấy tờ mẫu nhiều ngôn ngữ kèm đáp án
android/ + capacitor.config.ts      vỏ native trỏ về URL production
docs/                               PLAN, EVIDENCE, PITCH, DEMO_SCRIPT, DESIGN, CONTRIBUTING
.github/                            CI, workflow build APK, mẫu PR và issue, CODEOWNERS
CLAUDE.md, AGENTS.md                luật cho coding agent
```

`PaperworkTask` gồm: ngôn ngữ và nước nhận ra, loại giấy, nơi gửi, mức độ, tóm tắt, số liệu chính (giá trị, chữ gốc, độ tin cậy), hạn chót, nhắc hạn đề xuất, bản soạn sẵn (kiểu, bản ngôn ngữ gốc, nghĩa tiếng Việt), mục không chắc, cờ "không phải giấy tờ".

Làm theo contract trước: scaffold có sẵn schema và fixture, giao diện dựng trên fixture (chỉ khi dev, không bao giờ demo) trong lúc route AI viết theo cùng schema. Plugin Capacitor (app, share, haptics, local-notifications, status-bar, splash-screen) phải có trong APK ngay lần build đầu, vì thêm plugin sau là phải build và cài lại.

## Chia việc

| Người | Vai trò | Phụ trách |
|---|---|---|
| **Đỗ Phạm Bảo Hoàng** | Lead / generalist | Repo, CI, Vercel + key, APK trên máy demo, `src/lib/native` (thông báo, share), route đọc tiếng, bằng chứng và người dùng thật, bộ giấy tờ mẫu, danh bạ hỗ trợ, QA, pitch và demo |
| **Hoàng Quốc Anh** | AI / backend | `/api/process`, prompt + ghi chú giấy tờ theo nước, xử lý lỗi (timeout, JSON hỏng, từ chối, ảnh mờ, không phải giấy tờ), script chạy bộ mẫu, bộ đếm phản hồi |
| **Nguyễn Nam Hải** | Giao diện | Hệ thiết kế, ba màn hình, chuyển động, các trạng thái, danh sách việc lưu trên máy, khối "Settle đã làm" |

**Lịch (tổng khoảng 3 giờ; nếu còn ít hơn, cắt Sprint 2 trước)**

| Thời lượng | Giai đoạn | Điều kiện qua |
|---|---|---|
| 25' | Khởi động: tôi đẩy scaffold; cả đội clone; đặt key; nối Vercel; CI build APK đầu tiên | App rỗng cài trên máy Android, tắt mở lại được, thông báo thử nổ |
| 45' | Sprint 1: chụp → kết quả bằng AI thật; giao diện trên fixture; nhắn bạn bè ở nước ngoài xin giấy tờ thật | PR merge xanh |
| 10' | Mốc kiểm tra: luồng chính trong app đã cài, chạy 4G; tag `v0.1.0`; gửi link cho người dùng thật | Tắt, mở, chụp: đúng 3 lần liên tiếp |
| 35' | Sprint 2: nhắc hạn thật, bản soạn sẵn + phát tiếng + share, phản hồi, trạng thái lỗi, chỉnh prompt trên bộ mẫu | Hết issue P0 |
| — | **Đóng băng tính năng** | Chỉ sửa lỗi |
| 25' | Rà thiết kế, QA trên máy, chốt số liệu vào `EVIDENCE.md`, quay video dự phòng | Chạy demo 5 lần sạch |
| 25' | Tập pitch 2 lần; README; tag `v1.0.0` | |
| 15' | Dự phòng | |

**Issue tôi tạo, mỗi cái là một bản giao việc cho agent (mục tiêu, file, contract, cách kiểm)**

- M1 Cài được + luồng chính — Bảo Hoàng: Vercel + key + kiểm tra model; APK lên máy demo; bộ giấy tờ mẫu nhiều ngôn ngữ. Quốc Anh: `/api/process`; ghi chú giấy tờ theo nước. Nam Hải: trang chủ + chụp/thu nhỏ ảnh; màn xử lý; màn kết quả.
- M2 Tự động hóa + người dùng thật — Bảo Hoàng: thông báo nhắc + share; route đọc tiếng; bằng chứng; danh bạ hỗ trợ. Quốc Anh: xử lý lỗi; script bộ mẫu; bộ đếm. Nam Hải: danh sách việc lưu trên máy; khối "Settle đã làm" + Hoàn tác; trạng thái lỗi; cảm giác native.
- M3 Sẵn sàng demo — Nam Hải: rà thiết kế. Bảo Hoàng: QA; pitch + kịch bản demo theo từng tiêu chí; README + tag.

## Quy trình

GitHub Flow có rào chắn (Gitflow đầy đủ quá nặng cho khung giờ này).

- `main` được bảo vệ: phải qua PR, CI phải xanh (lint, typecheck, test, build), squash merge. Không bắt buộc approve để không ai bị chặn; quy ước là agent review cộng một đồng đội xem lướt khi PR đụng contract.
- Nhánh `feat/<area>-<slug>`, `fix/…`, `docs/…`, `chore/…`. Conventional Commits. Không có dòng AI co-author.
- Nhãn `area:ai` / `area:ui` / `area:platform`, `P0` / `P1` / `stretch`; milestone M1–M3. Không dùng Projects board (token `gh` thiếu quyền).
- Vercel preview cho mỗi PR. Workflow APK chạy khi tag và khi bấm tay.

## Việc tôi làm khi được duyệt

1. Đẩy scaffold chạy được càng sớm càng tốt để đội clone: app Next.js, contract, fixture, route stub, hệ thiết kế nền, Capacitor + plugin + `android/`, `.env.example`.
2. `git init`, commit đầu, `gh repo create hoanghero125/settle --public`, push.
3. Bổ sung `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/*`, `.github/*`; thêm bảng điểm vào `CHALLENGE.md`.
4. Nhãn, milestone, issue; kiểm tra workflow APK ra file; bật bảo vệ nhánh sau cùng.
5. Song song: một agent nền tra số liệu có nguồn vào `docs/EVIDENCE.md`.

**Cần từ bạn, không chặn việc của tôi:**
- Import repo ở vercel.com/new, đặt `OPENAI_API_KEY`, báo tôi URL production (APK cần URL này).
- Username GitHub của hai bạn còn lại.
- Một máy Android.

## Kiểm chứng

- `npm run lint && npm run typecheck && npm test && npm run build` qua trước lần push đầu.
- CI xanh trên `main`; workflow APK ra file cài được; `gh` thấy bảo vệ nhánh và issue.
- Một PR thử xác nhận không push thẳng được vào `main`.
- Tôi không thử được trên điện thoại: cài APK, thử tắt mở lại và thử thông báo là việc của bạn, cũng là điều kiện qua của giai đoạn khởi động.
