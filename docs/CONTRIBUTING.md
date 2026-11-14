# Cách làm việc

Khung giờ rất ngắn nên quy trình chỉ giữ những gì giúp ba người làm song song mà không giẫm chân nhau.

## Vòng lặp cho mỗi việc

1. Nhận một issue. Issue đã viết sẵn thành bản giao việc: mục tiêu, file, contract, cách kiểm. Dán nguyên issue cho coding agent của bạn.
2. Tạo nhánh từ `main`: `feat/<area>-<slug>` (ví dụ `feat/ui-result-screen`), hoặc `fix/…`, `docs/…`, `chore/…`.
3. Commit theo Conventional Commits: `feat(ui): add result screen`, `fix(ai): handle blurry image`. Không thêm dòng AI co-author.
4. Trước khi mở PR: `npm run lint && npm run typecheck && npm test`.
5. Mở PR, ghi `Closes #<số issue>`. CI xanh thì squash merge. Không cần chờ approve; nếu PR đụng `src/lib/contracts` thì nhắn cả đội trước khi merge.
6. Vercel tự deploy `main`. App trên máy demo nhận bản mới ở lần mở kế tiếp.

PR nhỏ, dưới khoảng 200 dòng, merge thường xuyên. Một PR treo lâu là một lần conflict.

## Ai giữ phần nào

| Phần | Người |
|---|---|
| `src/lib/ai`, `src/app/api/process`, `src/app/api/feedback` | Hoàng Quốc Anh |
| `src/features`, `src/components`, `src/app/page.tsx`, `src/app/globals.css`, `src/lib/store` | Nguyễn Nam Hải |
| `src/lib/native`, `src/app/api/speech`, `android/`, `.github/`, `docs/`, `src/data` | Đỗ Phạm Bảo Hoàng |

Cần sửa ngoài phần của mình thì sửa ít nhất có thể và ghi rõ trong PR.

## Contract là ranh giới

`src/lib/contracts` định nghĩa thứ AI trả về và thứ giao diện hiển thị. Giao diện dựng trên `src/fixtures` (đặt `NEXT_PUBLIC_USE_MOCKS=1` trong `.env.local`), route AI viết theo cùng schema. Đổi contract phải là một PR riêng.

## Mốc

- **Mốc kiểm tra:** luồng chính chạy trong app đã cài, bằng 4G. Tag `v0.1.0`.
- **Đóng băng tính năng:** sau mốc này chỉ sửa lỗi. Thời điểm cụ thể ở `docs/PLAN.md`.
- **Nộp bài:** tag `v1.0.0`.

## Khi nào phải build lại APK

Chỉ khi thêm plugin Capacitor hoặc sửa thư mục `android/`. Chạy workflow **Android APK** trong tab Actions, rồi tải `settle.apk` từ release `apk-latest` về máy. Mọi thay đổi khác đi qua Vercel.

## Trước giờ demo

- Không merge gì trong 15 phút cuối. Nếu bản mới lỗi, rollback trên Vercel (Deployments → Promote bản trước).
- Demo bằng 4G của máy, không dùng wifi hội trường.
