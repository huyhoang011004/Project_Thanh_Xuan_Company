# ĐẶC TẢ YÊU CẦU & THIẾT KẾ CỔNG VẬN HÀNH NỘI BỘ (SRS & SDD)
## PHÂN HỆ CỔNG VẬN HÀNH XƯỞNG & ĐIỀU PHỐI ĐỐI TÁC (fe-react-thanhxuan-internal)

> **Tài liệu tham chiếu cấp cao:** [SRS_SDD.md (Kiến Trúc Tổng Quan)](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md)  
> **Phiên bản:** 2.1 | **Môi trường:** React 18, Vite, TypeScript Strict, React Router v7, TailwindCSS, shadcn/ui  
> **Phạm vi mã nguồn:** `fe-react-thanhxuan-internal/src/**`  
> **Quy chuẩn kỹ thuật:** Feature-Based Flat Colocation, Barrel `index.ts`, Mobile-First PWA, Canvas Signature, Offline Queue IndexedDB, RBAC UI Guards

---

## 1. YÊU CẦU NGHIỆP VỤ (SRS)

### 1.1. Mục Tiêu & Đối Tượng Sử Dụng
Phân hệ `fe-react-thanhxuan-internal` là cổng điều hành số hóa toàn diện xưởng giặt là công nghiệp và chuỗi cung ứng B2B của Công ty Thanh Xuân:
1. **Đối tượng người dùng đa dạng (8 vai trò RBAC):**
   - **Tài xế giao nhận (`SHIPPER`)**: Thao tác trên thiết bị di động (Mobile PWA) tại đối tác để giao nhận đồ sạch/đồ bẩn, lấy chữ ký điện tử, nộp hóa đơn xăng xe.
   - **Thợ xưởng (`WORKER`)**: Chấm công vào/ra ca bằng camera selfie di động, chấm sản lượng khoán từng công đoạn (gấp, ủi, đóng gói), rạch bao đếm lại đồ gom.
   - **Thủ kho (`WAREHOUSE_MANAGER`)**: Soạn đồ sạch theo kế hoạch xuất xưởng, tiếp nhận đồ bẩn, kiểm đếm đối soát tại trạm đếm.
   - **Quản lý xưởng (`MANAGER`)**: Giám sát vận hành xưởng, phê duyệt tài khoản thợ/tài xế, chốt sản lượng khoán cuối ngày, rà soát các ca công bất thường. *(Ràng buộc: Bị ẩn 100% thông tin tiền bạc/lương)*.
   - **Đại diện đối tác (`PARTNER_MANAGER`, `PARTNER_STAFF`)**: Quản lý đối tác và Nhân viên đối tác (hỗ trợ alias tương thích ngược `RESTAURANT_MANAGER`, `RESTAURANT_STAFF`). Kiểm nhận đồ sạch tại chỗ, đếm đồ bẩn, ký xác nhận giao nhận, tra cứu bảng kê đối soát tháng, duyệt tài khoản nhân viên đối tác thuộc cơ sở mình.
   - **Kế toán (`ACCOUNTANT`)**: Phê duyệt đề xuất hoàn tiền xăng xe, cấu hình tham số lương, chạy tính bảng lương chu kỳ và xuất các báo cáo tài chính. *(Ràng buộc: Không tham gia phê duyệt tài khoản nhân sự)*.
   - **Quản trị viên hệ thống (`ADMIN`, `SYSTEM_ADMIN`)**: Toàn quyền quản trị nhân sự, đối tác, danh mục đồ giặt, khóa/mở khóa kỳ lương và giám sát toàn hệ thống.

---

### 1.2. Danh Sách Tính Năng Theo Nhóm Nghiệp Vụ (Functional Requirements)

#### FE-INT-FR-01: Xác Thực, Quản Trị Nhân Sự & Profile Header (`features/auth`, `features/management/auth`, `components/layout/AppHeader`)
- **Đăng nhập & Tài khoản mẫu:** Xác thực Email/Mật khẩu với Backend NestJS. Lưới tài khoản mẫu gồm 8 nút (Admin, Quản lý xưởng, Quản lý kho, Kế toán trưởng, Tài xế, Thợ xưởng, QL Đối Tác, NV Đối Tác) với mật khẩu mặc định `ThanhXuan@2026`, hỗ trợ đăng nhập tức thì.
- **Đăng ký tài khoản công khai (`/register`, `RegisterModal`):** Chỉ cho phép đăng ký 3 vai trò thực thi: **NV Xưởng** (`WORKER`), **NV Giao Hàng** (`SHIPPER`) và **Nhân Viên Đối Tác** (`PARTNER_STAFF`). Bỏ hoàn toàn vai trò Quản lý đối tác khỏi trang đăng ký công khai. Khi chọn Nhân viên đối tác, cascade chọn Thương hiệu (Brand) trước rồi lọc Chi nhánh (Partner).
- **Header Profile, Avatar & Dropdown Menu:**
  - Góc phải Header hiển thị Avatar tròn (ảnh Cloudinary hoặc ký tự viết tắt), Họ tên và Huy hiệu vai trò.
  - Dropdown Popover gồm 3 chức năng:
    * 👤 **Thông tin cá nhân:** Mở `ProfileEditModal` cho phép sửa họ tên, SĐT và chọn ảnh trực tiếp từ máy tính để upload lên Cloudinary. Cập nhật tức thì avatar trên Header.
    * 🔑 **Đổi mật khẩu:** Mở `ChangePasswordModal` nhập mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới.
    * 🚪 **Đăng xuất:** Gọi `logout()` và xóa toàn bộ session storage.
- **Quản lý nhân sự toàn diện (`StaffManagementView`):**
  - **Tabs phân loại tài khoản:** 6 nhóm: *Tất Cả*, *Ban Quản Trị & Kế Toán*, *Vận Hành Xưởng & Kho*, *Giao Nhận*, *Khối Đối Tác B2B*, *Tài Khoản Tạm Khóa*.
  - **Thêm nhân sự:** Modal tạo mới tài khoản cho `ADMIN` và `MANAGER`, hỗ trợ tạo cả tài khoản Quản lý đối tác (`PARTNER_MANAGER`) kèm chọn Brand và Chi nhánh. Mật khẩu khởi tạo: `ThanhXuan@2026`.
  - **Chỉnh sửa nhân sự:** Cập nhật họ tên, SĐT, vai trò, thương hiệu và chi nhánh.
  - **Tạm khóa tài khoản & Cơ chế 60 ngày:** Chuyển trạng thái sang `LOCKED`, ghi nhận thời điểm `lockedAt`, hiển thị số ngày còn lại (ví dụ: *Còn 59 ngày trước khi xóa vĩnh viễn*). Backend tự động xóa các tài khoản đã khóa quá 60 ngày. Hỗ trợ Mở khóa (`ACTIVE`).
  - **Xóa tài khoản vĩnh viễn:** **Chỉ hiển thị và cho phép thực hiện đối với vai trò `ADMIN`**. Quản lý xưởng (`MANAGER`) không có nút xóa.
- **Phê duyệt tài khoản (`approval_requests`):** Quản lý đối tác (`PARTNER_MANAGER`) duyệt nhân viên đối tác thuộc cơ sở mình; Quản lý xưởng và Admin duyệt nhân sự nội bộ (`WORKER`, `SHIPPER`). Kế toán bị tước bỏ hoàn toàn quyền duyệt nhân sự.
- **Quên mật khẩu & Đặt lại mật khẩu:** Quy trình khôi phục mật khẩu 2 bước thông qua OTP email.

#### FE-INT-FR-02: Phân Hệ Phiếu Giao Nhận Kép (`features/operations/handovers`)
- **Tạo phiếu giao nhận:** Shipper hoặc Quản lý tạo phiếu theo chi nhánh đối tác. Tự động tải danh mục đồ vải theo đúng thương hiệu (`brand`).
- **Soạn đồ sạch xuất kho (`features/operations/handovers` - `WarehousePage`):** Thủ kho chuẩn bị số lượng đồ sạch dự kiến giao theo lịch đối tác.
- **Giao nhận 2 chiều trên Mobile:**
  - Cập nhật số lượng đồ sạch bàn giao thực tế (`cleanDelivery`).
  - Ghi nhận đồ bẩn thu gom (`dirtyPickup`): Chọn chế độ `ON_SITE` (đếm chi tiết từng món tại quán) hoặc `AT_FACTORY` (gom bao niêm phong đếm tại xưởng).
- **Chữ ký điện tử Canvas (`SignatureCanvas`):** Đại diện đối tác ký nhận trực tiếp trên màn hình cảm ứng điện thoại/tablet (Base64 PNG < 280KB).
- **Cơ chế Tự động Check-in cho Shipper (Plan 13):** Khi Shipper ký xác nhận phiếu giao nhận đầu tiên trong ngày, hệ thống tự động kích hoạt check-in ca làm việc nếu chưa check-in.
- **Sửa đổi ô phiếu sau ký (`EditFieldModal`):** Cho phép sửa ô phiếu khi có sai lệch phát hiện sau ký, ghi nhận `edit_marks`, lý do sửa, phát sinh thông báo tới Quản lý và audit log.
- **Cổng giao nhận & đối soát đối tác (`features/operations/partners` - `PartnerPortalPage`):** Cổng tra cứu riêng cho đối tác đối soát tổng sản lượng giao nhận theo tháng, đếm đồ bẩn gửi về xưởng (`/handover/partner-count`), xem lịch sử phiếu của đúng chi nhánh mình (Scope Isolation), ẩn hoàn toàn đơn giá tài chính. Quản lý đối tác có thêm tab duyệt nhân viên chi nhánh mình.

#### FE-INT-FR-03: Trạm Đếm Đồ Bẩn Tại Xưởng (`features/recount` - `RecountStationPage`)
- Phân quyền chuyên biệt cho Thợ xưởng (`WORKER`) và Thủ kho (`WAREHOUSE_MANAGER`).
- Danh sách các phiếu gom bao niêm phong từ xe tải chở về xưởng.
- Thao tác rạch bao đếm lại: Nhập số lượng thực tế từng món đồ, chụp ảnh hiện trường bao niêm phong, tự động tính chênh lệch thừa/thiếu (`variance`) so với số lượng nhà hàng khai báo.

#### FE-INT-FR-04: Chấm Công Camera Selfie & Khoán Sản Lượng (`features/attendance`, `features/piecework`)
- **Chấm công camera selfie (`WorkerAttendancePage`):**
  - Chỉ hiển thị cho Thợ xưởng (`WORKER`). Bắt buộc chụp ảnh trực tiếp từ camera trước của điện thoại, nén ảnh client trước khi tải lên.
  - Chặn chấm ca trùng (mỗi thợ chỉ có 1 ca mở trong ngày).
- **Chấm sản lượng khoán thợ (`WorkerPieceworkPage`):**
  - Thợ chọn món đồ và công đoạn (Gấp, Ủi, Đóng gói) để ghi nhận sản lượng.
  - Tự động lấy đơn giá chuẩn từ hệ thống tại thời điểm làm việc, thợ không thể can thiệp đơn giá.
  - Hỗ trợ nhập số âm để trừ bù khi kiểm đếm nhầm.
- **Chốt duyệt sản lượng (`ManagerPieceworkConfirmModal`):** Quản lý xưởng rà soát tổng sản lượng toàn xưởng vào cuối ngày và chốt duyệt trạng thái `CONFIRMED`.

#### FE-INT-FR-05: Quản Lý Hoàn Tiền Xăng Xe (`features/operations/fuel`, `features/management/fuel`)
- **Tài xế nộp đề xuất xăng (`FuelProposalPage`):** Chỉ hiển thị cho vai trò `SHIPPER`. Bắt buộc chụp ảnh hóa đơn cây xăng và ảnh đồng hồ công-tơ-mét / vạch xăng xe.
- **Kế toán duyệt xăng xe (`FuelApprovalPage`):** Kế toán và Admin duyệt hoặc từ chối đề xuất hoàn tiền. Quản lý xưởng bị ẩn chức năng này để bảo vệ thông tin tài chính.

#### FE-INT-FR-06: Quản Trị Bảng Lương & Tra Cứu Phiếu Lương (`features/operations/payroll`, `features/management/payroll`)
- **Quản lý kỳ lương (`PayrollPeriodPage`):** Kế toán và Admin khởi tạo kỳ lương tháng, tính toán tổng hợp tự động từ giờ công, sản lượng khoán và tiền hoàn xăng.
- **Đóng băng kỳ lương:** Khóa kỳ lương chuyển sang `LOCKED` (đóng băng dữ liệu nguồn). Chỉ Admin có quyền mở khóa kèm ghi nhận audit log.
- **Tra cứu phiếu lương cá nhân (`PayslipViewPage`):**
  - Nhân viên tự tra cứu chi tiết phiếu lương của mình (giờ công, sản lượng, hoàn xăng, khấu trừ, thực nhận).
  - Chỉ hiển thị khi kỳ lương đã ở trạng thái `LOCKED` hoặc `PAID`. Tuyệt đối không cho phép xem chéo phiếu lương.
  - Ẩn hoàn toàn với vai trò `ADMIN` (Admin không có phiếu lương nhân viên).

#### FE-INT-FR-07: Trung Tâm Báo Cáo Phân Tích & Xuất File (`features/operations/reports`, `features/management/reports`)
- Giao diện trực quan hóa 6 báo cáo aggregation: Báo cáo kho, Đối soát đối tác, Chấm công thợ, Lịch trình shipper, Sự cố chênh lệch và Báo cáo xăng xe.
- Bộ lọc khoảng ngày linh hoạt (tối đa 31 ngày).
- Xuất file tải về trực tiếp: Xuất file Excel XLSX và PDF streaming.
- Tự động bóc tách trường tiền lương khi Quản lý xưởng (`MANAGER`) truy cập.

---

## 2. THIẾT KẾ KIẾN TRÚC & HỆ THỐNG (SDD)

### 2.1. Cấu Trúc Thư Mục & Tổ Chức Mã Nguồn

```Markdown
fe-react-thanhxuan-internal/src/
├── app/
│   ├── (auth)/                          # Đăng nhập, Đăng ký OTP, Quên mật khẩu
│   │   ├── login/page.tsx               # /login
│   │   ├── register/page.tsx            # /register
│   │   └── forgot-password/page.tsx     # /forgot-password
│   │
│   ├── (internal)/                      # Vùng vận hành yêu cầu JWT xác thực
│   │   ├── layout.tsx                   # Layout khung: Topbar, Sidebar, Navigation
│   │   ├── dashboard/page.tsx           # /dashboard - Thống kê KPI tổng quan
│   │   │
│   │   ├── operations/                  # Phân hệ Vận Hành theo đối tượng (/operations/* - 100% số ít)
│   │   │   ├── attendance/page.tsx      # /operations/attendance - Thợ chấm công selfie
│   │   │   ├── payslip/page.tsx         # /operations/payslip - Tra cứu phiếu lương cá nhân
│   │   │   ├── report/page.tsx          # /operations/report - Trung tâm báo cáo & xuất Excel/PDF (số ít)
│   │   │   ├── warehouse-manager/
│   │   │   │   └── warehouse/page.tsx   # /operations/warehouse-manager/warehouse - Thủ kho soạn đồ sạch
│   │   │   ├── shipper/
│   │   │   │   ├── handover/page.tsx    # /operations/shipper/handover - Giao nhận 2 chiều
│   │   │   │   ├── handover/[recordCode]/page.tsx # Chi tiết phiếu & chữ ký Canvas
│   │   │   │   └── fuel/page.tsx        # /operations/shipper/fuel - Nộp hóa đơn xăng xe
│   │   │   ├── worker/
│   │   │   │   ├── recount/page.tsx     # /operations/worker/recount - Trạm đếm gom bao xưởng
│   │   │   │   └── piecework/page.tsx   # /operations/worker/piecework - Chấm sản lượng khoán
│   │   │   ├── partner-manager/
│   │   │   │   └── partner/page.tsx     # /operations/partner-manager/partner - Cổng đối tác (Quản lý)
│   │   │   └── partner-staff/
│   │   │       └── partner/page.tsx     # /operations/partner-staff/partner - Cổng đối tác (Nhân viên)
│   │   │
│   │   └── management/                  # Phân hệ Quản Trị theo vai trò (/management/* - 100% số ít)
│   │       ├── page.tsx                 # /management - Hub điều hành chung (thích ứng theo role)
│   │       ├── manager/
│   │       │   ├── approval/page.tsx    # /management/manager/approval - Phê duyệt tài khoản (số ít)
│   │       │   ├── personnel/page.tsx   # /management/manager/personnel - Quản trị nhân sự & RBAC
│   │       │   ├── partner/page.tsx     # /management/manager/partner - Quản trị chuỗi đối tác (số ít)
│   │       │   ├── attendance/page.tsx  # /management/manager/attendance - Bảng công toàn xưởng
│   │       │   └── piecework/page.tsx   # /management/manager/piecework - Chốt sản lượng khoán
│   │       └── accountant/
│   │           ├── fuel/page.tsx        # /management/accountant/fuel - Duyệt đề xuất xăng xe
│   │           └── payroll/page.tsx     # /management/accountant/payroll - Bảng lương chu kỳ & chốt sổ
│   │
│   ├── layout.tsx                       # Root Layout: AuthProvider, QueryClientProvider
│   └── router.tsx                       # Centralized Router cấu hình Route Guards & Backward Redirects
│
├── components/                          # Layout (nav-config, AppHeader, Sidebar), Shell, shadcn/ui
├── features/                            # Phân định rõ ràng Management vs Operations (đồng nhất backend)
│   ├── auth/                            # Shared Auth: AuthContext, LoginForm, RegisterForm, useAuth
│   ├── dashboard/                       # DashboardPage, KPICards, QuickActions
│   ├── management/                      # Module Quản trị cấp quản lý & văn phòng
│   │   ├── attendance/                  # ManagerAttendanceView
│   │   ├── auth/                        # ApprovalList, ApprovalActionModal (re-export từ auth)
│   │   ├── fuel/                        # FuelApprovalView, FuelApprovalModal
│   │   ├── handovers/                   # HandoverReviewView (kiểm soát giao nhận)
│   │   ├── partners/                    # PartnerListView, ItemCatalogModal
│   │   ├── payroll/                     # PayrollPeriodManagementView, PayslipModal
│   │   ├── piecework/                   # ManagerPieceworkConfirmView
│   │   └── reports/                     # ReportsManagementDashboard, ExportModal
│   │
│   └── operations/                      # Module Vận hành hiện trường xưởng & di động
│       ├── attendance/                  # CameraCheckIn, WorkerAttendancePage
│       ├── fuel/                        # FuelProposalForm, FuelProposalPage
│       ├── handovers/                   # HandoverListPage, HandoverDetailPage, CanvasSign, WarehousePage, RecountStation
│       ├── partners/                    # PartnerPortalPage (đối soát đối tác)
│       ├── payroll/                     # PayslipPersonalPage
│       ├── piecework/                   # WorkerPieceworkForm, WorkerPieceworkPage
│       └── reports/                     # OperationsReportPage
│
├── lib/                                 # Tiện ích hạ tầng (api-client, permissions, offline-queue, utils)
└── types/                               # TypeScript Interfaces & Enums chuẩn hóa
```

---

### 2.2. Ma Trận Điều Hướng & Phân Quyền Menu (Navigation & RBAC)

Dựa trên cấu hình chuẩn hóa từ Plan 13, Plan 14 và Plan 16:

| Nhóm Tài Khoản | Tuyến Đường Mặc Định | Quyền Truy Cập Vận Hành (`/operations`) | Quyền Truy Cập Quản Lý (`/management`) |
| :--- | :--- | :--- | :--- |
| **`SHIPPER`** | `/operations/shipper/handover` | `/operations/shipper/handover`, `/operations/shipper/fuel`, `/operations/payslip` | ❌ Không có quyền |
| **`WORKER`** | `/operations/worker/piecework` | `/operations/worker/piecework`, `/operations/attendance`, `/operations/worker/recount`, `/operations/payslip` | ❌ Không có quyền |
| **`WAREHOUSE_MANAGER`**| `/operations/warehouse-manager/warehouse` | `/operations/warehouse-manager/warehouse`, `/operations/worker/recount`, `/operations/shipper/handover` (chế độ xem), `/operations/payslip` | ❌ Không có quyền *(Bị ẩn trường tiền)* |
| **`RESTAURANT_MANAGER`**| `/operations/partner-manager/partner`| `/operations/partner-manager/partner`, `/operations/shipper/handover` (chỉ chi nhánh mình) | `/management/manager/approval` (Chỉ xem và duyệt nhân viên chi nhánh mình) |
| **`RESTAURANT_STAFF`** | `/operations/partner-staff/partner` | `/operations/partner-staff/partner`, `/operations/shipper/handover` (chỉ chi nhánh mình) | ❌ Không có quyền |
| **`ACCOUNTANT`** | `/dashboard` | `/operations/payslip`, `/operations/report` | Quản lý kế toán & đối tác: `/management/accountant/payroll`, `/management/accountant/fuel`, `/management/manager/partner`, `/management/manager/personnel` *(Không có quyền duyệt tài khoản)* |
| **`MANAGER`** | `/dashboard` | `/operations/shipper/handover` (chế độ xem), `/operations/report` | Quản lý vận hành xưởng: `/management/manager/personnel`, `/management/manager/partner`, `/management/manager/attendance`, `/management/manager/piecework`, `/management/manager/approval` *(Ẩn hoàn toàn bảng lương & tiền)* |
| **`ADMIN`** | `/dashboard` | Toàn bộ các trang vận hành | Toàn quyền tuyệt đối 100% các chức năng quản lý |

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
