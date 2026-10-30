# Plan 46: Vá Toàn Bộ 8 Lỗ Hổng Bảo Mật & Tối Ưu Hiệu Năng Phân Hệ Laundry (Frontend & Backend)

> Status: Done | Created: 2026-10-28 | Target: `be-nestjs-thanhxuan` (`src/modules/laundry`), `fe-nextjs-thanhxuan-laundry` (`src/`) & `.agents/docs/`

---

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Phạm vi (Scope)
Kế hoạch này khắc phục triệt để toàn bộ 8 phát hiện an ninh bảo mật và các điểm nghẽn hiệu năng cốt lõi được phát hiện trong quá trình kiểm toán phân hệ Laundry:
1. **Thiếu RBAC Guard (Critical):** Kích hoạt `RolesGuard` và `@Roles('admin')` cho các controller nhạy cảm (`users`, `settings`, `articles`, `email-marketing`, `zalo-marketing`). Chặn đứng nguy cơ leo thang đặc quyền từ tài khoản `staff`.
2. **IDOR & Bảo vệ mật khẩu (Critical):** Khóa endpoint `PUT /users/:id/profile`, kiểm tra quyền sở hữu (`req.user.userId === id`) hoặc quyền Admin; loại bỏ việc cho phép đổi mật khẩu tự do qua API profile mà không xác thực mật khẩu cũ.
3. **Ẩn dữ liệu nhạy cảm Schema (High):** Thiết lập `select: false` cho `passwordHash` và `refreshToken` trong `User` Schema; cập nhật `UsersRepository` để nạp tường minh qua `.select('+passwordHash')` khi đăng nhập.
4. **Bảo vệ Proxy Upload & Xóa File (High):** Thêm kiểm tra xác thực cookie `admin_access_token` tại Route Handler `POST /api/upload` và `DELETE /api/upload` trên Frontend Next.js.
5. **Sửa lỗi Cookie bảo mật (High):** Khắc phục lỗi `isVercel || (production && false)` thành `secure: process.env.NODE_ENV === 'production'` và bổ sung `sameSite: 'lax'` tại `middleware.ts` và `admin-auth.action.ts`.
6. **Bảo vệ Webhook Zalo (High):** Thêm cơ chế xác thực Secret Token / Signature cho `POST /zalo/webhook`.
7. **Phòng chống ReDoS & Tối ưu truy vấn (Medium):** Sanitize ký tự đặc biệt Regex cho tìm kiếm trong `OrdersRepository` và `CrmRepository`. Thêm `.lean()` cho các truy vấn chỉ đọc.
8. **Chuẩn hóa múi giờ VN & An toàn mã đơn (Medium):** Chuẩn hóa hàm sinh mã đơn `generateNextOrderCode` theo múi giờ `Asia/Ho_Chi_Minh` bằng `getDatePrefixVN()` từ `date.util.ts`. Bảo vệ endpoint `POST /auth/logout` bằng `JwtAuthGuard`.

### 1.2. Out of Scope
- Chia tách 14 file vượt ngưỡng 300 dòng và dọn dẹp toàn bộ 293 lỗi ESLint (thực hiện tại **Plan 47**).

### 1.3. Bảng file ảnh hưởng (Affected Files)

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `be-nestjs-thanhxuan/src/modules/laundry/users/schemas/user.schema.ts` | Edit | Thêm `select: false` cho `passwordHash` và `refreshToken` |
| `be-nestjs-thanhxuan/src/modules/laundry/users/repositories/users.repository.ts` | Edit | Thêm `.select('+passwordHash')` cho login/auth và phương thức `findByIdWithPassword` |
| `be-nestjs-thanhxuan/src/modules/laundry/users/users.controller.ts` | Edit | Thêm `RolesGuard`, `@Roles('admin')`, IDOR check cho profile |
| `be-nestjs-thanhxuan/src/modules/laundry/users/users.service.ts` | Edit | Loại bỏ seed default admin `admin / 123456` hardcoded trong log production |
| `be-nestjs-thanhxuan/src/modules/laundry/auth/auth.controller.ts` | Edit | Thêm `JwtAuthGuard` cho `logout`, lấy `userId` từ token thay vì body |
| `be-nestjs-thanhxuan/src/modules/laundry/settings/settings.controller.ts` | Edit | Thêm `RolesGuard`, `@Roles('admin')` cho `PUT /settings` |
| `be-nestjs-thanhxuan/src/modules/laundry/articles/articles.controller.ts` | Edit | Thêm `RolesGuard`, `@Roles('admin')` cho tạo, sửa, xóa bài viết |
| `be-nestjs-thanhxuan/src/modules/laundry/email-marketing/email-marketing.controller.ts` | Edit | Thêm `RolesGuard`, `@Roles('admin')` cho chạy chiến dịch |
| `be-nestjs-thanhxuan/src/modules/laundry/zalo-marketing/zalo-marketing.controller.ts` | Edit | Thêm `RolesGuard`, `@Roles('admin')` cho chạy chiến dịch |
| `be-nestjs-thanhxuan/src/modules/laundry/zalo/zalo.controller.ts` | Edit | Thêm header/token guard xác thực webhook |
| `be-nestjs-thanhxuan/src/modules/laundry/orders/repositories/orders.repository.ts` | Edit | Đổi sang `getDatePrefixVN()`, escape regex ReDoS, thêm `.lean()` |
| `be-nestjs-thanhxuan/src/modules/laundry/crm/repositories/crm.repository.ts` | Edit | Escape regex ReDoS, thêm `.lean()` |
| `be-nestjs-thanhxuan/src/modules/laundry/contacts/repositories/contacts.repository.ts` | Edit | Thêm `.lean()` cho truy vấn danh sách |
| `fe-nextjs-thanhxuan-laundry/src/app/api/upload/route.ts` | Edit | Kiểm tra `admin_access_token` trước khi upload/delete |
| `fe-nextjs-thanhxuan-laundry/src/middleware.ts` | Edit | Sửa `secure: process.env.NODE_ENV === 'production'`, thêm `sameSite: 'lax'`, ẩn chi tiết error |
| `fe-nextjs-thanhxuan-laundry/src/features/admin/auth/admin-auth.action.ts` | Edit | Sửa `secure` và `sameSite` cho cookies |
| `.agents/docs/DATABASE_DICTIONARY.md` | Edit | Cập nhật thuộc tính `select: false` cho bảng `users` |
| `.agents/docs/CODEBASE_ATLAS.md` | Edit | Đồng bộ các guard mới trên controller |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | Edit | Cập nhật phân quyền RBAC cho module Laundry |
| `.agents/docs/SRS_SDD.md` | Edit | Ghi 1 dòng Document History |
| `.agents/docs/CHANGELOG.md` | Edit | Ghi nhật ký kỹ thuật chi tiết Plan 46 |

---

## 2. Technical Approach

### 2.1. Phân quyền RBAC & IDOR
- Sử dụng [`RolesGuard`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/auth/guards/roles.guard.ts) đã có sẵn kết hợp `@Roles('admin')`.
- Các route chỉ Admin mới được phép:
  - `POST /users`, `PUT /users/:id`, `DELETE /users/:id`
  - `PUT /settings`
  - `POST /email-marketing/campaigns/:id/run`
  - `POST /zalo-marketing/campaigns/:id/execute`
- Endpoint `PUT /users/:id/profile`:
  ```ts
  if (req.user.role !== 'admin' && req.user.userId !== id) {
    throw new ForbiddenException('Bạn không có quyền chỉnh sửa tài khoản này');
  }
  // Loại bỏ password khỏi payload update profile, yêu cầu dùng luồng change-password riêng
  delete updateData.password;
  ```

### 2.2. Schema Mongoose Security
- `user.schema.ts`:
  ```ts
  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ select: false })
  refreshToken?: string;
  ```
- `users.repository.ts`:
  - `findByUsername(username)`: giữ nguyên để lấy profile an toàn không kèm hash.
  - `findByUsernameWithPassword(username)`: bổ sung `.select('+passwordHash')` cho `AuthService.login()`.
  - `findByIdWithRefreshToken(id)`: bổ sung `.select('+refreshToken')` cho `AuthService.refreshTokens()`.

### 2.3. Frontend Upload Proxy Protection
- `app/api/upload/route.ts`:
  ```ts
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_access_token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  ```

### 2.4. Regex Sanitize Helper & Timezone VN
- Sử dụng helper escape regex chuẩn:
  ```ts
  function escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
  ```
- Thay thế `new Date().toISOString().slice(0, 10)` bằng `getDatePrefixVN()` từ `src/common/utils/date.util.ts`.

---

## 3. Implementation Tasks (Checklist)

- [x] T1: [Backend User Schema & Repo] - Thiết lập `select: false` cho `passwordHash` & `refreshToken` trong `user.schema.ts`; thêm `findByUsernameWithPassword` và `findByIdWithRefreshToken` trong `users.repository.ts`.
- [x] T2: [Backend Auth Service] - Cập nhật `auth.service.ts` để gọi các hàm repo mới kèm password/refresh token; thêm `@UseGuards(JwtAuthGuard)` cho `POST /auth/logout` và lấy `userId` từ `req.user.userId`.
- [x] T3: [Backend RBAC & IDOR] - Áp dụng `RolesGuard` và `@Roles('admin')` cho `UsersController`, `SettingsController`, `ArticlesController`, `EmailMarketingController`, `ZaloMarketingController`. Thêm IDOR protection cho `PUT /users/:id/profile`.
- [x] T4: [Backend Zalo Webhook] - Thêm token header validation cho `POST /zalo/webhook`.
- [x] T5: [Backend Order Code & Regex Sanitization] - Sửa `generateNextOrderCode` dùng `getDatePrefixVN`; escape regex trong `OrdersRepository`, `CrmRepository`; thêm `.lean()` cho `findAllOrders`, `findAllCustomers`, `findAllContacts`.
- [x] T6: [Frontend Upload Route Protection] - Thêm kiểm tra `admin_access_token` trong cookie cho `POST` và `DELETE` tại `fe-nextjs-thanhxuan-laundry/src/app/api/upload/route.ts`.
- [x] T7: [Frontend Secure Cookies] - Cập nhật `middleware.ts` và `admin-auth.action.ts` để đặt `secure: process.env.NODE_ENV === 'production'` và `sameSite: 'lax'`, loại bỏ rò rỉ mã lỗi ra URL query.
- [x] T8: [Verification & Docs Sync] - Chạy `tsc --noEmit`, test Jest laundry, test Next.js build. Cập nhật 5 trụ cột tài liệu và push lên nhánh `dev`.

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm chứng
- **Backend:**
  - `pnpm exec tsc --noEmit`
  - `pnpm test modules/laundry`
  - `pnpm build`
- **Frontend Laundry:**
  - `pnpm exec tsc --noEmit`
  - `pnpm build`

### 4.2. Kịch bản kiểm thử (Test Scenarios)
1. User role `staff` đăng nhập cố gắng gọi `POST /users` hoặc `PUT /settings` -> Trả về `403 Forbidden`.
2. User cố gắng gọi `PUT /users/:id/profile` với `id` của user khác -> Trả về `403 Forbidden`.
3. Client không có cookie gọi `POST /api/upload` hoặc `DELETE /api/upload` -> Trả về `401 Unauthorized`.
4. Tìm kiếm với ký tự đặc biệt Regex `[a-z]+(` không gây sập server hay treo CPU.
5. Tạo đơn hàng vào các khung giờ sáng sớm (00h-07h) đảm bảo tiền tố mã đơn `HD-YYYYMMDD-` phản ánh đúng ngày hiện tại theo giờ Việt Nam.

---

## 5. Risks & Rollback

- **Rủi ro:** Khi đặt `select: false` cho `passwordHash`, nếu có nơi nào gọi `findByUsername` mà dựa vào passwordHash sẽ bị lỗi xác thực.
- **Giảm thiểu:** Đã rà soát và chuyển toàn bộ phương thức auth sang `findByUsernameWithPassword` có `.select('+passwordHash')`. Chạy test suite `auth.service.spec.ts` để bảo đảm 100% pass trước khi merge.

## Changelog
- 2026-10-28: Khởi tạo Plan 46.
