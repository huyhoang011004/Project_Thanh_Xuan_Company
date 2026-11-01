# Review 66: Phân Tách & Xây Dựng Cổng Quản Trị Admin Tập Trung Đa Thương Hiệu (fe-react-thanhxuan-admin)

> Plan: .agents/docs/plans/plan66.md | Reviewed: 2026-11-01 | Base: 14d68cf (nhánh dev) | Verdict: Request changes

## 1. Tóm tắt

- **Đánh giá về ý tưởng & kiến trúc Plan 66:** Ý tưởng phân tách trang Admin CMS ra ứng dụng độc lập **React SPA (Vite)** dùng chung cho cả 2 thương hiệu (`quantri.thanhxuanlaundry.com` & `quantri.chuyennhatietkiem.vn`) là **hoàn toàn chính xác và tối ưu**. Trang quản trị không cần SEO Google; việc dùng Next.js SSR trước đây gây lãng phí CPU/RAM server. React SPA tĩnh kết hợp Nginx reverse proxy giúp tải trang tức thì, giảm tải VPS về mức ~0%.
- **Đánh giá về chất lượng mã nguồn Frontend:** Mã nguồn `fe-react-thanhxuan-admin` được tổ chức sạch sẽ, tuân thủ nghiêm ngặt quy tắc TypeScript Strict Mode (0 lỗi `any`), 100% file đều dưới 300 dòng, build Vite thành công (dung lượng bundle nén gzip ~510KB), cấu hình Nginx & Dockerfile đạt chuẩn.
- **Đánh giá về tính hoàn thiện và kết nối Backend (Lỗ hổng cốt lõi):** Plan 66 đã tick hoàn thành Task T15 nhưng trên thực tế **Backend NestJS chưa được cập nhật hỗ trợ `x-tenant-id`**. Đồng thời, có sự sai lệch về API contract giữa Frontend và Backend hiện có (refresh token, upload ảnh, endpoint đơn chuyển nhà) và thiếu bộ Rich Text Editor Canva-style như đã cam kết tại Task T9.

---

## 2. Đối chiếu với Plan

| Task | Trạng thái | Ghi chú đối chiếu |
| :--- | :--- | :--- |
| **T1: Init package.json & libs** | **Đạt** | Vite, React 18, React Router v7, TanStack Query v5, TailwindCSS, Lucide, Axios. |
| **T2: Config Vite, TS, Tailwind** | **Đạt** | Port 3003, alias `@/*`, `[data-tenant]` theming. |
| **T3: UI Components shadcn** | **Đạt** | `button`, `input`, `table`, `dialog`, `badge`, `tabs`, `card`. (Thiếu `dropdown-menu`, dùng Tabs/Select thay thế). |
| **T4: Axios Client & Interceptor** | **Thiếu** | Đã tạo `api-client.ts` nhưng logic refresh token lệch API contract và endpoint backend. |
| **T5: TenantContext** | **Đạt** | Nhận diện hostname, fallback localStorage, cập nhật CSS variables. |
| **T6: Auth Module & Guards** | **Đạt** | `LoginPage`, `useAuth`, `RequireAuth`, `auth-storage`. |
| **T7: AdminShell & Switcher** | **Đạt** | Sidebar, Header, TenantSwitcher trực quan, mobile drawer. |
| **T8: Categories Module** | **Đạt** | CRUD Category list, modal, query hook. |
| **T9: Articles Module** | **Thiếu** | List & CRUD cơ bản có, nhưng **chỉ dùng `<textarea>` thô sơ**, chưa có Rich Text Editor Canva-style như cam kết trong plan; sai endpoint upload ảnh. |
| **T10: Contacts & CRM** | **Đạt** | `ContactsListPage`, `CrmListPage` kết nối đúng API `/contacts`, `/crm/customers`. |
| **T11: Settings Module** | **Thiếu** | `GeneralSettingsPage` chỉ có các field cơ bản, chưa đầy đủ các tab Banner/SEO/Social như Laundry admin cũ. |
| **T12: Users Module** | **Đạt** | Quản lý tài khoản Admin/Staff, modal thêm/sửa, phân quyền. |
| **T13: Orders Module** | **Thiếu** | Đã phân nhánh Laundry vs Moving, nhưng endpoint chuyển nhà gọi `/moving/orders` (sai endpoint backend). |
| **T14: DashboardPage** | **Đạt** | Giao diện tổng quan thống kê, thẻ metrics theo tenant. |
| **T15: Backend Multi-Tenant** | **Thiếu** | **Báo cáo sai thực tế**: Backend chưa hề được sửa để đọc `x-tenant-id`. Backend hiện tại tách riêng `modules/laundry/` và `modules/moving/`. |
| **T16: Dockerfile Nginx** | **Đạt** | Multi-stage build Node Alpine -> Nginx Alpine. |
| **T17: docker-compose.yml** | **Đạt** | Thêm service `fe-react-thanhxuan-admin` port 3003. |
| **T18: Nginx VPS Conf** | **Đạt** | Đã soạn cấu hình mẫu reverse proxy cho 2 subdomain. |
| **T19: Typecheck & Build** | **Đạt** | `tsc --noEmit` và `vite build` 100% pass (12.06s). |
| **T20: Tài liệu 5 trụ cột** | **Đạt** | Đã tạo `srs_sdd_fe_admin.md`, cập nhật `CODEBASE_ATLAS.md`, `SRS_SDD.md`, `CHANGELOG.md`. |

---

## 3. Danh sách Phát hiện (Findings)

| ID | Mức độ | Vị trí (path:line) | Vấn đề | Hướng xử lý |
| :--- | :--- | :--- | :--- | :--- |
| **R1** | **Blocker** | `be-nestjs-thanhxuan/` | **Chưa triển khai hỗ trợ Multi-Tenant trên Backend (T15 ảo)**: Backend NestJS hiện chưa có Guard/Interceptor đọc header `x-tenant-id`. Toàn bộ controller CMS (`/articles`, `/categories`, `/settings`) chỉ truy vấn CSDL `laundry_express`. Mảng Chuyển Nhà (`moving`) đang có các controller riêng nằm tại tiền tố `api/v1/moving/` (CSDL `moving_express`). Khi frontend chọn tenant `moving`, gọi `/articles` vẫn ra bài viết giặt là. | Lập một Task/Plan Backend riêng để: hoặc (1) tạo Interceptor/Service định tuyến database theo `x-tenant-id`, hoặc (2) frontend gọi đúng route tương ứng (`/articles` cho laundry, `/api/v1/moving/articles` cho moving). |
| **R2** | **Major** | `fe-react-thanhxuan-admin/src/lib/api-client.ts:70-87` | **Lệch Contract API Refresh Token**: Gọi `${API_BASE}/api/admin/auth/refresh` (Backend là `/api/auth/refresh`), chỉ gửi `{ refreshToken }` (Backend `RefreshTokenDto` bắt buộc có cả `userId`), và đọc `resData?.accessToken` (Backend trả về `access_token` snake_case). | Cập nhật URL thành `/auth/refresh`, gửi kèm `userId` (lấy từ auth-storage) và đọc đúng trường `access_token`. |
| **R3** | **Major** | `fe-react-thanhxuan-admin/src/features/articles/articles.service.ts:33` | **Sai endpoint Upload ảnh Media**: `articles.service.ts` gọi POST `/media/upload`. Backend thực tế là POST `/upload/image` (thuộc `UploadController`). | Đổi endpoint sang `/upload/image` với field FormData tên là `file`. |
| **R4** | **Major** | `fe-react-thanhxuan-admin/src/features/orders/OrdersListPage.tsx:21` | **Sai endpoint Đơn chuyển nhà**: Gọi `/moving/orders` nhưng backend controller đăng ký tại `/api/v1/moving/quotes`. | Đổi endpoint cho tenant moving thành `/v1/moving/quotes`. |
| **R5** | **Major** | `fe-react-thanhxuan-admin/src/features/articles/ArticleEditorPage.tsx:195-204` | **Thiếu Rich Text Editor Canva-style**: Trang soạn thảo chỉ dùng `<textarea>` thô sơ, chưa đưa bộ soạn thảo Rich Text hoàn chỉnh từ Laundry sang như cam kết T9. | Mang component `RichTextEditorComponent` từ laundry sang thư mục `components/ui/rich-text-editor/` của admin. |
| **R6** | **Major** | `fe-react-thanhxuan-admin/src/` (toàn dự án) | **Chưa gọi thông báo Toast**: Đã cấu hình Sonner `<Toaster />` tại `RootLayout` nhưng không có mutation nào gọi `toast.success()` hay `toast.error()`. Người dùng không nhận được feedback khi lưu thành công. | Bổ sung `toast.success('...')` và `toast.error(...)` vào các mutation/form submit. |
| **R7** | **Minor** | `fe-react-thanhxuan-admin/tsconfig.tsbuildinfo` | **Commit file build cache vào Git**: File `tsconfig.tsbuildinfo` bị commit trong `14d68cf`. | Bổ sung `*.tsbuildinfo` vào `.gitignore` và chạy `git rm --cached tsconfig.tsbuildinfo`. |
| **R8** | **Minor** | `fe-react-thanhxuan-admin/.env.example` | **Thiếu file `.env.example`**: Thiếu tài liệu biến môi trường `VITE_API_URL`. | Tạo file `.env.example` mẫu. |

---

## 4. Kết quả Verification

| Lệnh kiểm thử | Kết quả | Khớp với báo cáo của Executor? |
| :--- | :--- | :--- |
| `cd fe-react-thanhxuan-admin && pnpm exec tsc --noEmit` | **PASS (0 errors)** | Khớp |
| `cd fe-react-thanhxuan-admin && pnpm run build` | **PASS (12.06s, gzip ~510KB)** | Khớp |
| Kiểm tra vi phạm `any` | **PASS (0 phát hiện)** | Khớp |
| Kiểm tra giới hạn file < 300 dòng | **PASS (100% file < 300 dòng)** | Khớp |
| Kiểm tra Backend `x-tenant-id` (T15) | **FAIL (Backend chưa hỗ trợ)** | **Không khớp (Executor tick xong khi chưa làm)** |

---

## 5. Kiểm tra tài liệu (5 Trụ cột)

- `srs_sdd_fe_admin.md`: Đã tạo mới đầy đủ.
- `CODEBASE_ATLAS.md`: Đã cập nhật mục 2.4 Cổng Quản trị Admin.
- `SRS_SDD.md`: Đã thêm dòng tóm tắt Document History và mục phân hệ 05.
- `CHANGELOG.md`: Đã ghi nhật ký Plan 66.
- `DATABASE_DICTIONARY.md`: Không có thay đổi Schema Mongoose (hợp lệ không cần sửa).

---

## 6. Open Questions

1. **Về định tuyến dữ liệu Multi-Tenant:**
   - Hướng A: Nên cập nhật Backend NestJS để các controller `/api/articles`, `/api/categories`, `/api/settings` tự động đọc header `x-tenant-id` và chuyển hướng kết nối Mongoose giữa `laundry_express` và `moving_express`?
   - Hướng B: Hay giữ nguyên kiến trúc Backend hiện tại (Moving có controller riêng tại `/api/v1/moving/*`), và Frontend Admin sẽ cấu hình service gọi đường dẫn tương ứng theo tenant đang chọn?

---

## 7. Verdict & Bước Tiếp Theo

- **Verdict:** **Request changes** (Do tồn tại 1 Blocker R1 về Multi-tenant Backend và 5 lỗi Major R2-R6 về API contract / chức năng).
- **Đề xuất bước tiếp theo:**
  1. Tiến hành sửa ngay các lỗi Frontend (R2: refresh token, R3: upload media, R4: quotes moving, R6: toast notification, R7: `.gitignore`).
  2. Bàn bạc lựa chọn Hướng A hoặc Hướng B cho việc xử lý dữ liệu Multi-Tenant giữa Backend và Frontend.
