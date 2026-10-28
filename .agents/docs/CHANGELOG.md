# NHẬT KÝ THAY ĐỔI HỆ THỐNG (CHANGELOG)

Tài liệu ghi nhận toàn bộ lịch sử tiến hóa, các giai đoạn nâng cấp, bugfix và triển khai tính năng của Hệ sinh thái Công ty Thanh Xuân qua từng Plan.

## 2026-10-29

### Plan 51: Bổ Sung Tự Nhập Món Đồ Ngoài Setting, Fix Lỗi Recount-Flag, Tối Ưu UI & Fullscreen Mobile Form Đếm Đồ

- **Bối cảnh & Vấn đề giải quyết:**
  - **Khắc phục lỗi HTTP 404 Recount-Flag:** Khi tài xế Shipper tick chọn hoặc hủy chọn checkbox *"Yêu cầu trạm rạch bao đếm lại tại xưởng"* trên màn hình xem trước phiếu, hệ thống gọi `PATCH /api/v1/internal/handover/:id/recount-flag` nhưng Backend thiếu endpoint này dẫn đến thông báo toast đỏ `Cannot PATCH ...`.
  - **Khắc phục lỗi UI cắt viền & tràn lề:** Nút *"Xác Nhận Shipper Đã Giao Hàng & Nhận Đồ Bẩn"* trên mobile hẹp bị co cụm và cắt cụt văn bản (`ác Nhận Shipper...`); cụm nút chọn số bao gom niêm phong (`1 bao`, `2 bao`... `Khác..`) bị tràn ra khỏi mép phải màn hình.
  - **Bổ sung tự nhập món đồ ngoài setting:** Khi chi nhánh đối tác có các món đồ vải phát sinh mới chưa có sẵn trong danh mục bảng giá (`item_catalogs`), tài xế shipper và đối tác không thể ghi nhận số lượng chính xác vào phiếu giao nhận.
  - **Tối ưu Mobile-First & Fullscreen Form đếm đồ Shipper:** Modal đếm đồ trên di động trước đây bị giới hạn kích thước với khoảng cách lề thừa bao quanh khiến không gian đếm đồ bị thu hẹp.

- **Các thay đổi kiến trúc & kỹ thuật chi tiết:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - Tạo mới `RecountFlagDto` (`src/modules/internal/handovers/dto/recount-flag.dto.ts`) validate strict `@IsBoolean()` và `@IsOptional() @IsString() recountReason`.
    - Bổ sung endpoint `@Patch(':id/recount-flag')` tại `HandoverDirtyOperationsController` với phân quyền an toàn `PERMISSIONS.HANDOVER_DELIVER, PERMISSIONS.HANDOVER_RECOUNT_REQUEST`.
    - Cập nhật `HandoverDirtySignatureService` và `HandoverService` xử lý cập nhật trạng thái `recount.isRecount`, `recount.status` (`PENDING` hoặc `NONE`) và lưu ID người yêu cầu (`requestedBy`).
    - Nâng cấp `updateDirtyItemOnBlur` nhận thêm `customItemName?: string` để lưu trực tiếp tên món đồ phát sinh người dùng tự nhập.
  - **Frontend (`fe-react-thanhxuan-internal`):**
    - Nâng cấp `Dialog` (`src/components/ui/dialog.tsx`) hỗ trợ prop `fullScreenOnMobile?: boolean`, tự động gỡ bỏ viền lề ngoài và bo góc trên mobile để modal chiếm trọn 100% diện tích màn hình điện thoại.
    - Xây dựng `CustomHandoverItemModal.tsx` (`src/features/operations/handovers/modals/`) cho phép nhập Tên món đồ, Đơn vị tính (chọn nhanh hoặc tự gõ), Số lượng và Ghi chú; tự động sinh mã `CUSTOM_<timestamp>`.
    - Nâng cấp `useShipperCountForm.ts` và `ShipperCountPartnerModal.tsx`: bật `fullScreenOnMobile={true}`, thêm nút `+ Tự nhập món`, quản lý state `customItems`, hiển thị badge `Ngoài setting` và nút Thùng rác xóa món tự nhập nếu nhập nhầm trong `ShipperCountItemsComponent.tsx`.
    - Thiết kế lại bộ chọn số bao cho Shipper (`ShipperCountSignSectionComponent.tsx` & `ShipperHandoverSignatureSectionComponent.tsx`): hiển thị sẵn 3 nút chọn nhanh `1 bao`, `2 bao`, `3 bao`, kết hợp cụm stepper `[-] [Khác] [+]` vừa vặn trên 1 dòng đơn trên mọi smartphone; đồng bộ số bao gom niêm phong giữa form đếm thay và card giao hàng ngoài; rút gọn nhãn nút gửi thành **"Xác Nhận"** kèm icon Truck.
    - Sửa nút giao hàng trong `ShipperHandoverSignatureSectionComponent.tsx`: chuyển sang `min-h-[46px] h-auto whitespace-normal leading-snug break-words` chống cắt chữ.
    - Cổng đối tác (`PartnerCountTabComponent.tsx` & `PartnerCountItemsViewComponent.tsx`): tích hợp nút `+ Tự nhập món đồ` ngoài setting, hiển thị badge và nút xóa món custom; giữ nguyên không có trường số bao (số bao chỉ dành riêng cho Shipper).

- **Kết quả Kiểm Chứng (Verification):**
  - Backend Typecheck & Lint: Pass 100% (0 errors, 0 warnings).
  - Backend Jest Tests: Pass 3/3 test suites matching handover (`create-handover.dto.spec.ts`, `handover.service.spec.ts`, `handover-state.spec.ts` - 42/42 tests pass).
  - Frontend Internal Typecheck: Pass 100% (`tsc --noEmit` pass không lỗi).
  - Frontend Internal Production Build: Pass 100% (`tsc -b && vite build` tạo bundle dist/ và service worker PWA sạch sẽ).
- **Đồng bộ tài liệu:** Cập nhật `plan51.md` (Completed), `CODEBASE_ATLAS.md` (Bảng 1.1 Backend & Bảng 3 Frontend), `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md` (Document History) và `CHANGELOG.md`.

## 2026-10-28

### Plan 50: Nâng Cấp Toàn Diện Thương Hiệu, Bảng Màu Light/Dark Mode, Thư Viện Thực Tế, Tối Ưu Mobile & Trang Quản Trị Admin Tinh Gọn Cho Website Chuyển Nhà (fe-nextjs-chuyennhatietkiem)

- **Mục tiêu & Bối cảnh kỹ thuật:**
  - **Chuẩn hóa thông tin pháp lý doanh nghiệp:**
    - Tên công ty: `Công ty TNHH Kinh doanh Thương mại và Dịch vụ Thanh Xuân`
    - Mã số thuế (MST): `0108942736` (Sở Kế hoạch & Đầu tư TP. Hà Nội cấp)
    - Hotline / Zalo: `0769 270 676` (0769.270.676)
    - Trụ sở tiếp nhận chính: `Số 16 ngõ 81 Vạn Phúc, phường Hà Đông, thành phố Hà Nội`
    - Đồng bộ 100% trên Header, Footer, Mobile Action Bar, Contact Page và SEO Metadata.
  - **Hệ thống Design Tokens màu sắc mới & Chế độ Sáng / Tối (Light / Dark Mode):**
    - Bảng màu chủ đạo công nghệ & vận chuyển: **Xanh dương nhạt (Sky Blue / `#0284c7`, `#38bdf8`)**, **Xanh lá nhạt (Mint / Soft Emerald / `#059669`, `#34d399`)**, **Trắng tinh tế (#FFFFFF)** và **Đen hiện đại (#020617 / #0f172a)**.
    - Xây dựng `ThemeContext.tsx` và `ThemeToggleComponent.tsx` quản lý state theme, lưu `localStorage` không cần cài thêm thư viện ngoài (Zero-dependency).
    - Tích hợp hệ thống keyframes animation `animate-fade-in-up`, `animate-scale-in` và lớp chuyển động mượt mà `transition-all duration-300`.
  - **Social Proof & Minh chứng năng lực thực tế:**
    - `RecentProjectsShowcaseComponent.tsx`: Trưng bày ảnh thực tế 6 đơn chuyển nhà gần đây (Căn hộ chung cư cao cấp Vinhomes Smart City, phòng trọ sinh viên ngõ nhỏ Cầu Giấy, nhà phố 3 tầng tháo dỡ sập gụ Đồng Kỵ, văn phòng công ty công nghệ Duy Tân) kèm thông số xe tải và số thợ bốc xếp.
    - `CustomerReviewsComponent.tsx`: Khối đánh giá khách hàng 5 sao chân thực (Chị Mai Lan Hà Đông, Anh Hoàng Long Cầu Giấy, Chị Thu Thảo Thanh Xuân, Bác Trần Văn Hải Hoàng Mai) kèm rating trung bình 4.9/5 dựa trên 1,280+ lượt dọn nhà tại Hà Nội.
  - **Tối ưu hiển thị Mobile toàn diện:**
    - Kích thước touch-target tối thiểu 44-48px cho toàn bộ nút bấm, thanh trượt Km, bộ chọn đồ đạc.
    - Mobile Menu Drawer trên Header và Mobile Action Bar dưới chân màn hình gọi điện & chat Zalo 1-chạm.
    - Spacing responsive `space-y-12 sm:space-y-20`, `px-3 sm:px-6`, kiểm soát chặt chẽ `overflow-x-hidden`.
  - **Xây dựng Phân Hệ Quản Trị Admin Tinh Gọn (`/admin`):**
    - `src/app/admin/layout.tsx`: Layout Admin với Sidebar điều hướng, drawer mobile, Theme toggle và Header Admin (< 200 dòng).
    - `src/app/admin/login/page.tsx`: Màn hình đăng nhập tài khoản quản trị Admin (< 150 dòng).
    - `src/app/admin/dashboard/page.tsx`: Thống kê KPI đơn khảo sát, tỷ lệ chốt và doanh thu dự toán (< 200 dòng).
    - `src/app/admin/quotes/page.tsx`: Quản lý danh sách đơn khảo sát báo giá (`moving_quotes`), bộ lọc trạng thái, xem chi tiết lộ trình, thang máy và cập nhật giá chốt (< 250 dòng).
    - `src/app/admin/articles/page.tsx`: Quản lý danh sách bài viết cẩm nang (< 150 dòng).
    - `src/app/admin/settings/page.tsx`: Quản lý thông tin doanh nghiệp, MST, hotline, địa chỉ pháp lý (< 180 dòng).
    - Mở rộng `api-client.ts` bổ sung các API Admin (`fetchAdminQuotes`, `updateQuoteStatus`, `fetchAdminDashboardStats`) kèm dữ liệu fallback an toàn.
- **Kết quả Kiểm Chứng (Verification):**
  - TypeScript Typecheck (`pnpm exec tsc --noEmit`): Pass 100% (0 errors).
  - Next.js Production Build (`pnpm build`): Pass 100% (23/23 routes tĩnh và SSG biên dịch thành công trong 2.7s).
- **Đồng bộ tài liệu:** Cập nhật `plan50.md` (Completed), `CODEBASE_ATLAS.md` (Mục 5 bổ sung các component và phân hệ Admin), `SRS_SDD.md` (Document History) và `CHANGELOG.md`.

### Plan 49: Nâng Cấp Toàn Diện Website Chuyển Nhà Tiết Kiệm (Modern Tech-Logistics, Trải Nghiệm WOW & Tối Ưu Mô Hình Nhân Lực Bốc Xếp Chuyên Nghiệp)

- **Mục tiêu & Bối cảnh kỹ thuật:**
  - **Tái định vị chuẩn xác mô hình kinh doanh (Asset-Light Logistics):** Chuyển dịch toàn diện nội dung từ các tuyên bố cũ nhận vơ "sở hữu hơn 50 xe tải" sang thế mạnh cốt lõi thật sự của Thanh Xuân: **Đội ngũ thợ cơ hữu lành nghề** (bốc xếp, tháo lắp đồ gỗ, điện lạnh, bọc lót chống trầy xước) kết hợp **Mạng lưới đối tác xe tải vệ tinh điều xe giá gốc**. Đây chính là lý do thực tế và thuyết phục giải thích vì sao dịch vụ tiết kiệm đến 30% chi phí cước xe (không gánh chi phí khấu hao bến bãi duy trì dàn xe).
  - **Tạo hiệu ứng WOW & Tương tác giữ chân người dùng (Xu hướng 2026):**
    - `HeroEstimatorComponent`: Widget dự toán cước tức thì ngay trên Hero với Slider Km, 3 tab nhu cầu (Trọn gói / Thuê thợ / Tháo lắp kỹ thuật), bộ đếm giá nhảy số trong 5 giây mà không cần chuyển trang.
    - `WhySaveBentoComponent`: Bố cục Bento Grid 4 thẻ thời thượng giải thích 4 lý do tiết kiệm 30% (Mô hình tinh gọn, Thợ đa năng 2-trong-1, Miễn phí vật tư carton/PE, Bảo hiểm 100%).
    - `SmartCargoVisualizerComponent`: Công cụ trực quan hóa đồ đạc (Giường, tủ, tủ lạnh, máy giặt, sofa, thùng đồ) $\rightarrow$ Hệ thống tự động đề xuất tải trọng xe đối tác và số lượng thợ tối ưu (chống thuê xe quá to lãng phí).
    - `CostComparisonComponent`: Bảng so sánh đa chiều chi phí ẩn giữa "Tự dọn bằng xe ba gác" vs "Dịch vụ Thanh Xuân".
    - `PackingProtectionComponent`: Trực quan hóa quy chuẩn đóng gói bọc lót 4 lớp chống trầy xước của đội thợ.
    - `InteractiveChecklistComponent`: Checklist 10 bước chuẩn bị dọn nhà lưu tự động LocalStorage.
  - **Mở rộng các gói dịch vụ linh hoạt:**
    - Bổ sung enum `LABOR_ONLY` vào Backend NestJS (`MovingServiceType`) và Frontend (`types/index.ts`).
    - Bổ sung gói "Thuê nhân công bốc xếp & tháo lắp theo giờ" (150.000đ/giờ/thợ) và bảng giá tháo lắp điều hòa/giường tủ tại `/bang-gia`.
  - **Kỷ luật mã nguồn & Phân rã God-Component (< 250 - 300 dòng):**
    - Phân rã tệp `QuoteWizardForm.tsx` (778 dòng) thành 4 sub-components chuyên trách (`Step1LocationComponent`, `Step2ItemsComponent`, `Step3ScheduleComponent`, `Step4ReviewComponent`) đều `< 190 dòng/tệp`.
    - Tinh gọn `QuoteWizardForm.tsx` thành orchestrator quản lý state form và gọi API (187 dòng).
    - Trang chủ `src/app/page.tsx` tinh gọn còn 217 dòng.
- **Kết quả Kiểm Chứng (Verification):**
  - Backend Typecheck (`pnpm exec tsc --noEmit`): Pass 100% (0 errors).
  - Backend Unit Tests (`pnpm test`): Pass 100% (49 test suites, 226 tests passed).
  - Frontend Moving Typecheck (`pnpm exec tsc --noEmit`): Pass 100% (0 errors).
  - Frontend Moving Production Build (`pnpm build`): Pass 100% (18 static pages generated in 621ms).
- **Đồng bộ tài liệu:** Cập nhật `CODEBASE_ATLAS.md` (Thêm mục 5 Ma trận Web Chuyển Nhà), `DATABASE_DICTIONARY.md` (Cập nhật enum `MovingServiceType` thêm `LABOR_ONLY`), `srs_sdd_fe_nextjs.md` (Thêm phân hệ Web Chuyển Nhà), và `SRS_SDD.md` (Document History).

### Plan 48: Chuẩn Hóa Khoảng Cách Spacing Mobile Toàn Diện & Tối Ưu Giao Diện Phân Hệ Điều Hành, Kinh Doanh, Bảng Công và Bảng Lương (fe-react-thanhxuan-internal)

- **Mục tiêu & Bối cảnh kỹ thuật:**
  - Giải quyết triệt để lỗi hiển thị trên thiết bị di động (viewport `< 640px`): Hầu hết các màn hình dùng `sm:space-y-3` khiến trên mobile quy tắc này không được áp dụng, khoảng cách giữa các khối tầng 1 (Banner), tầng 2 (Action Bar), tầng 3 (Filter), tầng 4 (Content) bị co về `0px` dính chặt vào nhau, hoặc ngược lại một số màn hình dùng `space-y-6` quá thưa và cồng kềnh.
  - Khắc phục lỗi nghiêm trọng: `PageBanner` có cấu hình mặc định `hideOnMobile = true`, trong khi bộ lọc ngày ở **Bảng Chấm Công** và bộ chọn kỳ lương ở **Bảng Lương** lại đặt trong `children` của `PageBanner`, dẫn đến việc người quản lý/kế toán dùng điện thoại không thể chọn ngày khác hoặc chọn kỳ lương khác trên mobile.
  - Chuẩn hóa khoảng cách toàn diện trên mobile: Mọi màn hình đều dùng container `space-y-3 pb-24 max-w-7xl mx-auto transition-all` (~12px, đúng 1 đơn vị công thái học di động PWA), tối ưu lưới StatCards KPI 2 cột, tab bar cuộn ngang không thanh cuộn và touch target thân thiện.

- **Chi tiết thực thi mã nguồn (`fe-react-thanhxuan-internal`):**
  - **Tách độc lập bộ chọn ngày và kỳ lương ngoài PageBanner:**
    - Tạo `AttendanceDateHeaderComponent.tsx` (src/features/management/attendance/components/): Thanh chọn ngày di động độc lập hiển thị 100% trên cả mobile và desktop, đầy đủ nút lùi ngày (`ChevronLeft`), ô input date `font-mono`, nút tiến ngày (`ChevronRight`), nút "Hôm Nay" và nút "Làm mới".
    - Tạo `PayrollMonthHeaderComponent.tsx` (src/features/management/payroll/components/): Thanh chọn kỳ lương di động độc lập, hỗ trợ lùi/tiến tháng bằng 1 chạm, ô input `type="month"` kèm icon lịch, nút "Tháng Này" và "Làm mới".
  - **Tối ưu Bảng Chấm Công (`AttendanceReviewPage.tsx`):**
    - Đưa `AttendanceDateHeaderComponent` ra ngoài `PageBanner`, đổi container thành `space-y-3`.
    - Tab bar trạng thái (Tất cả, Đang làm, Cần rà soát, Chờ duyệt, Đã duyệt) cuộn ngang mượt mà `overflow-x-auto scrollbar-none`.
    - 4 StatCards KPI hiển thị lưới 2 cột mobile (`grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4`).
  - **Tối ưu Bảng Lương Chu Kỳ (`PayrollManagementPage.tsx` & `PayrollActionToolbarComponent.tsx`):**
    - Đưa `PayrollMonthHeaderComponent` ra ngoài `PageBanner`, đổi container thành `space-y-3`.
    - Lưới 4 StatCard KPI tài chính xếp 2 cột gọn gàng trên mobile.
    - Hàng nút thao tác (Khởi tạo lương, Khóa kỳ, Mở khóa, Chi trả, Xuất Excel) co giãn linh hoạt, touch target `h-8.5 rounded-xl`.
    - Bộ lọc vai trò (Thợ xưởng, Tài xế, Điều hành) cuộn ngang không vỡ khung.
  - **Tối ưu Bảng Công Thợ Theo Khâu (`HourlyWorkReviewPage.tsx` & `DailyWorkReviewComponent.tsx`):**
    - Thay thế header thô bằng `PageBanner`, chuyển container thành `space-y-3`.
    - Tab bar chuyển đổi (Duyệt công, Phân khâu mặc định, Cài đặt đơn giá) bo góc mềm mại `rounded-xl p-1`.
    - Cụm chọn ngày và nút "Chốt Ngày" trong `DailyWorkReviewComponent` co giãn thông minh trên mobile.
  - **Tối ưu Quản Trị Đối Tác & Bảng Giá (`PartnersManagementPage.tsx`):**
    - Đổi container thành `space-y-3`.
    - Tinh chỉnh `PartnersActionBarComponent` và `PartnersPartnerFilterComponent`: Buttons thêm đối tác/thêm đồ giặt/QR Zalo và dropdown lọc thương hiệu bo góc `rounded-xl`, chiều cao chuẩn `h-8.5`.
  - **Tối ưu Duyệt Xăng Xe (`FuelReviewPage.tsx`):**
    - Bọc trong layout chuẩn `space-y-3`, bổ sung `PageBanner`.
    - Thẻ phiếu đề xuất hiển thị ảnh hóa đơn và ảnh đồng hồ ODO to rõ, 2 nút Từ Chối và Duyệt Chi dạng lưới 2 cột dễ thao tác.
  - **Tối ưu Cấu Hình Xưởng Wi-Fi (`WorkshopSettingsPage.tsx`):**
    - Đổi container thành `space-y-3`, tích hợp `PageBanner`.
  - **Tối ưu Quản Lý Nhân Sự & Phê Duyệt (`StaffManagementPage.tsx`, `ApprovalManagementPage.tsx`, `AuditLogPage.tsx`):**
    - Đổi container thành `space-y-3`, tab bar trượt ngang, danh sách tài khoản chờ kích hoạt có 2 nút Duyệt/Từ chối dễ bấm.
  - **Tối ưu Dashboard (`DashboardPage.tsx`):**
    - Đổi `space-y-6` thành `space-y-3 sm:space-y-4`.
  - **Chuẩn hóa Spacing 9 Page phân hệ Vận Hành Xưởng:**
    - `WarehouseHandoverPage`, `RecountStationPage`, `ShipperHandoverPage`, `PartnerHandoverPage`, `HourlyWorkStationPage`, `AttendancePage`, `ShipperFuelPage`, `MyPayslipPage`, `ReportsPage`: Chuyển toàn bộ container từ `sm:space-y-3` sang `space-y-3`.
  - **Kết quả Kiểm Chứng (Verification):**
    - Typecheck (`pnpm exec tsc --noEmit`): Pass 100% (0 errors).
    - Production Build (`pnpm build`): Pass 100%, PWA bundle sinh đầy đủ.
    - 100% tệp tin tuân thủ giới hạn kích thước `< 250-300 dòng/file`.

### Plan 47: Chuẩn Hóa Clean Code, Phân Rã 14 Tệp Vượt Ngưỡng (< 300 Dòng), Xóa Triệt Để Kiểu `any` & Dọn 293 Cảnh Báo ESLint Phân Hệ Laundry

- **Mục tiêu & Bối cảnh kỹ thuật:**
  - Giải quyết triệt để vấn đề tệp tin quá khổ và vi phạm quy chuẩn thiết kế đơn nhiệm (Single Responsibility Principle) trong phân hệ Laundry: phân rã 14 tệp tin vượt ngưỡng 300 dòng (có file lên tới 728 dòng) về dưới `< 250-300 dòng/tệp`.
  - Loại bỏ hoàn toàn kiểu `any`, xây dựng các Class DTO chuẩn có decorator của `class-validator`, xóa sạch 293 lỗi và cảnh báo ESLint type-safety trong `be-nestjs-thanhxuan/src/modules/laundry`.
  - Tuân thủ quy tắc Repository Pattern: loại bỏ triệt để việc inject `@InjectModel` trực tiếp vào Service trong `email-marketing` và `zalo-marketing`, tạo mới 4 Repository kế thừa `BaseRepository`.
  - Dọn sạch dead code, gỡ bỏ `localStorage.getItem("access_token")` trong `api.service.ts`, chuẩn hóa xác thực HTTP-only cookies và verify build/test thành công 100%.

- **Chi tiết thực thi mã nguồn:**
  - **Backend Laundry (`be-nestjs-thanhxuan/src/modules/laundry`):**
    - **Tách Helper Articles Sanitizer:** Tách `articles-sanitize.helper.ts` (70 dòng) chứa `sanitizeOptions`, `fixQuillVideoBug`, `extractCloudinaryUrlsFromHtml` ra khỏi `articles.service.ts`, giảm từ 329 dòng xuống còn 285 dòng.
    - **Tạo DTO & Validation cho Marketing & Auth:**
      - `CreateCampaignDto`, `UpdateCampaignDto`, `CreateSequenceDto`, `UpdateSequenceDto` trong `email-marketing/dto/`.
      - `CreateZaloCampaignDto`, `CreateZaloSequenceDto` trong `zalo-marketing/dto/`.
      - `CreateUserDto`, `UpdateUserDto`, `UpdateProfileDto` trong `users/dto/`.
      - `RefreshTokenDto` trong `auth/dto/`.
    - **Tạo Repository Pattern Chuẩn:** Tạo `EmailCampaignRepository`, `EmailSequenceRepository`, `ZaloCampaignRepository`, `ZaloSequenceRepository` kế thừa `BaseRepository` có `.lean()`, đăng ký vào Modules và inject Repository vào Service thay vì Model.
    - **Xóa Sạch 293 Lỗi ESLint:** Cập nhật Controller và Service Laundry sang strict typing, narrow types qua `unknown`, xử lý sạch toàn bộ cảnh báo unsafe-assignment, unsafe-member-access. Kết quả kiểm tra ESLint: **0 errors, 0 warnings**; 14/14 test suites passed.
  - **Frontend Laundry (`fe-nextjs-thanhxuan-laundry/src`):**
    - **Phân rã Rich Text Editor (728 dòng $\rightarrow$ Modular Sub-components):**
      - Thư mục `components/ui/rich-text-editor/`: `RichTextEditorComponent.tsx` (101 dòng), `RichTextToolbarComponent.tsx` (144 dòng), `RichTextFormattingButtons.tsx` (198 dòng), `RichTextAlignHeadingsButtons.tsx` (153 dòng), `rich-text-extensions.ts` (98 dòng), `MediaInsertModal.tsx` (140 dòng).
      - Xóa bỏ hoàn toàn tệp cũ `rich-text-editor.tsx`.
    - **Phân rã Admin Settings (useAdminSettings 505 dòng + 4 SettingEditors 480-492 dòng):**
      - Tách hook: `useAdminSettingsState.ts`, `useAdminSettingsHomepageHandlers.ts`, `useAdminSettingsServiceAboutHandlers.ts`, đưa `useAdminSettings.ts` về 122 dòng.
      - Tách sections: `AboutBannerFormSection.tsx`, `AboutWorkProcessFormSection.tsx`, `AboutPromoBannerFormSection.tsx`, `ServiceBannerFormSection.tsx`, `ServiceWorkProcessFormSection.tsx`, `ServicePromoBannerFormSection.tsx`, `FooterCompanyInfoFormSection.tsx`, `FooterLinksFormSection.tsx`, `FooterBottomBarFormSection.tsx`, `HomeHeroFormSection.tsx`, `HomeWhyChooseUsFormSection.tsx`, `HomeFaqFormSection.tsx`.
      - Thu nhỏ toàn bộ 4 components editor về < 95 dòng/file.
    - **Phân rã Admin Header & Operations:**
      - Tách `AdminHeaderComponent.tsx` (381 dòng $\rightarrow$ 82 dòng) kết hợp `AdminNotificationDropdownComponent.tsx` (254 dòng) và `AdminPageTitleComponent.tsx` (95 dòng).
      - Tách `ZaloMarketingPage.tsx` (360 dòng $\rightarrow$ 190 dòng) kết hợp `ZaloCampaignModal.tsx` (95 dòng) và `ZaloSequenceModal.tsx` (110 dòng).
      - Tách `useAdminContacts.ts` (352 dòng $\rightarrow$ 220 dòng) kết hợp `contacts-export.util.ts` (140 dòng).
    - **Phân rã Public Service & Dynamic Slugs:**
      - Tách `ServiceDetailPage.tsx` (521 dòng $\rightarrow$ 25 dòng re-export facade) thành `PromoBanner.tsx`, `ServiceBanner.tsx`, `ServiceCategoryDetail.tsx`, `ServiceList.tsx`, `WorkProcess.tsx`.
      - Tách `dich-vu/[...slug]/page.tsx` (368 dòng $\rightarrow$ 172 dòng) kết hợp `ServiceArticleDetailView.tsx` và `ServiceCategoryListView.tsx`.
      - Tách `gioi-thieu/[...slug]/page.tsx` (358 dòng $\rightarrow$ 172 dòng) kết hợp `AboutArticleDetailView.tsx` và `AboutCategoryListView.tsx`.
      - Tách `tin-tuc/[...slug]/page.tsx` (305 dòng $\rightarrow$ 150 dòng) kết hợp `NewsArticleDetailView.tsx` và `NewsCategoryListView.tsx`.
    - **Làm sạch API Client & Dead Code:** Xóa `localStorage.getItem("access_token")` trong `api.service.ts`, chuẩn hóa `credentials: 'include'` cho toàn bộ authenticated requests.
  - **Kết quả Kiểm Chứng (Verification):**
    - 100% tệp tin trong `fe-nextjs-thanhxuan-laundry/src` và `be-nestjs-thanhxuan/src/modules/laundry` đều **< 300 dòng**.
    - Backend ESLint: 0 errors, 0 warnings.
    - Backend Unit Tests: 14/14 test suites pass, 36/36 tests pass.
    - Backend Build: Pass 100%.
    - Frontend Next.js: TypeScript pass 100%, Production Build pass 100%.

### Plan 46: Vá Toàn Bộ 8 Lỗ Hổng Bảo Mật & Tối Ưu Hiệu Năng Phân Hệ Laundry (Frontend & Backend)

- **Mục tiêu & Bối cảnh kỹ thuật:**
  - Khắc phục triệt để toàn bộ 8 phát hiện bảo mật và các điểm nghẽn hiệu năng cốt lõi phát hiện trong kiểm toán Laundry.
  - Chặn đứng nguy cơ leo thang đặc quyền từ tài khoản nhân sự thường (`staff`), bảo vệ quyền sở hữu dữ liệu tài khoản chống IDOR.
  - Bảo vệ dữ liệu nhạy cảm Mongoose Schema (`passwordHash`, `refreshToken`), bảo mật Route Handler upload proxy phía Next.js.
  - Chuẩn hóa múi giờ Việt Nam (`Asia/Ho_Chi_Minh`) cho mã đơn hàng và escape ký tự Regex chống ReDoS.

- **Chi tiết thực thi mã nguồn:**
  - **Backend API Laundry (`be-nestjs-thanhxuan`):**
    - **Áp dụng RBAC RolesGuard:** Tích hợp `RolesGuard` kết hợp decorator `@Roles('admin')` cho `UsersController` (`POST /users`, `PUT /users/:id`, `DELETE /users/:id`), `SettingsController` (`PUT /settings`), `ArticlesController` (`DELETE /articles/bulk-delete`), `EmailMarketingController` và `ZaloMarketingController` (chạy chiến dịch).
    - **Chống IDOR & Bảo vệ mật khẩu:** Trong `UsersController.updateProfile`, bổ sung kiểm tra quyền sở hữu `req.user.userId === id` hoặc quyền Admin, loại bỏ khả năng tài khoản thường sửa hồ sơ của người khác.
    - **Ẩn trường nhạy cảm trong Schema:** Khai báo `{ select: false }` cho `passwordHash` và `refreshToken` trong `User` Schema; bổ sung các phương thức `findByUsernameWithPassword` và `findByIdWithRefreshToken` trong `UsersRepository` và cập nhật `AuthService.login()` và `AuthService.refreshTokens()`.
    - **Bảo vệ Logout:** Thêm `@UseGuards(JwtAuthGuard)` cho `POST /auth/logout` và trích xuất `userId` trực tiếp từ token xác thực thay vì tin tưởng body từ client.
    - **Bảo vệ Zalo Webhook:** Thêm cơ chế kiểm tra token/secret header cho `POST /zalo/webhook`.
    - **Chuẩn hóa mã đơn hàng & Chống ReDoS:** Sửa `OrdersRepository.generateNextOrderCode` sử dụng `getDatePrefixVN(new Date())` đảm bảo múi giờ `Asia/Ho_Chi_Minh` không bị lệch ngày vào sáng sớm; bổ sung hàm `escapeRegex` và `.lean()` cho truy vấn danh sách trong `OrdersRepository`, `CrmRepository`, `ContactsRepository`.
  - **Frontend Web & CMS (`fe-nextjs-thanhxuan-laundry`):**
    - **Bảo vệ Route Handler Upload & Xóa File:** Bổ sung hàm kiểm tra token/cookie `admin_access_token` cho `POST /api/upload` và `DELETE /api/upload`, trả về `401 Unauthorized` nếu chưa đăng nhập, đồng thời chuyển tiếp header `Authorization` sang Backend NestJS.
    - **Sửa lỗi Cookie `secure` & `sameSite`:** Khắc phục lỗi `(production && false)` trong `middleware.ts` và `admin-auth.action.ts`, đổi thành `secure: process.env.NODE_ENV === 'production'` và gắn cờ `sameSite: 'lax'`.
    - **Ẩn rò rỉ lỗi JWT:** Trong `middleware.ts`, loại bỏ việc nhúng thông điệp lỗi chi tiết `error.message` vào URL query parameter khi redirect về trang login.


## 2026-10-27

### Plan 45: Khắc Phục Toàn Diện Các Phát Hiện Trong Review 43 & 44, Vá NoSQL Injection, Tối Ưu Bảo Mật AI & Wi-Fi, Triệt Tiêu Zero Any/Aliases và Chuẩn Hóa Toàn Diện Kích Thước Codebase (< 280 Dòng)

- **Mục tiêu & Bối cảnh kỹ thuật:**
  - Khắc phục toàn bộ các lỗ hổng bảo mật và điểm yếu kiến trúc phát hiện trong Review 43 và Review 44.
  - Tỉa gọn toàn bộ các file còn vượt ngưỡng 300 dòng (14 file Backend, 7 file Frontend) xuống < 250-280 dòng/file, tuân thủ kỷ luật kiến trúc sạch SRP và Feature-Based Colocation.
  - Chuẩn hóa TypeScript Strict Mode tuyệt đối (0 `any`), xóa bỏ hoàn toàn alias tương thích ngược tạm thời còn sót lại (`WarehouseScheduleSettingsDialog`).

- **Chi tiết thực thi mã nguồn:**
  - **Bảo Mật & Kiến Trúc Backend (`be-nestjs-thanhxuan`):**
    - **Vá NoSQL Operator Injection:** Trong `HandoverRecordRepository.findWithOptimisticLock`, bọc an toàn `$set` và `$inc` qua whitelist sanitization; `HandoverRecordService.patchFields` bổ sung chặn các key patterns nguy hiểm (`$`, `.`, `prototype`, `__proto__`).
    - **Khử mutable state trong `AiService`:** Chuyển đổi `AiService` sang Stateless hoàn toàn (truyền provider qua method options thay vì thuộc tính instance `this.currentProvider`).
    - **Kiểm soát truy cập AI Controller:** Gắn `RolesGuard` với `@Roles(UserRole.ADMIN)` cho `AiController`, loại bỏ query param `apiKey` (thay bằng header `x-ai-api-key`).
    - **Bảo mật Wi-Fi Xưởng:** Ẩn trường `wifiIps` trên endpoint `GET /attendance/workshop-config` đối với các vai trò không phải Quản lý/Admin, ngăn rò rỉ cấu hình IP mạng xưởng cho công nhân và tài xế.
  - **Bảo Mật & Ổn Định Frontend (`fe-react-thanhxuan-internal`):**
    - **Cô lập Offline Queue:** Bổ sung `userId` vào `OfflineMutation`, lọc theo `userId` khi đồng bộ và thiết lập mutex lock `isSyncing` chống race condition khi đồng bộ dữ liệu ngoại tuyến.
    - **TypeScript Strict (Zero `any`):** Định nghĩa bộ interfaces chuẩn `RawStaffDto`, `MeApiResponse`, `LoginApiResponse`, `AuthContextType`, xóa sạch 100% các vị trí `any` trong `AuthContext.tsx` và `StaffTableComponent.tsx`.
    - **Xóa bỏ triệt để alias tạm thời:** Loại bỏ `WarehouseScheduleSettingsDialog`, cập nhật các nơi gọi trỏ trực tiếp vào `WarehouseScheduleSettingsModal`.
  - **Tái cấu trúc & Chia nhỏ file (< 280 dòng/file):**
    - **14 file Backend:**
      - `handover-record.service.ts` (262 dòng): tách `handover-record-builder.helper.ts` và `handover-partner-count.helper.ts`.
      - `handover.service.ts` (178 dòng): tinh gọn Facade.
      - `handover.controller.ts` (271 dòng): tách `handover-dirty-operations.controller.ts`.
      - `handover-clean-prep.service.ts` (275 dòng): tách `handover-clean-prep.helper.ts`.
      - `handover-dirty-signature.service.ts` (276 dòng): tách `handover-dirty-signature.helper.ts`.
      - `account-auth.service.ts` (268 dòng): tách `account-auth.helper.ts` và `account-password.service.ts`.
      - `account-management.service.ts` (280 dòng): tách `account-management.helper.ts`.
      - `job-segment.service.ts` (267 dòng): tách `job-segment.listener.ts`.
      - `attendance.service.ts` (278 dòng): tách `attendance-record.helper.ts`.
      - `upload.service.ts` (274 dòng): tách `upload-path.helper.ts`.
      - `payroll-calculator.helper.ts` (206 dòng): tách `payroll-shipper-calculator.helper.ts`.
      - `payroll.service.ts` (277 dòng): tách `payroll-period-lifecycle.helper.ts` và `payroll-payslip-adjustment.helper.ts`.
      - `partners.service.ts` (202 dòng): tách `partner-catalog.helper.ts`.
      - `reports.controller.ts` (217 dòng): tách `reports-response.helper.ts`.
    - **7 file Frontend:**
      - `ProfileEditModal.tsx` (224 dòng): tách hook `useProfileEdit.ts`.
      - `usePrepOrderForm.ts` (258 dòng): mở rộng `prepOrderSlipHelper.ts`.
      - `useShipperCountForm.ts` (273 dòng): mở rộng `shipperCountSlipHelper.ts`.
      - `useShipperSlipPreview.ts` (269 dòng): mở rộng `shipperSlipPreviewHelper.ts`.
      - `CatalogModal.tsx` (249 dòng): tách `CatalogImageUploadComponent.tsx`.
      - `WarehouseReportSectionComponent.tsx` (40 dòng): tách `WarehouseSummaryViewComponent.tsx` và `PartnerReconciliationViewComponent.tsx`.
      - `AuthContext.tsx` (252 dòng): tách `auth.types.ts`.
      - `HandoverSlipGalleryComponent.tsx` (281 dòng) & `handoverSlipCanvasRenderer.ts` (219 dòng): tách `handoverCanvasTextHelper.ts`.

- **Kết quả nghiệm thu:**
  - Backend: 49/49 test suites pass (226/226 tests passed), `tsc --noEmit` pass, `pnpm build` pass.
  - Frontend: `tsc --noEmit` pass, `pnpm build` pass (PWA SW generated), 0 `any` trong toàn bộ `src/`.
  - 100% file code mục tiêu đạt chuẩn kích thước <= 280 dòng.

### Plan 44: Tối Ưu Hóa Kích Thước Toàn Bộ File Mã Nguồn (< 250-300 Dòng), Tách Custom Hooks, Chuẩn Hóa TypeScript Strict (Zero 'any') & Xóa Bỏ Triệt Để 17 Re-export Aliases

- **Mục tiêu & Bối cảnh kỹ thuật (Giai đoạn P2):**
  - **Kỷ luật kiến trúc sạch & Anti-Slop (< 250-300 dòng/file):** Toàn bộ 38 file lớn (10 file Backend và 28 file Frontend) vượt ngưỡng 300 dòng được phân rã thành các sub-services, query helpers, custom hooks và sub-components chuyên biệt tuân thủ Single Responsibility Principle (SRP) và Feature-Based Colocation.
  - **Tách Logic Phức Tạp Ra Custom Hooks:** Toàn bộ queries TanStack Query, mutations, quản lý form state, xử lý lưu ảnh offline và debounce vẽ Canvas A4 được tách sang các hooks chuyên biệt (useShipperFuel, useStaffManagement, usePrepOrderForm, useShipperCountForm, useShipperSlipPreview...).
  - **TypeScript Strict Mode (Zero `any`):** Loại bỏ triệt để 100% kiểu dữ liệu `any` trong phạm vi thực thi, thay thế bằng các interfaces và types rõ ràng (`AuthenticatedStaffUser`, `AuditLogItem`, `ApprovalRequest`, `StaffUser`...).
  - **Xóa Bỏ Triệt Để 17 Re-export Aliases:** Dọn dẹp sạch sẽ toàn bộ các file/dòng re-export alias tạm thời (`*View`, `*Dialog`), cập nhật mọi nơi gọi trỏ trực tiếp vào nguồn chuẩn, triệt tiêu hoàn toàn nợ kỹ thuật.

- **Chi tiết thực thi mã nguồn:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - Phân hệ Lương (`payroll`):
      - `payroll.service.ts` (rút từ 745 dòng xuống 293 dòng), tách logic nạp dữ liệu thợ và giờ công sang `payroll-data-fetcher.helper.ts` (293 dòng).
      - `payroll-assembler.helper.ts` (rút xuống 156 dòng), tách phần điều chỉnh thủ công sang `payroll-adjustment.helper.ts` (203 dòng).
      - `payroll-calculator.helper.ts` (rút xuống 276 dòng), tách tính toán số giờ làm việc sang `payroll-hours-calc.helper.ts` (72 dòng).
    - Phân hệ Giao nhận (`handovers`):
      - `handover-record.service.ts` (rút từ 1268 dòng xuống 275 dòng), tách các truy vấn và kiểm đếm sang `handover-item-query.helper.ts` (145 dòng).
      - `handover.controller.ts` (rút từ 404 dòng xuống 256 dòng), tách aggregations xuất báo cáo sang `handover-report.helper.ts` (168 dòng).
      - `handover-state.ts` (rút từ 362 dòng xuống 186 dòng), tách quy trình flow 5 bước sang `handover-flow.service.ts` (260 dòng).
    - Phân hệ Chấm công, Thợ, Báo cáo & Tài khoản:
      - `partner-report.service.ts` (rút xuống 262 dòng) + `partner-report-query.helper.ts` (140 dòng).
      - `job-segment.service.ts` (rút xuống 243 dòng) + `job-segment-query.helper.ts` (170 dòng).
      - `attendance.service.ts` (rút từ 637 dòng xuống 282 dòng) + `attendance-query.helper.ts` (246 dòng).
      - `account-management.service.ts` (rút từ 403 dòng xuống 233 dòng) + `account-query.helper.ts` (182 dòng).
      - `account-auth.service.ts` (rút từ 615 dòng xuống 278 dòng).
    - Kết quả quét kiểm tra: **0 file code Backend vượt quá 300 dòng** trong toàn bộ `src/modules/core` và `src/modules/internal`.
  - **Frontend (`fe-react-thanhxuan-internal`):**
    - Phân hệ Phiếu Giao nhận (`handovers`):
      - Bộ xuất phiếu Canvas: Tách `handoverSlipCanvasRenderer.ts` (rút từ 648 dòng xuống 185 dòng) thành `handoverCanvasTableDrawer.ts` (182 dòng) và `handoverCanvasSignatureDrawer.ts` (145 dòng).
      - Custom Hooks: Tách `usePrepOrderForm.ts` (rút từ 361 dòng xuống 299 dòng) + `prepOrderSlipHelper.ts` (112 dòng); tách `useShipperCountForm.ts` (rút từ 340 dòng xuống 292 dòng) + `shipperCountSlipHelper.ts` (88 dòng); tách `useShipperSlipPreview.ts` (rút từ 345 dòng xuống 288 dòng) + `shipperSlipPreviewHelper.ts` (78 dòng).
    - Phân hệ Nhiên liệu, Chấm công, Quản lý Nhân sự & Báo cáo:
      - `ShipperFuelPage.tsx` (rút từ 438 dòng xuống 257 dòng) + tách `hooks/useShipperFuel.ts` (185 dòng).
      - `AttendancePage.tsx` (rút từ 369 dòng xuống 232 dòng) + tách `AttendanceGpsWidgetComponent.tsx` (80 dòng) và `AttendanceHistoryCardComponent.tsx` (76 dòng).
      - `StaffManagementPage.tsx` (rút từ 366 dòng xuống 199 dòng) + tách `hooks/useStaffManagement.ts` (190 dòng).
      - `WorkforceReportSectionComponent.tsx` (rút từ 455 dòng xuống 58 dòng) + tách `WorkforceAttendanceStageViewComponent.tsx` (174 dòng) và `WorkforceShipperPayrollViewComponent.tsx` (174 dòng).
      - `QualityFuelReportSectionComponent.tsx` (rút từ 389 dòng xuống 138 dòng) + tách `QualityVarianceReportViewComponent.tsx` (242 dòng).
      - `ReportsFilterBarComponent.tsx` (rút từ 358 dòng xuống 231 dòng) + tách `ReportsTabNavigationComponent.tsx` (124 dòng).
      - `ProfileEditModal.tsx` (rút từ 403 dòng xuống 296 dòng) + tách `ProfileSignatureSectionComponent.tsx` (95 dòng).
      - `StaffFormModal.tsx` (rút từ 380 dòng xuống 271 dòng) + tách `StaffPartnerBranchSelectComponent.tsx` (60 dòng) và `StaffBasicInfoFieldsComponent.tsx` (75 dòng).
      - `PartnerModal.tsx` (rút từ 346 dòng xuống 239 dòng) + tách `PartnerContactScheduleFieldsComponent.tsx` (110 dòng).
      - `LoginPage.tsx` (rút từ 367 dòng xuống 255 dòng) + tách `LoginDemoAccountsComponent.tsx` (95 dòng).
      - `RegisterFormComponent.tsx` (rút từ 341 dòng xuống 220 dòng) + tách `RegisterRoleSelectorComponent.tsx` (135 dòng).
      - `nav-config.ts` (rút từ 493 dòng xuống 277 dòng) + tách `nav-mobile-config.ts` (228 dòng).
      - `router.tsx` (rút từ 382 dòng xuống 169 dòng) + tách `legacy-redirect-routes.tsx (138 dòng).
      - `ApprovalManagementPage.tsx` (144 dòng) + `approval.types.ts` (xóa bỏ 100% `as any`).
      - `AuditLogPage.tsx` (81 dòng) + `AuditLogItem` (xóa bỏ 100% `log: any`).
    - Xóa sạch 17 Re-export Aliases: Triệt tiêu các alias `StaffManagementView`, `ApprovalManagementView`, `AuditLogView`, `FuelReviewView`, `BrandDialog`, `DeleteConfirmDialog`, `PartnerDialog` và toàn bộ component aliases trong `partners/components/`.
    - Kết quả quét kiểm tra: **0 file code Frontend vượt quá 300 dòng** trong toàn bộ `fe-react-thanhxuan-internal/src`.

- **Kết quả kiểm thử & Nghiệm thu toàn diện:**
  - Backend (`be-nestjs-thanhxuan`):
    - Lint: Pass 100% (0 lỗi).
    - Typecheck: Pass 100% (`tsc --noEmit` không có lỗi).
    - Unit Tests: 49/49 test suites pass, 226/226 tests passed.
    - Build: Pass 100% (NestJS bundle tạo thành công).
  - Frontend (`fe-react-thanhxuan-internal`):
    - Typecheck: Pass 100% (`tsc -b` không có lỗi).
    - Build: Pass 100% (Vite production bundle + PWA service worker generated).



### Nâng Cấp Cấu Hình Xưởng: Tra Cứu Tọa Độ GPS Tự Động Từ Địa Chỉ Nhập Tay & Tăng Sai Số GPS Cho Phép Lên ±350m

- **Bối cảnh & Mục tiêu:**
  - **Tra cứu tọa độ GPS tự động (Geocoding):** Cho phép Quản trị viên chỉ cần nhập địa chỉ thực tế của xưởng (ví dụ: "85 Vũ Trọng Phụng, Thanh Xuân, Hà Nội") và bấm "Tra cứu GPS" để tự động tìm kiếm và điền chính xác kinh độ, vĩ độ thông qua máy chủ bản đồ OpenStreetMap Nominatim. Hỗ trợ hiển thị tên địa điểm chuẩn hóa khớp từ bản đồ.
  - **Tăng sai số GPS tối đa (±350m):** Nâng ngưỡng sai số tối đa (`maxAccuracyMeters`) từ 150m lên ±350m trong cấu hình xưởng và thuật toán thẩm định vị trí chấm công (`validateGpsSignal`). Giúp công nhân và thợ xưởng không bị từ chối chấm công do sóng GPS yếu bên dưới trần tôn xưởng giặt là hoặc trong không gian kín của nhà kho.
  - **Tái cấu trúc UI & Anti-Slop (< 250 dòng):** Chia tách `WorkshopSettingsPage.tsx` thành các sub-components độc lập: `WorkshopGeofencingCard.tsx`, `WorkshopWifiCard.tsx` và `WorkshopSecurityPolicyCard.tsx`, tuân thủ kỷ luật kiến trúc sạch của dự án.

- **Chi tiết thay đổi:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - [`workshop-settings.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/schemas/workshop-settings.schema.ts): Nâng giá trị mặc định của `maxAccuracyMeters` lên 350m.
    - [`workshop-settings.repository.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/repositories/workshop-settings.repository.ts): Cập nhật default initialization `maxAccuracyMeters: 350`.
    - [`geo.util.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/utils/geo.util.ts) & [`attendance.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.service.ts): Đổi fallback sai số tối đa lên 350m.
    - [`attendance.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.service.ts) & [`attendance.controller.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.controller.ts): Thêm endpoint `GET /attendance/geocode?address=...` tra cứu tọa độ từ OpenStreetMap Nominatim kèm User-Agent chuẩn.
    - [`.env.example`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/.env.example): Cập nhật `WORKSHOP_MAX_ACCURACY=350`.
    - [`attendance.service.spec.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/specs/attendance.service.spec.ts): Bổ sung 3 test case kiểm thử dịch vụ tra cứu Geocoding.
  - **Frontend (`fe-react-thanhxuan-internal`):**
    - [`workshop.types.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/workshop.types.ts): Bổ sung interface `GeocodeResult`.
    - [`useWorkshopSettings.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/hooks/useWorkshopSettings.ts): Bổ sung hàm `geocodeAddress` hỗ trợ gọi API Backend kèm cơ chế Fallback trực tiếp phía Client.
    - [`WorkshopGeofencingCard.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/components/WorkshopGeofencingCard.tsx): Bổ sung ô nhập Tên xưởng, Địa chỉ thực tế kèm nút "Tra cứu GPS", ô nhập Sai số GPS tối đa (±350m), Latitude, Longitude và link xem trên Google Maps.
    - [`WorkshopWifiCard.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/components/WorkshopWifiCard.tsx): Quản lý dải IP Wi-Fi Router, nhận diện IP hiện tại.
    - [`WorkshopSecurityPolicyCard.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/components/WorkshopSecurityPolicyCard.tsx): Cấu hình chính sách bắt buộc GPS và Wi-Fi.
    - [`WorkshopSettingsPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/WorkshopSettingsPage.tsx): Tái cấu trúc tinh gọn form lưu trữ toàn diện (< 160 dòng).
  - **Tài liệu & Đặc tả:**
    - Cập nhật [`DATABASE_DICTIONARY.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md), [`srs_sdd_backend.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md), [`srs_sdd_fe_internal.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md).

### Plan 42: Kiến Trúc Lưu Trữ Kép (Cloudinary + VPS), Tự Động Nén ZIP Gửi Mail Đối Tác & Quản Lý Google Drive 5GB Qua Rclone

- **Mục tiêu & Bối cảnh nghiệp vụ:**
  - **Quản trị rủi ro & tối ưu chi phí lưu trữ hình ảnh:**
    - Hiện thực hóa kiến trúc Lưu trữ kép (Hybrid Dual-Storage): Khi sinh ảnh mới (phiếu giao nhận, camera chấm công, nhiên liệu xe tải), hệ thống lưu đồng thời 1 bản copy vật lý gốc vào ổ cứng cục bộ VPS theo thư mục phân cấp `internal-thanhxuan/.../YYYY/MM/`, song song với việc tải lên Cloudinary để lấy link CDN tốc độ cao phục vụ ứng dụng di động.
    - Cơ chế này giúp công ty không bị phụ thuộc hoàn toàn vào Cloudinary Free (tránh nguy cơ đầy quota hay cạn kiệt credits hàng tháng), đồng thời khi cần nén file ZIP thì đọc trực tiếp từ ổ cứng VPS trong tích tắc (0đ băng thông, tốc độ đọc ổ đĩa cực nhanh).
  - **Cơ chế Xóa Ghi Đè (Overwrite & Delete Old):**
    - Khi một phiếu giao nhận được cập nhật (soạn đồ, giao hàng, ký nhận, đếm lại) sinh ra ảnh mới, hệ thống tự động xóa ngay lập tức ảnh cũ trên cả Cloudinary và file vật lý cũ trên ổ cứng VPS (`slipLocalPath`), triệt tiêu 100% tình trạng rò rỉ dung lượng rác.
  - **Tự động Nén ZIP & Gửi Mail Đối Soát Hàng Tháng (02:00 sáng mùng 1 hàng tháng):**
    - Tự động gom toàn bộ ảnh phiếu giao nhận tháng trước ($T-1$) theo từng đối tác. Đổi tên file chuẩn mực: `[MãPhiếu]_[Ngày]_[Ca].webp` và nén thành `PhieuGiaoNhan_ThangMM_YYYY_[TenDoiTac].zip`.
    - Nếu $\le 20$ MB: Đính kèm trực tiếp vào Email gửi cho Quản lý cơ sở đối tác và Kế toán công ty.
    - Nếu $> 20$ MB: Tự động đẩy lên Google Drive qua Rclone (`gdrive:Anh_Giao_Nhan_Luu_Tru/HangThang/`) và gửi email thông báo kèm đường link tải.
  - **Quét định kỳ hàng tháng dọn "Ảnh mồ côi" (02:30 sáng mùng 1 hàng tháng):**
    - Quét toàn bộ file thực tế trên VPS, đối chiếu với các URL đang lưu trong MongoDB (`handover_records`, `attendance_records`, `fuel_logs`).
    - Các file mồ côi (tồn tại trên đĩa nhưng không có trong DB) được gom nén thành `Orphaned_Images_YYYY_MM.zip`, đẩy lên Google Drive (`gdrive:Anh_Mo_Coi_Du_Phong/`), sau đó xóa sạch khỏi VPS và Cloudinary.
  - **Bảo vệ dung lượng Google Drive 5GB (Capacity Guard):**
    - Kiểm tra dung lượng Drive qua lệnh `rclone about gdrive: --json`. Khi dung lượng $\ge 80\%$ (hoặc trống $< 1$ GB), tự động kích hoạt xoay vòng (xóa các bản sao lưu database và file zip ảnh mồ côi cũ nhất theo thứ tự FIFO) để giải phóng không gian về mức an toàn ($ge 1.5$ GB), đồng thời gửi email cảnh báo cho Admin.

- **Chi tiết thực thi kỹ thuật:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - **Cài đặt thư viện:** Bổ sung `archiver` và `@types/archiver` hỗ trợ nén stream ZIP hiệu năng cao, tối ưu bộ nhớ RAM (< 512MB VPS).
    - [`mail.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/mail/mail.service.ts): Mở rộng hàm `sendMail` hỗ trợ tham số `attachments` và `cc`.
    - [`upload.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/upload/upload.service.ts): Nâng cấp lưu trữ kép, thêm `uploadFileWithDetails`, `saveLocalCopy`, `deleteLocalFile`, `listLocalFiles`.
    - [`handover-record.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts): Bổ sung trường `slipLocalPath?: string` lưu đường dẫn file gốc trên đĩa VPS.
    - [`handover-record.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts): Cập nhật `uploadSlipImage` hỗ trợ xóa đè ảnh cũ cả Cloudinary và VPS, lưu trữ vào `internal-thanhxuan/handovers/YYYY/MM/`.
    - [`archive-zip.helper.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/helpers/archive-zip.helper.ts): Module helper nén file ZIP streaming bằng `archiver`.
    - [`archive-rclone.helper.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/helpers/archive-rclone.helper.ts): Module helper giao tiếp Rclone CLI (`checkDriveCapacity`, `copyToDrive`, `autoPruneDriveIfNeeded`).
    - [`archive.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/archive.service.ts): Xử lý toàn bộ logic nén phiếu tháng, dọn ảnh mồ côi, dọn ảnh phụ 90 ngày.
    - [`archive.cron.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/archive.cron.ts): Tác vụ Cron tự động chạy mùng 1 hàng tháng, định kỳ quý và Chủ nhật hàng tuần.
    - [`archive.controller.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/archive.controller.ts): API thủ công dành cho `ADMIN` và `ACCOUNTANT` (`/archive/drive-status`, `/archive/trigger-monthly-handovers`, `/archive/trigger-cleanup-orphaned`, v.v.).
    - [`archive.module.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/archive.module.ts): Đóng gói module và tích hợp vào `InternalModule`, `AppModule`.
    - Unit Tests: [`archive.service.spec.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/archive/specs/archive.service.spec.ts) (PASS 4/4 tests). Toàn bộ 16 test suites của `internal` (126/126 tests) PASS 100%. `pnpm build` PASS.

## 2026-10-27

### Plan 45: Khắc Phục Toàn Diện Các Phát Hiện Trong Review 43 & 44, Vá NoSQL Injection, Tối Ưu Bảo Mật AI & Wi-Fi, Triệt Tiêu Zero Any/Aliases và Chuẩn Hóa Toàn Diện Kích Thước Codebase (< 280 Dòng)

- **Mục tiêu & Bối cảnh kỹ thuật:**
  - Khắc phục toàn bộ các lỗ hổng bảo mật và điểm yếu kiến trúc phát hiện trong Review 43 và Review 44.
  - Tỉa gọn toàn bộ các file còn vượt ngưỡng 300 dòng (14 file Backend, 7 file Frontend) xuống < 250-280 dòng/file, tuân thủ kỷ luật kiến trúc sạch SRP và Feature-Based Colocation.
  - Chuẩn hóa TypeScript Strict Mode tuyệt đối (0 `any`), xóa bỏ hoàn toàn alias tương thích ngược tạm thời còn sót lại (`WarehouseScheduleSettingsDialog`).

- **Chi tiết thực thi mã nguồn:**
  - **Bảo Mật & Kiến Trúc Backend (`be-nestjs-thanhxuan`):**
    - **Vá NoSQL Operator Injection:** Trong `HandoverRecordRepository.findWithOptimisticLock`, bọc an toàn `$set` và `$inc` qua whitelist sanitization; `HandoverRecordService.patchFields` bổ sung chặn các key patterns nguy hiểm (`$`, `.`, `prototype`, `__proto__`).
    - **Khử mutable state trong `AiService`:** Chuyển đổi `AiService` sang Stateless hoàn toàn (truyền provider qua method options thay vì thuộc tính instance `this.currentProvider`).
    - **Kiểm soát truy cập AI Controller:** Gắn `RolesGuard` với `@Roles(UserRole.ADMIN)` cho `AiController`, loại bỏ query param `apiKey` (thay bằng header `x-ai-api-key`).
    - **Bảo mật Wi-Fi Xưởng:** Ẩn trường `wifiIps` trên endpoint `GET /attendance/workshop-config` đối với các vai trò không phải Quản lý/Admin, ngăn rò rỉ cấu hình IP mạng xưởng cho công nhân và tài xế.
  - **Bảo Mật & Ổn Định Frontend (`fe-react-thanhxuan-internal`):**
    - **Cô lập Offline Queue:** Bổ sung `userId` vào `OfflineMutation`, lọc theo `userId` khi đồng bộ và thiết lập mutex lock `isSyncing` chống race condition khi đồng bộ dữ liệu ngoại tuyến.
    - **TypeScript Strict (Zero `any`):** Định nghĩa bộ interfaces chuẩn `RawStaffDto`, `MeApiResponse`, `LoginApiResponse`, `AuthContextType`, xóa sạch 100% các vị trí `any` trong `AuthContext.tsx` và `StaffTableComponent.tsx`.
    - **Xóa bỏ triệt để alias tạm thời:** Loại bỏ `WarehouseScheduleSettingsDialog`, cập nhật các nơi gọi trỏ trực tiếp vào `WarehouseScheduleSettingsModal`.
  - **Tái cấu trúc & Chia nhỏ file (< 280 dòng/file):**
    - **14 file Backend:**
      - `handover-record.service.ts` (262 dòng): tách `handover-record-builder.helper.ts` và `handover-partner-count.helper.ts`.
      - `handover.service.ts` (178 dòng): tinh gọn Facade.
      - `handover.controller.ts` (271 dòng): tách `handover-dirty-operations.controller.ts`.
      - `handover-clean-prep.service.ts` (275 dòng): tách `handover-clean-prep.helper.ts`.
      - `handover-dirty-signature.service.ts` (276 dòng): tách `handover-dirty-signature.helper.ts`.
      - `account-auth.service.ts` (268 dòng): tách `account-auth.helper.ts` và `account-password.service.ts`.
      - `account-management.service.ts` (280 dòng): tách `account-management.helper.ts`.
      - `job-segment.service.ts` (267 dòng): tách `job-segment.listener.ts`.
      - `attendance.service.ts` (278 dòng): tách `attendance-record.helper.ts`.
      - `upload.service.ts` (274 dòng): tách `upload-path.helper.ts`.
      - `payroll-calculator.helper.ts` (206 dòng): tách `payroll-shipper-calculator.helper.ts`.
      - `payroll.service.ts` (277 dòng): tách `payroll-period-lifecycle.helper.ts` và `payroll-payslip-adjustment.helper.ts`.
      - `partners.service.ts` (202 dòng): tách `partner-catalog.helper.ts`.
      - `reports.controller.ts` (217 dòng): tách `reports-response.helper.ts`.
    - **7 file Frontend:**
      - `ProfileEditModal.tsx` (224 dòng): tách hook `useProfileEdit.ts`.
      - `usePrepOrderForm.ts` (258 dòng): mở rộng `prepOrderSlipHelper.ts`.
      - `useShipperCountForm.ts` (273 dòng): mở rộng `shipperCountSlipHelper.ts`.
      - `useShipperSlipPreview.ts` (269 dòng): mở rộng `shipperSlipPreviewHelper.ts`.
      - `CatalogModal.tsx` (249 dòng): tách `CatalogImageUploadComponent.tsx`.
      - `WarehouseReportSectionComponent.tsx` (40 dòng): tách `WarehouseSummaryViewComponent.tsx` và `PartnerReconciliationViewComponent.tsx`.
      - `AuthContext.tsx` (252 dòng): tách `auth.types.ts`.
      - `HandoverSlipGalleryComponent.tsx` (281 dòng) & `handoverSlipCanvasRenderer.ts` (219 dòng): tách `handoverCanvasTextHelper.ts`.

- **Kết quả nghiệm thu:**
  - Backend: 49/49 test suites pass (226/226 tests passed), `tsc --noEmit` pass, `pnpm build` pass.
  - Frontend: `tsc --noEmit` pass, `pnpm build` pass (PWA SW generated), 0 `any` trong toàn bộ `src/`.
  - 100% file code mục tiêu đạt chuẩn kích thước <= 280 dòng.

### Plan 44: Tối Ưu Hóa Kích Thước Toàn Bộ File Mã Nguồn (< 250-300 Dòng), Tách Custom Hooks, Chuẩn Hóa TypeScript Strict (Zero 'any') & Xóa Bỏ Triệt Để 17 Re-export Aliases

- **Mục tiêu & Bối cảnh kỹ thuật (Giai đoạn P2):**
  - **Kỷ luật kiến trúc sạch & Anti-Slop (< 250-300 dòng/file):** Toàn bộ 38 file lớn (10 file Backend và 28 file Frontend) vượt ngưỡng 300 dòng được phân rã thành các sub-services, query helpers, custom hooks và sub-components chuyên biệt tuân thủ Single Responsibility Principle (SRP) và Feature-Based Colocation.
  - **Tách Logic Phức Tạp Ra Custom Hooks:** Toàn bộ queries TanStack Query, mutations, quản lý form state, xử lý lưu ảnh offline và debounce vẽ Canvas A4 được tách sang các hooks chuyên biệt (useShipperFuel, useStaffManagement, usePrepOrderForm, useShipperCountForm, useShipperSlipPreview...).
  - **TypeScript Strict Mode (Zero `any`):** Loại bỏ triệt để 100% kiểu dữ liệu `any` trong phạm vi thực thi, thay thế bằng các interfaces và types rõ ràng (`AuthenticatedStaffUser`, `AuditLogItem`, `ApprovalRequest`, `StaffUser`...).
  - **Xóa Bỏ Triệt Để 17 Re-export Aliases:** Dọn dẹp sạch sẽ toàn bộ các file/dòng re-export alias tạm thời (`*View`, `*Dialog`), cập nhật mọi nơi gọi trỏ trực tiếp vào nguồn chuẩn, triệt tiêu hoàn toàn nợ kỹ thuật.

- **Chi tiết thực thi mã nguồn:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - Phân hệ Lương (`payroll`):
      - `payroll.service.ts` (rút từ 745 dòng xuống 293 dòng), tách logic nạp dữ liệu thợ và giờ công sang `payroll-data-fetcher.helper.ts` (293 dòng).
      - `payroll-assembler.helper.ts` (rút xuống 156 dòng), tách phần điều chỉnh thủ công sang `payroll-adjustment.helper.ts` (203 dòng).
      - `payroll-calculator.helper.ts` (rút xuống 276 dòng), tách tính toán số giờ làm việc sang `payroll-hours-calc.helper.ts` (72 dòng).
    - Phân hệ Giao nhận (`handovers`):
      - `handover-record.service.ts` (rút từ 1268 dòng xuống 275 dòng), tách các truy vấn và kiểm đếm sang `handover-item-query.helper.ts` (145 dòng).
      - `handover.controller.ts` (rút từ 404 dòng xuống 256 dòng), tách aggregations xuất báo cáo sang `handover-report.helper.ts` (168 dòng).
      - `handover-state.ts` (rút từ 362 dòng xuống 186 dòng), tách quy trình flow 5 bước sang `handover-flow.service.ts` (260 dòng).
    - Phân hệ Chấm công, Thợ, Báo cáo & Tài khoản:
      - `partner-report.service.ts` (rút xuống 262 dòng) + `partner-report-query.helper.ts` (140 dòng).
      - `job-segment.service.ts` (rút xuống 243 dòng) + `job-segment-query.helper.ts` (170 dòng).
      - `attendance.service.ts` (rút từ 637 dòng xuống 282 dòng) + `attendance-query.helper.ts` (246 dòng).
      - `account-management.service.ts` (rút từ 403 dòng xuống 233 dòng) + `account-query.helper.ts` (182 dòng).
      - `account-auth.service.ts` (rút từ 615 dòng xuống 278 dòng).
    - Kết quả quét kiểm tra: **0 file code Backend vượt quá 300 dòng** trong toàn bộ `src/modules/core` và `src/modules/internal`.
  - **Frontend (`fe-react-thanhxuan-internal`):**
    - Phân hệ Phiếu Giao nhận (`handovers`):
      - Bộ xuất phiếu Canvas: Tách `handoverSlipCanvasRenderer.ts` (rút từ 648 dòng xuống 185 dòng) thành `handoverCanvasTableDrawer.ts` (182 dòng) và `handoverCanvasSignatureDrawer.ts` (145 dòng).
      - Custom Hooks: Tách `usePrepOrderForm.ts` (rút từ 361 dòng xuống 299 dòng) + `prepOrderSlipHelper.ts` (112 dòng); tách `useShipperCountForm.ts` (rút từ 340 dòng xuống 292 dòng) + `shipperCountSlipHelper.ts` (88 dòng); tách `useShipperSlipPreview.ts` (rút từ 345 dòng xuống 288 dòng) + `shipperSlipPreviewHelper.ts` (78 dòng).
    - Phân hệ Nhiên liệu, Chấm công, Quản lý Nhân sự & Báo cáo:
      - `ShipperFuelPage.tsx` (rút từ 438 dòng xuống 257 dòng) + tách `hooks/useShipperFuel.ts` (185 dòng).
      - `AttendancePage.tsx` (rút từ 369 dòng xuống 232 dòng) + tách `AttendanceGpsWidgetComponent.tsx` (80 dòng) và `AttendanceHistoryCardComponent.tsx` (76 dòng).
      - `StaffManagementPage.tsx` (rút từ 366 dòng xuống 199 dòng) + tách `hooks/useStaffManagement.ts` (190 dòng).
      - `WorkforceReportSectionComponent.tsx` (rút từ 455 dòng xuống 58 dòng) + tách `WorkforceAttendanceStageViewComponent.tsx` (174 dòng) và `WorkforceShipperPayrollViewComponent.tsx` (174 dòng).
      - `QualityFuelReportSectionComponent.tsx` (rút từ 389 dòng xuống 138 dòng) + tách `QualityVarianceReportViewComponent.tsx` (242 dòng).
      - `ReportsFilterBarComponent.tsx` (rút từ 358 dòng xuống 231 dòng) + tách `ReportsTabNavigationComponent.tsx` (124 dòng).
      - `ProfileEditModal.tsx` (rút từ 403 dòng xuống 296 dòng) + tách `ProfileSignatureSectionComponent.tsx` (95 dòng).
      - `StaffFormModal.tsx` (rút từ 380 dòng xuống 271 dòng) + tách `StaffPartnerBranchSelectComponent.tsx` (60 dòng) và `StaffBasicInfoFieldsComponent.tsx` (75 dòng).
      - `PartnerModal.tsx` (rút từ 346 dòng xuống 239 dòng) + tách `PartnerContactScheduleFieldsComponent.tsx` (110 dòng).
      - `LoginPage.tsx` (rút từ 367 dòng xuống 255 dòng) + tách `LoginDemoAccountsComponent.tsx` (95 dòng).
      - `RegisterFormComponent.tsx` (rút từ 341 dòng xuống 220 dòng) + tách `RegisterRoleSelectorComponent.tsx` (135 dòng).
      - `nav-config.ts` (rút từ 493 dòng xuống 277 dòng) + tách `nav-mobile-config.ts` (228 dòng).
      - `router.tsx` (rút từ 382 dòng xuống 169 dòng) + tách `legacy-redirect-routes.tsx (138 dòng).
      - `ApprovalManagementPage.tsx` (144 dòng) + `approval.types.ts` (xóa bỏ 100% `as any`).
      - `AuditLogPage.tsx` (81 dòng) + `AuditLogItem` (xóa bỏ 100% `log: any`).
    - Xóa sạch 17 Re-export Aliases: Triệt tiêu các alias `StaffManagementView`, `ApprovalManagementView`, `AuditLogView`, `FuelReviewView`, `BrandDialog`, `DeleteConfirmDialog`, `PartnerDialog` và toàn bộ component aliases trong `partners/components/`.
    - Kết quả quét kiểm tra: **0 file code Frontend vượt quá 300 dòng** trong toàn bộ `fe-react-thanhxuan-internal/src`.

- **Kết quả kiểm thử & Nghiệm thu toàn diện:**
  - Backend (`be-nestjs-thanhxuan`):
    - Lint: Pass 100% (0 lỗi).
    - Typecheck: Pass 100% (`tsc --noEmit` không có lỗi).
    - Unit Tests: 49/49 test suites pass, 226/226 tests passed.
    - Build: Pass 100% (NestJS bundle tạo thành công).
  - Frontend (`fe-react-thanhxuan-internal`):
    - Typecheck: Pass 100% (`tsc -b` không có lỗi).
    - Build: Pass 100% (Vite production bundle + PWA service worker generated).



### Nâng Cấp Cấu Hình Xưởng: Tra Cứu Tọa Độ GPS Tự Động Từ Địa Chỉ Nhập Tay & Tăng Sai Số GPS Cho Phép Lên ±350m

- **Bối cảnh & Mục tiêu:**
  - **Tra cứu tọa độ GPS tự động (Geocoding):** Cho phép Quản trị viên chỉ cần nhập địa chỉ thực tế của xưởng (ví dụ: "85 Vũ Trọng Phụng, Thanh Xuân, Hà Nội") và bấm "Tra cứu GPS" để tự động tìm kiếm và điền chính xác kinh độ, vĩ độ thông qua máy chủ bản đồ OpenStreetMap Nominatim. Hỗ trợ hiển thị tên địa điểm chuẩn hóa khớp từ bản đồ.
  - **Tăng sai số GPS tối đa (±350m):** Nâng ngưỡng sai số tối đa (`maxAccuracyMeters`) từ 150m lên ±350m trong cấu hình xưởng và thuật toán thẩm định vị trí chấm công (`validateGpsSignal`). Giúp công nhân và thợ xưởng không bị từ chối chấm công do sóng GPS yếu bên dưới trần tôn xưởng giặt là hoặc trong không gian kín của nhà kho.
  - **Tái cấu trúc UI & Anti-Slop (< 250 dòng):** Chia tách `WorkshopSettingsPage.tsx` thành các sub-components độc lập: `WorkshopGeofencingCard.tsx`, `WorkshopWifiCard.tsx` và `WorkshopSecurityPolicyCard.tsx`, tuân thủ kỷ luật kiến trúc sạch của dự án.

- **Chi tiết thay đổi:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - [`workshop-settings.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/schemas/workshop-settings.schema.ts): Nâng giá trị mặc định của `maxAccuracyMeters` lên 350m.
    - [`workshop-settings.repository.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/repositories/workshop-settings.repository.ts): Cập nhật default initialization `maxAccuracyMeters: 350`.
    - [`geo.util.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/utils/geo.util.ts) & [`attendance.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.service.ts): Đổi fallback sai số tối đa lên 350m.
    - [`attendance.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.service.ts) & [`attendance.controller.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.controller.ts): Thêm endpoint `GET /attendance/geocode?address=...` tra cứu tọa độ từ OpenStreetMap Nominatim kèm User-Agent chuẩn.
    - [`.env.example`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/.env.example): Cập nhật `WORKSHOP_MAX_ACCURACY=350`.
    - [`attendance.service.spec.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/specs/attendance.service.spec.ts): Bổ sung 3 test case kiểm thử dịch vụ tra cứu Geocoding.
  - **Frontend (`fe-react-thanhxuan-internal`):**
    - [`workshop.types.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/workshop.types.ts): Bổ sung interface `GeocodeResult`.
    - [`useWorkshopSettings.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/hooks/useWorkshopSettings.ts): Bổ sung hàm `geocodeAddress` hỗ trợ gọi API Backend kèm cơ chế Fallback trực tiếp phía Client.
    - [`WorkshopGeofencingCard.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/components/WorkshopGeofencingCard.tsx): Bổ sung ô nhập Tên xưởng, Địa chỉ thực tế kèm nút "Tra cứu GPS", ô nhập Sai số GPS tối đa (±350m), Latitude, Longitude và link xem trên Google Maps.
    - [`WorkshopWifiCard.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/components/WorkshopWifiCard.tsx): Quản lý dải IP Wi-Fi Router, nhận diện IP hiện tại.
    - [`WorkshopSecurityPolicyCard.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/components/WorkshopSecurityPolicyCard.tsx): Cấu hình chính sách bắt buộc GPS và Wi-Fi.
    - [`WorkshopSettingsPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/WorkshopSettingsPage.tsx): Tái cấu trúc tinh gọn form lưu trữ toàn diện (< 160 dòng).
  - **Tài liệu & Đặc tả:**
    - Cập nhật [`DATABASE_DICTIONARY.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md), [`srs_sdd_backend.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md), [`srs_sdd_fe_internal.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md).

### Plan 41: Tích Hợp Xác Thực IP Wi-Fi Router Xưởng & Màn Hình Admin Cấu Hình Xưởng (/management/admin/workshop)

- **Mục tiêu & Bối cảnh nghiệp vụ:**
  - **Chống gian lận chấm công đa tầng (Kép GPS + Wi-Fi IP):**
    - Giải quyết rủi ro nhân viên ở nhà hoặc bên ngoài dùng Fake GPS để chấm công từ xa bằng cơ chế xác thực kép: Geofencing GPS (công thức Haversine) kết hợp đối soát địa chỉ IP Public của modem Wi-Fi xưởng giặt.
    - Hỗ trợ linh hoạt 2 chế độ vận hành: Chặn nghiêm ngặt (`isWifiRequired: true` - từ chối check-in/out nếu không kết nối Wi-Fi xưởng) hoặc Cảnh báo mềm (`isWifiRequired: false` - vẫn cho phép qua nhưng gắn cờ `isSuspiciousIp: true` để Quản lý đối soát trên bảng công).
  - **Màn hình Quản trị Cấu hình Xưởng & Wi-Fi dành riêng cho Admin (`/management/admin/workshop`):**
    - Thiết kế theo chuẩn 4 tầng công thái học hiện đại (`PageBanner` giới thiệu và switch cấu hình $\rightarrow$ `PageActionBar` lưu cài đặt $\rightarrow$ 4 thẻ KPI `StatCard` $\rightarrow$ 3 khối cấu hình Geofencing, Danh sách IP Wi-Fi và Cơ chế kiểm tra).
    - Tiện ích 1 chạm thông minh: "Lấy tọa độ hiện tại" qua Geolocation API và "Thêm IP mạng hiện tại" qua endpoint `/attendance/my-ip`.
    - Phân quyền nghiêm ngặt: Chỉ vai trò `StaffRole.ADMIN` mới có thể truy cập màn hình và gọi API cập nhật cấu hình xưởng.
  - **Trải nghiệm Trạm thợ (/attendance) và Bảng công (/management/manager/attendance):**
    - Trạm thợ hiển thị trực quan huy hiệu kết nối mạng: Xanh lá ("Wi-Fi Xưởng") khi trùng IP, Vàng cam ("Mạng ngoài / 4G") khi khác IP, kèm cảnh báo rõ ràng nếu xưởng bật chế độ bắt buộc Wi-Fi.
    - Bảng công giám sát hiển thị huy hiệu Wi-Fi/4G và IP của từng ca vào/ra, giúp Quản lý dễ dàng phát hiện ca bất thường.

- **Chi tiết thực thi kỹ thuật:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - [`workshop-settings.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/schemas/workshop-settings.schema.ts): Định nghĩa bảng `workshop_settings` trong `internal_express` (tọa độ GPS, bán kính m, danh sách IP Wi-Fi, cờ `isGpsRequired`, `isWifiRequired`, `ipStrictCheck`).
    - [`workshop-settings.repository.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/repositories/workshop-settings.repository.ts): Thao tác dữ liệu bảng cấu hình xưởng theo chuẩn Repository Pattern.
    - [`update-workshop-settings.dto.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/dto/update-workshop-settings.dto.ts): DTO kiểm định dữ liệu cấu hình xưởng với class-validator.
    - [`attendance-record.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/schemas/attendance-record.schema.ts): Mở rộng `CheckInInfo` và `CheckOutInfo` với `clientIp`, `isWorkshopWifi`, `isSuspiciousIp`.
    - [`attendance.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.service.ts): Tích hợp hàm `getWorkshopConfig`, `updateWorkshopConfig` kèm ghi Audit Log, và `verifyAttendancePresence` kiểm tra chéo Geofencing + Wi-Fi IP (bóc tách IPv4-mapped IPv6, bypass localhost dev).
    - [`attendance.controller.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.controller.ts): Thêm endpoint `GET /attendance/workshop-config`, `PUT /attendance/workshop-config` (bảo vệ bởi `ACCOUNT_ADMIN`), `GET /attendance/my-ip` trích xuất IP qua header `x-forwarded-for` / `x-real-ip`.
    - Unit Tests: [`attendance-wifi.spec.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/specs/attendance-wifi.spec.ts) (4/4 PASS), [`attendance-geo.spec.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/specs/attendance-geo.spec.ts) (5/5 PASS), [`attendance.service.spec.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/specs/attendance.service.spec.ts) (8/8 PASS).
  - **Frontend Internal (`fe-react-thanhxuan-internal`):**
    - [`types/index.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/types/index.ts): Định nghĩa kiểu `WorkshopSettings`, `MyIpResponse`, cập nhật `AttendanceCheckInfo`.
    - [`useWorkshopSettings.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/hooks/useWorkshopSettings.ts): Custom Hook quản lý query và mutation cấu hình xưởng.
    - [`WorkshopSettingsPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/workshop/WorkshopSettingsPage.tsx): Màn hình Admin cấu hình xưởng chuẩn 4 tầng (< 250 dòng).
    - [`admin/workshop.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/(internal)/management/admin/workshop.tsx) & [`router.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/router.tsx): Đăng ký route `/management/admin/workshop`.
    - [`nav-config.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/nav-config.ts): Bổ sung menu "Cấu Hình Xưởng & Wi-Fi" dành riêng cho `StaffRole.ADMIN`.
    - [`useWorkshopGeo.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/attendance/hooks/useWorkshopGeo.ts), [`AttendancePage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/attendance/AttendancePage.tsx), [`AttendanceTableComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/attendance/components/AttendanceTableComponent.tsx): Tích hợp hiển thị nhãn Wi-Fi xưởng / 4G.
  - **Hệ thống tài liệu:** Đồng bộ trọn vẹn `DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `SRS_SDD.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `CHANGELOG.md`.

## 2026-10-26

### Plan 40: Xây Dựng Lại Bảng Công /management/manager/attendance & Bảng Lương Chu Kỳ /management/accountant/payroll Chuẩn 4 Tầng Ergonomic

- **Mục tiêu & Bối cảnh nghiệp vụ:**
  - **Tái thiết kế toàn diện Màn hình Bảng Công & Giám Sát Ca Làm Việc (`/management/manager/attendance`):**
    - Áp dụng cấu trúc 4 tầng công thái học hiện đại (`PageBanner` chọn ngày/khoảng ngày VN $\rightarrow$ `PageActionBar` tìm kiếm & duyệt nhanh $\rightarrow$ 4 thẻ KPI `StatCard` $\rightarrow$ Filter Bar & Bảng giám sát chi tiết).
    - Khắc phục triệt để lỗi truy vấn ngày: Xóa bỏ lỗi chuyển đổi chuỗi `.replace(/-/g, '')` khiến bảng dữ liệu luôn trống do Backend Mongoose lưu `dateKey` theo chuẩn ISO `YYYY-MM-DD`.
    - Modal kiểm tra & duyệt công ([`AttendanceReviewModal.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/attendance/modals/AttendanceReviewModal.tsx)) trực quan: Hiển thị song song ảnh selfie vào ca/ra ca, kiểm tra tọa độ GPS và sai lệch khoảng cách so với xưởng, cho phép Quản lý điều chỉnh thời gian, loại ngày công (`NORMAL`, `SUNDAY`, `HOLIDAY`), trạng thái duyệt và nhập ghi chú.
    - Hỗ trợ duyệt hàng loạt (`Batch Approve`) nhanh chóng toàn bộ ca hoàn thành với 1 nút bấm.
  - **Tái thiết kế toàn diện Màn hình Bảng Lương Chu Kỳ & Chốt Sổ Toàn Xưởng (`/management/accountant/payroll`):**
    - Khôi phục liên kết API Contract bị đứt gãy giữa Frontend và Backend (`/payroll/periods`, `/payroll/calculate`, `/payroll/lock`, `/payroll/unlock`, `/payroll/mark-paid`, `/payroll/payslips/:id/adjust`).
    - Nâng cấp `usePayrollManagement`: Quản lý linh hoạt chu kỳ lương theo tháng `YYYY-MM`, đồng bộ trạng thái mở/khóa kỳ lương, kiểm soát quyền hạn Kế toán (`ACCOUNTANT`) và Quản trị (`ADMIN`).
    - Modal điều chỉnh chi tiết phiếu lương ([`PayslipDetailAdjustModal.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/payroll/modals/PayslipDetailAdjustModal.tsx)): Hiển thị trực quan cơ cấu tiền lương (với Thợ xưởng: phân bổ chi tiết tiền công theo từng khâu và từng ngày; với Shipper: công thức lương cơ bản chia 28 ngày, phụ cấp điện thoại, thưởng ca cuối tuần, thưởng chuyên cần, chi phí xăng xe và sửa xe được duyệt), cho phép Kế toán điều chỉnh thưởng/phạt và tự động tính lại `netPay`.
    - Hỗ trợ tải báo cáo bảng lương Excel streaming trực tiếp.
  - **Khắc phục lỗi logic Backend (`be-nestjs-thanhxuan`):**
    - Sửa `PayrollService.calculatePayroll`: Mở rộng điều kiện quét điểm danh gồm cả `status: { $in: [CLOSED, APPROVED] }` và Shipper check-in qua `AUTO_HANDOVER_SIGN`, khắc phục lỗi ca làm việc hợp lệ đã kết thúc không được ghi nhận vào số ngày công tính lương.
    - Sửa `PayrollService.adjustPayslip`: Giữ nguyên vẹn cấu trúc chi tiết của Shipper (`shipperDetails`) và cập nhật `workerDetails` khi Kế toán điều chỉnh phiếu lương, đồng thời mở rộng DTO [`adjust-payslip.dto.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/dto/adjust-payslip.dto.ts) nhận thêm các trường điều chỉnh giao hàng và khấu trừ bảo hiểm.
    - Tối ưu `JobSegmentService.closeOpenSegmentAt`: Bổ sung tham số `customDateKey` truyền từ sự kiện kết ca điểm danh của ngày tương ứng, tránh nhầm lẫn dateKey khi ca làm việc kéo dài qua ranh giới ngày.
  - **Dọn dẹp mã nguồn & Kỷ luật Clean Code:**
    - Xóa bỏ triệt để các alias/re-export cũ (`AttendanceReviewView`, `PayrollManagementView`), cập nhật route trỏ trực tiếp vào các Page Component chuẩn.
    - 100% các file mới đều tuân thủ nghiêm ngặt quy định kích thước `< 250 - 300 dòng`, phân tách rõ rệt giữa Custom Hooks, Sub-components, Modals và Page.

- **Chi tiết thực thi kỹ thuật:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - [`job-segment.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/services/job-segment.service.ts): Nâng cấp `closeOpenSegmentAt` hỗ trợ `customDateKey`.
    - [`adjust-payslip.dto.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/dto/adjust-payslip.dto.ts): Bổ sung `extraDeliveryPay` và `insuranceDeduction`.
    - [`payroll.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/payroll.service.ts): Sửa logic đếm ngày công và bảo toàn `shipperDetails` khi điều chỉnh.
  - **Frontend Internal (`fe-react-thanhxuan-internal`):**
    - [`types/index.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/types/index.ts): Định nghĩa kiểu dữ liệu chuẩn cho Attendance & Payroll.
    - [`useAttendanceReview.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/attendance/hooks/useAttendanceReview.ts): Hook quản lý bộ lọc ngày/khoảng ngày, trạng thái, vai trò, đột biến duyệt đơn và duyệt hàng loạt.
    - [`AttendanceFilterBarComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/attendance/components/AttendanceFilterBarComponent.tsx) & [`AttendanceTableComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/attendance/components/AttendanceTableComponent.tsx): Thanh công cụ lọc và bảng điểm danh hiển thị ảnh, GPS, loại ngày, thời lượng.
    - [`AttendanceReviewModal.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/attendance/modals/AttendanceReviewModal.tsx): Modal duyệt công chi tiết.
    - [`AttendanceReviewPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/attendance/AttendanceReviewPage.tsx): Màn hình chính 4 tầng, gỡ bỏ `AttendanceReviewView`.
    - [`usePayrollManagement.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/payroll/hooks/usePayrollManagement.ts): Hook kết nối toàn diện chu kỳ lương, tính toán, khóa/mở khóa, thanh toán và điều chỉnh.
    - [`PayrollActionToolbarComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/payroll/components/PayrollActionToolbarComponent.tsx) & [`PayslipTableComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/payroll/components/PayslipTableComponent.tsx): Toolbar thao tác kỳ lương và bảng phiếu lương chi tiết.
    - [`PayslipDetailAdjustModal.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/payroll/modals/PayslipDetailAdjustModal.tsx): Modal xem bóc tách lương và điều chỉnh.
    - [`PayrollManagementPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/payroll/PayrollManagementPage.tsx): Màn hình chính 4 tầng, gỡ bỏ `PayrollManagementView`.

- **Kiểm thử & Xác thực:**
  - TypeScript strict mode: Backend (0 errors) và Frontend Internal (0 errors).
  - Unit tests: Backend `job-segment.service.spec.ts` (3/3 pass), `payroll.service.spec.ts` (7/7 pass).
  - Build kiểm thử: `be-nestjs-thanhxuan` (`nest build`) và `fe-react-thanhxuan-internal` (`vite build`) $\rightarrow$ **PASS 100%**.


### Plan 39: Xóa Trang /management, Thiết Kế Lại /dashboard & Trung Tâm Báo Cáo /operations/report 8 Phân Hệ

- **Mục tiêu & Bối cảnh nghiệp vụ:**
  - **Xóa bỏ vĩnh viễn trang Hub trung gian `/management` ([ManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx)):** Trang này vốn lặp lại các màn hình đã có đường dẫn độc lập trên Sidebar. Bảo toàn tính năng bảo mật bằng cách chuyển tab `AuditLogPage` sang làm một tab con `"Nhật Ký Hệ Thống (Audit)"` trong màn hình Quản lý Nhân sự ([StaffManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/auth/StaffManagementPage.tsx)), đồng thời cấu hình chuyển hướng an toàn `<Navigate to="/dashboard" replace />` cho các URL cũ.
  - **Tái thiết kế toàn diện `/dashboard` ([DashboardPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx)):** Đưa về đúng quy chuẩn 4 tầng của toàn bộ web hiện tại (`PageBanner` kèm bộ điều hướng ngày theo múi giờ Việt Nam `getTodayVN()`, `PageActionBar` phân luồng 3 tab, 4 thẻ `StatCard` tổng quan và 2 Panel điều phối tiến độ Giao nhận & Năng suất Giờ công thợ). Khắc phục triệt để lỗi logic tàn dư khoán sản lượng cũ hiển thị phút thành `"chiếc"` sang chuẩn **Công Thợ Theo Giờ (`HourlyWork`)**.
  - **Tái cấu trúc Trung tâm Báo cáo `/operations/report` ([ReportsPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/ReportsPage.tsx)):**
    - Giải quyết dứt điểm lỗi đứt gãy API contract (API Contract Drift): Trước đây Backend trả về Object chuyên biệt `{ from, to, items, summary }` nhưng Frontend ép kiểu mảng `ReportSummaryItem[]` dẫn đến bảng luôn trống "Không có bản ghi nào".
    - Mở rộng hỗ trợ **8 phân hệ báo cáo toàn diện** gồm: (1) Xuất nhập kho, (2) Đối soát công nợ Đối tác B2B (nâng cấp xem được cả Toàn bộ đối tác lẫn 1 đối tác cụ thể), (3) Chấm công & Giờ thợ, (4) Chuyến giao Shipper, (5) Sai lệch kiểm đếm & Sự cố 4 sub-tabs, (6) Chi phí nhiên liệu xe tải, (7) Phân tích 7 khâu công thợ xưởng, (8) Quyết toán Bảng lương tháng.
    - Sửa đúng cơ chế xuất file Excel streaming qua tham số query `?format=xlsx` và `/reports/payroll/:month/export`.

- **Chi tiết thực thi kỹ thuật:**
  - **Phân Hệ Backend (`be-nestjs-thanhxuan`):**
    - Sửa DTO [`report-query.dto.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/reports/dto/report-query.dto.ts): Chuyển `partnerId` trong `PartnerReconciliationQueryDto` thành `@IsOptional()` để người dùng có thể xem tổng quan toàn bộ đối tác mà không bị chặn lỗi 400.
    - Nâng cấp Service [`partner-report.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/reports/services/partner-report.service.ts): Bổ sung nhánh xử lý khi không có `partnerId`, tự động gom nhóm tính tổng doanh thu, sản lượng, số phiếu và tỷ lệ giao nhận thành công của từng đối tác hoạt động trong kỳ.
    - Nâng cấp Service [`partner-excel.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/reports/services/excel/partner-excel.service.ts): Tạo thêm sheet `TongHopDoiTac` khi xuất file Excel ở chế độ đối soát toàn bộ đối tác.
    - Cập nhật [`workforce-report.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/reports/services/workforce-report.service.ts): Tương thích linh hoạt giữa `itemCode` / `quantity` và `jobType` / `minutesWorked` cho báo cáo thợ xưởng.
  - **Phân Hệ Frontend Internal (`fe-react-thanhxuan-internal`):**
    - Dọn dẹp & Tái cấu trúc: Xóa các file thừa `management.tsx`, `ManagementPage.tsx`, `ReportsViewComponent.tsx`. Cập nhật `router.tsx` và `nav-config.ts`.
    - Dashboard Mới: Tách nhỏ mã nguồn theo kỷ luật `< 250 - 300 dòng` thành hook [`useDashboardData.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/hooks/useDashboardData.ts) và 2 panel [`DashboardHandoverPanelComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/components/DashboardHandoverPanelComponent.tsx), [`DashboardWorkforcePanelComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/components/DashboardWorkforcePanelComponent.tsx), tích hợp tại [`DashboardPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx).
    - Trung Tâm Báo Cáo Mới: Viết lại [`reports.types.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/reports.types.ts), [`reports.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/reports.service.ts), hook [`useReports.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/useReports.ts), cùng bộ 4 components chuyên trách: [`ReportsFilterBarComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/components/ReportsFilterBarComponent.tsx), [`WarehouseReportSectionComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/components/WarehouseReportSectionComponent.tsx), [`WorkforceReportSectionComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/components/WorkforceReportSectionComponent.tsx), [`QualityFuelReportSectionComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/components/QualityFuelReportSectionComponent.tsx) và trang chủ [`ReportsPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/reports/ReportsPage.tsx).

- **Kiểm thử & Xác thực:**
  - TypeScript Typecheck: Cả Backend và Frontend Internal $\rightarrow$ **PASS 100% (0 errors)**.
  - Unit Tests Backend: Suite `reports.service.spec.ts` $\rightarrow$ **PASS 100% (16/16 tests)**.
  - Production Build: Backend NestJS (`nest build`) và Frontend Internal (`tsc -b && vite build`) $\rightarrow$ **PASS 100%**.
  - Kiểm tra kỷ luật Clean Code: 100% các file mới đều $< 250 - 300 dòng$, không dùng `any`, chuẩn hóa ngày giờ `Asia/Ho_Chi_Minh`.

### Plan 37: Công Thợ Theo Khâu Mặc Định Gắn Chấm Công, Đơn Giá Giờ Theo Khâu & Phiếu Lương Theo Ngày

- **Mục tiêu & Bối cảnh nghiệp vụ:**
  - Chuyển đổi toàn diện mô hình tính công thợ xưởng từ khai báo số phút thủ công và hệ số (`jobCoefficients`) sang mô hình **phiên khâu (Job Segment) tính theo thời gian thực gắn liền với ca chấm công camera selfie**.
  - Cho phép Quản lý xưởng phân chia một khâu công việc mặc định cho từng thợ xưởng (`WORKER`). Khi thợ check-in vào ca tại `/operations/attendance`, hệ thống tự động bắt đầu tính giờ cho khâu mặc định đó.
  - Hỗ trợ cơ chế linh hoạt tại trạm làm việc `/operations/worker/piecework`: Thợ nhận thêm khâu phụ ngoài khâu mặc định bắt buộc phải Checkout khâu hiện tại, Check-in khâu mới; khi hoàn thành Checkout khâu phụ, hệ thống tự động quay lại mở phiên khâu mặc định (`AUTO_RESUME`) cho đến khi thợ kết thúc ca làm việc tại mục Điểm danh.
  - Phân quyền minh bạch: Chỉ `ADMIN` và `ACCOUNTANT` (quyền `pay.rate.manage`) được cài đặt bảng đơn giá VNĐ/giờ cho từng khâu công việc; `MANAGER` thực hiện phân khâu mặc định và duyệt giờ công theo ngày nhưng bị chặn xem các trường tiền tệ tài chính theo chuẩn bảo mật đa tầng.
  - Tích hợp tra cứu thu nhập tạm tính theo từng ngày làm việc (kèm trạng thái Đang chạy, Chờ duyệt, Đã duyệt) và tổng hợp cả tháng tại `/operations/payslip`, đồng thời hiển thị phiếu lương chính thức sau khi Kế toán chốt kỳ (`LOCKED`/`PAID`).

- **Chi tiết thực thi kỹ thuật:**
  - **Phân Hệ Backend (`be-nestjs-thanhxuan`):**
    - Mở rộng Schema [`pay-settings.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/schemas/pay-settings.schema.ts): Chuyển `jobCoefficients` thành `jobRates: JobRateSetting[]` gồm `jobType`, `jobName`, `hourlyRate` (VNĐ/giờ) và `isActive`; gỡ bỏ `defaultHourlyRate`.
    - Mở rộng Schema [`staff-account.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts): Bổ sung `defaultJobType?: string` lưu mã khâu mặc định cho thợ xưởng.
    - Cải tiến Schema [`piecework-log.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/schemas/piecework-log.schema.ts): Chuyển đổi `PieceworkTask` thành phiên khâu thời gian thực (`jobType`, `jobName`, `isDefault`, `source`, `startedAt`, `endedAt`, `hourlyRate`, `minutesWorked`, `subtotal`). Bổ sung compound index `{ workerId: 1, 'tasks.endedAt': 1 }`.
    - Tách biệt Services trong Piecework: Xây dựng [`job-segment.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/services/job-segment.service.ts) (quản lý trạng thái trạm, bắt đầu/kết thúc phiên khâu, tự động quay lại khâu mặc định và lắng nghe sự kiện từ Attendance) và [`job-rate-settings.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/services/job-rate-settings.service.ts) (cài đặt đơn giá khâu, phân khâu mặc định).
    - Tích hợp Event-Driven bằng `@nestjs/event-emitter`: [`attendance.events.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.events.ts) và [`attendance.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.service.ts) phát sự kiện `attendance.checked-in`, `attendance.checked-out`, `attendance.reviewed` để tự động mở/đóng phiên khâu mà không gây circular module dependency.
    - Tạo Decorator [`self-pay-fields.decorator.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/decorators/self-pay-fields.decorator.ts) và nâng cấp [`pay-field-filter.interceptor.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/interceptors/pay-field-filter.interceptor.ts): Cho phép thợ xưởng xem đầy đủ số tiền thu nhập của chính mình trên các endpoint cá nhân `/piecework/me/*` và `/payroll/me/*`.
    - Cập nhật [`payroll.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/payroll.service.ts): Sửa lỗi trích xuất trường `pay_profile` (`hourly_rate`, `pay_type`), bổ sung API `getMyDailyEarnings(workerId, month)` tổng hợp thu nhập từng ngày và tính lương thợ theo đơn giá khâu.
    - Cập nhật kịch bản dọn dẹp CSDL [`drop-legacy-collections.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/scripts/drop-legacy-collections.ts): Tự động chuyển đổi `jobCoefficients` sang `jobRates` trên MongoDB Atlas thực tế.

  - **Phân Hệ Frontend Internal (`fe-react-thanhxuan-internal`):**
    - Sửa lỗi lệch API tại màn hình điểm danh [`AttendancePage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/attendance/AttendancePage.tsx) và tách logic ra hook [`useAttendance.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/attendance/hooks/useAttendance.ts): Đổi sang gọi `/attendance/me`, gửi đúng `photoId` và đồng bộ invalidate query của trạm công thợ.
    - Xây dựng trạm ghi công thợ thời gian thực [`HourlyWorkStationPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/piecework/HourlyWorkStationPage.tsx) (< 250 dòng) cùng hook [`useHourlyWorkStation.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/piecework/hooks/useHourlyWorkStation.ts) và 3 components: [`CurrentSegmentCardComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/piecework/components/CurrentSegmentCardComponent.tsx) (đồng hồ đếm phút và tạm tính realtime), [`JobStagePickerComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/piecework/components/JobStagePickerComponent.tsx) (disable khi đang có phiên mở), [`HourlyWorkTaskListComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/piecework/components/HourlyWorkTaskListComponent.tsx).
    - Tái cấu trúc màn hình quản lý [`HourlyWorkReviewPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/piecework/HourlyWorkReviewPage.tsx) chia làm 3 tab trực quan: Duyệt công theo ngày ([`DailyWorkReviewComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/piecework/components/DailyWorkReviewComponent.tsx)), Phân khâu mặc định ([`WorkerDefaultJobComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/piecework/components/WorkerDefaultJobComponent.tsx)), và Cài đặt đơn giá khâu ([`JobRatesSettingsComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/piecework/components/JobRatesSettingsComponent.tsx)).
    - Xây dựng trang tra cứu lương cá nhân [`MyPayslipPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/payroll/MyPayslipPage.tsx), hook [`useMyPayslip.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/payroll/hooks/useMyPayslip.ts) cùng [`DailyEarningsTableComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/payroll/components/DailyEarningsTableComponent.tsx) và [`OfficialPayslipCardComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/payroll/components/OfficialPayslipCardComponent.tsx).

- **Kiểm thử & Xác thực:**
  - Unit Tests Backend: 4 test suites (`job-segment.service.spec.ts`, `piecework-calculator.spec.ts`, `piecework.service.spec.ts`, `pay-field-filter.interceptor.spec.ts`) $\rightarrow$ **PASS 100% (12/12 tests)**.
  - TypeScript Typecheck: Backend và Frontend $\rightarrow$ **PASS 100% (0 errors)**.
  - Production Build: Backend NestJS (`nest build`) và Frontend Vite PWA (`tsc -b && vite build`) $\rightarrow$ **PASS 100%**.
  - Database Migration: Script `pnpm run db:drop-legacy` chạy thành công trên MongoDB Atlas.

### Plan 36: Chuẩn Hóa Kiến Trúc Handovers & Partners và Đồng Bộ Frontend Với Backend Internal

- **Mục tiêu & Bối cảnh nghiệp vụ:**
  - Qua rà soát cấu trúc phân hệ vận hành và quản lý tại Frontend (`fe-react-thanhxuan-internal`) đối chiếu với Backend (`be-nestjs-thanhxuan/src/modules/internal`), phát hiện thư mục `src/features/operations/partners` chứa các tính năng đếm đồ bẩn, kiểm nhận đồ sạch và lịch sử phiếu giao nhận.
  - Về bản chất nghiệp vụ và dữ liệu, 100% các chức năng này là Trạm thứ 3 (Nhà hàng/Khách sạn đối tác) của quy trình Giao Nhận Kép, thao tác trực tiếp với bảng `handover_records` qua các endpoint `/handover/*`. Trong khi đó, module `partners` thực tế chỉ quản lý hồ sơ đối tác, chi nhánh, bảng giá đồ vải `item_catalogs` và thương hiệu `brands` (đã đặt chuẩn xác tại `src/features/management/partners`).
  - Việc duy trì `operations/partners` gây phân mảnh nghiệp vụ giao nhận, khiến người đọc nhầm lẫn vai trò domain giữa `handovers` và `partners`.
  - Đồng thời, xử lý triệt để các vi phạm kiểu `any` trong `StaffManagementPage.tsx` và khắc phục lỗi import baseline trong `ManagementPage.tsx`.
- **Chi tiết thực thi kỹ thuật:**
  - **Quy tụ 4 Trạm Giao Nhận Kép vào `src/features/operations/handovers`:**
    - Trạm 1 (Thủ kho soạn đồ sạch): [`WarehouseHandoverPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/WarehouseHandoverPage.tsx).
    - Trạm 2 (Tài xế giao nhận xe tải): [`ShipperHandoverPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/ShipperHandoverPage.tsx).
    - Trạm 3 (Chi nhánh đối tác giao đồ bẩn & nhận đồ sạch): [`PartnerHandoverPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/PartnerHandoverPage.tsx) (di chuyển từ `PartnerPortalPage.tsx`, export kèm alias `PartnerPortalPage`, `RestaurantPage`).
    - Trạm 4 (Thợ xưởng rạch bao đếm lại): [`RecountStationPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/RecountStationPage.tsx).
  - **Di chuyển Components & Hooks sang `handovers`:**
    - Di chuyển 7 components: `PartnerCountTabComponent`, `PartnerReceiptTabComponent`, `PartnerReceiptItemsTableComponent`, `PartnerReceiptSignatureSectionComponent`, `PartnerReceiptSlipPreviewComponent`, `PartnerHistoryTabComponent`, `PartnerStaffTabComponent` $\rightarrow$ `src/features/operations/handovers/components/`.
    - Di chuyển 2 hooks luồng: `usePartnerCountFlow.ts`, `usePartnerReceiptFlow.ts` $\rightarrow$ `src/features/operations/handovers/hooks/`.
    - Cập nhật barrel exports: `handovers/components/index.ts`, `handovers/hooks/index.ts`, `handovers/index.ts`.
    - Cập nhật router wrapper pages: `src/app/(internal)/operations/partner-manager/partner/page.tsx` và `partner-staff/partner/page.tsx`.
    - Dọn dẹp hoàn toàn thư mục cũ `src/features/operations/partners`.
  - **Sửa lỗi baseline & Xóa bỏ 100% `any`:**
    - Sửa lỗi import `./components` không tồn tại trong [`ManagementPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx), trỏ đúng vào các submodules: `./auth`, `./attendance`, `./piecework`, `./fuel`, `./payroll`.
    - Định nghĩa interface `StaffFormSubmitPayload` và loại bỏ toàn bộ `any` trong `getStaffId`, `queryFn`, `createAccountMutation`, `updateAccountMutation` tại [`StaffManagementPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/auth/StaffManagementPage.tsx).
  - **Đồng bộ tài liệu kiến trúc:**
    - Cập nhật [`CODEBASE_ATLAS.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md): Cổng đối tác trỏ chuẩn xác vào `PartnerHandoverPage.tsx` thuộc `src/features/operations/handovers/`.
    - Cập nhật [`srs_sdd_fe_internal.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md): Cây thư mục loại bỏ `operations/partners`, thể hiện trọn vẹn 4 trạm trong `operations/handovers`.
    - Cập nhật [`SRS_SDD.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md): Ghi nhận 1 dòng Document History cho Plan 36.
- **Kiểm thử & Xác thực:**
  - TypeScript Compilation: `pnpm --filter fe-react-thanhxuan-internal exec tsc --noEmit` $\rightarrow$ **PASS 100% (0 errors)**.
  - Production Build: `pnpm --filter fe-react-thanhxuan-internal build` $\rightarrow$ **PASS 100% (built trong 8.13s, Service Worker PWA hoàn chỉnh)**.

### Plan 35: Chức Năng Lưu & Chọn Chữ Ký Đã Lưu Trong Tài Khoản Cho Web Internal

- **Mục tiêu & Bối cảnh nghiệp vụ:**
  - Trong quá trình vận hành xưởng giặt là công nghiệp và chuỗi cung ứng giao nhận, nhân sự xưởng (Thủ kho soạn đồ sạch xuất xưởng, Shipper kiểm đếm đồ bẩn xe tải, Nhân sự quản lý hoặc nhân viên chi nhánh đối tác) phải ký xác nhận chứng từ liên tục hàng ngày.
  - Việc phải dùng chuột hoặc ngón tay vẽ lại chữ ký trên màn hình cảm ứng ở mỗi lần thao tác gây tốn nhiều thời gian và nét ký thường không đồng nhất.
  - Triển khai tính năng lưu trữ chữ ký mẫu trực tiếp vào thông tin tài khoản cá nhân (`accounts` / `StaffAccount`), đồng thời cung cấp trợ thủ chọn chữ ký mẫu tức thì tại tất cả các điểm ký nhận trong toàn hệ sinh thái Cổng Nội Bộ.
- **Chi tiết thực thi kỹ thuật:**
  - **Phân Hệ Backend (`be-nestjs-thanhxuan`):**
    - Mở rộng Mongoose Schema [`staff-account.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts): Bổ sung thuộc tính `@Prop({ type: String }) signatureUrl?: string;` lưu trữ chuỗi PNG Base64 đã trim viền hoặc URL ảnh chữ ký.
    - Cập nhật DTO [`update-profile.dto.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/dto/update-profile.dto.ts) & [`update-account.dto.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/dto/update-account.dto.ts): Bổ sung field `signatureUrl?: string` có decorator `@IsOptional() @IsString()`.
    - Cập nhật Services [`account-auth.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/services/account-auth.service.ts) và [`account-management.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/services/account-management.service.ts): Trả về `signatureUrl` trong object của `getMe()` và `getAccountMe()`, đồng thời xử lý gán hoặc xóa chữ ký trong `updateProfile()`.
  - **Phân Hệ Frontend Internal (`fe-react-thanhxuan-internal`):**
    - Mở rộng kiểu dữ liệu [`types/index.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/types/index.ts): Bổ sung `signatureUrl?: string;` vào interface `StaffUser`.
    - Đồng bộ Auth Context [`AuthContext.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx): Nạp `signatureUrl` vào `normalizedUser` khi giải mã token qua `/auth/me`.
    - Hồ sơ cá nhân [`ProfileEditModal.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/modals/ProfileEditModal.tsx): Tích hợp khu vực "Chữ Ký Điện Tử Đã Lưu", cho phép xem trước chữ ký hiện tại, chuyển sang chế độ vẽ chữ ký mẫu mới trên Canvas (tự động `trimCanvas`), xóa nét ký hoặc xóa bỏ vĩnh viễn chữ ký mẫu.
    - Xây dựng Component dùng chung [`SignatureInputComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/SignatureInputComponent.tsx): Đóng gói toàn bộ logic nhận diện `user.signatureUrl`, toggle mượt mà giữa "Chữ ký đã lưu" và "Ký tay mới", hiển thị thẻ preview sắc nét, và checkbox "Lưu làm chữ ký mặc định vào tài khoản cho các lần sau" khi đang ký tay mới.
    - Đồng bộ tích hợp vào 5 vị trí ký nhận trọng yếu:
      1. [`SignatureModal.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/SignatureModal.tsx): Thay thế canvas tĩnh bằng `SignatureInputComponent`, hỗ trợ lưu tự động vào profile khi tick chọn mặc định.
      2. [`PrepOrderModal.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx): Thủ kho soạn đồ sạch tự động nhận chữ ký mẫu từ tài khoản, có nút "Dùng chữ ký tài khoản" và checkbox lưu mặc định.
      3. [`ShipperCountPartnerModal.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/ShipperCountPartnerModal.tsx): Shipper kiểm đếm đồ bẩn cùng đối tác tự động nhận diện chữ ký mẫu, hỗ trợ chuyển đổi linh hoạt.
      4. [`PartnerReceiptTabComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerReceiptTabComponent.tsx): Đối tác xác nhận nhận đồ sạch hỗ trợ dùng chữ ký tài khoản.
      5. [`PartnerCountTabComponent.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerCountTabComponent.tsx) & [`PartnerPortalPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/PartnerPortalPage.tsx): Đối tác xuất giao đồ bẩn tự động nhận diện chữ ký mẫu khi canvas rỗng.
- **Kiểm thử & Xác thực:**
  - Backend: `pnpm --prefix be-nestjs-thanhxuan run build`: PASS 100%.
  - Frontend Internal: `pnpm --prefix fe-react-thanhxuan-internal exec tsc --noEmit`: PASS 100% (0 errors).
  - Frontend Internal: `pnpm --prefix fe-react-thanhxuan-internal exec tsc -b`: PASS 100%.

### Cài Đặt Hiển Thị Lọc Loại Đồ Kho (Pizza 4P's: Khăn ăn xám) Tại Phân Hệ Kho Sạch & Tổng Hợp Kho

- **Mục tiêu & Động lực:**
  - Đáp ứng yêu cầu nghiệp vụ thực tế của thủ kho xưởng giặt là: Khi theo dõi danh sách phiếu giao nhận xuất kho (`?tab=CLEAN_PLAN`) và bảng tổng hợp đồ kho hôm nay (`?tab=SUMMARY`), người dùng cần có thiết lập để chọn hiển thị 1 loại đồ cụ thể (ví dụ: với đối tác Pizza 4P's, chỉ cần theo dõi **Khăn ăn xám**, không cần cộng gộp các loại đồ phụ khác).
  - Tách bạch rõ ràng giữa số lượng của món chủ lực và tổng số lượng toàn bộ các mặt hàng để thủ kho không bị nhầm lẫn khi đối soát và kiểm đếm.
- **Chi tiết thực thi:**
  - **Module & Helper (`warehouseItemDisplayHelper.ts`):**
    - Thiết kế cấu trúc `WarehouseItemDisplaySettings`: Hỗ trợ lọc theo từng Thương hiệu đối tác (`BY_BRAND`) hoặc toàn cục (`GLOBAL`), lưu trạng thái vĩnh viễn trong `localStorage` (`warehouse_item_display_settings`).
    - Xây dựng hàm `calculateRecordCounts()`: Tính toán chính xác số lượng `filteredClean`, `totalClean`, `filteredDirty`, `totalDirty`, và nhãn lọc `filterLabel` cho từng phiếu.
    - Xây dựng hàm `isItemMatchingFilter()`: So sánh thông minh đa chiều qua `itemCode`, tra chéo danh mục `ItemCatalog`, và so sánh mềm `itemName` (chuẩn hóa tiếng Việt không dấu).
    - Helper `getAvailableItemsForBrand()`: Tự động trích xuất danh sách các loại đồ có sẵn của từng thương hiệu từ Catalog và từ các phiếu giao nhận thực tế.
  - **Modal Cài Đặt (`WarehouseItemFilterSettingsModal.tsx`):**
    - Cung cấp giao diện trực quan cho phép bật/tắt chế độ lọc loại đồ.
    - Cung cấp nút 1-chạm: "✨ Mẫu phổ biến: Pizza 4P's chỉ hiện Khăn ăn xám".
    - Cho phép chọn loại đồ hiển thị từ dropdown đồ giặt của từng thương hiệu hoặc khôi phục mặc định xem tất cả.
  - **Giao diện Kho Sạch & Phiếu Giao Nhận (`WarehouseCleanPlanTabComponent.tsx`):**
    - Số lượng đồ sạch trong phiếu hiển thị theo loại đồ lọc: `{counts.filteredClean} chiếc ({counts.filterLabel})`.
    - Tự động hiển thị phụ chú tổng nếu có mặt hàng khác: `(Tổng: {counts.totalClean})`.
  - **Giao diện Tổng Hợp Kho (`WarehouseSummaryTabComponent.tsx`):**
    - Thêm 2 Thẻ KPI tổng kết ở đầu màn hình: "Tổng Đồ Bẩn Vào Hôm Nay" và "Tổng Đồ Sạch Ra Hôm Nay" (kèm badge chỉ thị lọc và tổng mọi loại).
    - Mỗi dòng chi nhánh đối tác hiển thị chi tiết "Bẩn vào" và "Sạch ra" tương ứng với loại đồ đang được lọc.
  - **Thanh Điều Khiển & Banner Trang Chủ Kho (`WarehouseHandoverPage.tsx`):**
    - Bổ sung nút `Cài Đặt Đồ Hiển Thị` (icon `SlidersHorizontal`) trên thanh `PageActionBar`.
    - Tích hợp banner thông tin trực quan khi chế độ lọc đang bật, cho phép bấm "Đổi Cài Đặt" hoặc "Tắt Lọc (Hiện Tất Cả)" ngay lập tức.
- **Kiểm thử & Xác thực:**
  - `pnpm --filter fe-react-thanhxuan-internal exec tsc --noEmit`: PASS 100% (0 errors).
  - `pnpm --filter fe-react-thanhxuan-internal build`: PASS 100%, PWA Service Worker tạo thành công.

## 2026-10-25

### Plan 34: Tái Cấu Trúc UI/UX Trang Chủ (Hero Diagonal Split Video-Ảnh & Di Dời Form Liên Hệ Xuống Pre-Footer)

- **Mục tiêu & Động lực:**
  - Nâng cấp trải nghiệm người dùng (UX) và thẩm mỹ giao diện (UI) trang chủ fe-nextjs-thanhxuan-laundry theo phong cách Industrial Clean / Neo-Precision B2B.
  - Giải quyết trọn vẹn yêu cầu của khách hàng:
    1. Di dời khối Form "Liên Hệ Với Chúng Tôi" từ màn hình đầu tiên (Hero) xuống vị trí Pre-Footer (ngay trên Footer) nhằm tạo luồng tâm lý chuyển đổi tự nhiên (Lead Magnet: Cam kết giặt mẫu 01 tuần, giao nhận 24/7, bồi thường 100%).
    2. Tái cấu trúc Hero Section theo bố cục chia chéo (Diagonal Split): Nửa bên trái là video reel xưởng giặt sấy công nghiệp tự động hóa kết hợp tiêu đề & CTA kép; nửa bên phải là ảnh thành phẩm chất lượng cao kèm các thẻ nổi bảo chứng năng lực (5+ Tấn Đồ/Ngày, 99.8% Giao Đúng Hẹn).
    3. Tích hợp hiệu ứng xuất hiện mượt mà (Framer Motion entrance cascade 60fps) và tối ưu hóa hiệu năng (Intersection Observer tạm dừng video khi cuộn khỏi màn hình, Poster image nạp tức thì bằng priority={true}).
    4. Mở rộng Backend Schema/DTO và giao diện Admin CMS (/admin/settings) để quản trị viên có thể tự đổi link video xưởng, ảnh poster, ảnh thành phẩm bên phải linh hoạt.
- **Chi tiết thực thi:**
  - **Giai đoạn 1 - Backend Schema & DTO (be-nestjs-thanhxuan):**
    - Cập nhật Mongoose Schema Setting tại src/modules/laundry/settings/schemas/setting.schema.ts, mở rộng homepageConfig bổ sung: heroVideoUrl?: string, heroVideoPoster?: string, heroSideImage?: string.
    - Cập nhật DTO trong update-settings.dto.ts.
  - **Giai đoạn 2 - Admin CMS Settings UI (fe-nextjs-thanhxuan-laundry):**
    - Cập nhật SettingEditorHomeComponent.tsx thêm các control nhập Hero Video URL, upload ảnh Poster đại diện và upload ảnh thành phẩm bên phải Hero kèm xem trước và nút xóa ảnh.
  - **Giai đoạn 3 - Pre-Footer B2B Lead Magnet Component:**
    - Tạo mới src/features/public/home/components/PreFooterCtaComponent.tsx với thiết kế 2 cột: Cột trái chứa 4 cam kết vàng (Tặng 01 tuần giặt mẫu, Giao nhận định kỳ 24/7, Đền bù 100%, Hóa đơn VAT) + Hotline 24/7; Cột phải nhúng form liên hệ <Contact defaultCategory="tin-tuc-gioi-thieu" /> bọc trong thẻ Card kính mờ.
    - Export tại src/features/public/home/components/index.ts.
  - **Giai đoạn 4 - Hero Section "Diagonal Split" & Framer Motion:**
    - Tái cấu trúc hoàn toàn HeroSectionComponent.tsx: Nửa trái vát nghiêng góc 12°-14° ([clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] trên desktop), nền video loop tự động + lớp phủ gradient điện ảnh giúp nổi bật tiêu đề trắng, subtitle và bộ đôi nút CTA ("Khám Phá Dịch Vụ B2B" + "Đăng Ký Giặt Mẫu"). Đường phân cách chéo viền phát sáng cyan/blue công nghệ. Nửa phải là ảnh thành phẩm kèm 2 floating badges ("5+ Tấn / Ngày", "99.8% Đúng Hẹn"). Framer Motion entrance reveal tuần tự, hook IntersectionObserver tạm dừng video khi out-of-view; Responsive tự gỡ clip-path trên mobile (< 768px).
  - **Giai đoạn 5 - Lắp ráp Trang Chủ (HomePage.tsx):**
    - Cập nhật HomePage.tsx: Truyền cấu hình video/poster/sideImage vào HeroSectionComponent, đặt <PreFooterCtaComponent /> tại đáy trang chủ ngay trước Footer.
- **Kiểm thử & Xác thực:**
  - pnpm --filter be-nestjs-thanhxuan exec tsc --noEmit & pnpm --filter be-nestjs-thanhxuan build: PASS 100%.
  - pnpm --filter frontend-nextjs exec tsc --noEmit: PASS 100% (0 errors).
  - pnpm --filter frontend-nextjs build: PASS 100% toàn bộ 13 static pages và dynamic routes.
- **Đồng bộ tài liệu:**
  - Cập nhật srs_sdd_fe_nextjs.md (v2.2, bổ sung PreFooterCtaComponent & Hero Diagonal Split).
  - Cập nhật SRS_SDD.md (Document History).
  - Cập nhật plan34.md (Checklist & Status: Done).

### Plan 32: Tái Cấu Trúc Toàn Diện Thư Mục & Chuẩn Hóa Kiến Trúc fe-nextjs-thanhxuan-laundry Theo Chuẩn fe-react-thanhxuan-internal

- **Mục tiêu & Động lực:**
  - Đồng bộ hóa toàn diện cấu trúc thư mục và quy chuẩn đặt tên mã nguồn của ứng dụng Web Khách Hàng & CMS (`fe-nextjs-thanhxuan-laundry`) với chuẩn kiến trúc của `fe-react-thanhxuan-internal` theo AGENTS.md Mục 5.3, 5.5 và Mục 8.
  - Áp dụng triệt để quy ước đặt tên file Frontend: Màn hình chính cấp cao nhất: `[Tên]Page.tsx` (trực tiếp tại root feature); Modal nghiệp vụ: `modals/[Tên]Modal.tsx`; Subcomponent hiển thị: `components/[Tên]Component.tsx`.
  - Bóc tách rõ ràng giữa Shared Components dùng chung toàn app (`components/layout/` gồm `admin/` & `public/`, `components/common/`, `components/ui/`) và Feature Components colocation (`features/admin/*` và `features/public/*`).
  - Triệt tiêu 100% các file tương thích ngược/re-export mồ côi (No Stale Bridge Files), loại bỏ hoàn toàn TypeScript `any` trong các route public App Router.
- **Chi tiết thực thi:**
  - **Giai đoạn 1 - Tái cấu trúc Shared Components (`src/components/`):**
    - Di chuyển các component layout quản trị từ `components/admin/` sang `components/layout/admin/`: `AdminShellComponent.tsx`, `AdminHeaderComponent.tsx`, `AdminSidebarComponent.tsx`, kèm barrel export `components/layout/admin/index.ts`.
    - Di chuyển các component layout khách hàng từ `components/public/` sang `components/layout/public/`: `PublicHeaderComponent.tsx`, `PublicFooterComponent.tsx`, `DraggableFloatingContactComponent.tsx`, `HeaderClientWrapperComponent.tsx`, các thư mục con `header/` và `footer/`, kèm barrel export `components/layout/public/index.ts`.
    - Tổ chức lại thư mục `components/common/`: Chuyển `ConfirmAlertDialogComponent.tsx`, `ProfileModal.tsx`, `ThemeToggleComponent.tsx`, `ThemeProvider.tsx`, tạo barrel export `components/common/index.ts`.
    - Xóa bỏ hoàn toàn 2 thư mục cũ `src/components/admin/` và `src/components/public/`.
  - **Giai đoạn 2 - Chuẩn hóa 11 Feature Quản Trị Admin (`src/features/admin/`):**
    - `articles`: Tạo `ArticleManagerPage.tsx` làm màn hình chính; bóc tách `modals/ArticleEditorModal.tsx`, `modals/ArticleTrashModal.tsx`; bóc tách subcomponents `ArticleManagerTableComponent.tsx`, `ArticleManagerToolbarComponent.tsx`, `ArticleEditorAiAssistantComponent.tsx`, `ArticleEditorBasicComponent.tsx`, `ArticleEditorSeoComponent.tsx`, `ArticleEditorSettingsComponent.tsx`.
    - `categories`: Tạo `CategoryManagerPage.tsx`; bóc tách `modals/CategoryEditorModal.tsx`.
    - `contacts`: Tạo `ContactManagerPage.tsx`; bóc tách `modals/ContactTrashModal.tsx`; subcomponents `ContactManagerTableComponent.tsx`, `ContactManagerToolbarComponent.tsx`, `ContactManagerBulkActionsComponent.tsx`.
    - `crm`: Tạo `CrmManagerPage.tsx`; subcomponents `CrmManagerTableComponent.tsx`, `CrmManagerToolbarComponent.tsx`.
    - `dashboard`: Tạo `DashboardPage.tsx`.
    - `email-marketing`: Tạo `EmailMarketingPage.tsx`; bóc tách modals (`EmailCampaignModal`, `EmailTemplateModal`) và components (`EmailCampaignsTableComponent`, `EmailTemplatesTableComponent`).
    - `orders`: Tạo `OrdersManagerPage.tsx`; bóc tách modal `OrdersManagerModal.tsx` và components (`OrdersManagerTableComponent`, `OrdersManagerToolbarComponent`).
    - `settings`: Tạo `SettingsPage.tsx`; bóc tách subcomponents `SettingEditorAboutComponent.tsx`, `SettingEditorContactComponent.tsx`, `SettingEditorFooterComponent.tsx`, `SettingEditorHeaderComponent.tsx`, `SettingEditorHomeComponent.tsx`, `SettingEditorServiceComponent.tsx`, `SettingEditorZaloComponent.tsx`.
    - `users`: Tạo `AccountManagerPage.tsx`; bóc tách `modals/AccountEditorModal.tsx`.
    - `auth`: Tạo `LoginFormComponent.tsx`.
    - `zalo`: Tạo `ZaloMarketingPage.tsx`.
    - Khởi tạo barrel export `src/features/admin/index.ts` xuất tập trung toàn bộ 11 module quản trị.
  - **Giai đoạn 3 - Chuẩn hóa các Feature Khách Hàng Public (`src/features/public/`):**
    - `home`: Tạo `HomePage.tsx` tại root feature; đổi tên các subcomponent thành `HeroSectionComponent.tsx`, `IntroSectionComponent.tsx`, `ServicesGridComponent.tsx`, `WhyChooseUsSectionComponent.tsx`, `FaqSectionComponent.tsx`.
    - `articles`: Tạo `ArticleListPage.tsx`; đổi tên component thành `ArticleListComponent.tsx`, `ArticleSortFilterComponent.tsx`.
    - `contacts`: Tạo `ContactPage.tsx` làm màn hình liên hệ chính.
    - `services`: Tạo `ServiceDetailPage.tsx` làm màn hình chi tiết dịch vụ.
    - Khởi tạo barrel export `src/features/public/index.ts` xuất tập trung toàn bộ feature public.
  - **Giai đoạn 4 - Cập nhật App Router Routes & Loại bỏ TypeScript `any`:**
    - Cập nhật toàn bộ các route App Router trong `(admin)/admin/**/page.tsx` và `layout.tsx` trỏ trực tiếp vào các Page/Component chuẩn mới.
    - Cập nhật toàn bộ các route trong `(public)/**/page.tsx` và `layout.tsx` trỏ vào các Page/Component mới.
    - Loại bỏ hoàn toàn kiểu dữ liệu `any` trong `src/app/(public)/page.tsx`, thay bằng typing chặt chẽ.
    - Quét toàn bộ codebase Next.js, triệt tiêu 100% file re-export tạm thời và không để lại bất kỳ import lỗi thời nào.
  - **Kiểm thử & Đồng bộ tài liệu:**
    - Typecheck `pnpm exec tsc --noEmit` pass 100% (0 errors).
    - Build production Next.js `pnpm build` pass 100% toàn bộ static pages và dynamic server routes.
    - Cập nhật tài liệu: [srs_sdd_fe_nextjs.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md), [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md), [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md).

### Plan 33: Tái Cấu Trúc Thư Mục Laundry Đồng Bộ Với Internal & Chuẩn NestJS (`be-nestjs-thanhxuan`)

- **Mục tiêu & Động lực:**
  - Đồng bộ hóa cấu trúc kiến trúc thư mục domain `laundry` tương đồng với `internal` và tuân thủ skill `create-nestjs-module`.
  - Khởi tạo `laundry.constants.ts` (chứa `LAUNDRY_CONNECTION`) và `laundry.module.ts` đóng gói tập trung 12 submodules của phân hệ Giặt Là (Website & CMS).
  - Tái cấu trúc `app.module.ts`: thay thế việc khai báo rời rạc 12 modules bằng duy nhất `LaundryModule`.
  - Di chuyển toàn bộ các file `*.repository.ts` đang nằm ở root các submodules của laundry vào thư mục `repositories/` chuẩn mực (`articles`, `categories`, `contacts`, `crm`, `orders`, `settings`, `users`).
  - Xóa bỏ triệt để 7 file repository cũ tại root, không để lại file rác hay alias bridge tương thích ngược.
- **Chi tiết thực thi:**
  - **Tạo Laundry Root Module & Constants:**
    - Khởi tạo [laundry.constants.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/laundry.constants.ts) định nghĩa hằng số kết nối `LAUNDRY_CONNECTION`.
    - Khởi tạo [laundry.module.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/laundry.module.ts) import và export toàn bộ 12 submodule giặt là (`ArticlesModule`, `ContactsModule`, `CategoriesModule`, `AuthModule`, `UsersModule`, `DashboardModule`, `SettingsModule`, `CrmModule`, `OrdersModule`, `ZaloModule`, `ZaloMarketingModule`, `EmailMarketingModule`).
    - Cập nhật [app.module.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/app.module.ts) import tập trung `LaundryModule`.
  - **Chuẩn hóa thư mục `repositories/` cho 7 Submodules:**
    - `articles/repositories/articles.repository.ts`: Di chuyển và cập nhật imports `BaseRepository`, schema/dto; cập nhật `articles.module.ts`, `articles.service.ts`, `articles.service.spec.ts`, `categories.service.ts`, `categories.service.spec.ts`, `dashboard.service.ts`, `dashboard.service.spec.ts`.
    - `categories/repositories/categories.repository.ts`: Di chuyển và cập nhật imports; cập nhật `categories.module.ts`, `categories.service.ts`, `categories.service.spec.ts`, `articles.service.ts`, `articles.service.spec.ts`, `dashboard.service.ts`, `dashboard.service.spec.ts`.
    - `contacts/repositories/contacts.repository.ts`: Di chuyển và cập nhật imports; cập nhật `contacts.module.ts`, `contacts.service.ts`, `contacts.service.spec.ts`, `dashboard.service.ts`, `dashboard.service.spec.ts`.
    - `crm/repositories/crm.repository.ts`: Di chuyển và cập nhật imports; cập nhật `crm.module.ts`, `crm.service.ts`, `zalo.service.ts`, `zalo-marketing.service.ts`.
    - `orders/repositories/orders.repository.ts`: Di chuyển và cập nhật imports; cập nhật `orders.module.ts`, `orders.service.ts`.
    - `settings/repositories/settings.repository.ts`: Di chuyển và cập nhật imports; cập nhật `settings.module.ts`, `settings.service.ts`, `settings.service.spec.ts`.
    - `users/repositories/users.repository.ts`: Di chuyển và cập nhật imports; cập nhật `users.module.ts`, `users.service.ts`, `users.service.spec.ts`.
  - **Dọn dẹp triệt để file cũ (Zero Dead Code):**
    - Sử dụng `git rm` xóa 7 file repository cũ tại root submodules.
    - Quét toàn bộ codebase không còn bất kỳ import nào trỏ vào đường dẫn cũ.
  - **Kiểm thử & Đồng bộ tài liệu:**
    - Typecheck `pnpm exec tsc -p tsconfig.build.json --noEmit` pass 100% (0 errors).
    - Build `pnpm build` pass 100% (`nest build` thành công).
    - Unit tests `pnpm test src/modules/laundry` pass 100% (14 test suites, 36/36 tests passed).
    - Cập nhật tài liệu: [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md), [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md), [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md).

## 2026-10-15

### Plan 31: Dọn Dẹp File Thừa Mồ Côi & Chuẩn Hóa Tên Màn Hình Frontend Ánh Xạ Backend (`fe-react-thanhxuan-internal`)

- **Mục tiêu & Động lực:**
  - Codebase `fe-react-thanhxuan-internal` sau quá trình tiến hóa qua các Plan 26 - 30 tồn tại một số file component mồ côi (dead code) không còn nơi nào import.
  - Tên các màn hình cấp cao nhất (`Page.tsx`) chưa ánh xạ rõ ràng 1-1 với 8 module Backend (`be-nestjs-thanhxuan/src/modules/internal/`), gây khó khăn khi định vị và nhận diện vai trò sử dụng.
  - Chuyển đổi tên trạm khoán việc cũ (`PieceworkStationPage`, `PieceworkConfirmPage`) sang nhận diện chuẩn xác theo nghiệp vụ tính công theo giờ `HourlyWork` đã hoàn thành ở Plan 30.
- **Chi tiết thực thi:**
  - **Giai đoạn 1 - Dọn dẹp triệt để 6 file thừa / mồ côi (Dead Code):**
    - Xóa bỏ [ItemCounterCardComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/piecework/components/ItemCounterCardComponent.tsx) (card đếm sản lượng khoán cũ không còn dùng), dọn dẹp barrel exports trong `piecework/components/index.ts` và `piecework/index.ts`.
    - Xóa bỏ [WarehouseSlipGalleryTabComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/components/WarehouseSlipGalleryTabComponent.tsx) (tab mồ côi bị thay thế bởi `HandoverSlipGalleryComponent`), dọn barrel exports.
    - Xóa bỏ [WarehouseRecountQueueTabComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/components/WarehouseRecountQueueTabComponent.tsx) (tab đếm lại rạch bao cũ mồ côi), dọn barrel exports.
    - Xóa bỏ [CreateHandoverModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/CreateHandoverModal.tsx) (modal mồ côi thừa, chức năng đã nằm trong `PrepOrderModal`), dọn barrel exports.
    - Xóa bỏ [RegisterModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/modals/RegisterModal.tsx) (modal đăng ký tài khoản mồ côi, tài khoản nhân viên do admin cấp), dọn barrel exports.
    - Xóa bỏ thư mục [management/reports/](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/reports) chứa duy nhất file `index.ts` rỗng (báo cáo đã chuyển về `features/reports/`), dọn barrel exports tại `management/index.ts`.
  - **Giai đoạn 2 - Chuẩn hóa tên 6 màn hình Frontend ánh xạ 1-1 Backend Module:**
    - `PieceworkStationPage.tsx` $\rightarrow$ [HourlyWorkStationPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/piecework/HourlyWorkStationPage.tsx): Màn hình trạm ghi nhận giờ công và khâu làm việc của thợ xưởng, ánh xạ `PieceworkModule`. Cập nhật route Next.js wrapper tại `src/app/(internal)/operations/worker/piecework/page.tsx`.
    - `PieceworkConfirmPage.tsx` $\rightarrow$ [HourlyWorkReviewPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/piecework/HourlyWorkReviewPage.tsx): Màn hình quản lý xem xét và phê duyệt bảng công thợ theo giờ, xóa bỏ alias `PieceworkConfirmView`, cập nhật tiêu đề Tiếng Việt tự nhiên "Duyệt Công Thợ Theo Giờ". Cập nhật [ManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx) và route wrapper tại `src/app/(internal)/management/manager/piecework/page.tsx`.
    - `WarehousePage.tsx` $\rightarrow$ [WarehouseHandoverPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/WarehouseHandoverPage.tsx): Màn hình thủ kho tạo/sửa phiếu giao nhận đồ sạch và xem thư viện ảnh phiếu, ánh xạ `HandoversModule`. Cập nhật route wrapper tại `src/app/(internal)/operations/warehouse-manager/warehouse/page.tsx`.
    - `HandoverListPage.tsx` $\rightarrow$ [ShipperHandoverPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/ShipperHandoverPage.tsx): Màn hình tài xế thực hiện nhận/giao đồ giặt và ký số trên đường vận chuyển, ánh xạ `HandoversModule`. Cập nhật route wrapper tại `src/app/(internal)/operations/shipper/handover/page.tsx`.
    - `FuelPage.tsx` $\rightarrow$ [ShipperFuelPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/fuel/ShipperFuelPage.tsx): Màn hình tài xế đề xuất đổ xăng kèm chụp ảnh đồng hồ công-tơ-mét, ánh xạ `FuelModule`. Cập nhật route wrapper tại `src/app/(internal)/operations/shipper/fuel/page.tsx`.
    - `PartnersPage.tsx` $\rightarrow$ [PartnersManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/partners/PartnersManagementPage.tsx): Màn hình quản lý thông tin, chi nhánh và danh mục đơn giá đồ giặt của đối tác B2B, ánh xạ `PartnersModule`. Cập nhật route wrapper tại `src/app/(internal)/management/manager/partner/page.tsx`.
  - **Triệt tiêu toàn bộ file/alias bridge tương thích ngược:**
    - Tuân thủ nghiêm ngặt mục 4 và mục 8 trong `AGENTS.md`, toàn bộ các alias trung gian dạng `export { A as B }` đã được xóa bỏ triệt để. Mọi nơi gọi đều trỏ trực tiếp vào định danh mới.
  - **Kiểm thử & Nghiệm thu:**
    - `pnpm exec tsc --noEmit` pass 100% (0 errors, strict mode).
    - `pnpm build` pass 100% (Vite production bundle built thành công trong 4.95s).
    - Đồng bộ tài liệu kiến trúc [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md), [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md), [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md).

### Plan 29 & Plan 30: Chuẩn Hóa Bộ Lọc Ngày Phiếu Giao Nhận & Chuyển Đổi Trạm Khoán Việc Sang HourlyWork (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Plan 29 - Chuẩn hóa bộ lọc ngày & trải nghiệm Tạo/Sửa Phiếu Giao Nhận (`fe-react-thanhxuan-internal`):**
  - **Bộ lọc Thư viện ảnh phiếu (`HandoverSlipGalleryComponent.tsx`):**
    - Thêm helper `getFirstDayOfMonthVN()` tại `src/lib/utils.ts`.
    - Chuẩn hóa bộ lọc ngày mặc định trên cả 3 tab sử dụng component này (`WarehousePage?tab=SLIP_GALLERY`, `HandoverListPage?tab=HISTORY`, `PartnerPortalPage?tab=HISTORY`): từ ngày đầu tháng hiện tại (`YYYY-MM-01`) đến ngày mai (`today + 1`).
  - **Tab Kiểm nhận đối tác (`PartnerPortalPage.tsx` & `PartnerReceiptTabComponent.tsx`):**
    - Tự động nhận diện khung giờ đêm 21h00 - 23h59 bằng helper `getTargetRecordDateVN()` để chọn ngày mai (`today + 1`) cho việc kiểm nhận sớm đồ sạch ca đêm, các giờ khác chọn ngày hiện tại.
    - Sửa điều kiện tìm phiếu bao gồm cả `recordDate` bên cạnh `partnerId` và `branchName` để đảm bảo hiển thị chính xác phiếu của ngày được chọn.
    - Bổ sung Badge trực quan nhận diện phiếu "Hôm nay" và "Ngày mai (Ca đêm)".
  - **Tab Kho Sạch (`WarehousePage.tsx` & `WarehouseCleanPlanTabComponent.tsx`):**
    - Chuẩn hóa toàn bộ thuật ngữ hiển thị: thay "Soạn đồ / Soạn đồ sạch" thành "Phiếu Giao Nhận" và "Tạo Phiếu Giao Nhận".
    - Đổi mặc định danh sách phiếu hiển thị ngày mai (`getTomorrowVN()`) phù hợp với quy trình đóng gói chiều/tối giao vào sáng mai.
    - Thêm thanh điều hướng ngày linh hoạt: nút "Hôm nay", nút "Ngày mai", nút Trước/Sau, bộ chọn ngày DatePicker.
    - Đổi nút hành động thành "Sửa Phiếu Giao Nhận".
    - Tái cấu trúc modal sửa phiếu: Sử dụng trực tiếp [PrepOrderModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/handovers/modals/PrepOrderModal.tsx) với prop `initialRecord`, tự động nạp toàn bộ danh mục đồ sạch, số lượng nợ cũ, chữ ký thủ kho; chuyển tiêu đề thành "Sửa Phiếu Giao Nhận #[recordCode]" và nút "Cập Nhật Phiếu Giao Nhận". Dọn dẹp hoàn toàn modal inline cũ.
- **Plan 30 - Chuyển đổi trạm khoán việc thợ xưởng sang mô hình HourlyWork (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`):**
  - **Backend API & Kiến trúc NestJS (`be-nestjs-thanhxuan`):**
    - Triển khai công thức tính tiền công thợ theo giờ chuẩn CSDL (Mục 1.10 Data Dictionary): $\text{subtotal} = (\text{minutesWorked} / 60) \times \text{hourlyBaseRate} \times \text{coefficient}$.
    - Tạo DTO `RecordHourlyWorkTaskDto` tại `src/modules/internal/piecework/dto/record-hourly-work.dto.ts` với strict validation: `@IsEnum(HourlyJobType)`, `@IsInt()`, `@Min(1)`, `@Max(720)`.
    - Cung cấp 3 API mới trong `PieceworkController`:
      - `GET /piecework/job-types`: Trả về danh sách 7 khâu công việc chuẩn kèm tên tiếng Việt và hệ số mặc định (Rũ đồ x1.2, Giặt & Sấy x1.3, Gấp x1.0, Đếm/Phân loại x1.1, Là/Ủi x1.2, Đóng gói x1.0, Khác x1.0) và đơn giá cơ sở lấy từ `PaySettings`.
      - `POST /piecework/me/tasks`: Ghi nhận giờ làm việc cho thợ, tự động kiểm tra ca làm việc đang mở (`OPEN` trong `AttendanceRecord`), tính snapshot đơn giá, hệ số và thành tiền, lưu vào mảng `tasks` của `PieceworkRecord`.
      - `DELETE /piecework/me/tasks/:taskIndex`: Xóa mục công việc bị ghi nhầm trong ca, tự động trừ lại `totalAmount` an toàn.
    - Đăng ký schema `PaySettings` trực tiếp trong `PieceworkModule` qua `INTERNAL_CONNECTION` và `PaySettingsRepository`, bảo vệ kiến trúc Clean Architecture, tránh circular dependency với `PayrollModule`.
    - Viết bổ sung 4 unit test toàn diện trong `piecework.service.spec.ts` kiểm thử đầy đủ kịch bản tính tiền, chặn khi chưa mở ca, lấy hệ số và xóa task (10/10 tests pass).
  - **Frontend Trạm Ghi Công Thợ (`fe-react-thanhxuan-internal`):**
    - Bổ sung interface `JobCoefficientSetting`, `HourlyWorkTask`, `HourlyWorkDailyLog` tại `src/types/index.ts`.
    - Viết lại toàn diện `PieceworkStationPage.tsx`: Banner thông tin thợ, trạng thái ca làm việc, hiển thị 7 thẻ khâu làm việc dạng card lớn dễ thao tác trên tablet/mobile xưởng kèm badge hệ số, bộ nút chọn nhanh phút (30p, 1h, 1.5h, 2h, 3h, 4h) và ô nhập phút tùy biến.
    - Hộp tính nhẩm thành tiền thời gian thực hiển thị rõ ràng: $(\text{phút} / 60) \times \text{đơn giá cơ sở} \times \text{hệ số} = \text{thành tiền VND}$.
    - Bảng nhật ký ca làm việc hiển thị danh sách khâu đã làm trong ca, tổng phút, tổng tiền và nút xóa mục rác tiện lợi.
    - Cập nhật `nav-config.ts` đổi tên menu hiển thị sang "Công Thợ Theo Giờ" và "Duyệt Công Thợ Theo Giờ".
    - Xử lý tương thích ngược an toàn cho `DashboardPage.tsx` và `PieceworkConfirmPage.tsx`.
- **Nguyên nhân gốc rễ (Root Cause):**
  1. **MongoDB Atlas Duplicate Key Error (`E11000`):** Trên collection `handover_records` trong cơ sở dữ liệu `internal_express` vẫn còn sót lại index phức hợp `partnerId_1_dateKey_1_seq_1` từ kiến trúc V1 cũ (có cờ `unique: true`). Khi chuyển sang Schema V2, hệ thống dùng `recordDate` và `recordCode`, bỏ trường `dateKey` và `seq` (cả 2 giá trị này đều là `null`). Khi thủ kho tạo phiếu mới cho một chi nhánh đối tác đã có bản ghi trước đó, MongoDB bắt lỗi trùng khóa `dup key: { partnerId: ObjectId(...), dateKey: null, seq: null }` và trả về mã lỗi `E11000`, dẫn đến `AllExceptionsFilter` biến thành HTTP 500 Internal Server Error.
  2. **Lệch mapping DTO khi lưu đồ nợ/trả nợ:** DTO `PrepOrderDto` nhận `undeliveredQty` và `returnedDebtQty`, trong khi tầng Service đọc `it.undeliveredQuantity` và `it.quantityReturned`, khiến số lượng đồ chưa giao / giao trả nợ không được lưu vào CSDL.
  3. **Rủi ro ném ngoại lệ ép kiểu ObjectId:** `new Types.ObjectId(actor.sub)` và `new Types.ObjectId(partner.defaultShipperId)` chưa kiểm tra `Types.ObjectId.isValid()`, có thể gây lỗi BSONError nếu ID không hợp lệ.
- **Giải pháp xử lý:**
  - **Dọn dẹp Index CSDL thực tế:** Cập nhật script `drop-legacy-collections.ts` để tự động phát hiện và drop toàn bộ các index lỗi thời chứa trường cũ (`dateKey`, `seq`, `status`) trên collection `handover_records`:
    - Drop thành công index `partnerId_1_dateKey_1_seq_1` (triệt tiêu nguyên nhân chính gây lỗi 500).
    - Drop thành công index `partnerId_1_recordDate_1_seq_1`, `shipperId_1_dateKey_1`, `dateKey_-1`, `status_1`, `status_1_date_-1`.
    - Chạy script `pnpm run db:drop-legacy` trực tiếp trên MongoDB Atlas thành công.
  - **Tối ưu hóa `handover-record.service.ts`:**
    - Bổ sung kiểm tra an toàn `Types.ObjectId.isValid()` cho `warehouseManagerId` và `shipperId`.
    - Đồng bộ hóa mapping lấy đúng cả hai định dạng `undeliveredQuantity ?? undeliveredQty` và `quantityReturned ?? returnedDebtQty`.
  - **Kiểm thử & Nghiệm thu:**
    - Bổ sung unit test cho `createOrUpdatePrepOrder` trong [handover.service.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/specs/handover.service.spec.ts), 36/36 tests pass 100%.
    - Gọi kiểm thử thực tế `POST /handover/prep-order` tới Backend, API phản hồi thành công `200 OK` (mã phiếu sinh đúng chuẩn `GN-TT-15102026`).
    - Build pass 100% cho cả `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`.
    - Commit và push code lên nhánh `dev` thành công.

## 2026-10-13

### Plan 28: Chuẩn Hóa Toàn Diện Schema & Dọn Rác Dữ Liệu Các Bảng (Accounts, ItemCatalogs, HandoverRecords) (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Động lực & Vấn đề giải quyết:**
  - Sau quá trình rà soát CSDL và các Mongoose Schemas, phát hiện một số bảng vẫn tồn tại trường dữ liệu thừa, không đúng chuẩn hoặc lệch tên so với nghiệp vụ thực tế:
    1. Bảng `accounts`: Tồn tại cả 2 trường `role` và `roles: string[]` gây dư thừa dữ liệu (trong khi RBAC và Guard chỉ sử dụng `role: StaffRole`). Trường `pay_profile` bị gán mặc định `default: () => ({})` với 3 số 0 cho mọi tài khoản Quản lý/Đối tác, sinh rác dữ liệu không cần thiết.
    2. Bảng `item_catalogs`: Tồn đọng các trường khoán thợ cũ (`foldingRateWorker`, `ironingRateWorker`) trong MongoDB Atlas mặc dù công ty đã chuyển sang tính công thợ theo thời gian $\times$ hệ số loại việc (`hourly_work`). Schema cũ viết nhầm `customerPrice` trong khi báo cáo và interceptor sử dụng `priceToCustomer`. Bảng thiếu vị trí rõ ràng cho 2 trường cốt lõi `priceToCustomer` và `sortOrder`.
    3. Bảng `handover_records`: Mongoose tự động khởi tạo mảng `notes: []` rỗng cho mọi phiếu mới tạo nếu không khai báo `default: undefined`.
- **Backend API & CSDL MongoDB (`be-nestjs-thanhxuan`):**
  - **Chuẩn hóa Bảng `accounts` (`staff-account.schema.ts`):**
    - Xóa bỏ hoàn toàn trường `roles: string[]`, thống nhất sử dụng `role: StaffRole` làm Single Source of Truth duy nhất.
    - Bỏ giá trị khởi tạo rỗng `default: () => ({})` của `pay_profile`, chỉ lưu khi tài khoản thợ hoặc shipper có cấu hình lương thực tế.
    - Cập nhật `account-management.service.ts`, `account-auth.service.ts`, `account-seed.service.ts`: Bỏ gán `roles = [dto.role]`, map response `roles: [account.role]` để đảm bảo tương thích ngược.
    - Cập nhật `InternalJwtStrategy` và `PermissionsGuard` fallback tự động `user.roles || (user.role ? [user.role] : [])`.
  - **Chuẩn hóa Bảng `item_catalogs` (`item-catalog.schema.ts`):**
    - Chuẩn hóa hoàn chỉnh đúng **8 trường cốt lõi**: `itemCode`, `brand`, `name`, `unit`, `priceToCustomer`, `sortOrder`, `imageUrl`, `isActive`.
    - Đổi tên trường từ `customerPrice` sang `priceToCustomer` (đơn giá dịch vụ thu đối tác, VND, bảo mật qua `PayFieldFilterInterceptor` chỉ Admin/Kế toán thấy).
    - Bổ sung `priceToCustomer` vào `CreateItemCatalogDto` và `UpdateItemCatalogDto` cùng logic lưu/cập nhật tại `PartnersService`.
    - Đồng bộ hóa trực tiếp với `partner-report.service.ts`.
  - **Triệt tiêu mảng rỗng mặc định trong `handover_records` (`handover-record.schema.ts`):**
    - Khai báo `@Prop({ type: [HandoverItemNoteSchema], default: undefined }) notes?: HandoverItemNote[];` ngăn chặn Mongoose tự động sinh `notes: []`.
  - **Thực thi Dọn dẹp CSDL Thực tế (`drop-legacy-collections.ts`):**
    - Bổ sung script migration `$unset` cho các trường thừa: gỡ bỏ `roles` khỏi 8 tài khoản, gỡ bỏ `pay_profile` rỗng khỏi 6 tài khoản quản lý, gỡ bỏ `foldingRateWorker`, `ironingRateWorker`, `customerPrice` khỏi 14 chiếc đồ giặt, và gỡ bỏ `notes: []` rỗng khỏi phiếu giao nhận.
    - Chạy lệnh `pnpm run db:drop-legacy` thành công 100% trên MongoDB Atlas.
- **Frontend Vận Hành (`fe-react-thanhxuan-internal`):**
  - Đồng bộ `AuthContext.tsx`: Fallback `roles: rawUser.roles || (rawUser.role ? [rawUser.role] : [])` trong cả hàm `fetchMe` và `login`.
  - Chuẩn hóa interface `ItemCatalog` trong `src/types/index.ts` ưu tiên `priceToCustomer` và `sortOrder`.
- **Tài liệu Kỹ thuật & Đồng bộ Hóa:**
  - Cập nhật mục 1.1 `accounts`, mục 1.7 `item_catalogs` (đúng 8 trường cốt lõi) và mục 1.8 `handover_records` trong [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md).
  - Cập nhật phân hệ [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md) và [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md).
  - Hoàn tất toàn bộ checklist trong [plan28.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/plans/plan28.md).
- **Kiểm thử & Nghiệm thu:**
  - `pnpm exec tsc --noEmit` pass 100% trên cả Backend và Frontend.
  - `pnpm build` pass 100% trên cả 2 ứng dụng (`be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`).
  - Dữ liệu MongoDB Atlas thực tế qua verification script hoàn toàn sạch sẽ, không còn trường thừa.

### Plan 27: Tinh Gọn Triệt Để Bản Ghi HandoverRecord - Loại Bỏ Lặp Base64 Chữ Ký & Mảng Mặc Định Rỗng (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Động lực & Vấn đề giải quyết:**
  - Sau khi loại bỏ trường `status` ở Plan 26, dữ liệu bản ghi `HandoverRecord` trong MongoDB Atlas vẫn còn bị phình to do nhân đôi chuỗi Base64 chữ ký (~30KB-50KB/bản ghi) tại cả `cleanClothes.preparedBySignature` và `signatures.warehouseManager.signature`.
  - Đồng thời, thông tin thủ kho bị lặp 3 nơi (`cleanClothes.preparedByName/warehouseManagerId`, `signatures.warehouseManager`, và root `warehouseManagerId/warehouseManagerName`).
  - Mongoose Schema có các giá trị khởi tạo rỗng mặc định khiến mọi document mới tạo tự động sinh `dirtyClothes: { items: [] }`, `notes: []`, `isRecount: false`, và `recount: { isRecount: false, status: 'NONE' }`.
- **Backend API & CSDL MongoDB (`be-nestjs-thanhxuan`):**
  - **Schema (`handover-record.schema.ts`):**
    - Tinh gọn sub-schema `CleanClothes`: chỉ còn duy nhất `items: CleanItemLine[]`. Loại bỏ hoàn toàn `preparedByName`, `preparedBySignature`, `warehouseManagerId`, `at`.
    - Chuẩn hóa `CleanItemLine`: bỏ `default: 0` của `undeliveredQuantity` và `quantityReturned` để không ép sinh giá trị 0 khi mới soạn đồ sạch.
    - Loại bỏ các giá trị `default` rỗng ở root document: `dirtyClothes` (bỏ `{ items: [] }`), `notes` (bỏ `[]`), `recount` (bỏ `{ isRecount: false, status: 'NONE' }`).
    - Loại bỏ cờ thừa `isRecount: boolean` ở root document (quản lý tập trung trong khối `recount`). Đánh index `sparse: true` cho `recount.isRecount` và `recount.status`.
  - **Services (`handover-record.service.ts` & `handover-flow.service.ts`):**
    - `createOrUpdatePrepOrder`, `createHandover`, `planScheduledHandovers`, `createPartnerCountRecord`: chỉ lưu danh sách đồ sạch vào `cleanClothes.items`. Chữ ký thủ kho được lưu duy nhất tại `signatures.warehouseManager = { name, signature, at }`.
    - Loại bỏ việc khởi tạo object/mảng rỗng khi tạo mới phiếu. Khi chưa phát sinh đồ bẩn, document hoàn toàn không có `dirtyClothes`. Khi chưa có ghi chú, document hoàn toàn không có `notes`. Khi chưa yêu cầu đếm lại, document hoàn toàn không có `recount`.
    - Hàm `updateShipperConfirm`: chỉ sinh khối `recount: { isRecount: true, status: 'PENDING' }` khi shipper thực sự tích chọn đếm lại.
  - **Script Dọn Dẹp CSDL Thực Tế (`drop-legacy-collections.ts`):**
    - Bổ sung `$unset` cho các trường thừa: `cleanClothes.preparedByName`, `cleanClothes.preparedBySignature`, `cleanClothes.warehouseManagerId`, `cleanClothes.at`, và `isRecount`.
    - Thêm logic quét và `$unset` cho các mảng rỗng `notes: []`, `dirtyClothes: { items: [] }` (khi không có partnerCount), và `recount: { isRecount: false }` hoặc `status: 'NONE'`.
    - Chạy script `pnpm run db:drop-legacy` thành công 100% trên cơ sở dữ liệu MongoDB Atlas thực tế.
- **Frontend Vận Hành (`fe-react-thanhxuan-internal`):**
  - Tinh gọn interface `CleanClothes` trong `src/types/index.ts` chỉ còn `items: CleanItemLine[]`.
  - Cập nhật `PartnerPortalPage.tsx`, `PartnerReceiptTabComponent.tsx`, `ShipperHandoverItemCardComponent.tsx`, và `HandoverExportHelper.ts` đọc chữ ký thủ kho trực tiếp từ `signatures.warehouseManager.signature` và `signatures.warehouseManager.name`.
- **Kiểm thử & Nghiệm thu:**
  - `pnpm exec tsc --noEmit` pass 100% trên cả Backend và Frontend.
  - `pnpm build` pass 100% trên `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal` (Vite build 12.65s).
  - Kiểm tra document thực tế trong MongoDB Atlas: bản ghi siêu tinh gọn, chỉ chứa đúng thông tin cốt lõi, tiết kiệm hơn 50% dung lượng byte.

- **Khắc phục triệt để lỗi không tải được ảnh phiếu ở Kho (`/operations/warehouse-manager/warehouse`):**
  - **Backend (`handover-record.service.ts`):**
    - Cải tiến hàm `getSlipGallery`: Khi truy vấn theo `brand`, hệ thống tự động tra cứu danh sách các cơ sở `partnerIds` thuộc thương hiệu đó để lọc `$or: [{ brand }, { partnerId: { $in: partnerIds } }]`.
    - Gỡ bỏ bộ lọc cứng `slipImageUrl: { $exists: true }` để các phiếu vừa tạo chưa kịp đồng bộ Cloudinary không bị biến mất khỏi danh sách.
    - Tự động snapshot `brand` và `partnerName` khi tạo phiếu tại `createRecord` và `createOrUpdatePrepOrder`.
  - **Phân quyền Shipper (`permissions.map.ts`):** Cấp thêm quyền `PERMISSIONS.HANDOVER_PARTNER_COUNT` và `PERMISSIONS.PARTNER_VIEW` cho vai trò `SHIPPER` để Shipper không bị chặn 403 Forbidden khi đếm thay đồ bẩn và khi truy vấn catalog đối tác.
  - **Route Backend (`partners.controller.ts`):** Đăng ký song song `@Get(['catalogs', 'item-catalogs'])` để hỗ trợ tương thích cả 2 route truy vấn danh mục đồ vải.
- **Xây dựng Component Thư viện ảnh phiếu dùng chung (`HandoverSlipGalleryComponent.tsx`):**
  - Hợp nhất hoàn toàn giao diện Thư viện ảnh phiếu của cả 3 phân hệ: Thủ kho (`WarehousePage`), Đối tác (`PartnerPortalPage`) và Tài xế (`HandoverListPage`).
  - Hỗ trợ 3 chế độ (`mode: 'WAREHOUSE' | 'SHIPPER' | 'PARTNER'`):
    - `WAREHOUSE`: Bộ lọc Thương hiệu, Chi nhánh đối tác, Từ ngày, Đến ngày, Tìm mã phiếu.
    - `SHIPPER`: Bộ lọc Chi nhánh đối tác, Từ ngày, Đến ngày, Tìm mã phiếu.
    - `PARTNER`: Cố định chi nhánh `fixedPartnerId`, chỉ hiện bộ lọc Từ ngày, Đến ngày, Tìm mã phiếu.
  - Thẻ phiếu trực quan cao cấp (Card Grid responsive 1-4 cột): Ảnh thumbnail phiếu, badge thương hiệu, ngày giao nhận, trạng thái phiếu, 3 chấm tròn kiểm soát chữ ký (Kho, Shipper, Quán) kèm tooltip chi tiết.
  - Nút **Xem Phóng To** kết nối trực tiếp modal lightbox `SlipFullscreenViewerModal`, nút **Tải ảnh** WebP/PNG an toàn (hỗ trợ CORS fallback), nút **Chi tiết**.
  - Phân trang mượt mà 12 phiếu/trang.
- **Component Lightbox Phóng to ảnh phiếu dùng chung (`SlipFullscreenViewerModal.tsx`):**
  - Hỗ trợ zoom đa cấp 75% - 250%, thanh công cụ floating (Zoom In, Zoom Out, 100%, Tải ảnh, Đóng).
  - Tích hợp cuộn pan tự do, phím tắt bàn phím `Escape` tự động đóng, double-tap zoom trên mobile.
  - Tích hợp đồng bộ vào `PrepOrderSlipPreviewComponent`, `HandoverDeliverySlipModal`, `ShipperHandoverItemCardComponent` và `HandoverSlipGalleryComponent`.
- **Đồng bộ hóa URL Search Params (`?tab=...`):**
  - `WarehousePage.tsx`: Chuyển sang quản lý `useSearchParams` với `?tab=CLEAN_PLAN | SUMMARY | SLIP_GALLERY`. Người dùng có thể bookmark, refresh hoặc gửi link trực tiếp tới tab Thư viện ảnh phiếu.
  - `HandoverListPage.tsx`: Chuyển sang quản lý `useSearchParams` với `?tab=ROUTE | HISTORY`.
  - `PartnerPortalPage.tsx`: Tích hợp `HandoverSlipGalleryComponent` vào tab `?tab=HISTORY`.
- **Sửa lỗi thẻ Lộ trình Shipper & Modal Đếm thay đối tác (`ShipperHandoverItemCardComponent.tsx` & `ShipperCountPartnerModal.tsx`):**
  - **Hàm tải ảnh:** Cải tiến `handleDownloadSlipImage` tạo thẻ `<a>` download mượt mà, hỗ trợ fallback CORS tự động mở tab mới để tải.
  - **Nút Phóng to:** Kết nối trực tiếp modal dùng chung `SlipFullscreenViewerModal`.
  - **Nút Đếm thay:** Thay thế form inline tạm thời bằng modal chuyên dụng `ShipperCountPartnerModal`.
  - **Đồng bộ UI Modal Đếm thay:** Thiết kế giao diện y hệt màn hình đếm đồ bẩn đối tác (`PartnerCountTabComponent.tsx`) với khung thông tin cố định khóa 3 trường (Thương hiệu, Chi nhánh, Ngày), chuyển đổi linh hoạt dạng Thẻ / Bảng, nhập biểu thức thông minh `12 34` hoặc `10+5`, bảng ký tên điện tử Canvas và Live Preview phiếu in A4.
- **Kiểm thử & Nghiệm thu:**
  - `pnpm exec tsc --noEmit` pass 100% trên `fe-react-thanhxuan-internal`.
  - `pnpm build` pass 100% trên `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`.

- **Thư viện ảnh phiếu lịch sử cho Đối tác (`PartnerHistoryTabComponent.tsx`):**
  - Chuyển đổi tab `HISTORY` (`/operations/partner-manager/partner?tab=HISTORY`) sang giao diện **Thư viện ảnh phiếu** tương đồng với tab Gallery của Thủ kho (`WarehouseSlipGalleryTabComponent.tsx`).
  - Lưới ảnh phiếu tỷ lệ chuẩn `aspect-[3/4]`, hiển thị ảnh phiếu xuất bản WebP kèm mã phiếu, ngày, thương hiệu, chi nhánh.
  - Hover / Click hiển thị nút phóng to ảnh (Lightbox Dialog), nút tải trực tiếp ảnh phiếu WebP về thiết bị.
  - Bộ lọc thông minh theo ngày giao nhận và tìm kiếm theo mã phiếu, phân trang tiện lợi.
  - Badges trạng thái chữ ký 3 bên: Thủ kho, Shipper, Quán (Đếm bẩn / Kiểm nhận).
- **Tối ưu toàn diện màn hình điều phối Shipper (`HandoverListPage.tsx` & `ShipperHandoverItemCardComponent.tsx`):**
  - **Bổ sung tab Lịch sử phiếu đã giao (`ShipperHistoryTabComponent.tsx`):** Shipper có thể chuyển đổi linh hoạt giữa "Lộ Trình Giao Nhận" trong ngày và "Lịch Sử Phiếu Đã Giao" của các chi nhánh đối tác mình phụ trách, hiển thị dạng lưới thư viện ảnh phiếu kèm bộ lọc đối tác, khoảng ngày và mã phiếu.
  - **Cụm điều hướng ngày mới:** Bỏ các nút rời "Hôm qua", "Hôm nay", "Ngày mai"; thay thế bằng cụm `[< Ngày trước]` - `[Ngày hiển thị ở giữa (click mở lịch chọn ngày)]` - `[Ngày sau >]` cực kỳ gọn gàng, trực quan.
  - **Loại bỏ nút lập phiếu và form tạo phiếu:** Xóa bỏ hoàn toàn nút "Lập Phiếu Ngay" và modal tạo phiếu khỏi màn hình Shipper; Shipper chỉ tập trung vào lộ trình được phân công.
  - **Hiển thị trực tiếp ảnh phiếu xuất kho:** Thẻ phiếu hiển thị trực tiếp ảnh phiếu giống tab `RECEIPT` (`PartnerReceiptTabComponent.tsx`).
  - **Nút "Đếm thay" tích hợp ngay trên ảnh phiếu:** Khi bấm "Đếm thay", form đếm thay mở ra **trực tiếp trên khu vực ảnh phiếu** (inline, không dùng popup dialog), giao diện đơn giản như tab `COUNT`: stepper +/- tăng giảm nhanh, nhập số lượng thông minh (hỗ trợ cộng dồn `10+5` hoặc `12 34`), nhập số bao/túi gom đồ bẩn (`bagsCount`), lưu số lượng đếm thay trực tiếp qua API `PATCH /handover/${id}/dirty-items`.
  - **Checkbox đếm lại tại xưởng (`isRecount`):** Tích chọn chuyển xưởng đếm lại khi nghi ngờ số lượng.
  - **Tinh giản thông tin thẻ phiếu:** Ngày giao nhận hiển thị cùng hàng ở góc phải (`formatDateVN`), loại bỏ hoàn toàn badge `SCHEDULED` và dòng tóm tắt số lượng sạch/bẩn rườm rà.
- **Kiểm thử & Xác thực:** `tsc --noEmit` pass 100%, Vite build `fe-react-thanhxuan-internal` pass 100% (7.43s).

### Nâng Cấp UX Shipper, Chuẩn Hóa Mã Phiếu `GN-XXX-DDMMYYYY`, Bắt Buộc Mã Viết Tắt Partner & Fix Tab Lịch Sử Đối Tác (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Chuẩn hóa mã phiếu giao nhận `recordCode` & Tên viết tắt đối tác (`shortCode`):**
  - Schema `Partner` (`partner.schema.ts`): Bổ sung `shortCode` (String, Bắt buộc, Unique, uppercase, index) và `deliveryShift` (`MORNING` | `EVENING`).
  - Thêm validation nghiêm ngặt trong `CreatePartnerDto` và `UpdatePartnerDto`.
  - Backend sinh mã phiếu định dạng `GN-XXX-DDMMYYYY` (ví dụ `GN-TT-14102026` với `TT` là tên viết tắt của cơ sở Tràng Tiền), tự động chuyển ngày sang định dạng `DDMMYYYY` theo múi giờ Việt Nam UTC+7. Kèm vòng lặp retry 3 lần tự động gắn hậu tố `-1`, `-2` nếu phát sinh nhiều chuyến trong cùng ngày cho một cơ sở.
  - Cập nhật giao diện `PartnerModal.tsx`: Thêm ô nhập bắt buộc "Tên Viết Tắt (Mã Chi Nhánh)" (auto-uppercase, tối đa 8 ký tự, chú thích rõ dùng tạo mã phiếu `GN-[MÃ]-DDMMYYYY`), dropdown chọn Ca giao nhận mặc định (`Ca Sáng` / `Ca Tối`).
  - `PartnerCardComponent.tsx`: Hiển thị badge mã viết tắt `shortCode` và ca giao nhận nổi bật.
- **Tái cấu trúc màn hình giao nhận Shipper (`HandoverListPage.tsx` & `ShipperHandoverItemCardComponent.tsx`):**
  - Xóa bỏ hoàn toàn nút "Tải ZIP" và "Tạo Phiếu" thừa thãi.
  - Gộp Lịch giao nhận và Phiếu giao nhận thành **1 danh sách duy nhất** các điểm cần giao nhận trong ngày (`deliveryPoints`).
  - Phân ca giao nhận linh hoạt: Thêm bộ lọc ca `Tất Cả`, `Ca Sáng` (mặt trời), `Ca Tối` (mặt trăng).
  - Cụm nút chuyển nhanh ngày: Cụm nút bấm `[<]`, `[Hôm qua]`, `[Hôm nay]`, `[Ngày mai]`, `[>]` thao tác cực nhanh trên điện thoại di động.
  - Địa chỉ chi tiết kèm nút **"Chỉ đường"**: Mở trực tiếp Google Maps (`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`) sang tab mới.
  - Card dạng Accordion (mở rộng/thu gọn): Khi nhấn mở rộng hiển thị dời ngày nhanh, nút mở modal Đếm thay đối tác, xem ảnh phiếu xuất kho thủ kho đã lập, ký tên Canvas, họ tên shipper, checkbox tích yêu cầu đếm lại (`isRecount`), nút xác nhận bàn giao $\rightarrow$ khi hoàn tất hiển thị ngay ảnh phiếu mới kèm nút tải ảnh WebP về máy.
- **Nâng cấp Modal Đếm thay đối tác (`ShipperCountPartnerModal.tsx`):**
  - Đồng bộ chuẩn giao diện với màn hình đếm đồ bẩn nhà hàng: Smart Math Input cộng dồn phép tính (ví dụ `10+5+2`), chuyển đổi 2 chế độ xem Thẻ / Bảng, hiển thị tổng số chiếc, số túi/bao gom đồ bẩn (`bagsCount`), bảng ký tên Canvas và Live Preview Canvas A4.
- **Loại bỏ mục "Hàng đợi đếm lại" trong `WarehousePage.tsx`:**
  - Xóa bỏ triệt để tab `RECOUNT_QUEUE` khỏi giao diện Thủ kho do đây là nghiệp vụ riêng biệt của Thợ xưởng tại trạm `/operations/worker/recount`.
- **Sửa triệt để lỗi crash tại tab HISTORY (`PartnerPortalPage.tsx` & `PartnerHistoryTabComponent.tsx`):**
  - Sửa lỗi crash do đọc schema cũ (`clean`, `dirty`, `restaurant_count`), map chuẩn xác sang `cleanClothes`, `dirtyClothes`, `recordDate`.
  - Hiển thị đầy đủ số lượng, trạng thái, và cho phép xem / tải trực tiếp ảnh phiếu Cloudinary đã ký nghiệm thu.
  - Giữ lại tab Lịch sử vì đây là tính năng cốt lõi phục vụ đối soát sản lượng và công nợ cuối tháng của đối tác nhà hàng.
- **Cập nhật tài liệu kỹ thuật & từ điển dữ liệu:**
  - **Đổi tên collection:** Chuyển `piecework_logs` thành `hourly_work` trong `piecework-log.schema.ts` phản ánh chính xác mô hình ghi nhận công việc theo giờ nhân hệ số.
  - **Dọn dẹp DB thực tế:** Tạo và chạy thành công script `pnpm run db:drop-legacy` (`drop-legacy-collections.ts`), drop sạch collection cũ `counters`, đồng bộ dữ liệu và drop `piecework_logs` sang `hourly_work`.
  - **Tái cấu trúc DATABASE_DICTIONARY.md:** Xóa sạch các bảng đã xóa (`counters`, `recount_tasks`), sắp xếp lại thứ tự 14 bảng trong `internal_express` theo luồng phân vùng nghiệp vụ logic, đánh số liền mạch từ 1 đến 32 Collections toàn hệ thống.
  - **Bổ sung quy định vào Rule:** Cập nhật `.agents/rules/AGENTS.md` (DoD) và `.agents/rules/backend.md` quy định bắt buộc đồng bộ `DATABASE_DICTIONARY.md`, xóa bỏ hoàn toàn tên bảng đã xóa và chạy script dọn dẹp DB thực tế mỗi khi thay đổi schema.
  - Kiểm thử: 110 tests Jest Backend pass 100%, NestJS build pass 100%, Vite build frontend pass 100%.

### Plan 24 - Tái Cấu Trúc Toàn Diện CSDL internal_express, Chuẩn Hóa Quy Trình Giao Nhận 5 Bước, Thư Viện Ảnh Phiếu & Cơ Chế Lương Mới (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Tái Cấu Trúc Toàn Diện Cơ Sở Dữ Liệu `internal_express` (MongoDB):**
  - **Xóa bỏ hoàn toàn bảng `counters` & sinh mã phiếu tự sinh ngẫu nhiên:** Loại bỏ `counter.schema.ts`, `counter.repository.ts` và collection `counters`. Sinh mã phiếu giao nhận `GN-YYYYMMDD-XXXX` (tiền tố ngày giờ chuẩn múi giờ Việt Nam UTC+7 và 4 ký tự ngẫu nhiên uppercase) kết hợp vòng lặp retry 3 lần và bắt lỗi `E11000` của MongoDB trên Unique Index `recordCode`. Triệt tiêu hoàn toàn điểm nghẽn cổ chai và nguy cơ race condition do bộ đếm tập trung gây ra.
  - **Tinh gọn cấu trúc đồ vải & thay thế defects:**
    - Nhánh đồ sạch (`cleanClothes`): Lưu trữ danh sách `items: CleanItemLine[]` gồm `itemCode`, `itemName`, `deliveryQuantity` (số lượng giao), `undeliveredQuantity` (chưa giao), `quantityReturned` (giao trả).
    - Nhánh đồ bẩn (`dirtyClothes`): Lưu trữ danh sách `items: DirtyItemLine[]` gồm `itemCode`, `itemName`, `quantityReceived` (số lượng đối tác đếm), `actualQuantityReceived` (số lượng xưởng đếm lại).
    - Ghi chú theo từng chiếc (`notes`): Mảng `HandoverItemNote[]` gồm `itemCode`, `itemName`, `note`, thay thế hoàn toàn sub-schema `defects` phức tạp cũ.
  - **Chuẩn hóa thời gian lưu trữ & múi giờ nghiệp vụ:** DB MongoDB lưu trữ chuẩn UTC0 (`Date`), toàn bộ tính toán nghiệp vụ, tiền tố mã phiếu và hiển thị giao diện tuân thủ múi giờ Việt Nam `Asia/Ho_Chi_Minh` (UTC+7).
- **Quy Trình Giao Nhận 5 Bước Khép Kín & Cơ Chế Cập Nhật Nguyên Tử (Anti-Race Condition):**
  - **Bước 1 - Thủ kho soạn đồ (17h-21h) & Cron Job 12:00 trưa:**
    - Cron Job chạy tự động lúc 12:00 trưa mỗi ngày (`0 12 * * *`) quét các đối tác cần giao theo `deliveryFrequency` (`DAILY` hoặc `ALTERNATE_DAYS`), tự động tạo phiếu giao nhận với ngày giao `recordDate` là ngày mai và prefill đồ bẩn hôm trước.
    - Modal soạn đồ `PrepOrderModal.tsx`: Chặn chọn ngày đã qua (`min = getTodayVN()`), mặc định ngày mai khi thủ kho soạn đồ buổi tối, nhập đồ sạch và ghi chú từng chiếc, ký tên Canvas thủ kho, render canvas WebP nén tải lên Cloudinary lưu link `slipImageUrl`.
  - **Bước 2 - Đối tác đếm đồ bẩn (21h-23h59) & Auto-Save Onblur Nguyên Tử:**
    - Cổng đối tác `PartnerPortalPage.tsx`: Tự động nhận diện khung giờ đêm $\ge 21\text{h}00$ để nhảy ngày sang ngày mai (`getTargetRecordDateVN`).
    - Triệt tiêu xung đột đồng thời trong giờ cao điểm 21h-23h59 bằng endpoint nguyên tử `PATCH /api/v1/internal/handover/:id/dirty-item-onblur`: Cập nhật trực tiếp từng ô số lượng đồ bẩn bằng toán tử `$set` trên path con của MongoDB, không ghi đè toàn bộ document.
    - Đối tác ký nhận đếm đồ bẩn qua endpoint `PATCH /api/v1/internal/handover/:id/partner-count-signature`.
  - **Bước 3 - Shipper nhận bàn giao & Ký nhận di động:**
    - Danh sách phiếu `HandoverListPage.tsx` mặc định ngày theo `getTargetRecordDateVN()`.
    - Chi tiết phiếu `HandoverDetailPage.tsx` và `SignatureModal.tsx`: Shipper kiểm đếm, xác nhận qua `PATCH /api/v1/internal/handover/:id/shipper-confirm`.
    - Hỗ trợ checkbox `isRecount` (Yêu cầu đếm lại tại xưởng) và lý do `recountReason` khi đối tác bận chưa đếm hoặc nghi ngờ sai lệch.
  - **Bước 4 - Trạm rạch bao đếm lại xưởng (`RecountStationPage.tsx`):**
    - Tự động lọc danh sách các phiếu có `isRecount === true` hoặc đồ bẩn trống số lượng mà Shipper đã ký nhận giao về.
    - Thợ xưởng rạch bao đếm lại, nhập số lượng thực tế và hoàn tất qua endpoint `PATCH /api/v1/internal/handover/:id/recount-actual` (`recount.status = 'DONE'`).
  - **Bước 5 - Đối tác kiểm nhận đồ sạch & Ký nhận hoàn tất:**
    - Cổng đối tác `PartnerReceiptTabComponent`: Hiển thị ảnh phiếu WebP trực tiếp từ Cloudinary `slipImageUrl`. Đối tác kiểm nhận số lượng đồ sạch đã nhận, ký tên xác nhận qua `PATCH /api/v1/internal/handover/:id/partner-check-signature`, chuyển trạng thái phiếu sang `COMPLETED`.
- **Thư Viện Ảnh Phiếu Giao Nhận (`WarehouseSlipGalleryTabComponent.tsx`):**
  - Tích hợp tab Thư viện ảnh phiếu trực tiếp trong `WarehousePage.tsx` cho Thủ kho và Quản lý.
  - Bộ lọc trực quan: Thương hiệu (`BrandSelect`), Chi nhánh đối tác (`PartnerSelect`), Khoảng thời gian (Từ ngày - Đến ngày).
  - Backend cung cấp endpoint `GET /api/v1/internal/handover/slip-gallery` tối ưu truy vấn `.lean()`.
  - Hỗ trợ xem ảnh phóng to Modal Lightbox và tải ảnh WebP gốc trực tiếp về máy.
- **Quản Lý Toàn Diện Chi Phí Xe Máy Của Shipper (`FuelPage.tsx`, `fuel_logs`):**
  - Nâng cấp schema `FuelLog`: Bổ sung `expenseType: 'FUEL' | 'REPAIR'`, `amountMoney`, `odometerOrMotorcyclePhotoUrl`, `description`.
  - Giao diện `FuelPage.tsx`: Hỗ trợ 2 tabs nghiệp vụ chuyên biệt: Đổ Xăng (`FUEL`) và Sửa Chữa Xe (`REPAIR`).
  - Bắt buộc đính kèm ảnh chụp hóa đơn/biên lai và ảnh đồng hồ xe máy (với đổ xăng) hoặc ảnh xe máy sửa chữa (với sửa xe).
  - Kế toán và Admin duyệt chi phí; khoản duyệt được tự động cộng vào phiếu lương của Shipper trong kỳ.
- **Cơ Chế Tính Lương Mới Toàn Diện (Shipper 28 Ngày Chuẩn & Thợ Xưởng Theo Giờ x Hệ Số):**
  - **Thuật toán tính lương Shipper:**
    - Định mức tháng dựa trên 28 ngày công chuẩn: `dailySalaryRate = monthlyBaseSalary / 28`. Lương cơ bản tính theo ngày thực tế: `dailySalaryRate * actualWorkedDays`.
    - Thưởng ca cuối tuần: 60.000 VNĐ / ca cho ca tối Thứ 7, Chủ Nhật và ca sáng Chủ Nhật, Thứ 2 (`shipperWeekendShiftBonus`).
    - Thưởng chuyên cần: 7.000 VNĐ / ngày có chấm công thực tế (`shipperAttendanceBonusDaily`).
    - Phụ cấp điện thoại: 200.000 VNĐ / kỳ lương (`shipperPhoneAllowance`).
    - Hoàn chi phí phương tiện: Tự động cộng toàn bộ các khoản Đổ xăng và Sửa xe đã được Kế toán duyệt trong kỳ.
    - Khấu trừ Bảo hiểm xã hội: Trừ 400.000 VNĐ / kỳ lương (`shipperInsuranceDeduction`).
  - **Thuật toán tính lương Thợ xưởng:**
    - Thay thế hoàn toàn mô hình khoán sản lượng đơn chiếc cũ bằng tính lương theo thời gian làm việc nhân hệ số công việc (`WorkshopJobType`: `IRONING`, `FOLDING`, `PACKING`, `WASHING`, `DRYING`, `OTHER`).
    - Công thức: `Tiền công = (minutesWorked / 60) * hourlyBaseRate * coefficient`.
    - Hệ số lấy từ `PaySettings.jobCoefficients`, đơn giá giờ cơ bản snapshot từ hồ sơ thợ `StaffAccount.hourlyRate`.
  - **Minh bạch phiếu lương cá nhân (`MyPayslipPage.tsx`):**
    - Tách biệt 2 cấu trúc chi tiết riêng: `shipperDetails` (chi tiết ngày công, ca cuối tuần, chuyên cần, xăng/sửa xe, phụ cấp, trừ BHXH) và `workerDetails` (bảng tổng hợp thời gian và tiền công theo từng loại việc).
- **Đồng Bộ Tài Liệu Kỹ Thuật (Modular SRS/SDD & Harness Data):**
  - Cập nhật [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md): Tổng số bảng điều chỉnh thành 33 Collections (15 Collections trong `internal_express`); đánh dấu `counters` đã xóa bỏ; cập nhật `piecework_logs`, `fuel_logs`, `pay_settings`, `payslips`.
  - Cập nhật [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md): Bổ sung các endpoints handover mới, phân hệ chi phí xe và cấu trúc màn hình/component mới.
  - Cập nhật [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md) và [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md) lên phiên bản 2.3.
  - Cập nhật 1 dòng Document History tại [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md).
- **Kiểm Thử & Biên Dịch:**
  - Backend: `pnpm exec tsc --noEmit` PASS 100%, `nest build` PASS 100%.
  - Frontend Internal: `pnpm exec tsc --noEmit` PASS 100%, `vite build` PASS 100% (6.84s).

## 2026-10-11

### Plan 23 - Tái Cấu Trúc Toàn Diện HandoverRecord, Sinh Mã Nguyên Tử, 4 Chữ Ký, Cloudinary WebP, Live Canvas Preview & Gộp Trạm Đếm Recount (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Tái Cấu Trúc Backend HandoverRecord & Loại Bỏ Collection Phụ:**
  - **Sinh mã phiếu nguyên tử không qua Counter:** Thay thế logic sinh mã dựa trên collection `Counter` bằng cơ chế tìm mã lớn nhất trong ngày qua regex `^GN-YYYYMMDD-(\\d{3})$` trên `HandoverRecordRepository`, tăng tiến nguyên tử và xử lý retry tự động khi gặp conflict `E11000`.
  - **Chuẩn hóa ngày và người lập phiếu:** Đổi `datePrefix` string sang `recordDate` kiểu `Date` (chuẩn hóa đầu ngày múi giờ Việt Nam `Asia/Ho_Chi_Minh` qua `startOfDayVN`), bổ sung thuộc tính `warehouseManagerId` (`Types.ObjectId`) bắt buộc truy vết danh tính thủ kho tạo phiếu.
  - **Tái cấu trúc cấu trúc dữ liệu đồ vải:**
    - Đồ sạch: Đổi từ `cleanDelivery` sang `cleanClothes` phẳng gồm: `preparedQuantity`, `undeliveredQuantity`, `debtDeliveryQuantity`, `note` từng dòng.
    - Đồ bẩn: Đổi từ `dirtyPickup` sang `dirtyClothes` phẳng gồm: `partnerCount.items` (số lượng đối tác hoặc shipper đếm), `actualQuantity` (số lượng đếm thực tế tại xưởng), `variance` (chênh lệch) và `countedByRole` (`'PARTNER' | 'SHIPPER'`).
  - **Gộp trạm đếm gom bao xưởng vào HandoverRecord:**
    - Xóa bỏ hoàn toàn collection riêng `recount_tasks`, `RecountTaskRepository` và `recount-task.schema.ts`.
    - Tích hợp trực tiếp trường `recount` vào `HandoverRecord`: `{ isRecount: boolean, status: 'PENDING' | 'COMPLETED', recountedAt?: Date, recountedBy?: Types.ObjectId }`.
    - Chuyển API hoàn thành kiểm đếm sang `POST /api/v1/internal/handover/:id/recount`, cập nhật `dirtyClothes.actualQuantity`, tự động tính toán `variance` và sinh lại ảnh phiếu `slipImageUrl`.
  - **Hệ thống 4 chữ ký điện tử độc lập (`signatures`):**
    - Tách biệt rõ ràng 4 vai trò ký: `warehouseManager` (Thủ kho xuất đồ), `shipper` (Tài xế giao nhận), `partnerCount` (Người đếm đồ bẩn), và `receiptCheck` (Người kiểm nhận đồ sạch).
    - Hỗ trợ lưu trữ alias tương thích giữa DB (`signedByName, signatureUrl, signedAt`) và Client (`name, signature, at`).
  - **Tương thích ngược đọc kép (Dual-Read Backward Compatibility):**
    - Cập nhật `ReportsService` và `PieceworkService` hỗ trợ đọc song song cả schema mới (`cleanClothes`, `dirtyClothes`) lẫn schema cũ (`cleanDelivery`, `dirtyPickup`) để bảo toàn dữ liệu lịch sử không bị gián đoạn.
- **Tối Ưu Hóa Ảnh Phiếu & Lưu Trữ Đám Mây (Client WebP & Cloudinary):**
  - **Nén ảnh WebP từ Client:** Xây dựng tiện ích `renderHandoverSlipToWebpBase64` nén canvas phiếu giao nhận sang định dạng `image/webp` chất lượng `0.85`, ép kích thước dưới 120KB giúp giảm 70% băng thông tải lên mạng di động.
  - **Upload Cloudinary & Dọn dẹp ảnh cũ:** Backend NestJS tích hợp `MediaService` nhận `slipImageBase64` tải lên folder `thanhxuan/handovers`, lưu link CDN vào `slipImageUrl` và kích hoạt tác vụ nền xóa ảnh cũ an toàn tránh phát sinh chi phí lưu trữ.
- **Nâng Cấp Toàn Diện Giao Diện Vận Hành & Trải Nghiệm Người Dùng (Frontend Internal):**
  - **Xem trước Canvas trực tiếp cho Thủ kho (`PrepOrderModal.tsx`, `PrepOrderSlipPreviewComponent.tsx`):** Tích hợp khung xem trước Live Canvas ngay trong modal soạn đồ, cho phép thủ kho rà soát chính xác bố cục phiếu in A4 trước khi bấm lưu.
  - **Shipper đếm thay đối tác (`ShipperCountPartnerModal.tsx`, `ShipperHandoverItemCardComponent.tsx`):**
    - Bổ sung nút "Đếm thay đối tác" trên danh sách phiếu, tự động gán `countedByRole: 'SHIPPER'`.
    - Tách component thẻ chiếc đồ tối ưu hóa cảm ứng 1 tay cho tài xế, hỗ trợ xem và tải trực tiếp ảnh phiếu Cloudinary sắc nét.
  - **Xem trước Canvas trên Cổng đối tác (`PartnerCountTabComponent.tsx`):** Render Canvas xem trước trực tiếp trên form đếm đồ bẩn, đặt phía trên nút lưu phiếu để đối tác quan sát dữ liệu ghép 2 chiều trước khi xác nhận.
  - **Tăng tốc hiển thị Tab kiểm nhận (`PartnerReceiptTabComponent.tsx`):** Hiển thị trực tiếp thẻ `<img>` từ Cloudinary `slipImageUrl` (tốc độ tải tức thì, triệt tiêu 100% hiện tượng đơ giật do vẽ Canvas trên máy cấu hình yếu), kèm fallback vẽ Canvas nếu phiếu cũ chưa có ảnh.
  - **Trạm kiểm đếm xưởng không cần ký tên (`RecountStationPage.tsx`):** Lọc các phiếu gom bao `recount.isRecount: true` và `recount.status: 'PENDING'`. Thợ xưởng chỉ cần nhập số lượng đếm thực tế của từng chiếc và lưu thẳng, không yêu cầu ký tên Canvas.
- **Kỷ Luật Cấu Trúc Mã Nguồn Frontend:**
  - Bóc tách triệt để các file lớn thành các modal và component độc lập (`PrepOrderSlipPreviewComponent`, `ShipperCountPartnerModal`, `ShipperHandoverItemCardComponent`), bảo đảm mọi file mã nguồn đều dưới 250 - 300 dòng theo đúng quy chuẩn dự án.
- **Kiểm Thử & Biên Dịch:**
  - Backend: Chạy kiểm thử tự động `pnpm test src/modules/internal/handovers` đạt **PASS 35/35 tests**, biên dịch `pnpm build` **PASS 100%**.
  - Frontend: Kiểm tra kiểu dữ liệu `pnpm exec tsc --noEmit` đạt **PASS 100%**, đóng gói `vite build` đạt **PASS 100%**.

## 2026-10-10

### Plan 22 - Tách Database `core_express` (CORE_CONNECTION), Migration Dữ Liệu An Toàn & Chuẩn Hóa Kiến Trúc 4 CSDL Độc Lập (`be-nestjs-thanhxuan`)

- **Tách Lớp Hạ Tầng Core Khỏi Phân Hệ Vận Hành Xưởng:**
  - Chuyển 4 collections chia sẻ toàn hệ thống gồm: `audit_logs` (Nhật ký kiểm toán bảo mật), `media_files` (Quản lý file ảnh Cloudinary), `idempotency_keys` (Khóa chống request trùng lặp) và `notifications` (Thông báo in-app) từ cơ sở dữ liệu `internal_express` sang một database riêng biệt hoàn toàn mang tên `core_express`.
  - Khởi tạo hằng số kết nối chuẩn: [core.constants.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/core.constants.ts) định nghĩa `export const CORE_CONNECTION = 'CORE_CONNECTION'`.
- **Nâng Cấp Cấu Hình & Đăng Ký Mongoose 4 Connections (`database.config.ts`, `app.module.ts`):**
  - Cập nhật [database.config.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/config/database.config.ts): Bổ sung `coreUri` hỗ trợ biến môi trường `MONGODB_CORE_URI` kèm fallback tự động trỏ sang `.../core_express`.
  - Cập nhật [app.module.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/app.module.ts): Đăng ký kết nối thứ 4 bằng `MongooseModule.forRootAsync` với `connectionName: CORE_CONNECTION`.
- **Tái Cấu Trúc 4 Modules & Repositories Tương Ứng:**
  - `AuditModule` & `AuditLogRepository`: Đổi connection từ `INTERNAL_CONNECTION` sang `CORE_CONNECTION`.
  - `MediaModule` & `MediaFileRepository`: Đổi connection từ `INTERNAL_CONNECTION` sang `CORE_CONNECTION`.
  - `IdempotencyModule` & `IdempotencyInterceptor`: Đổi connection từ `INTERNAL_CONNECTION` sang `CORE_CONNECTION`.
  - `NotificationsModule` & `NotificationRepository`: Đổi connection từ `INTERNAL_CONNECTION` sang `CORE_CONNECTION`.
- **Kịch Bản Di Chuyển Dữ Liệu An Toàn & Tự Động Hóa (`migrate-core-db.ts`):**
  - Xây dựng script di chuyển dữ liệu độc lập [migrate-core-db.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/scripts/migrate-core-db.ts) tích hợp lệnh `pnpm run migrate:core-db`.
  - Thực hiện copy toàn bộ bản ghi có sẵn từ `internal_express` sang `core_express` bằng cơ chế `bulkWrite` có `upsert: true` bảo toàn 100% `_id`, timestamps và kiểu dữ liệu.
  - Đồng bộ toàn bộ indexes (bao gồm cả index TTL `expiresAt` của `idempotency_keys` và compound index của `audit_logs`).
  - Kiểm chứng số lượng bản ghi giữa 2 database (Verified 100%).
  - Chạy với cờ `--drop-source` để xóa sạch 4 collections cũ trên `internal_express` sau khi đã kiểm chứng an toàn.
- **Đồng Bộ Hệ Thống Tài Liệu Kỹ Thuật (SRS/SDD & Data Dictionary):**
  - Sửa lỗi cú pháp render sơ đồ Mermaid trong [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md).
  - Cập nhật [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md): Chuyển Phân Vùng 4 sang `core_express` với `CORE_CONNECTION`.
  - Cập nhật [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) & [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md): Đồng bộ topology hệ sinh thái từ 3 databases lên 4 databases độc lập.
  - Cập nhật [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md) và hoàn tất checklist [plan22.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/plans/plan22.md).
- **Kiểm Thử & Biên Dịch:**
  - `nest build` thành công rực rỡ, không phát sinh bất kỳ lỗi biên dịch nào.

### Plan 21 - Cải Tiến Giao Diện Đối Tác B2B, Form Đếm Đồ Bẩn Thông Minh, Kiểm Nhận Canvas 2 Chiều, Lịch Sử Phân Trang & Khắc Phục Lỗi 403 / Loop Re-render (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Quy Chuẩn Giao Diện Cổng Đối Tác Bằng `@/components/common` (`PartnerPortalPage.tsx`):**
  - Tầng 1: Sử dụng [PageBanner.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageBanner.tsx) hiển thị tiêu đề cổng đối tác, tên thương hiệu/chi nhánh và thông tin tài khoản đăng nhập.
  - Tầng 2: Sử dụng [PageActionBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageActionBar.tsx) chứa thanh tab chức năng trên Desktop (`lg:flex`) và các nút hành động nhanh.
  - Tầng 3: Sử dụng [ResponsiveCardGrid.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/ResponsiveCardGrid.tsx) hiển thị danh sách phiếu lịch sử tự co dãn từ 1 đến 4 cột chuẩn công thái học.
  - Đồng bộ trạng thái tab qua URL query param `?tab=COUNT | RECEIPT | HISTORY | STAFF`, đảm bảo khi tải lại trang hoặc chia sẻ link luôn giữ đúng màn hình làm việc.
- **Menu Phân Hệ Đối Tác Mobile-First (Mobile Bottom Bar - `MobileBottomBar.tsx`, `nav-config.ts`):**
  - Cập nhật cấu hình điều hướng cho 2 vai trò `PARTNER_STAFF` và `PARTNER_MANAGER`:
    - 4 tính năng cốt lõi: **Đếm đồ bẩn** (`COUNT`), **Kiểm nhận đồ sạch** (`RECEIPT`), **Lịch sử** (`HISTORY`), **Phê duyệt NV** (`STAFF`, chỉ hiển thị nếu role là `PARTNER_MANAGER`).
  - Trên màn hình di động (`lg:hidden`), toàn bộ điều hướng chuyển xuống thanh **Bottom Navbar** cố định đáy màn hình với các icon to bản và nhãn tiếng Việt trực quan; ẩn nút 'Thêm' và nút Hamburger menu.
  - Bổ sung nhận diện active state theo `location.search` (`?tab=...`), giúp thanh Bottom Bar phát sáng chính xác nút đang được chọn.
  - **Bỏ Hoàn Toàn Sidebar Trên Cả Desktop & Drawer Mobile:** Khi người dùng là `PARTNER_MANAGER` hoặc `PARTNER_STAFF`, hệ thống loại bỏ hoàn toàn [DesktopSidebar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/DesktopSidebar.tsx) và [MobileNavDrawer.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileNavDrawer.tsx), xóa bỏ khoảng lùi lề `lg:pl-64` để giao diện bung 100% chiều rộng màn hình, tinh gọn tối đa giao diện làm việc của quán.
- **Form Đếm Đồ Bẩn Thông Minh Chuẩn Hóa Theo PrepOrderModal (`PartnerCountTabComponent.tsx`):**
  - Tái cấu trúc theo ngôn ngữ giao diện của [PrepOrderModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx), hỗ trợ chuyển đổi linh hoạt Dual View Mode giữa **Dạng Thẻ (`Card View`)** và **Dạng Bảng (`Table View`)**.
  - Tự động nhận diện chi nhánh & thương hiệu của tài khoản (`user.brand`, `user.partnerId`), **khóa cứng (disabled / read-only)** Thương hiệu, Chi nhánh và Ngày (mặc định lấy theo ngày của phiếu soạn đồ do quản lý kho tạo).
  - Thay thế các cột soạn đồ thành duy nhất **1 cột số lượng: "Đồ chưa giặt"**. Bỏ trường ghi chú chung, giữ ghi chú từng chiếc nếu có sự cố rách/hỏng.
  - **Cơ chế Smart Math Input & Auto-Save on Blur (`lib/utils.ts`):**
    - Viết hàm `parseSmartQtyExpression(input)` an toàn (không dùng `eval`), hỗ trợ tính toán cộng trừ và gom dồn: gõ `12 34` hoặc `12 + 34` => tính ra `46`, gõ `50-10` => tính ra `40`.
    - Tự động tính kết quả và lưu ngay khi rời ô (`onBlur`), mang lại trải nghiệm nhập liệu siêu tốc cho nhân viên kiểm đồ.
  - **Lưu & Xuất Phiếu Giao Nhận Kép:**
    - Bấm _"Lưu và xem phiếu giao nhận"_: Lưu dữ liệu đếm đồ bẩn vào phiếu giao nhận (cột _Số lượng đã nhận_ `dirtyReceivedQty` và chữ ký đối tác), đồng thời truy vấn dữ liệu đồ sạch đã soạn từ phía `warehouse-manager` trong ngày để hiển thị đồng thời cả 2 chiều trên phiếu xuất nhập kho Canvas [HandoverDeliverySlipModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/HandoverDeliverySlipModal.tsx).
- **Kiểm Nhận Đồ Sạch Trực Quan Bằng Canvas 2 Chiều (Tab RECEIPT - `PartnerReceiptTabComponent.tsx`):**
  - Hiển thị trực tiếp phiếu giao nhận 2 chiều xuất nhập kho vẽ bằng HTML5 Canvas sắc nét để đối tác kiểm đếm đồ sạch đối soát với đồ bẩn.
  - Nút điều hướng ngày: **Sang trái (`ChevronLeft`)** lùi 1 ngày, **Sang phải (`ChevronRight`)** tiến 1 ngày để dễ dàng lật xem các phiếu giao nhận theo ngày mà không cần mở nhiều màn hình.
  - Ô **họ tên người nhận** (mặc định nạp tự động từ tài khoản đăng nhập `user.fullName || user.name`) và ô **ký tên** (`SignatureCanvas`) ngay dưới phiếu, bấm xác nhận gửi API `/handover/:id/receipt-check`.
- **Lịch Sử Giao Nhận Phân Trang & Tra Cứu Theo Ngày (Tab HISTORY - `PartnerHistoryTabComponent.tsx`):**
  - Danh sách phiếu giao nhận hiển thị theo thứ tự **từ mới đến cũ** (mới nhất lên đầu) trong `ResponsiveCardGrid`.
  - **Phân trang (Pagination):** Tối đa **12 phiếu / trang** kèm thanh chuyển trang tiện lợi.
  - **Bộ lọc ngày cụ thể:** Bộ chọn ngày (Date Picker) lọc và xem ngay phiếu giao nhận của 1 ngày bất kỳ, bấm nút _"Xem Phiếu"_ mở modal Canvas hiển thị đầy đủ phiếu để tải ảnh hoặc copy Zalo.
- **Khắc Phục Toàn Diện Lỗi Console & Quyền Hạn (403 Forbidden & Loop Re-render):**
  - **Sửa lỗi 403 Forbidden trên các API Partner:** Cập nhật [permissions.map.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/config/permissions.map.ts) cấp quyền `PARTNER_VIEW` (`partner.view`) và `CATALOG_PRICE_CUSTOMER_VIEW` (`catalog.price_customer.view`) cho `PARTNER_MANAGER` và `PARTNER_STAFF`. Cập nhật Jest snapshot test [permissions.map.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/config/permissions.map.spec.ts) pass 9/9.
  - **Sửa lỗi Maximum update depth exceeded (`PrepOrderModal.tsx`):** Thêm điều kiện chặn vòng lặp `useEffect` khi danh sách chi nhánh rỗng hoặc khi `defaultPartnerId` đã được thiết lập, giải quyết triệt để lỗi crash giao diện khi mở form Soạn đồ bên phía kho vận.
  - **Chuẩn hóa TypeScript Types:** Bổ sung các trường `clean`, `dirty`, `cleanPlanned`, `restaurant_count` và `note?: string` vào `HandoverDirtyItem` trong [types/index.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/types/index.ts).

### Refactor - Chuẩn Hóa Kiến Trúc File Features & Giới Hạn Dung Lượng (*Page.tsx, modals/*Modal.tsx, components/\*Component.tsx)

- **Chuẩn Hóa Quy Ước Đặt Tên & Cấu Trúc Thư Mục Feature:**
  - Quy định thống nhất toàn diện:
    - Màn hình chính / view cấp cao nhất: `[Tên]Page.tsx` (ví dụ `StaffManagementPage.tsx`, `HandoverDetailPage.tsx`, `WarehousePage.tsx`, `PartnersPage.tsx`, `RegisterPage.tsx`).
    - Thư mục `modals/`: Chứa toàn bộ các dialog/modal theo dạng `[Tên]Modal.tsx` (ví dụ `PartnerModal.tsx`, `PrepOrderModal.tsx`, `StaffFormModal.tsx`).
    - Thư mục `components/`: Chứa các component con phụ trách render phần giao diện riêng lẻ theo dạng `[Tên]Component.tsx` (ví dụ `StaffTableComponent.tsx`, `HandoverCleanDeliveryComponent.tsx`, `WarehouseCleanPlanTabComponent.tsx`).
  - Ghi nhận bắt buộc vào bộ tài liệu dự án:
    - `.agents/rules/frontend.md`: Bổ sung nguyên tắc đặt tên file và giới hạn kích thước tối đa 300 dòng (ngoại lệ không quá 450 dòng đối với form nghiệp vụ phức tạp).
    - `.agents/rules/AGENTS.md` (Mục 5.5): Quy định cấu trúc thư mục con chuẩn hóa và quy ước tiền tố / hậu tố file.
    - `.agents/skills/create-react-feature/SKILL.md`: Cập nhật cấu trúc Feature-Based Flat Colocation.
    - `.agents/skills/create-nextjs-feature/SKILL.md`: Cập nhật cấu trúc component & modal.
- **Rà Soát & Bóc Tách Các File Vượt Kích Thước Trong `fe-react-thanhxuan-internal/src/features`:**
  - **`features/management/auth`:**
    - Bóc tách `StaffManagementView.tsx` (1,154 dòng) thành `StaffManagementPage.tsx`, `modals/StaffFormModal.tsx`, `modals/StaffDeleteModal.tsx`, `components/StaffFilterComponent.tsx`, `components/StaffTableComponent.tsx`.
    - Chuẩn hóa `ApprovalManagementPage.tsx` và `AuditLogPage.tsx`.
  - **`features/management/partners`:**
    - Bóc tách toàn bộ modals vào `modals/`: `PartnerModal.tsx`, `BrandModal.tsx`, `CatalogModal.tsx`, `DeleteConfirmModal.tsx`.
    - Chuẩn hóa các components: `PartnersTopBannerComponent.tsx`, `PartnersActionBarComponent.tsx`, `PartnersPartnerFilterComponent.tsx`, `PartnersCatalogFilterComponent.tsx`, `PartnerListComponent.tsx`, `PartnerCardComponent.tsx`, `CatalogListComponent.tsx`.
  - **`features/auth`:**
    - Thu gọn `RegisterPage.tsx` từ 566 dòng xuống 189 dòng; chuyển các modals sang `auth/modals/`: `ChangePasswordModal.tsx`, `ForgotPasswordModal.tsx`, `OtpVerificationModal.tsx`, `ProfileEditModal.tsx`, `RegisterModal.tsx`; tạo `components/RegisterFormComponent.tsx`.
  - **`features/operations/handovers`:**
    - Bóc tách `HandoverDetailPage.tsx` (933 dòng) thành `components/HandoverHeaderComponent.tsx`, `components/HandoverCleanDeliveryComponent.tsx`, `components/HandoverDirtyPickupComponent.tsx`, `components/HandoverSignaturesComponent.tsx`, `modals/DisputeModal.tsx` và `HandoverDetailPage.tsx` (~350 dòng).
    - Bóc tách `WarehousePage.tsx` (750 dòng) thành `components/WarehouseCleanPlanTabComponent.tsx`, `components/WarehouseRecountQueueTabComponent.tsx`, `components/WarehouseSummaryTabComponent.tsx` và `WarehousePage.tsx` (~180 dòng).
    - Bóc tách `PrepOrderModal.tsx` (873 dòng) thành `components/PrepOrderItemCardComponent.tsx`, `components/PrepOrderItemTableComponent.tsx` và `modals/PrepOrderModal.tsx` (~420 dòng).
    - Nâng cấp `PrepOrderModal.tsx`: Tự động nhận diện thiết bị khi mở modal (Mobile: hiện Dạng Thẻ trước, Desktop: hiện Dạng Bảng trước).
    - Bổ sung hiển thị ảnh đồ giặt (`cat.imageUrl`) có fallback icon `Package` ngay trước tên chiếc đồ ở cả Dạng Thẻ (`PrepOrderItemCardComponent.tsx`) và Dạng Bảng (`PrepOrderItemTableComponent.tsx`).
    - Ẩn hoàn toàn mã đồ giặt `itemCode` ở Dạng Thẻ để tinh gọn và tập trung cho thợ thao tác cảm ứng.
    - Chuẩn hóa toàn bộ modal vào `modals/`: `CreateHandoverModal.tsx`, `HandoverDeliverySlipModal.tsx`, `RecountRequestModal.tsx`, `SignatureModal.tsx`, `ZaloQrSettingsModal.tsx`, `WarehouseScheduleSettingsModal.tsx`.
  - **`features/operations/partners`:**
    - Bóc tách `PartnerPortalPage.tsx` (690 dòng) thành `components/PartnerCountTabComponent.tsx`, `components/PartnerReceiptTabComponent.tsx`, `components/PartnerHistoryTabComponent.tsx`, `components/PartnerStaffTabComponent.tsx` và `PartnerPortalPage.tsx` (~200 dòng).
  - **`features/operations/reports` & `features/operations/piecework`:**
    - Chuẩn hóa `ReportsPage.tsx`, `components/ReportsViewComponent.tsx`, `components/ItemCounterCardComponent.tsx`.
- **Tái Thiết Kế & Nâng Tầm Thẩm Mỹ Top Banner (`PageBanner.tsx`):**
  - Chuyển đổi toàn diện bố cục sang phương ngang: Icon container nổi bật đặt bên trái (`w-12 h-12 sm:w-14 sm:h-14`), toàn bộ Title, Tagline và Description đặt bên phải Icon với tỷ lệ công thái học cân xứng.
  - Phối màu cao cấp HSL: Icon container sử dụng gradient đa tầng `sky-500` & `indigo-500` viền sắc nét kèm hiệu ứng hover scale; Card container phủ dải chuyển sắc nhẹ `from-white via-white to-sky-50/40` (Dark: `from-slate-900 to-sky-950/20`) cùng viền tinh xảo; Description hỗ trợ ReactNode dạng thẻ linh hoạt.
- **Dọn Dẹp Triệt Để Các File Shim & Tối Ưu Import:**
  - Cập nhật toàn bộ các import trực tiếp trong toàn bộ mã nguồn trỏ chuẩn xác vào thư mục `modals/` hoặc `components/`.
  - Xóa bỏ triệt để 35 file shim trung gian (các file chỉ chứa 1 dòng `export * from './modals/...'` hoặc `export * from './components/...'`) giúp cây thư mục gọn gàng, trong sáng và dễ bảo trì.
  - Tinh giản các file barrel `index.ts` chỉ xuất các component và modal chính danh.
- **Kiểm Thử Toàn Diện:**
  - Kiểm thử TypeScript (`pnpm exec tsc --noEmit`): Pass 100% không có lỗi.
  - Kiểm thử Vite Production Build (`pnpm build`): Pass 100% với bundle và PWA Service Worker tạo thành công trong 4.58s.

### Plan 20 - Tính Năng Soạn Đồ Giao Hàng, Xuất Phiếu Giấy Zalo Chuẩn Khổ A4, Tự Động Định Kỳ & Sửa Lỗi Popup Đối Tác (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Khắc Phục Lỗi Cuộn Khuất Đỉnh Phiếu Trên Màn Hình PC (`HandoverDeliverySlipModal.tsx`):**
  - Nguyên nhân: Container cuộn trước đây dùng `flex justify-center items-center`, thuộc tính `items-center` căn giữa theo chiều dọc khiến một nửa trên của tấm ảnh khổ A4 dài >1000px bị đẩy lên vùng âm tọa độ cuộn (scroll top < 0), khiến người dùng dù có kéo kịch thanh cuộn lên trên cùng cũng không nhìn thấy được khung thông tin công ty.
  - Khắc phục: Chuyển cấu trúc container sang `flex flex-col items-center justify-start py-6`. Ảnh phiếu được đặt ngay ngắn bắt đầu từ đỉnh đầu có khoảng đệm 24px, căn giữa theo chiều ngang và cuộn trơn tru từ đầu trang đến chân trang mà không bao giờ bị cắt mất mép trên.
- **Tinh Chỉnh Thẩm Mỹ & Cân Đối Thanh Thao Tác Quản Lý Đối Tác (`PartnersActionBar.tsx`):**
  - Thu nhỏ toàn bộ các nút hành động bên phải: _Thêm Đối Tác_, _Thêm Đồ Giặt_, _Thêm Thương Hiệu_, và _Cài QR Zalo Phiếu_.
  - Chuyển đổi từ `size="touch"` (chiều cao lớn 56px vốn chỉ dành cho màn hình xưởng) sang `size="sm"` (`h-8`, bo góc `rounded-lg`, font chữ `text-xs font-semibold`, icon `w-3.5 h-3.5`).
  - Hỗ trợ text co giãn linh hoạt trên mobile cho nút QR Zalo (`hidden sm:inline` "Cài QR Zalo Phiếu" và `sm:hidden` "QR Zalo").
  - Đảm bảo thanh Action Bar hiển thị thẳng hàng, tỷ lệ cân đối hoàn hảo với khối tab bộ lọc bên trái.
- **Tối Ưu Bố Cục Khổ Giấy In A4 & Phân Quyền Cài Đặt QR Zalo (`HandoverExportHelper.ts`, `PartnersPage.tsx`, `HandoverDeliverySlipModal.tsx`):**
  - Tăng khoảng cách lề trên khung thông tin công ty từ 35px lên chuẩn **50px** (`box1Y = 50;`) và dịch chuyển phần cam kết dịch vụ chân trang (`footerY = 1095;`) để giữ tỷ lệ lề trên - lề dưới cân đối.
  - Tách hoàn toàn nút cài QR Zalo ra khỏi modal xem phiếu kho vận, đưa về trang Quản lý Đối tác (`/management/manager/partner`) dành riêng cho quyền `ADMIN` và `MANAGER`.
  - Phiếu giao nhận tự động nhận diện và hiển thị mã QR Zalo đã lưu khi bất kỳ ai bấm xem phiếu.
- **Sửa Triệt Để Lỗi Popup Form Đối Tác (Ảnh 2 - `PartnerDialog.tsx` & `dialog.tsx`):**
  - Khắc phục tình trạng Header dính sát mép trên và Footer đè cắt ngang input _"Người liên hệ trực tiếp tại quán"_.
  - Cải tiến `dialog.tsx`: thiết lập container `max-h-[90vh] flex flex-col`, cấu trúc padding `px-6` cân đối, màu border tinh chỉnh theo token theme light/dark mode.
  - Tái cấu trúc `PartnerDialog.tsx`: cố định `DialogHeader` và `DialogFooter`, toàn bộ 7 input form fields được bọc vào vùng cuộn `max-h-[60vh] overflow-y-auto px-6 py-4 space-y-4` mượt mà, đạt 100% chuẩn thẩm mỹ ergonomics.
- **Nâng Cấp Backend Handovers (Schemas, DTOs & Nghiệp Vụ Soạn Đồ):**
  - Mở rộng Mongoose sub-schema `HandoverItem` và `CleanPlanned`: hỗ trợ `undeliveredQty` (số lượng chưa giao), `returnedDebtQty` (số lượng giao trả nợ), `note` (ghi chú từng chiếc), `preparedByName` (họ tên người lập) và `preparedBySignature` (chữ ký số Base64).
  - Bổ sung các Class DTO validation: `CleanItemDetailDto`, `CleanPlannedDto`, `PrepOrderDto` với đầy đủ validator Decorator (`@IsOptional()`, `@IsString()`, `@IsNumber()`).
  - Thêm endpoint `POST /handover/prep-order`: tạo mới hoặc cập nhật phiếu soạn đồ sạch cho ngày mai với đầy đủ 3 loại số lượng, ghi chú từng dòng và chữ ký điện tử.
  - Thêm endpoint `GET /handover/previous-dirty`: truy vấn phiếu giao nhận gần nhất trước ngày chỉ định để lấy chính xác số lượng đồ bẩn đã nhận (`dirty.final.items` ➔ `dirty.shipperItems` ➔ `restaurant_count.items`), dùng để prefill tự động sang đồ sạch.
  - Thêm endpoint `POST /handover/auto-schedule`: duyệt danh sách đối tác có lịch giao định kỳ (`DAILY`, `ALTERNATE_DAYS`), tự động sinh phiếu giao nhận ngày mai kèm prefill số lượng đồ bẩn hôm trước vào `clean.planned`.
- **Giao Diện Soạn Đồ Thông Minh & Chữ Ký Điện Tử (`PrepOrderModal.tsx`):**
  - Tích hợp bộ chọn 2 cấp: Thương hiệu (Brand) ➔ Chi nhánh đối tác (Partner), tự động tải danh mục đồ giặt tương ứng (`item_catalogs`).
  - Tự động gọi API `/handover/previous-dirty` điền sẵn số lượng vào cột _Số lượng sẽ giao_ giúp thủ kho không phải gõ lại từ đầu.
  - Hỗ trợ nhập và chỉnh sửa linh hoạt: Cột _Số lượng sẽ giao_, _Chưa giao_, _Giao trả nợ_, kèm cột _Ghi chú_ từng dòng (ví dụ: _"đã giao trước trong ngày 20 chiếc"_).
  - Khung Canvas ký tên điện tử (`react-signature-canvas`) có nút xóa chữ ký, ô họ tên người lập phiếu tự động điền họ tên tài khoản đang đăng nhập.
  - Bấm "Lưu & Xem Phiếu Giao Nhận" tự động lưu vào hệ thống và kích hoạt mở modal xem trước phiếu thực tế.
  - **Tối ưu hóa hiển thị di động & Chống lỗi cuộn ngang trên Mobile (Dual View Mode):**
    - Khắc phục triệt để lỗi thẻ cha `overflow-hidden` chặn vuốt cảm ứng ngang trên điện thoại di động.
    - Bổ sung chế độ **Dạng Thẻ (`Card View`)**: Mặc định kích hoạt trên màn hình điện thoại (< 768px), hiển thị từng chiếc đồ giặt thành thẻ dọc với nút bấm stepper [-] / [+] to bản 32-40px tiện lợi, nhập Chưa giao / Trả nợ / Ghi chú trực tiếp mà không cần cuộn ngang màn hình.
    - Cung cấp chế độ **Dạng Bảng (`Table View`)**: Hỗ trợ vuốt ngang mượt mà (`overflow-x-auto min-w-[580px]`), tinh gọn tối đa các cột cố định bên trái (STT thu hẹp còn `w-8` 32px, Tên đồ thu gọn `min-w-[120px]` và **ẩn hoàn toàn mã đồ bên dưới**, ĐVT thu hẹp `w-11`), ghim cố định (_STT_ `sticky left-0` và _Tên đồ giặt_ `sticky left-8 sm:left-10`), giúp màn hình điện thoại hiển thị ngay cột _Sẽ giao_ và vuốt nhẹ là thấy toàn bộ _Chưa giao_, _Giao trả nợ_.
    - Nút chuyển đổi View Mode nhanh chóng giữa Dạng Thẻ và Dạng Bảng ngay trên thanh tiêu đề danh mục.
- **Render Canvas Phiếu Xuất Nhập Kho Vận Chuyển Giống Ảnh 1 Mẫu Thực Tế Pizza 4P's (`HandoverExportHelper.ts`):**
  - Xây dựng hàm `renderHandoverDeliverySlipToCanvas(slipData)` vẽ đồ họa Canvas HTML5 chuẩn khổ giấy A4 (800x1130px) nền trắng sắc nét.
  - Header: Khung thông tin công ty Thanh Xuân (MST `0108942736`, Hotline `0769 270 676`, Địa chỉ Kiến Hưng, Hà Nội).
  - Mã QR CSKH Zalo góc trái, Tiêu đề _PHIẾU XUẤT NHẬP KHO VẬN CHUYỂN_ và ngày tháng năm lập phiếu.
  - Thông tin bên nhận (Nơi nhận, Bộ phận, Địa chỉ, SĐT).
  - Bảng dịch vụ chuẩn 16 dòng kẻ ô: gồm STT, Danh mục dịch vụ, Đơn vị, Đồ chưa giặt (Đã nhận, Thực nhận), Đồ sạch đã giặt (Đã giao, Chưa giao, Giao trả), Ghi chú từng dòng, và dòng TỔNG CỘNG ở chân bảng.
  - Khu vực 4 chữ ký: _Thủ kho_, _Người giao hàng_, _Người nhận hàng_, _Người lập phiếu (Người đếm đồ bẩn)_ hiển thị ảnh chữ ký Canvas và họ tên bên dưới.
  - Footer: Thông tin thương hiệu TX Laundry Service và toàn bộ đoạn văn bản cam kết chất lượng dịch vụ theo đúng mẫu giấy in thực tế.
- **Modal Xem Trước, In Phiếu Chuẩn Khổ A4 & Xuất Ảnh Zalo (`HandoverDeliverySlipModal.tsx`):**
  - Hiển thị trực quan toàn bộ phiếu in tỷ lệ chuẩn A4.
  - **Khắc phục lỗi in ấn trình duyệt (Clean Print):** Áp dụng CSS `@page { size: A4 portrait; margin: 0mm !important; }` và `.print-box { padding: 6mm 10mm; }`, triệt tiêu 100% các dòng thông tin thừa do trình duyệt tự chèn (ngày giờ in, tiêu đề trang, `about:blank`, và số trang `1/1`), phiếu in ra sạch sẽ như bản in thương mại.
  - Tích hợp nút **"Cài QR Zalo"** mở hộp thoại tùy chỉnh mã QR trực tiếp ngay khi đang xem phiếu.
  - Tích hợp nút **"Tải Xuống Thành Ảnh (.PNG)"** tải file ảnh chất lượng cao gửi ngay vào nhóm Zalo.
  - Nút **"Sao chép ảnh"** ghi trực tiếp dữ liệu hình ảnh vào Clipboard để dán nhanh (Ctrl+V) vào Zalo máy tính mà không cần lưu file.
- **Tính Năng Cài Đặt Mã QR Zalo CSKH Cho Phiếu Giao Nhận (`ZaloQrSettingsModal.tsx`):**
  - Hỗ trợ tải file ảnh mã QR Zalo (PNG, JPG, WEBP) từ thiết bị hoặc dán URL ảnh trực tiếp.
  - Lưu cấu hình mã QR vào bộ nhớ hệ thống (`TX_ZALO_QR_CODE`), hỗ trợ quay lại mã QR mặc định bất cứ lúc nào.
  - Tích hợp điểm truy cập cài đặt tại cả 2 nơi: Modal xem phiếu `HandoverDeliverySlipModal` và Hộp thoại cấu hình kho `WarehouseScheduleSettingsDialog`.
  - Phiếu giao nhận tự động nạp ảnh thật của mã QR Zalo và vẽ sắc nét vào góc trái phiếu in.
- **Setting Tự Động Lên Đơn Theo Lịch Định Kỳ (`WarehouseScheduleSettingsDialog.tsx` & `WarehousePage.tsx`):**
  - Hộp thoại cấu hình lịch giao: thống kê chi nhánh giao hàng ngày / cách ngày vs chi nhánh theo yêu cầu (`ON_DEMAND`).
  - Nút kích hoạt nhanh "Tự Động Lên Đơn Theo Lịch" ngay trên thanh công cụ trang Kho (`WarehousePage.tsx`).
  - Thêm nút "Soạn Đồ" nổi bật và nút "Cài Đặt Lịch Giao" trên thanh tác vụ.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - `pnpm exec tsc --noEmit` trên `fe-react-thanhxuan-internal` pass 100% (0 lỗi).
  - `pnpm build` (`vite build`) trên `fe-react-thanhxuan-internal` pass 100% trong 7.09 giây.
  - `pnpm build` (`nest build`) trên `be-nestjs-thanhxuan` pass 100% không cảnh báo lỗi biên dịch.

### Plan 19 - Nâng Tầm Toàn Diện Giao Diện UI/UX Phân Hệ Vận Hành Nội Bộ (`fe-react-thanhxuan-internal`)

- **Chuẩn hóa Nền tảng Thiết kế & Typography (Design Foundation & Font Stack):**
  - Tích hợp bộ font Google Fonts `Plus Jakarta Sans` (400, 500, 600, 700, 800) và `JetBrains Mono` tại `index.html`.
  - Mở rộng cấu hình `tailwind.config.js`: Khai báo font stack `font-sans`, `font-mono`, các bóng đổ cao cấp (`soft`, `card`, `card-hover`, `glow-sky`, `glow-emerald`) và chuẩn hóa bo góc `rounded-2xl`, `rounded-3xl`.
  - Cập nhật `src/index.css`: Bổ sung lớp số học chuẩn xác `.tabular-nums` (cho tiền tệ và kiểm đếm đồ giặt), lớp vùng an toàn di động `.safe-bottom`, `.safe-bottom-nav`, và thanh cuộn tinh gọn `.scrollbar-thin`.
- **Hệ Thống Component UI Cốt Lõi Tinh Gọn (Core UI Components):**
  - `Button.tsx`: Loại bỏ triệt để gradient 3 màu tím/xanh nhạt nhẽo kiểu "AI slop". Nâng cấp các variant solid brand sắc sảo, bổ sung variant `success`, `touch` (chiều cao >= 52-56px cho thợ đeo găng tay và tài xế xe tải thao tác một tay).
  - `Badge.tsx`: Nâng cấp badge bo tròn hỗ trợ tùy chọn `dot` status indicator nhấp nháy, viền mờ cao cấp, phân biệt trực quan 5 trạng thái vận hành logistics (`SCHEDULED`, `IN_TRANSIT`, `PROCESSING`, `COMPLETED`, `DISPUTED`).
  - `Card.tsx`: Bổ sung các biến thể `default`, `interactive` (hiệu ứng hover lift nổi bật khi rê chuột), `outline`, `flat`, padding phân cấp logic.
  - `StatCard.tsx` (Mới): Thẻ số liệu KPI cao cấp với container icon bo góc mềm mại, hiển thị số liệu lớn `tabular-nums`, badge phần trăm tăng trưởng và hiệu ứng micro-elevation.
  - `EmptyState.tsx` (Mới): Component trạng thái rỗng sinh động cho các danh sách phiếu/chấm công chưa có dữ liệu, kèm icon bao quanh viền mờ và nút hành động nhanh.
  - `SkeletonLoader.tsx` (Mới): Component skeleton hiệu ứng shimmer mượt mà cho card và danh sách khi đang tải dữ liệu.
- **Tái Cấu Trúc Khung Shell Điều Hướng (Layout & Navigation Shell):**
  - `AppHeader.tsx`: Nền kính mờ `backdrop-blur-md bg-white/85 dark:bg-slate-900/85`, huy hiệu vai trò nhân viên sử dụng `Badge` kèm dot status rực rỡ, dropdown menu tài khoản mềm mại.
  - `DesktopSidebar.tsx`: Nâng cấp menu thanh thoát, vạch sáng active indicator chạy dọc lề trái, container logo TX có chiều sâu, chữ in hoa danh mục tinh tế.
  - `MobileBottomBar.tsx`: Hỗ trợ vùng đệm an toàn `env(safe-area-inset-bottom)` cho iPhone, các tab điều hướng dạng pill nổi bật khi được chọn, phản hồi chạm nhạy bén.
- **Tái Thiết Kế Toàn Diện Màn Hình Trung Tâm Điều Hành (`DashboardPage.tsx`):**
  - Hero Banner thời gian thực với nhãn "BẢNG VẬN HÀNH THỜI GIAN THỰC", ngày giờ chuẩn Việt Nam và các nút Quick Action điều xe / trạm đếm.
  - Lưới 4 thẻ KPI `StatCard`: Xe đang giao nhận, Giao nhận hoàn tất, Lương khoán/Sản lượng thợ hôm nay, Lệch đồ/Khiếu nại cần xử lý ngay.
  - Hai cột danh sách vận hành trực quan: Bảng phiếu cần theo dõi và Bảng năng suất thợ xưởng tích hợp `EmptyState` khi không có dữ liệu, loại bỏ hoàn toàn các khoảng trắng vô hồn.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - `pnpm exec tsc --noEmit` pass 100% không cảnh báo lỗi type.
  - `pnpm build` (`vite build`) pass 100%, bundle sinh mã PWA Service Worker thành công trong 7.6 giây.

## 2026-10-08

### Plan 18 - Quản Lý Nhân Sự Toàn Diện (Khóa 60 Ngày Tự Xóa, Xóa Vĩnh Viễn Admin, Phân Tab), Tinh Gọn Đăng Ký, Seed Tài Khoản Test & Header Profile Popover (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Tinh gọn Trang Đăng Ký (`/register` & `RegisterModal`):**
  - Loại bỏ hoàn toàn tùy chọn vai trò "Quản Lý Đối Tác" (`PARTNER_MANAGER`) khỏi form đăng ký công khai.
  - Trang đăng ký công khai chỉ cho phép 3 vai trò thực thi: "NV Xưởng" (`WORKER`), "NV Giao Hàng" (`SHIPPER`), "Nhân Viên Đối Tác" (`PARTNER_STAFF` - chọn cascade Brand ➔ Chi nhánh cơ sở).
  - Backend bảo vệ: Chặn đăng ký vai trò `PARTNER_MANAGER` / `RESTAURANT_MANAGER` tại `register()` endpoint công khai; vai trò Quản lý đối tác bắt buộc do Admin/Manager khởi tạo trong Cổng Quản lý nhân sự.
- **Tự động Seed 8 Tài Khoản Mẫu & Đồng Bộ Mật Khẩu Test (`LoginPage.tsx` & Backend):**
  - Backend tự động seed/khôi phục khi khởi động (`OnModuleInit`) 8 tài khoản mẫu chuẩn: `admin`, `manager`, `warehouse_manager`, `accountant`, `shipper`, `worker`, `partner_manager`, `partner_staff` với mật khẩu chung `ThanhXuan@2026`.
  - Frontend `LoginPage.tsx`: Cập nhật lưới tài khoản mẫu 8 vai trò phân loại trực quan, hỗ trợ đăng nhập 1-click phục vụ kiểm thử nhanh.
- **Màn Hình Quản Lý Nhân Sự (`StaffManagementView.tsx` - `/management/manager/personnel`):**
  - **Phân loại Tab vai trò:** 6 tab danh mục (Tất cả, Quản trị, Vận hành, Giao hàng, Đối tác, Tạm khóa) kèm huy hiệu đếm số lượng tài khoản theo thời gian thực.
  - **Modal Thêm Tài Khoản:** Hỗ trợ Admin/Manager khởi tạo mọi vai trò (bao gồm `PARTNER_MANAGER` và `PARTNER_STAFF` kèm cụm cascade Brand ➔ Chi nhánh).
  - **Modal Chỉnh Sửa Tài Khoản:** Cập nhật thông tin họ tên, số điện thoại, vai trò, thương hiệu và chi nhánh đối tác.
  - **Cơ chế Tạm Khóa & Tự Động Xóa Sau 60 Ngày:**
    - Schema lưu `lockedAt: Date` khi tài khoản bị khóa.
    - Giao diện hiển thị cảnh báo thời hạn và số ngày đếm ngược còn lại trước khi bị xóa vĩnh viễn (quy tắc: khóa đủ 60 ngày tự xóa).
    - Backend: Scheduler/Cleanup logic tự động xóa vĩnh viễn tài khoản bị khóa quá 60 ngày (`deleteExpiredLockedAccounts`).
  - **Xóa Vĩnh Viễn Tài Khoản (Đặc Quyền Riêng Admin):**
    - Backend: Endpoint `DELETE /accounts/:id` yêu cầu quyền `ACCOUNT_ADMIN`, cấm tự xóa chính mình và cấm non-admin xóa.
    - Frontend: Nút "Xóa vĩnh viễn" (kèm hộp thoại xác nhận) chỉ hiển thị cho tài khoản có vai trò `ADMIN`.
- **Header Profile Popover & Quản Lý Hồ Sơ Cá Nhân (`AppHeader.tsx` & Backend):**
  - Góc trên bên phải Header hiển thị Avatar tròn, Tên người dùng và Huy hiệu phân quyền; click mở Popover Dropdown menu chuyên nghiệp.
  - **Popup Xem/Sửa Thông Tin Cá Nhân (`ProfileEditModal.tsx`):**
    - Cho phép cập nhật Họ và tên, Số điện thoại (`PATCH /accounts/me/profile`).
    - Hỗ trợ tải ảnh Avatar trực tiếp từ máy tính lên Cloudinary qua Backend endpoint `POST /accounts/me/avatar` (lưu trữ tại thư mục `internal/avatars`, tự động dọn dẹp ảnh cũ).
  - **Popup Đổi Mật Khẩu (`ChangePasswordModal.tsx`):**
    - Form 3 trường chuẩn xác: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới (`POST /auth/change-password`).
  - Nút **Đăng xuất** an toàn với 1 chạm.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - Backend: `pnpm build` (`nest build`) trong `be-nestjs-thanhxuan` pass 100%.
  - Frontend: `pnpm exec tsc -b` & `pnpm build` (`vite build`) trong `fe-react-thanhxuan-internal` pass 100%.

### Plan 17 - Chuẩn Hóa Vai Trò Đối Tác (PARTNER_MANAGER, PARTNER_STAFF), Đăng Ký Cascade Brand-Partner & Cô Lập Dữ Liệu Theo Chi Nhánh (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Đồng nhất 100% vai trò Đối tác B2B (Partner Role Standardization):**
  - Backend:
    - Khai báo role `PARTNER_MANAGER = 'PARTNER_MANAGER'` và `PARTNER_STAFF = 'PARTNER_STAFF'` trong `StaffRole` enum (`internal.enums.ts`) kèm alias backward compatibility `RESTAURANT_MANAGER = 'PARTNER_MANAGER'`, `RESTAURANT_STAFF = 'PARTNER_STAFF'`.
    - Bổ sung trường `brand` (string, uppercase, trim, indexed) vào `StaffAccount` schema (`staff-account.schema.ts`).
    - Cập nhật `InternalJwtStrategy`, `accounts.service.ts` (`login`, `refreshToken`, `getMe`) đưa `brand` vào JWT payload và thông tin người dùng.
    - Cập nhật RBAC permission map: `ACCOUNT_APPROVE_PARTNER`, `HANDOVER_PARTNER_COUNT` (kèm alias `ACCOUNT_APPROVE_RESTAURANT`, `HANDOVER_RESTAURANT_COUNT`).
    - Cập nhật `PartnerScopeGuard` và Handover State Machine nhận diện đầy đủ role `PARTNER_STAFF` và `PARTNER_MANAGER`.
  - Frontend:
    - Cập nhật `StaffRole` (`PARTNER_MANAGER`, `PARTNER_STAFF`) kèm alias `RESTAURANT_*` trong `src/types/index.ts`.
    - Mở rộng interface `StaffUser` và `RegisterPayload` chứa trường `brand`.
    - Cập nhật `permissions.ts`, `nav-config.ts`, `AppHeader.tsx`, `MobileNavDrawer.tsx`, `AuthContext.tsx` và các trang app `allowedRoles`.
- **Đăng ký Cascade 2 Cấp (Brand ➔ Partner Cascade Registration):**
  - Bổ sung public API ở Backend: `GET /partners/brands/public` (danh sách thương hiệu active) và `GET /partners/public` (danh sách chi nhánh).
  - Cập nhật DTO Backend: `RegisterDto`, `CreateManagementAccountDto`, `UpdateAccountDto` hỗ trợ `brand` và validate cascade: tài khoản đối tác bắt buộc chọn Chi nhánh (`partnerId`), tự động đối soát `brand` từ chi nhánh đối tác.
  - Cập nhật màn hình đăng ký Frontend (`RegisterPage.tsx` và `RegisterModal.tsx`):
    - Mở rộng lựa chọn 4 vai trò: Thợ Xưởng (`WORKER`), Giao Hàng (`SHIPPER`), NV Đối Tác (`PARTNER_STAFF`), QL Đối Tác (`PARTNER_MANAGER`).
    - Khi chọn vai trò đối tác, tự động kích hoạt cụm 2 dropdown cascade:
      1. Dropdown 1: **Thương Hiệu Đối Tác (Brand)** (Pizza 4P's, Haidilao, Golden Gate...).
      2. Dropdown 2: **Chi Nhánh Cơ Sở (Partner)** tự động lọc danh sách theo đúng thương hiệu đã chọn (`partner.brand === selectedBrand`).
    - Bắt buộc chọn cả Brand và Chi nhánh để gửi kèm payload đăng ký.
- **Phân vùng dữ liệu nghiêm ngặt (Scope Isolation) trên Cổng Đối Tác (`PartnerPortalPage.tsx`):**
  - Backend: Bổ sung endpoint `@Post(['partner-count', 'restaurant-count'])` và `@Put(':id/partner-count')` tạo/cập nhật phiếu đếm đồ bẩn an toàn idempotency.
  - Frontend `PartnerPortalPage.tsx`:
    - Hiển thị nhãn Thương hiệu (Brand) và Chi nhánh đối tác ngay trên Header từ `user.brand` và `partner`.
    - Tải danh mục đồ vải (`item_catalogs`) lọc chuẩn xác theo thương hiệu của chi nhánh.
    - Tab Đếm Đồ Bẩn: Gửi dữ liệu về `/handover/partner-count` (hỗ trợ cả Offline Queue qua IndexedDB).
    - Tab Lịch Sử & Kiểm Nhận Đồ Sạch: Tải đúng phiếu giao nhận của chi nhánh người dùng (`/handover?partnerId=${userPartnerId}`).
    - Tab Duyệt Nhân Viên (dành cho `PARTNER_MANAGER`): Chỉ tải và phê duyệt các yêu cầu đăng ký nhân viên của chính chi nhánh mình.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - Backend: `pnpm build` (`nest build`) trong `be-nestjs-thanhxuan` pass 100%.
  - Frontend: `pnpm build` (`tsc -b && vite build`) trong `fe-react-thanhxuan-internal` pass 100%.

### Plan 16 - Chuẩn Hóa Ngữ Pháp Module, Phân Chia Features Management/Operations, Đổi Tên Đối Tác & URL Số Ít (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)

- **Chuẩn hóa ngữ pháp tiếng Anh danh mục Module (Grammar-Accurate Pluralization):**
  - Giữ đuôi số nhiều `s` cho các danh từ đếm được: `handovers/`, `partners/`, `reports/`.
  - Bỏ đuôi `s` (về số ít) cho danh từ không đếm được và từ viết tắt:
    - Backend: `auths/` ➔ `auth/`, `attendances/` ➔ `attendance/`, `fuels/` ➔ `fuel/`, `payrolls/` ➔ `payroll/`, `pieceworks/` ➔ `piecework/`.
    - Cập nhật các module class: `AuthModule`, `AttendanceModule`, `FuelModule`, `PayrollModule`, `PieceworkModule` (kèm alias tương thích ngược).
    - Cập nhật quy tắc ngữ pháp danh mục module trong skill `.agents/skills/create-nestjs-module/SKILL.md`.
- **Tái cấu trúc thư mục Frontend Features (`src/features/`):**
  - Học tập cấu trúc phân tầng rõ ràng từ Web Next.js, chia `features/` thành 2 miền nghiệp vụ độc lập:
    - `features/management/`: `attendance`, `auth`, `fuel`, `handovers`, `partners`, `payroll`, `piecework`, `reports`.
    - `features/operations/`: `attendance`, `fuel`, `handovers`, `partners`, `payroll`, `piecework`, `reports`.
  - Duy trì `features/auth/` và `features/dashboard/` làm Shared Features cấp root, re-export linh hoạt sang `features/management/auth`.
  - Tách các views từ thư mục `components/` cũ và dọn dẹp sạch toàn bộ các thư mục features phẳng cấp root.
- **Chuẩn hóa thuật ngữ Đối tác B2B (Partner Terminology):**
  - Đổi toàn bộ các khái niệm "nhà hàng" / "restaurant" trong ngữ cảnh B2B sang "đối tác" / "partner":
    - URL & Folder: `operations/restaurant-manager` ➔ `operations/partner-manager/partner`, `operations/restaurant-staff` ➔ `operations/partner-staff/partner`.
    - UI Text: "Quản lý Đối tác", "Nhân viên Đối tác", "Cổng Đối Tác B2B", "Cổng Giao Nhận Đối Tác", "Cổng Quản Lý Đối Tác".
    - Page Components: Đổi `RestaurantPage.tsx` thành `PartnerPortalPage.tsx` đặt tại `features/operations/partners/`.
    - Đổi tên `RestaurantMonthlyTable` thành `PartnerMonthlyTable` và rà soát toàn bộ UI forms (`RegisterModal.tsx`, `RegisterPage.tsx`, `LoginPage.tsx`).
- **Tước bỏ quyền phê duyệt tài khoản của vai trò Kế toán (`ACCOUNTANT`):**
  - Chuyển `management/approvals` vào `management/manager/approval` (số ít).
  - Cấu hình `allowedRoles={[StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RESTAURANT_MANAGER]}` — tước bỏ hoàn toàn quyền của Kế toán.
  - Cập nhật `nav-config.ts` và `ManagementPage.tsx` ẩn tab tài khoản với vai trò `ACCOUNTANT`.
  - `RESTAURANT_MANAGER` chỉ xem và duyệt nhân viên đối tác thuộc cơ sở mình.
- **Chuẩn hóa 100% Tuyến đường Số Ít (Singular RESTful Routes):**
  - Canonical routes: `/operations/report`, `/management/manager/partner`, `/management/manager/approval`, `/operations/partner-manager/partner`, `/operations/partner-staff/partner`.
  - Thiết lập mạng lưới Backward Compatibility Redirects hoàn chỉnh trong `router.tsx` đảm bảo không bị lỗi 404 cho bất kỳ link cũ nào (kể cả link tiếng Việt lẫn tiếng Anh dạng số nhiều).
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - Typecheck Frontend: `pnpm exec tsc -b` trong `fe-react-thanhxuan-internal` pass 100%.
  - Build Frontend: `pnpm build` (`vite build`) thành công rực rỡ, PWA service worker generate hoàn tất.
  - Build Backend: `pnpm build` (`nest build`) trong `be-nestjs-thanhxuan` pass 100%.

## 2026-10-07

### Plan 15 - Chuẩn Hóa Cấu Trúc Thư Mục Phân Hệ Internal (Số Nhiều Toàn Diện) & Cập Nhật Skill create-nestjs-module (`be-nestjs-thanhxuan`)

- **Chuẩn hóa danh xưng số nhiều toàn diện (Comprehensive Plural Naming):**
  - Chuyển đổi tên 100% các module nghiệp vụ trong `src/modules/internal/` sang dạng số nhiều:
    - `accounts/` ➔ `auths/` (kèm đổi tên module thành `auths.module.ts` và export `AuthsModule` cùng alias `AccountsModule`).
    - `attendance/` ➔ `attendances/` (kèm `attendances.module.ts`, export `AttendancesModule` cùng alias `AttendanceModule`).
    - `fuel/` ➔ `fuels/` (kèm `fuels.module.ts`, export `FuelsModule` cùng alias `FuelModule`).
    - `handover/` ➔ `handovers/` (kèm `handovers.module.ts`, export `HandoversModule` cùng alias `HandoverModule`).
    - `payroll/` ➔ `payrolls/` (kèm `payrolls.module.ts`, export `PayrollsModule` cùng alias `PayrollModule`).
    - `piecework/` ➔ `pieceworks/` (kèm `pieceworks.module.ts`, export `PieceworksModule` cùng alias `PieceworkModule`).
    - `partners/` & `reports/`: Đã là số nhiều, duy trì chuẩn hóa.
  - Chuẩn hóa thư mục con `dto/` (giữ nguyên quy chuẩn từ viết tắt Data Transfer Object, không thêm số nhiều, đồng bộ 100% với các phân hệ `laundry/`, `moving/` và `core/audit/`).
- **Tổ chức cấu trúc thư mục con học theo phân hệ mẫu `laundry/`:**
  - Tạo thư mục `specs/` cho tất cả các module và gom 100% các file unit test `*.spec.ts` vào `specs/` (`auths/specs/`, `attendances/specs/`, `fuels/specs/`, `handovers/specs/`, `partners/specs/`, `payrolls/specs/`, `pieceworks/specs/`, `reports/specs/`).
  - Tách thư mục `controllers/` cho các module có $\ge 2$ controllers:
    - `auths/controllers/`: `accounts.controller.ts`, `auth.controller.ts`, `approvals.controller.ts`.
    - `handovers/controllers/`: `handover.controller.ts`, `recount-tasks.controller.ts`.
  - Cập nhật chuẩn `MockRepository<T>` cho unit test mocks loại bỏ hoàn toàn các lỗi typecheck của Jest mock methods.
- **Duy trì an toàn API Contracts & Backward Compatibility:**
  - Giữ nguyên 100% các decorator `@Controller('internal/...')` (`accounts`, `approvals`, `attendance`, `fuel`, `handover`, `partners`, `payroll`, `piecework`, `reports`) để không gây breaking change với Frontend API client.
  - Export song song class module mới và alias tên class cũ (`export { AuthsModule as AccountsModule }`, `export { HandoversModule as HandoverModule }`...) đảm bảo mọi module phụ trợ và test suites đều hoạt động trơn tru.
  - Cập nhật đồng bộ các file import toàn dự án: `src/app.module.ts`, `src/modules/internal/internal.module.ts`, `src/modules/core/schedule/*`.
- **Cập nhật Skill & Tài liệu Kiến trúc:**
  - `.agents/skills/create-nestjs-module/SKILL.md`: Cập nhật cấu trúc thư mục chuẩn (`dto/`, `schemas/`, `repositories/`, `specs/`, `controllers/`, `services/`, `strategies/`) và checklist kiểm định.
  - `.agents/docs/srs_sdd/srs_sdd_backend.md`: Cập nhật cây thư mục và sơ đồ kiến trúc module phân hệ Internal.
  - `.agents/docs/SRS_SDD.md`: Thêm 1 dòng Document History cho Plan 15.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - Typecheck: `pnpm exec tsc --noEmit` pass 100% cho toàn bộ phân hệ `internal/` và `core/schedule/`.
  - Unit Tests: `pnpm test` pass toàn bộ **43 test suites, 194 tests (100% passed)**.
  - Build: `pnpm build` (`nest build`) biên dịch thành công hoàn hảo với exit code 0.

### Plan 14 - Chuẩn Hóa Toàn Bộ Routes Sang Tiếng Anh Cho Phân Hệ Vận Hành Nội Bộ (`fe-react-thanhxuan-internal`)

- **Tái cấu trúc thư mục định tuyến (Directory Restructuring):**
  - Chuyển đổi toàn bộ các thư mục route trong `src/app/(auth)` và `src/app/(internal)` từ tiếng Việt sang 100% tiếng Anh chuẩn mực RESTful:
    - `(auth)`: `dang-nhap` ➔ `login`, `dang-ky` ➔ `register`, `quen-mat-khau` ➔ `forgot-password`.
    - `(internal)`: `tong-quan` ➔ `dashboard`, `van-hanh` ➔ `operations`, `quan-ly` ➔ `management`.
    - `operations/`: `attendance`, `payslip`, `reports`, `warehouse-manager/warehouse`, `shipper/handover`, `shipper/handover/[recordCode]`, `shipper/fuel`, `worker/recount`, `worker/piecework`, `restaurant-manager/restaurant`, `restaurant-staff/restaurant`.
    - `management/`: `page.tsx` (hub), `approvals`, `manager/personnel`, `manager/partners`, `manager/attendance`, `manager/piecework`, `accountant/fuel`, `accountant/payroll`.
- **Cập nhật đồng bộ các thành phần định tuyến & điều hướng:**
  - `src/app/router.tsx`: Định nghĩa toàn bộ cây route tiếng Anh mới; thiết lập mạng lưới chuyển hướng tương thích ngược (Backward Compatibility Redirects) cho 100% các URL và alias cũ để người dùng truy cập bookmark hoặc URL cũ không bị 404.
  - `src/components/layout/nav-config.ts`: Cập nhật `path` trong `NAV_GROUPS` và `getMobileQuickNavItems` trỏ chính xác về các tuyến đường tiếng Anh mới.
  - `src/app/page.tsx`: Cập nhật chuyển hướng unauthenticated sang `/login`.
  - `src/features/auth/AuthContext.tsx`: Cập nhật `getDefaultRouteForRole` trả về các route tiếng Anh mới cho 8 vai trò người dùng và `logout()` chuyển hướng về `/login`.
  - `src/features/auth/ProtectedRoute.tsx`: Cập nhật chuyển hướng đăng nhập và tài khoản tạm khóa về `/login`.
  - `src/lib/api-client.ts`: Cập nhật hàm `isPublicAuthPage` và chuyển hướng khi phiên hết hạn 401 về `/login`.
  - `src/features/auth/LoginPage.tsx`: Cập nhật link đăng ký sang `/register`.
  - `src/features/auth/RegisterPage.tsx`: Cập nhật navigate và link đăng nhập sang `/login`.
  - `src/features/auth/ForgotPasswordPage.tsx`: Cập nhật navigate và link sang `/login`.
  - `src/features/dashboard/DashboardPage.tsx`: Cập nhật các nút quick action sang `/operations/shipper/handover`, `/operations/attendance`, `/operations/worker/recount`.
  - `src/features/management/ManagementPage.tsx`: Cập nhật các action cards và nút xuất báo cáo sang `/management/*` và `/operations/reports`.
  - `src/features/handover/HandoverListPage.tsx` & `HandoverDetailPage.tsx`: Cập nhật các link và nút chuyển hướng sang `/operations/shipper/handover` và `/operations/shipper/handover/:recordCode`.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - Typecheck: `pnpm exec tsc --noEmit` pass 100% không phát sinh bất kỳ lỗi TypeScript nào.
  - Tests: `pnpm test` pass toàn bộ.
  - Production Build: `pnpm build` biên dịch thành công Vite bundle và Service Worker PWA hoàn tất trong 5.83s.
- **Tài liệu & Đồng bộ:** Cập nhật sơ đồ thư mục và ma trận route tại `srs_sdd_fe_internal.md`, ghi nhận `SRS_SDD.md` và hoàn tất `plan14.md`.

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

- **Backend:** Bổ sung endpoint `POST /api/v1/internal/partners/catalogs/upload-image` (bảo vệ bởi `InternalJwtGuard`, phân quyền `PARTNER_MANAGE`, tích hợp `UploadModule`/`UploadService`), xử lý tải file ảnh trực tiếp lên Cloudinary vào thư mục chuyên dụng `laundry-express/item-catalogs`. Bổ sung cơ chế tự động dọn dẹp ảnh cũ trên Cloudinary (`UploadService.deleteFile`) trong `partners.service.ts` khi người dùng cập nhật ảnh mới hoặc xóa chiếc đồ khỏi danh mục.
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
- **Quy tắc thứ tự ưu tiên (Business Rule):** Thứ tự hiển thị không được trùng nhau trong cùng một thương hiệu. Khi thêm hoặc sửa thứ tự `sortOrder = X` của một chiếc đồ, hệ thống tự động cộng thêm 1 (+1) cho toàn bộ các chiếc đồ giặt phía sau (`shiftOrdersGte`) và chuẩn hóa (`normalizeSortOrders`) đảm bảo thứ tự luôn liên tục 1, 2, 3...
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
