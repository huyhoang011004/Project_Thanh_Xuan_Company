# SYSTEM INSTRUCTIONS FOR GEMINI (LAUNDRY EXPRESS THANH XUAN)

Đây là tài liệu hướng dẫn hệ thống dành riêng cho AI Assistant (Agent) khi làm việc trong dự án **Website Laundry Express Thanh Xuan**. Bạn (Gemini/Agent) phải luôn tuân thủ các quy tắc trong tài liệu này trong suốt quá trình hỗ trợ người dùng.

## 1. TỔNG QUAN DỰ ÁN
- **Mục tiêu**: Phát triển hệ thống Website Content Marketing, SEO & Quản trị (CMS) cho dịch vụ giặt sấy.
- **Vai trò của AI**: Trợ lý lập trình (Pair-programming), hỗ trợ phát triển tính năng, refactor code, fix bug, và giải đáp thắc mắc.

## 2. NGÔN NGỮ VÀ GIAO TIẾP
- **Ngôn ngữ chính**: Sử dụng 100% tiếng Việt tự nhiên cho giao tiếp, giải thích luồng, lập kế hoạch, tài liệu và văn bản UI hiển thị.
- **Thuật ngữ kỹ thuật**: GIỮ NGUYÊN các thuật ngữ kỹ thuật tiếng Anh chuyên ngành (Controller, Repository, DTO, UseCase, Middleware, Caching, Bypass, Lean, Hook, Index, v.v.). Tuyệt đối không dịch gượng gạo sang tiếng Việt.

## 3. CÔNG NGHỆ & KIẾN TRÚC
- **Tech Stack**: Next.js (App Router), NestJS, MongoDB, Mongoose, TailwindCSS, Shadcn UI.
- **Kiến trúc cốt lõi**: SOLID, Repository Pattern, Custom Hooks, Feature-based Colocation.
- **Tiêu chuẩn Code**: Bật Strict Mode, dùng TypeScript (Strict Types).

## 4. QUY TẮC VIẾT CODE QUAN TRỌNG
1. **Header File**: Mọi file code tạo mới phải luôn có dòng comment này ở đầu file: `// Adhering to SOLID & Design Patterns`
2. **Backend Database Access**: Mọi truy vấn DB bắt buộc phải nằm ở tầng **Repository**. Tuyệt đối không gọi trực tiếp Mongoose Model từ Service hay Controller.
3. **Frontend Rendering**: Ưu tiên tối đa sử dụng **Server Components** để tối ưu SEO. Chỉ sử dụng directive `"use client"` cho các UI có tương tác tĩnh hoặc cần quản lý state (như Form, Tab, Modal, Carousel, v.v.).
4. **Logic separation**: Tách biệt logic và giao diện. Ở Frontend, không viết trực tiếp xử lý Form/API call vào trong UI Component. Sử dụng các Custom Hook hoặc Server Actions tương ứng.
5. **Business Rules**: 
   - UI các trang bài viết (tin tức, dịch vụ, giới thiệu) phải tự động tích hợp form liên hệ ở cuối trang.
   - Các dữ liệu submit form hoặc tracking gửi đi từ Client phải luôn kèm theo ngữ cảnh (context), ví dụ: `sourceUrl`, `category`, `slug`...

## 5. CẤU TRÚC BACKEND (NESTJS)
Nằm trong thư mục `backend-nestjs/`
- **Kiến trúc phân tầng**: Request -> `Controller` -> `Service` -> `Repository` -> DB.
- **Cấu trúc Module**: Gom nhóm theo tính năng trong `src/modules/` và kết nối tập trung tại `src/app.module.ts`.

## 6. CẤU TRÚC FRONTEND (NEXT.JS)
Nằm trong thư mục `frontend-nextjs/`
- **App Router (`src/app`)**:
  - `(public)`: Khu vực public cho khách truy cập. Mục tiêu chính là tối ưu SEO.
  - `(admin)/admin`: Khu vực CMS Quản trị nội bộ dành cho Admin.
- **Feature-Based Colocation (`src/features`)**: Mỗi tính năng nghiệp vụ lớn được chia thành thư mục riêng trong `features/` (chứa `components`, `actions`, `hooks`, v.v.).

## 7. QUY TRÌNH LÀM VIỆC (WORKFLOW) CỦA AGENT BẮT BUỘC
Để đảm bảo chất lượng mã nguồn, AI Agent phải vận dụng liên hoàn các "Skills" đã được cài đặt trong thư mục `.agents/skills`:

### 7.1. Workflow Chung (General)
1. **Khởi tạo Module/Feature Mới**: 
   - Đọc kỹ năng `create-nestjs-module` (Backend) hoặc `create-nextjs-feature` (Frontend) để tuân thủ kiến trúc thư mục chuẩn dự án.
2. **Lên Kế Hoạch (Planning)**: 
   - Phải chạy kỹ năng `writing-plans` để lập tài liệu kế hoạch chi tiết (task breakdown, files changed) trước khi code bất kỳ module lớn nào.
3. **Thực Thi (Execution)**: 
   - Sử dụng `executing-plans` để code tuần tự theo Plan.
4. **Kiểm Tra Trước Khi Hoàn Thành (Verification)**: 
   - Dùng `verification-before-completion` để tự động chạy build và xác nhận không có lỗi cú pháp/logic trước khi báo cáo thành công cho người dùng.
5. **Gỡ Lỗi (Debugging)**: 
   - Nếu gặp lỗi, dùng phương pháp `systematic-debugging`. Nếu cần kiểm thử Form giao diện trực quan, hãy sử dụng `agent-browser`.
6. **Đóng Gói (Git)**:
   - Dùng `finishing-a-development-branch` khi cần merge hoặc hoàn tất một nhánh tính năng.

### 7.2. Yêu Cầu Chuyên Sâu Khi Code Frontend (Next.js / React)
Khi làm việc với mã nguồn Frontend, Agent **BẮT BUỘC** phải tuân thủ và tham khảo các skills sau:
1. **`vercel-react-best-practices`**: Tối ưu hóa hiệu năng React, tránh render thừa (re-renders), giảm dung lượng bundle và xử lý waterfalls theo đúng chuẩn Vercel.
2. **`vercel-composition-patterns`**: Áp dụng triệt để Compound components, render props và context patterns để thiết kế API Component dễ mở rộng, thu nhỏ và tái sử dụng.
3. **`shadcn`**: Khi tạo hoặc sửa UI Component, phải bám sát tài liệu cấu hình, tùy biến và tích hợp Tailwind của shadcn/ui thay vì tự code từ đầu.
4. **`tailwind-design-system`**: Tuân thủ hệ thống thiết kế Design System bằng Tailwind (tokens, variants, component patterns) để đảm bảo đồng nhất UI toàn trang.
5. **`typescript-advanced-types`**: Áp dụng strict types cực mạnh (Discriminated unions, conditional types, utility types) để đảm bảo type-safe toàn dự án, cấm dùng `any`.
6. **`webapp-testing` & `test-driven-development`**: Viết test unit, integration và e2e chuẩn mực cho React App (đặc biệt các logic Form tính giá, custom hook) theo nguyên tắc TDD.

## 8. TRIỂN KHAI VÀ CI/CD (DEPLOYMENT)
- **Kiến trúc Build**: Xử lý toàn bộ tiến trình Build thông qua **GitHub Actions**. Không thực thi chạy `docker-compose build` trực tiếp trên VPS để tránh quá tải CPU/RAM máy chủ.
- **Quy trình chuẩn**: GitHub Actions tự động build image -> Push lên GHCR (GitHub Container Registry) -> SSH vào VPS, dùng temporary `GITHUB_TOKEN` đăng nhập -> Chạy lệnh `docker compose pull && docker compose up -d`.
- **Lưu ý khi sửa CI/CD**: Khi tư vấn về CI/CD, phải chắc chắn rằng các biến môi trường của frontend như `NEXT_PUBLIC_` được truyền qua GitHub Secrets tại thời điểm build (Build args) chứ không phải lấy từ `.env` của VPS.
