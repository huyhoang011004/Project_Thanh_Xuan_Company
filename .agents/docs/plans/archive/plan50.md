# Plan 50: Nâng Cấp Toàn Diện Thương Hiệu, Bảng Màu Light/Dark Mode, Thư Viện Thực Tế & Trang Quản Trị Admin Tinh Gọn Cho Website Chuyển Nhà (fe-nextjs-chuyennhatietkiem)

> Status: Completed | Created: 2026-10-28

## 1. Overview & Affected Files

### 1.1. Mục tiêu
- **Chuẩn hóa thông tin doanh nghiệp pháp lý & liên hệ**:
  - Tên công ty: `Công ty TNHH Kinh doanh Thương mại và Dịch vụ Thanh Xuân`
  - Mã số thuế (MST): `0108942736`
  - Hotline / Zalo: `0769 270 676` (0769.270.676)
  - Địa chỉ: `Số 16 ngõ 81 Vạn Phúc, phường Hà Đông, thành phố Hà Nội`
- **Tái thiết kế hệ thống nhận diện màu sắc & Chế độ Sáng/Tối (Light/Dark Mode)**:
  - Bảng màu chủ đạo theo chỉ đạo: **Xanh dương nhạt (Soft Sky/Ocean Blue)**, **Xanh lá nhạt (Soft Mint/Emerald)**, **Trắng tinh tế (#FFFFFF)** và **Đen hiện đại (#020617 / #0f172a)**.
  - Xây dựng **Theme Toggle (Chuyển đổi Light / Dark mode)** mượt mà, lưu trạng thái vào `localStorage` và tự động áp dụng class `dark` trên toàn bộ website.
  - Bổ sung hệ thống **Hiệu ứng xuất hiện component (Smooth Entrance Animations)** với các keyframes `animate-fade-in-up`, `animate-scale-in`, `stagger` giúp giao diện sống động, cao cấp.
- **Bổ sung các khối nội dung bảo chứng thực tế (Social Proof & Visual Showcase)**:
  - **RecentProjectsShowcaseComponent**: Trình diễn các đơn chuyển nhà thực tế gần đây (Căn hộ chung cư cao cấp, phòng trọ sinh viên, văn phòng, nhà phố) kèm ảnh thực tế đóng gói, bọc lót và vận chuyển.
  - **CustomerReviewsComponent**: Khối đánh giá khách hàng (Testimonials) với rating 5 sao, ảnh đại diện, nghề nghiệp, khu vực (Cầu Giấy, Hà Đông, Nam Từ Liêm...) và cảm nhận chân thực về thái độ đội thợ Thanh Xuân.
- **Xây dựng Phân Hệ Quản Trị Admin Tinh Gọn (`/admin`)**:
  - Tương tự phân hệ Admin bên Laundry nhưng chỉ tập trung vào **5 chức năng cốt lõi cần thiết nhất cho nghiệp vụ Chuyển Nhà**:
    1. `/admin/login`: Đăng nhập bảo mật tài khoản quản trị.
    2. `/admin/dashboard`: Bảng điều khiển thống kê số đơn khảo sát mới, tỷ lệ chốt đơn, doanh thu dự toán.
    3. `/admin/quotes`: Quản lý danh sách khách đặt lịch khảo sát (`moving_quotes`), xem chi tiết lộ trình, tầng lầu, đồ đạc, ảnh chụp, cập nhật báo giá chốt và chuyển trạng thái (`PENDING_QUOTE` $\rightarrow$ `QUOTED` $\rightarrow$ `CONFIRMED` $\rightarrow$ `CANCELLED`).
    4. `/admin/articles`: Quản lý bài viết cẩm nang kinh nghiệm dọn nhà và phong thủy nhập trạch.
    5. `/admin/settings`: Xem và cập nhật thông tin công ty, MST, hotline, địa chỉ pháp lý.
- **Tối ưu hiển thị Mobile toàn diện**:
  - Kích thước touch-target tối thiểu 44-48px cho toàn bộ nút bấm, thanh trượt Km, selector đồ đạc.
  - Mobile Menu Drawer trên Header và Mobile Action Bar dưới chân màn hình gọi điện & chat Zalo 1-chạm.

### 1.2. Out of scope
- Không thay đổi các bảng cơ sở dữ liệu của phân hệ Giặt là (`laundry_express`) hay Nội bộ (`internal_express`).
- Không thêm các module marketing phức tạp (Email Marketing / Zalo Sequence) vốn không cần thiết cho website chuyển nhà tinh gọn.

### 1.3. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `fe-nextjs-chuyennhatietkiem/src/app/globals.css` | Edit | Định nghĩa lại Design Tokens màu sắc mới (Xanh dương nhạt, Xanh lá nhạt, Trắng, Đen) và biến CSS Dark mode, keyframes animation |
| `fe-nextjs-chuyennhatietkiem/src/components/common/ThemeToggleComponent.tsx` | Add | Nút chuyển đổi chế độ Sáng / Tối (Sun / Moon icon) |
| `fe-nextjs-chuyennhatietkiem/src/context/ThemeContext.tsx` | Add | React Context quản lý theme `light` / `dark`, lưu `localStorage`, đồng bộ `<html>` class |
| `fe-nextjs-chuyennhatietkiem/src/app/layout.tsx` | Edit | Bọc `ThemeProvider`, hỗ trợ chuyển đổi theme toàn cục và SEO metadata công ty mới |
| `fe-nextjs-chuyennhatietkiem/src/components/layout/Header.tsx` | Edit | Cập nhật Hotline mới `0769 270 676`, bảng màu mới, tích hợp `ThemeToggleComponent` |
| `fe-nextjs-chuyennhatietkiem/src/components/layout/Footer.tsx` | Edit | Cập nhật thông tin công ty đầy đủ: Tên cty, MST `0108942736`, Hotline, Địa chỉ Vạn Phúc Hà Đông |
| `fe-nextjs-chuyennhatietkiem/src/components/layout/MobileActionBar.tsx` | Edit | Cập nhật số hotline gọi ngay và link chat Zalo với SĐT `0769 270 676` |
| `fe-nextjs-chuyennhatietkiem/src/app/lien-he/page.tsx` | Edit | Cập nhật địa chỉ trụ sở Hà Đông, MST, Hotline chuẩn |
| `fe-nextjs-chuyennhatietkiem/src/components/home/RecentProjectsShowcaseComponent.tsx` | Add | Khối trưng bày các đơn dọn nhà thực tế gần đây (ảnh thực tế, lộ trình, loại nhà) |
| `fe-nextjs-chuyennhatietkiem/src/components/home/CustomerReviewsComponent.tsx` | Add | Khối đánh giá khách hàng thực tế 5 sao |
| `fe-nextjs-chuyennhatietkiem/src/components/home/HeroEstimatorComponent.tsx` | Edit | Điều chỉnh palette màu sang Xanh dương nhạt + Xanh lá nhạt + Dark mode |
| `fe-nextjs-chuyennhatietkiem/src/components/home/WhySaveBentoComponent.tsx` | Edit | Cập nhật phong cách màu sắc mới và hỗ trợ Dark mode |
| `fe-nextjs-chuyennhatietkiem/src/components/home/CostComparisonComponent.tsx` | Edit | Cập nhật phong cách màu sắc mới và Dark mode |
| `fe-nextjs-chuyennhatietkiem/src/components/home/PackingProtectionComponent.tsx` | Edit | Cập nhật phong cách màu sắc mới và Dark mode |
| `fe-nextjs-chuyennhatietkiem/src/components/home/SmartCargoVisualizerComponent.tsx` | Edit | Tối ưu touch target và dark mode |
| `fe-nextjs-chuyennhatietkiem/src/app/page.tsx` | Edit | Tích hợp `RecentProjectsShowcaseComponent` và `CustomerReviewsComponent` |
| `fe-nextjs-chuyennhatietkiem/src/app/bang-gia/page.tsx` | Edit | Cập nhật bảng màu Sky Blue, Mint và Dark mode |
| `fe-nextjs-chuyennhatietkiem/src/app/admin/layout.tsx` | Add | Shell layout Admin tinh gọn với Sidebar điều hướng, Theme toggle và Header Admin |
| `fe-nextjs-chuyennhatietkiem/src/app/admin/login/page.tsx` | Add | Màn hình đăng nhập quản trị Admin |
| `fe-nextjs-chuyennhatietkiem/src/app/admin/dashboard/page.tsx` | Add | Bảng điều khiển KPI khảo sát chuyển nhà |
| `fe-nextjs-chuyennhatietkiem/src/app/admin/quotes/page.tsx` | Add | Màn hình quản lý danh sách đơn khảo sát báo giá (`moving_quotes`) |
| `fe-nextjs-chuyennhatietkiem/src/app/admin/articles/page.tsx` | Add | Màn hình quản lý bài viết cẩm nang chuyển nhà |
| `fe-nextjs-chuyennhatietkiem/src/app/admin/settings/page.tsx` | Add | Màn hình xem & quản lý thông tin công ty pháp lý |
| `fe-nextjs-chuyennhatietkiem/src/lib/api-client.ts` | Edit | Bổ sung API endpoints cho Admin (`fetchAdminQuotes`, `updateQuoteStatus`, `fetchAdminDashboardStats`) |

---

## 2. Implementation Tasks (Checklist)

### Giai đoạn 1: Chuẩn Hóa Thông Tin Công Ty & Hệ Thống Theme Light/Dark Mode
- [x] T1: Cập nhật `fe-nextjs-chuyennhatietkiem/src/app/globals.css` định nghĩa lại biến màu CSS (Xanh dương nhạt, Xanh lá nhạt, Trắng, Đen) và các animation `fadeInUp`, `scaleIn`
- [x] T2: Tạo `ThemeContext.tsx` tại `fe-nextjs-chuyennhatietkiem/src/context/ThemeContext.tsx` và `ThemeToggleComponent.tsx` tại `src/components/common/ThemeToggleComponent.tsx`
- [x] T3: Cập nhật `fe-nextjs-chuyennhatietkiem/src/app/layout.tsx` bọc `ThemeProvider` và cập nhật Metadata SEO theo tên công ty mới
- [x] T4: Cập nhật `Header.tsx`, `Footer.tsx`, `MobileActionBar.tsx` và `src/app/lien-he/page.tsx` chuẩn hóa 100% thông tin công ty: `Công ty TNHH Kinh doanh Thương mại và Dịch vụ Thanh Xuân`, MST `0108942736`, Hotline `0769 270 676`, Địa chỉ `Số 16 ngõ 81 Vạn Phúc, phường Hà Đông, Hà Nội`

### Giai đoạn 2: Nâng Cấp Bảng Màu & Showcase Trang Chủ
- [x] T5: Tạo `RecentProjectsShowcaseComponent.tsx` tại `fe-nextjs-chuyennhatietkiem/src/components/home/RecentProjectsShowcaseComponent.tsx` với lưới dự án thực tế kèm ảnh và thông số vận chuyển (< 200 dòng)
- [x] T6: Tạo `CustomerReviewsComponent.tsx` tại `fe-nextjs-chuyennhatietkiem/src/components/home/CustomerReviewsComponent.tsx` với khối đánh giá 5 sao từ khách hàng (< 200 dòng)
- [x] T7: Cập nhật các component trang chủ (`HeroEstimatorComponent`, `WhySaveBentoComponent`, `CostComparisonComponent`, `PackingProtectionComponent`, `SmartCargoVisualizerComponent`) sang tông màu Xanh dương nhạt + Xanh lá nhạt và tương thích Dark mode hoàn hảo
- [x] T8: Cập nhật `fe-nextjs-chuyennhatietkiem/src/app/page.tsx` tích hợp `RecentProjectsShowcaseComponent` và `CustomerReviewsComponent` kèm hiệu ứng xuất hiện component (< 250 dòng)

### Giai đoạn 3: Xây Dựng Phân Hệ Quản Trị Admin Tinh Gọn
- [x] T9: Xây dựng Admin Layout `fe-nextjs-chuyennhatietkiem/src/app/admin/layout.tsx` với Sidebar tinh gọn, điều hướng và Theme toggle (< 200 dòng)
- [x] T10: Xây dựng màn hình đăng nhập `fe-nextjs-chuyennhatietkiem/src/app/admin/login/page.tsx` (< 150 dòng)
- [x] T11: Xây dựng màn hình Bảng điều khiển `fe-nextjs-chuyennhatietkiem/src/app/admin/dashboard/page.tsx` thống kê đơn khảo sát và tỷ lệ chốt (< 200 dòng)
- [x] T12: Xây dựng màn hình Quản lý Đơn Khảo Sát Báo Giá `fe-nextjs-chuyennhatietkiem/src/app/admin/quotes/page.tsx` xem chi tiết lộ trình, đổi trạng thái và cập nhật giá chốt (< 250 dòng)
- [x] T13: Xây dựng màn hình Quản lý Bài Viết Cẩm Nang `fe-nextjs-chuyennhatietkiem/src/app/admin/articles/page.tsx` (< 200 dòng)
- [x] T14: Xây dựng màn hình Cấu Hình Thông Tin Doanh Nghiệp `fe-nextjs-chuyennhatietkiem/src/app/admin/settings/page.tsx` (< 180 dòng)

### Giai đoạn 4: Verification, Đồng Bộ Tài Liệu & Triển Khai
- [x] T15: Chạy typecheck và build cho `fe-nextjs-chuyennhatietkiem` (`pnpm exec tsc --noEmit` & `pnpm build`)
- [ ] T16: Đồng bộ 5 trụ cột tài liệu dự án (`CODEBASE_ATLAS.md`, `srs_sdd_fe_nextjs.md`, `SRS_SDD.md`, `CHANGELOG.md`), commit và push lên nhánh `dev`
- [ ] T17: Triển khai trực tiếp bản build mới lên Vercel Production và kiểm tra URL trực tiếp

---

## 3. Changelog
- 2026-10-28: Hoàn thành toàn diện Plan 50 nâng cấp thương hiệu, theme light/dark mode, showcase thực tế, tối ưu mobile và phân hệ Admin tinh gọn.
