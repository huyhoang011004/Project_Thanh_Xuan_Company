# Review 71: Giai Đoạn 3 - Phân Hệ Giao Ngoài Cho Shipper & Quản Lý Lịch Làm Việc / Nghỉ Phép Thợ Xưởng

> Plan: .agents/docs/plans/plan71.md | Reviewed: 2026-11-25 | Base: `502a2a4` (BE), `e0e8f86` (FE), `47465f8` (Docs) | Verdict: Request changes

## 1. Tóm tắt

Plan 71 đã hoàn thiện đầy đủ 2 module mới ở Backend (`external-deliveries`, `worker-schedules`) kèm Cron Job 20:00 tối Chủ Nhật và giao diện tương ứng trên `fe-react-thanhxuan-internal`. Tuy nhiên, qua review phát hiện 2 lỗi **Blocker**: (1) `NotificationsService.getMyNotifications` chưa hỗ trợ kênh `'workshop_workers'` nên thợ xưởng sẽ không bao giờ nhận được thông báo nhắc lịch 20:00 Chủ Nhật, và (2) cả 2 Controller mới thiếu `@Roles(...)`/`@Permissions(...)` guard (đặc biệt endpoint `POST /worker-schedules/notify-sunday` cho phép bất kỳ ai spam thông báo toàn xưởng). Ngoài ra còn 2 lỗi **Major** về `.select()`/phân trang/validate `ObjectId` ở Repository và độ dài file (> 250–300 dòng).

## 2. Đối chiếu với Plan

| Task | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| T1 (Module `external-deliveries` BE) | Thiếu | Đã tạo đủ Schema, Repository, Service, Controller, nhưng `ExternalDeliveriesController` thiếu Guard phân quyền Shipper/Admin/Manager. |
| T2-T4 (Giao ngoài FE) | Đạt | `ExternalDeliveryModal.tsx`, `ExternalDeliveryListTabComponent.tsx`, `ShipperHandoverPage.tsx`. |
| T5-T6 (Module `worker-schedules` & logic làm bù) | Đạt | Đã cài đặt đầy đủ validation ca làm bù cùng tuần trong `worker-schedules.service.ts:66-172`. |
| T7 (Cron Job 20:00 CN gửi thông báo `WORKER`) | Thiếu | Cron Job chạy đúng `0 20 * * 0` (`Asia/Ho_Chi_Minh`), nhưng `NotificationsService` không đọc kênh `workshop_workers` nên `WORKER` không nhận được thông báo. |
| T8-T13 (Giao diện Lịch & Nghỉ phép FE) | Đạt | Đã tạo đủ các modal, `WorkerSchedulePage.tsx`, `useWorkerSchedule.ts`, route và menu sidebar. |
| T14 (Unit test BE) | Đạt | `external-deliveries.service.spec.ts` (3/3 pass), `worker-schedules.service.spec.ts` (6/6 pass). |
| T15-T17 (Verify & Docs) | Đạt | Build pass; đã đồng bộ 5 trụ cột tài liệu. |

- **File ngoài phạm vi plan:** Không có file ngoài phạm vi bất thường (các file repository, dto, nav-config, utils tách theo cấu trúc chuẩn của repo).

## 3. Phát hiện

| ID | Mức độ | Vị trí (path:line) | Vấn đề | Hướng xử lý |
| :--- | :---: | :--- | :--- | :--- |
| R1 | Blocker | `be-nestjs-thanhxuan/src/modules/internal/worker-schedules/worker-schedules.service.ts:310-320` & `src/modules/core/notifications/notifications.service.ts:41-58` | `notifySundayRegistration()` gửi notification tới `toAccountId: 'workshop_workers'`, nhưng `NotificationsService.getMyNotifications()` chỉ query `all_managers`, `warehouse_team`, `partner_${partnerId}` và `accountId`. Tài khoản `WORKER` không bao giờ nhận được thông báo nhắc đăng ký lịch 20:00 Chủ Nhật. | Bổ sung điều kiện `if (userCtx?.role === 'WORKER') orConditions.push({ toAccountId: 'workshop_workers' });` trong `getMyNotifications()` (và cập nhật `markAsRead` tương ứng nếu cần, hoặc gửi notification theo từng `accountId` của `WORKER` active). |
| R2 | Blocker | `be-nestjs-thanhxuan/src/modules/internal/worker-schedules/worker-schedules.controller.ts:26-27,98-106` & `src/modules/internal/external-deliveries/external-deliveries.controller.ts:21-22` | Cả 2 controller chỉ gắn `@UseGuards(InternalJwtGuard)` mà thiếu `RolesGuard`/`PermissionsGuard` + `@Roles(...)`/`@Permissions(...)`. Hệ quả: (a) Bất kỳ user nào (kể cả `WORKER`, `PARTNER`) đều gọi được `POST /worker-schedules/notify-sunday` để broadcast thông báo toàn xưởng; (b) Tài khoản `PARTNER` có thể gọi `POST/GET /external-deliveries` để xem/tạo chuyến giao ngoài. | Gắn `RolesGuard` / `PermissionsGuard` và khai báo `@Roles(...)` chặt chẽ cho từng endpoint (đặc biệt `notify-sunday` chỉ cho `ADMIN`/`MANAGER`; `external-deliveries` chỉ cho `SHIPPER`/`ADMIN`/`MANAGER`/`ACCOUNTANT`/`OPERATOR`). |
| R3 | Blocker | `be-nestjs-thanhxuan/src/modules/core/schedule/specs/schedule-task.service.spec.ts` | Toàn bộ suite `pnpm test` bị fail **4/4 tests** ở `schedule-task.service.spec.ts` do `ScheduleTaskService` (sửa ở commit `502a2a4`) inject thêm `WorkerSchedulesService` tại constructor nhưng unit test chưa mock provider `WorkerSchedulesService`. | Bổ sung mock `WorkerSchedulesService` vào `TestingModule` trong `schedule-task.service.spec.ts`. |
| R4 | Major | `be-nestjs-thanhxuan/src/modules/internal/external-deliveries/repositories/external-delivery.repository.ts:39-48` & `worker-schedules/repositories/worker-leave.repository.ts:42-46` | Các query danh sách (`findByDate`, `findByFilter`, `findAll`, `findByWorker`) thiếu `.select(...)` và thiếu phân trang (`limit`/`page`); đồng thời `new Types.ObjectId(shipperId)` / `new Types.ObjectId(workerId)` không kiểm tra `Types.ObjectId.isValid`. | Bổ sung `.select(...)`, hỗ trợ `limit`/`skip` (hoặc pagination chuẩn repo) và validate `Types.ObjectId.isValid` trước khi cast. |
| R5 | Major | `be-nestjs-thanhxuan/src/modules/internal/worker-schedules/worker-schedules.service.ts` (314 dòng) & 4 modal FE (`WeeklyScheduleRegisterModal.tsx`: 334 dòng, `ScheduleChangeMakeupModal.tsx`: 260 dòng, `ExternalDeliveryModal.tsx`: 255 dòng, `WorkerEmergencyLeaveModal.tsx`: 252 dòng) | Nhiều file vượt ngưỡng độ dài `< 250–300` dòng (và vượt giới hạn từng file ghi trong Plan 71). | Tách sub-component/helper cho các modal FE và tách helper tính toán/validate cho `worker-schedules.service.ts` để giữ mỗi file gọn `< 250` dòng. |
| R6 | Minor | `be-nestjs-thanhxuan/src/modules/internal/worker-schedules/worker-schedules.controller.ts:54-55` | Fallback `query.year || new Date().getFullYear()` và `query.weekNumber || 1` dùng `new Date()` thay vì helper ngày VN (`date.util.ts`) và mặc định tuần 1 thay vì tuần hiện tại. | Dùng `getDatePartsVN()` để lấy năm/tuần ISO hiện tại làm giá trị mặc định. |

## 4. Kết quả Verification

| Lệnh | Kết quả | Khớp với báo cáo của Executor? |
| :--- | :--- | :--- |
| `be-nestjs-thanhxuan`: `pnpm exec tsc --noEmit` | Pass (exit 0) | Khớp |
| `be-nestjs-thanhxuan`: `pnpm lint` | Fail (exit 1 — 645 errors, 74 warnings toàn repo) | Executor không báo cáo chạy `pnpm lint` |
| `be-nestjs-thanhxuan`: `pnpm test` (toàn bộ) | Fail (52/54 suites, 240/253 tests — **4 tests fail tại `schedule-task.service.spec.ts` do Plan 71**, 9 tests fail sẵn tại `accounts.service.spec.ts`) | Executor chỉ chạy test lẻ `external-deliveries` & `worker-schedules` |
| `be-nestjs-thanhxuan`: `pnpm test -- external-deliveries` | Pass (1/1 suite, 3/3 tests) | Khớp |
| `be-nestjs-thanhxuan`: `pnpm test -- worker-schedules` | Pass (1/1 suite, 6/6 tests) | Khớp |
| `be-nestjs-thanhxuan`: `pnpm build` | Pass (exit 0) | Khớp |
| `fe-react-thanhxuan-internal`: `pnpm exec tsc -b && pnpm build` | Pass (`tsc -b` + `vite build` thành công) | Khớp |

## 5. Kiểm tra tài liệu (5 Trụ cột)

- `DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`: Đều đã được cập nhật trong commit `47465f8`. (Lưu ý nhỏ: `SRS_SDD.md` có 3 dòng Document History của Plan 69–71 bị lặp ở dòng 185–187 và 208–210).

## 6. Open Questions

- Không có.

## 7. Verdict & bước tiếp theo

- **Verdict:** **Request changes** (3 Blocker, 2 Major, 1 Minor).
- **Bước tiếp theo:** Chạy `/act` để sửa ngay `R1` (bổ sung kênh `workshop_workers` trong `NotificationsService`), `R2` (gắn `RolesGuard`/`@Roles` cho `ExternalDeliveriesController` và `WorkerSchedulesController`), `R3` (sửa `schedule-task.service.spec.ts`), cùng `R4`–`R6`.
