# CHALLENGE.md — Phân tích đề bài

> File này cung cấp context về nhiệm vụ cho coding agent. Đọc kỹ trước khi đề xuất kiến trúc, viết code hoặc đưa ra quyết định sản phẩm. Mọi quyết định kỹ thuật phải phục vụ yêu cầu cốt lõi ở mục 3 và 4.

---

## 1. Đề bài gốc

**EN:**
> Build a mobile experience where AI is essential to the user outcome - not a chatbot bolted on at the end. Pick a problem in public services and civic life, everyday life and accessibility, work and education, or go open.

**VI:**
> Tạo trải nghiệm di động trong đó AI đóng vai trò thiết yếu đối với kết quả của người dùng - không phải chatbot gắn thêm ở cuối. Chọn bài toán về dịch vụ công và đời sống đô thị, cuộc sống hàng ngày và khả năng tiếp cận, công việc và giáo dục, hoặc chủ đề mở.

---

## 2. Ràng buộc đã biết

| Ràng buộc | Giá trị | Hệ quả |
|---|---|---|
| Thời gian | **5 giờ**, tính cả lúc lên ý tưởng và trình bày | Thời gian code thực tế ít hơn nhiều. Ưu tiên một luồng chính chạy thật hơn nhiều tính năng làm dở. |
| Nền tảng | **Di động** | Sản phẩm phải dùng được và được trình diễn trên điện thoại. |
| AI | **OpenAI API (ChatGPT), credit do BTC cấp** | Toàn bộ năng lực AI đi qua OpenAI API. Không phụ thuộc nhà cung cấp AI khác. |
| Bối cảnh người dùng | Việt Nam (hackathon song ngữ Anh–Việt) | Nội dung và giao diện mặc định tiếng Việt, xử lý được tiếng Việt có dấu. |

---

## 3. Diễn giải từng thành phần của đề bài

### 3.1. "Build a mobile experience" — Trải nghiệm di động

- Từ khóa là **experience**, không phải "app" hay "website". Đề bài chấm trải nghiệm người dùng khi cầm điện thoại.
- Ngữ cảnh di động khác máy tính: màn hình nhỏ, thao tác một tay, đang di chuyển, chú ý ngắn, mạng có thể chập chờn.
- Điện thoại có những đầu vào mà máy tính không có sẵn hoặc không tự nhiên: **camera, micro, vị trí, thông báo, chia sẻ từ app khác, cảm biến**.
- Một website desktop thu nhỏ lại **không** đáp ứng đề bài. Giao diện phải được thiết kế cho màn hình dọc và ngón tay.

### 3.2. "where AI is essential" — AI là thiết yếu

- **Essential** nghĩa là điều kiện cần: không có AI thì sản phẩm không đạt được mục đích.
- Phân biệt với AI là *tiện ích* (nice-to-have): sản phẩm vẫn hoạt động nếu tắt AI, AI chỉ làm nó nhanh hơn hoặc hay hơn một chút. Trường hợp này **không đạt**.
- AI phải nằm **ở giữa luồng chính**, là thứ biến đầu vào của người dùng thành kết quả.

### 3.3. "to the user outcome" — Đối với kết quả của người dùng

- Thước đo là **outcome**: điều người dùng đạt được trong đời sống thực (hoàn thành thủ tục, hiểu một văn bản, tránh một rủi ro, xong một công việc).
- Không phải output (một đoạn văn AI sinh ra), mà là outcome (điều thay đổi cho người dùng nhờ đoạn văn đó).
- Có chữ **user**: phải có một người dùng cụ thể, với nhu cầu cụ thể. Sản phẩm "cho tất cả mọi người" là dấu hiệu chưa xác định đúng bài toán.

### 3.4. "not a chatbot bolted on at the end" — Không phải chatbot gắn thêm ở cuối

Đây là vế quan trọng nhất về mặt loại trừ. Nó nằm ngay trong câu chính của đề, không phải ghi chú, nên cần coi là **ràng buộc cứng**. Vế này cấm hai thứ khác nhau:

1. **"chatbot"**: giao diện lấy ô chat hỏi–đáp tự do làm trung tâm, buộc người dùng phải tự nghĩ ra câu hỏi và tự diễn giải câu trả lời.
2. **"bolted on at the end"**: AI được thêm vào sau như một lớp phủ lên sản phẩm vốn đã hoàn chỉnh, hoặc nằm ở bước cuối (ví dụ nút "Hỏi AI", "Tóm tắt bằng AI" sau khi người dùng đã tự làm hết).

Hệ quả: hội thoại **không bị cấm hoàn toàn**, nhưng nếu có thì nó phải là phương tiện dẫn tới một kết quả cụ thể trong luồng chính, không phải bản thân sản phẩm.

### 3.5. "Pick a problem" — Chọn một bài toán

- Đề bài đặt **vấn đề lên trước**, không đặt công nghệ lên trước.
- Số ít: **a problem**. Một bài toán, giải trọn, tốt hơn nhiều bài toán giải hời hợt.

### 3.6. Các lĩnh vực (track)

| Track | Phạm vi |
|---|---|
| **Public services and civic life** / Dịch vụ công và đời sống đô thị | Tương tác giữa người dân và nhà nước, chính quyền địa phương, hạ tầng và đời sống thành phố: thủ tục hành chính, giấy tờ, văn bản, phản ánh, giao thông, môi trường đô thị. |
| **Everyday life and accessibility** / Cuộc sống hằng ngày và khả năng tiếp cận | Việc thường ngày của mọi người, đặc biệt là nhóm gặp rào cản: người cao tuổi, người khuyết tật (thị giác, thính giác, vận động, nhận thức), người hạn chế kỹ năng số hoặc ngôn ngữ. |
| **Work and education** / Công việc và giáo dục | Học tập, giảng dạy, tìm việc, làm việc, phát triển kỹ năng. |
| **Open** / Chủ đề mở | Bất kỳ bài toán nào, miễn đáp ứng yêu cầu cốt lõi (mục 4). |

Lưu ý: bản tiếng Việt dịch "civic life" thành "đời sống đô thị", hẹp hơn bản gốc. "Civic life" bao gồm cả quan hệ công dân – cộng đồng – chính quyền, không chỉ đô thị. Track không phải tiêu chí chấm riêng mà là định hướng phạm vi.

---

## 4. Định nghĩa vận hành: thế nào là "AI thiết yếu"

Dùng các câu hỏi sau để kiểm tra mọi quyết định sản phẩm. Một thiết kế đạt yêu cầu khi trả lời đúng hầu hết các câu.

| # | Câu hỏi | Câu trả lời cần có |
|---|---|---|
| 1 | **Phép trừ:** Bỏ AI đi, người dùng có còn đạt được kết quả không? | **Không** (hoặc chỉ đạt bằng cách thủ công tốn kém, phải nhờ chuyên gia). |
| 2 | Đầu vào có phải dữ liệu thế giới thực, lộn xộn, phi cấu trúc (ảnh, giấy tờ, chữ viết tay, giọng nói, ảnh chụp màn hình)? | Có. Đây là chỗ AI tạo khác biệt mà phần mềm thường không làm được. |
| 3 | Đầu ra có phải kết quả có cấu trúc, dùng được ngay (danh sách việc, form đã điền, cảnh báo, lịch nhắc, bản nháp) thay vì chỉ một đoạn văn? | Có. |
| 4 | AI có làm việc mà người dùng không tự làm được, hoặc phải mất rất lâu? | Có. |
| 5 | Có tận dụng năng lực riêng của điện thoại (camera, micro, vị trí, thông báo, chia sẻ)? | Có. |
| 6 | Người dùng có cần biết cách viết prompt hay đặt câu hỏi cho AI không? | **Không**. Người dùng chụp, nói, chạm; prompt nằm trong hệ thống. |
| 7 | Khi AI sai hoặc không chắc, sản phẩm xử lý thế nào? | Có cơ chế: hiển thị độ tin cậy, cho phép xác nhận/sửa, con người quyết định cuối cùng. |

### Thang mức độ tích hợp AI

| Mức | Mô tả | Đánh giá theo đề |
|---|---|---|
| **0 — Chatbot gắn thêm** | Sản phẩm bình thường + ô chat ở góc hoặc ở cuối | ❌ Bị đề bài loại trừ trực tiếp |
| **1 — Tính năng AI** | Một nút AI trong sản phẩm vốn hoạt động được không cần AI | ⚠️ Không đạt "essential" |
| **2 — Luồng do AI dẫn dắt** | AI nằm giữa luồng chính, biến đầu vào thành kết quả hành động được | ✅ Đạt |
| **3 — AI-native** | Người dùng gần như không thấy "AI"; họ chụp/nói và nhận kết quả | ✅ Lý tưởng |

---

## 5. Những gì sản phẩm KHÔNG được là

- Giao diện mà màn hình chính là ô chat hỏi–đáp tự do.
- Lớp vỏ mỏng: chuyển nguyên văn câu hỏi người dùng sang model rồi hiển thị câu trả lời.
- Sản phẩm truyền thống (form, danh sách, CRUD) với AI chỉ ở bước cuối để tóm tắt hoặc gợi ý.
- Kết quả AI được viết sẵn, cố định (mock). Đề yêu cầu AI thiết yếu, nên AI phải chạy thật.
- Website desktop thu nhỏ, không tính đến ngữ cảnh di động.
- Sản phẩm không có người dùng cụ thể và bài toán cụ thể.

---

## 6. Yêu cầu sản phẩm suy ra từ đề bài

Các yêu cầu sau không được viết thẳng trong đề nhưng suy ra trực tiếp từ nó:

1. **Một luồng chính, end-to-end, chạy thật:** đầu vào từ người dùng → AI xử lý thật qua OpenAI API → kết quả có cấu trúc → người dùng thực hiện được một hành động.
2. **Đầu vào ưu tiên phương thức tự nhiên của di động** (chụp ảnh, ghi âm, chia sẻ) hơn là gõ văn bản dài.
3. **Đầu ra được trình bày như giao diện** (thẻ, danh sách, trạng thái, nút hành động), không như một khối văn bản.
4. **Con người giữ quyền quyết định** ở các bước có hậu quả (gửi hồ sơ, tiền bạc, sức khỏe, pháp lý): AI đề xuất, người dùng xác nhận.
5. **Minh bạch về độ chắc chắn:** khi AI không chắc, giao diện thể hiện điều đó và yêu cầu người dùng kiểm tra.
6. **Tiếng Việt là mặc định** trong giao diện và trong đầu ra của AI.
7. **Khả năng tiếp cận:** chữ đủ lớn, tương phản tốt, vùng chạm lớn. Bắt buộc nếu chọn track tiếp cận, nên có ở mọi track.
8. **Xử lý độ trễ của AI:** người dùng luôn biết hệ thống đang làm gì trong lúc chờ.

---

## 7. Hệ quả kỹ thuật từ ràng buộc

### 7.1. Từ việc dùng OpenAI API

- **API key không bao giờ nằm trong mã phía client** (app di động hoặc trình duyệt). Mọi lời gọi OpenAI đi qua một backend/serverless function giữ key.
- Các năng lực của OpenAI API phù hợp với đề bài:
  - **Đầu vào hình ảnh (vision):** đọc ảnh chụp giấy tờ, chữ viết tay, ảnh màn hình, ảnh hiện trường.
  - **Structured Outputs (JSON Schema):** buộc model trả về JSON đúng schema để UI hiển thị thành phần giao diện, thay vì văn bản tự do.
  - **Speech-to-text:** biến giọng nói của người dùng thành văn bản.
  - **Text-to-speech:** đọc to kết quả (quan trọng cho người cao tuổi, người khiếm thị).
- Chọn model cụ thể dựa trên những gì credit của BTC cho phép; kiểm tra model khả dụng trước khi viết code phụ thuộc vào nó.
- Prompt hệ thống, dữ liệu tham chiếu (danh mục, quy tắc, ví dụ) và schema đầu ra là một phần của sản phẩm, nằm ở backend, người dùng không nhìn thấy.
- Credit có hạn: tránh gọi API lặp lại không cần thiết; nén/thu nhỏ ảnh trước khi gửi để giảm chi phí và độ trễ.
- Phải xử lý: lỗi mạng, timeout, rate limit, JSON không hợp lệ, model từ chối trả lời. Ứng dụng không được treo hoặc trắng màn hình khi gặp các lỗi này.

### 7.2. Từ giới hạn 5 giờ

- Không xây những thứ không phục vụ luồng chính: đăng nhập, tài khoản, phân quyền, trang quản trị, thanh toán, cài đặt, đa ngôn ngữ.
- Dữ liệu tham chiếu có thể là file tĩnh (JSON) đưa thẳng vào prompt; không cần cơ sở dữ liệu hay vector database trừ khi bài toán đòi hỏi.
- Ưu tiên công cụ cho phép chạy ngay trên điện thoại thật với ít cấu hình nhất (ví dụ PWA, hoặc Expo với Expo Go).

### 7.3. Từ dữ liệu người dùng

- Nhiều bài toán trong các track liên quan dữ liệu nhạy cảm (giấy tờ tùy thân, đơn thuốc, tài chính). Không lưu trữ dữ liệu này sau khi xử lý trừ khi cần thiết.
- Dữ liệu dùng để thử nghiệm và trình diễn nên là dữ liệu mẫu, không phải thông tin cá nhân thật.
- Với các lĩnh vực y tế, pháp lý, tài chính: AI hỗ trợ đọc, giải thích, nhắc nhở; không đưa ra chẩn đoán hay quyết định thay chuyên gia, và hướng người dùng tới nơi có thẩm quyền.

---

## 8. Những gì đề bài không nói (ẩn số)

Không tự giả định các điểm sau. Nếu một quyết định phụ thuộc vào chúng, nêu rõ giả định đang dùng.

| Ẩn số | Giả định tạm thời |
|---|---|
| Tiêu chí chấm điểm cụ thể và trọng số | **Đã biết**, xem mục 10. |
| Bắt buộc native app hay chấp nhận web app chạy trên điện thoại | **Đã rõ một phần** (mục 10): phải là app đóng hẳn rồi mở lại được trên điện thoại thật; chỉ demo bằng trình duyệt bị 0 điểm. Đội dùng APK Android. |
| Có được dùng dịch vụ ngoài OpenAI (ví dụ dịch vụ bản đồ, hosting) | Được, miễn năng lực AI đến từ OpenAI |
| Hình thức nộp bài (repo, video, demo live) | Cần repo chạy được và demo live trên điện thoại |
| Có được dùng code viết sẵn trước hackathon | Chỉ dùng thư viện/template công khai |

---

## 9. Tiêu chí thành công của sản phẩm

Sản phẩm đáp ứng đề bài khi tất cả các điều sau đúng:

- [ ] Giải quyết **một** bài toán cụ thể cho **một** nhóm người dùng cụ thể, thuộc một trong các track.
- [ ] Bỏ AI đi thì người dùng không đạt được kết quả (qua "phép trừ" ở mục 4).
- [ ] Màn hình chính **không** phải ô chat; AI không nằm ở bước cuối như phần phụ.
- [ ] Luồng chính chạy end-to-end trên **điện thoại thật**, với **lời gọi OpenAI API thật**.
- [ ] Đầu vào tận dụng ít nhất một năng lực của di động (camera, micro, vị trí, chia sẻ, thông báo).
- [ ] Đầu ra là kết quả có cấu trúc dẫn tới một hành động cụ thể.
- [ ] Có cơ chế xác nhận/sửa khi AI không chắc chắn.
- [ ] Giao diện và đầu ra bằng tiếng Việt.
- [ ] API key không lộ ở phía client.
- [ ] Ứng dụng không vỡ khi AI lỗi, chậm hoặc trả kết quả không hợp lệ.

---

## 10. Cách tính điểm (BTC công bố trong lúc thi)

BGK chọn một mức điểm cho mỗi tiêu chí; tổng điểm tối đa là 100. Điểm dựa trên bằng chứng thực tế, không dựa vào slide hay độ tự tin khi trình bày.

### 10.1. Demo AI trên điện thoại thật — tối đa 40 điểm

- **40 điểm:** Đóng hẳn rồi mở lại ứng dụng trên điện thoại thật; luồng AI chính chạy trực tiếp.
- **20 điểm:** Ứng dụng mở lại được trên điện thoại thật nhưng luồng AI chỉ chạy một phần hoặc chưa ổn định.
- **0 điểm:** Không mở lại được ứng dụng trên điện thoại thật, AI không chạy trực tiếp, hoặc chỉ demo bằng trình duyệt, giả lập, ảnh hay video.

### 10.2. Vấn đề thật của người dùng — tối đa 35 điểm

- **35 điểm:** Nêu rõ người dùng và khó khăn họ gặp, có bằng chứng, đồng thời cho thấy AI giúp trực tiếp.
- **18 điểm:** Vấn đề khá rõ nhưng bằng chứng hoặc lợi ích của AI còn hạn chế.
- **0 điểm:** Chưa làm rõ người dùng, vấn đề hoặc giá trị sản phẩm.

### 10.3. Khả năng mở rộng thị trường — tối đa 25 điểm

- **25 điểm:** Giải thích rõ cách tiếp cận người dùng đầu tiên và mở rộng ra toàn cầu; đã có người dùng thực tế là một lợi thế.
- **13 điểm:** Có hướng mở rộng nhưng cách tiếp cận người dùng hoặc lập luận còn yếu.
- **0 điểm:** Chưa có hướng tiếp cận người dùng cụ thể, hoặc chỉ khẳng định chung rằng "ai cũng cần".

**Nếu hòa điểm:** ưu tiên lần lượt tiêu chí 1, tiêu chí 2 rồi tiêu chí 3.

### 10.4. Ghi nhận thêm của đội (không nằm trong bảng điểm chính thức)

- BGK đặt nặng sự chỉn chu của UI/UX.
- BGK là các CEO, thích AI dùng để tự động hóa công việc hơn là AI để hỏi đáp.
