# Plan 14: Chuẩn Hóa Toàn Bộ Cấu Trúc Routes Sang Tiếng Anh Cho Phân Hệ Vận Hành Nội Bộ

> **Trạng thái:** Hoàn thành (Done) | **Ngày tạo:** 2026-10-07  
> **Phân hệ:** `fe-react-thanhxuan-internal`  
> **Tham chiếu nghiệp vụ:** [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md)

---

## 1. Hiện Trạng & Lý Do Thay Đổi

### 1.1. Dẫn chứng hiện trạng code
Hiện tại trong `fe-react-thanhxuan-internal/src/app`:
- Thư mục xác thực [src/app/(auth)](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/(auth)) đang dùng tên tiếng Việt:
  - `dang-nhap` ([src/app/(auth)/dang-nhap/page.tsx:4](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/(auth)/dang-nhap/page.tsx#L4))
  - `dang-ky` ([src/app/(auth)/dang-ky/page.tsx:4](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/(auth)/dang-ky/page.tsx#L4))
  - `quen-mat-khau` ([src/app/(auth)/quen-mat-khau/page.tsx:4](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/(auth)/quen-mat-khau/page.tsx#L4))
- Thư mục nghiệp vụ nội bộ [src/app/(internal)](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/(internal)) đang pha trộn tiếng Việt và tiếng Anh:
  - `tong-quan` ([src/app/(internal)/tong-quan/page.tsx:6](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/(internal)/tong-quan/page.tsx#L6))
  - `van-hanh`: gồm `cham-cong`, `phieu-luong`, `bao-cao`, `warehouse-manager/kho`, `shipper/giao-nhan`, `shipper/xang`, `worker/tram-dem`, `worker/khoan-viec`, `restaurant-manager/nha-hang`, `restaurant-staff/nha-hang` ([src/app/router.tsx:80-132](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/router.tsx#L80-L132))
  - `quan-ly`: gồm `page.tsx`, `phe-duyet`, `manager/nhan-su`, `manager/doi-tac`, `manager/cham-cong`, `manager/khoan-viec`, `accountant/xang`, `accountant/bang-luong` ([src/app/router.tsx:137-171](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/router.tsx#L137-L171))
- Các liên kết nội bộ trong component (`useNavigate`, `<Link>`, `<Navigate>`) và cấu hình điều hướng ([src/components/layout/nav-config.ts:46-270](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/nav-config.ts#L46-L270)) đang gắn cứng các URL tiếng Việt cũ.

### 1.2. Mục tiêu kỹ thuật
1. Đổi toàn bộ các route thư mục trong `(auth)` và `(internal)` sang 100% tiếng Anh chuẩn mực RESTful và đồng bộ với các module tính năng trong `src/features/`.
2. Cập nhật định tuyến tập trung trong `router.tsx` và cấu hình navigation trong `nav-config.ts`.
3. Cập nhật tất cả các vị trí điều hướng nội bộ (`AuthContext`, `api-client`, `ProtectedRoute`, `RootPage`, `DashboardPage`, `ManagementPage`, `HandoverListPage`, `HandoverDetailPage`, `LoginPage`, `RegisterPage`, `ForgotPasswordPage`).
4. Thiết lập tầng chuyển hướng tương thích ngược (Backward Compatibility Redirects) cho tất cả URL tiếng Việt cũ, đảm bảo người dùng truy cập bookmark hoặc link cũ không bị lỗi 404.
5. Cập nhật tài liệu kiến trúc [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md) và ghi nhận nhật ký [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).

---

## 2. Bảng Ánh Xạ Tuyến Đường (Route Mapping Table)

### 2.1. Nhóm Xác Thực: `src/app/(auth)`
| URL & Thư mục Hiện tại | URL & Thư mục Mới (Tiếng Anh) | Page Component Mới | Ghi chú |
| :--- | :--- | :--- | :--- |
| `src/app/(auth)/dang-nhap` (`/dang-nhap`) | `src/app/(auth)/login` (`/login`) | `LoginPage` | Trang đăng nhập hệ thống |
| `src/app/(auth)/dang-ky` (`/dang-ky`) | `src/app/(auth)/register` (`/register`) | `RegisterPage` | Đăng ký tài khoản OTP |
| `src/app/(auth)/quen-mat-khau` (`/quen-mat-khau`) | `src/app/(auth)/forgot-password` (`/forgot-password`) | `ForgotPasswordPage` | Đặt lại mật khẩu OTP |

### 2.2. Nhóm Vận Hành Nội Bộ: `src/app/(internal)`

#### Cấp cao nhất (Top-level Routes)
| Hiện tại | Mới (Tiếng Anh) | Ghi chú |
| :--- | :--- | :--- |
| `src/app/(internal)/tong-quan` (`/tong-quan`) | `src/app/(internal)/dashboard` (`/dashboard`) | Bảng điều khiển tổng quan |
| `src/app/(internal)/van-hanh` (`/van-hanh/*`) | `src/app/(internal)/operations` (`/operations/*`) | Phân hệ vận hành xưởng & đối tác |
| `src/app/(internal)/quan-ly` (`/quan-ly/*`) | `src/app/(internal)/management` (`/management/*`) | Phân hệ điều hành, nhân sự & kế toán |

#### Phân nhánh Vận hành (`operations` thay thế `van-hanh`)
| Thư mục & Route Hiện tại | Thư mục & Route Mới | Page Component Mới |
| :--- | :--- | :--- |
| `van-hanh/cham-cong` | `operations/attendance` | `OperationsAttendancePage` |
| `van-hanh/phieu-luong` | `operations/payslip` | `OperationsPayslipPage` |
| `van-hanh/bao-cao` | `operations/reports` | `OperationsReportsPage` |
| `van-hanh/warehouse-manager/kho` | `operations/warehouse-manager/warehouse` | `WarehouseManagerWarehousePage` |
| `van-hanh/shipper/giao-nhan` | `operations/shipper/handover` | `ShipperHandoverListPage` |
| `van-hanh/shipper/giao-nhan/[recordCode]` | `operations/shipper/handover/[recordCode]` | `ShipperHandoverDetailPage` |
| `van-hanh/shipper/xang` | `operations/shipper/fuel` | `ShipperFuelPage` |
| `van-hanh/worker/tram-dem` | `operations/worker/recount` | `WorkerRecountPage` |
| `van-hanh/worker/khoan-viec` | `operations/worker/piecework` | `WorkerPieceworkPage` |
| `van-hanh/restaurant-manager/nha-hang` | `operations/restaurant-manager/restaurant` | `RestaurantManagerRestaurantPage` |
| `van-hanh/restaurant-staff/nha-hang` | `operations/restaurant-staff/restaurant` | `RestaurantStaffRestaurantPage` |

#### Phân nhánh Quản trị (`management` thay thế `quan-ly`)
| Thư mục & Route Hiện tại | Thư mục & Route Mới | Page Component Mới |
| :--- | :--- | :--- |
| `quan-ly/page.tsx` (`/quan-ly`) | `management/page.tsx` (`/management`) | `ManagementHubPage` |
| `quan-ly/phe-duyet` | `management/approvals` | `ManagementApprovalsPage` |
| `quan-ly/manager/nhan-su` | `management/manager/personnel` | `ManagerPersonnelPage` |
| `quan-ly/manager/doi-tac` | `management/manager/partners` | `ManagerPartnersPage` |
| `quan-ly/manager/cham-cong` | `management/manager/attendance` | `ManagerAttendancePage` |
| `quan-ly/manager/khoan-viec` | `management/manager/piecework` | `ManagerPieceworkPage` |
| `quan-ly/accountant/xang` | `management/accountant/fuel` | `AccountantFuelPage` |
| `quan-ly/accountant/bang-luong` | `management/accountant/payroll` | `AccountantPayrollPage` |

---

## 3. Danh Sách Tệp Thay Đổi (Affected Files)

### 3.1. Di chuyển / Đổi tên thư mục (Directory Relocations)
- `src/app/(auth)/dang-nhap` ➔ `src/app/(auth)/login`
- `src/app/(auth)/dang-ky` ➔ `src/app/(auth)/register`
- `src/app/(auth)/quen-mat-khau` ➔ `src/app/(auth)/forgot-password`
- `src/app/(internal)/tong-quan` ➔ `src/app/(internal)/dashboard`
- `src/app/(internal)/van-hanh` ➔ `src/app/(internal)/operations` (kèm đổi tên các thư mục con `cham-cong` ➔ `attendance`, `phieu-luong` ➔ `payslip`, `bao-cao` ➔ `reports`, `kho` ➔ `warehouse`, `giao-nhan` ➔ `handover`, `xang` ➔ `fuel`, `tram-dem` ➔ `recount`, `khoan-viec` ➔ `piecework`, `nha-hang` ➔ `restaurant`)
- `src/app/(internal)/quan-ly` ➔ `src/app/(internal)/management` (kèm đổi tên các thư mục con `phe-duyet` ➔ `approvals`, `nhan-su` ➔ `personnel`, `doi-tac` ➔ `partners`, `cham-cong` ➔ `attendance`, `khoan-viec` ➔ `piecework`, `xang` ➔ `fuel`, `bang-luong` ➔ `payroll`)

### 3.2. Cập nhật Code & Định tuyến (Routing & Navigation Updates)
1. [src/app/router.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/router.tsx): Cấu hình route tiếng Anh mới và thiết lập mạng lưới Redirect tương thích ngược.
2. [src/components/layout/nav-config.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/nav-config.ts): Đổi `path` của tất cả nav item sang URL tiếng Anh mới.
3. [src/app/page.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/page.tsx): Cập nhật redirect unauthenticated sang `/login`.
4. [src/features/auth/AuthContext.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx): Cập nhật `getDefaultRouteForRole` trả về các route tiếng Anh mới và `logout()` trỏ về `/login`.
5. [src/features/auth/ProtectedRoute.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/ProtectedRoute.tsx): Cập nhật redirect unauthenticated và khóa tài khoản trỏ về `/login`.
6. [src/lib/api-client.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/lib/api-client.ts): Cập nhật `isPublicAuthPage` (`/login`, `/register`) và redirect 401 về `/login`.
7. [src/features/auth/LoginPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/LoginPage.tsx): Cập nhật link sang `/register`.
8. [src/features/auth/RegisterPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/RegisterPage.tsx): Cập nhật navigate và link sang `/login`.
9. [src/features/auth/ForgotPasswordPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/ForgotPasswordPage.tsx): Cập nhật navigate và link sang `/login`.
10. [src/features/dashboard/DashboardPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx): Cập nhật navigate sang `/operations/shipper/handover`, `/operations/attendance`, `/operations/worker/recount`.
11. [src/features/management/ManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx): Cập nhật navigate của các action card sang `/management/*` và `/operations/reports`.
12. [src/features/handover/HandoverListPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/handover/HandoverListPage.tsx) & [src/features/handover/HandoverDetailPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/handover/HandoverDetailPage.tsx): Cập nhật navigate sang `/operations/shipper/handover` và `/operations/shipper/handover/:recordCode`.

### 3.3. Cập nhật Tài liệu
1. [.agents/docs/srs_sdd/srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md): Cập nhật sơ đồ cấu trúc thư mục và ma trận route tiếng Anh.
2. [.agents/docs/CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md): Ghi nhận nhật ký chi tiết Plan 14.

---

## 4. Kế Hoạch Kiểm Thử & Xác Minh (Verification Plan)

1. **Kiểm tra biên dịch Typecheck:**
   - Chạy `pnpm exec tsc --noEmit` trong `fe-react-thanhxuan-internal` đảm bảo không có lỗi type nào phát sinh.
2. **Kiểm tra Unit Test:**
   - Chạy `pnpm test` trong `fe-react-thanhxuan-internal` đảm bảo toàn bộ test pass.
3. **Kiểm tra Build Bundle:**
   - Chạy `pnpm build` trong `fe-react-thanhxuan-internal` xác thực toàn bộ gói bundle Vite build thành công không lỗi syntax hay missing import.
4. **Kiểm tra Chuyển Hướng (Redirect Verification):**
   - Đảm bảo tất cả các URL tiếng Việt cũ đều được định nghĩa redirect sang URL tiếng Anh tương ứng.
