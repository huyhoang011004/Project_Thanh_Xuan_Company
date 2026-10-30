# Plan 54: Tính Năng Soạn Đồ Giao Trước Ca Chiều Cho Thủ Kho (Prep Order Advance Delivery)

> Status: Done | Created: 2026-10-29

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Bối cảnh
- **Bối cảnh nghiệp vụ:** Tại các nhà hàng đối tác đông khách (đặc biệt chuỗi Pizza 4P's), những hôm quá tải khăn dùng, xưởng giặt Thanh Xuân phải linh hoạt chở trước một lượng đồ sạch (như khăn ăn xám) vào buổi chiều (cùng ngày với ca giao tối, hoặc chiều hôm trước với ca giao sáng) để nhà hàng đủ khăn phục vụ khách.
- **Yêu cầu:**
  1. Dòng ghi chú tương ứng của chiếc đồ trong phiếu tự động ghi rõ cú pháp chuẩn: `Đã giao xxx chiếc vào chiều dd/mm/yyyy`.
  2. Màn hình của Thủ kho khi soạn đồ (`PrepOrderModal` gồm cả dạng Bảng Table và dạng Thẻ Mobile Card) ở cột số lượng sẽ hiển thị phân rã trực quan: `xxx (cần giao ca chính) + xxx (đã giao ca chiều, màu cam nổi bật)`.
  3. Giá trị số lượng lưu trong hệ thống (`quantity`) là tổng cả 2 đợt ($xxx + yyy = zzz$) để Shipper và Đối tác ký nhận, đối soát và tính sản lượng trọn vẹn.
  4. Các màn hình khác (Shipper, Đối tác, Canvas/ảnh phiếu xuất) giữ nguyên số lượng tổng và hiển thị dòng ghi chú đó, không bị ảnh hưởng.
  5. Hỗ trợ nhập liệu 2 chiều (Hybrid): Tiện ích 1 chạm (Popover nhập số lượng + ngày giao chiều tự sinh ghi chú) VÀ tự động nhận diện thông minh (Regex parser) nếu thủ kho gõ tay vào ô ghi chú.

### 1.2. Phạm vi (Scope)
- **Frontend `fe-react-thanhxuan-internal`:**
  - Tạo helper xử lý logic tách/gộp số lượng và cú pháp ghi chú: `prepOrderAdvanceDeliveryHelper.ts`.
  - Tạo component tiện ích popover hỗ trợ thủ kho nhập nhanh 1 chạm: `AdvanceDeliveryPopoverComponent.tsx`.
  - Cập nhật hiển thị cột số lượng và tích hợp popover vào bảng soạn đồ: `PrepOrderItemTableComponent.tsx`.
  - Cập nhật hiển thị cột số lượng và tích hợp popover vào thẻ soạn đồ mobile: `PrepOrderItemCardComponent.tsx`.
  - Cập nhật unit test kiểm thử logic parser/formatter.
- **Backend `be-nestjs-thanhxuan`:** Giữ nguyên schema và API contract hiện có (vì `CleanItemLine` đã có đầy đủ `quantity` và `note`).
- **Out of scope:** Không can thiệp vào quy trình ký nhận của Shipper, Đối tác hoặc Trạm đếm lại.

### 1.3. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/prepOrderAdvanceDeliveryHelper.ts` | Add | Helper parse/format ghi chú và tính toán phân rã số lượng giao ca chiều |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/AdvanceDeliveryPopoverComponent.tsx` | Add | Popover tiện ích 1 chạm cho thủ kho nhập số lượng & ngày giao ca chiều |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/PrepOrderItemTableComponent.tsx` | Edit | Hiển thị `xxx + xxx (màu cam)` và tích hợp nút popover trên desktop table |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/PrepOrderItemCardComponent.tsx` | Edit | Hiển thị `xxx + xxx (màu cam)` và tích hợp nút popover trên mobile card |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/__tests__/prepOrderAdvanceDeliveryHelper.test.ts` | Add | Unit test kiểm thử parser, regex, và tính toán số lượng |
| `.agents/docs/CODEBASE_ATLAS.md` | Edit | Cập nhật component và helper mới vào mục 3 Ma trận Cổng Vận Hành Nội Bộ |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | Edit | Cập nhật đặc tả phân hệ Handover: Tính năng Soạn đồ giao trước ca chiều |
| `.agents/docs/SRS_SDD.md` | Edit | Cập nhật 1 dòng Document History |
| `.agents/docs/CHANGELOG.md` | Edit | Ghi nhận chi tiết thay đổi kỹ thuật của Plan 54 |

---

## 2. Technical Approach

### 2.1. Kiến trúc phân rã dữ liệu & Cú pháp ghi chú
1. **Cú pháp ghi chú chuẩn:**
   `Đã giao {advanceQty} chiếc vào chiều {dd/mm/yyyy}` (hoặc `cái`).
2. **Biểu thức chính quy (Regex Parser linh hoạt):**
   ```typescript
   const ADVANCE_DELIVERY_REGEX = /(?:Đã giao|Giao trước)\s*(\d+)\s*(?:chiếc|cái)?\s*vào chiều\s*(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{4})?)/i;
   ```
3. **Mô hình toán học phân rã:**
   - Khi có `advanceQty`:
     - $Q_{\text{total}}$: Tổng số lượng lưu vào trường `quantity` của item (được gửi lên Backend và hiển thị trên màn hình Shipper/Đối tác/Canvas).
     - $Q_{\text{main}} = \max(0, Q_{\text{total}} - advanceQty)$: Số lượng cần soạn giao ở ca chính (tối hoặc sáng).
     - $Q_{\text{advance}} = advanceQty$: Số lượng đã giao ở ca chiều.
     - Hiển thị trên màn hình Thủ kho:
       `[ Q_main ]` + `<span class="text-amber-600 dark:text-amber-400 font-bold">+ Q_advance (chiều)</span>` = `<span class="text-sky-600 font-bold">Q_total chiếc</span>`.
   - Khi thủ kho bấm tăng/giảm stepper ở ca chính: $Q_{\text{total}}$ tăng/giảm tương ứng, $Q_{\text{advance}}$ giữ nguyên.
   - Khi thủ kho dùng popover để đổi $Q_{\text{advance}}$: $Q_{\text{total}}$ tự động điều chỉnh bằng $Q_{\text{main}} + Q_{\text{advance mới}}$, dòng ghi chú tự động cập nhật ngày & số lượng mới.

### 2.2. Giao diện người dùng & Trải nghiệm thủ kho (UI/UX Impeccable)
- **Nút tiện ích Popover (1 chạm):**
  - Đặt cạnh ô Ghi chú (hoặc ô Số lượng) với biểu tượng `Sunset` / `Truck` kèm badge chỉ báo khi đang có giao chiều.
  - Khi bấm: Popover nổi lên (shadcn Popover), gồm:
    - Input số lượng giao chiều (bàn phím số numeric trên mobile).
    - Lựa chọn ngày nhanh: "Chiều hôm nay", "Chiều hôm qua", hoặc chọn ngày bất kỳ.
    - Nút "Xác nhận" (tự động cập nhật `quantity` và `note`) và nút "Xóa giao chiều" (nếu muốn hủy).
- **Màu sắc nhận diện:**
  - Phần ca chính: Màu xanh sky chuẩn (`text-sky-700 dark:text-sky-300`).
  - Phần ca chiều: Màu cam hổ phách ấm áp (`text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 px-1.5 py-0.5 rounded`).
  - Phân biệt rõ ràng ngay lập tức khi thủ kho nhìn lướt qua bảng danh mục đồ giặt.

---

## 3. Implementation Tasks (Checklist)

- [x] T1: `prepOrderAdvanceDeliveryHelper.ts` - Xây dựng helper phân tích cú pháp (parse), định dạng ghi chú (format), và tính toán $Q_{\text{main}}$, $Q_{\text{advance}}$, $Q_{\text{total}}$ kèm fallback an toàn - Depends on: none
- [x] T2: `prepOrderAdvanceDeliveryHelper.test.ts` - Viết unit test kiểm thử các trường hợp regex khớp/không khớp, ngày tháng chuẩn/viết tắt, tính toán số lượng không âm - Depends on: T1
- [x] T3: `AdvanceDeliveryPopoverComponent.tsx` - Tạo component Popover tiện ích 1 chạm cho thủ kho với UI tinh tế, input số lượng và lựa chọn ngày chiều hôm nay/hôm qua - Depends on: T1
- [x] T4: `PrepOrderItemTableComponent.tsx` - Cập nhật cột "Sẽ giao ngày mai" hiển thị định dạng `xxx (ca chính) + xxx (ca chiều)` có màu cam nổi bật và tích hợp nút kích hoạt Popover - Depends on: T1, T3
- [x] T5: `PrepOrderItemCardComponent.tsx` - Cập nhật thẻ mobile card hiển thị định dạng `xxx + xxx (chiều)` có màu cam nổi bật và tích hợp nút kích hoạt Popover trên mobile - Depends on: T1, T3
- [x] T6: Kiểm thử Lint, Typecheck, Unit Test và Build trên `fe-react-thanhxuan-internal` đảm bảo pass 100% không có cảnh báo - Depends on: T2, T4, T5
- [x] T7: Đồng bộ tài liệu kỹ thuật (`CODEBASE_ATLAS.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`), tự động commit và push lên nhánh `dev` - Depends on: T6

---

## Execution Log
- 2026-10-29: Thực thi toàn bộ 7 tasks của Plan 54. Đã tạo helper `prepOrderAdvanceDeliveryHelper.ts`, unit test `prepOrderAdvanceDeliveryHelper.test.ts`, component `AdvanceDeliveryPopoverComponent.tsx`, tích hợp hiển thị phân rã ca chiều trực quan và nút popover vào `PrepOrderItemTableComponent.tsx` và `PrepOrderItemCardComponent.tsx`. Đã verify `tsc -b && vite build` pass 100%, `tsc --noEmit` pass 100%. Đã đồng bộ toàn bộ tài liệu kỹ thuật vào `CODEBASE_ATLAS.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`.

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm thử
- `fe-react-thanhxuan-internal/`:
  - `pnpm test` (chạy vitest cho các test helper)
  - `pnpm exec tsc --noEmit` (kiểm tra kiểu dữ liệu TypeScript nghiêm ngặt)
  - `pnpm lint` (kiểm tra chuẩn coding style)
  - `pnpm build` (kiểm tra đóng gói bundle ứng dụng)

### 4.2. Kịch bản kiểm thử (Test Cases)
1. **Happy Path 1 (Sử dụng Popover):**
   - Mở modal soạn đồ cho Pizza 4P's Phan Xích Long.
   - Tại dòng "Khăn ăn xám", bấm nút tiện ích giao chiều, nhập 200 chiếc, chọn chiều hôm nay (29/10/2026).
   - Kiểm tra ô ghi chú: Tự động điền `Đã giao 200 chiếc vào chiều 29/10/2026`.
   - Kiểm tra cột số lượng: Nhập ca chính là 400 $\rightarrow$ Hiển thị `400 + 200 (màu cam)`, tổng số lượng gửi đi là 600.
2. **Happy Path 2 (Gõ tay ghi chú):**
   - Nhập ô ghi chú: "Đã giao 150 cái vào chiều 28/10/2026".
   - Hệ thống tự động nhận diện `advanceQty = 150` và hiển thị `(quantity - 150) + 150` màu cam ngay lập tức.
3. **Edge Case 1 (Hủy giao chiều):**
   - Xóa chữ trong ô ghi chú hoặc bấm "Xóa giao chiều" trong Popover.
   - Cột số lượng trở về hiển thị con số đơn thuần như bình thường, không còn badge màu cam.
4. **Edge Case 2 (Màn hình khác & Canvas):**
   - Mở màn hình Shipper hoặc Đối tác hoặc Canvas phiếu giao nhận xem trước.
   - Cột số lượng hiển thị đúng tổng 600 chiếc, cột ghi chú hiển thị dòng `Đã giao 200 chiếc vào chiều 29/10/2026`, hoàn toàn không bị lỗi hiển thị hay ảnh hưởng logic cũ.

---

## 5. Risks & Rollback

- **Rủi ro:** Người dùng gõ ghi chú với cú pháp tự do không theo khuôn mẫu (VD: "chieu qua giao 200 cai").
  - **Giảm thiểu:** Popover tiện ích 1 chạm tự động sinh cú pháp chuẩn xác 100%. Nếu gõ tự do không khớp regex, hệ thống coi là ghi chú thông thường, giữ nguyên số lượng mà không gây lỗi ứng dụng.
- **Phương án Rollback:** Hoàn nguyên commit trên nhánh `dev` nếu phát sinh bất kỳ xung đột nào.

---

## Changelog
- 2026-10-29: Khởi tạo Plan 54 - Tính năng Soạn đồ giao trước ca chiều cho thủ kho.
