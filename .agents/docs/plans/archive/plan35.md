# Plan 35: Chức Năng Chọn Chữ Ký Đã Lưu Trong Tài Khoản Cho Web Internal

> Status: Done | Created: 2026-10-26

## 1. Overview & Affected Files

### 1.1. Mục Tiêu & Phạm Vi
- **Mục tiêu:** Cho phép người dùng (Thủ kho, Shipper, Đối tác, Quản lý) lưu trữ chữ ký mẫu vào thông tin tài khoản cá nhân trên Cổng Nội Bộ (`fe-react-thanhxuan-internal`), đồng thời tại tất cả các màn hình/modal cần ký tên (soạn đồ sạch, giao nhận, kiểm đếm đồ bẩn, đối tác xác nhận...), người dùng có thể kích hoạt tùy chọn "Dùng chữ ký đã lưu" để điền chữ ký tức thì mà không cần phải vẽ tay lại mỗi lần.
- **Phạm vi áp dụng:**
  - **Backend (`be-nestjs-thanhxuan`):** Bổ sung trường `signatureUrl` vào bảng `accounts` (`StaffAccount`) trong CSDL `internal_express`, cập nhật DTO cập nhật hồ sơ (`UpdateProfileDto`) và các service lấy/cập nhật thông tin tài khoản cá nhân (`getMe`, `getAccountMe`, `updateProfile`).
  - **Frontend Internal (`fe-react-thanhxuan-internal`):**
    - Bổ sung trường `signatureUrl` vào type `StaffUser` và `AuthContext`.
    - Màn hình cá nhân (`ProfileEditModal`): Thêm khu vực xem chữ ký mẫu, vẽ/cập nhật chữ ký mới, tải ảnh chữ ký lên hoặc xóa chữ ký mẫu.
    - Xây dựng Component tái sử dụng `SignaturePadComponent.tsx` (hoặc `SignatureInputComponent.tsx`) tích hợp sẵn: Khung vẽ SignatureCanvas, toggle "Dùng chữ ký đã lưu" (nếu tài khoản đã có chữ ký), preview chữ ký mẫu, xóa/ký lại, và checkbox "Lưu làm chữ ký mặc định của tôi" khi ký tay.
    - Tích hợp tính năng chọn chữ ký đã lưu vào 5 vị trí ký tên trọng yếu:
      1. `PrepOrderModal.tsx`: Thủ kho ký xác nhận xuất xưởng đồ sạch.
      2. `SignatureModal.tsx`: Modal chung ký nhận bàn giao đồ sạch / đối tác xác nhận.
      3. `ShipperCountPartnerModal.tsx`: Shipper kiểm đếm đồ bẩn cùng đối tác.
      4. `PartnerReceiptTabComponent.tsx`: Màn hình cổng đối tác xác nhận nhận đồ sạch.
      5. `PartnerCountTabComponent.tsx`: Màn hình cổng đối tác kiểm đếm và giao đồ bẩn.
  - **Tài liệu hệ sinh thái:** Đồng bộ `DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`.
- **Out of scope:**
  - Không thay đổi bảng `users` của CMS `laundry_express` (chỉ áp dụng bảng `accounts` của `internal_express`).
  - Không thay đổi hợp đồng API cốt lõi của phiếu giao nhận `HandoverRecord` (phiếu giao nhận đã hỗ trợ nhận chuỗi Data URL Base64 hoặc Image URL).

### 1.2. Assumptions & Open Questions
- **Assumptions:**
  - Chữ ký mẫu được lưu dưới dạng PNG Data URL (Base64) hoặc Cloudinary Image URL trong `StaffAccount.signatureUrl`. Kích thước chữ ký sau khi `trimCanvas` rất nhỏ (khoảng 5KB - 15KB), lưu an toàn trong MongoDB và cho phép ứng dụng PWA chạy offline mà không lo lỗi CORS Tainted Canvas.
  - Khi người dùng tick chọn "Lưu làm chữ ký mặc định của tôi" tại modal ký tên, hệ thống tự động gửi API PATCH `/accounts/me/profile` ngầm để cập nhật tài khoản và Auth Context mà không làm gián đoạn luồng submit phiếu.
- **Open Questions:** Không có.

### 1.3. Bảng File Ảnh Hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts` | edit | Bổ sung field `signatureUrl?: string` trong schema `StaffAccount`. |
| `be-nestjs-thanhxuan/src/modules/internal/auth/dto/update-profile.dto.ts` | edit | Bổ sung field `signatureUrl?: string` có validation vào DTO cập nhật profile. |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-auth.service.ts` | edit | Bổ sung `signatureUrl` vào object trả về của `getMe`. |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-management.service.ts` | edit | Cập nhật `updateProfile` và `getAccountMe` để xử lý và trả về `signatureUrl`. |
| `fe-react-thanhxuan-internal/src/types/index.ts` | edit | Bổ sung `signatureUrl?: string` vào interface `StaffUser`. |
| `fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx` | edit | Map trường `signatureUrl` khi nạp tài khoản trong `fetchMe`. |
| `fe-react-thanhxuan-internal/src/features/auth/modals/ProfileEditModal.tsx` | edit | Thêm khu vực xem, vẽ, tải lên, lưu hoặc xóa chữ ký mẫu cá nhân. |
| `fe-react-thanhxuan-internal/src/components/common/SignatureInputComponent.tsx` | add | Component UI chung hỗ trợ vẽ tay, toggle chữ ký đã lưu, preview, và tùy chọn lưu làm chữ ký mặc định. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/SignatureModal.tsx` | edit | Tích hợp tùy chọn chọn chữ ký đã lưu và lưu làm mặc định. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx` | edit | Cho phép Thủ kho chọn dùng chữ ký mẫu từ tài khoản khi xuất xưởng. |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/ShipperCountPartnerModal.tsx` | edit | Cho phép Shipper dùng chữ ký đã lưu khi đếm đồ bẩn. |
| `fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerReceiptTabComponent.tsx` | edit | Cho phép nhân sự đối tác dùng chữ ký đã lưu khi xác nhận nhận đồ sạch. |
| `fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerCountTabComponent.tsx` | edit | Cho phép nhân sự đối tác dùng chữ ký đã lưu khi giao đồ bẩn. |
| `.agents/docs/DATABASE_DICTIONARY.md` | edit | Bổ sung trường `signatureUrl` vào bảng `accounts` (`StaffAccount`). |
| `.agents/docs/CODEBASE_ATLAS.md` | edit | Bổ sung `SignatureInputComponent` vào sơ đồ codebase. |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | edit | Cập nhật đặc tả profile API. |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | edit | Cập nhật đặc tả UX chữ ký điện tử nội bộ. |
| `.agents/docs/SRS_SDD.md` | edit | Thêm 1 dòng Document History. |
| `.agents/docs/CHANGELOG.md` | edit | Ghi nhận nhật ký thay đổi của Plan 35. |

---

## 2. Technical Approach

### 2.1. Luồng Dữ Liệu & Kiến Trúc
```
[User Profile: ProfileEditModal] 
      │ (Ký tay / Upload ảnh)
      ▼
PATCH /accounts/me/profile { signatureUrl: "data:image/png;base64,..." }
      │
      ▼
MongoDB (accounts.signatureUrl)
      │
      ▼
GET /auth/me ──> AuthContext (user.signatureUrl)
      │
      ├───────────────────────┬──────────────────────┬───────────────────────┐
      ▼                       ▼                      ▼                       ▼
PrepOrderModal         SignatureModal     ShipperCountPartnerModal   Partner Tabs
(Thủ kho xuất xưởng)   (Ký nhận đối tác)  (Shipper đếm đồ bẩn)     (Cổng đối tác)
      │                       │                      │                       │
      └───────────────────────┴──────────────────────┴───────────────────────┘
                                  ▼
             [Nút: "Dùng chữ ký đã lưu" / "Ký tay mới"]
                                  ▼
           [Checkbox: "Lưu làm chữ ký mặc định của tôi"]
```

### 2.2. Interface / Contract

#### 2.2.1. Backend StaffAccount Schema & DTO
```typescript
// be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts
@Schema({ timestamps: true, collection: 'accounts' })
export class StaffAccount {
  // ... các trường hiện có
  @Prop({ type: String })
  signatureUrl?: string; // Data URL Base64 PNG hoặc URL Cloudinary
}

// be-nestjs-thanhxuan/src/modules/internal/auth/dto/update-profile.dto.ts
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,11}$/, { message: 'Phone must be 10-11 digits' })
  phone?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  signatureUrl?: string;
}
```

#### 2.2.2. Frontend Types & SignatureInputComponent Props
```typescript
// fe-react-thanhxuan-internal/src/types/index.ts
export interface StaffUser {
  // ... các trường hiện hữu
  signatureUrl?: string;
}

// fe-react-thanhxuan-internal/src/components/common/SignatureInputComponent.tsx
export interface SignatureInputComponentProps {
  value?: string; // Base64 hoặc URL chữ ký hiện tại
  onChange: (signatureDataUrl: string) => void;
  onSaveAsDefaultChange?: (saveAsDefault: boolean) => void;
  signerName?: string;
  allowSaveAsDefault?: boolean;
  className?: string;
  height?: number;
}
```

### 2.3. Quyết Định Thiết Kế Chính
1. **Lưu trữ Base64 PNG đã trim khoảng trắng thay vì bắt buộc upload Cloudinary:**
   - Khi ký trên canvas, hàm `trimCanvas` loại bỏ viền trắng thừa, kích thước Base64 nén chỉ khoảng 5 - 15KB.
   - Việc lưu Data URL trực tiếp vào MongoDB giúp hiển thị tức thì, hoạt động 100% mượt mà ngay cả khi thiết bị mất kết nối mạng (PWA/Offline queue), không tốn quota API Cloudinary và không bị rủi ro CORS khi vẽ lại lên canvas xuất phiếu.
   - Nếu người dùng tải ảnh từ máy tính lên, hệ thống hỗ trợ cả Base64 lẫn URL ảnh hợp lệ.
2. **Tách Component `SignatureInputComponent.tsx` độc lập:**
   - Thay vì duplicate mã nguồn SignatureCanvas, nút Clear, logic trimCanvas và state chuyển đổi chữ ký lưu tại 5 màn hình khác nhau, đóng gói thành 1 component chuẩn dùng chung.
   - Component tự động nhận biết `user.signatureUrl`: Nếu có chữ ký mẫu, mặc định hiển thị chế độ "Dùng chữ ký đã lưu" kèm nút "Ký tay lại"; nếu chưa có, hiển thị Canvas kèm checkbox "Lưu làm chữ ký mặc định của tôi".
3. **Tự động đồng bộ Auth Context:**
   - Khi người dùng cập nhật chữ ký mẫu tại Profile hoặc tick chọn "Lưu làm chữ ký mặc định" khi ký một chứng từ, gọi hàm `updateUserProfile({ signatureUrl: newSignature })` để cập nhật ngay vào `localStorage` và React State, các lần ký tiếp theo sẽ tự động nhận diện mà không cần F5 tải lại trang.

---

## 3. Implementation Tasks (Checklist)

### 3.1. Phân Hệ Backend (`be-nestjs-thanhxuan`)
- [x] T1: [`be-nestjs-thanhxuan/src/modules/internal/auth/schemas/staff-account.schema.ts`] - Thêm field `@Prop({ type: String }) signatureUrl?: string;` vào `StaffAccount` schema - Depends on: none
- [x] T2: [`be-nestjs-thanhxuan/src/modules/internal/auth/dto/update-profile.dto.ts`] - Thêm field `signatureUrl?: string` có decorator `@IsOptional() @IsString()` vào `UpdateProfileDto` - Depends on: T1
- [x] T3: [`be-nestjs-thanhxuan/src/modules/internal/auth/services/account-auth.service.ts`] - Map `signatureUrl: account.signatureUrl || null` vào response của hàm `getMe()` - Depends on: T1
- [x] T4: [`be-nestjs-thanhxuan/src/modules/internal/auth/services/account-management.service.ts`] - Thêm xử lý `signatureUrl` trong hàm `updateProfile()` và map `signatureUrl: account.signatureUrl || null` trong hàm `getAccountMe()` - Depends on: T2, T3
- [x] T5: Kiểm tra build Backend `pnpm --prefix be-nestjs-thanhxuan run build` đảm bảo không có lỗi biên dịch - Depends on: T4

### 3.2. Phân Hệ Frontend Internal (`fe-react-thanhxuan-internal`)
- [x] T6: [`fe-react-thanhxuan-internal/src/types/index.ts`] - Bổ sung `signatureUrl?: string;` vào interface `StaffUser` - Depends on: none
- [x] T7: [`fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx`] - Map trường `signatureUrl: rawUser.signatureUrl || ''` vào `normalizedUser` trong `fetchMe()` - Depends on: T6
- [x] T8: [`fe-react-thanhxuan-internal/src/features/auth/modals/ProfileEditModal.tsx`] - Thêm khu vực "Chữ Ký Điện Tử Đã Lưu": hiển thị preview chữ ký mẫu, canvas vẽ chữ ký mới, nút lưu và nút xóa chữ ký mẫu - Depends on: T7
- [x] T9: [`fe-react-thanhxuan-internal/src/components/common/SignatureInputComponent.tsx`] - Tạo component tái sử dụng hỗ trợ: ký tay, chuyển đổi "Dùng chữ ký đã lưu" / "Ký tay mới", preview chữ ký, và checkbox "Lưu làm chữ ký mặc định" - Depends on: T7
- [x] T10: [`fe-react-thanhxuan-internal/src/features/operations/handovers/modals/SignatureModal.tsx`] - Tích hợp `SignatureInputComponent` hoặc logic chữ ký đã lưu vào modal ký nhận bàn giao đồ giặt - Depends on: T9
- [x] T11: [`fe-react-thanhxuan-internal/src/features/operations/handovers/modals/PrepOrderModal.tsx`] - Tích hợp tùy chọn chọn chữ ký đã lưu của Thủ kho khi soạn đồ sạch xuất xưởng - Depends on: T9
- [x] T12: [`fe-react-thanhxuan-internal/src/features/operations/handovers/modals/ShipperCountPartnerModal.tsx`] - Tích hợp tùy chọn chọn chữ ký đã lưu của Shipper khi kiểm đếm đồ bẩn cùng đối tác - Depends on: T9
- [x] T13: [`fe-react-thanhxuan-internal/src/features/operations/partners/components/PartnerReceiptTabComponent.tsx`] & [`PartnerCountTabComponent.tsx`] - Tích hợp tùy chọn chọn chữ ký đã lưu cho nhân sự đối tác khi nhận đồ sạch và giao đồ bẩn - Depends on: T9
- [x] T14: Kiểm tra typecheck và build Frontend `pnpm --prefix fe-react-thanhxuan-internal exec tsc --noEmit && pnpm --prefix fe-react-thanhxuan-internal run build` - Depends on: T8, T10, T11, T12, T13

### 3.3. Đồng Bộ Tài Liệu Kỹ Thuật & Hoàn Tất
- [x] T15: [`.agents/docs/DATABASE_DICTIONARY.md`] - Bổ sung thuộc tính `signatureUrl` vào định nghĩa bảng `accounts` (`StaffAccount`) tại mục 2.1 - Depends on: T5
- [x] T16: [`.agents/docs/CODEBASE_ATLAS.md`] - Bổ sung `SignatureInputComponent` vào chỉ mục cấu trúc component dùng chung - Depends on: T14
- [x] T17: [`.agents/docs/srs_sdd/srs_sdd_backend.md`] & [`.agents/docs/srs_sdd/srs_sdd_fe_internal.md`] & [`.agents/docs/SRS_SDD.md`] - Cập nhật đặc tả phân hệ và ghi 1 dòng Document History - Depends on: T15, T16
- [x] T18: [`.agents/docs/CHANGELOG.md`] - Ghi nhật ký bài luận chi tiết Plan 35 - Depends on: T17
- [x] T19: Tự động commit và push code lên nhánh `dev` với thông điệp: `feat(auth): thêm chức năng lưu và chọn chữ ký mẫu tài khoản nội bộ` - Depends on: T18

---

## 4. Verification & Testing

### 4.1. Lệnh Kiểm Thử Thực Tế
```powershell
# 1. Kiểm tra build Backend NestJS
pnpm --prefix be-nestjs-thanhxuan run build

# 2. Kiểm tra typecheck Frontend Internal
pnpm --prefix fe-react-thanhxuan-internal exec tsc --noEmit

# 3. Kiểm tra build Frontend Internal
pnpm --prefix fe-react-thanhxuan-internal run build
```

### 4.2. Kịch Bản Kiểm Thử (Test Cases)
1. **Happy Path 1: Lưu chữ ký mẫu trong Profile cá nhân**
   - Đăng nhập tài khoản nội bộ (Admin/Shipper/Thủ kho).
   - Mở modal Thông Tin Cá Nhân (`ProfileEditModal`).
   - Vẽ chữ ký mẫu lên khung canvas và bấm "Lưu chữ ký".
   - Refresh trang hoặc kiểm tra lại thông tin, chữ ký mẫu hiển thị sắc nét trong khung xem trước.
2. **Happy Path 2: Dùng chữ ký đã lưu khi soạn đồ sạch (`PrepOrderModal`)**
   - Mở màn hình Thủ kho, tạo phiếu xuất xưởng mới.
   - Nhận thấy chữ ký mẫu của Thủ kho đã được tự động chọn sẵn (hoặc có nút "Dùng chữ ký đã lưu").
   - Xác nhận lưu phiếu, phiếu xuất xưởng hiển thị chữ ký đầy đủ trên Slip Image và chi tiết phiếu.
3. **Happy Path 3: Ký nhận bàn giao (`SignatureModal`) và tick chọn lưu mặc định**
   - Khi ký nhận bàn giao, nếu chưa có chữ ký mẫu: vẽ chữ ký tay và tick chọn checkbox "Lưu làm chữ ký mặc định của tôi".
   - Bấm xác nhận ký. Kiểm tra profile thấy chữ ký vừa ký đã được tự động lưu vào tài khoản.
4. **Happy Path 4: Shipper kiểm đếm đồ bẩn (`ShipperCountPartnerModal`)**
   - Shipper mở modal kiểm đếm, chọn "Dùng chữ ký đã lưu".
   - Hệ thống điền chữ ký mẫu tức thì không cần vẽ lại tay.
5. **Edge Cases:**
   - Tài khoản chưa lưu chữ ký: Hệ thống hiển thị khung vẽ tay bình thường, không gây lỗi giao diện.
   - Chữ ký mẫu bị xóa: Tại Profile bấm "Xóa chữ ký mẫu", các modal ký quay về chế độ vẽ tay mặc định.
   - Thiết bị màn hình cảm ứng nhỏ (mobile): Chữ ký hiển thị responsive, nét vẽ rõ ràng, không bị tràn lề hay vỡ layout.

### 4.3. Definition of Done
1. Toàn bộ các task T1 đến T19 hoàn thành và verify pass 100%.
2. Build Backend và Frontend Internal thành công không lỗi biên dịch.
3. Tài liệu kiến trúc và từ điển dữ liệu được đồng bộ đầy đủ.
4. Tự động commit và push lên nhánh `dev`.

---

## 5. Risks & Rollback

- **Rủi ro:** Chuỗi Base64 Data URL của chữ ký quá dài có thể làm tăng nhẹ kích thước response profile.
  - *Giảm thiểu:* Canvas chữ ký đã được hàm `trimCanvas` cắt bỏ toàn bộ pixel trong suốt xung quanh, xuất dạng PNG nén kích thước tối ưu (< 20KB).
- **Rủi ro:** Xung đột chữ ký giữa người đăng nhập và người ký thay mặt (ví dụ: Tài xế đưa máy cho đại diện khách sạn ký).
  - *Giảm thiểu:* Component luôn cung cấp nút chuyển đổi rõ ràng giữa "Dùng chữ ký của tôi" và "Ký tay trực tiếp" (khách hàng vẽ tay trực tiếp), đảm bảo đúng người đại diện ký nhận thực tế.
- **Phương án Rollback:** Rollback commit trên nhánh `dev` bằng lệnh `git revert HEAD` nếu phát sinh sự cố không mong muốn.

---

## Changelog
- 2026-10-26: Khởi tạo Plan 35 - Chức năng chọn chữ ký đã lưu trong bảng tài khoản cho Web Internal.
