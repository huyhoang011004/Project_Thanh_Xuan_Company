# Review 3: Hệ Thống Giặt Là B2B & Quản Lý Vận Hành Xưởng Nội Bộ v2

> Plan: [.agents/docs/plan/plan3.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/plan/plan3.md) | Reviewed: 2026-10-04 | Base: `4bb4451` | Verdict: **Approve**

---

## 1. Tóm tắt

Thay đổi thực hiện trong Plan 3 là một đợt nâng cấp toàn diện và có quy mô lớn nhất của hệ thống, bao gồm từ Phase 0 đến Phase 6:
- Tái cấu trúc phân hệ nội bộ Backend (`internal_express`) thành 10 sub-modules chuẩn Clean Architecture & Repository Pattern.
- Thiết lập cơ chế xác thực đa tầng (8 vai trò RBAC, OTP email, Refresh Token Rotation, Khóa tài khoản chống brute-force).
- Nghiệp vụ giao nhận kép (Handover v2) với Khóa lạc quan `version`, 2 chế độ đếm (`ON_SITE` / `AT_FACTORY`), đếm lại tại xưởng (`recount_tasks`), ký Canvas, audit log & thông báo khi shipper sửa ô phiếu sau ký.
- Quản lý ca làm việc bằng camera selfie, tự động tính phút, rà soát ca quá 16h; Ghi sản lượng khoán snapshot đơn giá, chốt duyệt cuối ngày.
- Quản lý xăng xe, tính lương tự động 4 loại hình (`HOURLY`, `PIECEWORK`, `HYBRID`, `MONTHLY_FIXED`), đóng băng khi `LOCKED`, bảo mật xem phiếu lương cá nhân.
- 6 báo cáo phân tích MongoDB aggregation và xuất file streaming XLSX/PDF với hàng đợi concurrency = 1.
- Bảo mật tài chính tối cao: `PayFieldFilterInterceptor` tại Backend và `permissions.ts` tại Frontend bóc tách 100% trường tiền tệ đối với vai trò `MANAGER` và `WAREHOUSE_MANAGER`.
- Xây dựng hoàn chỉnh ứng dụng Frontend PWA (`fe-react-thanhxuan-internal`) hỗ trợ Service Worker caching và hàng đợi ngoại tuyến IndexedDB (`idb`) với `Idempotency-Key`.

Đánh giá chung: **Chất lượng code xuất sắc, tuân thủ nghiêm ngặt các quy tắc kiến trúc, kiểm thử đơn vị bao phủ toàn diện (191 tests pass 100%), build production hoàn hảo không lỗi.**

---

## 2. Đối chiếu với Plan

| Task | Hạng mục | Trạng thái | Ghi chú đối chiếu |
| :--- | :--- | :---: | :--- |
| **0.1 - 0.3** | Baseline, Backup & Biến môi trường | **Đạt** | Đã cấu hình `.env.example`, kịch bản seed và migrate v1 sang v2 an toàn |
| **1.1 - 1.4** | Core Module (Audit, Idempotency, Schedule) | **Đạt** | Interceptor Idempotency-Key UUID, AuditLog toàn hệ thống, Cron jobs 00:05 & 00:30 |
| **2.1 - 2.8** | Accounts & Auth v2 (8 vai trò RBAC, OTP, Lock, Approvals) | **Đạt** | Phân quyền 8 vai trò, JWT `aud: 'internal'`, OTP 60s cooldown, khóa 15p khi sai 5 lần, Refresh Token xoay vòng 7 ngày |
| **3.1 - 3.8** | Handover v2 (Kép, Versioning, Recount, Edit-marks, Monthly) | **Đạt** | Optimistic lock `version`, 2 chế độ đếm, ký Canvas, yêu cầu đếm lại, lịch sử tháng nhà hàng ẩn đơn giá |
| **4.1 - 4.5** | Chấm công selfie, Sản lượng snapshot, Xăng xe, Bảng lương 4 loại hình | **Đạt** | Check-in camera selfie, tính phút chuẩn xác, snapshot đơn giá catalog, hoàn xăng kèm 2 ảnh bắt buộc, tính lương 4 pay_type, bảo mật payslips cá nhân |
| **5.1 - 5.2** | 6 Báo cáo Aggregation & Streaming Export XLSX/PDF | **Đạt** | 6 báo cáo aggregate, giới hạn khoảng ngày ≤ 31, ExcelJS streaming, PDFMake, ExportQueue concurrency = 1, ẩn tiền với MG/WM |
| **6a.1 - 6a.3** | Nền tảng PWA, Auth UI, Router RBAC | **Đạt** | VitePWA precache workbox, IndexedDB offline queue, Idempotency-Key headers, Modal đăng ký/OTP/quên mật khẩu, chuông thông báo 60s polling |
| **6b** | Màn hình Nhà hàng & Kho xưởng | **Đạt** | Đếm đồ bẩn + ký canvas, kiểm nhận đồ sạch 3 trạng thái (ENOUGH/SHORT/EXCESS), soạn đồ sạch kho, hàng đợi đếm lại |
| **6c** | Màn hình Tài xế & Hoạt động Giao nhận | **Đạt** | Phân chia 2 cột danh sách, nhãn chế độ đếm tự động, modal yêu cầu đếm lại, xuất ảnh phiếu Canvas + ZIP + Web Share API, nộp xăng xe |
| **6d** | Thợ xưởng, Bảng lương & Quản trị điều hành | **Đạt** | Selfie check-in/out, trạm ghi sản lượng lớn, phiếu lương cá nhân kỳ LOCKED, duyệt công/sản lượng, xuất báo cáo. **Hoàn toàn ẩn tiền với MG/WM** |
| **6e** | Production Build & Chunk Splitting | **Đạt** | `tsc -b && vite build` tạo bundle tĩnh `dist/` tách chunk rõ ràng, Service Worker PWA hoàn chỉnh |

*File ngoài phạm vi plan:* Không có (0 scope creep).  
*Deviations:* Không có sai lệch tiêu cực nào so với bản thiết kế.

---

## 3. Danh Sách Phát Hiện (Findings)

| ID | Mức độ | Vị trí (path:line) | Vấn đề | Hướng xử lý đề xuất |
| :--- | :---: | :--- | :--- | :--- |
| **R1** | **Minor** | [`be-nestjs-thanhxuan/src/modules/internal/handover/handover.service.spec.ts:272`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handover/handover.service.spec.ts#L272) | Trong file test spec, dùng `StaffRole.WAREHOUSE` thay vì `StaffRole.WAREHOUSE_MANAGER` và mock `sendToRole` không có trong interface `NotificationsService` khi chạy `tsc` toàn bộ repo. | Cập nhật `StaffRole.WAREHOUSE_MANAGER` và loại bỏ property mock thừa trong file spec. |
| **R2** | **Minor** | [`be-nestjs-thanhxuan/src/modules/internal/fuel/fuel.service.spec.ts:53`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/fuel.service.spec.ts#L53) | Type `jest.Mocked<Partial<FuelLogRepository>>` khiến lệnh `tsc` toàn repo báo thiếu thuộc tính `mockImplementation` trên kiểu hàm gốc. | Khai báo mock theo dạng `(fuelRepo.create as jest.Mock).mockImplementation(...)` để TypeScript strict nhận diện chính xác. |
| **R3** | **Minor** | [`fe-nextjs-thanhxuan-laundry/node_modules`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry) | Gặp lỗi Windows File Lock `ERR_PNPM_PACKAGE_MANAGER_REMOVE_MODULES_DIR` khi chạy lệnh pnpm do tiến trình dev server của ứng dụng web đang mở. | Tắt tiến trình dev server trước khi chạy pnpm install/clean trên môi trường Windows. |

*Không có phát hiện nào ở mức **Blocker** hoặc **Major**.*

---

## 4. Kết Quả Verification

| Lệnh kiểm chứng | Kết quả | Khớp với báo cáo của Executor? |
| :--- | :---: | :---: |
| `be-nestjs-thanhxuan: node ./node_modules/typescript/bin/tsc -p tsconfig.build.json --noEmit` | **PASS (Exit code 0, 0 errors)** | Khớp 100% |
| `be-nestjs-thanhxuan: pnpm test` | **PASS (43 test suites, 191 tests passed, 0 failed)** | Khớp 100% |
| `fe-react-thanhxuan-internal: pnpm run build (tsc -b && vite build)` | **PASS (Exit code 0, bundle dist/ & sw.js tạo thành công)** | Khớp 100% |

---

## 5. Kiểm Tra Tài Liệu

- [x] Tài liệu kiến trúc [`.agents/docs/SRS_SDD.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) và [`docs/SRS_SDD.md`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/docs/SRS_SDD.md) đã được cập nhật lên phiên bản `2.1`, phản ánh chính xác commit `4bb4451`.
- [x] Mục 1.2 đã mô tả đầy đủ 7 phân hệ chức năng mới.
- [x] Mục 2.2, 2.3, 2.4 đã liệt kê đầy đủ 17 MongoDB Collections, 10 Sub-modules, 16 Repositories.
- [x] Mục 2.5 đã chuẩn hóa bảng 45+ API contracts với đầy đủ Guards, Roles và ràng buộc bảo mật bóc tách trường tiền tệ.
- [x] Document History đã ghi nhận chi tiết lịch sử cho các Phase 2, 3, 4, 5, 6 và Docs-sync.

---

## 6. Open Questions

1. **Chuẩn bị chuyển sang Phase 7 (Mảng Chuyển Nhà)**:
   - Các API Backend cho mảng Chuyển nhà (`/api/v1/moving/quotes`, `/services`, `/articles`) đã sẵn sàng.
   - Tiếp tục triển khai ứng dụng `fe-nextjs-chuyennhatietkiem` (hoặc cấu hình lại ứng dụng chuyển nhà theo yêu cầu).
2. **Kế hoạch triển khai Phase 8 (Vận hành Docker & VPS)**:
   - Kiểm tra thông số tài nguyên VPS thực tế để tối ưu giới hạn bộ nhớ RAM trong `docker-compose.yml` (MongoDB: 800MB, Backend: 512MB, Frontend Laundry: 250MB, Frontend Internal: tĩnh qua Nginx).

---

## 7. Verdict & Bước Tiếp Theo

* **Verdict:** **APPROVE** (Đạt chuẩn nghiệm thu, không có Blocker/Major).
* **Đề xuất bước tiếp theo:** Người dùng có thể tiến hành commit các thay đổi của Plan 3 lên git, sau đó chuyển tiếp sang triển khai **Phase 7 (Mảng Chuyển Nhà)** hoặc **Phase 8 (Docker, Nginx & Vận hành VPS)** theo lộ trình.
