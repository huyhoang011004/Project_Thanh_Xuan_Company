# TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG (SRS & SDD)
## HỆ SINH THÁI CÔNG NGHỆ CÔNG TY THANH XUÂN (THANH XUAN COMPANY)

*Phiên bản: 2.0*  
*Cập nhật lần cuối: 28/09/2026*  
*Quy chuẩn kỹ thuật: Tuân thủ SOLID, Repository Pattern, Multi-Database Isolation, Clean Architecture*

---

## 1. YÊU CẦU NGHIỆP VỤ & TÍNH NĂNG (SRS - SYSTEM REQUIREMENTS SPECIFICATION)

### 1.1. Bối cảnh & Mục Tiêu Nghiệp Vụ
Công ty Thanh Xuân mở rộng quy mô hoạt động từ dịch vụ giặt sấy truyền thống sang hệ sinh thái đa dịch vụ:
1. **Dịch vụ Giặt Sấy Chuyên Nghiệp & Marketing SEO (`thanhxuanlaundry.com`)**:
   - Web B2C & B2B phục vụ khách hàng lẻ, spa, khách sạn, nhà hàng.
   - Hệ thống bài viết SEO, đặt lịch giặt trực tuyến, bảng giá, tra cứu đơn hàng, CRM lead marketing.
2. **Dịch vụ Chuyển Nhà Trọn Gói & Cho Thuê Xe Tải (`chuyennhatietkiem.vn`)**:
   - Khảo sát báo giá chuyển trọ sinh viên, chuyển chung cư, văn phòng.
   - Bảng cước vận tải xe tải 1.25 tấn, 2.4 tấn theo cự ly Km.
3. **Quản Lý Vận Hành Xưởng Nội Bộ (`noibo.thanhxuanlaundry.com`)**:
   - Quản lý phiếu giao nhận kép (đồ sạch / đồ bẩn) cho các chuỗi đối tác ẩm thực lớn: Pizza 4P's, Haidilao Hotpot, Golden Gate.
   - Đối soát số lượng khăn xám lau bàn, tạp dề, đồng phục theo từng chi nhánh.
   - Ghi nhận định mức sản lượng (Piecework) tính lương thợ xưởng (phân loại, gấp khăn, ủi ép, đóng gói).
   - Chấm công nhân sự xưởng và tài xế giao nhận.

### 1.2. Danh Sách Nghiệp Vụ Mới Hoàn Thành
- **Handover Module**:
  - Tạo biên bản giao nhận 2 chiều giữa tài xế xưởng và quản lý chi nhánh nhà hàng.
  - Theo dõi trạng thái: `PICKED_UP` (Lấy đồ bẩn), `IN_PROCESS` (Đang xử lý tại xưởng), `DELIVERED` (Giao trả đồ sạch hoàn tất).
- **Piecework Module**:
  - Ghi nhận chi tiết sản lượng theo từng thợ xưởng: loại công đoạn, loại khăn/đồng phục, số lượng, đơn giá và tự động tính tổng tiền công (`totalPay`).
- **Moving Quote Module**:
  - Tiếp nhận đơn khảo sát đồ đạc, địa chỉ đi/đến, loại căn hộ, thang máy và ghi chú khảo sát.

---

## 2. THIẾT KẾ KIẾN TRÚC & HỆ THỐNG (SDD - SYSTEM DESIGN DOCUMENT)

### 2.1. Cấu Trúc Tổng Thể Hệ Sinh Thái (Multi-Project Ecosystem)

```
Website_Thanh_Xuan_Company/
├── be-nestjs-thanhxuan/                  (Backend API NestJS duy nhất)
│   ├── src/
│   │   ├── common/                      (BaseRepository, Interceptors, Guards)
│   │   ├── config/                      (database.config.ts - 3 connection URIs)
│   │   ├── mail/                        (Dịch vụ gửi thông báo SMTP)
│   │   ├── modules/
│   │   │   ├── core/                    (upload, ai)
│   │   │   ├── laundry/                 (12 modules Giặt Là - DB: laundry_express)
│   │   │   ├── moving/                  (Module Chuyển Nhà - DB: moving_express)
│   │   │   └── internal/                (Module Vận Hành Nội Bộ - DB: internal_express)
│   │   └── app.module.ts                (Cấu hình 3 Mongoose Connections)
│
├── fe-nextjs-thanhxuan-laundry/          (Web Giặt Là thanhxuanlaundry.com - Next.js App Router)
├── fe-react-thanhxuan-internal/          (Web Vận Hành noibo.thanhxuanlaundry.com - React + Vite + Tailwind)
├── docker-compose.yml                    (Quản lý 4 container: mongodb, backend, frontend, internal_frontend)
└── docs/
    └── SRS_SDD.md                       (Tài liệu kiến trúc hệ thống hiện hành)
```

### 2.2. Thiết Kế 3 Cơ Sở Dữ Liệu MongoDB Độc Lập

| Tên Database | NestJS Connection | Module Phụ Trách | Collections |
| :--- | :--- | :--- | :--- |
| `laundry_express` | **Default Connection** (Không tên) | `src/modules/laundry/*` | `articles`, `categories`, `contacts`, `crm`, `orders`, `settings`, `users`, `campaigns`, `emailsequences`, `zalo` |
| `moving_express` | `MOVING_CONNECTION` | `src/modules/moving/*` | `moving_quotes`, `moving_services`, `moving_articles`, `moving_contacts` |
| `internal_express` | `INTERNAL_CONNECTION` | `src/modules/internal/*` | `handover_records`, `piecework_logs`, `partners`, `attendance_logs` |

### 2.3. Tuân Thủ Repository Pattern (Rule 4.2 của dự án)
Tất cả các Model thuộc Named Connection đều được inject tại tầng **Repository** kế thừa `BaseRepository<T>`, tầng **Service** chỉ gọi qua Repository:
- `MovingQuoteRepository extends BaseRepository<MovingQuoteDocument>`
  - Inject: `@InjectModel(MovingQuote.name, 'MOVING_CONNECTION')`
- `HandoverRecordRepository extends BaseRepository<HandoverRecordDocument>`
  - Inject: `@InjectModel(HandoverRecord.name, 'INTERNAL_CONNECTION')`
- `PieceworkLogRepository extends BaseRepository<PieceworkLogDocument>`
  - Inject: `@InjectModel(PieceworkLog.name, 'INTERNAL_CONNECTION')`

### 2.4. Đặc Tả API Contracts Mới

#### A. Nhóm API Chuyển Nhà (`/api/moving`)
- **POST `/api/moving/quotes`**:
  - Request Body:
    ```json
    {
      "customerName": "Nguyễn Văn A",
      "phoneNumber": "0987654321",
      "pickupAddress": "Tầng 5, Chung cư Royal City, Thanh Xuân, Hà Nội",
      "destinationAddress": "Số 25 ngõ 102 Khuất Duy Tiến, Hà Nội",
      "serviceType": "APARTMENT",
      "estimatedDistanceKm": 8.5,
      "hasElevator": true,
      "notes": "Có tủ lạnh 400L và bàn ăn mặt đá"
    }
    ```
  - Response Body: `201 Created` - Document đơn khảo sát được lưu vào database `moving_express`.
- **GET `/api/moving/quotes?limit=10`**: Lấy danh sách khảo sát mới nhất.

#### B. Nhóm API Vận Hành Nội Bộ (`/api/internal`)
- **POST `/api/internal/handover`**:
  - Request Body:
    ```json
    {
      "code": "GN-20260928-01",
      "partnerId": "65b...ObjectId",
      "partnerName": "Pizza 4P's - Phan Kế Bính",
      "driverName": "Trần Văn Bằng (Tài xế)",
      "receiverName": "Nguyễn Thị Mai (Quản lý nhà hàng)",
      "status": "DELIVERED",
      "items": [
        { "itemName": "Khăn xám lau bàn (Quy cách 100)", "soiledQuantity": 350, "cleanQuantity": 350 },
        { "itemName": "Tạp dề đen nhân viên", "soiledQuantity": 40, "cleanQuantity": 40 }
      ]
    }
    ```
  - Response Body: `201 Created` - Lưu vào database `internal_express`.
- **GET `/api/internal/handover/today`**: Lấy toàn bộ phiếu giao nhận phát sinh trong ngày hôm nay.
- **POST `/api/internal/piecework`**:
  - Request Body:
    ```json
    {
      "workerName": "Nguyễn Thị Lành (Thợ gấp)",
      "taskType": "FOLDING",
      "itemType": "Khăn xám 4P's",
      "quantity": 1200,
      "ratePerPiece": 150
    }
    ```
  - Response Body: `201 Created` - Tự động tính `totalPay = 180000 VNĐ`.
