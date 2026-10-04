---
trigger: model_decision
glob:
description:
---

# Next.js & React

- Mặc định Server Component; chỉ thêm "use client" khi cần state, Hook, event handler.
- Đẩy "use client" xuống component lá, không đặt ở layout/page lớn.
- Fetch data ở Server Component hoặc Server Action. Phía client dùng TanStack Query/SWR nếu cần, hạn chế fetch trong useEffect.
- Biến môi trường chỉ expose ra client khi có tiền tố NEXT*PUBLIC*.
- Gọi API NestJS qua một API client tập trung (một file), không rải `fetch` khắp nơi.
- Dùng `next/image`, `next/link`, `next/font`; dùng loading.tsx / error.tsx cho trạng thái loading và lỗi.
- Logic dùng lại thì tách thành custom Hook; component nhỏ, một trách nhiệm.

# shadcn/ui

- Thêm component bằng CLI: `npx shadcn@latest add <component>`, không tự viết lại component đã có.
- Component sinh ra ở `components/ui/` chỉ chỉnh khi thật sự cần; component riêng của project đặt ngoài thư mục này.
- Style bằng Tailwind và hàm `cn()`; màu/theme dùng CSS variables (token) của shadcn, không hardcode màu.
- Form dùng react-hook-form + zod kết hợp component `Form` của shadcn.
- Icon dùng `lucide-react`. Không cài thêm thư viện UI khác khi shadcn đã đáp ứng.
- Chú ý accessibility: label, aria, focus, hỗ trợ keyboard.

# Chất lượng

- Mọi text hiển thị trên UI viết bằng tiếng Việt tự nhiên.
- Kiểm tra trạng thái loading, empty, error cho mọi màn hình có data.
