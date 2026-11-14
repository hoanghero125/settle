# Bộ giấy tờ mẫu (tổng hợp)

Đây là giấy tờ **giả lập**, không phải giấy tờ thật của ai. Tên, địa chỉ, số tham chiếu, cơ quan phát hành đều là hư cấu (みどり野市, 견본지사, 範例國稅局, "NGUYEN THI MAU"...). Mỗi tờ có dấu mẫu: 見本 (Nhật), 견본 (Hàn), 範本 (Trung).

- `<id>.jpg`: ảnh giả chụp bằng điện thoại (nghiêng nhẹ, phối cảnh, ánh sáng không đều, nhiễu, nền bàn gỗ) để test route AI.
- `expected.json`: đáp án đúng cho từng ảnh, tính với `now = 2026-11-14T03:00:00Z`.
- `docs/demo-papers/<id>.pdf`: bản A4 sạch, 1 trang, để chiếu trên laptop hoặc in ra rồi chụp trực tiếp khi demo.
- `src/<id>.html`: nguồn của từng tờ.

## Đáp án

| id | Giấy gì | Hạn | Mức độ | Số tiền |
| --- | --- | --- | --- | --- |
| `ja-resident-tax` | Thông báo nộp thuế cư trú (住民税 納税通知書), hạn ghi theo niên hiệu 令和8年11月18日（水） | 2026-11-18 | act_now | 34500 (yên) |
| `ko-health-insurance` | Giấy báo phí bảo hiểm y tế (건강보험료 고지서), 납부기한 2026. 12. 10.(목) | 2026-12-10 | has_deadline | 126880 (won) |
| `zh-tw-income-tax` | Giấy nộp thuế thu nhập Đài Loan (綜合所得稅核定稅額繳款書), lịch Dân Quốc 115年12月01日 | 2026-12-01 | has_deadline | 18300 (TWD) |
| `not-paperwork` | Ảnh phong cảnh mờ, không có giấy tờ (chỉ có JPEG) | null | info_only | null |

Ghi chú: `language` của tờ Đài Loan là `zh-TW`; nếu so sánh với kết quả AI thì nên so phần ngôn ngữ chính (`zh`).

Chưa làm (để sau): `ja-health-insurance`, `ja-pension-info`, `ko-stay-expiry`.

## Tạo lại

```bash
bash src/fixtures/papers/src/build.sh            # tạo lại tất cả
bash src/fixtures/papers/src/build.sh ja-resident-tax   # chỉ một tờ
```

Cần `google-chrome`, ImageMagick (`convert`) và font Noto Sans/Serif CJK JP/KR/TC. Nếu sửa ngày hoặc số tiền trong HTML thì sửa luôn `expected.json`.
