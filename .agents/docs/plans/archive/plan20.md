# Plan 20: Tính Năng Soạn Đồ Giao Hàng, Xuất Phiếu Zalo Ảnh 1, Cài Đặt Lên Đơn Tự Động Định Kỳ & Sửa Lỗi Popup Đối Tác

> Status: Done | Created: 2026-10-10 | Completed: 2026-10-10

## 1. Overview & Affected Files

### 1.1. Mục tiêu

1. **Nút "Soạn Đồ" tại `/operations/warehouse-manager/warehouse`**: Cho phép thủ kho/quản lý xưởng bấm tạo phiếu soạn hàng giao vào ngày mai cho một chi nhánh đối tác bất kỳ:
   - Chọn Thương hiệu (Brand) -> Chọn Chi nhánh đối tác (Partner).
   - Tải danh mục đồ giặt của nhà hàng đó (`item_catalogs` đã cấu hình ở `/management/manager/partner`).
   - Mặc định tự động điền sẵn (prefill) số lượng từ lượng đồ bẩn đã nhận của ngày hôm trước để thủ kho không phải gõ lại từ đầu.
   - Nhập/chỉnh sửa linh hoạt:
     - **Số lượng sẽ giao** (cột _Số lượng đã giao_ trên phiếu).
     - **Số lượng chưa giao** (hàng thiếu/giặt chưa kịp).
     - **Số lượng giao trả** (trả nợ đồ từ các hôm trước).
     - **Ghi chú từng chiếc / ghi chú phiếu** (ví dụ: _"đã giao trước trong ngày xxx chiếc"_, hoặc ghi chú đồ rách, thay thế...).
   - Khung ký tên điện tử (Canvas Signature Pad) và ô nhập họ tên người lập phiếu (mặc định lấy họ tên tài khoản đang đăng nhập).
2. **Hiển thị & Tải ảnh Phiếu Xuất Nhập Kho Vận Chuyển (Ảnh 1)**:
   - Hiển thị bản xem trước phiếu giao nhận chuẩn theo mẫu thực tế của Pizza 4P's (Ảnh 1): đầy đủ logo/thông tin công ty Thanh Xuân, mã QR Zalo, bảng chi tiết dịch vụ (STT, Danh mục, Đơn vị, Đồ chưa giặt, Đồ sạch đã giặt gồm 3 cột _Đã giao - Chưa giao - Giao trả_, Ghi chú, Tổng cộng), khu vực 4 chữ ký (_Thủ kho, Người giao hàng, Người nhận hàng, Người lập phiếu / Người đếm đồ bẩn_ kèm chữ ký điện tử), footer cam kết dịch vụ.
   - Cung cấp nút **"Tải Xuống Thành Ảnh (.PNG)"** để thủ kho gửi ngay vào nhóm Zalo giao hàng.
3. **Setting tự động lên đơn soạn đồ theo lịch định kỳ**:
   - Tự động sinh phiếu giao nhận/soạn đồ cho các đối tác có lịch giao định kỳ (`DAILY` - Hàng ngày, `ALTERNATE_DAYS` - Cách ngày) vào ngày mai.
   - **Tự động lấy số lượng đồ bẩn đã nhận giặt từ ngày hôm trước** để điền sẵn sang số lượng sẽ giao của ngày tiếp theo. Có thay đổi số lượng sẽ giao thủ kho chỉ việc sửa lại nhanh chóng.
   - Các đối tác chưa có lịch cố định (`ON_DEMAND` - Theo yêu cầu) chỉ lên đơn khi bấm thủ công.
   - Thêm nút/modal cấu hình setting lịch giao và nút kích hoạt tự động lên đơn ngay trên thanh tác vụ Kho.
4. **Sửa lỗi hiển thị popup form đối tác (Ảnh 2)**:
   - Sửa lỗi layout Dialog trong `PartnerDialog.tsx` và `dialog.tsx`: khắc phục tình trạng thiếu padding viền, không có vùng cuộn nội dung, chân trang `DialogFooter` đè cắt ngang input "Người liên hệ trực tiếp tại quán", chuẩn hóa giao diện thoáng đãng, sang trọng theo bộ kỹ năng `ui-ux-pro-max`, `impeccable`, `design-taste-frontend`.

### 1.2. Out of scope

- Không thay đổi luồng thanh toán công nợ hay báo cáo doanh thu kế toán.
- Không sửa logic nhận đồ bẩn hay đối soát tài xế của app Shipper.

### 1.3. Assumptions & Open Questions

- **Assumptions**:
  - Mặc định ngày soạn đồ giao hàng là ngày mai (`tomorrow` theo múi giờ `Asia/Ho_Chi_Minh`), nhưng cho phép người dùng linh hoạt chọn ngày khác nếu cần.
  - Thư viện `react-signature-canvas` đã có sẵn trong `fe-react-thanhxuan-internal`.
  - Nguồn lấy số lượng đồ bẩn hôm trước: Lấy từ phiếu gần nhất của đối tác trong ngày hôm nay (hoặc ngày gần nhất trước đó), ưu tiên `dirty.final.items` -> `dirty.shipperItems` -> `restaurant_count.items`.
- **Open Questions**:
  - Không có câu hỏi chặn. Phương án vẽ ảnh phiếu bằng Canvas HTML5 chuẩn khổ giấy A4 đảm bảo độ nét cao và độc lập với môi trường chạy.

### 1.4. Bảng File Ảnh Hưởng

| Path                                                                                                | Action | Lý do                                                                                                                                                                             |
| :-------------------------------------------------------------------------------------------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fe-react-thanhxuan-internal/src/components/ui/dialog.tsx`                                          | Edit   | Sửa lỗi bố cục modal: bổ sung padding hợp lý, hỗ trợ body scroll, sửa border light/dark mode.                                                                                     |
| `fe-react-thanhxuan-internal/src/features/management/partners/components/PartnerDialog.tsx`         | Edit   | Khắc phục lỗi popup Ảnh 2: đưa form fields vào vùng cuộn `overflow-y-auto`, footer cố định không đè input.                                                                        |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/WarehousePage.tsx`                   | Edit   | Thêm nút "Soạn Đồ", nút "Tự Động Lên Đơn Theo Lịch", nút "Cài Đặt Lịch", tích hợp mở modal soạn hàng.                                                                             |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/PrepOrderModal.tsx`                  | Add    | Modal soạn đồ: chọn Brand -> Partner -> nạp prefill đồ bẩn hôm trước -> bảng số lượng 3 cột (_Đã giao_, _Chưa giao_, _Giao trả_) + Ghi chú -> ô ký tên + họ tên -> nút xem phiếu. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverDeliverySlipModal.tsx`       | Add    | Modal hiển thị phiếu giao nhận xuất kho chuẩn mẫu Ảnh 1, nút tải ảnh PNG gửi Zalo.                                                                                                |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverExportHelper.ts`             | Edit   | Cập nhật hàm render canvas vẽ chuẩn phiếu giấy trắng A4, QR Zalo, bảng 16 dòng (3 cột đồ sạch + ghi chú), chữ ký điện tử.                                                         |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/WarehouseScheduleSettingsDialog.tsx` | Add    | Modal cài đặt tự động lên đơn soạn đồ định kỳ, danh sách chi nhánh có lịch vs không có lịch.                                                                                      |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/index.ts`                            | Edit   | Export các component mới.                                                                                                                                                         |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts`              | Edit   | Mở rộng sub-schema `CleanPlanned`: thêm `undeliveredQty`, `returnedDebtQty`, `note`, `preparedByName`, `preparedBySignature`.                                                     |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/clean-planned.dto.ts`                       | Edit   | Mở rộng DTO nhận các trường chi tiết đồ sạch và chữ ký người lập.                                                                                                                 |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts`             | Edit   | Thêm endpoint `POST /handover/auto-schedule`, `POST /handover/prep-order`, `GET /handover/previous-dirty`.                                                                        |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts`            | Edit   | Xử lý logic tạo phiếu soạn đồ thủ công & tự động sinh phiếu theo lịch ngày mai kèm prefill số lượng đồ bẩn hôm trước.                                                             |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/handover.service.ts`                            | Edit   | Chuyển tiếp facade method cho `autoSchedule`, `createPrepOrder`, `getPreviousDirtyItems`.                                                                                         |

---

## 2. Technical Approach

### 2.1. Kiến Trúc & Luồng Dữ Liệu (Data Flow)

```
[Thủ Kho tại WarehousePage]
       │
       ├─► Bấm "Soạn Đồ" (Thủ công) ──► PrepOrderModal:
       │     1. Chọn Brand (Pizza 4P's, Haidilao...)
       │     2. Chọn Chi nhánh (Tràng Tiền, Phan Chu Trinh...)
       │     3. Query /partners/catalogs?brand=... nạp danh mục
       │     4. Query /handover/previous-dirty?partnerId=... lấy số lượng đồ bẩn hôm trước
       │     5. Prefill tự động vào cột "Số lượng sẽ giao"
       │     6. Cho phép nhập thêm: "Chưa giao", "Giao trả nợ", "Ghi chú dòng"
       │     7. Ký tên điện tử (Signature Canvas) + Họ tên (tự điền user.fullName)
       │     8. Gửi POST /handover/prep-order backend -> Lưu HandoverRecord
       │     9. Mở HandoverDeliverySlipModal (Giao diện giống Ảnh 1)
       │     10. Bấm "Tải Ảnh Phiếu" -> Xuất file PNG gửi Zalo
       │
       ├─► Bấm "Tự Động Lên Đơn Theo Lịch" / Auto-Schedule Cron
       │     1. Gọi POST /handover/auto-schedule?date={tomorrow}
       │     2. Backend duyệt Partner có deliverySchedule: DAILY | ALTERNATE_DAYS
       │     3. Tìm phiếu gần nhất hôm trước của từng đối tác -> lấy số lượng đồ bẩn
       │     4. Tự động sinh phiếu HandoverRecord ngày mai gán sẵn clean.planned = dirtyItems
       │     5. Hiển thị ngay trên danh sách soạn hàng của WarehousePage
       │
       └─► Bấm "Cài Đặt Lịch Giao" ──► WarehouseScheduleSettingsDialog
             1. Bật/tắt tự động sinh đơn hàng ngày
             2. Phân loại chi nhánh có lịch cố định vs chi nhánh thủ công (ON_DEMAND)
```

### 2.2. Khắc Phục Lỗi Popup Form Đối Tác (Ảnh 2)

- **Nguyên nhân gốc**:
  1. `Dialog` trong `src/components/ui/dialog.tsx` có `overflow-hidden` nhưng thiếu cấu trúc padding bao quanh nội dung, khiến các phần tử dính sát mép trên/trái/phải.
  2. `PartnerDialog.tsx` chứa nhiều input (7 trường) nhưng không bọc form fields trong container có chiều cao giới hạn và thanh cuộn `overflow-y-auto`.
  3. `DialogFooter` có `border-t border-slate-800` (màu tối cố định) và nằm ngay sau form không có scroll, dẫn đến việc footer bị trồi lên hoặc đè cắt ngang input "Người liên hệ trực tiếp tại quán".
- **Giải pháp thiết kế**:
  1. Chuẩn hóa `dialog.tsx`: tạo vùng hiển thị cân đối `max-w-lg w-full max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden`.
  2. Chuẩn hóa `PartnerDialog.tsx`:
     - `DialogHeader`: cố định ở trên (`px-6 pt-6 pb-3 border-b border-slate-100 dark:border-slate-800`).
     - `Form Body`: bọc trong `max-h-[60vh] overflow-y-auto px-6 py-4 space-y-4` với thanh cuộn mượt mà.
     - `DialogFooter`: cố định ở dưới (`px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50`).
     - Đảm bảo 100% không còn hiện tượng footer đè lên input hay dính sát mép trên.

### 2.3. Thiết Kế Phiếu Giao Nhận Giống Ảnh 1 (Ảnh Phiếu Xuất Nhập Kho Vận Chuyển)

Phiếu hiển thị trên modal và xuất ra ảnh PNG có tỷ lệ chuẩn A4 (chiều rộng 800px, chiều cao 1130px), nền trắng `#ffffff`, chữ đen nét đậm:

- **Thông tin công ty (Header)**:
  - Khung viền chữ nhật góc trên: CÔNG TY TNHH KINH DOANH THƯƠNG MẠI VÀ DỊCH VỤ THANH XUÂN.
  - Mã số thuế: `0108942736` | Điện thoại: `0769 270 676`.
  - Địa chỉ: `Thửa đất số DV14-LK643, tờ bản đồ số 00, khu dịch vụ Đào Đất Hàng Bè, đường Mậu Lương, Phường Kiến Hưng, Thành phố Hà Nội, Việt Nam`.
- **Mã QR Zalo & Tiêu đề**:
  - Bên trái: Mã QR Zalo CSKH Thanh Xuân.
  - Ở giữa: **PHIẾU XUẤT NHẬP KHO VẬN CHUYỂN** - _Ngày ... tháng ... năm ..._.
- **Thông tin bên nhận**:
  - Nơi nhận: Tên chuỗi (VD: PIZZA 4P's) | Bộ phận: Tên chi nhánh (VD: HNC / Tràng Tiền).
  - Địa chỉ: Địa chỉ chi nhánh | Điện thoại: SĐT liên hệ.
- **Bảng dịch vụ**:
  - Gồm đầy đủ các cột:
    - Cột 1: `STT`
    - Cột 2: `Danh mục dịch vụ`
    - Cột 3: `Đơn vị`
    - Cột 4 & 5 (Đồ chưa giặt): `Số lượng đã nhận` | `Số lượng thực nhận`
    - Cột 6, 7 & 8 (Đồ sạch đã giặt): `Số lượng đã giao` | `Số lượng chưa giao` | `Số lượng giao trả`
    - Cột 9: `Ghi chú` (hiển thị ghi chú từng dòng, VD: _"đã giao trước trong ngày 20 chiếc"_)
  - Dòng `TỔNG CỘNG` ở đáy bảng tính tổng số lượng của các cột số lượng.
  - Đảm bảo tối thiểu 16 hàng kẻ ô để giữ đúng form phiếu in chuẩn khổ A4.
- **Khu vực 4 chữ ký**:
  - `Thủ kho` | `Người giao hàng` | `Người nhận hàng` | `Người lập phiếu (Người đếm đồ bẩn)`.
  - Dưới cột "Người lập phiếu" (hoặc "Thủ kho"): hiển thị ảnh chữ ký điện tử đã ký trên Canvas và họ tên bên dưới.
- **Footer**:
  - Thông tin thương hiệu `THANHXUAN BUTRA CO.,LD - TX LAUNDRY SERVICE PHONE: 0769 270 676`.
  - Toàn bộ đoạn văn bản giới thiệu và cam kết chất lượng dịch vụ của công ty như trong Ảnh 1.

### 2.4. Data Shapes & API Contracts

```typescript
// DTO CleanItemDetail mở rộng
export class CleanItemDetailDto {
  itemCode: string;
  quantity: number; // Số lượng đã giao
  undeliveredQty?: number; // Số lượng chưa giao
  returnedDebtQty?: number; // Số lượng giao trả nợ
  note?: string; // Ghi chú từng dòng
}

// DTO CleanPlanned mở rộng
export class CleanPlannedDto {
  items: CleanItemDetailDto[];
  preparedByName?: string;
  preparedBySignature?: string; // Base64 data URL
  generalNote?: string;
}

// Payload Soạn Đồ Mới
export interface PrepOrderPayload {
  partnerId: string;
  targetDate: string; // YYYY-MM-DD (mặc định ngày mai)
  items: CleanItemDetailDto[];
  preparedByName: string;
  preparedBySignature: string;
  generalNote?: string;
}

// API Endpoints
POST / handover / prep - order; // Tạo hoặc cập nhật phiếu soạn đồ sạch ngày mai
POST / handover / auto - schedule; // Tự động sinh phiếu theo lịch & prefill đồ bẩn hôm trước
GET / handover / previous - dirty; // Lấy số lượng đồ bẩn nhận gần nhất để điền sẵn
GET / handover / schedule - preview; // Xem trước danh sách đối tác định kỳ ngày mai
```

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Sửa lỗi Popup Form Đối Tác (Ảnh 2)

- [x] T1: `fe-react-thanhxuan-internal/src/components/ui/dialog.tsx` - Cải tiến cấu trúc `Dialog`, `DialogHeader`, `DialogFooter`: thêm layout flex-col chống tràn, padding cân đối, border đổi theo token theme light/dark - Tiêu chí: Dialog có khung viền chuẩn, không cắt chữ, footer tách bạch.
- [x] T2: `fe-react-thanhxuan-internal/src/features/management/partners/components/PartnerDialog.tsx` - Sắp xếp lại form: tách cố định Header & Footer, bọc 7 input vào container cuộn `overflow-y-auto max-h-[60vh] px-6 py-3` - Tiêu chí: Không còn lỗi footer cắt ngang ô input "Người liên hệ trực tiếp tại quán", khoảng cách label và input thoáng đãng, sang trọng.

### Giai đoạn 2: Nâng cấp Backend Handovers (API Soạn Đồ, Prefill Đồ Bẩn & Tự Động Định Kỳ)

- [x] T3: `be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts` - Mở rộng sub-schema `CleanPlanned`: hỗ trợ `undeliveredQty`, `returnedDebtQty`, `note`, `preparedByName`, `preparedBySignature` - Tiêu chí: Mongoose schema build pass và giữ nguyên tính tương thích ngược.
- [x] T4: `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/clean-planned.dto.ts` - Bổ sung `@IsOptional()` cho các trường mới trong DTO - Tiêu chí: Validation class-validator pass.
- [x] T5: `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts` & `handover-flow.service.ts`:
  - Viết method `getPreviousDirtyItems(partnerId, date)` lấy danh sách đồ bẩn hôm trước để prefill.
  - Cập nhật `autoCreateDailyHandovers(targetDate)`: tự động lấy số lượng đồ bẩn hôm trước nạp sẵn vào `clean.planned` cho các chi nhánh định kỳ.
  - Viết method `createOrUpdatePrepOrder(dto, actor)`: lưu đầy đủ 3 loại số lượng sạch + ghi chú + chữ ký.
- [x] T6: `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts` & `handover.service.ts` - Thêm route `POST /handover/prep-order`, `POST /handover/auto-schedule`, `GET /handover/previous-dirty` với Permission Guard - Tiêu chí: Gọi API trả về kết quả thành công với HTTP 200/201.

### Giai đoạn 3: Phát triển Giao diện Soạn Đồ & Phiếu Giao Nhận Zalo (Frontend)

- [x] T7: `fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverExportHelper.ts` - Viết hàm `renderHandoverDeliverySlipToCanvas(data)` vẽ phiếu xuất kho chuẩn A4 giống hệt Ảnh 1 (Header công ty, QR code Zalo, bảng 16 dòng gồm 3 cột đồ sạch _Đã giao - Chưa giao - Giao trả_ và cột _Ghi chú_, 4 cột chữ ký, footer cam kết) và xuất ảnh PNG chất lượng cao - Tiêu chí: Tạo ảnh PNG nền trắng rõ nét từng chữ số, tỷ lệ chuẩn để gửi Zalo.
- [x] T8: `fe-react-thanhxuan-internal/src/features/operations/handovers/HandoverDeliverySlipModal.tsx` - Tạo component modal hiển thị trực quan Phiếu xuất nhập kho vận chuyển theo mẫu Ảnh 1, tích hợp nút "Tải ảnh về máy (.PNG)" và nút "Sao chép ảnh" - Tiêu chí: Xem trước chuẩn xác, tải ảnh thành công.
- [x] T9: `fe-react-thanhxuan-internal/src/features/operations/handovers/PrepOrderModal.tsx` - Xây dựng modal soạn đồ:
  - Chọn Brand (Pizza 4P's, Haidilao...) -> Chọn Chi nhánh.
  - Tự động tải danh mục đồ giặt (`item_catalogs`) và gọi API lấy số lượng đồ bẩn hôm trước để prefill vào cột "Số lượng sẽ giao".
  - Hỗ trợ nhập thêm: Số lượng chưa giao, Số lượng giao trả nợ, Ghi chú từng dòng (VD: "đã giao trước trong ngày xxx chiếc").
  - Khung ký tên điện tử Canvas pad (`react-signature-canvas`) với nút xóa chữ ký.
  - Ô họ tên người lập phiếu (mặc định lấy `user.fullName`).
  - Nút "Lưu & Xem Phiếu Giao Nhận" gọi API `prep-order` và mở `HandoverDeliverySlipModal`.
- [x] T10: `fe-react-thanhxuan-internal/src/features/operations/handovers/WarehouseScheduleSettingsDialog.tsx` - Tạo modal cài đặt: cấu hình tự động lên đơn định kỳ, hiển thị thống kê chi nhánh có lịch (`DAILY`, `ALTERNATE_DAYS`) vs chi nhánh thủ công (`ON_DEMAND`).
- [x] T11: `fe-react-thanhxuan-internal/src/features/operations/handovers/WarehousePage.tsx` & `index.ts` - Bổ sung nút "Soạn Đồ", nút "Tự Động Lên Đơn Theo Lịch", nút "Cài Đặt Lịch Giao" trên thanh `PageActionBar`; kết nối modal soạn đồ và modal xem phiếu - Tiêu chí: Luồng thao tác mượt mà, UX chuyên nghiệp, không lỗi giật lag.

---

## 4. Verification & Testing

### 4.1. Lệnh Kiểm Thử & Kiểm Tra Mã Nguồn

- **Backend (`be-nestjs-thanhxuan`)**:
  - Typecheck: `pnpm exec tsc --noEmit`
  - Lint: `pnpm lint`
  - Test: `pnpm test`
  - Build: `pnpm build`
- **Frontend Internal (`fe-react-thanhxuan-internal`)**:
  - Typecheck: `pnpm exec tsc --noEmit`
  - Lint: `pnpm lint`
  - Build: `pnpm build`

### 4.2. Kịch Bản Kiểm Thử

1. **Kiểm tra sửa lỗi popup Đối tác (Ảnh 2)**:
   - Mở `/management/manager/partner`, bấm chỉnh sửa một đối tác (VD: Pizza 4P's Tràng Tiền).
   - Kiểm tra: Modal hiển thị thoáng đãng, các input không bị dính sát mép trên; Footer không đè lên ô "Người liên hệ trực tiếp tại quán"; cuộn form mượt mà trên cả desktop lẫn laptop màn hình nhỏ.
2. **Kiểm tra Soạn Đồ thủ công kèm Prefill**:
   - Mở `/operations/warehouse-manager/warehouse`, bấm nút "Soạn Đồ".
   - Chọn thương hiệu "Pizza 4P's" -> chọn chi nhánh "Pizza 4P's Tràng Tiền".
   - Kiểm tra: Hệ thống tự động nạp danh mục và điền sẵn số lượng từ đợt đồ bẩn hôm trước (VD: 409 Khăn ăn xám, 6 xanh lau bát...).
   - Nhập thêm số lượng chưa giao (VD: 5), giao trả nợ (VD: 2) và ghi chú dòng (VD: _"giao bổ sung ca trưa"_).
   - Ký tên vào khung Canvas và kiểm tra ô họ tên người lập phiếu hiển thị đúng tên tài khoản.
   - Bấm "Lưu & Xem Phiếu": modal phiếu mẫu Ảnh 1 hiện lên đầy đủ thông tin; bấm "Tải ảnh về máy" kiểm tra file ảnh PNG sắc nét.
3. **Kiểm tra Lên Đơn Tự Động Định Kỳ**:
   - Bấm nút "Tự Động Lên Đơn Theo Lịch" cho ngày mai.
   - Kiểm tra: Hệ thống tự động tạo các phiếu cho chi nhánh có lịch `DAILY` hoặc `ALTERNATE_DAYS` với số lượng đồ sạch được gán sẵn bằng số lượng đồ bẩn hôm trước; các chi nhánh `ON_DEMAND` không bị tự tạo đơn.

### 4.3. Definition of Done

1. Toàn bộ các task T1 -> T11 hoàn thành và được kiểm chứng thực tế.
2. Typecheck, lint và build pass 100% trên cả 2 phân hệ `be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`.
3. Cập nhật tài liệu phân hệ `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` và `.agents/docs/srs_sdd/srs_sdd_backend.md`.
4. Cập nhật 1 dòng Document History tại `.agents/docs/SRS_SDD.md`.
5. Ghi nhật ký chi tiết vào `.agents/docs/CHANGELOG.md`.

---

## 5. Risks & Rollback

- **Rủi ro 1**: Kích thước ảnh chữ ký Canvas Base64 quá lớn làm phình document MongoDB.
  - _Giải pháp_: Giới hạn kích thước Canvas tối đa 500x200px, dùng `getTrimmedCanvas()` và nén PNG hoặc giới hạn kích thước chuỗi < 280KB như chuẩn hiện có của `SignatureModal.tsx`.
- **Rủi ro 2**: Trùng lặp phiếu khi chạy tự động lên đơn nhiều lần trong ngày.
  - _Giải pháp_: Duy trì cơ chế Idempotent dựa trên Compound Index `{ partnerId: 1, dateKey: 1, seq: 1 }` và kiểm tra `findByPartnerAndDateKey` trước khi tạo mới.
- **Rollback**:
  - Nếu gặp sự cố, khôi phục code frontend và schema qua `git checkout`, không ảnh hưởng đến dữ liệu cũ.

---

## Changelog

- 2026-10-10: Cập nhật Plan 20 bổ sung 3 điểm quan trọng từ người dùng:
  1. Form soạn đồ hỗ trợ nhập đủ 3 loại số lượng sạch (_Đã giao_, _Chưa giao_, _Giao trả nợ_) kèm cột _Ghi chú_.
  2. Tự động lấy số lượng đồ bẩn nhận hôm trước để prefill sang số lượng sẽ giao ngày tiếp theo.
  3. Cột chữ ký số thứ 4: Người lập phiếu / Người đếm đồ bẩn.

---

## 6. Execution Log

- **2026-10-10**:
  - **T1 & T2**: Đã sửa triệt để lỗi popup đối tác Ảnh 2 trong `dialog.tsx` và `PartnerDialog.tsx` (bọc `max-h-[60vh] overflow-y-auto`, header/footer cố định, không đè input).
  - **T3 & T4**: Mở rộng Mongoose schema `HandoverRecord` và các Class DTO cho `CleanPlanned`, `PrepOrderDto` (`undeliveredQty`, `returnedDebtQty`, `note`, `preparedByName`, `preparedBySignature`).
  - **T5 & T6**: Hoàn tất Backend repository, service và controller NestJS: endpoints `POST /handover/prep-order`, `POST /handover/auto-schedule`, `GET /handover/previous-dirty`. Nâng cấp logic tự động lên đơn định kỳ prefill số lượng đồ bẩn hôm trước.
  - **T7**: Hoàn thành `HandoverExportHelper.ts` với hàm `renderHandoverDeliverySlipToCanvas` vẽ phiếu chuẩn A4 nền trắng sắc nét như mẫu thực tế Ảnh 1 Pizza 4P's (QR Zalo, bảng dịch vụ 16 dòng gồm 3 cột sạch + ghi chú, 4 cột chữ ký, footer cam kết chất lượng).
  - **T8**: Hoàn thành `HandoverDeliverySlipModal.tsx` xem trước và tải ảnh PNG gửi Zalo.
  - **T9**: Hoàn thành `PrepOrderModal.tsx` soạn đồ với Brand selector, Partner selector, prefill đồ bẩn hôm trước, bảng số lượng 3 cột, ô Canvas ký tên và họ tên người lập.
  - **T10**: Hoàn thành `WarehouseScheduleSettingsDialog.tsx` cấu hình tự động lên đơn định kỳ vs thủ công.
  - **T11**: Tích hợp các nút hành động lên thanh tác vụ Kho tại `WarehousePage.tsx` và export barrel `index.ts`.
  - **Verify**: Typecheck `fe-react-thanhxuan-internal` pass 0 lỗi. Build pass thành công 100% trên cả Backend (`nest build`) và Frontend (`tsc -b && vite build`).
