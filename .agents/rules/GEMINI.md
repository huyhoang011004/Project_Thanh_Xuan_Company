# GEMINI.md - Hệ Sinh Thái Công Nghệ Thanh Xuân Company

Tài liệu định hướng tổng quan nghiệp vụ toàn hệ sinh thái. Các quy tắc code bắt buộc, lệnh verify, bảo mật và quy trình chi tiết xem tại `AGENTS.md`.

## 1. Nghiệp Vụ Cốt Lõi & Bối Cảnh Doanh Nghiệp

Công ty Thanh Xuân vận hành hệ sinh thái dịch vụ đa ngành kết hợp giữa tiếp thị trực tuyến và điều hành chuỗi cung ứng sản xuất thực tế, gồm 4 ứng dụng trong Monorepo:

- `be-nestjs-thanhxuan/`: Backend API tập trung (NestJS, 3 MongoDB độc lập: `laundry_express`, `moving_express`, `internal_express`, Port `5001`).
- `fe-nextjs-thanhxuan-laundry/`: Web Khách Hàng B2B & SEO Google + CMS Quản Trị Marketing (`thanhxuanlaundry.com`, Next.js App Router, Port `3000`).
- `fe-react-thanhxuan-internal/`: Cổng Vận Hành Xưởng & Quản Vận B2B PWA (`noibo.thanhxuanlaundry.com`, React + Vite SPA, Port `3001`).
- `fe-nextjs-chuyennhatietkiem/`: Web Dịch Vụ Chuyển Nhà Trọn Gói & Báo Giá Cước Xe Tải (`chuyennhatietkiem.vn`, Next.js App Router, Port `3002`).

**Tích hợp hạ tầng Backend:** JWT Auth (phân biệt `aud: 'internal'`), Nodemailer (SMTP), Cloudinary (Media/Chữ ký/Ảnh giao nhận), Zalo OA, AI (Gemini/OpenAI), Streaming Reports (Excel/PDF với concurrency = 1).

**Phân quyền RBAC 8 vai trò nội bộ:** `ADMIN`, `OPERATOR`, `MANAGER`, `WAREHOUSE_MANAGER`, `SHIPPER`, `WORKER`, `ACCOUNTANT`, `PARTNER`.

---

## 2. 6 Phân Hệ Vận Hành Nội Bộ Cốt Lõi (Chi tiết tại `srs_sdd_fe_internal.md`)

| Phân hệ | Nghiệp vụ cốt lõi | Màn hình / Component chính |
| :--- | :--- | :--- |
| **1. Giao nhận kép (`handover`)** | Mã `GN-YYYYMMDD-NNN`, quy trình 2 chiều xưởng - đối tác, ký số Canvas, trạm rạch bao đếm lại. | `PrepOrderModal.tsx`, `RecountStationPage.tsx`, `HandoverSlipGalleryComponent.tsx` |
| **2. Công thợ giờ (`piecework`)** | Tiền công = $(\text{phút} / 60) \times \text{đơn giá} \times \text{hệ số khâu}$ (7 khâu chuẩn: x1.0 - x1.3), ca làm việc `OPEN`. | `HourlyWorkStationPage.tsx`, `HourlyWorkReviewPage.tsx` |
| **3. Chấm công (`attendance`)** | Chụp selfie ca làm việc, tự động check-in tài xế xe tải khi ký phiếu đầu ngày. | `AttendanceStationPage.tsx`, `AttendanceReviewPage.tsx` |
| **4. Xăng xe (`fuel`)** | Đề xuất đổ xăng kèm ảnh ODO + hóa đơn, Quản lý/Kế toán duyệt và chi trả. | `ShipperFuelPage.tsx`, `FuelReviewPage.tsx` |
| **5. Đối tác B2B (`partners`)** | Quản lý đối tác/chi nhánh, bảng giá đồ giặt `priceToCustomer` chuẩn 8 trường. | `PartnersManagementPage.tsx` |
| **6. Lương & Báo cáo (`payroll`)** | Tổng hợp lương chu kỳ từ giờ công + ngày công, bảo mật `pay.view`, streaming Excel/PDF VPS. | `PayrollReviewPage.tsx`, `ReportsPage.tsx` |

---

## 3. Bản Đồ Tài Liệu Kỹ Thuật (Modular Architecture Docs)

Hệ thống tài liệu kỹ thuật được module hóa và cập nhật liên tục (Living Architecture Docs):

- **Tài liệu tổng quan hệ thống:** [.agents/docs/SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) (System Context, Topology kết nối, Master Index, Conventions).
- **Phân hệ Backend API (`be-nestjs-thanhxuan`):** [.agents/docs/srs_sdd/srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md) (Multi-Database, Repository Pattern, API Contracts, Guards, Interceptors).
- **Phân hệ Web Giặt Là & CMS (`fe-nextjs-thanhxuan-laundry`):** [.agents/docs/srs_sdd/srs_sdd_fe_laundry.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_laundry.md) (RSC SEO, Leads CRM, CMS Quản trị marketing & bài viết).
- **Phân hệ Web Chuyển Nhà Tiết Kiệm (`fe-nextjs-chuyennhatietkiem`):** [.agents/docs/srs_sdd/srs_sdd_fe_moving.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_moving.md) (RSC SEO, Estimator Cước Xe Tải, Wizard Đặt Lịch, Báo Giá Asset-Light).
- **Phân hệ Cổng Vận Hành Xưởng (`fe-react-thanhxuan-internal`):** [.agents/docs/srs_sdd/srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md) (PWA Mobile-First, Canvas Signature, Offline Queue, Flat Colocation).
- **Từ Điển Dữ Liệu Toàn Diện:** [.agents/docs/DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md) (34+ collection thuộc các DB độc lập, chi tiết kiểu dữ liệu, index, quan hệ và tác dụng nghiệp vụ).
- **Bản Đồ Định Vị Mã Nguồn:** [.agents/docs/CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md) (Chỉ mục tra cứu tức thì: Endpoint $\leftrightarrow$ Controller $\leftrightarrow$ Service $\leftrightarrow$ Schema $\leftrightarrow$ Route $\leftrightarrow$ Page).
- **Nhật Ký Tiến Hóa Kỹ Thuật:** [.agents/docs/CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md) (Lưu vết bài luận chi tiết toàn bộ các Plan và Bugfix).
