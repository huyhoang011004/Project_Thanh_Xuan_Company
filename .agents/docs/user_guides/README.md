# BỘ TÀI LIỆU HƯỚNG DẪN SỬ DỤNG CỔNG VẬN HÀNH NỘI BỘ B2B
## HỆ THỐNG ĐIỀU HÀNH XƯỞNG GIẶT LÀ CÔNG NGHIỆP & CHUỖI CUNG ỨNG THANH XUÂN

> **Phân hệ ứng dụng:** `fe-react-thanhxuan-internal` (Port `3001` - Mobile-First PWA)  
> **Địa chỉ truy cập nội bộ:** `noibo.thanhxuanlaundry.com`  
> **Mật khẩu khởi tạo chung:** `ThanhXuan@2026`  
> **Ngày cập nhật & Kiểm chuẩn:** 2026-10-29  
> **Định dạng:** Bộ cẩm nang tác nghiệp chuẩn hóa cho 8 nhóm đối tượng người dùng (Bao gồm định dạng Markdown `.md` cho lập trình viên và định dạng PDF `.pdf` chuẩn in ấn cho người dùng phổ thông)  
> 📥 **Tải về cẩm nang tổng quan dạng PDF:** [README.pdf](./README.pdf) (Hoặc xem từng file PDF chi tiết bên dưới)

---

## 1. MỤC ĐÍCH & Ý NGHĨA CỦA BỘ TÀI LIỆU

Hệ thống điều hành nội bộ của Công ty Thanh Xuân số hóa toàn diện quy trình cung ứng giặt là khép kín từ khâu thu gom tại đối tác nhà hàng, vận chuyển xe tải, xử lý 7 khâu sản xuất tại sàn xưởng, xuất kho sạch, nghiệm thu 2 chiều cho tới tính lương và quyết toán tài chính.

Bộ tài liệu này được biên soạn độc lập thành **8 cuốn cẩm nang chuyên biệt** cho từng vị trí công việc, đảm bảo:
- Mỗi nhân sự chỉ cần đọc đúng bản hướng dẫn của vị trí mình.
- Bám sát 100% giao diện thực tế, từng nút bấm, trường nhập liệu, modal và luồng thao tác.
- Tối ưu cho thiết bị di động (Mobile PWA) với các tính năng: Chụp ảnh camera selfie, định vị GPS xưởng, ký số Canvas, lưu trữ offline và xem ảnh phiếu Cloudinary phóng to đa cấp.
- Minh bạch tài chính, tiền công và trách nhiệm giữa các bộ phận.

---

## 2. MA TRẬN 8 VAI TRÒ & MỤC LỤC TRA CỨU NHANH

| STT | Mã Vai Trò | Tên Chức Danh Nghiệp Vụ | Đối Tượng Sử Dụng & Môi Trường | Bản Markdown (.md) | Bản PDF In Ấn / Tải Về (.pdf) |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **0** | **`OVERVIEW`** | **Tổng Quan Toàn Bộ Hệ Thống** | Ban Giám đốc & Toàn bộ cán bộ công nhân viên | 📋 [README.md](./README.md) | 📕 [README.pdf](./README.pdf) |
| **1** | **`ADMIN`** | **Quản Trị Viên Hệ Thống** | Ban Giám đốc & Kỹ thuật hệ thống (Desktop & Mobile) | 📘 [user_guide_admin.md](./user_guide_admin.md) | 📕 [user_guide_admin.pdf](./user_guide_admin.pdf) |
| **2** | **`MANAGER`** | **Quản Lý Xưởng Điều Hành** | Giám đốc xưởng, Quản đốc sản xuất (Ẩn 100% dữ liệu tiền lương) | 📙 [user_guide_manager.md](./user_guide_manager.md) | 📕 [user_guide_manager.pdf](./user_guide_manager.pdf) |
| **3** | **`WAREHOUSE_MANAGER`** | **Quản Lý Kho / Thủ Kho** | Thủ kho sạch xuất xưởng & Trạm đếm gom bao xưởng | 📦 [user_guide_warehouse_manager.md](./user_guide_warehouse_manager.md) | 📕 [user_guide_warehouse_manager.pdf](./user_guide_warehouse_manager.pdf) |
| **4** | **`ACCOUNTANT`** | **Kế Toán / Kế Toán Trưởng** | Kế toán tiền lương, chi phí xe, thù lao chuyến & doanh thu | 💵 [user_guide_accountant.md](./user_guide_accountant.md) | 📕 [user_guide_accountant.pdf](./user_guide_accountant.pdf) |
| **5** | **`SHIPPER`** | **Tài Xế Giao Nhận Xe Tải** | Đội ngũ tài xế xe tải (100% Mobile PWA trên đường chạy) | 🚚 [user_guide_shipper.md](./user_guide_shipper.md) | 📕 [user_guide_shipper.pdf](./user_guide_shipper.pdf) |
| **6** | **`WORKER`** | **Thợ Xưởng / Công Nhân** | Thợ giặt, sấy, rũ, ủi, gấp, đóng gói tại sàn sản xuất | ⏱️ [user_guide_worker.md](./user_guide_worker.md) | 📕 [user_guide_worker.pdf](./user_guide_worker.pdf) |
| **7** | **`PARTNER_MANAGER`** | **Quản Lý Đối Tác B2B** | Quản lý chi nhánh nhà hàng, khách sạn (Pizza 4P's, Haidilao...) | 🏢 [user_guide_partner_manager.md](./user_guide_partner_manager.md) | 📕 [user_guide_partner_manager.pdf](./user_guide_partner_manager.pdf) |
| **8** | **`PARTNER_STAFF`** | **Nhân Viên Đối Tác** | Nhân viên phục vụ, phụ bếp, thủ kho của đối tác | 📱 [user_guide_partner_staff.md](./user_guide_partner_staff.md) | 📕 [user_guide_partner_staff.pdf](./user_guide_partner_staff.pdf) |

---

## 3. SƠ ĐỒ PHỐI HỢP VẬN HÀNH TOÀN HỆ SINH THÁI

```mermaid
graph TD
    subgraph KHOI_DOI_TAC ["1. KHỐI ĐỐI TÁC NHÀ HÀNG / KHÁCH SẠN"]
        PM["Quản Lý Đối Tác (PARTNER_MANAGER)"]
        PS["Nhân Viên Đối Tác (PARTNER_STAFF)"]
        PS -- "Đếm đồ bẩn Auto-save onBlur" --> PM
        PM -- "Ký số giao đồ bẩn" --> SHIPPER
    end

    subgraph LOGISTICS ["2. ĐỘI VẬN CHUYỂN XE TẢI"]
        SHIPPER["Tài Xế Giao Nhận (SHIPPER)"]
        SHIPPER -- "Nhận đồ sạch giao quán" --> PS
        SHIPPER -- "Chở đồ bẩn về xưởng" --> RECOUNT
        SHIPPER -- "Nộp hóa đơn xăng / sửa xe" --> ACC
        SHIPPER -- "Nộp đơn xin nghỉ" --> MG
    end

    subgraph XUONG_SAN_XUAT ["3. SÀN SẢN XUẤT XƯỞNG GIẶT LÀ"]
        RECOUNT["Trạm Đếm Gom Bao Xưởng (Recount Station)"]
        WORKER["Thợ Xưởng (WORKER)"]
        WM["Thủ Kho (WAREHOUSE_MANAGER)"]
        
        RECOUNT -- "Phân loại đồ bẩn" --> WORKER
        WORKER -- "7 Khâu làm việc tính giờ thực" --> WM
        WM -- "Soạn đồ sạch & Render phiếu WebP" --> SHIPPER
    end

    subgraph BAN_DIEU_HANH ["4. BAN ĐIỀU HÀNH & KẾ TOÁN"]
        MG["Quản Lý Xưởng (MANAGER)"]
        ACC["Kế Toán (ACCOUNTANT)"]
        ADMIN["Quản Trị Viên (ADMIN)"]

        MG -- "Duyệt công thợ & Chấm công" --> WORKER
        MG -- "Chỉ định shipper thay thế" --> ACC
        ACC -- "Duyệt chi phí xe & Tính bảng lương" --> ADMIN
        ADMIN -- "Cấu hình xưởng, Đối tác & Khóa sổ lương" --> BAN_DIEU_HANH
    end
```

---

## 4. TÀI KHOẢN THỬ NGHIỆM MẪU (DEMO ACCOUNTS)

Trên màn hình đăng nhập (`/login`), hệ thống cung cấp lưới 8 nút đăng nhập nhanh 1 chạm cho các tài khoản mẫu:

| Tên Hiển Thị Trên Nút | Vai Trò (StaffRole) | Email Đăng Nhập | Mật Khẩu | Đặc Điểm Nhận Diện |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên** | `ADMIN` | `admin@thanhxuanlaundry.com` | `ThanhXuan@2026` | Toàn quyền 100% hệ thống, cấu hình GPS/Wi-Fi xưởng |
| **Quản lý Xưởng** | `MANAGER` | `manager@thanhxuanlaundry.com` | `ThanhXuan@2026` | Chỉ huy sàn sản xuất, duyệt công thợ (Bị ẩn bảng lương) |
| **Quản lý Kho** | `WAREHOUSE_MANAGER` | `warehouse@thanhxuanlaundry.com` | `ThanhXuan@2026` | Soạn đồ sạch xuất kho, thư viện ảnh phiếu & trạm đếm |
| **Kế toán** | `ACCOUNTANT` | `accountant@thanhxuanlaundry.com` | `ThanhXuan@2026` | Duyệt xăng xe, cài đơn giá khâu, tính lương chu kỳ |
| **Tài xế** | `SHIPPER` | `shipper@thanhxuanlaundry.com` | `ThanhXuan@2026` | Tuyến giao nhận, nhận chuyến, nộp xăng xe & xin nghỉ |
| **Thợ xưởng** | `WORKER` | `worker@thanhxuanlaundry.com` | `ThanhXuan@2026` | Chấm công camera selfie, đồng hồ đếm giờ 7 khâu |
| **QL Đối Tác** | `PARTNER_MANAGER` | `partner.manager@thanhxuanlaundry.com` | `ThanhXuan@2026` | Cổng đối tác B2B, đếm đồ bẩn, kiểm nhận đồ & duyệt NV |
| **NV Đối Tác** | `PARTNER_STAFF` | `partner.staff@thanhxuanlaundry.com` | `ThanhXuan@2026` | Đếm đồ bẩn, kiểm nhận đồ sạch của chi nhánh |

---

## 5. TÀI LIỆU THAM CHIẾU KIẾN TRÚC & HẠ TẦNG

- [Đặc tả yêu cầu & thiết kế phân hệ nội bộ (srs_sdd_fe_internal.md)](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md)
- [Bản đồ mã nguồn toàn hệ thống (CODEBASE_ATLAS.md)](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md)
- [Từ điển cơ sở dữ liệu toàn diện (DATABASE_DICTIONARY.md)](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md)
- [Kiến trúc tổng quan hệ sinh thái (SRS_SDD.md)](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md)

---

## 6. HƯỚNG DẪN TÁI TẠO BỘ TÀI LIỆU PDF

Khi có cập nhật nội dung trong các file Markdown, lập trình viên có thể tái kết xuất toàn bộ 9 bản PDF bằng một lệnh duy nhất:

```bash
# Chạy từ thư mục gốc của dự án
pnpm run docs:pdf
```

Script sẽ tự động:
1. Duyệt qua toàn bộ tài liệu Markdown trong thư mục `.agents/docs/user_guides/`.
2. Áp dụng bảng màu đặc trưng (Role Theme) và nhận diện thương hiệu Thanh Xuân Laundry.
3. Render trực tiếp các sơ đồ Mermaid thành đồ họa vector SVG sắc nét và công thức toán học KaTeX.
4. Đóng gói thành các file PDF khổ A4 chuẩn in ấn có phân trang và header/footer chuyên nghiệp.


