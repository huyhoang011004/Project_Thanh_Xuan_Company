---
name: create-nestjs-module
description: Workflow chuẩn để tạo một Module Backend mới trong NestJS cho dự án Laundry Express, tuân thủ nghiêm ngặt Repository Pattern và các nguyên tắc SOLID. Kích hoạt khi cần tạo API mới, thêm bảng CSDL mới, hoặc xây dựng một module Backend.
---

# Quy trình tạo Module Backend (NestJS)

Skill này hướng dẫn luồng công việc (workflow) chuẩn để tạo ra một module Backend mới trong NestJS cho dự án **Laundry Express Thanh Xuan**. Bạn (AI) PHẢI luôn tuân thủ quy trình này.

## 1. Mục tiêu
- Đảm bảo kiến trúc phân tầng: `Request -> Controller -> Service -> Repository -> DB`.
- Không bao giờ gọi Mongoose Model trực tiếp từ Service hay Controller.
- Luôn có comment `// Adhering to SOLID & Design Patterns` ở đầu các file code mới.
- Viết code bằng TypeScript (Strict Types).

## 2. Quy trình (Workflow) từng bước

Khi người dùng yêu cầu tạo một module/API mới (ví dụ: `promotions`), hãy thực hiện lần lượt các bước sau:

### Bước 1: Tạo Schema (Mongoose)
- Đường dẫn: `backend-nestjs/src/modules/[module-name]/schemas/[module-name].schema.ts`
- Định nghĩa schema rõ ràng với các decorator của `@nestjs/mongoose`.

### Bước 2: Tạo DTOs (Data Transfer Objects)
- Đường dẫn: `backend-nestjs/src/modules/[module-name]/dto/create-[module-name].dto.ts` và `update-[module-name].dto.ts`.
- **Bắt buộc sử dụng Class DTO** (tuyệt đối không dùng TypeScript `interface` hay `Partial<T>` cho `@Body()`).
- Sử dụng `class-validator` và `class-transformer` để validate dữ liệu đầu vào.
- **Nested Objects**: Bắt buộc kết hợp `@IsDefined({ message: '...' })` cùng `@ValidateNested()` và `@Type(() => NestedDto)`. Không dùng `@ValidateNested()` đơn độc vì sẽ bị lọt qua khi client không gửi trường đó.

### Bước 3: Tạo Repository Pattern
- Đường dẫn: `backend-nestjs/src/modules/[module-name]/repositories/[module-name].repository.ts`
- Kế thừa `BaseRepository<T>`. Inject Mongoose Model vào đây. Tất cả các thao tác tương tác với DB (CRUD) chỉ được thực hiện trong file này. Sử dụng `.lean()` cho các thao tác đọc.

### Bước 4: Tạo Service
- Đường dẫn: `backend-nestjs/src/modules/[module-name]/[module-name].service.ts`
- Inject Repository vừa tạo. Chứa toàn bộ Business Logic. Tuyệt đối không query DB trực tiếp ở đây.
- **Defensive Programming**: Luôn sử dụng Optional Chaining (`?.`) và Nullish Coalescing (`??`) khi truy cập các thuộc tính của DTO để ngăn chặn `TypeError` (HTTP 500).
- **Timezone Nghiệp Vụ**: Với các logic tính ngày, điểm danh, ca kíp, sinh mã phiếu, bắt buộc sử dụng helper `Asia/Ho_Chi_Minh` (`startOfDayVN`, `endOfDayVN`, `getDatePrefixVN`) thay vì `setHours(0,0,0,0)` của local VPS.

### Bước 5: Tạo Controller
- Đường dẫn: `backend-nestjs/src/modules/[module-name]/[module-name].controller.ts`
- Xử lý HTTP Request/Response. Inject Service để thực thi logic. Thiết lập các Endpoints rõ ràng với Decorator của NestJS.
- Gắn Guards bảo vệ (`StaffJwtGuard`, `JwtAuthGuard`, `RolesGuard`) theo ma trận phân quyền.

### Bước 6: Đăng ký Module
- Đường dẫn: `backend-nestjs/src/modules/[module-name]/[module-name].module.ts`
- Khai báo Controllers, Providers (Service, Repository), và Imports (MongooseModule.forFeature).
- Sau đó, nhớ import module này vào `backend-nestjs/src/app.module.ts` (hoặc module cha tương ứng).
- Nếu module có cơ chế JWT Auth riêng, bắt buộc xác thực `audience` (`aud: 'internal'`) trong Strategy.

## 3. Quy tắc giao tiếp
- Luôn giải thích các bước đã làm bằng tiếng Việt.
- Giữ nguyên các thuật ngữ: Controller, Repository, DTO, Service, Module, Schema...
- Sau khi hoàn thành, báo cáo tóm tắt các file đã tạo/sửa.
