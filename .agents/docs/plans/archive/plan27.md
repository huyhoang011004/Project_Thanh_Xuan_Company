# Plan 27: Tinh Gọn Triệt Để Bản Ghi HandoverRecord - Loại Bỏ Lặp Base64 Chữ Ký & Mảng Mặc Định Rỗng

> Status: Completed | Created: 2026-10-13 | Updated: 2026-10-13

## 1. Overview & Affected Files

### 1.1. Mục tiêu
- **Triệt tiêu nhân đôi chuỗi Base64 chữ ký**:
  - Hiện tại chữ ký của thủ kho đang được lưu song song ở 2 nơi: `cleanClothes.preparedBySignature` và `signatures.warehouseManager.signature`. Mỗi chuỗi Base64 dài khoảng 30KB - 50KB, khiến mỗi bản ghi phình to gấp đôi một cách lãng phí.
  - Chuẩn hóa: Toàn bộ chữ ký 4 bên chỉ lưu duy nhất tại khối `signatures.*`. Xóa bỏ hoàn toàn `preparedBySignature`, `preparedByName`, `warehouseManagerId`, `at` khỏi sub-schema `CleanClothes`. Sub-schema `CleanClothes` chỉ còn `items: CleanItemLine[]`.
- **Loại bỏ các trường mặc định rỗng (Empty Defaults) trong Schema**:
  - Bỏ `default: () => ({ items: [] })` ở `dirtyClothes` $\rightarrow$ chỉ xuất hiện khi có phát sinh đồ bẩn.
  - Bỏ `default: []` ở `notes` $\rightarrow$ chỉ xuất hiện khi có ghi chú lỗi/rách.
  - Bỏ `isRecount: boolean` thừa ở root document (đã có trong `recount.isRecount`).
  - Bỏ `default: () => ({ isRecount: false, status: 'NONE' })` ở `recount` $\rightarrow$ chỉ lưu khi có yêu cầu đếm lại.
  - Tinh gọn `CleanItemLine`: không ép lưu `undeliveredQuantity: 0` và `quantityReturned: 0` khi mới soạn đồ sạch.
- **Dọn dẹp CSDL thực tế**:
  - Cập nhật script `drop-legacy-collections.ts` với `$unset` các trường thừa và dọn dẹp các mảng rỗng trên toàn bộ documents trong MongoDB Atlas.
  - Chạy `pnpm run db:drop-legacy`.
- **Đồng bộ hóa Frontend & Backend & Tài liệu**:
  - Frontend components đọc chữ ký từ `signatures.warehouseManager`.
  - Cập nhật [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md), [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md), [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md), [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).

### 1.2. Bảng các file bị ảnh hưởng
| Path | Action | Lý do |
| :--- | :---: | :--- |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts` | Edit | Bỏ `preparedByName`, `preparedBySignature`, `warehouseManagerId`, `at` khỏi `CleanClothes`. Bỏ default rỗng của `dirtyClothes`, `notes`, `recount`. Bỏ cờ thừa `isRecount` ở root. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts` | Edit | Bỏ gán `preparedByName`, `preparedBySignature` vào `cleanClothes`; chỉ lưu vào `signatures.warehouseManager`. Bỏ khởi tạo object rỗng cho `dirtyClothes`, `notes`, `recount`. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-flow.service.ts` | Edit | Bỏ gán `cleanClothes.preparedByName/Signature` trong `savePrepSlip`. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/clean-clothes.dto.ts` | Edit | Dọn dẹp thuộc tính trùng lặp. |
| `be-nestjs-thanhxuan/src/scripts/drop-legacy-collections.ts` | Edit | Thêm lệnh `$unset` các trường thừa trong `cleanClothes`, `isRecount` và dọn các mảng rỗng cũ. |
| `fe-react-thanhxuan-internal/src/types/index.ts` | Edit | Tinh gọn `CleanClothes` chỉ còn `items: CleanItemLine[]`. |
| `fe-react-thanhxuan-internal/src/features/operations/partners/PartnerPortalPage.tsx` | Edit | Đọc chữ ký thủ kho từ `signatures.warehouseManager.signature`. |
| `fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerReceiptTabComponent.tsx` | Edit | Đọc chữ ký thủ kho từ `signatures.warehouseManager`. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperHandoverItemCardComponent.tsx` | Edit | Fallback đọc chữ ký từ `signatures.warehouseManager`. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverExportHelper.ts` | Edit | Đảm bảo vẽ phiếu xuất từ `signatures.warehouseManager`. |
| `.agents/docs/DATABASE_DICTIONARY.md` | Edit | Cập nhật cấu trúc bảng 1.8 `handover_records` và sub-document `cleanClothes`. |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | Edit | Cập nhật đặc tả cấu trúc bản ghi siêu tinh gọn. |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | Edit | Đồng bộ types và luồng đọc chữ ký. |
| `.agents/docs/CHANGELOG.md` | Edit | Ghi nhận chi tiết bài luận nhật ký Plan 27. |

---

## 2. Technical Approach

### 2.1. Cấu trúc bản ghi HandoverRecord sau khi tinh gọn
Khi thủ kho hoàn thành soạn đồ sạch:
```json
{
  "_id": ObjectId("6acd9c9b926fbfab35f39aea"),
  "recordCode": "GN-TT-14102026",
  "recordDate": "2026-10-14",
  "partnerId": ObjectId("6ac0dddade0a67ce6e6152d3"),
  "partnerName": "Pizza 4P's - Tràng Tiền",
  "brand": "PIZZA_4PS",
  "warehouseManagerId": ObjectId("6ac169b8de0a67ce6e615bbd"),
  "warehouseManagerName": "Quản Lý Kho Hàng",
  "deliveryShift": "EVENING",
  "version": 1,
  "cleanClothes": {
    "items": [
      {
        "itemCode": "4PS_KHAN_AN_XAM",
        "itemName": "4PS_KHAN_AN_XAM",
        "deliveryQuantity": 2
      }
    ]
  },
  "signatures": {
    "warehouseManager": {
      "name": "Quản Lý Kho Hàng",
      "signature": "data:image/png;base64,...",
      "at": ISODate("2026-10-14T03:00:00.000Z")
    }
  }
}
```
Không còn:
- `cleanClothes.preparedByName`
- `cleanClothes.preparedBySignature` (tiết kiệm hoàn toàn 30KB - 50KB chuỗi Base64 bị nhân đôi)
- `cleanClothes.warehouseManagerId`
- `cleanClothes.at`
- `dirtyClothes: { items: [] }`
- `notes: []`
- `isRecount: false`
- `recount: { isRecount: false, status: 'NONE' }`

---

## 3. Implementation Tasks (Checklist)

- [x] T1: Cập nhật Mongoose Schema [`handover-record.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts) - Bỏ `preparedByName`, `preparedBySignature`, `warehouseManagerId`, `at` khỏi `CleanClothes`. Bỏ default rỗng của `dirtyClothes`, `notes`, `recount`. Bỏ cờ thừa `isRecount` ở root.
- [x] T2: Cập nhật [`handover-record.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts) và [`handover-flow.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-flow.service.ts) - Không gán dữ liệu thừa vào `cleanClothes`, chỉ lưu vào `signatures.warehouseManager`, không gán object/mảng rỗng khi tạo mới.
- [x] T3: Cập nhật script dọn dẹp [`drop-legacy-collections.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/scripts/drop-legacy-collections.ts) với `$unset` các trường thừa và chạy `pnpm run db:drop-legacy`.
- [x] T4: Cập nhật Frontend types [`types/index.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/types/index.ts) và các components đọc chữ ký (`PartnerPortalPage`, `PartnerReceiptTabComponent`, `ShipperHandoverItemCardComponent`, `HandoverExportHelper`).
- [x] T5: Kiểm thử và xác minh (typecheck, build cả Backend & Frontend, kiểm tra document MongoDB thực tế).
- [x] T6: Đồng bộ tài liệu kỹ thuật ([DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md), [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md), [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md), [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md)).
- [x] T7: Tự động commit và push lên nhánh `dev` theo quy định tại `AGENTS.md`.
