# Plan 15: Chuẩn Hóa Cấu Trúc Thư Mục Phân Hệ Internal (Số Nhiều Toàn Diện) & Cập Nhật Skill create-nestjs-module

> Status: Done | Created: 2026-10-07 | Updated: 2026-10-07  
> Phân hệ ảnh hưởng: `be-nestjs-thanhxuan` (`src/modules/internal/*`)  
> Tham chiếu quy chuẩn: [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md), [create-nestjs-module/SKILL.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/skills/create-nestjs-module/SKILL.md)

---

## 1. Overview & Affected Files

### 1.1. Mục tiêu
1. **Chuẩn hóa danh xưng số nhiều toàn diện (Comprehensive Plural Naming):**
   - Đổi tên thư mục `accounts/` thành `auths/`.
   - Đổi tên tất cả các thư mục module nghiệp vụ trong `src/modules/internal/` sang dạng số nhiều:
     - `accounts/` ➔ `auths/`
     - `attendance/` ➔ `attendances/`
     - `fuel/` ➔ `fuels/`
     - `handover/` ➔ `handovers/`
     - `payroll/` ➔ `payrolls/`
     - `piecework/` ➔ `pieceworks/`
     - `partners/` (đã là số nhiều)
     - `reports/` (đã là số nhiều)
   - Duy trì chuẩn thư mục con `dto/` (giữ nguyên quy chuẩn từ viết tắt Data Transfer Object, không thêm số nhiều, đồng bộ với `laundry`, `moving`, `core/audit`).
2. **Chuẩn hóa cấu trúc thư mục con học theo phân hệ `laundry/`:**
   - Tạo thư mục `specs/` cho tất cả các module và di chuyển 100% các file unit test `*.spec.ts` vào `specs/`.
   - Phân tách rõ ràng các thư mục con tùy chọn khi quy mô module yêu cầu:
     - `controllers/` (nếu có từ 2 controllers trở lên, như `auths` và `handovers`).
     - `services/` (nếu có nhiều helper/export services, như `reports`).
     - `strategies/` (chứa Passport JWT/Local Strategies, như `auths`).
     - `repositories/` (duy trì 100% Repository Pattern).
     - `schemas/` (Mongoose Schemas).
     - `dto/` (Data Transfer Objects - giữ nguyên viết tắt).
3. **Giữ nguyên API Route Contract:**
   - Giữ nguyên các prefix đường dẫn `@Controller('internal/...')` (ví dụ: `internal/accounts`, `internal/handover`, `internal/attendance`...) để tránh breaking change với Frontend API client.
4. **Cập nhật tài liệu Skill & Kiến trúc:**
   - Cập nhật quy chuẩn thư mục số nhiều vào [.agents/skills/create-nestjs-module/SKILL.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/skills/create-nestjs-module/SKILL.md) và [.agents/docs/srs_sdd/srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md).

### 1.2. Dẫn chứng hiện trạng code
- Phân hệ mẫu `laundry/` ([src/modules/laundry/articles](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/articles), [auth](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/laundry/auth)) đã chuẩn hóa tách biệt `specs/`, `schemas/`, `strategies/`, `repositories/`.
- Phân hệ `internal/`:
  - `accounts`: Thư mục chứa [accounts.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/accounts/accounts.controller.ts#L1), [accounts.module.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/accounts/accounts.module.ts#L1), cần đổi tên thành `auths/` và đưa `accounts.controller.ts` vào `controllers/`.
  - `attendance`: Có [attendance.service.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.service.spec.ts#L1) và thư mục `dto/`, cần đổi thành `attendances/`, `dtos/`, `specs/`.
  - `fuel`: Có [fuel.service.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/fuel/fuel.service.spec.ts#L1) và thư mục `dto/`, cần đổi thành `fuels/`, `dtos/`, `specs/`.
  - `handover`: Có 2 controllers ([handover.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handover/handover.controller.ts#L1), [recount-tasks.controller.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handover/recount-tasks.controller.ts#L1)) và 3 specs ([handover.service.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handover/handover.service.spec.ts#L1), [handover-state.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handover/handover-state.spec.ts#L1), [dto/create-handover.dto.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handover/dto/create-handover.dto.spec.ts#L1)), cần đổi thành `handovers/`, `dtos/`, `specs/`, `controllers/`.
  - `partners`: Có [partners-schedule.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/partners/partners-schedule.spec.ts#L1) và `dto/`, cần đổi `dto/` ➔ `dtos/`, tạo `specs/`.
  - `payroll`: Có [payroll.service.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/payroll.service.spec.ts#L1) và `dto/`, cần đổi thành `payrolls/`, `dtos/`, `specs/`.
  - `piecework`: Có [piecework.service.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/piecework.service.spec.ts#L1), [piecework-calculator.spec.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/piecework-calculator.spec.ts#L1) và `dto/`, cần đổi thành `pieceworks/`, `dtos/`, `specs/`.
  - `reports`: Có `dto/`, cần đổi `dto/` ➔ `dtos/`.
  - [src/app.module.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/app.module.ts#L45-L54) và [src/modules/internal/internal.module.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/internal.module.ts#L3-L10): Đang import các module theo đường dẫn thư mục cũ.

### 1.3. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `src/modules/internal/accounts/` ➔ `src/modules/internal/auths/` | Move/Rename | Đổi tên module sang số nhiều `auths` |
| `src/modules/internal/auths/dto/` ➔ `src/modules/internal/auths/dtos/` | Move/Rename | Chuẩn hóa thư mục con số nhiều `dtos` |
| `src/modules/internal/auths/accounts.controller.ts` ➔ `auths/controllers/accounts.controller.ts` | Move/Edit | Tách vào `controllers/` |
| `src/modules/internal/auths/accounts.module.ts` ➔ `auths/auths.module.ts` | Move/Edit | Đổi tên module file & class `AuthsModule` |
| `src/modules/internal/attendance/` ➔ `src/modules/internal/attendances/` | Move/Rename | Đổi tên module sang số nhiều `attendances` |
| `src/modules/internal/attendances/dto/` ➔ `src/modules/internal/attendances/dtos/` | Move/Rename | Chuẩn hóa thư mục con số nhiều `dtos` |
| `src/modules/internal/attendances/attendance.service.spec.ts` ➔ `attendances/specs/attendance.service.spec.ts` | Move/Edit | Chuyển file test vào `specs/` |
| `src/modules/internal/fuel/` ➔ `src/modules/internal/fuels/` | Move/Rename | Đổi tên module sang số nhiều `fuels` |
| `src/modules/internal/fuels/dto/` ➔ `src/modules/internal/fuels/dtos/` | Move/Rename | Chuẩn hóa thư mục con số nhiều `dtos` |
| `src/modules/internal/fuels/fuel.service.spec.ts` ➔ `fuels/specs/fuel.service.spec.ts` | Move/Edit | Chuyển file test vào `specs/` |
| `src/modules/internal/handover/` ➔ `src/modules/internal/handovers/` | Move/Rename | Đổi tên module sang số nhiều `handovers` |
| `src/modules/internal/handovers/dto/` ➔ `src/modules/internal/handovers/dtos/` | Move/Rename | Chuẩn hóa thư mục con số nhiều `dtos` |
| `src/modules/internal/handovers/handover.controller.ts` ➔ `handovers/controllers/handover.controller.ts` | Move/Edit | Tách controller vào `controllers/` |
| `src/modules/internal/handovers/recount-tasks.controller.ts` ➔ `handovers/controllers/recount-tasks.controller.ts` | Move/Edit | Tách controller vào `controllers/` |
| `src/modules/internal/handovers/*.spec.ts` ➔ `handovers/specs/*.spec.ts` | Move/Edit | Gom 3 file specs vào `specs/` |
| `src/modules/internal/partners/dto/` ➔ `src/modules/internal/partners/dtos/` | Move/Rename | Chuẩn hóa thư mục con số nhiều `dtos` |
| `src/modules/internal/partners/partners-schedule.spec.ts` ➔ `partners/specs/partners-schedule.spec.ts` | Move/Edit | Chuyển file test vào `specs/` |
| `src/modules/internal/payroll/` ➔ `src/modules/internal/payrolls/` | Move/Rename | Đổi tên module sang số nhiều `payrolls` |
| `src/modules/internal/payrolls/dto/` ➔ `src/modules/internal/payrolls/dtos/` | Move/Rename | Chuẩn hóa thư mục con số nhiều `dtos` |
| `src/modules/internal/payrolls/payroll.service.spec.ts` ➔ `payrolls/specs/payroll.service.spec.ts` | Move/Edit | Chuyển file test vào `specs/` |
| `src/modules/internal/piecework/` ➔ `src/modules/internal/pieceworks/` | Move/Rename | Đổi tên module sang số nhiều `pieceworks` |
| `src/modules/internal/pieceworks/dto/` ➔ `src/modules/internal/pieceworks/dtos/` | Move/Rename | Chuẩn hóa thư mục con số nhiều `dtos` |
| `src/modules/internal/pieceworks/*.spec.ts` ➔ `pieceworks/specs/*.spec.ts` | Move/Edit | Gom 2 file specs vào `specs/` |
| `src/modules/internal/reports/dto/` ➔ `src/modules/internal/reports/dtos/` | Move/Rename | Chuẩn hóa thư mục con số nhiều `dtos` |
| `src/modules/internal/reports/reports.service.ts` & `reports.module.ts` | Edit | Cập nhật cross-imports từ `auths`, `attendances`, `fuels`, `handovers`, `payrolls`, `pieceworks` |
| `src/modules/internal/internal.module.ts` | Edit | Cập nhật imports các module số nhiều mới |
| `src/app.module.ts` | Edit | Cập nhật imports các module số nhiều mới |
| `.agents/skills/create-nestjs-module/SKILL.md` | Edit | Cập nhật cấu trúc module chuẩn số nhiều (`dtos/`, `schemas/`, `repositories/`, `specs/`, `controllers/`, `services/`, `strategies/`) |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | Edit | Cập nhật cây thư mục và danh mục module phân hệ Internal |

---

## 2. Technical Approach

### 2.1. Cấu Trúc Module Chuẩn Hóa Số Nhiều Toàn Diện (Plural Architecture)

```
src/modules/internal/
├── auths/                             # Module Quản trị tài khoản & Xác thực OTP
│   ├── dtos/                          # BẮT BUỘC: Data Transfer Objects (Số nhiều)
│   ├── schemas/                       # BẮT BUỘC: Mongoose Schemas (Số nhiều)
│   ├── repositories/                  # BẮT BUỘC: Repositories kế thừa BaseRepository (Số nhiều)
│   ├── specs/                         # BẮT BUỘC: 100% file unit test *.spec.ts (Số nhiều)
│   ├── controllers/                   # NẾU CẦN: Chứa các controllers khi có >= 2 controllers (Số nhiều)
│   │   ├── accounts.controller.ts
│   │   ├── auth.controller.ts
│   │   └── approvals.controller.ts
│   ├── strategies/                    # NẾU CẦN: Passport JWT/Local Strategies (Số nhiều)
│   │   └── internal-jwt.strategy.ts
│   ├── auths.service.ts
│   └── auths.module.ts
│
├── handovers/                         # Module Giao nhận 2 chiều & Gom bao
│   ├── dtos/
│   ├── schemas/
│   ├── repositories/
│   ├── specs/
│   ├── controllers/
│   │   ├── handover.controller.ts
│   │   └── recount-tasks.controller.ts
│   ├── handover-state.ts
│   ├── handover.service.ts
│   └── handovers.module.ts
│
├── attendances/                       # Module Chấm công selfie & Ca làm việc
│   ├── dtos/
│   ├── schemas/
│   ├── repositories/
│   ├── specs/
│   ├── attendance.controller.ts
│   ├── attendance.service.ts
│   └── attendances.module.ts
│
├── fuels/                             # Module Đề xuất & Hoàn tiền xăng xe
│   ├── dtos/
│   ├── schemas/
│   ├── repositories/
│   ├── specs/
│   ├── fuel.controller.ts
│   ├── fuel.service.ts
│   └── fuels.module.ts
│
├── partners/                          # Module Đối tác nhà hàng & Danh mục đồ vải
│   ├── dtos/
│   ├── schemas/
│   ├── repositories/
│   ├── specs/
│   ├── partners-schedule.ts
│   ├── partners.controller.ts
│   ├── partners.service.ts
│   └── partners.module.ts
│
├── payrolls/                          # Module Tính lương chu kỳ & Chốt kỳ lương
│   ├── dtos/
│   ├── schemas/
│   ├── repositories/
│   ├── specs/
│   ├── payroll.controller.ts
│   ├── payroll.service.ts
│   └── payrolls.module.ts
│
├── pieceworks/                        # Module Khoán việc & Năng suất thợ xưởng
│   ├── dtos/
│   ├── schemas/
│   ├── repositories/
│   ├── specs/
│   ├── piecework-calculator.ts
│   ├── piecework.controller.ts
│   ├── piecework.service.ts
│   └── pieceworks.module.ts
│
└── reports/                           # Module Báo cáo tổng hợp & Xuất file
    ├── dtos/
    ├── services/                      # Services phụ trợ xuất Excel/PDF/Queue
    │   ├── excel-export.service.ts
    │   ├── pdf-export.service.ts
    │   └── export-queue.service.ts
    ├── specs/
    ├── reports.controller.ts
    ├── reports.service.ts
    └── reports.module.ts
```

### 2.2. Chiến Lược Refactoring Giữ An Toàn Tuyệt Đối
1. **Module Re-export Aliases:** Trong `auths.module.ts`, export cả `AccountsModule` alias trỏ về `AuthsModule` (hoặc `export { AuthsModule as AccountsModule }`) để đảm bảo các file test cũ hoặc module phụ trợ chưa đổi kịp vẫn build thành công ngay lập tức.
2. **Kế Thừa API Routes Contract:** Giữ nguyên các prefix decorator `@Controller('internal/accounts')`, `@Controller('internal/handover')`, `@Controller('internal/attendance')`, `@Controller('internal/fuel')`, `@Controller('internal/payroll')`, `@Controller('internal/piecework')`, `@Controller('internal/partners')`, `@Controller('internal/reports')` để đảm bảo 100% không làm lệch contract với Frontend.

---

## 3. Implementation Tasks (Checklist)

- [x] T1: Đổi tên và tái cấu trúc `accounts` ➔ `auths` - Đổi thư mục `dto` ➔ `dtos`, chuyển `accounts.controller.ts` vào `controllers/`, chuyển file test vào `specs/`, đổi tên `auths.module.ts` và export `AuthsModule`.
- [x] T2: Đổi tên và tái cấu trúc `attendance` ➔ `attendances` - Đổi thư mục `dto` ➔ `dtos`, tạo `specs/`, chuyển `attendance.service.spec.ts` vào `specs/`, đổi tên `attendances.module.ts`.
- [x] T3: Đổi tên và tái cấu trúc `fuel` ➔ `fuels` - Đổi thư mục `dto` ➔ `dtos`, tạo `specs/`, chuyển `fuel.service.spec.ts` vào `specs/`, đổi tên `fuels.module.ts`.
- [x] T4: Đổi tên và tái cấu trúc `handover` ➔ `handovers` - Đổi thư mục `dto` ➔ `dtos`, tạo `controllers/` gom 2 controller, tạo `specs/` gom 3 file test, đổi tên `handovers.module.ts`.
- [x] T5: Tái cấu trúc `partners` - Đổi thư mục `dto` ➔ `dtos`, tạo `specs/`, chuyển `partners-schedule.spec.ts` vào `specs/`.
- [x] T6: Đổi tên và tái cấu trúc `payroll` ➔ `payrolls` - Đổi thư mục `dto` ➔ `dtos`, tạo `specs/`, chuyển `payroll.service.spec.ts` vào `specs/`, đổi tên `payrolls.module.ts`.
- [x] T7: Đổi tên và tái cấu trúc `piecework` ➔ `pieceworks` - Đổi thư mục `dto` ➔ `dtos`, tạo `specs/`, chuyển 2 file tests vào `specs/`, đổi tên `pieceworks.module.ts`.
- [x] T8: Tái cấu trúc `reports` - Đổi thư mục `dto` ➔ `dtos`, cập nhật các đường dẫn cross-import đến `auths`, `attendances`, `fuels`, `handovers`, `payrolls`, `pieceworks`.
- [x] T9: Cập nhật `internal.module.ts` và `app.module.ts` theo đúng danh sách module số nhiều mới.
- [x] T10: Cập nhật tài liệu skill `.agents/skills/create-nestjs-module/SKILL.md` - Ghi nhận chuẩn cấu trúc số nhiều toàn diện (`dtos/`, `schemas/`, `repositories/`, `specs/`, `controllers/`, `services/`, `strategies/`).
- [x] T11: Cập nhật tài liệu phân hệ Backend `.agents/docs/srs_sdd/srs_sdd_backend.md` và `.agents/docs/SRS_SDD.md` Document History.
- [x] T12: Chạy kiểm thử toàn bộ (`pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build`) trong `be-nestjs-thanhxuan` và ghi nhận nhật ký vào `CHANGELOG.md`.

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm thử
Chạy trực tiếp tại thư mục `be-nestjs-thanhxuan`:
```bash
# 1. Typecheck
pnpm exec tsc --noEmit

# 2. Toàn bộ Unit Test suite (43 test suites, 194 tests)
pnpm test

# 3. Production Build
pnpm build
```

### 4.2. Kịch bản xác minh
1. **Toàn bộ 43 test suites được phát hiện:** Jest tự động phát hiện và chạy thành công tất cả các file test nằm trong `specs/` của các module số nhiều mới (`auths`, `attendances`, `fuels`, `handovers`, `partners`, `payrolls`, `pieceworks`, `reports`).
2. **Không có lỗi Unresolved Import:** `tsc --noEmit` và `vite`/`nest build` hoàn thành với exit code 0.
3. **Skill & Docs đồng bộ:** `SKILL.md` và `srs_sdd_backend.md` phản ánh chính xác cấu trúc số nhiều.

---

## 5. Risks & Rollback

- **Rủi ro:** Cross-imports giữa các module trong `internal` (đặc biệt là `reports` import repository từ các module khác) có thể bị lệch path dẫn đến compilation error.
- **Giảm thiểu:** Kiểm tra kỹ danh sách cross-imports đã grep ở Bước Khảo sát, sửa đồng bộ và chạy `tsc --noEmit` kiểm tra ngay sau mỗi module.
- **Rollback:** `git checkout` khôi phục lại vị trí thư mục ban đầu nếu gặp lỗi không thể giải quyết.

---

## Changelog

- 2026-10-07: Khởi tạo Plan 15 chuẩn hóa cấu trúc thư mục phân hệ Internal theo mẫu Laundry và cập nhật SKILL.md.
- 2026-10-07: Mở rộng Plan 15 áp dụng số nhiều toàn diện: đổi `accounts` ➔ `auths`, tất cả tên module `internal/` sang số nhiều (`attendances`, `fuels`, `handovers`, `payrolls`, `pieceworks`), và toàn bộ thư mục con `dto/` sang `dtos/`.
- 2026-10-07: Hoàn thành 100% 12 tasks (T1 - T12). 43/43 test suites (194 tests) pass, typecheck pass, build pass. Đồng bộ SKILL.md, srs_sdd_backend.md, SRS_SDD.md và CHANGELOG.md.

---

## Execution Log

- **Ngày thực thi:** 2026-10-07
- **Kết quả:** Done (12/12 tasks hoàn thành 100%).
- **Tasks hoàn tất:**
  - T1: Đổi tên và tái cấu trúc `accounts` ➔ `auths` (tạo `controllers/`, `specs/`, `dtos/`, export `AuthsModule` và alias `AccountsModule`).
  - T2: Đổi tên `attendance` ➔ `attendances` (tạo `specs/`, `dtos/`, export `AttendancesModule` và alias `AttendanceModule`).
  - T3: Đổi tên `fuel` ➔ `fuels` (tạo `specs/`, `dtos/`, export `FuelsModule` và alias `FuelModule`).
  - T4: Đổi tên `handover` ➔ `handovers` (tạo `controllers/`, `specs/`, `dtos/`, export `HandoversModule` và alias `HandoverModule`).
  - T5: Tái cấu trúc `partners` (`specs/`, `dtos/`).
  - T6: Đổi tên `payroll` ➔ `payrolls` (`specs/`, `dtos/`, export `PayrollsModule` và alias `PayrollModule`).
  - T7: Đổi tên `piecework` ➔ `pieceworks` (`specs/`, `dtos/`, export `PieceworksModule` và alias `PieceworkModule`).
  - T8: Tái cấu trúc `reports` (`dtos/`, cập nhật toàn bộ cross-imports số nhiều).
  - T9: Cập nhật `internal.module.ts`, `app.module.ts`, `core/schedule/*`.
  - T10: Cập nhật SKILL.md (`create-nestjs-module`) chuẩn số nhiều toàn diện.
  - T11: Cập nhật `srs_sdd_backend.md` và `SRS_SDD.md` Document History.
  - T12: Chạy kiểm thử: `pnpm exec tsc --noEmit` pass, `pnpm test` (43/43 suites, 194/194 tests pass), `pnpm build` pass. Ghi nhận `CHANGELOG.md`.
- **Deviation:** Không có. Giữ nguyên 100% API Route Contract để không gây breaking change với Frontend.
