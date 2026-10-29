# Plan 34: Tái cấu trúc UI/UX Trang Chủ (Hero Diagonal Split Video-Ảnh & Di dời Form Liên Hệ xuống Pre-Footer)

> Status: Done | Created: 2026-10-25

## 1. Overview & Affected Files

### Mục tiêu
- **Di dời Form Liên hệ xuống Pre-Footer:** Bỏ khối `Contact` khỏi `HeroSectionComponent.tsx`, đưa xuống vị trí ngay trên Footer trong `HomePage.tsx` và nâng cấp thành khu vực chuyển đổi B2B cao cấp (B2B Lead Magnet: Cam kết giặt mẫu 01 tuần miễn phí + Form liên hệ chuẩn chỉ).
- **Thiết kế Hero Section "Diagonal Split" (Chia chéo):** Xây dựng bố cục Hero chia chéo năng động (Dynamic Angled Cut 12°-14°):
  - Bên trái: Video reel vận hành xưởng giặt công nghiệp (autoplay loop muted), lớp phủ tiêu đề, CTA kép và nút xem video xưởng 4K.
  - Đường chia chéo: Dải viền phát sáng công nghệ (Glowing Accent Divider) tạo chiều sâu 3D.
  - Bên phải: Ảnh tĩnh thành phẩm đồ sạch chuẩn 5 sao / xe tải giao nhận, tích hợp các thẻ nổi bảo chứng năng lực (5+ Tấn/Ngày, 99.8% Giao đúng hẹn).
- **Hiệu ứng xuất hiện (Entrance & Motion Orchestration):** Tích hợp `framer-motion` cho Hero entrance cascade, diagonal reveal và scroll reveal mượt mà 60fps.
- **Tối ưu hiệu năng:** Video có Poster fallback nạp tức thì bằng `priority={true}`, Intersection Observer tự động tạm dừng video khi cuộn khỏi màn hình, Responsive Mobile chuyển sang bố cục xếp tầng thông minh.
- **Mở rộng CMS Admin Settings:** Cho phép Quản trị viên tùy biến Video URL, Poster, Ảnh thành phẩm bên phải, Font chữ và Theme colors trong trang CMS Admin (`/admin/settings`).

### Out of scope
- Không can thiệp vào logic xử lý đơn hàng hay các phân hệ nội bộ Backend (`internal_express`, `moving_express`).
- Không đổi schema database MongoDB khác ngoài việc bổ sung trường cấu hình tùy chọn trong `Setting` schema của `laundry_express`.

### Assumptions
- Dự án `fe-nextjs-thanhxuan-laundry` đã cài sẵn `framer-motion` v12.42.2 và Tailwind CSS v4 ([package.json:38](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/package.json#L38)).
- Video mặc định có thể sử dụng video mẫu MP4 nén tối ưu (hoặc video từ Cloudinary/CDN), có cơ chế fallback ảnh tĩnh nếu người dùng chưa cấu hình video riêng.

### Bảng file ảnh hưởng
| Path | Action | Lý do |
| :--- | :--- | :--- |
| `fe-nextjs-thanhxuan-laundry/src/features/public/home/components/HeroSectionComponent.tsx` | edit | Tái cấu trúc thành Hero chia chéo (Diagonal Split) Video + Ảnh, bỏ Form Contact |
| `fe-nextjs-thanhxuan-laundry/src/features/public/home/components/PreFooterCtaComponent.tsx` | add | Component chuyển đổi Pre-Footer chứa cam kết B2B và form liên hệ `Contact` |
| `fe-nextjs-thanhxuan-laundry/src/features/public/home/components/index.ts` | edit | Export `PreFooterCtaComponent` |
| `fe-nextjs-thanhxuan-laundry/src/features/public/home/HomePage.tsx` | edit | Bổ sung `PreFooterCtaComponent` trước Footer, truyền config video/ảnh |
| `fe-nextjs-thanhxuan-laundry/src/features/admin/settings/components/SettingEditorHomeComponent.tsx` | edit | Bổ sung cấu hình Video URL, Poster, Ảnh bên phải cho Hero |
| `be-nestjs-thanhxuan/src/modules/laundry/settings/schemas/setting.schema.ts` | edit | Bổ sung `heroVideoUrl`, `heroVideoPoster`, `heroSideImage` vào `homepageConfig` |
| `be-nestjs-thanhxuan/src/modules/laundry/settings/dto/update-settings.dto.ts` | edit | Cập nhật validation DTO cho các trường mới |
| `.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md` | edit | Cập nhật tài liệu kiến trúc UI phân hệ Web Next.js |
| `.agents/docs/CHANGELOG.md` | edit | Ghi nhật ký tiến hóa Plan 34 |

---

## 2. Technical Approach

### 2.1. Cấu trúc Hero Section "Diagonal Split" (Chia Chéo)

```
+-----------------------------------------------------------------------------------------+
|                                    HERO CONTAINER                                       |
|  [BÊN TRÁI: VIDEO SECTION (~55-60% width)]     /   [BÊN PHẢI: IMAGE SHOWCASE (~40-45%)] |
|  - HTML5 <video> Autoplay Loop Muted          /    - Next.js <Image> Sharp High-Res     |
|  - Poster Image fallback với priority        /     - Subtle Parallax / Zoom Hover       |
|  - Dark Gradient Overlay (đọc rõ chữ)       /      - Floating Glass Badges:             |
|  - Content: Headline, Subtitle, 2 Buttons  /         * "5+ Tấn Đồ/Ngày"                 |
|  - Intersection Observer (Pause khi out)  /          * "Giao Nhận Đúng Hẹn 99.8%"       |
|                                          /                                              |
|                           <GLOWING ACCENT SEPARATOR (SVG / CSS clip-path)>              |
+-----------------------------------------------------------------------------------------+
```

- **Kỹ thuật cắt chéo (Diagonal Angle Cut):**
  - Sử dụng CSS `clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%)` trên desktop để vát nghiêng góc 12° - 14°.
  - Hoặc nhúng đường phân cách SVG viền sáng cyan/blue (`drop-shadow(0 0 12px rgba(83, 168, 222, 0.6))`) nằm giữa 2 khối.
- **Tối ưu hiệu năng Video & Core Web Vitals (LCP < 1.2s):**
  - Video nhúng với `preload="metadata"`, `muted`, `loop`, `playsInline`, `autoPlay`.
  - Poster fallback hiển thị tức thì bằng `<Image priority />` để LCP đạt điểm tối đa trước khi video stream xong frame đầu.
  - Gắn Hook `useIntersectionObserver` tạm dừng video (`videoRef.current.pause()`) khi người dùng cuộn khỏi Hero và phát lại (`play()`) khi quay lại khung nhìn.
- **Responsive Mobile (< 768px):**
  - Chuyển `clip-path: none`, bố cục chuyển sang dạng xếp tầng: Video làm nền mờ phía sau, thông tin tiêu đề và badges hiển thị thoáng đãng phía trên, ảnh showcase trượt bên dưới.

### 2.2. Pre-Footer B2B Lead Magnet Component

- **Vị trí:** Đặt ở cuối `HomePage.tsx` ngay trên Footer ([HomePage.tsx:76](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/src/features/public/home/HomePage.tsx#L76)).
- **Bố cục 2 cột (Desktop Grid 12 cols):**
  - Cột 1 (5 cols): Khối giá trị B2B (Value Proposition):
    - Tiêu đề: *"Đăng Ký Khảo Sát & Nhận Giặt Mẫu Miễn Phí"*
    - Lợi ích: Tặng 1 tuần giặt thử nghiệm, Miễn phí vận chuyển 2 chiều, Bảo hành 100%.
    - Hotline hỗ trợ trực tiếp & Giờ làm việc 24/7.
  - Cột 2 (7 cols): Form `<Contact defaultCategory="tin-tuc-gioi-thieu" />` được bao bọc trong thẻ Card kính mờ (Glassmorphism), bo góc sang trọng.

### 2.3. Data Contract (Settings Backend & Frontend)

```typescript
// Contract mở rộng cho homepageConfig:
export interface HomePageConfig {
  heroBannerImage?: string;
  heroVideoUrl?: string;       // URL video xưởng (MP4/WebM)
  heroVideoPoster?: string;    // Ảnh poster nạp tức thì
  heroSideImage?: string;      // Ảnh thành phẩm / xe tải bên phải
  heroTitle?: string;
  heroSubtitle?: string;
  introTitle?: string;
  introDescription?: string;
  whyChooseUsTitle?: string;
  whyChooseUsDescription?: string;
  whyChooseUsImage?: string;
  whyChooseUsItems?: { title: string; description: string }[];
  faqs?: { question: string; answer: string }[];
}
```

---

## 3. Implementation Tasks (Checklist)

- [x] T1: [Backend Schema & DTO] - Cập nhật `be-nestjs-thanhxuan/src/modules/laundry/settings/schemas/setting.schema.ts` và `update-settings.dto.ts` bổ sung `heroVideoUrl`, `heroVideoPoster`, `heroSideImage` vào `homepageConfig`. - Depends on: none
- [x] T2: [Admin Settings CMS UI] - Cập nhật `fe-nextjs-thanhxuan-laundry/src/features/admin/settings/components/SettingEditorHomeComponent.tsx` thêm các ô upload/nhập Hero Video URL, Video Poster và Hero Side Image. - Depends on: T1
- [x] T3: [Pre-Footer CTA Component] - Tạo mới `fe-nextjs-thanhxuan-laundry/src/features/public/home/components/PreFooterCtaComponent.tsx` chứa cam kết dịch vụ B2B và form `<Contact />`. Export tại `home/components/index.ts`. - Depends on: none
- [x] T4: [Hero Diagonal Split Component] - Viết lại `fe-nextjs-thanhxuan-laundry/src/features/public/home/components/HeroSectionComponent.tsx` theo thiết kế chia chéo (Bên trái: Video xưởng + Overlay Tiêu đề/CTA kép; Bên phải: Ảnh chất lượng cao + Floating Trust Badges; Đường cắt chéo có dải viền phát sáng; Pause video khi out-of-view; Responsive Mobile). - Depends on: none
- [x] T5: [Motion & Animations Integration] - Tích hợp `framer-motion` cho Hero entrance cascade (Title, Subtitle, CTA, Floating Badges) và Reveal animation cho `PreFooterCtaComponent`. - Depends on: T3, T4
- [x] T6: [HomePage Assembly] - Cập nhật `fe-nextjs-thanhxuan-laundry/src/features/public/home/HomePage.tsx` đưa `PreFooterCtaComponent` vào cuối trang và truyền các props cấu hình video/ảnh mới vào `HeroSectionComponent`. - Depends on: T3, T4, T5
- [x] T7: [Verification & Build Check] - Chạy `pnpm exec tsc --noEmit` và `pnpm build` cho cả backend và frontend web; kiểm thử responsive trên mobile và desktop. - Depends on: T1-T6
- [x] T8: [Docs & Changelog Sync] - Cập nhật `.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md`, `.agents/docs/SRS_SDD.md` và ghi bài luận chi tiết vào `.agents/docs/CHANGELOG.md`. - Depends on: T7

---

## 4. Verification & Testing

### Lệnh kiểm tra thực tế
1. **Frontend Typecheck & Build:**
   ```powershell
   cd fe-nextjs-thanhxuan-laundry
   pnpm exec tsc --noEmit
   pnpm build
   ```
2. **Backend Typecheck & Build:**
   ```powershell
   cd be-nestjs-thanhxuan
   pnpm exec tsc --noEmit
   pnpm build
   ```

### Kịch bản kiểm thử (Test Scenarios)
1. **Happy Path - Desktop Browser:**
   - Truy cập trang chủ `/`:
     - Video xưởng bên trái phát mượt mà, không tiếng, tự động lặp lại.
     - Đường cắt chéo viền sáng phân chia rõ ràng với khối ảnh bên phải.
     - 2 thẻ nổi (5+ Tấn, 99.8%) hiển thị nổi bật với hiệu ứng kính mờ.
     - Cuộn chuột xuống cuối trang: Thấy khối `PreFooterCtaComponent` hoành tráng với form liên hệ và các cam kết B2B.
     - Gửi form liên hệ thử: Hoạt động bình thường và hiển thị thông báo thành công.
2. **Edge Case - Mobile Screen (< 768px):**
   - Chuyển chế độ xem Mobile trong DevTools:
     - Giao diện không bị tràn màn hình ngang (No horizontal overflow).
     - Hero tự động chuyển sang layout dạng tầng thông minh, dễ đọc chữ, nút bấm to bản dễ chạm.
     - Form liên hệ ở cuối trang hiển thị vừa vặn 100% chiều rộng.
3. **Performance Check:**
   - Khi cuộn chuột qua khỏi Hero: Video tự động tạm dừng để tiết kiệm tài nguyên.
   - Khi cuộn ngược lên: Video tiếp tục phát bình thường.
   - Không bị giật layout (CLS = 0).

---

## 5. Risks & Rollback

### Rủi ro & Cách khắc phục
- **Rủi ro Video tải chậm hoặc lỗi mạng:**
  - *Khắc phục:* Luôn có thuộc tính `poster` và ảnh tĩnh nạp bằng `<Image priority />` che phủ phía dưới. Nếu video chưa tải kịp hoặc trình duyệt chặn autoplay, giao diện vẫn hiển thị ảnh tĩnh hoàn mỹ.
- **Rủi ro Tràn viền trên Mobile do Clip-path:**
  - *Khắc phục:* Sử dụng media query `md:clip-path-...`, trên mobile (< md) bỏ clip-path để tránh lỗi cắt mất chữ hoặc ảnh.

### Phương án Rollback
- Khôi phục file `HeroSectionComponent.tsx` và `HomePage.tsx` từ commit Git gần nhất trên nhánh `dev`.

---

## Changelog
- 2026-10-25: Khởi tạo Plan 34 tái cấu trúc UI/UX Hero chia chéo Video-Ảnh, di dời Form liên hệ xuống Pre-Footer và nâng cấp trải nghiệm chuyển đổi B2B.

## Execution Log
- **2026-10-25**: Hoàn tất 100% 8/8 tasks (T1 - T8). Đã verify typecheck và build thành công cho cả Backend NestJS và Frontend Next.js. Đồng bộ tài liệu SRS/SDD và CHANGELOG.md. Không có deviation hay blocker.
