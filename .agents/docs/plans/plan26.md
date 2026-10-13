# Plan 26: Chuẩn Hóa Schema HandoverRecord, Loại Bỏ Status & Dữ Liệu Thừa, Đồng Bộ DeliveryShift

> Status: In progress | Created: 2026-10-13 | Updated: 2026-10-13

## 1. Overview & Affected Files

### 1.1. Mục tiêu
- **Dọn dẹp triệt để dữ liệu thừa thãi trong CSDL MongoDB (`handover_records`)**: Loại bỏ hoàn toàn trường `status` và các trường tàn dư cũ (`seq`, `defects`, `edit_marks`, `adjustments`, `actualQuantity`, `variance`, `bagPhotos`, `receipt_check`, `receiptCheck`, `quantity`, `undeliveredQty`, `returnedDebtQty`, `generalNote`).
- **Chuẩn hóa Mongoose Schema [`handover-record.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts)**: Tinh gọn đúng 18 trường cốt lõi, không lưu `status` cứng trong DB. Tiến độ thực hiện của phiếu được dẫn xuất tự nhiên từ các mốc dữ liệu thực tế (chữ ký thủ kho `signatures.warehouseManager`, chữ ký nhận đối tác `signatures.partnerCheck`, link ảnh `slipImageUrl`).
- **Đồng bộ hóa nghiệp vụ `deliveryShift`**:
  - Tự động kế thừa `deliveryShift` (`MORNING` | `EVENING`) từ thông tin chi nhánh đối tác (`Partner.deliveryShift`) khi thủ kho hoặc hệ thống tạo phiếu giao nhận (`createHandover`, `planHandover`, `createOrUpdatePrepOrder`, `createPartnerCountRecord`).
  - Hỗ trợ truyền tùy chọn `deliveryShift` trong DTO nếu muốn chỉ định ca cụ thể.
- **Cập nhật tài liệu kỹ thuật**:
  - Sửa lỗi hiển thị Markdown bị vỡ cột của trường `deliveryShift` và `billingType` tại mục 1.6 (`partners`) trong [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md).
  - Xóa bỏ hoàn toàn dòng `status` khỏi mục 1.8 (`handover_records`) trong [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md).
- **Migration & Cleanup Script**: Cập nhật script dọn dẹp để `$unset` toàn bộ `status` và các trường thừa trên các bản ghi hiện có trong MongoDB thực tế.

### 1.2. Out of Scope
- Không thay đổi nghiệp vụ ký số Canvas và xuất ảnh Cloudinary.
- Không thay đổi luồng rạch bao đếm lại (`recount`).

### 1.3. Bảng các file bị ảnh hưởng
| Path | Action | Lý do |
| :--- | :---: | :--- |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts` | Edit | Bỏ trường `status`, bỏ index `status`; loại bỏ các prop thừa (`seq`, `defects`, `edit_marks`, `adjustments`, fallback sub-props). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts` | Edit | Bỏ gán `status` khi tạo phiếu; loại bỏ các điều kiện `if (record.status === ...)`; kế thừa tự động `deliveryShift` từ đối tác. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-flow.service.ts` | Edit | Chuyển logic kiểm tra trạng thái từ `record.status` sang kiểm tra chữ ký (`signatures.partnerCheck`). |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-recount.service.ts` | Edit | Dọn dẹp/chuyển đổi logic defects cũ sang `notes`; không phụ thuộc vào `status`. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts` | Edit | Dọn dẹp endpoints cũ không còn dùng (`:id/defects`, `:id/adjustments`); bỏ filter `status`. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/repositories/handover-record.repository.ts` | Edit | Bỏ query/sort theo `status` và `seq`. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/create-handover.dto.ts` | Edit | Thêm `deliveryShift?: 'MORNING' | 'EVENING'`; dọn dẹp các field cũ. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/clean-clothes.dto.ts` | Edit | Dọn dẹp `generalNote` và fallback properties. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/dirty-clothes.dto.ts` | Edit | Dọn dẹp `actualQuantity`, `variance` khỏi DTO. |
| `be-nestjs-thanhxuan/src/scripts/drop-legacy-collections.ts` | Edit | Thêm bước `$unset: { status: "", seq: "", defects: "", edit_marks: "", adjustments: "", ... }` trên collection `handover_records`. |
| `fe-react-thanhxuan-internal/src/types/index.ts` | Edit | Bỏ `status` và các field thừa khỏi type `HandoverRecord`. Thêm helper suy luận trạng thái hiển thị. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx` | Edit | Bỏ `generalNote` hoàn toàn khỏi payload gửi lên API. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverDetailPage.tsx` | Edit | Thay thế các điều kiện `record.status === HandoverStatus...` bằng kiểm tra chữ ký (`record.signatures?.partnerCheck`). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/HandoverHeaderComponent.tsx` | Edit | Tính badge trạng thái dẫn xuất từ chữ ký thay vì enum `status`. |
| `fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerHistoryTabComponent.tsx` | Edit | Hiển thị trạng thái giao nhận từ chữ ký. |
| `.agents/docs/DATABASE_DICTIONARY.md` | Edit | Sửa lỗi vỡ cột bảng 1.6 (`partners`), cập nhật `deliveryShift`, `scheduleAnchorDate`, `defaultShipperId`; xóa `status` và chuẩn hóa bảng 1.8 (`handover_records`). |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | Edit | Cập nhật contract mới của HandoverRecord (không còn status) và cơ chế kế thừa `deliveryShift`. |

---

## 2. Technical Approach

### 2.1. Cấu trúc Schema HandoverRecord tinh gọn (Target Model - 18 Trường)
Bản ghi trong MongoDB `handover_records` chỉ chứa đúng các trường sau:
```typescript
interface HandoverRecord {
  _id: ObjectId;
  recordCode: string;             // Mã phiếu GN-XXX-DDMMYYYY
  recordDate: string;             // YYYY-MM-DD (Asia/Ho_Chi_Minh)
  brand: string;                  // Snapshot mã thương hiệu (PIZZA_4PS...)
  partnerId: ObjectId;            // Ref: Partner
  partnerName?: string;           // Snapshot tên chi nhánh
  warehouseManagerId?: ObjectId;  // Ref: StaffAccount (thủ kho soạn)
  warehouseManagerName?: string;  // Snapshot tên thủ kho
  shipperId?: ObjectId;           // Ref: StaffAccount (tài xế giao nhận)
  shipperName?: string;           // Snapshot tên tài xế
  deliveryShift: 'MORNING' | 'EVENING'; // Ca giao nhận (kế thừa từ Partner hoặc chỉ định)
  version: number;                // Khóa lạc quan (mặc định 1)
  cleanClothes: {                 // Nhánh đồ sạch xuất xưởng
    items: CleanItemLine[];       // itemCode, itemName, deliveryQuantity, undeliveredQuantity, quantityReturned
    preparedByName?: string;
    preparedBySignature?: string;
    warehouseManagerId?: ObjectId;
    at?: Date;
  };
  dirtyClothes: {                 // Nhánh đồ bẩn thu gom
    items: DirtyItemLine[];       // itemCode, itemName, quantityReceived, actualQuantityReceived
    partnerCount?: { ... };
  };
  notes: HandoverItemNote[];      // Thay thế hoàn toàn defects: itemCode, itemName, note
  isRecount: boolean;             // Cờ cần rạch bao đếm lại xưởng
  recount: {                      // Thông tin trạm đếm lại
    isRecount: boolean;
    status: 'NONE' | 'PENDING' | 'DONE';
    reason?: string;
    note?: string;
    requestedBy?: ObjectId;
    recountedBy?: ObjectId;
    recountedAt?: Date;
  };
  signatures: {                   // Chữ ký 4 bên
    warehouseManager?: SignatureEntry;
    shipper?: SignatureEntry;
    partnerCount?: SignatureEntry;
    partnerCheck?: SignatureEntry;
  };
  slipImageUrl?: string;          // Link ảnh WebP trên Cloudinary
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2. Cơ chế suy luận trạng thái dẫn xuất (Derived Status)
Khi Frontend hoặc Báo cáo cần hiển thị nhãn trạng thái trực quan:
```typescript
function getHandoverDerivedStatus(record: HandoverRecord): { label: string; color: string } {
  if (record.signatures?.partnerCheck) {
    return { label: 'Đã hoàn tất', color: 'green' };
  }
  if (record.signatures?.warehouseManager || (record.cleanClothes?.items?.length ?? 0) > 0) {
    return { label: 'Đã soạn đồ / Đang giao', color: 'blue' };
  }
  return { label: 'Mới tạo / Chờ soạn', color: 'yellow' };
}
```

### 2.3. Logic kế thừa ca giao nhận `deliveryShift`
Khi tạo phiếu giao nhận mới:
```typescript
const effectiveShift = dto.deliveryShift || partner?.deliveryShift || 'MORNING';
```
Áp dụng nhất quán trên 4 luồng tạo phiếu:
1. `createHandover`: Lấy từ `dto.deliveryShift || partner.deliveryShift || 'MORNING'`.
2. `planHandover` (tự động theo lịch): Lấy từ `partner.deliveryShift || 'MORNING'`.
3. `createOrUpdatePrepOrder` (thủ kho tạo phiếu soạn đồ): Lấy từ `dto.deliveryShift || partner.deliveryShift || 'MORNING'`.
4. `createPartnerCountRecord` (đối tác đếm trước đồ bẩn): Lấy từ `dto.deliveryShift || partner.deliveryShift || 'MORNING'`.

### 2.4. Dọn dẹp dữ liệu cũ (Data Migration & Cleanup)
Chạy lệnh `$unset` trong MongoDB:
```javascript
db.collection('handover_records').updateMany({}, {
  $unset: {
    status: "",
    seq: "",
    defects: "",
    edit_marks: "",
    adjustments: "",
    "cleanClothes.generalNote": "",
    "dirtyClothes.actualQuantity": "",
    "dirtyClothes.variance": "",
    "recount.bagPhotos": "",
    receipt_check: ""
  }
});
```

---

## 3. Implementation Tasks (Checklist)

- [x] T1: Cập nhật tài liệu [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md) - Sửa lỗi bảng vỡ cột tại mục 1.6 (`partners`), cập nhật đầy đủ các trường `deliveryShift`, `scheduleAnchorDate`, `defaultShipperId`; xóa bỏ hoàn toàn dòng `status` và chuẩn hóa mục 1.8 (`handover_records`).
- [x] T2: Cập nhật Schema [handover-record.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts) - Xóa bỏ `status`, bỏ index `status`, và xóa toàn bộ các `@Prop` tàn dư (`seq`, `receipt_check`, `defects`, `edit_marks`, `adjustments`, `actualQuantity`, `variance`, `bagPhotos`, `quantity`, `undeliveredQty`, `returnedDebtQty`, `receiptCheck`, `generalNote`).
- [x] T3: Cập nhật các DTO trong Backend (`create-handover.dto.ts`, `clean-clothes.dto.ts`, `dirty-clothes.dto.ts`) - Bổ sung `deliveryShift?: 'MORNING' | 'EVENING'`, loại bỏ các thuộc tính không cần thiết và `status`.
- [x] T4: Chuẩn hóa [handover-record.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts) & [handover-flow.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-flow.service.ts) - Bỏ gán và kiểm tra `status`; tự động kế thừa `deliveryShift` từ đối tác khi tạo phiếu; bỏ khởi tạo mảng rỗng cho các trường đã xóa.
- [x] T5: Dọn dẹp [handover-recount.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-recount.service.ts), [handover-record.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/repositories/handover-record.repository.ts), và [handover.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts) - Loại bỏ/chuẩn hóa các endpoint và audit log liên quan đến `defects` và `adjustments` cũ; bỏ lọc `status`.
- [x] T6: Cập nhật script dọn dẹp [drop-legacy-collections.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/scripts/drop-legacy-collections.ts) (thêm `$unset` cho `status` và các field rác) và thực thi lệnh `pnpm run db:drop-legacy` để loại bỏ khỏi MongoDB thực tế.
- [ ] T7: Cập nhật Frontend [types/index.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/types/index.ts), [PrepOrderModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx), [HandoverDetailPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverDetailPage.tsx), [HandoverHeaderComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/components/HandoverHeaderComponent.tsx) - Thay thế kiểm tra `status` bằng kiểm tra chữ ký (`signatures.partnerCheck`), bỏ `generalNote`, `defects`, `edit_marks`, `adjustments`.
- [ ] T8: Kiểm thử toàn diện (Backend build, Frontend build, typecheck, tạo thử phiếu giao nhận mới để xác minh dữ liệu trong MongoDB không còn trường thừa và không còn `status`).
- [ ] T9: Cập nhật tài liệu kiến trúc [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md), [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md), và ghi nhận [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm thử bắt buộc
- Backend:
  - `pnpm exec tsc --noEmit` tại `be-nestjs-thanhxuan/`
  - `pnpm build` tại `be-nestjs-thanhxuan/`
  - `pnpm run db:drop-legacy` tại `be-nestjs-thanhxuan/`
- Frontend:
  - `pnpm exec tsc --noEmit` tại `fe-react-thanhxuan-internal/`
  - `pnpm build` tại `fe-react-thanhxuan-internal/`

### 4.2. Kịch bản kiểm chứng thực tế
1. **Kiểm tra bản ghi mới sinh ra**: Gọi API tạo phiếu soạn đồ (Prep Order) hoặc tạo phiếu giao nhận mới $\rightarrow$ Kiểm tra document trong MongoDB: xác nhận `status`, `seq`, `defects`, `edit_marks`, `adjustments`, `actualQuantity`, `variance`, `bagPhotos`, `generalNote` hoàn toàn KHÔNG xuất hiện.
2. **Kiểm tra ca giao nhận (`deliveryShift`)**:
   - Đối tác có cấu hình `deliveryShift = 'EVENING'` $\rightarrow$ Khi tạo phiếu, phiếu mới tự động có `deliveryShift = 'EVENING'`.
   - Đối tác có cấu hình `deliveryShift = 'MORNING'` $\rightarrow$ Phiếu mới tự động có `deliveryShift = 'MORNING'`.
3. **Kiểm tra bản ghi cũ sau khi chạy script cleanup**: Toàn bộ documents cũ trong MongoDB đã được `$unset` sạch sẽ `status` và các trường rác.
4. **Kiểm tra giao diện Frontend**: Các màn hình vận hành hiển thị mượt mà, xác định trạng thái phiếu chuẩn xác qua chữ ký (đã giao / chưa giao) mà không bị lỗi undefined do thiếu `status`.

---

## 5. Risks & Rollback

- **Rủi ro**: Nếu Frontend hoặc Backend còn sót câu lệnh đọc `record.status`, TypeScript Strict Mode sẽ cảnh báo lỗi biên dịch ngay lập tức (`Property 'status' does not exist on type 'HandoverRecord'`).
- **Biện pháp giảm thiểu**: Quét toàn bộ repository bằng `grep_search` trước khi xóa, sửa toàn bộ nơi gọi sang helper dẫn xuất `getHandoverDerivedStatus` hoặc kiểm tra `signatures.partnerCheck` trước khi chạy test/build.
- **Rollback**: Toàn bộ thay đổi được quản lý qua Git, có thể khôi phục bằng `git checkout` nếu cần.

## Changelog
- 2026-10-13: Khởi tạo Plan 26 theo yêu cầu tinh gọn Schema HandoverRecord, dọn rác MongoDB và đồng bộ `deliveryShift`.
- 2026-10-13: Bổ sung loại bỏ hoàn toàn trường `status` theo yêu cầu người dùng, chuyển sang trạng thái dẫn xuất dựa trên chữ ký thực tế.
