# Plan 21: Cải Tiến Giao Diện Đối Tác B2B, Form Đếm Đồ Bẩn Thông Minh, Kiểm Nhận Canvas 2 Chiều, Lịch Sử Phân Trang & Khắc Phục Lỗi 403 / Loop Re-render

> Status: Done | Created: 2026-10-10 | Updated: 2026-10-10

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Phạm vi

- **Quy Chuẩn Giao Diện Bằng `@/components/common`**:
  - Tầng 1: Sử dụng [PageBanner.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageBanner.tsx) hiển thị tiêu đề cổng đối tác, tên thương hiệu/chi nhánh, icon và trạng thái liên kết.
  - Tầng 2: Sử dụng [PageActionBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageActionBar.tsx) chứa thanh tab chức năng trên Desktop và các nút thao tác nhanh.
  - Tầng 3: Sử dụng [ResponsiveCardGrid.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/ResponsiveCardGrid.tsx) hiển thị danh sách phiếu lịch sử tự co dãn từ 1 đến 4 cột chuẩn công thái học.
- **Menu Phân Hệ Đối Tác Mobile-First**: Sửa menu điều hướng của `/operations/partner-manager/partner` và `/operations/partner-staff/partner`:
  - 4 tính năng cốt lõi: **Đếm đồ bẩn**, **Kiểm nhận đồ sạch**, **Lịch sử**, **Phê duyệt tài khoản** (chỉ hiển thị nếu role là `PARTNER_MANAGER`).
  - Trên màn hình di động (`lg:hidden`), chuyển toàn bộ điều hướng các tab này xuống thanh **Bottom Navbar** cố định đáy màn hình để nhân viên thao tác một tay thuận tiện.
  - Trên desktop (`lg:block`), duy trì giao diện tab ngang trên header / action bar.
- **Form Đếm Đồ Bẩn Chuẩn Hóa Theo PrepOrderModal**:
  - Tái cấu trúc tab Đếm đồ bẩn trong `PartnerPortalPage` / `PartnerCountTabComponent` theo ngôn ngữ giao diện của [PrepOrderModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx) (hỗ trợ chuyển đổi linh hoạt dạng Card / Table).
  - Tự động nhận diện chi nhánh & thương hiệu của tài khoản (`user.brand`, `user.partnerId`), **khóa cứng (disabled / read-only)** Thương hiệu, Chi nhánh và Ngày (mặc định là ngày theo phiếu soạn đồ đã được quản lý kho tạo).
  - Thay thế các cột soạn đồ thành duy nhất **1 cột số lượng: "Đồ chưa giặt"**.
  - Bỏ trường "Ghi chú chung", giữ ghi chú theo từng chiếc (nếu có lỗi/hỏng).
  - **Cơ chế Smart Math Input & Auto-Save on Blur**: Cho phép nhân viên gõ phép tính đếm gom dồn (`12 34`, `12 + 34` => tính ra `46`, `50-10` => tính ra `40`); hiển thị kết quả và tự động lưu ngay khi rời ô (`onBlur`).
- **Lưu & Xuất Phiếu Giao Nhận Kép (Đồ Sạch + Đồ Bẩn)**:
  - Khi nhấn _"Lưu và xem phiếu giao nhận"_: Lưu dữ liệu đếm đồ bẩn vào phiếu giao nhận (cột _Số lượng đã nhận_ `dirtyReceivedQty` và chữ ký đối tác), đồng thời truy vấn dữ liệu đồ sạch đã soạn từ phía `warehouse-manager` trong ngày để hiển thị đồng thời cả 2 chiều trên phiếu xuất nhập kho canvas.
- **Kiểm Nhận Đồ Sạch Trực Quan Bằng Canvas 2 Chiều (Tab RECEIPT)**:
  - Hiển thị trực tiếp phiếu giao nhận 2 chiều xuất nhập kho vẽ bằng Canvas sắc nét để đối tác kiểm đếm đồ sạch đối soát với đồ bẩn.
  - Thêm ô **ký tên** (`SignatureCanvas`) và **input họ tên người nhận** (mặc định nạp tự động từ tài khoản đăng nhập `user.fullName || user.name`) ngay dưới phiếu.
  - Thêm nút điều hướng ngày: **Sang trái (`ChevronLeft`)** lùi 1 ngày, **Sang phải (`ChevronRight`)** tiến 1 ngày để dễ dàng lật xem các phiếu giao nhận theo ngày.
- **Lịch Sử Giao Nhận Phân Trang & Tra Cứu Theo Ngày (Tab HISTORY)**:
  - Hiển thị danh sách phiếu giao nhận sắp xếp theo thứ tự **từ mới đến cũ** (mới nhất lên đầu).
  - **Phân trang (Pagination)**: Tối đa **12 phiếu / trang** kèm thanh chuyển trang tiện lợi.
  - **Bộ lọc ngày cụ thể**: Có nút / bộ chọn ngày (Date Picker) để lọc và xem ngay phiếu giao nhận của 1 ngày bất kỳ, bấm vào xem chi tiết phiếu canvas.
- **Khắc Phục Toàn Diện Các Lỗi Console & Quyền Hạn (403 / Loop / ERR_CONNECTION_REFUSED)**:
  - Sửa lỗi **403 Forbidden** trên các API `/partners/brands`, `/partners`, `/partners/catalogs`, `/handover/prep-order`: Cập nhật `permissions.map.ts` cấp đúng quyền truy cập cho `PARTNER_MANAGER` và `PARTNER_STAFF`.
  - Sửa lỗi **Maximum update depth exceeded** (`PrepOrderModal.tsx:46`): Thêm điều kiện chặn vòng lặp `useEffect` khi danh sách chi nhánh rỗng hoặc re-render liên tục.
  - Khắc phục lỗi crash runtime và đảm bảo server khởi động ổn định.

### 1.2. Out of scope

- Không thay đổi bảng giá đồ giặt hoặc quy trình tính lương khoán của thợ xưởng.
- Không thay đổi nghiệp vụ tài xế giao nhận bên phía Shipper.

### 1.3. Assumptions & Open Questions

- **Assumptions:**
  - Tài khoản nhân viên đối tác (`PARTNER_STAFF` / `PARTNER_MANAGER`) luôn được liên kết với một `partnerId` cụ thể trong database.
  - Khi xem phiếu giao nhận bên phía đối tác, nếu xưởng chưa soạn đồ sạch cho ngày hôm đó, phiếu vẫn thể hiện đúng số lượng đồ bẩn đã gom và để trống/số 0 ở cột đồ sạch.
- **Open Questions:** Không có.

### 1.4. Bảng File Ảnh Hưởng

| Path                                                                                                     | Action | Lý do                                                                                                                                               |
| :------------------------------------------------------------------------------------------------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `be-nestjs-thanhxuan/src/config/permissions.map.ts`                                                      | Edit   | Bổ sung quyền`PARTNER_VIEW` và `CATALOG_PRICE_CUSTOMER_VIEW` cho `PARTNER_MANAGER` và `PARTNER_STAFF`.                                              |
| `be-nestjs-thanhxuan/src/modules/internal/partners/partners.controller.ts`                               | Edit   | Tinh chỉnh decorator quyền trên`/partners/catalogs` để cho phép đối tác đọc bảng danh mục đồ vải.                                                   |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts`                  | Edit   | Xác minh các endpoint`prep-order`, `partner-count`, đảm bảo phân quyền và định danh route chuẩn xác.                                                |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx`                | Edit   | Khắc phục triệt để lỗi loop re-render`Maximum update depth exceeded` tại lines 122-133 & 161-192.                                                   |
| `fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx`                                  | Edit   | Hỗ trợ điều hướng ngữ cảnh khi người dùng ở trang đối tác (`/operations/partner-*`), hiển thị 4 nút chức năng.                                      |
| `fe-react-thanhxuan-internal/src/components/layout/nav-config.ts`                                        | Edit   | Khai báo các quick items chuyên biệt cho`PARTNER_STAFF` và `PARTNER_MANAGER`.                                                                       |
| `fe-react-thanhxuan-internal/src/features/operations/partners/PartnerPortalPage.tsx`                     | Edit   | Áp dụng`@/components/common` (`PageBanner`, `PageActionBar`), tích hợp đồng bộ tab qua URL `?tab=`, khóa thông tin thương hiệu/chi nhánh.           |
| `fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerCountTabComponent.tsx`   | Edit   | Tái cấu trúc thành form chuẩn`PrepOrderModal` (chế độ Card / Table), tích hợp Smart Math Input cho cột Đồ chưa giặt, chữ ký và nút Lưu & xem phiếu. |
| `fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerReceiptTabComponent.tsx` | Edit   | Vẽ phiếu canvas 2 chiều xuất nhập kho, nút lùi/tiến ngày (`ChevronLeft`/`Right`), ô họ tên (mặc định từ user) + chữ ký xác nhận kiểm nhận.          |
| `fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerHistoryTabComponent.tsx` | Edit   | Áp dụng`ResponsiveCardGrid`, bộ lọc chọn 1 ngày cụ thể, sắp xếp từ mới đến cũ, phân trang tối đa 12 phiếu/trang kèm modal xem phiếu canvas.         |
| `fe-react-thanhxuan-internal/src/lib/utils.ts`                                                           | Edit   | Thêm hàm tiện ích`parseSmartQtyExpression(input: string): number` an toàn để tính toán biểu thức như `12 34`, `12 + 34`, `50-10`.                   |

---

## 2. Technical Approach

### 2.1. Phân Tích Nguyên Nhân Gốc Rễ (Root Cause Analysis)

1. **Lỗi 403 Forbidden trên các API Partner:**
   - Dẫn chứng: [permissions.map.ts:126-146](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/config/permissions.map.ts#L126-L146).
   - `PARTNER_MANAGER` chỉ có `[HANDOVER_VIEW, HANDOVER_PARTNER_COUNT, HANDOVER_RECEIPT, ACCOUNT_APPROVE_PARTNER]`.
   - `PARTNER_STAFF` chỉ có `[HANDOVER_VIEW, HANDOVER_PARTNER_COUNT]`.
   - Cả 2 role đều thiếu `PARTNER_VIEW` (`partner.view`) và `CATALOG_PRICE_CUSTOMER_VIEW` (`catalog.price_customer.view`).
   - Trong khi đó:
     - `GET /partners/brands` và `GET /partners` yêu cầu `PERMISSIONS.PARTNER_VIEW` ([partners.controller.ts:44,155](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/partners.controller.ts#L44)).
     - `GET /partners/catalogs` yêu cầu cả 2 quyền `[CATALOG_PRICE_CUSTOMER_VIEW, PARTNER_VIEW]` ([partners.controller.ts:103](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/partners.controller.ts#L103)).
     - `PermissionsGuard` kiểm tra bằng `every()` ([permissions.guard.ts:27](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/auth/guards/permissions.guard.ts#L27)), dẫn tới việc chặn toàn bộ request của đối tác với mã 403 Forbidden.

2. **Lỗi Maximum update depth exceeded trong PrepOrderModal.tsx:**
   - Dẫn chứng: [PrepOrderModal.tsx:122-133](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx#L122-L133).
   - Khi API `/partners` bị lỗi 403 hoặc trả về rỗng `[]`, effect chạy nhánh `else { setSelectedPartnerId(""); }`. Nếu effect đầu (dòng 83) set `defaultPartnerId`, 2 effect đánh nhau liên tục gây loop vô hạn.
   - Guard condition bị thiếu kiểm tra giá trị hiện tại trước khi `setState`.

3. **Backend NestJS Crash & ERR_CONNECTION_REFUSED:**
   - Khi client bị loop re-render gửi dồn dập hàng chục request lỗi, hoặc khi lệnh `pnpm dev` bị ngắt bằng `Ctrl+C` (Terminate batch job), server NestJS cổng 5001 dừng hẳn -> Client gặp `ERR_CONNECTION_REFUSED`.

---

### 2.2. Thiết Kế Kiến Trúc & UI/UX

#### A. Chuẩn Hóa Cấu Trúc Trang Với `@/components/common`

Áp dụng mẫu 3 tầng thị giác đồng bộ toàn hệ sinh thái:

- **Tầng 1 (Top Banner)**: [PageBanner.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageBanner.tsx)
  - Icon: `Building2`
  - Tagline: `"CỔNG ĐỐI TÁC B2B"`
  - Title: Tên chi nhánh đối tác (VD: _"Pizza 4P's - Phan Xích Long"_)
  - Badge: Mã thương hiệu (VD: `PIZZA_4PS`)
  - Description: Địa chỉ chi nhánh và lịch giao nhận cố định.
- **Tầng 2 (Action Bar & Tabs)**: [PageActionBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageActionBar.tsx)
  - Trên desktop: Hiển thị thanh tabs 4 mục (_Đếm đồ bẩn, Kiểm nhận đồ sạch, Lịch sử, Phê duyệt tài khoản_).
  - Tự động ẩn trên mobile (`hidden lg:flex`) để nhường chỗ cho Bottom Navbar.
- **Tầng 3 (Nội Dung Chức Năng)**: Render tab tương ứng.

#### B. Menu Đối Tác Mobile-First (Bottom Navbar)

- Đồng bộ `activeTab` qua Search Params (`?tab=COUNT | RECEIPT | HISTORY | STAFF`).
- Trên Mobile (`lg:hidden`):
  - [MobileBottomBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx) nhận diện khi URL khớp `/operations/partner-*` để hiển thị 4 nút:
    1. **Đếm Đồ Bẩn** (`tab=COUNT`) - Icon `Send`
    2. **Kiểm Nhận** (`tab=RECEIPT`) - Icon `FileCheck2`
    3. **Lịch Sử** (`tab=HISTORY`) - Icon `History`
    4. **Duyệt NV** (`tab=STAFF` - chỉ render cho `PARTNER_MANAGER`) - Icon `Users` (kèm badge thông báo)

#### C. Smart Math Parser Helper (`parseSmartQtyExpression`)

- Hàm nhận chuỗi ký tự nhập vào từ ô số lượng:
  - Hỗ trợ các định dạng:
    - Khoảng trắng: `"12 34"` => `12 + 34 = 46`
    - Dấu cộng: `"12 + 34"` => `46`
    - Dấu trừ: `"50-10"` hoặc `"50 - 10"` => `40`
    - Kết hợp: `"20 + 30 15 - 5"` => `20 + 30 + 15 - 5 = 60`
  - Xử lý phòng thủ: Nếu người dùng nhập chữ hoặc ký tự không hợp lệ, fallback an toàn về số hợp lệ gần nhất hoặc `0`. Kết quả không được âm (`Math.max(0, result)`).

```typescript
// Pseudocode minh họa parser toán học an toàn
export function parseSmartQtyExpression(input: string): number {
  if (!input || !input.trim()) return 0;
  // Thay thế khoảng trắng đứng giữa các con số thành dấu '+'
  const normalized = input.trim().replace(/(\d+)\s+(\d+)/g, "$1+$2");
  // Tokenize an toàn chỉ cho phép số, dấu +, dấu -
  const tokens = normalized.match(/([+-]?\s*\d+)/g);
  if (!tokens) return Number(input) || 0;
  const total = tokens.reduce(
    (acc, token) => acc + parseInt(token.replace(/\s+/g, ""), 10),
    0,
  );
  return Math.max(0, isNaN(total) ? 0 : total);
}
```

#### D. Form Đếm Đồ Bẩn Mới (Tương Đồng PrepOrderModal)

- Giao diện gồm:
  - **Khung Thông Tin Khóa Cứng**: Thương hiệu (disabled), Chi nhánh (disabled), Ngày (mặc định là ngày theo phiếu soạn đồ đã được quản lý kho tạo cho chi nhánh; fallback hôm nay `getTodayVN()`, disabled).
  - **Bộ Chuyển Đổi Chế Độ Xem**: Dạng Thẻ (Card - tối ưu mobile) và Dạng Bảng (Table - tối ưu desktop).
  - **Cột Dữ Liệu**: Duy nhất **1 cột số lượng: "Đồ chưa giặt"** (Smart Math Input + Auto-save onBlur).
  - **Ghi chú**: Ghi chú theo từng chiếc đồ, bỏ ô ghi chú chung.
  - **Chữ Ký & Nút Lưu**: Khung Canvas ký tên và nút _"Lưu và xem phiếu giao nhận"_.
  - Khi lưu: Lưu số lượng đếm đồ bẩn, chữ ký đối tác, đồng thời kéo số lượng đồ sạch đã soạn từ xưởng để ghép thành phiếu giao nhận 2 chiều mở ra modal xem ảnh phiếu.

#### E. Kiểm Nhận Đồ Sạch Trực Quan Canvas 2 Chiều (Tab RECEIPT)

- **Phiếu Giao Nhận Canvas 2 Chiều**:
  - Tích hợp vẽ trực tiếp phiếu giao nhận xuất nhập kho 2 chiều (bằng `renderHandoverDeliverySlipToCanvas`) hiển thị ngay trên màn hình để nhân viên quán vừa xem vừa đối chiếu đồ sạch thực tế giao đến và đồ bẩn bàn giao.
- **Thanh Điều Hướng Ngày**:
  - Đặt ngay trên phiếu: Nút **Lùi 1 ngày (`ChevronLeft`)**, nhãn **Ngày hiện tại (VD: `10/10/2026`)**, nút **Tiến 1 ngày (`ChevronRight`)**.
  - Cho phép xem nhanh phiếu hôm qua, hôm nay hoặc ngày mai để kiểm nhận đồ sạch của bất kỳ đợt giao nào.
- **Xác Nhận & Ký Tên Dưới Phiếu**:
  - Input họ tên người nhận: Tự động điền mặc định từ tài khoản đang đăng nhập (`user.fullName || user.name`), cho phép chỉnh sửa nếu người khác nhận thay.
  - Ô ký tên điện tử `SignatureCanvas` với nút xóa chữ ký.
  - 3 trạng thái kiểm nhận nhanh: _Đủ Hàng_, _Thiếu Hàng_, _Dư Hàng_ + Ô ghi chú khi có chênh lệch.
  - Nút _"Xác Nhận Kiểm Nhận"_ gửi API `POST /handover/:id/receipt`.

#### F. Lịch Sử Giao Nhận Phân Trang & Tra Cứu (Tab HISTORY)

- **Bố Cục Giao Diện**:
  - Dùng `PageActionBar` chứa:
    - Bên trái: Tiêu đề danh sách và tổng số phiếu.
    - Bên phải: **Bộ chọn ngày cụ thể (DatePicker / Input date)** và nút xóa lọc để xem toàn bộ.
- **Danh Sách Phiếu Phân Trang**:
  - Sử dụng [ResponsiveCardGrid.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/ResponsiveCardGrid.tsx) hiển thị các Card phiếu giao nhận.
  - Sắp xếp: **Mới nhất đến cũ nhất** (`date` giảm dần).
  - Phân trang: Mỗi trang tối đa **12 phiếu** (`itemsPerPage = 12`).
  - Thanh phân trang ở đáy danh sách: Nút _Trang trước_, danh sách số trang `[1, 2, 3...]`, nút _Trang sau_.
- **Tương Tác Thẻ Phiếu**:
  - Mỗi thẻ hiển thị: Mã phiếu (`GN-...`), Ngày, Trạng thái (badge màu), Tổng số lượng đồ sạch giao, Tổng số lượng đồ bẩn nhận.
  - Nút _"Xem Phiếu"_ trên mỗi thẻ: Mở modal `HandoverDeliverySlipModal` để xem ảnh phiếu canvas đầy đủ 2 chiều, tải ảnh PNG hoặc sao chép vào Zalo.

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Backend Permissions & API Contracts

- [x] T1: [be-nestjs-thanhxuan/src/config/permissions.map.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/config/permissions.map.ts) - Cấp quyền `PARTNER_VIEW` và `CATALOG_PRICE_CUSTOMER_VIEW` cho `PARTNER_MANAGER`, `PARTNER_STAFF`, `RESTAURANT_MANAGER`, `RESTAURANT_STAFF` - Tiêu chí: Gọi API `/partners/brands`, `/partners`, `/partners/catalogs` với JWT của Partner trả về HTTP 200, không bị 403. - Depends on: none
- [x] T2: [be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts) - Rà soát quyền `HANDOVER_CLEAN_PLAN` trên `POST prep-order` và `HANDOVER_PARTNER_COUNT` trên `POST partner-count` - Tiêu chí: Endpoint nhận diện đúng quyền và không bị 403 khi bên soạn đồ / đối tác gửi dữ liệu. - Depends on: T1

### Giai đoạn 2: Khắc Phục Lỗi Loop Re-render Frontend

- [x] T3: [fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx) - Thêm guard condition chống re-render vô tận khi `partners.length === 0` và tối ưu deps của `useEffect` - Tiêu chí: Mở `PrepOrderModal` không còn xuất hiện cảnh báo `Warning: Maximum update depth exceeded`. - Depends on: none

### Giai đoạn 3: Smart Math Parser & Tiện Ích Tính Toán

- [x] T4: [fe-react-thanhxuan-internal/src/lib/utils.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/lib/utils.ts) - Xây dựng hàm `parseSmartQtyExpression(input: string): number` hỗ trợ tính chuỗi cộng trừ nhanh (`12 34`, `12 + 34`, `50-10`) an toàn không dùng `eval` - Tiêu chí: Hàm unit test trả về đúng kết quả số học và không bị NaN/âm. - Depends on: none

### Giai đoạn 4: Menu Đối Tác Mobile-First (Bottom Navbar) & Quy Chuẩn Layout

- [x] T5: [fe-react-thanhxuan-internal/src/components/layout/nav-config.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/nav-config.ts) - Cấu hình các mục điều hướng chi tiết cho `PARTNER_STAFF` và `PARTNER_MANAGER` - Tiêu chí: Hàm `getMobileQuickNavItems` trả về đủ danh sách các tab theo vai trò. - Depends on: none
- [x] T6: [fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx) - Nhận diện ngữ cảnh trang đối tác và render thanh điều hướng 4 tab (Đếm đồ bẩn, Kiểm nhận, Lịch sử, Phê duyệt) - Tiêu chí: Trên thiết bị di động, bấm từng nút trên BottomBar chuyển tab mượt mà. - Depends on: T5
- [x] T7: [fe-react-thanhxuan-internal/src/features/operations/partners/PartnerPortalPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/PartnerPortalPage.tsx) - Quy chuẩn trang dùng `PageBanner` và `PageActionBar`, đồng bộ trạng thái qua `?tab=` - Tiêu chí: Giao diện chuẩn 3 tầng visual hierarchy, header ẩn trên mobile khi đã có bottom bar. - Depends on: T6

### Giai đoạn 5: Form Đếm Đồ Bẩn Chuẩn Hóa & Ghép Phiếu Giao Nhận Kép

- [x] T8: [fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerCountTabComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerCountTabComponent.tsx) - Xây dựng lại giao diện hỗ trợ 2 chế độ xem (Card / Table), cột Đồ chưa giặt áp dụng Smart Math Input, chữ ký Canvas và nút "Lưu và xem phiếu giao nhận" - Tiêu chí: Gõ `12 34` hoặc `12 + 34` ra `46`, blur lưu ngay, khóa chi nhánh/ngày theo phiếu soạn đồ của quản lý kho. - Depends on: T4, T7

### Giai đoạn 6: Kiểm Nhận Đồ Sạch Canvas 2 Chiều & Điều Hướng Ngày

- [x] T9: [fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerReceiptTabComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerReceiptTabComponent.tsx) - Tích hợp xem phiếu canvas 2 chiều, nút điều hướng lùi/tiến ngày (`ChevronLeft`/`Right`), ô họ tên (mặc định từ user) và chữ ký xác nhận kiểm nhận - Tiêu chí: Bấm lùi/tiến ngày cập nhật phiếu tương ứng, ký tên xác nhận gửi API thành công. - Depends on: T7

### Giai đoạn 7: Lịch Sử Phân Trang & Tra Cứu Theo Ngày

- [x] T10: [fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerHistoryTabComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerHistoryTabComponent.tsx) - Nâng cấp danh sách dùng `ResponsiveCardGrid`, sắp xếp mới đến cũ, phân trang tối đa 12 phiếu/trang, bộ lọc ngày cụ thể và nút xem chi tiết phiếu canvas - Tiêu chí: Chọn 1 ngày lọc đúng phiếu ngày đó, danh sách phân trang mượt mà 12 item/page. - Depends on: T7

---

## 4. Verification & Testing

### 4.1. Lệnh Kiểm Tra Hệ Thống

1. **Backend (`be-nestjs-thanhxuan/`):**
   - Typecheck: `pnpm exec tsc --noEmit`
   - Build: `pnpm build`
2. **Frontend Internal (`fe-react-thanhxuan-internal/`):**
   - Typecheck: `pnpm exec tsc --noEmit`
   - Build: `pnpm build`

### 4.2. Kịch Bản Kiểm Thử (Happy Path & Edge Cases)

1. **Khắc phục lỗi 403 & kết nối:**
   - Đăng nhập với tài khoản `PARTNER_STAFF` hoặc `PARTNER_MANAGER`:
   - Gọi `/api/v1/internal/partners/brands` -> 200 OK.
   - Gọi `/api/v1/internal/partners/catalogs?brand=...` -> 200 OK.
   - Không còn lỗi 403 Forbidden hay 401 Unauthorized.
2. **Giao diện Menu Mobile:**
   - Bật DevTools mô phỏng màn hình iPhone / Android (< 768px):
   - Thanh Bottom Navbar xuất hiện ở đáy màn hình với các mục: _Đếm đồ bẩn_, _Kiểm nhận_, _Lịch sử_, _Phê duyệt NV_ (với Partner Manager).
   - Bấm vào từng nút: Giao diện chuyển tab ngay lập tức, thanh tab header cũ ẩn đi gọn gàng.
3. **Form Đếm đồ bẩn thông minh:**
   - Kiểm tra thông tin: Thương hiệu, Chi nhánh, Ngày hiển thị chính xác theo tài khoản và bị khóa (disabled).
   - Chuyển đổi giữa chế độ _Dạng Thẻ_ và _Dạng Bảng_.
   - Nhập vào ô đồ chưa giặt:
     - Gõ `10 20` -> Rời ô (blur) -> Hiển thị `30`.
     - Gõ `15 + 25` -> Blur -> Hiển thị `40`.
     - Gõ `50-15` -> Blur -> Hiển thị `35`.
   - Bấm _"Lưu và xem phiếu giao nhận"_: Modal phiếu xuất hiện với đầy đủ cả cột Đồ chưa giặt và Đồ sạch đã soạn.
4. **Kiểm nhận đồ sạch Canvas 2 chiều:**
   - Chọn tab _Kiểm nhận_: Phiếu xuất nhập kho canvas 2 chiều hiển thị trực quan.
   - Bấm nút sang trái: Ngày lùi về 1 ngày, canvas vẽ phiếu ngày hôm trước.
   - Bấm nút sang phải: Ngày tiến lên 1 ngày, canvas vẽ phiếu ngày tiếp theo.
   - Ô họ tên người nhận tự động điền họ tên tài khoản đăng nhập.
   - Ký tên vào khung chữ ký và bấm xác nhận kiểm nhận -> Thành công.
5. **Lịch sử giao nhận phân trang & lọc ngày:**
   - Chọn tab _Lịch sử_: Danh sách phiếu hiển thị theo thứ tự từ mới nhất đến cũ nhất.
   - Phân trang: Kiểm tra hiển thị tối đa 12 phiếu mỗi trang, các nút trang trước/sau hoạt động chuẩn xác.
   - Chọn 1 ngày cụ thể trên bộ lọc ngày: Danh sách lọc ra đúng phiếu của ngày đó.
   - Bấm nút _"Xem Phiếu"_ trên từng thẻ: Mở modal canvas hiển thị đầy đủ phiếu để tải ảnh hoặc copy Zalo.
6. **Kiểm tra PrepOrderModal bên Warehouse:**
   - Mở màn hình Soạn đồ sạch của Warehouse Manager -> Mở `PrepOrderModal`: Không bị crash, không bị cảnh báo `Maximum update depth exceeded`.

---

## 5. Risks & Rollback

- **Rủi ro phân quyền:** Cấp thêm quyền `PARTNER_VIEW` cho đối tác có thể làm lộ danh sách chi nhánh khác nếu không có `PartnerScopeGuard`.
  - _Phương án giảm thiểu:_ [PartnerScopeGuard.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/common/guards/partner-scope.guard.ts) đã được gắn ở `HandoverController` và sẽ được rà soát để đảm bảo nhân viên đối tác chỉ query được chi nhánh của chính mình.
- **Rollback:** Dùng `git checkout` các file đã chỉnh sửa nếu có bất kỳ lỗi biên dịch nào phát sinh.

---

## Changelog

- 2026-10-10: Khởi tạo Plan 21 giải quyết toàn diện menu đối tác Mobile-First, form đếm đồ bẩn thông minh, ghép phiếu 2 chiều và sửa lỗi 403 / loop re-render.
- 2026-10-10: Bổ sung đặc tả tab Kiểm nhận đồ sạch (canvas 2 chiều, điều hướng lùi/tiến ngày, họ tên + chữ ký), tab Lịch sử (phân trang tối đa 12 phiếu/trang, sắp xếp mới đến cũ, chọn 1 ngày cụ thể) và quy chuẩn giao diện bằng `@/components/common`.
- 2026-10-10: Cập nhật quy chuẩn ngày trong form đếm đồ bẩn: khóa cứng và mặc định lấy theo ngày của phiếu soạn đồ do quản lý kho tạo.

---

## Execution Log

- **Ngày thực thi:** 2026-10-10
- **Trạng thái:** Hoàn tất toàn diện 100% (Tasks T1 đến T10).
- **Các hạng mục hoàn tất:**
  - T1 - T3: Bổ sung quyền `PARTNER_VIEW`, `CATALOG_PRICE_CUSTOMER_VIEW` trong `permissions.map.ts` cho các vai trò đối tác; cập nhật Jest snapshot pass 9/9; xác minh endpoint handover/partners.
  - T4: Khắc phục triệt để lỗi loop re-render `Maximum update depth exceeded` tại `PrepOrderModal.tsx` lines 122-133 và 161-192.
  - T5 - T7: Cấu hình `nav-config.ts` và `MobileBottomBar.tsx` hiển thị 4 nút chức năng (`COUNT`, `RECEIPT`, `HISTORY`, `STAFF`) cho đối tác; nâng cấp `PartnerPortalPage.tsx` chuẩn 3 tầng UI với `@/components/common` (`PageBanner`, `PageActionBar`), đồng bộ qua `?tab=`.
  - T8: Tái cấu trúc `PartnerCountTabComponent.tsx` theo chuẩn `PrepOrderModal` (Card/Table view), khóa cứng Brand/Partner/Date theo phiếu soạn, 1 cột "Đồ chưa giặt", bộ giải toán thông minh `parseSmartQtyExpression`, auto-save on blur, lưu & xem phiếu ghép 2 chiều canvas.
  - T9: Hoàn thiện `PartnerReceiptTabComponent.tsx` vẽ Canvas phiếu 2 chiều, nút lùi/tiến ngày `ChevronLeft`/`ChevronRight`, tự động nạp họ tên và khung chữ ký xác nhận kiểm nhận.
  - T10: Nâng cấp `PartnerHistoryTabComponent.tsx` dùng `ResponsiveCardGrid`, sắp xếp mới đến cũ, phân trang tối đa 12 phiếu/trang, bộ lọc ngày cụ thể và nút xem chi tiết phiếu canvas.
  - Kiểm thử & Build: Backend NestJS (`tsc`, `build`) và Frontend Vite (`tsc -b`, `vite build`) đều PASS 100% không có lỗi.
