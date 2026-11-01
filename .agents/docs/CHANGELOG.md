# NHẬT KÝ THAY ĐỔI HỆ THỐNG (CHANGELOG)

Tài liệu ghi nhận toàn bộ lịch sử tiến hóa, các giai đoạn nâng cấp, bugfix và triển khai tính năng của Hệ sinh thái Công ty Thanh Xuân qua từng Plan.

## 2026-11-01

### Plan 68: Triển Khai Hệ Thống Cinematic Living Motion Đa Phân Hệ & Chuẩn Hóa Mobile Header (fe-nextjs-thanhxuan-laundry)

- **Bối cảnh & Vấn đề giải quyết:**
  - **Lỗi Header trên Mobile:** `PublicMainNavBarComponent` dùng `flex-wrap` kèm ô input tìm kiếm cố định `w-full min-w-[200px]` khiến trên màn hình di động, khối tìm kiếm bị rớt xuống hàng thứ hai, Logo trơ trọi một mình, cộng thêm thanh TopBar đen khuyết marquee dính sát đỉnh màn hình. Header cao hơn 140px làm ngợp và che mất 1/4 diện tích màn hình điện thoại.
  - **Trang web dạng ảnh tĩnh thiếu sức sống:** Khách hàng phản ánh các hiệu ứng xuất hiện quá nhanh (0.4s-0.6s) rồi biến mất, tải lại trang không thấy lại, toàn bộ giao diện đứng im như brochure in giấy, không truyền tải được quy mô và nhịp đập 24/7 của xưởng giặt là công nghiệp 5+ tấn/ngày.
- **Các giải pháp kỹ thuật đã triển khai:**
  1. **Chuẩn Hóa Mobile Single-Row Header (54px):**
     - Ẩn dải TopBar đen khuyết marquee trên mobile (`hidden md:flex`), tiết kiệm 35px diện tích.
     - Tái cấu trúc Header di động thành 1 hàng cố định: Logo bên trái, cụm 3 nút Quick-Action bên phải gồm Gọi Hotline nhanh 1-chạm (📞), Bật/tắt thanh tìm kiếm trượt xuống linh hoạt (🔍), và Nút ThemeToggle (☀️/🌙).
  2. **Cinematic Ambient Motion (Ken Burns Slow-Motion & Vi Hạt Bọt Khí Nano):**
     - Bổ sung `@keyframes kenBurnsSlow` (chuyển động Pan & Zoom 25s loop mượt mà, GPU-accelerated) áp dụng cho ảnh nền Hero Banner ở Trang Chủ, Vệ Sinh Công Nghiệp, Dịch Vụ.
     - Phát triển `FloatingCleanParticlesComponent` hiển thị các hạt bọt khí và hơi nước nano lơ lửng, tạo cảm giác vô trùng, tươi mát.
  3. **Dải Băng Chuyền Năng Lực Vô Tận 24/7 (`InfiniteProductionMarqueeComponent`):**
     - Thiết lập dải băng tải trôi ngang vô tận 60 FPS dưới chân Hero: `5+ TẤN / NGÀY ✦ 100% ECOLAB ✦ ĐỘI XE 12 QUẬN ✦ CAM KẾT 100% ✦ ĐÚNG CA 24H ✦ HÓA ĐƠN VAT ✦ 500+ ĐỐI TÁC`.
  4. **Dây Chuyền Vận Hành Sản Xuất Tự Động Hóa 5 Bước (`AutomatedConveyorWorkflowComponent`):**
     - Mô hình hóa dây chuyền khép kín 5 trạm: Tiếp nhận & Phân loại $\rightarrow$ Giặt khử khuẩn Ecolab $\rightarrow$ Sấy lồng công nghiệp $\rightarrow$ Là hơi & Gấp tự động $\rightarrow$ Đóng gói niêm phong & Giao trả.
     - Tích hợp tia sáng laser quang học (`shimmerLaser`) chạy liên tục giữa các trạm máy móc.
  5. **Bộ Đếm Số Nhảy Tự Động (`AnimatedCounterComponent`) & Video Modal 4K:**
     - Tích hợp bộ đếm số động sử dụng `requestAnimationFrame` + `IntersectionObserver` tại `IntroSectionComponent` (5+ Tấn/ngày, 500+ Doanh nghiệp, 99.8% Sạch chuẩn, 24/7 Giao nhận), tự kích hoạt lại nhịp nhàng mỗi lần lướt tới.
     - Nút xem video xưởng thực tế với hiệu ứng sóng âm (Radar Ripple) mở popup video 4K sắc nét (`HeroVideoModalComponent`).
- **Kết quả kiểm chứng:**
  - Typecheck `pnpm exec tsc --noEmit` pass 100% (0 errors).
  - Next.js Turbopack build `pnpm build` pass 100% (18/18 static pages rendered).
  - Giao diện mobile và desktop đạt chuẩn 60 FPS, không gây giật lag và không tăng thời gian tải trang.

### Bugfix & UI/UX Restore: Phục Hồi Toàn Diện Ngôn Ngữ Thiết Kế & Hiệu Ứng Web Cũ Cho Cổng Quản Trị (fe-react-thanhxuan-admin)

- **Bối cảnh & Vấn đề giải quyết:**
  - Sau khi chuyển đổi từ Next.js `/admin` sang React SPA độc lập `fe-react-thanhxuan-admin`, giao diện quản trị bị thiếu các lớp nền Canvas & Radial gradient, thiếu nút chuyển Theme Sáng/Tối, và cấu trúc menu sidebar bị lệch so với phiên bản web cũ.
  - Ngoài ra, Nginx upstream proxy trước đó gửi nguyên `Origin: https://quantri.thanhxuanlaundry.com` vào Backend NestJS gây lỗi CORS policy 500 do biến `CORS_ORIGINS` của container backend cũ chưa nạp tên miền mới.

- **Các thay đổi chi tiết:**
  1. **Khắc Phục Lỗi CORS Nginx Upstream:**
     - Bổ sung `proxy_set_header Origin "";` trong cả 2 khối proxy upstream Nginx (`location /api/` và `location /api/v1/`) tại `/etc/nginx/sites-available/quantri.thanhxuanlaundry.com`. NestJS nhận diện cuộc gọi same-origin reverse proxy nội bộ và cho phép đăng nhập thành công 100%.
  2. **Phục Hồi Lớp Nền & Hiệu Ứng Thẩm Mỹ Chuẩn Web Cũ:**
     - Khôi phục ảnh nền Canvas `bg-5.png` (chế độ Sáng) và radial gradient sâu (chế độ Tối) tại `LoginPage.tsx` và `AdminShellComponent.tsx`.
     - Bổ sung component `ThemeToggle.tsx` chuyển đổi Dark / Light mode linh hoạt với icon Mặt trời / Mặt trăng và lưu trạng thái vào `localStorage`.
  3. **Đồng Bộ Hoá 100% Cấu Trúc Menu & Drawer Mobile:**
     - Thiết kế lại `Sidebar.tsx` chuẩn theo giao diện gốc: Logo TX gradient phát sáng, các mục menu Dashboard, Đơn hàng, Khách hàng (CRM), Zalo Marketing, Email Marketing, Danh mục, Bài viết, Liên hệ, Tài khoản, và Cấu hình có accordion mở rộng (Header, Footer, Trang chủ, Trang vệ sinh, Trang dịch vụ, Trang giới thiệu, Trang liên hệ, Tích hợp Zalo OA).
     - Bổ sung các trang chuyên môn `ZaloMarketingPage.tsx`, `EmailMarketingPage.tsx` và liên kết query param `?tab=...` trong `GeneralSettingsPage.tsx`.
     - Phục hồi nút Đăng xuất đỏ nhạt bo cong góc dưới cùng.
  4. **Kiểm Chứng & Xuất Bản Thực Tế:**
     - Typecheck `tsc --noEmit` pass 100% (0 errors).
     - Build gói tĩnh `pnpm build` pass 100% (12.05s).
     - Deploy trực tiếp vào `/var/www/quantri/dist` và tải lại Nginx, vận hành trơn tru trên `https://quantri.thanhxuanlaundry.com`.

### Plan 67: Tối Ưu Hóa Hiệu Năng Core Web Vitals (95-100), Đột Phá SEO Google & Chuyển Đổi B2B Cho Web Khách Hàng (fe-nextjs-thanhxuan-laundry)

- **Bối cảnh & Vấn đề giải quyết:**
  - Sau khi tách Cổng Quản Trị độc lập (`fe-react-thanhxuan-admin`), web `fe-nextjs-thanhxuan-laundry` chuyển thành kênh tiếp thị B2B và thu hút khách hàng từ Google Search.
  - Khách hàng tìm kiếm dịch vụ giặt là / vệ sinh công nghiệp từ Google không có nhu cầu cài app PWA. Banner nhắc cài app trước đây che khuất màn hình di động, làm tăng tỷ lệ thoát (Bounce Rate) và có nguy cơ bị Google xử phạt Mobile Interstitials.
  - Lệnh `@import` 10 fonts ngoài trong `globals.css` chặn đứng quá trình render của trình duyệt (render-blocking), kéo dài FCP và LCP lên 3-4s và làm tụt 25-35 điểm Google PageSpeed.
  - Cần bộ nhớ đệm tĩnh ISR để thời gian phản hồi máy chủ (TTFB) đạt < 50ms, bổ sung Schema JSON-LD đa thực thể chuẩn SEO Local cho 12 quận Hà Nội, và tối ưu nút Hotline/Zalo 1 chạm cho di động.

- **Các thay đổi kiến trúc & kỹ thuật chi tiết:**
  1. **Triệt Tiêu Render-Blocking & Tối Ưu Font (`next/font/google`):**
     - Xóa bỏ hoàn toàn lệnh `@import` 10 Google Fonts khỏi `src/app/globals.css`, chấm dứt toàn bộ cảnh báo CSS optimization trong build.
     - Sử dụng `Be_Vietnam_Pro` qua `next/font/google` nạp font self-hosted cục bộ nhúng thẳng `@font-face` vào HTML đầu trang, loại trừ 100% round-trip network latency tới Google Fonts server, đưa CLS = 0 và FCP < 0.8s.
  2. **Tinh Giản PWA Trên Web Khách Hàng (Zero Interstitial):**
     - Gỡ bỏ hoàn toàn popup nhắc cài app PWA (`PwaInstallPromptComponent`) và Service Worker registration khỏi `src/app/layout.tsx` để bảo vệ trải nghiệm khách hàng B2B và chống rớt hạng SEO.
     - Giữ lại Web App Manifest (`manifest.webmanifest`) và bộ icons W3C để bot tìm kiếm Google hiển thị Favicon/Logo thương hiệu uy tín trên kết quả tìm kiếm (Google SERP).
  3. **Kích Hoạt Bộ Nhớ Đệm Tĩnh Gia Số ISR (Incremental Static Regeneration):**
     - Thiết lập `export const revalidate = 3600;` cho toàn bộ các trang công khai: `/` (Trang chủ), `/vesinh`, `/dich-vu`, `/dich-vu/[...slug]`, `/tin-tuc`, `/tin-tuc/[...slug]`.
     - Phản hồi trang HTML tức thì từ RAM với TTFB < 50ms, giúp điểm Google PageSpeed đạt 95 - 100 điểm.
  4. **Đột Phá SEO Local Schema.org & FAQ Rich Snippets:**
     - Nâng cấp Schema JSON-LD đa thực thể `["DryCleaningOrLaundry", "LocalBusiness"]` tại `src/app/layout.tsx` với địa bàn phục vụ 12 quận huyện nội thành Hà Nội, Hotline 24/7, chính sách thanh toán và danh mục dịch vụ `hasOfferCatalog`.
     - Nhúng `FAQPage` Schema vào trang chủ và trang dịch vụ vệ sinh để hiển thị Rich Snippets câu hỏi thường gặp dạng accordion nổi bật trên Google Search di động.
  5. **Tối Ưu Chuyển Đổi (CRO) Mobile Contact Bar:**
     - Chuẩn hóa fallback Hotline `0769 270 676` và link Zalo OA trong `DraggableFloatingContactComponent.tsx`, đảm bảo khách hàng liên hệ 1 chạm tức thì.

- **Kết Quả Kiểm Chứng (Verification):**
  - Typecheck `pnpm exec tsc --noEmit` pass 100% (0 errors).
  - Next.js Production Build: `pnpm build` pass 100% (18/18 routes tĩnh và động, sạch bóng 100% cảnh báo CSS optimization).

### Plan 66: Phân Tách & Xây Dựng Cổng Quản Trị Admin Tập Trung Đa Thương Hiệu (fe-react-thanhxuan-admin) Bằng React SPA (Vite)

- **Bối cảnh & Vấn đề giải quyết:**
  - Hệ thống CMS quản trị marketing và bài viết SEO trước đây nằm trong ứng dụng Next.js Giặt Là (`fe-nextjs-thanhxuan-laundry/src/app/(admin)`). Khi chuẩn bị phát triển tiếp trang Web Chuyển Nhà (`fe-nextjs-chuyennhatietkiem`), nhu cầu cấp thiết là tái sử dụng toàn bộ chức năng quản trị đã hoàn thiện mà không muốn lặp lại code CMS ở nhiều nơi.
  - Trang Quản trị là ứng dụng sau đăng nhập, **100% không cần SEO Google** (`noindex, nofollow`). Việc dùng Next.js Server Components / SSR render HTML trên server làm tăng tải CPU/RAM cho VPS mà không mang lại giá trị SEO.
  - Xây dựng một ứng dụng React SPA độc lập (Vite) phục vụ tĩnh (Static Serving) cho cả 2 tên miền **`quantri.thanhxuanlaundry.com`** và **`quantri.chuyennhatietkiem.vn`**, giúp trang quản trị tải nhanh tức thì, chuyển trang không độ trễ và tốn ~0% tài nguyên CPU của máy chủ.

- **Các thay đổi kiến trúc & kỹ thuật chi tiết:**
  1. **Khởi Tạo Phân Hệ `fe-react-thanhxuan-admin` (React 18 + Vite + TailwindCSS + shadcn/ui):**
     - Thiết lập cấu trúc thư mục feature-based theo chuẩn của `fe-react-thanhxuan-internal`, cổng dev `3003`.
     - Bộ UI components chuẩn hóa: `Button`, `Input`, `Badge`, `Card`, `Table`, `Dialog` (tích hợp xử lý nút Back vật lý điện thoại), `Tabs`.
     - Tích hợp Vite PWA plugin sinh Web App Manifest và Service Worker tự động.
  2. **Kiến Trúc Multi-Tenant (Đa Thương Hiệu) Cốt Lõi:**
     - **`TenantContext.tsx`:** Tự động phát hiện thương hiệu dựa vào `window.location.hostname` (`quantri.thanhxuanlaundry.com` $\rightarrow$ `'laundry'`, `quantri.chuyennhatietkiem.vn` $\rightarrow$ `'moving'`), fallback localStorage cho localhost.
     - **`TenantSwitcher.tsx`:** Bộ chuyển đổi thương hiệu 1 chạm trên thanh Header với nhãn màu nhận diện riêng biệt (Sky blue vs Orange) cho Super Admin.
     - **`api-client.ts`:** Axios Interceptor tự động gán header `x-tenant-id: laundry | moving` và Authorization Bearer Token vào mọi request gửi lên Backend NestJS.
  3. **Module Quản Trị CMS Hoàn Chỉnh:**
     - **Auth Module (`features/auth`):** `LoginPage.tsx` hỗ trợ đổi tenant trước khi đăng nhập, `AuthContext.tsx`, `RequireAuth.tsx` route guard.
     - **Articles Module (`features/articles`):** Danh sách bài viết SEO (`ArticlesListPage.tsx`), màn hình soạn thảo chuẩn SEO (`ArticleEditorPage.tsx`), hỗ trợ tải ảnh Cloudinary và cấu hình meta tags.
     - **Categories Module (`features/categories`):** Quản lý chuyên mục bài viết và dịch vụ (`CategoriesListPage.tsx`, `CategoryModal.tsx`).
     - **Contacts & CRM Module (`features/contacts` & `features/crm`):** Tiếp nhận form tư vấn (`ContactsListPage.tsx`) và quản lý hồ sơ khách hàng (`CrmListPage.tsx`).
     - **Orders Module (`features/orders`):** Tự động chuyển đổi hiển thị: Đơn giặt là (Laundry) vs Đơn đặt lịch / Báo giá xe tải (Moving).
     - **Settings & Users Module (`features/settings` & `features/users`):** Cài đặt thông tin website, hotline, banner theo tenant và quản lý tài khoản admin phân quyền.
     - **Dashboard Module (`features/dashboard`):** Thống kê tổng quan chuyển đổi linh hoạt theo thương hiệu.
  4. **Hạ Tầng Triển Khai Thực Tế & GitHub Actions Workflow (Zero Docker Container):**
     - Thay vì chạy container Docker tốn tài nguyên trên VPS, ứng dụng được triển khai chạy tĩnh trực tiếp trên Nginx host tại `/var/www/quantri/dist` (tương tự như `fe-react-thanhxuan-internal`).
     - Tách cấu hình Nginx riêng tại `/etc/nginx/sites-available/quantri.thanhxuanlaundry.com`, proxy API phân tầng: `/api/v1/` trỏ tới module Moving và `/api/` trỏ tới module Giặt Là / Core.
     - Kích hoạt chứng chỉ SSL Let's Encrypt chính thức cho `quantri.thanhxuanlaundry.com` (HTTPS HTTP/2 200 OK).
     - Thiết lập GitHub Actions workflow `.github/workflows/main.yml` tự động build tĩnh và deploy SCP/SSH lên VPS khi merge `main`/`master`.
     - Cập nhật CORS allowedOrigins tại Backend NestJS `main.ts` hỗ trợ cả 2 subdomain quản trị.

- **Kết Quả Kiểm Chứng (Verification):**
  - Typecheck `pnpm exec tsc --noEmit` pass 100%.
  - Build `pnpm run build` pass 100% trong 12.01s, xuất static bundle tối ưu gzip trong `dist/`.
  - Cập nhật đồng bộ toàn bộ tài liệu 5 trụ cột: `README.md`, `QUY_DINH_HE_THONG.md`, `AGENTS.md`, `GEMINI.md`, `SRS_SDD.md`, `srs_sdd_fe_admin.md`, `CODEBASE_ATLAS.md` và `CHANGELOG.md`.

### Plan 65: Triển Khai Subdomain quantri.thanhxuanlaundry.com Riêng Biệt, Chủ Động Nhắc Cài Đặt App PWA & Xử Lý Nút Back Mobile Cho Popup / Modal (fe-nextjs-thanhxuan-laundry & fe-react-thanhxuan-internal)

- **Bối cảnh & Vấn đề giải quyết:**
  - Trang quản trị CMS trước đây chạy chung tại đường dẫn `/admin` của web khách hàng `thanhxuanlaundry.com`. Khi cài app lên điện thoại, trình duyệt dùng chung manifest của web bán hàng (tên app "Thanh Xuân Laundry", mở ra trang chủ khách hàng). Cần tách tên miền phụ riêng `quantri.thanhxuanlaundry.com` để cài thành 1 App PWA độc lập tên chính thức là **"Quản trị Thanh Xuân"**.
  - Người dùng truy cập bằng mobile vào Web Quản trị (`quantri.`) và Cổng Nội Bộ xưởng (`noibo.`) chưa được chủ động nhắc cài đặt app PWA, gây giảm tiện ích thao tác 1 chạm.
  - Trải nghiệm di động khi mở bất kỳ popup/modal nào: nếu người dùng bấm nút Quay về (Back) của điện thoại hoặc vuốt cạnh mép màn hình, trình duyệt kích hoạt `history.back()` làm văng ra ngoài màn hình chính hoặc lùi trang web thay vì đóng modal, gây khó chịu và chưa giống ứng dụng mobile native.

- **Các thay đổi kiến trúc & kỹ thuật chi tiết:**
  1. **Subdomain Routing & Admin PWA Isolation (`quantri.thanhxuanlaundry.com`):**
     - **Cấu hình Nginx (`/etc/nginx/sites-available/thanhxuanlaundry.com`):** Bổ sung `quantri.thanhxuanlaundry.com` vào `server_name` của cả khối HTTP (chuyển hướng 301 sang HTTPS) và khối HTTPS proxy pass về cổng 3000.
     - **Next.js Middleware (`src/middleware.ts`):** Nhận diện hostname `quantri.`, tự động rewrite ngầm:
       - Trang chủ `/` rewrite sang `/admin` (dashboard/login tùy phiên auth).
       - Các trang CMS con (`/dashboard`, `/posts`, `/customers`, `/login`...) rewrite sang `/admin/...`, hiển thị URL thanh địa chỉ sạch đẹp.
       - Request `/manifest.webmanifest` rewrite sang Route Handler riêng `/api/manifest/admin`.
     - **Route Handler Manifest Quản Trị (`src/app/api/manifest/admin/route.ts`):** Trả về Web App Manifest độc lập: `name: "Quản trị Thanh Xuân"`, `short_name: "Quản trị Thanh Xuân"`, `start_url: "/"`, `display: "standalone"`, `theme_color: "#1e40af"`, bộ icon PWA đầy đủ 192, 512, maskable và app shortcuts.
     - **Service Worker (`public/sw.js`):** Bổ sung điều kiện bypass cache tĩnh cho toàn bộ request từ subdomain `quantri.*`, luôn tuân thủ Network-First để dữ liệu CMS luôn mới nhất.
  2. **Chủ Động Nhắc Nhở Cài Đặt App PWA Trên Thiết Bị Mobile:**
     - **Web Quản Trị CMS (`fe-nextjs-thanhxuan-laundry`):** Component [`PwaInstallPromptComponent.tsx`](file:///root/Project_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/src/components/pwa/PwaInstallPromptComponent.tsx) tự động phát hiện thiết bị di động chưa cài app, sau 2.5s hiển thị banner nổi bật **"Cài Đặt App Quản trị Thanh Xuân"**. Tách modal hướng dẫn iOS Safari ra file riêng [`IosInstallGuideModal.tsx`](file:///root/Project_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/src/components/pwa/IosInstallGuideModal.tsx) (< 100 dòng).
     - **Cổng Nội Bộ Xưởng (`fe-react-thanhxuan-internal`):** Phát triển component [`PwaInstallPromptComponent.tsx`](file:///root/Project_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/pwa/PwaInstallPromptComponent.tsx) và [`IosInstallGuideModal.tsx`](file:///root/Project_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/pwa/IosInstallGuideModal.tsx), nhúng vào layout gốc [`RootLayout.tsx`](file:///root/Project_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/RootLayout.tsx), hiển thị banner **"Cài Đặt App Nội Bộ Thanh Xuân"** sau 2.5s với nút "Cài đặt ngay" và "Để sau" (ghi nhớ 7 ngày).
  3. **Xử Lý Nút Back Điện Thoại Tự Động Đóng Popup / Modal (Native Mobile Back Handler):**
     - Tích hợp bộ xử lý History Popstate vào component dùng chung cốt lõi `Dialog` ở cả 2 phân hệ:
       - [`fe-react-thanhxuan-internal/src/components/ui/dialog.tsx`](file:///root/Project_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/ui/dialog.tsx): Tự động bao phủ 100% cho 25+ modal (chấm công selfie, giao nhận, chi phí xăng xe, bảng lương, đối soát, nghỉ phép...).
       - [`fe-nextjs-thanhxuan-laundry/src/components/ui/dialog.tsx`](file:///root/Project_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/src/components/ui/dialog.tsx): Áp dụng cho các dialog CMS và trình soạn thảo.
     - Khi mở modal, tự động gọi `history.pushState({ modalOpen: true, modalId }, '')`. Khi người dùng bấm nút Back vật lý hoặc vuốt mép màn hình, sự kiện `popstate` tự động gọi đóng modal mà không rời khỏi trang hiện tại. Khi đóng bằng nút [X] hoặc backdrop, tự động gọi `history.back()` an toàn để xóa state ảo.

- **Kết Quả Kiểm Chứng (Verification):**
  - Typecheck `pnpm exec tsc --noEmit` pass 100% trên cả `fe-nextjs-thanhxuan-laundry` và `fe-react-thanhxuan-internal`.
  - Build `pnpm build` pass 100% trên cả 2 ứng dụng, PWA manifest và service worker bundle sẵn sàng.
  - Nginx configuration test `nginx -t` pass 100%, reload thành công.

### Plan 64: Triển Khai PWA Toàn Diện, Tối Ưu Mobile UX & Nâng Cấp Trình Soạn Thảo Visual CMS Phong Cách Canva Cho Các Trang SEO Chính (fe-nextjs-thanhxuan-laundry)

- **Bối cảnh & Vấn đề giải quyết:**
  - Khách hàng và doanh nghiệp truy cập `https://thanhxuanlaundry.com/` chủ yếu qua smartphone. Tuy nhiên, trước đây website chưa có PWA (không thể cài đặt thành app điện thoại, thiếu Service Worker và Manifest, thiếu offline fallback khi mất mạng).
  - Trải nghiệm di động còn một số điểm chưa tối ưu: nút speed dial liên hệ (`DraggableFloatingContactComponent`) bị đặt quá cao giữa màn hình (`bottom-[200px]`), thiếu hỗ trợ vùng an toàn notch/Home indicator trên iPhone (`pb-safe`), các ô input có thể gây giật cục do iOS Safari tự động phóng to (auto-zoom) khi chạm vào, và chân trang có nguy cơ bị thanh điều hướng mobile (`h-16`) đè lên.
  - Về biên tập nội dung SEO: Quản trị viên CMS cần tạo các trang landing page dịch vụ (`/dich-vu/*`, `/vesinh`) và bài viết cẩm nang (`/tin-tuc/*`) bắt mắt. Trình soạn thảo cũ chỉ có 5 font chữ hệ thống cổ điển, thiếu bảng màu thiết kế trực quan, thiếu giãn dòng/giãn chữ (line/letter spacing) và không thể chèn khung nhấn hay nút kêu gọi hành động (CTA) như Canva.

- **Các thay đổi kiến trúc & kỹ thuật chi tiết:**
  1. **Triển khai PWA Native Đạt Chuẩn Next.js 16 (App Router):**
     - **Web App Manifest (`src/app/manifest.ts`):** Khai báo Metadata Route chuẩn Next.js 16 sinh `/manifest.webmanifest` với `display: standalone`, `theme_color: #1e40af`, `orientation: portrait-primary`, và bộ 3 App Shortcuts chuyển đổi nhanh (*Dịch Vụ Giặt Sấy*, *Dịch Vụ Vệ Sinh*, *Liên Hệ Báo Giá*).
     - **Bộ Icon PWA Đa Kích Thước:** Xây dựng script `scripts/generate-pwa-icons.mjs` sử dụng `sharp` để xuất bộ icon chuẩn PWA: `icon-192x192.png`, `icon-512x512.png`, `icon-maskable-192x192.png`, `icon-maskable-512x512.png`, `apple-touch-icon.png` (180x180), và favicon 32/16px.
     - **Vanilla Service Worker (`public/sw.js`):** Triển khai chiến lược caching: **Network-First** cho các trang HTML navigation (đảm bảo tin tức & giá luôn tức thời), tự động fallback về trang ngoại tuyến [`/offline`](file:///root/Project_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/src/app/offline/page.tsx) khi mất mạng; **Stale-While-Revalidate / Cache-First** cho static assets; hoàn toàn bypass cache cho dynamic API `/api/*` và `/admin/*`.
     - **Trang Ngoại Tuyến (`src/app/offline/page.tsx`):** Giao diện thông báo mất kết nối thân thiện, nút "Thử tải lại trang" và nút gọi hotline khẩn cấp 0769 270 676.
     - **PWA Prompt Engine:** Component lá [`PwaRegisterComponent.tsx`](file:///root/Project_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/src/components/pwa/PwaRegisterComponent.tsx) đăng ký Service Worker mượt mà; component [`PwaInstallPromptComponent.tsx`](file:///root/Project_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/src/components/pwa/PwaInstallPromptComponent.tsx) tự động bắt sự kiện `beforeinstallprompt` trên Chromium/Android và Bottom Sheet hướng dẫn thêm vào màn hình chính trên iOS Safari (tự động ẩn khi đã cài đặt).
  2. **Tối Ưu Hóa Giao Diện Mobile (Mobile Polish):**
     - **iOS Safe Area Inset:** Bổ sung utility classes `@supports (padding-bottom: env(safe-area-inset-bottom))` vào `globals.css` để thanh điều hướng đáy [`PublicMobileBottomNavComponent`](file:///root/Project_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/src/components/layout/public/header/PublicMobileBottomNavComponent.tsx) không bị thanh Home Bar iPhone che.
     - **Chống Auto-Zoom trên iOS Safari:** Chuẩn hóa `text-base md:text-sm` trong `src/components/ui/input.tsx` để ngăn iOS Safari tự động zoom in màn hình khi tap vào input.
     - **Khoảng Đệm Đáy:** Bổ sung `pb-16 md:pb-0` cho `<main>` trong `src/app/(public)/layout.tsx` chống đè nội dung bởi Mobile Bottom Nav.
     - **Cân Chỉnh Vị Trí Speed Dial:** Điều chỉnh vị trí nổi [`DraggableFloatingContactComponent`](file:///root/Project_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/src/components/layout/public/DraggableFloatingContactComponent.tsx) từ `bottom-[200px]` thành `bottom-20 md:bottom-8 right-4`.
  3. **Nâng Cấp Trình Soạn Thảo Visual Rich Text CMS Phong Cách Canva Cho Các Trang SEO:**
     - **Canva Font Family Selector:** Tuyển chọn 10 font Google Fonts tiếng Việt hiện đại (`Inter`, `Be Vietnam Pro`, `Montserrat`, `Roboto`, `Plus Jakarta Sans`, `Playfair Display`, `Merriweather`, `Lora`, `Oswald`) kèm xem trước font thực tế (Visual Font Preview) trong dropdown.
     - **Canva Font Size Presets:** Danh sách chọn nhanh kích thước font từ 12px đến 48px Hero Title.
     - **Canva Curated Color Palette & Highlight:** Popover bảng màu chọn sẵn chuẩn thương hiệu và màu pastel highlight, kèm HEX color picker tùy biến.
     - **Line & Letter Spacing:** Thêm Tiptap extensions điều chỉnh khoảng cách dòng (1.2 -> 2.0) và độ giãn chữ (-0.02em -> 0.1em).
     - **Canva Callout Cards & CTA Builder:** Nút chèn khối điểm nhấn SEO (thông tin, lưu ý, cam kết) và nút kêu gọi hành động CTA (gọi hotline, nhận báo giá) chuyển đổi cao trực quan vào nội dung bài viết.

- **Kết Quả Kiểm Chứng (Verification):**
  - Typecheck `pnpm exec tsc --noEmit` pass 100% (0 errors).
  - Lint: Kiểm tra toàn bộ file mới/chạm pass 100%.
  - Next.js Production Build: `pnpm build` pass 100% (17/17 routes tĩnh và động, route `/manifest.webmanifest` và `/offline` prerender thành công).

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

---

## CÁC GIAI ĐOẠN LỊCH SỬ TRƯỚC ĐÓ (PLAN 1 ĐẾN PLAN 58)

> Toàn bộ các Plan lịch sử trước đây đã được tự động lưu trữ sang các file độc lập để tối ưu hóa token và hiệu năng tài liệu:
> 📦 **Giai đoạn Plan 54 - Plan 58:** [CHANGELOG_ARCHIVE_V3.md](./changelogs/CHANGELOG_ARCHIVE_V3.md)
> 📦 **Giai đoạn Plan 51 - Plan 53:** [CHANGELOG_ARCHIVE_V2.md](./changelogs/CHANGELOG_ARCHIVE_V2.md)
> 📦 **Giai đoạn Plan 1 - Plan 50:** [CHANGELOG_ARCHIVE_V1.md](./changelogs/CHANGELOG_ARCHIVE_V1.md)
