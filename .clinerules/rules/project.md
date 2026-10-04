---
trigger: always_on
glob:
description:
---

# Tổng quan

- Stack: Next.js (App Router) + React + shadcn/ui, NestJS, MongoDB + Mongoose.
- Frontend: apps/web | Backend: apps/api

# Lệnh

- Cài đặt: `pnpm install`
- Chạy dev: `pnpm dev` (hoặc chạy riêng từng app)
- Lint: `pnpm lint` | Type check: `pnpm tsc --noEmit`
- Test: `pnpm test`
- Build: `pnpm build`
  (Sửa lại cho đúng package manager và script thật của project)

# Quy ước chung

- TypeScript strict, không dùng `any`; cần thì dùng `unknown` rồi narrow.
- Type dùng chung giữa web và api đặt ở một chỗ duy nhất, không copy tay.
- Đặt tên: file kebab-case, class PascalCase, biến/hàm camelCase.
- Sửa API contract (DTO, response) thì phải cập nhật luôn phía gọi.
- Không commit `.env`; thêm biến mới phải cập nhật `.env.example`.
