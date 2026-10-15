# Plan 28: Chuẩn Hóa Toàn Diện Schema & Dọn Rác Dữ Liệu Các Bảng (Accounts, ItemCatalogs, HandoverRecords)

> Status: Completed | Created: 2026-10-13 | Updated: 2026-10-13

## 1. Overview & Affected Files

### 1.1. Mục tiêu

- **Chuẩn hóa Bảng `accounts` ([staff-account.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts))**:
  - Xóa bỏ trường trùng lặp `roles: string[]`, thống nhất sử dụng duy nhất `role: StaffRole` làm Single Source of Truth.
  - Bỏ giá trị khởi tạo rỗng mặc định `default: () => ({})` của `pay_profile` (chỉ sinh khi tài khoản thợ/shipper được cấu hình lương thực tế).
  - Chạy migration `$unset` dọn dẹp `roles` và `pay_profile` rỗng trên MongoDB Atlas.
- **Chuẩn hóa Bảng `item_catalogs` ([item-catalog.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/schemas/item-catalog.schema.ts))**:
  - Chuẩn hóa đúng **8 trường cốt lõi** theo đặc tả:
    - `itemCode`: String, Bắt buộc, Unique, uppercase.
    - `brand`: String, Bắt buộc, uppercase, Index.
    - `name`: String, Bắt buộc (Tên tiếng Việt hiển thị).
    - `unit`: String, Mặc định `PIECE` (Cái, Bộ, Kg...).
    - `priceToCustomer`: Number, Mặc định `0` (Đơn giá dịch vụ thu của đối tác VND phục vụ báo cáo doanh thu & đối soát công nợ, bảo mật qua interceptor chỉ Admin/Kế toán thấy; sửa lỗi schema cũ viết nhầm `customerPrice`).
    - `sortOrder`: Number, Mặc định `0`, Index (Thứ tự sắp xếp hiển thị cố định trên bảng đếm đồ và phiếu in A4).
    - `imageUrl`: String, Tùy chọn (Ảnh chụp mẫu đồ giặt trên Cloudinary).
    - `isActive`: Boolean, Mặc định `true`, Index (Đánh dấu còn sử dụng hay tạm ngưng).
  - Loại bỏ hoàn toàn 2 trường khoán thợ cũ: `foldingRateWorker` (đơn giá gấp) và `ironingRateWorker` (đơn giá ủi) khỏi Schema và `$unset` sạch sẽ khỏi 14 bản ghi trong MongoDB Atlas (do công ty đã chuyển sang trả lương giờ $\times$ hệ số loại việc `hourly_work`).
- **Triệt tiêu mảng rỗng mặc định `notes: []` trong `handover_records` ([handover-record.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts))**:
  - Khai báo `@Prop({ type: [HandoverItemNoteSchema], default: undefined }) notes?: HandoverItemNote[];` để Mongoose không tự động sinh `notes: []` khi tạo mới document.
- **Dọn dẹp CSDL thực tế & Đồng bộ hóa toàn diện**:
  - Cập nhật script `drop-legacy-collections.ts` và thực thi dọn dẹp DB Atlas.
  - Cập nhật `DATABASE_DICTIONARY.md`, `srs_sdd_backend.md`, `SRS_SDD.md`, `CHANGELOG.md`.

### 1.2. Bảng các file bị ảnh hưởng

| Path                                                                                   | Action | Lý do                                                                                                                   |
| :------------------------------------------------------------------------------------- | :----: | :---------------------------------------------------------------------------------------------------------------------- | --- | ------------------ |
| `be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts`        |  Edit  | Xóa bỏ `roles: string[]`, bỏ default rỗng của `pay_profile`.                                                            |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-management.service.ts` |  Edit  | Bỏ gán `roles = [dto.role]` khi tạo/sửa tài khoản.                                                                      |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-auth.service.ts`       |  Edit  | Bỏ `roles` trong JWT payload và staffData response.                                                                     |
| `be-nestjs-thanhxuan/src/modules/internal/auth/strategies/internal-jwt.strategy.ts`    |  Edit  | Đồng bộ validate JWT payload theo `role`.                                                                               |
| `be-nestjs-thanhxuan/src/modules/core/auth/guards/permissions.guard.ts`                |  Edit  | Hỗ trợ fallback kiểm tra `hasPermission(user.roles                                                                      |     | user.role, perm)`. |
| `be-nestjs-thanhxuan/src/modules/internal/partners/schemas/item-catalog.schema.ts`     |  Edit  | Chuẩn hóa 8 trường cốt lõi (đổi `customerPrice` -> `priceToCustomer`, giữ `sortOrder`, loại bỏ tàn dư khoán đơn chiếc). |
| `be-nestjs-thanhxuan/src/modules/internal/reports/services/partner-report.service.ts`  |  Edit  | Khớp kiểu `priceToCustomer` trực tiếp từ schema không cần cast `(c as any)`.                                            |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts` |  Edit  | Khai báo `default: undefined` cho `notes` để chặn auto-init `[]`.                                                       |
| `be-nestjs-thanhxuan/src/scripts/drop-legacy-collections.ts`                           |  Edit  | Thêm `$unset` cho `roles`, `pay_profile` rỗng, `foldingRateWorker`, `customerPrice`, `notes: []`.                       |
| `fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx`                        |  Edit  | Đồng bộ `roles` tùy chọn khi đọc từ auth response.                                                                      |
| `fe-react-thanhxuan-internal/src/types/index.ts`                                       |  Edit  | Chuẩn hóa type `StaffUser`.                                                                                             |
| `.agents/docs/DATABASE_DICTIONARY.md`                                                  |  Edit  | Cập nhật bảng 1.1 `accounts`, bảng 1.7 `item_catalogs` (đúng 8 trường cốt lõi), bảng 1.8 `handover_records`.            |
| `.agents/docs/srs_sdd/srs_sdd_backend.md`                                              |  Edit  | Cập nhật hợp đồng dữ liệu chuẩn hóa.                                                                                    |
| `.agents/docs/CHANGELOG.md`                                                            |  Edit  | Ghi nhận bài luận chi tiết Plan 28.                                                                                     |

---

## 2. Đặc Tả Chi Tiết Bảng Chuẩn Hóa

### 2.1. Bảng `item_catalogs` (ItemCatalog) - Đúng 8 trường cốt lõi

```markdown
| Tên Trường        | Kiểu Dữ Liệu |    Ràng Buộc / Mặc Định     | Index / Ref | Ý Nghĩa & Tác Dụng Nghiệp Vụ                                                                                            |
| :---------------- | :----------- | :-------------------------: | :---------: | :---------------------------------------------------------------------------------------------------------------------- |
| `itemCode`        | `String`     | Bắt buộc, Unique, uppercase |   Unique    | Mã chuẩn đồ giặt (ví dụ: `4PS_GRAY_TOWEL`, `4PS_APRON_DENIM`).                                                          |
| `brand`           | `String`     |     Bắt buộc, uppercase     |    Index    | Thương hiệu sở hữu loại đồ giặt này (`PIZZA_4PS`, `HAIDILAO`...).                                                       |
| `name`            | `String`     |          Bắt buộc           |      -      | Tên tiếng Việt của chiếc đồ (ví dụ: "Khăn xám lau bàn lớn").                                                            |
| `unit`            | `String`     |      Mặc định: `PIECE`      |      -      | Đơn vị tính: `PIECE` (Cái), `SET` (Bộ), `KG` (Kg)...                                                                    |
| `priceToCustomer` | `Number`     |        Mặc định: `0`        |      -      | **Đơn giá dịch vụ thu của đối tác (VND)** (phục vụ đối soát doanh thu, bảo mật qua interceptor chỉ Admin/Kế toán thấy). |
| `sortOrder`       | `Number`     |        Mặc định: `0`        |    Index    | **Thứ tự sắp xếp hiển thị** trên bảng đếm đồ và phiếu in A4.                                                            |
| `imageUrl`        | `String`     |          Tùy chọn           |      -      | Ảnh chụp mẫu chiếc đồ giặt thực tế trên Cloudinary.                                                                     |
| `isActive`        | `Boolean`    |      Mặc định: `true`       |    Index    | Đánh dấu loại đồ còn sử dụng hay đã ngưng.                                                                              |
```

- **Xóa bỏ 100%:** `foldingRateWorker` và `ironingRateWorker` (không còn trong Schema và `$unset` sạch sẽ khỏi database).
- **Tác dụng 2 trường cốt lõi điền bổ sung:**
  1. `priceToCustomer`: Báo cáo đối soát công nợ chuỗi nhà hàng (`partner-report.service.ts`), tính thành tiền = `số lượng giao * priceToCustomer`.
  2. `sortOrder`: Giữ cố định thứ tự các chiếc đồ khi hiển thị trên giao diện của Thủ kho, Tài xế và Đối tác.

---

## 3. Implementation Tasks (Checklist)

- [x] T1: Chuẩn hóa Schema [`staff-account.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts) và các services Auth backend (`account-management.service.ts`, `account-auth.service.ts`, `internal-jwt.strategy.ts`, `permissions.guard.ts`).
- [x] T2: Chuẩn hóa Schema [`item-catalog.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/schemas/item-catalog.schema.ts) (đúng 8 trường cốt lõi: đổi `customerPrice` -> `priceToCustomer`, giữ `sortOrder`, loại bỏ tàn dư khoán đơn chiếc) và đồng bộ `partner-report.service.ts`.
- [x] T3: Triệt tiêu auto-init `notes: []` trong [`handover-record.schema.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts).
- [x] T4: Cập nhật Frontend types và `AuthContext.tsx` trong `fe-react-thanhxuan-internal`.
- [x] T5: Cập nhật script [`drop-legacy-collections.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/scripts/drop-legacy-collections.ts) và chạy thực thi dọn dẹp CSDL MongoDB Atlas thực tế.
- [x] T6: Kiểm thử (typecheck, build Backend & Frontend, xác minh dữ liệu trong DB).
- [x] T7: Đồng bộ tài liệu kỹ thuật ([DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md), [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md), [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md), [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md)).
- [x] T8: Tự động commit và push lên nhánh `dev` theo quy định tại `AGENTS.md`.
