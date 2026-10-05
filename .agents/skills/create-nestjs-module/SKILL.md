---
name: create-nestjs-module
description: Workflow chuẩn để tạo một Module Backend mới trong NestJS cho dự án Laundry Express Thanh Xuan, tuân thủ nghiêm ngặt Repository Pattern, Multi-Database (laundry_express, moving_express, internal_express), Clean Architecture và các nguyên tắc SOLID. Kích hoạt khi cần tạo API mới, thêm bảng CSDL mới, hoặc mở rộng nghiệp vụ Backend.
---

# Quy trình tạo Module Backend (NestJS Multi-Database)

Skill này hướng dẫn quy chuẩn kỹ thuật và các bước thực thi để tạo mới hoặc mở rộng một Module Backend trong ứng dụng `be-nestjs-thanhxuan`.

---

## 1. Nguyên tắc kiến trúc cốt lõi

1. **Phân tầng nghiêm ngặt (Strict Layering):**
   $$\text{Client Request} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Repository} \longrightarrow \text{Database}$$
   - **Tuyệt đối KHÔNG** gọi Mongoose Model trực tiếp từ Service hoặc Controller.
   - Mọi thao tác truy vấn DB bắt buộc thông qua lớp `Repository` kế thừa `BaseRepository<TDocument>`.
2. **Multi-Database Connection:**
   Hệ thống vận hành 3 cơ sở dữ liệu MongoDB độc lập:
   - **`laundry_express` (Default Connection):** Các nghiệp vụ giặt là B2C/B2B (`src/modules/laundry/*`).
   - **`moving_express` (`MOVING_CONNECTION`):** Dịch vụ chuyển nhà và vận tải (`src/modules/moving/*`).
   - **`internal_express` (`INTERNAL_CONNECTION`):** Vận hành xưởng, giao nhận, chấm công, khoán việc (`src/modules/internal/*`).
3. **Quy chuẩn Code:**
   - Đầu file code mới luôn có: `// Adhering to SOLID & Design Patterns`.
   - TypeScript Strict Mode: **Không dùng `any`**; dùng `unknown` có type guard hoặc định nghĩa interface/type/DTO rõ ràng.
   - Biến/hàm: `camelCase`; Class: `PascalCase`; File: `kebab-case`.
   - Timezone: Chuẩn hóa thời gian (sinh mã phiếu, ca kíp, báo cáo, chấm công) theo múi giờ `Asia/Ho_Chi_Minh` qua helper (`startOfDayVN`, `endOfDayVN`, `getDatePrefixVN`). Tuyệt đối không dùng `setHours(0,0,0,0)`.

---

## 2. Cấu trúc thư mục chuẩn của một Module

Module phải được đặt đúng phân hệ tương ứng:
- Giặt là: `be-nestjs-thanhxuan/src/modules/laundry/<module-name>/`
- Chuyển nhà: `be-nestjs-thanhxuan/src/modules/moving/<module-name>/`
- Vận hành nội bộ: `be-nestjs-thanhxuan/src/modules/internal/<module-name>/`
- Tiện ích dùng chung: `be-nestjs-thanhxuan/src/modules/core/<module-name>/`

```
<module-name>/
├── dto/
│   ├── create-<module-name>.dto.ts
│   ├── update-<module-name>.dto.ts
│   ├── query-<module-name>.dto.ts
│   └── <module-name>-response.dto.ts
├── schemas/
│   └── <module-name>.schema.ts
├── repositories/
│   └── <module-name>.repository.ts
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── <module-name>.module.ts
└── specs/
    ├── <module-name>.controller.spec.ts
    └── <module-name>.service.spec.ts
```

---

## 3. Quy trình thực thi từng bước (Workflow)

### Bước 1: Tạo Schema (Mongoose)
- **Đường dẫn:** `src/modules/<domain>/<module-name>/schemas/<module-name>.schema.ts`
- **Yêu cầu:**
  - Dùng `@Schema({ timestamps: true, collection: '<collection_plural>' })`.
  - Đánh Index (`@Prop({ index: true })` hoặc `Schema.index(...)`) cho các trường thường xuyên filter, sort, search.
  - Khai báo kiểu Document rõ ràng: `export type <Entity>Document = HydratedDocument<<Entity>>;`.

```typescript
// Adhering to SOLID & Design Patterns
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PartnerDocument = HydratedDocument<Partner>;

@Schema({ timestamps: true, collection: 'partners' })
export class Partner {
  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const PartnerSchema = SchemaFactory.createForClass(Partner);
PartnerSchema.index({ createdAt: -1 });
```

### Bước 2: Tạo DTOs (Data Transfer Objects)
- **Đường dẫn:** `src/modules/<domain>/<module-name>/dto/`
- **Quy tắc bắt buộc:**
  1. Mọi `@Body()` và `@Query()` phải dùng **Class DTO** (không dùng interface hoặc `Partial<T>`).
  2. Dùng đầy đủ validation decorators từ `class-validator` và transform từ `class-transformer`.
  3. **Nested Object Decorators (Bộ 3 bắt buộc):** Khi có object con hoặc array object con, bắt buộc đủ 3 decorators:
     ```typescript
     @IsDefined()
     @ValidateNested({ each: true })
     @Type(() => ItemDetailDto)
     items: ItemDetailDto[];
     ```
  4. Phân trang & Filter: Dùng `query-<module-name>.dto.ts` với `@IsOptional()`, giới hạn `limit` tối đa (mặc định 10, tối đa 100), chuyển đổi số nguyên với `@Type(() => Number)` và `@IsInt()`.
  5. Response DTO: Không trả trực tiếp object Mongoose có chứa field nhạy cảm (`password`, `token`, `secretKey`).

### Bước 3: Tạo Repository Pattern
- **Đường dẫn:** `src/modules/<domain>/<module-name>/repositories/<module-name>.repository.ts`
- **Quy tắc bắt buộc:**
  - Kế thừa `BaseRepository<<Entity>Document>`.
  - Inject đúng Connection tương ứng:
    - Laundry: `@InjectModel(<Entity>.name)`
    - Moving: `@InjectModel(<Entity>.name, 'MOVING_CONNECTION')`
    - Internal: `@InjectModel(<Entity>.name, 'INTERNAL_CONNECTION')`
  - Query chỉ đọc: Bắt buộc dùng `.lean()` và `.select(...)` để tối ưu RAM.
  - Phân trang chuẩn xác trả về `{ data: T[], total: number, page: number, totalPages: number }`.

```typescript
// Adhering to SOLID & Design Patterns
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@/common/repositories/base.repository';
import { Partner, PartnerDocument } from '../schemas/partner.schema';

@Injectable()
export class PartnerRepository extends BaseRepository<PartnerDocument> {
  constructor(
    @InjectModel(Partner.name, 'INTERNAL_CONNECTION')
    partnerModel: Model<PartnerDocument>,
  ) {
    super(partnerModel);
  }

  async findActivePartners(): Promise<PartnerDocument[]> {
    return this.model.find({ isActive: true }).select('name code').lean().exec();
  }
}
```

### Bước 4: Tạo Service (Business Logic)
- **Đường dẫn:** `src/modules/<domain>/<module-name>/<module-name>.service.ts`
- **Quy tắc bắt buộc:**
  - Inject `PartnerRepository`, tuyệt đối không inject `Model` Mongoose trực tiếp.
  - **Defensive Programming:** Luôn dùng Optional Chaining (`?.`) và Nullish Coalescing (`??`) để tránh `TypeError: Cannot read property of undefined` (HTTP 500).
  - **Exception Handling:** Sử dụng đúng Exception chuẩn của NestJS:
    - Không tìm thấy tài nguyên: `throw new NotFoundException('Không tìm thấy đối tác với mã đã cho');`
    - Dữ liệu trùng lặp/vi phạm ràng buộc: `throw new ConflictException('Mã đối tác đã tồn tại');`
    - Dữ liệu gửi lên sai quy tắc: `throw new BadRequestException('Thông tin không hợp lệ');`
    - Không có quyền: `throw new ForbiddenException('Bạn không có quyền thực hiện');`
  - **Timezone Helper:** Xử lý ngày giờ bắt đầu/kết thúc báo cáo, sinh mã theo ngày qua helper giờ Việt Nam:
    ```typescript
    import { startOfDayVN, endOfDayVN, getDatePrefixVN } from '@/common/helpers/timezone.helper';
    ```

### Bước 5: Tạo Controller (API Endpoints)
- **Đường dẫn:** `src/modules/<domain>/<module-name>/<module-name>.controller.ts`
- **Quy tắc bắt buộc:**
  - Định tuyến rõ ràng qua `@Controller('<prefix>')` (ví dụ: `@Controller('internal/partners')` hoặc `@Controller('api/v1/orders')`).
  - Gắn Guard bảo vệ tương ứng:
    - Customer/Admin chung: `@UseGuards(JwtAuthGuard)`
    - Phân hệ Nội Bộ Xưởng: `@UseGuards(StaffJwtGuard)` với kiểm tra `aud: 'internal'`.
    - Phân quyền theo vai trò: `@UseGuards(RolesGuard)` + `@Roles(StaffRole.MANAGER, StaffRole.ADMIN)`.
  - Sử dụng HTTP status code chuẩn: `201 Created` cho POST tạo mới, `200 OK` cho GET/PATCH/PUT, `204 No Content` cho DELETE.

### Bước 6: Đăng ký Module & Tích hợp
- **Đường dẫn:** `src/modules/<domain>/<module-name>/<module-name>.module.ts`
- Khai báo Schema với đúng named connection:
  ```typescript
  MongooseModule.forFeature(
    [{ name: Partner.name, schema: PartnerSchema }],
    'INTERNAL_CONNECTION', // hoặc 'MOVING_CONNECTION', để trống nếu là Laundry
  )
  ```
- Khai báo `controllers: [PartnerController]`, `providers: [PartnerService, PartnerRepository]`.
- Export `PartnerService` hoặc `PartnerRepository` nếu module khác cần sử dụng.
- Đăng ký module này vào Module cha của phân hệ (`InternalModule`, `MovingModule`, `LaundryModule` hoặc `AppModule`).

### Bước 7: Viết Unit Test Hồi Quy
- Tạo file `.spec.ts` cho Service và Controller với mock repository/service đầy đủ, đảm bảo `pnpm test` vượt qua.

---

## 4. Checklist Kiểm Định Trước Khi Hoàn Tất
- [ ] Schema có Index cho các trường hay tìm kiếm, không query bằng filter thô từ client.
- [ ] DTO có class-validator đầy đủ; Nested object có đủ bộ 3: `@IsDefined()`, `@ValidateNested()`, `@Type()`.
- [ ] Mọi truy vấn DB nằm trong Repository kế thừa `BaseRepository`, sử dụng `.lean()`.
- [ ] Service dùng Defensive Programming (`?.`, `??`) và ném exception chuẩn NestJS có thông điệp tiếng Việt rõ nghĩa.
- [ ] Xử lý ngày giờ tuân thủ múi giờ `Asia/Ho_Chi_Minh`.
- [ ] Chạy typecheck và build xác thực:
  ```bash
  cd be-nestjs-thanhxuan && pnpm build
  ```
