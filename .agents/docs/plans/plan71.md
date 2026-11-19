# Plan 71: Giai Đoạn 3 - Xây Dựng Phân Hệ Giao Ngoài Cho Shipper & Quản Lý Lịch Làm Việc / Nghỉ Phép Thợ Xưởng (Yêu Cầu 5b & 6)

> Status: Done | Created: 2026-11-19 | Hệ thống: be-nestjs-thanhxuan & fe-react-thanhxuan-internal

---

## 1. Overview & Affected Files

### 1.1. Mục Tiêu & Phạm Vi
- **Mục tiêu:** Xây dựng 2 phân hệ hoàn toàn mới phục vụ công tác điều hành thực tế tại xưởng và đội ngũ giao vận:
  1. *(Yêu cầu 5b)*: **Phân hệ Giao Ngoài cho Tài xế Shipper:** Giao nhận đồ vải tại các điểm ngoài đối tác cố định (Haidilao, Cầu Gỗ, KTX sinh viên/công nhân...) với quy trình siêu tinh gọn: chỉ cần chọn Ngày + Tên điểm giao + Chụp ảnh giao nhận hoàn tất.
  2. *(Yêu cầu 6)*: **Phân hệ Quản Lý Lịch Làm Việc & Nghỉ Phép Cho Thợ Xưởng (`WORKER`):**
     - Đăng ký lịch làm việc hàng tuần vào lúc 20:00 tối Chủ Nhật hàng tuần (có thông báo đẩy/in-app tự động nhảy): mỗi ngày chọn ca (Sáng, Chiều, Tối) và nhập khung giờ làm việc từ mấy giờ đến mấy giờ.
     - Thay đổi lịch đăng ký: Ràng buộc nguyên tắc công nghiệp: hôm nào xin nghỉ phải đăng ký làm bù một ca khác trong cùng tuần đó.
     - Đơn xin nghỉ đột xuất: Khai báo số ngày nghỉ, lý do nghỉ và bắt buộc đính kèm ảnh chứng từ/giấy phép.
- **Out of scope:** Không can thiệp vào cách tính công thợ theo phút hiện có (`Piecework`). Lịch làm việc đóng vai trò kế hoạch phân ca và đối soát chuyên cần.

### 1.2. Assumptions & Open Questions
- **Assumptions:**
  - 3 ca chuẩn của xưởng: Ca Sáng (thường 07:00 - 11:30), Ca Chiều (13:00 - 17:30), Ca Tối (18:00 - 22:30). Công nhân có thể tự điều chỉnh khung giờ cụ thể khi đăng ký.
  - Tuần làm việc tính từ Thứ 2 đến Chủ Nhật. Lịch làm bù phải nằm trong phạm vi cùng tuần (thứ 2 đến CN của tuần đó).
- **Open Questions:** Quản lý xưởng (`MANAGER`) là người duyệt đơn xin nghỉ đột xuất và phê duyệt lịch tuần của thợ.

### 1.3. Bảng File Ảnh Hưởng
| Path | Action | Lý do |
| :--- | :---: | :--- |
| `backend-thanhxuan/src/modules/internal/external-deliveries/schemas/external-delivery.schema.ts` | Add | Schema lưu các chuyến giao ngoài (ngày, điểm giao, ảnh, shipper) |
| `backend-thanhxuan/src/modules/internal/external-deliveries/external-deliveries.module.ts` | Add | Module NestJS quản lý giao ngoài |
| `backend-thanhxuan/src/modules/internal/external-deliveries/external-deliveries.service.ts` | Add | Xử lý upload ảnh Cloudinary và lưu dữ liệu giao ngoài |
| `backend-thanhxuan/src/modules/internal/external-deliveries/external-deliveries.controller.ts` | Add | API `POST /external-deliveries` & `GET /external-deliveries` |
| `backend-thanhxuan/src/modules/internal/worker-schedules/schemas/worker-schedule.schema.ts` | Add | Schema lưu lịch đăng ký 7 ngày trong tuần theo ca & giờ |
| `backend-thanhxuan/src/modules/internal/worker-schedules/schemas/worker-leave.schema.ts` | Add | Schema đơn xin nghỉ đột xuất của thợ kèm ảnh chứng từ |
| `backend-thanhxuan/src/modules/internal/worker-schedules/worker-schedules.module.ts` | Add | Module NestJS quản lý lịch thợ và nghỉ phép |
| `backend-thanhxuan/src/modules/internal/worker-schedules/worker-schedules.service.ts` | Add | Nghiệp vụ đăng ký lịch tuần, validation làm bù và đơn nghỉ phép |
| `backend-thanhxuan/src/modules/internal/worker-schedules/worker-schedules.controller.ts` | Add | API đăng ký lịch, sửa lịch bù và xin nghỉ đột xuất |
| `backend-thanhxuan/src/modules/core/schedule/schedule-task.service.ts` | Edit | Thêm Cron Job lúc 20:00 tối Chủ Nhật bắn thông báo cho tài khoản `WORKER` |
| `backend-thanhxuan/src/modules/internal/internal.module.ts` | Edit | Import 2 module mới vào InternalModule |
| `thanhxuan-internal/src/features/operations/handovers/ShipperHandoverPage.tsx` | Edit | Thêm Tab hoặc Nút mở Modal "Giao Ngoài" cho Shipper |
| `thanhxuan-internal/src/features/operations/handovers/modals/ExternalDeliveryModal.tsx` | Add | Modal tạo phiếu giao ngoài (chọn điểm, chụp ảnh, bấm lưu) |
| `thanhxuan-internal/src/features/operations/handovers/components/ExternalDeliveryListTabComponent.tsx` | Add | Tab danh sách các chuyến giao ngoài đã thực hiện trong ngày |
| `thanhxuan-internal/src/features/operations/worker-schedule/WorkerSchedulePage.tsx` | Add | Màn hình Quản lý lịch làm việc & nghỉ phép cho Thợ xưởng |
| `thanhxuan-internal/src/features/operations/worker-schedule/modals/WeeklyScheduleRegisterModal.tsx` | Add | Modal đăng ký lịch 7 ngày (3 ca, khung giờ linh hoạt) |
| `thanhxuan-internal/src/features/operations/worker-schedule/modals/ScheduleChangeMakeupModal.tsx` | Add | Modal đổi lịch nghỉ kèm bắt buộc chọn ca làm bù |
| `thanhxuan-internal/src/features/operations/worker-schedule/modals/WorkerEmergencyLeaveModal.tsx` | Add | Modal xin nghỉ đột xuất có ô tải ảnh chứng từ |
| `thanhxuan-internal/src/features/operations/worker-schedule/hooks/useWorkerSchedule.ts` | Add | Hook quản lý state lịch làm việc và mutation |
| `thanhxuan-internal/src/app/router.tsx` | Edit | Đăng ký route `operations/worker/schedule` |
| `thanhxuan-internal/src/components/layout/Sidebar.tsx` | Edit | Thêm menu "Lịch Làm Việc" cho vai trò `WORKER` và `MANAGER` |
| `.agents/docs/DATABASE_DICTIONARY.md` | Edit | Bổ sung 3 collection mới: `external_deliveries`, `worker_weekly_schedules`, `worker_leave_requests` |
| `.agents/docs/CODEBASE_ATLAS.md` | Edit | Đăng ký các route, endpoint và service mới |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | Edit | Cập nhật kiến trúc 2 module mới |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | Edit | Cập nhật đặc tả giao diện Giao Ngoài và Lịch thợ xưởng |
| `.agents/docs/CHANGELOG.md` | Edit | Ghi nhật ký triển khai Plan 71 |

---

## 2. Technical Approach

### 2.1. Cấu Trúc Dữ Liệu Phân Hệ Giao Ngoài (External Deliveries)
```typescript
@Schema({ timestamps: true, collection: 'external_deliveries' })
export class ExternalDelivery {
  @Prop({ required: true })
  deliveryDate: string; // YYYY-MM-DD

  @Prop({ required: true, trim: true })
  spotName: string; // "Haidilao Landmark", "Cầu Gỗ", "KTX Mễ Trì"...

  @Prop({ type: SchemaTypes.ObjectId, ref: 'StaffAccount', required: true })
  shipperId: Types.ObjectId;

  @Prop({ required: true })
  shipperName: string;

  @Prop({ required: true })
  photoUrl: string; // Ảnh chụp giao nhận bàn giao

  @Prop({ trim: true })
  note?: string;

  @Prop({ default: 'COMPLETED' })
  status: 'COMPLETED';
}
```

### 2.2. Cấu Trúc Dữ Liệu Lịch Thợ Xưởng & Xin Nghỉ (Worker Schedules & Leaves)
```typescript
export interface ShiftTimeSlot {
  shiftType: 'MORNING' | 'AFTERNOON' | 'EVENING';
  isRegistered: boolean;
  startTime: string; // "07:00"
  endTime: string;   // "11:30"
  isMakeupShift?: boolean; // Ca làm bù
  makeupForDate?: string;  // Làm bù cho ngày nào
}

@Schema({ timestamps: true, collection: 'worker_weekly_schedules' })
export class WorkerWeeklySchedule {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'StaffAccount', required: true })
  workerId: Types.ObjectId;

  @Prop({ required: true })
  weekNumber: number; // Tuần thứ mấy trong năm

  @Prop({ required: true })
  year: number;

  @Prop({ type: Object, required: true })
  days: Record<string, ShiftTimeSlot[]>; // key: "2026-11-23" -> mảng 3 ca
}

@Schema({ timestamps: true, collection: 'worker_leave_requests' })
export class WorkerLeaveRequest {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'StaffAccount', required: true })
  workerId: Types.ObjectId;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ required: true })
  totalDays: number;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({ required: true })
  photoUrl: string; // Bắt buộc ảnh đính kèm giấy khám bệnh / đơn phép

  @Prop({ enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

---

## 3. Implementation Tasks (Checklist)

### Phần A: Phân Hệ Giao Ngoài Cho Shipper (Mục 5b)
- [x] T1: Xây dựng Module `external-deliveries` trong backend: Schema, Repository, Service và Controller (`POST /`, `GET /`) kèm guard Shipper - Depends on: none
- [x] T2: Tạo modal `ExternalDeliveryModal.tsx` (< 200 dòng): Chọn ngày (mặc định hôm nay), nhập/chọn điểm giao (Haidilao, Cầu Gỗ, KTX...), camera chụp/upload ảnh giao nhận lên Cloudinary - Depends on: T1
- [x] T3: Tạo sub-component `ExternalDeliveryListTabComponent.tsx` (< 200 dòng): hiển thị lưới ảnh các chuyến giao ngoài trong ngày - Depends on: T1
- [x] T4: Tích hợp nút "Giao Ngoài" và tab danh sách giao ngoài vào `ShipperHandoverPage.tsx` - Depends on: T2, T3

### Phần B: Phân Hệ Lịch Làm Việc & Nghỉ Phép Thợ Xưởng (Mục 6)
- [x] T5: Xây dựng Module `worker-schedules` trong backend: Schema `WorkerWeeklySchedule` và `WorkerLeaveRequest`, Repository, Service và Controller - Depends on: none
- [x] T6: Cài đặt logic ràng buộc đổi lịch trong Service: nếu đổi 1 ca sang nghỉ, bắt buộc `makeupShift` phải hợp lệ trong cùng tuần mới cho phép lưu - Depends on: T5
- [x] T7: Viết Cron Job trong `schedule-task.service.ts`: kích hoạt lúc 20:00 tối Chủ Nhật (`0 20 * * 0`), quét tất cả tài khoản `WORKER` đang `ACTIVE` và gửi Notification nhắc đăng ký lịch tuần mới - Depends on: T5
- [x] T8: Tạo modal `WeeklyScheduleRegisterModal.tsx` (< 250 dòng): Form đăng ký 7 ngày từ Thứ 2 đến CN, toggle chọn 3 ca Sáng/Chiều/Tối, 2 input giờ bắt đầu và kết thúc - Depends on: T5
- [x] T9: Tạo modal `ScheduleChangeMakeupModal.tsx` (< 220 dòng): Giao diện đổi lịch làm bù trực quan, chọn ca nghỉ và ca bù tương ứng - Depends on: T6
- [x] T10: Tạo modal `WorkerEmergencyLeaveModal.tsx` (< 220 dòng): Chọn ngày nghỉ, số ngày, lý do và khung camera chụp/tải ảnh đính kèm - Depends on: T5
- [x] T11: Xây dựng màn hình `WorkerSchedulePage.tsx` (< 250 dòng) và custom hook `useWorkerSchedule.ts` (< 220 dòng): hiển thị lịch tuần cá nhân, trạng thái duyệt và nút mở các modal - Depends on: T8, T9, T10
- [x] T12: Thêm giao diện duyệt đơn xin nghỉ và quản lý lịch thợ cho Quản lý xưởng (`MANAGER`) - Depends on: T11
- [x] T13: Đăng ký route và sidebar menu cho `WorkerSchedulePage` trong `router.tsx` và `Sidebar.tsx` - Depends on: T11

### Phần C: Kiểm Thử & Đồng Bộ Tài Liệu
- [x] T14: Viết unit test backend cho `external-deliveries.service.spec.ts` và `worker-schedules.service.spec.ts` - Depends on: T1, T5, T6
- [x] T15: Kiểm thử luồng Shipper giao ngoài: chụp ảnh $\rightarrow$ lưu thành công $\rightarrow$ hiển thị thẻ ảnh trên di động - Depends on: T4
- [x] T16: Kiểm thử luồng Thợ xưởng: nhận thông báo 20h CN $\rightarrow$ đăng ký 3 ca $\rightarrow$ đổi ca nghỉ có chọn ca bù $\rightarrow$ nộp đơn xin nghỉ kèm ảnh - Depends on: T13
- [x] T17: Đồng bộ 5 trụ cột tài liệu: `DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `CHANGELOG.md` - Depends on: T15, T16

---

## 4. Verification & Testing

- **Backend:** `pnpm exec tsc --noEmit && pnpm test -- external-deliveries && pnpm test -- worker-schedules`
- **Frontend:** `pnpm exec tsc --noEmit && pnpm build`
- **Definition of Done:**
  - Shipper mở tab Giao Ngoài: chụp ảnh giao tại Haidilao, lưu trong 2 giây, ảnh nét trên Cloudinary.
  - Thợ xưởng mở Đăng ký lịch tuần: chọn các ca sáng/chiều/tối từ giờ đến giờ, lưu thành công.
  - Thợ xin đổi ca nghỉ: nếu không chọn ca bù thì hệ thống báo lỗi chặn lại; khi chọn ca bù trong tuần thì lưu thành công.
  - Thợ nộp đơn xin nghỉ đột xuất: bắt buộc phải có ảnh đính kèm; Quản lý xưởng xem được đơn và bấm Duyệt/Từ chối.

---

## 5. Risks & Rollback

- **Rủi ro:** Công nhân có thể quên đăng ký lịch nếu không mở app vào tối Chủ Nhật.
- **Giảm thiểu:** Bắn thông báo realtime đồng thời gửi nhắc nhở qua WebSocket / In-App Notification. Quản lý xưởng có màn hình giám sát để nhắc nhở những ai chưa đăng ký trước 08:00 sáng Thứ Hai.

---

## Changelog

- 2026-11-19: Khởi tạo Plan 71 cho phân hệ Giao ngoài và Lịch thợ xưởng giai đoạn 3.
