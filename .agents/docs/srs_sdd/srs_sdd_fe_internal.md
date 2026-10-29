# ĐẶC TẢ YÊU CẦU & THIẾT KẾ CỔNG VẬN HÀNH NỘI BỘ (SRS & SDD)

## PHÂN HỆ CỔNG VẬN HÀNH XƯỞNG & ĐIỀU PHỐI ĐỐI TÁC (fe-react-thanhxuan-internal)

> **Tài liệu tham chiếu cấp cao:** [SRS_SDD.md (Kiến Trúc Tổng Quan)](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md)  
> **Phiên bản:** 2.4 | **Synced:** 2026-10-27 | **Môi trường:** React 18, Vite, TypeScript Strict (Zero any), React Router v7, TailwindCSS, shadcn/ui  
> **Phạm vi mã nguồn:** `fe-react-thanhxuan-internal/src/**`  
> **Quy chuẩn kỹ thuật:** Feature-Based Flat Colocation, Barrel `index.ts`, Mobile-First PWA, Canvas Signature, Offline Queue IndexedDB, RBAC UI Guards

---

## 1. YÊU CẦU NGHIỆP VỤ (SRS)

### 1.1. Mục Tiêu & Đối Tượng Sử Dụng

Phân hệ `fe-react-thanhxuan-internal` là cổng điều hành số hóa toàn diện xưởng giặt là công nghiệp và chuỗi cung ứng B2B của Công ty Thanh Xuân:

1. **Đối tượng người dùng đa dạng (8 vai trò RBAC):**
   - **Tài xế giao nhận (`SHIPPER`)**: Thao tác trên thiết bị di động (Mobile PWA) tại đối tác để giao nhận đồ sạch/đồ bẩn, lấy chữ ký điện tử, bật cờ yêu cầu đếm lại xưởng (`isRecount`), nộp đề xuất chi phí xe máy (xăng xe và sửa chữa).
   - **Thợ xưởng (`WORKER`)**: Chấm công vào/ra ca bằng camera selfie di động, ghi nhận thời gian làm việc theo giờ nhân hệ số công việc (`WorkshopJobType`), rạch bao đếm lại đồ bẩn tại xưởng.
   - **Thủ kho (`WAREHOUSE_MANAGER`)**: Soạn đồ sạch xuất xưởng (chặn ngày đã qua), duyệt xem thư viện ảnh phiếu giao nhận (`WarehouseSlipGalleryTabComponent`), kiểm đếm trạm đếm.
   - **Quản lý xưởng (`MANAGER`)**: Giám sát vận hành xưởng, phê duyệt tài khoản thợ/tài xế, chốt công thợ cuối ngày, rà soát các ca công bất thường. _(Ràng buộc: Bị ẩn 100% thông tin tiền bạc/lương)_.
   - **Đại diện đối tác (`PARTNER_MANAGER`, `PARTNER_STAFF`)**: Quản lý đối tác và Nhân viên đối tác. Tự động tính ngày hôm sau khi đếm đêm 21h-23h59, auto-save onblur từng ô đồ bẩn chống xung đột, ký nhận đếm đồ bẩn, kiểm nhận đồ sạch qua ảnh Cloudinary và ký nhận hoàn tất.
   - **Kế toán (`ACCOUNTANT`)**: Phê duyệt đề xuất chi phí xe máy (xăng & sửa xe), cấu hình tham số định mức và hệ số lương, chạy tính bảng lương chu kỳ và xuất các báo cáo tài chính. _(Ràng buộc: Không tham gia phê duyệt tài khoản nhân sự)_.
   - **Quản trị viên hệ thống (`ADMIN`, `SYSTEM_ADMIN`)**: Toàn quyền quản trị nhân sự, đối tác, danh mục đồ giặt, khóa/mở khóa kỳ lương và giám sát toàn hệ thống.

---

### 1.2. Danh Sách Tính Năng Theo Nhóm Nghiệp Vụ (Functional Requirements)

#### FE-INT-FR-01: Xác Thực, Quản Trị Nhân Sự & Profile Header (`features/auth`, `features/management/auth`, `components/layout/AppHeader`)

- **Đăng nhập & Tài khoản mẫu:** Xác thực Email/Mật khẩu với Backend NestJS. Lưới tài khoản mẫu gồm 8 nút (Admin, Quản lý xưởng, Quản lý kho, Kế toán trưởng, Tài xế, Thợ xưởng, QL Đối Tác, NV Đối Tác) với mật khẩu mặc định `ThanhXuan@2026`, hỗ trợ đăng nhập tức thì.
- **Đăng ký tài khoản công khai (`/register`, `RegisterModal`):** Chỉ cho phép đăng ký 3 vai trò thực thi: **NV Xưởng** (`WORKER`), **NV Giao Hàng** (`SHIPPER`) và **Nhân Viên Đối Tác** (`PARTNER_STAFF`). Bỏ hoàn toàn vai trò Quản lý đối tác khỏi trang đăng ký công khai. Khi chọn Nhân viên đối tác, cascade chọn Thương hiệu (Brand) trước rồi lọc Chi nhánh (Partner).
- **Header Profile, Avatar & Dropdown Menu:**
  - Góc phải Header hiển thị Avatar tròn (ảnh Cloudinary hoặc ký tự viết tắt), Họ tên và Huy hiệu vai trò.
  - Dropdown Popover gồm 3 chức năng:
    - 👤 **Thông tin cá nhân:** Mở `ProfileEditModal` cho phép sửa họ tên, SĐT và chọn ảnh trực tiếp từ máy tính để upload lên Cloudinary. Cập nhật tức thì avatar trên Header.
    - 🔑 **Đổi mật khẩu:** Mở `ChangePasswordModal` nhập mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới.
    - 🚪 **Đăng xuất:** Gọi `logout()` và xóa toàn bộ session storage.
- **Quản lý nhân sự toàn diện (`StaffManagementPage`):**
  - **Tabs phân loại tài khoản:** 6 nhóm: _Tất Cả_, _Ban Quản Trị & Kế Toán_, _Vận Hành Xưởng & Kho_, _Giao Nhận_, _Khối Đối Tác B2B_, _Tài Khoản Tạm Khóa_.
  - **Thêm nhân sự:** Modal tạo mới tài khoản cho `ADMIN` và `MANAGER`, hỗ trợ tạo cả tài khoản Quản lý đối tác (`PARTNER_MANAGER`) kèm chọn Brand và Chi nhánh. Mật khẩu khởi tạo: `ThanhXuan@2026`.
  - **Chỉnh sửa nhân sự:** Cập nhật họ tên, SĐT, vai trò, thương hiệu và chi nhánh.
  - **Tạm khóa tài khoản & Cơ chế 60 ngày:** Chuyển trạng thái sang `LOCKED`, ghi nhận thời điểm `lockedAt`, hiển thị số ngày còn lại (ví dụ: _Còn 59 ngày trước khi xóa vĩnh viễn_). Backend tự động xóa các tài khoản đã khóa quá 60 ngày. Hỗ trợ Mở khóa (`ACTIVE`).
  - **Xóa tài khoản vĩnh viễn:** **Chỉ hiển thị và cho phép thực hiện đối với vai trò `ADMIN`**. Quản lý xưởng (`MANAGER`) không có nút xóa.
- **Phê duyệt tài khoản (`approval_requests`):** Quản lý đối tác (`PARTNER_MANAGER`) duyệt nhân viên đối tác thuộc cơ sở mình; Quản lý xưởng và Admin duyệt nhân sự nội bộ (`WORKER`, `SHIPPER`). Kế toán bị tước bỏ hoàn toàn quyền duyệt nhân sự.
- **Quên mật khẩu & Đặt lại mật khẩu:** Quy trình khôi phục mật khẩu 2 bước thông qua OTP email.

#### FE-INT-FR-02: Phân Hệ Phiếu Giao Nhận Kép & Quy Trình 5 Bước Vận Hành (`features/operations/handovers`)

- **Tạo phiếu & Soạn đồ sạch xuất kho (`WarehousePage`, `PrepOrderModal`):**
  - Quản lý tab qua URL Search Param `?tab=CLEAN_PLAN | SUMMARY | SLIP_GALLERY`.
  - Thủ kho chuẩn bị số lượng đồ sạch dự kiến giao theo lịch đối tác vào ngày chọn (`recordDate`), mặc định ngày mai khi soạn tối (17h-21h), chặn chọn ngày đã qua (`min = getTodayVN()`).
  - Tối ưu responsive trên Mobile: Thanh tiêu đề mỏng 1 dòng, 3 trường khóa cố định 2 hàng gọn gàng, nút đóng banner prefill tiện lợi.
  - Ký tên Canvas thủ kho, tự động render phiếu và nén ảnh WebP base64 gửi Backend upload Cloudinary `slipImageUrl`.
- **Component Thư viện ảnh phiếu dùng chung (`HandoverSlipGalleryComponent`):**
  - Component dùng chung hợp nhất toàn diện Thư viện ảnh phiếu cho cả 3 phân hệ: Thủ kho (`WarehousePage?tab=SLIP_GALLERY`), Cổng đối tác (`PartnerPortalPage?tab=HISTORY`) và Tài xế (`HandoverListPage?tab=HISTORY`).
  - Hỗ trợ 3 chế độ (`mode: 'WAREHOUSE' | 'SHIPPER' | 'PARTNER'`):
    - _Kho (`WAREHOUSE`)_: Bộ lọc Thương hiệu (Brand), Chi nhánh đối tác (Partner), Từ ngày, Đến ngày, Tìm mã phiếu.
    - _Tài xế (`SHIPPER`)_: Bộ lọc Chi nhánh đối tác (Partner), Từ ngày, Đến ngày, Tìm mã phiếu.
    - _Đối tác (`PARTNER`)_: Khóa cố định đối tác `fixedPartnerId`, chỉ hiện bộ lọc Từ ngày, Đến ngày, Tìm mã phiếu.
  - Lưới hiển thị Card đồng nhất tỷ lệ `aspect-[3/4]`: Ảnh thumbnail phiếu, badge thương hiệu, ngày giao nhận, trạng thái phiếu, 3 chấm tròn kiểm soát chữ ký (Kho, Shipper, Quán) kèm tooltip chi tiết.
  - Nút **Xem Phóng To** kết nối modal `SlipFullscreenViewerModal`, nút **Tải ảnh** WebP/PNG an toàn (hỗ trợ CORS fallback), nút **Chi tiết**. Phân trang mượt mà 12 phiếu/trang.
- **Component Lightbox Phóng to ảnh phiếu dùng chung (`SlipFullscreenViewerModal`):**
  - Component hiển thị phóng to ảnh phiếu toàn màn hình dùng chung cho toàn bộ hệ thống (`WarehousePage`, `PrepOrderModal`, `HandoverDeliverySlipModal`, `ShipperHandoverItemCardComponent`, `HandoverSlipGalleryComponent`).
  - Hỗ trợ zoom đa cấp từ 75% đến 250%, thanh công cụ nổi (Zoom In, Zoom Out, 100%, Tải ảnh, Đóng), cuộn pan tự do, phím tắt `Escape` tự động đóng, double-tap zoom 175% trên điện thoại di động.
- **Cổng giao nhận đối tác nhà hàng (`PartnerPortalPage`):**
  - Tự động phát hiện khung giờ đêm $\ge 21\text{h}00$ để nhảy ngày sang ngày mai (`getTargetRecordDateVN`).
  - **Đếm đồ bẩn (`PartnerCountTabComponent`):** Auto-save onBlur từng ô nhập số lượng thông qua endpoint nguyên tử `PATCH /dirty-item-onblur` của Backend, loại bỏ triệt để xung đột đồng thời khi nhiều người cùng thao tác. Ký nhận đếm đồ bẩn qua `PATCH /partner-count-signature`.
  - **Kiểm nhận đồ sạch (`PartnerReceiptTabComponent`):** Hiển thị trực tiếp thẻ `<img>` phiếu WebP từ Cloudinary, đối tác kiểm nhận số lượng và ký xác nhận qua `PATCH /partner-check-signature`, chuyển trạng thái phiếu sang `COMPLETED`.
  - **Thư viện ảnh phiếu đối soát lịch sử:** Tích hợp `HandoverSlipGalleryComponent` với `mode="PARTNER"` và `fixedPartnerId={userPartnerId}`.
- **Thao tác Shipper trên di động (`HandoverListPage`, `ShipperHandoverItemCardComponent`, `ShipperCountPartnerModal`):**
  - **Hệ thống 3 Tabs: Lộ trình (`ROUTE`), Nhận chuyến (`POOL`) và Lịch sử (`HISTORY`):** Quản lý qua URL Search Param `?tab=ROUTE | POOL | HISTORY`.
    - _Tab Lộ trình (`ROUTE`)_: Danh sách các chuyến được gán đích danh (tuyến cố định) hoặc đã nhận qua tab Nhận Chuyến của ngày hôm đó. Khóa chặt cơ chế lộ trình: chỉ hiển thị các chi nhánh cố định của shipper (`defaultShipperId === user.id`) hoặc phiếu có `record.shipperId === user.id` của ngày đang xem; đối tác tự do chỉ có giá trị cho ngày hôm đó khi bấm nhận, các ngày sau phải bấm nhận lại tại Tab Nhận Chuyến, không tự add vào lộ trình các ngày tiếp theo.
    - _Tab Nhận chuyến (`POOL` - `ShipperJobPoolTabComponent`):_ Hiển thị chợ chuyến khả dụng (các phiếu thuộc đối tác chưa có tài xế cố định), badge số lượng chuyến đang chờ, thông tin chi nhánh, số món sạch/bao bẩn, tiền công dự kiến (`amount` VNĐ), và nút **"Nhận Chuyến Này"** với cơ chế khóa nguyên tử tức thời.
    - _Tab Lịch sử (`HISTORY`)_: Tích hợp `HandoverSlipGalleryComponent` với `mode="SHIPPER"`.
  - **Bộ lọc ca giao nhận 4 trạng thái:** `Tất Cả`, `Sáng (x)`, `Chiều (y)`, `Tối (z)` với phân loại màu sắc trực quan (Ca Sáng: Vàng hổ phách, Ca Chiều: Cam ấm, Ca Tối: Tím). Thẻ điểm giao nhận và thẻ nhận chuyến hiển thị chính xác badge ca tương ứng.
  - **Cài đặt tiền công chuyến lẻ & Cụm đối tác (`TripCompensationModal`):** Dành riêng cho Admin và Kế toán (`ACCOUNTANT`). Nút "Set Giá" / "Sửa Giá" trên thẻ phiếu xuất kho chỉ hiển thị cho 2 vai trò này (ẩn hoàn toàn với Thủ kho `WAREHOUSE_MANAGER` và Quản lý `MANAGER`). Cấp quyền truy cập menu "Kho Sạch & Soạn Đồ" (`/operations/warehouse-manager/warehouse`) cho vai trò `ACCOUNTANT` trên cả Desktop Sidebar và Mobile Quick Bottom Bar, cho phép Kế toán rà soát phiếu và gán tiền thù lao trực tiếp. Hỗ trợ cấu hình tiền chuyến lẻ (`x` VNĐ) hoặc gom nhóm `N` đối tác cùng tuyến đường (`xx` VNĐ chia đều) và tự động cộng vào kỳ lương Shipper.
  - **Phân công Shipper cố định cho chi nhánh đối tác (`PartnerModal`, `PartnerCardComponent`):** Tại màn hình Quản lý đối tác (`/management/manager/partner`), Admin/Manager có thể chọn một Shipper cố định (hưởng lương cứng + phụ cấp) từ danh sách `/accounts/shippers-list` hoặc để trống ("Tuyến tự do / Chờ nhận theo chuyến"). Thẻ chi nhánh hiển thị trực quan badge màu tím kèm tên và SĐT tài xế cố định phụ trách.
  - **Bộ điều khiển ngày tối giản:** Cụm `[< Ngày trước]` - `[Ngày ở giữa (click chọn ngày)]` - `[Ngày sau >]`.
  - **Hiển thị trực tiếp ảnh phiếu & Thanh công cụ hành động:** Thẻ phiếu hiển thị trực tiếp ảnh phiếu xuất kho kèm 3 nút: **Đếm thay**, **Phóng to** (mở `SlipFullscreenViewerModal`), **Tải ảnh** (tải ảnh phiếu WebP/PNG về máy có xử lý CORS fallback).
  - **Nút "Đếm thay" mở Modal chuyên dụng (`ShipperCountPartnerModal`):** Hỗ trợ hiển thị toàn màn hình trên thiết bị di động (`fullScreenOnMobile`), khung thông tin khóa 3 trường (Thương hiệu, Chi nhánh, Ngày), chuyển đổi linh hoạt dạng Thẻ / Bảng, nhập biểu thức thông minh `12 34` hoặc `10+5`, tích hợp nút **"+ Tự nhập món đồ"** (`CustomHandoverItemModal`) cho các món ngoài setting, bộ chọn số bao gom niêm phong thông minh (stepper `[-] [+]`, chip chọn nhanh `1, 2, 3, 4` và nhập tùy ý), bàn ký Canvas và Live Preview Canvas A4. Cấp quyền `HANDOVER_PARTNER_COUNT` và `PARTNER_VIEW` cho Shipper, triệt tiêu lỗi 403 Forbidden. Cổng đối tác `PartnerCountTabComponent` cũng đồng bộ nút tự nhập món đồ ngoài setting (không có trường số bao).
  - **Ký bàn giao điện tử & Đếm lại:** Bảng ký Canvas, checkbox tích đếm lại (`isRecount`).
  - **Chỉ đường Google Maps & Ngày góc phải:** Nút chỉ đường mở Google Maps, ngày giao nhận hiển thị cùng hàng ở góc phải.

#### FE-INT-FR-03: Trạm Đếm Đồ Bẩn Tại Xưởng (`features/operations/handovers` - `RecountStationPage`)

- Phân quyền chuyên biệt cho Thợ xưởng (`WORKER`) và Thủ kho (`WAREHOUSE_MANAGER`).
- Tự động lọc danh sách phiếu cần đếm lại: các phiếu có `isRecount === true` hoặc phiếu có đồ bẩn chưa đếm số lượng mà Shipper đã ký nhận giao về.
- **Thao tác rạch bao đếm lại:** Thợ xưởng nhập số lượng thực tế từng chiếc đồ (`actualQuantityReceived`), cập nhật trực tiếp vào hệ thống qua endpoint `PATCH /recount-actual`, hoàn tất quy trình kiểm đếm đối chứng.

#### FE-INT-FR-04: Chấm Công Camera Selfie & Phiên Khâu Công Thợ Theo Thời Gian Thực (Plan 37)

- **Chấm công camera selfie & Geofencing (`AttendancePage`, `useAttendance`, `useWorkshopGeo`):** Bắt buộc chụp ảnh selfie (`photoId`) và quét tọa độ GPS xưởng độ chính xác cao (`enableHighAccuracy: true`). Kiểm tra bán kính xưởng $\le 150m$, chống Fake GPS (chặn `accuracy <= 0`, sai số quá lớn, timestamp cũ). Sau khi check-in ca tự động kích hoạt mở phiên **khâu mặc định** (`defaultJobType`) cho thợ; khi check-out ca tự động đóng phiên khâu đang mở với thời điểm kết thúc bằng giờ check-out ca.
- **Bảng công toàn xưởng & Rà soát ca (`AttendanceReviewPage`, `useAttendanceReview`):**
  - Thiết kế theo chuẩn công thái học 4 tầng (`PageBanner` $\rightarrow$ `PageActionBar` $\rightarrow$ 4 `StatCard` $\rightarrow$ Bộ lọc & Bảng ca làm việc).
  - Khắc phục triệt để lỗi xóa dấu gạch ngang ở `dateKey`: Truy vấn chính xác theo `YYYY-MM-DD` theo múi giờ `Asia/Ho_Chi_Minh` (`getTodayVN()`).
  - Hỗ trợ chuyển đổi linh hoạt giữa chế độ xem **Theo Ngày** và **Khoảng Ngày**, lọc theo trạng thái (`OPEN`, `NEEDS_REVIEW`, `CLOSED`, `APPROVED`), lọc vai trò và tìm kiếm nhân viên.
  - Hiển thị trực quan ảnh chụp camera selfie vào/ra (hoặc nhãn tự động từ phiếu giao nhận của tài xế), khoảng cách GPS tới xưởng và loại ngày công (`NORMAL`, `OVERTIME`, `SUNDAY`, `HOLIDAY`).
  - Nút **Duyệt nhanh toàn bộ ca hoàn tất** trong ngày sang `APPROVED` và modal **Rà soát ca (`AttendanceReviewModal`)** cho phép bổ sung giờ ra ca cho các ca quên check-out (`NEEDS_REVIEW`), điều chỉnh loại ngày công và trạng thái ca kèm lý do audit. Phân quyền cho `ADMIN`, `MANAGER` và `ACCOUNTANT`.
- **Trạm công việc thợ theo phiên (`HourlyWorkStationPage`, `useHourlyWorkStation`):**
  - Hiển thị khâu mặc định được phân công và thẻ phiên đang chạy kèm đồng hồ đếm thời gian thực cập nhật mỗi 30s (`CurrentSegmentCardComponent`).
  - Nút **Checkout khâu**: Đóng phiên hiện tại, tính số phút và tiền công tạm tính. Nếu khâu vừa đóng là khâu phụ (khác khâu mặc định) và ca làm việc vẫn mở, hệ thống **tự động check-in lại khâu mặc định** (`AUTO_RESUME`).
  - Lưới chọn khâu làm việc (`JobStagePickerComponent`): Cho phép nhận khâu phụ mới; tự động vô hiệu hóa khi đang có phiên mở kèm nhắc nhở checkout khâu hiện tại trước.
  - Lịch sử phiên trong ngày (`HourlyWorkTaskListComponent`): Timeline chi tiết các phiên làm việc, thời gian vào/ra, số phút, tiền công và nhãn nguồn gốc (`Mặc định`, `Phụ`, `Tự quay lại`).
- **Quản lý công thợ & đơn giá khâu (`HourlyWorkReviewPage`, chia 3 tab):**
  - **Tab Cài đặt đơn giá khâu (`JobRatesSettingsComponent`, `useJobRates`):** Dành riêng cho `ADMIN` và `ACCOUNTANT` (`pay.rate.manage`). Quản lý danh mục khâu, cấu hình đơn giá VNĐ/giờ (`hourlyRate`) và bật/tắt khâu (`isActive`).
  - **Tab Phân khâu mặc định (`WorkerDefaultJobComponent`, `useWorkerDefaultJobs`):** Dành cho `ADMIN` và `MANAGER`. Hiển thị danh sách WORKER và gán khâu làm việc mặc định (`defaultJobType`).
  - **Tab Duyệt công theo ngày (`DailyWorkReviewComponent`, `useDailyWorkReview`):** Chọn ngày, hiển thị chi tiết các phiên làm việc của từng thợ trong ngày và nút xác nhận chốt duyệt (`CONFIRMED`).
- **Phiếu lương & Tạm tính thu nhập cá nhân (`MyPayslipPage`, `useMyPayslip`):**
  - Hỗ trợ chọn tháng (mặc định tháng hiện tại theo `Asia/Ho_Chi_Minh`).
  - Bảng thu nhập theo ngày (`DailyEarningsTableComponent`): Thống kê từng ngày làm việc gồm chi tiết các khâu, số phút làm việc, tiền tạm tính và trạng thái duyệt (`Chờ duyệt`, `Đã duyệt`, `Đang chạy`).
  - Thẻ phiếu lương chính thức (`OfficialPayslipCardComponent`): Hiển thị chi tiết bảng lương chính thức khi Kế toán đã chốt kỳ lương (`LOCKED`/`PAID`).

#### FE-INT-FR-05: Quản Lý Chi Phí Xe Máy Của Shipper (`features/operations/fuel`, `features/management/fuel`)

- **Tài xế nộp đề xuất chi phí xe (`FuelPage`):**
  - Hỗ trợ 2 tabs nghiệp vụ: **Đổ Xăng (`FUEL`)** và **Sửa Chữa Xe (`REPAIR`)**.
  - Nhập số tiền đề xuất hoàn (`amountMoney`), số lít xăng, số Km đồng hồ (nếu đổ xăng) hoặc mô tả chi tiết sửa chữa (nếu sửa xe).
  - Bắt buộc đính kèm ảnh chụp hóa đơn/biên lai và ảnh đồng hồ công-tơ-mét / ảnh xe máy tại tiệm sửa xe.
- **Kế toán duyệt chi phí xe (`FuelReviewPage`):** Kế toán và Admin duyệt hoặc từ chối đề xuất. Số tiền được duyệt tự động tính vào phiếu lương shipper. Quản lý xưởng bị ẩn chức năng này.

#### FE-INT-FR-06: Quản Trị Bảng Lương & Tra Cứu Phiếu Lương (`features/operations/payroll`, `features/management/payroll`)

- **Quản lý kỳ lương & chốt sổ toàn xưởng (`PayrollManagementPage`, `usePayrollManagement`):**
  - Thiết kế chuẩn 4 tầng công thái học kết nối chuẩn xác với Backend NestJS (`GET /payroll/periods`, `GET /payroll/periods/:id/payslips`, `POST /payroll/calculate` với định dạng chuỗi `{ month: 'YYYY-MM' }`).
  - 4 `StatCard` KPI tài chính: Tổng quân số trong kỳ, Tổng lương chính/khâu, Tổng phụ cấp & thưởng, Tổng thực lĩnh (`Net Pay`) toàn xưởng.
  - Quản lý vòng đời chu kỳ lương:
    - Trạng thái `DRAFT`: Cho phép Kế toán và Admin tính toán lại bảng lương, mở modal `PayslipDetailAdjustModal` để xem bóc tách chi tiết từng khâu đối với Thợ hoặc công thức tài xế, điều chỉnh các khoản thưởng thêm, phụ cấp, khấu trừ, tạm ứng và ghi chú.
    - Trạng thái `LOCKED`: Admin thực hiện chốt sổ đóng băng dữ liệu hoặc mở khóa (`UNLOCK`) kèm lý do audit bắt buộc.
    - Trạng thái `PAID`: Đánh dấu hoàn tất chi trả qua `POST /payroll/periods/:id/mark-paid`.
  - Tích hợp nút xuất file Excel trực tiếp (`/reports/payroll/:month/export`).
- **Tra cứu phiếu lương cá nhân (`MyPayslipPage`):**
  - Nhân viên tự tra cứu chi tiết phiếu lương cá nhân khi kỳ lương đã `LOCKED` hoặc `PAID`.
  - **Minh bạch theo chức danh:**
    - _Tài xế Shipper:_ Bảng tính chi tiết gồm ngày công chuẩn (28 ngày), ngày thực tế, lương cơ bản theo ngày, thưởng ca cuối tuần (60k/ca tối T7/CN và sáng CN/T2), chuyên cần (7k/ngày), phụ cấp điện thoại (200k), hoàn chi phí xăng và sửa xe đã duyệt, khấu trừ BHXH (400k) và thực nhận.
    - _Thợ xưởng:_ Bảng tổng hợp tổng phút làm việc và thu nhập theo từng nhóm công việc nhân hệ số.

#### FE-INT-FR-07: Trung Tâm Báo Cáo Phân Tích & Xuất File (`features/operations/reports`)

- Giao diện trực quan hóa 8 phân hệ báo cáo: (1) Báo cáo kho, (2) Đối soát toàn bộ đối tác & chi tiết từng đối tác, (3) Chấm công thợ, (4) Phân tích 7 khâu công thợ theo giờ, (5) Lịch trình shipper, (6) Sự cố chênh lệch & rủi ro 4 sub-tabs, (7) Báo cáo xăng xe, và (8) Quyết toán bảng lương tháng.
- Bộ lọc khoảng ngày linh hoạt (tối đa 31 ngày) kết hợp các phím chọn nhanh (Hôm nay, 7 ngày, Tháng này, Tháng trước).
- Xuất file tải về trực tiếp: Xuất file Excel XLSX và PDF streaming tốc độ cao.
- Tự động bóc tách trường tiền lương khi Quản lý xưởng (`MANAGER`) truy cập.

#### FE-INT-FR-08: Quản Lý Nghỉ Giao Nhận & Phân Tuyến Bù (`features/management/shipper-leaves`, `features/operations/handovers`)

- **Tài xế Shipper xin nghỉ phép (`ShipperLeaveRequestModal`, `ShipperLeaveHistoryModal`):**
  - Tài xế nộp đơn xin nghỉ trực tiếp từ màn hình Giao Nhận (`ShipperHandoverPage`), chọn một hoặc nhiều ngày nghỉ (`leaveDates`), nhập lý do xin nghỉ.
  - Theo dõi lịch sử đơn và trạng thái duyệt (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `CANCELLED`). Hỗ trợ hủy đơn khi chưa duyệt.
- **Xét duyệt & Phân tuyến thay thế (`ShipperLeaveReviewPage`, `useShipperLeaveManagement`):**
  - Quản lý xưởng (`MANAGER`) và `ADMIN` xét duyệt đơn bước 1 (`ApproveShipperLeaveModal`): chỉ định tài xế thay thế (`substituteShipperId`) để nhận bàn giao toàn bộ các chi nhánh đối tác trong các ngày nghỉ đó.
  - Kế toán (`ACCOUNTANT`) hoặc `ADMIN` thiết lập định mức thù lao giao thay (`SetLeaveCompensationModal`): gán số tiền thù lao (`compensationAmount`) và ghi chú (`compensationNote`), tự động chuyển đơn sang `APPROVED` và cộng dồn vào phiếu lương của tài xế nhận việc.
  - Nút từ chối đơn (`RejectShipperLeaveModal`) kèm bắt buộc nhập lý do từ chối.

#### FE-INT-FR-09: Cấu Hình Vị Trí Xưởng, Geofencing & Wi-Fi Router (`features/management/workshop`)

- Dành riêng cho Quản trị viên (`ADMIN`).
- **Tra cứu tọa độ GPS từ địa chỉ nhập tay (Geocoding):** Tích hợp tìm kiếm tọa độ từ chuỗi địa chỉ thực tế của xưởng qua máy chủ OpenStreetMap Nominatim, tự động điền Latitude & Longitude kèm hiển thị tên địa điểm chuẩn hóa.
- **Tùy chỉnh Geofencing & Sai số GPS (±350m):** Hỗ trợ cấu hình bán kính xưởng (`radiusMeters`) và mở rộng ngưỡng sai số tối đa (`maxAccuracyMeters: ±350m`) để thích ứng với tín hiệu GPS yếu trong xưởng có trần tôn hoặc nhà kho khép kín.
- **Quản lý dải IP Wi-Fi Router:** Nhận diện IP Public hiện tại của mạng quản trị, thêm/xóa danh sách IP modem Wi-Fi hợp lệ và công tắc ép buộc kết nối Wi-Fi khi chấm công.

---

## 2. THIẾT KẾ KIẾN TRÚC & HỆ THỐNG (SDD)

### 2.1. Cấu Trúc Thư Mục & Tổ Chức Mã Nguồn

> **Quy chuẩn Spacing Mobile toàn diện (Plan 48):**  
> - Toàn bộ các trang (*Page.tsx) sử dụng wrapper container chuẩn `space-y-3 pb-24 max-w-7xl mx-auto transition-all` đảm bảo mọi component trên mobile cách nhau đều đặn ~12px (khoảng 1 đơn vị công thái học), xóa bỏ hoàn toàn khoảng cách 0px do `sm:space-y-3` gây ra.
> - Các bộ lọc ngày (`AttendanceDateHeaderComponent`) và kỳ lương (`PayrollMonthHeaderComponent`) được thiết kế độc lập ngoài `PageBanner` để hiển thị 100% trên thiết bị di động, kèm thanh Tab Bar trượt ngang không thanh cuộn và 4 StatCards xếp 2 cột linh hoạt (`grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4`).

```Markdown
fe-react-thanhxuan-internal/src/
├── app/
│   ├── (auth)/                          # Đăng nhập, Đăng ký OTP, Quên mật khẩu
│   │   ├── AuthLayout.tsx               # Khung bố cục xác thực
│   │   ├── login.tsx                    # /login
│   │   ├── register.tsx                 # /register
│   │   └── forgot-password.tsx          # /forgot-password
│   │
│   ├── (internal)/                      # Vùng vận hành yêu cầu JWT xác thực
│   │   ├── InternalLayout.tsx           # Layout khung: Topbar, Sidebar, Navigation
│   │   ├── dashboard.tsx                # /dashboard - Thống kê KPI tổng quan
│   │   │
│   │   ├── operations/                  # Phân hệ Vận Hành theo đối tượng (/operations/*)
│   │   │   ├── attendance.tsx           # /operations/attendance - Thợ chấm công selfie
│   │   │   ├── payslip.tsx              # /operations/payslip - Tra cứu phiếu lương cá nhân
│   │   │   ├── report.tsx               # /operations/report - Trung tâm báo cáo & xuất Excel/PDF
│   │   │   ├── warehouse-manager/
│   │   │   │   └── warehouse.tsx        # /operations/warehouse-manager/warehouse - Thủ kho soạn đồ & Kế toán set thù lao
│   │   │   ├── shipper/
│   │   │   │   ├── handover.tsx         # /operations/shipper/handover - Giao nhận 2 chiều & Chợ chuyến
│   │   │   │   └── fuel.tsx             # /operations/shipper/fuel - Nộp hóa đơn xăng xe & sửa chữa
│   │   │   ├── worker/
│   │   │   │   ├── recount.tsx          # /operations/worker/recount - Trạm đếm gom bao xưởng
│   │   │   │   └── piecework.tsx        # /operations/worker/piecework - Trạm công thợ theo giờ
│   │   │   ├── partner-manager/
│   │   │   │   └── partner.tsx          # /operations/partner-manager/partner - Cổng đối tác (Quản lý)
│   │   │   └── partner-staff/
│   │   │       └── partner.tsx          # /operations/partner-staff/partner - Cổng đối tác (Nhân viên)
│   │   │
│   │   └── management/                  # Phân hệ Quản Trị theo vai trò (/management/*)
│   │       ├── manager/
│   │       │   ├── approval.tsx         # /management/manager/approval - Phê duyệt tài khoản thợ & đối tác
│   │       │   ├── personnel.tsx        # /management/manager/personnel - Quản trị nhân sự & RBAC
│   │       │   ├── partner.tsx          # /management/manager/partner - Quản trị chuỗi đối tác & bảng giá
│   │       │   ├── attendance.tsx       # /management/manager/attendance - Bảng công toàn xưởng
│   │       │   └── piecework.tsx        # /management/manager/piecework - Quản lý phân khâu & duyệt công
│   │       ├── accountant/
│   │       │   ├── fuel.tsx             # /management/accountant/fuel - Duyệt đề xuất xăng xe
│   │       │   └── payroll.tsx          # /management/accountant/payroll - Bảng lương chu kỳ & chốt sổ
│   │       ├── admin/
│   │       │   └── workshop.tsx         # /management/admin/workshop - Cấu hình GPS xưởng & Wi-Fi IP
│   │       └── shipper-leaves/
│   │           └── (route trực tiếp)    # /management/shipper-leaves - Duyệt nghỉ giao nhận & phân tuyến bù
│   │
│   ├── RootLayout.tsx                   # Root Layout: AuthProvider, QueryClientProvider
│   ├── RootPage.tsx                     # Điều hướng mặc định theo vai trò khi vào trang chủ /
│   ├── router.tsx                       # Centralized Router cấu hình Route Guards & Backward Redirects
│   └── legacy-redirect-routes.tsx       # Tuyến đường tương thích ngược URL tiếng Việt
│
├── components/                          # Layout (nav-config, AppHeader, Sidebar), Shell, shadcn/ui
├── features/                            # Phân định rõ ràng Management vs Operations, chuẩn hóa file: *Page.tsx, modals/*Modal.tsx, components/*Component.tsx
│   ├── auth/                            # LoginPage, RegisterPage, ForgotPasswordPage; modals/ (*Modal.tsx); components/ (*Component.tsx)
│   ├── dashboard/                       # DashboardPage; hooks: useDashboardData; components: DashboardHandoverPanel, DashboardWorkforcePanel
│   ├── management/                      # Module Quản trị cấp quản lý & văn phòng
│   │   ├── attendance/                  # AttendanceReviewPage
│   │   ├── auth/                        # StaffManagementPage, ApprovalManagementPage, AuditLogPage; modals/ (*Modal.tsx); components/ (*Component.tsx)
│   │   ├── fuel/                        # FuelReviewPage
│   │   ├── partners/                    # PartnersManagementPage; modals/ (PartnerModal, BrandModal, CatalogModal...); components/ (*Component.tsx)
│   │   ├── payroll/                     # PayrollManagementPage
│   │   ├── piecework/                   # HourlyWorkReviewPage (components: JobRatesSettings, WorkerDefaultJob, DailyWorkReview; hooks: useJobRates, useWorkerDefaultJobs, useDailyWorkReview)
│   │   ├── shipper-leaves/              # ShipperLeaveReviewPage; modals/ (ApproveShipperLeaveModal, SetLeaveCompensationModal, RejectShipperLeaveModal); hooks: useShipperLeaveManagement
│   │   └── workshop/                    # WorkshopSettingsPage; components: WorkshopGeofencingCard, WorkshopWifiCard, WorkshopSecurityPolicyCard; hooks: useWorkshopSettings
│   │
│   └── operations/                      # Module Vận hành hiện trường xưởng & di động
│       ├── attendance/                  # AttendancePage; hooks: useAttendance, useWorkshopGeo
│       ├── fuel/                        # ShipperFuelPage; hooks: useShipperFuel
│       ├── handovers/                   # ShipperHandoverPage, WarehouseHandoverPage, PartnerHandoverPage, RecountStationPage; modals/ (*Modal.tsx); components/ (*Component.tsx); hooks/ (use*Flow.ts)
│       ├── payroll/                     # MyPayslipPage; components: DailyEarningsTable, OfficialPayslipCard; hooks: useMyPayslip
│       ├── piecework/                   # HourlyWorkStationPage; components: CurrentSegmentCard, JobStagePicker, HourlyWorkTaskList; hooks: useHourlyWorkStation
│       └── reports/                     # ReportsPage; hooks: useReports; components: ReportsFilterBar, WarehouseReportSection, WorkforceReportSection, QualityFuelReportSection
│
├── lib/                                 # Tiện ích hạ tầng (api-client, permissions, offline-queue, utils)
└── types/                               # TypeScript Interfaces & Enums chuẩn hóa
```

---

### 2.2. Ma Trận Điều Hướng & Phân Quyền Menu (Navigation & RBAC)

| Nhóm Tài Khoản          | Tuyến Đường Mặc Định                      | Quyền Truy Cập Vận Hành (`/operations`)                                                                                                     | Quyền Truy Cập Quản Lý (`/management`)                                                                                                                                                                                                                                                                        |
| :---------------------- | :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`SHIPPER`**           | `/operations/shipper/handover`            | `/operations/shipper/handover`, `/operations/shipper/fuel`, `/operations/payslip`                                                           | ❌ Không có quyền                                                                                                                                                                                                                                                                                             |
| **`WORKER`**            | `/operations/worker/piecework`            | `/operations/worker/piecework`, `/operations/attendance`, `/operations/worker/recount`, `/operations/payslip`                               | ❌ Không có quyền                                                                                                                                                                                                                                                                                             |
| **`WAREHOUSE_MANAGER`** | `/operations/warehouse-manager/warehouse` | `/operations/warehouse-manager/warehouse`, `/operations/worker/recount`, `/operations/shipper/handover` (chế độ xem), `/operations/payslip` | ❌ Không có quyền _(Bị ẩn trường tiền)_                                                                                                                                                                                                                                                                       |
| **`PARTNER_MANAGER`**    | `/operations/partner-manager/partner`     | `/operations/partner-manager/partner` (có tab duyệt nhân sự cơ sở mình)                                                                     | `/management/manager/approval` (Xem và duyệt nhân viên chi nhánh cơ sở mình)                                                                                                                                                                                                                                  |
| **`PARTNER_STAFF`**      | `/operations/partner-staff/partner`       | `/operations/partner-staff/partner`                                                                                                         | ❌ Không có quyền                                                                                                                                                                                                                                                                                             |
| **`ACCOUNTANT`**        | `/dashboard`                              | `/operations/warehouse-manager/warehouse` (cài đặt thù lao chuyến lẻ), `/operations/report`, `/operations/payslip`                         | Quản lý kế toán, tiền công & đối tác: `/management/accountant/payroll`, `/management/accountant/fuel`, `/management/shipper-leaves` (định mức thù lao giao thay), `/management/manager/partner`, `/management/manager/attendance`, `/management/manager/piecework` _(Không có quyền duyệt tài khoản nhân sự)_ |
| **`MANAGER`**           | `/dashboard`                              | `/operations/warehouse-manager/warehouse` (chế độ xem), `/operations/shipper/handover` (chế độ xem), `/operations/report`                 | Quản lý vận hành xưởng: `/management/manager/personnel`, `/management/manager/partner`, `/management/manager/attendance`, `/management/manager/piecework`, `/management/manager/approval`, `/management/shipper-leaves` (chỉ định shipper giao thay) _(Bị bóc tách 100% dữ liệu tiền bạc & lương)_       |
| **`ADMIN`**             | `/dashboard`                              | Toàn bộ các trang vận hành                                                                                                                  | Toàn quyền tuyệt đối 100% các chức năng quản lý, bao gồm cấu hình xưởng `/management/admin/workshop` và xóa vĩnh viễn tài khoản nhân sự                                                                                                                                                                     |

---

### 2.3. Cơ Chế PWA & Hàng Đợi Ngoại Tuyến (Offline Queue)

```mermaid
sequenceDiagram
    autonumber
    actor Shipper as Tài Xế (PWA Mobile)
    participant UI as Giao Diện Giao Nhận
    participant Queue as IndexedDB (offline-queue)
    participant Worker as Service Worker (Workbox)
    participant API as Backend API

    Shipper->>UI: Ký nhận phiếu khi mất mạng (Offline)
    UI->>Queue: Lưu thao tác vào IndexedDB kèm Idempotency-Key (UUIDv4)
    UI-->>Shipper: Hiển thị trạng thái "Đã lưu offline, đang chờ kết nối mạng..."

    Note over Worker: Thiết bị kết nối Internet trở lại (Online event)
    Worker->>Queue: Đọc các request tồn đọng trong IndexedDB
    loop Từng request ngoại tuyến
        Queue->>API: Gửi Request kèm Header Idempotency-Key
        API-->>Queue: Xử lý thành công (200 OK / 201 Created)
        Queue->>Queue: Xóa bản ghi đã đồng bộ khỏi IndexedDB
    end
    Queue-->>UI: Cập nhật giao diện: "Đã đồng bộ dữ liệu thành công!"
```

- **An toàn giao dịch:** Mỗi request gửi từ offline queue luôn đính kèm header `Idempotency-Key` (UUIDv4) để Backend nhận diện và xử lý idempotent, tuyệt đối không bị trùng lặp dữ liệu khi kết nối mạng chập chờn.
- **Tối ưu hóa ảnh & Canvas:** Ảnh chụp camera selfie và ảnh hóa đơn xăng được nén trực tiếp qua canvas client trước khi lưu queue hoặc gửi API (giới hạn dung lượng < 500KB) nhằm tiết kiệm băng thông di động 4G.
- **Tiêu chuẩn PWA Toàn Diện & Mobile-First (Plan 56):**
  - **Bộ Icon Chuẩn Kích Thước:** Cung cấp đầy đủ `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`, `apple-touch-icon-180x180.png` và `favicon-64x64.png`, đáp ứng trọn vẹn tiêu chí Installability của Google Lighthouse và iOS Safari Add to Home Screen.
  - **Lối Tắt Ứng Dụng (Web App Shortcuts):** Tích hợp 4 shortcut truy cập 1 chạm ngoài màn hình điện thoại: Giao Nhận Shipper (`/operations/shipper/handover`), Chấm Công Selfie (`/operations/attendance`), Trạm Công Thợ (`/operations/worker/piecework`), và Soạn Đồ Xuất Xưởng (`/operations/warehouse-manager/warehouse`).
  - **Bộ Nhớ Đệm CDN Thông Minh (Workbox Runtime Caching):** Precache toàn bộ bundle tĩnh HTML/CSS/JS, áp dụng chiến lược `CacheFirst` cho Google Fonts và `StaleWhileRevalidate` cho Cloudinary CDN (`res.cloudinary.com` - chữ ký số, ảnh phiếu bàn giao, hóa đơn xăng với thời gian lưu 30 ngày, tối đa 120 mục).
  - **Thông Báo Bản Cập Nhật Mới (`PwaReloadPrompt`):** Lắng nghe sự kiện `waiting` và `updatefound` từ Native Service Worker, tự động kiểm tra mỗi 30 phút và hiển thị Toast nổi kèm nút "Cập nhật ngay" (`skipWaiting` + `reload`).

---

### 2.4. Hệ Thống Thiết Kế Giao Diện Vận Hành (Modern Industrial UI System - Plan 19)

- **Typography & Font Stack:** Chuẩn hóa toàn bộ hệ thống sang `Plus Jakarta Sans` kết hợp `JetBrains Mono` cho các trường dữ liệu số/tiền tệ (`tabular-nums font-mono`).
- **Triết lý Thiết kế Ergonomics (Mode: Operate):**
  - Loại bỏ hoàn toàn các mẫu thiết kế "AI slop" (gradient rập khuôn, thẻ card phẳng lì).
  - Nút bấm cảm ứng cỡ lớn (`size="touch"` >= 52-56px) tối ưu thao tác 1 tay cho thợ xưởng và tài xế xe tải.
  - Hỗ trợ vùng đệm an toàn `env(safe-area-inset-bottom)` cho thiết bị iOS Safari và cử chỉ vuốt Android.
- **Bộ Component UI Cốt Lõi Mới (`src/components/ui/`):**
  - **`StatCard`:** Thẻ thống kê KPI vận hành chuyên nghiệp (container icon đa sắc thái, chỉ số nổi bật, badge xu hướng).
  - **`EmptyState`:** Minh họa trạng thái dữ liệu rỗng tinh tế kèm lời giải thích và nút hành động (CTA).
  - **`SkeletonLoader`:** Hiệu ứng shimmer mịn màng cho card và bảng dữ liệu khi tải mạng yếu.
  - **`Badge` & `Card`:** Bổ sung dot status indicator cho 5 trạng thái logistics (`SCHEDULED`, `IN_TRANSIT`, `PROCESSING`, `COMPLETED`, `DISPUTED`) và hiệu ứng hover elevation cho thẻ tương tác.
- **Trung Tâm Điều Hành (`DashboardPage.tsx`):**
  - Tích hợp Hero Banner thời gian thực, lưới 4 thẻ KPI trực quan và 2 bảng theo dõi tiến độ vận hành có trạng thái rỗng sinh động.

---

### 2.5. Phân Hệ Soạn Đồ Giao Hàng, Xuất Phiếu Giấy Zalo & Quản Lý Đối Tác (Plan 20)

- **Soạn Đồ Thủ Công & Prefill Thông Minh (`PrepOrderModal`):**
  - Cho phép chọn Thương hiệu -> Chi nhánh đối tác -> nạp danh mục đồ giặt (`item_catalogs`).
  - Tự động gọi API `/handover/previous-dirty` lấy số lượng đồ bẩn nhận hôm trước để điền sẵn vào cột số lượng sẽ giao ngày mai.
  - Hỗ trợ nhập 3 loại số lượng sạch: _Đã giao_, _Chưa giao_, _Giao trả nợ_ kèm cột _Ghi chú_ từng dòng.
  - **Tính năng Soạn đồ giao trước ca chiều (Plan 54):** Phục vụ các nhà hàng đông khách (Pizza 4P's...) thiếu khăn ăn cần giao trước một lượng khăn vào buổi chiều. Hỗ trợ tiện ích 1 chạm `AdvanceDeliveryPopoverComponent` (nhập số lượng và ngày giao chiều tự động sinh ghi chú chuẩn `Đã giao xxx chiếc vào chiều dd/mm/yyyy`) kết hợp Regex parser tự động nhận diện từ ghi chú gõ tay (`prepOrderAdvanceDeliveryHelper.ts`). Trên màn hình Thủ kho (`PrepOrderItemTableComponent` & `PrepOrderItemCardComponent`), cột số lượng phân rã trực quan `xxx (ca chính) + xxx (chiều - màu cam hổ phách)` với tổng số lượng bàn giao lưu vào database ($xxx + yyy$). Trên màn hình Shipper/Đối tác và Canvas ảnh phiếu giao nhận hiển thị số lượng tổng và ghi chú đó mà không bị ảnh hưởng.
  - Tích hợp khung Canvas ký tên điện tử và tự động điền họ tên người lập phiếu theo tài khoản đăng nhập.
  - Tối ưu hiển thị Responsive trên di động: Hỗ trợ chuyển đổi linh hoạt Dual View Mode giữa **Dạng Thẻ (`Card View`)** tiện bấm stepper và **Dạng Bảng (`Table View`)** cuộn ngang với cột STT, Tên đồ giặt ghim cố định bên trái (ẩn mã đồ phụ).
- **Xuất Phiếu Xuất Nhập Kho Vận Chuyển Chuẩn Mẫu Thực Tế (`HandoverDeliverySlipModal` & `HandoverExportHelper`):**
  - Render Canvas HTML5 mô phỏng chính xác phiếu giấy in thực tế của Pizza 4P's: khổ giấy A4 nền trắng (`900x1320px`), viền sắc nét.
  - **Khung thông tin công ty góc trên:** Cách lề trên chuẩn `50px` (`box1Y = 50;`), bố cục căn trái (`textAlign = "left"`) gồm 4 dòng độc lập: Tên công ty (`bold 17px`), Mã số thuế (`bold 15px`), Điện thoại (`bold 15px`), Địa chỉ (`bold 15px / 14px`) với các dấu hai chấm `:` thẳng hàng theo chiều dọc.
  - **Khung Nơi Nhận (`box2`):** Cỡ chữ to rõ (`15.5px` - `16.5px`), tên đối tác viết hoa in đậm `16.5px`, chi nhánh/bộ phận màu xanh dương đậm `#1d4ed8`.
  - **Bảng dịch vụ 16 dòng kẻ ô:** Hàng tiêu đề các cột chính nâng lên `bold 15px`, các cột con nâng lên `bold 12.5px`.
  - **Chân trang cam kết dịch vụ:** Căn đều 2 lề 100% chiều rộng bảng 820px (`footerY = 1100;`), cỡ chữ `13px` - `14px`, không để khoảng trắng thừa.
  - **Chế độ In Sạch (Clean Print):** Áp dụng CSS `@page { size: A4 portrait; margin: 0mm !important; }` triệt tiêu 100% header/footer của trình duyệt (`about:blank`, `1/1`, ngày giờ in).
  - **Khắc phục lỗi cuộn đỉnh phiếu trên PC:** Tái cấu trúc container sang `flex flex-col items-center justify-start py-6`, loại bỏ lỗi `items-center` đẩy đỉnh ảnh phiếu vào vùng âm cuộn.
  - Hỗ trợ nút **"In Phiếu"**, **"Tải Xuống Thành Ảnh (.PNG)"** và **"Sao chép ảnh"** để dán gửi ngay vào nhóm Zalo giao nhận.
- **Phân Quyền & Quản Lý Mã QR Zalo CSKH (`ZaloQrSettingsModal`, `PartnersActionBar`, `PartnersPage`):**
  - Tách nút cài đặt mã QR Zalo khỏi modal xem phiếu của nhân viên kho vận.
  - Tích hợp nút **"Cài QR Zalo Phiếu"** vào thanh công cụ Quản lý Đối tác (`/management/manager/partner`), giới hạn phân quyền truy cập cho vai trò **`ADMIN`** và **`MANAGER`**.
  - Thanh công cụ [PartnersActionBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/partners/components/PartnersActionBar.tsx) chuẩn hóa các nút hành động bên phải sang kích thước gọn gàng `size="sm"` (`h-8`, font `text-xs font-semibold`, icon `w-3.5 h-3.5`), cân đối với khối tab bên trái.
  - Modal xem phiếu tự động đọc mã QR đã lưu trong `localStorage ('TX_ZALO_QR_CODE')` và vẽ trực tiếp lên phiếu xuất.
- **Tự Động Lên Đơn Định Kỳ (`WarehouseScheduleSettingsDialog`):**
  - Cấu hình tự động sinh phiếu giao nhận cho các chi nhánh có lịch giao định kỳ (`DAILY`, `ALTERNATE_DAYS`) và tự động prefill số lượng đồ bẩn hôm trước sang số lượng sẽ giao ngày mai.
  - Các chi nhánh chưa có lịch cố định (`ON_DEMAND`) chỉ lên đơn thủ công.
- **Sửa Lỗi Popup Modal Chuẩn UX (`PartnerDialog` & `dialog.tsx`):**
  - Chuẩn hóa layout `Dialog` chống tràn mép, cố định Header và Footer, bọc các input vào container `max-h-[60vh] overflow-y-auto` giải quyết triệt để lỗi footer đè lên input.

---

### 2.6. Cải Tiến Cổng Đối Tác B2B, Form Đếm Đồ Bẩn Thông Minh & Kiểm Nhận Canvas 2 Chiều (Plan 21)

- **Quy Chuẩn 3 Tầng Giao Diện Với `@/components/common`:**
  - Tầng 1: `PageBanner` hiển thị tiêu đề cổng đối tác B2B, tên thương hiệu/chi nhánh, icon và trạng thái liên kết.
  - Tầng 2: `PageActionBar` chứa thanh điều hướng tab trên Desktop (`lg:flex`) và các nút thao tác nhanh.
  - Tầng 3: `ResponsiveCardGrid` hiển thị danh sách phiếu lịch sử tự co dãn từ 1 đến 4 cột chuẩn công thái học.
- **Menu Phân Hệ Đối Tác Mobile-First & Bỏ Hoàn Toàn Sidebar:**
  - Áp dụng cho 2 tuyến đường `/operations/partner-manager/partner` và `/operations/partner-staff/partner`.
  - 4 mục điều hướng cốt lõi: **Đếm đồ bẩn** (`COUNT`), **Kiểm nhận đồ sạch** (`RECEIPT`), **Lịch sử** (`HISTORY`), **Phê duyệt tài khoản** (`STAFF`, chỉ hiển thị nếu role là `PARTNER_MANAGER`).
  - Trên màn hình di động (`lg:hidden`), toàn bộ điều hướng chuyển xuống thanh **Mobile Bottom Bar** cố định đáy màn hình, đồng bộ trạng thái qua query param URL `?tab=`, ẩn nút Hamburger trên Header và nút 'Thêm' trên Bottom Bar.
  - **Bỏ hoàn toàn Sidebar trên Desktop & Drawer trên Mobile:** Ẩn `DesktopSidebar` và `MobileNavDrawer`, bỏ lùi lề `lg:pl-64` để nội dung mở rộng toàn màn hình, tinh giản tối đa không gian làm việc cho nhân viên và quản lý nhà hàng đối tác.
- **Form Đếm Đồ Bẩn Thông Minh & Ghép Phiếu Giao Nhận Kép (`PartnerCountTabComponent.tsx`):**
  - Tái cấu trúc chuẩn theo form `PrepOrderModal` hỗ trợ chuyển đổi linh hoạt Dual View Mode giữa **Dạng Thẻ (`Card View`)** và **Dạng Bảng (`Table View`)**.
  - Tự động nhận diện tài khoản để khóa cứng (disabled / read-only) Thương hiệu, Chi nhánh và Ngày (mặc định lấy theo ngày của phiếu soạn đồ do quản lý kho tạo).
  - Thay thế các cột soạn đồ thành duy nhất **1 cột số lượng: "Đồ chưa giặt"**. Bỏ ghi chú chung, giữ ghi chú từng chiếc nếu có phát sinh rách/hỏng.
  - **Cơ chế Smart Math Input & Tự động lưu khi rời ô (`onBlur`):** Hàm `parseSmartQtyExpression(input)` an toàn (không dùng `eval`), hỗ trợ nhập biểu thức tính toán phân cách bằng dấu cách hoặc phép tính (`12 34`, `12 + 34` => tính ra `46`, `50-10` => tính ra `40`); tự động tính kết quả và lưu ngay khi rời ô input.
  - **Lưu & Xuất Phiếu Kép:** Bấm _"Lưu và xem phiếu giao nhận"_ sẽ ghi nhận dữ liệu đếm đồ bẩn và chữ ký người đếm vào phiếu giao nhận (cột _Số lượng đã nhận_ `dirtyReceivedQty`), đồng thời ghép dữ liệu đồ sạch xưởng đã soạn trong ngày để hiển thị đồng thời cả 2 chiều trên phiếu xuất nhập kho Canvas.
- **Kiểm Nhận Đồ Sạch Trực Quan Bằng Canvas 2 Chiều (Tab `RECEIPT` - `PartnerReceiptTabComponent.tsx`):**
  - Hiển thị trực tiếp phiếu giao nhận 2 chiều xuất nhập kho vẽ bằng HTML5 Canvas sắc nét để đối tác kiểm đếm đồ sạch đối soát với đồ bẩn.
  - Nút điều hướng ngày: **Sang trái (`ChevronLeft`)** lùi 1 ngày, **Sang phải (`ChevronRight`)** tiến 1 ngày để dễ dàng lật xem phiếu giao nhận theo ngày.
  - **Kiểm đếm chi tiết từng món đồ sạch:** Cho phép ghi chú trực tiếp từng món đồ sạch: *Đủ hàng*, *Thiếu ? chiếc*, *Dư ? chiếc*, kèm nút bấm nhanh *✓ Tất Cả Đủ Hàng* và bộ điều chỉnh số lượng tăng/giảm chiếc thiếu/dư tiện lợi. Ghi chú này hiển thị trực tiếp vào ô Ghi chú của dòng tương ứng trên phiếu Canvas.
  - **Ghi chú chung ở hàng Tổng cộng:** Ô ghi chú chung (nhận xét đợt giao nhận) được viết trực tiếp vào hàng **TỔNG CỘNG**, cột **GHI CHÚ** trên phiếu xuất nhập kho Canvas.
  - **Live Canvas Preview:** Mỗi khi thay đổi ghi chú từng món, ghi chú chung hay chữ ký, phiếu Canvas 2 chiều tự động vẽ lại theo thời gian thực để người dùng xem trực quan trước khi xác nhận.
  - Ô **họ tên người nhận** (mặc định nạp tự động từ tài khoản đăng nhập `user.fullName || user.name`) và ô **ký tên** (`SignatureCanvas`) ngay dưới phiếu để ký xác nhận kiểm nhận gửi API `PATCH /handover/:id/partner-check-signature`.
- **Lịch Sử Giao Nhận Phân Trang & Tra Cứu Theo Ngày (Tab `HISTORY` - `PartnerHistoryTabComponent.tsx`):**
  - Danh sách phiếu giao nhận sắp xếp theo thứ tự **từ mới đến cũ** (mới nhất lên đầu) trong `ResponsiveCardGrid`.
  - **Phân trang (Pagination):** Tối đa **12 phiếu / trang** kèm thanh chuyển trang tiện lợi.
  - **Bộ lọc ngày cụ thể:** Bộ chọn ngày (Date Picker) lọc và xem ngay phiếu giao nhận của 1 ngày bất kỳ, bấm vào mở modal xem chi tiết phiếu Canvas.
- **Khắc Phục Toàn Diện Lỗi Console & Quyền Hạn:**
  - Sửa lỗi **403 Forbidden** trên các API `/partners/brands`, `/partners`, `/partners/catalogs`, `/handover/prep-order`: Cập nhật `permissions.map.ts` cấp đúng quyền truy cập cho `PARTNER_MANAGER` và `PARTNER_STAFF`.
  - Sửa lỗi **Maximum update depth exceeded** ở `PrepOrderModal.tsx`: Thêm điều kiện chặn vòng lặp `useEffect` khi danh sách chi nhánh rỗng hoặc nạp lại `defaultPartnerId`.

---

### 2.7. Tái Cấu Trúc HandoverRecord, Xem Trước Canvas Trực Quan, WebP Cloudinary & Gộp Trạm Đếm (Plan 23)

- **Xem Trước Canvas Trực Tiếp Trước Khi Lưu (Live Slip Preview):**
  - **Thủ kho (`PrepOrderModal.tsx` & `PrepOrderSlipPreviewComponent.tsx`):** Tích hợp component xem trước toàn bộ phiếu in ngay trong modal soạn đồ. Thủ kho kiểm tra trực quan các chiếc đồ đã soạn, chưa giao, giao trả nợ và chữ ký trước khi bấm lưu.
  - **Đại diện đối tác (`PartnerCountTabComponent.tsx`):** Render Canvas xem trước trực tiếp trên form đếm đồ bẩn, đặt phía trên nút lưu phiếu để đối tác quan sát dữ liệu ghép 2 chiều trước khi xác nhận.
- **Tối Ưu Hóa Ảnh Phiếu & Lưu Trữ Đám Mây (WebP Client Compress & Cloudinary CDN):**
  - Hàm tiện ích `renderHandoverSlipToWebpBase64` nén canvas sang định dạng `image/webp` chất lượng `0.85` (dung lượng < 120KB), truyền qua thuộc tính `slipImageBase64` khi lưu phiếu.
  - Backend NestJS nhận Base64 tải lên Cloudinary folder `thanhxuan/handovers`, lưu đường dẫn URL vào `slipImageUrl`, tự động xóa ảnh cũ ở background tránh rác bộ nhớ lưu trữ.
- **Tăng Tốc Hiển Thị Tab Kiểm Nhận (`PartnerReceiptTabComponent.tsx`):**
  - Loại bỏ hoàn toàn thao tác tính toán vẽ Canvas nặng nề trên thiết bị di động của đối tác; hiển thị trực tiếp thẻ `<img>` từ Cloudinary `slipImageUrl`.
  - Giữ lại fallback vẽ Canvas cục bộ chỉ khi phiếu cũ chưa có `slipImageUrl`.
- **Shipper Đếm Thay Đối Tác (`ShipperCountPartnerModal.tsx` & `ShipperHandoverItemCardComponent.tsx`):**
  - Shipper kích hoạt tính năng đếm thay khi đối tác bận rộn; tự động đánh dấu `countedByRole: 'SHIPPER'`.
  - Thẻ chiếc đồ tách thành `ShipperHandoverItemCardComponent` với nút stepper bấm nhạy trên di động.
  - Shipper có thể xem và tải trực tiếp ảnh phiếu Cloudinary đã lưu.
- **Gộp Trạm Đếm Lại Xưởng Vào HandoverRecord (`RecountStationPage.tsx`):**
  - Xóa bỏ collection `recount_tasks`, quản lý trạng thái kiểm đếm trực tiếp qua `recount` (`isRecount`, `status`, `recountedAt`, `recountedBy`) và `dirtyClothes.actualQuantity` của `HandoverRecord`.
  - Thợ kiểm đếm chỉ cần nhập số lượng đếm thực tế của từng chiếc hàng và lưu thẳng (`POST /handover/:id/recount`), không yêu cầu ký tên Canvas; hệ thống tự động sinh lại Canvas phiếu và cập nhật `slipImageUrl`.
- **Kỷ Luật Cấu Trúc Mã Nguồn Frontend:**
  - Bóc tách toàn diện các file lớn sang `modals/*Modal.tsx` và `components/*Component.tsx` (ví dụ `PrepOrderSlipPreviewComponent`, `ShipperCountPartnerModal`, `ShipperHandoverItemCardComponent`), đảm bảo mọi file dưới 250 - 300 dòng, tuân thủ nghiêm ngặt quy tắc dự án.

---

### 2.8. Chuẩn Hóa Bộ Lọc Ngày & Trải Nghiệm Tạo/Sửa Phiếu Giao Nhận (Plan 29)

- **Bộ lọc Thư viện ảnh phiếu (`HandoverSlipGalleryComponent.tsx`):**
  - Mặc định ngày bắt đầu `fromDate` là ngày đầu tháng hiện tại (`getFirstDayOfMonthVN()`) và ngày kết thúc `toDate` là ngày mai (`getTomorrowVN()`, tức ngày hiện tại + 1), áp dụng đồng bộ cho cả 3 tab: `WarehousePage?tab=SLIP_GALLERY`, `HandoverListPage?tab=HISTORY`, `PartnerPortalPage?tab=HISTORY`.
- **Tab Kiểm nhận đối tác (`PartnerPortalPage.tsx` & `PartnerReceiptTabComponent.tsx`):**
  - Tự động chuyển sang ngày mai khi truy cập vào khung giờ đêm 21h00 - 23h59 (`getTargetRecordDateVN()`).
  - Logic tìm phiếu hỗ trợ cả `h.recordDate === currentReceiptDate`.
  - Hiển thị badge trực quan "Hôm nay" hoặc "Giao ngày mai (Ca đêm)".
- **Tab Kho Sạch (`WarehouseHandoverPage.tsx`, `WarehouseCleanPlanTabComponent.tsx`, `WarehouseSummaryTabComponent.tsx`):**
  - Danh sách phiếu mặc định hiển thị ngày mai (`getTomorrowVN()`), tích hợp thanh điều khiển chọn ngày linh hoạt (Hôm nay, Ngày mai, Lùi/Tiến ngày, DatePicker).
  - Đổi tên toàn diện sang "Phiếu Giao Nhận" và nút "Tạo Phiếu Giao Nhận".
  - Đổi nút "Nhập đồ sạch sẽ giao" thành "Sửa Phiếu Giao Nhận", tích hợp chung modal `PrepOrderModal` nhận prop `initialRecord` để tự động điền dữ liệu đã tạo trước đó.
  - **Cài đặt hiển thị 1 loại đồ kho (`WarehouseItemFilterSettingsModal`, `warehouseItemDisplayHelper`):**
    - Cho phép cấu hình theo từng thương hiệu đối tác (ví dụ: Pizza 4P's chỉ hiện **Khăn ăn xám**) hoặc chọn lọc toàn cục.
    - Lưu trạng thái vào `localStorage` (`warehouse_item_display_settings`).
    - Tại tab `CLEAN_PLAN`: Số lượng đồ sạch trong phiếu hiển thị theo loại đồ lọc (kèm phụ chú tổng các loại nếu có khác biệt).
    - Tại tab `SUMMARY`: Số lượng "Bẩn vào" và "Sạch ra" ở từng chi nhánh và các card KPI tổng hợp tính chính xác theo loại đồ đã chọn.
    - Thanh điều khiển có nút cài đặt nhanh và banner trực quan hiển thị chế độ lọc đang bật, cho phép đổi hoặc tắt lọc 1-click.

---

### 2.9. Chuyển Đổi Trạm Khoán Việc Thợ Xưởng Sang Mô Hình HourlyWork (Plan 30)

- **Trạm công việc thợ theo giờ (`PieceworkStationPage.tsx`):**
  - Thay thế mô hình đếm sản lượng từng chiếc cũ sang mô hình tính công thợ theo thời gian làm việc nhân hệ số loại công việc: $\text{Tiền công} = (\text{minutesWorked} / 60) \times \text{hourlyBaseRate} \times \text{coefficient}$.
  - Danh mục 7 khâu công việc chuẩn: Rũ đồ (`SHAKE` - x1.2), Giặt & Sấy (`WASH_DRY` - x1.3), Gấp (`FOLD` - x1.0), Đếm/Phân loại (`COUNT` - x1.1), Là/Ủi (`IRON` - x1.2), Đóng gói (`PACK` - x1.0), Khác (`OTHER` - x1.0).
  - Bộ chọn thời gian tiện dụng cho thợ (các nút nhanh 15p, 30p, 45p, 60p, 120p kèm nút cộng/trừ và input phút tự do).
  - Khung tính trước tiền công ước tính hiển thị trực tiếp.
  - Bảng nhật ký công việc trong ngày, hỗ trợ thợ xóa mục đã ghi nhầm khi phiếu chưa bị xác nhận/CONFIRMED.
  - Ràng buộc ca làm việc: Thợ phải có ca `OPEN` trong ngày mới được phép ghi nhận công việc; giao diện có cảnh báo và nút chuyển sang trang chấm công nếu chưa check-in.
- **Menu điều hướng (`nav-config.ts`):**
  - Đổi tiêu đề menu từ "Khoán Việc" sang **"Công Thợ Theo Giờ"** (vận hành) và **"Duyệt Công Thợ Theo Giờ"** (quản lý).

### 2.10. Quản Lý Chữ Ký Điện Tử Đã Lưu & Trợ Thủ Ký Tên Thông Minh (Plan 35)

- **Hồ sơ cá nhân (`ProfileEditModal.tsx`):**
  - Hiển thị chữ ký điện tử mẫu đã lưu của tài khoản.
  - Hỗ trợ vẽ chữ ký mẫu mới trên Canvas hoặc xóa chữ ký mẫu đã lưu.
- **Component dùng chung (`SignatureInputComponent.tsx`):**
  - Tự động nhận diện `user.signatureUrl`.
  - Toggle linh hoạt giữa "Chữ ký đã lưu" và "Ký tay mới".
  - Hỗ trợ checkbox "Lưu làm chữ ký mặc định vào tài khoản cho các lần sau" khi đang ký tay mới.
- **Tích hợp đồng bộ 5 vị trí ký tên:**
  - `PrepOrderModal.tsx`: Thủ kho soạn đồ sạch xuất xưởng.
  - `SignatureModal.tsx`: Modal chung ký nhận bàn giao đồ sạch.
  - `ShipperCountPartnerModal.tsx`: Shipper kiểm đếm đồ bẩn cùng đối tác.
  - `PartnerReceiptTabComponent.tsx`: Đối tác xác nhận nhận đồ sạch.
  - `PartnerCountTabComponent.tsx`: Đối tác kiểm đếm và giao đồ bẩn.

---

### 2.11. Chức Năng Shipper Xin Nghỉ Giao Nhận & Phân Tuyến Kèm Tiền Công (Plan 55)

- **Màn hình Shipper Giao Nhận (`ShipperHandoverPage.tsx`):**
  - Tích hợp 2 nút bấm thao tác nhanh: **"Xin nghỉ giao nhận"** (`ShipperLeaveRequestModal.tsx`) và **"Lịch sử nghỉ"** (`ShipperLeaveHistoryModal.tsx`).
  - Shipper chọn 1 hoặc nhiều ngày nghỉ (`leaveDates`), nhập lý do xin nghỉ. Hệ thống tự động tính toán số điểm giao cần phân công thay thế.
  - Hiển thị badge chỉ báo nổi bật `Nhận giao thay: [Tên Shipper nghỉ]` kèm thông tin mức tiền công giao thay trong danh sách điểm giao nhận ngày hôm đó nếu Shipper là người được phân công làm thay.
- **Trang Quản Trị & Xét Duyệt Đơn (`ShipperLeaveReviewPage.tsx` tại `/management/shipper-leaves`):**
  - Dành cho các vai trò `ADMIN`, `MANAGER` và `ACCOUNTANT`.
  - Bộ lọc tabs theo trạng thái: Tất cả, Chờ Quản lý duyệt, Chờ Kế toán set công, Đã duyệt, Đã từ chối.
  - Thẻ đơn xin nghỉ (`ShipperLeaveCardComponent.tsx`) hiển thị minh bạch thông tin shipper xin nghỉ, danh sách ngày nghỉ, lý do, số điểm cần bàn giao, người duyệt và tiền công giao thay.
- **Bộ 3 Modals Nghiệp Vụ:**
  - `ApproveShipperLeaveModal.tsx`: Quản lý / Admin duyệt đơn, chọn tài khoản Shipper thay thế (từ danh sách shipper active). Nếu là `ADMIN`, hỗ trợ checkbox 1 chạm thiết lập tiền công luôn để hoàn tất phê duyệt ngay lập tức.
  - `SetLeaveCompensationModal.tsx`: Kế toán / Admin thiết lập số tiền công giao thay (hỗ trợ các nút chọn nhanh 100k, 150k, 200k, 250k, 300k và nhập số tiền tùy chọn), ghi chú kế toán và hoàn tất duyệt đơn.
  - `RejectShipperLeaveModal.tsx`: Quản lý / Admin từ chối đơn xin nghỉ kèm lý do phản hồi cho Shipper.
- **Menu điều hướng (`nav-config.ts`):**
  - Bổ sung mục **"Duyệt Nghỉ Giao Nhận"** vào nhóm ĐIỀU HÀNH & KINH DOANH cho Admin, Manager và Accountant.

