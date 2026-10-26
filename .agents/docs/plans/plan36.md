# Kế Hoạch Kỹ Thuật (Plan 36): Chuẩn Hóa Kiến Trúc Handovers & Partners và Đồng Bộ Frontend với Backend Internal

## 1. Bối Cảnh & Đánh Giá Hiện Trạng

### 1.1. Hiện trạng đối chiếu giữa Backend và Frontend
Backend `be-nestjs-thanhxuan/src/modules/internal` được chia tách rõ ràng theo từng Domain cốt lõi:
- `handovers/`: Quản lý toàn bộ vòng đời phiếu giao nhận kép (`handover_records` collection) qua các endpoint `/handover/*`.
- `partners/`: Quản lý danh mục đối tác chi nhánh (`partners`), bảng giá đồ vải (`item_catalogs`), và thương hiệu (`brands`).
- `attendance/`: Quản lý điểm danh ca làm việc (`attendance_records`).
- `piecework/`: Quản lý công thợ theo giờ và hệ số khâu (`hourly_work_daily_logs`, `job_coefficient_settings`).
- `fuel/`: Quản lý chi phí xăng dầu xe tải (`fuel_expense_records`).
- `payroll/`: Quản lý bảng lương chu kỳ (`payroll_records`).
- `reports/`: Streaming báo cáo Excel/PDF và phân tích điều hành.
- `auth/`: Quản lý tài khoản nội bộ (`accounts`), phê duyệt đăng ký (`approvals`), và nhật ký (`audit_logs`).

### 1.2. Vấn đề phát hiện tại Frontend (`fe-react-thanhxuan-internal`)
1. **Lệch vị trí nghiêm trọng tại `src/features/operations/partners`:**
   - Thư mục này chứa `PartnerPortalPage.tsx` cùng các sub-components (`PartnerCountTabComponent`, `PartnerReceiptTabComponent`, `PartnerHistoryTabComponent`, ...) và hooks (`usePartnerCountFlow`, `usePartnerReceiptFlow`).
   - **Bản chất thực tế:** 100% các thao tác này (nhà hàng đếm đồ bẩn, ký nhận đồ sạch, tra cứu lịch sử phiếu, xem thư viện ảnh) là **trạm thứ 3 của quy trình Giao Nhận Kép** và đều thao tác với bảng `handover_records` qua API `/handover/*`. Nó hoàn toàn thuộc về phân hệ **`handovers`**!
   - Trong khi đó, toàn bộ nghiệp vụ của module `partners` (quản lý đối tác, bảng giá món giặt, thương hiệu) đã được đặt chuẩn xác tại `src/features/management/partners` (`PartnersManagementPage.tsx`).
   - Việc để một thư mục `operations/partners` tạo ra sự nhập nhằng và vi phạm nguyên tắc thiết kế Single Responsibility & Domain-Driven Colocation.
2. **Rà soát các thư mục khác:**
   - `attendance`: `operations/attendance` (thợ check-in) $\leftrightarrow$ `management/attendance` (quản lý duyệt công) $\rightarrow$ **Chuẩn 100%**.
   - `piecework`: `operations/piecework` (thợ ghi công giờ) $\leftrightarrow$ `management/piecework` (quản lý duyệt công giờ) $\rightarrow$ **Chuẩn 100%**.
   - `fuel`: `operations/fuel` (tài xế gửi đề xuất đổ xăng) $\leftrightarrow$ `management/fuel` (kế toán duyệt xăng) $\rightarrow$ **Chuẩn 100%**.
   - `payroll`: `operations/payroll` (nhân viên xem lương) $\leftrightarrow$ `management/payroll` (kế toán chốt bảng lương) $\rightarrow$ **Chuẩn 100%**.
   - `reports`: `operations/reports` $\rightarrow$ **Chuẩn 100%**.
   - `auth`: `management/auth` (quản lý nhân sự, duyệt đăng ký, audit log) $\rightarrow$ **Chuẩn 100%**.
3. **Vi phạm quy tắc TypeScript Strict tại `StaffManagementPage.tsx`:**
   - Tại dòng 115 và dòng 132 của `StaffManagementPage.tsx`, xuất hiện kiểu `any` (`mutationFn: async (payload: any)` và `updateAccountMutation`). Cần khai báo interface/type tường minh.

---

## 2. Mục Tiêu Kỹ Thuật

1. **Quy tụ trọn vẹn 4 trạm Giao Nhận Kép vào `src/features/operations/handovers`:**
   - Trạm 1 (Thủ kho): `WarehouseHandoverPage.tsx`
   - Trạm 2 (Tài xế xe tải): `ShipperHandoverPage.tsx`
   - Trạm 3 (Nhà hàng đối tác): `PartnerHandoverPage.tsx` (chuyển từ `PartnerPortalPage.tsx`)
   - Trạm 4 (Thợ xưởng rạch bao): `RecountStationPage.tsx`
2. **Chuyển các sub-components & hooks của cổng đối tác vào `handovers`:**
   - Di chuyển components: `PartnerCountTabComponent`, `PartnerReceiptTabComponent`, `PartnerReceiptItemsTableComponent`, `PartnerReceiptSignatureSectionComponent`, `PartnerReceiptSlipPreviewComponent`, `PartnerHistoryTabComponent`, `PartnerStaffTabComponent` $\rightarrow$ `features/operations/handovers/components/`.
   - Di chuyển hooks: `usePartnerCountFlow.ts`, `usePartnerReceiptFlow.ts` $\rightarrow$ `features/operations/handovers/hooks/`.
3. **Dọn dẹp triệt để thư mục `features/operations/partners`:**
   - Cập nhật import trong các wrapper pages: `src/app/(internal)/operations/partner-manager/partner/page.tsx` và `partner-staff/partner/page.tsx`.
   - Cập nhật barrel export `features/operations/handovers/index.ts` và `features/operations/index.ts`.
   - Xóa bỏ thư mục cũ `features/operations/partners`.
4. **Loại bỏ `any` tại `StaffManagementPage.tsx`:**
   - Định nghĩa DTO / Interface tường minh cho `CreateAccountPayload` và `UpdateAccountPayload`.

---

## 3. Các Bước Thực Thi Chi Tiết

- [ ] **Bước 1: Di chuyển các files từ `operations/partners` sang `operations/handovers`**
  - Di chuyển `PartnerPortalPage.tsx` $\rightarrow$ `src/features/operations/handovers/PartnerHandoverPage.tsx`.
  - Di chuyển components sang `src/features/operations/handovers/components/`.
  - Di chuyển hooks sang `src/features/operations/handovers/hooks/`.
  - Cập nhật các đường dẫn import nội bộ giữa các file vừa di chuyển.

- [ ] **Bước 2: Cập nhật Barrel Exports & Router**
  - Cập nhật `src/features/operations/handovers/components/index.ts` và `src/features/operations/handovers/hooks/index.ts`.
  - Cập nhật `src/features/operations/handovers/index.ts` để export `PartnerHandoverPage` (và alias `PartnerPortalPage`).
  - Cập nhật `src/features/operations/index.ts` (loại bỏ export `./partners`).
  - Cập nhật 2 wrapper pages:
    - `src/app/(internal)/operations/partner-manager/partner/page.tsx`
    - `src/app/(internal)/operations/partner-staff/partner/page.tsx`
  - Xóa bỏ thư mục cũ `src/features/operations/partners`.

- [ ] **Bước 3: Khắc phục lỗi `any` trong `StaffManagementPage.tsx`**
  - Khai báo kiểu `CreateAccountPayload` và `UpdateAccountPayload` theo model `StaffUser` / `StaffRole`.
  - Đảm bảo 100% không còn `any` trong file.

- [ ] **Bước 4: Kiểm thử và Verify**
  - Chạy `pnpm exec tsc --noEmit` tại `fe-react-thanhxuan-internal`.
  - Chạy `pnpm build` tại `fe-react-thanhxuan-internal`.
  - Kiểm tra các liên kết trong codebase atlas và SRS/SDD.

- [ ] **Bước 5: Commit & Push**
  - Tự động commit và push lên nhánh `dev` của `fe-react-thanhxuan-internal` và root repository.

---

## 4. Định Nghĩa Hoàn Thành (DoD)
- Không còn thư mục `features/operations/partners`.
- Toàn bộ nghiệp vụ giao nhận 4 trạm nằm trọn vẹn trong `features/operations/handovers`.
- Phân hệ `features/management/partners` là nơi duy nhất quản lý dữ liệu đối tác (`partners`, `item_catalogs`, `brands`).
- 0 lỗi compile TypeScript, 0 lỗi build production, 0 `any`.
