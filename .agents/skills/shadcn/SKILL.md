---
name: shadcn
description: Hướng dẫn dùng CLI và tùy biến component shadcn/ui (pnpm dlx shadcn@latest), preset, Tailwind tokens trong dự án có components.json.
user-invocable: false
---

# shadcn/ui (Quick Reference)

1. **Kiểm tra cấu hình trước khi cài component:**
   - Đọc `components.json` tại app đích (`fe-nextjs-*` hoặc `fe-react-*`) để biết `style`, `tailwind`, `aliases` (`@/components/ui`, `@/lib/utils`).
   - Kiểm tra xem component đã có trong `src/components/ui/` chưa trước khi chạy CLI.
2. **Lệnh CLI chuẩn (dùng `pnpm dlx`):**
   - Tìm component: `pnpm dlx shadcn@latest search <query>`
   - Cài component mới: `pnpm dlx shadcn@latest add <component> --yes`
   - Xem diff/cập nhật: `pnpm dlx shadcn@latest diff <component>`
3. **Quy tắc dùng trong dự án:**
   - Giữ nguyên semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, `border-border`, `text-muted-foreground`), không hardcode hex tùy tiện.
   - Dùng `cn()` từ `@/lib/utils` để gộp class.
   - Không sửa file gốc trong `components/ui/*` cho logic nghiệp vụ; bọc bằng wrapper/component trong `features/*/components/` hoặc `components/`.
   - Form dùng `react-hook-form` + `zod` + `Form` / `Field` của shadcn; icon dùng `lucide-react`.
