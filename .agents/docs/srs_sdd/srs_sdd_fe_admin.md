# SRS & SDD — Cổng Quản Trị Tập Trung Đa Thương Hiệu (`fe-react-thanhxuan-admin`)

> **Phiên bản:** 1.0.0 | **Ngày cập nhật:** 2026-11-01  
> **Ứng dụng:** `fe-react-thanhxuan-admin` (React SPA + Vite, Port `3003`)  
> **Tên miền phục vụ:** `quantri.thanhxuanlaundry.com` & `quantri.chuyennhatietkiem.vn`

---

## 1. Bối Cảnh Nghiệp Vụ & Mục Tiêu

1. **Bản chất kỹ thuật:** Trang Quản trị (CMS) là private dashboard sau đăng nhập, **100% không cần SEO Google** (`noindex, nofollow`). Việc sử dụng Vite + React SPA loại bỏ hoàn toàn chi phí SSR của Next.js, giúp trang tải nhanh tức thì (0ms switch tab sau lần tải đầu), tốn gần như 0% tài nguyên CPU của máy chủ VPS khi phục vụ static files qua Nginx.
2. **Mô hình Multi-Tenant (Đa Thương Hiệu):**
   - Một source code và 1 instance Nginx static serving duy nhất phục vụ cả:
     - `quantri.thanhxuanlaundry.com` (Giặt Là Thanh Xuân)
     - `quantri.chuyennhatietkiem.vn` (Chuyển Nhà Tiết Kiệm)
   - Tự động nhận diện tenant dựa trên `window.location.hostname`.
   - Cung cấp **Tenant Switcher** trên thanh Header cho Super Admin chuyển đổi qua lại giữa 2 thương hiệu tức thì mà không cần đăng xuất.
   - Axios Interceptor tự động gán header `x-tenant-id: laundry | moving` để Backend NestJS truy vấn đúng CSDL MongoDB tương ứng (`laundry_express` vs `moving_express`).

---

## 2. Cấu Trúc Mã Nguồn Chuẩn Hóa

```text
fe-react-thanhxuan-admin/
├── public/                     # Icons, favicons, PWA assets
├── src/
│   ├── app/                    # Routing, Tenant Context & Auth Guard
│   │   ├── router.tsx          # React Router v7 routes
│   │   ├── RootLayout.tsx      # QueryClientProvider, TenantProvider, AuthProvider
│   │   ├── TenantContext.tsx   # Context đa thương hiệu & Tenant Switcher
│   │   └── RequireAuth.tsx     # Route Guard bảo vệ route admin
│   ├── components/             # Reusable UI (< 250-300 dòng)
│   │   ├── ui/                 # button, input, badge, card, table, dialog, tabs
│   │   └── layout/             # AdminShellComponent, Sidebar, Header, TenantSwitcher
│   ├── features/               # Flat Feature-Based Colocation
│   │   ├── auth/               # Login, useAuth, AuthContext
│   │   ├── dashboard/          # DashboardPage thống kê tổng quan theo tenant
│   │   ├── articles/           # Quản lý bài viết blog SEO, Rich text, Upload ảnh
│   │   ├── categories/         # Quản lý chuyên mục bài viết & dịch vụ
│   │   ├── contacts/           # Tiếp nhận liên hệ tư vấn từ khách hàng
│   │   ├── crm/                # Quản lý khách hàng tiềm năng
│   │   ├── orders/             # Đơn giặt là vs Đơn đặt xe chuyển nhà
│   │   ├── settings/           # Cài đặt website, hotline, banner, SEO metadata
│   │   └── users/              # Quản lý tài khoản quản trị
│   ├── lib/                    # api-client.ts, auth-storage.ts, tenant-storage.ts, utils.ts
│   ├── types/                  # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── nginx.conf                  # Nginx static serving container
├── Dockerfile                  # Multi-stage Dockerfile
├── package.json
└── vite.config.ts              # Port 3003, proxy API 5001
```

---

## 3. Bản Đồ Định Tuyến URL & Quyền Truy Cập

| Đường dẫn (Route) | Phân hệ nghiệp vụ | Component | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| `/login` | Xác thực | `LoginPage.tsx` | Đăng nhập quản trị, đổi tenant trước đăng nhập |
| `/dashboard` | Tổng quan | `DashboardPage.tsx` | Số liệu thống kê chuyển đổi theo tenant |
| `/articles` | Nội dung SEO | `ArticlesListPage.tsx` | Danh sách bài viết, lọc chuyên mục |
| `/articles/new` | Nội dung SEO | `ArticleEditorPage.tsx` | Soạn bài viết mới, tải ảnh đại diện |
| `/articles/edit/:id` | Nội dung SEO | `ArticleEditorPage.tsx` | Chỉnh sửa bài viết hiện có |
| `/categories` | Danh mục | `CategoriesListPage.tsx` | CRUD chuyên mục phân theo tenant |
| `/contacts` | Leads | `ContactsListPage.tsx` | Tiếp nhận và xử lý yêu cầu tư vấn |
| `/crm` | Khách hàng | `CrmListPage.tsx` | Hồ sơ khách hàng, tổng chi tiêu |
| `/orders` | Đơn hàng | `OrdersListPage.tsx` | Đơn giặt (Laundry) / Đơn chuyển nhà (Moving) |
| `/settings` | Cấu hình | `GeneralSettingsPage.tsx` | Cài đặt hotline, banner, header, footer |
| `/users` | Phân quyền | `UsersListPage.tsx` | Quản trị tài khoản admin |

---

## 4. Kiến Trúc Triển Khai Thực Tế Trên VPS & CI/CD (Zero Docker Container)

1. **Triển khai Tĩnh Trực Tiếp Trên Nginx Host (Zero Server Load):**
   - Không chạy thêm container Docker trên VPS để tiết kiệm tối đa CPU/RAM (< 512MB RAM).
   - Thư mục phục vụ web tĩnh: `/var/www/quantri/dist` (sở hữu bởi `www-data:www-data`).
   - Cấu hình Nginx host: `/etc/nginx/sites-available/quantri.thanhxuanlaundry.com`
     - Phục vụ SPA: `try_files $uri $uri/ /index.html;`
     - Cache tĩnh immutable cho assets: 6 tháng (`max-age=15552000`).
     - Tắt cache cho PWA manifest và service worker (`sw.js`, `manifest.webmanifest`).
     - Proxy API:
       - `/api/v1/` $\rightarrow$ `http://127.0.0.1:5001/api/v1/` (Module Chuyển Nhà).
       - `/api/` $\rightarrow$ `http://127.0.0.1:5001/` (Module Giặt Là & Core CMS).
   - Chứng chỉ SSL Let's Encrypt: Tự động gia hạn qua Certbot, HTTPS 200 OK trên `quantri.thanhxuanlaundry.com`.

2. **Quy Trình CI/CD Tự Động (GitHub Actions):**
   - File workflow: `.github/workflows/main.yml` trong repo `fe-react-thanhxuan-admin`.
   - Khi merge code vào nhánh `main` hoặc `master`:
     - GitHub Runner cài đặt Node.js 22 + pnpm, build bundle tĩnh `pnpm run build`.
     - Dùng Action `appleboy/scp-action` đồng bộ file `dist/*` lên VPS tại `/var/www/quantri/dist`.
     - Dùng Action `appleboy/ssh-action` phân quyền `www-data:www-data` và chạy `nginx -t && systemctl reload nginx`.
   - Kết quả: Triển khai tức thì (Zero-Downtime), không tiêu tốn tài nguyên build trên VPS.
