# Plan 38: Quét Vị Trí Geofencing & Chống Gian Lận Fake GPS Điểm Danh Xưởng

> Status: Done | Created: 2026-10-26 | Completed: 2026-10-26

## 1. Overview & Affected Files

### 1.1. Mục tiêu
Triển khai cơ chế xác thực vị trí địa lý bắt buộc khi thợ xưởng/nhân viên bấm **Check-in (Vào ca)** và **Check-out (Hết ca)** tại [AttendancePage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/attendance/AttendancePage.tsx) nhằm:
1. **Đảm bảo hiện diện thực tế tại xưởng (Geofencing):** Chỉ cho phép chấm công khi khoảng cách giữa thiết bị và tọa độ xưởng $\le R$ (mặc định 150m).
2. **Ngăn chặn triệt để gian lận Fake GPS:**
   - Phát hiện các ứng dụng giả lập vị trí thông qua phân tích đặc trưng tín hiệu GPS (`accuracy <= 0`, mock accuracy cố định, độ trôi vi mô GPS drift).
   - Chặn vị trí replay/giả mạo (`timestamp` lệch quá 15 giây).
   - Yêu cầu quyền GPS phần cứng độ chính xác cao (`enableHighAccuracy: true`).
3. **Cấu hình linh hoạt:** Cho phép quản trị viên cấu hình Tọa độ Xưởng (Lat, Lng) và Bán kính cho phép qua biến môi trường (`.env`) kết hợp fallback an toàn trong Cài đặt hệ thống.
4. **Minh bạch thông tin & Giám sát quản lý:** Hiển thị khoảng cách thực tế và sai số GPS trên màn hình xem xét chấm công của Quản lý ([AttendanceReviewPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/attendance/AttendanceReviewPage.tsx)).

---

### 1.2. Danh sách file bị ảnh hưởng

#### Backend (`be-nestjs-thanhxuan/`)
- `src/common/utils/geo.util.ts` (Mới): Tiện ích tính khoảng cách Haversine và thuật toán thẩm định Fake GPS.
- `src/modules/internal/attendance/dto/check-in.dto.ts`: Cập nhật `GpsLocationDto` (thêm `accuracy`, `altitude`, `speed`, `timestamp`).
- `src/modules/internal/attendance/dto/check-out.dto.ts`: Bổ sung trường `gps` tương tự CheckIn.
- `src/modules/internal/attendance/schemas/attendance-record.schema.ts`: Mở rộng `GpsLocation` lưu `accuracy`, `distanceMeters`, `isVerifiedLocation`.
- `src/modules/internal/attendance/attendance.service.ts`: Inject config/tọa độ xưởng, gọi xác thực Geofencing & Fake GPS detector trước khi ghi nhận check-in/check-out.
- `src/modules/internal/attendance/specs/attendance-geo.spec.ts` (Mới): Unit test thuật toán Geofencing và bộ lọc Fake GPS.

#### Frontend Internal (`fe-react-thanhxuan-internal/`)
- `src/types/index.ts`: Cập nhật interface `GpsLocation` và `AttendanceLog`.
- `src/features/operations/attendance/hooks/useWorkshopGeo.ts` (Mới): Custom hook lấy GPS chính xác cao, đo độ trôi vi mô (drift sampling) và phát hiện Fake GPS phía client.
- `src/features/operations/attendance/AttendancePage.tsx`: Tích hợp trạng thái GPS trực quan (badge khoảng cách, sai số), gọi GPS khi chụp ảnh/bấm nút, chặn submit nếu ngoài phạm vi.
- `src/features/management/attendance/AttendanceReviewPage.tsx`: Hiển thị khoảng cách tới xưởng và tọa độ GPS của từng lượt check-in/out để Quản lý đối soát.

#### Cấu hình & Môi trường
- `be-nestjs-thanhxuan/.env.example`: Thêm `WORKSHOP_LATITUDE`, `WORKSHOP_LONGITUDE`, `WORKSHOP_RADIUS_METERS`.

---

## 2. Technical Architecture & Design Decisions

### 2.1. Tọa độ Xưởng & Bán kính mặc định
- Tọa độ Xưởng Giặt Thanh Xuân (cấu hình trong `.env` hoặc fallback):
  - `WORKSHOP_LATITUDE`: `20.99824`
  - `WORKSHOP_LONGITUDE`: `105.80153`
  - `WORKSHOP_RADIUS_METERS`: `150` (bù trừ sai số trần tôn nhà xưởng và thời tiết)

### 2.2. Thuật toán Haversine Formula
Khoảng cách thực địa đường chim bay giữa hai điểm:
$$\Delta\phi = \frac{(\text{lat}_2 - \text{lat}_1)\pi}{180}, \quad \Delta\lambda = \frac{(\text{lon}_2 - \text{lon}_1)\pi}{180}$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$d = 2 \cdot R_{\text{earth}} \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a})$$
với $R_{\text{earth}} = 6,371,000 \text{ mét}$.

### 2.3. Bộ quy tắc Nhận diện Fake GPS (Anti-Spoofing Rules)
1. **Rule 1: Accuracy Integrity**
   - Nếu `accuracy <= 0` $\rightarrow$ Từ chối ngay (App Fake GPS thường gán 0).
   - Nếu `accuracy > 150m` $\rightarrow$ Từ chối và yêu cầu ra khu vực thoáng để bắt sóng GPS thực (tránh định vị ước lượng qua tháp sóng di động Cell-ID).
2. **Rule 2: Timestamp Freshness**
   - Đối chiếu chênh lệch giữa thời gian GPS thiết bị trả về (`timestamp`) và giờ server:
     $$|\text{ServerTime} - \text{GpsTimestamp}| \le 15,000\text{ ms}$$
   - Chống tấn công Replay vị trí cũ đã lưu sẵn.
3. **Rule 3: GPS Drift Sampling (Phía Client)**
   - Hàm `useWorkshopGeo` lấy 2 mẫu tọa độ cách nhau 1.5 giây.
   - Nếu cả 2 mẫu có tọa độ bằng nhau tuyệt đối đến 8 chữ số thập phân (`lat1 === lat2 && lng1 === lng2` với `speed === 0`) trong điều kiện thiết bị cầm tay $\rightarrow$ Cảnh báo vị trí tĩnh bất thường từ app giả lập.

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Backend Geofencing & Anti-Fake GPS
- [x] **T1**: Tạo utility `src/common/utils/geo.util.ts`:
  - Hàm `calculateDistanceMeters(lat1, lon1, lat2, lon2): number`
  - Hàm `validateGpsSignal(gps, workshopConfig): { isValid: boolean; reason?: string; distanceMeters: number }`
- [x] **T2**: Viết unit test `src/common/utils/geo.util.spec.ts` kiểm chứng:
  - Tọa độ đúng trong bán kính 150m $\rightarrow$ Hợp lệ.
  - Tọa độ cách 160m $\rightarrow$ Từ chối.
  - `accuracy = 0` hoặc âm $\rightarrow$ Từ chối.
  - `timestamp` quá hạn 20s $\rightarrow$ Từ chối.
- [x] **T3**: Cập nhật DTO `check-in.dto.ts` và `check-out.dto.ts`:
  - `GpsLocationDto` thêm `@IsNumber()` cho `accuracy`, `timestamp`, `altitude`, `speed`.
  - CheckOutDto nhận thêm `gps?: GpsLocationDto`.
- [x] **T4**: Cập nhật `attendance-record.schema.ts`:
  - `GpsLocation` lưu thêm `accuracy`, `distanceMeters`.
- [x] **T5**: Cập nhật `attendance.service.ts`:
  - Tích hợp `validateGpsSignal` vào `checkIn()` và `checkOut()`.
  - Throw `BadRequestException` khi vi phạm vị trí kèm số mét cụ thể.
  - Ghi nhận `distanceMeters` vào record.
- [x] **T6**: Backend verify: `pnpm exec tsc --noEmit` & `pnpm test`.

---

### Giai đoạn 2: Frontend PWA Client Geolocation & UI
- [x] **T7**: Cập nhật TypeScript types trong `fe-react-thanhxuan-internal/src/types/index.ts`.
- [x] **T8**: Tạo custom hook `src/features/operations/attendance/hooks/useWorkshopGeo.ts`:
  - Quản lý trạng thái xin quyền vị trí (`granted`, `prompt`, `denied`).
  - Hàm `acquireVerifiedLocation()` chạy `navigator.geolocation.getCurrentPosition` độ chính xác cao.
  - Tính toán khoảng cách tạm tính đến xưởng phía client để phản hồi tức thì cho thợ.
- [x] **T9**: Nâng cấp UI [AttendancePage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/attendance/AttendancePage.tsx):
  - Hiển thị Widget vị trí GPS: Icon vệ tinh, Trạng thái (Đang quét / Đã định vị / Ngoài phạm vi xưởng).
  - Tự động lấy vị trí khi mở trang hoặc khi bấm chụp ảnh selfie.
  - Disable nút Check-in / Check-out nếu đang ngoài bán kính xưởng hoặc chưa bật GPS.
  - Gửi đầy đủ payload GPS trong `checkInMutation` và `checkOutMutation`.
- [x] **T10**: Nâng cấp màn hình Quản lý [AttendanceReviewPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/attendance/AttendanceReviewPage.tsx):
  - Hiển thị badge khoảng cách điểm danh (VD: `Tại xưởng: 35m`, `Sai số GPS: ±8m`).
- [x] **T11**: Frontend verify: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`.

---

### Giai đoạn 3: Tài liệu & Hoàn tất
- [x] **T12**: Cập nhật đồng bộ 5 trụ cột tài liệu (`DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `CHANGELOG.md`).
- [x] **T13**: Commit và push lên nhánh `dev`.

---

## 4. Risks & Mitigations

| Rủi ro | Mức độ | Biện pháp giảm thiểu |
| :--- | :---: | :--- |
| **Thợ đứng trong xưởng mái tôn bị suy hao GPS** | Trung bình | Đặt bán kính dung sai hợp lý ($150m$ thay vì $50m$); cho phép thử lại với timeout 12 giây. |
| **Trình duyệt Safari/Chrome chặn quyền vị trí** | Trung bình | Hook `useWorkshopGeo` bắt lỗi `PERMISSION_DENIED` và hiển thị hướng dẫn bật GPS chi tiết trong cài đặt điện thoại. |
| **Thiết bị không có GPS (máy tính để bàn)** | Thấp | Chấm công xưởng chỉ dùng trên điện thoại di động PWA của thợ (đã ràng buộc camera trước selfie). |
