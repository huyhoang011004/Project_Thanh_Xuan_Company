---
name: create-nextjs-feature
description: Workflow chuẩn để phát triển tính năng Frontend bằng Next.js (App Router). Tuân thủ Feature-based Colocation, Server Components, và tích hợp các Custom Hook. Dùng khi xây dựng UI hoặc luồng xử lý phía Client/Server trên Web.
---

# Quy trình tạo Feature Frontend (Next.js App Router)

Skill này hướng dẫn workflow tạo một tính năng (Feature) mới trên Frontend của dự án **Laundry Express Thanh Xuan**. Bạn (AI) PHẢI luôn tuân thủ quy trình này.

## 1. Mục tiêu
- Phân chia logic và giao diện một cách rõ ràng.
- Tối ưu SEO bằng cách ưu tiên sử dụng **Server Components**.
- Gom nhóm theo **Feature-Based Colocation** (`frontend-nextjs/src/features/`).
- Bắt buộc gắn comment `// Adhering to SOLID & Design Patterns` ở đầu các file mới.

## 2. Quy trình (Workflow) từng bước

### Bước 1: Khởi tạo thư mục Feature
- Đường dẫn: `frontend-nextjs/src/features/[feature-name]/`
- Bên trong sẽ chứa các thư mục con: `components`, `actions` (Server Actions), `hooks`, `types`, `schemas`.

### Bước 2: Khai báo Types & Schemas
- Tạo file type/interface: `src/features/[feature-name]/types/index.ts`
- Định nghĩa schema (Zod/Yup) nếu có form: `src/features/[feature-name]/schemas/index.ts`

### Bước 3: Viết Server Actions / API Calls
- Nếu dùng Server Actions: Tạo `src/features/[feature-name]/actions/[action-name].ts`. Đảm bảo file có chỉ thị `"use server"`.
- Nếu fetch API thông thường: Đặt trong thư mục `services` hoặc ngay tại `actions`.

### Bước 4: Viết Custom Hooks (Xử lý Logic)
- Đường dẫn: `src/features/[feature-name]/hooks/use[FeatureName].ts`
- Mọi logic xử lý (gọi API, quản lý State tĩnh, submit form) phải đưa vào Hook này. File này phải có chỉ thị `"use client"`. Tuyệt đối không nhét logic submit vào trực tiếp trong UI Component.

### Bước 5: Viết UI Components (Giao diện)
- Đường dẫn: `src/features/[feature-name]/components/`
- Component cần tương tác (Form, Button, Tab...) -> Đặt `"use client"` và gọi Custom Hook ở Bước 4.
- Component chỉ hiển thị (thường là component bọc ngoài) -> Giữ nguyên là Server Component để tối ưu hiển thị và SEO.

### Bước 6: Tích hợp vào App Router
- Gọi các Feature Component vào các trang (Pages) tương ứng trong `frontend-nextjs/src/app/(public)` hoặc `src/app/(admin)/admin`.
- Khi truyền dữ liệu form hoặc tracking liên hệ, luôn đính kèm context (ví dụ: `sourceUrl`, `category`). 
- Chú ý yêu cầu đặc thù: UI các trang bài viết/dịch vụ tự động hiển thị form liên hệ ở cuối trang.

## 3. Giao tiếp và Giải thích
- Cập nhật tiến độ bằng tiếng Việt tự nhiên, giữ các thuật ngữ (Server Components, Feature-based, Hooks...).
