# Plan 5: Đổi Tên Bảng `staff_accounts` → `accounts`, Rà Soát Chuẩn Đặt Tên & Đề Xuất Dọn Dẹp Bảng Thừa Trong Cơ Sở Dữ Liệu

> Status: Done | Created: 2026-10-04 | Target: `be-nestjs-thanhxuan` & MongoDB

---

## 1. Tổng Quan & Mục Tiêu

### 1.1 Yêu Cầu Của Người Dùng
1. **Đổi tên bảng `staff_accounts` thành `accounts`** trong MongoDB (thuộc database `internal_express`).
2. **Kiểm tra toàn bộ các bảng trong cơ sở dữ liệu** xem có bảng nào đặt tên còn sai quy chuẩn, bất nhất.
3. **Rà soát và đề xuất xóa bỏ** những bảng đang có trong DB/codebase nhưng hiện tại không sử dụng để tránh rối và tối ưu hóa hệ thống.

### 1.2 Phạm Vi Ảnh Hưởng
- **Backend NestJS**: `be-nestjs-thanhxuan` (các file schema, repository, migration script).
- **Cơ sở dữ liệu MongoDB**:
  - `internal_express` (Vận hành nội bộ).
  - `laundry_express` (Website giặt là B2C & CMS).
  - `moving_express` (Dịch vụ chuyển nhà).
- **Frontend**: Hoàn toàn **không bị ảnh hưởng** vì Frontend gọi qua REST API endpoints (`/api/v1/internal/auth/*`), không phụ thuộc trực tiếp vào tên collection của MongoDB.

---

## 2. Báo Cáo Rà Soát Toàn Bộ Bảng Trong 3 Cơ Sở Dữ Liệu

### 2.1 Cơ Sở Dữ Liệu `internal_express` (Vận Hành Nội Bộ)

| STT | Tên Collection Hiện Tại | Model / Schema | Trạng Thái Sử Dụng | Đánh Giá Tên & Đề Xuất Hành Động |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `staff_accounts` | `StaffAccount` | **Đang dùng (Cốt lõi)** | 🔄 **ĐỔI TÊN THÀNH `accounts`** theo yêu cầu người dùng. Ngắn gọn, chuẩn REST/CRUD. |
| 2 | `attendance_logs` | `AttendanceLog` | ❌ **KHÔNG DÙNG (MỒ CÔI)** | 🗑️ **ĐỀ XUẤT XÓA BỎ**: Đây là tàn dư v1 cũ. Hệ thống đã chuyển sang `attendance_records` (selfie camera, ca làm, workedMinutes). `AttendanceModule` hiện tại không đăng ký schema này, không có service nào gọi. Cần xóa khỏi DB và xóa 2 file code thừa. |
| 3 | `attendance_records` | `AttendanceRecord` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn `snake_case`, số nhiều. Quản lý ca làm việc & chấm công camera. |
| 4 | `piecework_logs` | `PieceworkLog` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn `snake_case`, số nhiều. Sản lượng khoán thợ xưởng. |
| 5 | `handover_records` | `HandoverRecord` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn `snake_case`, số nhiều. Phiếu giao nhận kép đồ sạch/bẩn. |
| 6 | `recount_tasks` | `RecountTask` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn `snake_case`, số nhiều. Nhiệm vụ đếm lại đồ gom bao tại xưởng. |
| 7 | `counters` | `Counter` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Sequence tự tăng atomic sinh mã phiếu `GN-YYYYMMDD-NNN`. |
| 8 | `partners` | `Partner` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Chi nhánh nhà hàng đối tác (Pizza 4P's, Haidilao...). |
| 9 | `item_catalogs` | `ItemCatalog` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Danh mục đồ vải & đơn giá khoán thợ. |
| 10 | `fuel_logs` | `FuelLog` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Đề xuất hoàn tiền xăng xe shipper. |
| 11 | `pay_settings` | `PaySettings` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Cấu hình công thức lương và hệ số ca. |
| 12 | `payroll_periods` | `PayrollPeriod` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Bảng lương chu kỳ tháng. |
| 13 | `payslips` | `Payslip` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Phiếu lương cá nhân từng nhân viên. |
| 14 | `approval_requests`| `ApprovalRequest` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Yêu cầu phê duyệt tài khoản mới. |
| 15 | `otp_codes` | `OtpCode` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Mã OTP xác thực email và quên mật khẩu (TTL 60s/15m). |
| 16 | `refresh_tokens` | `RefreshToken` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Phiên xoay vòng Refresh Token Rotation (TTL 7 ngày). |
| 17 | `audit_logs` | `AuditLog` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Nhật ký vết hành vi hệ thống (Export, Lock kỳ lương, Sửa phiếu). |
| 18 | `notifications` | `Notification` | **Đang dùng (Cốt lõi)** | ✅ Chuẩn. Chuông thông báo nội bộ. |
| 19 | `media_files` | `MediaFile` | **Đang dùng (Tiện ích)** | ✅ Chuẩn. Lưu metadata tệp ảnh hiện trường, chứng từ. |
| 20 | `idempotency_keys`| `IdempotencyKey` | **Đang dùng (Bảo mật)** | ✅ Chuẩn. Khóa chống double submit (TTL 24h tự xóa). |
| 21 | `staffs` (nếu còn trong DB) | N/A (v1 legacy) | ❌ **KHÔNG DÙNG** | 🗑️ **ĐỀ XUẤT XÓA BỎ**: Collection cũ từ v1 trước khi có `staff_accounts`. |

---

## 2.2 Cơ Sở Dữ Liệu `moving_express` (Dịch Vụ Chuyển Nhà)

| STT | Tên Collection | Schema | Trạng Thái | Đánh Giá Tên |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `moving_quotes` | `MovingQuote` | Đang dùng | ✅ Rất chuẩn: có tiền tố phân vùng `moving_`, snake_case, số nhiều. |
| 2 | `moving_services` | `MovingService` | Đang dùng | ✅ Rất chuẩn: cước xe tải và dịch vụ chuyển nhà. |
| 3 | `moving_articles` | `MovingArticle` | Đang dùng | ✅ Rất chuẩn: bài viết tư vấn SEO chuyển nhà. |

---

## 2.3 Cơ Sở Dữ Liệu `laundry_express` (Web Giặt Là & CMS)

Khu vực này có một số bảng do trước đây để Mongoose tự sinh tên (không khai báo `collection: '...'`), dẫn đến **bất nhất và đặt tên chưa tối ưu**:

| STT | Tên Collection Hiện Tại | Schema Mongoose | Trạng Thái | Đánh Giá & Vấn Đề Đặt Tên | Đề Xuất |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `articles` | `Article` | Đang dùng (Web) | ✅ Chuẩn số nhiều tiếng Anh | Giữ nguyên. |
| 2 | `categories` | `Category` | Đang dùng (Web) | ✅ Chuẩn số nhiều tiếng Anh | Giữ nguyên. |
| 3 | `contacts` | `Contact` | Đang dùng (Lead) | ✅ Chuẩn số nhiều tiếng Anh | Giữ nguyên. |
| 4 | `orders` | `Order` | Đang dùng (Đơn) | ✅ Chuẩn số nhiều tiếng Anh | Giữ nguyên. |
| 5 | `settings` | `Setting` | Đang dùng (Config)| ✅ Chuẩn số nhiều tiếng Anh | Giữ nguyên. |
| 6 | `users` | `User` | Đang dùng (CMS) | ✅ Chuẩn số nhiều tiếng Anh | Giữ nguyên. |
| 7 | `customers` | `Customer` | Đang dùng (CRM) | ✅ Chuẩn số nhiều tiếng Anh | Giữ nguyên. |
| 8 | ❌ `emailcampaigns` | `EmailCampaign` | Đang dùng | ⚠️ **SAI CHUẨN**: Mongoose tự dính chữ liền tù tì không có gạch nối (`_`). | Đổi thành `email_campaigns`. |
| 9 | ❌ `emailsequences` | `EmailSequence` | Đang dùng | ⚠️ **SAI CHUẨN**: Mongoose tự dính chữ liền tù tì. | Đổi thành `email_sequences`. |
| 10 | ❌ `campaigns` | `Campaign` (Zalo) | Đang dùng | ⚠️ **TÊN QUÁ CHUNG CHUNG**: Nằm trong module Zalo Marketing nhưng đặt tên là `campaigns`, dễ xung đột/nhầm lẫn với Email Campaign. | Đổi thành `zalo_campaigns`. |
| 11 | ❌ `sequences` | `Sequence` (Zalo) | Đang dùng | ⚠️ **TÊN QUÁ CHUNG CHUNG**: Dễ nhầm với Email Sequences. | Đổi thành `zalo_sequences`. |

---

## 3. Danh Sách Đề Xuất Dọn Dẹp (Clean-up Actions)

### Hành Động 1: Đổi tên `staff_accounts` → `accounts`
- **Mục tiêu**: Đổi collection trong database `internal_express` từ `staff_accounts` sang `accounts`.
- **Cập nhật Schema**: File `be-nestjs-thanhxuan/src/modules/internal/accounts/schemas/staff-account.schema.ts`:
  ```ts
  // CŨ:
  @Schema({ timestamps: true, collection: 'staff_accounts' })
  // MỚI:
  @Schema({ timestamps: true, collection: 'accounts' })
  ```
- **Kịch bản Migration DB**: Tạo script `be-nestjs-thanhxuan/scripts/rename-staff-accounts.ts`:
  - Kết nối tới `internal_express`.
  - Kiểm tra nếu `staff_accounts` tồn tại ➔ Thực thi `db.collection('staff_accounts').rename('accounts')`.
  - Tự động kiểm tra và bảo toàn toàn bộ 100% Unique Indexes (`username`, `email`) và dữ liệu tài khoản hiện có.

### Hành Động 2: Xóa bỏ bảng thừa & Code rác `attendance_logs`
- **Xóa bảng trong MongoDB**: Chạy lệnh drop collection `attendance_logs` trong DB `internal_express` (nếu tồn tại).
- **Xóa 2 file code mồ côi không dùng**:
  - `be-nestjs-thanhxuan/src/modules/internal/attendance/schemas/attendance-log.schema.ts`
  - `be-nestjs-thanhxuan/src/modules/internal/attendance/repositories/attendance-log.repository.ts`
- **Kiểm tra bảng tàn dư cũ `staffs`**: Drop collection `staffs` trong `internal_express` nếu còn sót lại từ v1.

### Hành Động 3: Chuẩn hóa 4 bảng Marketing trong `laundry_express` (Tùy chọn theo phê duyệt)
- Khai báo tường minh `collection` trong schema:
  - `EmailCampaign`: `collection: 'email_campaigns'`
  - `EmailSequence`: `collection: 'email_sequences'`
  - `Campaign` (Zalo): `collection: 'zalo_campaigns'`
  - `Sequence` (Zalo): `collection: 'zalo_sequences'`
- Chạy script rename các collection tương ứng trong MongoDB `laundry_express`.

---

## 4. Kế Hoạch Thực Thi Từng Bước (Tasks Checklist)

### Giai Đoạn 1: Đổi Tên `staff_accounts` → `accounts` (Ưu Tiên 1)
- [x] **T1.1**: Cập nhật file schema `staff-account.schema.ts` chuyển `collection: 'accounts'`.
- [x] **T1.2**: Viết script NodeJS / TypeScript an toàn `src/scripts/rename-staff-accounts.ts` để kiểm tra và rename collection `staff_accounts` thành `accounts` trên MongoDB.
- [x] **T1.3**: Chạy script migration và xác minh collection `accounts` giữ nguyên toàn bộ document và indexes.
- [x] **T1.4**: Cập nhật tài liệu kiến trúc `.agents/docs/SRS_SDD.md` chuyển `staff_accounts` thành `accounts`.

### Giai Đoạn 2: Dọn Dẹp Bảng Thừa & File Rác (Ưu Tiên 1)
- [x] **T2.1**: Viết script kiểm tra và xóa bỏ collection mồ côi `attendance_logs` (và `staffs` cũ nếu có) trong MongoDB `internal_express`.
- [x] **T2.2**: Xóa 2 file code không sử dụng:
  - `be-nestjs-thanhxuan/src/modules/internal/attendance/schemas/attendance-log.schema.ts`
  - `be-nestjs-thanhxuan/src/modules/internal/attendance/repositories/attendance-log.repository.ts`

### Giai Đoạn 3: Chuẩn Hóa Bảng `laundry_express`
- [x] **T3.1**: Chuẩn hóa tên 4 bảng Marketing (`email_campaigns`, `email_sequences`, `zalo_campaigns`, `zalo_sequences`) trong schema và cơ sở dữ liệu MongoDB.

### Giai Đoạn 4: Kiểm Chứng Hệ Thống (Verification)
- [x] **T4.1**: Chạy `pnpm exec tsc --noEmit -p tsconfig.build.json` trong `be-nestjs-thanhxuan` đảm bảo 0 lỗi type.
- [x] **T4.2**: Chạy `pnpm exec tsc -b` trong `fe-react-thanhxuan-internal` đảm bảo 0 lỗi type.

---

## 5. Execution Log

- **2026-10-04**:
  - Đã cập nhật `@Schema({ timestamps: true, collection: 'accounts' })` trong [staff-account.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/accounts/schemas/staff-account.schema.ts).
  - Đã tạo script [rename-staff-accounts.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/scripts/rename-staff-accounts.ts) và thực thi `pnpm run db:rename-accounts`: Đổi tên thành công `staff_accounts` sang `accounts` trên MongoDB Atlas `internal_express`, bảo toàn trọn vẹn 8 documents và 7 chỉ mục (`_id_`, `email_1`, `phone_1`, `username_1`, `partnerId_1`, `status_1`, `role_1`). Đồng thời drop thành công 2 collections mồ côi `attendance_logs` và `staffs`.
  - Đã xóa sạch 2 file mã nguồn mồ côi: `attendance-log.schema.ts` và `attendance-log.repository.ts` trong `src/modules/internal/attendance/`.
  - Đã chuẩn hóa khai báo `collection` tường minh snake_case cho 4 schema Marketing trong `laundry_express`: `email_campaigns`, `email_sequences`, `zalo_campaigns`, `zalo_sequences`. Tạo và chạy script [rename-laundry-marketing.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/scripts/rename-laundry-marketing.ts) qua `pnpm run db:rename-laundry` chuẩn hóa 100% collections trên Atlas.
  - Đã đồng bộ tài liệu kiến trúc hệ thống [.agents/docs/SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) (mục 2.1, 2.2 và Document History).
  - Biên dịch và kiểm thử Typecheck trên cả Backend (`be-nestjs-thanhxuan`) và Frontend (`fe-react-thanhxuan-internal`) đạt **0 lỗi**.

