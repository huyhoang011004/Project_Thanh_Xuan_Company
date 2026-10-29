# Review 44: Chuẩn Hóa Clean Code (Giai Đoạn P2) — Chia Nhỏ File Vượt Ngưỡng, Tách Custom Hooks & Loại Bỏ Kiểu `any`

> Plan: [.agents/docs/plans/plan44.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/plans/plan44.md) | Reviewed: 2026-10-27 | Base: `b4d60d9` -> `f3261bd` | Verdict: **Request changes**

---

## 1. Tóm tắt

Plan 44 là đợt tái cấu trúc quy mô lớn thuộc Giai đoạn P2 nhằm đưa toàn bộ mã nguồn của 3 phân hệ `be-nestjs-thanhxuan/src/modules/core`, `be-nestjs-thanhxuan/src/modules/internal` và `fe-react-thanhxuan-internal/src` tiệm cận chuẩn Clean Architecture & Anti-Slop theo `AGENTS.md`.

Nhìn chung:
- **Đạt được:** Khối lượng công việc thực hiện rất ấn tượng. Đã phân rã thành công nhiều "god-service" và "god-component" khổng lồ: `handover-record.service.ts` (từ 1268 dòng xuống 576 dòng), `HandoverExportHelper.ts` (từ 1022 dòng xuống 216 dòng, tách thư mục `export/`), `payroll.service.ts` (từ 745 dòng xuống 322 dòng), `PartnerReceiptTabComponent.tsx` (từ 661 dòng xuống 240 dòng), `ShipperHandoverItemCardComponent.tsx` (từ 655 dòng xuống 240 dòng). Đã tách trọn vẹn các Custom Hooks chuyên biệt (`useShipperFuel`, `useStaffManagement`, `usePrepOrderForm`, `useShipperCountForm`, `useShipperSlipPreview` có debounce 300ms...). Đã chuẩn hóa interface `AuthenticatedStaffUser` thay thế toàn bộ `user: any` / `req: any` trên các Controller Backend. Xóa bỏ thành công 16/17 re-export aliases và loại bỏ 37/41 vị trí `any` ở Frontend.
- **Hạn chế tồn đọng:** 
  1. Vẫn còn **19 file vượt ngưỡng 300 dòng** (13 file ở Backend, 6 file ở Frontend), trong khi CHANGELOG báo cáo "0 file vượt quá 300 dòng".
  2. Còn sót **4 vị trí kiểu `any`** tại Frontend (`AuthContext.tsx` và `StaffTableComponent.tsx`).
  3. Còn sót **1 re-export alias** (`WarehouseScheduleSettingsDialog`).
  4. File `CHANGELOG.md` bị **nhân đôi 2 lần** nội dung bài luận Plan 44 (tại dòng 7 và dòng 127).

---

## 2. Đối chiếu với Plan

| Task | Hạng mục cam kết | Trạng thái | Ghi chú đối chiếu |
| :--- | :--- | :---: | :--- |
| **T1** | Chuẩn hóa TypeScript Strict (Zero `any`) & Dọn dẹp Backend `core` + `internal/common` | **Đạt** | Tạo `AuthenticatedStaffUser`, thay thế 100% `user: any` / `req: any` trên toàn bộ Controller của Backend. |
| **T2** | Chia nhỏ các Service lớn trong `internal/handovers` | **Thiếu** | Đã tách `handover-clean-prep.service.ts`, `handover-dirty-signature.service.ts`, `handover-slip-media.service.ts`, `handover-transition-rules.ts`. Tuy nhiên `handover-record.service.ts` vẫn còn 576 dòng và `handover.controller.ts` còn 396 dòng (vượt ngưỡng 300). |
| **T3** | Chia nhỏ các Service lớn trong `auth`, `payroll`, `attendance`, `piecework`, `reports` | **Thiếu** | Đã tách các helper tính lương, OTP, cấu hình xưởng, job segment. Tuy nhiên một số file vẫn còn > 300 dòng (`account-auth.service.ts`: 371 dòng, `account-management.service.ts`: 347 dòng, `job-segment.service.ts`: 338 dòng, `attendance.service.ts`: 330 dòng, `payroll.service.ts`: 322 dòng). |
| **T4** | Chia nhỏ `HandoverExportHelper.ts` & Pages/Components phân hệ Giao nhận | **Đạt** | `HandoverExportHelper.ts` rút từ 1022 xuống 216 dòng (tách thư mục `export/`), tách các Custom Hooks (`usePartnerReceiptTab`, `useShipperSlipPreview`, `usePrepOrderForm`...), các components giao nhận đều < 260 dòng. |
| **T5** | Chia nhỏ Pages/Modals còn lại ở Frontend & Xóa 17 Re-export Aliases | **Thiếu** | Đã tách `useShipperFuel`, `useStaffManagement`, chia nhỏ các section báo cáo. Tuy nhiên còn sót 1 alias `WarehouseScheduleSettingsDialog` và 4 vị trí `any`. Một số file Frontend vẫn > 300 dòng (`ProfileEditModal.tsx`: 328 dòng, `usePrepOrderForm.ts`: 320 dòng, `useShipperCountForm.ts`: 317 dòng, `useShipperSlipPreview.ts`: 313 dòng, `CatalogModal.tsx`: 306 dòng, `WarehouseReportSectionComponent.tsx`: 304 dòng). |
| **T6** | Kiểm thử Toàn Diện (Lint, Typecheck, Unit Test, Build) | **Đạt** | Backend: 49/49 suites (226 tests) PASS, `tsc --noEmit` PASS, `nest build` PASS. Frontend: `tsc --noEmit` PASS, `pnpm build` PASS. |
| **T7** | Đồng bộ 5 Trụ cột Tài liệu & Tự động Commit/Push nhánh `dev` | **Thiếu** | Đã cập nhật `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `CODEBASE_ATLAS.md` và `SRS_SDD.md`. Tuy nhiên `CHANGELOG.md` bị duplicate nội dung Plan 44 hai lần, và chưa cập nhật `DATABASE_DICTIONARY.md`. |

---

## 3. Danh Sách Phát Hiện (Findings)

| ID | Mức độ | Vị trí (path:line) | Vấn đề | Hướng xử lý đề xuất |
| :--- | :---: | :--- | :--- | :--- |
| **R1** | **Major** | Codebase (19 files) | Vẫn còn **19 file vượt ngưỡng 300 dòng** (trong khi CHANGELOG ghi "0 file vượt quá 300 dòng"). Cụ thể:<br>- Backend: `handover-record.service.ts` (576 dòng), `handover.controller.ts` (396 dòng), `account-auth.service.ts` (371 dòng), `account-management.service.ts` (347 dòng), `handover-clean-prep.service.ts` (346 dòng), `job-segment.service.ts` (338 dòng), `handover-dirty-signature.service.ts` (337 dòng), `attendance.service.ts` (330 dòng), `upload.service.ts` (327 dòng), `payroll-calculator.helper.ts` (324 dòng), `payroll.service.ts` (322 dòng), `partners.service.ts` (317 dòng), `reports.controller.ts` (304 dòng).<br>- Frontend: `ProfileEditModal.tsx` (328 dòng), `usePrepOrderForm.ts` (320 dòng), `useShipperCountForm.ts` (317 dòng), `useShipperSlipPreview.ts` (313 dòng), `CatalogModal.tsx` (306 dòng), `WarehouseReportSectionComponent.tsx` (304 dòng). | Tiếp tục phân tách các hàm tính toán, helper truy vấn hoặc sub-components/modals để đưa tất cả các file này về < 250-300 dòng; cập nhật lại báo cáo thực tế trong `CHANGELOG.md`. |
| **R2** | **Major** | [`.agents/docs/CHANGELOG.md:7 & :127`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md#L7) | File `CHANGELOG.md` bị ghi lặp (duplicate) toàn bộ bài luận Plan 44 hai lần (lần 1 ở dòng 7-65, lần 2 ở dòng 127-142). | Xóa bỏ đoạn bị trùng lặp ở dòng 127-142 trong `CHANGELOG.md`. |
| **R3** | **Minor** | [`fe-react-thanhxuan-internal/src/features/operations/handovers/modals/WarehouseScheduleSettingsModal.tsx:250`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/handovers/modals/WarehouseScheduleSettingsModal.tsx#L250) | Còn sót 1 dòng re-export alias tạm thời: `export const WarehouseScheduleSettingsDialog = WarehouseScheduleSettingsModal;` (và props tương ứng) chưa được xóa bỏ hoàn toàn. | Xóa bỏ dòng export alias thừa này (không có nơi nào trong dự án sử dụng alias này). |
| **R4** | **Minor** | [`fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx:79, 103, 131`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx#L79) & [`StaffTableComponent.tsx:32`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/auth/components/StaffTableComponent.tsx#L32) | Còn sót 4 vị trí sử dụng kiểu `any` ở Frontend:<br>- `AuthContext.tsx:79`: `apiClient.get<any>('/auth/me')`<br>- `AuthContext.tsx:103`: `catch (err: any)`<br>- `AuthContext.tsx:131`: `apiClient.post<any>('/auth/login', ...)`<br>- `StaffTableComponent.tsx:32`: `(staff as any)._id` | Thay thế bằng `unknown`, `StaffUser` hoặc `StaffAccountResponse` để đạt chuẩn 100% Zero `any`. |

---

## 4. Kết Quả Verification

| Lệnh kiểm chứng | Kết quả | Khớp với báo cáo của Executor? |
| :--- | :---: | :---: |
| `be-nestjs-thanhxuan: pnpm exec tsc --noEmit` | **PASS (Exit code 0, 0 errors)** | Khớp 100% |
| `be-nestjs-thanhxuan: pnpm test` | **PASS (49 test suites, 226 passed, 0 failed)** | Khớp 100% |
| `be-nestjs-thanhxuan: pnpm build` | **PASS (NestJS bundle tạo thành công)** | Khớp 100% |
| `fe-react-thanhxuan-internal: pnpm exec tsc --noEmit` | **PASS (Exit code 0, 0 errors)** | Khớp 100% |
| `fe-react-thanhxuan-internal: pnpm build` | **PASS (Vite build + PWA service worker thành công)** | Khớp 100% |

---

## 5. Kiểm Tra Tài Liệu (5 Trụ Cột)

- [x] **`srs_sdd_backend.md`**: Đã cập nhật cấu trúc phân tách service và helpers mới.
- [x] **`srs_sdd_fe_internal.md`**: Đã cập nhật cấu trúc Custom Hooks và thư mục `export/`.
- [x] **`CODEBASE_ATLAS.md`**: Đã cập nhật danh sách các sub-services, custom hooks và sub-components mới.
- [x] **`SRS_SDD.md`**: Đã ghi nhận dòng Document History cho Plan 44.
- [ ] **`CHANGELOG.md`**: **Cần chỉnh sửa** (bị duplicate nội dung Plan 44 hai lần, và số liệu "0 file vượt quá 300 dòng" bị lệch với thực tế 19 file còn vượt).

---

## 6. Open Questions & Khuyến nghị

1. **Khắc phục 19 file vượt ngưỡng 300 dòng**: Cần lên kế hoạch tỉa gọn tiếp cho 19 file này hoặc điều chỉnh tiêu chí / tài liệu phản ánh chính xác số dòng thực tế.
2. **Dọn sạch 4 `any` và 1 alias**: Chỉ cần 1 lượt chỉnh sửa nhỏ để đưa Frontend đạt chuẩn 100% Zero `any` và sạch 100% aliases.
3. **Sửa lỗi trùng lặp `CHANGELOG.md`**: Xóa block Plan 44 bị lặp lại ở dòng 127.

