# Thiết kế

BGK đặt nặng sự chỉn chu của UI/UX. File này là nguồn duy nhất cho các quyết định thị giác; token nằm trong `src/app/globals.css`.

## Ý tưởng

Thế giới của sản phẩm là giấy tờ hành chính: giấy mẫu đơn màu lạnh, mực xanh đen, giấy than xanh, và màu đỏ của con dấu. Con dấu là yếu tố nổi bật duy nhất: nó đóng xuống kết quả như một văn phòng đóng dấu "đã xử lý". Mọi thứ còn lại yên tĩnh.

## Màu

| Token | Giá trị | Dùng cho |
|---|---|---|
| `paper` | `#f2f5f9` | Nền app |
| `sheet` | `#ffffff` | Mặt thẻ, như một tờ giấy đặt trên bàn |
| `ink` | `#101b3b` | Chữ chính |
| `ink-soft` | `#4a5578` | Chữ phụ |
| `line` | `#d5dce8` | Đường kẻ, viền thẻ |
| `carbon` / `carbon-deep` | `#2f4bd8` / `#2238a8` | Hành động chính, trạng thái nhấn |
| `stamp` | `#d62839` | Chỉ dùng cho con dấu "Cần làm ngay" |
| `amber` / `amber-wash` | `#9a6200` / `#fff3d6` | AI không chắc, lỗi cần người dùng xử lý |
| `settled` / `settled-wash` | `#17865a` / `#e2f4ec` | Việc Settle đã làm xong |

Đỏ không dùng cho lỗi. Lỗi và sự không chắc chắn dùng hổ phách, để màu đỏ chỉ có một nghĩa.

## Chữ

Một họ chữ: Be Vietnam Pro (400, 500, 600, 700), vẽ cho tiếng Việt nên dấu rõ ở cỡ lớn. Chữ Nhật, Hàn, Trung dùng font CJK của máy.

| Vai trò | Class |
|---|---|
| Tên app, tiêu đề màn hình | `text-3xl font-bold` |
| Tiêu đề thẻ | `text-xl font-semibold` |
| Nội dung | `text-lg leading-relaxed` (không nhỏ hơn 18px cho nội dung chính) |
| Chú thích | `text-base text-ink-soft` |
| Câu "Nói hộ" giơ cho nhân viên quầy | `text-3xl font-semibold`, tối đa 3 dòng |

Viết hoa toàn bộ chỉ dành cho con dấu. Nhãn và tiêu đề viết hoa chữ đầu câu.

## Bố cục

- Một cột, lề ngang 20px, rộng tối đa `max-w-md`. Thao tác một tay: hành động chính luôn ở đáy màn hình, trong tầm ngón cái.
- Vùng chạm tối thiểu 56px (`min-h-14`).
- Thẻ là tờ giấy: nền `sheet`, viền `line`, bo `rounded-sheet`. Không đổ bóng. Không lồng thẻ trong thẻ.
- Chừa `env(safe-area-inset-*)` ở trên và dưới.

## Chuyển động

Chỉ hai chỗ có chuyển động tự chạy:

1. Vệt quét trên ảnh trong lúc xử lý.
2. Con dấu đóng xuống khi có kết quả (`animate-stamp`), kèm một nhịp rung (`hapticTap`).

Còn lại chỉ có phản hồi cho thao tác của người dùng. Tôn trọng `prefers-reduced-motion` (đã xử lý ở `globals.css`).

## Lời văn

- Nói việc đã làm, không giải thích: "Đã đặt nhắc 27/11", "Đã soạn sẵn tin nhắn". Không viết "AI gợi ý rằng…".
- Nút nói đúng việc sẽ xảy ra: "Gửi tin nhắn", "Hoàn tác nhắc hạn". Tên hành động giữ nguyên suốt luồng.
- Lỗi nói chuyện gì xảy ra và làm gì tiếp, không xin lỗi: "Ảnh quá mờ nên chưa đọc được. Hãy chụp lại ở nơi đủ sáng."
- Màn hình trống là lời mời hành động.

## Đủ trạng thái cho mỗi màn hình

Trống, đang chờ, có dữ liệu, AI không chắc, lỗi, mất mạng. Một màn hình chưa xong nếu thiếu một trong số này.

## Cảm giác native trong WebView

- Nút Back của Android lùi một bước trong luồng, ở trang chủ mới thoát (`onBackButton`).
- Không bôi đen được chữ trên nút; không có hiệu ứng kéo giãn khi cuộn quá.
- Phản hồi nhấn tức thì bằng trạng thái `active:`; không dùng `hover:`.
- Chia sẻ qua bảng chia sẻ của hệ thống (`shareText`).

## Rà thiết kế trước giờ đóng băng

- [ ] Mọi chữ nội dung từ 18px, tương phản đạt AA
- [ ] Mọi vùng chạm từ 56px
- [ ] Chỉ một con dấu trên mỗi màn hình; đỏ không xuất hiện ở chỗ khác
- [ ] Đủ sáu trạng thái ở cả ba màn hình
- [ ] Nút Back đúng ở mọi bước
- [ ] Thử trên máy thật với cỡ chữ hệ thống lớn nhất
