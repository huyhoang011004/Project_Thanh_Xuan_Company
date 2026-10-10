# BẢN ĐỒ MÃ NGUỒN TOÀN HỆ THỐNG (CODEBASE ATLAS & SYMBOL MAP)

> **Mục đích:** Cung cấp bản đồ chỉ mục trực tiếp (Direct Navigation Map) cho AI Agent và Kỹ sư phát triển.  
> **Nguyên tắc hoạt động:** Agent đọc file này trước tiên để xác định chính xác các file mã nguồn (Controller, Service, Repository, DTO, Page, Modal, Hook) cần can thiệp cho từng tác vụ, **loại bỏ hoàn toàn việc phải dò tìm (grep/list_dir) lặp đi lặp lại**.  
> **Phiên bản:** 1.0 | **Ngày cập nhật:** 2026-10-10  
> **Quy chuẩn duy trì:** Tuân thủ Definition of Done trong [AGENTS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/rules/AGENTS.md).

---

## MỤC LỤC BẢN ĐỒ ĐỊNH VỊ
1. [Ma Trận Backend API (be-nestjs-thanhxuan)](#1-ma-trận-backend-api-be-nestjs-thanhxuan)
2. [Ma Trận Web Khách Hàng & CMS (fe-nextjs-thanhxuan-laundry)](#2-ma-trận-web-khách-hàng--cms-fe-nextjs-thanhxuan-laundry)
3. [Ma Trận Cổng Vận Hành Nội Bộ & Đối Tác (fe-react-thanhxuan-internal)](#3-ma-trận-cổng-vận-hành-nội-bộ--đối-tác-fe-react-thanhxuan-internal)
4. [Bản Đồ Hạ Tầng Dùng Chung (Common, Guards, Utilities)](#4-bản-đồ-hạ-tầng-dùng-chung-common-guards-utilities)

---

# 1. MA TRẬN BACKEND API (`be-nestjs-thanhxuan`)

Cổng Backend API tập trung chia thành 3 phân vùng Database và 1 lớp Core. Tất cả tuân thủ nghiêm ngặt **Repository Pattern** (`Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Schema`).

### 1.1. Phân Hệ Vận Hành Nội Bộ & Quản Trị Đối Tác (`internal_express`)

| Nghiệp Vụ / Sub-module | Tuyến API / Endpoint | Controller Class & File | Service Class & File | Repository Class & File | Schema / Model File | DTOs & Validation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Xác thực & Phiên** | `/api/v1/internal/auth` | `AuthController`<br>[auth.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/controllers/auth.controller.ts) | `AuthService`<br>[auth.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/services/auth.service.ts) | `StaffAccountRepository`<br>`OtpCodeRepository`<br>`RefreshTokenRepository` | [staff-account.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts) | `LoginDto`<br>`RegisterDto`<br>`VerifyOtpDto` |
| **Quản lý Nhân sự & Duyệt** | `/api/v1/internal/accounts`<br>`/auth/approvals` | `StaffController`<br>[staff.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/controllers/staff.controller.ts) | `StaffService`<br>[staff.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/services/staff.service.ts) | `ApprovalRequestRepository`<br>`StaffAccountRepository` | [approval-request.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/schemas/approval-request.schema.ts) | `CreateStaffDto`<br>`ApprovalActionDto`<br>`UpdateProfileDto` |
| **Đối tác & Chi nhánh** | `/api/v1/internal/partners` | `PartnerController`<br>[partner.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/controllers/partner.controller.ts) | `PartnerService`<br>[partner.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/services/partner.service.ts) | `PartnerRepository`<br>`BrandRepository` | [partner.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/schemas/partner.schema.ts)<br>[brand.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/schemas/brand.schema.ts) | `CreatePartnerDto`<br>`UpdatePartnerDto`<br>`PartnerQueryDto` |
| **Danh mục Đồ giặt & Đơn giá** | `/api/v1/internal/partners/catalogs` | `ItemCatalogController`<br>[item-catalog.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/controllers/item-catalog.controller.ts) | `ItemCatalogService`<br>[item-catalog.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/services/item-catalog.service.ts) | `ItemCatalogRepository` | [item-catalog.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/schemas/item-catalog.schema.ts) | `CreateItemCatalogDto`<br>`UpdateItemCatalogDto` |
| **Phiếu Giao Nhận Kép** | `/api/v1/internal/handover` | `HandoverController`<br>[handover.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts) | `HandoverService`<br>[handover.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover.service.ts) | `HandoverRecordRepository`<br>`CounterRepository` | [handover-record.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts)<br>[counter.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/counter.schema.ts) | `CreateHandoverDto`<br>`PrepOrderDto`<br>`SignHandoverDto`<br>`ReceiptCheckDto` |
| **Trạm Rạch Bao Đếm Lại** | `/api/v1/internal/handover/:id/recount` | `RecountController`<br>[recount.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/recount.controller.ts) | `RecountService`<br>[recount.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/recount.service.ts) | `RecountTaskRepository` | [recount-task.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/recount-task.schema.ts) | `CompleteRecountDto`<br>`VarianceReportDto` |
| **Khoán Sản Lượng Thợ** | `/api/v1/internal/piecework` | `PieceworkController`<br>[piecework.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/controllers/piecework.controller.ts) | `PieceworkService`<br>[piecework.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/services/piecework.service.ts) | `PieceworkLogRepository` | [piecework-log.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/schemas/piecework-log.schema.ts) | `LogPieceworkDto`<br>`ConfirmPieceworkDto` |
| **Chấm Công Camera Selfie** | `/api/v1/internal/attendance` | `AttendanceController`<br>[attendance.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/controllers/attendance.controller.ts) | `AttendanceService`<br>[attendance.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/services/attendance.service.ts) | `AttendanceRecordRepository` | [attendance-record.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/schemas/attendance-record.schema.ts) | `CheckInDto`<br>`CheckOutDto`<br>`AttendanceQueryDto` |
| **Hoàn Tiền Xăng Xe** | `/api/v1/internal/fuel` | `FuelController`<br>[fuel.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/controllers/fuel.controller.ts) | `FuelService`<br>[fuel.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/services/fuel.service.ts) | `FuelLogRepository` | [fuel-log.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/schemas/fuel-log.schema.ts) | `SubmitFuelDto`<br>`ApproveFuelDto` |
| **Bảng Lương & Phiếu Lương** | `/api/v1/internal/payroll` | `PayrollController`<br>[payroll.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/controllers/payroll.controller.ts) | `PayrollService`<br>[payroll.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/services/payroll.service.ts) | `PayrollPeriodRepository`<br>`PayslipRepository`<br>`PaySettingsRepository` | [payroll-period.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/schemas/payroll-period.schema.ts)<br>[payslip.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/schemas/payslip.schema.ts) | `CalculatePayrollDto`<br>`LockPayrollDto`<br>`PaySettingsDto` |
| **Báo Cáo Streaming & Aggregation** | `/api/v1/internal/reports` | `ReportsController`<br>[reports.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/reports/controllers/reports.controller.ts) | `ReportsService`<br>[reports.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/reports/services/reports.service.ts) | Truy vấn trực tiếp qua Aggregation Pipeline | - | `ReportFilterDto`<br>`ExportReportDto` |

---

### 1.2. Phân Hệ Web Khách Hàng, CMS & Chuyển Nhà

| Nghiệp Vụ | Tuyến API | Controller & File | Service & File | Repository / Schema |
| :--- | :--- | :--- | :--- | :--- |
| **Bài viết & Dịch vụ Giặt** | `/api/v1/articles` | `ArticlesController` | `ArticlesService` | [articles.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/articles/schemas/articles.schema.ts) |
| **Chuyên mục Giặt** | `/api/v1/categories` | `CategoriesController` | `CategoriesService` | [categories.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/categories/schemas/categories.schema.ts) |
| **Đơn đặt lịch Web** | `/api/v1/orders` | `OrdersController` | `OrdersService` | [orders.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/orders/schemas/orders.schema.ts) |
| **Form liên hệ B2B (Leads)** | `/api/v1/contacts` | `ContactsController` | `ContactsService` | [contacts.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/contacts/schemas/contacts.schema.ts) |
| **CRM Khách hàng** | `/api/v1/crm` | `CrmController` | `CrmService` | [customer.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/crm/schemas/customer.schema.ts) |
| **Khảo sát Báo giá Chuyển nhà** | `/api/v1/moving/quotes` | `MovingQuotesController` | `MovingQuotesService` | [moving-quote.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/quotes/schemas/moving-quote.schema.ts) |
| **Dịch vụ & Xe tải Chuyển nhà** | `/api/v1/moving/services` | `MovingServicesController` | `MovingServicesService` | [moving-service.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/services/schemas/moving-service.schema.ts) |

---

# 2. MA TRẬN WEB KHÁCH HÀNG & CMS (`fe-nextjs-thanhxuan-laundry`)

Thư mục: `fe-nextjs-thanhxuan-laundry/src/`  
Kiến trúc: Next.js App Router, Server Components mặc định cho SEO (`src/app/(public)`), Quản trị CMS (`src/app/(admin)/admin`), Feature Colocation (`src/features/*`).

| Tuyến URL | Loại Component | File Trang (Page Entry) | Features / Components Con | Server Action / API Service |
| :--- | :---: | :--- | :--- | :--- |
| `/` (Trang chủ) | RSC | `src/app/(public)/page.tsx` | HeroBanner, ServiceGrid, WhyChooseUs, CTAContact | `src/services/article.service.ts` |
| `/dich-vu` | RSC | `src/app/(public)/dich-vu/page.tsx` | ServiceList, ServiceCard, PriceTable | `src/services/service.service.ts` |
| `/dich-vu/[slug]` | RSC (SEO) | `src/app/(public)/dich-vu/[slug]/page.tsx` | ServiceDetailContent, LeadCaptureForm, RelatedServices | `generateMetadata()`, `getServiceBySlug()` |
| `/bang-gia` | RSC | `src/app/(public)/bang-gia/page.tsx` | PriceEstimatorCalculator, PriceTabs | `src/services/pricing.service.ts` |
| `/tin-tuc` | RSC | `src/app/(public)/tin-tuc/page.tsx` | BlogGrid, CategoryFilter, Pagination | `src/services/article.service.ts` |
| `/tin-tuc/[slug]` | RSC (SEO) | `src/app/(public)/tin-tuc/[slug]/page.tsx` | ArticleContent, TableOfContents, SocialShare, CTAForm | `generateMetadata()`, `getArticleBySlug()` |
| `/lien-he` | Client Form | `src/app/(public)/lien-he/page.tsx` | ContactForm (react-hook-form + zod), GoogleMapEmbed | `src/features/contact/actions/submit-contact.ts` |
| `/chuyen-nha` | Client Calc | `src/app/(public)/chuyen-nha/page.tsx` | MovingQuoteCalculator (tính km & cước), TruckSelector | `src/services/moving.service.ts` |
| `/admin/articles` | Client / CMS | `src/app/(admin)/admin/articles/page.tsx` | ArticleDataTable, TipTapEditorModal, CategorySelect | `src/features/cms/services/article-admin.service.ts` |
| `/admin/orders` | Client / CMS | `src/app/(admin)/admin/orders/page.tsx` | OrderDataTable, OrderStatusBadge, OrderDetailDrawer | `src/features/cms/services/order-admin.service.ts` |
| `/admin/contacts` | Client / CRM | `src/app/(admin)/admin/contacts/page.tsx` | ContactDataTable, LeadStatusToggle, NotesDrawer | `src/features/cms/services/contact-admin.service.ts` |

---

# 3. MA TRẬN CỔNG VẬN HÀNH NỘI BỘ & ĐỐI TÁC (`fe-react-thanhxuan-internal`)

Thư mục: `fe-react-thanhxuan-internal/src/`  
Kiến trúc: React Router v7, Vite SPA, TailwindCSS, Mobile-First PWA, Flat Colocation theo Quy chuẩn:
- Màn hình chính: `[Tên]Page.tsx`
- Modal nghiệp vụ: `modals/[Tên]Modal.tsx`
- Component con: `components/[Tên]Component.tsx`
- Custom Hook / State: `hooks/use[Tên].ts`

| Menu / Tuyến Đường URL | Màn Hình Chính (`Page.tsx`) | Thư Mục Modals (`/modals`) | Thư Mục Components (`/components`) | Custom Hooks & Service |
| :--- | :--- | :--- | :--- | :--- |
| `/van-hanh/giao-nhan`<br>(Phiếu giao nhận xe tải) | `HandoverPage.tsx`<br>`src/features/operations/handovers/` | `PrepOrderModal.tsx`<br>`SignHandoverModal.tsx`<br>`RecountRequestModal.tsx` | `HandoverCardComponent.tsx`<br>`HandoverDetailComponent.tsx`<br>`SignatureCanvasComponent.tsx` | `useHandoverList.ts`<br>`useHandoverDetail.ts`<br>`handover.service.ts` |
| `/van-hanh/soan-hang`<br>(Soạn đồ sạch ngày mai) | `PrepOrderPage.tsx`<br>`src/features/operations/handovers/` | `PrepOrderModal.tsx`<br>`ItemNoteModal.tsx` | `PrepOrderTableComponent.tsx`<br>`SummaryBadgeComponent.tsx` | `usePrepOrder.ts`<br>`handover.service.ts` |
| `/van-hanh/cham-cong`<br>(Chấm công camera) | `AttendancePage.tsx`<br>`src/features/operations/attendance/` | `CheckInModal.tsx`<br>`CheckOutModal.tsx` | `CameraCaptureComponent.tsx`<br>`AttendanceHistoryComponent.tsx` | `useAttendance.ts`<br>`useCamera.ts`<br>`attendance.service.ts` |
| `/van-hanh/khoan-viec`<br>(Sản lượng thợ xưởng) | `PieceworkPage.tsx`<br>`src/features/operations/piecework/` | `AddPieceworkModal.tsx`<br>`QuickQuantityModal.tsx` | `PieceworkTableComponent.tsx`<br>`ShiftSummaryComponent.tsx` | `usePiecework.ts`<br>`piecework.service.ts` |
| `/van-hanh/xang-xe`<br>(Hoàn tiền xăng tài xế) | `FuelPage.tsx`<br>`src/features/operations/fuel/` | `CreateFuelProposalModal.tsx`<br>`ApproveFuelModal.tsx` | `FuelReceiptCardComponent.tsx`<br>`OdometerImageComponent.tsx` | `useFuel.ts`<br>`fuel.service.ts` |
| `/van-hanh/doi-tac/lich-su`<br>(Nhà hàng xem giao nhận) | `PartnerHistoryPage.tsx`<br>`src/features/operations/partners/` | `DisputeModal.tsx`<br>`ViewReceiptModal.tsx` | `PartnerHistoryTabComponent.tsx`<br>`DeliveryStatusBadge.tsx` | `usePartnerHistory.ts`<br>`partner.service.ts` |
| `/van-hanh/doi-tac/nhan-hang`<br>(Nhà hàng kiểm nhận đồ) | `PartnerReceiptPage.tsx`<br>`src/features/operations/partners/` | `ReceiptCheckModal.tsx`<br>`PartnerSignModal.tsx` | `PartnerReceiptTabComponent.tsx`<br>`ItemCheckRowComponent.tsx` | `usePartnerReceipt.ts`<br>`partner.service.ts` |
| `/quan-ly/doi-tac`<br>(Admin quản lý chi nhánh) | `PartnerManagementPage.tsx`<br>`src/features/management/partners/` | `PartnerFormModal.tsx`<br>`BranchConfigModal.tsx` | `PartnerTableComponent.tsx`<br>`FrequencySelectComponent.tsx` | `usePartners.ts`<br>`partner.service.ts` |
| `/quan-ly/danh-muc-do`<br>(Quản lý mã đồ giặt) | `ItemCatalogPage.tsx`<br>`src/features/management/partners/` | `ItemCatalogModal.tsx`<br>`UpdateRateModal.tsx` | `CatalogTableComponent.tsx`<br>`CloudinaryUploadComponent.tsx` | `useItemCatalog.ts`<br>`catalog.service.ts` |
| `/quan-ly/nhan-su`<br>(Duyệt & phân quyền tài khoản) | `StaffManagementPage.tsx`<br>`src/features/management/staff/` | `ApprovalModal.tsx`<br>`StaffDetailModal.tsx` | `StaffTableComponent.tsx`<br>`RoleBadgeComponent.tsx` | `useStaff.ts`<br>`staff.service.ts` |
| `/quan-ly/luong`<br>(Chốt bảng lương chu kỳ) | `PayrollPage.tsx`<br>`src/features/management/payroll/` | `CalculatePayrollModal.tsx`<br>`LockPayrollModal.tsx` | `PayrollPeriodTableComponent.tsx`<br>`PayslipDetailComponent.tsx` | `usePayroll.ts`<br>`payroll.service.ts` |
| `/quan-ly/bao-cao`<br>(Trung tâm báo cáo streaming) | `ReportsPage.tsx`<br>`src/features/management/reports/` | `FilterReportModal.tsx` | `ReportCardGridComponent.tsx`<br>`ExportButtonComponent.tsx` | `useReports.ts`<br>`reports.service.ts` |

---

# 4. BẢN ĐỒ HẠ TẦNG DÙNG CHUNG (COMMON, GUARDS, UTILITIES)

### 4.1. Backend Infrastructure (`be-nestjs-thanhxuan/src/common` & `src/modules/core`)
- **Base CRUD Repository:** [`base.repository.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/base/base.repository.ts) (Cung cấp các hàm chuẩn `findById`, `findOne`, `create`, `update`, `delete`, `paginate` có `.lean()`).
- **Lớp Hạ Tầng Dùng Chung (`core_express` - `CORE_CONNECTION`):**
  - **Audit Log:** [`AuditModule`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/audit/audit.module.ts) ↔ [`AuditLogRepository`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/audit/repositories/audit-log.repository.ts) ↔ [`audit-log.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/audit/schemas/audit-log.schema.ts).
  - **Media Files Cloudinary:** [`MediaModule`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/media/media.module.ts) ↔ [`MediaFileRepository`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/media/repositories/media-file.repository.ts) ↔ [`media-file.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/media/schemas/media-file.schema.ts).
  - **Idempotency Key:** [`IdempotencyModule`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/idempotency/idempotency.module.ts) ↔ [`IdempotencyInterceptor`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/interceptors/idempotency.interceptor.ts) ↔ [`idempotency-key.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/idempotency/schemas/idempotency-key.schema.ts).
  - **In-App Notifications:** [`NotificationsModule`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/notifications/notifications.module.ts) ↔ [`NotificationRepository`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/notifications/repositories/notification.repository.ts) ↔ [`notification.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/notifications/schemas/notification.schema.ts).
- **Guards Xác thực & RBAC:**
  - `InternalJwtGuard`: Xác thực token có `aud: 'internal'`.
  - `InternalRolesGuard`: Kiểm tra vai trò 8 cấp độ.
  - `PartnerScopeGuard`: Tự động cô lập dữ liệu theo `partnerId` của tài khoản đối tác.
- **Bảo mật tài chính:** [`PayFieldFilterInterceptor`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/interceptors/) (Bóc tách tự động mọi trường tiền/lương khi user thiếu quyền `pay.view`).
- **Múi giờ Việt Nam:** [`time.util.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/utils/time.util.ts) (`startOfDayVN`, `endOfDayVN`, `getDatePrefixVN` chuẩn `Asia/Ho_Chi_Minh`).

### 4.2. Mobile Layout & Điều Hướng Frontend Internal (`fe-react-thanhxuan-internal/src/components/layout`)
- **Điều hướng thanh đáy Mobile:** [`MobileBottomBar.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx) (Menu 4 tab nhanh cho thợ và tài xế).
- **Ngăn kéo menu trượt:** [`MobileNavDrawer.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileNavDrawer.tsx) (Danh sách tính năng theo quyền người dùng).
- **Cấu hình menu tập trung:** [`nav-config.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/nav-config.ts) (Định nghĩa route, icon, nhãn tiếng Việt và điều kiện quyền RBAC hiển thị).
