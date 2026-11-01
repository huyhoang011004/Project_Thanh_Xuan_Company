# Plan 68: Triển Khai Hệ Thống Cinematic Living Motion Đa Phân Hệ (Trang Chủ, Dịch Vụ, Vệ Sinh, Giới Thiệu)

> Status: Done | Created: 2026-11-01 | Hệ thống: fe-nextjs-thanhxuan-laundry

---

## 1. Overview & Affected Files

### 1.1. Mục tiêu
Nâng cấp toàn diện trải nghiệm thị giác từ giao diện tĩnh dạng "brochure ảnh" sang **hệ thống chuyển động liên tục như video điện ảnh (Cinematic Living Experience)** cho website `thanhxuanlaundry.com` trên cả 4 phân hệ chính (Trang Chủ, Dịch Vụ, Vệ Sinh Công Nghiệp, Giới Thiệu & Liên Hệ). Khách hàng khi truy cập sẽ luôn cảm nhận được nhịp thở và năng lực sản xuất 24/7 của xưởng giặt là công nghiệp công suất 5+ tấn/ngày.

### 1.2. Phạm vi (In-Scope)
- **Cinematic Ambient Motion (Chuyển động môi trường liên tục):**
  - Hiệu ứng máy quay điện ảnh Ken Burns (Slow Pan & Zoom loop 25s êm ái, GPU-accelerated) áp dụng cho Hero Banner ở Trang Chủ, Vệ Sinh, Dịch Vụ.
  - Hiệu ứng vi hạt sạch & luồng bọt khí nano lơ lửng (`FloatingCleanParticlesComponent`).
  - Hỗ trợ phát video loop nền xưởng thực tế (WebM/MP4 muted, loop, playsinline).
- **Infinite Production Marquee (Dải băng chuyền công suất 24/7):**
  - Tích hợp dải băng chuyền thông số và chứng chỉ năng lực trôi vô tận không ngừng nghỉ dưới chân Hero (`InfiniteProductionMarqueeComponent`).
- **Interactive Automated Workflow (Dây chuyền sản xuất 5 bước mô phỏng dòng chảy):**
  - Nâng cấp khối Quy trình vận hành (`WorkProcess.tsx` & Trang Chủ) với dòng xung điện/tia sáng quang học chạy liên tục từ Bước 1 đến Bước 5.
- **Animated Number Counter (Bộ đếm số nhảy động nhịp nhàng):**
  - Component đếm số nhảy mượt mà (`AnimatedCounterComponent`) kích hoạt mỗi khi cuộn tới các khối năng lực (5+ Tấn/ngày, 500+ Doanh nghiệp, 99.8% Sạch chuẩn, 100.000+ m²).
- **Cinematic Video Modal (Xem toàn cảnh xưởng giặt 4K):**
  - Nút xem video thực tế với hiệu ứng sóng âm (Radar Ripple), bấm mở popup video 4K sắc nét (`HeroVideoModalComponent`).
- **Tối ưu hiệu năng Core Web Vitals:**
  - Toàn bộ animation dùng thuộc tính phần cứng `transform: translate3d/scale` và `opacity`, bật `will-change`, không gây re-render hay giật lag trên thiết bị di động yếu.

### 1.3. Ngoài phạm vi (Out-of-Scope)
- Không thay đổi schema cơ sở dữ liệu MongoDB ở Backend.
- Không can thiệp vào các ứng dụng nội bộ (`fe-react-thanhxuan-internal`, `fe-react-thanhxuan-admin`).

### 1.4. Bảng File Ảnh Hưởng

| Path | Action | Lý do |
| :--- | :--- | :--- |
| `fe-nextjs-thanhxuan-laundry/src/app/globals.css` | Edit | Bổ sung các keyframes điện ảnh: `kenBurnsSlow`, `marqueeInfinite`, `glowPulsePath`, `floatingParticles` |
| `fe-nextjs-thanhxuan-laundry/src/components/common/motion/FloatingCleanParticlesComponent.tsx` | Add | Component vi hạt bọt khí & hơi nước sạch nano lơ lửng |
| `fe-nextjs-thanhxuan-laundry/src/components/common/motion/InfiniteProductionMarqueeComponent.tsx` | Add | Dải băng chuyền thông số & năng lực công nghiệp trôi vô tận |
| `fe-nextjs-thanhxuan-laundry/src/components/common/motion/AnimatedCounterComponent.tsx` | Add | Bộ đếm số nhảy tự động mượt mà khi cuộn tới |
| `fe-nextjs-thanhxuan-laundry/src/components/common/motion/HeroVideoModalComponent.tsx` | Add | Modal popup xem video toàn cảnh xưởng giặt 4K với hiệu ứng backdrop blur |
| `fe-nextjs-thanhxuan-laundry/src/features/public/home/components/HeroSectionComponent.tsx` | Edit | Tích hợp Ken Burns, nút Xem Video 4K radar wave, và nhúng vi hạt ambient |
| `fe-nextjs-thanhxuan-laundry/src/features/public/home/components/IntroSectionComponent.tsx` | Edit | Bổ sung Animated Counter cho 4 số liệu năng lực cốt lõi |
| `fe-nextjs-thanhxuan-laundry/src/features/public/home/components/ServicesGridComponent.tsx` | Edit | Bổ sung hiệu ứng viền sáng quang học (shimmer border glow) khi lướt |
| `fe-nextjs-thanhxuan-laundry/src/features/public/home/components/AutomatedConveyorWorkflowComponent.tsx` | Add | Dây chuyền băng tải mô phỏng quy trình giặt - sấy - là - đóng gói với tia sáng chạy dọc |
| `fe-nextjs-thanhxuan-laundry/src/features/public/home/HomePage.tsx` | Edit | Tích hợp Marquee dưới Hero và Automated Workflow vào luồng trang chủ |
| `fe-nextjs-thanhxuan-laundry/src/features/public/vesinh/components/VesinhHeroSectionComponent.tsx` | Edit | Tích hợp Ken Burns, dải băng chuyền cam kết và số liệu diện tích làm sạch |
| `fe-nextjs-thanhxuan-laundry/src/features/public/services/components/ServiceBanner.tsx` | Edit | Tích hợp chuyển động Ken Burns & ambient glow cho banner dịch vụ |
| `fe-nextjs-thanhxuan-laundry/src/features/public/services/components/WorkProcess.tsx` | Edit | Tích hợp đường dẫn sáng quang học chạy liên tục giữa các bước |
| `.agents/docs/CODEBASE_ATLAS.md` | Edit | Cập nhật cấu trúc component motion dùng chung mới |
| `.agents/docs/srs_sdd/srs_sdd_fe_laundry.md` | Edit | Cập nhật tài liệu kiến trúc UI/UX Cinematic Motion System |
| `.agents/docs/SRS_SDD.md` | Edit | Ghi nhận 1 dòng Document History |
| `.agents/docs/CHANGELOG.md` | Edit | Ghi nhận chi tiết bài luận hoàn thành Plan 68 |

---

## 2. Technical Approach

### 2.1. Kiến trúc Motion & GPU Acceleration (60 FPS Performance)
- **Zero Heavy JS Libraries:** Không cài đặt các thư viện nặng (như Three.js hay Lottie cồng kềnh) gây ảnh hưởng Core Web Vitals (LCP/FID/INP). Toàn bộ chuyển động liên tục được xử lý qua **CSS Hardware Acceleration** (`transform: translate3d`, `opacity`, `backdrop-filter`).
- **IntersectionObserver Re-triggerable:** Đối với các hiệu ứng cuộn (Animated Counters, Fade-in), sử dụng `IntersectionObserver` với cơ chế trigger mượt mà mỗi khi component trôi vào vùng nhìn (viewport), giải quyết triệt để lỗi "lướt qua quá nhanh rồi đứng im hoặc F5 không thấy lại".

### 2.2. Dữ liệu & Interfaces minh họa

```typescript
// Định nghĩa cấu hình Marquee Item
export interface ProductionMarqueeItem {
  id: string;
  badge?: string;
  label: string;
  highlight?: string;
}

// Định nghĩa cấu hình Counter
export interface AnimatedCounterProps {
  endValue: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  label: string;
}
```

---

## 3. Implementation Tasks (Checklist)

- [x] **T1: Thiết lập Hệ thống Keyframes Điện ảnh tại globals.css** - Bổ sung `@keyframes kenBurnsSlow`, `@keyframes infiniteMarquee`, `@keyframes shimmerLaser`, `@keyframes particleFloat` tại `src/app/globals.css`.
- [x] **T2: Xây dựng InfiniteProductionMarqueeComponent** - Tạo component dải băng chuyền vô tận với 2 lớp clone text chạy 60 FPS không giật lag tại `src/components/common/motion/InfiniteProductionMarqueeComponent.tsx`.
- [x] **T3: Xây dựng AnimatedCounterComponent** - Tạo component đếm số nhảy số tự động (RAF easing) khi chạm viewport tại `src/components/common/motion/AnimatedCounterComponent.tsx`.
- [x] **T4: Xây dựng FloatingCleanParticlesComponent** - Tạo hiệu ứng vi hạt bọt khí / hơi nước lơ lửng tại `src/components/common/motion/FloatingCleanParticlesComponent.tsx`.
- [x] **T5: Xây dựng HeroVideoModalComponent** - Tạo modal phát video xưởng thực tế với nút radar wave tại `src/components/common/motion/HeroVideoModalComponent.tsx`.
- [x] **T6: Xây dựng AutomatedConveyorWorkflowComponent** - Thiết kế mô hình dây chuyền sản xuất 5 bước với tia sáng quang học chạy liên tục giữa các trạm tại `src/features/public/home/components/AutomatedConveyorWorkflowComponent.tsx`.
- [x] **T7: Tích hợp Toàn diện Trang Chủ (HomePage)** - Nâng cấp `HeroSectionComponent`, chèn `InfiniteProductionMarquee`, nhúng `AnimatedCounter` vào `IntroSectionComponent`, nâng cấp `ServicesGridComponent` và chèn `AutomatedConveyorWorkflowComponent` vào `HomePage.tsx`.
- [x] **T8: Tích hợp Phân Hệ Dịch Vụ & Quy Trình** - Cập nhật `ServiceBanner.tsx` với Ken Burns slow pan và nâng cấp `WorkProcess.tsx` với đường dẫn sáng laser nối tiếp.
- [x] **T9: Tích hợp Phân Hệ Vệ Sinh Công Nghiệp** - Cập nhật `VesinhHeroSectionComponent.tsx` với Ken Burns, bộ đếm diện tích làm sạch và dải cam kết di động.
- [x] **T10: Kiểm Thử Toàn Diện & Đồng Bộ 5 Trụ Cột Tài Liệu** - Chạy `pnpm exec tsc --noEmit` và `pnpm build` tại `fe-nextjs-thanhxuan-laundry/`, cập nhật `CODEBASE_ATLAS.md`, `srs_sdd_fe_laundry.md`, `SRS_SDD.md`, `CHANGELOG.md`, tự động commit và push nhánh `dev`.

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm tra thực tế
- Typecheck: `cd fe-nextjs-thanhxuan-laundry && pnpm exec tsc --noEmit`
- Build xác thực tĩnh: `cd fe-nextjs-thanhxuan-laundry && pnpm build`

### 4.2. Kịch bản kiểm chứng
1. **Kiểm tra chuyển động liên tục (Continuous Motion):** Mở Trang Chủ trên máy tính và điện thoại:
   - Ảnh nền máy giặt chuyển động trôi chậm và zoom êm ái như máy quay điện ảnh.
   - Bọt khí vi hạt lơ lửng chuyển động không ngừng.
   - Dải băng chuyền công suất 5+ tấn/ngày trôi ngang vô tận 24/7.
2. **Kiểm tra tải lại trang (Reload Test):** Bấm F5 hoặc kéo tải lại trang, mọi hiệu ứng xuất hiện nhịp nhàng, các bộ đếm số nhảy tăng dần rõ ràng, không bị chớp giật hay biến mất tức thì.
3. **Kiểm tra dây chuyền sản xuất:** Cuộn tới phần Quy trình 5 bước, quan sát tia sáng chạy dọc từ Bước 1 đến Bước 5 liên tục.
4. **Kiểm tra trang Vệ Sinh & Dịch Vụ:** Banner có chuyển động điện ảnh, dải cam kết chạy mượt mà.
5. **Hiệu năng & Mobile:** Kiểm tra CPU không bị quá tải (dưới 5%), tốc độ khung hình duy trì 60 FPS ổn định trên thiết bị di động.

---

## 5. Risks & Rollback

- **Rủi ro:** Animation quá nhiều có thể gây giật lag trên điện thoại cấu hình yếu hoặc chế độ tiết kiệm pin.
- **Biện pháp giảm thiểu:** Dùng media query `@media (prefers-reduced-motion: reduce)` để tự động giảm nhẹ animation; chỉ sử dụng `transform` và `opacity` để kích hoạt GPU Compositor layer.
- **Rollback:** Dùng `git checkout dev` nếu phát sinh lỗi ngoài ý muốn.

---

## Changelog

- 2026-11-01: Khởi tạo Plan 68 - Thiết kế hệ thống Cinematic Living Motion đa phân hệ cho `fe-nextjs-thanhxuan-laundry`.
