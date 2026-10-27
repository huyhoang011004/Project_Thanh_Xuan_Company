# Plan 44: Chuẩn Hóa Clean Code (Giai Đoạn P2) — Chia Nhỏ Toàn Bộ File Vượt Ngưỡng (< 250-300 Dòng), Tách Custom Hooks & Loại Bỏ Triệt Để Kiểu `any` (`core`, `internal`, `fe-react-thanhxuan-internal`)

> Status: Complete | Created: 2026-10-27 | Depends on: Plan 43 | Target: `be-nestjs-thanhxuan` (`src/modules/core`, `src/modules/internal`) & `fe-react-thanhxuan-internal` (`src/`)

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Phạm vi (Scope)
Thực thi trọn vẹn **Giai đoạn P2** ngay sau khi hoàn tất [Plan 43](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/plans/plan43.md) nhằm đưa 3 thư mục `be-nestjs-thanhxuan/src/modules/core`, `be-nestjs-thanhxuan/src/modules/internal` và `fe-react-thanhxuan-internal/src` đạt chuẩn 100% theo quy ước kỹ thuật tại `AGENTS.md` (Mục 4.9, 5.1, 5.3, 8.1 - 8.5):

1. **Chia nhỏ 10 file Backend vượt ngưỡng 300 dòng (`src/modules/internal`):**
   - Tách các "god-service" lớn như `handover-record.service.ts` (`1268 dòng`), `payroll.service.ts` (`745 dòng`), `attendance.service.ts` (`637 dòng`), `account-auth.service.ts` (`615 dòng`), `account-management.service.ts` (`403 dòng`), `job-segment.service.ts` (`400 dòng`), `partner-report.service.ts` (`386 dòng`), `handover-flow.service.ts` (`382 dòng`), `handover.controller.ts` (`404 dòng`), `handover-state.ts` (`362 dòng`) thành các service chuyên trách / helper thuần túy (`< 250-300 dòng/file`).
2. **Chia nhỏ 28 file Frontend vượt ngưỡng 300 dòng & Tách Custom Hooks (`fe-react-thanhxuan-internal/src`):**
   - Tách logic state, `useQuery`, `useMutation`, xử lý Canvas/ảnh ra Custom Hooks `hooks/use[Tên].ts`.
   - Chia nhỏ các "god-component" và helper lớn như `HandoverExportHelper.ts` (`1022 dòng`), `PartnerReceiptTabComponent.tsx` (`661 dòng`), `ShipperHandoverItemCardComponent.tsx` (`655 dòng`), `HandoverSlipGalleryComponent.tsx` (`585 dòng`), `PrepOrderModal.tsx` (`571 dòng`), `ShipperHandoverPage.tsx` (`558 dòng`), `PartnerHistoryTabComponent.tsx` (`548 dòng`), `PartnerCountTabComponent.tsx` (`523 dòng`), `ShipperHistoryTabComponent.tsx` (`512 dòng`)... thành các sub-components chuẩn mực (`components/[Tên]Component.tsx`, `modals/[Tên]Modal.tsx`, `< 250-300 dòng/file`).
3. **Loại bỏ 100% kiểu `any` (TypeScript Strict Mode) & Dọn dẹp toàn bộ Re-export / Redirect cũ:**
   - Thay thế toàn bộ 41 vị trí dùng `: any`, `as any`, `<any>` ở Frontend và các vị trí `@CurrentUser() user: any` / `@Req() req: any` ở Backend bằng interface/type tường minh (`AuthenticatedStaffUser`, `HandoverSignatureMap`, `StaffAccountResponse`, `AuditLogItem`...).
   - Xóa bỏ 17 re-export aliases tương thích ngược ở Frontend, dọn gọn 200 dòng route redirect cũ trong `router.tsx` và hoàn thiện/dọn dẹp cronjob placeholder trong `schedule-task.service.ts`.

### 1.2. Out of Scope & Assumptions
- **Out of Scope:** Không thay đổi schema MongoDB hay phá vỡ API Contract đã được khóa ở Plan 43; chỉ thực hiện trong phạm vi 3 thư mục `be-nestjs-thanhxuan/src/modules/core`, `be-nestjs-thanhxuan/src/modules/internal`, `fe-react-thanhxuan-internal/src` và cập nhật tài liệu `.agents/docs/`.
- **Assumptions:** Thực thi tuần tự sau khi Plan 43 đã hoàn tất để không xảy ra xung đột merge (merge conflict) trên các file dùng chung.

---

### 1.3. Bảng File Ảnh Hưởng (Affected Files)

#### A. Backend (`be-nestjs-thanhxuan/src/modules/core` & `src/modules/internal`)

| Path | Action | Lý do |
| :--- | :--- | :--- |
| `be-nestjs-thanhxuan/src/modules/core/schedule/schedule-task.service.ts` | `edit` | Dọn dẹp cronjob placeholder rỗng (`line 55-71`) và chuẩn hóa kiểu dữ liệu strict. |
| `be-nestjs-thanhxuan/src/modules/internal/common/interfaces/authenticated-user.interface.ts` | `add` | Định nghĩa interface `AuthenticatedStaffUser` chuẩn cho `@CurrentUser()` thay thế toàn bộ `user: any` và `@Req() req: any` trong các Controller. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts` | `edit` | Giảm từ `1268 dòng` xuống `< 280 dòng` bằng cách tách các nhóm nghiệp vụ sang 4 sub-services/helpers chuyên biệt bên dưới (`line 1-1268`). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-clean-prep.service.ts` | `add` | Chứa logic lập phiếu đồ sạch (`PrepOrder`), tự động khởi tạo phiếu hàng ngày (`autoCreateDailyHandovers`) và khóa đồ sạch. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-dirty-signature.service.ts` | `add` | Chứa logic cập nhật số lượng đồ bẩn (`dirty-item-onblur`, `dirty-items`), chữ ký đối tác và xác nhận của tài xế (`line 891-1159` của `handover-record.service.ts`). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-slip-media.service.ts` | `add` | Chứa logic quản lý ảnh phiếu giao nhận (`uploadSlipImage`, xóa đè ảnh cũ local/Cloudinary, thư viện ảnh phiếu). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/helpers/handover-query.helper.ts` | `add` | Chứa logic build filter truy vấn, phân trang và mapping dữ liệu phiếu giao nhận. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-flow.service.ts` | `edit` | Tách các bước kiểm tra điều kiện chuyển trạng thái sang helper để giảm từ `382 dòng` xuống `< 250 dòng` (`line 1-382`). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/state-machine/handover-state.ts` | `edit` | Tách bảng quy tắc chuyển trạng thái (`TRANSITION_RULES`) sang `handover-transition-rules.ts` để giảm từ `362 dòng` xuống `< 220 dòng` (`line 1-362`). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/state-machine/handover-transition-rules.ts` | `add` | Lưu trữ cấu hình ma trận chuyển trạng thái và quyền hạn tương ứng. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts` | `edit` | Chuẩn hóa kiểu `@CurrentUser() user: AuthenticatedStaffUser`, rút gọn từ `404 dòng` xuống `< 280 dòng` (`line 1-404`). |
| `be-nestjs-thanhxuan/src/modules/internal/payroll/payroll.service.ts` | `edit` | Giảm từ `745 dòng` xuống `< 260 dòng` bằng cách tách logic tính toán chi tiết và tạo kỳ lương sang helper/sub-service (`line 1-745`). |
| `be-nestjs-thanhxuan/src/modules/internal/payroll/helpers/payroll-calculator.helper.ts` | `add` | Chứa các hàm tính toán thuần túy (ngày công, giờ công thợ, phụ cấp chuyến tài xế, khấu trừ) tách từ `payroll.service.ts`. |
| `be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.service.ts` | `edit` | Giảm từ `637 dòng` xuống `< 270 dòng` bằng cách tách logic cấu hình xưởng/GPS/IP và tự động check-in tài xế (`line 1-637`). |
| `be-nestjs-thanhxuan/src/modules/internal/attendance/services/workshop-config.service.ts` | `add` | Quản lý cấu hình tọa độ GPS xưởng, khoảng cách Haversine và xác thực IP Wi-Fi tách từ `attendance.service.ts`. |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-auth.service.ts` | `edit` | Giảm từ `615 dòng` xuống `< 270 dòng` bằng cách tách logic OTP & Email template sang `account-otp.service.ts` (`line 1-615`). |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-otp.service.ts` | `add` | Quản lý sinh mã OTP (`crypto.randomInt`), kiểm tra cooldown, xác thực OTP và gửi email HTML đã escape. |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-management.service.ts` | `edit` | Giảm từ `403 dòng` xuống `< 260 dòng` bằng cách tách helper kiểm tra phân cấp vai trò và chuẩn hóa dữ liệu trả về (`line 1-403`). |
| `be-nestjs-thanhxuan/src/modules/internal/auth/helpers/account-Hierarchy.helper.ts` | `add` | Kiểm tra phân cấp quyền (`Role Hierarchy`) và loại bỏ trường nhạy cảm khỏi account object. |
| `be-nestjs-thanhxuan/src/modules/internal/piecework/services/job-segment.service.ts` | `edit` | Giảm từ `400 dòng` xuống `< 250 dòng` bằng cách tách helper tính tiền công theo giờ và validate ca làm việc (`line 1-400`). |
| `be-nestjs-thanhxuan/src/modules/internal/piecework/helpers/hourly-work.helper.ts` | `add` | Helper tính toán thời lượng phút, hệ số khâu và thành tiền công thợ. |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/partner-report.service.ts` | `edit` | Giảm từ `386 dòng` xuống `< 250 dòng` bằng cách tách hàm gom nhóm dữ liệu đối soát (`line 1-386`). |
| `be-nestjs-thanhxuan/src/modules/internal/reports/helpers/partner-reconciliation.helper.ts` | `add` | Chứa logic tổng hợp số liệu đồ sạch/đồ bẩn và doanh thu theo chi nhánh đối tác. |

#### B. Frontend (`fe-react-thanhxuan-internal/src`)

| Path | Action | Lý do |
| :--- | :--- | :--- |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverExportHelper.ts` | `edit` | Giảm từ `1022 dòng` xuống `< 220 dòng` (chỉ giữ hàm điều phối chính) bằng cách tách thành 4 module con trong `export/` (`line 1-1022`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/export/handoverSlipCanvasRenderer.ts` | `add` | Chứa logic vẽ header, bảng hàng hóa và chữ ký lên Canvas A4 (< 280 dòng). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/export/handoverExcelExporter.ts` | `add` | Chứa logic xuất file Excel/CSV đối soát giao nhận (< 250 dòng). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/export/handoverZipDownloader.ts` | `add` | Chứa logic tải hàng loạt ảnh phiếu và đóng gói ZIP (`jszip`) (< 220 dòng). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/export/handoverExportTypes.ts` | `add` | Định nghĩa đầy đủ kiểu dữ liệu strict cho xuất phiếu, xóa sạch 9 vị trí `as any` (`HandoverExportHelper.ts:906-933`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/PartnerReceiptTabComponent.tsx` | `edit` | Giảm từ `661 dòng` xuống `< 250 dòng`, xóa 14 vị trí `any` (`line 169-316`), tách logic vẽ preview & ký nhận ra hook `usePartnerReceiptTab.ts` và sub-component. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/usePartnerReceiptTab.ts` | `add` | Quản lý state kiểm nhận đồ sạch, debounce vẽ Canvas A4 và mutation ký nhận của Đối tác. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperHandoverItemCardComponent.tsx` | `edit` | Giảm từ `655 dòng` xuống `< 250 dòng` bằng cách tách logic render Canvas preview (có debounce) sang hook `useShipperSlipPreview.ts` và phần chi tiết mặt hàng sang sub-component (`line 1-655`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/useShipperSlipPreview.ts` | `add` | Hook xử lý debounce 300ms khi vẽ Canvas A4 cho thẻ giao nhận của Shipper. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/HandoverSlipGalleryComponent.tsx` | `edit` | Giảm từ `585 dòng` xuống `< 250 dòng` bằng cách tách hook `useHandoverSlipGallery.ts` và modal xem ảnh chi tiết (`line 1-585`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/useHandoverSlipGallery.ts` | `add` | Quản lý bộ lọc ngày/đối tác, chọn nhiều ảnh và tải ZIP thư viện phiếu. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx` | `edit` | Giảm từ `571 dòng` xuống `< 260 dòng` bằng cách tách state & mutation soạn đồ sạch sang `usePrepOrderForm.ts` (`line 1-571`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/usePrepOrderForm.ts` | `add` | Custom hook xử lý form lập/sửa phiếu xuất kho đồ sạch (`PrepOrder`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/ShipperHandoverPage.tsx` | `edit` | Giảm từ `558 dòng` xuống `< 240 dòng` bằng cách tách queries/mutations sang `useShipperHandoverPage.ts` (`line 1-558`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/useShipperHandoverPage.ts` | `add` | Custom hook quản lý danh sách phiếu giao nhận, bộ lọc và thao tác của Shipper. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/PartnerHistoryTabComponent.tsx` | `edit` | Giảm từ `548 dòng` xuống `< 250 dòng` bằng cách tách bảng lịch sử và bộ lọc (`line 1-548`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/PartnerCountTabComponent.tsx` | `edit` | Giảm từ `523 dòng` xuống `< 250 dòng`, xóa `as any` ở `sigPadRef` (`line 475`) bằng cách tách vùng ký số và danh sách mặt hàng (`line 1-523`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperHistoryTabComponent.tsx` | `edit` | Giảm từ `512 dòng` xuống `< 250 dòng` bằng cách tách card lịch sử và modal preview (`line 1-512`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/RecountStationPage.tsx` | `edit` | Giảm từ `457 dòng` xuống `< 240 dòng`, xóa 7 vị trí `any` (`line 78-346`), tách logic ra `useRecountStation.ts` (`line 1-457`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/useRecountStation.ts` | `add` | Custom hook quản lý trạm rạch bao đếm lại tại xưởng. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/PartnerHandoverPage.tsx` | `edit` | Giảm từ `444 dòng` xuống `< 230 dòng` bằng cách tách `usePartnerHandoverPage.ts` (`line 1-444`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/usePartnerHandoverPage.ts` | `add` | Custom hook quản lý dữ liệu phiếu giao nhận phía Đối tác. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/WarehouseHandoverPage.tsx` | `edit` | Giảm từ `348 dòng` xuống `< 240 dòng`, tách logic sang `useWarehouseHandover.ts` (`line 1-348`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/warehouseItemDisplayHelper.ts` | `edit` | Tách cấu hình mặc định và hàm sắp xếp để giảm từ `363 dòng` xuống `< 240 dòng` (`line 1-363`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/WarehouseScheduleSettingsModal.tsx` | `edit` | Rút gọn từ `304 dòng` xuống `< 240 dòng` (`line 1-304`). |
| `fe-react-thanhxuan-internal/src/features/operations/fuel/ShipperFuelPage.tsx` | `edit` | Giảm từ `439 dòng` xuống `< 230 dòng`, tách toàn bộ logic nén ảnh, lưu ảnh offline (IndexedDB Blob/Base64 khi mất mạng) và gửi phiếu xăng sang `useShipperFuel.ts` (`line 1-439`). |
| `fe-react-thanhxuan-internal/src/features/operations/fuel/hooks/useShipperFuel.ts` | `add` | Custom hook quản lý form đề xuất đổ xăng, hỗ trợ lưu ảnh vào Offline Queue khi không có mạng. |
| `fe-react-thanhxuan-internal/src/features/operations/attendance/AttendancePage.tsx` | `edit` | Giảm từ `355 dòng` xuống `< 240 dòng` bằng cách tách camera preview / lịch sử ca sang sub-component (`line 1-355`). |
| `fe-react-thanhxuan-internal/src/features/operations/piecework/HourlyWorkStationPage.tsx` | `edit` | Rút gọn từ `319 dòng` xuống `< 250 dòng` (`line 1-319`). |
| `fe-react-thanhxuan-internal/src/features/operations/reports/components/WorkforceReportSectionComponent.tsx` | `edit` | Giảm từ `456 dòng` xuống `< 250 dòng` bằng cách tách bảng chi tiết công thợ/chấm công (`line 1-456`). |
| `fe-react-thanhxuan-internal/src/features/operations/reports/components/QualityFuelReportSectionComponent.tsx` | `edit` | Giảm từ `391 dòng` xuống `< 250 dòng` bằng cách tách bảng chênh lệch rạch bao và bảng nhiên liệu (`line 1-391`). |
| `fe-react-thanhxuan-internal/src/features/operations/reports/components/ReportsFilterBarComponent.tsx` | `edit` | Giảm từ `359 dòng` xuống `< 240 dòng` (`line 1-359`). |
| `fe-react-thanhxuan-internal/src/features/operations/reports/components/WarehouseReportSectionComponent.tsx` | `edit` | Giảm từ `323 dòng` xuống `< 240 dòng` (`line 1-323`). |
| `fe-react-thanhxuan-internal/src/features/management/auth/StaffManagementPage.tsx` | `edit` | Giảm từ `367 dòng` xuống `< 220 dòng`, xóa re-export `StaffManagementView`, tách 3 queries & 4 mutations sang `useStaffManagement.ts` (`line 1-367`). |
| `fe-react-thanhxuan-internal/src/features/management/auth/hooks/useStaffManagement.ts` | `add` | Custom hook quản lý danh sách nhân sự, tạo/sửa/khóa/mở khóa tài khoản. |
| `fe-react-thanhxuan-internal/src/features/management/auth/modals/StaffFormModal.tsx` | `edit` | Giảm từ `381 dòng` xuống `< 250 dòng`, xóa `as any` (`line 73`). |
| `fe-react-thanhxuan-internal/src/features/management/auth/ApprovalManagementPage.tsx` | `edit` | Xóa 6 vị trí `(staff as any)` (`line 79-84`) và xóa re-export `ApprovalManagementView` (`line 148-149`). |
| `fe-react-thanhxuan-internal/src/features/management/auth/AuditLogPage.tsx` | `edit` | Xóa `log: any` (`line 54`) và xóa re-export `AuditLogView` (`line 77-78`). |
| `fe-react-thanhxuan-internal/src/features/management/partners/modals/PartnerModal.tsx` | `edit` | Giảm từ `346 dòng` xuống `< 250 dòng`, xóa re-export `PartnerDialog` (`line 344-345`). |
| `fe-react-thanhxuan-internal/src/features/auth/modals/ProfileEditModal.tsx` | `edit` | Giảm từ `404 dòng` xuống `< 250 dòng` bằng cách tách phần chữ ký mẫu sang sub-component (`line 1-404`). |
| `fe-react-thanhxuan-internal/src/features/auth/LoginPage.tsx` | `edit` | Rút gọn từ `365 dòng` xuống `< 240 dòng` (`line 1-365`). |
| `fe-react-thanhxuan-internal/src/components/layout/nav-config.ts` | `edit` | Tách cấu hình menu theo nhóm vận hành/quản trị để giảm từ `494 dòng` xuống `< 250 dòng` (`line 1-494`). |
| `fe-react-thanhxuan-internal/src/app/router.tsx` | `edit` | Dọn gọn các route redirect cũ trùng lặp để giảm từ `383 dòng` xuống `< 230 dòng` (`line 1-383`). |
| `.agents/docs/CODEBASE_ATLAS.md` | `edit` | Cập nhật toàn bộ danh sách sub-services, custom hooks và sub-components mới vào bản đồ định vị mã nguồn. |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | `edit` | Cập nhật kiến trúc phân tách service trong `handovers`, `payroll`, `attendance`, `auth`. |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | `edit` | Cập nhật cấu trúc Custom Hooks, Export modules và Component Colocation. |
| `.agents/docs/SRS_SDD.md` | `edit` | Ghi 1 dòng Document History cho Plan 44. |
| `.agents/docs/CHANGELOG.md` | `edit` | Ghi nhật ký chi tiết đợt chuẩn hóa Clean Code & Modular Refactoring của Plan 44. |

---

## 2. Technical Approach

### 2.1. Chiến lược Chia Nhỏ Service ở Backend (`< 250-300 dòng/file`)
- **Nguyên tắc Single Responsibility (SRP) & Facade:**
  - Giữ nguyên chữ ký các public method của `HandoverRecordService`, `PayrollService`, `AttendanceService`, `AccountAuthService` (hoặc điều phối qua sub-service được inject trong cùng Module) để không làm gãy các Controller và Unit Test hiện có.
  - Các logic tính toán thuần túy (như tính tiền lương `payroll-calculator.helper.ts`, tính giờ công thợ `hourly-work.helper.ts`, gom nhóm đối soát `partner-reconciliation.helper.ts`, xây dựng query `handover-query.helper.ts`) được tách thành các pure helper functions có kiểu dữ liệu đầu vào/đầu ra chặt chẽ, dễ dàng viết unit test độc lập.

### 2.2. Chiến lược Chia Nhỏ Component & Tách Custom Hook ở Frontend (`< 250-300 dòng/file`)
- **Quy tắc Colocation chuẩn (`AGENTS.md` mục 5.3):**
  - Mỗi `[Tên]Page.tsx` chỉ đảm nhận bố cục (layout) và kết nối với `hooks/use[Tên].ts` (`< 250 dòng`).
  - Toàn bộ `useQuery`, `useMutation`, xử lý nén ảnh, quản lý form state phức tạp và debounce vẽ Canvas A4 được chuyển vào `hooks/use[Tên].ts`.
  - Module xuất phiếu `HandoverExportHelper.ts` (`1022 dòng`) được tách thành thư mục `export/` gồm 4 file chuyên biệt (`handoverSlipCanvasRenderer.ts`, `handoverExcelExporter.ts`, `handoverZipDownloader.ts`, `handoverExportTypes.ts`).

### 2.3. Chuẩn hóa TypeScript Strict Mode (Zero `any`)
```typescript
// Ví dụ kiểu dữ liệu chuẩn hóa thay thế cho (staff as any) và user: any
export interface AuthenticatedStaffUser {
  sub: string;
  username: string;
  role: StaffRole;
  roles: StaffRole[];
  partnerId?: string;
  aud: 'internal';
}

export interface PopulatedPartnerRef {
  _id: string;
  name: string;
  code?: string;
}
```

---

## 3. Implementation Tasks (Checklist)

- [x] **T1: Chuẩn hóa TypeScript Strict Mode (Zero `any`) & Dọn dẹp Backend `core` + `internal/common`** - Tạo `AuthenticatedStaffUser`, thay thế toàn bộ `user: any` / `req: any` trong các Controller của `internal` và `core`, dọn dẹp `schedule-task.service.ts` - Depends on: Plan 43
- [x] **T2: Chia nhỏ các Service lớn trong `be-nestjs-thanhxuan/src/modules/internal/handovers`** - Tách `handover-record.service.ts` (`1268 dòng`), `handover-flow.service.ts` (`382 dòng`), `handover-state.ts` (`362 dòng`) và `handover.controller.ts` (`404 dòng`) thành các sub-services và helpers `< 280 dòng/file`, đăng ký providers vào `HandoverModule` - Depends on: T1
- [x] **T3: Chia nhỏ các Service lớn trong `auth`, `payroll`, `attendance`, `piecework`, `reports` (`src/modules/internal`)** - Tách `payroll.service.ts` (`745 dòng`), `attendance.service.ts` (`637 dòng`), `account-auth.service.ts` (`615 dòng`), `account-management.service.ts` (`403 dòng`), `job-segment.service.ts` (`400 dòng`), `partner-report.service.ts` (`386 dòng`) xuống `< 280 dòng/file` - Depends on: T1
- [x] **T4: Chia nhỏ `HandoverExportHelper.ts` (`1022 dòng`) & các Pages/Components phân hệ Giao nhận (`fe-react-thanhxuan-internal/src/features/operations/handovers`)** - Tách bộ `export/`, tách các Custom Hooks (`usePartnerReceiptTab`, `useShipperSlipPreview` có debounce 300ms, `useHandoverSlipGallery`, `usePrepOrderForm`, `useShipperHandoverPage`, `useRecountStation`, `usePartnerHandoverPage`, `useWarehouseHandover`) và rút gọn toàn bộ 14 file giao nhận xuống `< 260 dòng/file`, xóa sạch `any` - Depends on: T1
- [x] **T5: Chia nhỏ các Pages/Components/Modals còn lại ở Frontend (`fuel`, `attendance`, `piecework`, `reports`, `management`, `auth`, `layout`, `router`) & Xóa 17 Re-export Aliases** - Tách `useShipperFuel` (hỗ trợ lưu ảnh offline khi mất mạng), `useStaffManagement`, chia nhỏ các section báo cáo/modals, xóa sạch 17 re-export aliases (`*View`, `*Dialog`) và xóa toàn bộ các vị trí `any` còn lại - Depends on: T4
- [x] **T6: Kiểm thử Toàn Diện (Lint, Typecheck, Unit Test, Build & Kiểm tra số dòng file)** - Chạy script kiểm tra không còn file nào vượt ngưỡng cho phép và không còn `any` trong phạm vi 3 thư mục; chạy `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` cho cả `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal` - Depends on: T2, T3, T4, T5
- [x] **T7: Đồng bộ 5 Trụ cột Tài liệu & Tự động Commit/Push nhánh `dev`** - Cập nhật `.agents/docs/CODEBASE_ATLAS.md`, `.agents/docs/srs_sdd/srs_sdd_backend.md`, `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`, `.agents/docs/SRS_SDD.md`, `.agents/docs/CHANGELOG.md` và commit/push lên nhánh `dev` - Depends on: T6

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm thử bắt buộc
1. Kiểm tra tự động bằng lệnh PowerShell xác nhận trong 3 thư mục (`src/modules/core`, `src/modules/internal`, `fe-react-thanhxuan-internal/src`):
   - Không còn file code nào vượt quá ngưỡng 300 dòng.
   - Không còn tồn tại file/dòng re-export tạm thời (`*View`, `*Dialog`).
2. Tại `be-nestjs-thanhxuan/`:
   - `pnpm lint`
   - `pnpm exec tsc --noEmit`
   - `pnpm test`
   - `pnpm build`
3. Tại `fe-react-thanhxuan-internal/`:
   - `pnpm lint`
   - `pnpm exec tsc --noEmit`
   - `pnpm test`
   - `pnpm build`

### 4.2. Definition of Done
- Toàn bộ 10 file lớn ở Backend và 28 file lớn ở Frontend được chia tách khoa học (`< 250-300 dòng/file`), tuân thủ đúng kiến trúc Feature-based Colocation và Repository/Service Pattern.
- Không còn sử dụng `any` trong phạm vi mục tiêu; xóa sạch toàn bộ re-export tạm thời.
- Lint, typecheck, unit test và build pass 100% ở cả 2 ứng dụng.
- Đồng bộ đầy đủ 5 trụ cột tài liệu và tự động commit/push lên nhánh `dev`.

---

## 5. Risks & Rollback

- **Rủi ro 1:** Khi tách `HandoverRecordService` hoặc `PayrollService` sang các sub-services mới, các Unit Test hiện có (`*.spec.ts`) khởi tạo `TestingModule` có thể thiếu provider mới.
  - *Giảm thiểu:* Cập nhật đầy đủ `providers` trong `*.module.ts` và các file `*.spec.ts` tương ứng ngay trong T2 và T3.
- **Rủi ro 2:** Khi xóa 17 re-export aliases (`*View`, `*Dialog`) ở Frontend, nếu có file nào còn import tên cũ sẽ báo lỗi compile.
  - *Giảm thiểu:* Dùng tìm kiếm toàn cục (`grep`) cập nhật tất cả import sang tên chuẩn (`*Page`, `*Component`, `*Modal`) trước khi xóa dòng re-export, và verify bằng `pnpm exec tsc --noEmit`.
- **Rollback:** Có thể `git revert` độc lập từng commit của Plan 44 mà không ảnh hưởng tới các bản vá bảo mật của Plan 43.

## Changelog

- 2026-10-27: Khởi tạo Plan 44 cho Giai đoạn P2 (Chia nhỏ toàn bộ 38 file vượt ngưỡng 300 dòng, tách Custom Hooks, xóa re-export tạm thời và loại bỏ triệt để kiểu `any`).
- 2026-10-27: Hoàn thành 100% Tasks T1 đến T7. Verification lint/typecheck/test/build pass 100%. Đồng bộ đầy đủ 5 trụ cột tài liệu và commit push nhánh `dev`.

