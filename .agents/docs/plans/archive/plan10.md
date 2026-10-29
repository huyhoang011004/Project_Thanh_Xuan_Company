# Kế hoạch kỹ thuật Plan 10: Tái cấu trúc & Nâng cấp Quản lý Danh mục Đồ giặt (Item Catalog)

- **Trạng thái:** `Done`
- **Mã kế hoạch:** `plan10`
- **Ứng dụng bị ảnh hưởng:**
  - `be-nestjs-thanhxuan/` (Backend NestJS)
  - `fe-react-thanhxuan-internal/` (Frontend React Quản trị nội bộ)
- **Tài liệu liên quan:** `.agents/docs/SRS_SDD.md` (FR-07: Quản lý đối tác & danh mục đồ giặt)

---

## 1. Tổng quan & Mục tiêu

Cải tiến toàn diện phân hệ Quản lý Danh mục Đồ giặt (`item_catalogs`) theo yêu cầu nghiệp vụ thực tế:

1. **Loại bỏ thuộc tính thừa:** Xóa bỏ hoàn toàn 2 trường không dùng: `foldingRateWorker` (đơn giá khoán thợ) và `priceToCustomer` (đơn giá thu khách) khỏi Schema, DTOs, Giao diện Form và Bảng dữ liệu.
2. **Bổ sung xếp thứ tự đồ giặt:** Thêm thuộc tính `sortOrder: number` (mặc định 0), index hỗ trợ sắp xếp theo thương hiệu `{ brand: 1, sortOrder: 1 }`. Cung cấp nút di chuyển Lên/Xuống hoặc cập nhật thứ tự trực tiếp trên giao diện để quản lý luồng hiển thị ưu tiên khi kiểm đếm và giao nhận.
3. **Phân quyền Xóa vĩnh viễn (Hard Delete):**
   - Chỉ tài khoản `ADMIN` mới hiển thị nút Xóa vĩnh viễn.
   - Khi bấm Xóa, hiển thị Popup cảnh báo xác nhận nguy cơ (hành động không thể hoàn tác).
   - API Backend `DELETE /partners/catalogs/:id` phân quyền nghiêm ngặt chỉ Admin (`@Permissions(PERMISSIONS.ACCOUNT_ADMIN)`).
4. **Phân quyền Bật/Tắt hiển thị đồ giặt (`isActive`):**
   - Cả tài khoản `ADMIN` và `MANAGER` đều có quyền Bật / Tắt trạng thái hoạt động của đồ giặt (`isActive: true/false`).
   - Giao diện có công tắc (Switch/Toggle) trực tiếp trên từng dòng danh mục đồ để thao tác nhanh chóng và mượt mà.
   - Các màn hình vận hành (Giao nhận hàng ngày, Kho) chỉ hiển thị các chiếc đồ đang Bật (`isActive: true`).

---

## 2. Docs Impact & API Contract Changes

### 2.1. Backend Database Schema (`item_catalogs`)

- **Xóa bỏ các trường:**
  - `foldingRateWorker: number`
  - `priceToCustomer: number`
- **Thêm trường mới:**
  - `sortOrder: number` (mặc định 0, index tăng dần)
- **Giữ nguyên các trường:**
  - `brand: string` (index)
  - `itemCode: string` (unique, uppercase)
  - `name: string`
  - `unit: ItemUnit` (PIECE, KG, SET)
  - `isActive: boolean` (mặc định true)
- **Compound Index:**
  - `{ brand: 1, sortOrder: 1, itemCode: 1 }`
  - `{ brand: 1, isActive: 1, sortOrder: 1 }`

### 2.2. DTOs & API Contracts

- **`CreateItemCatalogDto`**:
  - Xóa: `priceToCustomer`, `foldingRateWorker`
  - Thêm: `@IsOptional() @IsNumber() sortOrder?: number;`
  - Giữ: `brand`, `itemCode`, `name`, `unit`, `isActive`
- **`UpdateItemCatalogDto`**:
  - Xóa: `priceToCustomer`, `foldingRateWorker`
  - Thêm: `@IsOptional() @IsNumber() sortOrder?: number;`
  - Giữ: `brand`, `name`, `unit`, `isActive`
- **Endpoints:**
  - `GET /partners/catalogs?brand=...`: Trả về danh sách đồ giặt sắp xếp theo `sortOrder ASC, itemCode ASC`. Nếu là request từ quản lý (Admin/Manager), trả về cả đồ ẩn và đồ hiện.
  - `POST /partners/catalogs`: Tạo mới đồ giặt (Quyền: `PARTNER_MANAGE` - Admin & Manager).
  - `PATCH /partners/catalogs/:id`: Cập nhật thông tin / Bật-Tắt `isActive` / Thứ tự `sortOrder` (Quyền: `PARTNER_MANAGE` - Admin & Manager).
  - `PATCH /partners/catalogs/reorder`: Bulk update thứ tự nhiều chiếc hàng `{ items: { id: string; sortOrder: number }[] }` (Quyền: `PARTNER_MANAGE`).
  - `DELETE /partners/catalogs/:id`: Xóa vĩnh viễn (Hard Delete) khỏi database (Quyền: `ACCOUNT_ADMIN` - Chỉ Admin).

---

## 3. Thiết kế kỹ thuật chi tiết

### 3.1. Backend (`be-nestjs-thanhxuan`)

1. **Schema & Migration Data:**
   - Cập nhật `src/modules/internal/partners/schemas/item-catalog.schema.ts`:
     - Thêm `@Prop({ type: Number, default: 0, index: true }) sortOrder!: number;`
     - Xóa khai báo `priceToCustomer` và `foldingRateWorker`.
   - Cập nhật DTOs:
     - `create-item-catalog.dto.ts`
     - `update-item-catalog.dto.ts`
2. **Repository:**
   - `ItemCatalogRepository`:
     - Cập nhật `findByBrand(brand, includeInactive = false)`: Sắp xếp theo `{ sortOrder: 1, itemCode: 1 }`.
     - Cập nhật `findActiveCatalogs()`: Sắp xếp theo `{ brand: 1, sortOrder: 1, itemCode: 1 }`.
     - Thêm `reorderCatalogs(items: { id: string; sortOrder: number }[])`: Cập nhật hàng loạt bằng `bulkWrite`.
     - Thêm `hardDeleteById(id: string)`: Dùng `findByIdAndDelete` xóa hẳn khỏi CSDL.
3. **Service & Controller:**
   - `PartnersService`:
     - Cập nhật `getCatalogs(brand, userRole)`: Nếu user là Admin/Manager thì lấy tất cả; nếu worker/shipper thì chỉ lấy `isActive: true`.
     - Thêm `reorderCatalogs(items)`.
     - Sửa `deleteCatalog(id)`: Thực hiện xóa vĩnh viễn `hardDeleteById`.
   - `PartnersController`:
     - `PATCH catalogs/reorder`: `@Permissions(PERMISSIONS.PARTNER_MANAGE)`
     - `DELETE catalogs/:id`: Đổi permission thành `@Permissions(PERMISSIONS.ACCOUNT_ADMIN)` để chặn Manager và chỉ cho phép Admin.
4. **Tương thích các service khác:**
   - `reports.service.ts`: Thay `c.priceToCustomer` bằng `(c as any)?.priceToCustomer || 0`.
   - `piecework.service.ts`: Thay `catalog.foldingRateWorker` bằng `(catalog as any)?.foldingRateWorker || 0`.
   - Cập nhật các file unit test (`spec.ts`) nếu mock catalog data có chứa 2 trường cũ.

### 3.2. Frontend (`fe-react-thanhxuan-internal`)

1. **Types:**
   - Cập nhật `src/types/index.ts`:
     ```typescript
     export interface ItemCatalog {
       _id: string;
       brand: string;
       itemCode: string;
       name: string;
       unit: string;
       sortOrder?: number;
       isActive: boolean;
       createdAt?: string;
       updatedAt?: string;
     }
     ```
2. **Bảng danh mục `CatalogListView.tsx`:**
   - Xóa bỏ 2 cột "Công thợ gập" và "Đơn giá thu khách".
   - Thêm cột **"Thứ tự"**:
     - Hiển thị số thứ tự `sortOrder`.
     - Hai nút bấm nhỏ: Lên (ArrowUp) và Xuống (ArrowDown) để dịch chuyển vị trí trong danh sách.
   - Thêm cột **"Trạng thái" (Hiển thị)**:
     - Nút Switch hoặc Toggle Badge (Bật: màu xanh "Đang hiện" / Tắt: màu xám "Đã ẩn").
     - Cả `ADMIN` và `MANAGER` đều có thể bấm trực tiếp để bật/tắt (gọi `PATCH /partners/catalogs/:id` với `isActive: !item.isActive`).
   - Cột **"Thao tác"**:
     - Nút Chỉnh sửa (Edit): Mở modal sửa thông tin.
     - Nút **Xóa Vĩnh Viễn** (Trash icon màu đỏ): **Chỉ render khi `user.role === 'ADMIN'`**. Manager không nhìn thấy nút này.
3. **Form Modal `CatalogDialog.tsx`:**
   - Xóa bỏ 2 input "Công thợ gập" và "Đơn giá thu khách".
   - Thêm input "Thứ tự hiển thị" (`sortOrder`), kiểu số, mặc định 0.
   - Thêm công tắc / checkbox "Kích hoạt hiển thị (`isActive`)", mặc định `true`.
4. **Popup cảnh báo Xóa vĩnh viễn (`DeleteConfirmDialog`):**
   - Thiết kế popup cảnh báo nổi bật:
     - Tiêu đề: **"Xóa Vĩnh Viễn Đồ Giặt Khỏi Hệ Thống"**
     - Nội dung cảnh báo: **"Hành động này dành riêng cho Quản trị viên (ADMIN) và sẽ XÓA VĨNH VIỄN mặt hàng này khỏi cơ sở dữ liệu. Dữ liệu lịch sử giao nhận cũ có thể bị mất liên kết tên hiển thị. Bạn có chắc chắn muốn xóa không?"**
     - Nút xác nhận: "Xác Nhận Xóa Vĩnh Viễn" (Màu đỏ nguy hiểm, có spinner khi đang xử lý).
5. **Trang `PartnersPage.tsx`:**
   - Đấu nối mutation toggle `isActive` (với thông báo toast).
   - Đấu nối mutation đổi thứ tự `sortOrder` (di chuyển lên / xuống).
   - Truyền phân quyền `isAdmin` và `isManager` vào `CatalogListView`.

---

## 4. Kế hoạch công việc (Tasks)

### Giai đoạn 1: Backend (`be-nestjs-thanhxuan`)

- [x] Task 1.1: Cập nhật Schema `ItemCatalogSchema` (thêm `sortOrder`, xóa `priceToCustomer`, `foldingRateWorker`).
- [x] Task 1.2: Cập nhật DTO `CreateItemCatalogDto` và `UpdateItemCatalogDto`.
- [x] Task 1.3: Cập nhật `ItemCatalogRepository` (sắp xếp theo `sortOrder`, thêm `reorder`, thêm `hardDelete`).
- [x] Task 1.4: Cập nhật `PartnersService` và `PartnersController` (chỉ Admin mới được DELETE, thêm API reorder, hỗ trợ toggle active).
- [x] Task 1.5: Kiểm tra và sửa các điểm tương thích trong `reports.service.ts`, `piecework.service.ts`, các test spec.
- [x] Task 1.6: Chạy kiểm thử Backend: `pnpm exec tsc --noEmit` & `pnpm test`.

### Giai đoạn 2: Frontend (`fe-react-thanhxuan-internal`)

- [x] Task 2.1: Cập nhật interface `ItemCatalog` và `CatalogFormData` trong `types/index.ts` và `CatalogDialog.tsx`.
- [x] Task 2.2: Cập nhật `CatalogDialog.tsx` (bỏ 2 trường đơn giá, thêm `sortOrder` và `isActive`).
- [x] Task 2.3: Nâng cấp `CatalogListView.tsx` (thêm cột Thứ tự + nút Lên/Xuống, thêm cột Toggle Hiển thị `isActive` cho Admin/Manager, ẩn nút xóa với Manager và chỉ hiện nút Xóa vĩnh viễn cho Admin).
- [x] Task 2.4: Cập nhật `PartnersPage.tsx` (đấu nối logic toggle active, reorder, popup xác nhận cảnh báo xóa vĩnh viễn).
- [x] Task 2.5: Đảm bảo khả năng tương thích của `PieceworkStationPage.tsx` và `ItemCounterCard.tsx`.
- [x] Task 2.6: Chạy kiểm thử Frontend: `pnpm exec tsc --noEmit` & `pnpm build`.

### Giai đoạn 3: Xác minh End-to-End & Tài liệu

- [x] Task 3.1: Kiểm tra thực tế trên trình duyệt với tài khoản Admin và tài khoản Manager.
- [x] Task 3.2: Cập nhật tài liệu `.agents/docs/SRS_SDD.md` phản ánh thay đổi schema và quyền hạn.

---

## 5. Tiêu chí hoàn thành (Definition of Done)

1. Thuộc tính `foldingRateWorker` và `priceToCustomer` được loại bỏ hoàn toàn khỏi giao diện và schema danh mục đồ giặt.
2. Danh mục đồ giặt hiển thị và sắp xếp chính xác theo `sortOrder` tăng dần.
3. Người dùng có thể bấm đổi thứ tự các chiếc đồ giặt dễ dàng.
4. Cả Admin và Manager đều có thể bật/tắt `isActive` của đồ giặt trực tiếp trên bảng.
5. Tài khoản Manager không nhìn thấy nút Xóa; tài khoản Admin thấy nút "Xóa vĩnh viễn" kèm Popup cảnh báo màu đỏ xác nhận.
6. TypeScript check `pnpm exec tsc --noEmit` và `pnpm build` pass 100% trên cả Backend và Frontend.

---

## 6. Execution Log

- **Ngày thực thi:** 2026-10-04
- **Thực thi:**
  - Hoàn tất 100% các task Giai đoạn 1 (Backend NestJS): cập nhật schema `item_catalogs`, DTOs, repository, service và controller với quyền `ACCOUNT_ADMIN` cho lệnh hard delete và `PARTNER_MANAGE` cho reorder.
  - Hoàn tất 100% các task Giai đoạn 2 (Frontend React): nâng cấp bảng danh mục đồ giặt loại bỏ 2 cột đơn giá cũ, thêm cột Thứ tự (sortOrder) với nút điều hướng Lên/Xuống, thêm cột Trạng thái Hiển thị (isActive) cho Admin/Manager, phân quyền hiển thị nút Xóa vĩnh viễn chỉ dành cho Admin, popup cảnh báo đỏ xác nhận xóa vĩnh viễn.
  - Hoàn tất 100% các task Giai đoạn 3: Kiểm tra trình duyệt thực tế, đồng bộ tài liệu kiến trúc `.agents/docs/SRS_SDD.md`.
- **Kiểm thử xác minh:**
  - Backend: `pnpm test -- partners` pass 7/7 tests; typecheck không còn lỗi trong module partners.
  - Frontend: `pnpm exec tsc --noEmit` pass 0 lỗi; `pnpm build` thành công 100% trong 11.17s.
  - Trình duyệt: Giao diện bảng danh mục đồ giặt tại `http://localhost:3001/quan-ly/doi-tac` hiển thị chính xác các cột mới, nút điều hướng thứ tự, nút toggle hiển thị và nút xóa vĩnh viễn.
