# Plan 18: Quản Lý Nhân Sự (CRUD, Tạm Khóa 60 Ngày, Phân Loại), Header Profile & Avatar Upload, và Đồng Bộ Test Accounts

> Status: Done | Created: 2026-10-08 | Completed: 2026-10-08 | Scope: be-nestjs-thanhxuan, fe-react-thanhxuan-internal

---

## 1. Overview & Affected Files

### 1.1. Mục Tiêu & Bối Cảnh
Người dùng yêu cầu nâng cấp hệ thống quản trị nhân sự và trải nghiệm cá nhân hóa trên hệ thống vận hành nội bộ (`fe-react-thanhxuan-internal` và `be-nestjs-thanhxuan`):
1. **Trang Đăng Ký (`/register` & `RegisterModal`):**
   - **BỎ hoàn toàn vai trò "Quản Lý Đối Tác" (`PARTNER_MANAGER`) khỏi màn hình đăng ký công khai.**
   - Tài khoản **Quản Lý Đối Tác CHỈ được tạo bởi `ADMIN` hoặc `MANAGER`** trong màn hình Quản lý nhân sự.
   - Trang Đăng Ký công khai chỉ cho phép tự đăng ký 3 vai trò thực thi:
     * **"NV Xưởng"** (`WORKER` - Giặt & Sấy)
     * **"NV Giao Hàng"** (`SHIPPER` - Giao đồ & Thu đồ)
     * **"Nhân Viên Đối Tác"** (`PARTNER_STAFF` - Đếm & Kiểm kê đồ quán, chọn Thương hiệu ➔ Chi nhánh)
   - Layout hiển thị 3 vai trò trực quan, rõ ràng trên mọi kích thước màn hình.
   - Backend `register()` công khai: Chặn đăng ký `PARTNER_MANAGER` (báo lỗi nếu client cố gửi).
2. **Trang Đăng Nhập (`/login`):** Tự động khởi tạo (Seed onModuleInit ở Backend) và cập nhật lưới tài khoản mẫu đầy đủ 8 vai trò (Admin, Quản lý xưởng, Quản lý kho, Kế toán trưởng, Tài xế giao nhận, Thợ xưởng, Quản lý đối tác, Nhân viên đối tác) với mật khẩu chuẩn `ThanhXuan@2026`, click là đăng nhập được ngay.
3. **Màn Hình Quản Lý Nhân Sự (`/management/manager/personnel`):**
   - Hỗ trợ đầy đủ các thao tác cho `ADMIN` và `MANAGER`:
     - **Thêm tài khoản:** Modal tạo tài khoản nhân sự với đầy đủ trường (Họ tên, email, phone, vai trò bao gồm cả `PARTNER_MANAGER`, thương hiệu & chi nhánh đối tác nếu có).
     - **Sửa tài khoản:** Modal cập nhật thông tin nhân sự.
     - **Tạm khóa tài khoản:** Chuyển trạng thái sang `LOCKED`, lưu thời điểm `lockedAt`. Cơ chế: **Nếu khóa đủ 60 ngày sẽ tự động xóa vĩnh viễn** (hiển thị số ngày còn lại trước khi xóa, dọn dẹp ở Backend).
     - **Xóa tài khoản:** Nút xóa tài khoản vĩnh viễn **dành riêng cho ADMIN** (MANAGER không có quyền xóa).
     - **Phân loại danh sách:** Bộ lọc Tabs phân loại tài khoản thông minh theo nhóm:
       * *Tất Cả*
       * *Ban Quản Trị & Kế Toán* (`ADMIN`, `MANAGER`, `ACCOUNTANT`)
       * *Vận Hành Xưởng & Kho* (`WAREHOUSE_MANAGER`, `WORKER`)
       * *Đội Ngũ Giao Hàng* (`SHIPPER`)
       * *Khối Đối Tác B2B* (`PARTNER_MANAGER`, `PARTNER_STAFF`)
       * *Tài Khoản Tạm Khóa* (`LOCKED`)
4. **Header Profile, Avatar & Popups:**
   - Góc trên bên phải của Header: Hiển thị Avatar, Tên người dùng và Huy hiệu phân quyền.
   - **Upload & Hiển Thị Avatar:** Tích hợp `UploadService` ở Backend (lưu Cloudinary thư mục `internal/avatars` tương tự `item-catalog`).
   - Click vào Profile/Avatar mở Dropdown Menu với 3 lựa chọn:
     - **Thông Tin Cá Nhân:** Popup modal xem và sửa thông tin (Họ tên, Email, SĐT, tải ảnh Avatar mới).
     - **Đổi Mật Khẩu:** Popup modal đổi mật khẩu (nhập mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới).
     - **Đăng Xuất:** Thoát phiên làm việc an toàn.

---

### 1.2. Danh Sách File Bị Ảnh Hưởng (Affected Files)

#### A. Backend (`be-nestjs-thanhxuan`)
- `src/modules/internal/auth/schemas/staff-account.schema.ts` (Bổ sung `lockedAt?: Date;`, đảm bảo `avatarUrl?: string;`)
- `src/modules/internal/auth/repositories/staff-account.repository.ts` (Thêm query tìm và xóa các tài khoản khóa quá 60 ngày)
- `src/modules/internal/auth/accounts.service.ts`:
  - `onModuleInit()`: Tự động seed 8 tài khoản mẫu nếu chưa có.
  - `register()`: Chặn tự đăng ký `PARTNER_MANAGER` (chỉ cho phép `WORKER`, `SHIPPER`, `PARTNER_STAFF`).
  - Thêm logic tự động dọn dẹp tài khoản khóa quá 60 ngày (`cleanupExpiredLockedAccounts`).
  - Bổ sung `deleteAccount(id, adminId)`: Ràng buộc chỉ ADMIN mới được xóa.
  - Bổ sung `updateProfile(userId, dto)` & `uploadAvatar(userId, file)`.
  - Cập nhật `getMe()` trả về `avatarUrl`, `lockedAt`.
  - Cập nhật `lockAccount()` ghi nhận `lockedAt = new Date()`.
- `src/modules/internal/auth/controllers/accounts.controller.ts`:
  - Endpoint `DELETE :id` (chỉ dành cho `ADMIN`).
  - Endpoint `PATCH me/profile` cập nhật thông tin cá nhân.
  - Endpoint `POST me/avatar` upload ảnh đại diện.
- `src/modules/internal/auth/dto/update-profile.dto.ts` (DTO mới sửa profile cá nhân).

#### B. Frontend Internal (`fe-react-thanhxuan-internal`)
- `src/types/index.ts` (Bổ sung `avatarUrl`, `lockedAt` vào `StaffUser` và `StaffAccount`)
- `src/features/auth/RegisterPage.tsx` & `RegisterModal.tsx` (Bỏ nút "QL Đối Tác", chỉ giữ 3 vai trò: NV Xưởng, NV Giao Hàng, Nhân Viên Đối Tác)
- `src/features/auth/LoginPage.tsx` (Đồng bộ tài khoản mẫu 8 vai trò: Admin, Manager, Warehouse, Accountant, Shipper, Worker, Partner Manager, Partner Staff)
- `src/features/management/auth/StaffManagementView.tsx` (Mở rộng toàn diện: Tabs phân loại vai trò, Modal thêm/sửa nhân sự hỗ trợ cả Quản lý đối tác, Chức năng Tạm khóa với đếm ngược 60 ngày, Nút xóa chỉ cho Admin)
- `src/components/layout/AppHeader.tsx` (Góc phải hiển thị Avatar, Tên, Phân quyền; tích hợp Profile Dropdown Menu)
- `src/features/auth/components/ProfileEditModal.tsx` (Modal xem/sửa thông tin cá nhân & upload avatar)
- `src/features/auth/components/ChangePasswordModal.tsx` (Modal đổi mật khẩu: Mật khẩu cũ, mới, xác nhận)
- `src/features/auth/AuthContext.tsx` (Bổ sung hàm `updateUserProfile` cập nhật tức thì state `user`)

---

## 2. Technical Architecture & Design Decisions

### 2.1. Phân Định Quyền Tạo Tài Khoản
- **Đăng ký công khai (`/register`):**
  - Chỉ cho phép: `WORKER`, `SHIPPER`, `PARTNER_STAFF`.
  - Backend `register()` xác thực nghiêm ngặt: nếu client gửi `role === 'PARTNER_MANAGER'` hoặc vai trò quản lý khác ➔ ném `BadRequestException('Tài khoản Quản lý chỉ được khởi tạo bởi Ban Quản Trị hoặc Quản Lý')`.
- **Khởi tạo Quản lý Đối tác (`PARTNER_MANAGER`):**
  - Thực hiện thông qua chức năng "Thêm Tài Khoản" trong màn hình Quản lý nhân sự (`/management/manager/personnel`).
  - `ADMIN` và `MANAGER` có thể chọn vai trò `PARTNER_MANAGER`, chọn Thương hiệu (`brand`) và Chi nhánh (`partnerId`) để cấp tài khoản.

### 2.2. Quy Tắc Tạm Khóa 60 Ngày & Tự Động Xóa Vĩnh Viễn
1. Khi bấm **Tạm Khóa**:
   - `status = 'LOCKED'`
   - `lockedAt = new Date()`
2. Khi bấm **Mở Khóa**:
   - `status = 'ACTIVE'`
   - `lockedAt = undefined`
3. Cơ chế 60 ngày:
   - Backend: Tự động dọn dẹp các tài khoản `status === 'LOCKED'` và `lockedAt <= now - 60 ngày`.
   - Frontend: Hiển thị trực quan: `Đã tạm khóa (Tự động xóa sau ${remainingDays} ngày)`.
4. Phân Quyền Thao Tác Tài Khoản:
   - `ADMIN` & `MANAGER`: Thêm tài khoản mới, Sửa thông tin tài khoản, Tạm khóa / Mở khóa tài khoản.
   - `ADMIN` (Độc quyền): Xóa vĩnh viễn tài khoản (`DELETE /accounts/:id`). Nút Xóa chỉ hiển thị với Admin.

### 2.3. Avatar Upload & Đồng Bộ Profile
1. **Upload Avatar:**
   - Dùng `UploadService` tải lên Cloudinary folder `internal/avatars`.
   - Nếu tài khoản đã có avatar cũ trên Cloudinary, tự động xóa avatar cũ để tiết kiệm dung lượng.
   - Trả về `avatarUrl` HTTPS CDN tối ưu.
2. **Dropdown Menu tại Header:**
   - Hiển thị tròn Avatar (nếu chưa có ảnh thì hiển thị 2 chữ cái viết tắt của tên trên nền gradient nhẹ).
   - Hiển thị Tên đầy đủ và Huy hiệu vai trò tương ứng.
   - Click mở Menu popover trực quan:
     * 👤 **Thông tin cá nhân**: Mở `ProfileEditModal` (cho phép đổi Họ tên, Số điện thoại, chọn ảnh đại diện từ máy tính).
     * 🔑 **Đổi mật khẩu**: Mở `ChangePasswordModal` (gửi request đến `/auth/change-password` với 3 trường).
     * 🚪 **Đăng xuất**: Gọi `logout()`.

### 2.4. Seed Dữ Liệu Test Accounts Tự Động
Backend `AccountsService.onModuleInit()` sẽ kiểm tra và khởi tạo sẵn 8 tài khoản (nếu chưa tồn tại) với mật khẩu chung `ThanhXuan@2026`:
- `admin` (Role: ADMIN)
- `manager` (Role: MANAGER)
- `warehouse_manager` (Role: WAREHOUSE_MANAGER)
- `accountant` (Role: ACCOUNTANT)
- `shipper` (Role: SHIPPER)
- `worker` (Role: WORKER)
- `partner_manager` (Role: PARTNER_MANAGER, Brand: PIZZA_4PS, Chi nhánh Pizza 4P's Bến Thành)
- `partner_staff` (Role: PARTNER_STAFF, Brand: PIZZA_4PS, Chi nhánh Pizza 4P's Bến Thành)

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn A: Backend Schemas, Cleanup Cron & APIs
- [x] T1: [be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts] - Bổ sung trường `lockedAt?: Date;`, đảm bảo `avatarUrl?: string;` trong schema và DTOs - Depends on: none
- [x] T2: [be-nestjs-thanhxuan/src/modules/internal/auth/accounts.service.ts] - Viết logic tự động Seed 8 tài khoản mẫu trong `onModuleInit()` và cơ chế tự động dọn dẹp tài khoản khóa quá 60 ngày - Depends on: T1
- [x] T3: [be-nestjs-thanhxuan/src/modules/internal/auth/accounts.service.ts, controllers/accounts.controller.ts] - Chặn tự đăng ký `PARTNER_MANAGER` trong `register()`, bổ sung API `DELETE /accounts/:id` (chỉ dành cho Admin), cập nhật `lockAccount`/`unlockAccount` ghi nhận `lockedAt` - Depends on: T1, T2
- [x] T4: [be-nestjs-thanhxuan/src/modules/internal/auth/accounts.service.ts, controllers/accounts.controller.ts, controllers/auth.controller.ts] - Thêm API cập nhật profile `PATCH /accounts/me/profile` và upload avatar `POST /accounts/me/avatar` qua Cloudinary UploadService - Depends on: T1

### Giai đoạn B: Frontend Demo Accounts & Register UI
- [x] T5: [fe-react-thanhxuan-internal/src/features/auth/RegisterPage.tsx, RegisterModal.tsx] - Bỏ vai trò Quản lý đối tác, chỉ hiển thị 3 vai trò (NV Xưởng, NV Giao Hàng, Nhân Viên Đối Tác) - Depends on: none
- [x] T6: [fe-react-thanhxuan-internal/src/features/auth/LoginPage.tsx] - Cập nhật 8 tài khoản mẫu chuẩn hóa (`admin`, `manager`, `warehouse_manager`, `accountant`, `shipper`, `worker`, `partner_manager`, `partner_staff`), kèm role & brand tương ứng - Depends on: none

### Giai đoạn C: Frontend Header Avatar, Profile Popup & Đổi Mật Khẩu
- [x] T7: [fe-react-thanhxuan-internal/src/types/index.ts, AuthContext.tsx] - Bổ sung `avatarUrl`, `lockedAt` vào `StaffUser`, thêm hàm `updateUserProfile` trong context - Depends on: none
- [x] T8: [fe-react-thanhxuan-internal/src/features/auth/components/ProfileEditModal.tsx, ChangePasswordModal.tsx] - Xây dựng Popup chỉnh sửa thông tin cá nhân (kèm upload ảnh avatar) và Popup đổi mật khẩu 3 trường - Depends on: T7
- [x] T9: [fe-react-thanhxuan-internal/src/components/layout/AppHeader.tsx] - Thiết kế lại góc phải Header: Hiển thị Avatar, Họ tên, Role badge và Menu popover (Thông tin cá nhân, Đổi mật khẩu, Đăng xuất) - Depends on: T8

### Giai đoạn D: Frontend Personnel Management (CRUD, Phân Loại, Khóa 60 Ngày & Xóa)
- [x] T10: [fe-react-thanhxuan-internal/src/features/management/auth/StaffManagementView.tsx] - Xây dựng Tabs phân loại vai trò, Modal Thêm nhân sự (hỗ trợ tạo cả Quản lý đối tác), Modal Sửa nhân sự, Tạm khóa (đếm lùi 60 ngày), Nút Xóa vĩnh viễn (chỉ cho Admin) - Depends on: T3, T7

### Giai đoạn E: Verification, Build & Documentation
- [x] T11: [Verify & Docs] - Chạy build pass 100% cả Backend và Frontend (`pnpm build`), cập nhật `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md` - Depends on: T1..T10

---

## 4. Verification & Testing

1. **Kiểm tra Đăng ký & Đăng nhập:**
   - Vào `/register`: Chỉ hiển thị 3 vai trò ("NV Xưởng", "NV Giao Hàng", "Nhân Viên Đối Tác"). Không còn nút "Quản Lý Đối Tác". Chọn "Nhân Viên Đối Tác" hiển thị cascade chọn Thương hiệu ➔ Chi nhánh.
   - Vào `/login`: Danh sách tài khoản test gồm 8 nút, bấm vào nút "QL Đối Tác" (`partner_manager`) hoặc "NV Đối Tác" (`partner_staff`) tự điền tài khoản và đăng nhập thành công.
2. **Kiểm tra Header & Profile Popup:**
   - Góc phải Header hiển thị Avatar tròn (hoặc chữ cái đại diện), Tên người dùng và Role badge.
   - Click vào Profile mở menu:
     * Chọn "Thông tin cá nhân": Sửa họ tên, SĐT, upload ảnh mới từ máy tính ➔ Avatar trên Header cập nhật ngay lập tức.
     * Chọn "Đổi mật khẩu": Nhập mật khẩu cũ, mật khẩu mới, xác nhận ➔ Đổi thành công.
     * Chọn "Đăng xuất": Đăng xuất về trang login.
3. **Kiểm tra Quản lý Nhân sự (`/management/manager/personnel`):**
   - Đăng nhập `manager`:
     * Thấy các Tabs phân loại tài khoản (Tất cả, Quản trị, Vận hành, Giao hàng, Đối tác, Tạm khóa).
     * Bấm "Thêm tài khoản" ➔ Có thể tạo tài khoản "Quản Lý Đối Tác" (chọn Brand và Chi nhánh đối tác).
     * Bấm "Sửa" ➔ Cập nhật thông tin thành công.
     * Bấm "Tạm khóa" ➔ Chuyển trạng thái `LOCKED`, hiển thị số ngày còn lại trước khi xóa.
     * Không thấy nút "Xóa vĩnh viễn" (vì là Manager).
   - Đăng nhập `admin`:
     * Thấy nút "Xóa vĩnh viễn" (màu đỏ) ➔ Bấm xóa có xác nhận và xóa thành công khỏi database.
4. **Kiểm tra Build:**
   - `be-nestjs-thanhxuan`: `pnpm build` ➔ Pass 100%.
   - `fe-react-thanhxuan-internal`: `pnpm build` ➔ Pass 100%.

---

## 5. Definition of Done (DoD)
1. Tự động seed và đăng nhập tức thì với 8 tài khoản mẫu ở trang Login.
2. Trang Register công khai chỉ còn 3 vai trò thực thi (đã bỏ Quản lý đối tác).
3. Tài khoản Quản lý đối tác chỉ được tạo bởi Admin hoặc Manager trong màn hình Personnel.
4. Header hiển thị Avatar, Tên, Role; dropdown popup chỉnh sửa thông tin (upload avatar) và đổi mật khẩu hoạt động trơn tru.
5. Quản lý nhân sự đầy đủ CRUD, Tabs lọc theo nhóm vai trò, tạm khóa hiển thị số ngày còn lại (tự động xóa sau 60 ngày), và chỉ riêng Admin mới có quyền xóa tài khoản.
6. Cả 2 phân hệ Backend và Frontend build pass 100%, đồng bộ tài liệu kiến trúc SRS/SDD và CHANGELOG.

---

## 6. Execution Log
- **2026-10-08**:
  - Hoàn tất 100% 11/11 tasks (T1 - T11).
  - Tinh gọn màn hình Đăng ký (`/register`), bỏ vai trò Quản lý đối tác, chỉ giữ 3 vai trò thực thi (NV Xưởng, NV Giao Hàng, NV Đối Tác).
  - Backend `register()` chặn đăng ký vai trò `PARTNER_MANAGER` / `RESTAURANT_MANAGER` (chỉ cho phép tạo qua Cổng Quản lý nhân sự).
  - Khởi tạo tự động 8 tài khoản mẫu (pass `ThanhXuan@2026`) khi Backend start (`onModuleInit()`), cập nhật lưới tài khoản mẫu 8 vai trò tại `LoginPage.tsx`.
  - Mở rộng màn hình Quản lý nhân sự (`/management/manager/personnel`): Tabs phân loại vai trò trực quan, Modal Thêm tài khoản (hỗ trợ tạo `PARTNER_MANAGER`), Modal Sửa tài khoản, Tạm khóa (hiển thị đếm lùi 60 ngày), Nút Xóa vĩnh viễn chỉ dành cho vai trò Admin (`DELETE /accounts/:id`).
  - Thiết kế cụm Profile trên Header góc phải: Avatar (hỗ trợ upload ảnh đại diện lên Cloudinary `internal/avatars`), Họ tên, Role badge, và Popover Dropdown menu (Popup sửa thông tin, Popup đổi mật khẩu 3 trường, Đăng xuất).
  - Chạy verify build:
    + `be-nestjs-thanhxuan`: `pnpm build` (`nest build`) ➔ Pass 100%.
    + `fe-react-thanhxuan-internal`: `pnpm exec tsc -b` & `pnpm build` (`vite build`) ➔ Pass 100%.
  - Hoàn tất đồng bộ tài liệu: `.agents/docs/srs_sdd/srs_sdd_backend.md`, `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`, `.agents/docs/SRS_SDD.md`, `.agents/docs/CHANGELOG.md`.

