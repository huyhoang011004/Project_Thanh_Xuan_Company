# Plan 48: Chuẩn Hóa Khoảng Cách Spacing Mobile Toàn Diện & Tối Ưu Giao Diện Phân Hệ Điều Hành, Kinh Doanh, Bảng Công và Bảng Lương (fe-react-thanhxuan-internal)

> Status: Done | Created: 2026-10-28

## 1. Overview & Affected Files

### 1.1. Mục tiêu
- **Chuẩn hóa Spacing Mobile toàn diện cho mọi Page**: Khắc phục triệt để tình trạng các component dính sát vào nhau hoặc khoảng cách quá thưa trên mobile do dùng `sm:space-y-3` (khiến mobile `< 640px` bị `space-y-0`) hoặc `space-y-6` cồng kềnh. Chuẩn hóa toàn bộ container chính của tất cả các page về `space-y-3` (~12px, chuẩn mực 1 đơn vị công thái học di động PWA).
- **Tối ưu giao diện Mobile phân hệ Bảng Chấm Công (`attendance`)**: Tách bộ lọc ngày tháng ra khỏi `PageBanner` (vốn bị `hideOnMobile = true` che khuất), xây dựng thanh điều hướng ngày độc lập trên mobile (tương tự như `WarehouseDateHeaderComponent`), tối ưu thanh tabs trạng thái trượt ngang không thanh cuộn và lưới 4 StatCard KPI gọn gàng 2 cột.
- **Tối ưu giao diện Mobile phân hệ Bảng Công Thợ Theo Khâu (`piecework`)**: Chuẩn hóa Banner theo `PageBanner`, chuyển đổi Tab bar sang container `rounded-xl p-1` hiện đại, tối ưu bộ chọn ngày và bảng danh sách thợ xưởng chốt công theo ngày trên mobile.
- **Tối ưu giao diện Mobile phân hệ Bảng Lương Chu Kỳ (`payroll`)**: Đưa bộ chọn kỳ lương tháng (`<input type="month">`) kèm nút chuyển tháng mượt mà ra ngoài `PageBanner` để hiển thị trọn vẹn trên mobile; tối ưu toolbar xuất Excel / tính lương / chốt sổ và bảng chi tiết lương dạng danh thiếp mobile.
- **Tối ưu giao diện Mobile phân hệ Quản Trị Đối Tác & Bảng Giá (`partners`)**: Tinh chỉnh Action Bar 3 tab, bộ lọc thương hiệu/trạng thái hàng ngang compact, thẻ đối tác và danh mục đồ giặt touch target chuẩn.
- **Tối ưu giao diện Mobile phân hệ Duyệt Xăng Xe (`fuel`) & Cài Đặt Xưởng Wi-Fi (`workshop`) & Nhân Sự/Phê Duyệt (`auth`)**: Nâng cấp thẻ giao diện phẳng sang chuẩn mực Design System thống nhất.

### 1.2. Out of scope
- Không thay đổi Business Logic, DTO hay API hợp đồng với Backend (`be-nestjs-thanhxuan`).
- Không thay đổi quyền hạn người dùng (RBAC) hay schema cơ sở dữ liệu.

### 1.3. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `fe-react-thanhxuan-internal/src/features/management/attendance/components/AttendanceDateHeaderComponent.tsx` | Add | Thanh chọn ngày di động độc lập (Prev / Date Picker / Next / Hôm nay / Làm mới) hiển thị 100% trên cả mobile và desktop |
| `fe-react-thanhxuan-internal/src/features/management/attendance/AttendanceReviewPage.tsx` | Edit | Thay thế `sm:space-y-3` bằng `space-y-3`, tích hợp `AttendanceDateHeaderComponent`, tối ưu tabs và KPI cards |
| `fe-react-thanhxuan-internal/src/features/management/piecework/HourlyWorkReviewPage.tsx` | Edit | Thay thế `sm:space-y-3` bằng `space-y-3`, chuẩn hóa `PageBanner` & tabs bar, tối ưu mobile |
| `fe-react-thanhxuan-internal/src/features/management/piecework/components/DailyWorkReviewComponent.tsx` | Edit | Tối ưu bộ lọc ngày, nút duyệt công và danh sách công thợ theo khâu trên mobile |
| `fe-react-thanhxuan-internal/src/features/management/payroll/components/PayrollMonthHeaderComponent.tsx` | Add | Thanh chọn kỳ lương di động độc lập (Tháng trước / Month Picker / Tháng sau / Tháng này / Làm mới) |
| `fe-react-thanhxuan-internal/src/features/management/payroll/PayrollManagementPage.tsx` | Edit | Thay thế `sm:space-y-3` bằng `space-y-3`, tích hợp `PayrollMonthHeaderComponent`, lưới KPI 2 cột |
| `fe-react-thanhxuan-internal/src/features/management/payroll/components/PayrollActionToolbarComponent.tsx` | Edit | Tối ưu hàng nút thao tác (Tính lương, Chốt sổ, Xuất Excel) co giãn thông minh trên mobile |
| `fe-react-thanhxuan-internal/src/features/management/partners/PartnersManagementPage.tsx` | Edit | Chuẩn hóa `space-y-3`, tối ưu khoảng cách giữa Banner, ActionBar, Filter và Card Grid |
| `fe-react-thanhxuan-internal/src/features/management/partners/components/PartnersActionBarComponent.tsx` | Edit | Tối ưu chiều cao tab bar và các nút thêm mới trên mobile |
| `fe-react-thanhxuan-internal/src/features/management/partners/components/PartnersPartnerFilterComponent.tsx` | Edit | Tối ưu hàng lọc thương hiệu/trạng thái compact trên màn hình nhỏ |
| `fe-react-thanhxuan-internal/src/features/management/fuel/FuelReviewPage.tsx` | Edit | Chuẩn hóa bố cục `space-y-3`, tích hợp `PageBanner`, tối ưu thẻ phiếu duyệt xăng/sửa xe trên mobile |
| `fe-react-thanhxuan-internal/src/features/management/workshop/WorkshopSettingsPage.tsx` | Edit | Đổi `space-y-6` thành `space-y-3`, chuẩn hóa `PageBanner`, tinh gọn ô nhập GPS và IP Wi-Fi |
| `fe-react-thanhxuan-internal/src/features/management/auth/StaffManagementPage.tsx` | Edit | Đổi `space-y-6` thành `space-y-3`, tối ưu tabs chọn phân loại nhân sự trên mobile |
| `fe-react-thanhxuan-internal/src/features/management/auth/ApprovalManagementPage.tsx` | Edit | Chuẩn hóa layout container `space-y-3`, tối ưu 2 nút Duyệt/Từ chối trên mobile |
| `fe-react-thanhxuan-internal/src/features/management/auth/AuditLogPage.tsx` | Edit | Chuẩn hóa layout container `space-y-3`, tối ưu hiển thị danh sách nhật ký kiểm toán |
| `fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx` | Edit | Đổi `space-y-6` thành `space-y-3 sm:space-y-4` |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/WarehouseHandoverPage.tsx` | Edit | Chuẩn hóa `space-y-3` cấp page container |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/RecountStationPage.tsx` | Edit | Chuẩn hóa `space-y-3` cấp page container |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/ShipperHandoverPage.tsx` | Edit | Chuẩn hóa `space-y-3` cấp page container |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/PartnerHandoverPage.tsx` | Edit | Chuẩn hóa `space-y-3` cấp page container |
| `fe-react-thanhxuan-internal/src/features/operations/piecework/HourlyWorkStationPage.tsx` | Edit | Chuẩn hóa `space-y-3` cấp page container |
| `fe-react-thanhxuan-internal/src/features/operations/attendance/AttendancePage.tsx` | Edit | Chuẩn hóa `space-y-3` cấp page container |
| `fe-react-thanhxuan-internal/src/features/operations/fuel/ShipperFuelPage.tsx` | Edit | Chuẩn hóa `space-y-3` cấp page container |
| `fe-react-thanhxuan-internal/src/features/operations/payroll/MyPayslipPage.tsx` | Edit | Chuẩn hóa `space-y-3` cấp page container |
| `fe-react-thanhxuan-internal/src/features/operations/reports/ReportsPage.tsx` | Edit | Chuẩn hóa `space-y-3` cấp page container |
| `.agents/docs/CODEBASE_ATLAS.md` | Edit | Cập nhật cấu trúc component mới `AttendanceDateHeaderComponent`, `PayrollMonthHeaderComponent` |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | Edit | Cập nhật đặc tả giao diện mobile-first phân hệ quản lý và spacing chuẩn |
| `CHANGELOG.md` | Edit | Ghi nhận hoàn thành Plan 48 |

---

## 2. Technical Approach

### 2.1. Chuẩn Hóa Spacing Cấp Page (Page Container Spacing)
- **Hiện trạng (`path:line`)**:
  - Hầu hết các file `WarehouseHandoverPage.tsx:62`, `RecountStationPage.tsx:38`, `AttendanceReviewPage.tsx:81`, `PayrollManagementPage.tsx:64`, `PartnersManagementPage.tsx:81` dùng `sm:space-y-3`. Khi ở màn hình mobile (`width < 640px`), CSS của `sm:space-y-3` là không có hiệu lực, dẫn đến khoảng cách giữa các khối tầng 1 (Banner), tầng 2 (Action Bar), tầng 3 (Filter), tầng 4 (Content) bằng `0px` (trừ khi phần tử con có margin riêng).
  - Một số trang như `StaffManagementPage.tsx:71`, `DashboardPage.tsx:48`, `WorkshopSettingsPage.tsx:146` dùng `space-y-6` (24px) - gây tốn nhiều diện tích cuộn vô ích trên mobile.
- **Quy chuẩn mới**:
  - Toàn bộ page container dùng lớp chuẩn:
    ```tsx
    <div className="space-y-3 max-w-7xl mx-auto pb-24 transition-all">
    ```
  - Giá trị `space-y-3` tương đương `12px` (khoảng 0.75rem ~ 1 đơn vị công thái học), tạo nhịp thở đều đặn, sắc sảo giữa các card và tầng điều khiển.

### 2.2. Giải Cứu Bộ Lọc Ngày & Kỳ Lương Trên Mobile
- **Vấn đề cốt lõi**: `PageBanner` có thuộc tính mặc định `hideOnMobile = true` (`PageBanner.tsx:31-36`). Ở `AttendanceReviewPage.tsx:88` và `PayrollManagementPage.tsx:71`, bộ chọn ngày và kỳ lương lại được bọc bên trong `children` của `PageBanner`. Khi người dùng xem trên điện thoại, toàn bộ `PageBanner` bị ẩn (`hidden sm:flex`), khiến người quản lý/kế toán không thể chọn ngày khác hoặc chọn kỳ lương khác trên mobile!
- **Giải pháp**:
  - Tách bộ lọc ngày thành `AttendanceDateHeaderComponent` và bộ chọn kỳ lương thành `PayrollMonthHeaderComponent` độc lập (pattern đã áp dụng rất thành công ở `WarehouseDateHeaderComponent.tsx:24-86` của trạm kho sạch).
  - Vị trí: Đặt ngay bên dưới `PageBanner` (khi desktop thì hiển thị dưới banner; khi mobile thì banner ẩn, thanh chọn ngày này sẽ đứng ngay trên đầu màn hình cực kỳ tiện lợi và nổi bật).

### 2.3. Tối Ưu Mobile Cho Phân Hệ Quản Lý (Management UX)
- **Status Tabs**:
  - Luôn có container `overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden`, flex shrink-0 cho từng tab button để không bị bóp méo chữ trên màn hình nhỏ.
- **KPI StatCards**:
  - Chuyển toàn bộ từ 1 cột sang 2 cột trên mobile: `grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4`.
- **Nút Thao Tác (Action Buttons)**:
  - Chiều cao touch target chuẩn `h-9` hoặc `h-10`, bo góc mềm mại `rounded-xl`, chữ ngắn gọn hoặc ẩn icon/chữ bổ trợ trên mobile với `hidden sm:inline`.

---

## 3. Implementation Tasks (Checklist)

- [x] T1: Tạo `AttendanceDateHeaderComponent.tsx` tại `src/features/management/attendance/components/` với đầy đủ nút lùi ngày, tiến ngày, ô input date `font-mono`, nút "Hôm nay" và "Làm mới" - Depends on: none
- [x] T2: Cập nhật `AttendanceReviewPage.tsx`: đưa `AttendanceDateHeaderComponent` ra ngoài `PageBanner`, đổi container thành `space-y-3`, kiểm tra hiển thị status tabs và StatCards 2 cột - Depends on: T1
- [x] T3: Tạo `PayrollMonthHeaderComponent.tsx` tại `src/features/management/payroll/components/` với đầy đủ nút lùi tháng, tiến tháng, ô input month, nút "Tháng này" và "Làm mới" - Depends on: none
- [x] T4: Cập nhật `PayrollManagementPage.tsx`: đưa `PayrollMonthHeaderComponent` ra ngoài `PageBanner`, đổi container thành `space-y-3`, chuyển 4 thẻ KPI sang `grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4` - Depends on: T3
- [x] T5: Tối ưu `PayrollActionToolbarComponent.tsx`: xếp hàng nút tính lương, chốt sổ, xuất Excel linh hoạt trên mobile không tràn viền - Depends on: T4
- [x] T6: Cập nhật `HourlyWorkReviewPage.tsx`: thay thế header card bằng `PageBanner`, đổi container thành `space-y-3`, chuẩn hóa tabs switch và tối ưu `DailyWorkReviewComponent.tsx` trên mobile - Depends on: none
- [x] T7: Tối ưu `PartnersManagementPage.tsx`, `PartnersActionBarComponent.tsx`, `PartnersPartnerFilterComponent.tsx`: chuẩn hóa container `space-y-3`, tinh gọn tab bar 3 cột và bộ lọc thương hiệu/trạng thái trên mobile - Depends on: none
- [x] T8: Tối ưu `FuelReviewPage.tsx`: đưa vào layout chuẩn `space-y-3`, bổ sung `PageBanner` (ẩn trên mobile), thiết kế card duyệt xăng/sửa xe với nút Duyệt (xanh) và Từ chối (đỏ) to rõ, xem ảnh ODO sắc nét - Depends on: none
- [x] T9: Tối ưu `WorkshopSettingsPage.tsx`: chuyển container sang `space-y-3`, thay header card thô bằng `PageBanner`, giảm padding các card Geofencing, Wi-Fi và Security Policy trên mobile - Depends on: none
- [x] T10: Tối ưu `StaffManagementPage.tsx`, `ApprovalManagementPage.tsx`, `AuditLogPage.tsx`: đổi container sang `space-y-3`, tối ưu tabs nhóm nhân sự và danh sách phê duyệt tài khoản - Depends on: none
- [x] T11: Cập nhật `DashboardPage.tsx`: đổi `space-y-6` thành `space-y-3 sm:space-y-4`, kiểm tra độ giãn cách giữa các hàng KPI và quick action - Depends on: none
- [x] T12: Quét toàn bộ các page phân hệ vận hành xưởng (`WarehouseHandoverPage`, `RecountStationPage`, `ShipperHandoverPage`, `PartnerHandoverPage`, `HourlyWorkStationPage`, `AttendancePage`, `ShipperFuelPage`, `MyPayslipPage`, `ReportsPage`): đổi `sm:space-y-3` thành `space-y-3` để đảm bảo mobile cách nhau đều đặn đúng 1 đơn vị - Depends on: none
- [x] T13: Chạy lint, typecheck và build cho `fe-react-thanhxuan-internal` - Depends on: T1-T12
- [x] T14: Đồng bộ 5 trụ cột tài liệu (`CODEBASE_ATLAS.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`), tự động commit và push lên nhánh `dev` - Depends on: T13

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm thử
Thực thi tại thư mục `fe-react-thanhxuan-internal/`:
- **Lint**: `pnpm lint`
- **Typecheck**: `pnpm exec tsc --noEmit`
- **Build**: `pnpm build`

### 4.2. Kịch bản kiểm chứng thực tế
1. **Kiểm tra Spacing trên Viewport Mobile (375px - 430px)**:
   - Khoảng cách giữa Header, Date Bar, Tab Bar, StatCards và danh sách nội dung ở mọi trang đều đạt đúng ~12px (`space-y-3`), không có vùng nào bị dính chặt vào nhau hoặc cách xa 24-32px.
2. **Kiểm tra Bảng Chấm Công (`/attendance-review`) trên mobile**:
   - Thanh chọn ngày hiển thị rõ ràng ngay đầu trang, bấm `<` lùi ngày, `>` tiến ngày, bấm `Hôm nay` về ngày hiện tại tức thì.
   - Status tabs cuộn ngang mượt mà, bấm chuyển tab lọc chính xác.
   - 4 StatCards xếp 2x2 cân đối, số lượng hiển thị đầy đủ không tràn khung.
3. **Kiểm tra Bảng Lương (`/payroll-review`) trên mobile**:
   - Thanh chọn kỳ lương hiển thị input tháng, lùi/tiến tháng mượt mà.
   - Lưới KPI hiển thị 4 chỉ số tài chính/nhân sự gọn gàng.
   - Các nút chức năng tính toán, chốt sổ, mở khóa dễ thao tác.
4. **Kiểm tra Bảng Công Thợ (`/hourly-work-review`) trên mobile**:
   - Tab chuyển đổi giữa Duyệt công theo ngày, Phân khâu mặc định, Cài đặt đơn giá hiển thị sắc nét.
5. **Kiểm tra Quản Trị Đối Tác (`/partners`) trên mobile**:
   - Tab chuyển giữa Đối tác, Danh mục đồ, Thương hiệu hoạt động mượt mà.
   - Thẻ cơ sở đối tác và danh mục đồ giặt hiển thị đầy đủ thông tin, nút bấm không bị che khuất.

---

## 5. Risks & Rollback

- **Rủi ro**: Việc thay đổi `sm:space-y-3` thành `space-y-3` có thể làm tăng nhẹ khoảng cách trên màn hình mobile ở một số ít phần tử đã có margin top cục bộ.
- **Biện pháp giảm thiểu**: Rà soát các component con trực tiếp của từng page, loại bỏ các `mt-4` hay `mb-4` thừa thãi để đảm bảo khoảng cách duy nhất được điều phối bởi `space-y-3` của page container.
- **Phương án rollback**: Rollback commit git tương ứng trên nhánh `dev`.

---

## Changelog

- 2026-10-28: Khởi tạo Plan 48 chuẩn hóa khoảng cách spacing mobile toàn diện và tối ưu UX các màn hình điều hành, kinh doanh, bảng công, bảng lương.
- 2026-10-28: Hoàn thành thực thi 14/14 tasks, typecheck & build pass 100%, đồng bộ 5 trụ cột tài liệu và sẵn sàng commit/push nhánh dev.
