# Plan 39: Xóa Trang `/management`, Thiết Kế Lại `/dashboard` & Trung Tâm Báo Cáo `/operations/report`

> Status: Done | Created: 2026-10-26 | Completed: 2026-10-26

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Hiện trạng (Kèm dẫn chứng mã nguồn)

Qua khảo sát mã nguồn hiện tại của `fe-react-thanhxuan-internal` và `be-nestjs-thanhxuan`, hệ thống đang tồn tại các bất cập sau tại 3 đường dẫn được yêu cầu:

1. **Trang `/management` ([ManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx#L32-L368) & [management.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/(internal)/management.tsx#L1-L18)):**
   - Là trang "Hub trung gian" cũ, lặp lại toàn bộ các màn hình đã có đường dẫn độc lập trên Sidebar ([nav-config.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/nav-config.ts#L129-L221)) như Nhân sự, Phê duyệt, Chấm công, Công thợ, Xăng xe, Bảng lương.
   - Đang nhúng trực tiếp `<AuditLogPage />` ở tab `AUDIT` ([ManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx#L365)). Khi xóa `/management`, cần chuyển `AuditLogPage` sang làm 1 tab trong trang Quản lý Nhân sự (`/management/manager/personnel`) để không mất tính năng tra cứu nhật ký bảo mật.

2. **Trang `/dashboard` ([DashboardPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx#L31-L375)):**
   - **Lệch chuẩn thiết kế hiện tại:** Tự dựng khối Hero `rounded-3xl` ([DashboardPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx#L96)) thay vì dùng cấu trúc 4 tầng chuẩn của web hiện tại (`PageBanner` $\rightarrow$ `PageActionBar` $\rightarrow$ Bộ lọc ngày VN $\rightarrow$ KPI StatCards & Bảng điều phối).
   - **Sai lệch logic nghiệp vụ:**
     - Dùng `new Date().toISOString().split("T")[0]` theo giờ UTC ([DashboardPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx#L35)) thay vì `getTodayVN()` (`Asia/Ho_Chi_Minh`).
     - Tính tổng số phút làm việc (`t.minutesWorked`) nhưng lại hiển thị đơn vị là **`"chiếc"`** ([DashboardPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx#L77-L84), [L185](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx#L185), [L340](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx#L340)) do tàn dư của mô hình lương khoán sản lượng cũ trước khi chuyển sang **Công Thợ Theo Giờ (`HourlyWork`)**.
     - Thiếu cái nhìn toàn cảnh về Chấm công ca đang mở (`OPEN`), Ca bất thường chờ duyệt (`NEEDS_REVIEW`), Chi phí xăng chờ duyệt, và Phê duyệt tài khoản mới.

3. **Trang `/operations/report` ([ReportsViewComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/components/ReportsViewComponent.tsx#L13-L190), [useReports.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/useReports.ts#L9-L74), [reports.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/reports.service.ts#L5-L29)):**
   - **Đứt gãy hợp đồng API (API Contract Drift) giữa Frontend và Backend:**
     - Backend ([reports.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/reports/reports.controller.ts#L39-L225)) trả về **Object có cấu trúc chuyên biệt** cho từng loại báo cáo (`{ from, to, items/workers/deliveries/shippers, summary }`), nhưng Frontend ([reports.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/reports.service.ts#L6-L9)) lại ép kiểu thành mảng `ReportSummaryItem[]` và render 1 bảng 5 cột cố định $\rightarrow$ **Bảng xem trước luôn trống ("Không có bản ghi nào")**.
     - Báo cáo số 2 (`partner-reconciliation`) ở Backend bắt buộc query `partnerId` ([report-query.dto.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/reports/dto/report-query.dto.ts#L64-L67)), nhưng Frontend không có ô chọn Đối tác $\rightarrow$ Gọi API luôn báo lỗi `400 Bad Request`.
     - Nút Xuất Excel / PDF ở Frontend gọi `/reports/export/excel` và `/reports/export/pdf` ([reports.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/reports.service.ts#L12)) **không tồn tại ở Backend** (Backend xuất file qua query `?format=xlsx` ngay trên từng endpoint báo cáo và `/reports/payroll/:month/export`).

---

### 1.2. Đề xuất Hệ thống Báo cáo tại `/operations/report`

Để đáp ứng trọn vẹn nhu cầu điều hành xưởng giặt công nghiệp B2B, đề xuất tổ chức Trung tâm Báo cáo thành **2 nhóm (8 loại báo cáo)** có phân quyền theo vai trò (`WAREHOUSE_MANAGER`, `MANAGER`, `ACCOUNTANT`, `ADMIN`):

#### Nhóm A: 6 Báo cáo Vận hành & Đối soát hiện có trên Backend (Chuẩn hóa UI, Bộ lọc & Xuất Excel)
1. **Báo cáo Xuất Nhập Kho (`warehouse-summary`)**:
   - *Bộ lọc:* Khoảng ngày ($\le 31$ ngày), Lọc theo 1 hoặc nhiều Đối tác.
   - *KPI & Bảng:* Tổng đồ bẩn nhận về, Tổng đồ sạch giao đi, Tổng số bao gom, Tổng số phiếu; Bảng chi tiết theo từng mã đồ (`itemCode`).
2. **Báo cáo Đối soát Công nợ Đối tác B2B (`partner-reconciliation`)**:
   - *Bộ lọc:* Khoảng ngày, Chọn Đối tác (Nâng cấp Backend: nếu không chọn `partnerId` tức chọn *"Tất cả đối tác"* thì trả về **Bảng tổng hợp sản lượng & doanh thu của toàn bộ đối tác**; nếu chọn 1 đối tác cụ thể thì trả về bảng chi tiết từng mặt hàng $\times$ đơn giá `priceToCustomer` + danh sách lệch kiểm nhận + lịch sử điều chỉnh).
3. **Báo cáo Chấm công & Giờ công Thợ xưởng (`attendance-summary`)**:
   - *Bộ lọc:* Khoảng ngày, Chọn Thợ xưởng (hoặc Tất cả).
   - *KPI & Bảng:* Tổng nhân sự đi làm, Tổng số ca, Tổng giờ chấm công thực tế, Số ca bất thường (`NEEDS_REVIEW`), Tổng số phút làm việc theo từng khâu (`HourlyWork`).
4. **Báo cáo Hành trình & Chuyến giao Shipper (`shipper-deliveries`)**:
   - *Bộ lọc:* Khoảng ngày, Chọn Tài xế Shipper (hoặc Tất cả).
   - *KPI & Bảng:* Tổng chuyến hoàn tất, Số tài xế hoạt động; Bảng chi tiết mã phiếu, nhà hàng, địa chỉ, giờ giao, trạng thái.
5. **Báo cáo Sai lệch Kiểm đếm & Sự cố Chất lượng (`variance-incidents`)**:
   - *Bộ lọc:* Khoảng ngày, Chọn Đối tác (hoặc Tất cả).
   - *KPI & Bảng 4 sub-tabs:* (1) Phiếu khiếu nại `DISPUTED`, (2) Chênh lệch đếm Đối tác vs Trạm rạch bao xưởng, (3) Đồ rách/hỏng/thất lạc (`defects`), (4) Lịch sử chỉnh sửa phiếu (`edit_marks`).
6. **Báo cáo Chi phí Nhiên liệu & Sửa xe (`fuel-summary`)**:
   - *Bộ lọc:* Khoảng ngày, Chọn Tài xế, Trạng thái duyệt (`ALL` / `PENDING` / `APPROVED` / `REJECTED`).
   - *KPI & Bảng:* Tổng tiền đề xuất, Tổng số Km ODO, Số hóa đơn duyệt/chờ duyệt theo từng tài xế.

#### Nhóm B: 2 Báo cáo Tài chính & Hiệu suất đề xuất mở rộng thêm
7. **Báo cáo Tổng hợp Bảng lương & Chi phí Nhân sự theo Tháng (`payroll-summary` - Kết nối dữ liệu `Payroll` & endpoint `/reports/payroll/:month/export` có sẵn):**
   - *Tác dụng:* Cho phép `ADMIN` và `ACCOUNTANT` xem tổng hợp chi phí lương toàn xưởng theo kỳ tháng (`YYYY-MM`), cơ cấu lương giờ công vs lương cứng vs phụ cấp xăng xe, và xuất trực tiếp file **Excel / PDF Bảng lương tháng** ngay tại Trung tâm báo cáo.
8. **Báo cáo Phân tích Giờ công & Chi phí theo 7 Khâu Sản xuất (`piecework-stage-summary` - Đề xuất thêm):**
   - *Tác dụng:* Thống kê tổng số giờ làm việc, số lượt thợ tham gia và tổng tiền công phân bổ theo 7 khâu chuẩn (Rũ đồ x1.2, Giặt & Sấy x1.3, Gấp x1.0, Đếm/Phân loại x1.1, Là/Ủi x1.2, Đóng gói x1.0, Khác x1.0). Giúp Quản lý xưởng phát hiện khâu nào đang là điểm nghẽn (bottleneck) tiêu tốn nhiều giờ công nhất.

---

### 1.3. Assumptions & Open Questions

- **Assumptions:**
  - Mọi truy cập cũ vào `/management` hoặc `/quan-ly` sẽ được redirect (`<Navigate to="/dashboard" replace />`) để không gây lỗi 404 cho người dùng lưu bookmark cũ.
  - Component `AuditLogPage` (nhật ký hệ thống trước đây nằm trong tab của `/management`) sẽ được tích hợp thành tab `"Nhật Ký Hệ Thống (Audit)"` bên trong trang Quản lý Nhân sự (`/management/manager/personnel`) cho `ADMIN` và `MANAGER`.
- **Open Questions:**
  1. Ở phần **Đề xuất loại báo cáo (Mục 1.2)**, bạn muốn triển khai ngay cả **8 báo cáo** (gồm 6 báo cáo hiện có được làm lại chuẩn + nâng cấp Đối soát Tất cả đối tác + 2 báo cáo mới: *Tổng hợp Bảng lương tháng* & *Phân tích 7 Khâu sản xuất*), hay chỉ tập trung vào nhóm nào trước?
  2. Về việc xóa `/management`, bạn có đồng ý chuyển tab **Nhật ký hệ thống (Audit Logs)** sang nằm trong màn hình **Quản lý Nhân sự (`/management/manager/personnel`)** không?

---

### 1.4. Bảng File Ảnh Hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `fe-react-thanhxuan-internal/src/app/(internal)/management.tsx` | `delete` | Xóa route wrapper của trang `/management` |
| `fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx` | `delete` | Xóa component `ManagementPage` cũ |
| `fe-react-thanhxuan-internal/src/app/router.tsx` | `edit` | Xóa `ManagementHubPage`, chuyển `/management` và `/quan-ly` thành redirect về `/dashboard` |
| `fe-react-thanhxuan-internal/src/components/layout/nav-config.ts` | `edit` | Xóa mục `/management` khỏi Sidebar & Mobile Quick Nav; thay bằng `/operations/report` trên thanh đáy Mobile cho Admin/Manager |
| `fe-react-thanhxuan-internal/src/features/management/auth/StaffManagementPage.tsx` | `edit` | Chuẩn hóa `PageBanner` + `PageActionBar` và tích hợp tab `AuditLogPage` (chuyển từ `/management` sang) |
| `fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx` | `edit` | Viết lại giao diện `/dashboard` theo cấu trúc 4 tầng chuẩn web hiện tại (< 250 dòng) |
| `fe-react-thanhxuan-internal/src/features/dashboard/hooks/useDashboardData.ts` | `add` | Custom hook tổng hợp dữ liệu thời gian thực theo ngày VN cho Dashboard |
| `fe-react-thanhxuan-internal/src/features/dashboard/components/DashboardHandoverPanelComponent.tsx` | `add` | Bảng tiến độ giao nhận 2 chiều, kho sạch & cảnh báo phiếu lệch trên Dashboard |
| `fe-react-thanhxuan-internal/src/features/dashboard/components/DashboardWorkforcePanelComponent.tsx` | `add` | Bảng theo dõi ca chấm công đang mở, công thợ theo giờ (`HourlyWork`) & lối tắt điều hành |
| `be-nestjs-thanhxuan/src/modules/internal/reports/dto/report-query.dto.ts` | `edit` | Cho phép `partnerId` là `@IsOptional()` trong `PartnerReconciliationQueryDto` để hỗ trợ xem tổng hợp tất cả đối tác |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/partner-report.service.ts` | `edit` | Hỗ trợ tổng hợp doanh thu tất cả đối tác khi không truyền `partnerId` |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/excel/partner-excel.service.ts` | `edit` | Hỗ trợ xuất Excel đối soát khi chọn tất cả đối tác hoặc 1 đối tác |
| `fe-react-thanhxuan-internal/src/app/(internal)/operations/report.tsx` | `edit` | Tinh gọn wrapper, chuyển `PageBanner` vào trong `ReportsPage` đồng bộ với các trang khác |
| `fe-react-thanhxuan-internal/src/features/operations/reports/reports.types.ts` | `edit` | Định nghĩa đầy đủ TypeScript interfaces khớp 100% với response thực tế của Backend |
| `fe-react-thanhxuan-internal/src/features/operations/reports/reports.service.ts` | `edit` | Sửa đúng URL xuất file (`?format=xlsx`, `/reports/payroll/:month/export`) và truyền đầy đủ query filter |
| `fe-react-thanhxuan-internal/src/features/operations/reports/useReports.ts` | `edit` | Quản lý state bộ lọc động (khoảng ngày VN, quick presets, `partnerId`, `workerId`, `shipperId`, `month`) |
| `fe-react-thanhxuan-internal/src/features/operations/reports/ReportsPage.tsx` | `edit` | Điều phối giao diện 4 tầng của Trung tâm báo cáo (< 250 dòng) |
| `fe-react-thanhxuan-internal/src/features/operations/reports/components/ReportsFilterBarComponent.tsx` | `add` | Thanh chọn loại báo cáo (Pills) + Bộ lọc ngày VN (Hôm nay, 7 ngày, Tháng này) + Lọc Đối tác/Nhân sự |
| `fe-react-thanhxuan-internal/src/features/operations/reports/components/WarehouseReportSectionComponent.tsx` | `add` | Hiển thị KPIs & Bảng chi tiết báo cáo Xuất nhập kho + Đối soát đối tác |
| `fe-react-thanhxuan-internal/src/features/operations/reports/components/WorkforceReportSectionComponent.tsx` | `add` | Hiển thị KPIs & Bảng chi tiết Chấm công, Công thợ theo khâu, Giao nhận Shipper & Bảng lương |
| `fe-react-thanhxuan-internal/src/features/operations/reports/components/QualityFuelReportSectionComponent.tsx` | `add` | Hiển thị KPIs & Bảng chi tiết Sai lệch/Sự cố (4 sub-tabs) và Chi phí Xăng xe |
| `.agents/docs/CODEBASE_ATLAS.md` | `edit` | Cập nhật bản đồ route & component mới của `/dashboard` và `/operations/report`, xóa `/management` |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | `edit` | Cập nhật kiến trúc màn hình Dashboard và Trung tâm báo cáo |
| `.agents/docs/SRS_SDD.md` | `edit` | Ghi nhận Document History |
| `.agents/docs/CHANGELOG.md` | `edit` | Ghi nhận chi tiết thay đổi Plan 39 |

---

## 2. Technical Approach

### 2.1. Kiến trúc Giao diện 4 Tầng Chuẩn Web Hiện Tại (`fe-react-thanhxuan-internal`)

Cả `/dashboard` và `/operations/report` đều được tái cấu trúc nghiêm ngặt theo bố cục 4 tầng đang áp dụng tại `WarehouseHandoverPage` và `PartnersManagementPage`:

- **Tầng 1 (`PageBanner`)**: Hiển thị Icon phân hệ, `tagline` in hoa, `title`, `description`, và cụm nút thao tác chính bên phải (ví dụ: Bộ chọn ngày nhanh Hôm qua / Hôm nay / Ngày mai trên Dashboard; nút Làm mới / Xuất Excel / Xuất PDF trên trang Báo cáo).
- **Tầng 2 (`PageActionBar`)**: Thanh chuyển đổi chế độ xem dạng Segmented Pill Tabs (`bg-slate-100 dark:bg-slate-950 p-1 rounded-xl`) có đếm badge số lượng.
- **Tầng 3 (Filter & Quick KPIs)**:
  - Bộ lọc ngữ cảnh chuẩn múi giờ `Asia/Ho_Chi_Minh` (`getTodayVN`, `formatDateVN`).
  - Lưới 4 thẻ `StatCard` hiển thị chỉ số tổng hợp theo thời gian thực.
- **Tầng 4 (Data Panels / Specialized Tables)**: Chia thành các sub-components độc lập dưới 250 dòng/file, hiển thị đúng các cột nghiệp vụ thực tế và hỗ trợ responsive trên cả Desktop lẫn Mobile PWA.

### 2.2. Chuẩn hóa Data Contract giữa Frontend & Backend cho `/operations/report`

```typescript
// Minh họa cấu trúc Type chuẩn hóa tại reports.types.ts
export type ReportType =
  | 'warehouse-summary'
  | 'partner-reconciliation'
  | 'attendance-summary'
  | 'piecework-stage-summary'
  | 'shipper-deliveries'
  | 'variance-incidents'
  | 'fuel-summary'
  | 'payroll-summary';

export interface WarehouseSummaryResponse {
  from: string;
  to: string;
  items: Array<{ itemCode: string; totalDirtyReceived: number; totalCleanDelivered: number }>;
  summary: { totalDirty: number; totalClean: number; totalBags: number; totalCleanKg: number; totalRecords: number };
}
```

- **Sửa cơ chế xuất file (`reports.service.ts`):**
  - Với 6 báo cáo vận hành: Gọi `GET /reports/${type}?from=${from}&to=${to}&format=xlsx` (kèm `partnerId`, `workerId`, `shipperId` nếu có) với `responseType: 'blob'`.
  - Với báo cáo Bảng lương tháng: Gọi `GET /reports/payroll/${month}/export?format=${xlsx|pdf}` với `responseType: 'blob'`.

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Xóa `/management` & Chuẩn hóa Điều hướng
- [x] **T1**: `[StaffManagementPage.tsx]` - Bổ sung `PageBanner` và tab chuyển đổi `"Danh Sách Nhân Sự"` / `"Nhật Ký Hệ Thống (Audit)"` (nhúng `AuditLogPage`) để bảo toàn tính năng Audit trước khi xóa `/management` - Depends on: none
- [x] **T2**: `[management.tsx, ManagementPage.tsx, router.tsx, nav-config.ts]` - Xóa file `src/app/(internal)/management.tsx` và `src/features/management/ManagementPage.tsx`; cập nhật `router.tsx` redirect `/management` và `/quan-ly` về `/dashboard`; xóa mục `/management` trong `nav-config.ts` - Depends on: T1

### Giai đoạn 2: Thiết kế lại `/dashboard` theo chuẩn giao diện mới
- [x] **T3**: `[useDashboardData.ts]` - Tạo custom hook lấy dữ liệu tổng hợp theo ngày chuẩn VN (`getTodayVN()`, hỗ trợ chuyển ngày Hôm qua / Hôm nay / Ngày mai): danh sách `handovers`, `piecework/report` (tính đúng tổng giờ công `minutesWorked / 60`), `attendance`, số lượng yêu cầu chờ duyệt - Depends on: none
- [x] **T4**: `[DashboardHandoverPanelComponent.tsx, DashboardWorkforcePanelComponent.tsx]` - Xây dựng 2 panel chi tiết: (1) Tiến độ giao nhận 2 chiều, tỷ lệ hoàn thành & danh sách phiếu cần chú ý (`DISPUTED`, `IN_TRANSIT`, `SCHEDULED`); (2) Năng suất giờ công thợ xưởng theo khâu, trạng thái chấm công và Bảng lối tắt điều hành nhanh (Quick Access Hub) - Depends on: T3
- [x] **T5**: `[DashboardPage.tsx]` - Viết lại trang `/dashboard` theo bố cục 4 tầng (`PageBanner` + `PageActionBar` chọn tab *Tổng quan Vận hành* / *Cần xử lý & Phê duyệt* / *Lối tắt Quản trị* + 4 `StatCard` + Panels) - Depends on: T3, T4

### Giai đoạn 3: Nâng cấp Backend & Viết lại `/operations/report`
- [x] **T6**: `[report-query.dto.ts, partner-report.service.ts, partner-excel.service.ts]` - Cho phép `partnerId` là tùy chọn (`@IsOptional()`) trong báo cáo Đối soát đối tác; khi không truyền `partnerId`, trả về bảng tổng hợp sản lượng & doanh thu của toàn bộ đối tác hoạt động trong kỳ - Depends on: none
- [x] **T7**: `[reports.types.ts, reports.service.ts, useReports.ts]` - Cập nhật đầy đủ kiểu dữ liệu khớp response Backend, sửa hàm `exportFile` gọi đúng `?format=xlsx` và `/reports/payroll/:month/export`, bổ sung state lọc theo đối tác, nhân sự, tài xế, kỳ lương và các nút chọn nhanh khoảng ngày (Hôm nay, 7 ngày, Tháng này, Tháng trước) - Depends on: T6
- [x] **T8**: `[ReportsFilterBarComponent.tsx]` - Tạo component thanh chọn loại báo cáo dạng Pill Tabs theo quyền RBAC + thanh công cụ lọc ngày & lọc đối tượng động theo từng loại báo cáo - Depends on: T7
- [x] **T9**: `[WarehouseReportSectionComponent.tsx, WorkforceReportSectionComponent.tsx, QualityFuelReportSectionComponent.tsx]` - Tạo 3 bộ component hiển thị thẻ `StatCard` tổng hợp và bảng dữ liệu đúng cột nghiệp vụ cho từng loại báo cáo (Kho, Đối soát B2B, Chấm công, Phân tích khâu công thợ, Giao nhận Shipper, Sự cố 4 sub-tabs, Xăng xe, Bảng lương kỳ) - Depends on: T7
- [x] **T10**: `[ReportsPage.tsx, report.tsx]` - Lắp ráp giao diện Trung tâm báo cáo hoàn chỉnh với `PageBanner`, `ReportsFilterBarComponent` và các Section hiển thị tương ứng - Depends on: T8, T9

### Giai đoạn 4: Kiểm thử, Đồng bộ Tài liệu & Commit
- [x] **T11**: Kiểm tra lint, typecheck, test và build trên cả `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal` - Depends on: T2, T5, T10
- [x] **T12**: Đồng bộ tài liệu tại `.agents/docs/CODEBASE_ATLAS.md`, `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`, `.agents/docs/SRS_SDD.md`, và `.agents/docs/CHANGELOG.md` - Depends on: T11
- [x] **T13**: Tự động commit và push lên nhánh `dev` - Depends on: T12

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm증 tự động
- **Backend (`be-nestjs-thanhxuan/`):**
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
  - `pnpm test`
  - `pnpm build`
- **Frontend Internal (`fe-react-thanhxuan-internal/`):**
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
  - `pnpm build`

### 4.2. Kịch bản kiểm thử thực tế (Happy Path & Edge Cases)
1. **Xóa `/management`:**
   - Sidebar và Mobile Bottom Bar không còn mục `"Cổng Điều Hành Xưởng" (/management)`.
   - Truy cập trực tiếp URL `/management` hoặc `/quan-ly` tự động chuyển hướng mượt về `/dashboard`.
   - Tab `"Nhật Ký Hệ Thống (Audit)"` hiển thị và hoạt động bình thường trong `/management/manager/personnel`.
2. **Giao diện `/dashboard` mới:**
   - Hiển thị chuẩn `PageBanner`, chuyển đổi ngày (Hôm qua / Hôm nay / Ngày mai) chuẩn múi giờ Việt Nam.
   - Thẻ KPI Công thợ hiển thị đúng **số giờ công** (ví dụ `14.5 giờ`) và thu nhập tạm tính (nếu có quyền `PAY_VIEW`), không còn hiển thị nhầm phút thành `"chiếc"`.
3. **Giao diện `/operations/report` mới:**
   - Chọn từng loại báo cáo đều hiển thị đúng thẻ `StatCard` tổng quan và bảng dữ liệu chi tiết đúng cột (không còn bị trống bảng).
   - Chọn báo cáo Đối soát đối tác với chế độ *"Tất cả đối tác"* và chế độ *"Chọn 1 đối tác"* đều trả về dữ liệu chính xác, không bị lỗi 400.
   - Bấm **Xuất Excel** tải về đúng file `.xlsx` từ Backend streaming; báo cáo Bảng lương tải được cả `.xlsx` và `.pdf`.

---

## 5. Risks & Rollback

| Rủi ro | Mức độ | Phương án giảm thiểu & Rollback |
| :--- | :---: | :--- |
| Người dùng cũ lưu bookmark `/management` | Thấp | Giữ route redirect `<Navigate to="/dashboard" replace />` trong `router.tsx`. |
| Khoảng thời gian báo cáo vượt 31 ngày gây lỗi 400 từ Backend | Thấp | Validate ngay trên UI (`isDateRangeValid`), khóa nút Xuất file và hiển thị cảnh báo kèm các nút chọn nhanh (Hôm nay, 7 ngày, Tháng này). |
| Lộ thông tin tiền/lương với vai trò `WAREHOUSE_MANAGER` hoặc `MANAGER` | Trung bình | Kết hợp `PayFieldFilterInterceptor` sẵn có ở Backend và kiểm tra `canViewPay = hasPermission(role, PERMISSIONS.PAY_VIEW)` trên Frontend để ẩn các cột đơn giá/thành tiền khi không có quyền. |

## Changelog

- 2026-10-26: Khởi tạo Plan 39 (Xóa `/management`, thiết kế lại `/dashboard` và `/operations/report` kèm đề xuất hệ thống báo cáo).
