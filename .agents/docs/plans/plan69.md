# Plan 69: Giai Đoạn 1 - Hoàn Thiện Nghiệp Vụ Giao Nhận Khăn, Kiểm Nhận Đồ Sạch & Thao Tác Vận Hành (Yêu Cầu 2, 3, 4, 5a, 7)

> Status: Done | Created: 2026-11-19 | Completed: 2026-11-19 | Hệ thống: be-nestjs-thanhxuan & fe-react-thanhxuan-internal

---

## 1. Overview & Affected Files

### 1.1. Mục Tiêu & Phạm Vi
- **Mục tiêu:** Nâng cấp và chuẩn hóa toàn diện 5 mắt xích cốt lõi trong quy trình giao nhận khăn 2 chiều giữa xưởng giặt là, tài xế shipper và đối tác nhà hàng, giải quyết triệt để các bất cập trong việc đếm đồ, ghi chú, kiểm nhận và thông báo đối soát.
- **Phạm vi gồm 5 nghiệp vụ cụ thể:**
  1. *(Yêu cầu 2)*: Bắn thông báo realtime/in-app cho tài khoản nhà hàng (`PARTNER_STAFF`, `PARTNER_MANAGER`) ngay khi bộ phận kiểm đếm tại xưởng hoàn tất đếm lại hoặc điều chỉnh số liệu khăn nhận về.
  2. *(Yêu cầu 3)*: Bổ sung cột/ô nhập "Ghi chú" cho từng món đồ bẩn của nhân viên đối tác (tạp dề kid/NV, rèm màu gì, bọc xe to/nhỏ...), hỗ trợ lưu nguyên tử onBlur và in lên phiếu.
  3. *(Yêu cầu 4)*: Tái thiết kế bảng kiểm nhận đồ sạch của đối tác: hiển thị rõ ràng 3 cột (Số giao theo sổ, Thực nhận, Lệch thiếu/dư so với sổ), sửa lỗi ngầm gán cứng `received = expected` tại client và lưu đúng chênh lệch.
  4. *(Yêu cầu 5a)*: Thêm nút thao tác nhanh "Đếm Lại" cho tài xế Shipper khi phát hiện số lượng thực tế trong bao lệch với số lượng nhà hàng đã ghi trên hệ thống.
  5. *(Yêu cầu 7)*: Thêm ô ghi nhận "Hàng tồn nội bộ không ghi trong sổ" tại khâu đóng gói / soạn đồ sạch xuất kho (`PrepOrderModal`), chỉ lưu trong hệ thống cho xưởng theo dõi, tuyệt đối không in lên phiếu giao khách.
- **Out of scope:** Mẫu xuất Excel ma trận tháng theo ngày (thuộc Plan 70), Giao ngoài và Lịch làm việc thợ xưởng (thuộc Plan 71).

### 1.2. Assumptions & Open Questions
- **Assumptions:**
  - Thông báo điều chỉnh khăn chỉ gửi đến các tài khoản đối tác thuộc đúng chi nhánh của phiếu giao nhận (`record.partnerId`).
  - Số thiếu/dư đồ sạch là so sánh giữa thực nhận của đối tác với số lượng xuất kho (`deliveryQuantity`) của nhân viên bên xưởng ghi trên phiếu hôm nay, hoàn toàn độc lập với lượng đồ dơ nhận về hôm trước.
- **Open Questions:** Không có. Các quy tắc nghiệp vụ đã được khách hàng định nghĩa rõ ràng.

### 1.3. Bảng File Ảnh Hưởng
| Path | Action | Lý do |
| :--- | :---: | :--- |
| `backend-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts` | Edit | Bổ sung trường `internalInventoryNote` và chuẩn hóa schema note/variance đồ sạch |
| `backend-thanhxuan/src/modules/internal/handovers/services/handover-recount.service.ts` | Edit | Thêm gửi notification cho đối tác trong `completeRecount` (dòng 90-170) |
| `backend-thanhxuan/src/modules/internal/handovers/services/handover-dirty-signature.service.ts` | Edit | Cập nhật `updateDirtyItemOnBlur` để nhận và lưu trường `note` từng món; trigger thông báo trong `updateRecountActual` |
| `backend-thanhxuan/src/modules/internal/handovers/controllers/handover-dirty-operations.controller.ts` | Edit | Mở rộng API `PATCH :id/dirty-item-onblur` nhận thêm `@Body('note')` |
| `backend-thanhxuan/src/modules/internal/handovers/services/handover-clean-prep.service.ts` | Edit | Lưu trường `internalInventoryNote` khi thủ kho soạn đồ sạch |
| `thanhxuan-internal/src/components/notifications/NotificationBell.tsx` | Edit | Xử lý điều hướng khi bấm vào thông báo điều chỉnh số liệu khăn |
| `thanhxuan-internal/src/features/operations/handovers/components/PartnerCountItemsViewComponent.tsx` | Edit | Thêm cột Ghi chú ở chế độ Table và ô Ghi chú ở chế độ Card khi đếm đồ bẩn |
| `thanhxuan-internal/src/features/operations/handovers/hooks/usePartnerCountTab.ts` | Edit | Xử lý onBlur lưu ghi chú từng món đồ bẩn |
| `thanhxuan-internal/src/features/operations/handovers/components/PartnerReceiptItemsTableComponent.tsx` | Edit | Tái thiết kế bảng kiểm nhận đồ sạch: 3 cột Giao theo sổ, Thực nhận, Thiếu/dư |
| `thanhxuan-internal/src/features/operations/handovers/hooks/usePartnerReceiptFlow.ts` | Edit | Sửa lỗi gán cứng `received = expected` tại dòng 160, gửi đúng số thực nhận và variance |
| `thanhxuan-internal/src/features/operations/handovers/components/ShipperHandoverSlipPreviewComponent.tsx` | Edit | Bổ sung nút "Đếm Lại" cạnh nút "Đếm thay" cho tài xế Shipper |
| `thanhxuan-internal/src/features/operations/handovers/components/ShipperHandoverItemCardComponent.tsx` | Edit | Tích hợp action Đếm lại trên card chuyến đi |
| `thanhxuan-internal/src/features/operations/handovers/components/PrepOrderItemTableComponent.tsx` | Edit | Thêm khu vực nhập "Hàng tồn nội bộ (không in sổ)" cho khâu soạn đóng gói |
| `thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx` | Edit | Quản lý state và payload cho trường hàng tồn nội bộ |
| `thanhxuan-internal/src/features/operations/handovers/HandoverExportHelper.ts` | Edit | Đảm bảo Canvas renderer hiển thị ghi chú từng món và KHÔNG in hàng tồn nội bộ lên phiếu |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | Edit | Cập nhật API contracts và quy tắc nghiệp vụ |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | Edit | Cập nhật đặc tả giao diện kiểm nhận, đếm đồ, shipper recount và hàng tồn |
| `.agents/docs/DATABASE_DICTIONARY.md` | Edit | Cập nhật bảng `handover_records` bổ sung `internalInventoryNote` |
| `.agents/docs/CHANGELOG.md` | Edit | Ghi nhật ký thực hiện Plan 69 |

---

## 2. Technical Approach

### 2.1. Kiến Trúc & Data Flow
1. **Thông báo điều chỉnh khăn:** `HandoverRecountService.completeRecount` $\rightarrow$ Tính chênh lệch đếm $\rightarrow$ `NotificationsService.send` đến tất cả tài khoản `PARTNER_*` có `partnerId` tương ứng.
2. **Ghi chú từng món đồ bẩn:** Client `onBlur` ô ghi chú $\rightarrow$ gọi `PATCH /handover/:id/dirty-item-onblur` với `{ itemCode, quantityReceived, note }` $\rightarrow$ lưu nguyên tử vào Mongoose document.
3. **Kiểm nhận đồ sạch:** Client nhập số thực nhận $\rightarrow$ tính `diff = received - deliveryQuantity` $\rightarrow$ gửi payload `{ itemCode, expected, received, result: diff < 0 ? 'SHORT' : (diff > 0 ? 'EXCESS' : 'ENOUGH'), note }`.
4. **Hàng tồn nội bộ:** Thủ kho nhập vào ô `internalInventoryNote` $\rightarrow$ lưu vào root trường của `HandoverRecord`, hoàn toàn bỏ qua trong hàm `renderHandoverDeliverySlipToCanvas`.

### 2.2. Schema & Interface Changes
```typescript
// Bổ sung vào HandoverRecord
export class HandoverRecord {
  // ... các trường hiện có
  @Prop({ trim: true })
  internalInventoryNote?: string; // Ghi chú hàng tồn nội bộ không in lên phiếu
}

// Bổ sung DTO OnBlur
export class DirtyItemOnBlurDto {
  itemCode: string;
  quantityReceived: number;
  itemName?: string;
  note?: string; // Ví dụ: "Tạp dề kid 15 cái, người lớn 20 cái"
}
```

---

## 3. Implementation Tasks (Checklist)

- [x] T1: Cập nhật Schema `HandoverRecord` tại `backend-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts`: thêm trường `internalInventoryNote` - Depends on: none
- [x] T2: Sửa endpoint `PATCH :id/dirty-item-onblur` trong `handover-dirty-operations.controller.ts` và `handover-dirty-signature.service.ts`: nhận thêm `note` và cập nhật vào `dirtyClothes.items.$.note` cùng `dirtyClothes.partnerCount.items.$.note` - Depends on: T1
- [x] T3: Bổ sung trigger gửi thông báo cho tài khoản đối tác trong `completeRecount` (`handover-recount.service.ts:90-170`) và `updateRecountActual` - Depends on: T1
- [x] T4: Cập nhật `handover-clean-prep.service.ts` lưu trường `internalInventoryNote` khi tạo/sửa phiếu xuất kho - Depends on: T1
- [x] T5: Sửa `PartnerCountItemsViewComponent.tsx` (< 280 dòng): thêm cột Ghi chú (Table view) và ô nhập Ghi chú (Card view) kèm placeholder hướng dẫn - Depends on: T2
- [x] T6: Cập nhật hook `usePartnerCountTab.ts` và `usePartnerCountFlow.ts` để lưu `note` onBlur tương tự như số lượng - Depends on: T5
- [x] T7: Thiết kế lại `PartnerReceiptItemsTableComponent.tsx` (< 280 dòng): 3 cột rõ ràng (Giao theo sổ, Thực nhận, Lệch thiếu/dư), hỗ trợ nhập số thực nhận trực tiếp - Depends on: none
- [x] T8: Sửa hàm `confirmReceiptMutation` trong `usePartnerReceiptFlow.ts`: sửa lỗi gán cứng `received = expected`, truyền đúng số thực nhận và variance - Depends on: T7
- [x] T9: Thêm nút "Đếm Lại" trên `ShipperHandoverSlipPreviewComponent.tsx` và `ShipperHandoverItemCardComponent.tsx`: mở popup xác nhận đếm lại kèm lý do chênh lệch - Depends on: none
- [x] T10: Bổ sung ô nhập "Ghi chú hàng tồn xưởng (Chỉ lưu nội bộ, không in lên phiếu)" trong `PrepOrderModal.tsx` và `PrepOrderItemTableComponent.tsx` - Depends on: T4
- [x] T11: Cập nhật `HandoverExportHelper.ts` để render ghi chú món đồ dơ lên canvas và KHÔNG in `internalInventoryNote` lên phiếu giao khách - Depends on: T2, T10
- [x] T12: Viết/cập nhật unit test backend cho `handover-recount.service.spec.ts` và `handover-clean-prep.service.spec.ts` - Depends on: T2, T3, T4
- [x] T13: Kiểm thử toàn diện quy trình: Nhà hàng đếm ghi chú $\rightarrow$ Shipper đếm lại $\rightarrow$ Xưởng đếm lại có thông báo $\rightarrow$ Kiểm nhận đồ sạch $\rightarrow$ Soạn hàng có ghi chú tồn kho - Depends on: T12
- [x] T14: Đồng bộ 4 tài liệu kỹ thuật: `DATABASE_DICTIONARY.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `CHANGELOG.md` - Depends on: T13

---

## 4. Verification & Testing

- **Backend:** `pnpm exec tsc --noEmit && pnpm test -- handover`
- **Frontend:** `pnpm exec tsc --noEmit && pnpm build`
- **Definition of Done:**
  - Nhà hàng nhập ghi chú (ví dụ: *Tạp dề kid*) $\rightarrow$ lưu thành công, hiển thị lại khi F5.
  - Xưởng sửa số lượng khăn $\rightarrow$ Tài khoản nhà hàng nhận chuông thông báo hiển thị chi tiết số lệch.
  - Nhà hàng kiểm nhận đồ sạch: gõ thực nhận 95 (sổ ghi 100) $\rightarrow$ cột lệch báo ngay -5 màu đỏ, lưu đúng vào hệ thống.
  - Shipper bấm "Đếm lại" hoạt động mượt mà.
  - Thủ kho soạn hàng lưu ghi chú tồn xưởng $\rightarrow$ phiếu xuất kho gửi khách sạch sẽ, không lộ thông tin nội bộ.

---

## 5. Risks & Rollback

- **Rủi ro:** Khi sửa giao diện kiểm nhận đồ sạch, nếu đối tác không hiểu có thể nhầm lẫn giữa hàng thiếu của hôm nay và hàng nợ hôm trước.
- **Giảm thiểu:** Thêm dòng giải thích rõ ràng dưới tiêu đề: *"Số thiếu/dư là chênh lệch so với số nhân viên giao hôm nay. Các món chưa giao hoặc nợ cũ được ghi riêng tại phiếu xuất kho."*

---

## Changelog

- 2026-11-19: Khởi tạo Plan 69 gộp 5 yêu cầu nghiệp vụ giao nhận khăn & đối tác giai đoạn 1.
- 2026-11-19: Hoàn tất thực thi và kiểm thử 100% 14 tasks (Backend Typecheck/Test/Build pass, Frontend Typecheck/Build pass). Cập nhật đồng bộ 5 trụ cột tài liệu.

## Execution Log
- **T1-T4 (Backend Schema & Services):** Đã bổ sung `actualReceivedQuantity`, `varianceQuantity`, `note`, `internalInventoryNote` trong schema và DTOs; hoàn thiện endpoint nguyên tử `PATCH :id/dirty-item-onblur` nhận note; tích hợp trigger thông báo `HANDOVER_RECOUNT_UPDATED` tới kênh `partner_${partnerId}`.
- **T5-T10 (Frontend PWA Handovers):** Đã nâng cấp `usePartnerCountTab`, `PartnerCountItemsViewComponent` hỗ trợ ghi chú từng món; sửa lỗi `usePartnerReceiptFlow` và hoàn thiện `PartnerReceiptItemsTableComponent` 3 cột; bổ sung nút "Đếm lại" (đỏ rose) cho tài xế; tích hợp ô ghi chú hàng tồn nội bộ trong `PrepOrderModal`.
- **T11 (Canvas Renderer):** Đã kiểm chứng `handoverCanvasTableDrawer.ts`: `item.note` được vẽ chuẩn xác ở cột Ghi chú, `internalInventoryNote` hoàn toàn không bị vẽ lên phiếu.
- **T12-T13 (Verification):** Backend 49/49 Jest tests pass; Backend `nest build` pass; Frontend `tsc -b` và `vite build` pass 100%.
- **T14 (Docs):** Đã đồng bộ `DATABASE_DICTIONARY.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, và `CHANGELOG.md`.
