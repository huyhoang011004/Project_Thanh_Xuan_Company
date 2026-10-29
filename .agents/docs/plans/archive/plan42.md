# Plan 42: Kiến Trúc Lưu Trữ Kép (Cloudinary + VPS), Tự Động Nén ZIP Gửi Mail Đối Tác, Dọn Dẹp Ảnh Mồ Côi & Quản Lý Dung Lượng Google Drive (5GB)

> Status: Done | Created: 2026-10-27 | Completed: 2026-10-27 | Target: Backend NestJS (`be-nestjs-thanhxuan`)

## 1. Overview & Affected Files

### 1.1. Mục tiêu nghiệp vụ
Hiện thực hóa toàn diện chiến lược quản trị rủi ro, dọn dẹp rác dữ liệu và tự động hóa sao lưu cho công ty Thanh Xuân:
1. **Cơ chế Lưu trữ kép & Ghi đè tự xóa ảnh cũ (Hybrid Dual-Storage):**
   - Khi có ảnh mới (phiếu giao nhận, camera chấm công, nhiên liệu xe): Hệ thống lưu song song 1 bản gốc vào ổ cứng cục bộ VPS theo cấu trúc thư mục phân cấp `internal-thanhxuan/.../YYYY/MM/`, đồng thời tải lên Cloudinary để lấy link CDN tốc độ cao trả về cho app di động.
   - **Ghi đè thông minh:** Bất cứ khi nào phiếu giao nhận được ký duyệt lại hoặc cập nhật sinh ra ảnh mới, hệ thống tự động xóa ngay lập tức file ảnh cũ cả trên Cloudinary và ổ cứng VPS, triệt tiêu 100% tình trạng phình đĩa cục bộ.
2. **Quét định kỳ hàng tháng dọn "Ảnh mồ côi" (Orphaned Images Scanner):**
   - Chạy tự động vào ngày 1 hàng tháng: Quét toàn bộ file thực tế trên Cloudinary (`internal-thanhxuan`) và ổ cứng VPS, đối chiếu với danh sách URL đang lưu trong Database (`handover_records`, `attendance_records`, `fuel_requests`...).
   - Nếu phát hiện file ảnh "mồ côi" (tồn tại trên Cloud/VPS nhưng không có trong DB do thao tác hủy/sửa):
     - Gom nén các ảnh này thành file zip `Orphaned_Images_Thang[MM]_[YYYY].zip`.
     - Đồng bộ bản sao dự phòng lên Google Drive qua Rclone (`gdrive:Anh_Mo_Coi_Du_Phong/`).
     - Xóa triệt để các file rác này khỏi Cloudinary và ổ cứng VPS.
3. **Tự động Nén ZIP & Gửi Mail Đối Soát Hàng Tháng (Ngày 1 hàng tháng):**
   - Tự động gom toàn bộ ảnh phiếu giao nhận trong tháng trước ($T-1$) theo từng đối tác.
   - Đổi tên file chuẩn mực: `[MãPhiếu]_[Ngày]_[Ca].webp`.
   - Nén thành file zip riêng cho từng đối tác: `PhieuGiaoNhan_Thang[MM]_[YYYY]_[TenDoiTac].zip`.
   - Nếu file nén $\le 20$ MB: Đính kèm trực tiếp vào Email gửi cho Quản lý cơ sở đối tác và CC Kế toán công ty.
   - Nếu file nén $> 20$ MB (vượt trần email): Tự động đẩy lên Google Drive qua Rclone (`gdrive:Anh_Giao_Nhan_Luu_Tru/HangThang/`) và gửi email thông báo kèm đường link tải.
4. **Kiểm soát dung lượng Google Drive 5GB & Tự động xoay vòng khi sắp đầy (Drive Capacity Guard):**
   - Do tài khoản Google Drive hiện chỉ có 5GB:
   - Hệ thống dùng `rclone about gdrive: --json` để kiểm tra dung lượng trống trước mỗi lần upload.
   - Giữ vòng đời bản sao lưu Database MongoDB rút gọn 14 ngày (thay vì 30 ngày để tối ưu không gian).
   - Khi dung lượng Google Drive chạm ngưỡng **> 80% (hoặc còn trống < 1GB)**: Tự động xóa các bản sao lưu Database và ảnh mồ côi cũ nhất theo thứ tự thời gian (FIFO), đồng thời gửi email cảnh báo dung lượng cho Admin.
5. **Lưu trữ Hàng năm & Dọn dẹp Ảnh phụ an toàn:**
   - **Ảnh phụ (Chấm công & ODO/Xăng xe) sau 90 ngày:** Tự động gom nén ZIP `LuuTru_AnhPhu_Q[N]_[YYYY].zip`, gọi Rclone đẩy lên `gdrive:Anh_Phu_Luu_Tru/`, sau đó mới xóa ảnh cũ trên Cloudinary/VPS.
   - **Ảnh phiếu giao nhận sau 365 ngày (1 năm):** Tự động gom nén ZIP `LuuTru_PhieuGiaoNhan_Nam_[YYYY].zip`, gọi Rclone đẩy lên `gdrive:Anh_Giao_Nhan_Luu_Tru/HangNam/`, sau đó dọn dẹp ảnh cũ trên Cloudinary/VPS.
6. **Trigger Thủ Công (Manual Trigger API):**
   - Cung cấp API bảo vệ (dành cho Admin/Accountant) để chạy thử nghiệm quét ảnh mồ côi, nén/gửi mail ngay lập tức mà không cần chờ đến mùng 1 hàng tháng.

---

### 1.2. Danh sách file bị ảnh hưởng

#### Backend (`be-nestjs-thanhxuan/`)
- `package.json`: Khai báo thêm dependency `archiver` và `@types/archiver` để nén file zip chuẩn stream hiệu năng cao trên Node.js.
- `src/mail/mail.service.ts`: Mở rộng phương thức `sendMail` hỗ trợ tham số `attachments?: nodemailer.SendMailOptions['attachments']` và `cc?: string | string[]`.
- `src/modules/core/upload/upload.service.ts`:
  - Cập nhật logic `uploadFile()`: Lưu 1 bản copy vật lý vào ổ cứng VPS (`/uploads/internal-thanhxuan/[folder]/YYYY/MM/[filename]`) song song với Cloudinary.
  - Thêm helper xóa file vật lý local `deleteLocalFile(filePath: string)`.
  - Thêm helper trích xuất đường dẫn local từ URL/tên file.
  - Thêm helper liệt kê danh sách file vật lý local và Cloudinary API để phục vụ quét ảnh mồ côi.
- `src/modules/internal/handovers/schemas/handover-record.schema.ts`:
  - Thêm trường `slipLocalPath?: string` để lưu vết vị trí file ảnh gốc trên ổ cứng VPS.
- `src/modules/internal/handovers/services/handover-record.service.ts`:
  - Cập nhật hàm `uploadSlipImage()`: Tự động xóa cả Cloudinary URL cũ VÀ file local cũ (`slipLocalPath`) khi ghi đè ảnh mới.
- `src/modules/internal/archive/` (Module Mới):
  - `src/modules/internal/archive/archive.module.ts`: Khai báo module nén lưu trữ và lịch trình cron.
  - `src/modules/internal/archive/archive.service.ts`:
    - Logic nén ZIP streaming (`archiver`).
    - Logic tương tác Rclone CLI (`child_process.execFile`).
    - Logic kiểm tra dung lượng Google Drive (`rclone about`) và tự động dọn dẹp file cũ nhất khi dung lượng vượt 80%.
    - Logic quét và dọn dẹp ảnh mồ côi (Orphaned Images).
    - Gửi email báo cáo kèm file đính kèm hoặc link Drive.
  - `src/modules/internal/archive/archive.cron.ts`: Định nghĩa các tác vụ định kỳ `@Cron()`.
  - `src/modules/internal/archive/archive.controller.ts`: Endpoint bảo mật dành cho Admin/Kế toán kích hoạt thủ công.
  - `src/modules/internal/archive/specs/archive.service.spec.ts`: Unit test kiểm thử logic nén zip, dọn ảnh mồ côi và giới hạn dung lượng Drive.
- `src/app.module.ts`: Import `ArchiveModule`.

---

## 2. Technical Architecture & Design Decisions

### 2.1. Cấu trúc Thư mục Lưu trữ Đồng Bộ trên Cloudinary & VPS (`internal-thanhxuan`)
Toàn bộ ảnh vận hành nội bộ (không liên quan đến ảnh website công khai) được chuyển sang thư mục gốc mới **`internal-thanhxuan`**, tách biệt hoàn toàn với `laundry-express`:

```text
internal-thanhxuan/
├── handovers/
│   └── 2026/
│       └── 10/
│           ├── GN-20261027-001_1730000000_MORNING.webp
│           └── GN-20261027-002_1730000000_EVENING.webp
├── attendance/
│   └── 2026/
│       └── 10/
│           └── ATT_NV01_1730000000.webp
└── fuel/
    └── 2026/
        └── 10/
            └── FUEL_TX02_1730000000.webp
```

- **Trên Cloudinary:** Folder upload dạng `internal-thanhxuan/handovers/YYYY/MM/`, `internal-thanhxuan/attendance/YYYY/MM/`, `internal-thanhxuan/fuel/YYYY/MM/`.
- **Trên Ổ cứng VPS:** Lưu vật lý tại `/var/www/uploads/internal-thanhxuan/...` (hoặc `UPLOAD_DIR/internal-thanhxuan/...`).

### 2.2. Cơ chế Xóa Ghi Đè (Overwrite & Delete Old)
Khi một phiếu giao nhận được cập nhật (ví dụ: đối tác ký nhận đồ sạch hoặc xưởng rạch bao recount):
```typescript
if (oldSlipImageUrl) {
  // Xóa ảnh cũ trên Cloudinary
  this.uploadService.deleteFile(oldSlipImageUrl);
}
if (oldSlipLocalPath && fs.existsSync(oldSlipLocalPath)) {
  // Xóa file ảnh cũ trên ổ cứng VPS
  fs.unlinkSync(oldSlipLocalPath);
}
```

### 2.3. Thuật toán Quét & Dọn Dẹp Ảnh Mồ Côi (Orphaned Images Scanner)
1. Lấy toàn bộ danh sách `slipImageUrl` và `slipLocalPath` hợp lệ từ MongoDB (`handover_records`, `attendance_records`, `fuel_requests`).
2. Quét danh sách file trong thư mục VPS `uploads/internal-thanhxuan/` và Cloudinary folder `internal-thanhxuan/`.
3. Tìm hiệu của 2 tập hợp: $\text{OrphanedFiles} = \text{FilesTrênĐĩa} \setminus \text{FilesĐangDùngTrongDB}$.
4. Nếu $\text{OrphanedFiles} > 0$:
   - Đóng gói ZIP `Orphaned_Images_YYYY_MM.zip`.
   - Đẩy lên Google Drive qua Rclone: `gdrive:Anh_Mo_Coi_Du_Phong/`.
   - Xóa bỏ hoàn toàn khỏi đĩa VPS và Cloudinary.

### 2.4. Quản lý Dung lượng Google Drive 5GB (Capacity Guard)
- Chạy lệnh `rclone about gdrive: --json` nhận kết quả `{ total: 5368709120, used: 4294967296, free: 1073741824 }`.
- Nếu `used / total >= 0.80` hoặc `free < 1GB`:
  - Thực hiện auto-prune: Tìm các file trong `gdrive:Database_Backups/` hoặc `gdrive:Anh_Mo_Coi_Du_Phong/` có ngày sửa đổi cũ nhất và xóa dần cho đến khi dung lượng `free >= 1.5GB`.
  - Gửi email cảnh báo kèm danh sách file đã dọn dẹp về cho Admin.

---

## 3. Database & Schema Changes

### `HandoverRecordSchema` (`be-nestjs-thanhxuan/src/modules/internal/handovers/schemas/handover-record.schema.ts`)
```typescript
@Prop({ trim: true })
slipImageUrl?: string; // Link CDN Cloudinary (hoặc fallback URL)

@Prop({ trim: true })
slipLocalPath?: string; // Đường dẫn tuyệt đối file gốc trên ổ cứng VPS
```

Cập nhật đồng bộ tại `.agents/docs/DATABASE_DICTIONARY.md` và `.agents/docs/CODEBASE_ATLAS.md`.

---

## 4. Step-by-Step Implementation Tasks

- [x] **Task 1: Bổ sung thư viện nén `archiver` & Nâng cấp `MailService`**
  - Cài đặt `archiver` và `@types/archiver` trong `be-nestjs-thanhxuan`.
  - Cập nhật `MailService.sendMail` hỗ trợ `attachments` và `cc`.
- [x] **Task 2: Nâng cấp `UploadService` & Schema `HandoverRecord`**
  - Cập nhật `UploadService.uploadFile` lưu bản copy vật lý trên đĩa phân cấp `internal-thanhxuan/.../YYYY/MM/`.
  - Thêm helper xóa file local `deleteLocalFile()`.
  - Bổ sung trường `slipLocalPath` trong `HandoverRecordSchema` và cơ chế xóa đè ảnh cũ trong `handover-record.service.ts`.
- [x] **Task 3: Xây dựng `ArchiveService` (Nén ZIP, Rclone, Báo cáo Email, Quản lý 5GB)**
  - Viết helper nén thư mục/danh sách file thành ZIP bằng stream.
  - Viết method gom ảnh phiếu tháng theo đối tác, đổi tên file có ý nghĩa và đóng gói.
  - Viết method kiểm tra dung lượng Google Drive (`rclone about`) và dọn dẹp xoay vòng (Retention & Auto-prune khi đầy 80%).
  - Viết method quét và dọn dẹp ảnh mồ côi (Orphaned Images Cleaner).
- [x] **Task 4: Thiết lập Cron Job (`ArchiveCron`) & Controller Trigger Thủ Công**
  - Thiết lập cron ngày 1 hàng tháng (02:00 sáng): Gửi mail phiếu tháng cho đối tác + quét ảnh mồ côi.
  - Thiết lập cron dọn dẹp ảnh phụ mỗi quý và ảnh năm.
  - Tạo Controller với các endpoint kiểm tra thủ công.
- [x] **Task 5: Unit Test & Verification**
  - Viết unit test cho `ArchiveService`.
  - Chạy `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` tại `be-nestjs-thanhxuan`.
- [x] **Task 6: Cập nhật Tài liệu Kỹ thuật & Tự động Commit/Push**
  - Cập nhật `DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `srs_sdd_backend.md`, `CHANGELOG.md`.
  - Commit tiếng Việt tự nhiên và push lên nhánh `dev`.

---

## 5. Verification & Rollback Plan

### Kiểm thử thực tế:
1. `archive.service.spec.ts`: PASS 4/4 tests.
2. Toàn bộ unit tests internal: PASS 16/16 test suites (126/126 tests).
3. Typecheck: `pnpm exec tsc --noEmit` PASS 100%.
4. Build: `pnpm build` PASS 100%.
5. Cập nhật đồng bộ 5 trụ cột tài liệu kỹ thuật.

### Execution Log:
- 2026-10-27: Hoàn tất toàn bộ 6 task của Plan 42. Đã kiểm thử typecheck, unit test và build thành công. Đồng bộ 5 trụ cột tài liệu và sẵn sàng push nhánh `dev`.
1. Gọi API trigger thủ công nén ảnh phiếu tháng thử nghiệm:
   - Kiểm tra file zip sinh ra đúng cấu trúc tên file `[MãPhiếu]_[Ngày].webp`.
   - Kiểm tra email gửi về có đính kèm file zip.
2. Kiểm tra cơ chế xóa đè: Khi sinh ảnh mới, kiểm tra ảnh cũ trên Cloudinary và file cũ trên đĩa VPS bị xóa thành công.
3. Kiểm tra tính năng quét ảnh mồ côi: Tạo file ảnh giả lập không có trong DB, kích hoạt quét -> file được gom vào zip đẩy lên Drive và bị xóa khỏi VPS.
4. Kiểm tra lệnh `rclone about` đọc đúng dung lượng Google Drive.

### Rollback:
- Nếu rclone trên VPS gặp sự cố, hệ thống vẫn lưu trữ cục bộ bình thường và không ảnh hưởng đến luồng giao nhận chính.
