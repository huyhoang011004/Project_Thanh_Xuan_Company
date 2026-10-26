# BẢN ĐỒ MÃ NGUỒN TOÀN HỆ THỐNG (CODEBASE ATLAS & SYMBOL MAP)

> **Mục đích:** Cung cấp bản đồ chỉ mục trực tiếp (Direct Navigation Map) cho AI Agent và Kỹ sư phát triển.  
> **Nguyên tắc hoạt động:** Agent đọc file này trước tiên để xác định chính xác các file mã nguồn (Controller, Service, Repository, DTO, Page, Modal, Hook) cần can thiệp cho từng tác vụ, **loại bỏ hoàn toàn việc phải dò tìm (grep/list_dir) lặp đi lặp lại**.  
> **Phiên bản:** 1.1 | **Ngày cập nhật:** 2026-10-13  
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
| **Phiếu Giao Nhận Kép & 5 Bước** | `/api/v1/internal/handover` | `HandoverController`<br>[handover.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts) | `HandoverService`<br>[handover.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover.service.ts) | `HandoverRecordRepository` | [handover-record.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts) | `CreateHandoverDto`<br>`PrepOrderDto`<br>`DirtyItemOnBlurDto`<br>`ShipperConfirmDto`<br>`PartnerCountSignatureDto`<br>`PartnerCheckSignatureDto`<br>`RecountActualDto` |
| **Trạm Rạch Bao Đếm Lại** | `/api/v1/internal/handover/:id/recount-actual` | `HandoverController`<br>[handover.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts) | `HandoverService`<br>[handover.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover.service.ts) | `HandoverRecordRepository` | [handover-record.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts) | `RecountActualDto` |
| **Công Thợ Theo Khâu & Đơn Giá Giờ** | `/api/v1/internal/piecework` | `PieceworkController`<br>[piecework.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/piecework.controller.ts) | `PieceworkService`<br>`JobSegmentService`<br>`JobRateSettingsService` | `PieceworkLogRepository` | [piecework-log.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/schemas/piecework-log.schema.ts) | `CheckInSegmentDto`<br>`UpdateJobRatesDto`<br>`AssignDefaultJobDto` |
| **Chấm Công Camera Selfie & Geofencing** | `/api/v1/internal/attendance` | `AttendanceController`<br>[attendance.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/controllers/attendance.controller.ts) | `AttendanceService`<br>[attendance.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/services/attendance.service.ts) | `AttendanceRecordRepository` | [attendance-record.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/schemas/attendance-record.schema.ts) | `CheckInDto`<br>`CheckOutDto`<br>`AttendanceQueryDto` |
| **Chi Phí Xe Shipper (Xăng & Sửa Xe)** | `/api/v1/internal/fuel` | `FuelController`<br>[fuel.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/controllers/fuel.controller.ts) | `FuelService`<br>[fuel.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/services/fuel.service.ts) | `FuelLogRepository` | [fuel-log.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/schemas/fuel-log.schema.ts) | `SubmitFuelDto`<br>`ApproveFuelDto` |
| **Bảng Lương & Phiếu Lương** | `/api/v1/internal/payroll` | `PayrollController`<br>[payroll.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/controllers/payroll.controller.ts) | `PayrollService`<br>[payroll.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/services/payroll.service.ts) | `PayrollPeriodRepository`<br>`PayslipRepository`<br>`PaySettingsRepository` | [payroll-period.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/schemas/payroll-period.schema.ts)<br>[payslip.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/schemas/payslip.schema.ts) | `CalculatePayrollDto`<br>`LockPayrollDto`<br>`PaySettingsDto` |
| **Lưu Trữ Kép & Sao Lưu Google Drive** | `/api/v1/internal/archive` | `ArchiveController`<br>[archive.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/archive.controller.ts) | `ArchiveService`<br>[archive.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/archive.service.ts)<br>`ArchiveCron` | - | - | - |
| **Báo Cáo Streaming & Aggregation** | `/api/v1/internal/reports` | `ReportsController`<br>[reports.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/reports/controllers/reports.controller.ts) | `ReportsService`<br>[reports.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/reports/services/reports.service.ts) | Truy vấn trực tiếp qua Aggregation Pipeline | - | `ReportFilterDto`<br>`ExportReportDto` |

---

### 1.2. Phân Hệ Web Khách Hàng, CMS & Chuyển Nhà

| Nghiệp Vụ | Tuyến API | Controller & File | Service & File | Repository & Schema |
| :--- | :--- | :--- | :--- | :--- |
| **Bài viết & Dịch vụ Giặt** | `/api/v1/articles` | `ArticlesController` | `ArticlesService` | `ArticlesRepository` (`articles/repositories/articles.repository.ts`)<br>[articles.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/articles/schemas/articles.schema.ts) |
| **Chuyên mục Giặt** | `/api/v1/categories` | `CategoriesController` | `CategoriesService` | `CategoriesRepository` (`categories/repositories/categories.repository.ts`)<br>[categories.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/categories/schemas/categories.schema.ts) |
| **Đơn đặt lịch Web** | `/api/v1/orders` | `OrdersController` | `OrdersService` | `OrdersRepository` (`orders/repositories/orders.repository.ts`)<br>[orders.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/orders/schemas/orders.schema.ts) |
| **Form liên hệ B2B (Leads)** | `/api/v1/contacts` | `ContactsController` | `ContactsService` | `ContactsRepository` (`contacts/repositories/contacts.repository.ts`)<br>[contacts.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/contacts/schemas/contacts.schema.ts) |
| **CRM Khách hàng** | `/api/v1/crm` | `CrmController` | `CrmService` | `CrmRepository` (`crm/repositories/crm.repository.ts`)<br>[customer.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/crm/schemas/customer.schema.ts) |
| **Cấu hình & Metadata Web** | `/api/v1/settings` | `SettingsController` | `SettingsService` | `SettingsRepository` (`settings/repositories/settings.repository.ts`)<br>[setting.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/settings/schemas/setting.schema.ts) |
| **Tài khoản Quản trị CMS** | `/api/v1/users` | `UsersController` | `UsersService` | `UsersRepository` (`users/repositories/users.repository.ts`)<br>[user.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/users/schemas/user.schema.ts) |
| **Khảo sát Báo giá Chuyển nhà** | `/api/v1/moving/quotes` | `MovingQuotesController` | `MovingQuotesService` | [moving-quote.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/quotes/schemas/moving-quote.schema.ts) |
| **Dịch vụ & Xe tải Chuyển nhà** | `/api/v1/moving/services` | `MovingServicesController` | `MovingServicesService` | [moving-service.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/moving/services/schemas/moving-service.schema.ts) |

---

# 2. MA TRẬN WEB KHÁCH HÀNG & CMS (`fe-nextjs-thanhxuan-laundry`)

Thư mục: `fe-nextjs-thanhxuan-laundry/src/`  
Kiến trúc: Next.js App Router, Server Components mặc định cho SEO (`src/app/(public)`), Quản trị CMS (`src/app/(admin)/admin`), Feature Colocation đồng bộ với `fe-react-thanhxuan-internal`:
- Màn hình chính: `[Tên]Page.tsx`
- Modal nghiệp vụ: `modals/[Tên]Modal.tsx`
- Component con: `components/[Tên]Component.tsx`
- Layout shells: `components/layout/` (`admin/`, `public/`)
- Tiện ích dùng chung: `components/common/`

| Tuyến URL | Loại | File Trang (Page Entry) | Màn Hình / Modals / Subcomponents | Service / Hooks |
| :--- | :---: | :--- | :--- | :--- |
| `/` (Trang chủ) | RSC | `src/app/(public)/page.tsx` | `HomePage.tsx`<br>`src/features/public/home/` | `HeroSectionComponent`, `IntroSectionComponent`, `ServicesGridComponent`, `WhyChooseUsSectionComponent`, `FaqSectionComponent` |
| `/dich-vu/[...slug]` | RSC (SEO) | `src/app/(public)/dich-vu/[...slug]/page.tsx` | `ServiceDetailPage.tsx`<br>`src/features/public/services/` | `public-services.service.ts` |
| `/tin-tuc` | RSC | `src/app/(public)/tin-tuc/page.tsx` | `ArticleListPage.tsx`<br>`src/features/public/articles/` | `ArticleListComponent`, `ArticleSortFilterComponent` |
| `/lien-he` | Client Form | `src/app/(public)/lien-he/page.tsx` | `ContactPage.tsx`<br>`src/features/public/contacts/` | `public-contacts.service.ts`<br>`public-contacts.action.ts` |
| `/admin/login` | Client / Auth | `src/app/(admin)/admin/login/page.tsx` | `LoginFormComponent.tsx`<br>`src/features/admin/auth/` | `admin-auth.service.ts` |
| `/admin/dashboard` | Client / CMS | `src/app/(admin)/admin/dashboard/page.tsx` | `DashboardPage.tsx`<br>`src/features/admin/dashboard/` | `admin-dashboard.service.ts` |
| `/admin/articles` | Client / CMS | `src/app/(admin)/admin/articles/page.tsx` | `ArticleManagerPage.tsx`<br>`src/features/admin/articles/` | Modals: `ArticleEditorModal`, `ArticleTrashModal`<br>Components: `ArticleManagerTableComponent`, `ArticleManagerToolbarComponent`, `ArticleEditor*Component`<br>Hooks: `useAdminArticles` |
| `/admin/categories` | Client / CMS | `src/app/(admin)/admin/categories/page.tsx` | `CategoryManagerPage.tsx`<br>`src/features/admin/categories/` | Modals: `CategoryEditorModal`<br>Hooks: `useAdminCategories` |
| `/admin/contacts` | Client / CRM | `src/app/(admin)/admin/contacts/page.tsx` | `ContactManagerPage.tsx`<br>`src/features/admin/contacts/` | Modals: `ContactTrashModal`<br>Components: `ContactManagerTableComponent`, `ContactManagerToolbarComponent`, `ContactManagerBulkActionsComponent`<br>Hooks: `useAdminContacts` |
| `/admin/crm` | Client / CRM | `src/app/(admin)/admin/crm/page.tsx` | `CrmManagerPage.tsx`<br>`src/features/admin/crm/` | Components: `CrmManagerTableComponent`, `CrmManagerToolbarComponent`<br>Hooks: `useAdminCrm` |
| `/admin/orders` | Client / CMS | `src/app/(admin)/admin/orders/page.tsx` | `OrdersManagerPage.tsx`<br>`src/features/admin/orders/` | Modals: `OrdersManagerModal`<br>Components: `OrdersManagerTableComponent`, `OrdersManagerToolbarComponent`<br>Hooks: `useAdminOrders` |
| `/admin/email-marketing` | Client / CMS | `src/app/(admin)/admin/email-marketing/page.tsx` | `EmailMarketingPage.tsx`<br>`src/features/admin/email-marketing/` | Modals: `EmailCampaignModal`, `EmailTemplateModal`<br>Components: `EmailCampaignsTableComponent`, `EmailTemplatesTableComponent`<br>Hooks: `useAdminEmailMarketing` |
| `/admin/accounts` | Client / CMS | `src/app/(admin)/admin/accounts/page.tsx` | `AccountManagerPage.tsx`<br>`src/features/admin/users/` | Modals: `AccountEditorModal`<br>Hooks: `useAdminUsers` |
| `/admin/settings/**` | Client / CMS | `src/app/(admin)/admin/settings/**/page.tsx` | `SettingsPage.tsx`<br>`src/features/admin/settings/` | Components: `SettingEditorAboutComponent`, `SettingEditorContactComponent`, `SettingEditorFooterComponent`, `SettingEditorHeaderComponent`, `SettingEditorHomeComponent`, `SettingEditorServiceComponent`, `SettingEditorZaloComponent` |
| `/admin/zalo-marketing` | Client / CMS | `src/app/(admin)/admin/zalo-marketing/page.tsx` | `ZaloMarketingPage.tsx`<br>`src/features/admin/zalo/` | `admin-zalo.service.ts` |

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
| `/dashboard`<br>(Trung tâm điều hành xưởng thời gian thực) | `DashboardPage.tsx`<br>`src/features/dashboard/` | - | `DashboardHandoverPanelComponent.tsx`<br>`DashboardWorkforcePanelComponent.tsx` | `useDashboardData.ts`<br>`apiClient` |
| `/operations/shipper/handover`<br>(Phiếu giao nhận xe tải & Đếm thay) | `ShipperHandoverPage.tsx`<br>`HandoverDetailPage.tsx`<br>`src/features/operations/handovers/` | `PrepOrderModal.tsx`<br>`ShipperCountPartnerModal.tsx`<br>`SlipFullscreenViewerModal.tsx`<br>`DisputeModal.tsx` | `ShipperHandoverItemCardComponent.tsx`<br>`HandoverSlipGalleryComponent.tsx`<br>`HandoverHeaderComponent.tsx` | `apiClient`<br>`HandoverExportHelper.ts` |
| `/operations/warehouse-manager/warehouse`<br>(Lập phiếu xuất kho & Thư viện ảnh phiếu) | `WarehouseHandoverPage.tsx`<br>`src/features/operations/handovers/` | `PrepOrderModal.tsx`<br>`HandoverDeliverySlipModal.tsx`<br>`WarehouseScheduleSettingsModal.tsx`<br>`WarehouseItemFilterSettingsModal.tsx` | `HandoverSlipGalleryComponent.tsx`<br>`WarehouseCleanPlanTabComponent.tsx`<br>`WarehouseSummaryTabComponent.tsx` | `apiClient`<br>`HandoverExportHelper.ts`<br>`warehouseItemDisplayHelper.ts` |
| `/operations/worker/recount`<br>(Trạm kiểm đếm lại gom bao xưởng) | `RecountStationPage.tsx`<br>`src/features/operations/handovers/` | - | `PrepOrderSlipPreviewComponent.tsx` | `apiClient`<br>`HandoverExportHelper.ts` |
| `/management/admin/workshop`<br>(Cài đặt vị trí xưởng & Wi-Fi) | `WorkshopSettingsPage.tsx`<br>`src/features/management/workshop/` | - | - | `useWorkshopSettings.ts`<br>`apiClient` |
| `/operations/attendance`<br>(Chấm công camera selfie) | `AttendancePage.tsx`<br>`src/features/operations/attendance/` | - | - | `useAttendance.ts`<br>`useWorkshopGeo.ts`<br>`apiClient` |
| `/operations/worker/piecework`<br>(Trạm công thợ theo phiên khâu thời gian thực) | `HourlyWorkStationPage.tsx`<br>`src/features/operations/piecework/` | - | `CurrentSegmentCardComponent.tsx`<br>`JobStagePickerComponent.tsx`<br>`HourlyWorkTaskListComponent.tsx` | `useHourlyWorkStation.ts`<br>`apiClient` |
| `/management/manager/piecework`<br>(Quản lý phân khâu, cài đơn giá & duyệt công) | `HourlyWorkReviewPage.tsx`<br>`src/features/management/piecework/` | - | `JobRatesSettingsComponent.tsx`<br>`WorkerDefaultJobComponent.tsx`<br>`DailyWorkReviewComponent.tsx` | `useJobRates.ts`<br>`useWorkerDefaultJobs.ts`<br>`useDailyWorkReview.ts` |
| `/operations/shipper/fuel`<br>(Chi phí xe: Xăng & Sửa xe) | `ShipperFuelPage.tsx`<br>`src/features/operations/fuel/` | - | - | `apiClient` |
| `/operations/partner-manager/partner`<br>`/operations/partner-staff/partner`<br>(Cổng đối tác: Đếm bẩn & Thư viện phiếu) | `PartnerHandoverPage.tsx`<br>`src/features/operations/handovers/` | `HandoverDeliverySlipModal.tsx`<br>`SlipFullscreenViewerModal.tsx` | `PartnerCountTabComponent.tsx`<br>`PartnerReceiptTabComponent.tsx`<br>`HandoverSlipGalleryComponent.tsx` | `usePartnerCountFlow.ts`<br>`usePartnerReceiptFlow.ts`<br>`HandoverExportHelper.ts` |
| `/operations/payslip`<br>(Bảng lương tạm tính theo ngày & phiếu chính thức) | `MyPayslipPage.tsx`<br>`src/features/operations/payroll/` | - | `DailyEarningsTableComponent.tsx`<br>`OfficialPayslipCardComponent.tsx` | `useMyPayslip.ts`<br>`apiClient` |
| `/management/manager/partner`<br>(Quản trị đối tác, thương hiệu & bảng giá) | `PartnersManagementPage.tsx`<br>`src/features/management/partners/` | `PartnerModal.tsx`<br>`BrandModal.tsx`<br>`CatalogModal.tsx`<br>`DeleteConfirmModal.tsx` | `PartnerListComponent.tsx`<br>`BrandListComponent.tsx`<br>`CatalogListComponent.tsx` | `apiClient` |
| `/management/manager/personnel`<br>(Duyệt & phân quyền tài khoản) | `StaffManagementPage.tsx`<br>`ApprovalManagementPage.tsx`<br>`AuditLogPage.tsx`<br>`src/features/management/auth/` | `StaffFormModal.tsx`<br>`StaffDeleteModal.tsx` | `StaffTableComponent.tsx`<br>`StaffFilterComponent.tsx` | `apiClient` |
| `/management/manager/attendance`<br>(Bảng công toàn xưởng & Duyệt ca) | `AttendanceReviewPage.tsx`<br>`src/features/management/attendance/` | `AttendanceReviewModal.tsx` | `AttendanceFilterBarComponent.tsx`<br>`AttendanceTableComponent.tsx` | `useAttendanceReview.ts`<br>`apiClient` |
| `/management/accountant/payroll`<br>(Bảng lương chu kỳ & Chốt sổ) | `PayrollManagementPage.tsx`<br>`src/features/management/payroll/` | `PayslipDetailAdjustModal.tsx` | `PayrollActionToolbarComponent.tsx`<br>`PayslipTableComponent.tsx` | `usePayrollManagement.ts`<br>`apiClient` |
| `/management/accountant/fuel`<br>(Duyệt chi phí xe máy) | `FuelReviewPage.tsx`<br>`src/features/management/fuel/` | - | - | `apiClient` |
| `/operations/report`<br>(Trung tâm báo cáo streaming 8 phân hệ) | `ReportsPage.tsx`<br>`src/features/operations/reports/` | - | `ReportsFilterBarComponent.tsx`<br>`WarehouseReportSectionComponent.tsx`<br>`WorkforceReportSectionComponent.tsx`<br>`QualityFuelReportSectionComponent.tsx` | `useReports.ts`<br>`reports.service.ts` |

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


### 4.3. Tiện Ích & Component Dùng Chung Frontend Internal (fe-react-thanhxuan-internal/src/components/common)
- **Chữ ký điện tử thông minh:** [SignatureInputComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/SignatureInputComponent.tsx) (Tự động nhận diện chữ ký mẫu từ tài khoản `StaffAccount.signatureUrl`, hỗ trợ toggle dùng chữ ký đã lưu / ký tay mới, và checkbox lưu làm chữ ký mặc định).