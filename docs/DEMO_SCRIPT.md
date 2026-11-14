# Kịch bản demo

BGK chấm theo bằng chứng thực tế, không theo slide. Mỗi bước dưới đây ghi rõ nó lấy điểm ở tiêu chí nào.

## Chuẩn bị (trước khi lên)

- [ ] Máy Android đã cài `settle.apk`, pin trên 50%, bật 4G, tắt wifi, âm lượng tối đa, tắt chế độ im lặng
- [ ] Đã cấp quyền thông báo cho Settle
- [ ] Trong app đã có sẵn 2 việc từ các lần chụp trước (để thấy danh sách còn nguyên sau khi mở lại)
- [ ] Ba tờ giấy in sẵn: tiếng Nhật, tiếng Hàn, tiếng Trung. Dùng giấy mẫu hoặc giấy thật đã che thông tin cá nhân
- [ ] Đã chạy thử trọn kịch bản 5 lần liên tiếp không lỗi
- [ ] Không merge gì trong 15 phút trước giờ demo
- [ ] Video dự phòng nằm trong máy (video không được tính điểm, chỉ dùng khi không còn cách nào)

## Kịch bản (khoảng 3 phút)

| Thời gian | Làm gì | Nói gì | Tiêu chí |
|---|---|---|---|
| 0:00 | Giơ một tờ thông báo tiếng Nhật | Nêu người dùng và khó khăn bằng một câu chuyện thật thu được hôm nay (lấy từ `EVIDENCE.md` mục 6) | 2 |
| 0:25 | **Vuốt tắt hẳn app, mở lại từ màn hình chính** | "Đây là app đã cài. Các việc giấy tờ trước đó vẫn còn." | 1 |
| 0:40 | Bấm Chụp giấy tờ, chụp tờ tiếng Nhật | Im lặng trong lúc xử lý. Khi con dấu đóng xuống: "Settle không giải thích. Settle đã làm ba việc." | 1 |
| 1:00 | Chỉ lần lượt ba khối | "Đã xếp hồ sơ. Đã đặt nhắc trước hạn. Đã soạn sẵn câu nói tại quầy." Bấm phát tiếng câu tiếng Nhật | 1, 2 |
| 1:25 | Đặt nhắc thử sau 30 giây, tiếp tục nói | Chỉ vào mục màu hổ phách: "Chỗ AI không chắc, Settle nói thẳng và không tự đặt nhắc." | 2 |
| 1:45 | Thông báo nổ trên máy | "Đây là thông báo thật của điện thoại." | 1 |
| 1:55 | Mời BGK đưa một giấy tờ tiếng bất kỳ, hoặc chụp tờ tiếng Hàn | "Không giới hạn nước hay ngôn ngữ." | 1, 3 |
| 2:20 | Đưa số liệu | Số người dùng thật hôm nay, số giấy tờ thật đã xử lý, tỉ lệ đúng trên bộ mẫu, số liệu có nguồn | 2, 3 |
| 2:40 | Chốt thị trường | Người dùng đầu tiên và kênh tiếp cận; ai trả tiền; vì sao ra toàn cầu không cần làm lại | 3 |

## Nếu có sự cố

| Sự cố | Xử lý |
|---|---|
| Xử lý quá 15 giây | Nói tiếp phần bằng chứng trong lúc chờ; app có trạng thái chờ rõ ràng |
| Báo lỗi mạng | Bấm thử lại một lần; nếu vẫn lỗi, chuyển sang phát 4G từ máy thứ hai |
| Bản mới lỗi | Rollback trên Vercel (Deployments → Promote bản trước), mở lại app |
| AI đọc sai một số | Chỉ ra nút sửa và mức tin cậy: đây chính là cơ chế người dùng quyết định cuối cùng |

## Câu hỏi BGK có thể hỏi

- **"Khác gì chụp ảnh rồi hỏi ChatGPT?"** — Người dùng không phải biết hỏi gì. Kết quả là việc đã làm xong: nhắc hạn đã đặt, thư đã soạn. Danh sách việc còn đó khi mở lại app.
- **"Sai thì sao?"** — Mỗi số liệu kèm đoạn chữ gốc và mức tin cậy; mục không chắc không được tự động hóa; việc gửi ra ngoài luôn do người dùng bấm.
- **"Dữ liệu cá nhân?"** — Ảnh chỉ được xử lý rồi bỏ, máy chủ không lưu; danh sách việc nằm trên máy người dùng.
- **"Kiếm tiền thế nào?"** — Trả lời bằng số liệu trong `EVIDENCE.md` mục 3, không ước lượng.
