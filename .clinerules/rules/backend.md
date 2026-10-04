---
trigger: glob
glob: be-nestjs-thanhxuan/src/**
description:
---

# Kiến trúc NestJS

- Mỗi feature một module (controller, service, schema, dto). Tránh circular dependency.
- Controller chỉ nhận request, gọi Service, trả response. Không viết logic hay query trong Controller.
- Logic nghiệp vụ nằm ở Service; truy cập DB qua Model của Mongoose trong Service/Repository.
- Config qua ConfigModule, không dùng `process.env` rải rác.
- Auth dùng Guard, logging/transform dùng Interceptor, lỗi dùng Exception Filter.

# DTO & Validation

- Mọi input đi qua DTO dùng class-validator + class-transformer.
- Bật global ValidationPipe với `whitelist: true`, `transform: true`.
- Param là ObjectId phải validate (ParseObjectIdPipe hoặc custom pipe).
- Không trả thẳng document Mongoose ra ngoài; map sang response DTO.
- Không bao giờ trả về field nhạy cảm (password, token). Field password đặt `select: false`.

# Mongoose

- Dùng `@nestjs/mongoose` với `@Schema({ timestamps: true })` và `SchemaFactory`.
- Query chỉ đọc dùng `.lean()` và `.select()` để lấy đúng field cần.
- Mọi list API phải phân trang (limit/skip hoặc cursor), có giới hạn `limit` tối đa.
- Field hay filter/sort phải khai báo Index trong schema; cảnh báo khi query không có Index.
- Hạn chế `populate` lồng nhau; cân nhắc embed hay reference theo cách truy vấn thực tế.
- Transaction chỉ dùng khi thật sự cần (yêu cầu replica set).
- Không nối chuỗi/nhận object thô từ client vào filter (tránh NoSQL injection, ví dụ `$where`, `$ne`).
- Không chạy lệnh ghi/xóa trên DB thật khi chưa hỏi.

# Lỗi & Test

- Dùng exception có sẵn của Nest (NotFoundException, BadRequestException...), không throw Error thô.
- Viết unit test cho Service (mock Model); e2e test cho endpoint quan trọng.
