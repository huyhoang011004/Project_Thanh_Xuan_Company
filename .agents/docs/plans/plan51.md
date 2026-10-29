# Plan 51: Bổ Sung Tự Nhập Món Đồ Ngoài Setting, Fix Lỗi Recount-Flag, Tối Ưu UI & Fullscreen Mobile Form Đếm Đồ

> Status: Done | Created: 2026-10-29

## 1. Overview & Affected Files

### Mục tiêu & Phạm vi
1. **Khắc phục lỗi HTTP 404 Recount-Flag (Ảnh 1):** Backend NestJS thiếu endpoint `PATCH /api/v1/internal/handover/:id/recount-flag`, khiến checkbox "Yêu cầu trạm rạch bao đếm lại tại xưởng" trên màn hình Shipper báo lỗi toast đỏ. Thêm endpoint và Service cập nhật trạng thái `recount.isRecount` an toàn.
2. **Sửa lỗi tràn chữ / co cụm UI (Ảnh 1 & 2):**
   - Nút *"Xác Nhận Shipper Đã Giao Hàng & Nhận Đồ Bẩn"* trên màn hình mobile hẹp bị cắt viền 2 bên do fixed height và thiếu `whitespace-normal`.
   - Cụm nút *"Số bao gom niêm phong"* (`1 bao`, `2 bao`... `Khác..`) bị tràn ra ngoài lề phải màn hình.
3. **Thêm nút tự nhập 1 món đồ ngoài setting (cả Đối tác đếm và Shipper đếm):** Khi quán có đồ vải mới hoặc đồ phát sinh chưa cấu hình trong bảng catalog chi nhánh, cho phép người dùng mở modal/form nhập Tên món, ĐVT, Số lượng, Ghi chú để thêm trực tiếp vào danh sách kiểm đếm và lưu phiếu.
4. **Tối ưu chọn số bao gom niêm phong cho Shipper:** Số bao gom niêm phong **chỉ dành cho Shipper** (bên Đối tác không có chọn số bao). Tối ưu responsive cụm chọn số bao: co dãn linh hoạt, hỗ trợ stepper `[-] [+]` và nhập số lượng bao nhiêu bao tuỳ ý, không bị tràn viền hay cắt chữ trên mobile.
5. **Tối ưu Mobile-First & Fullscreen Form đếm đồ Shipper:** Nâng cấp `Dialog` hỗ trợ chế độ tràn toàn màn hình (`fullScreenOnMobile`) trên thiết bị di động để tài xế có tối đa không gian thao tác kiểm đếm, nút to rõ, dễ bấm khi thao tác ngoài hiện trường.

### Out of Scope
- Không thêm chọn số bao bên phía Đối tác (đối tác chỉ đếm chi tiết số lượng đồ vải).
- Không thay đổi bảng giá đồ giặt B2B trong `item_catalogs`.
- Không thay đổi logic trạm rạch bao xưởng (`RecountStationPage.tsx`) ngoài việc hiển thị các món tự nhập trong phiếu.

### Assumptions
- Các món đồ tự nhập ngoài catalog có mã định danh tiền tố `CUSTOM_<timestamp>` và lưu kèm `itemName` thực tế trong `dirtyClothes.items` để đảm bảo không bị xung đột với `itemCode` danh mục chuẩn.
- Mọi app tuân thủ `Asia/Ho_Chi_Minh` và phân quyền RBAC.

### Bảng File Ảnh Hưởng
| Path | Action | Lý do |
| :--- | :---: | :--- |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/recount-flag.dto.ts` | `add` | Class DTO validate strict cho endpoint bật/tắt cờ đếm lại recount-flag |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover-dirty-operations.controller.ts` | `edit` | Thêm `@Patch(':id/recount-flag')` và nhận `itemName` ở `dirty-item-onblur` |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/handover.service.ts` | `edit` | Ủy nhiệm gọi `updateRecountFlag` sang Dirty Signature Service |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-dirty-signature.service.ts` | `edit` | Cập nhật DB trạng thái `recount.isRecount`, `status` và `requestedBy` |
| `fe-react-thanhxuan-internal/src/components/ui/dialog.tsx` | `edit` | Hỗ trợ prop `fullScreenOnMobile` để modal tràn viền hoàn toàn trên mobile |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/CustomHandoverItemModal.tsx` | `add` | Modal nhỏ gọn cho phép nhập tên món, ĐVT, số lượng và ghi chú cho đồ ngoài setting |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/ShipperCountPartnerModal.tsx` | `edit` | Bật fullScreenOnMobile, tối ưu layout mobile và thêm nút kích hoạt tự nhập món |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperCountItemsComponent.tsx` | `edit` | Hiển thị badge món đồ tự nhập, hỗ trợ xoá món nhập nhầm |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperCountSignSectionComponent.tsx` | `edit` | Tối ưu responsive cụm chọn số bao gom niêm phong (flex-wrap, stepper, chống tràn lề) |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperHandoverSignatureSectionComponent.tsx` | `edit` | Sửa responsive nút xác nhận giao hàng chống cắt chữ |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/useShipperCountForm.ts` | `edit` | Quản lý state danh sách món đồ tự nhập, gộp vào tổng đếm và payload gửi API |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/PartnerCountTabComponent.tsx` | `edit` | Bổ sung nút tự nhập món đồ ngoài setting cho đối tác (không có chọn số bao) |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/PartnerCountItemsViewComponent.tsx` | `edit` | Hiển thị món tự nhập ở cả dạng Card và dạng Table kèm nút gỡ bỏ |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/usePartnerCountFlow.ts` | `edit` | Quản lý danh sách món tự nhập cho đối tác đưa vào phiếu |
| `.agents/docs/CODEBASE_ATLAS.md` | `edit` | Cập nhật endpoint mới `PATCH /handover/:id/recount-flag` và component mới |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | `edit` | Ghi nhận endpoint recount-flag |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | `edit` | Ghi nhận giao diện fullscreen mobile & tự nhập món ngoài setting |
| `.agents/docs/SRS_SDD.md` | `edit` | Cập nhật 1 dòng Document History |
| `.agents/docs/CHANGELOG.md` | `edit` | Ghi bài luận tiến hóa kỹ thuật chi tiết Plan 51 |

---

## 2. Technical Approach

### 2.1. Backend Endpoint `PATCH /handover/:id/recount-flag`
- **Controller:** `HandoverDirtyOperationsController` (`be-nestjs-thanhxuan/.../handover-dirty-operations.controller.ts:117`)
- **Phân quyền:** `@Permissions(PERMISSIONS.HANDOVER_DELIVER, PERMISSIONS.HANDOVER_RECOUNT_REQUEST)`
- **DTO:**
  ```typescript
  export class RecountFlagDto {
    @IsBoolean()
    isRecount: boolean;

    @IsOptional()
    @IsString()
    recountReason?: string;
  }
  ```
- **Service Logic:**
  - Nếu `isRecount === true`: Cập nhật `recount.isRecount = true`, `recount.status = 'PENDING'`, `recount.reason = recountReason || 'Shipper yêu cầu rạch bao đếm lại tại xưởng'`, `recount.requestedBy = userId`.
  - Nếu `isRecount === false`: Cập nhật `recount.isRecount = false`, `recount.status = 'CANCELLED'`.
  - Lưu vào MongoDB an toàn qua `handoverRepo.updateById`.

### 2.2. Modal Tự Nhập Món Đồ (`CustomHandoverItemModal.tsx`)
- Dùng chung cho cả **Đối tác đếm** và **Shipper đếm**:
- Form gồm:
  - Tên món đồ (`itemName`: bắt buộc, min 2 ký tự).
  - Đơn vị tính (`unit`: dropdown các giá trị thông dụng: Chiếc, Cái, Bộ, Khăn, Kg, hoặc tự gõ, mặc định: "Chiếc").
  - Số lượng ban đầu (`quantity`: number $\ge 1$, mặc định 1).
  - Ghi chú (`note`: tuỳ chọn, ví dụ: "Đồ khách gửi thêm", "Hàng rách cũ").
- Khi submit:
  - Tự động sinh `itemCode = CUSTOM_${Date.now()}`.
  - Chèn vào danh sách đồ kiểm đếm của form hiện hành (Shipper modal hoặc Đối tác tab).
  - Tính ngay vào tổng số lượng đồ đã đếm.
  - Cho phép người dùng chỉnh sửa số lượng bằng input/quick buttons hoặc bấm icon Thùng rác để xoá nếu nhập nhầm.

### 2.3. Tối Ưu UI & Fullscreen Mobile Cho Shipper Modal
- Cập nhật `Dialog` (`fe-react-thanhxuan-internal/src/components/ui/dialog.tsx:17-31`):
  - Hỗ trợ prop `fullScreenOnMobile?: boolean`.
  - Khi bật: wrapper ngoài cùng dùng `p-0 sm:p-6`, modal content dùng `w-full h-[100dvh] max-h-[100dvh] rounded-none sm:rounded-2xl border-0 sm:border flex flex-col`.
  - Giúp Shipper trên điện thoại có 100% diện tích màn hình để thao tác danh mục đồ, cuộn độc lập, footer ghim cố định bên dưới với nút Xác nhận to rõ.
- Sửa lỗi tràn cụm chọn số bao (`ShipperCountSignSectionComponent.tsx:50-77`):
  - **Số bao chỉ dành cho Shipper**.
  - Thiết kế bộ chọn số bao thông minh:
    - Stepper tiện lợi `[-] [Số bao: N] [+]` kết hợp các chip bấm nhanh `1`, `2`, `3`, `4`, `5`, `10 bao`.
    - Ô nhập số bao tùy chỉnh tự do nếu số bao lớn, không bị giới hạn và không bao giờ tràn lề phải.
- Sửa nút Xác nhận Shipper (`ShipperHandoverSignatureSectionComponent.tsx:212-230`):
  - Thêm `min-h-[46px] h-auto py-2.5 px-3 text-xs sm:text-sm whitespace-normal leading-snug break-words` đảm bảo văn bản hiển thị trọn vẹn, căn giữa đẹp mắt, không cắt chữ.

### 2.4. Phía Đối Tác Đếm Đồ
- Phía Đối tác **KHÔNG CÓ** trường chọn số bao gom (chỉ kiểm đếm danh sách đồ vải).
- Bổ sung nút `+ Tự nhập món đồ` trên thanh công cụ danh sách đồ vải đối tác.
- Tích hợp `CustomHandoverItemModal` để đối tác thêm món phát sinh ngoài catalog vào phiếu.

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Backend NestJS
- [x] T1: Tạo `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/recount-flag.dto.ts` với Class DTO `RecountFlagDto` validation strict. - Depends on: none
- [x] T2: Bổ sung method `updateRecountFlag` trong `HandoverDirtySignatureService` (`services/handover-dirty-signature.service.ts`) và `HandoverService` (`handover.service.ts`). - Depends on: T1
- [x] T3: Bổ sung endpoint `@Patch(':id/recount-flag')` trong `HandoverDirtyOperationsController` (`controllers/handover-dirty-operations.controller.ts`) và hỗ trợ nhận `itemName` trong `@Patch(':id/dirty-item-onblur')`. - Depends on: T2
- [x] T4: Chạy typecheck, lint và test Backend verify không lỗi hồi quy. - Depends on: T3

### Giai đoạn 2: Nâng cấp UI Dialog & Modal Tự Nhập Món
- [x] T5: Nâng cấp `fe-react-thanhxuan-internal/src/components/ui/dialog.tsx` hỗ trợ prop `fullScreenOnMobile`. - Depends on: none
- [x] T6: Tạo mới `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/CustomHandoverItemModal.tsx` cho phép nhập tên món, ĐVT, số lượng và ghi chú. - Depends on: none

### Giai đoạn 3: Tối Ưu Form Đếm Đồ Shipper (Mobile Fullscreen, Chọn Số Bao & Fix UI)
- [x] T7: Cập nhật `ShipperCountPartnerModal.tsx` bật chế độ `fullScreenOnMobile`, tối ưu padding, tích hợp `CustomHandoverItemModal`. - Depends on: T5, T6
- [x] T8: Cập nhật `useShipperCountForm.ts` quản lý danh sách `customItems`, gộp vào `catalog` và payload lưu API. - Depends on: T7
- [x] T9: Cập nhật `ShipperCountItemsComponent.tsx` hiển thị badge món tự nhập và nút gỡ bỏ nếu nhập nhầm. - Depends on: T8
- [x] T10: Cải tiến `ShipperCountSignSectionComponent.tsx` thiết kế lại cụm chọn số bao responsive (stepper + chip chọn nhanh, chống tràn lề, chọn số bao tuỳ ý). - Depends on: none
- [x] T11: Sửa nút giao hàng trong `ShipperHandoverSignatureSectionComponent.tsx` chống cắt chữ viền trên mobile. - Depends on: none

### Giai đoạn 4: Bổ Sung Tự Nhập Món Bên Phía Đối Tác Đếm
- [x] T12: Cập nhật `usePartnerCountFlow.ts` và `usePartnerCountTab.ts` quản lý danh sách món tự nhập cho đối tác. - Depends on: T6
- [x] T13: Cập nhật `PartnerCountTabComponent.tsx` bổ sung nút mở `CustomHandoverItemModal` (giữ nguyên không có chọn số bao). - Depends on: T12
- [x] T14: Cập nhật `PartnerCountItemsViewComponent.tsx` hiển thị các món tự nhập rõ ràng ở cả view Card và Table kèm nút xoá nếu nhập nhầm. - Depends on: T13

### Giai đoạn 5: Kiểm Thử & Đồng Bộ Tài Liệu
- [x] T15: Chạy typecheck, lint và build ở cả `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`. - Depends on: T4, T11, T14
- [x] T16: Đồng bộ 5 trụ cột tài liệu (`CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`). - Depends on: T15
- [x] T17: Tự động commit và push lên nhánh `dev`. - Depends on: T16

---

## 4. Verification & Testing

### Lệnh Kiểm Thử Thực Tế
- **Backend:**
  - `pnpm --filter be-nestjs-thanhxuan exec tsc --noEmit`
  - `pnpm --filter be-nestjs-thanhxuan lint`
  - `pnpm --filter be-nestjs-thanhxuan test`
- **Frontend Internal:**
  - `pnpm --filter fe-react-thanhxuan-internal exec tsc --noEmit`
  - `pnpm --filter fe-react-thanhxuan-internal lint`
  - `pnpm --filter fe-react-thanhxuan-internal build`

### Kịch Bản Kiểm Thử
1. **Lỗi ảnh 1 (Recount Flag):** Shipper bấm tick/bỏ tick "Yêu cầu trạm rạch bao đếm lại tại xưởng" -> Gọi `PATCH /api/v1/internal/handover/:id/recount-flag` thành công HTTP 200, hiển thị toast thông báo thành công xanh, không còn lỗi 404 đỏ.
2. **Lỗi nút giao hàng:** Đổi nhãn nút thành *"Xác Nhận"* ngắn gọn, tinh tế kèm icon Truck, không lo tràn viền hay cắt mép chữ.
3. **Chọn số lượng bao nhiêu bao (Shipper):** Cụm chọn số bao gom niêm phong của Shipper hiển thị gọn gàng, có stepper `[-] [+]`, các chip nhanh `1, 2, 3, 5, 10 bao` và ô nhập tùy ý số lượng bao nhiêu bao cũng được, không bị tràn viền.
4. **Phía Đối tác đếm:** Giao diện đối tác không có trường số bao, chỉ có nút "Tự nhập món đồ" ngoài setting.
5. **Fullscreen Mobile Form:** Mở modal đếm đồ trên Shipper mobile -> Chiếm 100% diện tích màn hình, không có khoảng hở thừa viền ngoài, dễ cuộn và bấm.
6. **Tự nhập món ngoài setting:**
   - Shipper hoặc Đối tác bấm "Tự nhập món đồ" -> Nhập tên món "Khăn trải bàn đặc biệt", ĐVT "Cái", SL "5" -> Món đồ xuất hiện ngay trong danh mục, tính vào tổng số lượng, khi lưu phiếu hiển thị đúng tên món và số lượng.

---

## 5. Risks & Rollback

- **Rủi ro:** Mã món đồ tự nhập không có trong catalog khi trạm đếm lại xưởng xem xét.
  - **Giảm thiểu:** Lưu trực tiếp `itemName` đi kèm `itemCode: CUSTOM_...` vào mảng `dirtyClothes.items`. Hàm hiển thị ưu tiên `it.itemName || it.itemCode` nên luôn hiển thị đúng tên người dùng đã nhập.
- **Rollback:** `git revert HEAD` để khôi phục trạng thái nhánh `dev`.

## Changelog
- 2026-10-29: Khởi tạo Plan 51 giải quyết toàn diện lỗi recount-flag, tối ưu fullscreen mobile, UI nút và tính năng tự nhập món đồ ngoài setting.
- 2026-10-29: Cập nhật plan theo phản hồi: Bỏ chọn số bao bên phía Đối tác (số bao chỉ dành riêng cho Shipper), Đối tác chỉ bổ sung nút tự nhập món đồ ngoài setting.

## Execution Log
- 2026-10-29: Hoàn tất toàn bộ 17/17 tasks theo Plan 51.
  - Backend: Bổ sung `RecountFlagDto`, endpoint `PATCH /api/v1/internal/handover/:id/recount-flag`, service `updateRecountFlag` và cập nhật `updateDirtyItemOnBlur` nhận `itemName`. Verify tsc, lint, test pass 42/42 tests.
  - Frontend Internal: Nâng cấp `Dialog` hỗ trợ `fullScreenOnMobile`, tạo modal `CustomHandoverItemModal`, tích hợp nút tự nhập món đồ ngoài setting cho cả Shipper và Đối tác, thiết kế lại cụm chọn số bao Shipper (stepper `[-] [+]`, chip `1, 2, 3, 4` và nhập tự do), sửa nút giao hàng chống cắt chữ trên mobile. Verify tsc, build pass 100%.
  - Đồng bộ 5 trụ cột tài liệu: `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`.

