# Plan 56: Hoàn Thiện Toàn Diện Cấu Hình & Trải Nghiệm PWA (fe-react-thanhxuan-internal)

> Status: Done | Created: 2026-10-30

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Bối cảnh
- **Bối cảnh:** Cổng vận hành nội bộ `fe-react-thanhxuan-internal` phục vụ tài xế giao nhận (Shipper), thợ xưởng (Worker), thủ kho và kế toán di chuyển liên tục, thường xuyên thao tác trong môi trường sóng yếu (tầng hầm nhà hàng, khách sạn, xưởng giặt kín trần tôn).
- **Hiện trạng:**
  - Đã có `vite-plugin-pwa` cơ bản, `OfflineBanner.tsx` và cơ chế `offline-queue.ts` (IndexedDB) cho shipper fuel & handover count.
  - Tuy nhiên, PWA chưa đạt chuẩn sản xuất vì:
    1. Thiếu toàn bộ icon PNG chuẩn (`192x192`, `512x512`, `maskable`, `apple-touch-icon-180x180`). Hiện tại chỉ dùng `icon.svg`, khiến iOS Safari không nhận diện được icon ứng dụng và Lighthouse PWA bị đánh trượt tiêu chí Installability.
    2. Thiếu cấu hình Workbox Runtime Caching cho ảnh Cloudinary CDN (`res.cloudinary.com`) và Google Fonts CDN (`fonts.gstatic.com`).
    3. Thiếu App Shortcuts trong Web App Manifest (lối tắt 1 chạm ngoài màn hình chính để vào nhanh Giao nhận, Chấm công, Trạm thợ).
    4. Thiếu giao diện thông báo cập nhật phiên bản mới (PWA Reload Prompt): khi có deploy mới, app cần thông báo thân thiện để người dùng làm mới trang thay vì chạy mã nguồn cũ âm thầm.
    5. Cần bổ sung meta tags hoàn chỉnh cho iOS PWA trong `index.html`.

### 1.2. Kế hoạch thực hiện chi tiết

1. **Sinh bộ Icon PNG chuẩn từ `public/icon.svg`:**
   - Dùng script headless Chrome render vector `public/icon.svg` thành các file PNG chuẩn:
     - `public/pwa-192x192.png` (Icon tiêu chuẩn Android/Chrome)
     - `public/pwa-512x512.png` (Splash screen & Store icon)
     - `public/pwa-maskable-512x512.png` (Adaptive icon cho Android hiện đại)
     - `public/apple-touch-icon-180x180.png` (Icon chuẩn cho iOS Safari)
     - `public/favicon.ico` / `public/favicon.png` (32x32)

2. **Nâng cấp cấu hình PWA trong `vite.config.ts`:**
   - Cập nhật mảng `icons` trong Manifest đầy đủ các file PNG (192x192, 512x512, maskable).
   - Thêm `shortcuts`:
     - Giao nhận đối tác (`/operations/shipper/handover`)
     - Chấm công xưởng (`/operations/attendance`)
     - Trạm thợ theo giờ (`/operations/worker/piecework`)
     - Soạn đồ xuất xưởng (`/operations/warehouse-manager/warehouse`)
   - Bổ sung `runtimeCaching` cho:
     - Google Fonts static (`https://fonts.gstatic.com/.*`) - CacheFirst
     - Cloudinary Media (`https://res.cloudinary.com/.*`) - StaleWhileRevalidate với expiration 30 ngày (maxEntries 120)

3. **Cập nhật `index.html`:**
   - Thay `<link rel="apple-touch-icon" href="/icon.svg" />` bằng `/apple-touch-icon-180x180.png`.
   - Bổ sung `<meta name="application-name" content="Thanh Xuân Quản Vận" />`.

4. **Xây dựng Component Thông Báo Cập Nhật (PWA Reload Prompt):**
   - Tạo `src/components/layout/PwaReloadPrompt.tsx` tích hợp module `virtual:pwa-register/react`.
   - Hiển thị Toast thông báo khi Service Worker phát hiện bản build mới sẵn sàng:
     - Thông điệp: *"Đã có phiên bản mới của hệ thống vận hành. Cập nhật ngay để nhận các sửa đổi mới nhất."*
     - Nút "Cập nhật ngay" (gọi `updateServiceWorker(true)`) và nút "Để sau".
   - Tích hợp vào `src/components/layout/AppLayout.tsx`.

5. **Kiểm thử & Xác minh (Verification):**
   - Chạy `pnpm exec tsc --noEmit` và `pnpm build` tại `fe-react-thanhxuan-internal`.
   - Kiểm tra `dist/manifest.webmanifest`, `dist/sw.js` chứa đầy đủ icon, shortcuts, và runtime caching rules.

### 1.3. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `fe-react-thanhxuan-internal/public/pwa-192x192.png` | `create` | Icon PWA 192px chuẩn Android/Desktop |
| `fe-react-thanhxuan-internal/public/pwa-512x512.png` | `create` | Icon PWA 512px Splash screen |
| `fe-react-thanhxuan-internal/public/pwa-maskable-512x512.png` | `create` | Icon PWA maskable bo tròn Android |
| `fe-react-thanhxuan-internal/public/apple-touch-icon-180x180.png` | `create` | Icon iOS Apple Touch Icon |
| `fe-react-thanhxuan-internal/vite.config.ts` | `edit` | Cập nhật icons, shortcuts, runtimeCaching Cloudinary & Fonts |
| `fe-react-thanhxuan-internal/index.html` | `edit` | Cập nhật link apple-touch-icon PNG và meta application-name |
| `fe-react-thanhxuan-internal/src/components/layout/PwaReloadPrompt.tsx` | `create` | UI nhắc nhở cập nhật bản build mới |
| `fe-react-thanhxuan-internal/src/components/layout/AppLayout.tsx` | `edit` | Nhúng PwaReloadPrompt |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | `edit` | Cập nhật tài liệu kỹ thuật PWA |
| `.agents/docs/CHANGELOG.md` | `edit` | Ghi chép nhật ký hoàn thiện PWA |

---

## 2. Kế hoạch triển khai (Task Checklist)

- [x] **T1: Sinh bộ icon PNG chuẩn từ SVG & Đặt vào thư mục `public/`**
- [x] **T2: Nâng cấp `vite.config.ts` (Manifest icons, shortcuts, Cloudinary & Fonts caching) và `index.html`**
- [x] **T3: Tạo component `PwaReloadPrompt.tsx` và gắn vào `AppLayout.tsx`**
- [x] **T4: Kiểm tra build production `pnpm build` & xác minh manifest / sw output**
- [x] **T5: Đồng bộ tài liệu kỹ thuật SRS/SDD & Changelog**

## 3. Execution Log

- **2026-10-30:**
  - Hoàn tất T1: Sinh 5 file icon PNG kích thước chuẩn pixel-perfect (`pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`, `apple-touch-icon-180x180.png`, `favicon-64x64.png`).
  - Hoàn tất T2: Cập nhật `vite.config.ts` khai báo icons, shortcuts 4 luồng vận hành, runtime caching cho Google Fonts và Cloudinary CDN; cập nhật `index.html` với meta iOS Apple Touch Icon.
  - Hoàn tất T3: Tạo `src/components/layout/PwaReloadPrompt.tsx` sử dụng Native Service Worker API (zero additional dependency) và gắn vào `AppLayout.tsx`.
  - Hoàn tất T4: Verify `tsc --noEmit` và `pnpm build` pass 100%, Service Worker precache 21 assets, sinh `manifest.webmanifest` và `sw.js` hoàn chỉnh.
  - Hoàn tất T5: Đồng bộ `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CODEBASE_ATLAS.md` và `CHANGELOG.md`.
