# BẢN ĐỒ MÃ NGUỒN TOÀN HỆ THỐNG (CODEBASE ATLAS & SYMBOL MAP)

> **Mục đích:** Cung cấp bản đồ chỉ mục trực tiếp (Direct Navigation Map) cho AI Agent và Kỹ sư phát triển.  
> **Nguyên tắc hoạt động:** Agent đọc file này trước tiên để xác định chính xác các file mã nguồn (Controller, Service, Repository, DTO, Page, Modal, Hook) cần can thiệp cho từng tác vụ, **loại bỏ hoàn toàn việc phải dò tìm (grep/list_dir) lặp đi lặp lại**.  
> **Phiên bản:** 2.2 | **Ngày cập nhật:** 2026-10-29  
> **Quy chuẩn duy trì:** Tuân thủ Definition of Done trong [AGENTS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/rules/AGENTS.md).

---

## MỤC LỤC BẢN ĐỒ ĐỊNH VỊ

- [1. MA TRẬN BACKEND API (be-nestjs-thanhxuan)](#1-ma-trận-backend-api-be-nestjs-thanhxuan)
  - [1.1. Phân Hệ Vận Hành Xưởng & Quản Trị Đối Tác (internal_express)](#11-phân-hệ-vận-hành-xưởng--quản-trị-đối-tác-internal_express)
  - [1.2. Phân Hệ Giặt Là & B2B (laundry_express)](#12-phân-hệ-giặt-là--b2b-laundry_express)
  - [1.3. Phân Hệ Chuyển Nhà Tiết Kiệm (moving_express)](#13-phân-hệ-chuyển-nhà-tiết-kiệm-moving_express)
  - [1.4. Hạ Tầng Dùng Chung Backend (core_express & Common)](#14-hạ-tầng-dùng-chung-backend-core_express--common)
- [2. MA TRẬN FRONTEND (CLIENT APPLICATIONS)](#2-ma-trận-frontend-client-applications)
  - [2.1. Phân Hệ Cổng Vận Hành Xưởng & Quản Vận PWA (fe-react-thanhxuan-internal)](#21-phân-hệ-cổng-vận-hành-xưởng--quản-vận-pwa-fe-react-thanhxuan-internal)
  - [2.2. Phân Hệ Web Giặt Là & CMS (fe-nextjs-thanhxuan-laundry)](#22-phân-hệ-web-giặt-là--cms-fe-nextjs-thanhxuan-laundry)
  - [2.3. Phân Hệ Web Chuyển Nhà Tiết Kiệm (fe-nextjs-chuyennhatietkiem)](#23-phân-hệ-web-chuyển-nhà-tiết-kiệm-fe-nextjs-chuyennhatietkiem)
  - [2.4. Quy Chuẩn & Hạ Tầng Dùng Chung Của Toàn Bộ Frontend (Cả 3 Apps)](#24-quy-chuẩn--hạ-tầng-dùng-chung-của-toàn-bộ-frontend-cả-3-apps)

---

# 1. MA TRẬN BACKEND API (`be-nestjs-thanhxuan`)

Backend NestJS tập trung tại `be-nestjs-thanhxuan/src/`, phân chia thành 3 phân vùng Database độc lập và 1 phân vùng Hạ tầng Dùng chung (`core_express` & Common). Toàn bộ tuân thủ nghiêm ngặt **Repository Pattern** (`Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Mongoose Model/Schema`).

```
be-nestjs-thanhxuan/src/modules/
├── internal/    # 1.1: DB internal_express (Auth, Partners, Handovers, Attendance, Piecework, Fuel, Payroll)
├── laundry/     # 1.2: DB laundry_express (Articles, Orders, Contacts, CRM, Zalo/Email)
├── moving/      # 1.3: DB moving_express (Quotes, Services, Moving Articles)
└── core/        # 1.4: DB core_express (Audit, Media, Idempotency, Notifications, AI)
```

---

### 1.1. Phân Hệ Vận Hành Xưởng & Quản Trị Đối Tác (`internal_express`)

Kết nối database: `internal_express` (`INTERNAL_CONNECTION`). Tuyến API tiền tố: `/api/v1/internal`.

| Nghiệp Vụ / Sub-module | Tuyến API / Endpoint | Controller Class & File | Service Class & File | Repository Class & File | Schema / Model File | DTOs & Validation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Xác thực & Phiên Nhân sự** | `/api/v1/internal/auth` | `AuthController`<br>[auth.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/controllers/auth.controller.ts) | `AccountAuthService`<br>Helpers: `account-auth.helper.ts`, `account-password.service.ts` | `StaffAccountRepository`<br>`OtpCodeRepository`<br>`RefreshTokenRepository` | [staff-account.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts) | `LoginDto`<br>`RegisterDto`<br>`VerifyOtpDto` |
| **Quản lý Nhân sự & Duyệt** | `/api/v1/internal/accounts`<br>`/auth/approvals`<br>`/shippers-list` | `StaffController`<br>[staff.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/controllers/staff.controller.ts)<br>`AccountsController` | `AccountManagementService`<br>`AccountsService`<br>Helper: `account-management.helper.ts` | `ApprovalRequestRepository`<br>`StaffAccountRepository` | [approval-request.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/schemas/approval-request.schema.ts) | `CreateStaffDto`<br>`ApprovalActionDto`<br>`UpdateProfileDto` |
| **Đối tác & Chi nhánh B2B** | `/api/v1/internal/partners` | `PartnerController`<br>[partner.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/controllers/partner.controller.ts) | `PartnersService`<br>Helper: `partner-catalog.helper.ts` | `PartnerRepository`<br>`BrandRepository` | [partner.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/schemas/partner.schema.ts)<br>[brand.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/schemas/brand.schema.ts) | `CreatePartnerDto`<br>`UpdatePartnerDto`<br>`PartnerQueryDto` |
| **Danh mục Đồ giặt & Đơn giá** | `/api/v1/internal/partners/catalogs` | `ItemCatalogController`<br>[item-catalog.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/controllers/item-catalog.controller.ts) | `ItemCatalogService`<br>Helper: `partner-catalog.helper.ts` | `ItemCatalogRepository` | [item-catalog.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/schemas/item-catalog.schema.ts) | `CreateItemCatalogDto`<br>`UpdateItemCatalogDto` |
| **Phiếu Giao Nhận Kép & Chợ Chuyến** | `/api/v1/internal/handover`<br>`/recount-flag`<br>`/pool`<br>`/:id/claim`<br>`/:id/compensation`<br>`/cluster-compensation` | `HandoverController`<br>`HandoverDirtyOperationsController` | `HandoverRecordService`<br>`HandoverCleanPrepService`<br>`HandoverDirtySignatureService`<br>`HandoverPoolCompensationService`<br>Helpers: `handover-record-builder.helper.ts`, `handover-clean-prep.helper.ts`, `handover-dirty-signature.helper.ts` | `HandoverRecordRepository` | [handover-record.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts) | `CreateHandoverDto`<br>`PrepOrderDto`<br>`ShipperConfirmDto`<br>`RecountFlagDto`<br>`ClaimHandoverDto`<br>`SetTripCompensationDto`<br>`ClusterCompensationDto` |
| **Trạm Rạch Bao Đếm Lại** | `/api/v1/internal/handover/:id/recount-actual` | `HandoverController`<br>[handover.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts) | `HandoverRecordService`<br>`HandoverCleanPrepService` | `HandoverRecordRepository` | [handover-record.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts) | `RecountActualDto` |
| **Công Thợ Theo Phiên Khâu (Hourly)** | `/api/v1/internal/piecework` | `PieceworkController`<br>[piecework.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/piecework.controller.ts) | `JobSegmentService`<br>Listener: `job-segment.listener.ts` | `PieceworkLogRepository` | [piecework-log.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/schemas/piecework-log.schema.ts) | `CheckInSegmentDto`<br>`UpdateJobRatesDto`<br>`AssignDefaultJobDto` |
| **Chấm Công Camera Selfie & GPS** | `/api/v1/internal/attendance`<br>`/workshop-config` | `AttendanceController`<br>[attendance.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/controllers/attendance.controller.ts) | `AttendanceService`<br>Helper: `attendance-record.helper.ts` | `AttendanceRecordRepository`<br>`WorkshopSettingsRepository` | [attendance-record.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/schemas/attendance-record.schema.ts)<br>[workshop-settings.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/schemas/workshop-settings.schema.ts) | `CheckInDto`<br>`CheckOutDto`<br>`AttendanceQueryDto`<br>`UpdateWorkshopSettingsDto` |
| **Chi Phí Xe Shipper (Xăng & Sửa Xe)** | `/api/v1/internal/fuel` | `FuelController`<br>[fuel.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/controllers/fuel.controller.ts) | `FuelService`<br>[fuel.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/services/fuel.service.ts) | `FuelLogRepository` | [fuel-log.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/schemas/fuel-log.schema.ts) | `SubmitFuelDto`<br>`ApproveFuelDto` |
| **Nghỉ Giao Nhận & Phân Tuyến Bù** | `/api/v1/internal/shipper-leaves`<br>`/approve`, `/set-compensation`, `/reject`, `/cancel` | `ShipperLeavesController`<br>[shipper-leaves.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/shipper-leaves/shipper-leaves.controller.ts) | `ShipperLeavesService`<br>[shipper-leaves.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/shipper-leaves/shipper-leaves.service.ts) | `ShipperLeaveRepository` | [shipper-leave.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/shipper-leaves/schemas/shipper-leave.schema.ts) | `CreateShipperLeaveDto`<br>`ApproveShipperLeaveDto`<br>`SetCompensationDto`<br>`RejectShipperLeaveDto`<br>`QueryShipperLeaveDto` |
| **Bảng Lương & Phiếu Lương** | `/api/v1/internal/payroll` | `PayrollController`<br>[payroll.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/controllers/payroll.controller.ts) | `PayrollService`<br>Helpers: `payroll-period-lifecycle.helper.ts`, `payroll-payslip-adjustment.helper.ts`, `payroll-calculator.helper.ts` | `PayrollPeriodRepository`<br>`PayslipRepository`<br>`PaySettingsRepository` | [payroll-period.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/schemas/payroll-period.schema.ts)<br>[payslip.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/schemas/payslip.schema.ts) | `CalculatePayrollDto`<br>`LockPayrollDto`<br>`PaySettingsDto` |
| **Lưu Trữ Kép & Backup Google Drive** | `/api/v1/internal/archive` | `ArchiveController`<br>[archive.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/archive.controller.ts) | `ArchiveService`<br>[archive.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/archive.service.ts)<br>`ArchiveCron` | - | - | - |
| **Báo Cáo Streaming & Aggregation** | `/api/v1/internal/reports` | `ReportsController`<br>Helper: `reports-response.helper.ts` | `ReportsService`<br>`StreamingReportService` | Truy vấn trực tiếp qua Aggregation Pipeline | - | `WarehouseSummaryQueryDto`<br>`PartnerReconciliationQueryDto` |

---

### 1.2. Phân Hệ Giặt Là & B2B (`laundry_express`)

Kết nối database: `laundry_express` (`LAUNDRY_CONNECTION`). Tuyến API tiền tố mặc định: `/api/v1`.

| Nghiệp Vụ | Tuyến API / Endpoint | Controller Class & File | Service Class & File | Repository Class & File | Schema / Model File | DTOs & Validation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bài viết & Dịch vụ Giặt** | `/api/v1/articles`<br>`/api/v1/articles/:slug` | `ArticlesController`<br>[articles.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/articles/controllers/articles.controller.ts) | `ArticlesService`<br>Helper: `articles-sanitize.helper.ts` | `ArticlesRepository`<br>[articles.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/articles/repositories/articles.repository.ts) | [articles.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/articles/schemas/articles.schema.ts) | `CreateArticleDto`<br>`UpdateArticleDto`<br>`ArticleQueryDto` |
| **Chuyên mục Giặt Là** | `/api/v1/categories` | `CategoriesController`<br>[categories.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/categories/controllers/categories.controller.ts) | `CategoriesService` | `CategoriesRepository`<br>[categories.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/categories/repositories/categories.repository.ts) | [categories.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/categories/schemas/categories.schema.ts) | `CreateCategoryDto`<br>`UpdateCategoryDto` |
| **Đơn đặt lịch Web** | `/api/v1/orders` | `OrdersController`<br>[orders.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/orders/controllers/orders.controller.ts) | `OrdersService` | `OrdersRepository`<br>[orders.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/orders/repositories/orders.repository.ts) | [orders.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/orders/schemas/orders.schema.ts) | `CreateOrderDto`<br>`UpdateOrderStatusDto` |
| **Form liên hệ B2B (Leads)** | `/api/v1/contacts` | `ContactsController`<br>[contacts.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/contacts/controllers/contacts.controller.ts) | `ContactsService` | `ContactsRepository`<br>[contacts.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/contacts/repositories/contacts.repository.ts) | [contacts.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/contacts/schemas/contacts.schema.ts) | `CreateContactDto`<br>`ContactQueryDto` |
| **CRM Chăm sóc Khách hàng** | `/api/v1/crm` | `CrmController`<br>[crm.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/crm/controllers/crm.controller.ts) | `CrmService` | `CrmRepository`<br>[crm.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/crm/repositories/crm.repository.ts) | [customer.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/crm/schemas/customer.schema.ts) | `UpdateCustomerDto`<br>`CrmQueryDto` |
| **Email Marketing** | `/api/v1/email-marketing` | `EmailMarketingController`<br>[email-marketing.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/email-marketing/controllers/email-marketing.controller.ts) | `EmailMarketingService` | `EmailCampaignRepository`<br>`EmailSequenceRepository` | [email-campaign.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/email-marketing/schemas/email-campaign.schema.ts) | `CreateEmailCampaignDto`<br>`SendEmailTestDto` |
| **Zalo OA Marketing** | `/api/v1/zalo-marketing` | `ZaloMarketingController`<br>[zalo-marketing.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/zalo-marketing/controllers/zalo-marketing.controller.ts) | `ZaloMarketingService` | `ZaloCampaignRepository`<br>`ZaloSequenceRepository` | [zalo-campaign.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/zalo-marketing/schemas/zalo-campaign.schema.ts) | `CreateZaloCampaignDto`<br>`ZaloWebhookDto` |
| **Cấu hình & Metadata Web** | `/api/v1/settings` | `SettingsController`<br>[settings.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/settings/controllers/settings.controller.ts) | `SettingsService` | `SettingsRepository`<br>[settings.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/settings/repositories/settings.repository.ts) | [setting.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/settings/schemas/setting.schema.ts) | `UpdateSettingsDto` |
| **Tài khoản Quản trị CMS** | `/api/v1/users` | `UsersController`<br>[users.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/users/controllers/users.controller.ts) | `UsersService` | `UsersRepository`<br>[users.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/users/repositories/users.repository.ts) | [user.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/users/schemas/user.schema.ts) | `CreateUserDto`<br>`UpdateUserProfileDto` |
| **Thống kê Bảng điều khiển CMS** | `/api/v1/dashboard/stats` | `DashboardController`<br>[dashboard.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/dashboard/controllers/dashboard.controller.ts) | `DashboardService` | Truy vấn trực tiếp các Repositories | - | `DashboardFilterDto` |

---

### 1.3. Phân Hệ Chuyển Nhà Tiết Kiệm (`moving_express`)

Kết nối database: `moving_express` (`MOVING_CONNECTION`). Tuyến API tiền tố: `/api/v1/moving`.

| Nghiệp Vụ | Tuyến API / Endpoint | Controller Class & File | Service Class & File | Repository Class & File | Schema / Model File | DTOs & Validation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Khảo sát Báo giá Chuyển nhà** | `/api/v1/moving/quotes`<br>`/api/v1/moving/quotes/estimate`<br>`/api/v1/moving/quotes/:id` | `QuotesController`<br>[quotes.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/quotes/quotes.controller.ts) | `QuotesService`<br>Engine: `moving-pricing.ts` | `MovingQuoteRepository`<br>[moving-quote.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/quotes/repositories/moving-quote.repository.ts) | [moving-quote.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/quotes/schemas/moving-quote.schema.ts) | `CreateMovingQuoteDto`<br>`EstimateQuoteDto`<br>`UpdateMovingQuoteDto` |
| **Gói Dịch vụ & Cước Xe Tải** | `/api/v1/moving/services`<br>`/api/v1/moving/services/:id` | `MovingServicesController`<br>[moving-services.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/services/moving-services.controller.ts) | `MovingServicesService` | `MovingServiceRepository`<br>[moving-service.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/services/repositories/moving-service.repository.ts) | [moving-service.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/services/schemas/moving-service.schema.ts) | `CreateMovingServiceDto`<br>`UpdateMovingServiceDto` |
| **Cẩm nang & Bài viết Dọn nhà** | `/api/v1/moving/articles`<br>`/api/v1/moving/articles/:slug` | `MovingArticlesController`<br>[moving-articles.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/articles/moving-articles.controller.ts) | `MovingArticlesService` | `MovingArticleRepository`<br>[moving-article.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/articles/repositories/moving-article.repository.ts) | [moving-article.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/articles/schemas/moving-article.schema.ts) | `CreateMovingArticleDto`<br>`UpdateMovingArticleDto` |

---

### 1.4. Hạ Tầng Dùng Chung Backend (`core_express` & Common)

Kết nối database hạ tầng: `core_express` (`CORE_CONNECTION`) và các module/tiện ích dùng chung tại `be-nestjs-thanhxuan/src/common/`.

| Thành Phần Hạ Tầng | Phạm Vi Áp Dụng | Class & File Cốt Lõi | Chi Tiết Chức Năng Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Base CRUD Repository** | Toàn bộ Repositories | [`base.repository.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/base/base.repository.ts) | Cung cấp hàm CRUD chuẩn `findById`, `findOne`, `create`, `update`, `delete`, `paginate` có sẵn `.lean()` tối ưu bộ nhớ VPS. |
| **Audit Logging** | `core_express` | [`AuditModule`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/audit/audit.module.ts)<br>[`AuditLogRepository`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/audit/repositories/audit-log.repository.ts) | Ghi vết tự động mọi hành vi nhạy cảm: sửa phiếu, duyệt lương, xóa tài khoản, kèm snapshot trước/sau. Schema: [`audit-log.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/audit/schemas/audit-log.schema.ts). |
| **Media & File Storage** | `core_express` | [`MediaModule`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/media/media.module.ts)<br>[`MediaFileRepository`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/media/repositories/media-file.repository.ts) | Quản lý tải lên Cloudinary, tạo URL có chữ ký bảo mật, nén ảnh đại diện WebP. Schema: [`media-file.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/media/schemas/media-file.schema.ts). |
| **Idempotency Key Tránh Trùng Lặp** | `core_express` | [`IdempotencyModule`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/idempotency/idempotency.module.ts)<br>[`IdempotencyInterceptor`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/interceptors/idempotency.interceptor.ts) | Chặn giao dịch trùng lặp khi tài xế bấm nút nhiều lần trong tầng hầm mất sóng mạng. Schema: [`idempotency-key.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/idempotency/schemas/idempotency-key.schema.ts). |
| **In-App Notifications** | `core_express` | [`NotificationsModule`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/notifications/notifications.module.ts)<br>[`NotificationRepository`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/notifications/repositories/notification.repository.ts) | Bắn thông báo nội bộ thời gian thực khi có phiếu mới, đơn xin nghỉ hoặc duyệt ca. Schema: [`notification.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/notifications/schemas/notification.schema.ts). |
| **AI Assistant (Gemini/OpenAI)** | Toàn hệ thống | [`AiModule`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/ai/ai.module.ts)<br>[`AiController`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/ai/ai.controller.ts) | Tích hợp AI hỗ trợ gợi ý viết bài SEO cẩm nang giặt là, phân tích lộ trình dọn nhà. Stateless Service được bảo vệ qua RolesGuard (Admin). |
| **Guards Xác thực & Phân quyền** | Toàn bộ Endpoints | `InternalJwtGuard`<br>`InternalRolesGuard`<br>`PartnerScopeGuard` | Phân lập token khách hàng vs nội bộ (`aud: 'internal'`), kiểm soát 8 vai trò RBAC và cô lập dữ liệu theo từng đối tác B2B. |
| **Bảo Mật Tài Chính Đa Tầng** | Tuyến Payroll & Báo cáo | [`PayFieldFilterInterceptor`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/interceptors/pay-field-filter.interceptor.ts) | Tự động bóc tách loại bỏ các trường tiền lương, đơn giá thợ khi tài khoản gọi thiếu quyền `pay.view`. |
| **Chuẩn Hóa Múi Giờ Việt Nam** | Toàn hệ thống | [`time.util.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/utils/time.util.ts) | Các hàm tính toán `startOfDayVN`, `endOfDayVN`, `getDatePrefixVN` chuẩn `Asia/Ho_Chi_Minh` (GMT+7), cấm dùng `setHours(0,0,0,0)`. |

---

# 2. MA TRẬN FRONTEND (CLIENT APPLICATIONS)

Hệ thống Frontend gồm 3 ứng dụng client độc lập (mỗi app có thư mục mã nguồn `src/` riêng biệt) và 1 bộ quy chuẩn dùng chung:

```
Website_Thanh_Xuan_Company/
├── fe-react-thanhxuan-internal/    # 2.1: Cổng Vận Hành Xưởng & Quản Vận PWA (Port 3001)
├── fe-nextjs-thanhxuan-laundry/   # 2.2: Web Giặt Là & CMS Quản Trị (Port 3000)
├── fe-nextjs-chuyennhatietkiem/    # 2.3: Web Chuyển Nhà Tiết Kiệm & Estimator Xe Tải (Port 3002)
└── [Shared Conventions]            # 2.4: Quy chuẩn Design Tokens, Múi giờ, HTTP & Kỷ luật chung cho cả 3 apps
```

---

### 2.1. Phân Hệ Cổng Vận Hành Xưởng & Quản Vận PWA (`fe-react-thanhxuan-internal`)

Thư mục mã nguồn: `fe-react-thanhxuan-internal/src/` | Port dev: `3001` | Chi tiết tại [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md)  
Kiến trúc: React Router v7, Vite SPA, TailwindCSS, Mobile-First PWA, Flat Colocation (`operations/` & `management/`).

#### 2.1.1. Ma Trận Màn Hình & Tuyến URL Vận Hành

| Menu / Tuyến Đường URL | Màn Hình Chính (`Page.tsx`) | Thư Mục Modals (`/modals`) | Thư Mục Components (`/components`) | Custom Hooks & Service |
| :--- | :--- | :--- | :--- | :--- |
| `/login`, `/register`, `/forgot-password`<br>(Xác thực tài khoản, Đăng ký OTP & Hồ sơ Header) | `LoginPage.tsx`<br>`RegisterPage.tsx`<br>`ForgotPasswordPage.tsx`<br>`src/features/auth/` | `ProfileEditModal.tsx`<br>`ChangePasswordModal.tsx`<br>`OtpVerificationModal.tsx`<br>`ForgotPasswordModal.tsx` | `LoginDemoAccountsComponent.tsx`<br>`RegisterFormComponent.tsx`<br>`RegisterRoleSelectorComponent.tsx`<br>`ProfileSignatureSectionComponent.tsx` | `useAuth.ts`<br>`useProfileEdit.ts`<br>`apiClient` |
| `/dashboard`<br>(Điều hành xưởng thời gian thực) | `DashboardPage.tsx`<br>`src/features/dashboard/` | - | `DashboardHandoverPanelComponent.tsx`<br>`DashboardWorkforcePanelComponent.tsx` | `useDashboardData.ts`<br>`apiClient` |
| `/operations/shipper/handover`<br>(Phiếu giao nhận xe tải, Đếm hộ & Nhận chuyến) | `ShipperHandoverPage.tsx`<br>`HandoverDetailPage.tsx`<br>`src/features/operations/handovers/` | `PrepOrderModal.tsx`<br>`ShipperCountPartnerModal.tsx`<br>`CustomHandoverItemModal.tsx`<br>`SlipFullscreenViewerModal.tsx`<br>`DisputeModal.tsx` | `ShipperHandoverItemCardComponent.tsx`<br>`ShipperJobPoolTabComponent.tsx`<br>`HandoverSlipGalleryComponent.tsx`<br>`HandoverHeaderComponent.tsx`<br>`ShipperPendingPointCardComponent.tsx` | `useShipperHandoverPage.ts`<br>`useShipperCountForm.ts`<br>`useShipperSlipPreview.ts`<br>`export/` |
| `/operations/shipper/leave`<br>(Cổng xin nghỉ giao nhận, theo dõi duyệt & tài xế giao thay) | `ShipperLeavePage.tsx`<br>`src/features/operations/shipper-leave/` | - | `ShipperLeaveFormComponent.tsx`<br>`ShipperLeaveHistoryComponent.tsx`<br>`ShipperLeaveCardComponent.tsx` | `useShipperLeave.ts`<br>`shipperLeaveService.ts` |
| `/management/shipper-leaves`<br>(Duyệt nghỉ giao nhận, phân tuyến & định mức tiền công) | `ShipperLeaveReviewPage.tsx`<br>`src/features/management/shipper-leaves/` | `ApproveShipperLeaveModal.tsx`<br>`SetLeaveCompensationModal.tsx`<br>`RejectShipperLeaveModal.tsx` | `ShipperLeaveCardComponent.tsx` | `useShipperLeaveManagement.ts`<br>`shipperLeaveService.ts` |
| `/operations/warehouse-manager/warehouse`<br>(Lập phiếu xuất kho, Thư viện ảnh & Cài đặt chuyến - Quản lý kho & Kế toán) | `WarehouseHandoverPage.tsx`<br>`src/features/operations/handovers/` | `PrepOrderModal.tsx`<br>`HandoverDeliverySlipModal.tsx`<br>`TripCompensationModal.tsx`<br>`WarehouseScheduleSettingsModal.tsx`<br>`WarehouseItemFilterSettingsModal.tsx` | `HandoverSlipGalleryComponent.tsx`<br>`WarehouseCleanPlanTabComponent.tsx`<br>`WarehouseSummaryTabComponent.tsx`<br>`AdvanceDeliveryPopoverComponent.tsx` | `useWarehouseHandover.ts`<br>`usePrepOrderForm.ts`<br>`prepOrderSlipHelper.ts`<br>`prepOrderAdvanceDeliveryHelper.ts`<br>`export/` |
| `/operations/worker/recount`<br>(Trạm kiểm đếm lại gom bao xưởng) | `RecountStationPage.tsx`<br>`src/features/operations/handovers/` | - | `PrepOrderSlipPreviewComponent.tsx` | `useRecountStation.ts`<br>`export/` |
| `/management/admin/workshop`<br>(Cài đặt vị trí xưởng & Wi-Fi) | `WorkshopSettingsPage.tsx`<br>`src/features/management/workshop/` | - | `WorkshopGeofencingCard.tsx`<br>`WorkshopWifiCard.tsx`<br>`WorkshopSecurityPolicyCard.tsx` | `useWorkshopSettings.ts`<br>`apiClient` |
| `/operations/attendance`<br>(Chấm công camera selfie) | `AttendancePage.tsx`<br>`src/features/operations/attendance/` | - | `AttendanceGpsWidgetComponent.tsx`<br>`AttendanceHistoryCardComponent.tsx` | `useAttendance.ts`<br>`useWorkshopGeo.ts`<br>`apiClient` |
| `/operations/worker/piecework`<br>(Trạm công thợ theo phiên khâu) | `HourlyWorkStationPage.tsx`<br>`src/features/operations/piecework/` | - | `CurrentSegmentCardComponent.tsx`<br>`JobStagePickerComponent.tsx`<br>`HourlyWorkTaskListComponent.tsx` | `useHourlyWorkStation.ts`<br>`apiClient` |
| `/management/manager/piecework`<br>(Quản lý phân khâu & duyệt công) | `HourlyWorkReviewPage.tsx`<br>`src/features/management/piecework/` | - | `JobRatesSettingsComponent.tsx`<br>`WorkerDefaultJobComponent.tsx`<br>`DailyWorkReviewComponent.tsx` | `useJobRates.ts`<br>`useWorkerDefaultJobs.ts`<br>`useDailyWorkReview.ts` |
| `/operations/shipper/fuel`<br>(Chi phí xe: Xăng & Sửa xe) | `ShipperFuelPage.tsx`<br>`src/features/operations/fuel/` | - | - | `useShipperFuel.ts`<br>`apiClient` |
| `/operations/partner-manager/partner`<br>`/operations/partner-staff/partner`<br>(Cổng đối tác: Đếm bẩn, Thư viện phiếu & Duyệt NV) | `PartnerHandoverPage.tsx`<br>`src/features/operations/handovers/` | `HandoverDeliverySlipModal.tsx`<br>`CustomHandoverItemModal.tsx`<br>`SlipFullscreenViewerModal.tsx` | `PartnerCountTabComponent.tsx`<br>`PartnerReceiptTabComponent.tsx`<br>`HandoverSlipGalleryComponent.tsx`<br>`PartnerStaffTabComponent.tsx` | `usePartnerCountFlow.ts`<br>`usePartnerReceiptFlow.ts`<br>`usePartnerHandoverPage.ts`<br>`export/` |
| `/operations/payslip`<br>(Bảng lương tạm tính & phiếu chính thức) | `MyPayslipPage.tsx`<br>`src/features/operations/payroll/` | - | `DailyEarningsTableComponent.tsx`<br>`OfficialPayslipCardComponent.tsx` | `useMyPayslip.ts`<br>`apiClient` |
| `/management/manager/partner`<br>(Quản trị đối tác, tài xế tuyến & bảng giá) | `PartnersManagementPage.tsx`<br>`src/features/management/partners/` | `PartnerModal.tsx`<br>`BrandModal.tsx`<br>`CatalogModal.tsx`<br>`DeleteConfirmModal.tsx` | `PartnerListComponent.tsx`<br>`PartnerCardComponent.tsx`<br>`BrandListComponent.tsx`<br>`CatalogListComponent.tsx`<br>`CatalogImageUploadComponent.tsx` | `useCatalogForm.ts`<br>`apiClient` |
| `/management/manager/approval`<br>(Phê duyệt tài khoản nhân viên & đối tác) | `ApprovalManagementPage.tsx`<br>`src/features/management/auth/` | - | - | `apiClient` |
| `/management/manager/personnel`<br>(Quản trị nhân sự & RBAC toàn xưởng) | `StaffManagementPage.tsx`<br>`AuditLogPage.tsx`<br>`src/features/management/auth/` | `StaffFormModal.tsx`<br>`StaffDeleteModal.tsx` | `StaffTableComponent.tsx`<br>`StaffFilterComponent.tsx`<br>`StaffBasicInfoFieldsComponent.tsx`<br>`StaffPartnerBranchSelectComponent.tsx` | `useStaffManagement.ts`<br>`apiClient` |
| `/management/manager/attendance`<br>(Bảng công toàn xưởng & Duyệt ca) | `AttendanceReviewPage.tsx`<br>`src/features/management/attendance/` | `AttendanceReviewModal.tsx` | `AttendanceDateHeaderComponent.tsx`<br>`AttendanceFilterBarComponent.tsx`<br>`AttendanceTableComponent.tsx` | `useAttendanceReview.ts`<br>`apiClient` |
| `/management/accountant/payroll`<br>(Bảng lương chu kỳ & Chốt sổ) | `PayrollManagementPage.tsx`<br>`src/features/management/payroll/` | `PayslipDetailAdjustModal.tsx` | `PayrollMonthHeaderComponent.tsx`<br>`PayrollActionToolbarComponent.tsx`<br>`PayslipTableComponent.tsx` | `usePayrollManagement.ts`<br>`apiClient` |
| `/management/accountant/fuel`<br>(Duyệt chi phí xe tài xế) | `FuelReviewPage.tsx`<br>`src/features/management/fuel/` | - | - | `apiClient` |
| `/operations/report`<br>(Trung tâm báo cáo streaming 8 phân hệ) | `ReportsPage.tsx`<br>`src/features/operations/reports/` | - | `ReportsFilterBarComponent.tsx`<br>`ReportsTabNavigationComponent.tsx`<br>`WarehouseReportSectionComponent.tsx`<br>`WorkforceReportSectionComponent.tsx`<br>`QualityFuelReportSectionComponent.tsx` | `useReports.ts`<br>`reports.service.ts` |

#### 2.1.2. Thành Phần Hạ Tầng & Tiện Ích Dùng Chung Của Phân Hệ Nội Bộ (`fe-react-thanhxuan-internal/src/`)

| Tiện Ích Phân Hệ Nội Bộ | Vị Trí File | Chi Tiết Kỹ Thuật |
| :--- | :--- | :--- |
| **Mobile Layout Shell & Navigation** | [`src/components/layout/MobileBottomBar.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx)<br>[`src/components/layout/MobileNavDrawer.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileNavDrawer.tsx)<br>[`src/components/layout/nav-config.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/nav-config.ts) | Thanh điều hướng 4 tab đáy và Menu trượt phân quyền 8 vai trò RBAC cho thợ xưởng & tài xế xe tải. |
| **Chữ Ký Điện Tử Đa Dụng** | [`src/components/common/SignatureInputComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/SignatureInputComponent.tsx) | Nhận diện chữ ký đã lưu (`StaffAccount.signatureUrl`), toggle ký mới / dùng mẫu có sẵn và lưu làm mặc định. |
| **Offline-First Queue (PWA)** | `src/lib/offline-queue.ts` (`idb`) | Lưu tạm các hành động đếm đồ bẩn, điểm danh vào IndexedDB khi mất kết nối mạng và tự động đồng bộ khi online. |
| **Dual-Storage Session & Auth (PWA)** | `src/lib/auth-storage.ts` (`idb`) | Quản lý lưu trữ phiên kép (LocalStorage + IndexedDB), silent refresh khi mở app và duy trì phiên lâu dài như Mobile App. |
| **PWA Reload Prompt & Offline Banner** | [`src/components/layout/PwaReloadPrompt.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/PwaReloadPrompt.tsx)<br>[`src/components/layout/OfflineBanner.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/OfflineBanner.tsx) | Toast thông báo cập nhật bản mới từ Service Worker và dải cảnh báo trạng thái mạng trực quan kèm nút đồng bộ thủ công. |
| **Bộ Xuất Phiếu & Canvas Exporter** | `src/features/operations/handovers/export/`<br>- `handoverSlipCanvasRenderer.ts`<br>- `handoverExcelExporter.ts`<br>- `handoverZipDownloader.ts` | Vẽ phiếu giao nhận trực tiếp trên HTML5 Canvas để tải ảnh PNG, nén file ZIP gửi email đối tác hoặc xuất file Excel. |
| **Phân Quyền Client-side RBAC** | `src/lib/permissions.ts` | Hàm kiểm tra quyền `hasPermission(user, 'handover.edit')` đồng bộ với 8 vai trò Backend. |

---

### 2.2. Phân Hệ Web Giặt Là & CMS (`fe-nextjs-thanhxuan-laundry`)

Thư mục mã nguồn: `fe-nextjs-thanhxuan-laundry/src/` | Port dev: `3000` | Chi tiết tại [srs_sdd_fe_laundry.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_laundry.md)  
Kiến trúc: Next.js App Router, Server Components mặc định cho SEO (`(public)`), Quản trị CMS (`(admin)/admin`), Feature-based Flat Colocation.

#### 2.2.1. Ma Trận Tuyến Đường URL & Màn Hình

| Tuyến URL | Loại Render | File Trang (Page Entry) | Màn Hình / Modals / Subcomponents | Service / Hooks / Actions |
| :--- | :---: | :--- | :--- | :--- |
| `/` (Trang chủ) | RSC | `src/app/(public)/page.tsx` | `HomePage.tsx`<br>`src/features/public/home/` | `HeroSectionComponent`, `IntroSectionComponent`, `ServicesGridComponent`, `WhyChooseUsSectionComponent`, `FaqSectionComponent`, `PreFooterCtaComponent` |
| `/dich-vu/[...slug]` | RSC (SEO) | `src/app/(public)/dich-vu/[...slug]/page.tsx` | `ServiceDetailPage.tsx`<br>`src/features/public/services/components/` | `ServiceArticleDetailView`, `ServiceCategoryListView`, `PromoBanner`, `WorkProcess`, `public-services.service.ts` |
| `/gioi-thieu/[...slug]` | RSC (SEO) | `src/app/(public)/gioi-thieu/[...slug]/page.tsx` | `src/features/public/about/components/` | `AboutArticleDetailView`, `AboutCategoryListView`, `public-services.service.ts` |
| `/tin-tuc/[...slug]` | RSC (SEO) | `src/app/(public)/tin-tuc/[...slug]/page.tsx` | `src/features/public/articles/components/` | `NewsArticleDetailView`, `NewsCategoryListView`, `public-articles.service.ts` |
| `/tin-tuc` | RSC | `src/app/(public)/tin-tuc/page.tsx` | `ArticleListPage.tsx`<br>`src/features/public/articles/` | `ArticleListComponent`, `ArticleSortFilterComponent` |
| `/lien-he` | Client Form | `src/app/(public)/lien-he/page.tsx` | `ContactPage.tsx`<br>`src/features/public/contacts/` | `public-contacts.service.ts`, `public-contacts.action.ts` |
| `/admin/login` | Client / Auth | `src/app/(admin)/admin/login/page.tsx` | `LoginFormComponent.tsx`<br>`src/features/admin/auth/` | `admin-auth.service.ts` (quản lý phiên qua httpOnly cookies) |
| `/admin/dashboard` | Client / CMS | `src/app/(admin)/admin/dashboard/page.tsx` | `DashboardPage.tsx`<br>`src/features/admin/dashboard/` | `admin-dashboard.service.ts` |
| `/admin/articles` | Client / CMS | `src/app/(admin)/admin/articles/page.tsx` | `ArticleManagerPage.tsx`<br>`src/features/admin/articles/` | Modals: `ArticleEditorModal`, `ArticleTrashModal`<br>Components: `ArticleManagerTableComponent`, `ArticleManagerToolbarComponent`<br>Editor: `RichTextEditorComponent`<br>Hooks: `useAdminArticles` |
| `/admin/categories` | Client / CMS | `src/app/(admin)/admin/categories/page.tsx` | `CategoryManagerPage.tsx`<br>`src/features/admin/categories/` | Modals: `CategoryEditorModal`<br>Hooks: `useAdminCategories` |
| `/admin/contacts` | Client / CRM | `src/app/(admin)/admin/contacts/page.tsx` | `ContactManagerPage.tsx`<br>`src/features/admin/contacts/` | Modals: `ContactTrashModal`<br>Components: `ContactManagerTableComponent`, `ContactManagerToolbarComponent`<br>Hooks: `useAdminContacts` |
| `/admin/crm` | Client / CRM | `src/app/(admin)/admin/crm/page.tsx` | `CrmManagerPage.tsx`<br>`src/features/admin/crm/` | Components: `CrmManagerTableComponent`, `CrmManagerToolbarComponent`<br>Hooks: `useAdminCrm` |
| `/admin/orders` | Client / CMS | `src/app/(admin)/admin/orders/page.tsx` | `OrdersManagerPage.tsx`<br>`src/features/admin/orders/` | Modals: `OrdersManagerModal`<br>Components: `OrdersManagerTableComponent`<br>Hooks: `useAdminOrders` |
| `/admin/email-marketing` | Client / CMS | `src/app/(admin)/admin/email-marketing/page.tsx` | `EmailMarketingPage.tsx`<br>`src/features/admin/email-marketing/` | Modals: `EmailCampaignModal`, `EmailTemplateModal`<br>Hooks: `useAdminEmailMarketing` |
| `/admin/zalo-marketing` | Client / CMS | `src/app/(admin)/admin/zalo-marketing/page.tsx` | `ZaloMarketingPage.tsx`<br>`src/features/admin/zalo/` | Modals: `ZaloCampaignModal`, `ZaloSequenceModal`<br>`admin-zalo.service.ts` |
| `/admin/accounts` | Client / CMS | `src/app/(admin)/admin/accounts/page.tsx` | `AccountManagerPage.tsx`<br>`src/features/admin/users/` | Modals: `AccountEditorModal`<br>Hooks: `useAdminUsers` |
| `/admin/settings/**` | Client / CMS | `src/app/(admin)/admin/settings/**/page.tsx` | `SettingsPage.tsx`<br>`src/features/admin/settings/` | Components: `SettingEditorAboutComponent`, `SettingEditorContactComponent`, `SettingEditorFooterComponent`, `SettingEditorHomeComponent`, `SettingEditorServiceComponent`<br>Hooks: `useAdminSettings` |

#### 2.2.2. Thành Phần Hạ Tầng & Tiện Ích Dùng Chung Của Phân Hệ Giặt Là (`fe-nextjs-thanhxuan-laundry/src/`)

| Tiện Ích Phân Hệ Giặt Là | Vị Trí File | Chi Tiết Kỹ Thuật |
| :--- | :--- | :--- |
| **Admin Layout Shell** | `src/components/layout/admin/` | `AdminShellComponent.tsx`, `AdminSidebarComponent.tsx`, `AdminHeaderComponent.tsx` (Bố cục CMS quản trị có responsive sidebar). |
| **Public Layout Shell** | `src/components/layout/public/` | `PublicHeaderComponent.tsx`, `PublicFooterComponent.tsx`, `DraggableFloatingContactComponent.tsx` (Zalo/Hotline widget nổi kéo thả). |
| **Soạn Thảo WYSIWYG & Media** | `src/components/ui/rich-text-editor/` | `RichTextEditorComponent.tsx`, `RichTextToolbarComponent.tsx`, `MediaInsertModal.tsx` (Soạn thảo bài viết chuẩn SEO, chèn ảnh Cloudinary). |
| **Bảo Vệ Phiên & Proxy Upload** | `src/middleware.ts`<br>`src/app/api/upload/route.ts` | Next.js Middleware kiểm tra httpOnly cookie `admin_access_token`; Route handler proxy tải lên Cloudinary có xác thực token. |

---

### 2.3. Phân Hệ Web Chuyển Nhà Tiết Kiệm (`fe-nextjs-chuyennhatietkiem`)

Thư mục mã nguồn: `fe-nextjs-chuyennhatietkiem/src/` | Port dev: `3002` | Chi tiết tại [srs_sdd_fe_moving.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_moving.md)  
Kiến trúc: Next.js 16 App Router, React 19, TailwindCSS. Mô hình Asset-Light: Đội thợ cơ hữu kiêm mộc, điện lạnh kết hợp điều xe đối tác vệ tinh giá gốc.

#### 2.3.1. Ma Trận Tuyến Đường URL & Màn Hình

| Tuyến URL | Loại Render | File Trang (Page Entry) | Components Tương Tác & Sub-components | API / Services / Helpers |
| :--- | :---: | :--- | :--- | :--- |
| `/` (Trang chủ) | RSC | `src/app/page.tsx` | `HeroEstimatorComponent.tsx` (Dự toán nhanh Km & Tab nhu cầu)<br>`WhySaveBentoComponent.tsx` (Bento Grid 4 lý do tiết kiệm 30%)<br>`SmartCargoVisualizerComponent.tsx` (Mô phỏng chọn đồ ra xe & thợ)<br>`CostComparisonComponent.tsx` (So sánh tự dọn vs Thanh Xuân)<br>`PackingProtectionComponent.tsx` (Tiêu chuẩn bọc lót 4 lớp)<br>`RecentProjectsShowcaseComponent.tsx` (Showcase ảnh dự án)<br>`CustomerReviewsComponent.tsx` (Đánh giá khách hàng)<br>`InteractiveChecklistComponent.tsx` (Checklist 10 bước dọn nhà) | `fetchMovingServices`<br>`fetchMovingArticles` |
| `/dat-lich` | Client Wizard | `src/app/dat-lich/page.tsx` | `QuoteWizardForm.tsx` (State Orchestrator 4 bước):<br>- `Step1LocationComponent.tsx` (Điểm bốc, dỡ, tầng, thang máy)<br>- `Step2ItemsComponent.tsx` (Gói dịch vụ & Đồ đạc cồng kềnh)<br>- `Step3ScheduleComponent.tsx` (Ngày giờ, ảnh đồ đạc & ghi chú)<br>- `Step4ReviewComponent.tsx` (Bảng dự toán chi tiết & gửi lead) | `calculateQuoteEstimate`<br>`submitMovingQuote`<br>API: `/api/v1/moving/quotes` |
| `/bang-gia` | RSC | `src/app/bang-gia/page.tsx` | Bảng cước mở cửa xe tải đối tác theo các cự ly Km<br>Đơn giá thuê thợ bốc xếp theo giờ (150.000đ/giờ)<br>Bảng phụ phí tháo lắp điều hòa, giường tủ kỹ thuật | `fetchMovingServices` |
| `/dich-vu` | RSC | `src/app/dich-vu/page.tsx` | Danh sách 5 gói dịch vụ vận chuyển & nhân công bốc xếp | `getServices` |
| `/dich-vu/[slug]` | RSC (SSG) | `src/app/dich-vu/[slug]/page.tsx` | Chi tiết dịch vụ, quy trình 4 bước, cam kết bảo hiểm 100% | `getServiceBySlug` |
| `/tin-tuc` & `/[slug]` | RSC (SSG) | `src/app/tin-tuc/page.tsx`<br>`src/app/tin-tuc/[slug]/page.tsx` | Danh sách & Chi tiết bài viết SEO cẩm nang dọn nhà | `fetchMovingArticles` |
| `/lien-he` | RSC | `src/app/lien-he/page.tsx` | Thông tin công ty pháp lý (Số 16 ngõ 81 Vạn Phúc Hà Đông, MST 0108942736, Hotline 0769 270 676) | Bản đồ bãi xe vệ tinh |
| `/admin/login` | Client | `src/app/admin/login/page.tsx` | Đăng nhập tài khoản quản trị Admin chuyển nhà | - |
| `/admin/dashboard` | Client | `src/app/admin/dashboard/page.tsx` | Thống kê KPI đơn khảo sát, tỷ lệ chốt đơn, doanh thu dự toán | `fetchAdminDashboardStats` |
| `/admin/quotes` | Client | `src/app/admin/quotes/page.tsx` | Tiếp nhận & Quản lý đơn khảo sát dọn nhà, lọc trạng thái | `fetchAdminQuotes`<br>`updateQuoteStatus` |
| `/admin/articles` | Client | `src/app/admin/articles/page.tsx` | Quản lý bài viết cẩm nang kinh nghiệm dọn nhà | `fetchMovingArticles` |
| `/admin/settings` | Client | `src/app/admin/settings/page.tsx` | Quản lý thông tin doanh nghiệp, MST, hotline, địa chỉ pháp lý | - |

#### 2.3.2. Thành Phần Hạ Tầng & Tiện Ích Dùng Chung Của Phân Hệ Chuyển Nhà (`fe-nextjs-chuyennhatietkiem/src/`)

| Tiện Ích Phân Hệ Chuyển Nhà | Vị Trí File | Chi Tiết Kỹ Thuật |
| :--- | :--- | :--- |
| **Báo Giá State Engine (Wizard Context)** | `src/features/quote-form/QuoteWizardForm.tsx`<br>`src/context/` | Quản lý state tập trung cho toàn bộ 4 bước khảo sát, tự động tính toán tổng m³ đồ đạc và chi phí theo thời gian thực. |
| **Layout Shells (Public & Admin)** | `src/components/layout/` (`Header.tsx`, `Footer.tsx`)<br>`src/app/admin/layout.tsx` | Header điều hướng có drawer mobile, Footer thông tin pháp lý chuẩn và Admin Shell tinh gọn 5 chức năng. |
| **API Client & Pricing Helpers** | `src/lib/api-client.ts`<br>`src/lib/utils.ts` | Wrapper gọi API NestJS `/api/v1/moving/*`, bộ định dạng tiền tệ Việt Nam `Intl.NumberFormat('vi-VN')`. |

---

### 2.4. Quy Chuẩn & Hạ Tầng Dùng Chung Của Toàn Bộ Frontend (Cả 3 Apps)

Chỉ bao gồm các quy chuẩn kiến trúc, design tokens và giao thức kỹ thuật bắt buộc áp dụng **đồng nhất trên cả 3 ứng dụng client**:

| Quy Chuẩn Dùng Chung | Phạm Vi Cả 3 Apps | Mô Tả Quy Chuẩn Kỹ Thuật Bắt Buộc |
| :--- | :--- | :--- |
| **Hệ Thống Design Tokens & TailwindCSS** | Cả 3 Apps (`tailwind.config.ts`, `globals.css`) | Thống nhất quy tắc biến màu CSS (`--background`, `--foreground`, `--primary`, `--secondary`, `--destructive`, `--accent`), hỗ trợ đầy đủ Dark/Light Mode. |
| **Chuẩn Công Thái Học Di Động (Mobile-First)** | Cả 3 Apps | Kích thước vùng bấm cảm ứng (touch-target) tối thiểu $\ge 44\text{px}$ đến $48\text{px}$ cho toàn bộ nút bấm, ô nhập liệu và tab trên điện thoại. |
| **Chuẩn Hóa Múi Giờ Hiển Thị (`Asia/Ho_Chi_Minh`)** | Cả 3 Apps | 100% thời gian hiển thị format theo GMT+7 (`DD/MM/YYYY`, `HH:mm DD/MM/YYYY`), không sử dụng timezone local của trình duyệt khi parse ngày giao nhận, chấm công. |
| **Quy Chuẩn Form & Data Validation** | Cả 3 Apps | Bắt buộc sử dụng bộ đôi `react-hook-form` + `zod` để validate ràng buộc dữ liệu tại Client trước khi gửi request lên Backend API. |
| **Quy Ước Giao Tiếp HTTP API & Idempotency** | Cả 3 Apps | Tự động đính kèm Bearer Token JWT, header `Idempotency-Key` (UUIDv4) cho các mutation tài chính/giao nhận, xử lý thống nhất mã lỗi 401 (refresh token / redirect login). |
| **Kỷ Luật Kiến Trúc Sạch (< 250 - 300 Dòng/File)** | Cả 3 Apps | Màn hình chính `[Tên]Page.tsx`, modal `modals/[Tên]Modal.tsx`, component con `components/[Tên]Component.tsx`, tách hook `hooks/use[Tên].ts`, TypeScript strict mode 100% (zero `any`). |
