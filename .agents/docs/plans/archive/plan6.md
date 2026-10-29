# Plan 6: Tái Cấu Trúc Cây Thư Mục `fe-react-thanhxuan-internal` Sang Mô Hình App Router (Layout & Page Architecture)

> Status: Done | Created: 2026-10-04 | Target: `fe-react-thanhxuan-internal`

---

## 1. Overview & Affected Files

### 1.1 Mục Tiêu & Phạm Vi
- **Mục tiêu**: Tái cấu trúc tổ chức mã nguồn của ứng dụng vận hành nội bộ `fe-react-thanhxuan-internal` theo phong cách **App Router** giống như thiết kế của `fe-nextjs-thanhxuan-laundry`.
- **Phạm vi**:
  - Giữ nguyên nền tảng kỹ thuật hiện tại: **Vite + React 18 SPA + React Router v7** nhằm bảo toàn hiệu năng siêu nhẹ, khả năng hoạt động ngoại tuyến PWA (Service Worker, Web Worker) và lưu trữ hàng đợi IndexedDB.
  - Tái cấu trúc thư mục `src/` để hình thành cây thư mục `src/app/` chuẩn mực:
    - Root Layout (`src/app/layout.tsx`): Bao bọc các Providers dùng chung (`ThemeProvider`, `QueryClientProvider`, `AuthProvider`, `Toaster`).
    - Root Page (`src/app/page.tsx`): Điều hướng tự động theo vai trò người dùng (`RootRedirect`).
    - Route Group `(auth)`: Chứa `layout.tsx` (background, theme toggle) và các trang `dang-nhap/page.tsx`, `dang-ky/page.tsx`.
    - Route Group `(internal)`: Chứa `layout.tsx` (xác thực `ProtectedRoute`, khung `AppLayout`) và 11 màn hình nghiệp vụ (`tong-quan`, `nha-hang`, `kho`, `giao-nhan`, `giao-nhan/[recordCode]`, `tram-dem`, `cham-cong`, `xang`, `phieu-luong`, `quan-ly`, `doi-tac`).
    - Centralized Router (`src/app/router.tsx`): Định nghĩa cây route bám sát 1-1 với cấu trúc thư mục `src/app/`.
    - Tối giản hóa file [App.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/App.tsx#L1-L248) chỉ còn ~15 dòng gọi `<RouterProvider router={router} />`.
- **Out of scope**:
  - Không di chuyển runtime sang framework Next.js (tránh phức tạp hóa việc đóng gói PWA và Static Asset cho VPS).
  - Không thay đổi API contract hay business logic của các module trong `src/features/*`.

### 1.2 Assumptions & Open Questions
- **Assumptions**:
  - Người dùng đã xác nhận giữ nguyên nền tảng Vite + React SPA và áp dụng kiến trúc tổ chức file-based hierarchy dạng App Router (`src/app/`).
  - Toàn bộ các route URLs hiện tại giữ nguyên 100% để không làm gãy bookmark hay PWA shortcuts.

### 1.3 Bảng File Ảnh Hưởng (Affected Files)

| Path | Action | Lý Do |
| :--- | :---: | :--- |
| `fe-react-thanhxuan-internal/src/app/layout.tsx` | **Add** | Root Layout quản lý Providers toàn ứng dụng (`Theme`, `QueryClient`, `Auth`, `Toaster`). |
| `fe-react-thanhxuan-internal/src/app/page.tsx` | **Add** | Root Page (`/`) đảm nhiệm điều hướng vai trò tự động (`RootRedirect`). |
| `fe-react-thanhxuan-internal/src/app/router.tsx` | **Add** | Centralized Route Tree map cấu trúc `src/app/` với `createBrowserRouter`. |
| `fe-react-thanhxuan-internal/src/app/(auth)/layout.tsx` | **Add** | Auth Layout gom nền background và theme toggle chung cho luồng đăng nhập / đăng ký. |
| `fe-react-thanhxuan-internal/src/app/(auth)/dang-nhap/page.tsx` | **Add** | Entry point trang Đăng nhập (`/dang-nhap`). |
| `fe-react-thanhxuan-internal/src/app/(auth)/dang-ky/page.tsx` | **Add** | Entry point trang Đăng ký (`/dang-ky`). |
| `fe-react-thanhxuan-internal/src/app/(internal)/layout.tsx` | **Add** | Internal Layout gom `ProtectedRoute` và `AppLayout` (sidebar, bell, mobile navigation). |
| `fe-react-thanhxuan-internal/src/app/(internal)/tong-quan/page.tsx` | **Add** | Page Tổng quan Dashboard (`/tong-quan`) kèm RBAC check. |
| `fe-react-thanhxuan-internal/src/app/(internal)/nha-hang/page.tsx` | **Add** | Page Nhà hàng (`/nha-hang`) kèm RBAC check. |
| `fe-react-thanhxuan-internal/src/app/(internal)/kho/page.tsx` | **Add** | Page Quản lý Kho (`/kho`) kèm RBAC check. |
| `fe-react-thanhxuan-internal/src/app/(internal)/giao-nhan/page.tsx` | **Add** | Page Danh sách giao nhận (`/giao-nhan`) kèm RBAC check. |
| `fe-react-thanhxuan-internal/src/app/(internal)/giao-nhan/[recordCode]/page.tsx` | **Add** | Page Chi tiết giao nhận (`/giao-nhan/:recordCode`) kèm RBAC check. |
| `fe-react-thanhxuan-internal/src/app/(internal)/tram-dem/page.tsx` | **Add** | Page Trạm đếm khoán thợ (`/tram-dem`) kèm RBAC check. |
| `fe-react-thanhxuan-internal/src/app/(internal)/cham-cong/page.tsx` | **Add** | Page Điểm danh camera (`/cham-cong`). |
| `fe-react-thanhxuan-internal/src/app/(internal)/xang/page.tsx` | **Add** | Page Chi phí xăng xe (`/xang`) kèm RBAC check. |
| `fe-react-thanhxuan-internal/src/app/(internal)/phieu-luong/page.tsx` | **Add** | Page Tra cứu phiếu lương (`/phieu-luong`) kèm RBAC check. |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/page.tsx` | **Add** | Page Quản lý điều hành (`/quan-ly`) kèm RBAC check. |
| `fe-react-thanhxuan-internal/src/app/(internal)/doi-tac/page.tsx` | **Add** | Page Quản lý đối tác (`/doi-tac`) kèm RBAC check. |
| `fe-react-thanhxuan-internal/src/App.tsx` | **Edit** | Tinh giản 248 dòng về component siêu nhẹ chỉ render `<RouterProvider router={router} />`. |
| `fe-react-thanhxuan-internal/src/features/auth/LoginPage.tsx` | **Edit** | Tách phần background và theme toggle ra `(auth)/layout.tsx`, giữ lại form core. |
| `fe-react-thanhxuan-internal/src/features/auth/RegisterPage.tsx` | **Edit** | Tách phần background và theme toggle ra `(auth)/layout.tsx`, giữ lại form core. |

---

## 2. Technical Approach

### 2.1 Kiến Trúc Cây Thư Mục Mục Tiêu

Tương tự như cấu trúc `src/app/(admin)/admin/...` và `src/features/...` trong `fe-nextjs-thanhxuan-laundry`:

```
fe-react-thanhxuan-internal/src/
├── app/
│   ├── layout.tsx                     # Root Layout: ThemeProvider, QueryClientProvider, AuthProvider, Toaster, <Outlet />
│   ├── page.tsx                       # Root Page: RootRedirect theo vai trò user
│   ├── router.tsx                     # Centralized createBrowserRouter definition
│   │
│   ├── (auth)/                        # Route Group: Luồng xác thực không có sidebar
│   │   ├── layout.tsx                 # Auth Layout: Nền ảnh light/dark radial background, theme toggle, container
│   │   ├── dang-nhap/
│   │   │   └── page.tsx               # Route /dang-nhap
│   │   └── dang-ky/
│   │       └── page.tsx               # Route /dang-ky
│   │
│   └── (internal)/                    # Route Group: Phân hệ nội bộ yêu cầu đăng nhập
│       ├── layout.tsx                 # Internal Layout: <ProtectedRoute><AppLayout /></ProtectedRoute>
│       ├── tong-quan/
│       │   └── page.tsx               # Route /tong-quan (ADMIN, MANAGER, WAREHOUSE_MANAGER, ACCOUNTANT)
│       ├── nha-hang/
│       │   └── page.tsx               # Route /nha-hang (RESTAURANT_MANAGER, RESTAURANT_STAFF, ADMIN, MANAGER)
│       ├── kho/
│       │   └── page.tsx               # Route /kho (WAREHOUSE_MANAGER, ADMIN, MANAGER)
│       ├── giao-nhan/
│       │   ├── page.tsx               # Route /giao-nhan (SHIPPER, WAREHOUSE_MANAGER, MANAGER, ADMIN)
│       │   └── [recordCode]/
│       │       └── page.tsx           # Route /giao-nhan/:recordCode
│       ├── tram-dem/
│       │   └── page.tsx               # Route /tram-dem (WORKER, MANAGER, ADMIN)
│       ├── cham-cong/
│       │   └── page.tsx               # Route /cham-cong (Mọi nhân sự)
│       ├── xang/
│       │   └── page.tsx               # Route /xang (SHIPPER)
│       ├── phieu-luong/
│       │   └── page.tsx               # Route /phieu-luong (WORKER, SHIPPER)
│       ├── quan-ly/
│       │   └── page.tsx               # Route /quan-ly (ADMIN, MANAGER, ACCOUNTANT)
│       └── doi-tac/
│           └── page.tsx               # Route /doi-tac (MANAGER, ADMIN, ACCOUNTANT, WAREHOUSE_MANAGER)
│
├── features/                          # Giữ nguyên Feature-based colocation (components, hooks, modal, state)
├── components/                        # UI atoms & shared layout primitives
├── lib/                               # api-client, theme, utils, offline-queue
└── types/                             # Type definitions
```

### 2.2 Luồng Render & Định Tuyến (Data Flow)

```mermaid
flowchart TD
  Browser[Trình duyệt URL] --> Router[router.tsx createBrowserRouter]
  Router --> RootLayout[app/layout.tsx: Theme + QueryClient + Auth + Toaster]
  
  RootLayout --> RouteChoice{Path}
  
  RouteChoice -->|/| RootPage[app/page.tsx: RootRedirect theo Role]
  
  RouteChoice -->|/dang-nhap hoặc /dang-ky| AuthLayout[app/(auth)/layout.tsx: Nền + ThemeToggle]
  AuthLayout --> AuthOutlet[Outlet]
  AuthOutlet -->|/dang-nhap| LoginPage[dang-nhap/page.tsx]
  AuthOutlet -->|/dang-ky| RegisterPage[dang-ky/page.tsx]
  
  RouteChoice -->|Phân hệ nội bộ| InternalLayout[app/(internal)/layout.tsx: ProtectedRoute + AppLayout]
  InternalLayout --> InternalOutlet[Outlet]
  InternalOutlet --> Dashboard[tong-quan/page.tsx]
  InternalOutlet --> Restaurant[nha-hang/page.tsx]
  InternalOutlet --> Warehouse[kho/page.tsx]
  InternalOutlet --> Handover[giao-nhan/page.tsx]
  InternalOutlet --> HandoverDetail[giao-nhan/[recordCode]/page.tsx]
  InternalOutlet --> Piecework[tram-dem/page.tsx]
  InternalOutlet --> Attendance[cham-cong/page.tsx]
  InternalOutlet --> Fuel[xang/page.tsx]
  InternalOutlet --> Payslip[phieu-luong/page.tsx]
  InternalOutlet --> Management[quan-ly/page.tsx]
  InternalOutlet --> Partners[doi-tac/page.tsx]
  
  RouteChoice -->|Khác / 404| NotFound[Navigate to /]
```

### 2.3 Thiết Kế Chi Tiết Từng Module

#### Root Layout (`src/app/layout.tsx`):
```tsx
export default function RootLayout() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Outlet />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

#### Auth Layout (`src/app/(auth)/layout.tsx`):
Tách phần background wallpaper và dark-mode gradient dùng chung ra khỏi `LoginPage` và `RegisterPage`:
```tsx
export default function AuthLayout() {
  return (
    <main className="relative min-h-screen w-full flex flex-col justify-center items-center isolate p-4 transition-colors duration-200">
      <img src="https://tailkits.com/ui/iframe/assets/img/bg-5.png" alt="Background Light" className="absolute inset-0 -z-10 h-full w-full object-cover dark:hidden" />
      <div className="absolute inset-0 -z-10 h-full w-full hidden dark:block [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Outlet />
    </main>
  );
}
```

#### Internal Layout (`src/app/(internal)/layout.tsx`):
```tsx
export default function InternalLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}
```

#### Page Wrapper với Phân Quyền RBAC (Ví dụ `src/app/(internal)/kho/page.tsx`):
```tsx
export default function WarehouseRoute() {
  return (
    <ProtectedRoute allowedRoles={[StaffRole.WAREHOUSE_MANAGER, StaffRole.ADMIN, StaffRole.MANAGER]}>
      <WarehousePage />
    </ProtectedRoute>
  );
}
```

---

## 3. Implementation Tasks (Checklist)

### Giai Đoạn 1: Khởi Tạo Cấu Trúc Gốc `src/app/`
- [x] **T1.1**: Tạo file `src/app/layout.tsx` đóng gói Root Layout (`ThemeProvider`, `QueryClientProvider`, `AuthProvider`, `Toaster`, `<Outlet />`). - Depends on: none
- [x] **T1.2**: Tạo file `src/app/page.tsx` chứa component `RootRedirect` xử lý điều hướng trang chủ `/` theo `user.role`. - Depends on: none

### Giai Đoạn 2: Xây Dựng Route Group `(auth)`
- [x] **T2.1**: Tạo file `src/app/(auth)/layout.tsx` chứa nền background light/dark và `ThemeToggle`. - Depends on: T1.1
- [x] **T2.2**: Tạo file `src/app/(auth)/dang-nhap/page.tsx` bọc `LoginPage`. - Depends on: T2.1
- [x] **T2.3**: Tạo file `src/app/(auth)/dang-ky/page.tsx` bọc `RegisterPage`. - Depends on: T2.1
- [x] **T2.4**: Tinh chỉnh `LoginPage.tsx` và `RegisterPage.tsx` loại bỏ wrapper trùng lặp nền để kế thừa hoàn toàn từ `(auth)/layout.tsx`. - Depends on: T2.2, T2.3

### Giai Đoạn 3: Xây Dựng Route Group `(internal)`
- [x] **T3.1**: Tạo file `src/app/(internal)/layout.tsx` chứa `ProtectedRoute` và `AppLayout`. - Depends on: T1.1
- [x] **T3.2**: Tạo file `src/app/(internal)/tong-quan/page.tsx` bọc `DashboardPage` với phân quyền `allowedRoles`. - Depends on: T3.1
- [x] **T3.3**: Tạo file `src/app/(internal)/nha-hang/page.tsx` bọc `RestaurantPage` với phân quyền `allowedRoles`. - Depends on: T3.1
- [x] **T3.4**: Tạo file `src/app/(internal)/kho/page.tsx` bọc `WarehousePage` với phân quyền `allowedRoles`. - Depends on: T3.1
- [x] **T3.5**: Tạo file `src/app/(internal)/giao-nhan/page.tsx` bọc `HandoverListPage` với phân quyền `allowedRoles`. - Depends on: T3.1
- [x] **T3.6**: Tạo file `src/app/(internal)/giao-nhan/[recordCode]/page.tsx` bọc `HandoverDetailPage` với phân quyền `allowedRoles`. - Depends on: T3.1
- [x] **T3.7**: Tạo file `src/app/(internal)/tram-dem/page.tsx` bọc `PieceworkStationPage` với phân quyền `allowedRoles`. - Depends on: T3.1
- [x] **T3.8**: Tạo file `src/app/(internal)/cham-cong/page.tsx` bọc `AttendancePage`. - Depends on: T3.1
- [x] **T3.9**: Tạo file `src/app/(internal)/xang/page.tsx` bọc `FuelPage` với phân quyền `allowedRoles`. - Depends on: T3.1
- [x] **T3.10**: Tạo file `src/app/(internal)/phieu-luong/page.tsx` bọc `MyPayslipPage` với phân quyền `allowedRoles`. - Depends on: T3.1
- [x] **T3.11**: Tạo file `src/app/(internal)/quan-ly/page.tsx` bọc `ManagementPage` với phân quyền `allowedRoles`. - Depends on: T3.1
- [x] **T3.12**: Tạo file `src/app/(internal)/doi-tac/page.tsx` bọc `PartnersPage` với phân quyền `allowedRoles`. - Depends on: T3.1

### Giai Đoạn 4: Hoàn Thiện Centralized Router & Đấu Nối `App.tsx`
- [x] **T4.1**: Tạo file `src/app/router.tsx` định nghĩa `createBrowserRouter` liên kết toàn bộ layouts và pages theo cây thư mục. - Depends on: T1.2, T2.2, T2.3, T3.2-T3.12
- [x] **T4.2**: Refactor `src/App.tsx` giản lược chỉ render `<RouterProvider router={router} />`. - Depends on: T4.1

### Giai Đoạn 5: Kiểm Thử & Kiểm Chứng Hệ Thống (Verification)
- [x] **T5.1**: Chạy `pnpm exec tsc -b` trong `fe-react-thanhxuan-internal` xác nhận 0 lỗi biên dịch. - Depends on: T4.2
- [x] **T5.2**: Chạy `pnpm build` trong `fe-react-thanhxuan-internal` xác minh bundle tạo ra trong `dist/` thành công. - Depends on: T5.1
- [x] **T5.3**: Kiểm tra tương tác thực tế trên trình duyệt: Truy cập `/dang-nhap`, `/dang-ky`, đăng nhập tài khoản test và kiểm tra các trang điều hướng không bị lỗi. - Depends on: T5.2

---

## 4. Verification & Testing

### 4.1 Lệnh Kiểm Tra Thực Tế
```bash
cd d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal

# 1. Typecheck TypeScript
pnpm exec tsc -b

# 2. Build Production Bundle
pnpm build
```

### 4.2 Kịch Bản Test (Test Cases)
- **Happy Path 1 (Đăng nhập / Đăng ký)**:
  - Truy cập `http://localhost:3001/dang-nhap` ➔ Hiển thị AuthLayout + Form đăng nhập.
  - Chuyển sang `http://localhost:3001/dang-ky` ➔ Hiển thị AuthLayout + Form đăng ký.
- **Happy Path 2 (Điều hướng tự động)**:
  - Đăng nhập tài khoản `admin` ➔ Tự động chuyển về `/tong-quan`.
  - Đăng nhập tài khoản `shipper1` ➔ Tự động chuyển về `/giao-nhan`.
- **Happy Path 3 (Phân hệ nội bộ)**:
  - Truy cập các màn hình `/kho`, `/nha-hang`, `/cham-cong`, `/giao-nhan`, `/giao-nhan/GN-TEST-001` ➔ Hiển thị đúng `AppLayout`, thanh điều hướng, bell thông báo và dữ liệu.
- **Edge Case (Bảo vệ đường dẫn & 404)**:
  - Chưa đăng nhập truy cập `/tong-quan` ➔ Bị redirect về `/dang-nhap`.
  - Truy cập đường dẫn không tồn tại `/khong-co-that` ➔ Bị redirect về `/` rồi tự chuyển hướng theo auth state.

### 4.3 Definition of Done
- Toàn bộ cây thư mục `src/app/` được tạo mới theo mô hình App Router chuẩn mực.
- File `src/App.tsx` được thu gọn tối giản.
- Lệnh `pnpm exec tsc -b` và `pnpm build` pass 100% với exit code 0.
- Không phát sinh hồi quy (regression) giao diện hay tính năng.

---

## 5. Risks & Rollback

| Rủi ro | Mức độ | Biện pháp giảm thiểu |
| :--- | :---: | :--- |
| Trùng lặp thẻ `<main>` hoặc padding giữa Layout và Page | Thấp | Bóc tách rõ ràng: AuthLayout quản lý màn hình nền và căn giữa; Page con chỉ quản lý Card container. |
| Re-render thừa khi di chuyển Providers sang RootLayout | Thấp | Cấu trúc Provider trong `layout.tsx` được giữ nguyên thứ tự như trong `App.tsx` cũ (`Theme` ➔ `QueryClient` ➔ `Auth`). |
| Đường dẫn dynamic route `giao-nhan/:recordCode` bị lệch | Thấp | Đặt tên thư mục `src/app/(internal)/giao-nhan/[recordCode]/page.tsx` và map chính xác param `:recordCode` trong `router.tsx`. |

- **Phương án Rollback**: Nếu phát sinh lỗi không mong muốn, khôi phục lại file [App.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/App.tsx) và xóa thư mục `src/app/`.

---

## Changelog
- 2026-10-04: Khởi tạo kế hoạch kỹ thuật Plan 6 - Tái cấu trúc `fe-react-thanhxuan-internal` sang mô hình App Router.

---

## 6. Execution Log
- **2026-10-04**:
  - Đã khởi tạo hoàn chỉnh cây thư mục `src/app/` gồm `layout.tsx`, `page.tsx`, `router.tsx`.
  - Đã xây dựng nhóm route `src/app/(auth)/` với `layout.tsx` (background, theme toggle) và 2 entry pages `dang-nhap/page.tsx`, `dang-ky/page.tsx`. Tinh chỉnh `LoginPage.tsx` và `RegisterPage.tsx` kế thừa sạch sẽ.
  - Đã xây dựng nhóm route `src/app/(internal)/` với `layout.tsx` (`ProtectedRoute` + `AppLayout`) và 11 trang nghiệp vụ chuẩn RBAC.
  - Đã cấu hình Centralized Route Tree `src/app/router.tsx` bằng `createBrowserRouter` và thu gọn `App.tsx` còn 7 dòng.
  - Kiểm tra verification: `pnpm exec tsc -b` (0 lỗi), `pnpm build` (bundle PWA thành công với 11 entries precache), kiểm thử tự động trên browser luồng đăng nhập `admin` và điều hướng `/tong-quan` hoạt động hoàn hảo.
  - Đã đồng bộ tài liệu kiến trúc hệ thống [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md).

