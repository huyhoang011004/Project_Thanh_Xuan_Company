# NHẬT KÝ THAY ĐỔI HỆ THỐNG (CHANGELOG)

Tài liệu ghi nhận toàn bộ lịch sử tiến hóa, các giai đoạn nâng cấp, bugfix và triển khai tính năng của Hệ sinh thái Công ty Thanh Xuân qua từng Plan.

## 2026-11-01

### Plan 63: Chiến Lược Tối Ưu Hóa SEO Toàn Diện Dịch Vụ Giặt Là & Dịch Vụ Vệ Sinh B2B (fe-nextjs-thanhxuan-laundry)

- **Bối cảnh & Vấn đề giải quyết:**
  - Khách hàng phản ánh website `https://thanhxuanlaundry.com/` mới chỉ lọt top Google với từ khóa thương hiệu (`thanh xuân laundry`), trong khi các từ khóa mang lại doanh thu chuyển đổi chính về dịch vụ Giặt là (`dịch vụ giặt là`, `giặt sấy`, `giặt ủi`, `giặt là công nghiệp hà nội`) và dịch vụ Vệ sinh (`dịch vụ vệ sinh công nghiệp hà nội`, `vệ sinh văn phòng`, `giặt thảm sofa`) chưa lên trang nhất.
  - Phân tích nguyên nhân: Do nhắm thẳng từ khóa ngắn quá sớm khi chưa có Topical Authority, thẻ Title/Description/Keywords thiếu các từ khóa hạt nhân có search volume cao, thiếu Schema Rich Snippets để kích hoạt FAQ/Ratings trên Google Search, và thiếu mạng lưới liên kết nội bộ theo mô hình Topic Cluster.

- **Các thay đổi kiến trúc & kỹ thuật chi tiết:**
  1. **Tối ưu On-Page Metadata cho Dịch Vụ Giặt Là (`src/app/layout.tsx` & `src/app/(public)/page.tsx`):**
     - Title mặc định: Đổi thành `"Dịch Vụ Giặt Là, Giặt Sấy Công Nghiệp Uy Tín Hà Nội | Thanh Xuân Laundry"`.
     - Description: Chứa đầy đủ bộ từ khóa chuyển đổi cao (`dịch vụ giặt là`, `giặt sấy công nghiệp`, `nhà hàng`, `khách sạn`, `Hà Nội`, `hóa đơn VAT`).
     - Keywords: Bổ sung 14 từ khóa hạt nhân có lượt tìm kiếm lớn nhất ngành giặt là.
     - Schema Root: Nâng cấp `@type` thành `["DryCleaningOrLaundry", "LaundryService"]`.
  2. **Tối ưu On-Page & Schema Đa Thực Thể Cho Trang Vệ Sinh (`src/app/(public)/vesinh/page.tsx`):**
     - Metadata: Title `"Dịch Vụ Vệ Sinh Công Nghiệp Hà Nội, Vệ Sinh Văn Phòng Trọn Gói | Thanh Xuân Cleaning"`, Canonical URL cố định `https://vesinh.thanhxuanlaundry.com`.
     - Schema JSON-LD đa thực thể: Nhúng `@graph` bao gồm `CleaningService` (Hotline, GPS, OfferCatalog), `FAQPage` (tự động map 6 câu hỏi FAQ thực tế để kích hoạt Google Rich Snippets FAQ accordion), và `BreadcrumbList`.
     - Heading H1/H2: Rà soát và chuẩn hóa `VesinhHeroSectionComponent` và `VesinhServicesGridComponent` chứa đúng từ khóa dịch vụ B2B mục tiêu.
  3. **Cập nhật Sitemap (`src/app/sitemap.ts`):**
     - Nâng priority các trang bài viết dịch vụ (`/dich-vu/*`) từ 0.6 lên 0.85 (ưu tiên hơn bài viết tin tức 0.7).
  4. **Ban hành cẩm nang Topic Cluster (`SEO_CONTENT_CLUSTER_GUIDE.md`):**
     - Hướng dẫn đội ngũ Marketing viết bài vệ tinh trên CMS (`/admin/articles`) và cách chèn anchor text ngữ cảnh trỏ dòng sức mạnh link nội bộ về các trang Pillar.

- **Kết quả Kiểm Chứng (Verification):**
  - Typecheck `pnpm exec tsc --noEmit` pass 100% (0 errors).
  - Next.js Production Build: `pnpm build` pass 100%, render thành công toàn bộ 15/15 routes tĩnh và động.

## 2026-10-31

### Fix (Header UX): Giữ TopBar Đầu Trang Trên Mobile & Tự Động Ẩn Khi Cuộn (fe-nextjs-thanhxuan-laundry)

- **Bối cảnh & Yêu cầu:**
  - Khách hàng yêu cầu: Vẫn để lại thanh TopBar (hotline & ưu đãi) trên mobile ở đầu trang, nhưng chỉ khi cuộn trang (kéo lên xem nội dung) thì mới ẩn đi, tránh hiện tượng Header bị phình to hoặc phập phồng giữa chừng khi vuốt kéo lên lúc đang đọc bài.
- **Nguyên nhân gốc rễ (Root Cause Analysis):**
  - Trước đây, logic lắng nghe sự kiện scroll so sánh gia số `currentScrollY > lastScrollY.current` khiến TopBar liên tục ẩn/hiện bất cứ khi nào ngón tay vuốt ngược một khoảng ngắn ở giữa trang, làm Header thay đổi chiều cao và font size đột ngột.
- **Chi tiết kỹ thuật thực hiện:**
  1. **Hiển thị TopBar trên Mobile & Desktop (`PublicTopBarComponent.tsx`):**
     - Giữ TopBar hiển thị trên cả di động và máy tính (`flex`) khi ở đỉnh trang.
     - Áp dụng transition mượt mà và ẩn hoàn toàn khi `isScrolledDown` (`max-h-0 py-0 opacity-0 pointer-events-none`).
  2. **Chuẩn hóa Logic Scroll Ngưỡng Cố Định (`HeaderClientWrapperComponent.tsx`):**
     - Đơn giản hóa trạng thái cuộn: `setIsScrolledDown(window.scrollY > 40)`.
     - Khi khách hàng ở đầu trang (`scrollY <= 40`): TopBar hiển thị đầy đủ thông tin.
     - Khi cuộn trang đọc nội dung (`scrollY > 40`): TopBar tự động ẩn đi để mở rộng không gian đọc. Trong suốt quá trình lướt giữa trang, TopBar giữ nguyên trạng thái ẩn, không phình to khi vuốt ngược. Chỉ khi cuộn hẳn về đỉnh trang mới hiển thị lại.
  3. **Verification:**
     - Typecheck `pnpm exec tsc --noEmit` pass 100%.
     - Build Next.js `pnpm build` pass 100%.

### Fix (Routing & Header): Sửa Lỗi Crash 500 Trang Chi Tiết Dịch Vụ /dich-vu/[...slug] & Khôi Phục Header Nguyên Bản (fe-nextjs-thanhxuan-laundry)

- **Bối cảnh & Yêu cầu:**
  - Khách hàng phản ánh lỗi truy cập trang chi tiết dịch vụ `https://thanhxuanlaundry.com/dich-vu/[...slug]` trả về mã lỗi HTTP 500.
  - Đồng thời, khách hàng đề xuất phương án: Bỏ cấu hình gộp `/vesinh` trên thanh điều hướng Header, để Header trở lại như trước (4 tab tinh gọn: Trang chủ, Dịch vụ, Tin tức, Giới thiệu). Khách muốn xem dịch vụ vệ sinh sẽ vào tên miền phụ `https://vesinh.thanhxuanlaundry.com/` hoặc chủ động truy cập URL `/vesinh`.
- **Nguyên nhân gốc rễ (Root Cause Analysis):**
  - Tuyến `src/app/(public)/dich-vu/[...slug]/page.tsx` và `gioi-thieu/[...slug]/page.tsx` thực hiện gọi `fetch` thô trực tiếp tới Backend mà không qua tầng Service chuẩn hóa response.
  - Backend NestJS kích hoạt `TransformInterceptor` bọc toàn bộ kết quả trả về trong cấu trúc ApiResponse `{ success: true, data: ... }`. Đối với endpoint bài viết phân trang, `unpinnedData.data` là một object `{ data: [...], total: N }` chứ không phải một mảng thuần.
  - Việc gán `otherArticles = unpinnedData?.data || []` khiến biến `otherArticles` mang kiểu Object thay vì Array. Khi truyền xuống component hiển thị và thực hiện `otherArticles.map(...)`, Next.js quăng lỗi runtime crash `TypeError: otherArticles.map is not a function`, dẫn đến mã lỗi 500 Internal Server Error và làm `category.name` bị `undefined`.
- **Chi tiết kỹ thuật thực hiện:**
  1. **Khắc phục lỗi 500 tại `/dich-vu/[...slug]` và `/gioi-thieu/[...slug]`:**
     - Tái cấu trúc `src/app/(public)/dich-vu/[...slug]/page.tsx` và `src/app/(public)/gioi-thieu/[...slug]/page.tsx` chuyển sang sử dụng trực tiếp các phương thức an toàn của `PublicCategoriesService` và `PublicArticlesService` (`getCategoryBySlug`, `getArticleBySlug`, `getPinnedArticles`, `getPaginatedArticles`).
     - Tầng Service đã được thiết kế sẵn cơ chế unwrap an toàn cho discriminated union, đảm bảo `otherArticles` luôn là Array thuần túy và metadata lấy đúng thuộc tính `meta_title`, `name`, `description`.
  2. **Khôi phục Header thanh điều hướng nguyên bản:**
     - `PublicMainNavBarComponent.tsx`: Trả về 4 tab tiêu chuẩn (`Trang chủ`, `Dịch vụ`, `Tin tức`, `Giới thiệu`), gỡ bỏ biểu tượng mũi tên dropdown `ChevronDown` và bỏ logic kiểm tra active chung với `/vesinh`.
     - `PublicSubMenuComponent.tsx`: Trả về submenu hiển thị danh sách các dịch vụ con của `serviceCategories` thuần túy như ban đầu, dỡ bỏ 2 nút "Giặt Sấy Công Nghiệp" và "Vệ Sinh Doanh Nghiệp"; loại bỏ hoàn toàn các kiểu `any`.
     - `HeaderClientWrapperComponent.tsx`: Bỏ nhánh gán `currentMenu = 'vesinh'` khi ở URL `/vesinh`, giúp thanh SubMenu tự động ẩn sạch sẽ khi người dùng duyệt trang vệ sinh.
  3. **Verification:**
     - Typecheck `pnpm exec tsc --noEmit` pass 100% không lỗi.
     - Build Next.js `pnpm build` biên dịch thành công 15/15 routes tĩnh và động.
     - Curl kiểm thử phản hồi thành công và không còn lỗi crash 500.

### Plan 62: Xây Dựng Hệ Thống Quản Trị Cài Đặt CMS Cho Trang Dịch Vụ Vệ Sinh (/admin/settings/vesinh & /vesinh) & Chuẩn Hóa Khối Form Liên Hệ (fe-nextjs-thanhxuan-laundry & be-nestjs-thanhxuan)

- **Bối cảnh & Yêu cầu:**
  - Sau khi hoàn thành trang đích dịch vụ vệ sinh và tên miền phụ tại Plan 61, khách hàng yêu cầu trang bị module CMS quản trị cài đặt riêng cho trang Vệ Sinh tương tự như trang chủ (`/admin/settings/home`), cho phép Quản trị viên tùy biến nội dung Hero Banner, Tiêu đề, Hotline riêng, Phần giới thiệu, Lý do chọn chúng tôi và câu hỏi thường gặp FAQs trực tiếp từ giao diện Admin.
  - Đồng thời, phát hiện khối form đăng ký liên hệ tại chân trang `/vesinh` bị thừa một lớp container `div` bọc bên ngoài gây lặp style bo góc và viền thẻ bài, cần dỡ bỏ lớp bọc này.
- **Chi tiết kỹ thuật thực hiện:**
  1. **Mở rộng Backend Setting Schema & DTO (`be-nestjs-thanhxuan`):**
     - Sửa `Setting` schema (`setting.schema.ts`): Bổ sung thuộc tính `vesinhConfig: { heroBannerImage?, heroTitle?, heroSubtitle?, hotline?, introTitle?, introDescription?, whyChooseUsTitle?, whyChooseUsDescription?, whyChooseUsImage?, whyChooseUsItems?, faqs? }` với kiểu dữ liệu `Object` và mặc định `{}`.
     - Sửa `UpdateSettingsDto` (`update-settings.dto.ts`): Bổ sung trường tùy chọn `vesinhConfig?: Record<string, unknown>` có `@IsOptional()` và `@IsObject()`.
  2. **Frontend CMS Types & Custom Hook Handlers (`fe-nextjs-thanhxuan-laundry`):**
     - `admin-settings.types.ts`: Khai báo interface `IVesinhConfig` và nhúng trường `vesinhConfig` vào `IAdminSettingsForm`.
     - `useAdminSettingsVesinhHandlers.ts`: Tách toàn bộ logic quản lý state của trang cài đặt vệ sinh thành custom hook riêng biệt (< 120 dòng), xử lý cập nhật trường văn bản, thêm/sửa/xóa cam kết lý do chọn và câu hỏi FAQs.
     - `useAdminSettings.ts`: Tích hợp các handlers của vệ sinh vào hook quản trị settings tổng thể.
  3. **Xây dựng các Form Sections & Tuyến CMS `/admin/settings/vesinh`:**
     - Phân rã giao diện thành 3 Form Sections độc lập tuân thủ kỷ luật `< 250 - 300 dòng`:
       - `VesinhHeroFormSection.tsx` (114 dòng): Biên tập Banner, Tiêu đề, Mô tả phụ và Hotline riêng cho trang Vệ sinh.
       - `VesinhWhyChooseUsFormSection.tsx` (128 dòng): Biên tập tiêu đề, mô tả và danh sách lý do lựa chọn kèm nút thêm/xóa linh hoạt.
       - `VesinhFaqFormSection.tsx` (116 dòng): Biên tập danh sách câu hỏi & câu trả lời FAQs accordion.
     - `SettingEditorVesinhComponent.tsx` (108 dòng): Bố cục tổng thể của trang cài đặt vệ sinh, nhúng 3 sections và nút bấm "Lưu thay đổi" có hiệu ứng spinner lưu dữ liệu.
     - `src/app/(admin)/admin/settings/vesinh/page.tsx`: Route trang CMS Next.js.
  4. **Tích hợp Điều Hướng CMS Admin:**
     - `SettingsPage.tsx`: Thêm thẻ card "Cài đặt Trang Vệ Sinh" với icon `Sparkles`, mô tả rõ ràng và nút liên kết trực tiếp tới `/admin/settings/vesinh`.
     - `AdminSidebarComponent.tsx`: Thêm mục "Trang vệ sinh" vào danh sách menu con của mục Cài đặt.
  5. **Dữ Liệu Động Ra Giao Diện Public `/vesinh` & Gỡ Lớp Bọc Thừa Form:**
     - `src/app/(public)/vesinh/page.tsx`: Fetch dữ liệu `vesinhConfig` từ API `PublicSettingsService.getSettings()`, ưu tiên hotline vệ sinh và truyền dữ liệu xuống component `VesinhHomePage`.
     - `VesinhHomePage.tsx` và các sub-components (`VesinhHeroSectionComponent`, `VesinhIntroSectionComponent`, `VesinhWhyChooseUsComponent`, `VesinhFaqSectionComponent`): Nhận dynamic props từ CMS và luôn duy trì bộ dữ liệu fallback mặc định tối ưu SEO khi CMS chưa cấu hình.
     - `VesinhPreFooterCtaComponent.tsx`: Dỡ bỏ thẻ `div className="bg-white ... rounded-3xl ... shadow-xl border"` bọc thừa bên ngoài component `<Contact />`, để `<Contact defaultCategory="dich-vu-ve-sinh" />` tự quản lý khung viền bo cong của mình.
  6. **Verification & DoD:**
     - Backend NestJS: `pnpm exec tsc --noEmit` pass 100%, `nest build` pass 100%.
     - Frontend Next.js: `pnpm exec tsc --noEmit` pass 100%, `next build` biên dịch thành công toàn bộ 15 routes tĩnh/động, sinh route tĩnh `/admin/settings/vesinh` và `/vesinh`.
     - Đồng bộ 5 trụ cột tài liệu (`DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `srs_sdd_fe_laundry.md`, `SRS_SDD.md`, `CHANGELOG.md`, `plan62.md`).
     - Tự động commit và push lên nhánh `dev`.

### Plan 61: Thiết Lập Trang Dịch Vụ Vệ Sinh (vesinh.thanhxuanlaundry.com & /vesinh) Tối Ưu SEO B2B Dựa Trên Trang Chủ (fe-nextjs-thanhxuan-laundry & Hạ Tầng Nginx)

- **Bối cảnh & Yêu cầu:**
  - Trang chủ `thanhxuanlaundry.com/` chủ yếu tập trung tối ưu SEO cho dịch vụ giặt là công nghiệp.
  - Doanh nghiệp mở rộng mạnh mảng Dịch vụ Vệ sinh Công nghiệp & Doanh nghiệp (văn phòng, tòa nhà, nhà hàng, giặt thảm văn phòng, ghế sofa, trường học, sau xây dựng), cần một trang đích chuyên biệt tại `https://thanhxuanlaundry.com/vesinh` và kích hoạt tên miền phụ `https://vesinh.thanhxuanlaundry.com/` để tối ưu SEO Google độc lập và thu hút leads B2B.
- **Chi tiết kỹ thuật thực hiện:**
  1. **Next.js Subdomain Rewriting (`src/middleware.ts`):**
     - Mở rộng matcher trong `middleware.ts` để đón nhận request từ các tên miền phụ (loại trừ static files, API, favicon).
     - Kiểm tra header `host`: Khi request trỏ tới `vesinh.thanhxuanlaundry.com` tại root path `/`, tự động thực hiện URL rewrite ngầm sang `/vesinh` (`NextResponse.rewrite`), giữ nguyên URL trên trình duyệt khách hàng và công cụ tìm kiếm.
     - Đồng thời đảm bảo truy cập trực tiếp `https://thanhxuanlaundry.com/vesinh` vẫn hoạt động song song mượt mà.
  2. **Trang Đích Dịch Vụ Vệ Sinh Chuẩn SEO (`src/app/(public)/vesinh/page.tsx` & `src/features/public/vesinh/`):**
     - Phân rã mô-đun thành 8 tệp độc lập tuân thủ nghiêm ngặt kỷ luật chia nhỏ file (`< 250 - 300 dòng`, thực tế đều `< 135 dòng`):
       - `VesinhHomePage.tsx`: Điều phối các section theo bố cục Server Component (RSC).
       - `VesinhHeroSectionComponent.tsx`: Banner, tiêu đề SEO định vị thương hiệu, hotline tư vấn, 3 cam kết nhanh (Khảo sát 0đ, Hóa đơn VAT, Thi công 24/7) và nút kêu gọi hành động.
       - `VesinhIntroSectionComponent.tsx`: Giới thiệu năng lực máy móc (máy chà sàn liên hợp, hút bụi 3 motor, phun hút hơi nước nóng 140°C khử khuẩn 99.9%) và hóa chất sinh học đạt chuẩn MSDS.
       - `VesinhServicesGridComponent.tsx`: Lưới 6 gói dịch vụ trọng điểm B2B (Văn phòng & Tòa nhà, Giặt thảm & Ghế sofa, Nhà hàng & Bếp ăn, Trường học & KTX, Sau xây dựng, Nhà xưởng).
       - `VesinhProcessSectionComponent.tsx`: Quy trình 5 bước minh bạch (Tiếp nhận $\rightarrow$ Khảo sát thực tế 0đ $\rightarrow$ Báo giá trọn gói $\rightarrow$ Thi công chuyên nghiệp $\rightarrow$ Nghiệm thu & Hóa đơn VAT).
       - `VesinhWhyChooseUsComponent.tsx`: 6 lý do lựa chọn (Pháp nhân VAT, Bảo hiểm tài sản 100%, Nhân sự xác thực lý lịch, Máy móc hiện đại, Chiết khấu định kỳ tới 25%, Hỗ trợ 24/7).
       - `VesinhFaqSectionComponent.tsx`: Bảng accordion câu hỏi thường gặp giải đáp chi phí khảo sát, thời gian thi công ngoài giờ, hóa chất, VAT, thời gian khô thảm.
       - `VesinhPreFooterCtaComponent.tsx`: Khối lead magnet và form đăng ký khảo sát miễn phí tận nơi trong 15 phút.
  3. **SEO On-Page & Schema Markup Chuyên Sâu:**
     - Tối ưu Metadata (Title, Description, Keywords, OpenGraph) phủ rộng các từ khóa vệ sinh công nghiệp Hà Nội.
     - Nhúng dữ liệu có cấu trúc JSON-LD chuẩn `CleaningService` / `LocalBusiness` với thông tin pháp lý, số hotline, giờ mở cửa và địa bàn phục vụ.
     - Thêm tuyến đường `/vesinh` vào `src/app/sitemap.ts` với `priority: 0.9` và `changeFrequency: 'daily'`.
  4. **Thanh Điều Hướng & Mobile Navigation:**
     - `PublicMainNavBarComponent.tsx`: Tối ưu thanh điều hướng xuống đúng 4 tab (`Trang chủ` | `Dịch vụ ▾` | `Tin tức` | `Giới thiệu`) theo yêu cầu tinh giản; tab `Dịch vụ ▾` nhận diện trạng thái active cho cả `/dich-vu` và `/vesinh`.
     - `PublicSubMenuComponent.tsx`: Tích hợp 2 badge nổi bật hàng đầu (🧺 Giặt Sấy Công Nghiệp & ✨ Vệ Sinh Doanh Nghiệp) khi mở menu `Dịch vụ`, đồng thời ẩn hoàn toàn thanh submenu khi ở trang vệ sinh để giao diện luôn sạch đẹp.
     - `PublicMobileBottomNavComponent.tsx`: Đồng bộ 4 tab đáy chuẩn mực trên di động (`Trang chủ`, `Dịch vụ`, `Tin tức`, `Giới thiệu`).
     - `HeaderClientWrapperComponent.tsx`: Quản lý trạng thái đóng/mở menu thông suốt.
  5. **Hạ Tầng Nginx Reverse Proxy:**
     - Cập nhật cấu hình `/etc/nginx/sites-available/thanhxuanlaundry.com` bổ sung `vesinh.thanhxuanlaundry.com` vào `server_name` cho cả khối HTTP port 80 và HTTPS port 443.
     - Kiểm tra cú pháp `nginx -t` pass 100% và reload Nginx an toàn.
  6. **Verification:**
     - TypeScript strict check `pnpm exec tsc --noEmit` pass không lỗi.
     - Next.js production build (`pnpm build`) biên dịch thành công 15/15 routes tĩnh/động, sinh route tĩnh `/vesinh` và `/sitemap.xml`.
     - ESLint trên toàn bộ các file mới viết đạt chuẩn 100% (0 errors, 0 warnings).

### Fix (Branding & Navigation): Chuẩn hóa Favicon & Bỏ nút Nội bộ trên Web Giặt Là, bổ sung nhãn 'NỘI BỘ' chân Icon trang Login Cổng Quản Vận (fe-nextjs-thanhxuan-laundry & fe-react-thanhxuan-internal)

- **Bối cảnh & Yêu cầu:**
  - Trang web khách hàng công khai `https://thanhxuanlaundry.com/`: Gỡ bỏ khối icon và nhãn "Nội bộ" khỏi thanh điều hướng chính (header) để giữ nguyên nhận diện thương hiệu khách hàng; chuẩn hóa Favicon trang web thành `icon.svg` sắc nét.
  - Cổng điều hành nội bộ `https://noibo.thanhxuanlaundry.com/login`: Bổ sung nhãn badge `NỘI BỘ` ở chân icon logo vòng tròn trên màn hình Đăng nhập (và Đăng ký) tạo điểm nhấn nhận diện phân hệ nội bộ chuẩn xác theo mẫu thiết kế.
- **Chi tiết kỹ thuật thực hiện:**
  1. **Web Giặt Là & CMS (`fe-nextjs-thanhxuan-laundry`):**
     - `PublicMainNavBarComponent.tsx`: Gỡ bỏ khối liên kết icon SVG kèm badge "Nội bộ", trả về khối Text Logo thương hiệu thuần túy dẫn về trang chủ `/`.
     - `src/app/layout.tsx`: Bổ sung cấu hình metadata `icons` ưu tiên `icon.svg` (`type: "image/svg+xml"`), shortcut và apple icon.
     - `src/app/icon.svg`: Sao chép `icon.svg` vào metadata app route Next.js để sinh thẻ `<link rel="icon">` chuẩn xác cho mọi trình duyệt hiện đại.
  2. **Cổng Vận Hành Nội Bộ (`fe-react-thanhxuan-internal`):**
     - `AppLogo.tsx`: Bổ sung thuộc tính `badge?: string` và `badgeClassName?: string`. Khi có `badge`, bọc logo vào khung tròn `rounded-full border border-sky-300` với nền trắng `bg-white dark:bg-slate-800` và nhãn `NỘI BỘ` tinh tế ở chân icon (`bg-sky-50 text-sky-600 border-sky-300 font-bold uppercase`).
     - `LoginPage.tsx` & `RegisterPage.tsx`: Cập nhật `AppLogo` sử dụng `badge="NỘI BỘ"`, căn giữa thẩm mỹ và tối ưu kích thước hiển thị trên cả mobile và desktop.
  3. **Verification & Deployment:**
     - Typecheck strict (`tsc --noEmit`) pass 100% trên cả 2 ứng dụng.
     - Build pass 100% trên cả Next.js 16 (`pnpm build`) và React Vite PWA (`pnpm build`).
     - Triển khai bundle mới vào `/var/www/noibo/dist/`, gán quyền www-data và reload Nginx thành công.

### Plan 60: Mở Rộng Đăng Nhập Không Cần Mật Khẩu Bằng Face ID / Vân Tay (WebAuthn / Passkeys) Cho Mọi Tài Khoản (be-nestjs-thanhxuan & fe-react-thanhxuan-internal)

- **Bối cảnh & Mục tiêu:**
  - Sau khi tích hợp thành công WebAuthn FIDO2 cho tính năng chấm công (Plan 59), người dùng yêu cầu mở rộng phạm vi: Cho phép **MỌI TÀI KHOẢN** thuộc toàn bộ các vai trò (`ADMIN`, `OPERATOR`, `MANAGER`, `WAREHOUSE_MANAGER`, `SHIPPER`, `WORKER`, `ACCOUNTANT`, `PARTNER`) được đăng nhập trực tiếp từ màn hình Login bằng Face ID / Vân tay mà **hoàn toàn không cần nhập mật khẩu** (Passwordless Authentication).
- **Chi tiết kỹ thuật đã thực hiện:**
  1. **Backend NestJS (`be-nestjs-thanhxuan`):**
     - Mở rộng DTO `webauthn.dto.ts`: Bổ sung `WebAuthnLoginOptionsDto` (nhận `identifier` tùy chọn) và `VerifyWebAuthnLoginDto` (nhận `response: AuthenticationResponseJSON`).
     - Cập nhật `StaffAccountRepository`: Thêm phương thức `findByWebAuthnCredentialId(credentialId: string)` tra cứu tài khoản trực tiếp qua ID khóa sinh trắc học đã lưu.
     - Cập nhật `WebAuthnService`:
       - `generateLoginOptions(identifier?, originHeader?)`: Phát sinh challenge ngẫu nhiên với `userVerification: 'preferred'`, đính kèm `allowCredentials` nếu người dùng đã nhập tên đăng nhập trước đó.
       - `verifyLogin(dto, userAgent?, originHeader?)`: Tra cứu tài khoản theo `credentialId`, kiểm tra trạng thái khóa `validateAccountLockout` và `validateAccountStatus`, xác minh chữ ký phần cứng qua `@simplewebauthn/server`, cập nhật counter chống tấn công sao chép, reset số lần đăng nhập sai, cấp Access Token & Refresh Token chuẩn mực cho nhân sự.
     - Cập nhật `WebAuthnController`: Tách 2 endpoint public không yêu cầu JWT Bearer (`POST /auth/webauthn/login-options` và `POST /auth/webauthn/login-verify`) phục vụ đăng nhập không mật khẩu, trong khi các endpoint đăng ký thiết bị vẫn được bảo vệ bởi `InternalJwtGuard`.
  2. **Frontend React PWA (`fe-react-thanhxuan-internal`):**
     - Xây dựng `webauthnAuth.service.ts`: Gọi API Backend nhận options và gọi `@simplewebauthn/browser` (`startAuthentication`) để kích hoạt cảm biến khuôn mặt/vân tay trên máy, tự động lưu session vào Storage và kích hoạt sự kiện `auth:token-refreshed`.
     - Xây dựng Component `PasskeyLoginButton.tsx` (< 250 dòng): Nút bấm sinh trắc học sang trọng trên `LoginPage.tsx`, tự động nhận diện icon Face ID trên Apple thiết bị hoặc icon Vân tay trên Android/Windows, xử lý loading và hiển thị thông báo lỗi thân thiện.
     - Tích hợp vào `LoginPage.tsx`: Cho phép đăng nhập 1 chạm vào đúng màn hình theo vai trò (0.5 giây).
     - Xây dựng Modal `PasskeyManagementModal.tsx` (< 250 dòng): Cho phép mọi tài khoản (Admin, Quản lý, Kế toán, Tài xế, Thợ) tự kích hoạt thêm máy mới hoặc xóa thiết bị cũ khi đổi điện thoại.
     - Tích hợp vào `AppHeader.tsx`: Thêm mục "Bảo mật Face ID / Vân tay" trong dropdown avatar người dùng.
  3. **Verification & Deployment:**
     - Typecheck strict và Build pass 100% cho cả Backend NestJS và Frontend React PWA.
     - Cập nhật dist vào container `laundry_backend` và restart thành công (NestJS khởi động trong 430ms).
     - Deploy dist PWA vào `/var/www/noibo/dist/` và reload Nginx thành công.
     - Test gọi API `POST /auth/webauthn/login-options` trả về challenge thành công mà không bị chặn bởi JWT Guard.
  4. **Tài liệu & Đồng bộ:**
     - Đồng bộ `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md` và `CHANGELOG.md`.

### Plan 59: Tích Hợp Xác Thực Sinh Trắc Học Thiết Bị (WebAuthn / Passkeys - Face ID & Vân Tay) & Tối Ưu Chụp Ảnh Hiện Trường Cho Chấm Công (be-nestjs-thanhxuan & fe-react-thanhxuan-internal)

- **Bối cảnh & Bài toán thực tế:**
  - Khi triển khai On-Device AI Face Verification (Plan 58), phát sinh tình huống thực tế tại xưởng giặt là:
    - Công nhân đeo kính cận dày bị gọng kính và tròng phản quang làm sai lệch 6 điểm mốc mí mắt, khiến chỉ số EAR (Eye Aspect Ratio) không chạm ngưỡng < 0.22 để nhận diện chớp mắt tự nhiên.
    - Công nhân đeo khẩu trang chống bụi xưởng bị che khuất 50% diện mạo khuôn mặt, khiến mô hình AI không thể nhận diện được cấu trúc mặt để trích xuất vector.
  - Người dùng đề xuất giải pháp tận dụng tính năng **xác thực sinh trắc học phần cứng của điện thoại cá nhân** (Face ID trên iPhone, cảm biến Vân tay trên Android).
- **Giải pháp & Kiến trúc triển khai (Plan 59):**
  1. **Tích hợp Chuẩn Quốc Tế WebAuthn (FIDO2 / Passkeys / Web Authentication API):**
     - **Backend (`be-nestjs-thanhxuan`):**
       - Cài đặt `@simplewebauthn/server@14.0.3`.
       - Mở rộng Schema `staff-account.schema.ts`: Bổ sung sub-schema `WebAuthnCredential` (`credentialId`, `publicKey`, `counter`, `transports`, `deviceName`, `createdAt`) và trường bảo mật `currentWebAuthnChallenge` (chống Replay Attack).
       - Mở rộng Schema `attendance-record.schema.ts`: Bổ sung cờ `isBiometricDeviceVerified: boolean` trong `CheckInInfo` và `CheckOutInfo`.
       - Xây dựng `WebAuthnService` (`webauthn.service.ts`) và `WebAuthnController` (`webauthn.controller.ts`) với 6 endpoints bảo mật tại `/api/v1/internal/auth/webauthn/*`:
         - `POST /register-options`: Sinh challenge đăng ký thiết bị mới, hỗ trợ Relying Party ID động (`noibo.thanhxuanlaundry.com`, `thanhxuanlaundry.com`, `localhost`).
         - `POST /register-verify`: Xác thực chữ ký Attestation, lưu Public Key vào tài khoản.
         - `POST /auth-options`: Sinh challenge xác thực đăng nhập/chấm công.
         - `POST /auth-verify`: Xác thực chữ ký sinh trắc học phần cứng (Face ID / Vân tay).
         - `GET /credentials`: Liệt kê các thiết bị đã liên kết của nhân sự.
         - `DELETE /credentials/:credentialId`: Hủy liên kết thiết bị cũ.
       - Cập nhật `AttendanceService`: Khi có cờ `isBiometricDeviceVerified: true` (đã xác thực qua Face ID / Vân tay phần cứng chính chủ), hệ thống ưu tiên tin cậy cảm biến thiết bị, tự động mở ca `OPEN` hoặc chốt ca `CLOSED` sạch sẽ mà không bị treo vào cảnh báo `NEEDS_REVIEW`.
     - **Frontend PWA (`fe-react-thanhxuan-internal`):**
       - Cài đặt `@simplewebauthn/browser@14.0.0`.
       - Xây dựng Custom Hook `useWebAuthn.ts`: Kiểm tra hỗ trợ Platform Authenticator (`PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable`), kích hoạt đăng ký thiết bị 1 chạm và bật popup quét Face ID / Vân tay siêu tốc (< 0.5s).
       - Xây dựng Component `BiometricPromptBanner.tsx`: Hiển thị banner gợi ý kích hoạt Face ID / Vân tay công thái học trên trang chấm công.
       - Tách Component `AttendanceTodayShiftCardComponent.tsx`: Đảm bảo quy chuẩn kích thước tệp tin tinh gọn (< 250-300 dòng).
       - Cập nhật `AttendancePage.tsx`: Tích hợp xác thực phần cứng Face ID / Vân tay trước khi gửi ca chấm công; hiển thị huy hiệu xác thực trên ảnh selfie.
  2. **Tối ưu Hóa Camera Hiện Trường (Bỏ ép buộc chớp mắt):**
     - Nâng cấp `FaceScannerModal.tsx`:
       - Loại bỏ điều kiện ép buộc phải chớp mắt mới cho chụp ảnh.
       - Bổ sung nút **"CHỤP ẢNH NGAY"** to bản, nổi bật, sẵn sàng bấm chụp trong mọi điều kiện ánh sáng ngược, thợ đeo kính cận hay đeo khẩu trang.
       - Giữ nguyên ảnh selfie camera làm bằng chứng hiện trường trực quan song song với GPS xưởng để Quản lý đối soát.
  3. **Cập nhật Giao diện Quản lý Đối Soát Ca Làm Việc:**
     - Nâng cấp `AttendanceTableComponent.tsx`: Hiển thị huy hiệu `📱 Passkey` (Face ID / Vân tay máy) tại cột Vào ca và Hết ca.
     - Nâng cấp `AttendanceReviewModal.tsx`: Hiển thị chi tiết trạng thái xác thực phần cứng thiết bị song song với điểm tin cậy AI và tọa độ GPS.
- **Kết quả kiểm thử & Triển khai thực tế:**
  - TypeScript strict check và Build pass 100% trên cả 2 ứng dụng Backend và Frontend.
  - Đóng gói standalone bundle `@simplewebauthn/server` tối ưu hóa bộ nhớ VPS.
  - Deploy bản build PWA mới thành công vào `/var/www/noibo/dist/` và reload Nginx.
  - Cập nhật dist Backend vào Docker container `laundry_backend` và restart thành công (NestJS khởi động trong 386ms).
  - Đồng bộ 100% hệ thống 5 trụ cột tài liệu kỹ thuật (`DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`).

## 2026-10-30

### Plan 58: Triển Khai Xác Thực Khuôn Mặt On-Device AI (@vladmandic/face-api) & Liveness Detection (fe-react-thanhxuan-internal & be-nestjs-thanhxuan)

- **Bối cảnh & Bài toán:**
  - Hệ thống chấm công tại xưởng trước đây chỉ yêu cầu thợ chụp ảnh camera selfie tải lên server và kiểm tra Geofencing GPS.
  - Người dùng đặt câu hỏi về giải pháp xác thực khuôn mặt khi check-in để chống điểm danh hộ. Tuy nhiên, nếu dùng Cloud AI (như Gemini Vision API gói Free tier chỉ có 15 RPM / 1,500 RPD), khi nhiều thợ cùng check-in đầu ca sáng 07:30 - 08:00 sẽ dễ bị lỗi nghẽn `429 Too Many Requests` và chi phí bản quyền phát sinh nếu nâng gói thương mại.
- **Giải pháp On-Device AI WebAssembly/WebGL (Plan 58):**
  - Chuyển toàn bộ tải tính toán AI về thiết bị của thợ (Client-Side PWA) sử dụng thư viện `@vladmandic/face-api` chạy trên nền tảng WebAssembly (WASM) và WebGL:
    - **0đ chi phí vận hành:** Hoàn toàn không tốn tiền API hay quota hàng tháng.
    - **0 giới hạn lượt check-in:** Đáp ứng không giới hạn số lượng công nhân check-in cùng lúc.
    - **0% tải CPU/RAM trên VPS:** VPS (< 512MB RAM) chỉ lưu trữ ảnh và nhận vector đặc trưng 128 chiều (`faceDescriptor`), không phải xử lý AI nặng.
    - **Hoạt động hoàn toàn Offline:** Các mô hình mạng nơ-ron thu nhỏ (`tiny_face_detector`, `face_landmark_68_tiny`, `face_recognition`) có tổng dung lượng nhẹ ~6.6MB, lưu tĩnh tại `/public/models/` và được Workbox PWA precache vào cache trình duyệt.
- **Thay đổi chi tiết & Kiến trúc triển khai:**
  1. **Frontend PWA (`fe-react-thanhxuan-internal`):**
     - Cài đặt `@vladmandic/face-api@1.7.15`, cấu hình `runtimeCaching` trong `vite.config.ts`.
     - Xây dựng Custom Hook `useFaceRecognition.ts`: Tải mô hình bất đồng bộ từ `/models/`, hỗ trợ phương thức `scanFrame` quét từng khung hình từ WebRTC Camera, tính toán tỷ lệ mở mắt (Eye Aspect Ratio - EAR) dựa trên 6 điểm mốc mắt để phát hiện hành vi chớp mắt sống thực tế (Liveness Blink Detection), và phương thức `extractDescriptorFromFile` trích xuất vector khuôn mặt từ file ảnh.
     - Xây dựng Modal Camera thông minh `FaceScannerModal.tsx`: Khung Oval định vị gương mặt chuyển màu linh hoạt (Nét đứt trắng $\rightarrow$ Vàng nhấp nháy khi thấy mặt $\rightarrow$ Xanh lá rực rỡ khi hoàn tất chớp mắt tự nhiên), tự động trích xuất vector và chụp ngay lập tức. Hỗ trợ nút chụp thủ công và fallback tải ảnh thường.
     - Cập nhật `AttendancePage.tsx`: Tích hợp mở `FaceScannerModal`, hiển thị huy hiệu `🟢 Khuôn mặt thực (AI)` trên ảnh selfie đã chụp.
     - Tự động lưu mẫu khi đổi Avatar (`ProfileEditModal.tsx` & `useProfileEdit.ts`): Khi thợ đổi ảnh đại diện, hệ thống tự động quét và lưu vector làm mẫu hồ sơ gốc `StaffAccount.faceDescriptor`.
     - Nâng cấp giao diện Quản lý duyệt ca (`AttendanceTableComponent.tsx` & `AttendanceReviewModal.tsx`): Bổ sung huy hiệu AI Face (độ khớp %, liveness) ở cột Vào ca / Hết ca; thiết kế 3 cột ảnh đối chứng trong Modal duyệt (Avatar hồ sơ gốc $\leftrightarrow$ Ảnh selfie vào ca $\leftrightarrow$ Ảnh hết ca) giúp Quản lý xưởng dễ dàng thẩm định mắt thường và phê duyệt.
  2. **Backend API (`be-nestjs-thanhxuan`):**
     - Mở rộng Schema `staff-account.schema.ts`: Bổ sung `@Prop({ type: [Number] }) faceDescriptor?: number[]`.
     - Mở rộng Schema `attendance-record.schema.ts`: Bổ sung schema con `FaceVerificationInfo` (`isVerified`, `confidence`, `isLivePhoto`, `descriptor`) trong `CheckInInfo` và `CheckOutInfo`.
     - Mở rộng DTO `CheckInDto`, `CheckOutDto`, `UpdateProfileDto` hỗ trợ `faceDescriptor` và `isLivePhoto`.
     - Nâng cấp `AttendanceService`:
       - Tự động ghi nhận vector mẫu (Auto-Enrollment) cho nhân sự check-in lần đầu.
       - Tính toán khoảng cách Euclidean (Euclidean Distance): $d = \sqrt{\sum (a_i - b_i)^2}$, điểm tin cậy $\text{confidence} = \max(0, \min(100, \text{round}((1 - d) \times 100)))$.
       - Ngưỡng đối soát chuẩn $d \le 0.50$. Nếu lệch mặt ($d > 0.50$), ca chấm công vẫn được ghi nhận nhưng tự động chuyển trạng thái sang `AttendanceStatus.NEEDS_REVIEW` kèm cờ cảnh báo AI để Quản lý rà soát.
- **Kết quả kiểm thử & Triển khai thực tế:**
  - TypeScript strict check và Build pass 100% trên cả 2 ứng dụng Backend và Frontend.
  - Deploy bản build PWA mới thành công lên `https://noibo.thanhxuanlaundry.com`.
  - Copy bản build backend vào Docker container `laundry_backend` và restart thành công.
  - Cập nhật đầy đủ 5 trụ cột tài liệu kỹ thuật (`DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`).



### Feature: Mở Rộng Hỗ Trợ Đa Dạng Định Dạng Ảnh Cho POST /api/v1/internal/upload (be-nestjs-thanhxuan)

- **Bối cảnh & Yêu cầu:**
  - Endpoint upload ảnh xưởng `POST /api/v1/internal/upload` và `POST /api/v1/internal/uploads` trước đây chỉ cho phép một danh sách hạn chế các định dạng ảnh raster (`.jpg`, `.jpeg`, `.png`, `.webp`, `.heic`, `.heif`, `.gif`) và yêu cầu bắt buộc cả MIME type lẫn extension file đều phải khớp.
  - Người dùng và thiết bị di động (đặc biệt là camera điện thoại đời mới, các trình duyệt xuất blob không đuôi hoặc gửi MIME `application/octet-stream`, định dạng vector SVG hoặc AVIF hiện đại) cần được hỗ trợ tải lên mượt mà mà không bị từ chối 400 Bad Request.
- **Giải pháp & Thay đổi kỹ thuật:**
  1. **Mở rộng bộ lọc MIME Types & File Extensions (`InternalUploadController`):**
     - Bổ sung toàn diện danh mục định dạng: JPEG/JPG, PNG, WebP, HEIC, HEIF, AVIF, SVG, GIF, BMP, TIFF/TIF, ICO.
     - Cho phép chấp nhận các file có MIME type `image/*` (kể cả Blob không đuôi từ camera hoặc Canvas nén ảnh) HOẶC các file có đuôi mở rộng ảnh hợp lệ (kể cả khi thiết bị gửi dạng `application/octet-stream`).
     - Đăng ký alias `@Controller(['uploads', 'upload'])` trên Controller để NestJS xử lý song song cả 2 định dạng đường dẫn URL.
  2. **Cập nhật Lưu Trữ Vật Lý (`UploadService.saveLocalCopy`):**
     - Bổ sung các định dạng mới vào mảng `allowedExts` (`.heic`, `.heif`, `.avif`, `.svg`, `.bmp`, `.tiff`, `.tif`, `.ico`).
     - Bổ sung cơ chế tự động suy luận đuôi file từ MIME type khi client tải lên file không có đuôi (như `blob` từ Canvas/Mobile).
  3. **Đồng bộ Controller chung (`UploadController`):**
     - Mở rộng hỗ trợ định dạng ảnh tương tự cho module Upload cốt lõi.
- **Kết quả kiểm thử:**
  - Build Backend pass 100% (`tsc --noEmit` & `nest build`).
  - Container `laundry_backend` đã được cập nhật bản build mới và khởi động lại trơn tru.
  - Push commit lên nhánh `dev` của kho `be-nestjs-thanhxuan`.



### Bugfix: Khắc Phục Lỗi Upload 404, Ưu Tiên Icon SVG và Đặt Mặc Định Lightmode (fe-react-thanhxuan-internal)

- **Bối cảnh & Vấn đề:**
  1. Người dùng gặp lỗi khi chụp ảnh chấm công selfie hoặc gửi ảnh bao đồ đếm lại xưởng:
     `index-B8Nts09O.js:3 POST https://noibo.thanhxuanlaundry.com/api/v1/internal/upload 404 (Not Found)`
     `{url: '/upload', method: 'POST', status: 404, data: {…}, detailsString: '{"success":false,"statusCode":404,"error":"Cannot POST /api/v1/internal/upload","details":"Not Found"}'}`
  2. Người dùng yêu cầu ưu tiên sử dụng `icon.svg` sắc nét cho toàn bộ cổng nội bộ, nếu thiết bị/trình duyệt không hỗ trợ mới fallback sang các ảnh `.png`.
  3. Người dùng yêu cầu chuyển chế độ giao diện mặc định khi vào hệ thống thành `lightmode` (thay vì mặc định darkmode).
- **Nguyên nhân gốc rễ (Root Cause):**
  - **Lỗi 404 Upload:** Controller trong NestJS backend là `InternalUploadController` được khai báo `@Controller('uploads')` (có chữ `s`), trong khi một số hook ở Frontend (`useAttendance.ts:49` và `RecountRequestModal.tsx:45`) gọi endpoint số ít `apiClient.post('/upload')`, dẫn tới HTTP 404 Not Found từ NestJS Router.
  - **Mặc định Theme:** Trong `src/lib/theme.tsx:23`, state khởi tạo ban đầu hardcode trả về `'dark'` nếu chưa có giá trị lưu trong `localStorage`.
  - **Ưu tiên Icon SVG:** File `manifest.webmanifest` trong `vite.config.ts` đặt icon `.png` lên đầu và `icon.svg` ở cuối danh sách; các thẻ HTML `<link>` và component chưa có cơ chế `<picture>` fallback chuẩn.
- **Giải pháp & Thay đổi kỹ thuật:**
  1. **Sửa dứt điểm lỗi Upload (Đa tầng phòng thủ):**
     - Sửa `useAttendance.ts:49` và `RecountRequestModal.tsx:45` gọi chuẩn `/uploads` đồng bộ với `useShipperFuel.ts`.
     - Cấu hình Nginx reverse proxy tại `/etc/nginx/sites-available/noibo.thanhxuanlaundry.com`: Bổ sung rule `location = /api/v1/internal/upload` chuyển tiếp trực tiếp sang `http://127.0.0.1:5001/api/v1/internal/uploads`, đảm bảo tương thích ngược 100% cho mọi phiên bản PWA Service Worker cũ đang cache trên máy người dùng.
  2. **Chuyển mặc định giao diện sang Lightmode:**
     - Điều chỉnh `src/lib/theme.tsx` khởi tạo mặc định trả về `'light'`.
  3. **Ưu tiên Icon SVG kèm Fallback PNG:**
     - Tạo component chuyên dụng `src/components/common/AppLogo.tsx` sử dụng thẻ chuẩn `<picture>` với `<source srcSet="/icon.svg" type="image/svg+xml" />` và thẻ `<img>` fallback sang `pwa-192x192.png` / `favicon-64x64.png` khi lỗi tải.
     - Đồng bộ `AppLogo` vào `LoginPage.tsx`, `RegisterPage.tsx`, `RootPage.tsx`, `AppHeader.tsx` và `MobileNavDrawer.tsx`.
     - Sắp xếp lại `vite.config.ts` (Manifest Icons & Shortcuts) đưa `/icon.svg` lên vị trí ưu tiên đầu tiên; bổ sung các thẻ `<link rel="icon">` và `<link rel="alternate icon">` trong `index.html`.
- **Kết quả xác minh:**
  - `curl -X POST https://noibo.thanhxuanlaundry.com/api/v1/internal/upload` và `curl -X POST https://noibo.thanhxuanlaundry.com/api/v1/internal/uploads` đều trả về HTTP 401 Unauthorized (xác thực Guard NestJS thành công, không còn 404).
  - PWA build pass 100% (`pnpm build` in 12s), đã deploy trực tiếp vào `/var/www/noibo/dist` và reload Nginx thành công.
  - Push commit lên nhánh `dev` của repository `fe-react-thanhxuan-internal`.



### Plan 57: Cơ Chế Duy Trì Phiên Đăng Nhập Lâu Dài Như Mobile App Cho PWA (fe-react-thanhxuan-internal & be-nestjs-thanhxuan)

- **Bối cảnh & Vấn đề:**
  - Cổng vận hành nội bộ (`fe-react-thanhxuan-internal`) được cài đặt dưới dạng PWA trên điện thoại của tài xế xe tải, thợ xưởng và quản lý đối tác.
  - Người dùng phản ánh việc thường xuyên bị đá về màn hình đăng nhập mỗi khi mở lại ứng dụng sau vài giờ hoặc vài ngày, không đạt được trải nghiệm "mở là dùng ngay" như các ứng dụng di động bản địa (Native Mobile App).
  - Điều tra nguyên nhân gốc rễ (Root Cause):
    1. Backend `be-nestjs-thanhxuan` hardcode thời hạn Access Token là 15 phút và Refresh Token là 7 ngày; quá 7 ngày không vào là phiên bị hủy.
    2. Frontend lưu token trong `localStorage`, dễ bị cơ chế dọn dẹp bộ nhớ (ITP của iOS Safari / Android Webview) xóa sạch.
    3. Khi Interceptor của `apiClient` tự động làm mới token thành công, state `token` trong React `AuthContext` không được cập nhật, gây lệch pha và gửi token cũ dẫn đến bị logout oan.
    4. Ứng dụng chỉ có cơ chế refresh phản ứng (Reactive) khi gặp lỗi 401, dễ phát sinh xung đột (race condition) khi nhiều API cùng gọi đồng thời lúc mở app.
- **Giải pháp & Thay đổi kỹ thuật:**
  1. **Nâng cấp Backend (`be-nestjs-thanhxuan`):**
     - Chuyển thời hạn Access Token sang cấu hình `jwt.staffExpiresIn` (mặc định `1d` / `12h`) thay vì cố định 15 phút, giảm tải tần suất refresh và ổn định kết nối.
     - Nâng thời hạn Refresh Token lên **60 ngày** trong `account-auth.helper.ts` với cơ chế **Sliding Expiration**: Mỗi khi người dùng mở app và refresh token được xoay vòng, thời hạn mới lại được gia hạn thêm 60 ngày tiếp theo.
  2. **Xây dựng Module Lưu Trữ Kép Bền Vững (`auth-storage.ts`):**
     - Quản lý đồng bộ `staff_token`, `staff_refresh_token` và `staff_user` trên cả `localStorage` và `IndexedDB` (`thanhxuan_internal_auth_db`).
     - Tự động khôi phục phiên từ `IndexedDB` dự phòng nếu `localStorage` bị hệ điều hành dọn dẹp.
  3. **Cơ Chế Proactive / Silent Refresh & Đồng Bộ Sự Kiện:**
     - Tích hợp kiểm tra hạn token JWT (`isJwtExpired`); khi mở lại PWA hoặc quay lại từ màn hình khóa (`visibilitychange` / `window.focus`), nếu Access Token còn dưới 5-10 phút sẽ tự động refresh ngầm trước khi các trang con gọi API.
     - `apiClient` Interceptor phát CustomEvent `auth:token-refreshed` khi refresh thành công, giúp `AuthContext` cập nhật tức thì state `token`.
  4. **Bảo Vệ Phiên Ngoại Tuyến (Offline Safety):**
     - Khi mở app ở vùng mất sóng (hầm gửi xe, lỗi mạng / status 0), hệ thống tuyệt đối không xóa session hoặc redirect đăng nhập, cho phép nhân sự thao tác ngoại tuyến bình thường.
- **Kết quả kiểm thử:**
  - `be-nestjs-thanhxuan`: `tsc --noEmit` và `pnpm build` pass 100%.
  - `fe-react-thanhxuan-internal`: `tsc --noEmit` và `pnpm build` pass 100%.

### Tính năng: Tách Tab Riêng Xin Nghỉ Cho Shipper & Nâng Cấp Toàn Diện Giao Diện Form Xin Nghỉ Và Lịch Sử Nghỉ (fe-react-thanhxuan-internal)

- **Bối cảnh & Yêu cầu:**
  - Trước đây, tài xế xe tải (`SHIPPER`) chỉ có thể gửi đơn xin nghỉ và xem lịch sử thông qua 2 nút bấm nhỏ trong thanh header của trang lộ trình giao nhận (`ShipperHandoverPage.tsx`), gây bất tiện và khó thao tác trên di động khi đang làm việc ngoài đường.
  - Giao diện 2 modal xin nghỉ và lịch sử nghỉ còn đơn điệu, thiếu tính năng chọn nhanh ngày nghỉ liên tiếp, thiếu chip gợi ý lý do nhanh 1 chạm, và chưa có giao diện tiến độ duyệt trực quan.
- **Giải pháp & Thay đổi kỹ thuật:**
  1. **Tạo Cổng Riêng Biệt Cho Shipper Xin Nghỉ (`/operations/shipper/leave`):**
     - Tạo trang `ShipperLeavePage.tsx` tại `src/features/operations/shipper-leave/` với `PageBanner` hiện đại và 3 thẻ chỉ số nhanh: Tổng số đơn, Đang chờ duyệt, Đã duyệt nghỉ.
     - Thanh chuyển đổi phân đoạn 2 tab trực quan: **Tạo Đơn Xin Nghỉ** (`ShipperLeaveFormComponent.tsx`) và **Lịch Sử Nghỉ** (`ShipperLeaveHistoryComponent.tsx`) kèm badge số lượng đơn chờ duyệt.
  2. **Nâng Cấp Form Xin Nghỉ Tối Ưu Mobile-First:**
     - Bộ nút chọn nhanh ngày nghỉ: "Ngày mai", "2 ngày liên tiếp", "3 ngày liên tiếp" từ ngày mai.
     - Date picker và danh sách badge ngày nghỉ kèm thứ trong tuần (`getWeekdayVN`: Thứ Hai, Thứ Ba...) giúp tài xế không nhầm lẫn lịch trình.
     - Danh mục lý do xin nghỉ gợi ý 1 chạm (Việc gia đình, Về quê, Khám bệnh / Sốt mệt, Xe hỏng, Việc riêng...) kèm textarea nhập chi tiết.
     - Khung thông tin quy trình 2 bước giải thích cơ chế phân tuyến và thiết lập tiền công hỗ trợ giao thay.
  3. **Nâng Cấp Giao Diện Lịch Sử & Thẻ Đơn Nghỉ (`ShipperLeaveCardComponent.tsx`):**
     - Thanh bộ lọc trạng thái nhanh: Tất cả, Chờ duyệt, Đã duyệt, Đã hủy / Từ chối kèm số lượng đếm thực tế.
     - Thẻ đơn hiển thị các ngày nghỉ dạng badge lịch sang trọng, stepper tiến độ duyệt, thông tin tài xế nhận giao thay, số tiền công hỗ trợ (VND), lý do từ chối nổi bật (nếu có).
     - Nút hủy đơn an toàn tích hợp modal xác nhận trước khi hủy.
  4. **Xóa Bỏ Hoàn Toàn 2 Modal Cũ & Tối Giản Màn Hình Giao Nhận:**
     - Xóa triệt để hai tệp modal cũ (`ShipperLeaveRequestModal.tsx` và `ShipperLeaveHistoryModal.tsx`) tại thư mục `modals/` của phân hệ giao nhận.
     - Thay thế nút thao tác trên header của `ShipperHandoverPage.tsx` bằng nút liên kết điều hướng trực tiếp sang trang `/operations/shipper/leave`.
  5. **Tích Hợp Điều Hướng (Navigation):**
     - `nav-mobile-config.ts`: Thêm tab **"Xin Nghỉ"** (icon `CalendarOff`) vào Mobile Bottom Bar cho `StaffRole.SHIPPER` (Giao Nhận | Xăng Xe | Xin Nghỉ | Lương).
     - `nav-config.ts`: Bổ sung mục **"Xin Nghỉ Giao Nhận"** vào nhóm CÁ NHÂN & CHẤM CÔNG cho Shipper.
     - `router.tsx`: Khai báo tuyến đường `/operations/shipper/leave` (và redirect `/operations/shipper/leaves`).
- **Kết quả kiểm thử:**
  - TypeScript typecheck (`tsc -b`) pass 100%.
  - Vite production build pass 100% (tất cả bundle và PWA Service Worker tạo thành công).

### Plan 56: Hoàn Thiện Toàn Diện Cấu Hình & Trải Nghiệm PWA Cho Cổng Vận Hành Nội Bộ (fe-react-thanhxuan-internal)

- **Bối cảnh & Vấn đề:**
  - Cổng vận hành nội bộ (`fe-react-thanhxuan-internal`) phục vụ thợ xưởng, thủ kho và tài xế xe tải di chuyển thường xuyên vào vùng sóng yếu (hầm nhà hàng, xưởng tôn khép kín).
  - Dù đã có `OfflineBanner` và `offline-queue.ts` (IndexedDB) cho luồng đếm đồ và đổ xăng, ứng dụng vẫn chưa đạt chuẩn PWA hoàn chỉnh:
    1. Thiếu toàn bộ icon PNG chuẩn (`192x192`, `512x512`, `maskable`, `apple-touch-icon-180x180`), chỉ dùng file `icon.svg` khiến iOS Safari không nhận diện được icon ứng dụng và Lighthouse PWA bị đánh trượt tiêu chí Installability.
    2. Thiếu cấu hình Workbox Runtime Caching cho ảnh Cloudinary CDN (`res.cloudinary.com`) và Google Fonts Webfonts (`fonts.gstatic.com`).
    3. Thiếu App Shortcuts trong Web App Manifest để truy cập nhanh các nghiệp vụ cốt lõi từ màn hình chính điện thoại.
    4. Thiếu thông báo bản cập nhật mới (PWA Reload Prompt): khi deploy bản build mới, người dùng không nhận được thông báo để reload trang mà chạy ngầm mã nguồn cũ.
- **Các giải pháp và thay đổi kỹ thuật:**
  1. **Tạo bộ Icon PNG chuẩn chất lượng cao từ vector `icon.svg`:**
     - Sử dụng Headless Chrome render pixel-perfect thành các file PNG:
       - `public/pwa-192x192.png`: Icon tiêu chuẩn cho Android và thanh tác vụ Desktop.
       - `public/pwa-512x512.png`: Icon phân giải cao cho màn hình khởi động Splash Screen.
       - `public/pwa-maskable-512x512.png`: Icon Adaptive bo tròn thông minh cho Android hiện đại.
       - `public/apple-touch-icon-180x180.png`: Icon chuẩn cho thiết bị iOS Safari.
       - `public/favicon-64x64.png`: Favicon sắc nét cho trình duyệt máy tính.
  2. **Nâng cấp cấu hình Vite PWA (`vite.config.ts`):**
     - Cập nhật mảng `manifest.icons` với đầy đủ định dạng PNG (`any` và `maskable`).
     - Bổ sung `manifest.shortcuts` với 4 lối tắt vận hành 1 chạm: Giao Nhận Shipper (`/operations/shipper/handover`), Chấm Công Selfie (`/operations/attendance`), Trạm Công Thợ (`/operations/worker/piecework`), Soạn Đồ Xuất Xưởng (`/operations/warehouse-manager/warehouse`).
     - Mở rộng `runtimeCaching` với `CacheFirst` cho `fonts.gstatic.com` và `StaleWhileRevalidate` cho `res.cloudinary.com` (chữ ký số, ảnh phiếu bàn giao, hóa đơn xăng xe lưu 30 ngày, tối đa 120 mục).
  3. **Cập nhật thẻ Meta PWA chuẩn iOS trong `index.html`:**
     - Đổi link `apple-touch-icon` trỏ vào `/apple-touch-icon-180x180.png`.
     - Thêm `favicon-64x64.png`, `<meta name="application-name" content="Thanh Xuân Quản Vận" />` và `apple-mobile-web-app-title`.
  4. **Xây dựng Component `PwaReloadPrompt.tsx`:**
     - Thiết kế theo chuẩn Zero-Dependency, sử dụng trực tiếp Native Browser Service Worker API (`navigator.serviceWorker.ready`, sự kiện `updatefound`, `controllerchange` và tự động kiểm tra mỗi 30 phút).
     - Hiển thị Toast nổi hiện đại góc màn hình kèm nút "Cập nhật ngay" kích hoạt `SKIP_WAITING` để nạp ngay bản mới mà không cần xóa cache thủ công.
     - Nhúng trực tiếp vào `AppLayout.tsx`.
- **Kết quả kiểm thử:**
  - `pnpm exec tsc --noEmit` và `pnpm build` pass 100%.
  - Service Worker precache 21 static entries, sinh file `manifest.webmanifest`, `sw.js` và `workbox-*.js` đầy đủ.

### Bugfix: Sửa Lỗi Hiển Thị Chi Nhánh Không Thuộc Thương Hiệu Trong Modal Tạo Phiếu Giao Nhận (PrepOrderModal)

- **Vấn đề phát hiện:** Khi người dùng mở modal "Tạo Phiếu Giao Nhận Mới" và chọn thương hiệu (ví dụ: `Pizza 4P's (PIZZA_4PS)`), danh sách thả xuống ở ô "CHI NHÁNH ĐỐI TÁC" lại hiển thị lẫn cả chi nhánh của thương hiệu khác (ví dụ: `Haidilao Hotpot Phạm Ngọc Thạch`).
- **Nguyên nhân gốc rễ (Root Cause):**
  1. **Backend (`be-nestjs-thanhxuan`):** Endpoint `GET /partners` trong `PartnersController` (`partners.controller.ts:172`) chỉ tiếp nhận `@Query('includeInactive')` mà bỏ qua tham số query `@Query('brand')`. Mặc dù `usePrepOrderData.ts` và `useHandoverSlipGallery.ts` ở Frontend đều gọi `/partners?brand=${selectedBrand}`, Backend vẫn trả về toàn bộ chi nhánh của tất cả các thương hiệu.
  2. **Frontend (`fe-react-thanhxuan-internal`):** Hook `usePrepOrderData.ts` và component `PrepOrderConfigHeaderComponent.tsx` chưa thực hiện lọc phòng thủ theo `selectedBrand`, dẫn đến việc render nguyên mảng đối tác trả về từ API.
- **Giải pháp triển khai:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - Cập nhật `PartnerRepository.findAllPartners` (`partner.repository.ts`): Bổ sung tham số `brand?: string`. Nếu có truyền, tiến hành lọc `{ brand: brand.trim().toUpperCase() }` tận dụng compound index `{ brand: 1, isActive: 1 }`.
    - Cập nhật `PartnersService.getAllPartners` (`partners.service.ts`): Nhận và chuyển tiếp tham số `brand` vào repository.
    - Cập nhật `PartnersController.getAllPartners` & `getPublicPartners` (`partners.controller.ts`): Tiếp nhận `@Query('brand') brand?: string` và truyền vào service.
  - **Frontend (`fe-react-thanhxuan-internal`):**
    - `usePrepOrderData.ts`: Bọc `rawPartners` qua `useMemo` lọc theo `selectedBrand`, đồng thời tự động cập nhật `selectedPartnerId` sang chi nhánh đầu tiên của thương hiệu mới khi chuyển đổi thương hiệu.
    - `PrepOrderConfigHeaderComponent.tsx`: Lọc `filteredPartners` theo `selectedBrand` cho cả giao diện Mobile và Desktop, đảm bảo dropdown chỉ hiển thị các chi nhánh trực thuộc thương hiệu được chọn.


## 2026-10-29

### Docs & User Guides: Biên Soạn Bộ 8 Bản Cẩm Nang Hướng Dẫn Sử Dụng RBAC & Đồng Bộ Tài Liệu Phân Hệ Nội Bộ

- **Bối cảnh & Yêu cầu:**
  - Hệ sinh thái Cổng vận hành nội bộ (`fe-react-thanhxuan-internal`) sở hữu 8 vai trò RBAC (`ADMIN`, `MANAGER`, `WAREHOUSE_MANAGER`, `ACCOUNTANT`, `SHIPPER`, `WORKER`, `PARTNER_MANAGER`, `PARTNER_STAFF`) với các quy trình nghiệp vụ chuyên biệt từ khâu thu gom, vận chuyển, sản xuất 7 khâu, xuất kho, kiểm nhận đến tính lương và quản lý tài chính.
  - Người dùng yêu cầu biên soạn 8 bản tài liệu hướng dẫn sử dụng chi tiết cho từng vai trò để đào tạo nhân sự, đồng thời rà soát và khắc phục các sai lệch trong các tài liệu kỹ thuật cốt lõi (`srs_sdd_fe_internal.md`, `CODEBASE_ATLAS.md`, `DATABASE_DICTIONARY.md`).
- **Các thay đổi và cập nhật tài liệu:**
  1. **Biên soạn bộ 8 cuốn cẩm nang hướng dẫn sử dụng chuyên biệt (`.agents/docs/user_guides/`):**
     - `README.md`: Mục lục tra cứu tổng thể, sơ đồ phối hợp vận hành giữa 4 khối nghiệp vụ và bảng tài khoản thử nghiệm mẫu (Demo accounts).
     - `user_guide_admin.md`: Cẩm nang Quản trị viên (giám sát thời gian thực, quản lý nhân sự 60 ngày & xóa vĩnh viễn, cấu hình GPS OpenStreetMap & IP Wi-Fi xưởng, duyệt nghỉ giao nhận, chốt bảng lương chu kỳ).
     - `user_guide_manager.md`: Cẩm nang Quản lý Xưởng (chỉ huy sàn sản xuất, duyệt ca quên check-out, phân khâu mặc định, duyệt công thợ theo ngày, gán tài xế tuyến cố định, tuân thủ nghiêm ngặt bảo mật ẩn 100% dữ liệu tiền bạc).
     - `user_guide_warehouse_manager.md`: Cẩm nang Thủ kho (soạn đồ sạch xuất xưởng `CLEAN_PLAN`, ký tên Canvas phát hành ảnh phiếu WebP gửi Cloudinary, quản lý thư viện ảnh phiếu `SLIP_GALLERY`, trạm rạch bao đếm lại gom bao xưởng).
     - `user_guide_accountant.md`: Cẩm nang Kế toán (duyệt chi phí xăng/sửa xe tài xế với 2 ảnh bắt buộc, định mức thù lao chuyến lẻ `TripCompensationModal`, thiết lập tiền công giao thay khi shipper nghỉ, cấu hình đơn giá giờ 7 khâu, chạy tính bảng lương tự động và xuất Excel).
     - `user_guide_shipper.md`: Cẩm nang Tài xế xe tải (100% Mobile PWA, lộ trình 4 ca sáng/chiều/tối, chợ chuyến `POOL` khóa nguyên tử, đếm thay đồ bẩn `ShipperCountPartnerModal` với biểu thức thông minh và số bao gom, nộp chi phí xe, xin nghỉ phép, minh bạch công thức lương 28 ngày chuẩn).
     - `user_guide_worker.md`: Cẩm nang Thợ xưởng (chấm công camera selfie & Geofencing GPS $\le 150\text{m}$, tự động kích hoạt khâu mặc định, chuyển đổi giữa 7 khâu công việc tính giờ chuẩn xác từng phút, cơ chế tự động quay lại khâu mặc định `AUTO_RESUME`, rạch bao đếm lại, theo dõi thu nhập hàng ngày).
     - `user_guide_partner_manager.md`: Cẩm nang Quản lý Đối tác B2B (đếm đồ bẩn auto-save onBlur chống xung đột, tự động nhảy ngày sau 21h, kiểm nhận đồ sạch qua ảnh WebP, đánh dấu Đủ/Thiếu/Thừa, tra cứu thư viện ảnh lịch sử, phê duyệt kích hoạt nhân viên cơ sở mình).
     - `user_guide_partner_staff.md`: Cẩm nang Nhân viên Đối tác (giao diện 3 tab tinh gọn trên điện thoại: đếm đồ bẩn gửi giặt, kiểm nhận đồ sạch khi xe tải đến giao, tra cứu ảnh phiếu đối soát).
  2. **Đồng bộ và sửa sai lệch trong Từ điển cơ sở dữ liệu (`DATABASE_DICTIONARY.md`):**
     - Sửa lỗi trùng số thứ tự mục: 1.11 `hourly_work` và 1.11 `fuel_logs` $\rightarrow$ Đánh số lại liền mạch từ 1.11 đến 1.16 (`hourly_work` $\rightarrow$ `fuel_logs` $\rightarrow$ `pay_settings` $\rightarrow$ `payroll_periods` $\rightarrow$ `payslips` $\rightarrow$ `shipper_leave_requests`).
     - Cập nhật số lượng collections: Phân vùng 1 (`internal_express`) có 16 collections (sửa từ 15); tổng số collections toàn hệ thống là 34 (sửa từ 33).
  3. **Đồng bộ Bản đồ mã nguồn (`CODEBASE_ATLAS.md`):**
     - Bổ sung nhóm màn hình Auth công khai (`/login`, `/register`, `/forgot-password`, `ProfileEditModal`, `ChangePasswordModal`, `useAuth.ts`, `useProfileEdit.ts`).
     - Tách riêng route `/management/manager/approval` (`ApprovalManagementPage.tsx`) khỏi `/management/manager/personnel` (`StaffManagementPage.tsx`).
     - Bổ sung component `PartnerStaffTabComponent.tsx` vào cổng đối tác.
     - Cập nhật quyền hạn truy cập màn hình Kho Sạch (`/operations/warehouse-manager/warehouse`) và Duyệt Nghỉ (`/management/shipper-leaves`) của Kế toán.
  4. **Đồng bộ Đặc tả phân hệ nội bộ (`srs_sdd_fe_internal.md`):**
     - Chuẩn hóa tên vai trò đối tác trong toàn bộ tài liệu: `PARTNER_MANAGER` và `PARTNER_STAFF` (thay thế alias cũ `RESTAURANT_MANAGER`/`STAFF`).
     - Bổ sung chức năng `FE-INT-FR-08: Quản Lý Đơn Xin Nghỉ Giao Nhận & Phân Tuyến Bù`.
     - Cập nhật cấu trúc thư mục mã nguồn 2.1 (bổ sung `features/management/shipper-leaves/`, `features/management/workshop/`, `InternalLayout.tsx`).
     - Cập nhật ma trận điều hướng 2.2 phản ánh chính xác quyền hạn thực tế của cả 8 vai trò.

### Plan 55: Chức Năng Shipper Xin Nghỉ Giao Nhận & Phân Tuyến Kèm Tiền Công (Shipper Leave & Route Reassignment Workflow)

- **Bối cảnh & Vấn đề nghiệp vụ:**
  - Đội ngũ tài xế xe tải (Shipper) phụ trách tuyến giao nhận 2 chiều giữa xưởng giặt và các nhà hàng đối tác cố định hàng ngày. Khi một Shipper cần xin nghỉ phép một hoặc nhiều ngày, các cơ sở đối tác không thể bị bỏ sót tuyến mà phải được phân công bàn giao cho một tài khoản Shipper khác giao thay, kèm theo mức tiền công giao thay xứng đáng (do Kế toán hoặc Admin xác lập).
- **Yêu cầu & Quyết định thiết kế:**
  1. **Nộp đơn xin nghỉ linh hoạt:** Cho phép Shipper chọn 1 hoặc nhiều ngày nghỉ (`YYYY-MM-DD`), nhập lý do xin nghỉ. Hệ thống tự động tính toán tổng số lượt giao và các chi nhánh đối tác có lịch giao vào các ngày đó dựa trên `isPartnerScheduledOnDate`.
  2. **Quy trình phê duyệt linh hoạt 2 bước hoặc 1 chạm:**
     - **Luồng chuẩn 2 bước (Manager + Accountant):** Manager xem đơn, chọn tài khoản Shipper thay thế và chuyển đơn sang trạng thái `APPROVED_PENDING_COMPENSATION` $\rightarrow$ Kế toán tiếp nhận đơn đã chỉ định người, nhập số tiền công giao thay (`compensationAmount` VNĐ) và chuyển đơn sang `APPROVED` (chính thức có hiệu lực).
     - **Luồng 1 chạm (Đặc quyền Admin):** Admin có thể chỉ định Shipper thay thế và nhập luôn số tiền công giao thay trong cùng một lần để duyệt hoàn tất ngay lập tức.
  3. **Hệ thống Email thông báo tự động (Nodemailer qua EventEmitter):**
     - Khi Shipper tạo đơn: Bắn sự kiện gửi email thông báo cho tất cả `ADMIN` và `MANAGER` đang active.
     - Khi Manager duyệt bước 1: Bắn sự kiện gửi email thông báo cho tất cả `ACCOUNTANT` (và Admin) để vào set tiền công.
     - Khi đơn hoàn tất (`APPROVED`): Gửi email thông báo cho cả Shipper xin nghỉ (được duyệt nghỉ), Shipper thay thế (thông báo nhận tuyến kèm tiền công).
     - Khi bị từ chối (`REJECTED`): Gửi email phản hồi lý do cho Shipper xin nghỉ.
  4. **Tự động hóa tuyến xe trong ngày nghỉ (`PartnersService.getSchedule`):**
     - Vào các ngày nghỉ đã duyệt, các điểm giao của Shipper nghỉ sẽ tạm thời được loại bỏ khỏi lộ trình của Shipper đó, đồng thời tự động bổ sung vào danh sách lộ trình của Shipper nhận thay kèm badge chỉ báo "Nhận giao thay: [Tên Shipper]".
  5. **Giao diện người dùng Mobile-First:**
     - Shipper: Thêm 2 modal `ShipperLeaveRequestModal.tsx` và `ShipperLeaveHistoryModal.tsx` vào trang Giao nhận (`ShipperHandoverPage.tsx`).
     - Quản trị: Xây dựng trang `/management/shipper-leaves` (`ShipperLeaveReviewPage.tsx`) với đầy đủ bộ lọc tabs trạng thái, danh sách thẻ `ShipperLeaveCardComponent.tsx` và bộ 3 modal duyệt/set công/từ chối.
- **Các thay đổi kỹ thuật chi tiết:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - Thêm Schema & Collection `shipper_leave_requests` (Connection `internal_express`): `shipper-leave.schema.ts`.
    - Tạo `ShipperLeaveRepository` kế thừa `BaseRepository`.
    - Tạo bộ DTOs: `CreateShipperLeaveDto`, `ApproveShipperLeaveDto`, `SetCompensationDto`, `RejectShipperLeaveDto`, `QueryShipperLeaveDto`.
    - Xây dựng `ShipperLeavesService`, `ShipperLeavesController`, `ShipperLeavesModule` và đăng ký vào `InternalModule`.
    - Cập nhật `MailService` lắng nghe các sự kiện `shipper_leave.*` và gửi email HTML tự động.
    - Cập nhật `PartnersService.getSchedule` tự động đổi tuyến khi có đơn `APPROVED`.
    - Bổ sung các mã quyền `SHIPPER_LEAVE_*` vào `permissions.map.ts`.
  - **Frontend (`fe-react-thanhxuan-internal`):**
    - Tạo types `shipper-leave.types.ts` và API service `shipperLeaveService.ts`.
    - Tạo custom hook `useShipperLeaveManagement.ts`.
    - Xây dựng các modals: `ShipperLeaveRequestModal.tsx`, `ShipperLeaveHistoryModal.tsx`, `ApproveShipperLeaveModal.tsx`, `SetLeaveCompensationModal.tsx`, `RejectShipperLeaveModal.tsx`.
    - Xây dựng `ShipperLeaveCardComponent.tsx` và trang `ShipperLeaveReviewPage.tsx`.
    - Tích hợp 2 nút "Xin nghỉ" và "Lịch sử nghỉ" vào `ShipperHandoverPage.tsx`.
    - Bổ sung tuyến đường `/management/shipper-leaves` vào `router.tsx` và menu "Duyệt Nghỉ Giao Nhận" vào `nav-config.ts`.
  - **Tài liệu kỹ thuật đồng bộ:** Cập nhật `DATABASE_DICTIONARY.md` (33 collections), `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`.
  - **Verification:** Backend 50/50 test suites pass 100%, `tsc --noEmit` pass 100%, `nest build` pass 100%; Frontend `tsc --noEmit` pass 100%, `tsc -b && vite build` tạo PWA bundle thành công.

### Bugfix: Phân Quyền Kho Sạch Cho Kế Toán, Sửa Form Nhập Giá Bị Kẹt 50k & Hiển Thị Tên Chi Nhánh Đối Tác

- **Vấn đề phát sinh:**
  1. Kế toán (`ACCOUNTANT`) dù đã được cấu hình menu nhưng khi bấm vào trang Kho Sạch (`/operations/warehouse-manager/warehouse`) vẫn bị chặn và chuyển hướng về Dashboard do thiếu role trong `<ProtectedRoute>`.
  2. Khi mở modal "Set Giá" (`TripCompensationModal.tsx`), ô nhập tiền công bị reset liên tục về mức mặc định 50.000 đ khiến Admin/Accountant không thể gõ số tiền tùy chỉnh khác.
  3. Thẻ phiếu giao nhận trên tab Kho Sạch hiển thị tiêu đề "Chi nhánh đối tác" thay vì tên cơ sở thật (do chỉ đọc `partnerObj?.name` mà không fallback sang `record.partnerName`).
  4. Thẻ phiếu chưa có tài xế hiển thị nhãn "Lương cố định", gây nhầm lẫn với các chuyến tự do chờ set giá.
- **Giải pháp xử lý:**
  1. **`warehouse.tsx`:** Bổ sung `StaffRole.ACCOUNTANT` vào mảng `allowedRoles` của `<ProtectedRoute>`.
  2. **`TripCompensationModal.tsx`:** Sử dụng `prevOpenRef` để chỉ khởi tạo lại state khi modal chuyển từ đóng sang mở (`open && !prevOpenRef.current`), không re-trigger khi component re-render. Đổi state `amount` sang kiểu `number | string` và không ép kiểu ngay trong `onChange` để người dùng có thể xóa rỗng gõ tự do.
  3. **`WarehouseCleanPlanTabComponent.tsx` & `WarehouseSummaryTabComponent.tsx`:** Chuẩn hóa fallback `record.partnerName || partnerObj?.name || 'Chi nhánh đối tác'`.
  4. **Phân biệt tuyến cố định vs chuyến tự do:** Nếu chưa có tài xế và đối tác chưa có tài xế mặc định (`!record.shipperName && !partnerObj?.defaultShipperId`), hiển thị nhãn `Chuyến tự do` (màu amber) thay vì `Lương cố định`.
- **Verification:**
  - `fe-react-thanhxuan-internal`: `tsc --noEmit` PASS (0 errors), `pnpm build` PASS (PWA service worker + bundle hoàn tất).
  - Đã commit và push trực tiếp lên nhánh `dev` của repository `fe-react-thanhxuan-internal` để Vercel tự động deploy.

- **Vấn đề phát hiện:**
  1. Nút "Set Giá" / "Sửa Giá" trên thẻ phiếu giao nhận xưởng (`WarehouseCleanPlanTabComponent`) trước đây hiển thị cho mọi vai trò xem được trang (bao gồm cả Thủ kho `WAREHOUSE_MANAGER` và Quản lý xưởng `MANAGER`), vi phạm nguyên tắc bảo mật tài chính của công ty (chỉ Ban Quản Trị và Kế toán mới có quyền can thiệp vào định mức tiền công giao nhận).
  2. Tài khoản Kế toán (`ACCOUNTANT`) chưa có mục menu để vào màn hình "Kho Sạch & Soạn Đồ" (`/operations/warehouse-manager/warehouse`) trên cả Desktop Sidebar và Mobile Quick Bottom Bar, khiến Kế toán không thể vào rà soát và cấu hình tiền công các chuyến giao nhận tự do.
- **Giải pháp xử lý triệt để:**
  1. **Frontend (`fe-react-thanhxuan-internal`):**
     - Tại `WarehouseCleanPlanTabComponent.tsx`: Kiểm tra `canSetCompensation = user?.role === StaffRole.ADMIN || user?.role === StaffRole.ACCOUNTANT`. Nút "Set Giá" / "Sửa Giá" chỉ hiển thị cho 2 vai trò này; ẩn hoàn toàn với `WAREHOUSE_MANAGER`, `MANAGER`, `SHIPPER`, `WORKER`.
     - Tại `nav-config.ts`: Cấp quyền `StaffRole.ACCOUNTANT` vào mục "Kho Sạch & Soạn Đồ" (`id: "kho"`), giúp Kế toán thấy menu trên Desktop Sidebar và Drawer Mobile.
     - Tại `nav-mobile-config.ts`: Bổ sung mục "Kho Sạch" (icon `Warehouse`) vào thanh điều hướng nhanh Mobile Bottom Bar của vai trò `ACCOUNTANT` (`Tổng Quan`, `Báo Cáo`, `Kho Sạch`, `Bảng Lương` + nút `Thêm`), giúp Kế toán trên điện thoại truy cập 1 chạm vào danh sách phiếu kho để set giá.
  2. **Backend API Security (`be-nestjs-thanhxuan`):**
     - Tại `handover.controller.ts`: Sửa quyền bảo vệ của cả hai endpoint `@Patch(':id/compensation')` và `@Post('cluster-compensation')` thành duy nhất `@Permissions(PERMISSIONS.PAY_RATE_MANAGE)` (loại bỏ `PERMISSIONS.HANDOVER_EDIT_FIELD`), khóa chặt cổng API chỉ cho `ADMIN` và `ACCOUNTANT` thực thi.
  3. **Verification:** Backend 50/50 suites (235 tests pass), nest build pass; Frontend `tsc --noEmit` pass 100%, vite build pass tạo PWA bundle thành công.

### Plan 54: Tính Năng Soạn Đồ Giao Trước Ca Chiều Cho Thủ Kho (Prep Order Advance Delivery)

- **Bối cảnh nghiệp vụ:** Tại các nhà hàng đối tác đông khách (đặc biệt chuỗi Pizza 4P's), những hôm quá tải lượng khăn ăn của thực khách, xưởng giặt Thanh Xuân phải chở trước một lượng đồ sạch (như khăn ăn xám) vào buổi chiều (cùng ngày với ca giao tối, hoặc chiều hôm trước với ca giao sáng) để nhà hàng đủ khăn phục vụ khách.
- **Yêu cầu & Quyết định thiết kế:**
  1. Dòng ghi chú tương ứng của chiếc đồ trong phiếu tự động ghi nhận cú pháp chuẩn: `Đã giao xxx chiếc vào chiều dd/mm/yyyy`.
  2. Màn hình của Thủ kho khi soạn đồ (`PrepOrderModal` gồm cả dạng Bảng Table và dạng Thẻ Mobile Card) ở cột số lượng hiển thị phân rã trực quan: `xxx (cần giao ca chính) + xxx (chiều - màu cam hổ phách nổi bật)`.
  3. Giá trị số lượng lưu trong hệ thống (`quantity`) là tổng cả 2 đợt ($xxx + yyy = zzz$) để Shipper và Đối tác ký nhận, đối soát và tính sản lượng trọn vẹn.
  4. Các màn hình khác (Shipper, Đối tác, Canvas/ảnh phiếu xuất) giữ nguyên số lượng tổng và hiển thị dòng ghi chú đó, hoàn toàn không bị ảnh hưởng.
  5. Hỗ trợ nhập liệu 2 chiều (Hybrid): Tiện ích 1 chạm (Popover nhập số lượng + ngày giao chiều tự sinh ghi chú) VÀ tự động nhận diện thông minh (Regex parser) nếu thủ kho gõ tay vào ô ghi chú.
- **Các thay đổi kỹ thuật chi tiết:**
  - **Tạo Helper Phân Rã & Parser Ghi Chú (`prepOrderAdvanceDeliveryHelper.ts`):**
    - Biểu thức Regex: `/(?:Đã giao|Giao trước)\s*(\d+)\s*(?:chiếc|cái)?\s*vào chiều\s*(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{4})?)/i`.
    - Các hàm chuẩn hóa: `parseAdvanceDeliveryFromNote`, `formatAdvanceDeliveryNote`, `calculateDisplayQuantities`, `applyAdvanceDeliveryToNote`, `removeAdvanceDeliveryFromNote`.
    - Viết unit test hoàn chỉnh tại `__tests__/prepOrderAdvanceDeliveryHelper.test.ts`.
  - **Xây dựng Popover Tiện Ích 1 Chạm (`AdvanceDeliveryPopoverComponent.tsx`):**
    - Thiết kế nút trigger tinh tế: Khi có giao chiều, hiển thị badge cam `Chiều: +{qty}`; khi chưa có, hiển thị icon `Sunset` nhỏ gọn.
    - Modal popup tiện ích: Nhập số lượng giao chiều, chọn nhanh chip `+50`, `+100`, `+200`, `+300`; chọn ngày nhanh "Chiều hôm nay" / "Chiều hôm trước" hoặc gõ ngày tùy ý; xem trước câu ghi chú sẽ sinh ra; hỗ trợ nút "Áp dụng" và "Xóa".
    - Kỷ luật kích thước: 239 dòng (< 250 dòng).
  - **Nâng Cấp Bảng Soạn Đồ Desktop (`PrepOrderItemTableComponent.tsx`):**
    - Cột "Sẽ giao ngày mai" hiển thị stepper ca chính kèm badge cam `+{advanceQty} chiều (= {quantity})`.
    - Cột "Ghi chú dòng" tích hợp nút trigger Popover bên cạnh input ghi chú.
    - Kỷ luật kích thước: 247 dòng (< 250 dòng).
  - **Nâng Cấp Thẻ Soạn Đồ Mobile (`PrepOrderItemCardComponent.tsx`):**
    - Stepper cảm ứng lớn cho ca chính, badge cam hổ phách hiển thị rõ ràng phân rã ca chiều.
    - Tích hợp nút Popover bên cạnh ô ghi chú dòng.
    - Kỷ luật kích thước: 235 dòng (< 250 dòng).
  - **Verification:** `tsc -b && vite build` pass 100%, tạo PWA bundle thành công; `pnpm exec tsc --noEmit` pass không có lỗi.


### Plan 53: Bổ Sung Ca Giao Nhận Buổi Chiều (AFTERNOON) Toàn Hệ Thống

- **Bối cảnh & Yêu cầu:** Trước đây hệ thống giao nhận xưởng và logistics chỉ định nghĩa 2 ca giao nhận mặc định: **Ca Sáng (`MORNING`)** và **Ca Tối (`EVENING`)**. Thực tế phát sinh nhu cầu giao nhận bổ sung **Buổi Chiều (`AFTERNOON`)** (khoảng 14h00 - 17h00) đối với các chuỗi đối tác tiệc chiều hoặc chuyến trung chuyển khẩn cấp trước giờ cao điểm tối.
- **Các thay đổi kiến trúc & kỹ thuật chi tiết:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - Mở rộng enum `deliveryShift` trong Schema `Partner` (`partner.schema.ts`) và `HandoverRecord` (`handover-record.schema.ts`): `['MORNING', 'AFTERNOON', 'EVENING']`.
    - Cập nhật validation DTOs: `CreatePartnerDto`, `UpdatePartnerDto`, `CleanClothesDto` (PrepOrderDto), `CreateHandoverDto` xác thực nghiêm ngặt giá trị `'AFTERNOON'`.
    - Nâng cấp Controller & Service Pool Compensation: Hỗ trợ query parameter `shift?: 'MORNING' | 'AFTERNOON' | 'EVENING'` tại `HandoverController.getPoolHandovers` và `HandoverPoolCompensationService`.
    - Đồng bộ logic kế thừa ca: Phiếu giao nhận tự động kế thừa `deliveryShift` từ đối tác (`MORNING`, `AFTERNOON` hoặc `EVENING`).
    - Verification: Toàn bộ 50 test suites (233 unit tests pass 100%), typecheck `tsc --noEmit` pass.
  - **Frontend Cổng Nội Bộ (`fe-react-thanhxuan-internal`):**
    - **Quản trị đối tác:** Khai báo kiểu `deliveryShift?: 'MORNING' | 'AFTERNOON' | 'EVENING'` trong `partner.types.ts`, `PartnerModal.tsx`. Thêm lựa chọn `<option value="AFTERNOON">Ca Chiều (Buổi chiều)</option>` trong `PartnerContactScheduleFieldsComponent.tsx`.
    - **Thẻ chi nhánh đối tác:** Cập nhật `PartnerCardComponent.tsx` hiển thị badge trực quan theo ca: Ca Sáng (Vàng hổ phách), Ca Chiều (Cam ấm), Ca Tối (Tím).
    - **Màn hình giao nhận Shipper (`ShipperHandoverPage.tsx`):**
      - Nâng cấp thanh lọc ca thành 4 nút: `Tất Cả`, `Sáng (x)`, `Chiều (y)`, `Tối (z)` (tối ưu responsive dạng lưới `grid-cols-2 sm:grid-cols-4` trên điện thoại di động).
      - Icon trực quan: `Sun` (Sáng), `SunMedium` (Chiều), `Moon` (Tối).
      - Mở rộng `useShipperHandoverPage.ts` tính toán chính xác `afternoonCount`, lọc `filteredPoints` và `filteredPoolJobs` theo `AFTERNOON`.
    - **Thẻ điểm giao nhận & Thẻ nhận chuyến:** Cập nhật `ShipperHandoverItemCardComponent.tsx`, `ShipperPendingPointCardComponent.tsx`, `ShipperJobPoolTabComponent.tsx` hiển thị chuẩn xác badge Ca Chiều với nền cam nhạt và chữ cam đậm.
    - **Dropdown chọn chi nhánh khi xuất phiếu kho:** Cập nhật `PrepOrderConfigHeaderComponent.tsx` hiển thị ca giao nhận bên cạnh tên chi nhánh (`• Ca Chiều`, `• Ca Sáng`, `• Ca Tối`) trên cả Mobile và Desktop.
    - Verification: `tsc --noEmit` pass 100%, `pnpm build` pass tạo PWA bundle thành công.
- **Tài liệu & CSDL:** Cập nhật bảng `partners` (1.6) và `handover_records` (1.8) trong `DATABASE_DICTIONARY.md`, cập nhật `srs_sdd_backend.md`, `srs_sdd_fe_internal.md` và `SRS_SDD.md`.

### Bugfix: Khóa Chặt Chuyến Tự Do Chỉ Nhận Cho Ngày Hôm Đó, Ngăn Tự Động Add Vào Lộ Trình Các Ngày Sau Của Shipper

- **Vấn đề phát hiện:** Khi tài xế Shipper bấm nhận một chuyến tự do (đối tác chưa có tài xế cố định), chuyến đi đã được lưu đúng vào ngày được chọn (`recordDate`). Tuy nhiên, khi Shipper chuyển sang xem lộ trình của ngày hôm sau (`selectedDate + 1`), chi nhánh đối tác tự do đó lại tự động xuất hiện trong Tab "Lộ Trình" (`ROUTE`) của ngày hôm sau dưới dạng chưa có phiếu (`record: undefined`), khiến Shipper nhầm tưởng mình bị gán luôn cho đối tác đó vào các ngày sau.
- **Nguyên nhân gốc rễ (Root Cause):**
  1. Backend endpoint `GET /partners/schedule` trả về toàn bộ danh sách đối tác có lịch trong ngày mà không lọc theo `shipperId`, bao gồm cả đối tác tuyến tự do (`defaultShipperId == null`).
  2. Frontend `useShipperHandoverPage.ts` khi tính `deliveryPoints` duyệt qua tất cả `scheduledPartners` và tự động push mọi đối tác chưa có phiếu vào danh sách lộ trình của Shipper mà không kiểm tra xem đối tác đó có phải tuyến cố định của Shipper này hay không.
- **Giải pháp xử lý triệt để:**
  1. **Backend (`be-nestjs-thanhxuan`):** Nâng cấp `GET /partners/schedule` nhận `@CurrentUser() user` và `@Query('shipperId')`. Nếu người gọi là vai trò `SHIPPER`, hệ thống tự động lọc chỉ trả về các đối tác mà Shipper đó được phân công cố định (`defaultShipperId == user.sub`), loại bỏ 100% các đối tác tuyến tự do khỏi schedule.
  2. **Frontend (`fe-react-thanhxuan-internal`):** Trong `useShipperHandoverPage.ts`, bổ sung ràng buộc nghiêm ngặt khi duyệt `scheduledPartners`: chỉ đưa vào Tab "Lộ Trình" (`ROUTE`) nếu `sp.defaultShipperId === user.id`. Đối tác tuyến tự do chưa có phiếu tuyệt đối không xuất hiện trong Tab "Lộ Trình", mà chỉ hiển thị tại Tab "Nhận Chuyến" (`POOL`) của từng ngày để Shipper chủ động bấm nhận lại cho từng ngày riêng biệt.
  3. **Verification:** Backend 50/50 suites (235 tests pass), nest build pass; Frontend `tsc --noEmit` pass 100%, vite build pass tạo PWA bundle thành công.

---

## CÁC GIAI ĐOẠN LỊCH SỬ TRƯỚC ĐÓ (PLAN 1 ĐẾN PLAN 52)

> Toàn bộ các Plan lịch sử trước đây đã được tự động lưu trữ sang các file độc lập để tối ưu hóa token và hiệu năng tài liệu:
> 📦 **Giai đoạn Plan 51 - Plan 52:** [CHANGELOG_ARCHIVE_V2.md](./changelogs/CHANGELOG_ARCHIVE_V2.md)  
> 📦 **Giai đoạn Plan 1 - Plan 50:** [CHANGELOG_ARCHIVE_V1.md](./changelogs/CHANGELOG_ARCHIVE_V1.md)
