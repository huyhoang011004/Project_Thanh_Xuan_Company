# Plan 47: Chuẩn Hóa Clean Code, Phân Rã 14 Tệp Vượt Ngưỡng (< 300 Dòng), Xóa Triệt Để Kiểu `any` & Dọn 293 Cảnh Báo ESLint Phân Hệ Laundry

> Status: Done | Created: 2026-10-28 | Target: `fe-nextjs-thanhxuan-laundry` (`src/`), `be-nestjs-thanhxuan` (`src/modules/laundry`) & `.agents/docs/`

---

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Phạm vi (Scope)
Kế hoạch này giải quyết triệt để các vấn đề kiến trúc, vi phạm quy tắc monorepo và nợ kỹ thuật (technical debt) trong phân hệ Laundry:
1. **Phân rã 14 tệp tin vượt ngưỡng 300 dòng:** Đưa 100% tệp tin về dưới `< 250-300 dòng/file`, tuân thủ Single Responsibility Principle (SRP) và Feature-Based Colocation của `AGENTS.md`.
2. **Loại bỏ triệt để kiểu `any` & DTO hoá:**
   - Xây dựng các Class DTO chuẩn với decorator của `class-validator` cho `email-marketing`, `zalo-marketing`, `users`, `auth`.
   - Giải quyết toàn bộ 293 lỗi và cảnh báo ESLint (`@typescript-eslint/no-unsafe-*`) trong `be-nestjs-thanhxuan/src/modules/laundry`.
3. **Dọn dẹp Dead Code & Chuẩn hóa Frontend:**
   - Xóa bỏ đoạn mã rác `localStorage.getItem("access_token")` trong [`api.service.ts`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-nextjs-thanhxuan-laundry/src/services/api.service.ts).
   - Chuẩn hóa TypeScript types và Zod schemas cho các components settings và bài viết.
4. **Đồng bộ hóa 5 Trụ Cột Tài Liệu:** Cập nhật `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_nextjs.md`, `SRS_SDD.md` và `CHANGELOG.md`.

### 1.2. Danh sách 14 tệp vượt ngưỡng cần phân rã

| STT | Tệp tin ban đầu | Số dòng cũ | Tệp tin sau khi module hóa (< 300 dòng) | Số dòng mới |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `rich-text-editor.tsx` | **728** | `RichTextEditorComponent.tsx` + 5 modules con | **< 198** |
| 2 | `ServiceDetailPage.tsx` | **521** | `ServiceDetailPage.tsx` (re-export) + 5 components con | **< 130** |
| 3 | `useAdminSettings.ts` | **505** | `useAdminSettings.ts` (122) + 3 hook con | **< 249** |
| 4 | `SettingEditorAboutComponent.tsx` | **492** | `SettingEditorAboutComponent.tsx` (92) + 3 section con | **< 215** |
| 5 | `SettingEditorServiceComponent.tsx` | **492** | `SettingEditorServiceComponent.tsx` (92) + 3 section con | **< 215** |
| 6 | `SettingEditorFooterComponent.tsx` | **487** | `SettingEditorFooterComponent.tsx` (75) + 3 section con | **< 215** |
| 7 | `SettingEditorHomeComponent.tsx` | **483** | `SettingEditorHomeComponent.tsx` (76) + 3 section con | **< 266** |
| 8 | `AdminHeaderComponent.tsx` | **381** | `AdminHeaderComponent.tsx` (82) + 2 components con | **< 254** |
| 9 | `dich-vu/[...slug]/page.tsx` | **368** | `page.tsx` (172) + 2 view components | **< 180** |
| 10 | `ZaloMarketingPage.tsx` | **360** | `ZaloMarketingPage.tsx` (190) + 2 modals con | **< 120** |
| 11 | `gioi-thieu/[...slug]/page.tsx` | **358** | `page.tsx` (172) + 2 view components | **< 180** |
| 12 | `useAdminContacts.ts` | **352** | `useAdminContacts.ts` (220) + `contacts-export.util.ts` (140) | **< 220** |
| 13 | `articles.service.ts` | **329** | `articles.service.ts` (285) + `articles-sanitize.helper.ts` (70) | **< 285** |
| 14 | `tin-tuc/[...slug]/page.tsx` | **305** | `page.tsx` (150) + 2 view components | **< 145** |

---

## 2. Technical Approach

### 2.1. Phân rã `rich-text-editor.tsx` (728 dòng $\rightarrow$ Modular Sub-components)
- Thư mục mới: `fe-nextjs-thanhxuan-laundry/src/components/ui/rich-text-editor/`
  - `RichTextEditorComponent.tsx` (~101 dòng)
  - `RichTextToolbarComponent.tsx` (~144 dòng)
  - `components/RichTextFormattingButtons.tsx` (~198 dòng)
  - `components/RichTextAlignHeadingsButtons.tsx` (~153 dòng)
  - `extensions/rich-text-extensions.ts` (~98 dòng)
  - `modals/MediaInsertModal.tsx` (~140 dòng)

### 2.2. DTO & Type-Safety Backend Laundry
- Thêm các DTO đầy đủ validation:
  - `be-nestjs-thanhxuan/src/modules/laundry/email-marketing/dto/create-campaign.dto.ts`
  - `be-nestjs-thanhxuan/src/modules/laundry/email-marketing/dto/create-sequence.dto.ts`
  - `be-nestjs-thanhxuan/src/modules/laundry/zalo-marketing/dto/create-zalo-campaign.dto.ts`
  - `be-nestjs-thanhxuan/src/modules/laundry/zalo-marketing/dto/create-zalo-sequence.dto.ts`
  - `be-nestjs-thanhxuan/src/modules/laundry/users/dto/create-user.dto.ts`
  - `be-nestjs-thanhxuan/src/modules/laundry/users/dto/update-user.dto.ts`
  - `be-nestjs-thanhxuan/src/modules/laundry/users/dto/update-profile.dto.ts`
  - `be-nestjs-thanhxuan/src/modules/laundry/auth/dto/refresh-token.dto.ts`
- Thêm Repository chuẩn cho `email-marketing` và `zalo-marketing` kế thừa `BaseRepository`.

---

## 3. Implementation Tasks (Checklist)

- [x] T1: [Backend Articles Service] - Tách helper `articles-sanitize.helper.ts` khỏi `articles.service.ts` đưa kích thước file từ 329 dòng về < 240 dòng.
- [x] T2: [Backend DTO Creation] - Tạo đầy đủ Class DTO cho `EmailMarketing`, `ZaloMarketing`, `Users`, và `Auth` với decorator `class-validator`.
- [x] T3: [Backend ESLint & Type-Safety] - Thay thế `any` trong các controller và service Laundry, chạy `eslint "src/modules/laundry/**/*.ts"` kiểm tra không còn lỗi.
- [x] T4: [Frontend Rich Text Editor] - Phân rã `rich-text-editor.tsx` thành sub-components và custom extension dưới 200 dòng/file.
- [x] T5: [Frontend Admin Settings Hooks & Components] - Phân rã `useAdminSettings.ts` (505 dòng) và 4 file `SettingEditor*Component.tsx` (480-492 dòng) thành các hook/form section nhỏ < 250 dòng.
- [x] T6: [Frontend Admin Header & Contacts] - Phân rã `AdminHeaderComponent.tsx` (381 dòng), `ZaloMarketingPage.tsx` (360 dòng), và `useAdminContacts.ts` (352 dòng).
- [x] T7: [Frontend Public Pages] - Phân rã `ServiceDetailPage.tsx` (521 dòng), `dich-vu/[...slug]/page.tsx` (368 dòng), `gioi-thieu/[...slug]/page.tsx` (358 dòng), và `tin-tuc/[...slug]/page.tsx` (305 dòng).
- [x] T8: [Frontend Clean Code & Dead Code Removal] - Xóa `localStorage.getItem("access_token")` trong `api.service.ts`, xóa bỏ các file bridge/re-export tạm thời.
- [x] T9: [Verification & DoD Check] - Chạy script kiểm tra không còn file nào vượt 300 dòng trong cả 2 app; verify `lint`, `typecheck`, `test`, `build` pass 100%.
- [x] T10: [Documentation & Git Push] - Cập nhật `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_nextjs.md`, `SRS_SDD.md`, `CHANGELOG.md`; commit và push lên nhánh `dev`.

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm chứng
- **Kiểm tra độ dài file:**
  ```powershell
  # Kiểm tra không còn file nào > 300 dòng trong src/modules/laundry và fe-nextjs-thanhxuan-laundry/src
  ```
- **Backend Laundry:**
  - `pnpm exec eslint "src/modules/laundry/**/*.ts"` (Không còn lỗi `@typescript-eslint/no-unsafe-*`)
  - `pnpm exec tsc --noEmit`
  - `pnpm test modules/laundry`
  - `pnpm build`
- **Frontend Laundry:**
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`

### 4.2. Definition of Done
1. 100% tệp tin mã nguồn trong `fe-nextjs-thanhxuan-laundry/src` và `be-nestjs-thanhxuan/src/modules/laundry` có độ dài **dưới 300 dòng**.
2. Không còn kiểu `any` lỏng lẻo trong request/response DTO của Backend Laundry; 293 vấn đề ESLint được xử lý triệt để.
3. Không để lại bất kỳ file re-export alias tạm thời nào (`*View`, `*Dialog`, file bắc cầu).
4. `tsc --noEmit`, test Jest, và `pnpm build` pass 100% trên cả 2 ứng dụng.
5. Cập nhật đồng bộ 5 trụ cột tài liệu và commit, push lên nhánh `dev`.

---

## 5. Risks & Rollback

- **Rủi ro:** Khi chia tách các section của `useAdminSettings` và các setting editors, các trường nested form state có thể bị lệch key nếu không map cẩn thận.
- **Giảm thiểu:** Sử dụng TypeScript interface đầy đủ từ `Setting` Schema để bảo đảm compile-time type checking cho toàn bộ form values. Chạy test build Next.js trước khi hoàn tất.

## Changelog
- 2026-10-28: Khởi tạo Plan 47.
