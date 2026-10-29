# Plan 41: Quét Địa Chỉ IP Wi-Fi Xưởng & Màn Hình Admin Cài Đặt Vị Trí / IP Wi-Fi Xưởng

> Status: Done | Created: 2026-10-26 | Completed: 2026-10-26

## 1. Overview & Affected Files

### 1.1. Mục tiêu
Mở rộng cơ chế kiểm soát gian lận điểm danh ([Plan 38](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/plans/plan38.md)) bằng cách **kết hợp quét địa chỉ IP Wi-Fi Router xưởng** và **xây dựng màn hình Cài Đặt Xưởng cho Admin**:
1. **Quét địa chỉ IP khi Check-in / Check-out:**
   - Backend tự động trích xuất IP Public của thiết bị gửi request (`x-forwarded-for` / `req.ip`).
   - Đối chiếu với danh sách IP Wi-Fi xưởng được Admin cấu hình.
   - Lưu trữ `clientIp`, `isWorkshopWifi` và gắn cờ cảnh báo `isSuspiciousIp` vào lịch sử chấm công.
   - Hỗ trợ 2 chế độ:
     - **Chế độ Bắt buộc Wi-Fi (`isWifiRequired: true`):** Chặn tuyệt đối nếu không kết nối đúng mạng Wi-Fi xưởng.
     - **Chế độ Cảnh báo mềm (`isWifiRequired: false`):** Cho phép chấm công bằng 4G/mạng khác nhưng gắn cờ cảnh báo để Quản lý đối soát trên bảng công.
2. **Màn hình Admin Cài Đặt Vị Trí & IP Wi-Fi Xưởng (`/management/admin/workshop`):**
   - Thêm menu trên Sidebar dành riêng cho vai trò `ADMIN`.
   - Cài đặt Tọa độ xưởng (Latitude, Longitude), Bán kính cho phép (Radius Meters).
   - Nút tiện ích "Lấy vị trí hiện tại của tôi" (GPS 1 chạm cho Admin khi đang đứng ở xưởng).
   - Quản lý danh sách IP Wi-Fi xưởng (Thêm / Xóa).
   - Nút tiện ích "Thêm IP mạng hiện tại" (tự động nhận diện IP mạng xưởng Admin đang kết nối để lưu 1 chạm).
   - Cấu hình các công tắc bảo mật (`isGpsRequired`, `isWifiRequired`, `maxAccuracyMeters`).
3. **Hiển thị & Giám sát:**
   - Thợ xưởng trên [AttendancePage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/attendance/AttendancePage.tsx) thấy trạng thái mạng (Wi-Fi xưởng / 4G).
   - Quản lý trên [AttendanceReviewPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/attendance/AttendanceReviewPage.tsx) thấy rõ IP và nhãn mạng của từng ca.

---

### 1.2. Danh sách file bị ảnh hưởng

#### Backend (`be-nestjs-thanhxuan/`)
- `src/modules/internal/attendance/schemas/workshop-settings.schema.ts` (Mới): Schema lưu trữ cấu hình tọa độ và danh sách IP Wi-Fi xưởng.
- `src/modules/internal/attendance/repositories/workshop-settings.repository.ts` (Mới): Repository thao tác dữ liệu cấu hình xưởng.
- `src/modules/internal/attendance/dto/update-workshop-settings.dto.ts` (Mới): DTO cập nhật cấu hình xưởng.
- `src/modules/internal/attendance/schemas/attendance-record.schema.ts`: Mở rộng `CheckInInfo` và `CheckOutInfo` lưu `clientIp`, `isWorkshopWifi`, `isSuspiciousIp`.
- `src/modules/internal/attendance/attendance.service.ts`:
  - Lấy và cập nhật cấu hình xưởng (`getWorkshopSettings`, `updateWorkshopSettings`).
  - Đọc IP, đối chiếu Wi-Fi xưởng trong `checkIn()` và `checkOut()`.
- `src/modules/internal/attendance/attendance.controller.ts`:
  - Thêm endpoint `GET /attendance/workshop-config` (Public/Staff lấy tọa độ và trạng thái mạng).
  - Thêm endpoint `PUT /attendance/workshop-config` (Chỉ ADMIN cập nhật cấu hình).
  - Thêm endpoint `GET /attendance/my-ip` (Lấy IP public hiện tại của client).
- `src/modules/internal/attendance/attendance.module.ts`: Khai báo `WorkshopSettingsSchema` và `WorkshopSettingsRepository`.
- `src/modules/internal/attendance/specs/attendance-wifi.spec.ts` (Mới): Unit test kiểm tra luồng quét IP Wi-Fi xưởng.

#### Frontend Internal (`fe-react-thanhxuan-internal/`)
- `src/types/index.ts`: Bổ sung interface `WorkshopSettings`, cập nhật `AttendanceCheckInfo`.
- `src/components/layout/nav-config.ts`: Thêm menu "Cấu Hình Xưởng & Wi-Fi" (`/management/admin/workshop`) cho `StaffRole.ADMIN`.
- `src/app/router.tsx`: Khai báo route `/management/admin/workshop`.
- `src/app/(internal)/management/admin/workshop.tsx` (Mới): Route page wrapper.
- `src/features/management/workshop/WorkshopSettingsPage.tsx` (Mới): Màn hình cấu hình vị trí xưởng và IP Wi-Fi cho Admin (< 250 dòng).
- `src/features/management/workshop/hooks/useWorkshopSettings.ts` (Mới): Custom hook quản lý query/mutation cấu hình xưởng và lấy IP hiện tại.
- `src/features/operations/attendance/hooks/useWorkshopGeo.ts`: Đọc cấu hình tọa độ động từ Backend thay vì hardcode.
- `src/features/operations/attendance/AttendancePage.tsx`: Hiển thị badge trạng thái kết nối Wi-Fi xưởng.
- `src/features/management/attendance/AttendanceReviewPage.tsx`: Hiển thị chi tiết IP và badge Wi-Fi xưởng / 4G trong modal duyệt ca.

---

## 2. Technical Architecture & Design Decisions

### 2.1. Cấu trúc Schema `WorkshopSettings` (`internal_express`)
```typescript
@Schema({ timestamps: true, collection: 'workshop_settings' })
export class WorkshopSettings {
  @Prop({ default: 'Xưởng Giặt Thanh Xuân', trim: true })
  workshopName!: string;

  @Prop({ default: 20.99824 })
  latitude!: number;

  @Prop({ default: 105.80153 })
  longitude!: number;

  @Prop({ default: 150, min: 10 })
  radiusMeters!: number;

  @Prop({ default: 150, min: 10 })
  maxAccuracyMeters!: number;

  @Prop({ type: [String], default: [] })
  wifiIps!: string[]; // Danh sách IP Public của modem Wi-Fi xưởng

  @Prop({ default: true })
  isGpsRequired!: boolean;

  @Prop({ default: false })
  isWifiRequired!: boolean; // Bắt buộc Wi-Fi xưởng mới được điểm danh

  @Prop({ default: false })
  ipStrictCheck!: boolean; // Ném lỗi khi sai IP nếu bật
}
```

### 2.2. Thuật toán trích xuất Client IP an toàn
```typescript
export function extractClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || req.ip || '';
}
```

### 2.3. Quy tắc thẩm định Wi-Fi & IP
1. **So khớp IP Wi-Fi:**
   - Trích xuất `clientIp`.
   - Kiểm tra `isWorkshopWifi = settings.wifiIps.includes(clientIp)`.
2. **Xử lý vi phạm:**
   - Nếu `settings.isWifiRequired === true` VÀ `!isWorkshopWifi`:
     Ném `BadRequestException`: `Vui lòng kết nối vào mạng Wi-Fi của xưởng để điểm danh. Địa chỉ IP mạng hiện tại (${clientIp}) không thuộc danh sách Wi-Fi xưởng.`
   - Nếu `isWifiRequired === false` (chế độ linh hoạt):
     Ghi nhận `isWorkshopWifi = false` và `isSuspiciousIp = true` để Quản lý đối soát trên bảng công.

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Backend Quét IP & Cấu Hình Xưởng
- [x] **T1**: Tạo Schema `src/modules/internal/attendance/schemas/workshop-settings.schema.ts` và Repository `workshop-settings.repository.ts`.
- [x] **T2**: Cập nhật `attendance-record.schema.ts` thêm `clientIp`, `isWorkshopWifi`, `isSuspiciousIp` vào `CheckInInfo` và `CheckOutInfo`.
- [x] **T3**: Tạo DTO `update-workshop-settings.dto.ts` với đầy đủ validation `@IsNumber`, `@IsArray`, `@IsBoolean`.
- [x] **T4**: Cập nhật `attendance.service.ts`:
  - `getWorkshopConfig()`: Đọc từ database, tự động khởi tạo bản ghi mặc định nếu chưa có.
  - `updateWorkshopConfig(dto)`: Cập nhật cấu hình và ghi audit log.
  - Tích hợp kiểm tra IP trong `checkIn(workerId, dto, clientIp)` và `checkOut(workerId, dto, clientIp)`.
- [x] **T5**: Cập nhật `attendance.controller.ts`:
  - Thêm `GET /attendance/workshop-config`, `PUT /attendance/workshop-config`, `GET /attendance/my-ip`.
  - Truyền `clientIp` trích xuất từ request vào service `checkIn` và `checkOut`.
- [x] **T6**: Viết unit test `attendance-wifi.spec.ts` kiểm chứng kiểm tra IP Wi-Fi xưởng (hợp lệ, sai IP khi bắt buộc, sai IP khi cảnh báo mềm).

---

### Giai đoạn 2: Frontend Admin Cài Đặt Xưởng & UI Giám Sát
- [x] **T7**: Cập nhật types trong `fe-react-thanhxuan-internal/src/types/index.ts` (`WorkshopSettings`, `AttendanceCheckInfo`).
- [x] **T8**: Tạo hook `src/features/management/workshop/hooks/useWorkshopSettings.ts`:
  - Query cấu hình xưởng từ `GET /attendance/workshop-config`.
  - Query IP hiện tại từ `GET /attendance/my-ip`.
  - Mutation lưu cấu hình qua `PUT /attendance/workshop-config`.
- [x] **T9**: Tạo giao diện Admin `src/features/management/workshop/WorkshopSettingsPage.tsx`:
  - Card 1: Vị trí GPS xưởng & Bán kính (kèm nút "Lấy vị trí hiện tại của tôi").
  - Card 2: Danh sách IP Wi-Fi xưởng (Thêm/xóa IP, nút "Thêm IP mạng hiện tại").
  - Card 3: Công tắc bảo mật (`isGpsRequired`, `isWifiRequired`).
- [x] **T10**: Đăng ký route `/management/admin/workshop` trong `nav-config.ts` (nhóm `business-ops`, quyền `ADMIN`) và `router.tsx`.
- [x] **T11**: Cập nhật `useWorkshopGeo.ts` và `AttendancePage.tsx`:
  - Fetch cấu hình tọa độ động từ Backend.
  - Hiển thị badge trạng thái mạng Wi-Fi xưởng.
- [x] **T12**: Cập nhật `AttendanceReviewPage.tsx`:
  - Hiển thị thông tin IP và badge Wi-Fi xưởng trên bảng công.
- [x] **T13**: Frontend verify: `pnpm exec tsc --noEmit` và `pnpm build`.

---

### Giai đoạn 3: Tài liệu & Hoàn tất
- [x] **T14**: Cập nhật đồng bộ 5 trụ cột tài liệu (`DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CHANGELOG.md`).
- [x] **T15**: Tự động commit và push lên nhánh `dev`.
