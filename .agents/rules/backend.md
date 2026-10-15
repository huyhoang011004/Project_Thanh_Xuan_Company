---
trigger: glob
glob: be-nestjs-thanhxuan/src/**
description: Quy tắc phát triển Backend NestJS dự án Thanh Xuan Company
---

# Kiến Trúc NestJS & Repository Pattern

- **Phân tầng nghiêm ngặt:** Controller $\rightarrow$ Service $\rightarrow$ Repository $\rightarrow$ Model.
- **Controller:** Chỉ nhận request, validate qua DTO, gọi Service, trả response. Không viết logic hay query DB trong Controller.
- **Service:** Chứa nghiệp vụ kinh doanh; truy cập cơ sở dữ liệu **bắt buộc thông qua Repository**. Service tuyệt đối không `@InjectModel()` trực tiếp.
- **Tránh Circular Dependency:** Đăng ký Repository/Schema trực tiếp trong module qua `INTERNAL_CONNECTION` hoặc kết nối tương ứng khi cần dùng chéo bảng, không import chéo Service module.
- Config tập trung qua `ConfigModule`, không dùng `process.env` rải rác.
- Auth dùng Passport JWT Guard (`aud: 'internal'`), logging/transform dùng Interceptor (`PayFieldFilterInterceptor`), xử lý lỗi qua Exception Filter.

# DTO & Validation

- Mọi `@Body()` bắt buộc dùng Class DTO (không dùng `interface` hay `Partial<T>`).
- Bật global `ValidationPipe` với `whitelist: true`, `transform: true`.
- **Nested Object DTO bắt buộc đủ bộ 3 decorator:** `@IsDefined()` + `@ValidateNested()` + `@Type(() => DtoClass)`.
- **An toàn ObjectId:** Luôn kiểm tra `Types.ObjectId.isValid(id)` trước khi `new Types.ObjectId(id)` để chặn crash `BSONError`.
- Param là ObjectId trên Controller phải validate qua pipe (`ParseObjectIdPipe`).
- Không trả thẳng document Mongoose ra ngoài; map sang response DTO.
- Không bao giờ trả về field nhạy cảm (password, token, hash). Field password đặt `select: false`.
- **Không để lại file DTO re-export rác:** Khi đổi tên hoặc tái cấu trúc DTO, các file re-export tương thích ngược chỉ dùng tạm thời trong quá trình sửa đổi. Sau khi hoàn tất code, bắt buộc xóa bỏ hoàn toàn các file re-export này và cập nhật toàn bộ nơi import sang DTO mới trước khi chạy test/build.

# Mongoose & Hiệu Năng DB

- Dùng `@nestjs/mongoose` với `@Schema({ timestamps: true })` và `SchemaFactory`.
- Query chỉ đọc bắt buộc dùng `.lean()` và `.select()` để lấy đúng field cần.
- Mọi list API phải phân trang (limit/skip hoặc cursor), có giới hạn `limit` tối đa.
- Field hay filter/sort phải khai báo Index trong schema; cảnh báo khi query không có Index.
- Hạn chế `populate` lồng nhau; cân nhắc embed hay reference theo cách truy vấn thực tế.
- Transaction chỉ dùng khi thật sự cần (yêu cầu replica set).
- Không nối chuỗi/nhận object filter thô từ client vào query (tránh NoSQL injection, ví dụ `$where`, `$ne`).
- Không chạy lệnh ghi/xóa trên DB thật khi chưa hỏi (ngoại trừ script dọn dẹp di chuyển schema đã được chỉ thị rõ).

# Chuẩn Hóa Múi Giờ Việt Nam (`Asia/Ho_Chi_Minh` - GMT+7)

- Toàn bộ thời gian (chấm công, tính giờ công thợ, phân loại lịch giao nhận, tiền tố mã phiếu `GN-YYYYMMDD-NNN`, báo cáo thống kê) phải được xử lý qua helper `time.util.ts` (`startOfDayVN`, `endOfDayVN`, `getDatePrefixVN`).
- **Tuyệt đối cấm** dùng `setHours(0,0,0,0)` theo local timezone của máy chủ VPS để tránh lệch ngày/giờ khi deploy.

# Quản Lý Schema, Database Dictionary & Dọn Dẹp Database

- Mỗi khi thêm, sửa, đổi tên hoặc xóa bất kỳ bảng (collection/schema) nào trong database:
  1. Bắt buộc cập nhật ngay vào `.agents/docs/DATABASE_DICTIONARY.md`: sắp xếp lại thứ tự logic, đánh số liền mạch, cập nhật đúng tên bảng.
  2. **Tuyệt đối không lưu lại tên các bảng đã xóa trong tài liệu:** Xóa bỏ hoàn toàn định nghĩa và dòng STT của bảng đã xóa khỏi `DATABASE_DICTIONARY.md` (không để dòng deprecated hay tên bảng cũ trong danh mục active).
  3. **Dọn dẹp DB thực tế:** Bắt buộc cập nhật và chạy script dọn dẹp `pnpm run db:drop-legacy` để drop/rename các collection và index cũ đã bị xóa khỏi cơ sở dữ liệu MongoDB thực tế, đảm bảo DB sạch sẽ không tồn đọng rác dữ liệu.

# Lỗi & Test

- Dùng exception có sẵn của Nest (`NotFoundException`, `BadRequestException`, `ConflictException`...), không throw `Error` thô.
- Viết unit test cho Service (mock Repository); e2e test cho endpoint quan trọng. Chạy `pnpm test` trước khi hoàn tất.

