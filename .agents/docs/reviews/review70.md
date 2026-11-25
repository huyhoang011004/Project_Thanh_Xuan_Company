# Review 70: Giai Đoạn 2 - Xuất Báo Cáo Bảng Kê Nhận Khăn Form Chuẩn Ma Trận Ngày (Chu Kỳ 26 Đến 25)

> Plan: .agents/docs/plans/plan70.md | Reviewed: 2026-11-25 | Base: `283558f` (BE), `817e710` (FE), `ea3a35d` (Docs) | Verdict: Request changes

## 1. Tóm tắt

Plan 70 đã xây dựng hoàn chỉnh logic gom nhóm dữ liệu theo ngày chu kỳ 26–25, ánh xạ 9 danh mục khăn chuẩn + bảng phụ Hạng mục bổ sung bằng `exceljs` với công thức `=SUM(...)`, và tích hợp nút tải Excel tại Cổng Đối Tác lẫn màn hình Báo cáo Kế toán. Tuy nhiên, có 1 lỗ hổng bảo mật mức **Blocker** tại endpoint `GET /reports/partner/:partnerId/towel-matrix-export` do thiếu decorator `@Permissions(...)`, kèm 2 vấn đề **Major** về validate `ObjectId` và độ dài file helper (417 dòng).

## 2. Đối chiếu với Plan

| Task | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| T1 (Khảo sát & mapping 9 danh mục) | Đạt | `STANDARD_TOWEL_CATEGORIES` và `mapItemToStandardCategory` trong `daily-towel-matrix.helper.ts`. |
| T2 (Hàm `streamDailyTowelReceiptMatrixExcel`) | Đạt | `partner-excel.service.ts` dựng workbook `exceljs` với layout ma trận và công thức SUM. |
| T3 (`getDailyTowelMatrixData`) | Đạt | `partner-report.service.ts:156-297` ưu tiên `actualQuantityReceived`, fallback `quantityReceived`. |
| T4 (Endpoint `towel-matrix-export`) | Thiếu | Đã tạo endpoint tại `reports.controller.ts:265-292` nhưng thiếu `@Permissions(...)` nên không chặn được nhân viên nội bộ không có quyền báo cáo. |
| T5-T6 (Client helper & UI buttons) | Đạt | `reports.service.ts`, `PartnerHandoverPage.tsx`, `PartnerReconciliationViewComponent.tsx`. |
| T7-T8 (Unit test & Verify) | Đạt | `daily-towel-matrix.spec.ts` (7/7 tests pass) và build pass. |
| T9 (Đồng bộ tài liệu) | Đạt | Đã đồng bộ `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `CODEBASE_ATLAS.md`, `SRS_SDD.md`, `CHANGELOG.md`. |

- **File ngoài phạm vi plan:** Tách `daily-towel-matrix.helper.ts` và cập nhật `reports.service.ts`, `excel-export.service.ts`, `report-export.service.ts` để nối luồng export — hợp lý về mặt kiến trúc.

## 3. Phát hiện

| ID | Mức độ | Vị trí (path:line) | Vấn đề | Hướng xử lý |
| :--- | :---: | :--- | :--- | :--- |
| R1 | Blocker | `be-nestjs-thanhxuan/src/modules/internal/reports/reports.controller.ts:265-292` | Endpoint `GET /reports/partner/:partnerId/towel-matrix-export` không có decorator `@Permissions(...)` (trong khi `ReportsController` dùng `PermissionsGuard`). Điều kiện `if (userPartnerId && ...)` chỉ chặn user có `partnerId`, dẫn đến mọi nhân viên nội bộ không có `partnerId` (như `WORKER`, `SHIPPER`) đều có thể xuất bảng kê (kèm đơn giá `priceToCustomer`) của bất kỳ đối tác nào. | Gắn decorator phân quyền phù hợp (ví dụ cho phép `PARTNER` chỉ xuất đúng `partnerId` của mình, còn nhân viên nội bộ bắt buộc có quyền `REPORT_PARTNER` hoặc `ADMIN`/`MANAGER`/`ACCOUNTANT`/`WAREHOUSE_MANAGER`). |
| R2 | Major | `be-nestjs-thanhxuan/src/modules/internal/reports/services/partner-report.service.ts:179` | Truyền thẳng `new Types.ObjectId(partnerId)` mà không kiểm tra `Types.ObjectId.isValid(partnerId)` trước; nếu `partnerId` sai định dạng sẽ gây lỗi 500 `BSONError` thay vì `BadRequestException`. | Kiểm tra `if (!Types.ObjectId.isValid(partnerId)) throw new BadRequestException(...)` trước khi query. |
| R3 | Major | `be-nestjs-thanhxuan/src/modules/internal/reports/helpers/daily-towel-matrix.helper.ts:1-417` | File helper dài 417 dòng, vượt ngưỡng quy định `< 250–300` dòng. | Tách riêng phần mapping/chu kỳ ngày (`daily-towel-matrix.mapper.ts`) và phần render worksheet ExcelJS (`daily-towel-matrix.renderer.ts`). |
| R4 | Minor | `fe-react-thanhxuan-internal/src/features/operations/handovers/PartnerHandoverPage.tsx:70-72` | Khối `catch { // ignore }` nuốt lỗi khi tải Excel thất bại, không thông báo cho người dùng. | Hiển thị `toast.error(...)` khi xuất báo cáo thất bại. |
| R5 | Minor | `be-nestjs-thanhxuan/src/modules/internal/reports/specs/daily-towel-matrix.spec.ts` | Chưa có test case kiểm tra chặn quyền khi tài khoản nội bộ không có quyền báo cáo (ví dụ `WORKER`/`SHIPPER`) gọi `exportTowelMatrix`. | Bổ sung unit test/guard test cho trường hợp phân quyền sau khi sửa `R1`. |

## 4. Kết quả Verification

| Lệnh | Kết quả | Khớp với báo cáo của Executor? |
| :--- | :--- | :--- |
| `be-nestjs-thanhxuan`: `pnpm exec tsc --noEmit` | Pass (exit 0) | Khớp |
| `be-nestjs-thanhxuan`: `pnpm lint` | Fail (exit 1 — 645 errors, 74 warnings toàn repo) | Executor không báo cáo chạy `pnpm lint` |
| `be-nestjs-thanhxuan`: `pnpm test -- daily-towel-matrix` | Pass (1/1 suite, 7/7 tests) | Khớp |
| `be-nestjs-thanhxuan`: `pnpm build` | Pass (exit 0) | Khớp |
| `fe-react-thanhxuan-internal`: `pnpm exec tsc -b && pnpm build` | Pass (`tsc -b` + `vite build` thành công) | Khớp |

## 5. Kiểm tra tài liệu (5 Trụ cột)

- `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `CODEBASE_ATLAS.md`, `SRS_SDD.md`, `CHANGELOG.md`: Đều đã được cập nhật trong commit `ea3a35d`. (`DATABASE_DICTIONARY.md` không cần sửa do không đổi schema).

## 6. Open Questions

- Không có.

## 7. Verdict & bước tiếp theo

- **Verdict:** **Request changes** (1 Blocker, 2 Major, 2 Minor).
- **Bước tiếp theo:** Chạy `/act` để vá ngay lỗ hổng phân quyền `R1` trên `ReportsController`, bổ sung validate `ObjectId` (`R2`), tách nhỏ `daily-towel-matrix.helper.ts` (`R3`) và thêm toast báo lỗi + test phân quyền (`R4`, `R5`).
