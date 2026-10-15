# NHẬT KÝ THAY ĐỔI HỆ THỐNG (CHANGELOG)

Tài liệu ghi nhận toàn bộ lịch sử tiến hóa, các giai đoạn nâng cấp, bugfix và triển khai tính năng của Hệ sinh thái Công ty Thanh Xuân qua từng Plan.

## 2026-10-15

### Fix: Xử Lý Triệt Để Lỗi 500 Khi Bấm "Lưu & Xem Phiếu Giao Nhận" Trong Soạn Đồ (`be-nestjs-thanhxuan`)
- **Nguyên nhân gốc rễ (Root Cause):**
  1. **MongoDB Atlas Duplicate Key Error (`E11000`):** Trên collection `handover_records` trong cơ sở dữ liệu `internal_express` vẫn còn sót lại index phức hợp `partnerId_1_dateKey_1_seq_1` từ kiến trúc V1 cũ (có cờ `unique: true`). Khi chuyển sang Schema V2, hệ thống dùng `recordDate` và `recordCode`, bỏ trường `dateKey` và `seq` (cả 2 giá trị này đều là `null`). Khi thủ kho tạo phiếu mới cho một chi nhánh đối tác đã có bản ghi trước đó, MongoDB bắt lỗi trùng khóa `dup key: { partnerId: ObjectId(...), dateKey: null, seq: null }` và trả về mã lỗi `E11000`, dẫn đến `AllExceptionsFilter` biến thành HTTP 500 Internal Server Error.
  2. **Lệch mapping DTO khi lưu đồ nợ/trả nợ:** DTO `PrepOrderDto` nhận `undeliveredQty` và `returnedDebtQty`, trong khi tầng Service đọc `it.undeliveredQuantity` và `it.quantityReturned`, khiến số lượng đồ chưa giao / giao trả nợ không được lưu vào CSDL.
  3. **Rủi ro ném ngoại lệ ép kiểu ObjectId:** `new Types.ObjectId(actor.sub)` và `new Types.ObjectId(partner.defaultShipperId)` chưa kiểm tra `Types.ObjectId.isValid()`, có thể gây lỗi BSONError nếu ID không hợp lệ.
- **Giải pháp xử lý:**
  - **Dọn dẹp Index CSDL thực tế:** Cập nhật script `drop-legacy-collections.ts` để tự động phát hiện và drop toàn bộ các index lỗi thời chứa trường cũ (`dateKey`, `seq`, `status`) trên collection `handover_records`:
    * Drop thành công index `partnerId_1_dateKey_1_seq_1` (triệt tiêu nguyên nhân chính gây lỗi 500).
    * Drop thành công index `partnerId_1_recordDate_1_seq_1`, `shipperId_1_dateKey_1`, `dateKey_-1`, `status_1`, `status_1_date_-1`.
    * Chạy script `pnpm run db:drop-legacy` trực tiếp trên MongoDB Atlas thành công.
  - **Tối ưu hóa `handover-record.service.ts`:**
    * Bổ sung kiểm tra an toàn `Types.ObjectId.isValid()` cho `warehouseManagerId` và `shipperId`.
    * Đồng bộ hóa mapping lấy đúng cả hai định dạng `undeliveredQuantity ?? undeliveredQty` và `quantityReturned ?? returnedDebtQty`.
  - **Kiểm thử & Nghiệm thu:**
    * Bổ sung unit test cho `createOrUpdatePrepOrder` trong [handover.service.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/specs/handover.service.spec.ts), 36/36 tests pass 100%.
    * Gọi kiểm thử thực tế `POST /handover/prep-order` tới Backend, API phản hồi thành công `200 OK` (mã phiếu sinh đúng chuẩn `GN-TT-15102026`).
    * Build pass 100% cho cả `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`.
    * Commit và push code lên nhánh `dev` thành công.

## 2026-10-13

### Plan 28: Chuẩn Hóa Toàn Diện Schema & Dọn Rác Dữ Liệu Các Bảng (Accounts, ItemCatalogs, HandoverRecords) (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)
- **Động lực & Vấn đề giải quyết:**
  - Sau quá trình rà soát CSDL và các Mongoose Schemas, phát hiện một số bảng vẫn tồn tại trường dữ liệu thừa, không đúng chuẩn hoặc lệch tên so với nghiệp vụ thực tế:
    1. Bảng `accounts`: Tồn tại cả 2 trường `role` và `roles: string[]` gây dư thừa dữ liệu (trong khi RBAC và Guard chỉ sử dụng `role: StaffRole`). Trường `pay_profile` bị gán mặc định `default: () => ({})` với 3 số 0 cho mọi tài khoản Quản lý/Đối tác, sinh rác dữ liệu không cần thiết.
    2. Bảng `item_catalogs`: Tồn đọng các trường khoán thợ cũ (`foldingRateWorker`, `ironingRateWorker`) trong MongoDB Atlas mặc dù công ty đã chuyển sang tính công thợ theo thời gian $\times$ hệ số loại việc (`hourly_work`). Schema cũ viết nhầm `customerPrice` trong khi báo cáo và interceptor sử dụng `priceToCustomer`. Bảng thiếu vị trí rõ ràng cho 2 trường cốt lõi `priceToCustomer` và `sortOrder`.
    3. Bảng `handover_records`: Mongoose tự động khởi tạo mảng `notes: []` rỗng cho mọi phiếu mới tạo nếu không khai báo `default: undefined`.
- **Backend API & CSDL MongoDB (`be-nestjs-thanhxuan`):**
  - **Chuẩn hóa Bảng `accounts` (`staff-account.schema.ts`):**
    * Xóa bỏ hoàn toàn trường `roles: string[]`, thống nhất sử dụng `role: StaffRole` làm Single Source of Truth duy nhất.
    * Bỏ giá trị khởi tạo rỗng `default: () => ({})` của `pay_profile`, chỉ lưu khi tài khoản thợ hoặc shipper có cấu hình lương thực tế.
    * Cập nhật `account-management.service.ts`, `account-auth.service.ts`, `account-seed.service.ts`: Bỏ gán `roles = [dto.role]`, map response `roles: [account.role]` để đảm bảo tương thích ngược.
    * Cập nhật `InternalJwtStrategy` và `PermissionsGuard` fallback tự động `user.roles || (user.role ? [user.role] : [])`.
  - **Chuẩn hóa Bảng `item_catalogs` (`item-catalog.schema.ts`):**
    * Chuẩn hóa hoàn chỉnh đúng **8 trường cốt lõi**: `itemCode`, `brand`, `name`, `unit`, `priceToCustomer`, `sortOrder`, `imageUrl`, `isActive`.
    * Đổi tên trường từ `customerPrice` sang `priceToCustomer` (đơn giá dịch vụ thu đối tác, VND, bảo mật qua `PayFieldFilterInterceptor` chỉ Admin/Kế toán thấy).
    * Bổ sung `priceToCustomer` vào `CreateItemCatalogDto` và `UpdateItemCatalogDto` cùng logic lưu/cập nhật tại `PartnersService`.
    * Đồng bộ hóa trực tiếp với `partner-report.service.ts`.
  - **Triệt tiêu mảng rỗng mặc định trong `handover_records` (`handover-record.schema.ts`):**
    * Khai báo `@Prop({ type: [HandoverItemNoteSchema], default: undefined }) notes?: HandoverItemNote[];` ngăn chặn Mongoose tự động sinh `notes: []`.
  - **Thực thi Dọn dẹp CSDL Thực tế (`drop-legacy-collections.ts`):**
    * Bổ sung script migration `$unset` cho các trường thừa: gỡ bỏ `roles` khỏi 8 tài khoản, gỡ bỏ `pay_profile` rỗng khỏi 6 tài khoản quản lý, gỡ bỏ `foldingRateWorker`, `ironingRateWorker`, `customerPrice` khỏi 14 món đồ giặt, và gỡ bỏ `notes: []` rỗng khỏi phiếu giao nhận.
    * Chạy lệnh `pnpm run db:drop-legacy` thành công 100% trên MongoDB Atlas.
- **Frontend Vận Hành (`fe-react-thanhxuan-internal`):**
  - Đồng bộ `AuthContext.tsx`: Fallback `roles: rawUser.roles || (rawUser.role ? [rawUser.role] : [])` trong cả hàm `fetchMe` và `login`.
  - Chuẩn hóa interface `ItemCatalog` trong `src/types/index.ts` ưu tiên `priceToCustomer` và `sortOrder`.
- **Tài liệu Kỹ thuật & Đồng bộ Hóa:**
  - Cập nhật mục 1.1 `accounts`, mục 1.7 `item_catalogs` (đúng 8 trường cốt lõi) và mục 1.8 `handover_records` trong [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md).
  - Cập nhật phân hệ [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md) và [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md).
  - Hoàn tất toàn bộ checklist trong [plan28.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/plans/plan28.md).
- **Kiểm thử & Nghiệm thu:**
  - `pnpm exec tsc --noEmit` pass 100% trên cả Backend và Frontend.
  - `pnpm build` pass 100% trên cả 2 ứng dụng (`be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`).
  - Dữ liệu MongoDB Atlas thực tế qua verification script hoàn toàn sạch sẽ, không còn trường thừa.

### Plan 27: Tinh Gọn Triệt Để Bản Ghi HandoverRecord - Loại Bỏ Lặp Base64 Chữ Ký & Mảng Mặc Định Rỗng (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)
- **Động lực & Vấn đề giải quyết:**
  - Sau khi loại bỏ trường `status` ở Plan 26, dữ liệu bản ghi `HandoverRecord` trong MongoDB Atlas vẫn còn bị phình to do nhân đôi chuỗi Base64 chữ ký (~30KB-50KB/bản ghi) tại cả `cleanClothes.preparedBySignature` và `signatures.warehouseManager.signature`.
  - Đồng thời, thông tin thủ kho bị lặp 3 nơi (`cleanClothes.preparedByName/warehouseManagerId`, `signatures.warehouseManager`, và root `warehouseManagerId/warehouseManagerName`).
  - Mongoose Schema có các giá trị khởi tạo rỗng mặc định khiến mọi document mới tạo tự động sinh `dirtyClothes: { items: [] }`, `notes: []`, `isRecount: false`, và `recount: { isRecount: false, status: 'NONE' }`.
- **Backend API & CSDL MongoDB (`be-nestjs-thanhxuan`):**
  - **Schema (`handover-record.schema.ts`):**
    * Tinh gọn sub-schema `CleanClothes`: chỉ còn duy nhất `items: CleanItemLine[]`. Loại bỏ hoàn toàn `preparedByName`, `preparedBySignature`, `warehouseManagerId`, `at`.
    * Chuẩn hóa `CleanItemLine`: bỏ `default: 0` của `undeliveredQuantity` và `quantityReturned` để không ép sinh giá trị 0 khi mới soạn đồ sạch.
    * Loại bỏ các giá trị `default` rỗng ở root document: `dirtyClothes` (bỏ `{ items: [] }`), `notes` (bỏ `[]`), `recount` (bỏ `{ isRecount: false, status: 'NONE' }`).
    * Loại bỏ cờ thừa `isRecount: boolean` ở root document (quản lý tập trung trong khối `recount`). Đánh index `sparse: true` cho `recount.isRecount` và `recount.status`.
  - **Services (`handover-record.service.ts` & `handover-flow.service.ts`):**
    * `createOrUpdatePrepOrder`, `createHandover`, `planScheduledHandovers`, `createPartnerCountRecord`: chỉ lưu danh sách đồ sạch vào `cleanClothes.items`. Chữ ký thủ kho được lưu duy nhất tại `signatures.warehouseManager = { name, signature, at }`.
    * Loại bỏ việc khởi tạo object/mảng rỗng khi tạo mới phiếu. Khi chưa phát sinh đồ bẩn, document hoàn toàn không có `dirtyClothes`. Khi chưa có ghi chú, document hoàn toàn không có `notes`. Khi chưa yêu cầu đếm lại, document hoàn toàn không có `recount`.
    * Hàm `updateShipperConfirm`: chỉ sinh khối `recount: { isRecount: true, status: 'PENDING' }` khi shipper thực sự tích chọn đếm lại.
  - **Script Dọn Dẹp CSDL Thực Tế (`drop-legacy-collections.ts`):**
    * Bổ sung `$unset` cho các trường thừa: `cleanClothes.preparedByName`, `cleanClothes.preparedBySignature`, `cleanClothes.warehouseManagerId`, `cleanClothes.at`, và `isRecount`.
    * Thêm logic quét và `$unset` cho các mảng rỗng `notes: []`, `dirtyClothes: { items: [] }` (khi không có partnerCount), và `recount: { isRecount: false }` hoặc `status: 'NONE'`.
    * Chạy script `pnpm run db:drop-legacy` thành công 100% trên cơ sở dữ liệu MongoDB Atlas thực tế.
- **Frontend Vận Hành (`fe-react-thanhxuan-internal`):**
  - Tinh gọn interface `CleanClothes` trong `src/types/index.ts` chỉ còn `items: CleanItemLine[]`.
  - Cập nhật `PartnerPortalPage.tsx`, `PartnerReceiptTabComponent.tsx`, `ShipperHandoverItemCardComponent.tsx`, và `HandoverExportHelper.ts` đọc chữ ký thủ kho trực tiếp từ `signatures.warehouseManager.signature` và `signatures.warehouseManager.name`.
- **Kiểm thử & Nghiệm thu:**
  - `pnpm exec tsc --noEmit` pass 100% trên cả Backend và Frontend.
  - `pnpm build` pass 100% trên `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal` (Vite build 12.65s).
  - Kiểm tra document thực tế trong MongoDB Atlas: bản ghi siêu tinh gọn, chỉ chứa đúng thông tin cốt lõi, tiết kiệm hơn 50% dung lượng byte.


- **Khắc phục triệt để lỗi không tải được ảnh phiếu ở Kho (`/operations/warehouse-manager/warehouse`):**
  - **Backend (`handover-record.service.ts`):** 
    * Cải tiến hàm `getSlipGallery`: Khi truy vấn theo `brand`, hệ thống tự động tra cứu danh sách các cơ sở `partnerIds` thuộc thương hiệu đó để lọc `$or: [{ brand }, { partnerId: { $in: partnerIds } }]`. 
    * Gỡ bỏ bộ lọc cứng `slipImageUrl: { $exists: true }` để các phiếu vừa tạo chưa kịp đồng bộ Cloudinary không bị biến mất khỏi danh sách.
    * Tự động snapshot `brand` và `partnerName` khi tạo phiếu tại `createRecord` và `createOrUpdatePrepOrder`.
  - **Phân quyền Shipper (`permissions.map.ts`):** Cấp thêm quyền `PERMISSIONS.HANDOVER_PARTNER_COUNT` và `PERMISSIONS.PARTNER_VIEW` cho vai trò `SHIPPER` để Shipper không bị chặn 403 Forbidden khi đếm thay đồ bẩn và khi truy vấn catalog đối tác.
  - **Route Backend (`partners.controller.ts`):** Đăng ký song song `@Get(['catalogs', 'item-catalogs'])` để hỗ trợ tương thích cả 2 route truy vấn danh mục đồ vải.
- **Xây dựng Component Thư viện ảnh phiếu dùng chung (`HandoverSlipGalleryComponent.tsx`):**
  - Hợp nhất hoàn toàn giao diện Thư viện ảnh phiếu của cả 3 phân hệ: Thủ kho (`WarehousePage`), Đối tác (`PartnerPortalPage`) và Tài xế (`HandoverListPage`).
  - Hỗ trợ 3 chế độ (`mode: 'WAREHOUSE' | 'SHIPPER' | 'PARTNER'`):
    * `WAREHOUSE`: Bộ lọc Thương hiệu, Chi nhánh đối tác, Từ ngày, Đến ngày, Tìm mã phiếu.
    * `SHIPPER`: Bộ lọc Chi nhánh đối tác, Từ ngày, Đến ngày, Tìm mã phiếu.
    * `PARTNER`: Cố định chi nhánh `fixedPartnerId`, chỉ hiện bộ lọc Từ ngày, Đến ngày, Tìm mã phiếu.
  - Thẻ phiếu trực quan cao cấp (Card Grid responsive 1-4 cột): Ảnh thumbnail phiếu, badge thương hiệu, ngày giao nhận, trạng thái phiếu, 3 chấm tròn kiểm soát chữ ký (Kho, Shipper, Quán) kèm tooltip chi tiết.
  - Nút **Xem Phóng To** kết nối trực tiếp modal lightbox `SlipFullscreenViewerModal`, nút **Tải ảnh** WebP/PNG an toàn (hỗ trợ CORS fallback), nút **Chi tiết**.
  - Phân trang mượt mà 12 phiếu/trang.
- **Component Lightbox Phóng to ảnh phiếu dùng chung (`SlipFullscreenViewerModal.tsx`):**
  - Hỗ trợ zoom đa cấp 75% - 250%, thanh công cụ floating (Zoom In, Zoom Out, 100%, Tải ảnh, Đóng).
  - Tích hợp cuộn pan tự do, phím tắt bàn phím `Escape` tự động đóng, double-tap zoom trên mobile.
  - Tích hợp đồng bộ vào `PrepOrderSlipPreviewComponent`, `HandoverDeliverySlipModal`, `ShipperHandoverItemCardComponent` và `HandoverSlipGalleryComponent`.
- **Đồng bộ hóa URL Search Params (`?tab=...`):**
  - `WarehousePage.tsx`: Chuyển sang quản lý `useSearchParams` với `?tab=CLEAN_PLAN | SUMMARY | SLIP_GALLERY`. Người dùng có thể bookmark, refresh hoặc gửi link trực tiếp tới tab Thư viện ảnh phiếu.
  - `HandoverListPage.tsx`: Chuyển sang quản lý `useSearchParams` với `?tab=ROUTE | HISTORY`.
  - `PartnerPortalPage.tsx`: Tích hợp `HandoverSlipGalleryComponent` vào tab `?tab=HISTORY`.
- **Sửa lỗi thẻ Lộ trình Shipper & Modal Đếm thay đối tác (`ShipperHandoverItemCardComponent.tsx` & `ShipperCountPartnerModal.tsx`):**
  - **Hàm tải ảnh:** Cải tiến `handleDownloadSlipImage` tạo thẻ `<a>` download mượt mà, hỗ trợ fallback CORS tự động mở tab mới để tải.
  - **Nút Phóng to:** Kết nối trực tiếp modal dùng chung `SlipFullscreenViewerModal`.
  - **Nút Đếm thay:** Thay thế form inline tạm thời bằng modal chuyên dụng `ShipperCountPartnerModal`.
  - **Đồng bộ UI Modal Đếm thay:** Thiết kế giao diện y hệt màn hình đếm đồ bẩn đối tác (`PartnerCountTabComponent.tsx`) với khung thông tin cố định khóa 3 trường (Thương hiệu, Chi nhánh, Ngày), chuyển đổi linh hoạt dạng Thẻ / Bảng, nhập biểu thức thông minh `12 34` hoặc `10+5`, bảng ký tên điện tử Canvas và Live Preview phiếu in A4.
- **Kiểm thử & Nghiệm thu:**
  - `pnpm exec tsc --noEmit` pass 100% trên `fe-react-thanhxuan-internal`.
  - `pnpm build` pass 100% trên `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`.

- **Thư viện ảnh phiếu lịch sử cho Đối tác (`PartnerHistoryTabComponent.tsx`):**
  - Chuyển đổi tab `HISTORY` (`/operations/partner-manager/partner?tab=HISTORY`) sang giao diện **Thư viện ảnh phiếu** tương đồng với tab Gallery của Thủ kho (`WarehouseSlipGalleryTabComponent.tsx`).
  - Lưới ảnh phiếu tỷ lệ chuẩn `aspect-[3/4]`, hiển thị ảnh phiếu xuất bản WebP kèm mã phiếu, ngày, thương hiệu, chi nhánh.
  - Hover / Click hiển thị nút phóng to ảnh (Lightbox Dialog), nút tải trực tiếp ảnh phiếu WebP về thiết bị.
  - Bộ lọc thông minh theo ngày giao nhận và tìm kiếm theo mã phiếu, phân trang tiện lợi.
  - Badges trạng thái chữ ký 3 bên: Thủ kho, Shipper, Quán (Đếm bẩn / Kiểm nhận).
- **Tối ưu toàn diện màn hình điều phối Shipper (`HandoverListPage.tsx` & `ShipperHandoverItemCardComponent.tsx`):**
  - **Bổ sung tab Lịch sử phiếu đã giao (`ShipperHistoryTabComponent.tsx`):** Shipper có thể chuyển đổi linh hoạt giữa "Lộ Trình Giao Nhận" trong ngày và "Lịch Sử Phiếu Đã Giao" của các chi nhánh đối tác mình phụ trách, hiển thị dạng lưới thư viện ảnh phiếu kèm bộ lọc đối tác, khoảng ngày và mã phiếu.
  - **Cụm điều hướng ngày mới:** Bỏ các nút rời "Hôm qua", "Hôm nay", "Ngày mai"; thay thế bằng cụm `[< Ngày trước]` - `[Ngày hiển thị ở giữa (click mở lịch chọn ngày)]` - `[Ngày sau >]` cực kỳ gọn gàng, trực quan.
  - **Loại bỏ nút lập phiếu và form tạo phiếu:** Xóa bỏ hoàn toàn nút "Lập Phiếu Ngay" và modal tạo phiếu khỏi màn hình Shipper; Shipper chỉ tập trung vào lộ trình được phân công.
  - **Hiển thị trực tiếp ảnh phiếu xuất kho:** Thẻ phiếu hiển thị trực tiếp ảnh phiếu giống tab `RECEIPT` (`PartnerReceiptTabComponent.tsx`).
  - **Nút "Đếm thay" tích hợp ngay trên ảnh phiếu:** Khi bấm "Đếm thay", form đếm thay mở ra **trực tiếp trên khu vực ảnh phiếu** (inline, không dùng popup dialog), giao diện đơn giản như tab `COUNT`: stepper +/- tăng giảm nhanh, nhập số lượng thông minh (hỗ trợ cộng dồn `10+5` hoặc `12 34`), nhập số bao/túi gom đồ bẩn (`bagsCount`), lưu số lượng đếm thay trực tiếp qua API `PATCH /handover/${id}/dirty-items`.
  - **Checkbox đếm lại tại xưởng (`isRecount`):** Tích chọn chuyển xưởng đếm lại khi nghi ngờ số lượng.
  - **Tinh giản thông tin thẻ phiếu:** Ngày giao nhận hiển thị cùng hàng ở góc phải (`formatDateVN`), loại bỏ hoàn toàn badge `SCHEDULED` và dòng tóm tắt số lượng sạch/bẩn rườm rà.
- **Kiểm thử & Xác thực:** `tsc --noEmit` pass 100%, Vite build `fe-react-thanhxuan-internal` pass 100% (7.43s).

### Nâng Cấp UX Shipper, Chuẩn Hóa Mã Phiếu `GN-XXX-DDMMYYYY`, Bắt Buộc Mã Viết Tắt Partner & Fix Tab Lịch Sử Đối Tác (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)
- **Chuẩn hóa mã phiếu giao nhận `recordCode` & Tên viết tắt đối tác (`shortCode`):**
  - Schema `Partner` (`partner.schema.ts`): Bổ sung `shortCode` (String, Bắt buộc, Unique, uppercase, index) và `deliveryShift` (`MORNING` | `EVENING`).
  - Thêm validation nghiêm ngặt trong `CreatePartnerDto` và `UpdatePartnerDto`.
  - Backend sinh mã phiếu định dạng `GN-XXX-DDMMYYYY` (ví dụ `GN-TT-14102026` với `TT` là tên viết tắt của cơ sở Tràng Tiền), tự động chuyển ngày sang định dạng `DDMMYYYY` theo múi giờ Việt Nam UTC+7. Kèm vòng lặp retry 3 lần tự động gắn hậu tố `-1`, `-2` nếu phát sinh nhiều chuyến trong cùng ngày cho một cơ sở.
  - Cập nhật giao diện `PartnerModal.tsx`: Thêm ô nhập bắt buộc "Tên Viết Tắt (Mã Chi Nhánh)" (auto-uppercase, tối đa 8 ký tự, chú thích rõ dùng tạo mã phiếu `GN-[MÃ]-DDMMYYYY`), dropdown chọn Ca giao nhận mặc định (`Ca Sáng` / `Ca Tối`).
  - `PartnerCardComponent.tsx`: Hiển thị badge mã viết tắt `shortCode` và ca giao nhận nổi bật.
- **Tái cấu trúc màn hình giao nhận Shipper (`HandoverListPage.tsx` & `ShipperHandoverItemCardComponent.tsx`):**
  - Xóa bỏ hoàn toàn nút "Tải ZIP" và "Tạo Phiếu" thừa thãi.
  - Gộp Lịch giao nhận và Phiếu giao nhận thành **1 danh sách duy nhất** các điểm cần giao nhận trong ngày (`deliveryPoints`).
  - Phân ca giao nhận linh hoạt: Thêm bộ lọc ca `Tất Cả`, `Ca Sáng` (mặt trời), `Ca Tối` (mặt trăng).
  - Cụm nút chuyển nhanh ngày: Cụm nút bấm `[<]`, `[Hôm qua]`, `[Hôm nay]`, `[Ngày mai]`, `[>]` thao tác cực nhanh trên điện thoại di động.
  - Địa chỉ chi tiết kèm nút **"Chỉ đường"**: Mở trực tiếp Google Maps (`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`) sang tab mới.
  - Card dạng Accordion (mở rộng/thu gọn): Khi nhấn mở rộng hiển thị dời ngày nhanh, nút mở modal Đếm thay đối tác, xem ảnh phiếu xuất kho thủ kho đã lập, ký tên Canvas, họ tên shipper, checkbox tích yêu cầu đếm lại (`isRecount`), nút xác nhận bàn giao $\rightarrow$ khi hoàn tất hiển thị ngay ảnh phiếu mới kèm nút tải ảnh WebP về máy.
- **Nâng cấp Modal Đếm thay đối tác (`ShipperCountPartnerModal.tsx`):**
  - Đồng bộ chuẩn giao diện với màn hình đếm đồ bẩn nhà hàng: Smart Math Input cộng dồn phép tính (ví dụ `10+5+2`), chuyển đổi 2 chế độ xem Thẻ / Bảng, hiển thị tổng số món, số túi/bao gom đồ bẩn (`bagsCount`), bảng ký tên Canvas và Live Preview Canvas A4.
- **Loại bỏ mục "Hàng đợi đếm lại" trong `WarehousePage.tsx`:**
  - Xóa bỏ triệt để tab `RECOUNT_QUEUE` khỏi giao diện Thủ kho do đây là nghiệp vụ riêng biệt của Thợ xưởng tại trạm `/operations/worker/recount`.
- **Sửa triệt để lỗi crash tại tab HISTORY (`PartnerPortalPage.tsx` & `PartnerHistoryTabComponent.tsx`):**
  - Sửa lỗi crash do đọc schema cũ (`clean`, `dirty`, `restaurant_count`), map chuẩn xác sang `cleanClothes`, `dirtyClothes`, `recordDate`.
  - Hiển thị đầy đủ số lượng, trạng thái, và cho phép xem / tải trực tiếp ảnh phiếu Cloudinary đã ký nghiệm thu.
  - Giữ lại tab Lịch sử vì đây là tính năng cốt lõi phục vụ đối soát sản lượng và công nợ cuối tháng của đối tác nhà hàng.
- **Cập nhật tài liệu kỹ thuật & từ điển dữ liệu:**
  - **Đổi tên collection:** Chuyển `piecework_logs` thành `hourly_work` trong `piecework-log.schema.ts` phản ánh chính xác mô hình ghi nhận công việc theo giờ nhân hệ số.
  - **Dọn dẹp DB thực tế:** Tạo và chạy thành công script `pnpm run db:drop-legacy` (`drop-legacy-collections.ts`), drop sạch collection cũ `counters`, đồng bộ dữ liệu và drop `piecework_logs` sang `hourly_work`.
  - **Tái cấu trúc DATABASE_DICTIONARY.md:** Xóa sạch các bảng đã xóa (`counters`, `recount_tasks`), sắp xếp lại thứ tự 14 bảng trong `internal_express` theo luồng phân vùng nghiệp vụ logic, đánh số liền mạch từ 1 đến 32 Collections toàn hệ thống.
  - **Bổ sung quy định vào Rule:** Cập nhật `.agents/rules/AGENTS.md` (DoD) và `.agents/rules/backend.md` quy định bắt buộc đồng bộ `DATABASE_DICTIONARY.md`, xóa bỏ hoàn toàn tên bảng đã xóa và chạy script dọn dẹp DB thực tế mỗi khi thay đổi schema.
  - Kiểm thử: 110 tests Jest Backend pass 100%, NestJS build pass 100%, Vite build frontend pass 100%.

### Plan 24 - Tái Cấu Trúc Toàn Diện CSDL internal_express, Chuẩn Hóa Quy Trình Giao Nhận 5 Bước, Thư Viện Ảnh Phiếu & Cơ Chế Lương Mới (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)
- **Tái Cấu Trúc Toàn Diện Cơ Sở Dữ Liệu `internal_express` (MongoDB):**
  - **Xóa bỏ hoàn toàn bảng `counters` & sinh mã phiếu tự sinh ngẫu nhiên:** Loại bỏ `counter.schema.ts`, `counter.repository.ts` và collection `counters`. Sinh mã phiếu giao nhận `GN-YYYYMMDD-XXXX` (tiền tố ngày giờ chuẩn múi giờ Việt Nam UTC+7 và 4 ký tự ngẫu nhiên uppercase) kết hợp vòng lặp retry 3 lần và bắt lỗi `E11000` của MongoDB trên Unique Index `recordCode`. Triệt tiêu hoàn toàn điểm nghẽn cổ chai và nguy cơ race condition do bộ đếm tập trung gây ra.
  - **Tinh gọn cấu trúc đồ vải & thay thế defects:**
    * Nhánh đồ sạch (`cleanClothes`): Lưu trữ danh sách `items: CleanItemLine[]` gồm `itemCode`, `itemName`, `deliveryQuantity` (số lượng giao), `undeliveredQuantity` (chưa giao), `quantityReturned` (giao trả).
    * Nhánh đồ bẩn (`dirtyClothes`): Lưu trữ danh sách `items: DirtyItemLine[]` gồm `itemCode`, `itemName`, `quantityReceived` (số lượng đối tác đếm), `actualQuantityReceived` (số lượng xưởng đếm lại).
    * Ghi chú theo từng món (`notes`): Mảng `HandoverItemNote[]` gồm `itemCode`, `itemName`, `note`, thay thế hoàn toàn sub-schema `defects` phức tạp cũ.
  - **Chuẩn hóa thời gian lưu trữ & múi giờ nghiệp vụ:** DB MongoDB lưu trữ chuẩn UTC0 (`Date`), toàn bộ tính toán nghiệp vụ, tiền tố mã phiếu và hiển thị giao diện tuân thủ múi giờ Việt Nam `Asia/Ho_Chi_Minh` (UTC+7).
- **Quy Trình Giao Nhận 5 Bước Khép Kín & Cơ Chế Cập Nhật Nguyên Tử (Anti-Race Condition):**
  - **Bước 1 - Thủ kho soạn đồ (17h-21h) & Cron Job 12:00 trưa:**
    * Cron Job chạy tự động lúc 12:00 trưa mỗi ngày (`0 12 * * *`) quét các đối tác cần giao theo `deliveryFrequency` (`DAILY` hoặc `ALTERNATE_DAYS`), tự động tạo phiếu giao nhận với ngày giao `recordDate` là ngày mai và prefill đồ bẩn hôm trước.
    * Modal soạn đồ `PrepOrderModal.tsx`: Chặn chọn ngày đã qua (`min = getTodayVN()`), mặc định ngày mai khi thủ kho soạn đồ buổi tối, nhập đồ sạch và ghi chú từng món, ký tên Canvas thủ kho, render canvas WebP nén tải lên Cloudinary lưu link `slipImageUrl`.
  - **Bước 2 - Đối tác đếm đồ bẩn (21h-23h59) & Auto-Save Onblur Nguyên Tử:**
    * Cổng đối tác `PartnerPortalPage.tsx`: Tự động nhận diện khung giờ đêm $\ge 21\text{h}00$ để nhảy ngày sang ngày mai (`getTargetRecordDateVN`).
    * Triệt tiêu xung đột đồng thời trong giờ cao điểm 21h-23h59 bằng endpoint nguyên tử `PATCH /api/v1/internal/handover/:id/dirty-item-onblur`: Cập nhật trực tiếp từng ô số lượng đồ bẩn bằng toán tử `$set` trên path con của MongoDB, không ghi đè toàn bộ document.
    * Đối tác ký nhận đếm đồ bẩn qua endpoint `PATCH /api/v1/internal/handover/:id/partner-count-signature`.
  - **Bước 3 - Shipper nhận bàn giao & Ký nhận di động:**
    * Danh sách phiếu `HandoverListPage.tsx` mặc định ngày theo `getTargetRecordDateVN()`.
    * Chi tiết phiếu `HandoverDetailPage.tsx` và `SignatureModal.tsx`: Shipper kiểm đếm, xác nhận qua `PATCH /api/v1/internal/handover/:id/shipper-confirm`.
    * Hỗ trợ checkbox `isRecount` (Yêu cầu đếm lại tại xưởng) và lý do `recountReason` khi đối tác bận chưa đếm hoặc nghi ngờ sai lệch.
  - **Bước 4 - Trạm rạch bao đếm lại xưởng (`RecountStationPage.tsx`):**
    * Tự động lọc danh sách các phiếu có `isRecount === true` hoặc đồ bẩn trống số lượng mà Shipper đã ký nhận giao về.
    * Thợ xưởng rạch bao đếm lại, nhập số lượng thực tế và hoàn tất qua endpoint `PATCH /api/v1/internal/handover/:id/recount-actual` (`recount.status = 'DONE'`).
  - **Bước 5 - Đối tác kiểm nhận đồ sạch & Ký nhận hoàn tất:**
    * Cổng đối tác `PartnerReceiptTabComponent`: Hiển thị ảnh phiếu WebP trực tiếp từ Cloudinary `slipImageUrl`. Đối tác kiểm nhận số lượng đồ sạch đã nhận, ký tên xác nhận qua `PATCH /api/v1/internal/handover/:id/partner-check-signature`, chuyển trạng thái phiếu sang `COMPLETED`.
- **Thư Viện Ảnh Phiếu Giao Nhận (`WarehouseSlipGalleryTabComponent.tsx`):**
  - Tích hợp tab Thư viện ảnh phiếu trực tiếp trong `WarehousePage.tsx` cho Thủ kho và Quản lý.
  - Bộ lọc trực quan: Thương hiệu (`BrandSelect`), Chi nhánh đối tác (`PartnerSelect`), Khoảng thời gian (Từ ngày - Đến ngày).
  - Backend cung cấp endpoint `GET /api/v1/internal/handover/slip-gallery` tối ưu truy vấn `.lean()`.
  - Hỗ trợ xem ảnh phóng to Modal Lightbox và tải ảnh WebP gốc trực tiếp về máy.
- **Quản Lý Toàn Diện Chi Phí Xe Máy Của Shipper (`FuelPage.tsx`, `fuel_logs`):**
  - Nâng cấp schema `FuelLog`: Bổ sung `expenseType: 'FUEL' | 'REPAIR'`, `amountMoney`, `odometerOrMotorcyclePhotoUrl`, `description`.
  - Giao diện `FuelPage.tsx`: Hỗ trợ 2 tabs nghiệp vụ chuyên biệt: Đổ Xăng (`FUEL`) và Sửa Chữa Xe (`REPAIR`).
  - Bắt buộc đính kèm ảnh chụp hóa đơn/biên lai và ảnh đồng hồ xe máy (với đổ xăng) hoặc ảnh xe máy sửa chữa (với sửa xe).
  - Kế toán và Admin duyệt chi phí; khoản duyệt được tự động cộng vào phiếu lương của Shipper trong kỳ.
- **Cơ Chế Tính Lương Mới Toàn Diện (Shipper 28 Ngày Chuẩn & Thợ Xưởng Theo Giờ x Hệ Số):**
  - **Thuật toán tính lương Shipper:**
    * Định mức tháng dựa trên 28 ngày công chuẩn: `dailySalaryRate = monthlyBaseSalary / 28`. Lương cơ bản tính theo ngày thực tế: `dailySalaryRate * actualWorkedDays`.
    * Thưởng ca cuối tuần: 60.000 VNĐ / ca cho ca tối Thứ 7, Chủ Nhật và ca sáng Chủ Nhật, Thứ 2 (`shipperWeekendShiftBonus`).
    * Thưởng chuyên cần: 7.000 VNĐ / ngày có chấm công thực tế (`shipperAttendanceBonusDaily`).
    * Phụ cấp điện thoại: 200.000 VNĐ / kỳ lương (`shipperPhoneAllowance`).
    * Hoàn chi phí phương tiện: Tự động cộng toàn bộ các khoản Đổ xăng và Sửa xe đã được Kế toán duyệt trong kỳ.
    * Khấu trừ Bảo hiểm xã hội: Trừ 400.000 VNĐ / kỳ lương (`shipperInsuranceDeduction`).
  - **Thuật toán tính lương Thợ xưởng:**
    * Thay thế hoàn toàn mô hình khoán sản lượng đơn chiếc cũ bằng tính lương theo thời gian làm việc nhân hệ số công việc (`WorkshopJobType`: `IRONING`, `FOLDING`, `PACKING`, `WASHING`, `DRYING`, `OTHER`).
    * Công thức: `Tiền công = (minutesWorked / 60) * hourlyBaseRate * coefficient`.
    * Hệ số lấy từ `PaySettings.jobCoefficients`, đơn giá giờ cơ bản snapshot từ hồ sơ thợ `StaffAccount.hourlyRate`.
  - **Minh bạch phiếu lương cá nhân (`MyPayslipPage.tsx`):**
    * Tách biệt 2 cấu trúc chi tiết riêng: `shipperDetails` (chi tiết ngày công, ca cuối tuần, chuyên cần, xăng/sửa xe, phụ cấp, trừ BHXH) và `workerDetails` (bảng tổng hợp thời gian và tiền công theo từng loại việc).
- **Đồng Bộ Tài Liệu Kỹ Thuật (Modular SRS/SDD & Harness Data):**
  - Cập nhật [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md): Tổng số bảng điều chỉnh thành 33 Collections (15 Collections trong `internal_express`); đánh dấu `counters` đã xóa bỏ; cập nhật `piecework_logs`, `fuel_logs`, `pay_settings`, `payslips`.
  - Cập nhật [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md): Bổ sung các endpoints handover mới, phân hệ chi phí xe và cấu trúc màn hình/component mới.
  - Cập nhật [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md) và [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md) lên phiên bản 2.3.
  - Cập nhật 1 dòng Document History tại [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md).
- **Kiểm Thử & Biên Dịch:**
  - Backend: `pnpm exec tsc --noEmit` PASS 100%, `nest build` PASS 100%.
  - Frontend Internal: `pnpm exec tsc --noEmit` PASS 100%, `vite build` PASS 100% (6.84s).

## 2026-10-11

### Plan 23 - Tái Cấu Trúc Toàn Diện HandoverRecord, Sinh Mã Nguyên Tử, 4 Chữ Ký, Cloudinary WebP, Live Canvas Preview & Gộp Trạm Đếm Recount (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)
- **Tái Cấu Trúc Backend HandoverRecord & Loại Bỏ Collection Phụ:**
  - **Sinh mã phiếu nguyên tử không qua Counter:** Thay thế logic sinh mã dựa trên collection `Counter` bằng cơ chế tìm mã lớn nhất trong ngày qua regex `^GN-YYYYMMDD-(\\d{3})$` trên `HandoverRecordRepository`, tăng tiến nguyên tử và xử lý retry tự động khi gặp conflict `E11000`.
  - **Chuẩn hóa ngày và người lập phiếu:** Đổi `datePrefix` string sang `recordDate` kiểu `Date` (chuẩn hóa đầu ngày múi giờ Việt Nam `Asia/Ho_Chi_Minh` qua `startOfDayVN`), bổ sung thuộc tính `warehouseManagerId` (`Types.ObjectId`) bắt buộc truy vết danh tính thủ kho tạo phiếu.
  - **Tái cấu trúc cấu trúc dữ liệu đồ vải:**
    * Đồ sạch: Đổi từ `cleanDelivery` sang `cleanClothes` phẳng gồm: `preparedQuantity`, `undeliveredQuantity`, `debtDeliveryQuantity`, `note` từng dòng.
    * Đồ bẩn: Đổi từ `dirtyPickup` sang `dirtyClothes` phẳng gồm: `partnerCount.items` (số lượng đối tác hoặc shipper đếm), `actualQuantity` (số lượng đếm thực tế tại xưởng), `variance` (chênh lệch) và `countedByRole` (`'PARTNER' | 'SHIPPER'`).
  - **Gộp trạm đếm gom bao xưởng vào HandoverRecord:**
    * Xóa bỏ hoàn toàn collection riêng `recount_tasks`, `RecountTaskRepository` và `recount-task.schema.ts`.
    * Tích hợp trực tiếp trường `recount` vào `HandoverRecord`: `{ isRecount: boolean, status: 'PENDING' | 'COMPLETED', recountedAt?: Date, recountedBy?: Types.ObjectId }`.
    * Chuyển API hoàn thành kiểm đếm sang `POST /api/v1/internal/handover/:id/recount`, cập nhật `dirtyClothes.actualQuantity`, tự động tính toán `variance` và sinh lại ảnh phiếu `slipImageUrl`.
  - **Hệ thống 4 chữ ký điện tử độc lập (`signatures`):**
    * Tách biệt rõ ràng 4 vai trò ký: `warehouseManager` (Thủ kho xuất đồ), `shipper` (Tài xế giao nhận), `partnerCount` (Người đếm đồ bẩn), và `receiptCheck` (Người kiểm nhận đồ sạch).
    * Hỗ trợ lưu trữ alias tương thích giữa DB (`signedByName, signatureUrl, signedAt`) và Client (`name, signature, at`).
  - **Tương thích ngược đọc kép (Dual-Read Backward Compatibility):**
    * Cập nhật `ReportsService` và `PieceworkService` hỗ trợ đọc song song cả schema mới (`cleanClothes`, `dirtyClothes`) lẫn schema cũ (`cleanDelivery`, `dirtyPickup`) để bảo toàn dữ liệu lịch sử không bị gián đoạn.
- **Tối Ưu Hóa Ảnh Phiếu & Lưu Trữ Đám Mây (Client WebP & Cloudinary):**
  - **Nén ảnh WebP từ Client:** Xây dựng tiện ích `renderHandoverSlipToWebpBase64` nén canvas phiếu giao nhận sang định dạng `image/webp` chất lượng `0.85`, ép kích thước dưới 120KB giúp giảm 70% băng thông tải lên mạng di động.
  - **Upload Cloudinary & Dọn dẹp ảnh cũ:** Backend NestJS tích hợp `MediaService` nhận `slipImageBase64` tải lên folder `thanhxuan/handovers`, lưu link CDN vào `slipImageUrl` và kích hoạt tác vụ nền xóa ảnh cũ an toàn tránh phát sinh chi phí lưu trữ.
- **Nâng Cấp Toàn Diện Giao Diện Vận Hành & Trải Nghiệm Người Dùng (Frontend Internal):**
  - **Xem trước Canvas trực tiếp cho Thủ kho (`PrepOrderModal.tsx`, `PrepOrderSlipPreviewComponent.tsx`):** Tích hợp khung xem trước Live Canvas ngay trong modal soạn đồ, cho phép thủ kho rà soát chính xác bố cục phiếu in A4 trước khi bấm lưu.
  - **Shipper đếm thay đối tác (`ShipperCountPartnerModal.tsx`, `ShipperHandoverItemCardComponent.tsx`):**
    * Bổ sung nút "Đếm thay đối tác" trên danh sách phiếu, tự động gán `countedByRole: 'SHIPPER'`.
    * Tách component thẻ món đồ tối ưu hóa cảm ứng 1 tay cho tài xế, hỗ trợ xem và tải trực tiếp ảnh phiếu Cloudinary sắc nét.
  - **Xem trước Canvas trên Cổng đối tác (`PartnerCountTabComponent.tsx`):** Render Canvas xem trước trực tiếp trên form đếm đồ bẩn, đặt phía trên nút lưu phiếu để đối tác quan sát dữ liệu ghép 2 chiều trước khi xác nhận.
  - **Tăng tốc hiển thị Tab kiểm nhận (`PartnerReceiptTabComponent.tsx`):** Hiển thị trực tiếp thẻ `<img>` từ Cloudinary `slipImageUrl` (tốc độ tải tức thì, triệt tiêu 100% hiện tượng đơ giật do vẽ Canvas trên máy cấu hình yếu), kèm fallback vẽ Canvas nếu phiếu cũ chưa có ảnh.
  - **Trạm kiểm đếm xưởng không cần ký tên (`RecountStationPage.tsx`):** Lọc các phiếu gom bao `recount.isRecount: true` và `recount.status: 'PENDING'`. Thợ xưởng chỉ cần nhập số lượng đếm thực tế của từng món và lưu thẳng, không yêu cầu ký tên Canvas.
- **Kỷ Luật Cấu Trúc Mã Nguồn Frontend:**
  - Bóc tách triệt để các file lớn thành các modal và component độc lập (`PrepOrderSlipPreviewComponent`, `ShipperCountPartnerModal`, `ShipperHandoverItemCardComponent`), bảo đảm mọi file mã nguồn đều dưới 250 - 300 dòng theo đúng quy chuẩn dự án.
- **Kiểm Thử & Biên Dịch:**
  - Backend: Chạy kiểm thử tự động `pnpm test src/modules/internal/handovers` đạt **PASS 35/35 tests**, biên dịch `pnpm build` **PASS 100%**.
  - Frontend: Kiểm tra kiểu dữ liệu `pnpm exec tsc --noEmit` đạt **PASS 100%**, đóng gói `vite build` đạt **PASS 100%**.

## 2026-10-10

### Plan 22 - Tách Database `core_express` (CORE_CONNECTION), Migration Dữ Liệu An Toàn & Chuẩn Hóa Kiến Trúc 4 CSDL Độc Lập (`be-nestjs-thanhxuan`)
- **Tách Lớp Hạ Tầng Core Khỏi Phân Hệ Vận Hành Xưởng:**
  - Chuyển 4 collections chia sẻ toàn hệ thống gồm: `audit_logs` (Nhật ký kiểm toán bảo mật), `media_files` (Quản lý file ảnh Cloudinary), `idempotency_keys` (Khóa chống request trùng lặp) và `notifications` (Thông báo in-app) từ cơ sở dữ liệu `internal_express` sang một database riêng biệt hoàn toàn mang tên `core_express`.
  - Khởi tạo hằng số kết nối chuẩn: [core.constants.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/core.constants.ts) định nghĩa `export const CORE_CONNECTION = 'CORE_CONNECTION'`.
- **Nâng Cấp Cấu Hình & Đăng Ký Mongoose 4 Connections (`database.config.ts`, `app.module.ts`):**
  - Cập nhật [database.config.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/config/database.config.ts): Bổ sung `coreUri` hỗ trợ biến môi trường `MONGODB_CORE_URI` kèm fallback tự động trỏ sang `.../core_express`.
  - Cập nhật [app.module.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/app.module.ts): Đăng ký kết nối thứ 4 bằng `MongooseModule.forRootAsync` với `connectionName: CORE_CONNECTION`.
- **Tái Cấu Trúc 4 Modules & Repositories Tương Ứng:**
  - `AuditModule` & `AuditLogRepository`: Đổi connection từ `INTERNAL_CONNECTION` sang `CORE_CONNECTION`.
  - `MediaModule` & `MediaFileRepository`: Đổi connection từ `INTERNAL_CONNECTION` sang `CORE_CONNECTION`.
  - `IdempotencyModule` & `IdempotencyInterceptor`: Đổi connection từ `INTERNAL_CONNECTION` sang `CORE_CONNECTION`.
  - `NotificationsModule` & `NotificationRepository`: Đổi connection từ `INTERNAL_CONNECTION` sang `CORE_CONNECTION`.
- **Kịch Bản Di Chuyển Dữ Liệu An Toàn & Tự Động Hóa (`migrate-core-db.ts`):**
  - Xây dựng script di chuyển dữ liệu độc lập [migrate-core-db.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/scripts/migrate-core-db.ts) tích hợp lệnh `pnpm run migrate:core-db`.
  - Thực hiện copy toàn bộ bản ghi có sẵn từ `internal_express` sang `core_express` bằng cơ chế `bulkWrite` có `upsert: true` bảo toàn 100% `_id`, timestamps và kiểu dữ liệu.
  - Đồng bộ toàn bộ indexes (bao gồm cả index TTL `expiresAt` của `idempotency_keys` và compound index của `audit_logs`).
  - Kiểm chứng số lượng bản ghi giữa 2 database (Verified 100%).
  - Chạy với cờ `--drop-source` để xóa sạch 4 collections cũ trên `internal_express` sau khi đã kiểm chứng an toàn.
- **Đồng Bộ Hệ Thống Tài Liệu Kỹ Thuật (SRS/SDD & Data Dictionary):**
  - Sửa lỗi cú pháp render sơ đồ Mermaid trong [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md).
  - Cập nhật [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md): Chuyển Phân Vùng 4 sang `core_express` với `CORE_CONNECTION`.
  - Cập nhật [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) & [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md): Đồng bộ topology hệ sinh thái từ 3 databases lên 4 databases độc lập.
  - Cập nhật [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md) và hoàn tất checklist [plan22.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/plans/plan22.md).
- **Kiểm Thử & Biên Dịch:**
  - `nest build` thành công rực rỡ, không phát sinh bất kỳ lỗi biên dịch nào.

### Plan 21 - Cải Tiến Giao Diện Đối Tác B2B, Form Đếm Đồ Bẩn Thông Minh, Kiểm Nhận Canvas 2 Chiều, Lịch Sử Phân Trang & Khắc Phục Lỗi 403 / Loop Re-render (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)
- **Quy Chuẩn Giao Diện Cổng Đối Tác Bằng `@/components/common` (`PartnerPortalPage.tsx`):**
  - Tầng 1: Sử dụng [PageBanner.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageBanner.tsx) hiển thị tiêu đề cổng đối tác, tên thương hiệu/chi nhánh và thông tin tài khoản đăng nhập.
  - Tầng 2: Sử dụng [PageActionBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageActionBar.tsx) chứa thanh tab chức năng trên Desktop (`lg:flex`) và các nút hành động nhanh.
  - Tầng 3: Sử dụng [ResponsiveCardGrid.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/ResponsiveCardGrid.tsx) hiển thị danh sách phiếu lịch sử tự co dãn từ 1 đến 4 cột chuẩn công thái học.
  - Đồng bộ trạng thái tab qua URL query param `?tab=COUNT | RECEIPT | HISTORY | STAFF`, đảm bảo khi tải lại trang hoặc chia sẻ link luôn giữ đúng màn hình làm việc.
- **Menu Phân Hệ Đối Tác Mobile-First (Mobile Bottom Bar - `MobileBottomBar.tsx`, `nav-config.ts`):**
  - Cập nhật cấu hình điều hướng cho 2 vai trò `PARTNER_STAFF` và `PARTNER_MANAGER`:
    * 4 tính năng cốt lõi: **Đếm đồ bẩn** (`COUNT`), **Kiểm nhận đồ sạch** (`RECEIPT`), **Lịch sử** (`HISTORY`), **Phê duyệt NV** (`STAFF`, chỉ hiển thị nếu role là `PARTNER_MANAGER`).
  - Trên màn hình di động (`lg:hidden`), toàn bộ điều hướng chuyển xuống thanh **Bottom Navbar** cố định đáy màn hình với các icon to bản và nhãn tiếng Việt trực quan; ẩn nút 'Thêm' và nút Hamburger menu.
  - Bổ sung nhận diện active state theo `location.search` (`?tab=...`), giúp thanh Bottom Bar phát sáng chính xác nút đang được chọn.
  - **Bỏ Hoàn Toàn Sidebar Trên Cả Desktop & Drawer Mobile:** Khi người dùng là `PARTNER_MANAGER` hoặc `PARTNER_STAFF`, hệ thống loại bỏ hoàn toàn [DesktopSidebar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/DesktopSidebar.tsx) và [MobileNavDrawer.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileNavDrawer.tsx), xóa bỏ khoảng lùi lề `lg:pl-64` để giao diện bung 100% chiều rộng màn hình, tinh gọn tối đa giao diện làm việc của quán.
- **Form Đếm Đồ Bẩn Thông Minh Chuẩn Hóa Theo PrepOrderModal (`PartnerCountTabComponent.tsx`):**
  - Tái cấu trúc theo ngôn ngữ giao diện của [PrepOrderModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx), hỗ trợ chuyển đổi linh hoạt Dual View Mode giữa **Dạng Thẻ (`Card View`)** và **Dạng Bảng (`Table View`)**.
  - Tự động nhận diện chi nhánh & thương hiệu của tài khoản (`user.brand`, `user.partnerId`), **khóa cứng (disabled / read-only)** Thương hiệu, Chi nhánh và Ngày (mặc định lấy theo ngày của phiếu soạn đồ do quản lý kho tạo).
  - Thay thế các cột soạn đồ thành duy nhất **1 cột số lượng: "Đồ chưa giặt"**. Bỏ trường ghi chú chung, giữ ghi chú từng món nếu có sự cố rách/hỏng.
  - **Cơ chế Smart Math Input & Auto-Save on Blur (`lib/utils.ts`):**
    * Viết hàm `parseSmartQtyExpression(input)` an toàn (không dùng `eval`), hỗ trợ tính toán cộng trừ và gom dồn: gõ `12 34` hoặc `12 + 34` => tính ra `46`, gõ `50-10` => tính ra `40`.
    * Tự động tính kết quả và lưu ngay khi rời ô (`onBlur`), mang lại trải nghiệm nhập liệu siêu tốc cho nhân viên kiểm đồ.
  - **Lưu & Xuất Phiếu Giao Nhận Kép:**
    * Bấm *"Lưu và xem phiếu giao nhận"*: Lưu dữ liệu đếm đồ bẩn vào phiếu giao nhận (cột *Số lượng đã nhận* `dirtyReceivedQty` và chữ ký đối tác), đồng thời truy vấn dữ liệu đồ sạch đã soạn từ phía `warehouse-manager` trong ngày để hiển thị đồng thời cả 2 chiều trên phiếu xuất nhập kho Canvas [HandoverDeliverySlipModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/HandoverDeliverySlipModal.tsx).
- **Kiểm Nhận Đồ Sạch Trực Quan Bằng Canvas 2 Chiều (Tab RECEIPT - `PartnerReceiptTabComponent.tsx`):**
  - Hiển thị trực tiếp phiếu giao nhận 2 chiều xuất nhập kho vẽ bằng HTML5 Canvas sắc nét để đối tác kiểm đếm đồ sạch đối soát với đồ bẩn.
  - Nút điều hướng ngày: **Sang trái (`ChevronLeft`)** lùi 1 ngày, **Sang phải (`ChevronRight`)** tiến 1 ngày để dễ dàng lật xem các phiếu giao nhận theo ngày mà không cần mở nhiều màn hình.
  - Ô **họ tên người nhận** (mặc định nạp tự động từ tài khoản đăng nhập `user.fullName || user.name`) và ô **ký tên** (`SignatureCanvas`) ngay dưới phiếu, bấm xác nhận gửi API `/handover/:id/receipt-check`.
- **Lịch Sử Giao Nhận Phân Trang & Tra Cứu Theo Ngày (Tab HISTORY - `PartnerHistoryTabComponent.tsx`):**
  - Danh sách phiếu giao nhận hiển thị theo thứ tự **từ mới đến cũ** (mới nhất lên đầu) trong `ResponsiveCardGrid`.
  - **Phân trang (Pagination):** Tối đa **12 phiếu / trang** kèm thanh chuyển trang tiện lợi.
  - **Bộ lọc ngày cụ thể:** Bộ chọn ngày (Date Picker) lọc và xem ngay phiếu giao nhận của 1 ngày bất kỳ, bấm nút *"Xem Phiếu"* mở modal Canvas hiển thị đầy đủ phiếu để tải ảnh hoặc copy Zalo.
- **Khắc Phục Toàn Diện Lỗi Console & Quyền Hạn (403 Forbidden & Loop Re-render):**
  - **Sửa lỗi 403 Forbidden trên các API Partner:** Cập nhật [permissions.map.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/config/permissions.map.ts) cấp quyền `PARTNER_VIEW` (`partner.view`) và `CATALOG_PRICE_CUSTOMER_VIEW` (`catalog.price_customer.view`) cho `PARTNER_MANAGER` và `PARTNER_STAFF`. Cập nhật Jest snapshot test [permissions.map.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/config/permissions.map.spec.ts) pass 9/9.
  - **Sửa lỗi Maximum update depth exceeded (`PrepOrderModal.tsx`):** Thêm điều kiện chặn vòng lặp `useEffect` khi danh sách chi nhánh rỗng hoặc khi `defaultPartnerId` đã được thiết lập, giải quyết triệt để lỗi crash giao diện khi mở form Soạn đồ bên phía kho vận.
  - **Chuẩn hóa TypeScript Types:** Bổ sung các trường `clean`, `dirty`, `cleanPlanned`, `restaurant_count` và `note?: string` vào `HandoverDirtyItem` trong [types/index.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/types/index.ts).

### Refactor - Chuẩn Hóa Kiến Trúc File Features & Giới Hạn Dung Lượng (*Page.tsx, modals/*Modal.tsx, components/*Component.tsx)
- **Chuẩn Hóa Quy Ước Đặt Tên & Cấu Trúc Thư Mục Feature:**
  - Quy định thống nhất toàn diện:
    * Màn hình chính / view cấp cao nhất: `[Tên]Page.tsx` (ví dụ `StaffManagementPage.tsx`, `HandoverDetailPage.tsx`, `WarehousePage.tsx`, `PartnersPage.tsx`, `RegisterPage.tsx`).
    * Thư mục `modals/`: Chứa toàn bộ các dialog/modal theo dạng `[Tên]Modal.tsx` (ví dụ `PartnerModal.tsx`, `PrepOrderModal.tsx`, `StaffFormModal.tsx`).
    * Thư mục `components/`: Chứa các component con phụ trách render phần giao diện riêng lẻ theo dạng `[Tên]Component.tsx` (ví dụ `StaffTableComponent.tsx`, `HandoverCleanDeliveryComponent.tsx`, `WarehouseCleanPlanTabComponent.tsx`).
  - Ghi nhận bắt buộc vào bộ tài liệu dự án:
    * `.agents/rules/frontend.md`: Bổ sung nguyên tắc đặt tên file và giới hạn kích thước tối đa 300 dòng (ngoại lệ không quá 450 dòng đối với form nghiệp vụ phức tạp).
    * `.agents/rules/AGENTS.md` (Mục 5.5): Quy định cấu trúc thư mục con chuẩn hóa và quy ước tiền tố / hậu tố file.
    * `.agents/skills/create-react-feature/SKILL.md`: Cập nhật cấu trúc Feature-Based Flat Colocation.
    * `.agents/skills/create-nextjs-feature/SKILL.md`: Cập nhật cấu trúc component & modal.
- **Rà Soát & Bóc Tách Các File Vượt Kích Thước Trong `fe-react-thanhxuan-internal/src/features`:**
  - **`features/management/auth`:**
    * Bóc tách `StaffManagementView.tsx` (1,154 dòng) thành `StaffManagementPage.tsx`, `modals/StaffFormModal.tsx`, `modals/StaffDeleteModal.tsx`, `components/StaffFilterComponent.tsx`, `components/StaffTableComponent.tsx`.
    * Chuẩn hóa `ApprovalManagementPage.tsx` và `AuditLogPage.tsx`.
  - **`features/management/partners`:**
    * Bóc tách toàn bộ modals vào `modals/`: `PartnerModal.tsx`, `BrandModal.tsx`, `CatalogModal.tsx`, `DeleteConfirmModal.tsx`.
    * Chuẩn hóa các components: `PartnersTopBannerComponent.tsx`, `PartnersActionBarComponent.tsx`, `PartnersPartnerFilterComponent.tsx`, `PartnersCatalogFilterComponent.tsx`, `PartnerListComponent.tsx`, `PartnerCardComponent.tsx`, `CatalogListComponent.tsx`.
  - **`features/auth`:**
    * Thu gọn `RegisterPage.tsx` từ 566 dòng xuống 189 dòng; chuyển các modals sang `auth/modals/`: `ChangePasswordModal.tsx`, `ForgotPasswordModal.tsx`, `OtpVerificationModal.tsx`, `ProfileEditModal.tsx`, `RegisterModal.tsx`; tạo `components/RegisterFormComponent.tsx`.
  - **`features/operations/handovers`:**
    * Bóc tách `HandoverDetailPage.tsx` (933 dòng) thành `components/HandoverHeaderComponent.tsx`, `components/HandoverCleanDeliveryComponent.tsx`, `components/HandoverDirtyPickupComponent.tsx`, `components/HandoverSignaturesComponent.tsx`, `modals/DisputeModal.tsx` và `HandoverDetailPage.tsx` (~350 dòng).
    * Bóc tách `WarehousePage.tsx` (750 dòng) thành `components/WarehouseCleanPlanTabComponent.tsx`, `components/WarehouseRecountQueueTabComponent.tsx`, `components/WarehouseSummaryTabComponent.tsx` và `WarehousePage.tsx` (~180 dòng).
    * Bóc tách `PrepOrderModal.tsx` (873 dòng) thành `components/PrepOrderItemCardComponent.tsx`, `components/PrepOrderItemTableComponent.tsx` và `modals/PrepOrderModal.tsx` (~420 dòng).
    * Nâng cấp `PrepOrderModal.tsx`: Tự động nhận diện thiết bị khi mở modal (Mobile: hiện Dạng Thẻ trước, Desktop: hiện Dạng Bảng trước).
    * Bổ sung hiển thị ảnh đồ giặt (`cat.imageUrl`) có fallback icon `Package` ngay trước tên món đồ ở cả Dạng Thẻ (`PrepOrderItemCardComponent.tsx`) và Dạng Bảng (`PrepOrderItemTableComponent.tsx`).
    * Ẩn hoàn toàn mã đồ giặt `itemCode` ở Dạng Thẻ để tinh gọn và tập trung cho thợ thao tác cảm ứng.
    * Chuẩn hóa toàn bộ modal vào `modals/`: `CreateHandoverModal.tsx`, `HandoverDeliverySlipModal.tsx`, `RecountRequestModal.tsx`, `SignatureModal.tsx`, `ZaloQrSettingsModal.tsx`, `WarehouseScheduleSettingsModal.tsx`.
  - **`features/operations/partners`:**
    * Bóc tách `PartnerPortalPage.tsx` (690 dòng) thành `components/PartnerCountTabComponent.tsx`, `components/PartnerReceiptTabComponent.tsx`, `components/PartnerHistoryTabComponent.tsx`, `components/PartnerStaffTabComponent.tsx` và `PartnerPortalPage.tsx` (~200 dòng).
  - **`features/operations/reports` & `features/operations/piecework`:**
    * Chuẩn hóa `ReportsPage.tsx`, `components/ReportsViewComponent.tsx`, `components/ItemCounterCardComponent.tsx`.
- **Tái Thiết Kế & Nâng Tầm Thẩm Mỹ Top Banner (`PageBanner.tsx`):**
  - Chuyển đổi toàn diện bố cục sang phương ngang: Icon container nổi bật đặt bên trái (`w-12 h-12 sm:w-14 sm:h-14`), toàn bộ Title, Tagline và Description đặt bên phải Icon với tỷ lệ công thái học cân xứng.
  - Phối màu cao cấp HSL: Icon container sử dụng gradient đa tầng `sky-500` & `indigo-500` viền sắc nét kèm hiệu ứng hover scale; Card container phủ dải chuyển sắc nhẹ `from-white via-white to-sky-50/40` (Dark: `from-slate-900 to-sky-950/20`) cùng viền tinh xảo; Description hỗ trợ ReactNode dạng thẻ linh hoạt.
- **Dọn Dẹp Triệt Để Các File Shim & Tối Ưu Import:**
  - Cập nhật toàn bộ các import trực tiếp trong toàn bộ mã nguồn trỏ chuẩn xác vào thư mục `modals/` hoặc `components/`.
  - Xóa bỏ triệt để 35 file shim trung gian (các file chỉ chứa 1 dòng `export * from './modals/...'` hoặc `export * from './components/...'`) giúp cây thư mục gọn gàng, trong sáng và dễ bảo trì.
  - Tinh giản các file barrel `index.ts` chỉ xuất các component và modal chính danh.
- **Kiểm Thử Toàn Diện:**
  - Kiểm thử TypeScript (`pnpm exec tsc --noEmit`): Pass 100% không có lỗi.
  - Kiểm thử Vite Production Build (`pnpm build`): Pass 100% với bundle và PWA Service Worker tạo thành công trong 4.58s.

### Plan 20 - Tính Năng Soạn Đồ Giao Hàng, Xuất Phiếu Giấy Zalo Chuẩn Khổ A4, Tự Động Định Kỳ & Sửa Lỗi Popup Đối Tác (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)
- **Khắc Phục Lỗi Cuộn Khuất Đỉnh Phiếu Trên Màn Hình PC (`HandoverDeliverySlipModal.tsx`):**
  - Nguyên nhân: Container cuộn trước đây dùng `flex justify-center items-center`, thuộc tính `items-center` căn giữa theo chiều dọc khiến một nửa trên của tấm ảnh khổ A4 dài >1000px bị đẩy lên vùng âm tọa độ cuộn (scroll top < 0), khiến người dùng dù có kéo kịch thanh cuộn lên trên cùng cũng không nhìn thấy được khung thông tin công ty.
  - Khắc phục: Chuyển cấu trúc container sang `flex flex-col items-center justify-start py-6`. Ảnh phiếu được đặt ngay ngắn bắt đầu từ đỉnh đầu có khoảng đệm 24px, căn giữa theo chiều ngang và cuộn trơn tru từ đầu trang đến chân trang mà không bao giờ bị cắt mất mép trên.
- **Tinh Chỉnh Thẩm Mỹ & Cân Đối Thanh Thao Tác Quản Lý Đối Tác (`PartnersActionBar.tsx`):**
  - Thu nhỏ toàn bộ các nút hành động bên phải: *Thêm Đối Tác*, *Thêm Đồ Giặt*, *Thêm Thương Hiệu*, và *Cài QR Zalo Phiếu*.
  - Chuyển đổi từ `size="touch"` (chiều cao lớn 56px vốn chỉ dành cho màn hình xưởng) sang `size="sm"` (`h-8`, bo góc `rounded-lg`, font chữ `text-xs font-semibold`, icon `w-3.5 h-3.5`).
  - Hỗ trợ text co giãn linh hoạt trên mobile cho nút QR Zalo (`hidden sm:inline` "Cài QR Zalo Phiếu" và `sm:hidden` "QR Zalo").
  - Đảm bảo thanh Action Bar hiển thị thẳng hàng, tỷ lệ cân đối hoàn hảo với khối tab bộ lọc bên trái.
- **Tối Ưu Bố Cục Khổ Giấy In A4 & Phân Quyền Cài Đặt QR Zalo (`HandoverExportHelper.ts`, `PartnersPage.tsx`, `HandoverDeliverySlipModal.tsx`):**
  - Tăng khoảng cách lề trên khung thông tin công ty từ 35px lên chuẩn **50px** (`box1Y = 50;`) và dịch chuyển phần cam kết dịch vụ chân trang (`footerY = 1095;`) để giữ tỷ lệ lề trên - lề dưới cân đối.
  - Tách hoàn toàn nút cài QR Zalo ra khỏi modal xem phiếu kho vận, đưa về trang Quản lý Đối tác (`/management/manager/partner`) dành riêng cho quyền `ADMIN` và `MANAGER`.
  - Phiếu giao nhận tự động nhận diện và hiển thị mã QR Zalo đã lưu khi bất kỳ ai bấm xem phiếu.
- **Sửa Triệt Để Lỗi Popup Form Đối Tác (Ảnh 2 - `PartnerDialog.tsx` & `dialog.tsx`):**
  - Khắc phục tình trạng Header dính sát mép trên và Footer đè cắt ngang input *"Người liên hệ trực tiếp tại quán"*.
  - Cải tiến `dialog.tsx`: thiết lập container `max-h-[90vh] flex flex-col`, cấu trúc padding `px-6` cân đối, màu border tinh chỉnh theo token theme light/dark mode.
  - Tái cấu trúc `PartnerDialog.tsx`: cố định `DialogHeader` và `DialogFooter`, toàn bộ 7 input form fields được bọc vào vùng cuộn `max-h-[60vh] overflow-y-auto px-6 py-4 space-y-4` mượt mà, đạt 100% chuẩn thẩm mỹ ergonomics.
- **Nâng Cấp Backend Handovers (Schemas, DTOs & Nghiệp Vụ Soạn Đồ):**
  - Mở rộng Mongoose sub-schema `HandoverItem` và `CleanPlanned`: hỗ trợ `undeliveredQty` (số lượng chưa giao), `returnedDebtQty` (số lượng giao trả nợ), `note` (ghi chú từng món), `preparedByName` (họ tên người lập) và `preparedBySignature` (chữ ký số Base64).
  - Bổ sung các Class DTO validation: `CleanItemDetailDto`, `CleanPlannedDto`, `PrepOrderDto` với đầy đủ validator Decorator (`@IsOptional()`, `@IsString()`, `@IsNumber()`).
  - Thêm endpoint `POST /handover/prep-order`: tạo mới hoặc cập nhật phiếu soạn đồ sạch cho ngày mai với đầy đủ 3 loại số lượng, ghi chú từng dòng và chữ ký điện tử.
  - Thêm endpoint `GET /handover/previous-dirty`: truy vấn phiếu giao nhận gần nhất trước ngày chỉ định để lấy chính xác số lượng đồ bẩn đã nhận (`dirty.final.items` ➔ `dirty.shipperItems` ➔ `restaurant_count.items`), dùng để prefill tự động sang đồ sạch.
  - Thêm endpoint `POST /handover/auto-schedule`: duyệt danh sách đối tác có lịch giao định kỳ (`DAILY`, `ALTERNATE_DAYS`), tự động sinh phiếu giao nhận ngày mai kèm prefill số lượng đồ bẩn hôm trước vào `clean.planned`.
- **Giao Diện Soạn Đồ Thông Minh & Chữ Ký Điện Tử (`PrepOrderModal.tsx`):**
  - Tích hợp bộ chọn 2 cấp: Thương hiệu (Brand) ➔ Chi nhánh đối tác (Partner), tự động tải danh mục đồ giặt tương ứng (`item_catalogs`).
  - Tự động gọi API `/handover/previous-dirty` điền sẵn số lượng vào cột *Số lượng sẽ giao* giúp thủ kho không phải gõ lại từ đầu.
  - Hỗ trợ nhập và chỉnh sửa linh hoạt: Cột *Số lượng sẽ giao*, *Chưa giao*, *Giao trả nợ*, kèm cột *Ghi chú* từng dòng (ví dụ: *"đã giao trước trong ngày 20 chiếc"*).
  - Khung Canvas ký tên điện tử (`react-signature-canvas`) có nút xóa chữ ký, ô họ tên người lập phiếu tự động điền họ tên tài khoản đang đăng nhập.
  - Bấm "Lưu & Xem Phiếu Giao Nhận" tự động lưu vào hệ thống và kích hoạt mở modal xem trước phiếu thực tế.
  - **Tối ưu hóa hiển thị di động & Chống lỗi cuộn ngang trên Mobile (Dual View Mode):**
    * Khắc phục triệt để lỗi thẻ cha `overflow-hidden` chặn vuốt cảm ứng ngang trên điện thoại di động.
    * Bổ sung chế độ **Dạng Thẻ (`Card View`)**: Mặc định kích hoạt trên màn hình điện thoại (< 768px), hiển thị từng món đồ giặt thành thẻ dọc với nút bấm stepper [-] / [+] to bản 32-40px tiện lợi, nhập Chưa giao / Trả nợ / Ghi chú trực tiếp mà không cần cuộn ngang màn hình.
    * Cung cấp chế độ **Dạng Bảng (`Table View`)**: Hỗ trợ vuốt ngang mượt mà (`overflow-x-auto min-w-[580px]`), tinh gọn tối đa các cột cố định bên trái (STT thu hẹp còn `w-8` 32px, Tên đồ thu gọn `min-w-[120px]` và **ẩn hoàn toàn mã đồ bên dưới**, ĐVT thu hẹp `w-11`), ghim cố định (*STT* `sticky left-0` và *Tên đồ giặt* `sticky left-8 sm:left-10`), giúp màn hình điện thoại hiển thị ngay cột *Sẽ giao* và vuốt nhẹ là thấy toàn bộ *Chưa giao*, *Giao trả nợ*.
    * Nút chuyển đổi View Mode nhanh chóng giữa Dạng Thẻ và Dạng Bảng ngay trên thanh tiêu đề danh mục.
- **Render Canvas Phiếu Xuất Nhập Kho Vận Chuyển Giống Ảnh 1 Mẫu Thực Tế Pizza 4P's (`HandoverExportHelper.ts`):**
  - Xây dựng hàm `renderHandoverDeliverySlipToCanvas(slipData)` vẽ đồ họa Canvas HTML5 chuẩn khổ giấy A4 (800x1130px) nền trắng sắc nét.
  - Header: Khung thông tin công ty Thanh Xuân (MST `0108942736`, Hotline `0769 270 676`, Địa chỉ Kiến Hưng, Hà Nội).
  - Mã QR CSKH Zalo góc trái, Tiêu đề *PHIẾU XUẤT NHẬP KHO VẬN CHUYỂN* và ngày tháng năm lập phiếu.
  - Thông tin bên nhận (Nơi nhận, Bộ phận, Địa chỉ, SĐT).
  - Bảng dịch vụ chuẩn 16 dòng kẻ ô: gồm STT, Danh mục dịch vụ, Đơn vị, Đồ chưa giặt (Đã nhận, Thực nhận), Đồ sạch đã giặt (Đã giao, Chưa giao, Giao trả), Ghi chú từng dòng, và dòng TỔNG CỘNG ở chân bảng.
  - Khu vực 4 chữ ký: *Thủ kho*, *Người giao hàng*, *Người nhận hàng*, *Người lập phiếu (Người đếm đồ bẩn)* hiển thị ảnh chữ ký Canvas và họ tên bên dưới.
  - Footer: Thông tin thương hiệu TX Laundry Service và toàn bộ đoạn văn bản cam kết chất lượng dịch vụ theo đúng mẫu giấy in thực tế.
- **Modal Xem Trước, In Phiếu Chuẩn Khổ A4 & Xuất Ảnh Zalo (`HandoverDeliverySlipModal.tsx`):**
  - Hiển thị trực quan toàn bộ phiếu in tỷ lệ chuẩn A4.
  - **Khắc phục lỗi in ấn trình duyệt (Clean Print):** Áp dụng CSS `@page { size: A4 portrait; margin: 0mm !important; }` và `.print-box { padding: 6mm 10mm; }`, triệt tiêu 100% các dòng thông tin thừa do trình duyệt tự chèn (ngày giờ in, tiêu đề trang, `about:blank`, và số trang `1/1`), phiếu in ra sạch sẽ như bản in thương mại.
  - Tích hợp nút **"Cài QR Zalo"** mở hộp thoại tùy chỉnh mã QR trực tiếp ngay khi đang xem phiếu.
  - Tích hợp nút **"Tải Xuống Thành Ảnh (.PNG)"** tải file ảnh chất lượng cao gửi ngay vào nhóm Zalo.
  - Nút **"Sao chép ảnh"** ghi trực tiếp dữ liệu hình ảnh vào Clipboard để dán nhanh (Ctrl+V) vào Zalo máy tính mà không cần lưu file.
- **Tính Năng Cài Đặt Mã QR Zalo CSKH Cho Phiếu Giao Nhận (`ZaloQrSettingsModal.tsx`):**
  - Hỗ trợ tải file ảnh mã QR Zalo (PNG, JPG, WEBP) từ thiết bị hoặc dán URL ảnh trực tiếp.
  - Lưu cấu hình mã QR vào bộ nhớ hệ thống (`TX_ZALO_QR_CODE`), hỗ trợ quay lại mã QR mặc định bất cứ lúc nào.
  - Tích hợp điểm truy cập cài đặt tại cả 2 nơi: Modal xem phiếu `HandoverDeliverySlipModal` và Hộp thoại cấu hình kho `WarehouseScheduleSettingsDialog`.
  - Phiếu giao nhận tự động nạp ảnh thật của mã QR Zalo và vẽ sắc nét vào góc trái phiếu in.
- **Setting Tự Động Lên Đơn Theo Lịch Định Kỳ (`WarehouseScheduleSettingsDialog.tsx` & `WarehousePage.tsx`):**
  - Hộp thoại cấu hình lịch giao: thống kê chi nhánh giao hàng ngày / cách ngày vs chi nhánh theo yêu cầu (`ON_DEMAND`).
  - Nút kích hoạt nhanh "Tự Động Lên Đơn Theo Lịch" ngay trên thanh công cụ trang Kho (`WarehousePage.tsx`).
  - Thêm nút "Soạn Đồ" nổi bật và nút "Cài Đặt Lịch Giao" trên thanh tác vụ.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - `pnpm exec tsc --noEmit` trên `fe-react-thanhxuan-internal` pass 100% (0 lỗi).
  - `pnpm build` (`vite build`) trên `fe-react-thanhxuan-internal` pass 100% trong 7.09 giây.
  - `pnpm build` (`nest build`) trên `be-nestjs-thanhxuan` pass 100% không cảnh báo lỗi biên dịch.

### Plan 19 - Nâng Tầm Toàn Diện Giao Diện UI/UX Phân Hệ Vận Hành Nội Bộ (`fe-react-thanhxuan-internal`)
- **Chuẩn hóa Nền tảng Thiết kế & Typography (Design Foundation & Font Stack):**
  - Tích hợp bộ font Google Fonts `Plus Jakarta Sans` (400, 500, 600, 700, 800) và `JetBrains Mono` tại `index.html`.
  - Mở rộng cấu hình `tailwind.config.js`: Khai báo font stack `font-sans`, `font-mono`, các bóng đổ cao cấp (`soft`, `card`, `card-hover`, `glow-sky`, `glow-emerald`) và chuẩn hóa bo góc `rounded-2xl`, `rounded-3xl`.
  - Cập nhật `src/index.css`: Bổ sung lớp số học chuẩn xác `.tabular-nums` (cho tiền tệ và kiểm đếm đồ giặt), lớp vùng an toàn di động `.safe-bottom`, `.safe-bottom-nav`, và thanh cuộn tinh gọn `.scrollbar-thin`.
- **Hệ Thống Component UI Cốt Lõi Tinh Gọn (Core UI Components):**
  - `Button.tsx`: Loại bỏ triệt để gradient 3 màu tím/xanh nhạt nhẽo kiểu "AI slop". Nâng cấp các variant solid brand sắc sảo, bổ sung variant `success`, `touch` (chiều cao >= 52-56px cho thợ đeo găng tay và tài xế xe tải thao tác một tay).
  - `Badge.tsx`: Nâng cấp badge bo tròn hỗ trợ tùy chọn `dot` status indicator nhấp nháy, viền mờ cao cấp, phân biệt trực quan 5 trạng thái vận hành logistics (`SCHEDULED`, `IN_TRANSIT`, `PROCESSING`, `COMPLETED`, `DISPUTED`).
  - `Card.tsx`: Bổ sung các biến thể `default`, `interactive` (hiệu ứng hover lift nổi bật khi rê chuột), `outline`, `flat`, padding phân cấp logic.
  - `StatCard.tsx` (Mới): Thẻ số liệu KPI cao cấp với container icon bo góc mềm mại, hiển thị số liệu lớn `tabular-nums`, badge phần trăm tăng trưởng và hiệu ứng micro-elevation.
  - `EmptyState.tsx` (Mới): Component trạng thái rỗng sinh động cho các danh sách phiếu/chấm công chưa có dữ liệu, kèm icon bao quanh viền mờ và nút hành động nhanh.
  - `SkeletonLoader.tsx` (Mới): Component skeleton hiệu ứng shimmer mượt mà cho card và danh sách khi đang tải dữ liệu.
- **Tái Cấu Trúc Khung Shell Điều Hướng (Layout & Navigation Shell):**
  - `AppHeader.tsx`: Nền kính mờ `backdrop-blur-md bg-white/85 dark:bg-slate-900/85`, huy hiệu vai trò nhân viên sử dụng `Badge` kèm dot status rực rỡ, dropdown menu tài khoản mềm mại.
  - `DesktopSidebar.tsx`: Nâng cấp menu thanh thoát, vạch sáng active indicator chạy dọc lề trái, container logo TX có chiều sâu, chữ in hoa danh mục tinh tế.
  - `MobileBottomBar.tsx`: Hỗ trợ vùng đệm an toàn `env(safe-area-inset-bottom)` cho iPhone, các tab điều hướng dạng pill nổi bật khi được chọn, phản hồi chạm nhạy bén.
- **Tái Thiết Kế Toàn Diện Màn Hình Trung Tâm Điều Hành (`DashboardPage.tsx`):**
  - Hero Banner thời gian thực với nhãn "BẢNG VẬN HÀNH THỜI GIAN THỰC", ngày giờ chuẩn Việt Nam và các nút Quick Action điều xe / trạm đếm.
  - Lưới 4 thẻ KPI `StatCard`: Xe đang giao nhận, Giao nhận hoàn tất, Lương khoán/Sản lượng thợ hôm nay, Lệch đồ/Khiếu nại cần xử lý ngay.
  - Hai cột danh sách vận hành trực quan: Bảng phiếu cần theo dõi và Bảng năng suất thợ xưởng tích hợp `EmptyState` khi không có dữ liệu, loại bỏ hoàn toàn các khoảng trắng vô hồn.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - `pnpm exec tsc --noEmit` pass 100% không cảnh báo lỗi type.
  - `pnpm build` (`vite build`) pass 100%, bundle sinh mã PWA Service Worker thành công trong 7.6 giây.

## 2026-10-08

### Plan 18 - Quản Lý Nhân Sự Toàn Diện (Khóa 60 Ngày Tự Xóa, Xóa Vĩnh Viễn Admin, Phân Tab), Tinh Gọn Đăng Ký, Seed Tài Khoản Test & Header Profile Popover (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)
- **Tinh gọn Trang Đăng Ký (`/register` & `RegisterModal`):**
  - Loại bỏ hoàn toàn tùy chọn vai trò "Quản Lý Đối Tác" (`PARTNER_MANAGER`) khỏi form đăng ký công khai.
  - Trang đăng ký công khai chỉ cho phép 3 vai trò thực thi: "NV Xưởng" (`WORKER`), "NV Giao Hàng" (`SHIPPER`), "Nhân Viên Đối Tác" (`PARTNER_STAFF` - chọn cascade Brand ➔ Chi nhánh cơ sở).
  - Backend bảo vệ: Chặn đăng ký vai trò `PARTNER_MANAGER` / `RESTAURANT_MANAGER` tại `register()` endpoint công khai; vai trò Quản lý đối tác bắt buộc do Admin/Manager khởi tạo trong Cổng Quản lý nhân sự.
- **Tự động Seed 8 Tài Khoản Mẫu & Đồng Bộ Mật Khẩu Test (`LoginPage.tsx` & Backend):**
  - Backend tự động seed/khôi phục khi khởi động (`OnModuleInit`) 8 tài khoản mẫu chuẩn: `admin`, `manager`, `warehouse_manager`, `accountant`, `shipper`, `worker`, `partner_manager`, `partner_staff` với mật khẩu chung `ThanhXuan@2026`.
  - Frontend `LoginPage.tsx`: Cập nhật lưới tài khoản mẫu 8 vai trò phân loại trực quan, hỗ trợ đăng nhập 1-click phục vụ kiểm thử nhanh.
- **Màn Hình Quản Lý Nhân Sự (`StaffManagementView.tsx` - `/management/manager/personnel`):**
  - **Phân loại Tab vai trò:** 6 tab danh mục (Tất cả, Quản trị, Vận hành, Giao hàng, Đối tác, Tạm khóa) kèm huy hiệu đếm số lượng tài khoản theo thời gian thực.
  - **Modal Thêm Tài Khoản:** Hỗ trợ Admin/Manager khởi tạo mọi vai trò (bao gồm `PARTNER_MANAGER` và `PARTNER_STAFF` kèm cụm cascade Brand ➔ Chi nhánh).
  - **Modal Chỉnh Sửa Tài Khoản:** Cập nhật thông tin họ tên, số điện thoại, vai trò, thương hiệu và chi nhánh đối tác.
  - **Cơ chế Tạm Khóa & Tự Động Xóa Sau 60 Ngày:**
    - Schema lưu `lockedAt: Date` khi tài khoản bị khóa.
    - Giao diện hiển thị cảnh báo thời hạn và số ngày đếm ngược còn lại trước khi bị xóa vĩnh viễn (quy tắc: khóa đủ 60 ngày tự xóa).
    - Backend: Scheduler/Cleanup logic tự động xóa vĩnh viễn tài khoản bị khóa quá 60 ngày (`deleteExpiredLockedAccounts`).
  - **Xóa Vĩnh Viễn Tài Khoản (Đặc Quyền Riêng Admin):**
    - Backend: Endpoint `DELETE /accounts/:id` yêu cầu quyền `ACCOUNT_ADMIN`, cấm tự xóa chính mình và cấm non-admin xóa.
    - Frontend: Nút "Xóa vĩnh viễn" (kèm hộp thoại xác nhận) chỉ hiển thị cho tài khoản có vai trò `ADMIN`.
- **Header Profile Popover & Quản Lý Hồ Sơ Cá Nhân (`AppHeader.tsx` & Backend):**
  - Góc trên bên phải Header hiển thị Avatar tròn, Tên người dùng và Huy hiệu phân quyền; click mở Popover Dropdown menu chuyên nghiệp.
  - **Popup Xem/Sửa Thông Tin Cá Nhân (`ProfileEditModal.tsx`):**
    - Cho phép cập nhật Họ và tên, Số điện thoại (`PATCH /accounts/me/profile`).
    - Hỗ trợ tải ảnh Avatar trực tiếp từ máy tính lên Cloudinary qua Backend endpoint `POST /accounts/me/avatar` (lưu trữ tại thư mục `internal/avatars`, tự động dọn dẹp ảnh cũ).
  - **Popup Đổi Mật Khẩu (`ChangePasswordModal.tsx`):**
    - Form 3 trường chuẩn xác: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới (`POST /auth/change-password`).
  - Nút **Đăng xuất** an toàn với 1 chạm.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - Backend: `pnpm build` (`nest build`) trong `be-nestjs-thanhxuan` pass 100%.
  - Frontend: `pnpm exec tsc -b` & `pnpm build` (`vite build`) trong `fe-react-thanhxuan-internal` pass 100%.

### Plan 17 - Chuẩn Hóa Vai Trò Đối Tác (PARTNER_MANAGER, PARTNER_STAFF), Đăng Ký Cascade Brand-Partner & Cô Lập Dữ Liệu Theo Chi Nhánh (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)
- **Đồng nhất 100% vai trò Đối tác B2B (Partner Role Standardization):**
  - Backend:
    - Khai báo role `PARTNER_MANAGER = 'PARTNER_MANAGER'` và `PARTNER_STAFF = 'PARTNER_STAFF'` trong `StaffRole` enum (`internal.enums.ts`) kèm alias backward compatibility `RESTAURANT_MANAGER = 'PARTNER_MANAGER'`, `RESTAURANT_STAFF = 'PARTNER_STAFF'`.
    - Bổ sung trường `brand` (string, uppercase, trim, indexed) vào `StaffAccount` schema (`staff-account.schema.ts`).
    - Cập nhật `InternalJwtStrategy`, `accounts.service.ts` (`login`, `refreshToken`, `getMe`) đưa `brand` vào JWT payload và thông tin người dùng.
    - Cập nhật RBAC permission map: `ACCOUNT_APPROVE_PARTNER`, `HANDOVER_PARTNER_COUNT` (kèm alias `ACCOUNT_APPROVE_RESTAURANT`, `HANDOVER_RESTAURANT_COUNT`).
    - Cập nhật `PartnerScopeGuard` và Handover State Machine nhận diện đầy đủ role `PARTNER_STAFF` và `PARTNER_MANAGER`.
  - Frontend:
    - Cập nhật `StaffRole` (`PARTNER_MANAGER`, `PARTNER_STAFF`) kèm alias `RESTAURANT_*` trong `src/types/index.ts`.
    - Mở rộng interface `StaffUser` và `RegisterPayload` chứa trường `brand`.
    - Cập nhật `permissions.ts`, `nav-config.ts`, `AppHeader.tsx`, `MobileNavDrawer.tsx`, `AuthContext.tsx` và các trang app `allowedRoles`.
- **Đăng ký Cascade 2 Cấp (Brand ➔ Partner Cascade Registration):**
  - Bổ sung public API ở Backend: `GET /partners/brands/public` (danh sách thương hiệu active) và `GET /partners/public` (danh sách chi nhánh).
  - Cập nhật DTO Backend: `RegisterDto`, `CreateManagementAccountDto`, `UpdateAccountDto` hỗ trợ `brand` và validate cascade: tài khoản đối tác bắt buộc chọn Chi nhánh (`partnerId`), tự động đối soát `brand` từ chi nhánh đối tác.
  - Cập nhật màn hình đăng ký Frontend (`RegisterPage.tsx` và `RegisterModal.tsx`):
    - Mở rộng lựa chọn 4 vai trò: Thợ Xưởng (`WORKER`), Giao Hàng (`SHIPPER`), NV Đối Tác (`PARTNER_STAFF`), QL Đối Tác (`PARTNER_MANAGER`).
    - Khi chọn vai trò đối tác, tự động kích hoạt cụm 2 dropdown cascade:
      1. Dropdown 1: **Thương Hiệu Đối Tác (Brand)** (Pizza 4P's, Haidilao, Golden Gate...).
      2. Dropdown 2: **Chi Nhánh Cơ Sở (Partner)** tự động lọc danh sách theo đúng thương hiệu đã chọn (`partner.brand === selectedBrand`).
    - Bắt buộc chọn cả Brand và Chi nhánh để gửi kèm payload đăng ký.
- **Phân vùng dữ liệu nghiêm ngặt (Scope Isolation) trên Cổng Đối Tác (`PartnerPortalPage.tsx`):**
  - Backend: Bổ sung endpoint `@Post(['partner-count', 'restaurant-count'])` và `@Put(':id/partner-count')` tạo/cập nhật phiếu đếm đồ bẩn an toàn idempotency.
  - Frontend `PartnerPortalPage.tsx`:
    - Hiển thị nhãn Thương hiệu (Brand) và Chi nhánh đối tác ngay trên Header từ `user.brand` và `partner`.
    - Tải danh mục đồ vải (`item_catalogs`) lọc chuẩn xác theo thương hiệu của chi nhánh.
    - Tab Đếm Đồ Bẩn: Gửi dữ liệu về `/handover/partner-count` (hỗ trợ cả Offline Queue qua IndexedDB).
    - Tab Lịch Sử & Kiểm Nhận Đồ Sạch: Tải đúng phiếu giao nhận của chi nhánh người dùng (`/handover?partnerId=${userPartnerId}`).
    - Tab Duyệt Nhân Viên (dành cho `PARTNER_MANAGER`): Chỉ tải và phê duyệt các yêu cầu đăng ký nhân viên của chính chi nhánh mình.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - Backend: `pnpm build` (`nest build`) trong `be-nestjs-thanhxuan` pass 100%.
  - Frontend: `pnpm build` (`tsc -b && vite build`) trong `fe-react-thanhxuan-internal` pass 100%.

### Plan 16 - Chuẩn Hóa Ngữ Pháp Module, Phân Chia Features Management/Operations, Đổi Tên Đối Tác & URL Số Ít (`be-nestjs-thanhxuan`, `fe-react-thanhxuan-internal`)
- **Chuẩn hóa ngữ pháp tiếng Anh danh mục Module (Grammar-Accurate Pluralization):**
  - Giữ đuôi số nhiều `s` cho các danh từ đếm được: `handovers/`, `partners/`, `reports/`.
  - Bỏ đuôi `s` (về số ít) cho danh từ không đếm được và từ viết tắt:
    - Backend: `auths/` ➔ `auth/`, `attendances/` ➔ `attendance/`, `fuels/` ➔ `fuel/`, `payrolls/` ➔ `payroll/`, `pieceworks/` ➔ `piecework/`.
    - Cập nhật các module class: `AuthModule`, `AttendanceModule`, `FuelModule`, `PayrollModule`, `PieceworkModule` (kèm alias tương thích ngược).
    - Cập nhật quy tắc ngữ pháp danh mục module trong skill `.agents/skills/create-nestjs-module/SKILL.md`.
- **Tái cấu trúc thư mục Frontend Features (`src/features/`):**
  - Học tập cấu trúc phân tầng rõ ràng từ Web Next.js, chia `features/` thành 2 miền nghiệp vụ độc lập:
    - `features/management/`: `attendance`, `auth`, `fuel`, `handovers`, `partners`, `payroll`, `piecework`, `reports`.
    - `features/operations/`: `attendance`, `fuel`, `handovers`, `partners`, `payroll`, `piecework`, `reports`.
  - Duy trì `features/auth/` và `features/dashboard/` làm Shared Features cấp root, re-export linh hoạt sang `features/management/auth`.
  - Tách các views từ thư mục `components/` cũ và dọn dẹp sạch toàn bộ các thư mục features phẳng cấp root.
- **Chuẩn hóa thuật ngữ Đối tác B2B (Partner Terminology):**
  - Đổi toàn bộ các khái niệm "nhà hàng" / "restaurant" trong ngữ cảnh B2B sang "đối tác" / "partner":
    - URL & Folder: `operations/restaurant-manager` ➔ `operations/partner-manager/partner`, `operations/restaurant-staff` ➔ `operations/partner-staff/partner`.
    - UI Text: "Quản lý Đối tác", "Nhân viên Đối tác", "Cổng Đối Tác B2B", "Cổng Giao Nhận Đối Tác", "Cổng Quản Lý Đối Tác".
    - Page Components: Đổi `RestaurantPage.tsx` thành `PartnerPortalPage.tsx` đặt tại `features/operations/partners/`.
    - Đổi tên `RestaurantMonthlyTable` thành `PartnerMonthlyTable` và rà soát toàn bộ UI forms (`RegisterModal.tsx`, `RegisterPage.tsx`, `LoginPage.tsx`).
- **Tước bỏ quyền phê duyệt tài khoản của vai trò Kế toán (`ACCOUNTANT`):**
  - Chuyển `management/approvals` vào `management/manager/approval` (số ít).
  - Cấu hình `allowedRoles={[StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RESTAURANT_MANAGER]}` — tước bỏ hoàn toàn quyền của Kế toán.
  - Cập nhật `nav-config.ts` và `ManagementPage.tsx` ẩn tab tài khoản với vai trò `ACCOUNTANT`.
  - `RESTAURANT_MANAGER` chỉ xem và duyệt nhân viên đối tác thuộc cơ sở mình.
- **Chuẩn hóa 100% Tuyến đường Số Ít (Singular RESTful Routes):**
  - Canonical routes: `/operations/report`, `/management/manager/partner`, `/management/manager/approval`, `/operations/partner-manager/partner`, `/operations/partner-staff/partner`.
  - Thiết lập mạng lưới Backward Compatibility Redirects hoàn chỉnh trong `router.tsx` đảm bảo không bị lỗi 404 cho bất kỳ link cũ nào (kể cả link tiếng Việt lẫn tiếng Anh dạng số nhiều).
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - Typecheck Frontend: `pnpm exec tsc -b` trong `fe-react-thanhxuan-internal` pass 100%.
  - Build Frontend: `pnpm build` (`vite build`) thành công rực rỡ, PWA service worker generate hoàn tất.
  - Build Backend: `pnpm build` (`nest build`) trong `be-nestjs-thanhxuan` pass 100%.

## 2026-10-07

### Plan 15 - Chuẩn Hóa Cấu Trúc Thư Mục Phân Hệ Internal (Số Nhiều Toàn Diện) & Cập Nhật Skill create-nestjs-module (`be-nestjs-thanhxuan`)
- **Chuẩn hóa danh xưng số nhiều toàn diện (Comprehensive Plural Naming):**
  - Chuyển đổi tên 100% các module nghiệp vụ trong `src/modules/internal/` sang dạng số nhiều:
    - `accounts/` ➔ `auths/` (kèm đổi tên module thành `auths.module.ts` và export `AuthsModule` cùng alias `AccountsModule`).
    - `attendance/` ➔ `attendances/` (kèm `attendances.module.ts`, export `AttendancesModule` cùng alias `AttendanceModule`).
    - `fuel/` ➔ `fuels/` (kèm `fuels.module.ts`, export `FuelsModule` cùng alias `FuelModule`).
    - `handover/` ➔ `handovers/` (kèm `handovers.module.ts`, export `HandoversModule` cùng alias `HandoverModule`).
    - `payroll/` ➔ `payrolls/` (kèm `payrolls.module.ts`, export `PayrollsModule` cùng alias `PayrollModule`).
    - `piecework/` ➔ `pieceworks/` (kèm `pieceworks.module.ts`, export `PieceworksModule` cùng alias `PieceworkModule`).
    - `partners/` & `reports/`: Đã là số nhiều, duy trì chuẩn hóa.
  - Chuẩn hóa thư mục con `dto/` (giữ nguyên quy chuẩn từ viết tắt Data Transfer Object, không thêm số nhiều, đồng bộ 100% với các phân hệ `laundry/`, `moving/` và `core/audit/`).
- **Tổ chức cấu trúc thư mục con học theo phân hệ mẫu `laundry/`:**
  - Tạo thư mục `specs/` cho tất cả các module và gom 100% các file unit test `*.spec.ts` vào `specs/` (`auths/specs/`, `attendances/specs/`, `fuels/specs/`, `handovers/specs/`, `partners/specs/`, `payrolls/specs/`, `pieceworks/specs/`, `reports/specs/`).
  - Tách thư mục `controllers/` cho các module có $\ge 2$ controllers:
    - `auths/controllers/`: `accounts.controller.ts`, `auth.controller.ts`, `approvals.controller.ts`.
    - `handovers/controllers/`: `handover.controller.ts`, `recount-tasks.controller.ts`.
  - Cập nhật chuẩn `MockRepository<T>` cho unit test mocks loại bỏ hoàn toàn các lỗi typecheck của Jest mock methods.
- **Duy trì an toàn API Contracts & Backward Compatibility:**
  - Giữ nguyên 100% các decorator `@Controller('internal/...')` (`accounts`, `approvals`, `attendance`, `fuel`, `handover`, `partners`, `payroll`, `piecework`, `reports`) để không gây breaking change với Frontend API client.
  - Export song song class module mới và alias tên class cũ (`export { AuthsModule as AccountsModule }`, `export { HandoversModule as HandoverModule }`...) đảm bảo mọi module phụ trợ và test suites đều hoạt động trơn tru.
  - Cập nhật đồng bộ các file import toàn dự án: `src/app.module.ts`, `src/modules/internal/internal.module.ts`, `src/modules/core/schedule/*`.
- **Cập nhật Skill & Tài liệu Kiến trúc:**
  - `.agents/skills/create-nestjs-module/SKILL.md`: Cập nhật cấu trúc thư mục chuẩn (`dto/`, `schemas/`, `repositories/`, `specs/`, `controllers/`, `services/`, `strategies/`) và checklist kiểm định.
  - `.agents/docs/srs_sdd/srs_sdd_backend.md`: Cập nhật cây thư mục và sơ đồ kiến trúc module phân hệ Internal.
  - `.agents/docs/SRS_SDD.md`: Thêm 1 dòng Document History cho Plan 15.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - Typecheck: `pnpm exec tsc --noEmit` pass 100% cho toàn bộ phân hệ `internal/` và `core/schedule/`.
  - Unit Tests: `pnpm test` pass toàn bộ **43 test suites, 194 tests (100% passed)**.
  - Build: `pnpm build` (`nest build`) biên dịch thành công hoàn hảo với exit code 0.


### Plan 14 - Chuẩn Hóa Toàn Bộ Routes Sang Tiếng Anh Cho Phân Hệ Vận Hành Nội Bộ (`fe-react-thanhxuan-internal`)
- **Tái cấu trúc thư mục định tuyến (Directory Restructuring):**
  - Chuyển đổi toàn bộ các thư mục route trong `src/app/(auth)` và `src/app/(internal)` từ tiếng Việt sang 100% tiếng Anh chuẩn mực RESTful:
    - `(auth)`: `dang-nhap` ➔ `login`, `dang-ky` ➔ `register`, `quen-mat-khau` ➔ `forgot-password`.
    - `(internal)`: `tong-quan` ➔ `dashboard`, `van-hanh` ➔ `operations`, `quan-ly` ➔ `management`.
    - `operations/`: `attendance`, `payslip`, `reports`, `warehouse-manager/warehouse`, `shipper/handover`, `shipper/handover/[recordCode]`, `shipper/fuel`, `worker/recount`, `worker/piecework`, `restaurant-manager/restaurant`, `restaurant-staff/restaurant`.
    - `management/`: `page.tsx` (hub), `approvals`, `manager/personnel`, `manager/partners`, `manager/attendance`, `manager/piecework`, `accountant/fuel`, `accountant/payroll`.
- **Cập nhật đồng bộ các thành phần định tuyến & điều hướng:**
  - `src/app/router.tsx`: Định nghĩa toàn bộ cây route tiếng Anh mới; thiết lập mạng lưới chuyển hướng tương thích ngược (Backward Compatibility Redirects) cho 100% các URL và alias cũ để người dùng truy cập bookmark hoặc URL cũ không bị 404.
  - `src/components/layout/nav-config.ts`: Cập nhật `path` trong `NAV_GROUPS` và `getMobileQuickNavItems` trỏ chính xác về các tuyến đường tiếng Anh mới.
  - `src/app/page.tsx`: Cập nhật chuyển hướng unauthenticated sang `/login`.
  - `src/features/auth/AuthContext.tsx`: Cập nhật `getDefaultRouteForRole` trả về các route tiếng Anh mới cho 8 vai trò người dùng và `logout()` chuyển hướng về `/login`.
  - `src/features/auth/ProtectedRoute.tsx`: Cập nhật chuyển hướng đăng nhập và tài khoản tạm khóa về `/login`.
  - `src/lib/api-client.ts`: Cập nhật hàm `isPublicAuthPage` và chuyển hướng khi phiên hết hạn 401 về `/login`.
  - `src/features/auth/LoginPage.tsx`: Cập nhật link đăng ký sang `/register`.
  - `src/features/auth/RegisterPage.tsx`: Cập nhật navigate và link đăng nhập sang `/login`.
  - `src/features/auth/ForgotPasswordPage.tsx`: Cập nhật navigate và link sang `/login`.
  - `src/features/dashboard/DashboardPage.tsx`: Cập nhật các nút quick action sang `/operations/shipper/handover`, `/operations/attendance`, `/operations/worker/recount`.
  - `src/features/management/ManagementPage.tsx`: Cập nhật các action cards và nút xuất báo cáo sang `/management/*` và `/operations/reports`.
  - `src/features/handover/HandoverListPage.tsx` & `HandoverDetailPage.tsx`: Cập nhật các link và nút chuyển hướng sang `/operations/shipper/handover` và `/operations/shipper/handover/:recordCode`.
- **Kiểm thử & Xác minh chất lượng (Verification):**
  - Typecheck: `pnpm exec tsc --noEmit` pass 100% không phát sinh bất kỳ lỗi TypeScript nào.
  - Tests: `pnpm test` pass toàn bộ.
  - Production Build: `pnpm build` biên dịch thành công Vite bundle và Service Worker PWA hoàn tất trong 5.83s.
- **Tài liệu & Đồng bộ:** Cập nhật sơ đồ thư mục và ma trận route tại `srs_sdd_fe_internal.md`, ghi nhận `SRS_SDD.md` và hoàn tất `plan14.md`.

---

## 2026-10-05

### Tái Cấu Trúc Modular SRS & SDD (Master + 3 Phân Hệ Chi Tiết)
- **Cấu trúc tài liệu Modular SRS & SDD:**
  - Tách tài liệu `.agents/docs/SRS_SDD.md` trước đây thành hệ thống tài liệu modular gồm file tổng quan và 3 tài liệu phân hệ chi tiết:
    - [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md): Tài liệu kiến trúc tổng thể (Master System Architecture), bao gồm System Context, Sơ đồ kết nối Monorepo 3 ứng dụng, Hạ tầng VPS & Multi-Database, Master Index liên kết, và Quy chuẩn kỹ thuật dùng chung toàn hệ thống.
    - [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md): Đặc tả phân hệ Backend API tập trung (`be-nestjs-thanhxuan`), 3 database MongoDB độc lập, quy chuẩn Repository Pattern, toàn bộ bảng API Contracts, DTO validation, State Machines, RBAC Guards, Cron jobs và Streaming export reports.
    - [srs_sdd_fe_nextjs.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md): Đặc tả phân hệ Web Khách Hàng & CMS Tiếp thị (`fe-nextjs-thanhxuan-laundry`), Server Components SEO (RSC), Metadata động, Lead Capture Form CTA, CMS Quản trị bài viết, CRM Leads, chiến dịch Zalo OA/Email.
    - [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md): Đặc tả phân hệ Cổng Vận Hành Xưởng & Quản Vận (`fe-react-thanhxuan-internal`), Centralized Router (`van-hanh/` & `quan-ly/`), Mobile-First PWA, Canvas Chữ ký số, Trạm đếm gom bao, Offline Queue IndexedDB, phân quyền 8 vai trò RBAC.
- **Cập nhật Quy tắc (Workspace Rules) & Quy trình (Global Workflows):**
  - `AGENTS.md` & `GEMINI.md`: Định nghĩa rõ nguồn sự thật kiến trúc tổng thể tại `SRS_SDD.md` và chi tiết từng phân hệ tại `srs_sdd/srs_sdd_<app>.md`. Quy định DoD và quy trình `/act`, `/fix`, `/docs-sync` cập nhật đúng tài liệu phân hệ bị ảnh hưởng.
  - Workflows `srs-sdd.md`, `docs-sync.md`, `act.md`, `plan.md`, `review.md`, `fix.md`: Cập nhật chỉ dẫn đồng bộ tài liệu theo mô hình Modular SRS/SDD, bảo đảm không làm phình to file tài liệu tổng và duy trì tính sống (Living Docs) chính xác.
  - `create-react-feature/SKILL.md`: Cập nhật dẫn chiếu đến tài liệu phân hệ `srs_sdd_fe_internal.md`.

### Fix - Tinh Gọn Quyền Hạn Menu & Khắc Phục Lỗi Hiển Thị Trang Giao Nhận
- **Phân quyền Đề xuất xăng (`/van-hanh/shipper/xang`):** Chỉ dành riêng cho `StaffRole.SHIPPER`. Loại bỏ hoàn toàn khỏi menu của Kế toán, Manager, Admin (Kế toán chỉ duyệt xăng tại `/quan-ly/accountant/xang`).
- **Phân quyền Phiếu lương (`/van-hanh/phieu-luong`):** Loại bỏ vai trò `StaffRole.ADMIN` khỏi menu và `ProtectedRoute` trang phiếu lương (Admin không có phiếu lương cá nhân).
- **Phân quyền Cổng Quản lý Nhà hàng (`/van-hanh/restaurant-manager/nha-hang`):** Chỉ hiển thị và cho phép duy nhất vai trò `StaffRole.RESTAURANT_MANAGER` (loại bỏ khỏi menu Kế toán, Manager, Admin).
- **Tách biệt giao diện Trạm đếm gom bao (`/van-hanh/worker/tram-dem`):**
  - Xây dựng component chuyên biệt `RecountStationPage` (`src/features/recount/RecountStationPage.tsx`) dành riêng cho khu vực rạch bao niêm phong và đếm lại đồ bẩn xưởng, tách biệt hoàn toàn khỏi giao diện quản lý kho sạch `WarehousePage`.
  - Phân quyền cho phép `WAREHOUSE_MANAGER`, `WORKER`, `MANAGER`, `ADMIN` truy cập trực tiếp.
- **Khắc phục lỗi trang Giao nhận (`/van-hanh/shipper/giao-nhan`):**
  - Khắc phục lỗi `TypeError: scheduledPartners.map is not a function` do API `/partners/schedule` trả về object `{ date, partners: [...] }`.
  - Chuẩn hóa trích xuất `Array.isArray(res.data) ? res.data : (res.data?.partners || [])` và fallback an toàn `partnerList`, giúp trang giao nhận hiển thị trơn tru cho Quản lý kho, Manager, Admin và Shipper.
- **Cá nhân hóa Trung tâm Quản lý (`http://localhost:3001/quan-ly`):**
  - Tách bạch rõ quyền hạn hiển thị các Tab và Cards trong Hub:
    - `ACCOUNTANT`: Chỉ tải các chức năng Kế toán (Bảng Lương Chu Kỳ, Duyệt Hoàn Tiền Xăng, Báo Cáo & Xuất File). Ẩn hoàn toàn Nhân sự, Chấm công, Khoán việc, Đối tác.
    - `MANAGER`: Tải các chức năng Quản lý xưởng (Nhân Sự, Phê Duyệt Tài Khoản, Bảng Chấm Công, Chốt Khoán Việc, Đối Tác & Đồ Giặt, Báo Cáo). Ẩn hoàn toàn Duyệt xăng và Bảng lương (tuân thủ quy tắc bảo mật tước quyền `pay.*`).
    - `ADMIN`: Toàn quyền tất cả các chức năng quản lý.
    - `RESTAURANT_MANAGER`: Cho phép truy cập `/quan-ly` và chỉ hiển thị chức năng Phê duyệt nhân viên nhà hàng thuộc chi nhánh.

### Plan 13 - Tinh Gọn Phân Quyền Menu & Cơ Chế Tự Động Chấm Công Cho Shipper
- **Backend - Cơ chế Tự động Kích hoạt Check-in cho Shipper (`be-nestjs-thanhxuan`):**
  - `src/modules/internal/attendance/attendance.service.ts`: Bổ sung method `ensureCheckInForShipper(shipperId, recordCode)`:
    - Kiểm tra qua `attendanceRepo.findByWorkerAndDateKey(shipperId, dateKey)` để đảm bảo tính Idempotent (không tạo trùng lặp nếu shipper đã có ca làm việc trong ngày).
    - Tự động tạo bản ghi chấm công ca mở (`status: AttendanceStatus.OPEN`, `photoId: 'AUTO_HANDOVER_SIGN'`, `note: 'Tự động check-in khi xử lý phiếu giao nhận <recordCode>'`).
  - `src/modules/internal/handover/handover.module.ts`: Import `AttendanceModule` để cung cấp `AttendanceService`.
  - `src/modules/internal/handover/handover.service.ts`: Inject `@Optional() attendanceService?: AttendanceService` và gọi `ensureCheckInForShipper` trong hàm `deliver(...)` khi người thực hiện có vai trò `StaffRole.SHIPPER`. Bọc `try/catch` phòng thủ để không làm gián đoạn tiến trình giao nhận nếu phát sinh lỗi chấm công.
  - `attendance.service.spec.ts` & `handover.service.spec.ts`: Bổ sung unit test kiểm chứng đầy đủ 2 kịch bản (đã có ca và tạo mới ca khi shipper ký nhận hàng thành công). Pass 100% 43 test suites và 194 tests.
- **Frontend - Tinh gọn Menu Phân quyền & UI (`fe-react-thanhxuan-internal`):**
  - `src/components/layout/nav-config.ts`:
    - Giới hạn quyền hiển thị menu Chấm công cá nhân (`cham-cong`): Chỉ dành riêng cho Thợ xưởng (`StaffRole.WORKER`). Ẩn hoàn toàn khỏi menu của các tài khoản Nhà hàng (`RESTAURANT_MANAGER`, `RESTAURANT_STAFF`), Quản lý (`WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`) và Kế toán (`ACCOUNTANT`).
    - Menu Phiếu lương (`phieu-luong`): Ẩn hoàn toàn khỏi các vai trò Đối tác Nhà hàng (`RESTAURANT_MANAGER`, `RESTAURANT_STAFF`).
    - Cập nhật hàm `getMobileQuickNavItems(role)`:
      - `SHIPPER`: Giao Nhận, Xăng Xe, Lương (loại bỏ Chấm công).
      - `RESTAURANT_STAFF`: Nhà Hàng (loại bỏ Chấm công).
      - `RESTAURANT_MANAGER`: Nhà Hàng, Phê Duyệt NV (loại bỏ Chấm công).
      - `WAREHOUSE_MANAGER`: Tổng Quan, Kho Sạch, Giao Nhận (loại bỏ Chấm công).
      - `ACCOUNTANT`: Tổng Quan, Báo Cáo, Bảng Lương, Duyệt Xăng.
      - `ADMIN` / `MANAGER`: Tổng Quan, Điều Hành, Giao Nhận (loại bỏ Chấm công).
      - `WORKER`: Khoán Việc, Chấm Công, Lương.
  - `src/app/(internal)/van-hanh/cham-cong/page.tsx`: Bọc component `AttendancePage` bằng `<ProtectedRoute allowedRoles={[StaffRole.ADMIN, StaffRole.WORKER]}>` để chặn triệt để việc truy cập trực tiếp qua URL.
  - `src/features/dashboard/DashboardPage.tsx`: Bọc nút "Điểm danh ca" chỉ hiển thị khi `user?.role === StaffRole.WORKER`.
- **Tài liệu & Quy chuẩn:** Đồng bộ chú thích phân quyền route trong `.agents/skills/create-react-feature/SKILL.md` và `SRS_SDD.md`.

### Plan 12 - Tái Cấu Trúc Định Tuyến Vận Hành (van-hanh) & Quản Lý (quan-ly) Theo Nhóm Tài Khoản
- **Phân hệ Vận hành (`src/app/(internal)/van-hanh/`):**
  - Tách bạch và gom nhóm các tuyến đường vận hành theo từng nhóm tài khoản phụ trách:
    - `warehouse-manager/kho/page.tsx`: Thủ kho soạn đồ sạch xuất kho theo lịch (`StaffRole.WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`).
    - `shipper/giao-nhan/page.tsx` & `shipper/giao-nhan/[recordCode]/page.tsx`: Điều phối, danh sách và chi tiết phiếu giao nhận 2 chiều cho Tài xế xe tải (`StaffRole.SHIPPER`, `WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`).
    - `shipper/xang/page.tsx`: Tài xế nộp đề xuất hoàn tiền xăng xe kèm ảnh hóa đơn (`StaffRole.SHIPPER`).
    - `worker/tram-dem/page.tsx`: Trạm rạch bao đếm lại đồ bẩn xưởng cho Thợ xưởng (`StaffRole.WORKER`, `MANAGER`, `ADMIN`).
    - `worker/khoan-viec/page.tsx`: Thợ xưởng chấm sản lượng khoán gấp, ủi, đóng gói (`StaffRole.WORKER`, `MANAGER`, `ADMIN`).
    - `restaurant-manager/nha-hang/page.tsx`: Cổng đối soát giao nhận tháng & phê duyệt nhân viên nhà hàng cho Quản lý nhà hàng (`StaffRole.RESTAURANT_MANAGER`, `MANAGER`, `ADMIN`).
    - `restaurant-staff/nha-hang/page.tsx`: Cổng đối soát giao nhận & ký nhận đồ vải cho Nhân viên nhà hàng (`StaffRole.RESTAURANT_STAFF`, `RESTAURANT_MANAGER`, `MANAGER`, `ADMIN`).
  - Đặt các tuyến đường dùng chung toàn thể nhân sự trực tiếp ngoài thư mục `van-hanh/`:
    - `cham-cong/page.tsx`: Chấm công camera selfie cá nhân & lịch sử ca làm (toàn bộ nhân sự xưởng/đối tác).
    - `phieu-luong/page.tsx`: Nhân viên tra cứu phiếu lương cá nhân (thợ xưởng, tài xế, thủ kho).
    - `bao-cao/page.tsx`: Trung tâm 6 báo cáo tổng hợp Aggregation và xuất streaming file Excel/PDF.
- **Phân hệ Quản trị (`src/app/(internal)/quan-ly/`):**
  - Tách bạch rõ 2 nhóm vai trò chuyên trách:
    - `manager/`: Dành cho Quản lý điều hành xưởng (`StaffRole.MANAGER`, `ADMIN`): `nhan-su/page.tsx` (quản trị nhân sự & phân quyền RBAC), `doi-tac/page.tsx` (chuỗi đối tác & catalog đồ giặt), `cham-cong/page.tsx` (bảng công toàn xưởng & duyệt ca bất thường), `khoan-viec/page.tsx` (báo cáo sản lượng & chốt sản lượng ngày).
    - `accountant/`: Dành cho Kế toán xưởng (`StaffRole.ACCOUNTANT`, `ADMIN`): `xang/page.tsx` (kế toán duyệt/từ chối hóa đơn hoàn xăng), `bang-luong/page.tsx` (cấu hình đơn giá lương & chốt bảng lương chu kỳ).
  - Giữ các trang dùng chung cấp quản trị trực tiếp ngoài thư mục `quan-ly/`:
    - `page.tsx`: Command Center Hub quản trị tổng quan (Quản lý, Kế toán, Admin).
    - `phe-duyet/page.tsx`: Phê duyệt tài khoản nhân viên nội bộ & nhà hàng (Admin, Manager, Restaurant Manager).
- **Hệ thống Định tuyến Centralized Router (`src/app/router.tsx`) & Tương thích ngược:**
  - Cập nhật toàn bộ các route mới theo đúng cấu trúc phân nhóm vai trò.
  - Bổ sung các redirect routes tự động chuyển tiếp từ toàn bộ các URL cũ sang các URL mới mà không gây 404.
  - Xây dựng component `OldHandoverDetailRedirect` chuyển tiếp thông minh param `:recordCode` sang `/van-hanh/shipper/giao-nhan/:recordCode`.
- **Đồng bộ Menu Điều hướng & Luồng Đăng nhập:**
  - `src/components/layout/nav-config.ts`: Cập nhật toàn bộ URL `path` trong `NAV_GROUPS`, tách biệt item menu của Quản lý nhà hàng và Nhân viên nhà hàng, cập nhật hàm `getMobileQuickNavItems(role)`.
  - `src/features/auth/AuthContext.tsx`: Cập nhật hàm `getDefaultRouteForRole` chuyển hướng người dùng sau khi đăng nhập đến đúng trang đích tương ứng với vai trò tài khoản (`WORKER` $\rightarrow$ `/van-hanh/worker/khoan-viec`, `SHIPPER` $\rightarrow$ `/van-hanh/shipper/giao-nhan`, `WAREHOUSE_MANAGER` $\rightarrow$ `/van-hanh/warehouse-manager/kho`, v.v.).
  - Cập nhật các liên kết `navigate(...)` trong `ManagementPage.tsx`, `DashboardPage.tsx`, `HandoverListPage.tsx`, `HandoverDetailPage.tsx`.
- **Cập nhật Tài liệu Quy chuẩn Kỹ thuật:**
  - Cập nhật ma trận đối chiếu API Backend $\rightarrow$ Frontend Routes và cây thư mục định tuyến `src/app/` hoàn chỉnh trong `.agents/skills/create-react-feature/SKILL.md`.

### Plan 11 - Tái Cấu Trúc Route & Giao Diện Thao Tác fe-react-thanhxuan-internal Chuẩn SRS_SDD
- **Tái cấu trúc Centralized Route Tree (`src/app/router.tsx`):**
  - Khai báo đầy đủ các route mới bao phủ 100% các tuyến API của Backend NestJS theo `SRS_SDD.md`.
  - Bổ sung route Quên mật khẩu qua OTP email: `/quen-mat-khau` (`src/app/(auth)/quen-mat-khau/page.tsx`).
  - Bổ sung route Khoán việc thợ xưởng: `/khoan-viec` (`src/app/(internal)/khoan-viec/page.tsx`), tách bạch rõ với trạm rạch bao đếm lại xưởng `/tram-dem`. Cập nhật điều hướng mặc định sau đăng nhập của vai trò `WORKER` sang `/khoan-viec`.
  - Bổ sung route Trung tâm Báo cáo & Xuất file: `/bao-cao` (`src/app/(internal)/bao-cao/page.tsx`).
  - Thiết lập cụm Sub-routes chuyên biệt dưới `/quan-ly/` bọc `ProtectedRoute` kiểm soát vai trò RBAC nghiêm ngặt:
    - `/quan-ly/nhan-su` (`ADMIN`, `MANAGER`): Quản lý tài khoản nhân viên, đổi vai trò, khóa/mở khóa tài khoản.
    - `/quan-ly/phe-duyet` (`ADMIN`, `MANAGER`, `RESTAURANT_MANAGER`): Phê duyệt đăng ký nhân viên nội bộ & nhà hàng.
    - `/quan-ly/cham-cong` (`ADMIN`, `MANAGER`): Bảng công toàn xưởng, duyệt ca làm việc bất thường `NEEDS_REVIEW`.
    - `/quan-ly/khoan-viec` (`ADMIN`, `MANAGER`): Báo cáo sản lượng khoán toàn xưởng, chốt sản lượng cuối ngày (`CONFIRMED`).
    - `/quan-ly/xang` (`ADMIN`, `ACCOUNTANT`): Kế toán xét duyệt hoặc từ chối hoàn tiền xăng đội xe giao nhận.
    - `/quan-ly/bang-luong` (`ADMIN`, `ACCOUNTANT`): Cấu hình đơn giá lương, tính toán bảng lương chu kỳ và chốt sổ kỳ lương (`LOCKED` / `PAID`).
- **Phân rã `ManagementPage.tsx` (từ 866 dòng) thành các Feature Modules độc lập:**
  - Trích xuất toàn bộ các tab nghiệp vụ thành các sub-components độc lập tại `src/features/management/components/`: `StaffManagementView`, `ApprovalManagementView`, `AttendanceReviewView`, `PieceworkConfirmView`, `FuelReviewView`, `PayrollManagementView`, `AuditLogView`.
  - Tái cấu trúc `ManagementPage.tsx` thành Command Center Hub: Tổng hợp các thẻ số liệu cảnh báo (Pending approvals, ca cần duyệt, đề xuất xăng chờ duyệt, kỳ lương hiện tại) kèm Quick Links truy cập trực tiếp bằng Deep Link URL.
- **Module Báo Cáo Mới (`src/features/reports/`):**
  - Xây dựng `reports.service.ts` gọi đầy đủ 6 endpoints báo cáo aggregation backend (`/reports/revenue`, `/reports/production`, `/reports/partners`, `/reports/shipper`, `/reports/worker`, `/reports/fuel-cost`).
  - Tích hợp streaming download trực tiếp file Excel (`/reports/export/excel`) và PDF (`/reports/export/pdf`) thông qua `responseType: 'blob'`.
  - Xây dựng custom hook `useReports.ts` quản lý state bộ lọc thời gian và gọi dữ liệu TanStack Query.
  - Giao diện `ReportsView.tsx` với thiết kế trực quan, KPI metrics, biểu đồ tiến độ và bộ lọc ngày linh hoạt.
- **Module Phục Hồi Mật Khẩu (`src/features/auth/ForgotPasswordPage.tsx`):**
  - Quy trình 2 bước: Nhập email nhận OTP và Nhập mã OTP + mật khẩu mới xác nhận theo API `POST /auth/forgot-password` và `POST /auth/reset-password`.
- **Cập nhật Navigation System (`nav-config.ts`):**
  - Đồng bộ danh mục menu trên Desktop Sidebar (`DesktopSidebar.tsx`), Mobile Bottom Bar (`MobileBottomBar.tsx`) và Mobile Drawer (`MobileNavDrawer.tsx`).
  - Phân quyền hiển thị theo ma trận vai trò người dùng (`hasAccessToNavItem`), tự động điều chỉnh 4 nút thao tác nhanh trên Mobile Bottom Bar theo vai trò (`SHIPPER`, `WORKER`, `ACCOUNTANT`, `WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`).

### Item Catalog Cloudinary Direct Upload & Anti-Orphan-Images Mechanism
- **Backend:** Bổ sung endpoint `POST /api/v1/internal/partners/catalogs/upload-image` (bảo vệ bởi `InternalJwtGuard`, phân quyền `PARTNER_MANAGE`, tích hợp `UploadModule`/`UploadService`), xử lý tải file ảnh trực tiếp lên Cloudinary vào thư mục chuyên dụng `laundry-express/item-catalogs`. Bổ sung cơ chế tự động dọn dẹp ảnh cũ trên Cloudinary (`UploadService.deleteFile`) trong `partners.service.ts` khi người dùng cập nhật ảnh mới hoặc xóa món đồ khỏi danh mục.
- **Frontend:** Nâng cấp `CatalogDialog.tsx` với cơ chế trì hoãn tải ảnh lên Cloudinary (Lazy/Deferred Upload): Khi chọn file ảnh từ máy tính/điện thoại, hệ thống chỉ tạo URL tạm `URL.createObjectURL` để xem trước (Preview) ngay trên giao diện mà hoàn toàn KHÔNG gọi API upload. Chỉ khi người dùng bấm nút "Lưu Thay Đổi" hoặc "Thêm Đồ Giặt", file mới được gửi lên Cloudinary và lưu vào cơ sở dữ liệu. Nếu người dùng bấm Hủy hoặc đóng hộp thoại, URL blob được giải phóng (`URL.revokeObjectURL`) và không có bất kỳ ảnh rác nào được tải lên Cloudinary.

### Item Catalog Image & Filter Refactor
- **Backend:** Bổ sung trường `imageUrl` vào Schema `ItemCatalog`, `CreateItemCatalogDto`, `UpdateItemCatalogDto` và cập nhật `partners.service.ts` (hỗ trợ lưu và cập nhật link ảnh minh họa mặt hàng).
- **Frontend:** Thêm thuộc tính `imageUrl` vào interface `ItemCatalog`. Cập nhật `CatalogDialog.tsx` với ô nhập URL ảnh đồ giặt và khung xem trước ảnh (Preview). Cập nhật `CatalogListView.tsx` thay thế cột "Thương hiệu" bằng cột "Hình ảnh" đồ giặt (thumbnail trực quan, hiệu ứng hover zoom và fallback icon khi ảnh trống/lỗi).
- **Bộ lọc:** Loại bỏ tùy chọn "Tất cả thương hiệu" khỏi dropdown bộ lọc danh mục đồ trong `PartnersCatalogFilter.tsx`, đồng thời tự động chọn thương hiệu đầu tiên trong `PartnersPage.tsx`, đảm bảo dữ liệu đồ giặt luôn phân tách rõ ràng theo từng thương hiệu riêng biệt.

---

## 2026-10-04

### Fix - Khắc phục lỗi HTTP 400 và hoàn thiện thuật toán dời thứ tự hiển thị Item Catalog
- Sửa lỗi HTTP 400 Bad Request khi sửa đồ giặt (ví dụ `4PS_KHAN_AN_XAM`): khai báo `@IsOptional() itemCode?: string` và `@IsString() unit?: string` trong `UpdateItemCatalogDto` nhằm tương thích với `ValidationPipe` (`forbidNonWhitelisted: true`). Phía Frontend loại bỏ `itemCode` khỏi payload của request `PATCH /partners/catalogs/:id`.
- Chuẩn hóa hàm helper `normalizeItemUnit` ở tầng Backend Service `partners.service.ts` để chuyển đổi chuỗi tiếng Việt (`"Chiếc"`, `"Kg"`, `"Bộ"`) sang enum Mongoose (`PIECE`, `KG`, `SET`). Phía Frontend `CatalogDialog.tsx` chuẩn hóa ngược lại enum sang tên hiển thị tiếng Việt trên `<select>`.
- Hoàn thiện thuật toán di chuyển thứ tự hiển thị 2 chiều (`moveSortOrder`) trong `ItemCatalogRepository`: Khi tăng ưu tiên (dời lên trên), toàn bộ các đồ giặt trong khoảng `[newOrder, oldOrder - 1]` tự động cộng thêm 1 (+1). Khi giảm ưu tiên (dời xuống dưới), toàn bộ các đồ giặt trong khoảng `[oldOrder + 1, newOrder]` được đôn lên (-1). Kết hợp `normalizeSortOrders` đảm bảo dãy số thứ tự luôn không trùng nhau và liên tục 1, 2, 3...

### Plan 10 - Tái cấu trúc Item Catalog (sortOrder, phân quyền xóa, isActive)
- **Backend:** Cập nhật Schema `item_catalogs` (thêm `sortOrder: number`, index `{ brand: 1, sortOrder: 1, itemCode: 1 }`, xóa bỏ hoàn toàn `priceToCustomer` và `foldingRateWorker`). Cập nhật `CreateItemCatalogDto` và `UpdateItemCatalogDto`. Bổ sung API `PATCH /partners/catalogs/reorder` cập nhật thứ tự hàng loạt (`ReorderCatalogsDto`). Phân quyền nghiêm ngặt API `DELETE /partners/catalogs/:id` chỉ cho phép Admin (`ACCOUNT_ADMIN`) thực hiện xóa vĩnh viễn (Hard Delete). Bổ sung fallback an toàn trong `piecework.service.ts` và `reports.service.ts`.
- **Quy tắc thứ tự ưu tiên (Business Rule):** Thứ tự hiển thị không được trùng nhau trong cùng một thương hiệu. Khi thêm hoặc sửa thứ tự `sortOrder = X` của một món đồ, hệ thống tự động cộng thêm 1 (+1) cho toàn bộ các món đồ giặt phía sau (`shiftOrdersGte`) và chuẩn hóa (`normalizeSortOrders`) đảm bảo thứ tự luôn liên tục 1, 2, 3...
- **Frontend:** Cập nhật interface `ItemCatalog`. Nâng cấp `CatalogListView` (bỏ 2 cột đơn giá; thêm cột "Thứ tự" kèm các nút di chuyển Lên/Xuống; thêm cột "Trạng thái (Hiển thị)" với nút Toggle `isActive` trực tiếp cho cả Admin và Manager; chỉ render nút "Xóa vĩnh viễn" cho tài khoản `ADMIN`). Cập nhật `CatalogDialog` (loại bỏ 2 ô đơn giá, bổ sung ô nhập thứ tự ưu tiên `sortOrder` và checkbox kích hoạt `isActive`). Nâng cấp `DeleteConfirmDialog` với popup cảnh báo màu đỏ xác nhận xóa vĩnh viễn khỏi CSDL.

### Plan 9 - Phân rã Component PartnersPage, Chuẩn Hóa Bố Cục 4 Tầng & Container-Responsive
- Phân rã toàn diện `PartnersPage.tsx` (>1400 dòng xuống ~240 dòng) thành các sub-components độc lập tại `src/features/partners/components/`: `PartnersTopBanner`, `PartnersActionBar`, `PartnersPartnerFilter`, `PartnersCatalogFilter`, `PartnerListView`, `PartnerCard`, `BrandListView`, `BrandCard`, `CatalogListView`, `PartnerDialog`, `BrandDialog`, `CatalogDialog`, `DeleteConfirmDialog`.
- Thiết lập chuẩn kiến trúc bố cục 4 tầng dọc (Vertical 4-Tier Hierarchy): Tầng 1: `PageBanner`; Tầng 2: `PageActionBar`; Tầng 3: `PageFilterBar`; Tầng 4: Nội dung dữ liệu tự dãn thích ứng container-responsive (`grid-cols-[repeat(auto-fill,minmax(280px,1fr))]`).
- Mở rộng chuẩn hóa cấu trúc 4 tầng cho các trang quản trị chính: `ManagementPage`, `HandoverListPage` và `WarehousePage`.

### Plan 8 - Tái Cấu Trúc Menu & Điều Hướng Hệ Thống Chuẩn UX Quản Trị
- **Desktop (>= 1024px):** Ẩn Bottom Bar; thiết lập Left Sidebar cố định bên trái (`w-64`) theo thị giác F-pattern gồm 4 nhóm phân quyền RBAC kèm thẻ hồ sơ người dùng, ThemeToggle và nút Đăng xuất tại chân Sidebar.
- **Mobile (< 1024px):** Rút gọn thanh chân trang (Bottom Bar) chỉ còn 4 mục thiết yếu + 1 nút "Thêm" mở Navigation Drawer (Sheet) từ cạnh trái hiển thị toàn bộ cây phân hệ quản trị.

### Plan 7 - Quản lý Đối tác, Quản lý Thương hiệu động, Danh mục đồ giặt Pizza 4P's
- Di chuyển trang Quản lý Đối tác sang `/quan-ly/doi-tac`, phân quyền nghiêm ngặt `ADMIN` và `MANAGER`.
- Bổ sung collection `brands`, xây dựng Schema, Repository, DTO, Service và Controller CRUD cho Thương hiệu (`/partners/brands`). Nới lỏng kiểm tra `brand` ở `Partner` và `ItemCatalog` từ enum tĩnh sang string có index.
- Xây dựng phân hệ Quản lý Danh mục đồ giặt theo Thương hiệu. Tạo script seed `seed-pizza-4ps-catalogs.ts` cho Pizza 4P's.

### Plan 6 - Tái Cấu Trúc fe-react-thanhxuan-internal Sang Mô Hình App Router
- Tái cấu trúc tổ chức mã nguồn theo kiến trúc `src/app/` chuẩn App Router (Root Layout, Root Page, Route Group `(auth)` và `(internal)`).
- Xây dựng Centralized Route Tree (`src/app/router.tsx`) qua React Router v7, tinh giản `App.tsx` còn ~7 dòng. Bảo toàn 100% PWA Service Worker precache và hàng đợi IndexedDB offline.

### Plan 5 - Đổi tên bảng staff_accounts thành accounts & Dọn dẹp CSDL
- Đổi tên MongoDB collection `staff_accounts` -> `accounts` trong CSDL `internal_express`, cập nhật schema `StaffAccount`.
- Dọn dẹp collection mồ côi `attendance_logs` và collection tàn dư `staffs` (v1) trong `internal_express`. Chuẩn hóa snake_case cho các bảng marketing trong `laundry_express`.

### Plan 4 - Đổi Hệ Thống Màu Chủ Đạo Web Nội Bộ (Light Blue, Emerald, Dark/Light Mode)
- Tái cấu trúc toàn diện design tokens CSS, tailwind config, ThemeProvider (Light/Dark mode toggle với localStorage).
- Chuyển đổi 100% 14 màn hình của `fe-react-thanhxuan-internal` sang bộ ba màu: Slate-950, Sky `#38bdf8`, Emerald `#34d399` (Dark mode) và White, Sky `#0284c7`, Emerald `#059669` (Light mode).

### Plan 3 / Phase 7 - Mảng Chuyển nhà (fe-nextjs-chuyennhatietkiem)
- Triển khai ứng dụng web Next.js 15+ App Router độc lập `fe-nextjs-chuyennhatietkiem` (cổng 3002).
- Wizard khảo sát & tính giá 4 bước trực quan `QuoteWizardForm`, tích hợp API Backend `/api/v1/moving/quotes/estimate` và đặt lịch khảo sát vào database `moving_express`.
- Xây dựng các trang công khai chuẩn SEO: Trang chủ, Bảng giá, Đặt lịch, Dịch vụ, Tin tức, Liên hệ.

### Plan 3 / Phase 6 - Frontend fe-react-thanhxuan-internal (PWA)
- Cấu hình Progressive Web App (PWA) với `vite-plugin-pwa`, `manifest.webmanifest`, Service Worker precache tài nguyên tĩnh (`workbox`).
- Xây dựng hàng đợi ngoại tuyến IndexedDB (`idb`) tự động đồng bộ khi có kết nối trở lại với tiêu chí Idempotency.
- Phân hệ xác thực nội bộ (Task 6a), Giao diện Nhà hàng & Kho (Task 6b), Giao diện Tài xế Giao nhận & Offline (Task 6c), Giao diện Công nhân & Quản trị xưởng (Task 6d), Tối ưu hóa đóng gói Vendor Chunks (Task 6e).

### Plan 3 / Phase 5 - Báo cáo & Xuất file Streaming
- 6 báo cáo MongoDB Aggregation: `warehouse-summary`, `partner-reconciliation`, `attendance-summary`, `shipper-deliveries`, `variance-incidents`, `fuel-summary`.
- Xuất file Excel XLSX streaming bằng `exceljs` và PDF bằng `pdfmake`, hàng đợi `ExportQueueService` concurrency = 1 chống tràn RAM VPS.

### Plan 3 / Phase 4 - Chấm công, Sản lượng, Xăng xe & Tính lương
- Chấm công vào/ra ca (`attendance_records`) với ảnh chụp selfie camera, cron 00:30 quét ca quá 16h sang `NEEDS_REVIEW`.
- Ghi nhận sản lượng khoán (`piecework_logs`) snapshot đơn giá tại thời điểm làm việc.
- Hoàn tiền xăng xe tài xế (`fuel_logs`). Hệ thống tính lương chu kỳ (`pay_settings`, `payroll_periods`, `payslips`), bảo mật phiếu lương cá nhân.

### Plan 3 / Phase 3 - Nghiệp vụ Giao nhận Kép
- Mở rộng `Partner` với `scheduleAnchorDate`, `defaultShipperId`. Tái cấu trúc Schema `HandoverRecord` v2 hỗ trợ `version` (Optimistic Locking).
- Triển khai `HandoverStateMachine` quản lý chuyển đổi trạng thái nghiêm ngặt, đếm đồ tại nhà hàng kèm chữ ký điện tử Canvas, đếm lại tại xưởng (`recount_tasks`).
- Tự động hóa Cron 00:05 tạo phiếu giao nhận theo lịch đối tác đảm bảo Idempotent.

### Plan 3 / Phase 2 - Tài khoản, Xác thực & Phân quyền
- Hoàn thiện `staff_accounts`, `otp_codes` (TTL), `refresh_tokens` (TTL), `approval_requests`.
- Ma trận RBAC 8 vai trò, `PayFieldFilterInterceptor` lọc trường tiền khi thiếu quyền `pay.view`.
- Xác thực OTP email, khóa tài khoản 15 phút sau 5 lần sai mật khẩu, Refresh Token Rotation TTL 7 ngày.
