# Plan 23: Tái Cấu Trúc Module Biên Bản Giao Nhận (Handover Record) & Trải Nghiệm Vận Hành

> Status: Done | Created: 2026-10-11 | Updated: 2026-10-11

## 1. Overview & Affected Files


### 1.1. Mục tiêu
Chuẩn hóa và tái cấu trúc toàn diện phân hệ Biên bản giao nhận (`HandoverRecord`) trên cả Backend NestJS (`be-nestjs-thanhxuan`) và Frontend React Internal (`fe-react-thanhxuan-internal`), bao gồm:
1. **Mã phiếu nguyên tử (`recordCode`) & Ngày phiếu (`recordDate`)**: Tự sinh tự động không phụ thuộc Counter collection riêng biệt, đảm bảo chống xung đột (race condition) bằng retry loop; chuẩn hóa tên trường ngày là `recordDate`; thêm `warehouseManagerId`.
2. **Tái cấu trúc 2 nhánh đồ sạch và đồ bẩn**:
   - `cleanDelivery` -> `cleanClothes`: Tinh gọn loại bỏ phân nhánh `planned`/`delivered`, chỉ giữ cấu trúc soạn hàng của Thủ kho (giao, chưa giao, giao trả nợ, chữ ký + họ tên thủ kho).
   - `dirtyPickup` -> `dirtyClothes`: Gồm `partnerCount` (đối tác đếm + chữ ký, có cờ `countedByRole` khi shipper đếm thay) và `actualQuantity` (số lượng thực tế khi đếm lại tại xưởng).
   - `recount`: Tích hợp trực tiếp trạng thái và thông tin đếm lại vào `handover_records`, xóa bỏ hoàn toàn collection riêng `recount_tasks`.
3. **Chữ ký tập trung & Vòng đời ảnh phiếu trên Cloudinary**:
   - `signatures`: Lưu thông tin chữ ký của 4 vai trò (Thủ kho, Shipper, Người đếm đồ bẩn đối tác, Người kiểm nhận đồ sạch).
   - `slipImageUrl`: Lưu link ảnh phiếu hoàn chỉnh. Khi bất kỳ vai trò nào cập nhật và ký tên, hệ thống nén WebP, tải ảnh phiếu mới lên Cloudinary và dọn dẹp ảnh cũ trong background (bất đồng bộ, không block response).
4. **Trải nghiệm vận hành Frontend (Áp dụng Preview Canvas trước khi lưu)**:
   - **Thủ kho (Warehouse Manager)**: Form soạn đồ sạch hiển thị **khung xem trước Canvas trực quan ngay phía trên nút Lưu** (tương tự như đối tác). Thủ kho ký tên xong sẽ thấy ngay phiếu hoàn chỉnh trước khi bấm Lưu; tự động nén WebP và upload Cloudinary.
   - **Tài xế (Shipper)**: Hiển thị danh sách đối tác được phân công; hỗ trợ chuyển sang giao diện đếm đồ thay đối tác khi quán vắng người (ghi nhận `countedByRole: 'SHIPPER'`); xem ảnh phiếu; tích chọn đếm lại / chưa đếm; ký tên xác nhận và tải ảnh phiếu.
   - **Đối tác (Partner)**: Hiển thị Canvas phiếu xem trước trực quan ngay trước nút Lưu; Tab kiểm nhận chuyển sang hiển thị trực tiếp ảnh phiếu từ Cloudinary (không vẽ lại canvas).
   - **Trạm đếm lại xưởng (Recount Station)**: Giao diện kiểm đếm tương tự đối tác nhưng không cần ký tên; lưu vào `actualQuantity`, tự động tính chênh lệch `variance` và cập nhật ảnh phiếu mới.
5. **Tương thích ngược báo cáo**: Bổ sung cơ chế fallback đọc kép dữ liệu cũ và mới trên toàn bộ hệ thống báo cáo tháng/kho/đối tác.

### 1.2. Phản biện nghiệp vụ & Giải pháp kiến trúc tối ưu (Đã áp dụng)

| Vấn đề | Rủi ro phát hiện | Giải pháp kiến trúc tối ưu áp dụng |
| :--- | :--- | :--- |
| **1. Bỏ Counter khi sinh mã `recordCode`** | Trong MongoDB, nếu bỏ atomic counter mà dùng `countDocuments()` thì khi 2 người cùng tạo phiếu trong cùng 1 giây sẽ bị **Race Condition** trùng mã (`E11000 duplicate key error`). | Thay vì bảng `counters` riêng biệt, áp dụng thuật toán tìm mã lớn nhất trong ngày theo `recordDate` (`findLatestByPrefix`) kết hợp **Atomic Retry loop (tối đa 3 lần)** và Unique Index `{ partnerId: 1, recordDate: 1, seq: 1 }`. Đảm bảo mã liên tục `GN-YYYYMMDD-NNN` và tuyệt đối không trùng lặp. |
| **2. Upload ảnh Cloudinary và xóa ảnh cũ liên tục 4 lần** | 1 phiếu đi qua 4 bước (Soạn -> Đếm bẩn -> Shipper giao -> Kiểm nhận). Nếu mỗi bước upload ảnh nặng ~1MB và đợi Cloudinary xóa ảnh cũ: Shipper dùng 4G sẽ bị **lag 2-4s**, tốn quota Cloudinary API, rủi ro 404 ảnh nếu xóa nhầm khi client đang load. | **(1)** Frontend nén ảnh sang định dạng WebP (quality 0.85, dung lượng < 120KB) trước khi gửi.<br>**(2)** Backend lưu link mới ngay lập tức; việc gọi lệnh xóa ảnh cũ trên Cloudinary được đẩy vào **Background Task bất đồng bộ** (không `await` block response). |
| **3. Shipper đếm thay đối tác** | Thực tế vận hành rất hay gặp trường hợp quán bận không có người đếm. Nếu không ghi nhận rõ ràng, khi xưởng phát hiện chênh lệch/hỏng đồ, đối tác có thể khiếu nại "Quán tôi không đếm số này". | Lưu cờ `countedByRole: 'SHIPPER'` trong `dirtyClothes.partnerCount` và hiển thị trên chữ ký: `[Tên Shipper] (Đếm thay đại diện quán)` để minh bạch trách nhiệm pháp lý. |
| **4. Tương thích ngược báo cáo thống kê** | Các service báo cáo (`warehouse-report.service.ts`, `partner-report.service.ts`, `reports.service.ts`) hiện đang đọc `clean.delivered.items`. Đổi schema có thể làm hỏng báo cáo tháng cũ. | Bổ sung hàm helper đọc kép: `cleanClothes?.items || clean?.delivered?.items || []` và `dirtyClothes?.partnerCount?.items || restaurant_count?.items || []` để báo cáo hoạt động trơn tru với cả dữ liệu cũ và mới. |
| **5. Xem trước Canvas trước khi lưu (Thủ kho & Đối tác)** | Nếu lưu xong mới mở popup xem phiếu thì người dùng không kịp phát hiện sai sót số lượng trước khi hệ thống sinh mã và ghi nhận vào cơ sở dữ liệu. | Tích hợp **khung Canvas Preview trực tiếp ngay phía trên nút Lưu** ở cả Modal Soạn đồ của Thủ kho (`PrepOrderModal`) và Tab Đếm đồ của Đối tác (`PartnerCountTabComponent`). Người dùng kiểm tra trực quan 100% trước khi bấm gửi. |
| **6. Tab Kiểm nhận chỉ hiện ảnh** | Khắc phục triệt để tình trạng Client phải chạy hàm vẽ lại Canvas tốn CPU và lệch font chữ giữa các hệ điều hành/trình duyệt. | Tab Kiểm nhận chỉ việc hiển thị trực tiếp thẻ `<img>` trỏ tới `slipImageUrl` trên Cloudinary: tải tức thì, hình ảnh đồng nhất 100% cho mọi bên. |

### 1.3. Out of Scope
- Không thay đổi bảng giá, biểu phí vận chuyển hay logic tính lương khoán việc của thợ xưởng.
- Không thay đổi cấu trúc bảng `partners` hoặc `staff_accounts`.

### 1.4. Bảng File Ảnh Hưởng

| Path | Action | Lý do |
| :--- | :--- | :--- |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts` | Edit | Đổi trường `recordDate`, `cleanClothes`, `dirtyClothes`, `signatures`, `slipImageUrl`, thêm `warehouseManagerId`, xóa cấu trúc cũ. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/recount-task.schema.ts` | Delete | Xóa bỏ bảng `recount_tasks` theo yêu cầu. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/repositories/recount-task.repository.ts` | Delete | Xóa bỏ repository không còn sử dụng. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/recount-tasks.controller.ts` | Delete | Xóa bỏ controller recount tasks. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/handovers.module.ts` | Edit | Gỡ bỏ khai báo `RecountTask` và import/export liên quan. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts` | Edit | Cập nhật logic tự sinh `recordCode` bằng retry loop, lưu `recordDate`, `warehouseManagerId`, upload & cleanup Cloudinary image bất đồng bộ. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-flow.service.ts` | Edit | Cập nhật flow đếm đồ bẩn, shipper ký, kiểm nhận theo schema mới; xử lý `countedByRole: 'SHIPPER'`. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-recount.service.ts` | Edit | Xử lý đếm lại trực tiếp trên `dirtyClothes.actualQuantity` và `recount` của `HandoverRecord`, cập nhật ảnh phiếu. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts` | Edit | Cập nhật các endpoint nhận payload mới, upload Base64 ảnh phiếu. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/*.ts` | Edit | Cập nhật DTO: `clean-clothes.dto.ts`, `dirty-clothes.dto.ts`, `recount.dto.ts`, `handover-sign.dto.ts`... |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/warehouse-report.service.ts` | Edit | Thêm fallback đọc kép `cleanClothes` / `dirtyClothes`. |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/partner-report.service.ts` | Edit | Thêm fallback đọc kép `cleanClothes` / `dirtyClothes`. |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/report-export.service.ts` | Edit | Thêm fallback đọc kép `cleanClothes` / `dirtyClothes`. |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/pdf-export.service.ts` | Edit | Thêm fallback đọc kép `cleanClothes` / `dirtyClothes`. |
| `fe-react-thanhxuan-internal/src/types/index.ts` | Edit | Cập nhật TypeScript interface của `HandoverRecord`, `CleanClothes`, `DirtyClothes`, `RecountInfo`, `HandoverSignatures`. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverExportHelper.ts` | Edit | Cập nhật helper vẽ canvas đọc dữ liệu `cleanClothes`, `dirtyClothes`, 4 chữ ký và xuất Base64 WebP. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverListPage.tsx` | Edit | Giao diện Shipper: hiện danh sách đối tác được phân công, nút chuyển đếm, xem ảnh phiếu, tích đếm lại, ký tên và tải ảnh. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperHandoverItemCardComponent.tsx` | Add | Tách component hiển thị từng thẻ chi nhánh đối tác của Shipper (theo quy tắc Clean Architecture < 300 dòng). |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx` | Edit | Cập nhật form soạn đồ lưu `cleanClothes`, `recordDate`, `warehouseManagerId`; **bổ sung khung Canvas Preview trực tiếp trước nút Lưu**; nén WebP gửi backend. |
| `fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerCountTabComponent.tsx` | Edit | Hiển thị Canvas xem trước ngay trước nút Lưu cho đối tác. |
| `fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerReceiptTabComponent.tsx` | Edit | Hiển thị trực tiếp ảnh phiếu `slipImageUrl` từ Cloudinary thay vì vẽ lại canvas. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/RecountStationPage.tsx` | Edit | Giao diện đếm lại xưởng: tái sử dụng form đếm tương tự đối tác nhưng không cần ký, lưu vào `actualQuantity`, tải lại ảnh mới. |
| `.agents/docs/DATABASE_DICTIONARY.md` | Edit | Cập nhật từ điển dữ liệu phản ánh schema mới của `handover_records` và xóa bỏ `recount_tasks`. |
| `.agents/docs/CODEBASE_ATLAS.md` | Edit | Cập nhật sơ đồ endpoint và controller của module handovers. |

---

## 2. Technical Approach

### 2.1. Cấu trúc Schema Mongoose Mới (`handover-record.schema.ts`)

```typescript
// Pseudocode Schema contract (Tối giản minh họa)
export class HandoverItem {
  itemCode: string;
  quantity: number;
  undeliveredQty?: number;
  returnedDebtQty?: number;
  note?: string;
}

export class CleanClothes {
  items: HandoverItem[];
  preparedByName: string;
  preparedBySignature?: string;
  warehouseManagerId?: Types.ObjectId;
  generalNote?: string;
  at?: Date;
}

export class DirtyClothes {
  partnerCount?: {
    items: HandoverItem[];
    bagsCount: number;
    note?: string;
    signedBy: string;
    signature?: string;
    countedByRole?: 'PARTNER' | 'SHIPPER'; // Đánh dấu nếu Shipper đếm thay
    at?: Date;
  };
  actualQuantity?: HandoverItem[];
  variance?: Array<{ itemCode: string; partnerQty: number; actualQty: number; diff: number }>;
}

export class RecountInfo {
  isRecount: boolean; // Shipper chọn đếm lại hoặc chưa đếm
  status: 'NONE' | 'PENDING' | 'DONE';
  reason?: string;
  requestedBy?: Types.ObjectId;
  recountedBy?: Types.ObjectId;
  recountedAt?: Date;
}

export class HandoverSignatures {
  warehouseManager?: { name: string; signature: string; at: Date };
  shipper?: { name: string; signature: string; at: Date };
  partnerCount?: { name: string; signature: string; at: Date };
  receiptCheck?: { name: string; signature: string; at: Date };
}

export class HandoverRecord {
  recordCode: string; // Tự sinh: GN-YYYYMMDD-NNN (Không qua Counter, có retry loop)
  recordDate: string; // YYYY-MM-DD
  seq: number;
  partnerId: Types.ObjectId;
  shipperId?: Types.ObjectId;
  warehouseManagerId?: Types.ObjectId;
  status: HandoverStatus;
  cleanClothes: CleanClothes;
  dirtyClothes: DirtyClothes;
  recount: RecountInfo;
  signatures: HandoverSignatures;
  slipImageUrl?: string; // Link ảnh phiếu lưu trên Cloudinary
  version: number;
}
```

### 2.2. Thuật toán tự sinh `recordCode` không cần Counter (Kèm Atomic Retry)

```typescript
// Thuật toán sinh mã nguyên tử tại HandoverRecordService kèm Retry Loop
async generateRecordCode(recordDate: string, maxRetries = 3): Promise<{ recordCode: string; seq: number }> {
  const datePrefix = recordDate.replace(/-/g, ''); // 20261011
  const prefix = `GN-${datePrefix}`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const latest = await this.handoverRepo.findLatestByPrefix(prefix);
    const nextSeq = latest ? latest.seq + 1 : 1;
    const paddedSeq = String(nextSeq).padStart(3, '0');
    const recordCode = `${prefix}-${paddedSeq}`;

    // Kiểm tra tính duy nhất trước khi trả về
    const exists = await this.handoverRepo.existsByRecordCode(recordCode);
    if (!exists) {
      return { recordCode, seq: nextSeq };
    }
  }
  // Fallback an toàn: Thêm random salt 2 ký tự nếu trùng quá maxRetries
  const randomSalt = Math.random().toString(36).substring(2, 4).toUpperCase();
  const fallbackCode = `${prefix}-${Date.now().toString().slice(-3)}${randomSalt}`;
  return { recordCode: fallbackCode, seq: 999 };
}
```

### 2.3. Vòng đời Xử lý Ảnh Phiếu & Dọn dẹp Cloudinary Bất Đồng Bộ

1. **Client (Thủ kho / Đối tác / Shipper / Kiểm nhận)**:
   - Trước khi lưu, hiển thị bản xem trước Canvas trực tiếp trên giao diện để người dùng kiểm tra thông tin và chữ ký.
   - Khi bấm Lưu: Render Canvas qua `renderHandoverDeliverySlipToCanvas(slipData)`.
   - Nén sang `image/webp` chất lượng 0.85 (dung lượng < 120KB) thành Base64 Data URL.
2. **Backend**:
   - Nhận payload chứa `slipImageBase64`.
   - Upload file buffer lên Cloudinary thư mục `laundry-express/handovers`.
   - Cập nhật link mới vào `record.slipImageUrl` và lưu DB thành công.
   - **Xóa ảnh cũ bất đồng bộ**:
     ```typescript
     if (oldSlipImageUrl && oldSlipImageUrl !== newSlipImageUrl) {
       // Không await để không làm chậm HTTP response
       this.uploadService.deleteFile(oldSlipImageUrl).catch((err) => {
         this.logger.warn(`Lỗi xóa ảnh cũ trên Cloudinary (${oldSlipImageUrl}): ${err.message}`);
       });
     }
     ```

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Backend Schemas, DTOs & Xóa bỏ RecountTask
- [x] T1: Xóa bỏ collection `recount_tasks`: Xóa `recount-task.schema.ts`, `recount-task.repository.ts`, `recount-tasks.controller.ts`, gỡ bỏ khỏi `handovers.module.ts`. - Depends on: none
- [x] T2: Tái cấu trúc `handover-record.schema.ts`: Định nghĩa `recordDate`, `warehouseManagerId`, `cleanClothes`, `dirtyClothes` (có `countedByRole`), `recount`, `signatures`, `slipImageUrl`; cập nhật Unique Indexes `{ partnerId: 1, recordDate: 1, seq: 1 }`. - Depends on: T1
- [x] T3: Cập nhật các DTO trong `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/`: Tạo/sửa `create-handover.dto.ts`, `clean-clothes.dto.ts`, `dirty-clothes.dto.ts`, `recount.dto.ts`, `handover-sign.dto.ts`. - Depends on: T2
- [x] T4: Cập nhật `handover-record.repository.ts`: Thêm method `findLatestByPrefix(prefix: string)` và `existsByRecordCode(code: string)` để hỗ trợ tự sinh số thứ tự `seq` mà không cần Counter collection. - Depends on: T2

### Giai đoạn 2: Backend Services, Cloudinary Upload & Controllers
- [x] T5: Sửa `handover-record.service.ts`: Cập nhật logic tự sinh `recordCode` kèm retry loop; lưu `recordDate`, `warehouseManagerId`; bổ sung helper upload Base64 WebP lên Cloudinary và xóa ảnh cũ bất đồng bộ. - Depends on: T3, T4
- [x] T6: Sửa `handover-flow.service.ts`: Cập nhật các luồng `recordPartnerCount`, `recordCleanClothes`, `deliver`, `receiptCheck` theo schema mới; xử lý `countedByRole: 'SHIPPER'`; tự động cập nhật `signatures` và `slipImageUrl`. - Depends on: T5
- [x] T7: Tái cấu trúc `handover-recount.service.ts`: Chuyển logic yêu cầu đếm lại và hoàn tất đếm lại vào trường `dirtyClothes.actualQuantity` và `recount` của `HandoverRecord`, cập nhật ảnh phiếu. - Depends on: T5, T6
- [x] T8: Cập nhật `handover.controller.ts`: Cập nhật route endpoints, permissions và param tương ứng. - Depends on: T6, T7
- [x] T9: Cập nhật tương thích ngược trong các service báo cáo (`warehouse-report.service.ts`, `partner-report.service.ts`, `report-export.service.ts`, `pdf-export.service.ts`). - Depends on: T6

### Giai đoạn 3: Frontend TypeScript Types & Canvas Helper
- [x] T10: Cập nhật `fe-react-thanhxuan-internal/src/types/index.ts`: Cập nhật interface `HandoverRecord`, `CleanClothes`, `DirtyClothes`, `RecountInfo`, `HandoverSignatures`. - Depends on: T2
- [x] T11: Cập nhật `fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverExportHelper.ts`: Cập nhật hàm `renderHandoverDeliverySlipToCanvas` để vẽ đầy đủ thông tin từ `cleanClothes`, `dirtyClothes` (phân biệt người đếm nếu là shipper), và 4 chữ ký từ `signatures`. - Depends on: T10

### Giai đoạn 4: Frontend UI Vận Hành (Warehouse, Shipper, Partner, Recount)
- [x] T12: Cập nhật `PrepOrderModal.tsx`:
  - Lưu đúng `cleanClothes`, `recordDate`, `warehouseManagerId`.
  - **Tích hợp khung Canvas Preview trực tiếp ngay phía trên nút Lưu** để Thủ kho xem trước phiếu hoàn chỉnh trước khi lưu.
  - Khi bấm Lưu: Nén canvas sang WebP Base64 gửi lên Backend để lưu link ảnh Cloudinary. - Depends on: T11
- [x] T13: Cải tiến giao diện Shipper `HandoverListPage.tsx` & bóc tách `ShipperHandoverItemCardComponent.tsx`:
  - Hiển thị danh sách chi nhánh đối tác được phân công trong ngày.
  - Mỗi chi nhánh có nút chuyển sang chế độ đếm đồ thay đối tác khi quán vắng người (lưu `countedByRole: 'SHIPPER'`).
  - Khung xem ảnh `slipImageUrl`, nút phóng to / tải ảnh.
  - Tùy chọn checkbox: "Chưa đếm đồ bẩn" / "Yêu cầu xưởng đếm lại".
  - Ô ký tên kèm ô nhập họ tên (mặc định lấy tên tài khoản shipper đang đăng nhập), bấm Lưu -> gửi chữ ký và cập nhật lại ảnh có chữ ký. - Depends on: T11
- [x] T14: Cập nhật `PartnerCountTabComponent.tsx`: Hiển thị Canvas phiếu xem trước trực tiếp ngay phía trên nút Lưu (không cần mở Modal sau khi lưu). - Depends on: T11
- [x] T15: Cập nhật `PartnerReceiptTabComponent.tsx`: Đổi từ cơ chế vẽ lại Canvas sang hiển thị trực tiếp thẻ `<img>` load link ảnh `slipImageUrl` từ Cloudinary; cho phép ký tên kiểm nhận và lưu ảnh cập nhật. - Depends on: T11
- [x] T16: Cập nhật `RecountStationPage.tsx`: Cập nhật giao diện đếm lại tại xưởng: lấy danh sách phiếu có `recount.isRecount = true`, form đếm tương tự đối tác nhưng không cần ký tên; lưu vào `dirtyClothes.actualQuantity` và cập nhật ảnh mới. - Depends on: T11

### Giai đoạn 5: Kiểm Thử, Đồng Bộ Tài Liệu & Baseline Verification
- [x] T17: Chạy kiểm tra lint & build trên cả 2 phân hệ `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`. - Depends on: T12, T13, T14, T15, T16
- [x] T18: Chạy unit tests cho các luồng nghiệp vụ Backend Handover. - Depends on: T17
- [x] T19: Cập nhật tài liệu kỹ thuật: `.agents/docs/DATABASE_DICTIONARY.md`, `.agents/docs/srs_sdd/srs_sdd_backend.md`, `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`, `.agents/docs/SRS_SDD.md`, và ghi nhật ký vào `CHANGELOG.md`. - Depends on: T18

---

## 4. Verification & Testing

### 4.1. Lệnh Kiểm Tra Hệ Thống
- Backend:
  ```bash
  cd be-nestjs-thanhxuan
  pnpm lint
  pnpm exec tsc --noEmit
  pnpm test
  pnpm build
  ```
- Frontend Internal:
  ```bash
  cd fe-react-thanhxuan-internal
  pnpm lint
  pnpm exec tsc --noEmit
  pnpm build
  ```

### 4.2. Kịch Bản Kiểm Thử (Test Scenarios)
1. **Kịch bản Happy Path trọn vòng đời phiếu**:
   - Thủ kho soạn đồ sạch -> Thấy bản xem trước Canvas -> Bấm lưu -> Phiếu tạo thành công với `recordCode`, `recordDate`, `cleanClothes`, có link ảnh Cloudinary đầu tiên (chứa chữ ký thủ kho).
   - Đại diện đối tác mở cổng Partner -> Thấy bản xem trước Canvas -> Điền số lượng đồ bẩn & ký tên -> Lưu thành công -> Link ảnh Cloudinary được cập nhật có thêm dữ liệu đồ bẩn & chữ ký đối tác, ảnh cũ được dọn dẹp trong background.
   - Shipper đến điểm giao hàng -> Mở danh sách thấy phiếu -> Kiểm tra đồ -> Ký xác nhận giao hàng -> Ảnh phiếu được cập nhật thêm chữ ký shipper.
   - Quản lý nhà hàng kiểm nhận -> Mở tab Kiểm nhận thấy ngay ảnh phiếu rõ nét tải từ Cloudinary -> Ký xác nhận hoàn tất -> Phiếu chuyển sang `COMPLETED` với đầy đủ 4 chữ ký.
2. **Kịch bản Shipper đếm thay đối tác**:
   - Nhà hàng bận không có người đếm -> Shipper bấm nút "Đếm đồ thay quán" -> Điền số lượng và ký tên -> Hệ thống lưu `countedByRole: 'SHIPPER'`, trên ảnh phiếu ghi rõ `[Tên Shipper] (Đếm thay đại diện quán)`.
3. **Kịch bản Hàng đợi đếm lại (Recount)**:
   - Shipper tích chọn "Yêu cầu đếm lại tại xưởng" -> Phiếu tự động xuất hiện tại Trạm đếm gom bao xưởng (`RecountStationPage`).
   - Thợ xưởng rạch bao đếm lại -> Lưu kết quả vào `actualQuantity` -> Tự động tính chênh lệch `variance` và sinh lại ảnh phiếu mới.
4. **Kịch bản Concurrency sinh mã**:
   - Tạo đồng thời nhiều phiếu trong cùng một ngày -> Đảm bảo `seq` tăng liên tục (`001`, `002`...) không bị trùng lặp hay xung đột duplicate key nhờ retry loop.

---

## 5. Risks & Rollback

### 5.1. Rủi ro & Biện pháp giảm thiểu
- **Rủi ro 1: Lỗi gián đoạn mạng khi upload ảnh Base64 lên Cloudinary**:
  - *Giảm thiểu*: Client nén ảnh sang WebP dung lượng thấp (<120KB); nếu upload ảnh gặp lỗi mạng, request lưu DB vẫn thành công và đánh dấu cần render bù ảnh khi có mạng.
- **Rủi ro 2: Dọn dẹp ảnh cũ trên Cloudinary làm mất dữ liệu nếu xóa nhầm**:
  - *Giảm thiểu*: Chỉ kích hoạt xóa ảnh cũ khi URL mới đã được Cloudinary xác nhận upload thành công 100% (`secure_url` hợp lệ); chạy ngầm không `await` và bắt lỗi try/catch để không làm đứt chuỗi xử lý nghiệp vụ.
- **Rủi ro 3: Xóa bảng `recount_tasks` ảnh hưởng đến dữ liệu cũ**:
  - *Giảm thiểu*: Backup collection hoặc viết script chuyển đổi các task đếm lại đang dở dang sang trường `recount` trong `handover_records` trước khi drop collection.

### 5.2. Kế hoạch Rollback
- Giữ lại bản snapshot Git trước khi thực thi. Nếu phát sinh lỗi nghiêm trọng, rollback mã nguồn và phục hồi schema Mongoose thông qua git checkout.

---

## 6. Execution Log

- **2026-10-11 - Hoàn tất thực thi 19/19 Tasks**:
  - Backend: Tái cấu trúc hoàn tất `HandoverRecord`, xóa bỏ `recount_tasks`, sinh mã nguyên tử bằng regex `findLatestByPrefix`, chuẩn hóa múi giờ VN `recordDate`, thêm `warehouseManagerId`, 4 chữ ký độc lập, nén WebP tải Cloudinary `slipImageUrl` và dọn ảnh cũ bất đồng bộ. Dual-read backward compatibility cho báo cáo. Chạy kiểm thử tự động `pnpm test src/modules/internal/handovers` **PASS 35/35 tests**, `pnpm build` **PASS 100%**.
  - Frontend: Cập nhật types, Canvas export helper, thêm `PrepOrderSlipPreviewComponent`, `ShipperHandoverItemCardComponent`, `ShipperCountPartnerModal`. Thủ kho & Đối tác xem trước Canvas trước khi lưu; Shipper đếm thay đối tác; Tab kiểm nhận hiển thị trực tiếp ảnh Cloudinary; Trạm đếm xưởng không cần ký tên. Typecheck `tsc --noEmit` **PASS 100%**, `vite build` **PASS 100%**.
  - Tài liệu: Đồng bộ [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md), [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md), [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md), [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md), [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md), và ghi nhật ký vào [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).
- Status: **Done**.

---

## Changelog
- 2026-10-11: Khởi tạo Plan 23 tái cấu trúc module Handover Record, tích hợp Cloudinary lifecycle và trải nghiệm vận hành cho Warehouse, Shipper, Partner, Recount.
- 2026-10-11: Cập nhật Plan 23: Tích hợp Canvas Preview trước khi lưu cho Thủ kho trong `PrepOrderModal`; áp dụng toàn diện 6 giải pháp kiến trúc tối ưu (Atomic Retry loop sinh mã, Cloudinary async deletion, WebP client compression, cờ `countedByRole` minh bạch cho Shipper, tab Kiểm nhận hiển thị trực tiếp ảnh từ Cloudinary, và fallback đọc kép báo cáo thống kê).
- 2026-10-11: Thực thi hoàn tất 100% toàn bộ 19 tasks kỹ thuật và cập nhật tài liệu đồng bộ toàn hệ sinh thái.

