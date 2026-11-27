---
name: ui-ux-pro-max
description: >
  UI/UX design intelligence cho Web & Mobile PWA trong Hệ sinh thái Thanh Xuân: bảng màu thương hiệu, typography tiếng Việt, layout responsive, Tailwind design tokens và checklist nghiệm thu giao diện.
---

# UI/UX Pro Max - Design Intelligence (Thanh Xuân Ecosystem)

Hướng dẫn thiết kế giao diện chuẩn mực, tối ưu hóa trải nghiệm người dùng (UX) và phân cấp thị giác (UI) cho toàn bộ các ứng dụng Web & PWA trong Hệ sinh thái Công ty Thanh Xuân.

---

## 1. PHÂN VÙNG THIẾT KẾ & BẢNG MÀU THƯƠNG HIỆU (BRAND PALETTES)

Mỗi ứng dụng trong Monorepo có đặc thù thương hiệu và người dùng riêng biệt:

| Ứng dụng | Mục đích & Đối tượng | Tông màu chủ đạo (Tailwind Tokens) | Phong cách UI |
| :--- | :--- | :--- | :--- |
| **Web Giặt Là (`fe-nextjs-laundry`)** | B2B Nhà hàng, Khách sạn, Spa, Khách cao cấp | `Sky/Ocean Blue (#0284c7)`, Slate, Indigo, Emerald | Clean, Corporate Trust, Sang trọng, Thẩm mỹ cao |
| **Web Chuyển Nhà (`fe-nextjs-moving`)** | B2C/B2B Chuyển nhà trọn gói, xe tải tiết kiệm | `Amber/Orange (#f59e0b)`, Navy, Neutral | Năng động, Thân thiện, Chuyển đổi cao (High-converting CTA) |
| **Cổng Nội Bộ (`fe-react-internal`)** | Thợ xưởng, Lái xe tải, Thủ kho, Quản lý (PWA) | `Navy/Blue (#1e40af)`, Slate, Zinc, Amber warning | Mobile-First, Tương phản cao, Chữ to dễ đọc, Nút bấm lớn |

---

## 2. QUY CHUẨN TYPOGRAPHY TIẾNG VIỆT & PHÂN CẤP THỊ GIÁC

1. **Bộ Font Chuẩn:** Ưu tiên font hỗ trợ tiếng Việt hoàn chỉnh (`Be Vietnam Pro`, `Montserrat`, `Plus Jakarta Sans`, `Playfair Display` cho tiêu đề editorial). Tránh lạm dụng Inter mặc định.
2. **Thang bậc phân cấp:**
   - **Hero H1:** `text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white`
   - **Section H2:** `text-2xl md:text-3xl font-bold tracking-tight`
   - **Card / Subtitle H3:** `text-lg md:text-xl font-semibold`
   - **Body Text:** `text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed`
   - **Eyebrow / Badge:** `text-xs font-semibold uppercase tracking-wider text-primary`
3. **Độ tương phản (Contrast Ratio):** Tối thiểu `4.5:1` cho text thường và `3:1` cho text lớn. Cấm xám nhạt trên nền trắng (`text-slate-300` trên `bg-white`).
4. **Không dùng màu đen tuyệt đối (`#000000`):** Sử dụng `slate-950`, `zinc-900` cho nền dark mode và text đen để mắt không bị mỏi.

---

## 3. THIẾT KẾ MOBILE-FIRST & CHUẨN PWA CHO VẬN HÀNH

Dành riêng cho lái xe tải (`SHIPPER`) và thợ xưởng (`WORKER`):
1. **Kích thước Touch Target tối thiểu:** Nút bấm, checkbox, icon tap phải đạt tối thiểu `44x44px` (hoặc `h-11 px-4`). Khoảng cách giữa các nút liền kề $\ge 8\text{px}$.
2. **Safe Area Inset (iOS & Android):**
   - Thanh điều hướng đáy (Bottom Navigation): Bắt buộc dùng `pb-safe` hoặc `env(safe-area-inset-bottom)` chống bị thanh Home indicator iPhone đè.
   - Tránh đặt nút nổi (Floating Speed Dial) sát mép dưới; đặt cách đáy tối thiểu `bottom-20 md:bottom-8`.
3. **Chống Auto-Zoom trên iOS Safari:** Các ô `<input>`, `<select>`, `<textarea>` bắt buộc có font-size tối thiểu `16px` trên mobile (`text-base md:text-sm`).
4. **Bảo toàn trạng thái (State Feedback):**
   - Mọi nút bấm khi click phải có visual feedback tức thì (`active:scale-95 transition-transform`).
   - Nút gửi form khi đang gọi API phải chuyển sang `disabled` kèm `Loader2` quay tròn.

---

## 4. FORM & ĐIỀU HƯỚNG UX VÀNG

- **Đủ 3 trạng thái:** Luôn xử lý `Loading` (Skeleton / Shimmer), `Empty` (EmptyState với hình minh họa/hướng dẫn), và `Error` (thông báo lỗi tiếng Việt thân thiện).
- **Form Validation:** Lỗi hiển thị ngay dưới ô input (`text-destructive text-xs`), không dồn tất cả lỗi lên đầu trang.
- **Progressive Disclosure:** Ẩn các cấu hình nâng cao trong Accordion/Collapsible để tránh người dùng bị ngợp thông tin ban đầu.
- **Chống tràn ngang (No Horizontal Overflow):** Tuyệt đối cấm để xuất hiện thanh cuộn ngang ngoài ý muốn trên mobile (`overflow-x-hidden` ở container chính).

---

## 5. BẢNG KIỂM TRA NGHIỆM THU UI/UX (PRE-DELIVERY CHECKLIST)

Trước khi bàn giao code giao diện:
- [ ] Giao diện đã thử nghiệm responsive ở màn hình hẹp (360px - 414px) và rộng (Desktop 1280px+)?
- [ ] Mọi văn bản hiển thị là 100% tiếng Việt tự nhiên, chuẩn ngữ cảnh kinh doanh?
- [ ] Các icon sử dụng duy nhất bộ `lucide-react`, không dùng emoji làm biểu tượng tính năng?
- [ ] Đã kiểm tra tính tương thích giữa chế độ Sáng (Light) và Tối (Dark)?
- [ ] Tận dụng Tailwind tokens (`bg-background`, `text-primary`, `border-border`), không hardcode mã màu hex tùy tiện?

---

## 7. Chống AI-Slop & Thẩm Mỹ Hiện Đại (Hợp nhất từ Design Taste)

- **Bỏ bố cục generic:** Tránh card 3 cột đều tăm tắp, bỏ gradient tím/xanh nhạt và `box-shadow` nặng nề; ưu tiên nền sạch, hairline border `1px`, khoảng trắng thoáng và tương phản rõ.
- **Typography & Số liệu:** Tiêu đề có điểm nhấn rõ (`font-semibold`/`bold`, `tracking-tight`); bảng/giá tiền/thời gian dùng `tabular-nums`.
- **Micro-interactions có chủ đích:** Hover/focus mượt (`150-200ms`), skeleton loading đúng kích thước nội dung, tránh layout shift.
- **Mobile-First PWA:** Mọi nút/vùng chạm trên app xưởng/tài xế tối thiểu `44x44px` (`min-h-11 min-w-11`), ưu tiên thao tác một tay.
