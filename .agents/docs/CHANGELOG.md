# NHẬT KÝ THAY ĐỔI HỆ THỐNG (CHANGELOG)

Tài liệu ghi nhận toàn bộ lịch sử tiến hóa, các giai đoạn nâng cấp, bugfix và triển khai tính năng của Hệ sinh thái Công ty Thanh Xuân qua từng Plan.

---

## 2026-10-05

### Tái Cấu Trúc Modular SRS & SDD (Master + 3 Phân Hệ Chi Tiết)
- **Cấu trúc tài liệu Modular SRS & SDD:**
  - Tách tài liệu `.agents/docs/SRS_SDD.md` trước đây thành hệ thống tài liệu modular gồm file tổng quan và 3 tài liệu phân hệ chi tiết:
    - [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md): Tài liệu kiến trúc tổng thể (Master System Architecture), bao gồm System Context, Sơ đồ kết nối Monorepo 3 ứng dụng, Hạ tầng VPS & Multi-Database, Master Index liên kết, và Quy chuẩn kỹ thuật dùng chung toàn hệ thống.
    - [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md): Đặc tả phân hệ Backend API tập trung (`be-nestjs-thanhxuan`), 3 database MongoDB độc lập, quy chuẩn Repository Pattern, toàn bộ bảng API Contracts, DTO validation, State Machines, RBAC Guards, Cron jobs và Streaming export reports.
    - [srs_sdd_fe_nextjs.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md): Đặc tả phân hệ Web Khách Hàng & CMS Tiếp thị (`fe-nextjs-thanhxuan-laundry`), Server Components SEO (RSC), Metadata động, Lead Capture Form CTA, CMS Quản trị bài viết, CRM Leads, chiến dịch Zalo OA/Email.
    - [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md): Đặc tả phân hệ Cổng Vận Hành Xưởng & Quản Vận (`fe-react-thanhxuan-internal`), Centralized Router (`van-hanh/` & `quan-ly/`), Mobile-First PWA, Canvas Chữ ký số, Trạm đếm gom bao, Offline Queue IndexedDB, phân quyền 8 vai trò RBAC.
- **Cập nhật Quy tắc (Workspace Rules) & Quy trình (Global Workflows):**
  - `AGENTS.md` & `GEMINI.md`: Định nghĩa rõ nguồn sự thật kiến trúc tổng thể tại `SRS_SDD.md` và chi tiết từng phân hệ tại `srs_sdd/srs_sdd_<app>.md`. Quy định DoD và quy trình `/act`, `/fix`, `/docs-sync` cập nhật đúng tài liệu phân hệ bị ảnh hưởng.
  - Workflows `srs-sdd.md`, `docs-sync.md`, `act.md`, `plan.md`, `review.md`, `fix.md`: Cập nhật chỉ dẫn đồng bộ tài liệu theo mô hình Modular SRS/SDD, bảo đảm không làm phình to file tài liệu tổng và duy trì tính sống (Living Docs) chính xác.
  - `create-react-feature/SKILL.md`: Cập nhật dẫn chiếu đến tài liệu phân hệ `srs_sdd_fe_internal.md`.

### Fix - Tinh Gọn Quyền Hạn Menu & Khắc Phục Lỗi Hiển Thị Trang Giao Nhận
- **Phân quyền Đề xuất xăng (`/van-hanh/shipper/xang`):** Chỉ dành riêng cho `StaffRole.SHIPPER`. Loại bỏ hoàn toàn khỏi menu của Kế toán, Manager, Admin (Kế toán chỉ duyệt xăng tại `/quan-ly/accountant/xang`).
- **Phân quyền Phiếu lương (`/van-hanh/phieu-luong`):** Loại bỏ vai trò `StaffRole.ADMIN` khỏi menu và `ProtectedRoute` trang phiếu lương (Admin không có phiếu lương cá nhân).
- **Phân quyền Cổng Quản lý Nhà hàng (`/van-hanh/restaurant-manager/nha-hang`):** Chỉ hiển thị và cho phép duy nhất vai trò `StaffRole.RESTAURANT_MANAGER` (loại bỏ khỏi menu Kế toán, Manager, Admin).
- **Tách biệt giao diện Trạm đếm gom bao (`/van-hanh/worker/tram-dem`):**
  - Xây dựng component chuyên biệt `RecountStationPage` (`src/features/recount/RecountStationPage.tsx`) dành riêng cho khu vực rạch bao niêm phong và đếm lại đồ bẩn xưởng, tách biệt hoàn toàn khỏi giao diện quản lý kho sạch `WarehousePage`.
  - Phân quyền cho phép `WAREHOUSE_MANAGER`, `WORKER`, `MANAGER`, `ADMIN` truy cập trực tiếp.
- **Khắc phục lỗi trang Giao nhận (`/van-hanh/shipper/giao-nhan`):**
  - Khắc phục lỗi `TypeError: scheduledPartners.map is not a function` do API `/partners/schedule` trả về object `{ date, partners: [...] }`.
  - Chuẩn hóa trích xuất `Array.isArray(res.data) ? res.data : (res.data?.partners || [])` và fallback an toàn `partnerList`, giúp trang giao nhận hiển thị trơn tru cho Quản lý kho, Manager, Admin và Shipper.
- **Cá nhân hóa Trung tâm Quản lý (`http://localhost:3001/quan-ly`):**
  - Tách bạch rõ quyền hạn hiển thị các Tab và Cards trong Hub:
    - `ACCOUNTANT`: Chỉ tải các chức năng Kế toán (Bảng Lương Chu Kỳ, Duyệt Hoàn Tiền Xăng, Báo Cáo & Xuất File). Ẩn hoàn toàn Nhân sự, Chấm công, Khoán việc, Đối tác.
    - `MANAGER`: Tải các chức năng Quản lý xưởng (Nhân Sự, Phê Duyệt Tài Khoản, Bảng Chấm Công, Chốt Khoán Việc, Đối Tác & Đồ Giặt, Báo Cáo). Ẩn hoàn toàn Duyệt xăng và Bảng lương (tuân thủ quy tắc bảo mật tước quyền `pay.*`).
    - `ADMIN`: Toàn quyền tất cả các chức năng quản lý.
    - `RESTAURANT_MANAGER`: Cho phép truy cập `/quan-ly` và chỉ hiển thị chức năng Phê duyệt nhân viên nhà hàng thuộc chi nhánh.

### Plan 13 - Tinh Gọn Phân Quyền Menu & Cơ Chế Tự Động Chấm Công Cho Shipper
- **Backend - Cơ chế Tự động Kích hoạt Check-in cho Shipper (`be-nestjs-thanhxuan`):**
  - `src/modules/internal/attendance/attendance.service.ts`: Bổ sung method `ensureCheckInForShipper(shipperId, recordCode)`:
    - Kiểm tra qua `attendanceRepo.findByWorkerAndDateKey(shipperId, dateKey)` để đảm bảo tính Idempotent (không tạo trùng lặp nếu shipper đã có ca làm việc trong ngày).
    - Tự động tạo bản ghi chấm công ca mở (`status: AttendanceStatus.OPEN`, `photoId: 'AUTO_HANDOVER_SIGN'`, `note: 'Tự động check-in khi xử lý phiếu giao nhận <recordCode>'`).
  - `src/modules/internal/handover/handover.module.ts`: Import `AttendanceModule` để cung cấp `AttendanceService`.
  - `src/modules/internal/handover/handover.service.ts`: Inject `@Optional() attendanceService?: AttendanceService` và gọi `ensureCheckInForShipper` trong hàm `deliver(...)` khi người thực hiện có vai trò `StaffRole.SHIPPER`. Bọc `try/catch` phòng thủ để không làm gián đoạn tiến trình giao nhận nếu phát sinh lỗi chấm công.
  - `attendance.service.spec.ts` & `handover.service.spec.ts`: Bổ sung unit test kiểm chứng đầy đủ 2 kịch bản (đã có ca và tạo mới ca khi shipper ký nhận hàng thành công). Pass 100% 43 test suites và 194 tests.
- **Frontend - Tinh gọn Menu Phân quyền & UI (`fe-react-thanhxuan-internal`):**
  - `src/components/layout/nav-config.ts`:
    - Giới hạn quyền hiển thị menu Chấm công cá nhân (`cham-cong`): Chỉ dành riêng cho Thợ xưởng (`StaffRole.WORKER`). Ẩn hoàn toàn khỏi menu của các tài khoản Nhà hàng (`RESTAURANT_MANAGER`, `RESTAURANT_STAFF`), Quản lý (`WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`) và Kế toán (`ACCOUNTANT`).
    - Menu Phiếu lương (`phieu-luong`): Ẩn hoàn toàn khỏi các vai trò Đối tác Nhà hàng (`RESTAURANT_MANAGER`, `RESTAURANT_STAFF`).
    - Cập nhật hàm `getMobileQuickNavItems(role)`:
      - `SHIPPER`: Giao Nhận, Xăng Xe, Lương (loại bỏ Chấm công).
      - `RESTAURANT_STAFF`: Nhà Hàng (loại bỏ Chấm công).
      - `RESTAURANT_MANAGER`: Nhà Hàng, Phê Duyệt NV (loại bỏ Chấm công).
      - `WAREHOUSE_MANAGER`: Tổng Quan, Kho Sạch, Giao Nhận (loại bỏ Chấm công).
      - `ACCOUNTANT`: Tổng Quan, Báo Cáo, Bảng Lương, Duyệt Xăng.
      - `ADMIN` / `MANAGER`: Tổng Quan, Điều Hành, Giao Nhận (loại bỏ Chấm công).
      - `WORKER`: Khoán Việc, Chấm Công, Lương.
  - `src/app/(internal)/van-hanh/cham-cong/page.tsx`: Bọc component `AttendancePage` bằng `<ProtectedRoute allowedRoles={[StaffRole.ADMIN, StaffRole.WORKER]}>` để chặn triệt để việc truy cập trực tiếp qua URL.
  - `src/features/dashboard/DashboardPage.tsx`: Bọc nút "Điểm danh ca" chỉ hiển thị khi `user?.role === StaffRole.WORKER`.
- **Tài liệu & Quy chuẩn:** Đồng bộ chú thích phân quyền route trong `.agents/skills/create-react-feature/SKILL.md` và `SRS_SDD.md`.

### Plan 12 - Tái Cấu Trúc Định Tuyến Vận Hành (van-hanh) & Quản Lý (quan-ly) Theo Nhóm Tài Khoản
- **Phân hệ Vận hành (`src/app/(internal)/van-hanh/`):**
  - Tách bạch và gom nhóm các tuyến đường vận hành theo từng nhóm tài khoản phụ trách:
    - `warehouse-manager/kho/page.tsx`: Thủ kho soạn đồ sạch xuất kho theo lịch (`StaffRole.WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`).
    - `shipper/giao-nhan/page.tsx` & `shipper/giao-nhan/[recordCode]/page.tsx`: Điều phối, danh sách và chi tiết phiếu giao nhận 2 chiều cho Tài xế xe tải (`StaffRole.SHIPPER`, `WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`).
    - `shipper/xang/page.tsx`: Tài xế nộp đề xuất hoàn tiền xăng xe kèm ảnh hóa đơn (`StaffRole.SHIPPER`).
    - `worker/tram-dem/page.tsx`: Trạm rạch bao đếm lại đồ bẩn xưởng cho Thợ xưởng (`StaffRole.WORKER`, `MANAGER`, `ADMIN`).
    - `worker/khoan-viec/page.tsx`: Thợ xưởng chấm sản lượng khoán gấp, ủi, đóng gói (`StaffRole.WORKER`, `MANAGER`, `ADMIN`).
    - `restaurant-manager/nha-hang/page.tsx`: Cổng đối soát giao nhận tháng & phê duyệt nhân viên nhà hàng cho Quản lý nhà hàng (`StaffRole.RESTAURANT_MANAGER`, `MANAGER`, `ADMIN`).
    - `restaurant-staff/nha-hang/page.tsx`: Cổng đối soát giao nhận & ký nhận đồ vải cho Nhân viên nhà hàng (`StaffRole.RESTAURANT_STAFF`, `RESTAURANT_MANAGER`, `MANAGER`, `ADMIN`).
  - Đặt các tuyến đường dùng chung toàn thể nhân sự trực tiếp ngoài thư mục `van-hanh/`:
    - `cham-cong/page.tsx`: Chấm công camera selfie cá nhân & lịch sử ca làm (toàn bộ nhân sự xưởng/đối tác).
    - `phieu-luong/page.tsx`: Nhân viên tra cứu phiếu lương cá nhân (thợ xưởng, tài xế, thủ kho).
    - `bao-cao/page.tsx`: Trung tâm 6 báo cáo tổng hợp Aggregation và xuất streaming file Excel/PDF.
- **Phân hệ Quản trị (`src/app/(internal)/quan-ly/`):**
  - Tách bạch rõ 2 nhóm vai trò chuyên trách:
    - `manager/`: Dành cho Quản lý điều hành xưởng (`StaffRole.MANAGER`, `ADMIN`): `nhan-su/page.tsx` (quản trị nhân sự & phân quyền RBAC), `doi-tac/page.tsx` (chuỗi đối tác & catalog đồ giặt), `cham-cong/page.tsx` (bảng công toàn xưởng & duyệt ca bất thường), `khoan-viec/page.tsx` (báo cáo sản lượng & chốt sản lượng ngày).
    - `accountant/`: Dành cho Kế toán xưởng (`StaffRole.ACCOUNTANT`, `ADMIN`): `xang/page.tsx` (kế toán duyệt/từ chối hóa đơn hoàn xăng), `bang-luong/page.tsx` (cấu hình đơn giá lương & chốt bảng lương chu kỳ).
  - Giữ các trang dùng chung cấp quản trị trực tiếp ngoài thư mục `quan-ly/`:
    - `page.tsx`: Command Center Hub quản trị tổng quan (Quản lý, Kế toán, Admin).
    - `phe-duyet/page.tsx`: Phê duyệt tài khoản nhân viên nội bộ & nhà hàng (Admin, Manager, Restaurant Manager).
- **Hệ thống Định tuyến Centralized Router (`src/app/router.tsx`) & Tương thích ngược:**
  - Cập nhật toàn bộ các route mới theo đúng cấu trúc phân nhóm vai trò.
  - Bổ sung các redirect routes tự động chuyển tiếp từ toàn bộ các URL cũ sang các URL mới mà không gây 404.
  - Xây dựng component `OldHandoverDetailRedirect` chuyển tiếp thông minh param `:recordCode` sang `/van-hanh/shipper/giao-nhan/:recordCode`.
- **Đồng bộ Menu Điều hướng & Luồng Đăng nhập:**
  - `src/components/layout/nav-config.ts`: Cập nhật toàn bộ URL `path` trong `NAV_GROUPS`, tách biệt item menu của Quản lý nhà hàng và Nhân viên nhà hàng, cập nhật hàm `getMobileQuickNavItems(role)`.
  - `src/features/auth/AuthContext.tsx`: Cập nhật hàm `getDefaultRouteForRole` chuyển hướng người dùng sau khi đăng nhập đến đúng trang đích tương ứng với vai trò tài khoản (`WORKER` $\rightarrow$ `/van-hanh/worker/khoan-viec`, `SHIPPER` $\rightarrow$ `/van-hanh/shipper/giao-nhan`, `WAREHOUSE_MANAGER` $\rightarrow$ `/van-hanh/warehouse-manager/kho`, v.v.).
  - Cập nhật các liên kết `navigate(...)` trong `ManagementPage.tsx`, `DashboardPage.tsx`, `HandoverListPage.tsx`, `HandoverDetailPage.tsx`.
- **Cập nhật Tài liệu Quy chuẩn Kỹ thuật:**
  - Cập nhật ma trận đối chiếu API Backend $\rightarrow$ Frontend Routes và cây thư mục định tuyến `src/app/` hoàn chỉnh trong `.agents/skills/create-react-feature/SKILL.md`.

### Plan 11 - Tái Cấu Trúc Route & Giao Diện Thao Tác fe-react-thanhxuan-internal Chuẩn SRS_SDD
- **Tái cấu trúc Centralized Route Tree (`src/app/router.tsx`):**
  - Khai báo đầy đủ các route mới bao phủ 100% các tuyến API của Backend NestJS theo `SRS_SDD.md`.
  - Bổ sung route Quên mật khẩu qua OTP email: `/quen-mat-khau` (`src/app/(auth)/quen-mat-khau/page.tsx`).
  - Bổ sung route Khoán việc thợ xưởng: `/khoan-viec` (`src/app/(internal)/khoan-viec/page.tsx`), tách bạch rõ với trạm rạch bao đếm lại xưởng `/tram-dem`. Cập nhật điều hướng mặc định sau đăng nhập của vai trò `WORKER` sang `/khoan-viec`.
  - Bổ sung route Trung tâm Báo cáo & Xuất file: `/bao-cao` (`src/app/(internal)/bao-cao/page.tsx`).
  - Thiết lập cụm Sub-routes chuyên biệt dưới `/quan-ly/` bọc `ProtectedRoute` kiểm soát vai trò RBAC nghiêm ngặt:
    - `/quan-ly/nhan-su` (`ADMIN`, `MANAGER`): Quản lý tài khoản nhân viên, đổi vai trò, khóa/mở khóa tài khoản.
    - `/quan-ly/phe-duyet` (`ADMIN`, `MANAGER`, `RESTAURANT_MANAGER`): Phê duyệt đăng ký nhân viên nội bộ & nhà hàng.
    - `/quan-ly/cham-cong` (`ADMIN`, `MANAGER`): Bảng công toàn xưởng, duyệt ca làm việc bất thường `NEEDS_REVIEW`.
    - `/quan-ly/khoan-viec` (`ADMIN`, `MANAGER`): Báo cáo sản lượng khoán toàn xưởng, chốt sản lượng cuối ngày (`CONFIRMED`).
    - `/quan-ly/xang` (`ADMIN`, `ACCOUNTANT`): Kế toán xét duyệt hoặc từ chối hoàn tiền xăng đội xe giao nhận.
    - `/quan-ly/bang-luong` (`ADMIN`, `ACCOUNTANT`): Cấu hình đơn giá lương, tính toán bảng lương chu kỳ và chốt sổ kỳ lương (`LOCKED` / `PAID`).
- **Phân rã `ManagementPage.tsx` (từ 866 dòng) thành các Feature Modules độc lập:**
  - Trích xuất toàn bộ các tab nghiệp vụ thành các sub-components độc lập tại `src/features/management/components/`: `StaffManagementView`, `ApprovalManagementView`, `AttendanceReviewView`, `PieceworkConfirmView`, `FuelReviewView`, `PayrollManagementView`, `AuditLogView`.
  - Tái cấu trúc `ManagementPage.tsx` thành Command Center Hub: Tổng hợp các thẻ số liệu cảnh báo (Pending approvals, ca cần duyệt, đề xuất xăng chờ duyệt, kỳ lương hiện tại) kèm Quick Links truy cập trực tiếp bằng Deep Link URL.
- **Module Báo Cáo Mới (`src/features/reports/`):**
  - Xây dựng `reports.service.ts` gọi đầy đủ 6 endpoints báo cáo aggregation backend (`/reports/revenue`, `/reports/production`, `/reports/partners`, `/reports/shipper`, `/reports/worker`, `/reports/fuel-cost`).
  - Tích hợp streaming download trực tiếp file Excel (`/reports/export/excel`) và PDF (`/reports/export/pdf`) thông qua `responseType: 'blob'`.
  - Xây dựng custom hook `useReports.ts` quản lý state bộ lọc thời gian và gọi dữ liệu TanStack Query.
  - Giao diện `ReportsView.tsx` với thiết kế trực quan, KPI metrics, biểu đồ tiến độ và bộ lọc ngày linh hoạt.
- **Module Phục Hồi Mật Khẩu (`src/features/auth/ForgotPasswordPage.tsx`):**
  - Quy trình 2 bước: Nhập email nhận OTP và Nhập mã OTP + mật khẩu mới xác nhận theo API `POST /auth/forgot-password` và `POST /auth/reset-password`.
- **Cập nhật Navigation System (`nav-config.ts`):**
  - Đồng bộ danh mục menu trên Desktop Sidebar (`DesktopSidebar.tsx`), Mobile Bottom Bar (`MobileBottomBar.tsx`) và Mobile Drawer (`MobileNavDrawer.tsx`).
  - Phân quyền hiển thị theo ma trận vai trò người dùng (`hasAccessToNavItem`), tự động điều chỉnh 4 nút thao tác nhanh trên Mobile Bottom Bar theo vai trò (`SHIPPER`, `WORKER`, `ACCOUNTANT`, `WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`).

### Item Catalog Cloudinary Direct Upload & Anti-Orphan-Images Mechanism
- **Backend:** Bổ sung endpoint `POST /api/v1/internal/partners/catalogs/upload-image` (bảo vệ bởi `InternalJwtGuard`, phân quyền `PARTNER_MANAGE`, tích hợp `UploadModule`/`UploadService`), xử lý tải file ảnh trực tiếp lên Cloudinary vào thư mục chuyên dụng `laundry-express/item-catalogs`. Bổ sung cơ chế tự động dọn dẹp ảnh cũ trên Cloudinary (`UploadService.deleteFile`) trong `partners.service.ts` khi người dùng cập nhật ảnh mới hoặc xóa món đồ khỏi danh mục.
- **Frontend:** Nâng cấp `CatalogDialog.tsx` với cơ chế trì hoãn tải ảnh lên Cloudinary (Lazy/Deferred Upload): Khi chọn file ảnh từ máy tính/điện thoại, hệ thống chỉ tạo URL tạm `URL.createObjectURL` để xem trước (Preview) ngay trên giao diện mà hoàn toàn KHÔNG gọi API upload. Chỉ khi người dùng bấm nút "Lưu Thay Đổi" hoặc "Thêm Đồ Giặt", file mới được gửi lên Cloudinary và lưu vào cơ sở dữ liệu. Nếu người dùng bấm Hủy hoặc đóng hộp thoại, URL blob được giải phóng (`URL.revokeObjectURL`) và không có bất kỳ ảnh rác nào được tải lên Cloudinary.

### Item Catalog Image & Filter Refactor
- **Backend:** Bổ sung trường `imageUrl` vào Schema `ItemCatalog`, `CreateItemCatalogDto`, `UpdateItemCatalogDto` và cập nhật `partners.service.ts` (hỗ trợ lưu và cập nhật link ảnh minh họa mặt hàng).
- **Frontend:** Thêm thuộc tính `imageUrl` vào interface `ItemCatalog`. Cập nhật `CatalogDialog.tsx` với ô nhập URL ảnh đồ giặt và khung xem trước ảnh (Preview). Cập nhật `CatalogListView.tsx` thay thế cột "Thương hiệu" bằng cột "Hình ảnh" đồ giặt (thumbnail trực quan, hiệu ứng hover zoom và fallback icon khi ảnh trống/lỗi).
- **Bộ lọc:** Loại bỏ tùy chọn "Tất cả thương hiệu" khỏi dropdown bộ lọc danh mục đồ trong `PartnersCatalogFilter.tsx`, đồng thời tự động chọn thương hiệu đầu tiên trong `PartnersPage.tsx`, đảm bảo dữ liệu đồ giặt luôn phân tách rõ ràng theo từng thương hiệu riêng biệt.

---

## 2026-10-04

### Fix - Khắc phục lỗi HTTP 400 và hoàn thiện thuật toán dời thứ tự hiển thị Item Catalog
- Sửa lỗi HTTP 400 Bad Request khi sửa đồ giặt (ví dụ `4PS_KHAN_AN_XAM`): khai báo `@IsOptional() itemCode?: string` và `@IsString() unit?: string` trong `UpdateItemCatalogDto` nhằm tương thích với `ValidationPipe` (`forbidNonWhitelisted: true`). Phía Frontend loại bỏ `itemCode` khỏi payload của request `PATCH /partners/catalogs/:id`.
- Chuẩn hóa hàm helper `normalizeItemUnit` ở tầng Backend Service `partners.service.ts` để chuyển đổi chuỗi tiếng Việt (`"Chiếc"`, `"Kg"`, `"Bộ"`) sang enum Mongoose (`PIECE`, `KG`, `SET`). Phía Frontend `CatalogDialog.tsx` chuẩn hóa ngược lại enum sang tên hiển thị tiếng Việt trên `<select>`.
- Hoàn thiện thuật toán di chuyển thứ tự hiển thị 2 chiều (`moveSortOrder`) trong `ItemCatalogRepository`: Khi tăng ưu tiên (dời lên trên), toàn bộ các đồ giặt trong khoảng `[newOrder, oldOrder - 1]` tự động cộng thêm 1 (+1). Khi giảm ưu tiên (dời xuống dưới), toàn bộ các đồ giặt trong khoảng `[oldOrder + 1, newOrder]` được đôn lên (-1). Kết hợp `normalizeSortOrders` đảm bảo dãy số thứ tự luôn không trùng nhau và liên tục 1, 2, 3...

### Plan 10 - Tái cấu trúc Item Catalog (sortOrder, phân quyền xóa, isActive)
- **Backend:** Cập nhật Schema `item_catalogs` (thêm `sortOrder: number`, index `{ brand: 1, sortOrder: 1, itemCode: 1 }`, xóa bỏ hoàn toàn `priceToCustomer` và `foldingRateWorker`). Cập nhật `CreateItemCatalogDto` và `UpdateItemCatalogDto`. Bổ sung API `PATCH /partners/catalogs/reorder` cập nhật thứ tự hàng loạt (`ReorderCatalogsDto`). Phân quyền nghiêm ngặt API `DELETE /partners/catalogs/:id` chỉ cho phép Admin (`ACCOUNT_ADMIN`) thực hiện xóa vĩnh viễn (Hard Delete). Bổ sung fallback an toàn trong `piecework.service.ts` và `reports.service.ts`.
- **Quy tắc thứ tự ưu tiên (Business Rule):** Thứ tự hiển thị không được trùng nhau trong cùng một thương hiệu. Khi thêm hoặc sửa thứ tự `sortOrder = X` của một món đồ, hệ thống tự động cộng thêm 1 (+1) cho toàn bộ các món đồ giặt phía sau (`shiftOrdersGte`) và chuẩn hóa (`normalizeSortOrders`) đảm bảo thứ tự luôn liên tục 1, 2, 3...
- **Frontend:** Cập nhật interface `ItemCatalog`. Nâng cấp `CatalogListView` (bỏ 2 cột đơn giá; thêm cột "Thứ tự" kèm các nút di chuyển Lên/Xuống; thêm cột "Trạng thái (Hiển thị)" với nút Toggle `isActive` trực tiếp cho cả Admin và Manager; chỉ render nút "Xóa vĩnh viễn" cho tài khoản `ADMIN`). Cập nhật `CatalogDialog` (loại bỏ 2 ô đơn giá, bổ sung ô nhập thứ tự ưu tiên `sortOrder` và checkbox kích hoạt `isActive`). Nâng cấp `DeleteConfirmDialog` với popup cảnh báo màu đỏ xác nhận xóa vĩnh viễn khỏi CSDL.

### Plan 9 - Phân rã Component PartnersPage, Chuẩn Hóa Bố Cục 4 Tầng & Container-Responsive
- Phân rã toàn diện `PartnersPage.tsx` (>1400 dòng xuống ~240 dòng) thành các sub-components độc lập tại `src/features/partners/components/`: `PartnersTopBanner`, `PartnersActionBar`, `PartnersPartnerFilter`, `PartnersCatalogFilter`, `PartnerListView`, `PartnerCard`, `BrandListView`, `BrandCard`, `CatalogListView`, `PartnerDialog`, `BrandDialog`, `CatalogDialog`, `DeleteConfirmDialog`.
- Thiết lập chuẩn kiến trúc bố cục 4 tầng dọc (Vertical 4-Tier Hierarchy): Tầng 1: `PageBanner`; Tầng 2: `PageActionBar`; Tầng 3: `PageFilterBar`; Tầng 4: Nội dung dữ liệu tự dãn thích ứng container-responsive (`grid-cols-[repeat(auto-fill,minmax(280px,1fr))]`).
- Mở rộng chuẩn hóa cấu trúc 4 tầng cho các trang quản trị chính: `ManagementPage`, `HandoverListPage` và `WarehousePage`.

### Plan 8 - Tái Cấu Trúc Menu & Điều Hướng Hệ Thống Chuẩn UX Quản Trị
- **Desktop (>= 1024px):** Ẩn Bottom Bar; thiết lập Left Sidebar cố định bên trái (`w-64`) theo thị giác F-pattern gồm 4 nhóm phân quyền RBAC kèm thẻ hồ sơ người dùng, ThemeToggle và nút Đăng xuất tại chân Sidebar.
- **Mobile (< 1024px):** Rút gọn thanh chân trang (Bottom Bar) chỉ còn 4 mục thiết yếu + 1 nút "Thêm" mở Navigation Drawer (Sheet) từ cạnh trái hiển thị toàn bộ cây phân hệ quản trị.

### Plan 7 - Quản lý Đối tác, Quản lý Thương hiệu động, Danh mục đồ giặt Pizza 4P's
- Di chuyển trang Quản lý Đối tác sang `/quan-ly/doi-tac`, phân quyền nghiêm ngặt `ADMIN` và `MANAGER`.
- Bổ sung collection `brands`, xây dựng Schema, Repository, DTO, Service và Controller CRUD cho Thương hiệu (`/partners/brands`). Nới lỏng kiểm tra `brand` ở `Partner` và `ItemCatalog` từ enum tĩnh sang string có index.
- Xây dựng phân hệ Quản lý Danh mục đồ giặt theo Thương hiệu. Tạo script seed `seed-pizza-4ps-catalogs.ts` cho Pizza 4P's.

### Plan 6 - Tái Cấu Trúc fe-react-thanhxuan-internal Sang Mô Hình App Router
- Tái cấu trúc tổ chức mã nguồn theo kiến trúc `src/app/` chuẩn App Router (Root Layout, Root Page, Route Group `(auth)` và `(internal)`).
- Xây dựng Centralized Route Tree (`src/app/router.tsx`) qua React Router v7, tinh giản `App.tsx` còn ~7 dòng. Bảo toàn 100% PWA Service Worker precache và hàng đợi IndexedDB offline.

### Plan 5 - Đổi tên bảng staff_accounts thành accounts & Dọn dẹp CSDL
- Đổi tên MongoDB collection `staff_accounts` -> `accounts` trong CSDL `internal_express`, cập nhật schema `StaffAccount`.
- Dọn dẹp collection mồ côi `attendance_logs` và collection tàn dư `staffs` (v1) trong `internal_express`. Chuẩn hóa snake_case cho các bảng marketing trong `laundry_express`.

### Plan 4 - Đổi Hệ Thống Màu Chủ Đạo Web Nội Bộ (Light Blue, Emerald, Dark/Light Mode)
- Tái cấu trúc toàn diện design tokens CSS, tailwind config, ThemeProvider (Light/Dark mode toggle với localStorage).
- Chuyển đổi 100% 14 màn hình của `fe-react-thanhxuan-internal` sang bộ ba màu: Slate-950, Sky `#38bdf8`, Emerald `#34d399` (Dark mode) và White, Sky `#0284c7`, Emerald `#059669` (Light mode).

### Plan 3 / Phase 7 - Mảng Chuyển nhà (fe-nextjs-chuyennhatietkiem)
- Triển khai ứng dụng web Next.js 15+ App Router độc lập `fe-nextjs-chuyennhatietkiem` (cổng 3002).
- Wizard khảo sát & tính giá 4 bước trực quan `QuoteWizardForm`, tích hợp API Backend `/api/v1/moving/quotes/estimate` và đặt lịch khảo sát vào database `moving_express`.
- Xây dựng các trang công khai chuẩn SEO: Trang chủ, Bảng giá, Đặt lịch, Dịch vụ, Tin tức, Liên hệ.

### Plan 3 / Phase 6 - Frontend fe-react-thanhxuan-internal (PWA)
- Cấu hình Progressive Web App (PWA) với `vite-plugin-pwa`, `manifest.webmanifest`, Service Worker precache tài nguyên tĩnh (`workbox`).
- Xây dựng hàng đợi ngoại tuyến IndexedDB (`idb`) tự động đồng bộ khi có kết nối trở lại với tiêu chí Idempotency.
- Phân hệ xác thực nội bộ (Task 6a), Giao diện Nhà hàng & Kho (Task 6b), Giao diện Tài xế Giao nhận & Offline (Task 6c), Giao diện Công nhân & Quản trị xưởng (Task 6d), Tối ưu hóa đóng gói Vendor Chunks (Task 6e).

### Plan 3 / Phase 5 - Báo cáo & Xuất file Streaming
- 6 báo cáo MongoDB Aggregation: `warehouse-summary`, `partner-reconciliation`, `attendance-summary`, `shipper-deliveries`, `variance-incidents`, `fuel-summary`.
- Xuất file Excel XLSX streaming bằng `exceljs` và PDF bằng `pdfmake`, hàng đợi `ExportQueueService` concurrency = 1 chống tràn RAM VPS.

### Plan 3 / Phase 4 - Chấm công, Sản lượng, Xăng xe & Tính lương
- Chấm công vào/ra ca (`attendance_records`) với ảnh chụp selfie camera, cron 00:30 quét ca quá 16h sang `NEEDS_REVIEW`.
- Ghi nhận sản lượng khoán (`piecework_logs`) snapshot đơn giá tại thời điểm làm việc.
- Hoàn tiền xăng xe tài xế (`fuel_logs`). Hệ thống tính lương chu kỳ (`pay_settings`, `payroll_periods`, `payslips`), bảo mật phiếu lương cá nhân.

### Plan 3 / Phase 3 - Nghiệp vụ Giao nhận Kép
- Mở rộng `Partner` với `scheduleAnchorDate`, `defaultShipperId`. Tái cấu trúc Schema `HandoverRecord` v2 hỗ trợ `version` (Optimistic Locking).
- Triển khai `HandoverStateMachine` quản lý chuyển đổi trạng thái nghiêm ngặt, đếm đồ tại nhà hàng kèm chữ ký điện tử Canvas, đếm lại tại xưởng (`recount_tasks`).
- Tự động hóa Cron 00:05 tạo phiếu giao nhận theo lịch đối tác đảm bảo Idempotent.

### Plan 3 / Phase 2 - Tài khoản, Xác thực & Phân quyền
- Hoàn thiện `staff_accounts`, `otp_codes` (TTL), `refresh_tokens` (TTL), `approval_requests`.
- Ma trận RBAC 8 vai trò, `PayFieldFilterInterceptor` lọc trường tiền khi thiếu quyền `pay.view`.
- Xác thực OTP email, khóa tài khoản 15 phút sau 5 lần sai mật khẩu, Refresh Token Rotation TTL 7 ngày.
