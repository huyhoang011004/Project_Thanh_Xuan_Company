# TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG (SRS & SDD)

## HỆ SINH THÁI CÔNG NGHỆ CÔNG TY THANH XUÂN (THANH XUAN COMPANY)

_Phiên bản: 2.1_
_Synced: 2026-10-04 | Commit: 4bb4451_
_Phạm vi quét: Toàn bộ Monorepo (be-nestjs-thanhxuan, fe-react-thanhxuan-internal, fe-nextjs-thanhxuan-laundry)_
_Quy chuẩn kỹ thuật: Tuân thủ SOLID, Repository Pattern, Multi-Database Isolation, Clean Architecture, PWA Standards_

---

## 1. YÊU CẦU NGHIỆP VỤ & TÍNH NĂNG (SRS - SYSTEM REQUIREMENTS SPECIFICATION)

### 1.1. Bối cảnh & Mục Tiêu Nghiệp Vụ

Công ty Thanh Xuân mở rộng quy mô hoạt động từ dịch vụ giặt sấy truyền thống sang hệ sinh thái đa dịch vụ:

1. **Dịch vụ Giặt Sấy Chuyên Nghiệp & Marketing SEO (`thanhxuanlaundry.com`)**:
   - Web B2B phục vụ nhà hàng, spa, khách sạn.
   - Hệ thống bài viết SEO, liên hệ báo giá, CRM lead marketing.
2. **Dịch vụ Chuyển Nhà Trọn Gói & Cho Thuê Xe Tải (`chuyennhatietkiem.vn`)**:
   - Khảo sát báo giá chuyển trọ sinh viên, chuyển chung cư, văn phòng.
   - Bảng cước vận tải xe tải 1.25 tấn, 2.4 tấn theo cự ly Km.
3. **Quản Lý Vận Hành Xưởng Nội Bộ (`noibo.thanhxuanlaundry.com`)**:
   - Quản lý phiếu giao nhận kép (đồ sạch / đồ bẩn) cho các chuỗi đối tác ẩm thực lớn: Pizza 4P's, Haidilao Hotpot, Golden Gate.
   - Đối soát số lượng theo từng chi nhánh.
   - Ghi nhận định mức sản lượng (Piecework) tính lương thợ xưởng (phân loại, gấp khăn, ủi ép, đóng gói).
   - Chấm công nhân sự xưởng, tài xế giao nhận, quản lý xăng xe, bảng lương tự động và hệ thống xuất báo cáo streaming.

### 1.2. Danh Sách Phân Hệ Nghiệp Vụ Đã Triển Khai (Hoàn tất Plan 3)

- **Phân hệ Tài khoản, Xác thực & Phân quyền (Accounts & Auth v2)**:
  - Ma trận RBAC 8 vai trò (`SYSTEM_ADMIN`, `ACCOUNTANT`, `MANAGER`, `WAREHOUSE_MANAGER`, `BRANCH_MANAGER`, `SHIPPER`, `WORKER`, `RESTAURANT_STAFF`).
  - Đăng ký nhân viên nội bộ & nhân viên nhà hàng (gắn `partnerId`). Xác thực OTP email qua dịch vụ SMTP/Resend, cooldown 60 giây.
  - Xoay vòng Refresh Token Rotation (TTL 7 ngày), cơ chế khóa tài khoản tự động 15 phút sau 5 lần sai mật khẩu liên tiếp.
  - Phê duyệt tài khoản (`approval_requests`): Quản lý nhà hàng duyệt nhân viên nhà hàng cùng chi nhánh, Quản trị viên/Quản lý xưởng duyệt nhân sự nội bộ.
  - `PayFieldFilterInterceptor` đệ quy bóc tách toàn bộ trường tiền/lương khi user thiếu quyền `pay.view` (đặc biệt là Quản lý xưởng `MANAGER` và Quản lý kho `WAREHOUSE_MANAGER`).

- **Phân hệ Phiếu Giao Nhận Kép (Handover Module v2)**:
  - Quản lý phiếu giao nhận 2 chiều với cơ chế Khóa lạc quan (Optimistic Locking) qua trường `version`, chống xung đột đồng thời (trả về HTTP 409 Conflict).
  - Tự động nhận diện 2 chế độ đếm: `ON_SITE` (Đếm tại nhà hàng) và `AT_FACTORY` (Gom bao niêm phong đếm tại xưởng).
  - Quy trình đếm lại tại xưởng (`recount_tasks`): Thợ kho rạch bao đếm lại chi tiết, chụp ảnh đối chứng hiện trạng, tự động tính chênh lệch thừa/thiếu (`variance`).
  - Ký nhận điện tử trực tiếp trên Canvas (`SignatureCanvas` Base64 PNG), rà soát chỉnh sửa sau ký (`edit_marks`) kèm thông báo và audit log.
  - Hỗ trợ điều chỉnh sau hoàn tất (`adjustments`) đối với các khiếu nại phát sinh sau khi phiếu đã khóa.
  - Cron lúc 15:05 ngày hôm trước tự động tạo phiếu giao nhận theo lịch đối tác (`delivery_schedule`) và gán tài xế phụ trách mặc định (`defaultShipperId`), đảm bảo Idempotent.

- **Phân hệ Chấm Công & Khoán Việc (Attendance & Piecework v2)**:
  - Chấm công vào/ra ca (`attendance_records`): Bắt buộc chụp ảnh trực tiếp từ camera selfie của nhân viên (nén ảnh client), ghi nhận giờ chuẩn server múi giờ `Asia/Ho_Chi_Minh`. Ràng buộc mỗi nhân sự chỉ có duy nhất 1 ca `OPEN` tại một thời điểm (chặn trùng trả về 409 Conflict).
  - Cron 00:30 hàng ngày quét các ca làm việc quá 16 giờ chưa check-out chuyển sang trạng thái cảnh báo `NEEDS_REVIEW`. Quản trị viên có chức năng rà soát và điều chỉnh công.
  - Ghi nhận sản lượng khoán (`piecework_logs`): Bắt buộc nhân viên đang có ca làm việc `OPEN`. Tự động snapshot đơn giá (`rateSnapshot`) từ danh mục (`ItemCatalog`) tại thời điểm thợ làm việc (chống gian lận đơn giá client). Quản lý xưởng chốt duyệt cuối ngày (`CONFIRMED`).

- **Phân hệ Quản Lý Xăng Xe (Fuel Module)**:
  - Tài xế nộp đề xuất hoàn tiền xăng (`fuel_logs`): Bắt buộc chụp ảnh hóa đơn cây xăng và ảnh đồng hồ công-tơ-mét / vạch xăng xe.
  - Kế toán/Quản trị viên phê duyệt hoặc từ chối kèm lý do rõ ràng. Quản lý xưởng không có quyền xem số tiền xăng (bóc tách trường tiền).

- **Phân hệ Tính Lương & Bảo Mật Phiếu Lương (Payroll Module)**:
  - Cấu hình tiền lương (`pay_settings`): Hỗ trợ đầy đủ 4 loại hình (`HOURLY`, `PIECEWORK`, `HYBRID`, `MONTHLY_FIXED`), thiết lập hệ số ngày thường, chủ nhật, ngày lễ.
  - Tính toán bảng lương chu kỳ (`payroll_periods`): Tự động tổng hợp giờ công, sản lượng khoán, các khoản hoàn xăng đã duyệt, phụ cấp/thưởng/khấu trừ/tạm ứng. Làm tròn tiền số nguyên VND (`roundVnd`).
  - Khóa kỳ lương (`LOCKED`): Đóng băng toàn bộ dữ liệu nguồn (chấm công, sản lượng, xăng).
  - Bảo mật phiếu lương (`payslips`): Nhân viên chỉ xem được phiếu lương cá nhân của chính mình khi kỳ lương đã ở trạng thái `LOCKED` hoặc `PAID`. Tuyệt đối chặn User A xem phiếu User B.

- **Phân hệ Báo Cáo & Streaming Export (Reports Module)**:
  - 6 báo cáo chuyên sâu xây dựng bằng MongoDB Aggregation: Tổng hợp kho (`warehouse-summary`), Đối soát đối tác (`partner-reconciliation`), Chấm công & sản lượng (`attendance-summary`), Điểm giao shipper (`shipper-deliveries`), Chênh lệch & sự cố (`variance-incidents`), Chi phí xăng xe (`fuel-summary`).
  - Giới hạn khoảng thời gian truy vấn tối đa 31 ngày.
  - Streaming Export tối ưu tài nguyên VPS (< 512MB RAM): Xuất file Excel XLSX bằng `exceljs` ghi dòng streaming và file PDF bằng `pdfmake`. Hàng đợi concurrency = 1 chống tràn RAM VPS.

- **Phân hệ Giao Diện PWA Nội Bộ (`fe-react-thanhxuan-internal`)**:
  - Cấu hình Progressive Web App (PWA) với `vite-plugin-pwa`, `manifest.webmanifest`, Service Worker precache tài nguyên tĩnh (`workbox`).
  - Hàng đợi ngoại tuyến IndexedDB (`idb`) tự động đồng bộ khi có kết nối trở lại với `Idempotency-Key` (UUIDv4) và cơ chế Refresh Token Rotation tự động.
  - Đầy đủ màn hình chuyên biệt cho Nhà hàng, Kho, Tài xế, Thợ xưởng, Kế toán và Ban quản lý. Tuân thủ triệt để nguyên tắc bảo mật tài chính: Ẩn 100% các trường tiền đối với vai trò `MANAGER` và `WAREHOUSE_MANAGER`.

- **Phân hệ Chuyển Nhà Khảo Sát Báo Giá (`moving`)**:
  - Tiếp nhận đơn khảo sát đồ đạc, địa chỉ đi/đến, loại căn hộ, thang máy, ảnh chụp đồ đạc và ghi chú khảo sát (`moving_quotes`).

---

## 2. THIẾT KẾ KIẾN TRÚC & HỆ THỐNG (SDD - SYSTEM DESIGN DOCUMENT)

### 2.1. Cấu Trúc Tổng Thể Hệ Sinh Thái (Multi-Project Ecosystem)

```TypeScript
Website_Thanh_Xuan_Company/
├── be-nestjs-thanhxuan/                  (Backend API NestJS tập trung)
│   ├── src/
│   │   ├── common/                      (BaseRepository, Interceptors, Guards, Utilities)
│   │   ├── config/                      (app.config.ts, database.config.ts, jwt.config.ts)
│   │   ├── mail/                        (Dịch vụ gửi thông báo SMTP/Resend)
│   │   ├── modules/
│   │   │   ├── core/                    (upload, ai, audit, media, notifications, schedule, idempotency)
│   │   │   ├── laundry/                 (12 modules Giặt Là - DB: laundry_express)
│   │   │   ├── moving/                  (quotes, services, articles - DB: moving_express)
│   │   │   └── internal/                (Vận Hành Nội Bộ - DB: internal_express)
│   │   │       ├── accounts/            (accounts, otp_codes, refresh_tokens, approval_requests)
│   │   │       ├── partners/            (partners, item_catalogs)
│   │   │       ├── handover/            (handover_records, counters, recount_tasks, state-machine)
│   │   │       ├── piecework/           (piecework_logs)
│   │   │       ├── attendance/          (attendance_records)
│   │   │       ├── fuel/                (fuel_logs)
│   │   │       ├── payroll/             (pay_settings, payroll_periods, payslips)
│   │   │       ├── reports/             (6 aggregations, excel streaming, pdfmake export, export-queue)
│   │   │       └── common/              (upload, guards, interceptors)
│   │   └── app.module.ts                (Cấu hình 3 Mongoose Connections & RouterModule register)
│
├── fe-nextjs-thanhxuan-laundry/          (Web Khách Hàng thanhxuanlaundry.com & CMS - Next.js App Router)
├── fe-react-thanhxuan-internal/          (PWA Vận Hành noibo.thanhxuanlaundry.com - React + Vite + Tailwind)
│   ├── public/                          (icon.svg, favicon.ico)
│   ├── src/
│   │   ├── features/                    (auth, restaurant, warehouse, handover, fuel, attendance, piecework, payroll, management, dashboard)
│   │   ├── components/                  (layout, notifications, ui)
│   │   ├── lib/                         (api-client.ts, offline-queue.ts, permissions.ts, utils.ts)
│   │   └── types/                       (StaffRole, HandoverRecord, PieceworkDailyLog, PayrollPeriod, Payslip,...)
│   └── vite.config.ts                   (VitePWA configuration, workbox precache, vendor chunk splitting)
│
├── docker-compose.yml                    (Quản lý 4 container: mongodb, backend, frontend, internal_frontend)
└── .agents/docs/
    ├── SRS_SDD.md                       (Tài liệu kiến trúc hệ thống hiện hành)
    └── plan/                            (Kế hoạch kỹ thuật plan1, plan2, plan3)
```

### 2.2. Thiết Kế 3 Cơ Sở Dữ Liệu MongoDB Độc Lập

| Tên Database       | NestJS Connection                  | Module Phụ Trách                                                                                                                        | Collections                                                                                                                                                                                                                                                                                                        |
| :----------------- | :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `laundry_express`  | **Default Connection** (Không tên) | `src/modules/laundry/*` (12 modules)                                                                                                    | `articles`, `categories`, `contacts`, `crm`, `orders`, `settings`, `users`, `email_campaigns`, `email_sequences`, `zalo_campaigns`, `zalo_sequences`, `zalo`                                                                                                                                                       |
| `moving_express`   | `MOVING_CONNECTION`                | `src/modules/moving/*` (`quotes`, `services`, `articles`)                                                                               | `moving_quotes`, `moving_services`, `moving_articles`                                                                                                                                                                                                                                                              |
| `internal_express` | `INTERNAL_CONNECTION`              | `src/modules/internal/*` (`accounts`, `partners`, `handover`, `piecework`, `attendance`, `fuel`, `payroll`, `reports`, `notifications`) | `accounts`, `otp_codes`, `refresh_tokens`, `approval_requests`, `partners`, `item_catalogs`, `handover_records`, `counters`, `recount_tasks`, `piecework_logs`, `attendance_records`, `fuel_logs`, `pay_settings`, `payroll_periods`, `payslips`, `audit_logs`, `notifications`, `media_files`, `idempotency_keys` |

### 2.3. Cấu Trúc Sub-Modules & RouterModule Prefixes

Sử dụng `RouterModule.register` để phân tầng rõ rệt:

- **Module Giặt Là (Default)**: Giữ nguyên các endpoints gốc (`/articles`, `/orders`, `/categories`, `/contacts`...) để đảm bảo 100% không làm gãy website giặt là và CMS đang chạy.
- **Module Vận Chuyển (`moving`)**: Tiền tố `/api/v1/moving` (`/quotes`, `/services`, `/articles`).
- **Module Vận Hành Nội Bộ (`internal`)**: Tiền tố `/api/v1/internal` với 9 sub-modules con:
  - `/accounts`: Đăng nhập, đăng ký, OTP, đổi/quên mật khẩu, refresh token, phê duyệt tài khoản, quản lý nhân sự.
  - `/partners`: Chi nhánh đối tác, lịch giao hàng, bảng giá danh mục đồ vải.
  - `/handover`: Phiếu giao nhận kép, đếm tại nhà hàng, soạn đồ sạch tại kho, đếm lại, ký xác nhận, điều chỉnh.
  - `/piecework`: Chấm sản lượng khoán thợ xưởng, xác nhận chốt sản lượng.
  - `/attendance`: Chấm công camera selfie, rà soát ca làm việc bất thường.
  - `/fuel`: Nộp đề xuất hoàn tiền xăng, phê duyệt/từ chối xăng xe.
  - `/payroll`: Cấu hình tiền lương, tính bảng lương chu kỳ, đóng băng kỳ lương, tra cứu phiếu lương cá nhân.
  - `/reports`: 6 báo cáo phân tích tổng hợp MongoDB aggregation, xuất streaming file Excel XLSX & PDF.
  - `/notifications`: Chuông thông báo thời gian thực, đánh dấu đã đọc.
  - `/upload`: Tải ảnh hiện trường, chứng từ, hóa đơn (Cloudinary & Local uploads).

### 2.4. Tuân Thủ Repository Pattern (Rule 4.2 của dự án)

Tất cả các Model thuộc Named Connection đều được inject tại tầng **Repository** kế thừa `BaseRepository<T>`, tầng **Service** chỉ gọi qua Repository:

- **`internal_express`**:
  - `StaffAccountRepository extends BaseRepository<StaffAccountDocument>`
  - `OtpCodeRepository extends BaseRepository<OtpCodeDocument>`
  - `RefreshTokenRepository extends BaseRepository<RefreshTokenDocument>`
  - `ApprovalRequestRepository extends BaseRepository<ApprovalRequestDocument>`
  - `PartnerRepository extends BaseRepository<PartnerDocument>`
  - `ItemCatalogRepository extends BaseRepository<ItemCatalogDocument>`
  - `HandoverRecordRepository extends BaseRepository<HandoverRecordDocument>`
  - `RecountTaskRepository extends BaseRepository<RecountTaskDocument>`
  - `PieceworkLogRepository extends BaseRepository<PieceworkLogDocument>`
  - `AttendanceRecordRepository extends BaseRepository<AttendanceRecordDocument>`
  - `FuelLogRepository extends BaseRepository<FuelLogDocument>`
  - `PaySettingsRepository extends BaseRepository<PaySettingsDocument>`
  - `PayrollPeriodRepository extends BaseRepository<PayrollPeriodDocument>`
  - `PayslipRepository extends BaseRepository<PayslipDocument>`
  - `AuditLogRepository extends BaseRepository<AuditLogDocument>`
  - `NotificationRepository extends BaseRepository<NotificationDocument>`
  - _Ngoại lệ kỹ thuật kiến trúc_: `CounterRepository` không kế thừa `BaseRepository` vì đây là utility repository thực thi sequence generation atomic (`findByIdAndUpdate` kèm `$inc` và `upsert: true`), đảm bảo không có race-condition khi sinh mã phiếu `GN-YYYYMMDD-NNN`.
- **`moving_express`**:
  - `MovingQuoteRepository extends BaseRepository<MovingQuoteDocument>`
  - `MovingServiceRepository extends BaseRepository<MovingServiceDocument>`
  - `MovingArticleRepository extends BaseRepository<MovingArticleDocument>`

### 2.5. Đặc Tả Dữ Liệu, API Contracts & Ma Trận Phân Quyền Bảo Mật

#### A. Ma Trận Bảo Mật & Xác Thực (Authentication & Authorization)

| Tuyến API                                                                   | Phương thức               | Guard / Xác thực                          | Vai trò / Quyền hạn                                           | Mục đích & Ràng buộc bảo mật                                                                               |
| :-------------------------------------------------------------------------- | :------------------------ | :---------------------------------------- | :------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------- |
| **1. Xác thực & Tài khoản (`/api/v1/internal/auth`)**                       |                           |                                           |                                                               |                                                                                                            |
| `/api/v1/internal/auth/login`                                               | `POST`                    | Public                                    | Mọi nhân sự / Nhà hàng                                        | Đăng nhập nhân sự, cấp Access JWT (12h,`aud: 'internal'`) + Refresh Token (7d). Khóa 15 phút nếu sai 5 lần |
| `/api/v1/internal/auth/register`                                            | `POST`                    | Public                                    | `WORKER`, `SHIPPER`, `RESTAURANT_STAFF`                       | Đăng ký tài khoản (bắt buộc`partnerId` cho `RESTAURANT_STAFF`). Sinh mã OTP gửi email                      |
| `/api/v1/internal/auth/verify-otp`                                          | `POST`                    | Public                                    | Khách vừa đăng ký                                             | Xác thực mã OTP 6 số (cooldown 60s, giới hạn 5 lần/giờ). Chuyển trạng thái sang`PENDING_APPROVAL`          |
| `/api/v1/internal/auth/resend-otp`                                          | `POST`                    | Public                                    | Khách vừa đăng ký                                             | Gửi lại mã OTP (chặn nếu yêu cầu < 60s)                                                                    |
| `/api/v1/internal/auth/refresh`                                             | `POST`                    | Public (kèm Refresh Token)                | Mọi người dùng                                                | Xoay vòng Refresh Token Rotation, cấp cặp token mới                                                        |
| `/api/v1/internal/auth/logout`                                              | `POST`                    | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Thu hồi Refresh Token phiên hiện tại                                                                       |
| `/api/v1/internal/auth/forgot-password`                                     | `POST`                    | Public                                    | Mọi nhân sự                                                   | Gửi OTP 6 số qua email để đặt lại mật khẩu                                                                 |
| `/api/v1/internal/auth/reset-password`                                      | `POST`                    | Public                                    | Mọi nhân sự                                                   | Đặt lại mật khẩu mới bằng OTP (thu hồi toàn bộ Refresh Token cũ)                                           |
| `/api/v1/internal/auth/change-password`                                     | `POST`                    | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Đổi mật khẩu định kỳ, thu hồi phiên đăng nhập khác                                                         |
| `/api/v1/internal/auth/me`                                                  | `GET`                     | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Lấy thông tin cá nhân và quyền hạn từ token                                                                |
| `/api/v1/internal/auth/approvals`                                           | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`, `RESTAURANT_MANAGER`                      | Danh sách yêu cầu chờ duyệt (`RM` chỉ xem staff nhà hàng mình)                                             |
| `/api/v1/internal/auth/approvals/:id`                                       | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`, `RESTAURANT_MANAGER`                      | Phê duyệt hoặc từ chối tài khoản nhân viên                                                                 |
| `/api/v1/internal/auth/staffs`                                              | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`                                            | Xem danh sách toàn bộ nhân sự xưởng                                                                        |
| `/api/v1/internal/auth/staffs/:id`                                          | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`                                            | Chi tiết nhân viên theo ID                                                                                 |
| `/api/v1/internal/auth/staffs`                                              | `POST`                    | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`                                                       | Quản trị viên chủ động tạo tài khoản nhân sự                                                               |
| `/api/v1/internal/auth/staffs/:id`                                          | `PATCH`, `DELETE`         | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`                                                       | Cập nhật thông tin / Vô hiệu hóa tài khoản nhân sự                                                         |
| `/api/v1/internal/auth/staffs/:id/lock`                                     | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`                                                       | Khóa hoặc mở khóa thủ công tài khoản nhân sự                                                               |
| **2. Đối tác & Danh mục (`/api/v1/internal/partners`)**                     |                           |                                           |                                                               |                                                                                                            |
| `/api/v1/internal/partners`                                                 | `GET`                     | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Danh sách đối tác đang hoạt động                                                                           |
| `/api/v1/internal/partners/:id`                                             | `GET`                     | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Chi tiết đối tác theo ID                                                                                   |
| `/api/v1/internal/partners`                                                 | `POST`, `PATCH`, `DELETE` | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`                                            | Quản trị thông tin đối tác giặt là                                                                         |
| `/api/v1/internal/partners/schedule`                                        | `GET`                     | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Điểm giao trong ngày (DAILY + ALTERNATE_DAYS xen kẽ theo ngày VN)                                          |
| `/api/v1/internal/partners/catalogs`                                        | `GET`                     | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Danh mục mặt hàng đối tác và đơn giá khoán thợ                                                             |
| `/api/v1/internal/partners/catalogs`                                        | `POST`, `PATCH`, `DELETE` | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`                                                       | Quản trị danh mục và đơn giá khoán thợ                                                                     |
| **3. Phiếu Giao Nhận Kép (`/api/v1/internal/handover`)**                    |                           |                                           |                                                               |                                                                                                            |
| `/api/v1/internal/handover`                                                 | `POST`                    | `InternalJwtGuard` + `InternalRolesGuard` | `SHIPPER`, `ADMIN`, `MANAGER`                                 | Tạo phiếu giao nhận. Validate`itemCode` theo brand đối tác. `status = SCHEDULED`                           |
| `/api/v1/internal/handover`                                                 | `GET`                     | `InternalJwtGuard`                        | SHIPPER (chỉ xem của mình), RM/RS (chỉ chi nhánh mình), MG/AD | Danh sách phiếu giao nhận (lọc theo`date`, `shipperId`, `status`)                                          |
| `/api/v1/internal/handover/monthly`                                         | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `RESTAURANT_MANAGER`, `RESTAURANT_STAFF`, `ADMIN`             | Tra cứu bảng kê tháng cho nhà hàng (bảo mật ẩn hoàn toàn đơn giá)                                          |
| `/api/v1/internal/handover/:recordCode`                                     | `GET`                     | `InternalJwtGuard`                        | Mọi nhân sự trong phạm vi chi nhánh                           | Chi tiết phiếu giao nhận theo mã`GN-YYYYMMDD-NNN`                                                          |
| `/api/v1/internal/handover/clean-planned`                                   | `POST`                    | `InternalJwtGuard` + `InternalRolesGuard` | `WAREHOUSE_MANAGER`, `ADMIN`, `MANAGER`                       | Thủ kho ghi nhận số lượng đồ sạch dự kiến bàn giao tại kho xưởng                                           |
| `/api/v1/internal/handover/:id/clean-delivery`                              | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `SHIPPER`, `ADMIN`, `MANAGER`                                 | Cập nhật chi tiết đồ sạch bàn giao                                                                         |
| `/api/v1/internal/handover/:id/dirty-pickup`                                | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `SHIPPER`, `ADMIN`, `MANAGER`, `RESTAURANT_STAFF`             | Cập nhật chi tiết đồ bẩn thu gom (`ON_SITE` hoặc `AT_FACTORY`)                                             |
| `/api/v1/internal/handover/:id/sign`                                        | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `SHIPPER`, `ADMIN`, `MANAGER`                                 | Ký nhận bàn giao (Base64 PNG < 280KB) → chuyển trạng thái`IN_TRANSIT`                                      |
| `/api/v1/internal/handover/:id/deliver`                                     | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `SHIPPER`, `ADMIN`                                            | Tài xế xác nhận giao đồ sạch tới nhà hàng                                                                  |
| `/api/v1/internal/handover/:id/receipt-check`                               | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `RESTAURANT_MANAGER`, `RESTAURANT_STAFF`                      | Nhà hàng đối soát kiểm nhận đồ sạch (`ENOUGH`, `SHORT`, `EXCESS`)                                          |
| `/api/v1/internal/handover/:id/request-recount`                             | `POST`                    | `InternalJwtGuard` + `InternalRolesGuard` | `SHIPPER`, `RESTAURANT_MANAGER`, `ADMIN`                      | Tạo yêu cầu đếm lại đồ gom bao tại xưởng (`recount_tasks`)                                                 |
| `/api/v1/internal/handover/:id/complete-recount`                            | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `WAREHOUSE_MANAGER`, `ADMIN`                                  | Hoàn tất đếm lại tại xưởng kèm ảnh bao niêm phong                                                          |
| `/api/v1/internal/handover/:id/fields`                                      | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `SHIPPER`, `ADMIN`                                            | Sửa ô phiếu sau ký → tự động sinh`edit_marks`, audit log, bắn thông báo                                    |
| `/api/v1/internal/handover/:id/adjustments`                                 | `POST`                    | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`, `ACCOUNTANT`                              | Ghi nhận điều chỉnh sau khi phiếu hoàn tất do chênh lệch/sự cố                                             |
| `/api/v1/internal/handover/:id/review-edits`                                | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `MANAGER`, `ADMIN`                                            | Quản trị viên xác nhận đã rà soát các trường sửa đổi sau ký                                                |
| `/api/v1/internal/handover/:id/status`                                      | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | Theo State Machine                                            | Chuyển đổi trạng thái phiếu (`IN_TRANSIT` -> `COMPLETED`, `DISPUTED`)                                      |
| **4. Chấm Công & Khoán Việc (`/api/v1/internal/attendance`, `/piecework`)** |                           |                                           |                                                               |                                                                                                            |
| `/api/v1/internal/attendance/check-in`                                      | `POST`                    | `InternalJwtGuard`                        | Mọi nhân sự xưởng                                             | Check-in camera selfie (bắt buộc ảnh). Mỗi người chỉ 1 ca OPEN (trùng trả**409**)                          |
| `/api/v1/internal/attendance/check-out`                                     | `POST`                    | `InternalJwtGuard`                        | Mọi nhân sự xưởng                                             | Check-out ca làm việc kèm ảnh selfie. Tự tính`workedMinutes` chuẩn xác                                     |
| `/api/v1/internal/attendance/today`                                         | `GET`                     | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Trạng thái ca làm việc hiện tại của nhân sự                                                                |
| `/api/v1/internal/attendance/history`                                       | `GET`                     | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Lịch sử chấm công cá nhân                                                                                  |
| `/api/v1/internal/attendance`                                               | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`                                            | Bảng chấm công toàn xưởng                                                                                  |
| `/api/v1/internal/attendance/:id/review`                                    | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`                                            | Quản trị viên duyệt điều chỉnh ca công bất thường (`NEEDS_REVIEW`)                                         |
| `/api/v1/internal/piecework/me`                                             | `GET`                     | `InternalJwtGuard`                        | `WORKER`, Mọi nhân sự                                         | Xem sản lượng của chính mình trong ca hôm nay                                                              |
| `/api/v1/internal/piecework/me/tasks`                                       | `POST`                    | `InternalJwtGuard`                        | `WORKER`, Mọi nhân sự                                         | Ghi nhận sản lượng. Đơn giá snapshot tự động, hỗ trợ số âm sửa sai                                         |
| `/api/v1/internal/piecework`                                                | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`                                            | Danh sách sản lượng khoán toàn xưởng                                                                       |
| `/api/v1/internal/piecework/report`                                         | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`                                            | Báo cáo sản lượng khoán. Áp dụng bóc tách trường tiền với`MANAGER`                                         |
| `/api/v1/internal/piecework/:id/confirm`                                    | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`, `MANAGER`                                            | Quản lý xưởng xác nhận chốt sản lượng (`CONFIRMED`)                                                        |
| **5. Quản Lý Xăng Xe (`/api/v1/internal/fuel`)**                            |                           |                                           |                                                               |                                                                                                            |
| `/api/v1/internal/fuel`                                                     | `POST`                    | `InternalJwtGuard` + `InternalRolesGuard` | `SHIPPER`                                                     | Shipper nộp đề xuất hoàn tiền xăng (bắt buộc ảnh hóa đơn + ảnh vạch xăng)                                  |
| `/api/v1/internal/fuel/me`                                                  | `GET`                     | `InternalJwtGuard`                        | `SHIPPER`                                                     | Shipper xem danh sách các đề xuất xăng của chính mình                                                      |
| `/api/v1/internal/fuel`                                                     | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `ACCOUNTANT`, `ADMIN`                                         | Kế toán/Admin xem danh sách đề xuất xăng toàn đội xe (MG bị chặn trường tiền)                              |
| `/api/v1/internal/fuel/:id`                                                 | `PATCH`, `DELETE`         | `InternalJwtGuard` + `InternalRolesGuard` | `SHIPPER`                                                     | Shipper chỉnh sửa hoặc hủy đề xuất khi trạng thái còn`PENDING`                                             |
| `/api/v1/internal/fuel/:id/approve`                                         | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `ACCOUNTANT`, `ADMIN`                                         | Phê duyệt đề xuất xăng xe                                                                                  |
| `/api/v1/internal/fuel/:id/reject`                                          | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `ACCOUNTANT`, `ADMIN`                                         | Từ chối đề xuất xăng xe kèm lý do                                                                          |
| **6. Quản Lý Bảng Lương (`/api/v1/internal/payroll`)**                      |                           |                                           |                                                               |                                                                                                            |
| `/api/v1/internal/payroll/settings`                                         | `GET`, `PUT`              | `InternalJwtGuard` + `InternalRolesGuard` | `ACCOUNTANT`, `ADMIN`                                         | Cấu hình tham số tính lương và hệ số ngày công                                                             |
| `/api/v1/internal/payroll/periods/calculate`                                | `POST`                    | `InternalJwtGuard` + `InternalRolesGuard` | `ACCOUNTANT`, `ADMIN`                                         | Khởi tạo và tính toán bảng lương chu kỳ tháng                                                              |
| `/api/v1/internal/payroll/periods/:id/lock`                                 | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `ACCOUNTANT`, `ADMIN`                                         | Khóa kỳ lương (`LOCKED`), đóng băng dữ liệu nguồn                                                          |
| `/api/v1/internal/payroll/periods/:id/unlock`                               | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `ADMIN`                                                       | Mở khóa kỳ lương (chỉ Admin, bắt buộc ghi rõ lý do vào Audit Log)                                          |
| `/api/v1/internal/payroll/periods/:id/pay`                                  | `PATCH`                   | `InternalJwtGuard` + `InternalRolesGuard` | `ACCOUNTANT`, `ADMIN`                                         | Đánh dấu kỳ lương đã thanh toán hoàn tất (`PAID`)                                                          |
| `/api/v1/internal/payroll/me/payslips`                                      | `GET`                     | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Nhân viên xem phiếu lương cá nhân của chính mình (chỉ kỳ`LOCKED`/`PAID`)                                   |
| **7. Báo Cáo & Xuất File (`/api/v1/internal/reports`)**                     |                           |                                           |                                                               |                                                                                                            |
| `/api/v1/internal/reports/warehouse-summary`                                | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `WM`, `AC`, `MG`, `AD`                                        | Báo cáo tổng hợp xuất nhập kho theo khoảng ngày (≤ 31 ngày)                                                |
| `/api/v1/internal/reports/partner-reconciliation`                           | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `AC`, `MG`, `AD`                                              | Báo cáo đối soát giao nhận với đối tác nhà hàng                                                            |
| `/api/v1/internal/reports/attendance-summary`                               | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `MG`, `AD`                                                    | Báo cáo chấm công & sản lượng (hoàn toàn không có trường tiền)                                             |
| `/api/v1/internal/reports/shipper-deliveries`                               | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `AC`, `MG`, `AD`                                              | Báo cáo lịch trình các điểm giao nhận của shipper                                                          |
| `/api/v1/internal/reports/variance-incidents`                               | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `MG`, `AD`                                                    | Báo cáo chênh lệch số lượng, đồ rách hỏng và sửa đổi sau ký                                                |
| `/api/v1/internal/reports/fuel-summary`                                     | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `AC`, `AD`                                                    | Báo cáo chi phí xăng xe và tổng Km vận hành                                                                |
| `/api/v1/internal/reports/export/excel`                                     | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `WM`, `AC`, `MG`, `AD`                                        | Xuất file XLSX streaming (`exceljs`), hàng đợi concurrency = 1                                             |
| `/api/v1/internal/reports/export/pdf`                                       | `GET`                     | `InternalJwtGuard` + `InternalRolesGuard` | `WM`, `AC`, `MG`, `AD`                                        | Xuất file PDF streaming (`pdfmake`), hàng đợi concurrency = 1                                              |
| **8. Thông Báo & Tệp Tin (`/api/v1/internal/notifications`, `/upload`)**    |                           |                                           |                                                               |                                                                                                            |
| `/api/v1/internal/notifications`                                            | `GET`                     | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Danh sách thông báo cá nhân (Polling 60s)                                                                  |
| `/api/v1/internal/notifications/:id/read`                                   | `PATCH`                   | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Đánh dấu 1 thông báo đã đọc                                                                                |
| `/api/v1/internal/notifications/read-all`                                   | `PATCH`                   | `InternalJwtGuard`                        | Mọi nhân sự                                                   | Đánh dấu toàn bộ thông báo đã đọc                                                                          |
| `/api/v1/internal/uploads`                                                  | `POST`                    | `InternalJwtGuard`                        | `SHIPPER`, `WORKER`, `ADMIN`                                  | Tải ảnh hiện trạng lên Cloudinary/Local (Multer 5MB)                                                       |
| **9. Nhóm API Chuyển Nhà (`/api/v1/moving`)**                               |                           |                                           |                                                               |                                                                                                            |
| `/api/v1/moving/quotes`                                                     | `POST`                    | Public +`ThrottlerGuard` (5 req/phút)     | Khách đặt lịch                                                | DTO Whitelist, tính`estimatedPrice` theo bảng cước hoặc fallback                                           |
| `/api/v1/moving/quotes/estimate`                                            | `POST`                    | Public                                    | Khách tham khảo                                               | Tính nhanh giá cước chuyển nhà không lưu DB                                                                |
| `/api/v1/moving/quotes` (List/Detail/Patch)                                 | `GET`, `PATCH`            | Admin`JwtAuthGuard`                       | Quản trị viên (Admin)                                         | Bảo vệ PII khách hàng, cập nhật báo giá chính thức`quotedPrice`                                            |
| `/api/v1/moving/services`                                                   | `GET`                     | Public                                    | Khách hàng                                                    | Bảng cước vận tải xe tải đang hoạt động                                                                    |
| `/api/v1/moving/services`                                                   | `POST`, `PATCH`, `DELETE` | Admin`JwtAuthGuard`                       | Quản trị viên (Admin)                                         | Quản lý bảng cước xe tải và phụ phí                                                                        |
| `/api/v1/moving/articles`                                                   | `GET`                     | Public                                    | Khách hàng                                                    | Danh sách bài viết tư vấn SEO chuyển nhà (`status = PUBLISHED`)                                            |
| `/api/v1/moving/articles/:slug`                                             | `GET`                     | Public                                    | Khách hàng                                                    | Chi tiết bài viết SEO theo slug                                                                            |
| `/api/v1/moving/articles`                                                   | `POST`, `PATCH`, `DELETE` | Admin`JwtAuthGuard`                       | Quản trị viên (Admin)                                         | Quản trị CMS bài viết SEO chuyển nhà (`DELETE` thực hiện Soft-delete)                                      |

#### B. Nhóm API Chuyển Nhà (`/api/v1/moving`)

- **POST `/api/v1/moving/quotes`**:
  - Request Body (DTO Whitelist chặt chẽ; server tự tính `estimatedPrice`, tự gán `status: PENDING_QUOTE`):
    ```json
    {
      "customerName": "Nguyễn Văn A",
      "phoneNumber": "0987654321",
      "pickup": {
        "address": "Tầng 5, Chung cư Royal City, Thanh Xuân, Hà Nội",
        "floor": 5,
        "hasElevator": true
      },
      "destination": {
        "address": "Số 25 ngõ 102 Khuất Duy Tiến, Hà Nội",
        "floor": 2,
        "hasElevator": false
      },
      "serviceType": "APARTMENT",
      "movingDate": "2026-10-15T08:00:00.000Z",
      "estimatedDistanceKm": 8.5,
      "bulkyItems": [
        { "code": "FRIDGE_LARGE", "name": "Tủ lạnh lớn", "quantity": 1 }
      ],
      "images": [],
      "notes": "Có tủ lạnh 400L",
      "context": {
        "sourceUrl": "https://chuyennhatietkiem.vn/dat-lich",
        "category": "moving"
      }
    }
    ```
  - Response Body: `201 Created` - Lưu vào database `moving_express`.
- **GET `/api/v1/moving/services`**: Bảng cước vận tải xe tải 1.25T - 2.4T và phụ phí tầng/đồ đạc.
- **GET `/api/v1/moving/articles`**: Bài viết tư vấn chuyển nhà SEO.

#### C. Nhóm API Vận Hành Nội Bộ (`/api/v1/internal`)

- **GET `/api/v1/internal/partners`**: Danh sách chi nhánh đối tác (yêu cầu Staff Token).
- **GET `/api/v1/internal/partners/catalogs?brand=PIZZA_4PS`**: Danh mục 7 loại khăn Pizza 4P's và đơn giá khoán thợ.
- **POST `/api/v1/internal/handover`**:
  - Yêu cầu: Header `Authorization: Bearer <staff_jwt_token>` (vai trò SHIPPER/ADMIN).
  - Request Body (Tuyệt đối KHÔNG chứa `shipperId` và `status` - server tự xử lý):
    ```json
    {
      "partnerId": "65b...ObjectId",
      "cleanDelivery": {
        "items": [{ "itemCode": "4PS_GRAY_TOWEL", "quantity": 350 }],
        "totalKg": 42.5
      },
      "dirtyPickup": {
        "items": [{ "itemCode": "4PS_GRAY_TOWEL", "quantity": 340 }],
        "countMode": "ON_SITE",
        "bagsCount": 0,
        "defectNotes": "Rách 2 khăn xám",
        "images": []
      }
    }
    ```
  - Response Body: Trả về phiếu giao nhận mới tạo kèm `recordCode` định dạng `GN-YYYYMMDD-001` (giờ Việt Nam `Asia/Ho_Chi_Minh`), `status = SCHEDULED`.

- **PATCH `/api/v1/internal/handover/:id/sign`**:
  - Ký nhận bàn giao điện tử trên mobile/tablet giữa tài xế và quản lý đối tác.
  - Request Body:
    ```json
    {
      "signature": "data:image/png;base64,iVBORw0KGgo...",
      "receivedByName": "Quản lý Nguyễn Văn B"
    }
    ```
  - Xử lý: Kiểm tra định dạng Base64 PNG, kích thước Base64 (< 280KB), cập nhật `receivedBySignature`, `receivedByName` và chuyển trạng thái sang `IN_TRANSIT` (đang trên đường vận chuyển về xưởng đối soát).

- **POST `/api/v1/internal/piecework/me/tasks`**:
  - Yêu cầu: Header `Authorization: Bearer <staff_jwt_token>`. `workerId` lấy từ token, KHÔNG gửi trong body.
  - Request Body (mỗi lần gọi gửi ĐÚNG 1 dòng `{ itemCode, quantity }`; đơn giá do server tự tra cứu từ Catalog, KHÔNG gửi `rate`. `quantity` cho phép SỐ ÂM để bù trừ/sửa sai, không cho phép bằng 0):
    ```json
    {
      "itemCode": "4PS_GRAY_TOWEL",
      "quantity": 500
    }
    ```
  - Xử lý: Tra `foldingRateWorker` từ `ItemCatalog`, tính `subtotal` cho dòng gửi lên, cộng dồn (`mergePieceworkTask`) vào bản ghi ngày hiện tại (múi giờ `Asia/Ho_Chi_Minh`) của thợ đang đăng nhập, cập nhật lại `totalEarnings`.

- **POST `/api/v1/internal/attendance/check-in`**:
  - Yêu cầu: Header `Authorization: Bearer <staff_jwt_token>`. `staffId` lấy từ token, KHÔNG gửi trong body.
  - Request Body (tất cả trường đều tùy chọn):
    ```json
    {
      "note": "Ca sáng 7h30"
    }
    ```
  - Xử lý: Nếu nhân viên đã có bản ghi chấm công trong ngày hôm nay (theo múi giờ `Asia/Ho_Chi_Minh`) -> trả về HTTP `409 Conflict`. Nếu chưa có -> lưu bản ghi chấm công ca làm việc.

---

## 3. DOCUMENT HISTORY

> 📌 **Chi tiết toàn bộ lịch sử các Plan và Bugfix:** Xem đầy đủ tại [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).

- **2026-10-05 - Item Catalog Cloudinary Direct Upload & Anti-Orphan-Images:** Endpoint upload ảnh Cloudinary trực tiếp, cơ chế Lazy Upload (chỉ tải khi nhấn Lưu), tự động dọn dẹp ảnh cũ trên Cloudinary khi sửa/xóa đồ giặt.
- **2026-10-05 - Item Catalog Image & Filter Refactor:** Thêm trường `imageUrl` vào Item Catalog, thay thế cột Thương hiệu bằng cột Hình ảnh, loại bỏ tùy chọn "Tất cả thương hiệu" khỏi bộ lọc đồ giặt.
- **2026-10-04 - Fix Item Catalog Sort Order (HTTP 400):** Sửa validation DTO, chuẩn hóa enum `ItemUnit`, thuật toán di chuyển thứ tự hiển thị 2 chiều không trùng nhau.
- **2026-10-04 - Plan 10 - Tái cấu trúc Item Catalog:** Bổ sung `sortOrder`, loại bỏ `priceToCustomer`/`foldingRateWorker`, phân quyền xóa vĩnh viễn cho Admin, toggle `isActive` cho Admin/Manager.
- **2026-10-04 - Plan 9 - Phân rã Component PartnersPage & Chuẩn bố cục 4 tầng:** Tách nhỏ component, chuẩn bố cục `PageBanner` -> `PageActionBar` -> `PageFilterBar` -> Data Content Container-responsive.
