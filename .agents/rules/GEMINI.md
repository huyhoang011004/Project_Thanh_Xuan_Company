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

## 2. 6 Phân Hệ Vận Hành Nội Bộ Cốt Lõi (Internal Operations)

1. **Phiếu Giao Nhận Kép (`handover`):**
   - Lập & sửa phiếu giao nhận đồ sạch (`PrepOrderModal`) xuất xưởng với mã chuẩn `GN-YYYYMMDD-NNN`.
   - Quy trình giao nhận 2 chiều giữa xưởng và đối tác: Thủ kho soạn đồ sạch $\rightarrow$ Tài xế giao đồ sạch, nhận đồ bẩn $\rightarrow$ Quản lý đối tác ký số xác nhận $\rightarrow$ Về xưởng trạm rạch bao đếm lại (`RecountStationPage`).
   - Thư viện ảnh phiếu (`HandoverSlipGalleryComponent`) lọc linh hoạt từ đầu tháng đến ngày mai, hỗ trợ kiểm nhận sớm ca đêm 21h-24h.
2. **Công Thợ Theo Giờ (`piecework` / HourlyWork):**
   - Chuyển đổi toàn diện từ khoán sản lượng cũ sang mô hình tính tiền công theo giờ: $\text{thành tiền} = (\text{phút} / 60) \times \text{đơn giá cơ sở} \times \text{hệ số khâu}$.
   - 7 khâu công việc chuẩn: Rũ đồ (x1.2), Giặt & Sấy (x1.3), Gấp (x1.0), Đếm/Phân loại (x1.1), Là/Ủi (x1.2), Đóng gói (x1.0), Khác (x1.0).
   - Ràng buộc ca làm việc đang mở (`OPEN` trong `AttendanceRecord`).
   - Màn hình trạm thợ trực quan: [HourlyWorkStationPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/piecework/HourlyWorkStationPage.tsx).
   - Màn hình quản lý xét duyệt: [HourlyWorkReviewPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/piecework/HourlyWorkReviewPage.tsx).
3. **Điểm Danh Chấm Công (`attendance`):**
   - Thợ xưởng chấm công chụp ảnh camera selfie xác thực ca làm việc.
   - Tự động check-in ca làm việc cho Tài xế xe tải khi ký xác nhận phiếu giao nhận đầu tiên trong ngày.
   - Màn hình quản lý xem xét và chốt công thợ: `AttendanceReviewPage.tsx`.
4. **Chi Phí Nhiên Liệu Xe Tải (`fuel`):**
   - Tài xế gửi đề xuất đổ xăng kèm chụp ảnh đồng hồ công-tơ-mét (ODO) và hóa đơn: [ShipperFuelPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/fuel/ShipperFuelPage.tsx).
   - Quản lý và Kế toán thẩm định, phê duyệt và thanh toán chi phí: `FuelReviewPage.tsx`.
5. **Quản Trị Đối Tác & Bảng Giá B2B (`partners`):**
   - Quản lý hồ sơ đối tác doanh nghiệp, chuỗi nhà hàng, khách sạn lớn và mạng lưới chi nhánh.
   - Danh mục bảng giá đồ giặt [item_catalogs](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md) chuẩn hóa 8 trường cốt lõi (`priceToCustomer`, không còn rate thợ cũ).
   - Màn hình quản trị: [PartnersManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/partners/PartnersManagementPage.tsx).
6. **Lương Chu Kỳ & Báo Cáo Tối Ưu VPS (`payroll` & `reports`):**
   - Tự động tổng hợp bảng lương nhân viên từ giờ công thợ, ngày công điểm danh và phụ cấp.
   - Bảo mật tài chính đa tầng: Interceptor bóc tách trường lương với user thiếu quyền `pay.view`.
   - Streaming Excel/PDF tối ưu bộ nhớ VPS (< 512MB RAM), hàng đợi concurrency = 1.

---

## 3. Bản Đồ Tài Liệu Kỹ Thuật (Modular Architecture Docs)

Hệ thống tài liệu kỹ thuật được module hóa và cập nhật liên tục (Living Architecture Docs):

- **Tài liệu tổng quan hệ thống:** [.agents/docs/SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) (System Context, Topology kết nối, Master Index, Conventions).
- **Phân hệ Backend API:** [.agents/docs/srs_sdd/srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md) (3 Database, Repository Pattern, API Contracts, Guards, Interceptors).
- **Phân hệ Web Khách Hàng & CMS:** [.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md) (RSC SEO, Leads CRM, CMS Quản trị bài viết).
- **Phân hệ Cổng Vận Hành Xưởng:** [.agents/docs/srs_sdd/srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md) (PWA Mobile-First, Canvas Signature, Offline Queue, Flat Colocation).
- **Từ Điển Dữ Liệu Toàn Diện:** [.agents/docs/DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md) (34+ collection thuộc 3 DB, chi tiết kiểu dữ liệu, index, quan hệ và tác dụng nghiệp vụ).
- **Bản Đồ Định Vị Mã Nguồn:** [.agents/docs/CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md) (Chỉ mục tra cứu tức thì: Endpoint $\leftrightarrow$ Controller $\leftrightarrow$ Service $\leftrightarrow$ Schema $\leftrightarrow$ Route $\leftrightarrow$ Page).
- **Nhật Ký Tiến Hóa Kỹ Thuật:** [.agents/docs/CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md) (Lưu vết bài luận chi tiết toàn bộ các Plan và Bugfix).

