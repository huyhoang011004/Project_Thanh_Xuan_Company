# Plan 17: Đồng Bộ Role Partner (Backend & Frontend), Đăng Ký Theo Brand-Partner và Phân Vùng Dữ Liệu Chi Nhánh

> Status: Done | Created: 2026-10-08 | Scope: be-nestjs-thanhxuan, fe-react-thanhxuan-internal

---

## 1. Overview & Affected Files

### 1.1. Mục Tiêu & Bối Cảnh
Hiện tại, Frontend đã chuyển đổi tên thư mục và giao diện sang `partner-manager` và `partner-staff`, tuy nhiên:
1. **Backend Role & Endpoints:** Vẫn còn dùng tên cũ `RESTAURANT_MANAGER`, `RESTAURANT_STAFF`, permission `HANDOVER_RESTAURANT_COUNT`, endpoint `:id/restaurant-count`. Cần đổi sang `PARTNER_MANAGER`, `PARTNER_STAFF`, `HANDOVER_PARTNER_COUNT`, `:id/partner-count` (kèm alias tương thích ngược).
2. **Quy Trình Đăng Ký Tài Khoản Đối Tác (Cascade Brand -> Partner):**
   - Hiện tại tài khoản đối tác chỉ chọn đơn lẻ chi nhánh (`partnerId`) mà không chọn Thương hiệu (`brand`).
   - Yêu cầu mới: Khi đăng ký tài khoản `PARTNER_STAFF` hoặc `PARTNER_MANAGER`, bắt buộc phải chọn **Thương hiệu** ([brand.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/schemas/brand.schema.ts)) trước, sau đó chọn **Chi nhánh trực thuộc** ([partner.schema.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/schemas/partner.schema.ts)) của thương hiệu đó.
3. **Phân Vùng Dữ Liệu Khi Đăng Nhập (Scope Isolation):**
   - Khi nhân viên đối tác đăng nhập, hệ thống đảm bảo 100% dữ liệu (kiểm đếm đồ bẩn, kiểm nhận đồ sạch, lịch sử giao nhận, nhân viên chờ duyệt) chỉ hiển thị đúng phạm vi chi nhánh (`partnerId`) và thương hiệu (`brand`) mà nhân viên đó đang làm việc.

### 1.2. Danh Sách File Bị Ảnh Hưởng (Affected Files)

#### A. Backend (`be-nestjs-thanhxuan`)
- `src/modules/internal/common/enums/internal.enums.ts` (Thêm `PARTNER_MANAGER`, `PARTNER_STAFF`, alias `RESTAURANT_*`)
- `src/modules/internal/auth/schemas/staff-account.schema.ts` (Thêm enum role mới, thêm trường `brand?: string`)
- `src/modules/internal/auth/dto/register.dto.ts` (Thêm role `PARTNER_STAFF`, `PARTNER_MANAGER`, thêm trường `brand`)
- `src/modules/internal/auth/dto/create-management-account.dto.ts` (Cập nhật role `PARTNER_MANAGER`, thêm `brand`)
- `src/modules/internal/auth/accounts.service.ts` (Validate `brand` & `partnerId`, gán eligibleRoles cho approval)
- `src/modules/internal/partners/controllers/partners.controller.ts` (Public endpoint lấy danh sách Brands và Partners theo Brand)
- `src/common/guards/partner-scope.guard.ts` (Cập nhật role `PARTNER_STAFF`, `PARTNER_MANAGER`)
- `src/config/permissions.map.ts` (Cập nhật permissions cho `PARTNER_MANAGER`, `PARTNER_STAFF`)
- `src/modules/internal/handovers/handover-state.ts` (Cập nhật check role)
- `src/modules/internal/handovers/controllers/handover.controller.ts` (Endpoint `:id/partner-count` kèm alias `:id/restaurant-count`)
- `src/modules/internal/auth/controllers/approvals.controller.ts` (Duyệt theo role mới)

#### B. Frontend Internal (`fe-react-thanhxuan-internal`)
- `src/types/index.ts` (Cập nhật `StaffRole.PARTNER_MANAGER = 'PARTNER_MANAGER'`, `StaffRole.PARTNER_STAFF = 'PARTNER_STAFF'`)
- `src/lib/permissions.ts` (Cập nhật permissions map theo role mới)
- `src/components/layout/nav-config.ts` (Cập nhật `allowedRoles` sang `PARTNER_MANAGER`, `PARTNER_STAFF`)
- `src/components/layout/AppHeader.tsx`, `MobileNavDrawer.tsx` (Cập nhật badges role mới)
- `src/features/auth/AuthContext.tsx` (Cập nhật `getDefaultRouteForRole`)
- `src/features/auth/RegisterPage.tsx`, `RegisterModal.tsx` (Thêm lựa chọn Brand -> Chi nhánh Cascade Select)
- `src/features/operations/partners/PartnerPortalPage.tsx` (Gọi endpoint mới, đảm bảo hiển thị đúng scope chi nhánh)
- `src/app/(internal)/operations/partner-manager/partner/page.tsx`, `partner-staff/partner/page.tsx` (Cập nhật `allowedRoles`)
- `src/app/(internal)/management/manager/approval/page.tsx` (Cập nhật `allowedRoles`)

---

## 2. Technical Architecture & Design Decisions

### 2.1. Cấu Trúc Role & Backward Compatibility
Để bảo đảm an toàn dữ liệu MongoDB hiện có mà vẫn chuẩn hóa mã nguồn:
```typescript
export enum StaffRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  SHIPPER = 'SHIPPER',
  WORKER = 'WORKER',
  PARTNER_MANAGER = 'PARTNER_MANAGER',
  PARTNER_STAFF = 'PARTNER_STAFF',
  // Backward compatibility alias cho DB hiện có
  RESTAURANT_MANAGER = 'PARTNER_MANAGER',
  RESTAURANT_STAFF = 'PARTNER_STAFF',
}
```
Tại Backend Auth Strategy & Guards, chuẩn hóa hỗ trợ cả giá trị string cũ `'RESTAURANT_MANAGER'` và `'RESTAURANT_STAFF'` khi đọc từ DB cũ, tự động normalize sang `PARTNER_MANAGER` / `PARTNER_STAFF`.

### 2.2. Schema Cải Tiến `StaffAccount`
```typescript
@Prop({ type: String, uppercase: true, trim: true, index: true })
brand?: string; // Lưu mã thương hiệu đối tác: 'PIZZA_4PS', 'HAIDILAO'...

@Prop({ type: SchemaTypes.ObjectId, ref: 'Partner', index: true })
partnerId?: any; // Chi nhánh trực thuộc cụ thể
```

### 2.3. Quy Trình Đăng Ký Cascade (Brand ➔ Partner)
1. Client gọi `GET /partners/brands/public` lấy danh sách các thương hiệu đang hoạt động (`isActive: true`).
2. Client gọi `GET /partners/public` (hoặc `/partners/public?brand={brandCode}`) lấy danh sách chi nhánh.
3. Người dùng chọn:
   - **Vai trò:** `PARTNER_STAFF` (Nhân viên đối tác) hoặc `PARTNER_MANAGER` (Quản lý đối tác).
   - **Thương hiệu đối tác:** Bắt buộc chọn từ dropdown `Brand`.
   - **Chi nhánh trực thuộc:** Dropdown `Partner` chỉ hiển thị các chi nhánh có `partner.brand === selectedBrand`.
4. Backend `accounts.service.ts`:
   - Xác thực: nếu role là `PARTNER_STAFF` hoặc `PARTNER_MANAGER`, bắt buộc có cả `brand` và `partnerId`.
   - Kiểm tra chéo: Chi nhánh `partnerId` phải thuộc đúng `brand` đã khai báo.
   - Khi tạo yêu cầu phê duyệt (`ApprovalRequest`): Gán `partnerId` và `brand`, cho phép `PARTNER_MANAGER` của chi nhánh đó duyệt tài khoản.

### 2.4. Phân Vùng Hiển Thị Dữ Liệu Khi Login (Scope Isolation)
- Khi `PARTNER_STAFF` hoặc `PARTNER_MANAGER` đăng nhập:
  - Token JWT chứa `partnerId` và `brand`.
  - `PartnerScopeGuard` ở Backend tự động inject filter `partnerId = user.partnerId` vào mọi request query/body, chặn truy cập chéo sang chi nhánh khác.
  - Trên giao diện [PartnerPortalPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/partners/PartnerPortalPage.tsx):
    - Đếm đồ bẩn: Dùng danh mục `catalog` theo `partner.brand`.
    - Kiểm nhận đồ sạch & Lịch sử phiếu: Tải phiếu giao nhận của đúng `partnerId`.
    - Quản lý nhân viên (chỉ dành cho `PARTNER_MANAGER`): Chỉ load các `ApprovalRequest` có cùng `partnerId`.

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn A: Backend Role & Schema Standardization
- [x] T1: [be-nestjs-thanhxuan/src/modules/internal/common/enums/internal.enums.ts, schemas/staff-account.schema.ts] - Khai báo role `PARTNER_MANAGER`, `PARTNER_STAFF` (kèm alias `RESTAURANT_*`), bổ sung trường `brand` vào `StaffAccount` schema - Depends on: none
- [x] T2: [be-nestjs-thanhxuan/src/config/permissions.map.ts, src/common/guards/partner-scope.guard.ts, handover-state.ts] - Cập nhật permissions map, partner scope guard và handover state machine sang role mới - Depends on: T1
- [x] T3: [be-nestjs-thanhxuan/src/modules/internal/auth/dto/register.dto.ts, create-management-account.dto.ts, accounts.service.ts] - Bổ sung trường `brand`, validate đối chiếu `brand` và `partnerId`, cập nhật logic tạo approval request - Depends on: T1, T2
- [x] T4: [be-nestjs-thanhxuan/src/modules/internal/partners/controllers/partners.controller.ts, handovers/controllers/handover.controller.ts] - Bổ sung public API brands/partners cho form đăng ký, cập nhật endpoint `:id/partner-count` (kèm alias `:id/restaurant-count`) - Depends on: T2, T3

### Giai đoạn B: Frontend Types, Permissions & Navigation
- [x] T5: [fe-react-thanhxuan-internal/src/types/index.ts, src/lib/permissions.ts] - Cập nhật `StaffRole` (`PARTNER_MANAGER`, `PARTNER_STAFF`), mở rộng interface `StaffAccount` có trường `brand` - Depends on: none
- [x] T6: [fe-react-thanhxuan-internal/src/components/layout/, src/features/auth/AuthContext.tsx] - Cập nhật `nav-config.ts`, `AppHeader.tsx`, `MobileNavDrawer.tsx`, `AuthContext.tsx` với role mới - Depends on: T5
- [x] T7: [fe-react-thanhxuan-internal/src/app/(internal)/] - Cập nhật `allowedRoles` trong các trang `partner-manager/partner`, `partner-staff/partner`, `manager/approval`, `shipper/handover/[recordCode]` - Depends on: T5, T6

### Giai đoạn C: Frontend Cascade Registration & Portal Isolation
- [x] T8: [fe-react-thanhxuan-internal/src/features/auth/RegisterPage.tsx, RegisterModal.tsx] - Xây dựng dropdown chọn Brand ➔ lọc Chi nhánh Partner tương ứng, gửi kèm `brand` và `partnerId` khi đăng ký - Depends on: T4, T5
- [x] T9: [fe-react-thanhxuan-internal/src/features/operations/partners/PartnerPortalPage.tsx] - Cập nhật gọi endpoint `partner-count`, hiển thị thông tin Brand & Chi nhánh, query lịch sử và duyệt nhân viên theo đúng chi nhánh người dùng - Depends on: T4, T7, T8

### Giai đoạn D: Verification, Build & Documentation
- [x] T10: [Verify & Docs] - Chạy `pnpm exec tsc -b` & `pnpm build` ở frontend, `pnpm build` ở backend; cập nhật tài liệu `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md` và `CHANGELOG.md` - Depends on: T1..T9

---

## 4. Verification & Testing

1. **Kiểm tra đăng ký (Registration Flow):**
   - Mở màn hình đăng ký (`/register` hoặc Modal đăng ký).
   - Chọn "Nhân Viên Đối Tác" hoặc "Quản Lý Đối Tác".
   - Dropdown "Thương hiệu đối tác" hiển thị danh sách (Pizza 4P's, Haidilao...).
   - Khi chọn một thương hiệu, Dropdown "Chi nhánh" chỉ hiển thị các chi nhánh của thương hiệu đó.
   - Đăng ký thành công và nhận mã OTP.
2. **Kiểm tra phân vùng dữ liệu sau khi đăng nhập (Portal Scope):**
   - Đăng nhập bằng tài khoản Quản lý Đối tác (`PARTNER_MANAGER`) của chi nhánh A.
   - Vào trang `/operations/partner-manager/partner`:
     - Tên cơ sở hiển thị đúng chi nhánh A và thương hiệu A.
     - Lịch sử phiếu giao nhận chỉ hiện các phiếu của chi nhánh A.
     - Kiểm đồ bẩn chỉ gửi phiếu cho chi nhánh A.
     - Tab duyệt nhân viên chỉ hiển thị nhân viên thuộc chi nhánh A.
3. **Kiểm tra cú pháp & build:**
   - Backend: `pnpm build` (`nest build`) ➔ Pass 100%.
   - Frontend: `pnpm exec tsc -b` && `pnpm build` ➔ Pass 100%.

---

## 5. Definition of Done (DoD)
1. Backend và Frontend đồng nhất 100% tên role `PARTNER_MANAGER` và `PARTNER_STAFF`.
2. Form đăng ký hỗ trợ chọn Thương hiệu (Brand) trước, rồi chọn Chi nhánh (Partner) lọc theo Brand.
3. Tài khoản đối tác lưu trữ cả `brand` và `partnerId`.
4. Người dùng đăng nhập chỉ thấy thông tin giao nhận và kiểm đồ của chi nhánh mình.
5. Cả 2 dự án build thành công và cập nhật tài liệu kiến trúc.

---

## 6. Execution Log

- **Ngày thực thi:** 2026-10-08
- **Người thực hiện:** Technical Execution Agent (/act)
- **Các task hoàn tất:**
  - T1: Chuẩn hóa role `PARTNER_MANAGER`, `PARTNER_STAFF` (kèm alias `RESTAURANT_*`), thêm trường `brand` vào `StaffAccount` schema.
  - T2: Đồng bộ permissions map (`ACCOUNT_APPROVE_PARTNER`, `HANDOVER_PARTNER_COUNT`), cập nhật `partner-scope.guard.ts` và `handover-state.ts`.
  - T3: Bổ sung trường `brand` vào DTOs, cập nhật `accounts.service.ts` validate ràng buộc `brand` & `partnerId`, đưa `brand` vào JWT payload/getMe.
  - T4: Bổ sung endpoint public `GET /partners/brands/public`, endpoint `@Post(['partner-count', 'restaurant-count'])` và `@Put(':id/partner-count')`.
  - T5: Cập nhật types, permissions ở Frontend Internal.
  - T6: Cập nhật điều hướng, layout, header, drawer và AuthContext.
  - T7: Cập nhật route guard `allowedRoles` ở các trang tác nghiệp và duyệt tài khoản.
  - T8: Xây dựng Cascade dropdown Brand ➔ Partner trên form đăng ký (`RegisterPage.tsx`, `RegisterModal.tsx`).
  - T9: Hoàn thiện `PartnerPortalPage.tsx` cô lập dữ liệu theo chi nhánh (Brand tag, đếm đồ bẩn qua endpoint mới, lọc lịch sử và duyệt nhân viên theo đúng `partnerId`).
  - T10: Chạy verify `pnpm build` cả 2 app pass 100%, đồng bộ tài liệu `SRS_SDD.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `CHANGELOG.md`.
- **Kết quả Build:**
  - `be-nestjs-thanhxuan`: `pnpm build` (nest build) ➔ Pass 100% (exit code 0).
  - `fe-react-thanhxuan-internal`: `pnpm build` (tsc -b && vite build) ➔ Pass 100% (exit code 0).
