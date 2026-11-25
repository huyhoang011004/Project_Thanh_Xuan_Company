# Review 69: Giai Đoạn 1 - Hoàn Thiện Nghiệp Vụ Giao Nhận Khăn, Kiểm Nhận Đồ Sạch & Thao Tác Vận Hành

> Plan: .agents/docs/plans/plan69.md | Reviewed: 2026-11-25 | Base: `12cabd4` (BE), `8cbe86b` (FE), `b9f813d` (Docs) | Verdict: Request changes

## 1. Tóm tắt

Plan 69 đã triển khai thành công phần lớn nghiệp vụ cốt lõi: lưu `note` từng món đồ bẩn qua `onBlur`, bắn notification `HANDOVER_RECOUNT_UPDATED` tới kênh `partner_${partnerId}`, sửa lỗi gán cứng `received = expected` ở phía client/backend khi kiểm nhận đồ sạch, thêm nút "Đếm lại" cho Shipper và thêm `internalInventoryNote` (chỉ lưu nội bộ, không in lên canvas phiếu giao khách). Tuy nhiên, vẫn còn 3 vấn đề mức Major cần xử lý: `NotificationBell.tsx` chưa xử lý điều hướng khi bấm vào thông báo, thiếu unit test mới cho các service đã sửa (T12), và `PartnerReceiptItemsTableComponent.tsx` vượt ngưỡng 300 dòng đồng thời chưa đổi sang dạng bảng 3 cột nhập trực tiếp như mô tả T7.

## 2. Đối chiếu với Plan

| Task | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| T1 (Schema `internalInventoryNote`) | Đạt | Đã thêm `internalInventoryNote` vào `handover-record.schema.ts` và `clean-clothes.dto.ts`. |
| T2 (`dirty-item-onblur` nhận `note`) | Đạt | `handover-dirty-operations.controller.ts` và `handover-dirty-signature.service.ts` xử lý đầy đủ `note`. |
| T3 (Thông báo đối tác khi đếm lại) | Thiếu | Backend đã gửi `HANDOVER_RECOUNT_UPDATED` trong `completeRecount` và `updateRecountActual`; tuy nhiên `NotificationBell.tsx` (nằm trong Affected Files) chưa được cập nhật để điều hướng khi bấm vào thông báo. |
| T4 (`internalInventoryNote` khi soạn đồ) | Đạt | `handover-clean-prep.helper.ts` đã lưu `internalInventoryNote` (trim). |
| T5-T6 (Ghi chú đồ bẩn FE) | Đạt | `PartnerCountItemsViewComponent.tsx` và `usePartnerCountTab.ts` hỗ trợ nhập và lưu `note` onBlur. |
| T7 (Bảng kiểm nhận 3 cột) | Thiếu | `PartnerReceiptItemsTableComponent.tsx` dài 323 dòng (> 280 dòng mục tiêu) và giữ giao diện 3 nút chọn + stepper thay vì bảng 3 cột nhập trực tiếp số thực nhận. |
| T8 (Sửa gán cứng `received = expected`) | Đạt | `usePartnerReceiptFlow.ts` tính `received` theo `expected` & ghi chú thiếu/dư; `handover-flow.service.ts:258-275` lưu `actualReceivedQuantity` và `varianceQuantity`. |
| T9 (Nút "Đếm lại" Shipper) | Đạt | Đã bổ sung trên `ShipperHandoverSlipPreviewComponent.tsx` và `ShipperHandoverItemCardComponent.tsx`. |
| T10-T11 (`internalInventoryNote` FE & Canvas) | Đạt | `PrepOrderModal.tsx` lưu `internalInventoryNote`; `HandoverExportHelper` / `handoverCanvasTableDrawer` in `item.note` và không in `internalInventoryNote`. |
| T12 (Unit test `handover-recount` & `clean-prep`) | Thiếu | Commit `12cabd4` không thêm/cập nhật file `handover-recount.service.spec.ts` hay `handover-clean-prep.service.spec.ts`. |
| T13-T14 (Verify & Docs) | Đạt | Build/Test hiện có pass; tài liệu đã đồng bộ. |

- **File ngoài phạm vi plan:** Commit `12cabd4` mở rộng `NotificationsController` và `NotificationsService` để hỗ trợ kênh `partner_${partnerId}`, và mở rộng alias route `@Post([':id/receipt', ':id/confirm-receipt'])` trong `handover.controller.ts` — các thay đổi này hợp lý để phục vụ T3 và T8.
- **Deviations:** Plan ghi tên thư mục `backend-thanhxuan` / `thanhxuan-internal` thay vì tên symlink trong monorepo (`be-nestjs-thanhxuan` / `fe-react-thanhxuan-internal`).

## 3. Phát hiện

| ID | Mức độ | Vị trí (path:line) | Vấn đề | Hướng xử lý |
| :--- | :---: | :--- | :--- | :--- |
| R1 | Major | `fe-react-thanhxuan-internal/src/components/notifications/NotificationBell.tsx:50-54` | Hàm `handleNotificationClick` chỉ gọi `markReadMutation.mutate(item._id)` mà chưa xử lý điều hướng khi người dùng bấm vào thông báo `HANDOVER_RECOUNT_UPDATED` (nằm trong Affected Files của Plan 69). | Kiểm tra `item.type === 'HANDOVER_RECOUNT_UPDATED'` (hoặc `item.refEntity === 'HandoverRecord'`) để đóng dropdown và điều hướng tới cổng đối tác (`/operations/partner/handovers` hoặc tab tương ứng). |
| R2 | Major | `be-nestjs-thanhxuan` (commit `12cabd4`) | Thiếu unit test mới cho `handover-recount.service.spec.ts` (verify gửi notification `HANDOVER_RECOUNT_UPDATED`) và `handover-clean-prep.service.spec.ts` (verify lưu `internalInventoryNote`) như yêu cầu ở T12. | Bổ sung test case cho trigger notification khi đếm lại và test case lưu `internalInventoryNote` khi soạn đồ sạch. |
| R3 | Major | `fe-react-thanhxuan-internal/src/features/operations/handovers/components/PartnerReceiptItemsTableComponent.tsx:1-323` | File dài 323 dòng (vượt ngưỡng 280 dòng của T7 và chuẩn < 250–300 dòng), đồng thời giữ UI card 3 nút + stepper thay vì bảng 3 cột `Giao theo sổ | Thực nhận | Lệch thiếu/dư` cho phép nhập trực tiếp số thực nhận như mô tả T7. | Tách `PartnerReceiptItemRow` ra file component riêng để giảm kích thước dưới 250 dòng; xác nhận lại với nghiệp vụ xem có cần ô nhập trực tiếp `Thực nhận` hay giữ UI stepper hiện tại. |
| R4 | Minor | `fe-react-thanhxuan-internal/src/features/operations/handovers/components/PartnerCountItemsViewComponent.tsx:95` | Typo class Tailwind `dark:white` thay vì `dark:text-white` trên Card view. | Sửa `dark:white` thành `dark:text-white`. |
| R5 | Minor | `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-recount.service.ts:194` & `handover-dirty-signature.service.ts:317` | `.catch(() => {})` nuốt lỗi hoàn toàn khi `notificationsService.send` thất bại. | Ghi log cảnh báo qua `Logger.warn` trong `.catch(...)` để không mất dấu vết khi lỗi gửi thông báo. |

## 4. Kết quả Verification

| Lệnh | Kết quả | Khớp với báo cáo của Executor? |
| :--- | :--- | :--- |
| `be-nestjs-thanhxuan`: `pnpm exec tsc --noEmit` | Pass (exit 0) | Khớp |
| `be-nestjs-thanhxuan`: `pnpm lint` | Fail (exit 1 — 645 errors, 74 warnings toàn repo, phần lớn là `@typescript-eslint/no-unsafe-*` cũ) | Executor không báo cáo chạy `pnpm lint` |
| `be-nestjs-thanhxuan`: `pnpm test -- handover` | Pass (4/4 suites, 49/49 tests) | Khớp (nhưng chưa có test mới cho T12) |
| `be-nestjs-thanhxuan`: `pnpm build` | Pass (exit 0) | Khớp |
| `fe-react-thanhxuan-internal`: `pnpm exec tsc -b && pnpm build` | Pass (`tsc -b` + `vite build` thành công) | Khớp |
| `fe-react-thanhxuan-internal`: `pnpm lint` | Không có script `lint` trong `package.json` | N/A |

## 5. Kiểm tra tài liệu (5 Trụ cột)

- `srs_sdd_backend.md`: Đã cập nhật API & luồng notification/internalInventoryNote.
- `srs_sdd_fe_internal.md`: Đã cập nhật đặc tả nghiệp vụ Plan 69.
- `DATABASE_DICTIONARY.md`: Đã cập nhật trường mới trong `handover_records`.
- `CODEBASE_ATLAS.md`: Không cần đổi lớn (route/endpoint chính giữ nguyên, bổ sung alias).
- `SRS_SDD.md` & `CHANGELOG.md`: Đã cập nhật (lưu ý `SRS_SDD.md` bị lặp 3 dòng Document History cho Plan 69–71 ở dòng 185–187 và 208–210).

## 6. Open Questions

- Giao diện `PartnerReceiptItemsTableComponent.tsx` hiện dùng 3 nút trạng thái + stepper tăng/giảm (khác với mô tả bảng 3 cột nhập trực tiếp `Thực nhận` ở T7) — đây là chủ ý giữ UX mobile-first hay cần sửa lại theo đúng mô tả T7?

## 7. Verdict & bước tiếp theo

- **Verdict:** **Request changes** (3 Major, 2 Minor).
- **Bước tiếp theo:** Chạy `/act` để xử lý `R1` (điều hướng trong `NotificationBell.tsx`), `R2` (bổ sung unit test T12), `R3` (tách `PartnerReceiptItemRow` < 250 dòng và chốt UX cột Thực nhận), và dọn các lỗi Minor `R4`, `R5`.
