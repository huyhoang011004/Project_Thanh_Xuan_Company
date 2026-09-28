# SYSTEM INSTRUCTIONS FOR GEMINI (THANH XUAN LAUNDRY ECOSYSTEM)

Đây là tài liệu hướng dẫn hệ thống dành riêng cho AI Assistant (Agent) khi làm việc trong toàn bộ hệ sinh thái dự án **Website & Quản trị Công Ty Giặt Sấy Thanh Xuân**. Bạn (Gemini/Agent) phải luôn tuân thủ nghiêm ngặt các quy tắc trong tài liệu này trong suốt quá trình đồng hành cùng người dùng.

---

## 1. TỔNG QUAN DỰ ÁN & HỆ SINH THÁI

Hệ thống phần mềm của Công ty Thanh Xuân phục vụ toàn diện từ tiếp thị, SEO, đặt dịch vụ cho khách hàng đến quản lý vận hành xưởng giặt và giao nhận đối tác.

Dự án gồm 3 ứng dụng chính trong cùng Monorepo/Workspace:

1. **`be-nestjs-thanhxuan/`**: Backend API Server tập trung (NestJS, MongoDB Mongoose Multi-Database).
2. **`fe-nextjs-thanhxuan-laundry/`**: Website Khách hàng (Marketing, SEO, Đặt dịch vụ, Tra cứu đơn) & Hệ thống CMS Quản trị nội dung (Next.js App Router).
3. **`fe-react-thanhxuan-internal/`**: Cổng thông tin Vận hành Nội bộ Xưởng & Điều phối Đối tác (React, Vite, SPA).

---

## 2. NGUYÊN TẮC NGÔN NGỮ VÀ GIAO TIẾP

- **Ngôn ngữ chính**: Sử dụng 100% tiếng Việt tự nhiên cho giao tiếp, giải thích luồng, lập kế hoạch, tài liệu và văn bản UI hiển thị.
- **Thuật ngữ kỹ thuật**: **GIỮ NGUYÊN** các thuật ngữ kỹ thuật tiếng Anh chuyên ngành (Controller, Repository, DTO, UseCase, Middleware, Caching, Bypass, Lean, Hook, Index, Props, State, Monorepo, Docker, v.v.). Tuyệt đối không dịch gượng gạo sang tiếng Việt.

---

## 3. CÔNG NGHỆ & TIÊU CHUẨN KỸ THUẬT

### 3.1. Backend (`be-nestjs-thanhxuan`)

- **Framework**: NestJS 11+, Node.js 20+
- **Database**: MongoDB với Mongoose (Multi-Database: `laundry_express`, `moving_express`, `internal_express`)
- **Cổng mặc định**: `5001`
- **Kiến trúc**: Phân tầng nghiêm ngặt (Controller -> Service -> Repository -> Model).
- **Tích hợp**: JWT Auth, Nodemailer (SMTP), Cloudinary Upload, Zalo OA, Tích hợp AI (Gemini / OpenAI / OpenRouter).

### 3.2. Frontend Website & CMS (`fe-nextjs-thanhxuan-laundry`)

- **Framework**: Next.js 15+ (App Router), React 19
- **Cổng mặc định**: `3000`
- **Styling & UI**: TailwindCSS, Shadcn UI, Lucide Icons
- **Kiến trúc**: Feature-based Colocation (`src/features/`), tối ưu hóa SEO với Server Components.
- **Phân vùng ứng dụng (`src/app`)**:
  - `(public)`: Cổng thông tin khách hàng, dịch vụ giặt sấy, bảng giá, blog SEO, form liên hệ/đặt lịch.
  - `(admin)/admin`: Khu vực CMS quản trị bài viết, banner, danh mục, đơn hàng dịch vụ.

### 3.3. Frontend Nội Bộ Xưởng (`fe-react-thanhxuan-internal`)

- **Framework**: React 18+, Vite 6+ (SPA)
- **Cổng mặc định**: `3001`
- **Styling & UI**: TailwindCSS v3+, Shadcn UI, Lucide React
- **Nghiệp vụ cốt lõi**:
  - **Phiếu Giao Nhận Kép (`handover`)**: Điều phối xe nhận hàng, kiểm kê và bàn giao đồ giặt đối tác.
  - **Khoán Việc & Năng Suất (`piecework`)**: Chấm công theo sản lượng giặt/ủi từng thợ xưởng.
  - **Điểm Danh Chấm Công (`attendance`)**: Theo dõi ca làm và công thợ.
  - **Quản Lý Đối Tác (`partners`)**: Quản lý thông tin và công nợ đối tác giặt là.

---

## 4. QUY TẮC VIẾT CODE BẮT BUỘC (MANDATORY RULES)

1. **Header File Bắt Buộc**: Mọi file code tạo mới (Backend, Frontend, Config, v.v.) phải luôn có dòng chú thích đầu tiên:
   ```typescript
   // Adhering to SOLID & Design Patterns
   ```
2. **Backend Database Access**:
   - Mọi truy vấn CSDL bắt buộc phải nằm ở tầng **Repository**.
   - Tuyệt đối **không** gọi trực tiếp Mongoose Model từ Service hoặc Controller.
   - Áp dụng các phương thức Lean, Indexes phù hợp để tối ưu tốc độ đọc.
3. **Frontend Rendering & SEO (Next.js)**:
   - Ưu tiên tối đa **Server Components** cho các trang `(public)` để đảm bảo hiệu suất SEO tốt nhất.
   - Chỉ dùng directive `"use client"` cho các component thực sự cần tương tác DOM, state hoặc event handler (Form, Tab, Modal, Carousel...).
4. **Tách Biệt Logic và Giao Diện**:
   - Ở cả hai ứng dụng Frontend, không viết trực tiếp logic xử lý dữ liệu phức tạp hoặc API call sâu trong thẻ JSX/TSX của UI Component.
   - Tách ra các Custom Hook, Service hoặc Server Actions tương ứng.
5. **Business Rules**:
   - UI các trang nội dung/bài viết (dịch vụ, tin tức, giới thiệu) phải tự động tích hợp form liên hệ / CTA chuyển đổi ở cuối trang.
   - Dữ liệu gửi đi từ form hoặc tracking của client phải luôn kèm theo ngữ cảnh (context: `sourceUrl`, `category`, `slug`...).
6. **Strict Types**:
   - Bật TypeScript Strict Mode. Tuyệt đối không dùng kiểu `any`, phải khai báo type/interface rõ ràng.

---

## 5. CẤU TRÚC THƯ MỤC CHUẨN

```text
Website_Thanh_Xuan_Company/
├── be-nestjs-thanhxuan/                  # Backend NestJS (Port 5001)
│   ├── src/
│   │   ├── common/                       # Decorators, Filters, Guards, Interceptors
│   │   ├── config/                       # Configuration Module & Database Connections
│   │   ├── mail/                         # Mailer Service (SMTP)
│   │   └── modules/                      # Các Module nghiệp vụ (Controller, Service, Repository, DTO, Schema)
│   ├── Dockerfile
│   └── package.json
│
├── fe-nextjs-thanhxuan-laundry/          # Frontend Public & CMS Next.js (Port 3000)
│   ├── src/
│   │   ├── app/                          # App Router: (public) và (admin)/admin
│   │   ├── components/                   # Shared UI Components (Shadcn UI)
│   │   ├── features/                     # Feature-based Modules (components, actions, hooks)
│   │   ├── services/                     # API Fetchers & Data Layer
│   │   └── middleware.ts                 # Auth & Route Guard Middleware
│   ├── Dockerfile
│   └── package.json
│
├── fe-react-thanhxuan-internal/           # Frontend Vận Hành Nội Bộ Vite + React (Port 3001)
│   ├── src/
│   │   ├── assets/                       # Static Assets & Icons
│   │   ├── App.tsx                       # UI Vận Hành & Điều phối Module nội bộ
│   │   ├── main.tsx                      # Entry point React Vite
│   │   └── index.css                     # Tailwind CSS Base
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── docker-compose.yml                    # Điều phối Containers (MongoDB, Backend, Frontend Next, Frontend React)
├── .agents/skills/                       # Danh mục Agent Skills hỗ trợ phát triển
└── GEMINI.md                             # Tài liệu chỉ dẫn hệ thống này
```

---

## 6. QUY TRÌNH LÀM VIỆC (WORKFLOW) CỦA AGENT BẮT BUỘC

Khi thực hiện bất kỳ nhiệm vụ nào, AI Agent phải vận dụng các Skills trong `.agents/skills`:

### 6.1. Workflow Phát Triển Chung

1. **Lập Kế Hoạch (`writing-plans`)**:
   - Lập tài liệu kế hoạch chi tiết (task breakdown, files changed) trước khi bắt đầu code tính năng hoặc module lớn.
2. **Tạo Module Mới**:
   - Sử dụng `create-nestjs-module` khi tạo Module Backend mới.
   - Sử dụng `create-nextjs-feature` khi xây dựng Feature Frontend Next.js mới.
3. **Thực Thi Kế Hoạch (`executing-plans`)**:
   - Thực hiện từng bước một cách chặt chẽ theo tài liệu kế hoạch đã thống nhất.
4. **Kiểm Tra & Xác Minh (`verification-before-completion`)**:
   - Chạy lệnh build (`tsc`, `npm run build`, `pnpm build`) để đảm bảo không có lỗi biên dịch trước khi thông báo hoàn tất nhiệm vụ.
5. **Gỡ Lỗi Hệ Thống (`systematic-debugging`)**:
   - Điều tra nguyên nhân gốc rễ (root cause) trước khi áp dụng bản sửa lỗi. Có thể dùng `agent-browser` để kiểm tra trực quan giao diện.
6. **Đóng Gói Tính Năng (`finishing-a-development-branch`)**:
   - Kiểm tra branch, verify toàn bộ test và review thay đổi trước khi hoàn thành công việc.

### 6.2. Yêu Cầu Chuyên Sâu Khi Code Frontend

- **`vercel-react-best-practices`**: Tránh re-renders thừa, giảm kích thước bundle và triệt tiêu data waterfalls.
- **`vercel-composition-patterns`**: Áp dụng Compound Components, Render Props, Context để thiết kế component linh hoạt, dễ tái sử dụng.
- **`shadcn`**: Tận dụng tối đa thành phần từ Shadcn UI thay vì tự code thủ công lại từ đầu.
- **`tailwind-design-system`**: Tuân thủ tokens màu sắc, khoảng cách và responsive thống nhất toàn hệ thống.
- **`typescript-advanced-types`**: Áp dụng triệt để Generics, Discriminated Unions và Utility Types, cấm dùng `any`.

---

## 7. QUY CHUẨN DEPLOYMENT & CI/CD

- **Kiến trúc Build**: Toàn bộ quy trình Build Docker Image thực hiện trên **GitHub Actions**, **tuyệt đối không** chạy `docker-compose build` trực tiếp trên VPS để tránh làm cạn kiệt tài nguyên (CPU/RAM).
- **Quy trình Deploy**:
  1. GitHub Actions build các images: Backend, Next.js Frontend, React Internal Frontend.
  2. Push images lên GitHub Container Registry (GHCR).
  3. SSH vào VPS và thực thi lệnh: `docker compose pull && docker compose up -d`.
- **Quản lý Biến Môi Trường**:
  - Các biến môi trường frontend `NEXT_PUBLIC_*` và `VITE_*` phải được truyền qua **GitHub Secrets** dưới dạng Build Arguments (`args`) tại thời điểm build image trên GitHub Actions.
  - Các biến bí mật backend (MongoDB URI, JWT Secret, SMTP, API Keys) được cấu hình tại file `.env` trên VPS.
