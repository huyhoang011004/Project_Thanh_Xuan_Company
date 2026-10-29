# Plan 45: Khắc Phục Triệt Để Các Phát Hiện Review 43 & Review 44 — Vá Bảo Mật NoSQL & AI, Tối Ưu 19 File Vượt Ngưỡng (< 300 Dòng), Xóa 4 `any` & 1 Alias, và Đồng Bộ 5 Trụ Cột Tài Liệu

> Status: Draft | Created: 2026-10-27 | Target: `be-nestjs-thanhxuan` (`src/modules/core`, `src/modules/internal`), `fe-react-thanhxuan-internal` (`src/`) & `.agents/docs/`

---

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Phạm vi (Scope)

Kế hoạch này giải quyết dứt điểm toàn bộ các phát hiện (findings) mức **MAJOR** và **MINOR** đã được xác định qua quá trình review độc lập tại [Review 43](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/reviews/review43.md) và [Review 44](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/reviews/review44.md):

1. **Khắc phục các thiếu sót bảo mật & nghiệp vụ từ Review 43:**
   - **Chống NoSQL Operator Injection trên Handover (`R1 - Major`):** Validate whitelist các key trong `dto.fields` tại `patchFields` ([handover-record.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts)); từ chối key bắt đầu bằng `$` hoặc chứa `__proto__` / `constructor`. Bọc `{ $set: update, $inc: { version: 1 } }` trong [handover-record.repository.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/repositories/handover-record.repository.ts).
   - **Bảo mật & Khử Race Condition cho `AiModule` (`R2 - Major`):** Loại bỏ mutable instance state `this.currentProvider` trong [ai.service.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/ai/ai.service.ts), chuyển sang xử lý stateless; bổ sung `@UseGuards(JwtAuthGuard, RolesGuard)` cho các endpoint trong [ai.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/ai/ai.controller.ts) và loại bỏ truyền `apiKey` qua query string.
   - **Bảo vệ danh sách IP Wi-Fi Xưởng (`R5 - Minor`):** Ẩn trường `wifiIps` trên `GET /attendance/workshop-config` đối với các vai trò nhân sự thông thường, chỉ hiển thị đầy đủ cho quản lý (`ADMIN`, `MANAGER`).
   - **Cô lập Offline Queue theo người dùng (`R6 - Minor`):** Bổ sung trường `userId?: string` vào `OfflineMutation` và cờ mutex `isSyncing` trong [offline-queue.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/lib/offline-queue.ts).

2. **Chuẩn hóa Clean Code & TypeScript Strict từ Review 44:**
   - **Loại bỏ triệt để 4 vị trí `any` (`R4 - Minor`):** Thay thế bằng kiểu tường minh trong [AuthContext.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx) và [StaffTableComponent.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/auth/components/StaffTableComponent.tsx).
   - **Xóa 1 re-export alias còn sót (`R3 - Minor`):** Xóa `WarehouseScheduleSettingsDialog` và types đi kèm trong [WarehouseScheduleSettingsModal.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/WarehouseScheduleSettingsModal.tsx).
   - **Tỉa gọn 19 file vượt ngưỡng 300 dòng (`R1 - Major`):** Phân rã 13 file Backend và 6 file Frontend xuống dưới ngưỡng `< 250-300 dòng/file` tuân thủ SRP và Feature-Based Colocation.

3. **Đồng bộ hóa toàn diện 5 Trụ Cột Tài Liệu (`R2, R3, R4 - Major`):**
   - Sửa lỗi nhân đôi bài luận Plan 44 trong [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).
   - Bổ sung bài luận đầy đủ của **Plan 43** vào `CHANGELOG.md` và 1 dòng Document History vào [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md).
   - Cập nhật [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md) cho các index mới và `select: false`.
   - Cập nhật [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md) và các file phân hệ `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`.

---

### 1.2. Bảng File Ảnh Hưởng (Affected Files)

| Path                                                                                                         | Action | Lý do                                                                                                 |
| :----------------------------------------------------------------------------------------------------------- | :----- | :---------------------------------------------------------------------------------------------------- |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts`                     | `edit` | Chặn NoSQL Injection trong `patchFields`, tách helper kiểm tra quyền để giảm từ 576 xuống < 280 dòng. |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/repositories/handover-record.repository.ts`              | `edit` | Bọc an toàn `{ $set: update, $inc: { version: 1 } }` trong `findWithOptimisticLock`.                  |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts`                      | `edit` | Rút gọn từ 396 dòng xuống < 260 dòng bằng cách tách helper response/filter.                           |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-clean-prep.service.ts`                 | `edit` | Rút gọn từ 346 dòng xuống < 250 dòng bằng cách tách helper tạo phiếu lặp.                             |
| `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-dirty-signature.service.ts`            | `edit` | Rút gọn từ 337 dòng xuống < 250 dòng bằng cách tách helper validate chữ ký.                           |
| `be-nestjs-thanhxuan/src/modules/core/ai/ai.service.ts`                                                      | `edit` | Loại bỏ mutable state `this.currentProvider` (stateless), truyền provider theo tham số request.       |
| `be-nestjs-thanhxuan/src/modules/core/ai/ai.controller.ts`                                                   | `edit` | Gắn `@UseGuards(JwtAuthGuard, RolesGuard)`, bỏ query param `apiKey`.                                  |
| `be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.controller.ts`                               | `edit` | Ẩn danh sách `wifiIps` trên `GET /attendance/workshop-config` với non-admin/manager.                  |
| `be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.service.ts`                                  | `edit` | Rút gọn từ 330 dòng xuống < 250 dòng bằng cách chuyển sub-logic sang helper.                          |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-auth.service.ts`                             | `edit` | Rút gọn từ 371 dòng xuống < 250 dòng bằng cách tách helper validate/login.                            |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-management.service.ts`                       | `edit` | Rút gọn từ 347 dòng xuống < 250 dòng bằng cách tách helper xử lý update/delete.                       |
| `be-nestjs-thanhxuan/src/modules/internal/piecework/services/job-segment.service.ts`                         | `edit` | Rút gọn từ 338 dòng xuống < 250 dòng bằng cách tách pure calculation logic.                           |
| `be-nestjs-thanhxuan/src/modules/core/upload/upload.service.ts`                                              | `edit` | Rút gọn từ 327 dòng xuống < 250 dòng bằng cách tách helper xử lý đường dẫn VPS.                       |
| `be-nestjs-thanhxuan/src/modules/internal/payroll/helpers/payroll-calculator.helper.ts`                      | `edit` | Rút gọn từ 324 dòng xuống < 240 dòng bằng cách tách sub-helper phụ cấp/khấu trừ.                      |
| `be-nestjs-thanhxuan/src/modules/internal/payroll/payroll.service.ts`                                        | `edit` | Rút gọn từ 322 dòng xuống < 250 dòng bằng cách tách helper quản lý kỳ lương.                          |
| `be-nestjs-thanhxuan/src/modules/internal/partners/partners.service.ts`                                      | `edit` | Rút gọn từ 317 dòng xuống < 250 dòng bằng cách tách catalog/branch helper.                            |
| `be-nestjs-thanhxuan/src/modules/internal/reports/reports.controller.ts`                                     | `edit` | Rút gọn từ 304 dòng xuống < 250 dòng.                                                                 |
| `fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx`                                              | `edit` | Xóa 3 vị trí `any` (`res: any`, `err: any`, `get<any>`).                                              |
| `fe-react-thanhxuan-internal/src/features/management/auth/components/StaffTableComponent.tsx`                | `edit` | Xóa 1 vị trí `(staff as any)._id`.                                                                    |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/modals/WarehouseScheduleSettingsModal.tsx`    | `edit` | Xóa dòng re-export alias `WarehouseScheduleSettingsDialog`.                                           |
| `fe-react-thanhxuan-internal/src/lib/offline-queue.ts`                                                       | `edit` | Thêm `userId` vào `OfflineMutation` và cờ mutex `isSyncing`.                                          |
| `fe-react-thanhxuan-internal/src/features/auth/modals/ProfileEditModal.tsx`                                  | `edit` | Rút gọn từ 328 dòng xuống < 250 dòng bằng cách tách sub-component form fields.                        |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/usePrepOrderForm.ts`                    | `edit` | Rút gọn từ 320 dòng xuống < 250 dòng bằng cách tách helper xử lý mặt hàng.                            |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/useShipperCountForm.ts`                 | `edit` | Rút gọn từ 317 dòng xuống < 250 dòng bằng cách tách state update helper.                              |
| `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/useShipperSlipPreview.ts`               | `edit` | Rút gọn từ 313 dòng xuống < 250 dòng bằng cách tách preview render helper.                            |
| `fe-react-thanhxuan-internal/src/features/management/partners/modals/CatalogModal.tsx`                       | `edit` | Rút gọn từ 306 dòng xuống < 250 dòng bằng cách tách form section.                                     |
| `fe-react-thanhxuan-internal/src/features/operations/reports/components/WarehouseReportSectionComponent.tsx` | `edit` | Rút gọn từ 304 dòng xuống < 240 dòng bằng cách tách bảng chi tiết.                                    |
| `.agents/docs/CHANGELOG.md`                                                                                  | `edit` | Xóa đoạn Plan 44 bị trùng lặp; bổ sung bài luận Plan 43; bổ sung bài luận Plan 45.                    |
| `.agents/docs/SRS_SDD.md`                                                                                    | `edit` | Bổ sung dòng Document History cho Plan 43 và Plan 45.                                                 |
| `.agents/docs/DATABASE_DICTIONARY.md`                                                                        | `edit` | Cập nhật index compound của `notifications`, `media_files` và `select: false` của `passwordHash`.     |
| `.agents/docs/CODEBASE_ATLAS.md`                                                                             | `edit` | Cập nhật các helper/sub-services mới sau đợt tái cấu trúc.                                            |
| `.agents/docs/srs_sdd/srs_sdd_backend.md`                                                                    | `edit` | Cập nhật kiến trúc phân tách Backend mới.                                                             |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`                                                                | `edit` | Cập nhật kiến trúc Custom Hooks và Colocation mới.                                                    |

---

## 2. Technical Approach

### 2.1. Bảo mật NoSQL Operator Injection & Data Integrity

```typescript
// Trong HandoverRecordService.patchFields:
const FORBIDDEN_KEY_PATTERNS = [
  /^\$/,
  /__proto__/,
  /constructor/,
  /prototype/i,
];
for (const key of Object.keys(dto.fields || {})) {
  if (FORBIDDEN_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
    throw new BadRequestException(`Trường cập nhật không hợp lệ: ${key}`);
  }
}
```

Tại `HandoverRecordRepository.findWithOptimisticLock`:

```typescript
return this.model
  .findOneAndUpdate(
    { _id: id, version: currentVersion },
    { $set: update, $inc: { version: 1 } },
    { returnDocument: "after" },
  )
  .exec();
```

### 2.2. Khử Mutable State trong `AiService` (Stateless Architecture)

- Chuyển `resolveProvider(providerName)` thành helper thuần túy.
- Các hàm như `generateContent`, `generateAndSaveArticle`, `getModels` nhận `providerName?: 'gemini' | 'openai' | 'openrouter'` trực tiếp từ tham số request thay vì lưu trữ vào `this.currentProvider`.

### 2.3. Chiến lược chia nhỏ 19 file vượt ngưỡng (< 250-300 dòng)

- Tách các hàm tính toán nghiệp vụ thuần túy (pure calculations) và xây dựng query thành các file `*.helper.ts` nằm ngay trong thư mục `helpers/` của từng module.
- Tách các sub-components hiển thị bảng hoặc form fields vào thư mục `components/` tương ứng.

---

## 3. Implementation Tasks (Checklist)

- [ ] **T1: Vá bảo mật NoSQL Injection, bọc an toàn Repository & Hardening `AiModule`** - Triển khai kiểm tra key `$` / prototype trong `patchFields`, bọc `{ $set: update }` trong `findWithOptimisticLock`, chuyển `AiService` sang stateless và bảo vệ `AiController` với Guards - Depends on: none
- [ ] **T2: Khắc phục quyền cấu hình xưởng & cô lập Offline Queue** - Ẩn `wifiIps` trên `GET /attendance/workshop-config` với non-admin, bổ sung `userId` & mutex `isSyncing` vào `offline-queue.ts` - Depends on: none
- [ ] **T3: Dọn sạch 4 vị trí `any` và 1 alias còn sót ở Frontend** - Thay thế `any` bằng kiểu strict trong `AuthContext.tsx` và `StaffTableComponent.tsx`, xóa alias `WarehouseScheduleSettingsDialog` - Depends on: none
- [ ] **T4: Tách nhỏ 13 file vượt ngưỡng 300 dòng ở Backend (`src/modules/internal` & `core`)** - Tách các helper cho `handover-record.service.ts`, `handover.controller.ts`, `account-auth.service.ts`, `account-management.service.ts`, `upload.service.ts`, `payroll.service.ts`... đảm bảo 100% file < 280 dòng - Depends on: T1, T2
- [ ] **T5: Tách nhỏ 6 file vượt ngưỡng 300 dòng ở Frontend (`fe-react-thanhxuan-internal/src`)** - Tách `ProfileEditModal.tsx`, `CatalogModal.tsx`, `WarehouseReportSectionComponent.tsx`, `usePrepOrderForm.ts`, `useShipperCountForm.ts`, `useShipperSlipPreview.ts` xuống < 250 dòng - Depends on: T3
- [ ] **T6: Kiểm thử Toàn Diện (Lint, Typecheck, Unit Test, Build & Quét Số Dòng File)** - Chạy script tự động xác nhận 0 file vượt quá 300 dòng, 0 `any` trong phạm vi; chạy `tsc --noEmit`, `pnpm test`, `pnpm build` cho cả 2 repo - Depends on: T4, T5
- [ ] **T7: Đồng bộ hóa toàn diện 5 Trụ Cột Tài Liệu & Tự động Commit/Push nhánh `dev`** - Sửa lỗi duplicate Plan 44 trong `CHANGELOG.md`, bổ sung Plan 43 và Plan 45 vào `CHANGELOG.md` & `SRS_SDD.md`, cập nhật `DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, commit và push lên nhánh `dev` - Depends on: T6

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm thử bắt buộc

1. Kiểm tra số dòng mã nguồn (PowerShell):
   - Quét toàn bộ file trong 3 thư mục, xác nhận 100% file code `.ts`/`.tsx` có số dòng `< 300`.
2. Kiểm tra `any`:
   - Xác nhận 0 kết quả khớp với `: any`, `as any`, `<any>` trong `fe-react-thanhxuan-internal/src`.
3. Kiểm thử Backend (`be-nestjs-thanhxuan/`):
   - `pnpm exec tsc --noEmit` (0 lỗi).
   - `pnpm test` (49 test suites, 226+ tests passed).
   - `pnpm build` (NestJS production build thành công).
4. Kiểm thử Frontend (`fe-react-thanhxuan-internal/`):
   - `pnpm exec tsc --noEmit` (0 lỗi).
   - `pnpm build` (`tsc -b && vite build` tạo bundle dist/ và sw.js thành công).

### 4.2. Definition of Done

- Toàn bộ các phát hiện từ Review 43 và Review 44 được xử lý 100%.
- Không còn bất kỳ file nào vượt quá 300 dòng trong phạm vi mục tiêu.
- Đạt 100% TypeScript Strict Mode (Zero `any`) ở Frontend; không còn alias tạm thời.
- Đồng bộ chuẩn xác toàn bộ 5 trụ cột tài liệu.
- Tự động commit và push lên nhánh `dev`.

---

## Changelog

- 2026-10-27: Khởi tạo Plan 45 giải quyết triệt để các phát hiện trong Review 43 và Review 44.
