# Plan 16: Chuẩn Hóa Danh Mục Module Tiếng Anh, Tái Cấu Trúc Features và Định Tuyến Số Ít trong Hệ Thống Nội Bộ

> Status: Done | Created: 2026-10-08 | Updated: 2026-10-08 (Hoàn tất 100% - Đã verify build & đồng bộ tài liệu)

---

## 1. Overview & Affected Files

### 1.1. Mục Tiêu & Bối Cảnh
Tái cấu trúc và chuẩn hóa tên gọi danh mục module nghiệp vụ nội bộ trên cả 2 phân hệ Backend (`be-nestjs-thanhxuan`) và Frontend nội bộ (`fe-react-thanhxuan-internal`), giải quyết triệt để lỗi chính tả ngữ pháp tiếng Anh và đồng nhất kiến trúc:
1. **Chuẩn hóa Ngữ Pháp & Danh Xưng Tiếng Anh Module (Cả Backend & Frontend)**:
   - Các danh từ đếm được (Countable Nouns) giữ nguyên số nhiều: `handovers`, `partners`, `reports`.
   - Các danh từ không đếm được (Uncountable Nouns) và từ viết tắt bỏ đuôi `s`:
     - `auth` (thay vì `auths` - viết tắt của Authentication/Authorization).
     - `attendance` (thay vì `attendances` - chấm công không đếm được).
     - `fuel` (thay vì `fuels` - quản lý nhiên liệu/xăng xe không đếm được).
     - `piecework` (thay vì `pieceworks` - công việc khoán không đếm được).
     - `payroll` (thay vì `payrolls` - hệ thống tính lương).
2. **Cập nhật Backend (`be-nestjs-thanhxuan/src/modules/internal/`)**:
   - Đổi tên các thư mục module backend: `auths` ➔ `auth`, `attendances` ➔ `attendance`, `fuels` ➔ `fuel`, `pieceworks` ➔ `piecework`, `payrolls` ➔ `payroll`.
   - Cập nhật import trong `internal.module.ts`, `internal.constants.ts` và skill `create-nestjs-module`.
3. **Đồng bộ Kiến Trúc Features Frontend (`fe-react-thanhxuan-internal/src/features/`)**:
   - Chia thành 2 phân hệ lớn `management/` và `operations/` (tương tự `admin/` và `public/` bên Next.js), tên các module con đồng nhất 100% với backend: `attendance`, `auth`, `fuel`, `handovers`, `partners`, `payroll`, `piecework`, `reports`.
4. **Đổi tên & Chuẩn hóa Thuật Ngữ Đối Tác**:
   - Đổi thư mục `restaurant-manager` ➔ `partner-manager`, `restaurant-staff` ➔ `partner-staff`.
   - Chuẩn hóa toàn bộ nhãn hiển thị giao diện từ "nhà hàng" sang "đối tác" ("Quản lý Đối tác", "Nhân viên Đối tác", "Cổng Giao Nhận Đối Tác", "Chi Nhánh Đối Tác"...).
5. **Điều chỉnh Phân Quyền & Vị Trí Phê Duyệt Tài Khoản**:
   - Chuyển route `management/approvals` vào thành `management/manager/approval` (dạng số ít).
   - Tước bỏ hoàn toàn quyền phê duyệt tài khoản của vai trò Kế toán (`ACCOUNTANT`), chỉ cho phép Admin, Quản lý xưởng (`MANAGER`) và Quản lý đối tác (`RESTAURANT_MANAGER`).
6. **Chuẩn hóa 100% Route trong `src/app/(internal)` sang Dạng Số Ít**:
   - Mọi route con: `report`, `partner`, `approval`, `warehouse`, `handover`, `fuel`, `piecework`, `recount`...
   - Cấu hình đầy đủ Backward Compatibility Redirects trong `router.tsx` để bảo đảm không đứt gãy liên kết cũ.

### 1.2. Scope & Out of Scope
- **In Scope:**
  - Đổi tên các thư mục module backend trong `be-nestjs-thanhxuan/src/modules/internal/`.
  - Cập nhật module NestJS classes và references tương ứng (`AuthModule`, `AttendanceModule`, `FuelModule`, `PayrollModule`, `PieceworkModule`).
  - Cập nhật skill `.agents/skills/create-nestjs-module/SKILL.md`.
  - Tái cấu trúc thư mục `fe-react-thanhxuan-internal/src/features` thành `management/` và `operations/`.
  - Cập nhật các route và đổi tên route trong `fe-react-thanhxuan-internal/src/app/(internal)`.
  - Cập nhật `nav-config.ts`, `AppHeader.tsx`, `MobileNavDrawer.tsx`, `permissions.ts`, `router.tsx`, `AuthContext.tsx`.
  - Cập nhật tài liệu phân hệ `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` và `srs_sdd_backend.md`.
- **Out of Scope:**
  - Không thay đổi tên Enum `StaffRole.RESTAURANT_MANAGER` / `StaffRole.RESTAURANT_STAFF` trong database MongoDB hay API contract backend (tránh breaking change DB).
  - Không sửa logic nghiệp vụ tính toán sâu của backend.

### 1.3. Bảng File Ảnh Hưởng

| Path | Action | Lý do |
| :--- | :--- | :--- |
| **Backend:** | | |
| `be-nestjs-thanhxuan/src/modules/internal/auths/` | Move/Rename | Đổi tên thư mục thành `auth/`, đổi `auths.module.ts` ➔ `auth.module.ts` (Class `AuthModule`) |
| `be-nestjs-thanhxuan/src/modules/internal/attendances/` | Move/Rename | Đổi tên thư mục thành `attendance/`, đổi `attendances.module.ts` ➔ `attendance.module.ts` (Class `AttendanceModule`) |
| `be-nestjs-thanhxuan/src/modules/internal/fuels/` | Move/Rename | Đổi tên thư mục thành `fuel/`, đổi `fuels.module.ts` ➔ `fuel.module.ts` (Class `FuelModule`) |
| `be-nestjs-thanhxuan/src/modules/internal/payrolls/` | Move/Rename | Đổi tên thư mục thành `payroll/`, đổi `payrolls.module.ts` ➔ `payroll.module.ts` (Class `PayrollModule`) |
| `be-nestjs-thanhxuan/src/modules/internal/pieceworks/` | Move/Rename | Đổi tên thư mục thành `piecework/`, đổi `pieceworks.module.ts` ➔ `piecework.module.ts` (Class `PieceworkModule`) |
| `be-nestjs-thanhxuan/src/modules/internal/internal.module.ts` | Edit | Cập nhật imports các module mới đã chuẩn hóa chính tả |
| `be-nestjs-thanhxuan/src/modules/internal/internal.constants.ts` | Edit | Chuẩn hóa chú thích route prefix |
| `.agents/skills/create-nestjs-module/SKILL.md` | Edit | Cập nhật quy tắc đặt tên module chuẩn ngữ pháp tiếng Anh |
| **Frontend:** | | |
| `fe-react-thanhxuan-internal/src/features/management/` | Add/Move | Tái cấu trúc phân hệ quản trị: `attendance/`, `auth/`, `fuel/`, `handovers/`, `partners/`, `payroll/`, `piecework/`, `reports/`, `ManagementPage.tsx` |
| `fe-react-thanhxuan-internal/src/features/operations/` | Add/Move | Tái cấu trúc phân hệ vận hành & hiện trường: `attendance/`, `fuel/`, `handovers/`, `partners/`, `payroll/`, `piecework/`, `reports/` |
| `fe-react-thanhxuan-internal/src/features/restaurant/` | Delete | Chuyển nội dung thành `features/operations/partners/PartnerPortalPage.tsx` |
| `fe-react-thanhxuan-internal/src/features/attendance/`, `fuel/`, `partners/`, `payroll/`, `piecework/`, `reports/`, `handover/`, `warehouse/`, `recount/` | Move/Delete | Gom nhóm vào đúng vị trí trong `management/` và `operations/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/operations/restaurant-manager/` | Move/Delete | Đổi tên thành `src/app/(internal)/operations/partner-manager/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/operations/restaurant-staff/` | Move/Delete | Đổi tên thành `src/app/(internal)/operations/partner-staff/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/operations/reports/` | Move/Delete | Đổi tên thành `src/app/(internal)/operations/report/` (số ít) |
| `fe-react-thanhxuan-internal/src/app/(internal)/management/approvals/` | Move/Delete | Chuyển thành `src/app/(internal)/management/manager/approval/` (số ít, thuộc `manager/`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/management/manager/partners/` | Move/Delete | Đổi tên thành `src/app/(internal)/management/manager/partner/` (số ít) |
| `fe-react-thanhxuan-internal/src/components/layout/nav-config.ts` | Edit | Chuẩn hóa toàn bộ URL số ít, đổi nhãn giao diện nhà hàng ➔ đối tác, loại bỏ accountant khỏi phê duyệt tài khoản |
| `fe-react-thanhxuan-internal/src/app/router.tsx` | Edit | Khai báo các route số ít mới, cập nhật component imports, bổ sung redirects tương thích ngược |
| `fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx` | Edit | Đổi default route cho `RESTAURANT_MANAGER` và `RESTAURANT_STAFF` sang URL `partner-manager` và `partner-staff` |
| `fe-react-thanhxuan-internal/src/components/layout/AppHeader.tsx`, `MobileNavDrawer.tsx` | Edit | Đổi badge hiển thị "QUẢN LÝ ĐỐI TÁC" và "ĐỐI TÁC" |
| `fe-react-thanhxuan-internal/src/lib/permissions.ts` | Edit | Đổi tên vai trò tiếng Việt `getRoleDisplayName`: "Quản lý Đối tác", "Nhân viên Đối tác" |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`, `srs_sdd_backend.md` | Edit | Cập nhật tài liệu kiến trúc kỹ thuật tương ứng |

---

## 2. Technical Approach

### 2.1. Quy Ước Tên Module Chuẩn Ngữ Pháp Tiếng Anh
Áp dụng nhất quán cho cả Backend (`be-nestjs-thanhxuan/src/modules/internal/`) và Frontend (`fe-react-thanhxuan-internal/src/features/`):

| Loại danh từ | Tên Module Chuẩn | Bản chất Ngữ pháp & Nghiệp vụ |
| :--- | :--- | :--- |
| **Đếm được (Countable)** | `handovers` | Danh từ đếm được, dạng số nhiều chỉ các chuyến/biên bản giao nhận |
| **Đếm được (Countable)** | `partners` | Danh từ đếm được, dạng số nhiều chỉ các đối tác chuỗi B2B |
| **Đếm được (Countable)** | `reports` | Danh từ đếm được, dạng số nhiều chỉ các báo cáo thống kê |
| **Không đếm được (Uncountable)** | `attendance` | Danh từ không đếm được chỉ nghiệp vụ chấm công, điểm danh |
| **Không đếm được (Uncountable)** | `fuel` | Danh từ không đếm được chỉ nhiên liệu/xăng xe vận tải nội bộ |
| **Không đếm được (Uncountable)** | `piecework` | Danh từ không đếm được chỉ hình thức khoán theo sản phẩm *(pieceworks là sai ngữ pháp)* |
| **Hệ thống/Khái niệm** | `payroll` | Hệ thống tính lương, bảng lương của doanh nghiệp |
| **Từ viết tắt** | `auth` | Viết tắt của Authentication & Authorization *(không có đuôi s)* |

### 2.2. Cấu Trúc Mới của Frontend `fe-react-thanhxuan-internal/src/features/`
Đồng bộ hóa với mô hình `admin/` và `public/` bên Next.js và 8 module backend đã chuẩn hóa:

```text
src/features/
├── auth/                                   # Authentication nền tảng dùng chung
│   ├── AuthContext.tsx, ProtectedRoute.tsx, useAuth.ts
│   ├── LoginPage.tsx, RegisterPage.tsx, ForgotPasswordPage.tsx, modals...
│   └── index.ts
├── dashboard/                              # Dashboard tổng quan
│   ├── DashboardPage.tsx
│   └── index.ts
├── management/                             # Phân hệ Quản trị & Điều hành Xưởng (Admin, Manager, Accountant)
│   ├── attendance/                         # Quản lý duyệt chấm công
│   │   ├── AttendanceReviewView.tsx
│   │   └── index.ts
│   ├── auth/                               # Quản lý nhân sự, phê duyệt, nhật ký
│   │   ├── StaffManagementView.tsx
│   │   ├── ApprovalManagementView.tsx
│   │   ├── AuditLogView.tsx
│   │   └── index.ts
│   ├── fuel/                               # Kế toán xét duyệt xăng xe
│   │   ├── FuelReviewView.tsx
│   │   └── index.ts
│   ├── handovers/                          # Quản lý phiếu giao nhận xưởng
│   │   └── index.ts
│   ├── partners/                           # Quản trị chuỗi đối tác & bảng giá catalog
│   │   ├── PartnersPage.tsx
│   │   ├── components/ (BrandCatalogModal, ItemCatalogModal, PartnerModal...)
│   │   └── index.ts
│   ├── payroll/                            # Bảng lương, chốt kỳ & đơn giá
│   │   ├── PayrollManagementView.tsx
│   │   └── index.ts
│   ├── piecework/                          # Chốt sản lượng khoán thợ xưởng
│   │   ├── PieceworkConfirmView.tsx
│   │   └── index.ts
│   ├── reports/                            # Quản trị báo cáo tổng hợp
│   │   └── index.ts
│   ├── ManagementPage.tsx                  # Hub điều hành trung tâm xưởng
│   └── index.ts
└── operations/                             # Phân hệ Tác nghiệp Hiện trường & Đối tác (Shipper, Worker, Partners)
    ├── attendance/                         # Thợ xưởng chấm công camera
    │   ├── AttendancePage.tsx
    │   └── index.ts
    ├── fuel/                               # Tài xế nộp hóa đơn xăng
    │   ├── FuelPage.tsx
    │   └── index.ts
    ├── handovers/                          # Giao nhận kép, trạm đếm bao & kho sạch
    │   ├── HandoverListPage.tsx, HandoverDetailPage.tsx
    │   ├── WarehousePage.tsx               # Soạn kho sạch xuất xưởng
    │   ├── RecountStationPage.tsx          # Trạm đếm gom bao đối soát
    │   ├── components/ (CreateHandoverModal, RecountRequestModal, SignatureModal...)
    │   ├── HandoverExportHelper.ts
    │   └── index.ts
    ├── partners/                           # Cổng giao nhận & đối soát phía Đối tác
    │   ├── PartnerPortalPage.tsx           # (Đổi tên từ RestaurantPage.tsx)
    │   └── index.ts
    ├── payroll/                            # Phiếu lương cá nhân nhân viên
    │   ├── MyPayslipPage.tsx
    │   └── index.ts
    ├── piecework/                          # Trạm đếm khoán việc thợ giặt/ủi
    │   ├── PieceworkStationPage.tsx, ItemCounterCard.tsx
    │   └── index.ts
    ├── reports/                            # Trung tâm báo cáo & dữ liệu thống kê
    │   ├── reports.service.ts, reports.types.ts, useReports.ts, components/
    │   └── index.ts
    └── index.ts
```

### 2.3. Bảng Chuẩn Hóa Routes Số Ít 100% trong `src/app/(internal)`

| Route URL Mới (100% Số Ít) | Thư mục vật lý `src/app/(internal)/` | Vai trò truy cập chính | URL Cũ & Alias Tương Thích Ngược |
| :--- | :--- | :--- | :--- |
| `/dashboard` | `dashboard/page.tsx` | ADMIN, MANAGER, ACCOUNTANT, WAREHOUSE_MANAGER | `/tong-quan` |
| `/operations/attendance` | `operations/attendance/page.tsx` | WORKER | `/van-hanh/cham-cong`, `/cham-cong` |
| `/operations/payslip` | `operations/payslip/page.tsx` | Mọi nhân sự có lương | `/van-hanh/phieu-luong`, `/phieu-luong` |
| `/operations/report` | `operations/report/page.tsx` | ADMIN, MANAGER, ACCOUNTANT, WAREHOUSE_MANAGER | `/operations/reports`, `/van-hanh/bao-cao`, `/bao-cao` |
| `/operations/warehouse-manager/warehouse` | `operations/warehouse-manager/warehouse/page.tsx` | ADMIN, MANAGER, WAREHOUSE_MANAGER | `/van-hanh/warehouse-manager/kho`, `/kho` |
| `/operations/shipper/handover` | `operations/shipper/handover/page.tsx` | ADMIN, MANAGER, WAREHOUSE_MANAGER, SHIPPER | `/van-hanh/shipper/giao-nhan`, `/giao-nhan` |
| `/operations/shipper/handover/:recordCode` | `operations/shipper/handover/[recordCode]/page.tsx` | ADMIN, MANAGER, WAREHOUSE_MANAGER, SHIPPER, đối tác | `/van-hanh/shipper/giao-nhan/:code`, `/giao-nhan/:code` |
| `/operations/shipper/fuel` | `operations/shipper/fuel/page.tsx` | SHIPPER | `/van-hanh/shipper/xang`, `/xang` |
| `/operations/worker/piecework` | `operations/worker/piecework/page.tsx` | ADMIN, MANAGER, WORKER | `/van-hanh/worker/khoan-viec`, `/khoan-viec` |
| `/operations/worker/recount` | `operations/worker/recount/page.tsx` | ADMIN, MANAGER, WAREHOUSE_MANAGER, WORKER | `/van-hanh/worker/tram-dem`, `/tram-dem` |
| `/operations/partner-manager/partner` | `operations/partner-manager/partner/page.tsx` | RESTAURANT_MANAGER | `/operations/restaurant-manager/restaurant`, `/van-hanh/restaurant-manager/nha-hang`, `/nha-hang` |
| `/operations/partner-staff/partner` | `operations/partner-staff/partner/page.tsx` | RESTAURANT_STAFF, RESTAURANT_MANAGER, ADMIN, MANAGER | `/operations/restaurant-staff/restaurant`, `/van-hanh/restaurant-staff/nha-hang` |
| `/management` | `management/page.tsx` | ADMIN, MANAGER, ACCOUNTANT | `/quan-ly` |
| `/management/manager/personnel` | `management/manager/personnel/page.tsx` | ADMIN, MANAGER | `/quan-ly/nhan-su`, `/quan-ly/manager/nhan-su` |
| `/management/manager/approval` | `management/manager/approval/page.tsx` | ADMIN, MANAGER, RESTAURANT_MANAGER *(KHÔNG có ACCOUNTANT)* | `/management/approvals`, `/quan-ly/phe-duyet` |
| `/management/manager/partner` | `management/manager/partner/page.tsx` | ADMIN, MANAGER | `/management/manager/partners`, `/quan-ly/doi-tac`, `/quan-ly/manager/doi-tac` |
| `/management/manager/attendance` | `management/manager/attendance/page.tsx` | ADMIN, MANAGER | `/quan-ly/cham-cong`, `/quan-ly/manager/cham-cong` |
| `/management/manager/piecework` | `management/manager/piecework/page.tsx` | ADMIN, MANAGER | `/quan-ly/khoan-viec`, `/quan-ly/manager/khoan-viec` |
| `/management/accountant/fuel` | `management/accountant/fuel/page.tsx` | ADMIN, ACCOUNTANT | `/quan-ly/xang`, `/quan-ly/accountant/xang` |
| `/management/accountant/payroll` | `management/accountant/payroll/page.tsx` | ADMIN, ACCOUNTANT | `/quan-ly/bang-luong`, `/quan-ly/accountant/bang-luong` |

### 2.4. Quy Định Phân Quyền Phê Duyệt Tài Khoản (`approval`)
- Tước bỏ toàn bộ quyền truy cập phê duyệt tài khoản của vai trò Kế toán (`ACCOUNTANT`):
  1. Trang `src/app/(internal)/management/manager/approval/page.tsx`: Cấu hình `allowedRoles={[StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RESTAURANT_MANAGER]}`.
  2. `nav-config.ts`: Mục `quan-ly-phe-duyet` có đường dẫn mới `/management/manager/approval`, roles chỉ gồm `ADMIN`, `MANAGER`, `RESTAURANT_MANAGER`.
  3. `ManagementPage.tsx`: Tab `ACCOUNTS` và nút liên kết chỉ xuất hiện với `ADMIN`, `MANAGER`, `RESTAURANT_MANAGER`.
  4. Quản lý đối tác (`RESTAURANT_MANAGER`) chỉ được phép xem và duyệt các tài khoản nhân viên đối tác thuộc phạm vi của chi nhánh mình (`RESTAURANT_STAFF`).

### 2.5. Quy Chuẩn Thuật Ngữ Đối Tác (UI Text & Display Names)
- Thay đổi 100% các từ "nhà hàng" / "restaurant" trong ngữ cảnh B2B sang "đối tác" / "partner":
  - "Cổng Quản Lý Nhà Hàng" ➔ "Cổng Quản Lý Đối Tác"
  - "Cổng Nhà Hàng B2B" ➔ "Cổng Đối Tác B2B"
  - "Quản lý Nhà hàng" ➔ "Quản lý Đối tác"
  - "Nhân viên Nhà hàng" ➔ "Nhân viên Đối tác"
  - "Cổng Giao Nhận Nhà Hàng" ➔ "Cổng Giao Nhận Đối Tác"
  - "Chi Nhánh Nhà Hàng Đối Tác" ➔ "Chi Nhánh Đối Tác"
  - "Lịch Sử Giao Nhận Của Nhà Hàng" ➔ "Lịch Sử Giao Nhận Đối Tác"
  - "Duyệt Tài Khoản Nhân Viên Nhà Hàng" ➔ "Duyệt Tài Khoản Nhân Viên Đối Tác"

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn A: Chuẩn Hóa Backend NestJS & Skill
- [x] T1: [be-nestjs-thanhxuan/src/modules/internal/] - Đổi tên 5 thư mục module backend: `auths` ➔ `auth`, `attendances` ➔ `attendance`, `fuels` ➔ `fuel`, `payrolls` ➔ `payroll`, `pieceworks` ➔ `piecework`, cập nhật tên file module và class tương ứng (`AuthModule`, `AttendanceModule`, `FuelModule`, `PayrollModule`, `PieceworkModule`) - Depends on: none
- [x] T2: [be-nestjs-thanhxuan/src/modules/internal/internal.module.ts, internal.constants.ts, skill] - Cập nhật imports trong `internal.module.ts`, rà soát các references liên quan trong backend, chạy `pnpm build` (`nest build`) verify và cập nhật `.agents/skills/create-nestjs-module/SKILL.md` - Depends on: T1

### Giai đoạn B: Tái Cấu Trúc Features Frontend
- [x] T3: [fe-react-thanhxuan-internal/src/features/management/] - Khởi tạo cấu trúc module quản trị chuẩn backend (`attendance`, `auth`, `fuel`, `handovers`, `partners`, `payroll`, `piecework`, `reports`), di chuyển các view từ `features/management/components/` và `features/partners/` vào đúng module con, cập nhật `ManagementPage.tsx` và tạo `index.ts` barrel - Depends on: none
- [x] T4: [fe-react-thanhxuan-internal/src/features/operations/] - Khởi tạo cấu trúc module vận hành hiện trường chuẩn backend (`attendance`, `fuel`, `handovers`, `partners`, `payroll`, `piecework`, `reports`), di chuyển `attendance`, `fuel`, `handover`, `warehouse`, `recount`, `payroll`, `piecework`, `reports` và đổi tên `features/restaurant/RestaurantPage.tsx` thành `features/operations/partners/PartnerPortalPage.tsx` kèm chuẩn hóa UI text - Depends on: none
- [x] T5: [fe-react-thanhxuan-internal/src/features/auth/] - Đảm bảo tính toàn vẹn của shared auth, tạo re-export linh hoạt sang `features/management/auth` và dọn dẹp các thư mục features cũ đã di chuyển xong - Depends on: T3, T4

### Giai đoạn C: Chuẩn Hóa Routes Số Ít & Đối Tác Frontend
- [x] T6: [fe-react-thanhxuan-internal/src/app/(internal)/operations/] - Đổi tên thư mục `restaurant-manager` ➔ `partner-manager`, `restaurant-staff` ➔ `partner-staff`, đổi `reports` ➔ `report` (số ít), cập nhật component page sử dụng `PartnerPortalPage` - Depends on: T4
- [x] T7: [fe-react-thanhxuan-internal/src/app/(internal)/management/] - Chuyển `management/approvals` vào `management/manager/approval` (số ít), đổi `management/manager/partners` ➔ `management/manager/partner` (số ít), tước bỏ vai trò `ACCOUNTANT` trong `allowedRoles` của trang `approval/page.tsx` - Depends on: T3
- [x] T8: [fe-react-thanhxuan-internal/src/components/layout/, src/lib/, src/features/auth/AuthContext.tsx] - Cập nhật toàn bộ URL số ít, vai trò và nhãn hiển thị đối tác trong `nav-config.ts`, `AppHeader.tsx`, `MobileNavDrawer.tsx`, `permissions.ts` và `AuthContext.tsx` - Depends on: T6, T7
- [x] T9: [fe-react-thanhxuan-internal/src/app/router.tsx] - Cấu hình 100% routes số ít mới, cập nhật đường dẫn import, bổ sung đầy đủ hệ thống Redirect tương thích ngược cho URL cũ - Depends on: T6, T7, T8

### Giai đoạn D: Kiểm Thử, Build & Tài Liệu
- [x] T10: [Verify & Docs] - Chạy kiểm tra TypeScript (`pnpm exec tsc -b`) và build dự án (`pnpm build`) ở cả frontend lẫn backend, cập nhật đặc tả kiến trúc tại `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`, `srs_sdd_backend.md` và ghi nhận lịch sử tài liệu tại `SRS_SDD.md` - Depends on: T1, T2, T3, T4, T5, T6, T7, T8, T9

---

## 4. Verification & Testing

### 4.1. Lệnh Kiểm Tra Cú Pháp & Build
1. **Frontend (`fe-react-thanhxuan-internal`):**
   ```bash
   pnpm exec tsc -b
   pnpm build
   ```
2. **Backend (`be-nestjs-thanhxuan`):**
   ```bash
   pnpm build
   ```

### 4.2. Kịch Bản Kiểm Thử Chức Năng (Manual / E2E)
1. **Kiểm tra Điều hướng Số Ít & Redirects:**
   - Truy cập `/operations/reports` ➔ Tự động chuyển hướng sang `/operations/report`.
   - Truy cập `/management/approvals` ➔ Tự động chuyển hướng sang `/management/manager/approval`.
   - Truy cập `/management/manager/partners` ➔ Tự động chuyển hướng sang `/management/manager/partner`.
   - Truy cập `/operations/restaurant-manager/restaurant` ➔ Tự động chuyển hướng sang `/operations/partner-manager/partner`.
   - Truy cập `/operations/restaurant-staff/restaurant` ➔ Tự động chuyển hướng sang `/operations/partner-staff/partner`.
2. **Kiểm tra Phân quyền Phê duyệt Tài khoản (Accountant Guard):**
   - Đăng nhập tài khoản `ACCOUNTANT` ➔ Không thấy mục menu "Phê Duyệt Tài Khoản" trong Navigation.
   - Thử nhập URL trực tiếp `/management/manager/approval` khi đang là `ACCOUNTANT` ➔ Bị chặn bởi `ProtectedRoute`.
   - Đăng nhập tài khoản `MANAGER` hoặc `ADMIN` ➔ Truy cập và duyệt tài khoản bình thường.
3. **Kiểm tra Hiển thị Đối Tác:**
   - Đăng nhập tài khoản `RESTAURANT_MANAGER` (Quản lý đối tác) ➔ Menu hiển thị "Cổng Quản Lý Đối Tác", Badge hiển thị "QUẢN LÝ ĐỐI TÁC", tiêu đề trang hiển thị "Cổng Giao Nhận Đối Tác", không còn từ "Nhà hàng".

### 4.3. Definition of Done (DoD)
1. Backend NestJS `src/modules/internal/` chuẩn hóa 5 module theo đúng ngữ pháp tiếng Anh (`auth`, `attendance`, `fuel`, `piecework`, `payroll`). `pnpm build` pass 100%.
2. Skill `create-nestjs-module` được cập nhật quy chuẩn ngữ pháp tiếng Anh.
3. Frontend `src/features` phân tách hoàn chỉnh `management/` và `operations/` với 8 module con đồng nhất với backend.
4. 100% routes trong `src/app/(internal)` là dạng số ít.
5. Chuyển thành công `approvals` vào `manager/approval`, Kế toán không có quyền phê duyệt tài khoản.
6. Giao diện và thư mục liên quan tới đối tác được đổi thành `partner-manager` và `partner-staff` kèm text tiếng Việt chuẩn.
7. Chạy `pnpm exec tsc -b` và `pnpm build` ở Frontend pass 100%.
8. Cập nhật tài liệu `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`, `srs_sdd_backend.md` và 1 dòng Document History tại `SRS_SDD.md`.

---

## 5. Risks & Rollback

### 5.1. Rủi ro
- **Gãy liên kết Bookmark cũ:** Người dùng hoặc nhân viên đã lưu bookmark các trang cũ (`/operations/reports`, `/management/approvals`...).  
  *Giảm thiểu:* Thiết lập đầy đủ kịch bản `Navigate to="..." replace` trong `router.tsx` cho tất cả URL cũ.
- **Breaking Imports trong TS/TSX:** Di chuyển module và component giữa các thư mục dễ làm hỏng import path.  
  *Giảm thiểu:* Dùng barrel exports `index.ts` ở từng module con và chạy `tsc -b` / `nest build` kiểm tra ngay sau mỗi bước.

### 5.2. Rollback
- Nếu phát sinh lỗi nghiêm trọng, hoàn tác thay đổi thông qua git branch hoặc checkout lại commit trước đó.

---

## Changelog & Execution Log
- 2026-10-08: Khởi tạo Plan 16 - Tái cấu trúc features (management/operations), chuẩn hóa route số ít, đổi tên đối tác và siết quyền phê duyệt tài khoản.
- 2026-10-08: Cập nhật Plan 16 - Mở rộng phạm vi chuẩn hóa ngữ pháp tiếng Anh cho 5 module Backend NestJS (`auth`, `attendance`, `fuel`, `piecework`, `payroll`) và cập nhật skill `create-nestjs-module`.
- 2026-10-08 [Execution Log]:
  - Hoàn tất T1-T2: Chuẩn hóa 5 module Backend NestJS (`auth`, `attendance`, `fuel`, `payroll`, `piecework`), alias exports và build pass 100%.
  - Hoàn tất T3-T5: Phân chia `features/` thành `management/` và `operations/`, bảo đảm shared auth integrity.
  - Hoàn tất T6-T7: Chuẩn hóa routes sang tiếng Anh số ít và đối tác (`partner-manager`, `partner-staff`, `report`), chuyển approvals vào `manager/approval` (tước quyền accountant).
  - Hoàn tất T8-T9: Cập nhật UI navigation, badges, modals và router.tsx với đầy đủ backward compatibility redirects.
  - Hoàn tất T10: Typecheck `pnpm exec tsc -b` (Pass), Frontend Build `pnpm build` (Pass), Backend Build `pnpm build` (Pass). Cập nhật đầy đủ `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`.
