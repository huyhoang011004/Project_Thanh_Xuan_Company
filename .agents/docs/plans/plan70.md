# Plan 70: Giai Đoạn 2 - Xuất Báo Cáo Bảng Kê Nhận Khăn Form Chuẩn Ma Trận Ngày (Chu Kỳ 26 Đến 25) Khớp Google Sheet (Yêu Cầu 1)

> Status: Draft | Created: 2026-11-19 | Hệ thống: be-nestjs-thanhxuan & fe-react-thanhxuan-internal

---

## 1. Overview & Affected Files

### 1.1. Mục Tiêu & Phạm Vi
- **Mục tiêu:** Cung cấp tính năng xuất file Excel báo cáo nhận khăn hàng ngày cho chuỗi nhà hàng theo đúng định dạng mẫu Google Sheet khách hàng yêu cầu (chu kỳ tính cước từ ngày 26 tháng trước đến ngày 25 tháng sau).
- **Phạm vi:**
  - Backend: Xây dựng service xuất file Excel `exceljs` ma trận theo ngày với bố cục chuyên biệt:
    - Bảng chính bên trái: Cột `NGÀY` (merge 9 dòng/ngày), cột `LOẠI HÀNG HÓA` (9 mục chuẩn: Khăn ăn xám, Khăn trắng lau ly, Khăn trắng bếp, Khăn lau bát navy/nâu/hồng, Khăn che xe/phủ xe, Tạp dề, Chăn bay, Rèm, Bọc giỏ), cột `SỐ LƯỢNG (cái)`, và các dòng tổng gộp phân nhóm.
    - Bảng phụ bên phải: `HẠNG MỤC BỔ SUNG` gồm các món ngoài danh mục cố định, cột Đơn giá, Thành tiền và dòng Tổng phụ.
    - Dòng cuối cùng: `TỔNG CỘNG` tổng số lượng khăn toàn kỳ với công thức Excel tự động.
  - Frontend: Bổ sung nút bấm "Xuất Bảng Kê Nhận Khăn (Mẫu Chuẩn)" trên giao diện Cổng Đối Tác (`PartnerPortalPage`) để đại diện nhà hàng tự tải, và Trung Tâm Báo Cáo (`ReportsPage`) cho Kế toán / Quản lý xưởng.
- **Out of scope:** Không thay đổi cấu trúc bảng CSDL MongoDB và không ảnh hưởng đến các mẫu xuất Excel hiện có.

### 1.2. Assumptions & Open Questions
- **Assumptions:** Khoảng ngày mặc định là chu kỳ 26 tháng trước đến 25 tháng này, nhưng API cho phép truyền linh hoạt `fromDate` và `toDate`. Dữ liệu số lượng khăn lấy từ số thực tế xưởng nhận (`actualQuantityReceived` nếu đã kiểm đếm xưởng, hoặc `quantityReceived` nếu chưa đếm lại).
- **Open Questions:** Nếu nhà hàng phát sinh loại đồ không nằm trong 9 danh mục chuẩn, hệ thống tự động đẩy sang bảng "Hạng Mục Bổ Sung" bên phải kèm đơn giá hợp đồng.

### 1.3. Bảng File Ảnh Hưởng
| Path | Action | Lý do |
| :--- | :---: | :--- |
| `backend-thanhxuan/src/modules/internal/reports/services/excel/partner-excel.service.ts` | Edit | Thêm hàm `streamDailyTowelReceiptMatrixExcel` dựng layout bảng ma trận theo ngày khớp mẫu Google Sheet |
| `backend-thanhxuan/src/modules/internal/reports/services/partner-report.service.ts` | Edit | Xây dựng logic gom nhóm dữ liệu nhận đồ theo từng ngày (26 $\rightarrow$ 25) và phân loại 9 nhóm đồ + hạng mục bổ sung |
| `backend-thanhxuan/src/modules/internal/reports/reports.controller.ts` | Edit | Thêm endpoint `GET /reports/partner/:partnerId/towel-matrix-export` |
| `thanhxuan-internal/src/features/operations/reports/reports.service.ts` | Edit | Bổ sung hàm gọi API tải file Excel ma trận khăn |
| `thanhxuan-internal/src/features/operations/handovers/PartnerPortalPage.tsx` | Edit | Thêm nút xuất file báo cáo nhận khăn chu kỳ cho tài khoản đại diện nhà hàng |
| `thanhxuan-internal/src/features/operations/reports/components/PartnerReconciliationReportViewComponent.tsx` | Edit | Thêm nút xuất bảng kê mẫu khăn chuẩn trên màn hình báo cáo đối tác của Kế toán |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | Edit | Cập nhật tài liệu endpoint và mô tả logic export báo cáo ma trận nhận khăn |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | Edit | Ghi nhận tính năng xuất bảng kê nhận khăn cho phía đối tác |
| `.agents/docs/CODEBASE_ATLAS.md` | Edit | Đăng ký endpoint mới trong danh mục Reports |
| `.agents/docs/CHANGELOG.md` | Edit | Ghi nhật ký triển khai Plan 70 |

---

## 2. Technical Approach

### 2.1. Cấu Trúc Bảng Excel Mẫu Khách Hàng (Google Sheet GID: 1192612866)
- **Bảng chính bên trái (Cột B $\rightarrow$ E):**
  - Cột B: `NGÀY` (Merge 9 dòng cho mỗi ngày, định dạng DD/MM/YYYY).
  - Cột C: `LOẠI HÀNG HÓA` gồm 9 mục cố định:
    1. Khăn ăn xám
    2. Khăn trắng lau ly
    3. Khăn trắng bếp
    4. Khăn lau bát, navi,nâu,hồng
    5. Khăn che xe, phủ xe
    6. Tạp dề
    7. Chăn bay
    8. Rèm
    9. Bọc giỏ
  - Cột D: `SỐ LƯỢNG (cái)` tương ứng từng mục.
  - Cột E: Chú thích tổng gộp nhóm (Ví dụ: *Tổng khăn lau bát, navy, nâu, hồng*, *Tổng bọc xe to, nhỏ*, *Tổng tạp dề nhân viên, kids*).
- **Bảng phụ bên phải (Cột H $\rightarrow$ K):**
  - Tiêu đề: `HẠNG MỤC BỔ SUNG`
  - Các cột: `TÊN LOẠI` | `SỐ LƯỢNG` | `ĐƠN GIÁ` | `THÀNH TIỀN`
  - Dòng `TỔNG` thành tiền hạng mục bổ sung.
- **Dòng cuối bảng:** `TỔNG CỘNG` tổng số lượng cái của cả kỳ (công thức `=SUM(D3:D[N])`).

### 2.2. DTO & Data Shape Minh Họa
```typescript
export interface DailyTowelData {
  dateStr: string; // DD/MM/YYYY
  items: Record<string, number>; // key: itemCode -> qty
  subtotals: {
    dishTowels?: number;
    cartCovers?: number;
    aprons?: number;
  };
}

export interface ExtraItemData {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
```

---

## 3. Implementation Tasks (Checklist)

- [ ] T1: Khảo sát chi tiết dictionary danh mục đồ vải của đối tác để ánh xạ chuẩn xác vào 9 danh mục cố định - Depends on: none
- [ ] T2: Viết hàm `streamDailyTowelReceiptMatrixExcel` trong `partner-excel.service.ts` bằng `exceljs`: thiết lập font Arial/Times, viền mỏng thin border, fill màu header, merge cell cột Ngày và công thức SUM - Depends on: T1
- [ ] T3: Viết service aggregation `getDailyTowelMatrixData(partnerId, fromDate, toDate)` trong `partner-report.service.ts`: gom dữ liệu từ `HandoverRecord`, ưu tiên `actualQuantityReceived`, fallback sang `quantityReceived` - Depends on: T2
- [ ] T4: Thêm endpoint `GET /reports/partner/:partnerId/towel-matrix-export` trong `reports.controller.ts` kèm query `fromDate` và `toDate` - Depends on: T3
- [ ] T5: Bổ sung client helper `downloadTowelMatrixReport(partnerId, from, to)` trong `reports.service.ts` tại frontend - Depends on: T4
- [ ] T6: Thêm nút bấm "Xuất Bảng Nhận Khăn (Mẫu Chuẩn)" trên giao diện `PartnerPortalPage.tsx` và `PartnerReconciliationReportViewComponent.tsx` - Depends on: T5
- [ ] T7: Viết unit test cho aggregation service và controller endpoint trong `backend-thanhxuan` - Depends on: T4
- [ ] T8: Kiểm thử xuất file thực tế, đối chiếu định dạng với file Google Sheet mẫu của khách hàng - Depends on: T6, T7
- [ ] T9: Đồng bộ tài liệu `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `CODEBASE_ATLAS.md` và `CHANGELOG.md` - Depends on: T8

---

## 4. Verification & Testing

- **Backend:** `pnpm exec tsc --noEmit && pnpm test -- partner-report.service.spec.ts`
- **Frontend:** `pnpm exec tsc --noEmit && pnpm build`
- **Kịch bản kiểm thử:**
  1. Đăng nhập tài khoản nhà hàng, chọn khoảng ngày chu kỳ 26/10 $\rightarrow$ 25/11, bấm nút xuất bảng kê nhận khăn.
  2. Mở file Excel kiểm tra: có đủ 9 mục cố định từng ngày, đúng số lượng đếm, có bảng Hạng Mục Bổ Sung bên phải, dòng TỔNG CỘNG có công thức SUM chuẩn xác.

---

## 5. Risks & Rollback

- **Rủi ro:** Một số nhà hàng có tên danh mục đồ khác biệt (ví dụ: "Tạp dề ngắn", "Tạp dề dài") cần mapping chuẩn xác vào 9 danh mục chính.
- **Giảm thiểu:** Viết bảng dictionary regex mapping linh hoạt theo keyword (`/tạp dề/i`, `/khăn lau bát/i`...). Món nào không khớp thì chuyển vào bảng Hạng Mục Bổ Sung.

---

## Changelog

- 2026-11-19: Khởi tạo Plan 70 cho nghiệp vụ xuất Excel ma trận nhận khăn giai đoạn 2.
