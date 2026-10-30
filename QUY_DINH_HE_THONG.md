# 📋 QUY ĐỊNH CODE & HƯỚNG DẪN VẬN HÀNH HỆ SINH THÁI WEBSITE THANH XUÂN

> **Nguồn kho lưu trữ**: [`git@github.com:huyhoang011004/Website_Thanh_Xuan_Company.git`](git@github.com:huyhoang011004/Website_Thanh_Xuan_Company.git)  
> **Nhánh phát triển chuẩn**: `dev`  
> **Đường dẫn thư mục quy định**: `/root/Website_Thanh_Xuan_Company` (hoặc `/root/quy-dinh-code`)  
> **Thư mục các website đang chạy thực tế**: `/root/services/thanhxuan`

---

## 1. Bản Đồ Ánh Xạ Giữa Quy Định Monorepo & Môi Trường Runtime VPS

Hệ sinh thái gồm 1 Backend tập trung và 3 Frontend độc lập được cấu hình đồng bộ:

| STT | Ứng Dụng | Đường Dẫn Chuẩn | Đường Dẫn Runtime VPS | Port | Container / Web Server | Domain Production | Trọng Tâm Nghiệp Vụ |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **01** | **Backend API Server** | `be-nestjs-thanhxuan/` | `/root/services/thanhxuan/backend-thanhxuan/` | `5001` | Docker `laundry_backend` | `api.thanhxuanlaundry.com` | API Gateway, Multi-DB MongoDB, RBAC 8 vai trò, Zalo OA, Gemini AI |
| **02** | **Web Giặt Là & CMS** | `fe-nextjs-thanhxuan-laundry/` | `/root/services/thanhxuan/thanhxuan-laundry/` | `3000` | Docker `laundry_frontend` | `thanhxuanlaundry.com` | Next.js 15 App Router RSC, SEO Google, Lead B2B, CMS Marketing |
| **03** | **Cổng Vận Hành Xưởng** | `fe-react-thanhxuan-internal/` | `/root/services/thanhxuan/thanhxuan-internal/` | `3001` | Nginx Static `/var/www/noibo/dist` | `noibo.thanhxuanlaundry.com` | PWA Mobile-First, Phiếu giao nhận kép, Ký số Canvas, Công thợ theo giờ |
| **04** | **Cơ Sở Dữ Liệu** | MongoDB 7.0 | Volume `mongodb_data` | `27017` | Docker `laundry_mongodb` | Localhost | 3 DB độc lập: `laundry_express`, `internal_express`, `moving_express` |

> [!NOTE]
> Để tương thích hoàn toàn giữa cấu trúc Monorepo trong quy định (`be-nestjs-thanhxuan`, `fe-nextjs-thanhxuan-laundry`, `fe-react-thanhxuan-internal`) và tên thư mục chạy thực tế (`backend-thanhxuan`, `thanhxuan-laundry`, `thanhxuan-internal`), các liên kết mềm (symlink) 2 chiều đã được thiết lập sẵn sàng. Bạn có thể dùng bất kỳ tên gọi nào.

---

## 2. Các Trụ Cột Quy Định Kỹ Thuật Bắt Buộc (Core Rules)

Toàn bộ quy định chi tiết nằm tại `.agents/rules/`:

### A. Quy Định Backend NestJS (`.agents/rules/backend.md`)
1. **Kiến trúc phân tầng nghiêm ngặt**: `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Model`. Tuyệt đối không `@InjectModel()` trực tiếp vào `Service` hay `Controller`. Mọi truy vấn database bắt buộc thông qua `Repository`.
2. **DTO & Validation**: Mọi `@Body()` bắt buộc dùng Class DTO với đầy đủ decorator validation. Cấm dùng kiểu `any`, `interface` thô hoặc `Partial<T>`.
3. **Múi giờ Việt Nam (`Asia/Ho_Chi_Minh` - GMT+7)**: Toàn bộ thời gian (chấm công, tính giờ công thợ, mã phiếu `GN-YYYYMMDD-NNN`, báo cáo) bắt buộc dùng helper `src/common/utils/date.util.ts`. Cấm dùng `setHours(0,0,0,0)` theo local VPS.
4. **Bảo mật**: Không bao giờ trả về trường nhạy cảm (`password`, `token`, `hash`). Query chỉ đọc bắt buộc có `.lean()`.

### B. Quy Định Frontend (`.agents/rules/frontend.md`)
1. **Next.js**: Mặc định Server Component (RSC) để tối ưu SEO Google; chỉ dùng `"use client"` ở các component lá khi cần state/event handler.
2. **React SPA Nội Bộ (PWA)**: Thiết kế **Mobile-First** cho thợ xưởng & tài xế. Kích thước nút bấm và touch target tối thiểu $\ge 44 \times 44\text{ px}$. Hỗ trợ offline queue qua IndexedDB và header `Idempotency-Key` (UUIDv4).
3. **UI/UX & Thẩm mỹ**: Dùng 100% tiếng Việt tự nhiên chuẩn nghiệp vụ ("Phiếu Giao Nhận", "Công Thợ Theo Giờ", "Đề Xuất Xăng Xe"). Sử dụng linh hoạt `shadcn/ui`, `TailwindCSS` và `lucide-react`. Luôn xử lý đủ 3 trạng thái: `loading` (Skeleton), `empty` (EmptyState), `error`.
4. **Quy tắc chia nhỏ file (DoD)**: Chủ động chia nhỏ file khi vượt quá 250-300 dòng (`[Tên]Page.tsx`, `modals/[Tên]Modal.tsx`, `components/[Tên]Component.tsx`, `hooks/use[Tên].ts`).

### C. Quy Chuẩn Git & An Toàn Môi Trường (`.agents/rules/AGENTS.md`)
1. **Bảo vệ nhánh `master`**: Không bao giờ commit hoặc push trực tiếp lên nhánh `master`. Mọi thay đổi phát triển/sửa lỗi phải commit và push lên nhánh `dev`.
2. **Quy chuẩn thông điệp commit**: Viết bằng tiếng Việt tự nhiên, giữ nguyên thuật ngữ kỹ thuật tiếng Anh (ví dụ: `fix(auth): sửa lỗi Guard kiểm tra audience JWT`, `feat(handover): thêm modal ký xác nhận phiếu`).
3. **Tuyệt đối cấm**: Không chạy lệnh phá hủy (`rm -rf`, `git reset --hard`, drop database), không đọc/in/sửa file `.env` chứa bí mật.

---

## 3. Bộ Lệnh Tiện Ích Toàn Cục (CLI Helpers)

Bạn có thể chạy các lệnh này từ **bất kỳ thư mục nào** trên máy chủ:

| Lệnh | Ý Nghĩa & Tác Dụng |
| :--- | :--- |
| `status-all` | Kiểm tra trạng thái runtime của tất cả Docker container, Nginx, MongoDB và HTTP endpoints. |
| `check-errors` | Chạy typecheck (`tsc --noEmit`) và lint cho toàn bộ 3 website (`backend`, `laundry`, `internal`). |
| `build-all` | Thử nghiệm biên dịch toàn bộ website để đảm bảo không có lỗi bundle/cú pháp trước khi deploy. |
| `deploy-internal` | 1-click build mã nguồn `thanhxuan-internal` và đồng bộ vào `/var/www/noibo/dist`, reload Nginx ngay lập tức. |
| `sync-rules` | Kéo bộ quy định code và tài liệu mới nhất từ nhánh `dev` của kho GitHub về máy chủ. |

---

## 4. Tài Liệu Nghiệp Vụ & Kiến Trúc Tra Cứu

Tất cả tài liệu được duy trì tự động đồng bộ tại `.agents/docs/`:
- **`SRS_SDD.md`**: Bản đặc tả kiến trúc tổng quan hệ thống.
- **`DATABASE_DICTIONARY.md`**: Từ điển chi tiết 34+ Collections MongoDB, quan hệ và kiểu dữ liệu.
- **`CODEBASE_ATLAS.md`**: Bản đồ định vị nhanh toàn bộ file mã nguồn theo route và endpoint.
- **`CHANGELOG.md`**: Nhật ký chi tiết các phiên bản và tính năng đã triển khai.
