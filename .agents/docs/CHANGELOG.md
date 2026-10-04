# NHẬT KÝ THAY ĐỔI HỆ THỐNG (CHANGELOG)

Tài liệu ghi nhận toàn bộ lịch sử tiến hóa, các giai đoạn nâng cấp, bugfix và triển khai tính năng của Hệ sinh thái Công ty Thanh Xuân qua từng Plan.

---

## 2026-10-05

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
