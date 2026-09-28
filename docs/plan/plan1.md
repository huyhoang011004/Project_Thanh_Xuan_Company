# Plan 1: Tái Cấu Trúc Hệ Sinh Thái Thanh Xuân Company - Đa Database (3 Named Connections), Tái Cấu Trúc Thư Mục & Khởi Tạo Frontend Nội Bộ

## 1. Overview & Affected Files

### Mục tiêu tổng quan
1. **Nâng cấp Hệ thống thành Thanh Xuân Multi-Service Architecture**:
   - Đổi tên thư mục gốc workspace: `Website_Laundry_Express_Thanh_Xuan` -> `Website_Thanh_Xuan_Company`.
   - Chuẩn hóa tên thư mục Backend: `backend-nestjs` -> `be-nestjs-thanhxuan`.
   - Chuẩn hóa tên thư mục Frontend Giặt Là: `frontend-nextjs` -> `fe-nextjs-thanhxuan-laundry`.
   - Khởi tạo thư mục ứng dụng Frontend Nội Bộ Vận Hành Xưởng: `fe-react-thanhxuan-internal` phục vụ `noibo.thanhxuanlaundry.com` (Giao nhận Pizza 4P's, Haidilao, Chấm công, Tính lương sản lượng thợ gấp khăn).
2. **Bảo toàn 100% Production Giặt Là (Zero Breaking Change)**:
   - Giữ nguyên kết nối tới `laundry_express` làm **Default Connection** (không đặt `connectionName`). Toàn bộ 12 module giặt là giữ nguyên vẹn cách gọi `@InjectModel(T.name)`.
3. **Mở rộng 2 Named Connections trong Backend**:
   - `MOVING_CONNECTION` trỏ tới database `moving_express` phục vụ `chuyennhatietkiem.vn`.
   - `INTERNAL_CONNECTION` trỏ tới database `internal_express` phục vụ `noibo.thanhxuanlaundry.com`.
4. **Tổ chức 4 nhóm module Backend (`be-nestjs-thanhxuan/src/modules/`)**:
   - `core/`: Module hạ tầng dùng chung (`upload`, `ai`).
   - `laundry/`: Gom 12 module giặt là hiện tại.
   - `moving/`: Module Web Chuyển Nhà (`quotes`, `services`, `articles`, `moving.module.ts`).
   - `internal/`: Module Web Nội Bộ Vận Hành (`handover`, `piecework`, `attendance`, `partners`, `staff-auth`, `internal.module.ts`).
5. **Tuân thủ chuẩn SOLID & Repository Pattern (Rule 4.2 của dự án)**:
   - Toàn bộ Model mới của `MOVING_CONNECTION` và `INTERNAL_CONNECTION` được inject vào tầng **Repository** (kế thừa `BaseRepository`), tuyệt đối không inject trực tiếp vào Service/Controller.

---

### Danh sách Files & Thư Mục Bị Ảnh Hưởng

#### A. Cấu Trúc Thư Mục Cấp Root & Hệ Thống
- [RENAME] `Website_Laundry_Express_Thanh_Xuan` -> `Website_Thanh_Xuan_Company` (Thư mục gốc)
- [RENAME] `backend-nestjs/` -> `be-nestjs-thanhxuan/`
- [RENAME] `frontend-nextjs/` -> `fe-nextjs-thanhxuan-laundry/`
- [NEW DIR] `fe-react-thanhxuan-internal/` (Khởi tạo dự án React/Vite + Tailwind CSS + Shadcn UI cho web nội bộ)
- [MODIFY] `docker-compose.yml`: Cập nhật build context hoặc volume mapping trỏ theo tên thư mục mới, bổ sung service container cho `internal_frontend`.
- [MODIFY] `.env.example` & `.env`: Cập nhật cổng port và URI cho 3 Database (`MONGODB_URI`, `MONGODB_MOVING_URI`, `MONGODB_INTERNAL_URI`) cùng port cho Frontend Nội bộ (`PORT_FE_INTERNAL=3001`).

#### B. Backend Configuration & Connection (`be-nestjs-thanhxuan`)
- [MODIFY] `src/config/database.config.ts`: Thêm `movingUri` và `internalUri`.
- [MODIFY] `src/app.module.ts`: Cấu hình 3 Mongoose connections và liên kết các module `core`, `laundry`, `moving`, `internal`.

#### C. Backend Modules Restructure (`be-nestjs-thanhxuan/src/modules`)
- [MOVE] `src/modules/upload` -> `src/modules/core/upload`
- [MOVE] `src/modules/ai` -> `src/modules/core/ai`
- [MOVE] 12 folders giặt là -> `src/modules/laundry/`
- [MODIFY] Cập nhật đường dẫn import tương đối giữa Core, Laundry và Common.

#### D. Moving Module Tạo Mới (`be-nestjs-thanhxuan/src/modules/moving` - DB: `moving_express`)
- [NEW] `src/modules/moving/moving.constants.ts` (`MOVING_CONNECTION`)
- [NEW] `src/modules/moving/schemas/moving-quote.schema.ts`
- [NEW] `src/modules/moving/schemas/moving-service.schema.ts`
- [NEW] `src/modules/moving/repositories/moving-quote.repository.ts`
- [NEW] `src/modules/moving/moving.service.ts`
- [NEW] `src/modules/moving/moving.controller.ts`
- [NEW] `src/modules/moving/moving.module.ts`

#### E. Internal Module Tạo Mới (`be-nestjs-thanhxuan/src/modules/internal` - DB: `internal_express`)
- [NEW] `src/modules/internal/internal.constants.ts` (`INTERNAL_CONNECTION`)
- [NEW] `src/modules/internal/schemas/handover-record.schema.ts` (Biên bản giao nhận 2 chiều Pizza 4P's, Haidilao)
- [NEW] `src/modules/internal/schemas/piecework-log.schema.ts` (Ghi nhận sản lượng thợ gấp khăn xám, tạp dề)
- [NEW] `src/modules/internal/schemas/attendance-log.schema.ts` (Chấm công nhân sự xưởng)
- [NEW] `src/modules/internal/schemas/partner.schema.ts` (Đối tác nhà hàng / chi nhánh)
- [NEW] `src/modules/internal/repositories/handover-record.repository.ts`
- [NEW] `src/modules/internal/repositories/piecework-log.repository.ts`
- [NEW] `src/modules/internal/internal.service.ts`
- [NEW] `src/modules/internal/internal.controller.ts`
- [NEW] `src/modules/internal/internal.module.ts`

#### F. Frontend Nội Bộ Khởi Tạo (`fe-react-thanhxuan-internal`)
- [NEW] Setup ứng dụng Frontend chuyên biệt cho vận hành xưởng:
  - Công nghệ: React 18+ (Vite) / Next.js, Tailwind CSS, Lucide Icons, Shadcn UI.
  - Mục tiêu màn hình:
    1. Giao nhận đồ sạch/bẩn (Scan QR / Phiếu giao nhận theo từng nhà hàng đối tác).
    2. Chấm công nhân sự xưởng & tài xế giao nhận.
    3. Nhập sản lượng công việc (piecework) tính tiền lương thợ gấp khăn, ủi đồ.

---

## 2. Technical Approach

### Sơ Đồ Kiến Trúc Hệ Sinh Thái Thanh Xuân Company

```
+----------------------------------------------------------------------------------------------------+
|                                    Website_Thanh_Xuan_Company                                      |
+----------------------------------------------------------------------------------------------------+
       |                                     |                                     |
+------v-----------------------+   +---------v-------------------+   +-------------v-----------------+
| fe-nextjs-thanhxuan-laundry  |   | fe-react-thanhxuan-internal |   | fe-nextjs-thanhxuan-moving    |
| (Web Giặt Là & SEO B2C/B2B)  |   | (Vận hành xưởng nội bộ)     |   | (Tương lai: Web Chuyển Nhà)   |
| Domain: thanhxuanlaundry.com |   | Domain: noibo...            |   | Domain: chuyennhatietkiem.vn  |
| Port: 3000                   |   | Port: 3001                  |   | Port: 3002                    |
+--------------+---------------+   +-------------+---------------+   +-------------+-----------------+
               |                                 |                                 |
               +---------------------------------+---------------------------------+
                                                 | (Gọi REST API qua các route chuyên biệt)
                                  +--------------v----------------+
                                  |      be-nestjs-thanhxuan      |
                                  |      Port: 5001               |
                                  +--------------+----------------+
                                                 |
         +---------------------------------------+---------------------------------------+
         |                                       |                                       |
+--------v----------------------+       +--------v----------------------+       +--------v----------------------+
| Default Connection (Không tên)|       | MOVING_CONNECTION             |       | INTERNAL_CONNECTION           |
| Database: laundry_express     |       | Database: moving_express      |       | Database: internal_express    |
+--------+----------------------+       +--------+----------------------+       +--------+----------------------+
         |                                       |                                       |
+--------v----------------------+       +--------v----------------------+       +--------v----------------------+
| 12 Laundry Modules            |       | Moving Module                 |       | Internal Module               |
| (Articles, Orders, CRM...)    |       | (Quotes, Truck Services...)   |       | (Handover, Piecework...)      |
| @InjectModel(Name)            |       | @InjectModel(Name, MOVING)    |       | @InjectModel(Name, INTERNAL)  |
| -> Giữ nguyên 100% Prod cũ    |       | -> MovingQuoteRepository      |       | -> HandoverRecordRepository   |
+-------------------------------+       +-------------------------------+       +-------------------------------+
```

### Đặc tả Interface & Cấu Hình

#### 1. Config Database Contract (`database.config.ts`)
```typescript
export interface DatabaseConfig {
  uri: string;           // Default connection (laundry_express)
  movingUri: string;     // Named connection: MOVING_CONNECTION (moving_express)
  internalUri: string;   // Named connection: INTERNAL_CONNECTION (internal_express)
}
```

#### 2. Cấu Hình 3 Mongoose Connection Trong `AppModule`
```typescript
// 1. KẾT NỐI MẶC ĐỊNH: laundry_express (Giữ nguyên không gán tên)
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('database.uri'),
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
  }),
  inject: [ConfigService],
}),

// 2. KẾT NỐI 2: moving_express
MongooseModule.forRootAsync({
  connectionName: 'MOVING_CONNECTION',
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('database.movingUri'),
    maxPoolSize: 30,
    serverSelectionTimeoutMS: 5000,
  }),
  inject: [ConfigService],
}),

// 3. KẾT NỐI 3: internal_express
MongooseModule.forRootAsync({
  connectionName: 'INTERNAL_CONNECTION',
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('database.internalUri'),
    maxPoolSize: 30,
    serverSelectionTimeoutMS: 5000,
  }),
  inject: [ConfigService],
})
```

#### 3. Repository Pattern Với Named Connection (Tuân thủ Rule 4.2)
```typescript
@Injectable()
export class HandoverRecordRepository extends BaseRepository<HandoverRecordDocument> {
  constructor(
    @InjectModel(HandoverRecord.name, 'INTERNAL_CONNECTION')
    recordModel: Model<HandoverRecordDocument>,
  ) {
    super(recordModel);
  }
}
```

---

## 3. Implementation Tasks (Checklist)

### Giai Đoạn 1: Chuẩn Bị & Rename Thư Mục Hệ Thống
- [x] Task 1.1: Tạm dừng các tiến trình `pnpm dev` đang chạy ở background terminal để giải phóng file locks trên Windows.
- [x] Task 1.2: Đổi tên `backend-nestjs` -> `be-nestjs-thanhxuan`.
- [x] Task 1.3: Đổi tên `frontend-nextjs` -> `fe-nextjs-thanhxuan-laundry`.
- [x] Task 1.4: Cập nhật file `docker-compose.yml` (sửa đường dẫn context `backend-nestjs` và `frontend-nextjs` thành tên mới).
- [x] Task 1.5: Khởi tạo khung thư mục `fe-react-thanhxuan-internal` với template Vite + React + TypeScript + Tailwind CSS.
- [x] Task 1.6: Chuẩn bị lệnh đổi tên thư mục gốc workspace `Website_Laundry_Express_Thanh_Xuan` -> `Website_Thanh_Xuan_Company`.

### Giai Đoạn 2: Cập Nhật Cấu Hình Biến Môi Trường
- [x] Task 2.1: [`.env.example` & `.env`] - Bổ sung `MONGODB_MOVING_URI` và `MONGODB_INTERNAL_URI`, cấu hình `PORT_FE_INTERNAL=3001`.
- [x] Task 2.2: [`be-nestjs-thanhxuan/src/config/database.config.ts`] - Đăng ký thêm `movingUri` và `internalUri` với fallback an toàn.

### Giai Đoạn 3: Tái Cấu Trúc Thư Mục `be-nestjs-thanhxuan/src/modules`
- [x] Task 3.1: Tạo các thư mục cha: `src/modules/core`, `src/modules/laundry`, `src/modules/moving`, `src/modules/internal`.
- [x] Task 3.2: Di chuyển `upload` và `ai` vào `src/modules/core/`.
- [x] Task 3.3: Di chuyển 12 module cũ vào `src/modules/laundry/`.
- [x] Task 3.4: Sửa các import tương đối giữa Core và Laundry (UploadService, ArticlesService, `../../../common/...`).
- [x] Task 3.5: Cập nhật các import trong `be-nestjs-thanhxuan/src/app.module.ts`.

### Giai Đoạn 4: Cấu Hình 3 Mongoose Connections Trong `app.module.ts`
- [x] Task 4.1: Giữ nguyên Default Connection (không có `connectionName`) trỏ tới database giặt là.
- [x] Task 4.2: Thêm `MongooseModule.forRootAsync` với `connectionName: 'MOVING_CONNECTION'`.
- [x] Task 4.3: Thêm `MongooseModule.forRootAsync` với `connectionName: 'INTERNAL_CONNECTION'`.

### Giai Đoạn 5: Khởi Tạo Moving Module (`moving_express`)
- [x] Task 5.1: Tạo `src/modules/moving/moving.constants.ts`.
- [x] Task 5.2: Tạo Schemas: `moving-quote.schema.ts`, `moving-service.schema.ts`.
- [x] Task 5.3: Đăng ký Schemas vào `MongooseModule.forFeature(..., MOVING_CONNECTION)`.
- [x] Task 5.4: Tạo `MovingQuoteRepository` kế thừa `BaseRepository` inject model từ `MOVING_CONNECTION`.
- [x] Task 5.5: Tạo `MovingService` inject Repository và `MovingController`.
- [x] Task 5.6: Đăng ký `MovingModule` vào `AppModule`.

### Giai Đoạn 6: Khởi Tạo Internal Module (`internal_express`)
- [x] Task 6.1: Tạo `src/modules/internal/internal.constants.ts`.
- [x] Task 6.2: Tạo Schemas: `handover-record.schema.ts`, `piecework-log.schema.ts`, `partner.schema.ts`.
- [x] Task 6.3: Đăng ký Schemas vào `MongooseModule.forFeature(..., INTERNAL_CONNECTION)`.
- [x] Task 6.4: Tạo `HandoverRecordRepository`, `PieceworkLogRepository` kế thừa `BaseRepository`.
- [x] Task 6.5: Tạo `InternalService` và `InternalController`.
- [x] Task 6.6: Đăng ký `InternalModule` vào `AppModule`.

### Giai Đoạn 7: Khởi Tạo Frontend Nội Bộ (`fe-react-thanhxuan-internal`)
- [x] Task 7.1: Cấu hình `package.json`, `vite.config.ts`, `tsconfig.json`, Tailwind CSS.
- [x] Task 7.2: Thiết lập cấu trúc giao diện vận hành xưởng: Phiếu giao nhận kép, Sản lượng thợ, Chấm công, Đối tác.
- [x] Task 7.3: Tạo cấu hình API Client kết nối tới backend port 5001.

### Giai Đoạn 8: Đổi Tên Thư Mục Gốc & Hoàn Tất Verification
- [x] Task 8.1: Chạy build thành công toàn bộ Backend và cả 2 Frontend.
- [x] Task 8.2: Đồng bộ tài liệu kỹ thuật SRS & SDD tại `docs/SRS_SDD.md`.


---

## 4. Verification & Testing

### Lệnh Kiểm Tra Hệ Thống
```bash
# 1. Kiểm tra build Backend NestJS mới (be-nestjs-thanhxuan)
cd be-nestjs-thanhxuan
pnpm exec tsc --noEmit
pnpm run build

# 2. Kiểm tra Frontend Giặt Là (fe-nextjs-thanhxuan-laundry)
cd ../fe-nextjs-thanhxuan-laundry
pnpm run build

# 3. Kiểm tra Frontend Nội Bộ (fe-react-thanhxuan-internal)
cd ../fe-react-thanhxuan-internal
pnpm run build
```

### Kịch Bản Kiểm Thử (Test Scenarios)
1. **Kiểm tra Production Giặt Là (Default Connection)**:
   - Chạy `be-nestjs-thanhxuan` và gọi API `GET /api/articles`, `POST /api/contacts`.
   - Kết quả: Dữ liệu đọc/ghi chính xác vào database `laundry_express`, 100% không đổi.
2. **Kiểm tra Named Connection Chuyển Nhà (`moving_express`)**:
   - Gọi API khảo sát chuyển nhà.
   - Kết quả: Dữ liệu được ghi vào database `moving_express`.
3. **Kiểm tra Named Connection Nội Bộ (`internal_express`)**:
   - Gọi API tạo biên bản giao nhận từ `fe-react-thanhxuan-internal`.
   - Kết quả: Dữ liệu được lưu vào database `internal_express`.

---

## 5. Risks & Rollback

### Rủi ro tiềm ẩn & Biện pháp phòng ngừa
1. **File Locks trên Windows khi Rename Thư Mục**:
   - Hai tiến trình terminal `pnpm dev` đang chạy sẽ khóa thư mục `backend-nestjs` và `frontend-nextjs`.
   - *Phòng ngừa*: Phải dừng (kill) cả 2 background task terminal trước khi thực hiện lệnh đổi tên.
2. **Đổi tên Thư Mục Gốc Workspace**:
   - Đổi `Website_Laundry_Express_Thanh_Xuan` thành `Website_Thanh_Xuan_Company` sẽ làm thay đổi đường dẫn tuyệt đối của toàn bộ IDE và Antigravity workspace URI.
   - *Phòng ngừa*: Ưu tiên rename các thư mục con bên trong trước (`be-nestjs-thanhxuan`, `fe-nextjs-thanhxuan-laundry`, `fe-react-thanhxuan-internal`). Khi đổi tên thư mục gốc, người dùng sẽ mở lại IDE tại thư mục mới.
3. **Quá tải tài nguyên khi chạy đồng thời 2 Frontend + 1 Backend + MongoDB**:
   - *Phòng ngừa*: Cấu hình memory limits hợp lý trong `docker-compose.yml`.
