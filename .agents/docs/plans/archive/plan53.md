# Plan 53: Bổ Sung Ca Giao Nhận Buổi Chiều (AFTERNOON) Cho Hệ Sinh Thái Vận Hành Xưởng & Quản Vận Shipper

> Status: Done | Created: 2026-10-29 | Completed: 2026-10-29

## 1. Overview & Affected Files

### 1.1. Bối cảnh & Yêu cầu nghiệp vụ
Hiện tại hệ sinh thái giao nhận đồ giặt (`be-nestjs-thanhxuan` và `fe-react-thanhxuan-internal`) mới chỉ hỗ trợ 2 ca giao nhận mặc định:
- **Ca Sáng (`MORNING`)**: Chuyến xuất xưởng/giao đồ sạch sáng sớm và nhận đồ bẩn về xưởng.
- **Ca Tối (`EVENING`)**: Chuyến thu nhận ca đêm (21h-24h) phục vụ các nhà hàng, khách sạn lớn.

Thực tế phát sinh nhu cầu giao nhận bổ sung **Buổi Chiều (`AFTERNOON`)** (khoảng 14h00 - 17h00) đối với các chuỗi đối tác yêu cầu thay khăn/đồ phục vụ tiệc chiều, hoặc các chuyến trung chuyển khẩn cấp trước giờ cao điểm tối. Cần chuẩn hóa toàn diện giá trị `AFTERNOON` cho trường `deliveryShift` trên toàn bộ các tầng:
1. **Quản trị đối tác (`Partner`):** Cho phép cấu hình ca giao nhận mặc định là "Ca Chiều (Buổi chiều)" bên cạnh Ca Sáng và Ca Tối.
2. **Phiếu giao nhận (`HandoverRecord`):** Ghi nhận chính xác ca giao nhận là `MORNING` | `AFTERNOON` | `EVENING`, kế thừa tự động từ đối tác hoặc do thủ kho/shipper chỉ định.
3. **Cổng vận hành Shipper (`ShipperHandoverPage`):** Bổ sung nút lọc `Ca Chiều` (kèm badge đếm số điểm giao), phân loại màu sắc trực quan (Sáng: Hổ phách, Chiều: Cam ấm, Tối: Tím), hiển thị chính xác badge ca ở Lộ trình và Chợ Chuyến (Job Pool).

---

### 1.2. Bảng File Ảnh Hưởng (Expected File Changes)

| STT | Phân Vùng | Đường dẫn File | Thao tác | Mục đích / Tác dụng |
| :---: | :---: | :--- | :---: | :--- |
| 1 | Backend | `be-nestjs-thanhxuan/src/modules/internal/partners/schemas/partner.schema.ts` | Edit | Mở rộng enum `deliveryShift`: `['MORNING', 'AFTERNOON', 'EVENING']` |
| 2 | Backend | `be-nestjs-thanhxuan/src/modules/internal/partners/dto/create-partner.dto.ts` | Edit | Validate enum `IsIn(['MORNING', 'AFTERNOON', 'EVENING'])` |
| 3 | Backend | `be-nestjs-thanhxuan/src/modules/internal/partners/dto/update-partner.dto.ts` | Edit | Validate enum `IsIn(['MORNING', 'AFTERNOON', 'EVENING'])` |
| 4 | Backend | `be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts` | Edit | Mở rộng enum `deliveryShift`: `['MORNING', 'AFTERNOON', 'EVENING']` |
| 5 | Backend | `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/clean-clothes.dto.ts` | Edit | Validate enum `deliveryShift?: 'MORNING' \| 'AFTERNOON' \| 'EVENING'` |
| 6 | Backend | `be-nestjs-thanhxuan/src/modules/internal/handovers/dto/create-handover.dto.ts` | Edit | Validate enum `deliveryShift?: 'MORNING' \| 'AFTERNOON' \| 'EVENING'` |
| 7 | Backend | `be-nestjs-thanhxuan/src/modules/internal/handovers/controllers/handover.controller.ts` | Edit | Cập nhật Query parameter `shift?: 'MORNING' \| 'AFTERNOON' \| 'EVENING'` |
| 8 | Backend | `be-nestjs-thanhxuan/src/modules/internal/handovers/handover.service.ts` | Edit | Cập nhật type `shift?: 'MORNING' \| 'AFTERNOON' \| 'EVENING'` |
| 9 | Backend | `be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-pool-compensation.service.ts` | Edit | Cập nhật interface `PoolJobItem` & filter shift hỗ trợ `AFTERNOON` |
| 10 | Frontend | `fe-react-thanhxuan-internal/src/features/management/partners/partner.types.ts` | Edit | Khai báo `deliveryShift?: 'MORNING' \| 'AFTERNOON' \| 'EVENING'` |
| 11 | Frontend | `fe-react-thanhxuan-internal/src/features/management/partners/components/PartnerContactScheduleFieldsComponent.tsx` | Edit | Bổ sung `<option value="AFTERNOON">Ca Chiều (Buổi chiều)</option>` |
| 12 | Frontend | `fe-react-thanhxuan-internal/src/features/management/partners/modals/PartnerModal.tsx` | Edit | Cập nhật state & form type `deliveryShift: "MORNING" \| "AFTERNOON" \| "EVENING"` |
| 13 | Frontend | `fe-react-thanhxuan-internal/src/features/management/partners/components/PartnerCardComponent.tsx` | Edit | Cập nhật helper badge ca giao nhận (`Ca Sáng`, `Ca Chiều`, `Ca Tối`) |
| 14 | Frontend | `fe-react-thanhxuan-internal/src/features/operations/handovers/handover.types.ts` | Edit | Cập nhật type `deliveryShift` trong `PoolJobItem` & `HandoverRecord` |
| 15 | Frontend | `fe-react-thanhxuan-internal/src/features/operations/handovers/hooks/useShipperHandoverPage.ts` | Edit | Bổ sung `afternoonCount`, cập nhật `shiftFilter`, `UnifiedDeliveryPoint.shift` |
| 16 | Frontend | `fe-react-thanhxuan-internal/src/features/operations/handovers/ShipperHandoverPage.tsx` | Edit | Bổ sung nút lọc `Ca Chiều` (SunMedium icon, badge cam) và cập nhật nhãn |
| 17 | Frontend | `fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperHandoverItemCardComponent.tsx` | Edit | Cập nhật badge hiển thị `Ca Sáng` / `Ca Chiều` / `Ca Tối` |
| 18 | Frontend | `fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperPendingPointCardComponent.tsx` | Edit | Cập nhật badge hiển thị `Ca Sáng` / `Ca Chiều` / `Ca Tối` |
| 19 | Frontend | `fe-react-thanhxuan-internal/src/features/operations/handovers/components/ShipperJobPoolTabComponent.tsx` | Edit | Cập nhật badge & filter hiển thị `Ca Chiều` |
| 20 | Frontend | `fe-react-thanhxuan-internal/src/features/operations/handovers/components/PrepOrderConfigHeaderComponent.tsx` | Edit | Hỗ trợ hiển thị hoặc chọn ca giao nhận khi soạn phiếu |
| 21 | Docs | `.agents/docs/DATABASE_DICTIONARY.md` | Edit | Cập nhật mục 1.6 (`partners`) & 1.8 (`handover_records`) enum `deliveryShift` |
| 22 | Docs | `.agents/docs/srs_sdd/srs_sdd_backend.md` & `srs_sdd_fe_internal.md` | Edit | Đồng bộ tài liệu SRS/SDD phân hệ Backend và Cổng nội bộ |
| 23 | Docs | `.agents/docs/CHANGELOG.md` | Edit | Ghi nhận chi tiết bài luận kỹ thuật Plan 53 |

---

## 2. Chi Tiết Thực Thi Kỹ Thuật

### 2.1. Backend (`be-nestjs-thanhxuan`)
- **Schema & Model:**
  - `Partner.deliveryShift`: `@Prop({ type: String, enum: ['MORNING', 'AFTERNOON', 'EVENING'], default: 'MORNING' })`
  - `HandoverRecord.deliveryShift`: `@Prop({ type: String, enum: ['MORNING', 'AFTERNOON', 'EVENING'], default: 'MORNING' })`
- **Validation DTO:**
  - `@IsIn(['MORNING', 'AFTERNOON', 'EVENING'], { message: 'Ca giao nhận phải là MORNING, AFTERNOON hoặc EVENING' })`
- **Controller & Service Pool:**
  - `@Query('shift') shift?: 'MORNING' | 'AFTERNOON' | 'EVENING'`
  - Lọc chính xác các chuyến theo ca được yêu cầu.

### 2.2. Frontend Internal (`fe-react-thanhxuan-internal`)
- **Badge & Color Tokens Chuẩn:**
  - **Ca Sáng (`MORNING`):** Icon `Sun`, màu vàng hổ phách (`bg-amber-500/10 text-amber-600 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400`).
  - **Ca Chiều (`AFTERNOON`):** Icon `SunMedium`, màu cam ấm (`bg-orange-500/10 text-orange-600 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400`).
  - **Ca Tối (`EVENING`):** Icon `Moon`, màu tím huyền ảo (`bg-purple-500/10 text-purple-600 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400`).
- **Màn hình Shipper (`ShipperHandoverPage`):**
  - Thanh lọc chuyển thành 4 nút: `Tất Cả`, `Sáng (x)`, `Chiều (y)`, `Tối (z)` (tối ưu bố cục responsive trên màn hình mobile).
  - Lọc và hiển thị danh sách các điểm giao nhận thuộc ca tương ứng mượt mà.

---

## 3. Checklist Công Việc & Verification

- [x] **T1 (Backend):** Cập nhật Schema `Partner` và `HandoverRecord` hỗ trợ enum `'AFTERNOON'`.
- [x] **T2 (Backend):** Cập nhật DTOs (`create-partner.dto`, `update-partner.dto`, `clean-clothes.dto`, `create-handover.dto`).
- [x] **T3 (Backend):** Cập nhật Controller và Service Pool compensation nhận tham số `shift` có `AFTERNOON`.
- [x] **T4 (Backend Verification):** Chạy `pnpm exec tsc --noEmit` & `pnpm test` trong `be-nestjs-thanhxuan`.
- [x] **T5 (Frontend Types & Management):** Cập nhật `partner.types.ts`, `PartnerModal.tsx`, `PartnerContactScheduleFieldsComponent.tsx`, `PartnerCardComponent.tsx`.
- [x] **T6 (Frontend Operations):** Cập nhật `handover.types.ts`, `useShipperHandoverPage.ts`, `ShipperHandoverPage.tsx`, `ShipperHandoverItemCardComponent.tsx`, `ShipperPendingPointCardComponent.tsx`, `ShipperJobPoolTabComponent.tsx`.
- [x] **T7 (Frontend Verification):** Chạy `pnpm exec tsc --noEmit` & `pnpm build` trong `fe-react-thanhxuan-internal`.
- [x] **T8 (Docs Sync & Git):** Cập nhật `DATABASE_DICTIONARY.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `CHANGELOG.md`, sau đó commit và push lên nhánh `dev`.

## 4. Execution Log
- **2026-10-29:**
  - Hoàn tất toàn bộ 8 tasks T1 -> T8.
  - Backend: `pnpm exec tsc --noEmit` pass sạch, `pnpm test` pass 50/50 test suites (233 unit tests pass).
  - Frontend: `pnpm exec tsc --noEmit` pass sạch, `pnpm build` pass tạo bundle PWA thành công.
  - Cập nhật đồng bộ hệ thống tài liệu 5 trụ cột và tự động commit/push lên nhánh `dev`.
