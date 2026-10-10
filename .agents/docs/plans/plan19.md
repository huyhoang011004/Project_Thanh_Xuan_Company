# Plan 19: Nâng Tầm Toàn Diện Giao Diện UI/UX Cho Phân Hệ Nội Bộ (`fe-react-thanhxuan-internal`)

> Status: Done | Created: 2026-10-10 | Completed: 2026-10-10  
> Author: Antigravity Architecture Agent  
> Target: `fe-react-thanhxuan-internal/`  
> Skills Applied: `impeccable` (Mode: Operate), `design-taste-frontend`, `ui-ux-pro-max`, `full-output-enforcement`

---

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Phạm vi
- **Mục tiêu:** Nâng cấp toàn diện thẩm mỹ, phân cấp thị giác và trải nghiệm thao tác cho ứng dụng Cổng Vận Hành Xưởng & Quản Vận B2B (`fe-react-thanhxuan-internal`), loại bỏ hoàn toàn các mẫu thiết kế "AI slop" rập khuôn.
- **Đối tượng thụ hưởng:** 
  - *Thợ xưởng (Worker)* & *Tài xế (Shipper)*: Thao tác 1 tay trên mobile, môi trường xưởng giặt ẩm ướt và ngoài trời chói sáng (cần touch target >= 48-56px, tương phản cao, số liệu hiển thị lớn, rõ ràng).
  - *Quản lý & Kế toán (Manager/Accountant/Admin)*: Giao diện bảng biểu sắc sảo, KPI card chuyên nghiệp, lọc dữ liệu tốc độ cao trên tablet/desktop.
- **Phong cách chủ đạo:** **Modern Industrial Precision / Clean Operations Console** (Phong cách công nghiệp tinh gọn, lấy cảm hứng từ các dashboard điều hành logistics hàng đầu: sạch sẽ, dứt khoát, typography cân chỉnh chuẩn xác, bóng đổ mềm mại, token hóa 100% màu sắc).
- **Out of scope:** 
  - Không thay đổi nghiệp vụ logic backend API (NestJS) và không thay đổi database schema.
  - Không thay đổi router path hiện tại của React Router v7.

### 1.2. Dẫn chứng hiện trạng (`path:line`)
- `fe-react-thanhxuan-internal/index.html:L14`: Nền body hardcode class `bg-slate-950 text-slate-100`, font chữ mặc định hệ thống chưa import Google Fonts (Inter / Plus Jakarta Sans) dẫn đến nét chữ tiếng Việt hiển thị chưa trau chuốt.
- `fe-react-thanhxuan-internal/src/index.css:L10-L78`: Hệ thống CSS variables token đã có khung sườn nhưng thiếu các semantic tokens cho trạng thái vận hành logistics (`--status-transit`, `--status-completed`, `--status-disputed`), thiếu utility class `tabular-nums` cho tiền tệ/sản lượng.
- `fe-react-thanhxuan-internal/src/components/ui/button.tsx:L17`: Nút `brand` đang dùng gradient rập khuôn `from-sky-500 to-emerald-500` kiểu cũ (AI generic), cần chuyển sang solid brand action button với micro-interactions sắc nét.
- `fe-react-thanhxuan-internal/src/components/ui/badge.tsx:L10-L18`: Bảng màu badge còn thô, viền và nền thiếu độ trong suốt tinh tế.
- `fe-react-thanhxuan-internal/src/components/ui/card.tsx:L9`: Card bo góc `rounded-2xl` nhưng viền và độ sâu (depth) chưa phân cấp giữa card tĩnh và card có tương tác (interactive hover lift).
- `fe-react-thanhxuan-internal/src/components/layout/AppHeader.tsx:L40-L80`: Role badge và avatar menu còn rời rạc, header chưa có hiệu ứng phân tách nền kính mờ (blur backdrop) tinh xảo.
- `fe-react-thanhxuan-internal/src/components/layout/DesktopSidebar.tsx:L48-L64`: Sidebar navigation thiếu phân cấp nhóm rõ ràng, active item chưa có indicator vạch sáng hiện đại.
- `fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx:L1-L60`: Cần tối ưu khoảng an toàn đáy (safe-area-inset-bottom) và hiệu ứng nhấn tactile feedback.
- `fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx:L60-L120`: Màn hình dashboard KPI card còn phẳng, chưa có visual hierarchy giữa số liệu quan trọng (doanh thu, đơn cần giao) và thông tin phụ.

### 1.3. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :--- | :--- |
| `fe-react-thanhxuan-internal/index.html` | Edit | Import font chữ chuẩn `Plus Jakarta Sans` & tối ưu thẻ meta viewport cho PWA |
| `fe-react-thanhxuan-internal/tailwind.config.js` | Edit | Bổ sung typography tokens, box-shadow cao cấp, màu status logistics |
| `fe-react-thanhxuan-internal/src/index.css` | Edit | Cập nhật CSS variables tokens HSL, font settings, scrollbar mượt mà, micro-animations |
| `fe-react-thanhxuan-internal/src/components/ui/button.tsx` | Edit | Loại bỏ gradient cũ, nâng cấp variants: primary brand, touch (mobile), outline, ghost |
| `fe-react-thanhxuan-internal/src/components/ui/badge.tsx` | Edit | Thiết kế lại badge với dot indicator, màu sắc logistics chuẩn xác |
| `fe-react-thanhxuan-internal/src/components/ui/card.tsx` | Edit | Thêm biến thể card: default, interactive, metric, stat |
| `fe-react-thanhxuan-internal/src/components/ui/stat-card.tsx` | Add | Tạo mới component KPI Metric Card chuyên nghiệp có trend, icon container, tabular numbers |
| `fe-react-thanhxuan-internal/src/components/ui/empty-state.tsx` | Add | Tạo mới component Empty State thân thiện có icon minh họa, mô tả và CTA action |
| `fe-react-thanhxuan-internal/src/components/ui/skeleton-loader.tsx` | Add | Tạo mới Skeleton Shimmer loading mượt mà thay vì spinner thô |
| `fe-react-thanhxuan-internal/src/components/layout/AppHeader.tsx` | Edit | Nâng cấp header glassmorphism, avatar pill, dropdown menu sang trọng |
| `fe-react-thanhxuan-internal/src/components/layout/DesktopSidebar.tsx` | Edit | Tinh chỉnh nhịp điệu sidebar, active indicator thanh thoát, icon container có gu |
| `fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx` | Edit | Bo góc tinh tế, active pill có micro-spring animation, hỗ trợ safe area iOS/Android |
| `fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx` | Edit | Tái cấu trúc giao diện Dashboard: hero greeting, grid metric card đẳng cấp, list trạng thái trực quan |

---

## 2. Technical Approach

### 2.1. Triết lý Thiết kế (Design Principles - Mode: Operate)
1. **Ergonomic & Touch-First:**
   - Mọi nút bấm trên mobile cho thợ xưởng và tài xế đều có `min-height: 48px` hoặc `56px` (`size="touch"`), khoảng cách giữa các interactive elements tối thiểu 12px để tránh chạm nhầm.
   - Số liệu quan trọng (số lượng đồ giặt, tiền khoán, mã phiếu) dùng `font-mono tracking-tight font-bold tabular-nums` để mắt quét dữ liệu trong 0.5 giây.
2. **Loại bỏ "AI Slop" - Tôn vinh Clean Precision:**
   - Không dùng gradient 3 màu tím-hồng-xanh lộn xộn.
   - Nền tảng màu: **Thanh Xuân Deep Ocean** (`#0284c7` - HSL `199 89% 44%` cho Light, `#38bdf8` - HSL `199 89% 58%` cho Dark) kết hợp **Factory Mint** (`#059669` / `#10b981`) cho các trạng thái hoàn tất.
   - Phân cấp thẻ thông tin rõ nét: Nền card trắng tinh trên nền Slate-50 (Light) và Slate-900/90 trên Slate-950 (Dark), viền `border-slate-200/80` và `border-slate-800/80`.
3. **Trực quan hóa trạng thái (Semantic Status System):**
   - Định hình rõ ràng 5 mã màu trạng thái cố định toàn hệ thống:
     - `SCHEDULED` (Chờ nhận/giao): Slate Blue (`bg-sky-500/10 text-sky-700 border-sky-300 dark:text-sky-300`)
     - `IN_TRANSIT` (Đang vận chuyển): Amber Gold (`bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-300`)
     - `PROCESSING` (Đang xử lý tại xưởng): Violet Indigo (`bg-indigo-500/10 text-indigo-700 border-indigo-300 dark:text-indigo-300`)
     - `COMPLETED` (Đã hoàn tất): Emerald Green (`bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:text-emerald-300`)
     - `DISPUTED` (Lệch kiểm đếm / Khiếu nại): Crimson Rose (`bg-rose-500/10 text-rose-700 border-rose-300 dark:text-rose-300`)

### 2.2. Kiến trúc Component UI Mở rộng (Tối giản & Không phá vỡ Contract)

```typescript
// Minh họa hợp đồng StatCard Props (Tối đa 15 dòng)
export interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: { value: number; label: string; isPositive?: boolean };
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo';
  onClick?: () => void;
  className?: string;
}
```

```typescript
// Minh họa hợp đồng EmptyState Props (Tối đa 10 dòng)
export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}
```

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Foundation & Design Tokens (Typography, CSS & Tailwind)
- [x] T1: [`fe-react-thanhxuan-internal/index.html`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/index.html) - Cập nhật import Google Font `Plus Jakarta Sans` (weights: 400, 500, 600, 700, 800) và cấu hình `font-sans` - Tiêu chí: Font render tiếng Việt sắc nét, không bị lỗi font hệ thống fallback. - Depends on: none
- [x] T2: [`fe-react-thanhxuan-internal/tailwind.config.js`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/tailwind.config.js) - Bổ sung font family `font-sans: ['Plus Jakarta Sans', ...]`, `font-mono: ['JetBrains Mono', 'monospace']`, mở rộng box-shadow `soft`, `card-hover` - Tiêu chí: Lớp tiện ích Tailwind nhận diện đúng font và shadow mới. - Depends on: T1
- [x] T3: [`fe-react-thanhxuan-internal/src/index.css`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/index.css) - Chuẩn hóa CSS Variables tokens (Light/Dark mode HSL), thêm lớp tiện ích `.tabular-nums`, cải thiện scrollbar mượt mà và hiệu ứng transition nền - Tiêu chí: Giao diện chuyển đổi Dark/Light mode mượt mà, độ tương phản text chuẩn WCAG AA+. - Depends on: T2

### Giai đoạn 2: Nâng cấp & Bổ sung Hệ thống Component UI Cơ sở (`src/components/ui/`)
- [x] T4: [`fe-react-thanhxuan-internal/src/components/ui/button.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/ui/button.tsx) - Thay thế gradient cũ bằng solid brand button với visual depth, hoàn thiện variant `brand`, `touch` cho thợ xưởng, thêm active scale animation tinh tế - Tiêu chí: Nút bấm có tactile feedback, không dùng gradient màu lòe loẹt. - Depends on: T3
- [x] T5: [`fe-react-thanhxuan-internal/src/components/ui/badge.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/ui/badge.tsx) - Nâng cấp badge với dot indicator status, viền mờ cao cấp, hỗ trợ đủ các trạng thái logistics - Tiêu chí: Badge hiển thị nổi bật nhưng thanh thoát trên cả nền sáng và tối. - Depends on: T3
- [x] T6: [`fe-react-thanhxuan-internal/src/components/ui/card.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/ui/card.tsx) - Cập nhật component Card với viền kính tinh tế, padding phân tầng logic, tùy chọn hover lift cho interactive cards - Tiêu chí: Card phân tách rõ ràng với nền, không bị cảm giác phẳng lì vô hồn. - Depends on: T3
- [x] T7: [`fe-react-thanhxuan-internal/src/components/ui/stat-card.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/ui/stat-card.tsx) - Tạo mới StatCard có container icon cách điệu, badge phần trăm xu hướng, số liệu to rõ ràng - Tiêu chí: Render độc lập, có thể click điều hướng, hỗ trợ cả dark mode. - Depends on: T6
- [x] T8: [`fe-react-thanhxuan-internal/src/components/ui/empty-state.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/ui/empty-state.tsx) - Tạo mới EmptyState tinh tế cho danh sách trống, kèm icon vòng hào quang mờ (glow pill) và nút hành động - Tiêu chí: Hiển thị đẹp mắt khi không có dữ liệu phiếu giao nhận hoặc chấm công. - Depends on: T4, T6
- [x] T9: [`fe-react-thanhxuan-internal/src/components/ui/skeleton-loader.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/ui/skeleton-loader.tsx) - Tạo mới Skeleton Loader hiệu ứng shimmer mượt mà cho card và table row - Tiêu chí: Trạng thái loading không còn giật layout (zero CLS). - Depends on: T3

### Giai đoạn 3: Tái thiết kế Khung Shell & Điều Hướng (Navigation & Header)
- [x] T10: [`fe-react-thanhxuan-internal/src/components/layout/AppHeader.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/AppHeader.tsx) - Trau chuốt Header: viền kính mờ (glass backdrop), avatar pill góc phải với vai trò nhân viên hiển thị đẳng cấp, dropdown menu bo góc mềm mại - Tiêu chí: Header thanh thoát, sticky chắc chắn khi cuộn trang. - Depends on: T5
- [x] T11: [`fe-react-thanhxuan-internal/src/components/layout/DesktopSidebar.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/DesktopSidebar.tsx) - Tinh chỉnh Sidebar: vạch sáng active indicator ở cạnh trái, icon wrapper hình khối có nền mềm, nhãn danh mục uppercase tinh tế - Tiêu chí: Menu cuộn mượt, phân biệt rõ ràng giữa các phân nhóm chức năng. - Depends on: T3
- [x] T12: [`fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx) - Nâng cấp Bottom Bar: thêm hiệu ứng active pill có viền sáng nhẹ, hỗ trợ `env(safe-area-inset-bottom)` cho iPhone, icon và nhãn chữ cân đối - Tiêu chí: Thao tác ngón cái cực nhạy, không che khuất nội dung trang. - Depends on: T3

### Giai đoạn 4: Thổi Hồn Vào Màn Hình Trung Tâm Điều Hành (`DashboardPage.tsx`)
- [x] T13: [`fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx) - Tái cấu trúc Dashboard:
  - Thay thế khối tổng quan cũ bằng Banner chào đón hiện đại kèm ngày giờ và nút Quick Action nhanh.
  - Sử dụng `StatCard` cho 4 chỉ số cốt lõi: Doanh thu khoán, Sản lượng giặt ủi (kg/cái), Phiếu đang vận chuyển, Phiếu cần xử lý/khiếu nại.
  - Thiết kế lại danh sách phiếu giao nhận hôm nay và bảng tiến độ khoán thợ với EmptyState và Badge trực quan.
  - Tiêu chí: Màn hình mở ra gây ấn tượng mạnh, quản lý xưởng nhìn vào nắm bắt ngay nhịp thở vận hành. - Depends on: T7, T8, T9, T10

---

## 4. Verification & Testing

### 4.1. Lệnh Kiểm Tra Hệ Thống
Chạy trực tiếp tại thư mục `fe-react-thanhxuan-internal/`:
- **Typecheck:** `pnpm exec tsc --noEmit`
- **Build Production:** `pnpm build` (xác nhận bundle không bị phình to, không có lỗi import)
- **Dev Server Check:** `pnpm dev` trên cổng `3001`

### 4.2. Kịch bản Kiểm Thử Trực Quan (Visual QA)
1. **Responsive Viewport Test:**
   - *Mobile (375px - 414px)*: Kiểm tra Bottom Bar, nút bấm cỡ lớn `size="touch"`, menu Drawer vuốt mở mượt mà.
   - *Tablet (768px - 1024px)*: Bố cục lưới 2 cột co giãn hợp lý, bảng biểu cuộn ngang mượt.
   - *Desktop (1280px - 1920px)*: Sidebar cố định bên trái, content max-width cân đối, không bị loãng.
2. **Theme Switching Test:**
   - Bấm nút ThemeToggle chuyển đổi giữa Light Mode (sáng sạch, độ tương phản cao cho thợ) và Dark Mode (sâu thẳm, chống mỏi mắt ca đêm).
3. **Empty & Loading States:**
   - Giả lập trường hợp hôm nay chưa có phiếu: kiểm tra component `EmptyState` hiển thị sinh động, không bị vỡ layout.

### 4.3. Definition of Done
1. Toàn bộ 13 task trong checklist được thực hiện hoàn tất và verify pass.
2. Không còn bất kỳ đoạn mã gradient 3 màu tím/xanh nhạt nhẽo nào của AI slop.
3. Lệnh `tsc --noEmit` và `pnpm build` của `fe-react-thanhxuan-internal` pass 100%.
4. Cập nhật tài liệu phân hệ tại `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`.
5. Bổ sung 1 dòng Document History vào `.agents/docs/SRS_SDD.md`.

---

## 5. Risks & Rollback

- **Rủi ro:** Font chữ Google Font tải chậm khi mất kết nối mạng ở xưởng.
  - *Giảm thiểu:* Khai báo font-family có fallback hệ thống liền kề (`system-ui, -apple-system, sans-serif`) kèm `font-display: swap`.
- **Rủi ro:** Padding đáy trên mobile xung đột với bàn phím ảo hoặc trình duyệt iOS Safari.
  - *Giảm thiểu:* Dùng lớp tiện ích `pb-24 pb-[calc(5rem+env(safe-area-inset-bottom))]` đã kiểm chứng.
- **Phương án Rollback:** Nếu có bất kỳ lỗi không tương thích nào, dùng git revert các commit UI mà không ảnh hưởng tới logic API của Backend hay Web Next.js.

---

## Changelog
- 2026-10-10: Khởi tạo Plan 19 — Nâng tầm toàn diện giao diện UI/UX cho `fe-react-thanhxuan-internal`.
- 2026-10-10: Thực thi hoàn tất 13/13 tasks, typecheck và production build pass 100%.

## Execution Log
- **2026-10-10:**
  - Hoàn tất Giai đoạn 1 (T1-T3): Google Fonts Plus Jakarta Sans, Tailwind typography/shadow tokens, CSS variables, `.tabular-nums`, `.safe-bottom`.
  - Hoàn tất Giai đoạn 2 (T4-T9): Nâng cấp Button (touch target, solid brand), Badge (dot status logistics), Card (interactive elevation); Tạo mới StatCard, EmptyState, SkeletonLoader.
  - Hoàn tất Giai đoạn 3 (T10-T12): AppHeader glassmorphism, DesktopSidebar active indicator vạch sáng, MobileBottomBar tactile pill và safe-area-inset.
  - Hoàn tất Giai đoạn 4 (T13): DashboardPage tái cấu trúc hero greeting, 4 StatCard KPI, 2 bảng theo dõi vận hành có EmptyState.
  - Verification: `pnpm exec tsc --noEmit` và `pnpm build` pass 100%.
  - Đồng bộ SRS/SDD: Cập nhật `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`.

