---
trigger: glob
glob: "{fe-nextjs-*,fe-react-*}/**"
description: Quy tắc phát triển Frontend (Next.js & React SPA) dự án Thanh Xuan Company
---

# Next.js & React Core Architecture

- **Next.js (Web & CMS):** Mặc định Server Component (RSC) để tối ưu SEO; chỉ thêm `"use client"` khi cần state, Hook, event handler và đẩy xuống component lá.
- **React Vite (Internal Operations):** Thiết kế **Mobile-First** cho thợ xưởng và tài xế xe tải (kích thước nút bấm tối thiểu 44x44px touch target, tương thích tablet xưởng và điện thoại). Hỗ trợ offline queue qua IndexedDB (`idb`) và Header `Idempotency-Key` (UUIDv4) khi submit phiếu lúc mất sóng mạng.
- **Quản lý dữ liệu:** Fetch data ở Server Component hoặc Server Action (Next.js). Phía client dùng TanStack Query v5 / SWR, tuyệt đối không fetch tùy tiện trong `useEffect`.
- **Múi giờ Việt Nam (`Asia/Ho_Chi_Minh`):** Hiển thị và gửi `recordDate` lên API bắt buộc dùng date helper chuẩn (`getTodayVN`, `getTomorrowVN`, `getFirstDayOfMonthVN`). Tuyệt đối không dùng `new Date().toISOString().split('T')[0]` lúc nửa đêm để tránh bị lùi ngày.
- **Biến môi trường:** Next.js chỉ expose biến có tiền tố `NEXT_PUBLIC_*`; React Vite chỉ dùng tiền tố `VITE_*`.
- **Gọi API tập trung:** Gọi qua Service fetcher tập trung (mỗi feature có service riêng trong `features/<feature>/services/` hoặc `src/services/`), không rải `fetch` hay `axios` trực tiếp trong JSX.
- **Quy chuẩn chia nhỏ file & đặt tên (DoD - Bắt buộc chia nhỏ file):**
  - **Mục tiêu:** Giữ từng file ngắn gọn, rõ ràng, ranh giới trách nhiệm đơn nhất (SRP), giúp người đọc và reviewer dễ dàng theo dõi, review code và kiểm tra diff khi merge.
  - Màn hình chính cấp cao nhất: `[Tên]Page.tsx` (chỉ đóng vai trò điều phối layout, tabs, orchestration).
  - Thư mục `modals/`: chứa các file `[Tên liên quan đến page]Modal.tsx` (mỗi modal một file độc lập).
  - Thư mục `components/`: chứa các file `[Tên]Component.tsx` (chia tách sub-component: card item, table, toolbar, form section, canvas/preview, signature).
  - Thư mục `hooks/`: chứa `use[Tên].ts` nếu logic state/query/mutation phức tạp.
  - **Giới hạn kích thước file:** BẮT BUỘC chủ động chia nhỏ file khi phình to (> 250 - 300 dòng). Tuyệt đối không để một file tích tụ lên 500 - 1000 dòng nếu không cần thiết. Nếu một component bắt đầu phình to, phải lập tức bóc tách các sub-components con sang thư mục `components/` hoặc `modals/`.
- **Kỷ luật dọn dẹp mã nguồn:**
  - Tuyệt đối không để lại component mồ côi (dead code) không còn nơi nào import.
  - Sau khi refactor/đổi tên, xóa bỏ hoàn toàn file/alias bridge re-export tạm thời, cập nhật mọi nơi gọi trỏ trực tiếp vào file mới.
  - Cấm import vòng (circular import) giữa các feature; import ra ngoài feature bắt buộc qua barrel export `features/<feature>/index.ts`.

# shadcn/ui & Styling

- Thêm component bằng CLI: `npx shadcn@latest add <component>`, không tự viết lại component đã có.
- Component sinh ra ở `components/ui/` chỉ chỉnh khi thật sự cần; component nghiệp vụ đặt riêng trong `features/` hoặc `components/`.
- Style bằng TailwindCSS và hàm `cn()`; màu/theme dùng CSS variables tokens của shadcn, không hardcode mã màu hex/rgb.
- Form dùng `react-hook-form` + `zod` kết hợp component `Form` của shadcn.
- Icon dùng duy nhất `lucide-react`. Không cài thêm thư viện icon khác.
- Chú ý accessibility (a11y): label, aria, focus-visible, hỗ trợ keyboard.

# Trải Nghiệm Người Dùng (UX) & Chất Lượng

- Mọi text hiển thị trên UI viết bằng **100% tiếng Việt tự nhiên**, đúng ngữ cảnh nghiệp vụ (ví dụ: "Phiếu Giao Nhận", "Công Thợ Theo Giờ", "Đề Xuất Xăng Xe", "Soạn Đồ Xuất Xưởng").
- Luôn xử lý đầy đủ 3 trạng thái: `loading` (Skeleton), `empty` (EmptyState), và `error` (thông báo lỗi thân thiện) cho mọi màn hình có dữ liệu.

