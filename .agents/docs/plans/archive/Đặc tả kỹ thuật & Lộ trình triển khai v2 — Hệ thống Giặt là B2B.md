# Đặc tả kỹ thuật & Lộ trình triển khai v2

**Hệ thống Giặt là Cao cấp, Chuyển nhà & Quản lý Xưởng Vận hành B2B (Multi-tenant, Modular Monolith)** — dành cho Claude Agent đọc và lập trình tuần tự theo Phase ở mục 13.

**Nền tảng:** 1 VPS Ubuntu (2 vCPU, 4GB RAM, 40GB SSD). **Mục tiêu:** RAM toàn hệ thống < 2GB; cấu trúc Modular Monolith để sau này tách module sang VPS riêng không downtime.

## 0. Thay đổi so với v1

- Thay `staff-auth` đơn giản bằng hệ thống tài khoản đầy đủ: đăng ký + OTP email + phê duyệt + phân quyền (RBAC) 8 vai trò.
- Phiếu giao nhận thành máy trạng thái: nhà hàng đếm và ký, shipper giao/nhận, đếm lại tại xưởng, quản lý nhà hàng kiểm đủ/thiếu/thừa và ký nhận.
- Thêm module: chấm công kèm ảnh, sản lượng, xăng xe, bảng lương, báo cáo/xuất file, thông báo, nhật ký chỉnh sửa (audit).
- **Quản lý Xưởng (Manager) không được xem bất kỳ dữ liệu lương, tiền công, đơn giá công khoán, tiền xăng.**
- Web giặt là (`laundry`) giữ nguyên 100%. Mảng chuyển nhà (`moving`) giữ nguyên đặc tả v1, làm sau phần nội bộ.

## 1. Kiến trúc tổng quan

```
[NGINX] 80/443 + SSL Let's Encrypt
 ├─ thanhxuanlaundry.com        -> Next.js standalone :3000 (container, <=250MB)
 ├─ chuyennhatietkiem.vn        -> Next.js standalone :3002 (container, <=250MB)
 ├─ noibo.thanhxuanlaundry.com  -> file tĩnh /var/www/noibo/dist (PWA, 0 MB RAM)
 └─ api.thanhxuanlaundry.com    -> NestJS :5001 (container, <=512MB)
        ├─ /api/v1/laundry/*   (public)
        ├─ /api/v1/moving/*    (public)
        └─ /api/v1/internal/*  (JWT + RBAC)
                 |
      MongoDB 7.0 (<=800MB, --wiredTigerCacheSizeGB 0.5)
        ├─ laundry_express   (connection mặc định, giữ nguyên)
        ├─ moving_express    (MOVING_CONNECTION)
        └─ internal_express  (INTERNAL_CONNECTION)
Volume ngoài container: /var/app/uploads (ảnh) — chỉ phục vụ qua API có xác thực
```

## 2. Vai trò & phân quyền

### 2.1 Vai trò

| Mã | Tên | Cách có tài khoản |
| --- | --- | --- |
| ADMIN | Quản trị viên | Seed ban đầu / Admin khác tạo |
| MANAGER (MG) | Quản lý Xưởng | Admin cấp |
| ACCOUNTANT (AC) | Kế toán | Admin cấp |
| WAREHOUSE\_MANAGER (WM) | Quản lý kho | Admin cấp |
| RESTAURANT\_MANAGER (RM) | Quản lý nhà hàng | Admin cấp, gắn 1 chi nhánh (partner) |
| SHIPPER (SH) | Nhân viên giao hàng | Tự đăng ký + được duyệt |
| WORKER (WK) | Nhân viên xưởng | Tự đăng ký + được duyệt |
| RESTAURANT\_STAFF (RS) | Nhân viên nhà hàng | Tự đăng ký + được duyệt, chọn chi nhánh |

### 2.2 Quy tắc phân quyền

- Chỉ 3 vai trò được tự đăng ký: SHIPPER, WORKER, RESTAURANT\_STAFF. Endpoint đăng ký phải từ chối (400) mọi vai trò khác, không tin dữ liệu từ client.
- **Phạm vi dữ liệu (scope):** RS/RM chỉ truy cập chi nhánh (`partnerId`) của mình; SH chỉ thấy phiếu được phân công cho mình; WK chỉ thấy dữ liệu của mình.
- **Phân cấp vận hành:** ADMIN ⊇ MANAGER ⊇ WAREHOUSE\_MANAGER. MANAGER không có quyền `pay.*`. ADMIN có tất cả.
- **Thao tác hộ ("hộ" trong ma trận):** ADMIN/MANAGER/WAREHOUSE\_MANAGER được nhập thay (đếm, giao, ký nhận...). Bản ghi gắn cờ `onBehalfOf` và ghi audit.
- Phân quyền theo permission code (`@Permissions('handover.edit')`), ánh xạ role -> permission đặt trong một file `permissions.map.ts`; không hardcode role trong controller.
- **Lọc trường ở server:** response cho vai trò không có quyền `pay.view` phải loại mọi trường tiền (`hourly_rate`, `folding_rate_worker`, `rate_snapshot`, `subtotal`, `total_earnings`, payslip, số tiền xăng). Dùng serializer/interceptor, không dựa vào FE.

### 2.3 Ma trận quyền

✓ = có, – = không, hộ = chỉ thao tác hộ có audit.

| Chức năng | RS | RM | SH | WK | WM | AC | MG | AD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Đếm đồ bẩn tại nhà hàng + ký | ✓ | ✓ | – | – | hộ | – | hộ | ✓ |
| Xem đồ đã giặt/đã giao theo tháng (chi nhánh mình) | ✓ | ✓ | – | – | ✓ | ✓ | ✓ | ✓ |
| Duyệt tài khoản nhân viên nhà hàng | – | ✓ (cùng chi nhánh) | – | – | ✓ | – | ✓ | ✓ |
| Duyệt tài khoản Shipper/Worker | – | – | – | – | ✓ | – | ✓ | ✓ |
| Kiểm đủ/thiếu/thừa + ký nhận hàng | – | ✓ | – | – | hộ | – | hộ | ✓ |
| Ghi đồ sạch sẽ giao | – | – | – | – | ✓ | – | ✓ | ✓ |
| Giao/nhận + ký (chuyến của mình) | – | – | ✓ | – | hộ | – | hộ | ✓ |
| Sửa ô giao nhận (có audit + nhãn "đã sửa bởi") | – | – | ✓ | – | ✓ | – | ✓ | ✓ |
| Yêu cầu đếm lại kèm ảnh bao | – | – | ✓ | – | ✓ | – | ✓ | ✓ |
| Thực hiện đếm lại tại xưởng | – | – | – | – | ✓ | – | ✓ | ✓ |
| Tải ảnh/phiếu giao nhận hôm nay | – | – | ✓ | – | ✓ | – | ✓ | ✓ |
| Check-in/out + ghi sản lượng | – | – | – | ✓ | – | – | – | – |
| Duyệt/sửa chấm công, xác nhận sản lượng | – | – | – | – | – | – | ✓ | ✓ |
| Gửi chi phí xăng | – | – | ✓ | – | – | – | – | – |
| Duyệt xăng, xem tổng xăng | – | – | – | – | – | ✓ | – | ✓ |
| Báo cáo tổng hợp đồ bẩn/sạch theo 1 hoặc nhiều nhà + xuất | – | – | – | – | ✓ | ✓ | ✓ | ✓ |
| Báo cáo chi tiết từng phần + xuất (không gồm tiền lương) | – | – | – | – | – | – | ✓ | ✓ |
| Báo cáo đối soát tháng với nhà hàng (có đơn giá khách) | – | – | – | – | – | ✓ | ✓ | ✓ |
| Quản lý đối tác, danh mục đồ, đơn giá thu khách | – | – | – | – | xem | ✓ | ✓ | ✓ |
| Đơn giá công khoán, hệ số/lương giờ từng người | – | – | – | – | – | ✓ | – | ✓ |
| Tính lương, chốt kỳ, xuất bảng lương | – | – | – | – | – | ✓ | – | ✓ |
| Xem phiếu lương của chính mình | – | – | ✓ | ✓ | – | – | – | – |
| Khóa/mở khóa tài khoản cấp nhân viên | – | – | – | – | – | – | ✓ | ✓ |
| Tạo tài khoản cấp quản lý, đổi vai trò, đặt lại mật khẩu | – | – | – | – | – | – | – | ✓ |

## 3. Đăng ký & xác thực

### 3.1 Đăng ký (chỉ cấp nhân viên)

1. `POST /internal/auth/register`: `username` (3–30 ký tự `a-z0-9._`, lưu lowercase, duy nhất), `email` (duy nhất, lowercase), `password` (>= 8 ký tự, có chữ và số), `fullName`, `phone`, `role` ∈ {SHIPPER, WORKER, RESTAURANT\_STAFF}, `partnerId` (bắt buộc nếu RESTAURANT\_STAFF).
2. Tạo tài khoản trạng thái `PENDING_EMAIL` và gửi OTP 6 số qua email.
3. OTP: lưu dạng hash, hết hạn 10 phút, tối đa 5 lần nhập sai, gửi lại cách nhau >= 60 giây, tối đa 5 lần gửi/giờ/email. `POST /auth/verify-otp`.
4. OTP đúng -> `PENDING_APPROVAL`, tạo `approval_request`, gửi thông báo (in-app + email) tới người duyệt hợp lệ.
5. Người duyệt chấp nhận -> `ACTIVE` (email báo người dùng); từ chối (bắt buộc lý do) -> `REJECTED`.
6. Cron dọn tài khoản `PENDING_EMAIL` quá 24 giờ chưa xác thực để giải phóng username/email.

### 3.2 Ai được duyệt

| Tài khoản đăng ký | Người duyệt hợp lệ |
| --- | --- |
| RESTAURANT\_STAFF | RESTAURANT\_MANAGER cùng chi nhánh; hoặc WM / MG / AD |
| SHIPPER, WORKER | WM, MG, AD |

Người duyệt thấy danh sách chờ (đã lọc scope), xem thông tin đăng ký, duyệt/từ chối. Mỗi quyết định ghi audit.

### 3.3 Đăng nhập & phiên

- `POST /auth/login` với `identifier` (username hoặc email, không phân biệt hoa thường) + `password`. Chỉ `ACTIVE` đăng nhập được; các trạng thái khác trả thông báo rõ (chờ xác thực email / chờ duyệt / bị từ chối / bị khóa).
- Access token JWT 15 phút + refresh token 7 ngày (xoay vòng, lưu hash, thu hồi khi đăng xuất/đổi mật khẩu/khóa tài khoản). JWT có `aud: "internal"`, **secret riêng** tách biệt JWT của web giặt là. Payload: `sub`, `role`, `partnerId`.
- Khóa tạm 15 phút sau 5 lần sai liên tiếp; rate limit toàn bộ `/auth/*`.
- Quên mật khẩu: OTP email (cùng quy tắc OTP); đổi mật khẩu thu hồi mọi refresh token.
- Hash mật khẩu bằng argon2id (hoặc bcrypt cost 12).

### 3.4 Quản trị tài khoản

- Seed 1 ADMIN đầu tiên bằng script đọc từ ENV.
- Admin tạo tài khoản cấp quản lý (MG, AC, WM, RM — RM bắt buộc `partnerId`): đặt mật khẩu tạm, `mustChangePassword = true`, ACTIVE ngay (không cần OTP/duyệt).
- Admin: khóa/mở khóa, đổi vai trò, đặt lại mật khẩu, gán lại chi nhánh. Không ai tự đổi vai trò của chính mình. Không xóa cứng tài khoản (chỉ `LOCKED`) để giữ lịch sử.

## 4. Luồng nghiệp vụ giao nhận

### 4.1 Phiếu giao nhận & vòng đời

Mỗi lần giao nhận cho 1 chi nhánh trong 1 ngày = 1 `handover_record`. Cron 00:05 (múi giờ Asia/Ho\_Chi\_Minh) tự tạo phiếu theo `delivery_schedule` (DAILY; ALTERNATE\_DAYS tính từ `schedule_anchor_date`; ON\_DEMAND do MG/WM tạo tay) và gán shipper mặc định của tuyến (`default_shipper_id`, đổi được).

Trạng thái: `SCHEDULED` -> `RESTAURANT_COUNTED` (tùy chọn, khi nhà hàng đã đếm bẩn + ký) -> `CLEAN_READY` (kho ghi đồ sạch sẽ giao) -> `IN_TRANSIT` (shipper bắt đầu chuyến) -> `DELIVERED` (shipper giao/nhận + ký) -> `COMPLETED` (RM kiểm đủ + ký nhận).

Nhánh: nếu RM đánh dấu có thiếu/thừa -> `DISPUTED`; WM/MG xử lý bằng phiếu điều chỉnh rồi RM xác nhận lại -> `COMPLETED`. Mọi chuyển trạng thái đi qua một hàm duy nhất trong `HandoverStateMachine` (kiểm tra quyền + điều kiện + ghi audit); chuyển sai trả 409.

### 4.2 Quy tắc đếm đồ bẩn

- RS/RM ghi `restaurant_count` (theo `item_code`, số bao, ghi chú) và ký bằng canvas (lưu ảnh chữ ký, người ký, thời điểm). Có thể ghi nhiều lần trước khi shipper tới: bản mới nhất có hiệu lực, bản cũ vẫn nằm trong audit.
- Khi shipper mở phiếu nhận đồ bẩn mà **chưa có** `restaurant_count`: hệ thống tự đặt `dirty.count_mode = AT_FACTORY` (lý do `NO_RESTAURANT_COUNT`); shipper chỉ ghi số bao + ảnh bao.
- Nếu **đã có** `restaurant_count`: mặc định `ON_SITE`. Nếu shipper thấy sai chọn "Đếm lại tại xưởng": bắt buộc >= 1 ảnh bao + lý do -> `count_mode = AT_FACTORY` (lý do `RECOUNT`), tạo `recount_task` OPEN và thông báo WM/MG.
- WM/MG đếm lại -> ghi `factory_count`, đóng task. `dirty.final` = `factory_count` nếu có, ngược lại `restaurant_count`; lưu `variance` (xưởng − nhà hàng) theo từng `item_code` và hiển thị cho nhà hàng.
- Đồ rách/hỏng/thất lạc: `defects[]` gồm `item_code`, `quantity`, `type` (TORN | STAINED | LOST), `photos`, `note`. SH, WM, WK, MG ghi được.

### 4.3 Đồ sạch & kiểm nhận

- WM/MG ghi `clean.planned` (đồ sạch sẽ giao) trước giờ giao. Shipper xác nhận `clean.delivered` thực giao (mặc định = planned, được sửa).
- RM kiểm từng `item_code`: ENOUGH / SHORT / EXCESS (kèm số thực nhận), ghi chú, rồi ký nhận. Tất cả ENOUGH -> `COMPLETED`, ngược lại -> `DISPUTED`.

### 4.4 Sửa phiếu & khóa phiếu

- Shipper được sửa các ô giao/nhận khi phiếu chưa `COMPLETED`. Mỗi lần sửa ghi `audit_logs` và thêm vào `edit_marks` trên phiếu (đường dẫn trường, giá trị cũ -> mới, người sửa, vai trò, thời điểm). UI của WM/MG hiển thị nhãn "đã sửa bởi {tên} lúc {giờ}" cạnh ô; WM/MG sửa lại được (cũng audit) và bấm "đã xem" (`reviewed_by`).
- Phiếu `COMPLETED` bị khóa. Muốn đổi: WM/MG/AD tạo `adjustment` (lý do bắt buộc) và hệ thống thông báo RM; không ghi đè dữ liệu gốc.
- Dùng optimistic concurrency (`version`) để 2 người không ghi đè nhau.

### 4.5 Tải ảnh & phiếu gửi nhóm Zalo

- Màn "Hôm nay" của shipper liệt kê toàn bộ ảnh (bao đếm lại, đồ hỏng) và phiếu của các điểm đã giao hôm nay.
- Nút "Tạo ảnh phiếu": FE tự vẽ bằng Canvas (không tốn RAM server) thành 1 ảnh/phiếu gồm: tên chi nhánh, ngày giờ, bảng đồ sạch giao / đồ bẩn nhận, người ký và chữ ký, nhãn đã sửa. Cho phép tải từng ảnh hoặc tất cả (ZIP) và chia sẻ qua Web Share API để mở thẳng Zalo trên điện thoại.

### 4.6 Nhà hàng xem lịch sử

RS/RM chọn tháng và xem theo ngày: đồ bẩn đã nhận, đồ sạch đã giao, thiếu/thừa, tổng tháng theo `item_code`. Chỉ chi nhánh của mình, không hiện đơn giá.

## 5. Chấm công, sản lượng, xăng, lương

### 5.1 Chấm công (`attendance_records`)

- WK check-in: chụp ảnh trực tiếp từ camera (không chọn từ thư viện), thời gian do **server** ghi, GPS lưu nếu người dùng cấp quyền. Check-out tương tự. Mỗi người chỉ có 1 ca OPEN.
- `workedMinutes = checkOut − checkIn` (làm tròn xuống phút). Tiền công giờ = `workedMinutes / 60 × hourly_rate × day_coefficient`. `day_coefficient` (ngày thường 1.0; tăng ca/Chủ nhật/lễ do cấu hình ở `pay_settings`) do MG/AD gắn loại ngày lên bản ghi.
- Quên check-out: cron 00:30 đánh dấu `NEEDS_REVIEW` các ca OPEN > 16 giờ; MG/AD nhập giờ ra + lý do (audit). Mọi chỉnh sửa công chỉ MG/AD làm được, ghi audit, và chỉ khi kỳ lương chưa `LOCKED`.

### 5.2 Sản lượng (`piecework_logs`)

- Chỉ ghi được khi WK đang có ca OPEN (trong khoảng check-in/check-out), gắn `attendanceId`. Mỗi lần ghi: `item_code`, `quantity` (nút nhanh +10/+50/+100), `rate_snapshot` = `folding_rate_worker` tại thời điểm ghi, `subtotal`.
- WK sửa/xóa mục của mình trong ngày khi chưa xác nhận (audit). MG/AD xác nhận sản lượng cuối ngày (`CONFIRMED`); chỉ sản lượng `CONFIRMED` được đưa vào bảng lương.
- Mỗi nhân viên có `pay_type`: `HOURLY` | `PIECEWORK` | `HYBRID` | `MONTHLY_FIXED`. HOURLY = tiền giờ; PIECEWORK = tổng subtotal; HYBRID = cả hai; MONTHLY\_FIXED = lương cứng tháng.
- Màn hình WK hiển thị tiền công tạm tính thời gian thực, chỉ của chính mình.

### 5.3 Xăng (`fuel_logs`)

- SH tạo: ngày, số tiền (VND), biển số xe, số km đồng hồ (tùy chọn), **ảnh bill (bắt buộc)**, **ảnh vạch xăng (bắt buộc)**; trạng thái `PENDING`. SH sửa/hủy được khi còn `PENDING`.
- AC/AD duyệt hoặc từ chối (lý do). Cuối tháng tổng các khoản `APPROVED` theo shipper thành dòng `fuel_reimbursement` trong phiếu lương. MG không thấy số tiền xăng.

### 5.4 Lương (`payroll_periods`, `payslips`)

- Kỳ lương theo tháng: `DRAFT` -> `LOCKED` -> `PAID`. AC/AD bấm "Tính lương": hệ thống tạo `payslips` từ chấm công (đã duyệt), sản lượng (`CONFIRMED`), xăng (`APPROVED`).
- Dòng phiếu lương: lương giờ, lương sản lượng, lương cứng, hoàn xăng, thưởng, phụ cấp, khấu trừ, tạm ứng, thực lĩnh. AC nhập tay thưởng/phụ cấp/khấu trừ/tạm ứng kèm ghi chú.
- `LOCKED` khóa mọi dữ liệu nguồn của kỳ; muốn sửa phải AD mở khóa và ghi audit.
- Xuất Excel/PDF: bảng lương tổng + từng phiếu. SH/WK chỉ xem phiếu của mình sau khi kỳ `LOCKED`.
- Cuối tháng, báo cáo "điểm đã giao" của từng shipper (theo ngày: chi nhánh, số phiếu, giờ giao) xuất Excel cho kế toán.

## 6. Báo cáo & xuất file

| Báo cáo | Nội dung | Quyền |
| --- | --- | --- |
| Tổng hợp kho | Đồ bẩn đã nhận + đồ sạch đã giao theo ngày/khoảng ngày, theo `item_code`; chọn 1 hoặc nhiều nhà | WM, AC, MG, AD |
| Đối soát tháng với nhà hàng | Số lượng × đơn giá (PER\_UNIT / PER\_KG), thiếu/thừa, điều chỉnh, tổng tiền | AC, MG, AD |
| Chấm công & sản lượng (không có tiền) | Giờ làm, số ca, sản lượng theo `item_code`, ca bất thường | MG, AD |
| Giao nhận theo shipper | Điểm đã giao theo ngày, số phiếu, giờ giao | AC, MG, AD |
| Chênh lệch & sự cố | Chênh lệch đếm nhà hàng vs xưởng, đồ hỏng/thất lạc, phiếu bị sửa, phiếu DISPUTED | MG, AD |
| Bảng lương | Tổng hợp + từng phiếu lương | AC, AD |
| Xăng | Theo shipper/tháng, trạng thái duyệt | AC, AD |

Quy tắc chung:

- Xuất XLSX bằng `exceljs` dạng streaming; PDF (bảng lương, phiếu giao nhận) bằng `pdfmake`.
- Tối đa 1 job xuất cùng lúc (hàng đợi trong process) để bảo vệ RAM; khoảng ngày tối đa 31 ngày (đối soát và lương theo tháng); truy vấn aggregate có index và phân trang bằng cursor.
- Mọi báo cáo đi qua cùng bộ lọc trường tiền như mục 2.2. Mỗi lần xuất ghi audit (ai, loại báo cáo, bộ lọc).

## 7. Thông báo, audit, lưu trữ ảnh

- **Thông báo:** in-app (biểu tượng chuông, FE polling 60 giây, không dùng WebSocket để tiết kiệm RAM) + email cho các sự kiện: OTP; có tài khoản chờ duyệt; kết quả duyệt; yêu cầu đếm lại; phiếu `DISPUTED`; phiếu bị sửa sau khi shipper đã ký (gửi WM/MG); ca chấm công `NEEDS_REVIEW`; xăng chờ duyệt; kỳ lương `LOCKED`.
- **Audit (`audit_logs`):** chỉ thêm, không có API sửa/xóa. Mỗi bản ghi gồm entity, entityId, action, actorId, actorRole, onBehalf, changes\[{path, old, new}\], reason, ip, userAgent, at. Service nghiệp vụ bắt buộc gọi `AuditService.log()` cho mọi thay đổi trạng thái hoặc dữ liệu giao nhận, chấm công, xăng, lương, tài khoản.
- **Ảnh:** FE nén trước khi upload (cạnh dài <= 1600px, JPEG chất lượng \~0.7). Server nhận <= 5MB/ảnh, kiểm tra MIME bằng nội dung file (magic bytes), đổi tên ngẫu nhiên, lưu `/var/app/uploads/YYYY/MM/` và ghi `media_files`. Phục vụ qua `GET /internal/files/:id` có xác thực + kiểm tra scope (dùng Nginx `X-Accel-Redirect` để Node không phải stream file).
- **Lưu trữ:** giữ ảnh 6 tháng; cron hàng tuần xóa ảnh quá hạn (trừ phiếu `DISPUTED` và kỳ lương chưa `PAID`), giữ lại metadata. Theo dõi dung lượng đĩa, cảnh báo khi > 80%.

## 8. Mô hình dữ liệu

**Quy ước:** mọi collection có `createdAt`, `updatedAt`; tiền là số nguyên VND; `dateKey` = `YYYY-MM-DD` theo Asia/Ho\_Chi\_Minh (dùng cho mọi truy vấn theo ngày); dữ liệu nghiệp vụ quan trọng có `version` (optimistic lock).

### 8.1 `internal_express` (INTERNAL\_CONNECTION)

- `staff_accounts`: username, email, passwordHash, fullName, phone, role, partnerId (RS/RM), status (`PENDING_EMAIL` | `PENDING_APPROVAL` | `ACTIVE` | `REJECTED` | `LOCKED`), emailVerifiedAt, approvedBy, approvedAt, rejectedReason, createdBy, mustChangePassword, failedLoginCount, lockedUntil, `pay_profile` {pay\_type, hourly\_rate, monthly\_salary} (chỉ AC/AD đọc-ghi). Unique index: username, email.
- `otp_codes`: email, purpose (`REGISTER` | `RESET_PASSWORD`), codeHash, expiresAt (TTL index), attempts, sentCount, lastSentAt.
- `refresh_tokens`: accountId, tokenHash, expiresAt (TTL index), revokedAt, userAgent.
- `approval_requests`: accountId, requestedRole, partnerId, eligibleRoles\[\], status (`PENDING` | `APPROVED` | `REJECTED`), decidedBy, decidedAt, reason.
- `partners`: brand (`PIZZA_4PS` | `HAIDILAO` | `SMALL_RESTAURANT`), name (chi nhánh), address, contact, delivery\_schedule (`DAILY` | `ALTERNATE_DAYS` | `ON_DEMAND`), schedule\_anchor\_date, billing\_type (`PER_UNIT` | `PER_KG`), default\_shipper\_id, active.
- `item_catalogs`: brand, item\_code (`4PS_GRAY_TOWEL`, `4PS_BLUE_TOWEL`, `4PS_WHITE_GLASS`, `HDL_APRON`, `HDL_BABY_CRIB`...), name, unit (chiếc | bộ | kg), price\_to\_customer, `folding_rate_worker` (chỉ AC/AD), active.
- `handover_records`:
  - Định danh: record\_code (`GN-YYYYMMDD-NNN`), partnerId, shipperId, dateKey, status, version, onBehalfOf.
  - `restaurant_count`: items\[{item\_code, quantity}\], bags\_count, note, signedBy, signature (mediaId), at.
  - `dirty`: count\_mode (`ON_SITE` | `AT_FACTORY`), count\_mode\_reason (`NO_RESTAURANT_COUNT` | `RECOUNT`), shipper\_items\[\], bags\_count, bag\_photos\[\], factory\_count {items, countedBy, at}, final {items, source}, variance\[\].
  - `clean`: planned {items, by, at}, delivered {items, total\_kg}.
  - `defects[]`, `shipper_confirm` {signature, at}.
  - `receipt_check`: lines\[{item\_code, expected, received, result (`ENOUGH` | `SHORT` | `EXCESS`)}\], note, signedBy, signature, at.
  - `edit_marks[]` {path, old, new, by, role, at, reviewedBy}, `adjustments[]` {lines, reason, by, at}.
  - Index: unique (partnerId, dateKey, seq); (shipperId, dateKey); (status).
- `recount_tasks`: handoverId, requestedBy, reason, bag\_photos\[\], status (`OPEN` | `DONE`), countedBy, result {items}, doneAt.
- `attendance_records`: workerId, dateKey, check\_in {at, photoId, gps}, check\_out {at, photoId, gps}, workedMinutes, day\_type, status (`OPEN` | `CLOSED` | `NEEDS_REVIEW` | `APPROVED`), review {by, at, reason}.
- `piecework_logs`: workerId, attendanceId, dateKey, entries\[{item\_code, quantity, rate\_snapshot, subtotal, at}\], status (`DRAFT` | `CONFIRMED`), confirmedBy, total\_earnings (chỉ `pay.view`).
- `fuel_logs`: shipperId, dateKey, amount, vehicle\_plate, odometer\_km, bill\_photoId, gauge\_photoId, status (`PENDING` | `APPROVED` | `REJECTED`), decidedBy, reason.
- `pay_settings` (1 bản ghi): hệ số ngày (normal, overtime, sunday, holiday), quy tắc làm tròn.
- `payroll_periods`: month, status (`DRAFT` | `LOCKED` | `PAID`), lockedBy, lockedAt.
- `payslips`: periodId, staffId, role, pay\_type, summary {days, minutes, piece\_qty}, lines {hourly\_pay, piecework\_pay, fixed\_salary, fuel\_reimbursement, bonus, allowance, deduction, advance}, net\_pay, notes.
- `notifications`: toAccountId, type, refEntity, refId, title, readAt.
- `audit_logs`: xem mục 7. Index (entity, entityId, at).
- `media_files`: path, mime, size, uploaderId, purpose (`ATTENDANCE` | `BAG` | `DEFECT` | `FUEL_BILL` | `FUEL_GAUGE` | `SIGNATURE`), entity, entityId, expiresAt.

### 8.2 Các database còn lại

- `laundry_express`: giữ nguyên 100%, dùng connection mặc định, không đổi schema hay endpoint.
- `moving_express`: `moving_quotes`, `moving_services`, `moving_articles` theo đặc tả v1.

## 9. API (`/api/v1/internal`)

Mọi endpoint (trừ nhóm auth công khai) cần JWT + permission; DTO validate whitelist, bỏ trường lạ.

- **Auth:** `POST auth/register`, `auth/verify-otp`, `auth/resend-otp`, `auth/login`, `auth/refresh`, `auth/logout`, `auth/forgot-password`, `auth/reset-password`, `auth/change-password`; `GET auth/me`.
- **Tài khoản & duyệt:** `GET approvals?status=`, `POST approvals/:id/approve`, `approvals/:id/reject`; `GET accounts`, `POST accounts` (Admin tạo cấp quản lý), `PATCH accounts/:id`, `POST accounts/:id/lock`, `unlock`, `reset-password`.
- **Đối tác & danh mục:** CRUD `partners`, `item-catalogs` (lọc trường theo quyền).
- **Giao nhận:**
  - `GET handovers?date=&partnerId=&status=`, `GET handovers/:id`, `POST handovers` (ON\_DEMAND).
  - `PUT handovers/:id/restaurant-count`, `PUT handovers/:id/clean-planned`, `POST handovers/:id/start-transit`.
  - `PATCH handovers/:id/fields` (shipper/WM/MG sửa ô, sinh `edit_marks`), `POST handovers/:id/deliver` (shipper ký), `POST handovers/:id/receipt` (RM kiểm + ký).
  - `POST handovers/:id/recount-request`, `GET recount-tasks`, `POST recount-tasks/:id/complete`.
  - `POST handovers/:id/defects`, `POST handovers/:id/adjustments`, `POST handovers/:id/mark-reviewed`, `GET handovers/:id/audit`.
  - `GET handovers/monthly?partnerId=&month=` (lịch sử tháng cho nhà hàng).
- **Chấm công & sản lượng:** `POST attendance/check-in`, `attendance/check-out` (multipart có ảnh); `GET attendance/me`; `PATCH attendance/:id` (MG/AD); `POST piecework`, `PATCH piecework/:id`, `DELETE piecework/:id`, `POST piecework/:dateKey/confirm`.
- **Xăng:** `POST fuel`, `GET fuel` (của mình hoặc tất cả), `PATCH fuel/:id`, `POST fuel/:id/approve`, `fuel/:id/reject`.
- **Lương:** `POST payroll/periods/:month/calculate`, `GET payroll/periods/:month`, `PATCH payslips/:id`, `POST payroll/periods/:month/lock`, `unlock`, `mark-paid`; `GET me/payslips`; `GET payroll/periods/:month/export?format=xlsx|pdf`.
- **Báo cáo:** `GET reports/warehouse-summary`, `partner-reconciliation`, `attendance-summary`, `shipper-deliveries`, `variance-incidents`, `fuel-summary` (`?format=json|xlsx`).
- **Khác:** `POST files`, `GET files/:id`, `GET notifications`, `POST notifications/:id/read`, `GET audit?entity=&entityId=` (MG/AD).

## 10. Cấu trúc mã nguồn Backend (NestJS)

```
src/
├── common/        guards (JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
│                  decorators (@Permissions, @CurrentUser)
│                  interceptors (AuditInterceptor, PayFieldFilterInterceptor)
│                  filters, pipes, utils (dateKey, money)
├── config/        database (3 connections), env validation, permissions.map.ts
├── mail/          mail dùng chung (OTP, thông báo)
├── modules/
│   ├── core/      upload/ (ảnh, media_files), ai/ (sinh bài SEO), audit/,
│   │              notifications/, schedule/ (cron)
│   ├── laundry/   GIỮ NGUYÊN: articles, auth, categories, contacts, crm, dashboard,
│   │              email-marketing, orders, settings, users, zalo, zalo-marketing
│   ├── moving/    quotes/, services/, articles/
│   └── internal/
│       ├── auth/        đăng ký, OTP, đăng nhập, token, quên mật khẩu
│       ├── accounts/    Admin CRUD, phê duyệt, khóa/mở khóa
│       ├── partners/    đối tác + item-catalogs
│       ├── handover/    state machine, đếm nhà hàng, kiểm nhận, đếm lại, điều chỉnh, lịch sử tháng
│       ├── attendance/  check-in / check-out
│       ├── piecework/   sản lượng
│       ├── fuel/        chi phí xăng
│       ├── payroll/     kỳ lương, phiếu lương, xuất file
│       ├── reports/     báo cáo + xuất XLSX/PDF
│       └── internal.module.ts
├── app.module.ts  3 kết nối Mongoose (mặc định / MOVING_CONNECTION / INTERNAL_CONNECTION)
└── main.ts        CORS (3 domain), helmet, ValidationPipe(whitelist), throttler
```

Thư viện đề xuất: `@nestjs/jwt`, `passport-jwt`, `argon2`, `@nestjs/throttler`, `@nestjs/schedule`, `class-validator`, `nodemailer`, `multer`, `file-type`, `exceljs`, `pdfmake`. Không dùng `sharp` ở server (FE đã nén ảnh) để tiết kiệm RAM.

## 11. Đặc tả Frontend

### 11.1 Hai website tiếp khách

`fe-nextjs-thanhxuan-laundry` và `fe-nextjs-chuyennhatietkiem`: giữ nguyên đặc tả v1 (Next.js App Router standalone, Tailwind, Shadcn/ui; chuyển nhà tái sử dụng \~60% component).

### 11.2 `fe-react-noibo` (PWA vận hành nội bộ)

- **Stack:** React 18 + Vite + TypeScript, Tailwind, Shadcn/ui, React Router, TanStack Query, react-hook-form + zod, `react-signature-canvas`, `browser-image-compression`, `idb` (IndexedDB), `vite-plugin-pwa`. Axios có interceptor tự refresh token.
- **Điều hướng theo vai trò:** sau đăng nhập, menu và route lấy theo `role`; ẩn UI chỉ để tiện dùng, quyền thật do server quyết định.
- **Touch-first:** nút >= 48px, chữ lớn, mỗi màn một việc chính, hiển thị trạng thái online/offline.

**Màn hình theo vai trò**

- **Chung:** Đăng nhập (username/email), Đăng ký (chọn vai trò; RS chọn chi nhánh), Nhập OTP, Quên mật khẩu, Hồ sơ/đổi mật khẩu, Chuông thông báo.
- **RS/RM:** Đếm đồ hôm nay (thẻ lớn theo `item_code`, nút +1/+5/+10, ký tên); Lịch sử tháng (lịch + bảng tổng). RM thêm: Chờ duyệt nhân viên; Kiểm nhận hàng (đủ/thiếu/thừa từng dòng, ký nhận).
- **SH:** Danh sách điểm hôm nay; Phiếu đối soát song song (sạch giao / bẩn nhận, nhãn chế độ đếm tự động, nút "Đếm lại tại xưởng" + chụp ảnh bao, ký bằng canvas, ô sửa được và nhãn "đã sửa bởi"); Tải ảnh/phiếu hôm nay (Canvas, ZIP, Web Share); Xăng (form + ảnh bill + ảnh vạch xăng, lịch sử, trạng thái duyệt); Điểm đã giao theo tháng; Phiếu lương của mình.
- **WK:** Check-in/out (mở camera trực tiếp); Ghi sản lượng (thẻ to, +10/+50/+100, tiền công tạm tính thời gian thực); Công tháng; Phiếu lương của mình.
- **WM:** Soạn đồ sạch sẽ giao; Hàng đợi đếm lại; Tổng hợp kho hôm nay (chọn 1 hoặc nhiều nhà, xuất báo cáo); Phiếu bị sửa chờ xem; Chờ duyệt tài khoản.
- **MG:** Toàn bộ màn của WM + Duyệt chấm công/xác nhận sản lượng, Báo cáo chi tiết + xuất, Quản lý đối tác/danh mục (không thấy giá công), Khóa/mở tài khoản.
- **AC:** Duyệt xăng; Tính lương, chốt kỳ, xuất bảng lương; Cấu hình đơn giá công và hệ số; Đối soát tháng.
- **AD:** Toàn bộ + Quản lý tài khoản và vai trò, xem audit log, cấu hình hệ thống.

**PWA & offline**

- Cài được lên màn hình chính; cache tài nguyên tĩnh.
- Nghiệp vụ nhà hàng và shipper có hàng đợi ghi bằng IndexedDB (đếm, sửa ô, ký, xăng, ảnh), mỗi thao tác kèm `Idempotency-Key` để đồng bộ lại không tạo bản ghi trùng; hiển thị nhãn "chờ đồng bộ".
- Check-in/out và các thao tác duyệt **bắt buộc online** (cần giờ server).
- Build ra `dist`, Nginx serve trực tiếp; `index.html` no-cache, asset có hash cache dài hạn.

## 12. DevOps & tối ưu máy chủ

- **Giới hạn Docker:** mongodb 800M (`mongod --wiredTigerCacheSizeGB 0.5`); backend 512M với `NODE_OPTIONS=--max-old-space-size=384` (tăng so với v1 vì xuất Excel/PDF); frontend\_laundry 250M; frontend\_moving 250M; swapfile 4GB; `TZ=Asia/Ho_Chi_Minh` cho mọi container. Tổng RAM mục tiêu vẫn < 2GB.
- **Mạng:** MongoDB và backend chỉ lắng nghe trong mạng nội bộ Docker/127.0.0.1; MongoDB bật xác thực.
- **Nginx:** giữ routing v1 cho 4 host, riêng api.thanhxuanlaundry.com proxy\_pass tới http://127.0.0.1:5001 (backend NestJS chạy cổng 5001, đặt PORT=5001 và map cổng tương ứng trong docker-compose); thêm `limit_req` cho `/api/v1/internal/auth/`; `client_max_body_size 20M` cho API; location nội bộ `/protected-uploads/` cho `X-Accel-Redirect`; bật gzip.
- **Backup:** `mongodump` 3 database mỗi đêm (giữ 7 bản) + rsync thư mục uploads ra ngoài VPS; thử restore định kỳ.
- **Khác:** log rotation cho Docker, health check cho container, kiểm tra RAM bằng `docker stats` và `htop`.
- **Biến môi trường chính:** `MONGO_URI`, `MOVING_DB_NAME`, `INTERNAL_DB_NAME`, `INTERNAL_JWT_SECRET`, `INTERNAL_JWT_REFRESH_SECRET`, `SMTP_*`, `UPLOAD_DIR`, `ADMIN_SEED_USERNAME/EMAIL/PASSWORD`, `OTP_TTL_MINUTES`, `TZ`.

## 13. Lộ trình triển khai (Phases)

Làm tuần tự; xong Phase nào đạt hết tiêu chí nghiệm thu mới sang Phase sau.

**Phase 0 — Chuẩn bị an toàn**

- Tạo branch mới, backup `laundry_express`, viết smoke test hồi quy cho các endpoint laundry hiện tại.
- Nghiệm thu: bộ test hồi quy pass trước khi bắt đầu refactor.

**Phase 1 — Backend nền & Multi-DB**

- 3 kết nối Mongoose trong `app.module.ts`; tạo cấu trúc `core / laundry / moving / internal`; chuyển code laundry vào `modules/laundry` không đổi hành vi.
- Dựng `core`: audit, upload + `media_files`, notifications, schedule. Viết schema `internal_express` (mục 8) và `moving_express`.
- Nghiệm thu: `npm run start:dev` không lỗi; endpoint laundry cũ hoạt động 100%; dữ liệu mới ghi đúng từng database.

**Phase 2 — Tài khoản, đăng ký, phê duyệt, RBAC**

- Auth (đăng ký, OTP, đăng nhập, refresh, quên mật khẩu), accounts (Admin tạo cấp quản lý, khóa/mở khóa), approvals, guards + `permissions.map.ts`, `PartnerScopeGuard`, `PayFieldFilterInterceptor`, thông báo email/in-app.
- Nghiệm thu: e2e đăng ký -> OTP -> duyệt -> đăng nhập chạy đúng; role ngoài whitelist bị từ chối; RM chỉ duyệt được nhân viên cùng chi nhánh; unit test ma trận quyền khớp mục 2.3; response của MG không chứa trường tiền.

**Phase 3 — Nghiệp vụ giao nhận**

- Partners, item-catalogs, `HandoverStateMachine`, cron tạo phiếu, đếm nhà hàng + chữ ký, tự chuyển `AT_FACTORY`, đếm lại, kho ghi đồ sạch, giao/nhận, kiểm nhận đủ/thiếu/thừa, defects, `edit_marks`, adjustments, lịch sử tháng.
- Nghiệm thu: unit test mọi chuyển trạng thái hợp lệ và không hợp lệ; sửa ô sinh `edit_marks` + audit; phiếu `COMPLETED` bị khóa; xung đột `version` trả 409; lưu ảnh và chữ ký ổn định.

**Phase 4 — Chấm công, sản lượng, xăng, lương**

- Attendance (ảnh, giờ server, cron ca quên check-out), piecework, fuel + duyệt, payroll (tính, chốt kỳ, phiếu lương), `pay_settings`.
- Nghiệm thu: unit test tính tiền cho `HOURLY`, `PIECEWORK`, `HYBRID`, `MONTHLY_FIXED`, hệ số ngày, `rate_snapshot`; kỳ `LOCKED` chặn sửa dữ liệu nguồn; xăng `APPROVED` cộng đúng vào phiếu lương.

**Phase 5 — Báo cáo & xuất file**

- Các báo cáo ở mục 6, xuất XLSX/PDF, hàng đợi 1 job.
- Nghiệm thu: xuất 31 ngày dữ liệu không vượt giới hạn RAM backend; báo cáo không lộ tiền cho MG/WM; mỗi lần xuất có audit.

**Phase 6 — Frontend `fe-react-noibo` (làm tuần tự 6a–6d)**

- 6a: khung PWA, auth, thông báo, route theo vai trò.
- 6b: nhà hàng (đếm, ký, lịch sử, duyệt nhân viên, kiểm nhận) + kho (soạn đồ sạch, đếm lại, tổng hợp).
- 6c: shipper (đối soát kép, sửa ô, đếm lại + ảnh bao, ảnh phiếu/Zalo, xăng, offline queue).
- 6d: worker (check-in/out, sản lượng) + MG/AC/AD (duyệt, báo cáo, lương, quản lý tài khoản).
- Nghiệm thu: thao tác cảm ứng mượt trên điện thoại; `npm run build` xuất `dist` thành công; offline -> online đồng bộ không tạo bản ghi trùng.

**Phase 7 — Mảng chuyển nhà** (theo đặc tả v1)

- Module `moving` + `fe-nextjs-chuyennhatietkiem` (clone FE laundry, form khảo sát, tạm tính, upload ảnh đồ đạc).
- Nghiệm thu: build standalone thành công; gửi khảo sát ghi đúng `moving_express`.

**Phase 8 — Đóng gói Docker, Nginx, vận hành**

- `docker-compose.yml` với giới hạn RAM, Nginx cho 4 host + SSL Let's Encrypt, backup, kiểm RAM.
- Nghiệm thu: tổng RAM < 2.0GB khi chạy thử tải; các site HTTPS ổn định; restore backup thử thành công.

## 14. Quy tắc bắt buộc cho Agent & giả định cần xác nhận

**Quy tắc**

1. Không đổi schema, endpoint hay hành vi của `laundry`; sau mỗi Phase chạy lại test hồi quy.
2. Không tin client: role, `partnerId`, giờ chấm công, đơn giá đều lấy từ server/DB.
3. Mọi thay đổi dữ liệu nghiệp vụ phải gọi `AuditService.log()`.
4. Tiền là số nguyên VND, không dùng float; ngày theo `dateKey` Asia/Ho\_Chi\_Minh, timestamp lưu UTC.
5. Chuyển trạng thái chỉ qua state machine; mọi quyền khai báo trong `permissions.map.ts`.
6. Không commit secret; mọi cấu hình nhạy cảm qua ENV.
7. Viết unit test cho tính lương, state machine, ma trận quyền, OTP; e2e cho luồng đăng ký và giao nhận.
8. Cuối mỗi Phase báo cáo: đã làm gì, kết quả test, điểm chưa đạt.

**Giả định (dùng mặc định này nếu chưa có chỉ đạo khác)**

- Kế toán và Quản lý kho thuộc "cấp quản lý": do Admin cấp, không tự đăng ký.
- Shipper có `pay_type` cấu hình được (mặc định `MONTHLY_FIXED`) và được hoàn tiền xăng.
- Manager không thấy tiền lương, tiền công, đơn giá công khoán, số tiền xăng; vẫn thấy giờ làm, sản lượng và đơn giá thu khách.
- Chỉ AC/AD nhập đơn giá công khoán và hệ số lương giờ.
- Nhân viên nhà hàng bắt buộc có email thật để nhận OTP.
- Ảnh giữ 6 tháng; thuế/bảo hiểm không tính trong phần mềm (kế toán nhập khấu trừ tay).
