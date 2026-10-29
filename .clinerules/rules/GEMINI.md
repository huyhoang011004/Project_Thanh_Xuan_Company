# GEMINI.md - Hệ sinh thái Thanh Xuân Laundry

Tài liệu định hướng tổng quan nghiệp vụ hệ sinh thái. Các quy tắc code bắt buộc, lệnh verify và quy trình chi tiết xem tại `AGENTS.md`.

## 1. Nghiệp vụ cốt lõi

Website và hệ thống quản trị của Công ty Giặt Sấy Thanh Xuân gồm 3 ứng dụng trong cùng Monorepo:
- `be-nestjs-thanhxuan/`: Backend API tập trung (NestJS, MongoDB Multi-Database: `laundry_express`, `moving_express`, `internal_express`).
- `fe-nextjs-thanhxuan-laundry/`: Website khách hàng `(public)` và CMS `(admin)/admin` (Next.js App Router).
- `fe-react-thanhxuan-internal/`: Cổng vận hành xưởng và điều phối đối tác (React + Vite SPA).

**Tích hợp ở Backend:** JWT Auth (phân biệt `aud`), Nodemailer (SMTP), Cloudinary, Zalo OA, AI (Gemini/OpenAI).

**4 Phân hệ vận hành nội bộ:**
1. **Phiếu Giao Nhận Kép (`handover`)**: Điều phối xe nhận hàng, kiểm kê, bàn giao đồ giặt đối tác.
2. **Khoán Việc & Năng Suất (`piecework`)**: Chấm công theo sản lượng giặt/ủi từng thợ.
3. **Điểm Danh Chấm Công (`attendance`)**: Theo dõi ca làm và công thợ theo ngày.
4. **Quản Lý Đối Tác (`partners`)**: Thông tin, thương hiệu, danh mục đồ giặt (`item_catalogs`) và công nợ đối tác.

## 2. Bản đồ tài liệu kỹ thuật (Modular SRS & SDD)

- Tài liệu tổng thể: `.agents/docs/SRS_SDD.md` (System Context, Topology, Master Index, Conventions).
- Phân hệ Backend: `.agents/docs/srs_sdd/srs_sdd_backend.md` (3 DB, Repository Pattern, API Contracts, Guards).
- Phân hệ Web & CMS: `.agents/docs/srs_sdd/srs_sdd_fe_laundry.md, srs_sdd_fe_moving.md` (RSC SEO, Leads CRM, CMS Articles/Orders).
- Phân hệ Vận hành: `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` (Vận hành & Quản lý, Mobile PWA, Canvas, Offline Queue).
- Nhật ký thay đổi: `.agents/docs/CHANGELOG.md` (Lưu vết chi tiết theo từng Plan/Fix).

