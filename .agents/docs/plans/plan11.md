# Plan 11: Tái Cấu Trúc Route & Giao Diện Thao Tác fe-react-thanhxuan-internal Chuẩn SRS_SDD

> Status: Done | Created: 2026-10-05 | Completed: 2026-10-05  
> Phạm vi: `fe-react-thanhxuan-internal` (App Router, Navigation, Features Management, Reports, Piecework, Auth)  
> Căn cứ kỹ thuật: [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) (Mục 2.3 & 2.5), [create-react-feature/SKILL.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/skills/create-react-feature/SKILL.md)

---

## 1. Overview & Affected Files

### 1.1. Bối cảnh & Mục tiêu
- **Hiện trạng:**
  - Ứng dụng `fe-react-thanhxuan-internal` đang có cấu trúc route sơ khởi tại [src/app/router.tsx:24-104](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/router.tsx#L24-L104).
  - Toàn bộ 6 phân hệ quản trị lớn (Nhân sự, Phê duyệt tài khoản, Chấm công xưởng, Chốt sản lượng, Duyệt xăng xe, Bảng lương, Báo cáo) đang bị dồn cục vào một file khổng lồ [src/features/management/ManagementPage.tsx:1-866](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx#L1-L866) (866 dòng), gây khó bảo trì, tải chậm và không thể truy cập trực tiếp bằng Deep Link URL.
  - Phân hệ Thợ xưởng chấm sản lượng khoán đang bị gán tạm vào route `/tram-dem` ([src/app/(internal)/tram-dem/page.tsx:15](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/%28internal%29/tram-dem/page.tsx#L15)), trong khi `/tram-dem` theo [SRS_SDD.md:41-42](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md#L41-L42) là Trạm rạch bao đếm lại đồ gom bao xưởng (`recount_tasks`).
  - Thiếu trang Quên mật khẩu qua OTP (`/quen-mat-khau`) cho cụm Auth [SRS_SDD.md:186-187](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md#L186-L187).
  - Thiếu trang Trung tâm Báo cáo & Xuất streaming Excel/PDF (`/bao-cao`) [SRS_SDD.md:248-255](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md#L248-L255).
- **Mục tiêu:**
  - Tái cấu trúc toàn diện hệ thống định tuyến `src/app/router.tsx` và cây thư mục `src/app/` bao phủ **100% các tuyến API của Backend NestJS**.
  - Phân rã `ManagementPage` thành các Feature Modules tinh gọn theo cấu trúc chuẩn Feature-Based Flat Colocation của `fe-nextjs-thanhxuan-laundry`.
  - Cập nhật Navigation Bar ([nav-config.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/nav-config.ts), `DesktopSidebar`, `MobileBottomBar`, `MobileNavDrawer`) hỗ trợ điều hướng thông minh theo ma trận RBAC 8 vai trò.

### 1.2. Out of Scope
- Không thay đổi Backend API hay database schema (Backend NestJS đã ổn định và hoàn tất).
- Không sửa đổi mã nguồn Web khách hàng `fe-nextjs-thanhxuan-laundry`.

### 1.3. Bảng file ảnh hưởng (Affected Files)

| Path | Action | Lý do & Mô tả |
| :--- | :--- | :--- |
| `fe-react-thanhxuan-internal/src/app/router.tsx` | Edit | Cấu hình đầy đủ các route mới và sub-routes quản lý |
| `fe-react-thanhxuan-internal/src/components/layout/nav-config.ts` | Edit | Cập nhật danh mục menu, icon, phân quyền RBAC cho các route mới |
| `fe-react-thanhxuan-internal/src/app/(auth)/quen-mat-khau/page.tsx` | Add | Màn hình phục hồi mật khẩu qua OTP email |
| `fe-react-thanhxuan-internal/src/app/(internal)/khoan-viec/page.tsx` | Add | Màn hình thợ xưởng chấm sản lượng khoán (chuyển từ `/tram-dem` sang) |
| `fe-react-thanhxuan-internal/src/app/(internal)/bao-cao/page.tsx` | Add | Màn hình trung tâm 6 báo cáo aggregation & streaming export XLSX/PDF |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/page.tsx` | Edit | Biến thành Hub tổng quan điều hành (KPI cards & menu tắt) |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/nhan-su/page.tsx` | Add | Route quản lý nhân viên, phân quyền RBAC, khóa tài khoản |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/phe-duyet/page.tsx` | Add | Route phê duyệt đăng ký nhân viên nội bộ & nhà hàng |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/cham-cong/page.tsx` | Add | Route bảng công toàn xưởng & duyệt ca bất thường |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/khoan-viec/page.tsx` | Add | Route báo cáo sản lượng toàn xưởng & chốt sản lượng cuối ngày |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/xang/page.tsx` | Add | Route kế toán xét duyệt / từ chối hoàn tiền xăng đội xe |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/bang-luong/page.tsx` | Add | Route cấu hình tiền lương & chốt bảng lương chu kỳ tháng |
| `fe-react-thanhxuan-internal/src/features/management/` | Edit/Split | Phân rã 866 dòng trong `ManagementPage.tsx` thành các sub-components/features độc lập |
| `fe-react-thanhxuan-internal/src/features/reports/` | Add | Module nghiệp vụ báo cáo (Aggregation queries, Streaming download Excel/PDF) |

---

## 2. Technical Approach & Architecture

### 2.1. Cấu trúc Routing Map mới (Tương thích 100% SRS_SDD.md)

```
fe-react-thanhxuan-internal/src/app/
├── (auth)/
│   ├── dang-nhap/page.tsx               # POST /auth/login
│   ├── dang-ky/page.tsx                 # POST /auth/register, /verify-otp
│   └── quen-mat-khau/page.tsx           # POST /auth/forgot-password, /reset-password (NEW)
├── (internal)/
│   ├── tong-quan/page.tsx               # Dashboard KPI vận hành xưởng
│   ├── giao-nhan/                       # Phiếu Giao Nhận Kép
│   │   ├── page.tsx                     # GET /handover (danh sách)
│   │   └── [recordCode]/page.tsx        # Chi tiết phiếu, ký nhận Canvas, đối soát
│   ├── kho/page.tsx                     # Thủ kho soạn đồ sạch xuất kho theo lịch
│   ├── tram-dem/page.tsx                # Rạch bao đếm lại đồ bẩn xưởng (recount_tasks)
│   ├── nha-hang/page.tsx                # Bảng kê đối soát giao nhận tháng nhà hàng
│   ├── cham-cong/page.tsx               # Chấm công camera selfie & lịch sử cá nhân
│   ├── khoan-viec/page.tsx              # Thợ xưởng chấm sản lượng khoán (NEW)
│   ├── xang/page.tsx                    # Tài xế nộp đề xuất hoàn tiền xăng
│   ├── phieu-luong/page.tsx             # Nhân viên tra cứu phiếu lương cá nhân
│   ├── bao-cao/page.tsx                 # 6 Báo cáo Aggregation & xuất Excel/PDF (NEW)
│   └── quan-ly/                         # Trung tâm Quản trị & Điều hành
│       ├── page.tsx                     # Hub điều hành trung tâm (REFACTORED)
│       ├── nhan-su/page.tsx             # Quản lý nhân viên, phân quyền RBAC (NEW)
│       ├── phe-duyet/page.tsx           # Phê duyệt tài khoản nhân viên & nhà hàng (NEW)
│       ├── doi-tac/page.tsx             # Quản lý đối tác, chi nhánh, catalog đồ giặt
│       ├── cham-cong/page.tsx           # Bảng công toàn xưởng & duyệt ca bất thường (NEW)
│       ├── khoan-viec/page.tsx          # Báo cáo sản lượng toàn xưởng & chốt sản lượng (NEW)
│       ├── xang/page.tsx                # Kế toán duyệt/từ chối hóa đơn hoàn xăng (NEW)
│       └── bang-luong/page.tsx          # Cấu hình lương & chốt bảng lương chu kỳ (NEW)
```

### 2.2. Chiến lược phân rã `ManagementPage.tsx` (866 dòng)
Thay vì nhồi nhét tất cả các tab vào 1 file duy nhất với hàng loạt state cục bộ:
1. **Tạo `src/features/reports/`:** Đưa logic 6 báo cáo aggregation và gọi API xuất streaming Excel/PDF về đúng module `reports` (`reports.service.ts`, `useReports.ts`, `components/`).
2. **Tách các sub-page cho Quản lý:**
   - `StaffManagementView`: Chuyển logic quản lý nhân sự & đổi quyền vào `src/features/management/components/StaffManagementView.tsx`.
   - `ApprovalManagementView`: Chuyển logic duyệt tài khoản vào `src/features/management/components/ApprovalManagementView.tsx`.
   - `AttendanceReviewView`: Chuyển logic duyệt ca bất thường `NEEDS_REVIEW` vào `src/features/attendance/components/AttendanceReviewView.tsx`.
   - `PieceworkConfirmView`: Chuyển logic chốt sản lượng vào `src/features/piecework/components/PieceworkConfirmView.tsx`.
   - `FuelReviewView`: Chuyển logic duyệt xăng của Kế toán/Admin vào `src/features/fuel/components/FuelReviewView.tsx`.
   - `PayrollManagementView`: Chuyển logic tính lương & khóa kỳ vào `src/features/payroll/components/PayrollManagementView.tsx`.
3. **Trang Hub `/quan-ly` (`src/app/(internal)/quan-ly/page.tsx`):**
   - Thiết kế dạng Overview Command Center gồm các thẻ tóm tắt số liệu (Pending approvals, ca cần duyệt, đề xuất xăng chờ duyệt, kỳ lương hiện tại) kèm Quick Links dẫn thẳng vào các sub-route.

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Chuẩn bị Sub-modules & Phân rã Components (Features Layer)
- [x] **T1.1** [NEW] `src/features/auth/ForgotPasswordPage.tsx` — Xây dựng form nhập email, gửi OTP và đặt lại mật khẩu theo API `POST /auth/forgot-password` & `POST /auth/reset-password`.
- [x] **T1.2** [NEW] `src/features/reports/` — Tạo module báo cáo gồm `reports.service.ts` (gọi 6 endpoints aggregation và download streaming `api.get('/reports/export/excel', { responseType: 'blob' })`), `useReports.ts`, `ReportsDashboardView.tsx`.
- [x] **T1.3** [REFACTOR] Phân rã `ManagementPage.tsx`:
  - Tách Tab Phê duyệt thành `ApprovalManagementView.tsx`.
  - Tách Tab Nhân sự thành `StaffManagementView.tsx`.
  - Tách Tab Duyệt xăng thành `FuelReviewView.tsx`.
  - Tách Tab Bảng lương thành `PayrollManagementView.tsx`.
  - Tách Tab Chấm công & Khoán việc thành `AttendanceReviewView.tsx` và `PieceworkConfirmView.tsx`.
- [x] **T1.4** [REFACTOR] `src/features/piecework/PieceworkStationPage.tsx`:
  - Định vị rõ đây là màn hình chấm công sản lượng của Thợ xưởng (`POST /piecework/me/tasks`), độc lập với quy trình kiểm đếm đồ bẩn xưởng.

### Giai đoạn 2: Tạo các Pages trong App Router (`src/app/`)
- [x] **T2.1** [NEW] `src/app/(auth)/quen-mat-khau/page.tsx` — Trang Quên mật khẩu.
- [x] **T2.2** [NEW] `src/app/(internal)/khoan-viec/page.tsx` — Trang Chấm sản lượng khoán thợ xưởng (`PieceworkStationPage`).
- [x] **T2.3** [NEW] `src/app/(internal)/bao-cao/page.tsx` — Trang Trung tâm Báo cáo & Xuất file.
- [x] **T2.4** [REFACTOR] `src/app/(internal)/quan-ly/page.tsx` — Trang Hub điều hành trung tâm.
- [x] **T2.5** [NEW] Sub-pages quản lý:
  - `src/app/(internal)/quan-ly/nhan-su/page.tsx` (Dành cho `ADMIN`, `MANAGER`).
  - `src/app/(internal)/quan-ly/phe-duyet/page.tsx` (Dành cho `ADMIN`, `MANAGER`, `RESTAURANT_MANAGER`).
  - `src/app/(internal)/quan-ly/cham-cong/page.tsx` (Dành cho `ADMIN`, `MANAGER`).
  - `src/app/(internal)/quan-ly/khoan-viec/page.tsx` (Dành cho `ADMIN`, `MANAGER`).
  - `src/app/(internal)/quan-ly/xang/page.tsx` (Dành cho `ACCOUNTANT`, `ADMIN`).
  - `src/app/(internal)/quan-ly/bang-luong/page.tsx` (Dành cho `ACCOUNTANT`, `ADMIN`).

### Giai đoạn 3: Cập nhật Router & Điều hướng (Navigation & RBAC)
- [x] **T3.1** [EDIT] `src/app/router.tsx` — Khai báo toàn bộ các route mới với `ProtectedRoute` và danh sách `allowedRoles` tương ứng từng vai trò theo ma trận bảo mật SRS_SDD.
- [x] **T3.2** [EDIT] `src/components/layout/nav-config.ts` — Cập nhật danh sách menu cho Desktop Sidebar, Mobile Bottom Bar và Mobile Drawer; bổ sung icon và lọc theo vai trò (`hasAccessToNavItem`).
- [x] **T3.3** [EDIT] Kiểm tra đồng bộ chuyển hướng sau đăng nhập: Redirect người dùng về đúng trang khởi đầu theo vai trò (ví dụ: `WORKER` -> `/khoan-viec` hoặc `/tram-dem`, `SHIPPER` -> `/giao-nhan`, `RESTAURANT_STAFF` -> `/nha-hang`, `ACCOUNTANT` -> `/quan-ly`, `ADMIN` -> `/tong-quan`).

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm thử
```bash
# Typecheck toàn bộ TypeScript của React Internal
cd fe-react-thanhxuan-internal && pnpm exec tsc -b

# Kiểm tra build production
cd fe-react-thanhxuan-internal && pnpm run build
```

### 4.2. Kịch bản kiểm thử (Test Scenarios)
1. **Xác thực định tuyến & Phân quyền (RBAC Test):**
   - Đăng nhập tài khoản `WORKER`: Truy cập `/quan-ly/bang-luong` phải bị chặn và chuyển hướng về trang không có quyền hoặc trang chủ; truy cập `/khoan-viec` hoạt động bình thường.
   - Đăng nhập tài khoản `ACCOUNTANT`: Menu hiển thị Duyệt xăng, Bảng lương, Báo cáo; ẩn các nút can thiệp sâu kỹ thuật kho.
   - Đăng nhập tài khoản `SHIPPER`: Menu hiển thị Giao nhận, Xăng xe, Chấm công, Phiếu lương.
2. **Deep Link Test:**
   - Nhập trực tiếp URL `http://localhost:3001/quan-ly/xang` trên trình duyệt: Phải load thẳng vào giao diện duyệt xăng xe mà không cần qua `/quan-ly` rồi click tab.
3. **Báo cáo & Export Test:**
   - Vào `/bao-cao`, chọn khoảng ngày và nhấn "Xuất Excel": Trình duyệt tải về file `.xlsx` thành công từ streaming response của backend.

---

## 5. Risks & Rollback

| Rủi ro | Mức độ | Biện pháp giảm thiểu |
| :--- | :--- | :--- |
| **Gãy link cũ của người dùng đang lưu bookmark** | Thấp | Tại `src/app/router.tsx`, giữ route `/quan-ly` làm Hub và điều hướng fallback thông minh nếu người dùng truy cập route cũ |
| **Lỗi quyền truy cập (Permission mismatch)** | Trung bình | Sử dụng đúng enum `StaffRole` và `hasPermission(role, ...)` có sẵn trong `src/lib/permissions.ts` |
| **Tràn RAM hoặc crash khi render bảng dữ liệu lớn** | Thấp | Giữ nguyên TanStack Query caching và phân trang hợp lý |

---

## Changelog
- **2026-10-05:** Khởi tạo Plan 11 - Tái cấu trúc Route và Giao diện thao tác cho `fe-react-thanhxuan-internal` chuẩn SRS_SDD.
- **2026-10-05:** Hoàn tất thực thi toàn bộ 13 tasks (T1.1 - T3.3). Build & Typecheck pass 100%.

---

## Execution Log
- **Ngày hoàn thành:** 2026-10-05
- **Tasks hoàn tất:** T1.1, T1.2, T1.3, T1.4, T2.1, T2.2, T2.3, T2.4, T2.5, T3.1, T3.2, T3.3.
- **Kết quả Verification:**
  - `fe-react-thanhxuan-internal`: `tsc -b` pass không lỗi, `pnpm run build` pass trong 4.66s sinh bundle PWA hoàn chỉnh.
- **Deviations:** Không có. Tuân thủ 100% kiến trúc Feature-Based Flat Colocation và ma trận bảo mật RBAC.
