# Kế Hoạch 30: Chuyển Đổi Trạm Khoán Việc Thợ Xưởng Sang Mô Hình Công Việc Theo Giờ (HourlyWork)

> **Phân hệ thực thi:** `be-nestjs-thanhxuan` & `fe-react-thanhxuan-internal`  
> **Căn cứ nghiệp vụ:** Mục 1.10 Bảng `hourly_work` (HourlyWork) trong [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md)  
> **Mục tiêu:** Thay thế hoàn toàn mô hình đếm khoán sản lượng từng chiếc cũ (`foldingRateWorker` trên từng chiếc đồ vải) sang mô hình tính công thợ theo thời gian làm việc nhân hệ số loại công việc (`jobType` $\times$ `minutesWorked` $\times$ `hourlyBaseRate` $\times$ `coefficient`), đồng bộ chặt chẽ với ca chấm công `AttendanceRecord` và cấu hình tiền lương `PaySettings`.

---

## 1. Hiện Trạng & Vấn Đề Kỹ Thuật Cần Giải Quyết

### 1.1. Hiện trạng CSDL & Backend

- Collection MongoDB thực tế đã được chuẩn hóa đổi tên thành `hourly_work` từ Plan 28.
- Schema [piecework-log.schema.ts:8-46](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/schemas/piecework-log.schema.ts#L8-L46) đã có sẵn các trường `jobType`, `jobName`, `minutesWorked`, `coefficient`, `hourlyBaseRate`, `subtotal`.
- Bảng cấu hình [pay-settings.schema.ts:38-54](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/payroll/schemas/pay-settings.schema.ts#L38-L54) đã có danh mục 7 công việc chuẩn:
  - `SHAKE` (Rũ đồ - Hệ số: 1.2)
  - `WASH_DRY` (Giặt và sấy - Hệ số: 1.3)
  - `FOLD` (Gấp - Hệ số: 1.0)
  - `COUNT` (Đếm đồ / Phân loại - Hệ số: 1.1)
  - `IRON` (Là / Ủi - Hệ số: 1.2)
  - `PACK` (Đóng gói - Hệ số: 1.0)
  - `OTHER` (Công việc khác - Hệ số: 1.0)
- **Vấn đề tồn tại:** Controller và Service tại [piecework.controller.ts:35-40](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/piecework.controller.ts#L35-L40) và [record-task.dto.ts:4-13](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/piecework/dto/record-task.dto.ts#L4-L13) vẫn đang bắt buộc truyền `itemCode` và `quantity` (mô hình khoán cũ đã bị drop khỏi `item_catalogs`).

### 1.2. Hiện trạng Giao Diện Frontend

- Trang [PieceworkStationPage.tsx:14-277](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/operations/piecework/PieceworkStationPage.tsx#L14-L277) (`http://localhost:3001/operations/worker/piecework`):
  - Vẫn tải danh mục đồ vải `ItemCatalog` (Khăn ăn xám, Tạp dề...) và hiển thị lưới bộ đếm sản lượng cộng dồn từng chiếc.
  - Do `foldingRateWorker` đã bị xóa ở Plan 28, đơn giá hiện tại là 0đ, khiến tổng tiền công tích lũy luôn bằng 0.
  - Thợ xưởng không có cách nào ghi nhận thời gian thực tế đã làm các khâu (Ủi, Gấp, Rũ, Đóng gói...).

---

## 2. Thiết Kế Nghiệp Vụ Mới: Mô Hình HourlyWork

### 2.1. Công Thức Tính Tiền Công

$$\text{Tiền công (VNĐ)} = \left(\frac{\text{minutesWorked}}{60}\right) \times \text{hourlyBaseRate} \times \text{coefficient}$$

Trong đó:

- `minutesWorked`: Số phút thợ thực tế thực hiện công việc (nhập theo các mốc nhanh: 15p, 30p, 45p, 60p, 90p, 120p hoặc nhập tùy ý).
- `hourlyBaseRate`: Đơn giá giờ cơ bản của thợ, ưu tiên lấy từ tài khoản thợ `StaffAccount.pay_profile.hourly_rate` (nếu không có thì fallback về `defaultHourlyRate: 30000` VNĐ/giờ từ `PaySettings`).
- `coefficient`: Hệ số thù lao của loại công việc, tự động snapshot từ `PaySettings.jobCoefficients`.
- `jobType`: Khóa định danh loại công việc.

### 2.2. Ràng Buộc Ca Làm Việc (Attendance Binding)

- Thợ bắt buộc phải đang có ca làm việc mở (`AttendanceRecord` trạng thái `OPEN` trong ngày).
- Nếu chưa check-in: Giao diện hiển thị cảnh báo thân thiện kèm nút bấm dẫn tới trang Chấm công Selfie hoặc mở popup Check-in nhanh.

---

## 3. Kế Hoạch Triển Khai Chi Tiết (Plan 30)

### Giai Đoạn 1: Nâng Cấp Backend API (`be-nestjs-thanhxuan`)

- [x] **Task 1.1: Tạo DTO mới `RecordHourlyWorkTaskDto`:**
  - `jobType`: Enum bắt buộc (`SHAKE`, `WASH_DRY`, `FOLD`, `COUNT`, `IRON`, `PACK`, `OTHER`).
  - `minutesWorked`: Số nguyên dương bắt buộc (tối thiểu 1 phút, tối đa 720 phút/lần ghi).
  - `notes`: Chuỗi tùy chọn (tối đa 255 ký tự).
- [x] **Task 1.2: Endpoint lấy danh mục loại việc & hệ số:**
  - `GET /piecework/job-types`: Trả về danh sách `JobCoefficientSetting[]` lấy từ `PaySettingsRepository` kèm `defaultHourlyRate` để frontend hiển thị danh sách trực quan.
- [x] **Task 1.3: Cập nhật Service `recordHourlyWorkTask`:**
  - Kiểm tra ca làm việc `OPEN` của thợ qua `AttendanceService`.
  - Lấy thông tin tài khoản thợ để snapshot `hourlyBaseRate` (fallback `defaultHourlyRate: 30000`).
  - Lấy hệ số `coefficient` và tên hiển thị `jobName` từ cấu hình `PaySettings`.
  - Tính `subtotal = Math.round((minutesWorked / 60) * hourlyBaseRate * coefficient)`.
  - Thêm một entry vào mảng `tasks` của bản ghi `hourly_work` ngày hôm nay, cộng dồn `totalEarnings`.
- [x] **Task 1.4: Endpoint xóa / hủy mục công việc vừa ghi:**
  - `DELETE /piecework/me/tasks/:taskIndex`: Cho phép thợ xóa một dòng công việc đã ghi nhầm trong ngày (khi phiếu chưa bị khóa/CONFIRMED).
- [x] **Task 1.5: Viết Unit Test Jest:**
  - Viết test kiểm tra tính toán tiền công theo giờ, snapshot hệ số, kiểm tra ràng buộc ca OPEN.

---

### Giai Đoạn 2: Tái Cấu Trúc Giao Diện Frontend (`fe-react-thanhxuan-internal`)

- [x] **Task 2.1: Cập nhật Type Definitions (`src/types/index.ts`):**
  - Khai báo interface `JobCoefficientSetting`, `HourlyWorkTask`, `HourlyWorkDailyLog`.
- [x] **Task 2.2: Thiết kế lại toàn diện `PieceworkStationPage.tsx`:**
  - **Banner Trạng Thái Thợ:**
    - Hiển thị họ tên thợ, ngày hiện tại.
    - Trạng thái ca chấm công (badge xanh "Đang trong ca làm việc" hoặc badge vàng "Chưa check-in ca").
    - Đơn giá giờ thợ (`hourlyRate` đ/h).
    - Tổng số phút đã làm trong ngày (ví dụ: `4 giờ 15 phút`) & Tổng tiền công tạm tính (`formatVND(totalEarnings)`).
  - **Bộ Chọn Loại Công Việc (Job Type Grid):**
    - 7 thẻ công việc lớn với icon Lucide trực quan, hiển thị rõ hệ số lương:
      - 🌀 **Rũ đồ** (`SHAKE` - x1.2)
      - 🧺 **Giặt & Sấy** (`WASH_DRY` - x1.3)
      - 👕 **Gấp đồ** (`FOLD` - x1.0)
      - 🔢 **Đếm đồ / Phân loại** (`COUNT` - x1.1)
      - ♨️ **Là / Ủi** (`IRON` - x1.2)
      - 📦 **Đóng gói** (`PACK` - x1.0)
      - ⚙️ **Công việc khác** (`OTHER` - x1.0)
  - **Bộ Điều Khiển Thời Gian Làm Việc:**
    - Các nút bấm nhanh tiện dụng trên mobile/máy tính bảng: `+15 phút`, `+30 phút`, `+45 phút`, `+1 giờ (60p)`, `+2 giờ (120p)`.
    - Ô nhập số phút tự do kèm nút cộng/trừ.
    - Tính tiền công ước tính hiển thị trực tiếp theo thời gian đang chọn:  
      _Ví dụ: "45 phút Ủi đồ = 27.000đ"_.
    - Ô nhập ghi chú ngắn gọn (tùy chọn).
    - Nút bấm lớn nổi bật: **"Ghi Nhận Công Việc"**.
  - **Bảng Nhật Ký Công Việc Trong Ngày:**
    - Hiển thị danh sách các mục công việc đã ghi trong ca theo thứ tự thời gian (`loggedAt`).
    - Cột: Giờ ghi, Loại việc, Thời lượng, Hệ số, Tiền công, Thao tác (Nút xóa thùng rác cho mục chưa chốt).
    - Trạng thái chốt ca: Badge `PENDING` (Chờ quản lý xác nhận) hoặc `CONFIRMED` (Quản lý đã duyệt).
- [x] **Task 2.3: Chuẩn Hóa Điều Hướng & Menu (`nav-config.ts`):**
  - Đổi tiêu đề menu từ "Khoán Việc" thành **"Công Thợ Theo Giờ"** (hoặc **"Công Việc Thợ"**), giữ nguyên route `/operations/worker/piecework` để tránh gãy link điều hướng hiện tại.

---

### Giai Đoạn 3: Kiểm Thử, Build & Nghiệm Thu

- [x] **Task 3.1: Kiểm thử end-to-end trên môi trường Dev:**
  - Đăng nhập tài khoản thợ (`worker`).
  - Kiểm tra điều kiện chặn khi chưa check-in ca.
  - Check-in ca và thử ghi nhận các loại công việc khác nhau.
  - Kiểm tra công thức tính tiền công tạm tính và lưu vào CSDL MongoDB collection `hourly_work`.
  - Xóa 1 mục và kiểm tra cập nhật lại tổng tiền công.
- [x] **Task 3.2: Verify Build & Typecheck:**
  - Chạy `pnpm exec tsc --noEmit` và `pnpm build` trên cả Backend và Frontend.
- [x] **Task 3.3: Cập nhật Tài liệu & Git Commit:**
  - Cập nhật [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md) và [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).
  - Commit và push lên nhánh `dev`.

---

## 4. Tiêu Chí Hoàn Thành (Definition of Done)

1. Thợ xưởng ghi nhận công việc theo giờ, hệ số và thời gian (phút), không còn đếm theo sản lượng từng chiếc đồ vải cũ.
2. Tiền công tự động tính toán đúng 100% theo công thức `(minutesWorked / 60) * hourlyBaseRate * coefficient`.
3. Bảng `hourly_work` lưu trữ chính xác các trường theo đặc tả tại Mục 1.10 của [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md).
4. Lint, typecheck và build pass 100% cho cả 2 ứng dụng.
5. Tự động commit và push code lên nhánh `dev`.

---

## 5. Execution Log

- **Trạng thái:** Done (2026-10-15)
- **Thực thi:**
  - Backend:
    - Tạo `RecordHourlyWorkTaskDto` trong `dto/record-hourly-work.dto.ts`.
    - Thêm `getJobTypes`, `recordHourlyWorkTask`, `deleteWorkerTask` trong `PieceworkService`.
    - Thêm endpoint `GET /piecework/job-types`, `POST /piecework/me/tasks`, `DELETE /piecework/me/tasks/:taskIndex` trong `PieceworkController`.
    - Đăng ký `PaySettings` và `AuthModule` vào `PieceworkModule`.
    - Viết unit test Jest cho HourlyWork trong `piecework.service.spec.ts` (10/10 passed).
  - Frontend:
    - Khai báo types `JobCoefficientSetting`, `HourlyWorkTask`, `HourlyWorkDailyLog` trong `src/types/index.ts`.
    - Viết lại toàn diện `PieceworkStationPage.tsx` theo mô hình HourlyWork với 7 khâu công việc, bộ chọn phút nhanh/tự do, box tính tiền trước, danh sách nhật ký ca và nút xóa mục.
    - Đổi tên menu trong `nav-config.ts` thành "Công Thợ Theo Giờ".
- **Verification:**
  - Jest test `piecework.service.spec.ts` pass 100%.
  - Backend `nest build` pass 100%.
  - Frontend `tsc --noEmit` và `pnpm build` pass 100%.
