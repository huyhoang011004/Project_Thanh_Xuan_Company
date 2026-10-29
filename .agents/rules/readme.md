---
trigger: glob
glob: **/README.md
description: Quy chuẩn kiến trúc và cấu trúc soạn thảo tài liệu README.md cho các kho mã nguồn thuộc Hệ sinh thái Thanh Xuân Company
---

# Quy Chuẩn Soạn Thảo README.md (Standard README Specification)

Tài liệu này định nghĩa cấu trúc chuẩn mực (Golden Template), phong cách ngôn ngữ và các nội dung bắt buộc phải có trong mọi file `README.md` thuộc Hệ sinh thái Công nghệ Công ty Thanh Xuân.

---

## 1. Nguyên Tắc Cốt Lõi

1. **Ngôn ngữ:** 100% tiếng Việt tự nhiên, chuyên nghiệp; giữ nguyên thuật ngữ kỹ thuật quốc tế bằng tiếng Anh (NestJS, Repository Pattern, App Router, Docker, CI/CD, PWA, Hook, DTO...).
2. **Tính chính xác & Đồng bộ hiện trạng:** Mọi thông tin về công nghệ, cổng port, câu lệnh, biến môi trường `.env` và cấu trúc thư mục phải khớp 100% với code thực tế của dự án. Không để lại thông tin lỗi thời từ phiên bản cũ.
3. **Quản lý package:** Sử dụng duy nhất `pnpm` trong toàn bộ hướng dẫn cài đặt và chạy lệnh (không dùng `npm` hay `yarn`).
4. **Liên kết tài liệu:** Luôn có mục dẫn chiếu đến hệ thống tài liệu kiến trúc trung tâm (`.agents/docs/`): [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md), [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md), [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md), [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).

---

## 2. Khung Cấu Trúc Bắt Buộc (The 8-Section Golden Template)

Mọi file `README.md` của từng ứng dụng bắt buộc phải tuân theo thứ tự 8 phần sau:

### Phần 1: Tiêu Đề, Badges & Định Vị Ứng Dụng

- Tên dự án rõ ràng, định vị vai trò trong hệ sinh thái.
- Hệ thống Badges: Ngôn ngữ (TypeScript), Nền tảng (Node.js/Next.js/React/NestJS), Package Manager (pnpm), Môi trường (Docker/GHCR), Cổng nội bộ (Port: `5001`, `3000`, `3001`, `3002`).
- 1 đoạn tóm tắt súc tích (2-3 câu) về mục đích kinh doanh và người dùng phục vụ.

### Phần 2: Nghiệp Vụ Cốt Lõi & Tính Năng Nổi Bật (Core Business Features)

- Liệt kê các luồng nghiệp vụ chính bằng bullet points kèm giải thích ngắn gọn, súc tích.
- Nhấn mạnh các tính năng đặc thù (ví dụ: Chữ ký số Canvas, Offline PWA, AI Content, Multi-Database, Báo cáo streaming).

### Phần 3: Công Nghệ & Tiêu Chuẩn Kỹ Thuật (Tech Stack & Architecture)

- Bảng hoặc danh sách công nghệ cốt lõi: Framework, Database, State Management, Styling, Authentication, Validation, External APIs.
- Nêu rõ các Design Patterns áp dụng (Repository Pattern, Flat Colocation, Server Components, Mobile-First...).

### Phần 4: Cấu Trúc Thư Mục Dự Án (Directory Structure)

- Cây thư mục ASCII code block (`tree`) của thư mục `src/`.
- Chú thích chức năng bên cạnh từng thư mục/module chính để lập trình viên mới nắm bắt ngay trong 30 giây.

### Phần 5: Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Getting Started)

- Yêu cầu môi trường (Node.js version, pnpm version, MongoDB...).
- Bảng mẫu biến môi trường `.env` hoặc `.env.example` với giải thích từng biến cần thiết.
- Khối lệnh cài đặt và khởi chạy:
  ```bash
  pnpm install
  pnpm dev
  pnpm build
  pnpm test
  ```
- URL và Port truy cập cục bộ mặc định.

### Phần 6: Danh Mục Tuyến Đường / API Endpoints Chính (Routes / API Contract)

- Với Frontend: Bảng danh sách URL Routes, quyền hạn truy cập (Public / Auth / Roles) và tên Component/Page tương ứng.
- Với Backend: Bảng tóm tắt tiền tố API (`/api/v1/...`), Controller, và nhóm chức năng chính.

### Phần 7: Quy Trình Đóng Gói Docker & CI/CD Deployment

- Giải thích luồng CI/CD tự động bằng GitHub Actions (Zero Server Load): GitHub build Docker Image $\rightarrow$ Push GHCR $\rightarrow$ SSH vào VPS pull image và `docker compose up -d`.
- Cảnh báo an toàn: Không bao giờ build image trực tiếp trên VPS; bảo vệ biến môi trường bí mật.

### Phần 8: Tài Liệu Tham Chiếu & Liên Kết Hệ Thống (Related Docs)

- Liên kết sang Monorepo root, tài liệu SRS/SDD, Database Dictionary, Codebase Atlas và Changelog.

---

## 3. Bảng Ánh Xạ Port & Ứng Dụng Trong Toàn Hệ Sinh Thái

| Ứng Dụng                               | Thư Mục                        | Port Dev | Port Container | Domain Môi Trường Thật       |
| :------------------------------------- | :----------------------------- | :------- | :------------- | :--------------------------- |
| **Backend API Server**                 | `be-nestjs-thanhxuan/`         | `5001`   | `5001`         | `api.thanhxuanlaundry.com`   |
| **Web Giặt Là & CMS Marketing**        | `fe-nextjs-thanhxuan-laundry/` | `3000`   | `3000`         | `thanhxuanlaundry.com`       |
| **Cổng Vận Hành Xưởng & Quản Vận PWA** | `fe-react-thanhxuan-internal/` | `3001`   | `3001`         | `noibo.thanhxuanlaundry.com` |
| **Web Chuyển Nhà Trọn Gói**            | `fe-nextjs-chuyennhatietkiem/` | `3002`   | `3002`         | `chuyennhatietkiem.vn`       |
