# Plan 43: Vá Lỗ Hổng Bảo Mật Trọng Yếu (Critical/High), Khôi Phục 5 Luồng Nghiệp Vụ Đứt Gãy & Tối Ưu Kiến Trúc (`core`, `internal`, `fe-react-thanhxuan-internal`)

> Status: Done | Created: 2026-10-27 | Target: `be-nestjs-thanhxuan` (`src/modules/core`, `src/modules/internal`) & `fe-react-thanhxuan-internal` (`src/`)

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Phạm vi (Scope)
Thực hiện khắc phục toàn diện các lỗ hổng bảo mật mức **CRITICAL / HIGH**, sửa **5 lỗi đứt gãy luồng nghiệp vụ** và tối ưu kiến trúc/hiệu năng đã phát hiện qua đợt kiểm toán trong phạm vi 3 thư mục `be-nestjs-thanhxuan/src/modules/core`, `be-nestjs-thanhxuan/src/modules/internal` và `fe-react-thanhxuan-internal/src`:

1. **Vá 6 Lỗ hổng Bảo mật CRITICAL & 9 Lỗ hổng HIGH (Backend `core` & `internal`):**
   - **Bảo vệ `passwordHash` & `pay_profile` (`AuthModule`):** Đặt `select: false` cho `passwordHash`, bổ sung `PermissionsGuard` + `PayFieldFilterInterceptor` + kiểm tra ownership trên `AccountsController`, ẩn `passwordHash` khỏi `audit_logs.changes`, chặn leo thang đặc quyền (`Privilege Escalation`) lên `ADMIN`.
   - **Khôi phục `PayFieldFilterInterceptor` trên `ReportsController`:** Loại bỏ việc gọi trực tiếp `res.json()` trên các nhánh trả JSON khiến Interceptor bị bypass, đảm bảo `MANAGER` và `WAREHOUSE_MANAGER` không nhìn thấy doanh thu, đơn giá B2B và lương.
   - **Chặn NoSQL Operator Injection & Kiểm soát `PartnerScope` trên `HandoverModule`:** Khóa whitelist các trường được phép sửa tại `PATCH /handovers/:id/fields` (cấm tuyệt đối key chứa `$`), bổ sung kiểm tra ownership `record.partnerId === user.partnerId` và trạng thái khóa phiếu trên toàn bộ các API thao tác theo `:id`.
   - **Vá Path Traversal, Unrestricted Upload & Thiếu Guard tại `core` (`MediaModule`, `UploadModule`, `AiModule`, `NotificationsModule`):** Gắn Guard xác thực & phân quyền cho `MediaController`, `UploadController`, `AiController`; kiểm tra `resolvedPath.startsWith(baseDir)` trước khi xóa file vật lý; giới hạn kích thước file và chặn `.svg`/`.html` (Stored XSS); loại bỏ state toàn cục `this.currentProvider` gây Race Condition trong `AiService`; kiểm tra `recipientAccountId === accountId` khi đánh dấu đã đọc thông báo.
   - **Chống IP Spoofing, Regex Injection, HTML Injection & Auto-seed mật khẩu yếu:** Kiểm tra quyền `ADMIN` trên `GET /attendance/workshop-config` và không tin tưởng mù quáng `x-forwarded-for = 127.0.0.1`; escape regex trong `findAllAccounts`; escape HTML trong email; áp dụng rate-limit/cooldown cho `forgotPassword` và dùng `crypto.randomInt()`; chỉ chạy `seedDefaultAccounts` khi không phải môi trường `production` (hoặc bật cờ `SEED_DEFAULT_ACCOUNTS=true`).
2. **Sửa 5 Lỗi Đứt Gãy Nghiệp Vụ (Critical Bugs):**
   - Đồng bộ API Contract giữa `fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx` và Backend DTO (`code` thay cho `otp`, `oldPassword` thay cho `currentPassword`).
   - Sửa `PermissionsGuard` từ `.every()` (AND) sang `.some()` (OR) để khôi phục quyền truy cập hợp lệ cho `MANAGER`, `SHIPPER`, `PARTNER_STAFF`.
   - Thay thế `StaffJwtGuard` (gọi strategy `'staff-jwt'` không tồn tại) bằng `InternalJwtGuard` (`'internal-jwt'`).
   - Sửa `ArchiveService.cleanupOrphanedImages` để đối chiếu đầy đủ với `AttendanceRecord` và `FuelLog` (hoặc chỉ quét thư mục con `handovers/`), chấm dứt lỗi xóa nhầm ảnh chấm công và hóa đơn xăng sau 24 giờ.
   - Sửa tên trường dữ liệu trong `warehouse-report.service.ts` (`dirtyClothes.items`, `deliveryQuantity`), `partner-report.service.ts` (`deliveryQuantity || quantity`) và `report-export.service.ts` (`summary.days`, `summary.pieceQty`).
3. **Bảo mật & Tối ưu Kiến trúc Frontend + Múi giờ VN (`P1`):**
   - Chặn truy cập khi tài khoản ở trạng thái `PENDING_EMAIL` / `PENDING_APPROVAL` trong `ProtectedRoute.tsx`; bọc `<ProtectedRoute allowedRoles={[StaffRole.ADMIN]}>` cho route `/management/admin/workshop`; ẩn danh sách tài khoản mẫu trên `LoginPage.tsx` khi build Production (`import.meta.env.DEV`).
   - Cô lập `offline-queue.ts` theo `userId`, thêm khóa chống chạy song song (`isSyncing`), giới hạn `retryCount` với lỗi `4xx`, xóa cache `queryClient` và hàng đợi khi `logout()`, không xóa token khi lỗi mạng tạm thời (`!error.response`).
   - Chuẩn hóa toàn bộ các vị trí dùng `.toISOString()` gây lệch ngày UTC sang giờ Việt Nam (`Asia/Ho_Chi_Minh`).
   - Áp dụng Code Splitting (`React.lazy` + `Suspense`) trong `router.tsx`, đồng bộ `queryKey` invalidation, bổ sung DB Index cho `NotificationSchema` & `MediaFileSchema`, tối ưu N+1 query trong `PayrollService` và dọn dẹp các file re-export tạm thời.

### 1.2. Out of Scope & Open Questions
- **Out of Scope:**
  - Không thay đổi bất kỳ file nào ngoài 3 thư mục được chỉ định (`fe-react-thanhxuan-internal/src`, `be-nestjs-thanhxuan/src/modules/internal`, `be-nestjs-thanhxuan/src/modules/core`) và các file tài liệu/test đi kèm theo quy định Definition of Done.
  - Việc tách nhỏ 38 file vượt ngưỡng 300 dòng (như `handover-record.service.ts`, `HandoverExportHelper.ts`...) thành nhiều file nhỏ sẽ được tách riêng sang một Plan Refactor chuyên biệt tiếp theo để giữ diff của bản vá bảo mật P0/P1 gọn, dễ kiểm chứng và an toàn tuyệt đối.
- **Assumptions & Open Questions:**
  - **Q1:** Với `seedDefaultAccounts()` (`be-nestjs-thanhxuan/src/modules/internal/auth/services/account-seed.service.ts:30-132`), kế hoạch giả định chỉ chạy tự động khi `process.env.NODE_ENV !== 'production'` (hoặc khi bật `ENABLE_DEFAULT_SEED === 'true'`). Bạn có đồng ý với cơ chế này không?
  - **Q2:** Với 3 file re-export trong `src/modules/core/auth/` (`permissions.map.ts`, `current-user.decorator.ts`, `partner-scope.guard.ts`) và 17 dòng re-export alias trong `fe-react-thanhxuan-internal/src`, kế hoạch sẽ cập nhật toàn bộ nơi import trỏ thẳng về nguồn chuẩn và xóa bỏ hoàn toàn các re-export tạm thời theo đúng mục 4.9 `AGENTS.md`.

### 1.3. Bảng File Ảnh Hưởng (Affected Files)

| Path | Action | Lý do |
| :--- | :--- | :--- |
| `be-nestjs-thanhxuan/src/modules/core/auth/guards/permissions.guard.ts` | `edit` | Đổi `.every()` sang `.some()` (OR logic) cho `@Permissions(...)` (`line 33-35`). |
| `be-nestjs-thanhxuan/src/modules/core/auth/permissions.map.ts` | `delete` | Xóa file re-export tạm thời, trỏ import trực tiếp về `internal/common/constants/permissions.ts`. |
| `be-nestjs-thanhxuan/src/modules/core/auth/decorators/current-user.decorator.ts` | `delete` | Xóa file re-export tạm thời, trỏ import trực tiếp về `internal/common/decorators/current-user.decorator.ts`. |
| `be-nestjs-thanhxuan/src/modules/core/auth/guards/partner-scope.guard.ts` | `delete` | Xóa file re-export tạm thời, trỏ import trực tiếp về `internal/common/guards/partner-scope.guard.ts`. |
| `be-nestjs-thanhxuan/src/modules/core/media/media.controller.ts` | `edit` | Gắn `@UseGuards(InternalJwtGuard, PermissionsGuard)`, lấy `uploaderId` từ `@CurrentUser()`, giới hạn MIME/fileSize (`line 19-64`). |
| `be-nestjs-thanhxuan/src/modules/core/media/media.service.ts` | `edit` | Đổi `fs.writeFileSync` sang `fs.promises.writeFile`, chuẩn hóa tên file an toàn (`line 41-49`). |
| `be-nestjs-thanhxuan/src/modules/core/media/schemas/media-file.schema.ts` | `edit` | Thêm index `{ uploaderId: 1, createdAt: -1 }` (`line 34`). |
| `be-nestjs-thanhxuan/src/modules/core/upload/upload.module.ts` | `edit` | Thêm `limits: { fileSize: 20 * 1024 * 1024 }` và `fileFilter` chặn `.svg`/`.html` (`line 10-12`). |
| `be-nestjs-thanhxuan/src/modules/core/upload/upload.controller.ts` | `edit` | Gắn `@UseGuards(JwtAuthGuard, RolesGuard)` và kiểm tra magic bytes/MIME (`line 16-54`). |
| `be-nestjs-thanhxuan/src/modules/core/upload/upload.service.ts` | `edit` | Vá lỗi Path Traversal trong `deleteLocalFile`/`deleteFile` bằng kiểm tra prefix `path.resolve(uploadBaseDir) + path.sep`; whitelist đuôi file (`line 66-71, 196-253`). |
| `be-nestjs-thanhxuan/src/modules/core/ai/ai.controller.ts` | `edit` | Bổ sung `RolesGuard`, bỏ nhận `apiKey` qua query string, lấy `authorId` từ `req.user`, bỏ đổi state toàn cục (`line 99-183`). |
| `be-nestjs-thanhxuan/src/modules/core/ai/ai.service.ts` | `edit` | Loại bỏ mutable state `this.currentProvider` gây Race Condition, truyền `provider` theo từng request (`line 24, 60-68`). |
| `be-nestjs-thanhxuan/src/modules/core/ai/providers/gemini.provider.ts` | `edit` | Whitelist/encode `modelToUse`, đưa API key vào header `x-goog-api-key` thay vì query URL (`line 40, 120, 184`). |
| `be-nestjs-thanhxuan/src/modules/core/notifications/notifications.service.ts` | `edit` | Kiểm tra ownership `recipientAccountId === accountId` trong `markAsRead` (`line 48-51`). |
| `be-nestjs-thanhxuan/src/modules/core/notifications/schemas/notification.schema.ts` | `edit` | Bổ sung index `{ recipientAccountId: 1, readAt: 1, createdAt: -1 }` (`line 28`). |
| `be-nestjs-thanhxuan/src/modules/internal/common/guards/staff-jwt.guard.ts` | `delete` | Xóa Guard gọi `'staff-jwt'` không tồn tại, đồng bộ dùng `InternalJwtGuard`. |
| `be-nestjs-thanhxuan/src/modules/internal/common/upload/internal-upload.controller.ts` | `edit` | Đổi `StaffJwtGuard` sang `InternalJwtGuard`; sửa điều kiện lọc ảnh thành `&&` và chặn `image/svg+xml` (`line 16, 26-40`). |
| `be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts` | `edit` | Đặt `select: false` cho `passwordHash` (`line 68-69`). |
| `be-nestjs-thanhxuan/src/modules/internal/auth/repositories/staff-account.repository.ts` | `edit` | Thêm helper lấy tài khoản kèm `+passwordHash` chỉ dùng riêng cho luồng xác thực/đổi mật khẩu. |
| `be-nestjs-thanhxuan/src/modules/internal/auth/strategies/internal-jwt.strategy.ts` | `edit` | Kiểm tra biến môi trường JWT secret bắt buộc và xác minh tài khoản còn `ACTIVE` trong DB (`line 16-39`). |
| `be-nestjs-thanhxuan/src/modules/internal/auth/controllers/auth.controller.ts` | `edit` | Gắn `@UseGuards(InternalJwtGuard)` hoặc xử lý an toàn cho `POST /auth/logout` (`line 57-62`). |
| `be-nestjs-thanhxuan/src/modules/internal/auth/controllers/accounts.controller.ts` | `edit` | Gắn `PermissionsGuard`, `PayFieldFilterInterceptor`, kiểm tra ownership cho `GET /accounts/:id`, dùng DTO cho `approve` (`line 27-144`). |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-management.service.ts` | `edit` | Chặn leo thang đặc quyền `ADMIN`, loại bỏ `passwordHash` khỏi response và `audit_logs`, escape Regex search, thu hồi refresh token khi đổi role/password, bỏ gọi `cleanupExpiredLockedAccounts` trong `findAllAccounts` (`line 33-305`). |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-approval.service.ts` | `edit` | Kiểm tra phân cấp quyền khi duyệt tài khoản (`rolesOverride`), loại bỏ `passwordHash`, escape HTML email (`line 92-228`). |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-auth.service.ts` | `edit` | Dùng `crypto.randomInt` sinh OTP, thêm rate-limit/cooldown cho `forgotPassword`, escape HTML email (`line 118, 152, 271, 482-513`). |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/accounts.service.ts` | `edit` | Chỉ chạy `seedDefaultAccounts` khi không phải `production` (`line 24-26`). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/patch-fields.dto.ts` | `edit` | Validate chặt chẽ `fields` chống NoSQL Operator Injection (`line 13-15`). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts` | `edit` | Truyền `user` xuống các API `:id` để kiểm tra `PartnerScope` / Ownership (`line 148-384`). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts` | `edit` | Chặn key chứa `$` và whitelist trường trong `patchFields`; kiểm tra `partnerId` ownership và trạng thái khóa phiếu trên các hàm cập nhật lẻ; gom query `$in` chống N+1 (`line 177-189, 396-461, 891-1159`). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/repositories/handover-record.repository.ts` | `edit` | Bọc `{ $set: update, $inc: { version: 1 } }` an toàn trong `updateFieldsWithVersion` (`line 50-62`). |
| `be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.controller.ts` | `edit` | Gắn `@Permissions` cho `GET /attendance/workshop-config` hoặc ẩn `wifiIps` với role thường; đọc `req.ip` an toàn (`line 35-58`). |
| `be-nestjs-thanhxuan/src/modules/internal/archive/archive.controller.ts` | `edit` | Đổi `StaffJwtGuard` sang `InternalJwtGuard` (`line 18`). |
| `be-nestjs-thanhxuan/src/modules/internal/archive/archive.service.ts` | `edit` | Sửa `cleanupOrphanedImages` chỉ quét ảnh phiếu giao nhận hoặc đối chiếu cả `AttendanceRecord` & `FuelLog`; dùng `getDatePrefixVN` (`line 179-231`). |
| `be-nestjs-thanhxuan/src/modules/internal/reports/reports.controller.ts` | `edit` | Bỏ `res.json()` trực tiếp ở nhánh trả JSON để `PayFieldFilterInterceptor` hoạt động; kiểm tra ownership ở `exportHandoverPdf` (`line 31-302`). |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/warehouse-report.service.ts` | `edit` | Sửa đọc mảng `dirtyClothes.items` và `item.deliveryQuantity || item.quantity` (`line 53-92`). |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/partner-report.service.ts` | `edit` | Sửa đọc `item.deliveryQuantity ?? item.quantity` ở Chế độ 2 (`line 299`). |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/report-export.service.ts` | `edit` | Sửa đọc `p.summary?.days` và `p.summary?.pieceQty` (`line 126-129`). |
| `be-nestjs-thanhxuan/src/modules/internal/partners/partners.service.ts` | `edit` | Đổi `vnStart.toISOString().split('T')[0]` sang `getDatePrefixVN(vnStart)` (`line 149, 157`). |
| `be-nestjs-thanhxuan/src/modules/internal/payroll/payroll.controller.ts` | `edit` | Dùng `getDatePrefixVN().slice(0, 7)` thay cho `.toISOString().slice(0, 7)` (`line 87`). |
| `be-nestjs-thanhxuan/src/modules/internal/payroll/payroll.service.ts` | `edit` | Tối ưu N+1 query trong `calculatePayroll` bằng cách batch query theo khoảng thời gian (`line 71-365`). |
| `fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx` | `edit` | Đồng bộ payload `{ code }`, `{ oldPassword }`; chặn `setUser` khi `PENDING_*`; giữ session offline khi lỗi mạng; xóa IndexedDB & `queryClient` khi `logout` (`line 38-232`). |
| `fe-react-thanhxuan-internal/src/features/auth/ProtectedRoute.tsx` | `edit` | Chặn trạng thái `PENDING_EMAIL` / `PENDING_APPROVAL`; gọi `logout()` chuẩn khi tài khoản bị khóa (`line 31-65`). |
| `fe-react-thanhxuan-internal/src/features/auth/LoginPage.tsx` | `edit` | Chỉ hiển thị danh sách tài khoản demo khi `import.meta.env.DEV`; validate `from` redirect (`line 86-89, 247-338`). |
| `fe-react-thanhxuan-internal/src/lib/api-client.ts` | `edit` | Đảm bảo `processQueue` luôn được gọi trong `try/catch` của refresh token (`line 139-164`). |
| `fe-react-thanhxuan-internal/src/lib/offline-queue.ts` | `edit` | Gắn `userId` vào `OfflineMutation`, thêm mutex `isSyncing`, bỏ qua lỗi `4xx` không hợp lệ, thêm `clearOfflineQueue()` khi logout (`line 5-131`). |
| `fe-react-thanhxuan-internal/src/app/router.tsx` | `edit` | Áp dụng `React.lazy()` + `<Suspense>` cho các trang để tối ưu bundle size (`line 4-383`). |
| `fe-react-thanhxuan-internal/src/app/(internal)/management/admin/workshop.tsx` | `edit` | Bọc `<ProtectedRoute allowedRoles={[StaffRole.ADMIN]}>` (`line 5-7`). |
| `fe-react-thanhxuan-internal/src/app/(internal)/management/manager/approval.tsx` | `edit` | Đồng bộ `allowedRoles` bổ sung `WAREHOUSE_MANAGER`, xóa re-export thừa (`line 9-19`). |
| `fe-react-thanhxuan-internal/src/app/(internal)/management/manager/partner.tsx` | `edit` | Đồng bộ `allowedRoles` bổ sung `ACCOUNTANT` (`line 9`). |
| `fe-react-thanhxuan-internal/src/features/operations/reports/hooks/useReports.ts` | `edit` | Sửa lỗi lệch ngày cuối tháng trước do `.toISOString()` sang `getDateKeyVN()` (`line 83-95`). |
| `fe-react-thanhxuan-internal/src/features/operations/payroll/hooks/useMyPayslip.ts` | `edit` | Dùng `getTodayVN().slice(0, 7)` thay cho `.toISOString().slice(0, 7)` (`line 10`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx` | `edit` | Invalidate thêm `["warehouse-records"]` sau khi tạo/cập nhật phiếu (`line 351-354`). |
| `.agents/docs/DATABASE_DICTIONARY.md` | `edit` | Cập nhật index mới của `notifications` & `media_files` và thuộc tính `select: false` của `staff_accounts.passwordHash`. |
| `.agents/docs/CODEBASE_ATLAS.md` | `edit` | Cập nhật bản đồ Guard/Controller sau khi xóa các file re-export và `StaffJwtGuard`. |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | `edit` | Cập nhật đặc tả bảo mật Auth, Handover, Upload, Archive, Reports. |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | `edit` | Cập nhật kiến trúc Lazy Routing, Offline Queue isolation và Auth flow. |
| `.agents/docs/SRS_SDD.md` | `edit` | Ghi 1 dòng Document History cho Plan 43. |
| `.agents/docs/CHANGELOG.md` | `edit` | Ghi bài luận chi tiết toàn bộ các bản vá bảo mật và tối ưu kiến trúc của Plan 43. |

---

## 2. Technical Approach

### 2.1. Kiến trúc Bảo mật & Phân quyền (`Auth`, `RBAC`, `PayFieldFilter`, `PartnerScope`)
1. **Bảo vệ trường nhạy cảm (`passwordHash` & `pay_profile`):**
   - Trong `StaffAccountSchema`, đặt `@Prop({ required: true, select: false }) passwordHash: string;`.
   - Tại `AccountsController`, gắn `@UseGuards(InternalJwtGuard, PermissionsGuard)` và `@UseInterceptors(PayFieldFilterInterceptor)` ở cấp Controller.
   - Tại `GET /accounts/:id`, chỉ cho phép nếu `user.sub === id` hoặc user có quyền `PERMISSIONS.ACCOUNT_VIEW`.
2. **Sửa cơ chế Interceptor tại `ReportsController`:**
   - Khi `dto.exportFormat` không được truyền (trả về JSON cho giao diện web), method trả về trực tiếp `Promise<unknown>` (với `@Res({ passthrough: true }) res: Response`) để dữ liệu đi qua `PayFieldFilterInterceptor`, tự động cắt bỏ các trường tài chính (`unitPrice`, `grossAmount`, `netAmount`, `totalPay`, `amount`) đối với `MANAGER` và `WAREHOUSE_MANAGER`.
3. **Chống NoSQL Injection & Kiểm soát Ownership trên `HandoverRecordService`:**
   - Định nghĩa whitelist các prefix trường hợp lệ trong `patchFields` (`cleanClothes`, `dirtyClothes`, `notes`, `status`, `signatures`) và từ chối ngay (`BadRequestException`) nếu bất kỳ key nào bắt đầu bằng `$` hoặc chứa `__proto__` / `constructor`.
   - Trong `HandoverRecordRepository.updateFieldsWithVersion`, truyền `{ $set: update, $inc: { version: 1 } }` thay vì spread trực tiếp `{ ...update }`.
   - Thêm helper `assertHandoverAccess(record, user)` kiểm tra: nếu `user.role` là `PARTNER_MANAGER` / `PARTNER_STAFF` thì bắt buộc `String(record.partnerId) === String(user.partnerId)`; đồng thời chặn ghi đè số lượng/chữ ký khi phiếu đã khóa (`COMPLETED` / `LOCKED`).

```typescript
// Contract DTO đồng bộ giữa Frontend AuthContext và Backend Auth DTOs
export interface VerifyOtpPayload {
  email: string;
  code: string; // Đồng bộ với VerifyOtpDto.code
}
export interface ResetPasswordPayload {
  email: string;
  code: string; // Đồng bộ với ResetPasswordDto.code
  newPassword: string;
}
export interface ChangePasswordPayload {
  oldPassword: string; // Đồng bộ với ChangePasswordDto.oldPassword
  newPassword: string;
}
```

### 2.2. Cô lập Offline Queue & Bảo vệ Phiên Đăng Nhập trên PWA (`fe-react-thanhxuan-internal`)
```typescript
// Cấu trúc OfflineMutation cô lập theo người dùng trong IndexedDB
export interface OfflineMutation {
  id: string;
  userId: string; // Gắn chặt với user._id tạo thao tác
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data: unknown;
  headers?: Record<string, string>;
  createdAt: number;
  retryCount: number;
}
```
- Khi `syncOfflineQueue(currentUserId)` chạy: có biến khóa `isSyncing` chống gọi trùng từ 2 listener; chỉ đồng bộ các bản ghi có `mutation.userId === currentUserId`; nếu server trả lỗi `400`, `403`, `404`, `409`, `422` hoặc `retryCount >= 5` thì xóa khỏi queue để không treo lặp vô hạn.
- Khi `logout()`: gọi `clearOfflineQueue()` và `queryClient.clear()`.

---

## 3. Implementation Tasks (Checklist)

- [x] **T1: Vá bảo mật & dọn dẹp re-export trong `src/modules/core`** - Sửa `PermissionsGuard` sang `.some()`, xóa 3 file re-export trong `core/auth`, gắn Guard + giới hạn upload + vá Path Traversal trong `MediaModule` & `UploadModule`, loại bỏ mutable state trong `AiService`, kiểm tra ownership trong `NotificationsService`, bổ sung index cho `NotificationSchema` & `MediaFileSchema` - Depends on: none
- [x] **T2: Vá bảo mật `AuthModule` & `Common` trong `src/modules/internal`** - Đặt `select: false` cho `passwordHash`, xóa `StaffJwtGuard` (chuyển sang `InternalJwtGuard`), gắn `PermissionsGuard` + `PayFieldFilterInterceptor` cho `AccountsController`, chặn leo thang đặc quyền `ADMIN`, escape Regex & HTML email, dùng `crypto.randomInt` & rate-limit `forgotPassword`, sửa điều kiện lọc file trong `InternalUploadController` - Depends on: T1
- [x] **T3: Vá bảo mật & sửa lỗi nghiệp vụ trong `Handovers`, `Attendance`, `Archive`, `Partners`, `Payroll`, `Reports` (`src/modules/internal`)** - Chặn NoSQL Injection ở `patchFields`, bổ sung `assertHandoverAccess` cho các route `:id`, bảo vệ `workshop-config`, sửa `ArchiveService.cleanupOrphanedImages` không xóa nhầm ảnh xăng/chấm công, khôi phục `PayFieldFilterInterceptor` trên `ReportsController`, sửa tên trường báo cáo (`warehouse-report`, `partner-report`, `report-export`), sửa lỗi `.toISOString()` lệch ngày VN và tối ưu N+1 query trong `PayrollService` - Depends on: T1, T2
- [x] **T4: Đồng bộ API Contract, Bảo mật Auth/Route/Offline Queue & Tối ưu `fe-react-thanhxuan-internal/src`** - Sửa payload `verifyOtp`/`resetPassword`/`changePassword` trong `AuthContext.tsx`, chặn `PENDING_EMAIL`/`PENDING_APPROVAL` trong `ProtectedRoute.tsx`, bọc Guard cho `/management/admin/workshop`, ẩn tài khoản demo trên `LoginPage.tsx` ở Production, cô lập `offline-queue.ts` theo `userId` + mutex, sửa `.toISOString()` sang giờ VN, áp dụng `React.lazy()` trong `router.tsx`, đồng bộ `queryKey` invalidation và xóa các re-export dư thừa - Depends on: T2, T3
- [x] **T5: Kiểm thử Tự động (Lint, Typecheck, Unit Test, Build)** - Cập nhật/bổ sung unit test cho các thay đổi ở Backend và chạy full bộ lệnh `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` trên cả `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal` - Depends on: T1, T2, T3, T4
- [x] **T6: Đồng bộ 5 Trụ cột Tài liệu & Commit/Push nhánh `dev`** - Cập nhật `.agents/docs/DATABASE_DICTIONARY.md`, `.agents/docs/CODEBASE_ATLAS.md`, `.agents/docs/srs_sdd/srs_sdd_backend.md`, `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`, `.agents/docs/SRS_SDD.md`, `.agents/docs/CHANGELOG.md` và commit/push lên nhánh `dev` - Depends on: T5

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm thử bắt buộc
1. Tại `be-nestjs-thanhxuan/`:
   - `pnpm lint`
   - `pnpm exec tsc --noEmit`
   - `pnpm test`
   - `pnpm build`
2. Tại `fe-react-thanhxuan-internal/`:
   - `pnpm lint`
   - `pnpm exec tsc --noEmit`
   - `pnpm test`
   - `pnpm build`

### 4.2. Kịch bản kiểm thử (Happy Path & Edge Cases)
- **Bảo mật `Accounts` & `PayFieldFilter`:** Gọi `GET /api/v1/internal/accounts/:id` và `GET /api/v1/internal/reports/partner-reconciliation` bằng token của `MANAGER` $\rightarrow$ Không trả về `passwordHash`, không lộ `pay_profile`, `unitPrice`, `grossAmount`, `netAmount`.
- **Chống NoSQL Injection & Cross-Partner IDOR:** Gửi `PATCH /handovers/:id/fields` với key `$set` $\rightarrow$ Bị chặn `400 Bad Request`. Dùng tài khoản `PARTNER_STAFF` của đối tác A gọi `GET /handovers/:id` hoặc `PATCH /handovers/:id/dirty-items` của đối tác B $\rightarrow$ Bị chặn `403 Forbidden`.
- **Chống Path Traversal:** Gọi `deleteFile('/uploads/../../package.json')` $\rightarrow$ Bị từ chối và không chạm vào file ngoài thư mục `uploads`.
- **Luồng Auth & RBAC:** Xác thực OTP (`code`), đặt lại mật khẩu (`code`), đổi mật khẩu (`oldPassword`) từ Frontend hoạt động thành công 200 OK; `MANAGER` vào được trang duyệt công thợ `GET /piecework`; `SHIPPER` và `PARTNER_STAFF` cập nhật được `dirty-items`.
- **Báo cáo & Múi giờ VN:** Báo cáo kho (`warehouse-summary`), đối soát 1 đối tác (`partner-reconciliation`) và xuất Excel lương (`payroll-summary`) hiển thị đúng số lượng thực tế (> 0); chọn bộ lọc "Tháng trước" (`LAST_MONTH`) trên `useReports` lấy đủ ngày cuối tháng (30 hoặc 31).

### 4.3. Definition of Done
- Lint, typecheck, test và build pass 100% cho cả `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`.
- Xóa triệt để các file re-export tạm thời (`permissions.map.ts`, `current-user.decorator.ts`, `partner-scope.guard.ts`, `staff-jwt.guard.ts` và các alias re-export ở Frontend).
- Đồng bộ đầy đủ 5 trụ cột tài liệu (`DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`).
- Tự động commit với thông điệp tiếng Việt tự nhiên và push lên nhánh `dev`.

---

## 5. Risks & Rollback

- **Rủi ro 1:** Đặt `select: false` cho `passwordHash` có thể làm các hàm đăng nhập (`login`), đổi mật khẩu (`changePassword`) không đọc được `passwordHash` nếu quên `.select('+passwordHash')`.
  - *Giảm thiểu:* Tạo method chuyên biệt `findByUsernameOrEmailWithPassword` và `findByIdWithPassword` trong `StaffAccountRepository` có `.select('+passwordHash')` và kiểm thử kỹ bằng unit test.
- **Rủi ro 2:** Đổi `PermissionsGuard` từ `.every()` sang `.some()` có thể ảnh hưởng nếu có endpoint nào thực sự cần kiểm tra đồng thời 2 quyền.
  - *Giảm thiểu:* Đã rà soát toàn bộ các `@Permissions(...)` truyền nhiều tham số trong codebase — tất cả đều mang ngữ nghĩa OR (hoặc quyền này hoặc quyền kia).
- **Rollback:** Mọi thay đổi được kiểm soát trên nhánh `dev`, có thể `git revert` theo commit nếu phát sinh vấn đề tương thích.

## Changelog

- 2026-10-27: Khởi tạo Plan 43 tổng hợp lộ trình vá lỗ hổng bảo mật Critical/High, sửa 5 lỗi đứt gãy nghiệp vụ và tối ưu kiến trúc cho `core`, `internal` và `fe-react-thanhxuan-internal`.

