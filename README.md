# Hệ Sinh Thái Công Nghệ Công Ty Thanh Xuân (Thanh Xuan Ecosystem)

Hệ thống công nghệ đa ngành kết hợp giữa tiếp thị trực tuyến và điều hành chuỗi cung ứng sản xuất thực tế của **Công ty Thanh Xuân (Thanh Xuan Company)**: bao gồm dịch vụ giặt là công nghiệp cao cấp cho chuỗi nhà hàng B2B, cổng điều hành xưởng & quản vận logistics, và dịch vụ chuyển nhà trọn gói.

---

## 🏗️ Kiến Trúc Monorepo & 4 Ứng Dụng Thành Phần

Hệ sinh thái được tổ chức dưới dạng Monorepo thống nhất, bao gồm 1 Backend API tập trung và 3 Frontend độc lập:

```text
Website_Thanh_Xuan_Company/
├── be-nestjs-thanhxuan/            # [Port 5001] Backend API Server tập trung (NestJS, 3 MongoDB độc lập)
├── fe-nextjs-thanhxuan-laundry/    # [Port 3000] Web Khách Hàng B2B & CMS Marketing Giặt Là (Next.js 15)
├── fe-react-thanhxuan-internal/    # [Port 3001] Cổng Vận Hành Xưởng & Quản Vận PWA (React + Vite)
├── fe-nextjs-chuyennhatietkiem/    # [Port 3002] Web Dịch Vụ Chuyển Nhà Trọn Gói (Next.js 16)
├── .agents/                        # Hệ thống tài liệu kiến trúc, AI rules, skills và hooks
│   ├── docs/                       # SRS/SDD, Database Dictionary, Codebase Atlas, Changelog, Plans
│   ├── rules/                      # Quy tắc kỹ thuật bắt buộc (AGENTS.md, GEMINI.md, backend, frontend, readme)
│   └── hooks/                      # Guard an toàn và Verify tự động trước khi kết thúc phiên
└── docker-compose.yml              # Cấu hình container hóa production cho toàn bộ hệ sinh thái
```

---

## 📊 Bảng Tra Cứu Thông Tin Các Ứng Dụng

| STT | Ứng Dụng | Thư Mục | Port Dev | Port Container | Domain Production | Trọng Tâm Nghiệp Vụ |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| **01** | **Backend API Server** | [`be-nestjs-thanhxuan/`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/README.md) | `5001` | `5001` | `api.thanhxuanlaundry.com` | API Gateway, 3 MongoDB độc lập, RBAC 8 vai trò, Streaming Excel/PDF |
| **02** | **Web Giặt Là & CMS** | [`fe-nextjs-thanhxuan-laundry/`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/README.md) | `3000` | `3000` | `thanhxuanlaundry.com` | Tiếp thị B2B SEO Google, Lead Capture CRM, CMS bài viết AI & Zalo OA |
| **03** | **Cổng Vận Hành Xưởng** | [`fe-react-thanhxuan-internal/`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/README.md) | `3001` | `3001` | `noibo.thanhxuanlaundry.com` | PWA Mobile-First, Phiếu giao nhận kép, Ký số Canvas, Công thợ HourlyWork |
| **04** | **Web Chuyển Nhà** | [`fe-nextjs-chuyennhatietkiem/`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-nextjs-chuyennhatietkiem/README.md) | `3002` | `3002` | `chuyennhatietkiem.vn` | Tính cước taxi tải tự động theo Km, đặt lịch khảo sát chuyển nhà 24/7 |

---

## 🛠️ Công Nghệ & Tiêu Chuẩn Nền Tảng

- **Ngôn ngữ chuẩn hóa**: 100% [TypeScript](https://www.typescriptlang.org/) (Strict Mode toàn bộ dự án).
- **Backend Core**: [NestJS 10.x](https://nestjs.com/), Multi-Database Architecture với 3 CSDL MongoDB độc lập (`laundry_express`, `moving_express`, `internal_express`), Repository Pattern nghiêm ngặt.
- **Frontend Stack**:
  * Next.js App Router (RSC mặc định tối ưu SEO Google).
  * React Vite SPA (PWA Offline IndexedDB, Mobile-first touch target $\ge$ 44px).
  * TailwindCSS (v3 & v4), shadcn/ui components, Lucide Icons.
- **Quản lý Package**: Sử dụng duy nhất `pnpm` trong toàn bộ Monorepo.
- **Chuẩn hóa thời gian**: Toàn bộ nghiệp vụ (chấm công, giờ công thợ, mã phiếu, báo cáo) bắt buộc theo múi giờ Việt Nam `Asia/Ho_Chi_Minh` (GMT+7) qua helper `time.util.ts`.

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

Mỗi ứng dụng hoạt động độc lập trong thư mục của nó. Mở các terminal riêng biệt để khởi chạy:

### 1. Khởi chạy Backend API (Port 5001)
```bash
cd be-nestjs-thanhxuan
pnpm install
pnpm start:dev
```

### 2. Khởi chạy Web Giặt Là & CMS Marketing (Port 3000)
```bash
cd fe-nextjs-thanhxuan-laundry
pnpm install
pnpm dev
```

### 3. Khởi chạy Cổng Vận Hành Xưởng Nội Bộ (Port 3001)
```bash
cd fe-react-thanhxuan-internal
pnpm install
pnpm dev
```

### 4. Khởi chạy Web Chuyển Nhà Trọn Gói (Port 3002)
```bash
cd fe-nextjs-chuyennhatietkiem
pnpm install
pnpm dev
```

---

## 🛳️ Quy Chuẩn Triển Khai (CI/CD & Deployment)

Hệ thống áp dụng kiến trúc phát hành tự động qua **GitHub Actions** với triết lý **Zero Server Load**:
1. **Nhánh `dev`**: Nhánh phát triển hàng ngày. Agent và lập trình viên tự động verify test/typecheck/build tại local trước khi push. Push lên `dev` không tốn phút chạy GitHub Actions.
2. **Nhánh `master`**: Nhánh phát hành chính thức (CD). Khi merge code vào `master`:
   - GitHub Actions runner tự động build Docker Image / Bundle tĩnh.
   - Đẩy Docker Image lên **GitHub Container Registry (GHCR)**.
   - SSH vào máy chủ VPS Ubuntu, chạy `docker compose pull && docker compose up -d`.
   - VPS không bao giờ chạy lệnh build trực tiếp để bảo vệ 100% tài nguyên CPU/RAM.

---

## 📚 Bản Đồ Tài Liệu Kiến Trúc Kỹ Thuật (Architecture Docs)

Hệ thống tài liệu kỹ thuật được duy trì và đồng bộ liên tục theo chuẩn Modular Living Architecture:

| Tài Liệu | Đường Dẫn | Nội Dung Trọng Tâm |
| :--- | :--- | :--- |
| **Kiến Trúc Tổng Thể** | [.agents/docs/SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) | Topology kết nối, System Context, Quy chuẩn dùng chung toàn hệ thống |
| **Phân Hệ Backend API** | [.agents/docs/srs_sdd/srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md) | 3 CSDL, API Contracts, RBAC Guards, Streaming Service |
| **Phân Hệ Web & CMS** | [.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md) | RSC SEO, Leads Capture, Quản trị CMS Marketing |
| **Phân Hệ Vận Hành Xưởng** | [.agents/docs/srs_sdd/srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md) | PWA Mobile-First, Phiếu giao nhận 2 chiều, HourlyWork |
| **Từ Điển Dữ Liệu (34+ Bảng)** | [.agents/docs/DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md) | Chi tiết từng trường dữ liệu, kiểu, index và quan hệ CSDL |
| **Bản Đồ Định Vị Mã Nguồn** | [.agents/docs/CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md) | Tra cứu tức thì: Endpoint $\leftrightarrow$ Controller $\leftrightarrow$ Service $\leftrightarrow$ Schema $\leftrightarrow$ Page |
| **Nhật Ký Tiến Hóa Kỹ Thuật** | [.agents/docs/CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md) | Lưu trữ chi tiết bài luận kỹ thuật theo từng Plan và Bugfix |
| **Quy Chuẩn Viết README** | [.agents/rules/readme.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/rules/readme.md) | Khung cấu trúc 8 phần chuẩn mực cho các tài liệu README trong hệ sinh thái |
