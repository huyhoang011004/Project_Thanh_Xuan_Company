# NHẬT KÝ THAY ĐỔI HỆ THỐNG - LƯU TRỮ V2 (PLAN 51 ĐẾN PLAN 53)

> Tài liệu lưu trữ các kế hoạch hoàn thành thuộc giai đoạn vận hành xưởng, tuyến giao nhận Shipper, ca giao nhận chiều và tiền công job tự do.
> 🔗 Quay lại [CHANGELOG.md](../CHANGELOG.md) chính.

---

### Plan 53: Bổ Sung Ca Giao Nhận Buổi Chiều (AFTERNOON) Toàn Hệ Thống

- **Bối cảnh & Yêu cầu:** Trước đây hệ thống giao nhận xưởng và logistics chỉ định nghĩa 2 ca giao nhận mặc định: **Ca Sáng (`MORNING`)** và **Ca Tối (`EVENING`)**. Thực tế phát sinh nhu cầu giao nhận bổ sung **Buổi Chiều (`AFTERNOON`)** (khoảng 14h00 - 17h00) đối với các chuỗi đối tác tiệc chiều hoặc chuyến trung chuyển khẩn cấp trước giờ cao điểm tối.
- **Các thay đổi kiến trúc & kỹ thuật chi tiết:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - Mở rộng enum `deliveryShift` trong Schema `Partner` (`partner.schema.ts`) và `HandoverRecord` (`handover-record.schema.ts`): `['MORNING', 'AFTERNOON', 'EVENING']`.
    - Cập nhật validation DTOs: `CreatePartnerDto`, `UpdatePartnerDto`, `CleanClothesDto` (PrepOrderDto), `CreateHandoverDto` xác thực nghiêm ngặt giá trị `'AFTERNOON'`.
    - Nâng cấp Controller & Service Pool Compensation: Hỗ trợ query parameter `shift?: 'MORNING' | 'AFTERNOON' | 'EVENING'` tại `HandoverController.getPoolHandovers` và `HandoverPoolCompensationService`.
    - Đồng bộ logic kế thừa ca: Phiếu giao nhận tự động kế thừa `deliveryShift` từ đối tác (`MORNING`, `AFTERNOON` hoặc `EVENING`).
    - Verification: Toàn bộ 50 test suites (233 unit tests pass 100%), typecheck `tsc --noEmit` pass.
  - **Frontend Cổng Nội Bộ (`fe-react-thanhxuan-internal`):**
    - **Quản trị đối tác:** Khai báo kiểu `deliveryShift?: 'MORNING' | 'AFTERNOON' | 'EVENING'` trong `partner.types.ts`, `PartnerModal.tsx`. Thêm lựa chọn `<option value="AFTERNOON">Ca Chiều (Buổi chiều)</option>` trong `PartnerContactScheduleFieldsComponent.tsx`.
    - **Thẻ chi nhánh đối tác:** Cập nhật `PartnerCardComponent.tsx` hiển thị badge trực quan theo ca: Ca Sáng (Vàng hổ phách), Ca Chiều (Cam ấm), Ca Tối (Tím).
    - **Màn hình giao nhận Shipper (`ShipperHandoverPage.tsx`):**
      - Nâng cấp thanh lọc ca thành 4 nút: `Tất Cả`, `Sáng (x)`, `Chiều (y)`, `Tối (z)` (tối ưu responsive dạng lưới `grid-cols-2 sm:grid-cols-4` trên điện thoại di động).
      - Icon trực quan: `Sun` (Sáng), `SunMedium` (Chiều), `Moon` (Tối).
      - Mở rộng `useShipperHandoverPage.ts` tính toán chính xác `afternoonCount`, lọc `filteredPoints` và `filteredPoolJobs` theo `AFTERNOON`.
    - **Thẻ điểm giao nhận & Thẻ nhận chuyến:** Cập nhật `ShipperHandoverItemCardComponent.tsx`, `ShipperPendingPointCardComponent.tsx`, `ShipperJobPoolTabComponent.tsx` hiển thị chuẩn xác badge Ca Chiều với nền cam nhạt và chữ cam đậm.
    - **Dropdown chọn chi nhánh khi xuất phiếu kho:** Cập nhật `PrepOrderConfigHeaderComponent.tsx` hiển thị ca giao nhận bên cạnh tên chi nhánh (`• Ca Chiều`, `• Ca Sáng`, `• Ca Tối`) trên cả Mobile và Desktop.
    - Verification: `tsc --noEmit` pass 100%, `pnpm build` pass tạo PWA bundle thành công.
- **Tài liệu & CSDL:** Cập nhật bảng `partners` (1.6) và `handover_records` (1.8) trong `DATABASE_DICTIONARY.md`, cập nhật `srs_sdd_backend.md`, `srs_sdd_fe_internal.md` và `SRS_SDD.md`.

---

### Plan 52: Phân Shipper Cố Định Cho Chi Nhánh Đối Tác, Tab Nhận Chuyến Tự Do & Cài Đặt Tiền Công Job Lẻ / Cụm Tuyến

- **Bối cảnh & Vấn đề giải quyết:**
  - **Phân công Shipper cố định cho chi nhánh đối tác:** Trước đây hệ thống chưa có cơ chế chỉ định một tài xế xe tải (Shipper) cố định phụ trách từng chi nhánh đối tác. Trong mô hình vận hành của công ty Thanh Xuân, các tuyến cố định này được tính theo chế độ lương cố định + phụ cấp theo tháng (không tính tiền chuyến riêng).
  - **Tuyến tự do & Chợ Nhận Chuyến (Job Pool):** Các đối tác chưa được gán cố định cho shipper nào (hoặc các job phát sinh) cần hiển thị tại một tab riêng để các tài xế Shipper có thể chủ động bấm "Nhận chuyến" đi giao nhận. Cần đảm bảo cơ chế nhận chuyến nguyên tử (Atomic Claim) chống xung đột khi 2 tài xế bấm nhận cùng lúc.
  - **Cài đặt tiền công chuyến (Trip Compensation):** Admin và Kế toán (`ACCOUNTANT`) cần công cụ thiết lập tiền công riêng cho các job tự do/phát sinh: 1 job đi 1 đối tác lẻ = `x` VNĐ; 1 job đi nhiều cụm đối tác cùng tuyến = `xx` VNĐ (chia đều số tiền cho từng phiếu thuộc cụm). Toàn bộ tiền công chuyến hoàn thành trong tháng phải được tự động tích hợp cộng vào bảng lương của Shipper (`extraDeliveryPay` và `netPay`).

- **Các thay đổi kiến trúc & kỹ thuật chi tiết:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - Mở rộng Schema `Partner` (`partner.schema.ts`): Thêm trường `defaultShipperId?: Types.ObjectId` tham chiếu tới `StaffAccount` (index `{ defaultShipperId: 1 }`), hỗ trợ DTO `CreatePartnerDto` & `UpdatePartnerDto`.
    - Mở rộng Schema `HandoverRecord` (`handover-record.schema.ts`): Thêm sub-schema `TripCompensation` (`amount`, `clusterId`, `note`, `configuredBy`, `configuredAt`), các trường `tripCompensation`, `claimedAt`, `claimedBy`.
    - Tạo DTOs xác thực nghiêm ngặt: `ClaimHandoverDto` (`src/modules/internal/handovers/dto/claim-handover.dto.ts`), `SetTripCompensationDto` và `ClusterCompensationDto` (`src/modules/internal/handovers/dto/trip-compensation.dto.ts`).
    - Endpoint lấy danh sách tài xế active: Thêm `GET /api/v1/internal/accounts/shippers-list` tại `AccountsController` / `AccountsService` / `StaffAccountRepository` trả về danh sách `_id, fullName, phone, username` của tài xế đang hoạt động.
    - Xử lý nhận chuyến nguyên tử (Atomic Claim): Thêm `claimRecordAtomic` tại `HandoverRecordRepository` dùng MongoDB `findOneAndUpdate({ _id: id, shipperId: null }, { $set: { shipperId: user.sub, claimedAt, claimedBy } }, { new: true })`. Trả về HTTP `409 Conflict` nếu chuyến đã có tài xế khác nhận trước.
    - Xây dựng `HandoverPoolCompensationService`: Quản lý logic lấy danh sách chợ chuyến (`getPoolHandovers`), nhận chuyến (`claimHandover`), cài đặt tiền chuyến lẻ (`setTripCompensation`) và gom cụm nhiều đối tác (`clusterCompensation` sinh mã `CLUSTER-YYYYMMDD-XXXX` chia đều `perRecordAmount = Math.round(totalAmount / N)`).
    - Tích hợp tự động vào bảng lương Shipper: Nâng cấp `payroll-shipper-calculator.helper.ts` tự động lọc các phiếu giao nhận hoàn thành trong tháng có `tripCompensation.amount > 0` đưa vào `ShipperPayDetails.extraDeliveryPay` và cộng trực tiếp vào thu nhập thực nhận `netPay`.
    - Viết bộ unit test toàn diện: `handover-pool-compensation.service.spec.ts` kiểm thử 7 kịch bản nghiệp vụ (Pool filtering, Atomic claim, Race condition handling, Set tiền lẻ, Gom cụm chia đều, Payroll integration). Test chạy PASS 7/7.
  - **Frontend Cổng Nội Bộ (`fe-react-thanhxuan-internal`):**
    - Phân công Shipper trong `PartnerModal.tsx`: Tích hợp dropdown tải danh sách tài xế từ `/accounts/shippers-list`, cho phép chọn Shipper cố định (hưởng lương cứng + phụ cấp) hoặc chọn "Tuyến tự do (Chờ nhận theo chuyến)".
    - Hiển thị trên thẻ đối tác `PartnerCardComponent.tsx`: Badge màu tím hiển thị họ tên và SĐT tài xế cố định phụ trách chi nhánh hoặc nhãn Tuyến tự do.
    - Thêm Tab "Nhận Chuyến" (`POOL`) trên `ShipperHandoverPage.tsx`: Mở rộng `useShipperHandoverPage.ts` hỗ trợ 3 tabs (`ROUTE`, `POOL`, `HISTORY`), query `poolJobs`, mutation `claimJobMutation`.
    - Xây dựng component `ShipperJobPoolTabComponent.tsx`: Hiển thị danh sách chuyến tự do khả dụng kèm badge số lượng, thông tin điểm giao nhận, số món sạch/bao bẩn, tiền công dự kiến và nút "Nhận Chuyến Này".
    - Xây dựng Modal cài đặt tiền công `TripCompensationModal.tsx`: Hỗ trợ 2 chế độ: Chuyến lẻ (`x` VNĐ) và Gom cụm nhiều đối tác cùng tuyến (`xx` VNĐ chia đều), hiển thị trực quan thông tin chi nhánh và tiền chia đều mỗi phiếu.
    - Gắn nút cài đặt tiền công trên phiếu kho: Tích hợp vào `WarehouseCleanPlanTabComponent.tsx` và `WarehouseHandoverPage.tsx` cho phép Thủ kho, Quản lý và Kế toán xem và cập nhật tiền công chuyến ngay trên phiếu xuất kho.

- **Kết quả Kiểm Chứng (Verification):**
  - Backend Unit Tests: 50/50 suites passed, 233/233 tests passed (0 failures).
  - Backend NestJS Build: `pnpm build` thành công (exit code 0).
  - Frontend Internal Typecheck: `pnpm exec tsc --noEmit` pass 100% (0 errors).
  - Frontend Internal Production Build: `pnpm build` thành công, sinh dist bundle và PWA Service Worker (exit code 0).
- **Đồng bộ tài liệu:** Cập nhật đồng bộ `DATABASE_DICTIONARY.md` (1.6 bảng `partners` & 1.8 bảng `handover_records`), `CODEBASE_ATLAS.md` (Endpoints, Services, Components, Modals), `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md` (Document History) và `plan52.md`.

---

### Plan 51: Bổ Sung Tự Nhập Món Đồ Ngoài Setting, Fix Lỗi Recount-Flag, Tối Ưu UI & Fullscreen Mobile Form Đếm Đồ

- **Bối cảnh & Vấn đề giải quyết:**
  - **Khắc phục lỗi HTTP 404 Recount-Flag:** Khi tài xế Shipper tick chọn hoặc hủy chọn checkbox *"Yêu cầu trạm rạch bao đếm lại tại xưởng"* trên màn hình xem trước phiếu, hệ thống gọi `PATCH /api/v1/internal/handover/:id/recount-flag` nhưng Backend thiếu endpoint này dẫn đến thông báo toast đỏ `Cannot PATCH ...`.
  - **Khắc phục lỗi UI cắt viền & tràn lề:** Nút *"Xác Nhận Shipper Đã Giao Hàng & Nhận Đồ Bẩn"* trên mobile hẹp bị co cụm và cắt cụt văn bản (`ác Nhận Shipper...`); cụm nút chọn số bao gom niêm phong (`1 bao`, `2 bao`... `Khác..`) bị tràn ra khỏi mép phải màn hình.
  - **Bổ sung tự nhập món đồ ngoài setting:** Khi chi nhánh đối tác có các món đồ vải phát sinh mới chưa có sẵn trong danh mục bảng giá (`item_catalogs`), tài xế shipper và đối tác không thể ghi nhận số lượng chính xác vào phiếu giao nhận.
  - **Tối ưu Mobile-First & Fullscreen Form đếm đồ Shipper:** Modal đếm đồ trên di động trước đây bị giới hạn kích thước với khoảng cách lề thừa bao quanh khiến không gian đếm đồ bị thu hẹp.

- **Các thay đổi kiến trúc & kỹ thuật chi tiết:**
  - **Backend (`be-nestjs-thanhxuan`):**
    - Tạo mới `RecountFlagDto` (`src/modules/internal/handovers/dto/recount-flag.dto.ts`) validate strict `@IsBoolean()` và `@IsOptional() @IsString() recountReason`.
    - Bổ sung endpoint `@Patch(':id/recount-flag')` tại `HandoverDirtyOperationsController` với phân quyền an toàn `PERMISSIONS.HANDOVER_DELIVER, PERMISSIONS.HANDOVER_RECOUNT_REQUEST`.
    - Cập nhật `HandoverDirtySignatureService` và `HandoverService` xử lý cập nhật trạng thái `recount.isRecount`, `recount.status` (`PENDING` hoặc `NONE`) và lưu ID người yêu cầu (`requestedBy`).
    - Nâng cấp `updateDirtyItemOnBlur` nhận thêm `customItemName?: string` để lưu trực tiếp tên món đồ phát sinh người dùng tự nhập.
  - **Frontend (`fe-react-thanhxuan-internal`):**
    - Nâng cấp `Dialog` (`src/components/ui/dialog.tsx`) hỗ trợ prop `fullScreenOnMobile?: boolean`, tự động gỡ bỏ viền lề ngoài và bo góc trên mobile để modal chiếm trọn 100% diện tích màn hình điện thoại.
    - Xây dựng `CustomHandoverItemModal.tsx` (`src/features/operations/handovers/modals/`) cho phép nhập Tên món đồ, Đơn vị tính (chọn nhanh hoặc tự gõ), Số lượng và Ghi chú; tự động sinh mã `CUSTOM_<timestamp>`.
    - Nâng cấp `useShipperCountForm.ts` và `ShipperCountPartnerModal.tsx`: bật `fullScreenOnMobile={true}`, thêm nút `+ Tự nhập món`, quản lý state `customItems`, hiển thị badge `Ngoài setting` và nút Thùng rác xóa món tự nhập nếu nhập nhầm trong `ShipperCountItemsComponent.tsx`.
    - Thiết kế lại bộ chọn số bao cho Shipper (`ShipperCountSignSectionComponent.tsx` & `ShipperHandoverSignatureSectionComponent.tsx`): hiển thị sẵn 3 nút chọn nhanh `1 bao`, `2 bao`, `3 bao`, kết hợp cụm stepper `[-] [Khác] [+]` vừa vặn trên 1 dòng đơn trên mọi smartphone; đồng bộ số bao gom niêm phong giữa form đếm thay và card giao hàng ngoài; rút gọn nhãn nút gửi thành **"Xác Nhận"** kèm icon Truck.
    - Sửa nút giao hàng trong `ShipperHandoverSignatureSectionComponent.tsx`: chuyển sang `min-h-[46px] h-auto whitespace-normal leading-snug break-words` chống cắt chữ.
    - Cổng đối tác (`PartnerCountTabComponent.tsx` & `PartnerCountItemsViewComponent.tsx`): tích hợp nút `+ Tự nhập món đồ` ngoài setting, hiển thị badge và nút xóa món custom; giữ nguyên không có trường số bao (số bao chỉ dành riêng cho Shipper).

- **Kết quả Kiểm Chứng (Verification):**
  - Backend Typecheck & Lint: Pass 100% (0 errors, 0 warnings).
  - Backend Jest Tests: Pass 3/3 test suites matching handover (`create-handover.dto.spec.ts`, `handover.service.spec.ts`, `handover-state.spec.ts` - 42/42 tests pass).
  - Frontend Internal Typecheck: Pass 100% (`tsc --noEmit` pass không lỗi).
  - Frontend Internal Production Build: Pass 100% (`tsc -b && vite build` tạo bundle dist/ và service worker PWA sạch sẽ).
- **Đồng bộ tài liệu:** Cập nhật `plan51.md` (Completed), `CODEBASE_ATLAS.md` (Bảng 1.1 Backend & Bảng 3 Frontend), `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md` (Document History) và `CHANGELOG.md`.
