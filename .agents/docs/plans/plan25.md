# Kế hoạch Triển khai (Plan 25): Đồng Nhất Thư Viện Ảnh Phiếu, Khắc Phục Lỗi Load Ảnh Kho & Nâng Cấp Luồng Shipper

> **Mục tiêu:**
> 1. Khắc phục triệt để lỗi không load được ảnh phiếu ở Thư viện ảnh phiếu Kho Sạch (`/operations/warehouse-manager/warehouse`).
> 2. Đồng bộ hóa phân tab qua URL Query Param (`?tab=...`) cho trang Warehouse (`CLEAN_PLAN`, `SUMMARY`, `SLIP_GALLERY`) và Shipper (`ROUTE`, `HISTORY`).
> 3. Sửa lỗi các nút Đếm thay, Phóng to, Tải ảnh trên thẻ Lộ trình Shipper; nâng cấp giao diện Đếm thay giống hệt bên Partner (`?tab=COUNT`).
> 4. Trau chuốt component phóng to phiếu dùng chung `SlipFullscreenViewerModal` (zoom đa cấp, pan cuộn mượt, touch mobile, phím tắt).
> 5. Xây dựng component Thư viện ảnh phiếu dùng chung `HandoverSlipGalleryComponent` hợp nhất cả 3 phân hệ (Kho, Đối tác, Shipper).

---

## 1. Phân tích Hiện trạng & Nguyên nhân Gốc (Root Cause)

### 1.1. Lỗi không load được ảnh phiếu ở Warehouse (`/operations/warehouse-manager/warehouse`)
- **Backend:** [handover-record.service.ts:785-808](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts#L785-L808)
  - Bộ lọc cứng: `slipImageUrl: { $exists: true, $ne: null, $nin: ['', null] }` làm mất các phiếu chưa kịp upload Cloudinary.
  - Bộ lọc `brand`: Khi tạo phiếu, schema `HandoverRecord` không lưu snapshot `brand`, khiến query `{ brand: 'PIZZA_4PS' }` trả về mảng rỗng `[]`.
  - Bộ lọc ngày: Mặc định frontend lấy `toDate = today`. Khi thủ kho lên đơn ngày mai (`targetDate = tomorrow`), phiếu bị lọc ra ngoài khoảng ngày.
- **Frontend so sánh:** [PartnerHistoryTabComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerHistoryTabComponent.tsx) bên Partner load được vì gọi `GET /handover?partnerId=...` và luôn có cơ chế render trực tiếp ra Canvas xem phiếu kể cả khi chưa có ảnh Cloudinary.

### 1.2. URL chưa đồng bộ Query Param (`?tab=...`)
- [WarehousePage.tsx:33-35](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/WarehousePage.tsx#L33-L35) dùng `useState` nội bộ, reload trang hoặc chuyển trang mất tab.
- [HandoverListPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverListPage.tsx) chưa có query param `?tab=ROUTE` và `?tab=HISTORY`.

### 1.3. Lỗi các nút trên thẻ lộ trình Shipper
- [ShipperHandoverItemCardComponent.tsx:518](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperHandoverItemCardComponent.tsx#L518) gọi hàm `handleDownloadSlipImage` chưa hề được định nghĩa.
- Nút phóng to chỉ mở dialog xem ảnh tĩnh, không zoom/pan.
- Giao diện đếm thay inline hiện tại sơ sài, thiếu tính năng nhập biểu thức, thiếu bảng/thẻ trực quan và chưa đồng bộ với trải nghiệm chuẩn tại [PartnerCountTabComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerCountTabComponent.tsx).

---

## 2. Kế hoạch Thực hiện Chi tiết

### Bước 1: Khắc phục Backend API Thư viện ảnh phiếu
- File: [handover-record.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts)
- [x] Cập nhật `getSlipGallery`:
  - Khi lọc theo `brand`: Tìm danh sách `partnerIds` thuộc brand đó và truy vấn `$or: [{ brand }, { partnerId: { $in: partnerIds } }]`.
  - Không loại bỏ phiếu nếu record có dữ liệu clean/dirty hợp lệ (cho phép fallback hiển thị).
  - Snapshot `brand` và `partnerName` khi tạo phiếu tại `createRecord` và `createOrUpdatePrepOrder`.
  - Cấp quyền `HANDOVER_PARTNER_COUNT` và `PARTNER_VIEW` cho vai trò `SHIPPER` trong `permissions.map.ts`.
  - Hỗ trợ cả 2 route `@Get(['catalogs', 'item-catalogs'])` trong `partners.controller.ts`.

### Bước 2: Trau chuốt component phóng to dùng chung `SlipFullscreenViewerModal`
- File: [SlipFullscreenViewerModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/SlipFullscreenViewerModal.tsx)
- [x] Nâng cấp UI/UX:
  - Thanh công cụ nổi (Floating Pill Toolbar): Zoom In (+), Zoom Out (-), Đặt lại 100%, Xoay ảnh/Tải ảnh, Nút Đóng.
  - Hỗ trợ cuộn pan mượt mà trên Mobile (`touch-pan`), Double-tap để zoom 175%, phím tắt `Esc` tự động đóng, nút tải ảnh an toàn.
  - Hỗ trợ render cả URL Cloudinary lẫn Base64 Canvas data URL.

### Bước 3: Xây dựng Component Thư viện ảnh phiếu dùng chung `HandoverSlipGalleryComponent`
- File mới: `fe-react-thanhxuan-internal/src/features/operations/handovers/components/HandoverSlipGalleryComponent.tsx`
- [x] Hợp nhất các tính năng tốt nhất từ cả 3 màn hình:
  - Hỗ trợ 3 chế độ (`mode: 'WAREHOUSE' | 'PARTNER' | 'SHIPPER'`).
  - Bộ lọc thông minh: Thương hiệu (tự ẩn nếu mode=PARTNER), Chi nhánh (tự ẩn nếu mode=PARTNER), Khoảng ngày (mặc định từ 7/14 ngày trước đến ngày hôm nay), Tìm kiếm mã phiếu.
  - Lưới hiển thị Card đồng nhất, hiển thị ảnh Cloudinary hoặc fallback tạo phiếu xem nhanh qua Canvas.
  - Nút **Xem phóng to** (kết nối `SlipFullscreenViewerModal`), nút **Tải ảnh**, nút **Xem chi tiết / In A4**.
- [x] Tích hợp vào:
  - [WarehousePage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/WarehousePage.tsx) (tab `SLIP_GALLERY`).
  - [PartnerPortalPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/PartnerPortalPage.tsx) (tab `HISTORY`).
  - [HandoverListPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverListPage.tsx) (tab `HISTORY`).

### Bước 4: Đồng bộ Query Param `?tab=...` cho WarehousePage và HandoverListPage
- [x] [WarehousePage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/WarehousePage.tsx):
  - Dùng `useSearchParams` để quản lý `tab`: `CLEAN_PLAN` | `SUMMARY` | `SLIP_GALLERY`.
  - Tự động fallback về `CLEAN_PLAN` nếu URL không hợp lệ.
- [x] [HandoverListPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverListPage.tsx):
  - Dùng `useSearchParams` để quản lý `tab`: `ROUTE` | `HISTORY`.
  - Hiển thị tab bar rõ ràng, hỗ trợ chuyển đổi mượt mà.

### Bước 5: Nâng cấp luồng Lộ trình Shipper & Modal Đếm thay đối tác
- [x] [ShipperHandoverItemCardComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperHandoverItemCardComponent.tsx):
  - Sửa nút **Tải ảnh**: Viết hàm `handleDownloadSlipImage` an toàn, tải ảnh phiếu về máy kèm toast thông báo, có fallback khi gặp CORS.
  - Sửa nút **Phóng to**: Mở `SlipFullscreenViewerModal`.
  - Sửa nút **Đếm thay**: Mở modal chuyên dụng [ShipperCountPartnerModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/ShipperCountPartnerModal.tsx).
- [x] [ShipperCountPartnerModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/ShipperCountPartnerModal.tsx):
  - Tái cấu trúc chuẩn chỉnh theo giao diện của [PartnerCountTabComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerCountTabComponent.tsx):
    * Khung cố định khóa 3 trường (Thương hiệu, Chi nhánh, Ngày giao) chuẩn style gradient.
    * Chuyển đổi Dạng Thẻ / Dạng Bảng.
    * Hỗ trợ gõ biểu thức thông minh (`12 34`, `10+5`).
    * Bàn ký tên điện tử có nút ký lại, preview phiếu in A4 tức thì qua Canvas.

### Bước 6: Kiểm thử & Nghiệm thu
- [x] Chạy typecheck trên cả Backend và Frontend:
  - `pnpm exec tsc --noEmit` tại `be-nestjs-thanhxuan`: Passed
  - `pnpm exec tsc --noEmit` tại `fe-react-thanhxuan-internal`: Passed (0 errors)
- [x] Chạy build frontend: `pnpm build` tại `fe-react-thanhxuan-internal`: Passed.
- [x] Kiểm tra các đường dẫn đồng bộ:
  - `http://localhost:3001/operations/warehouse-manager/warehouse?tab=SLIP_GALLERY`
  - `http://localhost:3001/operations/partner-manager/partner?tab=HISTORY`
  - `http://localhost:3001/operations/shipper/handover?tab=ROUTE` & `?tab=HISTORY`
- [x] Cập nhật tài liệu kỹ thuật SRS/SDD, CODEBASE_ATLAS & CHANGELOG.
