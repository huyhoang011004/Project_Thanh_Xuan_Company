# Kế Hoạch 29: Chuẩn Hóa Bộ Lọc Ngày & Tái Cấu Trúc Trải Nghiệm Tạo/Sửa Phiếu Giao Nhận

> **Phân hệ thực thi:** `fe-react-thanhxuan-internal`  
> **Mục tiêu:** Đáp ứng toàn diện các cải tiến trải nghiệm người dùng theo nghiệp vụ thực tế xưởng giặt và đối tác:
>
> 1. Bộ lọc mặc định từ ngày đầu tháng đến ngày mai (hôm nay + 1) cho tất cả các tab Lịch sử / Thư viện ảnh phiếu (`Warehouse`, `Shipper`, `Partner`).
> 2. Tab Kiểm Nhận Đối Tác (`PartnerPortalPage` - `tab=RECEIPT`): Tự động chọn ngày hôm sau (ngày hiện tại + 1) khi truy cập trong khung giờ đêm 21h00 - 23h59.
> 3. Tab Kho Sạch (`WarehousePage` - `tab=CLEAN_PLAN`):
>    - Đổi tên toàn bộ thuật ngữ từ "Soạn đồ / Soạn đồ sạch" thành **"Tạo phiếu giao nhận"** / **"Phiếu giao nhận"**.
>    - Danh sách phiếu mặc định hiển thị ngày hiện tại + 1 (`getTomorrowVN()`), tích hợp thanh chọn ngày linh hoạt.
>    - Đổi nút "Nhập đồ sạch sẽ giao" thành **"Sửa phiếu giao nhận"**.
>    - Hợp nhất form sửa phiếu sử dụng chung modal chuẩn [PrepOrderModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx), tự động nạp toàn bộ dữ liệu đồ vải, số lượng, nợ cũ, chữ ký đã lưu trước đó.

---

## 1. Hiện Trạng & Vấn Đề Kỹ Thuật

### 1.1. Bộ lọc ngày tại Thư viện ảnh phiếu (`HandoverSlipGalleryComponent.tsx`)

- Hiện tại dòng [39-47](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/components/HandoverSlipGalleryComponent.tsx#L39-L47):
  ```ts
  const today = getTodayVN();
  const defaultFrom = getDateKeyVN(new Date(), -defaultDays); // mặc định lùi 14 ngày
  const [fromDate, setFromDate] = useState<string>(defaultFrom);
  const [toDate, setToDate] = useState<string>(today);
  ```
  => Chưa đáp ứng yêu cầu: Kho và tài xế thường xuất nhập phiếu cho ngày mai hoặc cần đối soát trọn vẹn từ ngày đầu tháng đến ngày hiện tại + 1.

### 1.2. Tab Kiểm nhận Đối tác (`PartnerPortalPage.tsx`)

- Dòng [259](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/PartnerPortalPage.tsx#L259):
  `const [currentReceiptDate, setCurrentReceiptDate] = useState<string>(getTodayVN());`
  => Khi nhà hàng kiểm nhận ca đêm (21h00 - 23h59), đồ sạch nhận vào chuẩn bị cho hoạt động của ngày hôm sau (phiếu mang ngày mai). Hiện tại state đang cứng theo `getTodayVN()`.
- Dòng [275](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/PartnerPortalPage.tsx#L275):
  `history.find((h) => h.dateKey === currentReceiptDate || h.date === currentReceiptDate)`
  => Thiếu trường chuẩn `h.recordDate` của Schema V2, khiến một số phiếu mới tạo không tìm thấy.

### 1.3. Tab Soạn đồ kho (`WarehousePage.tsx` & `WarehouseCleanPlanTabComponent.tsx`)

- Dòng [49-57](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/WarehousePage.tsx#L49-L57):
  Lấy danh sách phiếu cố định theo `today`, không có bộ chọn ngày để thủ kho xem trước hoặc soạn bù cho các ngày khác.
- Dòng [129 & 173-272](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/components/WarehouseCleanPlanTabComponent.tsx#L129):
  Nút bấm ghi "Nhập Đồ Sạch Sẽ Giao", khi click mở một inline modal đơn sơ gọi API cũ `/clean-plan` thay vì gọi modal chuẩn [PrepOrderModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx).
- Thuật ngữ "Soạn đồ" / "Soạn đồ sạch" chưa đồng bộ với danh từ nghiệp vụ chính thống: **"Phiếu Giao Nhận"** / **"Tạo Phiếu Giao Nhận"** / **"Sửa Phiếu Giao Nhận"**.

---

## 2. Kế Hoạch Triển Khai Chi Tiết

### Task 1: Bổ sung Helper Ngày Tháng trong `src/lib/utils.ts`

- [x] Bổ sung helper `getFirstDayOfMonthVN(date?: Date | string): string`: Trả về ngày đầu tiên của tháng theo định dạng `YYYY-MM-01` theo múi giờ `Asia/Ho_Chi_Minh`.
- [x] Đảm bảo `getTomorrowVN()` hoạt động chuẩn xác theo múi giờ `Asia/Ho_Chi_Minh`.

### Task 2: Chuẩn Hóa Bộ Lọc Thư Viện Ảnh Phiếu (`HandoverSlipGalleryComponent.tsx`)

- [x] Sửa giá trị khởi tạo của `fromDate` và `toDate`:
  - `fromDate`: Mặc định là ngày đầu tháng hiện tại `getFirstDayOfMonthVN()`.
  - `toDate`: Mặc định là ngày mai `getTomorrowVN()` (tức ngày hiện tại + 1).
- [x] Áp dụng đồng bộ cho cả 3 nơi gọi component:
  - `http://localhost:3001/operations/warehouse-manager/warehouse?tab=SLIP_GALLERY`
  - `http://localhost:3001/operations/shipper/handover?tab=HISTORY`
  - `http://localhost:3001/operations/partner-manager/partner?tab=HISTORY`

### Task 3: Tự Động Hóa Ca Đêm Tab Kiểm Nhận Đối Tác (`PartnerPortalPage.tsx`)

- [x] Khởi tạo `currentReceiptDate`: Sử dụng `getTargetRecordDateVN()` (đã có sẵn logic nếu 21h00 - 23h59 thì lấy ngày mai, ngược lại lấy ngày hôm nay).
- [x] Cập nhật logic tìm `currentReceiptRecord`: Tìm theo `h.recordDate === currentReceiptDate || h.dateKey === currentReceiptDate || h.date === currentReceiptDate`.
- [x] Bổ sung nhãn thông báo trực quan khi hệ thống tự động chuyển sang ngày mai vào ca đêm để người dùng nắm rõ.

### Task 4: Nâng Cấp `PrepOrderModal.tsx` Hỗ Trợ Chế Độ Sửa Phiếu Giao Nhận

- [x] Bổ sung prop `initialRecord?: HandoverRecord | null` vào `PrepOrderModalProps`.
- [x] Khi có `initialRecord`:
  - Chuyển tiêu đề modal thành: **"Sửa Phiếu Giao Nhận [Mã Phiếu]"**; nút submit thành **"Cập Nhật Phiếu Giao Nhận"**.
  - Tự động nạp: `selectedBrand` từ `initialRecord.brand`, `selectedPartnerId` từ `initialRecord.partnerId`, `targetDate` từ `initialRecord.recordDate`.
  - Điền sẵn số lượng các chiếc từ `initialRecord.cleanClothes?.items` (gồm `deliveryQuantity`, `undeliveredQuantity`, `quantityReturned`, `note`).
  - Điền sẵn chữ ký thủ kho đã lưu từ `initialRecord.signatures?.warehouseManager?.signature`.

### Task 5: Cải Tiến Giao Diện & Bộ Chọn Ngày Tab Kho (`WarehousePage.tsx` & `WarehouseCleanPlanTabComponent.tsx`)

- [x] Trong `WarehousePage.tsx`:
  - Chuyển `selectedDate` mặc định thành `getTomorrowVN()` (ngày hiện tại + 1).
  - Tích hợp thanh điều khiển chọn ngày (Hôm nay, Ngày mai, Ngày trước, Ngày sau, ô chọn ngày DatePicker).
  - Đổi tên tab: "Soạn Đồ Sạch" $\rightarrow$ **"Phiếu Giao Nhận"**.
  - Đổi nút Action Bar: "Soạn Đồ" $\rightarrow$ **"Tạo Phiếu Giao Nhận"**.
  - Quản lý state `editingRecord: HandoverRecord | null` để truyền vào `PrepOrderModal`.
- [x] Trong `WarehouseCleanPlanTabComponent.tsx`:
  - Đổi nút "Nhập Đồ Sạch Sẽ Giao" / "Cập Nhật Đồ Sạch" thành **"Sửa Phiếu Giao Nhận"**.
  - Khi click nút "Sửa Phiếu Giao Nhận", kích hoạt mở `PrepOrderModal` với `initialRecord={record}`.
  - Xóa bỏ form modal inline cũ không còn sử dụng.
  - Cập nhật toàn bộ text hướng dẫn, tiêu đề, empty state sang thuật ngữ "Phiếu Giao Nhận".

---

## 3. Tiêu Chí Nghiệm Thu (Definition of Done)

1. Truy cập `?tab=SLIP_GALLERY` (Kho) và `?tab=HISTORY` (Shipper, Partner): Bộ lọc hiển thị từ ngày đầu tháng đến ngày hiện tại + 1.
2. Truy cập `?tab=RECEIPT` (Partner) sau 21h00: Ngày hiển thị tự động chuyển sang ngày mai.
3. Truy cập `?tab=CLEAN_PLAN` (Kho):
   - Mặc định xem danh sách phiếu của ngày mai.
   - Có thể chọn ngày khác mượt mà qua bộ lọc ngày.
   - Nút hành động đổi thành "Sửa Phiếu Giao Nhận", mở modal hiển thị đầy đủ dữ liệu đã tạo trước đó để chỉnh sửa.
4. `pnpm exec tsc --noEmit` pass 100%, `pnpm build` pass 100%.
5. Tự động commit và push code lên nhánh `dev`.

---

## 4. Execution Log

- **Trạng thái:** Done (2026-10-15)
- **Thực thi:**
  - Task 1: Thêm helper `getFirstDayOfMonthVN` vào `src/lib/utils.ts`.
  - Task 2: Cập nhật `HandoverSlipGalleryComponent.tsx`: `fromDate` = `getFirstDayOfMonthVN()`, `toDate` = `getTomorrowVN()`.
  - Task 3: Cập nhật `PartnerPortalPage.tsx`: `currentReceiptDate` = `getTargetRecordDateVN()`, tìm theo `recordDate`.
  - Task 4: Nâng cấp `PrepOrderModal.tsx`: nhận `initialRecord`, tự điền dữ liệu cũ khi sửa phiếu.
  - Task 5: Cập nhật `WarehousePage.tsx` & `WarehouseCleanPlanTabComponent.tsx`: mặc định ngày mai, thêm bộ lọc ngày, đổi tên sang Phiếu Giao Nhận và tích hợp sửa phiếu.
- **Verification:** `tsc --noEmit` pass 100%, `pnpm build` pass 100%.
