# Kế Hoạch 31: Dọn Dẹp File Thừa Mồ Côi & Chuẩn Hóa Toàn Diện Tên Màn Hình Frontend Ánh Xạ Từ Backend

> **Phân hệ thực thi:** `fe-react-thanhxuan-internal/`  
> **Trạng thái:** `Done` (Hoàn thành: 2026-10-15)  
> **Tài liệu tham chiếu:** [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md), [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md), [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md)  
> **Mục tiêu:**
> 1. Xóa bỏ triệt để 6 file thừa / mồ côi (dead code) tích tụ qua các bản nâng cấp V1 $\rightarrow$ V2.
> 2. Chuẩn hóa tên các màn hình chính (`Page.tsx`) theo nguyên tắc ánh xạ 1-1 rõ ràng với 8 module Backend (`be-nestjs-thanhxuan/src/modules/internal`), nhìn tên file là biết ngay vai trò sử dụng và thuộc phân hệ nào.
> 3. Áp dụng chuẩn `HourlyWorkStationPage.tsx` và `HourlyWorkReviewPage.tsx` thay thế hoàn toàn thuật ngữ cũ `Piecework` cho phân hệ công thợ theo giờ.

---

## 1. Hiện Trạng & Vấn Đề Cần Giải Quyết

### 1.1. File Thừa / Mồ Côi (Dead Code)
Qua kiểm tra quét toàn diện thư mục `src/`, phát hiện 6 file không còn bất kỳ trang hay component nào sử dụng:
1. `src/features/management/reports/index.ts`: Thư mục rỗng chứa `export {};` thừa thãi.
2. `src/features/operations/piecework/components/ItemCounterCardComponent.tsx`: Component đếm sản lượng từng chiếc cũ, đã bị loại bỏ ở Plan 30 khi chuyển sang HourlyWork.
3. `src/features/operations/handovers/components/WarehouseSlipGalleryTabComponent.tsx`: Component 357 dòng cũ, đã được thay thế hoàn toàn bằng `HandoverSlipGalleryComponent.tsx` dùng chung.
4. `src/features/operations/handovers/components/WarehouseRecountQueueTabComponent.tsx`: Tab hàng đợi cũ của kho, đã được tách thành trang riêng `RecountStationPage.tsx`.
5. `src/features/operations/handovers/modals/CreateHandoverModal.tsx`: Modal tạo đơn V1 cũ, đã được thay bằng `PrepOrderModal.tsx`.
6. `src/features/auth/modals/RegisterModal.tsx`: Modal đăng ký cũ, hệ thống đã chuyển sang trang độc lập `RegisterPage.tsx`.

### 1.2. Bất Cập Về Cách Đặt Tên Màn Hình
- `WarehousePage.tsx`: Tên quá chung chung, dễ hiểu nhầm là quản lý kho hàng hóa. Bản chất là **Màn hình lập & điều phối phiếu giao nhận xuất kho của Thủ kho** $\rightarrow$ Chuẩn hóa thành `WarehouseHandoverPage.tsx`.
- `HandoverListPage.tsx`: Dễ hiểu nhầm là danh sách phiếu toàn hệ thống. Bản chất là **Màn hình giao nhận đồ sạch & nhận đồ bẩn của Tài xế xe tải (Shipper)** $\rightarrow$ Chuẩn hóa thành `ShipperHandoverPage.tsx`.
- `FuelPage.tsx`: Hơi ngắn. Bản chất là **Màn hình đề xuất chi phí xăng xe của Tài xế (Shipper)**, đối xứng với `FuelReviewPage.tsx` của Kế toán $\rightarrow$ Chuẩn hóa thành `ShipperFuelPage.tsx`.
- `PartnersPage.tsx`: Quản lý Đối tác, Thương hiệu & Danh mục Bảng giá $\rightarrow$ Chuẩn hóa thành `PartnersManagementPage.tsx`.
- `PieceworkStationPage.tsx` & `PieceworkConfirmPage.tsx`: Hệ thống vừa chuyển đổi sang mô hình tính giờ `HourlyWork` (Plan 30). Tên cũ `Piecework` gây nhầm lẫn là đếm sản lượng từng chiếc. Đồng thời trang duyệt công thợ dùng từ `Confirm` lệch pattern với `AttendanceReviewPage` và `FuelReviewPage` $\rightarrow$ Chuẩn hóa thành bộ đôi:
  * `HourlyWorkStationPage.tsx` (Trạm thợ ghi nhận giờ làm)
  * `HourlyWorkReviewPage.tsx` (Màn hình quản lý xét duyệt công thợ)

---

## 2. Kế Hoạch Triển Khai Chi Tiết (Plan 31)

### Giai Đoạn 1: Xóa Bỏ Triệt Để 6 File Thừa / Mồ Côi & Dọn Barrel Export
- [x] **Task 1.1: Xóa file thừa trong `piecework`:**
  - Xóa file `src/features/operations/piecework/components/ItemCounterCardComponent.tsx`.
  - Cập nhật `src/features/operations/piecework/components/index.ts` loại bỏ export `ItemCounterCardComponent`.
- [x] **Task 1.2: Xóa file thừa trong `handovers`:**
  - Xóa file `src/features/operations/handovers/components/WarehouseSlipGalleryTabComponent.tsx`.
  - Xóa file `src/features/operations/handovers/components/WarehouseRecountQueueTabComponent.tsx`.
  - Xóa file `src/features/operations/handovers/modals/CreateHandoverModal.tsx`.
  - Cập nhật `src/features/operations/handovers/components/index.ts` và `src/features/operations/handovers/modals/index.ts` loại bỏ các export tương ứng.
- [x] **Task 1.3: Xóa file thừa trong `auth` & `management/reports`:**
  - Xóa file `src/features/auth/modals/RegisterModal.tsx` và dọn `src/features/auth/modals/index.ts`.
  - Xóa file `src/features/management/reports/index.ts` (và dọn thư mục trống `management/reports/`).

---

### Giai Đoạn 2: Chuẩn Hóa Tên Màn Hình Theo Ánh Xạ Backend & Nhất Quán Nghiệp Vụ

- [x] **Task 2.1: Chuẩn hóa phân hệ Công Thợ (`piecework` $\rightarrow$ `hourly-work`):**
  - Đổi tên file:
    * `src/features/operations/piecework/PieceworkStationPage.tsx` $\rightarrow$ `src/features/operations/piecework/HourlyWorkStationPage.tsx`
    * `src/features/management/piecework/PieceworkConfirmPage.tsx` $\rightarrow$ `src/features/management/piecework/HourlyWorkReviewPage.tsx`
  - Cập nhật export trong:
    * `src/features/operations/piecework/index.ts` (export `HourlyWorkStationPage`)
    * `src/features/management/piecework/index.ts` (export `HourlyWorkReviewPage`)
    * `src/features/management/components/index.ts`
  - Cập nhật nơi sử dụng:
    * `src/app/(internal)/operations/worker/piecework/page.tsx`
    * `src/app/(internal)/management/manager/piecework/page.tsx`
    * `src/features/management/ManagementPage.tsx`
- [x] **Task 2.2: Chuẩn hóa phân hệ Giao Nhận (`handovers`):**
  - Đổi tên file:
    * `src/features/operations/handovers/WarehousePage.tsx` $\rightarrow$ `src/features/operations/handovers/WarehouseHandoverPage.tsx`
    * `src/features/operations/handovers/HandoverListPage.tsx` $\rightarrow$ `src/features/operations/handovers/ShipperHandoverPage.tsx`
  - Cập nhật export trong `src/features/operations/handovers/index.ts`.
  - Cập nhật nơi sử dụng:
    * `src/app/(internal)/operations/warehouse-manager/warehouse/page.tsx`
    * `src/app/(internal)/operations/shipper/handover/page.tsx`
- [x] **Task 2.3: Chuẩn hóa phân hệ Nhiên Liệu (`fuel`):**
  - Đổi tên file:
    * `src/features/operations/fuel/FuelPage.tsx` $\rightarrow$ `src/features/operations/fuel/ShipperFuelPage.tsx`
  - Cập nhật export trong `src/features/operations/fuel/index.ts`.
  - Cập nhật nơi sử dụng:
    * `src/app/(internal)/operations/shipper/fuel/page.tsx`
- [x] **Task 2.4: Chuẩn hóa phân hệ Đối Tác Quản Trị (`partners`):**
  - Đổi tên file:
    * `src/features/management/partners/PartnersPage.tsx` $\rightarrow$ `src/features/management/partners/PartnersManagementPage.tsx`
  - Cập nhật export trong `src/features/management/partners/index.ts` và `src/features/management/components/index.ts`.
  - Cập nhật nơi sử dụng:
    * `src/app/(internal)/management/manager/partner/page.tsx`

---

### Giai Đoạn 3: Verification & Đồng Bộ Tài Liệu (DoD)
- [x] **Task 3.1: Kiểm tra loại bỏ triệt để file re-export tạm thời:**
  - Đảm bảo 100% không còn alias hay bridge file tạm thời theo quy định tại Mục 4 và Mục 8 của `AGENTS.md`.
- [x] **Task 3.2: Verification:**
  - Chạy `pnpm exec tsc --noEmit` trên `fe-react-thanhxuan-internal` $\rightarrow$ Pass 0 lỗi.
  - Chạy `pnpm build` trên `fe-react-thanhxuan-internal` $\rightarrow$ Pass.
- [x] **Task 3.3: Đồng bộ tài liệu kỹ thuật:**
  - Cập nhật bảng chỉ mục file trong [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md).
  - Cập nhật phân hệ [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md).
  - Ghi nhật ký chi tiết vào [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).
  - Cập nhật 1 dòng Document History tại [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md).
- [x] **Task 3.4: Tự động commit và push:**
  - Commit và push code lên nhánh `dev` của kho mã nguồn tương ứng.

---

## 3. Bảng Ánh Xạ Tên Màn Hình Sau Khi Chuẩn Hóa

| Module Backend | Đường Dẫn Cũ | Đường Dẫn Mới Chuẩn Hóa | Ý Nghĩa Nghiệp Vụ & Vai Trò |
| :--- | :--- | :--- | :--- |
| `piecework` (HourlyWork) | `operations/piecework/PieceworkStationPage.tsx` | `operations/piecework/HourlyWorkStationPage.tsx` | Trạm thợ ghi nhận giờ làm theo 7 khâu việc |
| `piecework` (HourlyWork) | `management/piecework/PieceworkConfirmPage.tsx` | `management/piecework/HourlyWorkReviewPage.tsx` | Quản lý/Admin xét duyệt công thợ theo giờ |
| `handovers` | `operations/handovers/WarehousePage.tsx` | `operations/handovers/WarehouseHandoverPage.tsx` | Thủ kho lập & điều phối phiếu giao nhận xuất kho |
| `handovers` | `operations/handovers/HandoverListPage.tsx` | `operations/handovers/ShipperHandoverPage.tsx` | Tài xế nhận đơn, giao đồ sạch & nhận đồ bẩn |
| `fuel` | `operations/fuel/FuelPage.tsx` | `operations/fuel/ShipperFuelPage.tsx` | Tài xế gửi đề xuất đổ xăng kèm ảnh ODO |
| `partners` | `management/partners/PartnersPage.tsx` | `management/partners/PartnersManagementPage.tsx` | Quản trị Đối tác, Thương hiệu & Danh mục Bảng giá |

---

## 4. Execution Log
- **2026-10-15:**
  - Xóa 6 file dead code: `ItemCounterCardComponent.tsx`, `WarehouseSlipGalleryTabComponent.tsx`, `WarehouseRecountQueueTabComponent.tsx`, `CreateHandoverModal.tsx`, `RegisterModal.tsx`, `management/reports/index.ts`.
  - Đổi tên và chuẩn hóa 6 màn hình: `HourlyWorkStationPage.tsx`, `HourlyWorkReviewPage.tsx`, `WarehouseHandoverPage.tsx`, `ShipperHandoverPage.tsx`, `ShipperFuelPage.tsx`, `PartnersManagementPage.tsx`.
  - Cập nhật 100% các file tiêu thụ và barrel export, loại bỏ toàn bộ alias tạm thời (`PieceworkConfirmView`, v.v.).
  - Typecheck (`tsc --noEmit`) và Vite Build pass 100%.
  - Đồng bộ `CODEBASE_ATLAS.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`.
  - Tự động commit và push code lên nhánh `dev`.
