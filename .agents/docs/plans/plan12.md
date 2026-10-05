# Plan 12: Tái cấu trúc Định tuyến Vận hành (van-hanh) & Quản lý (quan-ly) theo Nhóm Tài khoản

> Status: Done | Created: 2026-10-05

## 1. Overview & Affected Files

### 1.1. Mục tiêu
Tái cấu trúc toàn bộ cây thư mục định tuyến `src/app/(internal)/` và tệp cấu hình `src/app/router.tsx` của ứng dụng Cổng Vận Hành Xưởng & Quản Trị Nội Bộ (`fe-react-thanhxuan-internal`):
1. **Phân hệ Vận hành (`van-hanh/`)**: Gom nhóm các trang vận hành xưởng và chia tách theo từng nhóm vai trò tài khoản (`warehouse-manager`, `shipper`, `worker`, `restaurant-manager`, `restaurant-staff`). Các màn hình dùng chung cho toàn thể nhân sự xưởng (`cham-cong`, `phieu-luong`, `bao-cao`) được đặt trực tiếp ở ngoài thư mục `van-hanh/` mà không phân chia riêng theo tài khoản.
2. **Phân hệ Quản trị (`quan-ly/`)**: Phân chia các trang quản trị chuyên sâu thành 2 nhóm vai trò chính: `manager` (Quản lý điều hành xưởng) và `accountant` (Kế toán tài chính). Các trang dùng chung cấp quản lý (`page.tsx` - Hub quản trị và `phe-duyet/page.tsx` - Phê duyệt tài khoản) được đặt trực tiếp ở ngoài thư mục `quan-ly/`.
3. **Đồng bộ toàn diện hệ thống**: Cập nhật `nav-config.ts` (Sidebar Desktop, Mobile Bottom Bar, Mobile Drawer), `AuthContext.tsx` (`getDefaultRouteForRole`), các liên kết nội bộ trong `ManagementPage.tsx`, `DashboardPage.tsx`, `HandoverListPage.tsx`, `HandoverDetailPage.tsx`, đồng thời bổ sung cấu hình Redirect tương thích ngược trong `router.tsx` và chuẩn hóa tài liệu [create-react-feature/SKILL.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/skills/create-react-feature/SKILL.md).

### 1.2. Phạm vi
- Ứng dụng: `fe-react-thanhxuan-internal`
- Thư mục định tuyến: `fe-react-thanhxuan-internal/src/app/(internal)/`
- Bộ điều hướng & phân quyền: `router.tsx`, `nav-config.ts`, `AuthContext.tsx`
- Các trang & component gọi navigate liên quan
- Tài liệu quy chuẩn: `.agents/skills/create-react-feature/SKILL.md`

### 1.3. Out of scope
- Không sửa đổi schema MongoDB, DTO hay API controller ở Backend (`be-nestjs-thanhxuan`).
- Không sửa đổi ứng dụng Web công khai & CMS Next.js (`fe-nextjs-thanhxuan-laundry`).
- Không viết lại logic nghiệp vụ nội tại của các features (`piecework`, `attendance`, `handover`, `partners`, `payroll`, `reports`, `fuel`); chỉ di chuyển và cập nhật wrapper page, route và phân quyền `allowedRoles`.

### 1.4. Assumptions
- **Quy ước đặt tên thư mục & URL**: Tuân thủ quy định [AGENTS.md line 66](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/rules/AGENTS.md#L66) (`Naming: File kebab-case, class PascalCase, biến/hàm camelCase`), các phân đoạn URL và thư mục được chuẩn hóa sang dạng kebab-case (`warehouse-manager`, `shipper`, `worker`, `restaurant-manager`, `restaurant-staff`, `manager`, `accountant`).
- **Tương thích ngược**: Các URL cũ (`/kho`, `/giao-nhan`, `/tram-dem`, `/quan-ly/nhan-su`, ...) sẽ được đăng ký redirect 301/replace sang URL mới tương ứng trong `router.tsx` để tránh gãy bookmark hoặc đường dẫn hiện hữu.
- **Tính năng dùng chung**:
  - Trong `van-hanh`: `cham-cong` (mọi nhân viên điểm danh), `phieu-luong` (nhân viên tra cứu lương cá nhân), `bao-cao` (trung tâm báo cáo dữ liệu xưởng).
  - Trong `quan-ly`: `page.tsx` (Hub điều hành), `phe-duyet/page.tsx` (Phê duyệt tài khoản nhân viên & nhà hàng do cả Admin, Manager và Restaurant Manager cùng tham gia).

### 1.5. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/warehouse-manager/kho/page.tsx` | Add | Thủ kho soạn đồ sạch xuất kho theo lịch (`StaffRole.WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/shipper/giao-nhan/page.tsx` | Add | Danh sách phiếu giao nhận cho Tài xế xe tải & kho (`StaffRole.SHIPPER`, `WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/shipper/giao-nhan/[recordCode]/page.tsx` | Add | Chi tiết phiếu giao nhận & ký nhận đồ vải cho Tài xế & các bên liên quan |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/shipper/xang/page.tsx` | Add | Tài xế nộp đề xuất hoàn tiền xăng kèm ảnh (`StaffRole.SHIPPER`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/worker/tram-dem/page.tsx` | Add | Trạm rạch bao đếm lại đồ bẩn xưởng cho Thợ xưởng (`StaffRole.WORKER`, `MANAGER`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/worker/khoan-viec/page.tsx` | Add | Thợ xưởng chấm sản lượng khoán gấp, ủi, đóng gói (`StaffRole.WORKER`, `MANAGER`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/restaurant-manager/nha-hang/page.tsx` | Add | Cổng nhà hàng cho Quản lý nhà hàng đối tác (`StaffRole.RESTAURANT_MANAGER`, `MANAGER`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/restaurant-staff/nha-hang/page.tsx` | Add | Cổng nhà hàng cho Nhân viên nhà hàng đối tác (`StaffRole.RESTAURANT_STAFF`, `RESTAURANT_MANAGER`, `MANAGER`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/cham-cong/page.tsx` | Add | Chấm công camera selfie cá nhân (chung toàn bộ nhân sự xưởng/đối tác) |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/phieu-luong/page.tsx` | Add | Nhân viên tra cứu phiếu lương cá nhân (chung mọi thợ/tài xế xưởng) |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/bao-cao/page.tsx` | Add | 6 Báo cáo tổng hợp Aggregation & xuất Excel/PDF (chung quản lý/kế toán/thủ kho) |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/manager/nhan-su/page.tsx` | Add | Quản lý nhân sự, phân quyền, khóa tài khoản (`StaffRole.MANAGER`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/manager/doi-tac/page.tsx` | Add | Quản lý đối tác, chi nhánh, lịch giao & catalog đồ giặt (`StaffRole.MANAGER`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/manager/cham-cong/page.tsx` | Add | Bảng công toàn xưởng & duyệt ca bất thường (`StaffRole.MANAGER`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/manager/khoan-viec/page.tsx` | Add | Báo cáo sản lượng toàn xưởng & chốt sản lượng (`StaffRole.MANAGER`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/accountant/xang/page.tsx` | Add | Kế toán duyệt/từ chối hóa đơn hoàn xăng (`StaffRole.ACCOUNTANT`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/accountant/bang-luong/page.tsx` | Add | Cấu hình lương & chốt bảng lương chu kỳ (`StaffRole.ACCOUNTANT`, `ADMIN`) |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/page.tsx` | Edit | Hub tổng quan quản trị (đặt ngoài thư mục con - dùng chung cấp điều hành) |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/phe-duyet/page.tsx` | Edit | Phê duyệt tài khoản nhân viên & nhà hàng (đặt ngoài thư mục con - dùng chung) |
| `fe-react-thanhxuan-internal/src/app/(internal)/kho/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `van-hanh/warehouse-manager/kho/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/tram-dem/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `van-hanh/worker/tram-dem/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/nha-hang/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `van-hanh/restaurant-*/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/cham-cong/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `van-hanh/cham-cong/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/khoan-viec/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `van-hanh/worker/khoan-viec/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/xang/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `van-hanh/shipper/xang/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/phieu-luong/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `van-hanh/phieu-luong/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/bao-cao/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `van-hanh/bao-cao/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/giao-nhan/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `van-hanh/shipper/giao-nhan/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/nhan-su/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `quan-ly/manager/nhan-su/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/doi-tac/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `quan-ly/manager/doi-tac/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/cham-cong/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `quan-ly/manager/cham-cong/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/khoan-viec/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `quan-ly/manager/khoan-viec/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/xang/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `quan-ly/accountant/xang/` |
| `fe-react-thanhxuan-internal/src/app/(internal)/quan-ly/bang-luong/` | Delete | Dọn dẹp thư mục cũ sau khi chuyển sang `quan-ly/accountant/bang-luong/` |
| `fe-react-thanhxuan-internal/src/app/router.tsx` | Edit | Khai báo các tuyến route mới, gom nhóm theo tiền tố và thêm redirect tương thích ngược |
| `fe-react-thanhxuan-internal/src/components/layout/nav-config.ts` | Edit | Cập nhật URL `path` cho nhóm menu Sidebar và hàm `getMobileQuickNavItems` |
| `fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx` | Edit | Cập nhật hàm `getDefaultRouteForRole` trỏ về route đích mới của từng vai trò |
| `fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx` | Edit | Cập nhật các lệnh navigate sang các trang con trong `quan-ly/manager/` và `quan-ly/accountant/` |
| `fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx` | Edit | Cập nhật các lệnh navigate nhanh sang trạm đếm, giao nhận, chấm công |
| `fe-react-thanhxuan-internal/src/features/handover/HandoverListPage.tsx` | Edit | Cập nhật điều hướng chi tiết sang `/van-hanh/shipper/giao-nhan/:recordCode` |
| `fe-react-thanhxuan-internal/src/features/handover/HandoverDetailPage.tsx` | Edit | Cập nhật nút quay lại sang `/van-hanh/shipper/giao-nhan` |
| `.agents/skills/create-react-feature/SKILL.md` | Edit | Cập nhật ma trận đối chiếu Backend API -> Frontend Routes và cây thư mục định tuyến `src/app/` hoàn chỉnh |

---

## 2. Technical Approach

### 2.1. Cấu trúc thư mục định tuyến mới (`fe-react-thanhxuan-internal/src/app/(internal)/`)

```
src/app/(internal)/
├── layout.tsx                                    # InternalLayout (AppLayout + ProtectedRoute)
├── tong-quan/                                    # Hub KPI tổng quan xưởng
│   └── page.tsx
│
├── van-hanh/                                     # Phân hệ Vận hành xưởng & Đối tác
│   ├── warehouse-manager/                        # [Nhóm Thủ kho]
│   │   └── kho/page.tsx                          # Soạn đồ sạch xuất kho theo lịch
│   │
│   ├── shipper/                                  # [Nhóm Tài xế]
│   │   ├── giao-nhan/page.tsx                    # Danh sách phiếu giao nhận
│   │   ├── giao-nhan/[recordCode]/page.tsx       # Chi tiết phiếu & ký nhận
│   │   └── xang/page.tsx                         # Đề xuất hoàn tiền xăng kèm ảnh
│   │
│   ├── worker/                                   # [Nhóm Thợ xưởng]
│   │   ├── tram-dem/page.tsx                     # Trạm rạch bao đếm lại đồ bẩn
│   │   └── khoan-viec/page.tsx                   # Chấm sản lượng khoán (gấp, ủi, đóng gói)
│   │
│   ├── restaurant-manager/                       # [Nhóm Quản lý nhà hàng]
│   │   └── nha-hang/page.tsx                     # Bảng kê đối soát giao nhận tháng & phê duyệt nhân viên
│   │
│   ├── restaurant-staff/                         # [Nhóm Nhân viên nhà hàng]
│   │   └── nha-hang/page.tsx                     # Đối soát nhận hàng & ký nhận
│   │
│   │── (Dùng chung trong van-hanh - đặt ngoài không chia):
│   ├── cham-cong/page.tsx                        # Chấm công camera selfie & lịch sử cá nhân
│   ├── phieu-luong/page.tsx                      # Tra cứu phiếu lương cá nhân
│   └── bao-cao/page.tsx                          # 6 Báo cáo tổng hợp Aggregation & xuất Excel/PDF
│
└── quan-ly/                                      # Trung tâm Quản trị & Điều hành
    ├── page.tsx                                  # Hub tổng quan quản trị (dùng chung ngoài)
    ├── phe-duyet/page.tsx                        # Phê duyệt tài khoản nhân viên & nhà hàng (dùng chung ngoài)
    │
    ├── manager/                                  # [Nhóm Quản lý xưởng / Điều hành]
    │   ├── nhan-su/page.tsx                      # Quản lý nhân sự, phân quyền, khóa tài khoản
    │   ├── doi-tac/page.tsx                      # Quản lý đối tác, chi nhánh, catalog đồ giặt
    │   ├── cham-cong/page.tsx                    # Bảng công toàn xưởng & duyệt ca bất thường
    │   └── khoan-viec/page.tsx                   # Báo cáo sản lượng toàn xưởng & chốt sản lượng
    │
    └── accountant/                               # [Nhóm Kế toán]
        ├── xang/page.tsx                         # Kế toán duyệt/từ chối hóa đơn hoàn xăng
        └── bang-luong/page.tsx                   # Cấu hình lương & chốt bảng lương chu kỳ
```

### 2.2. Ánh xạ Route URL và Phân quyền (`allowedRoles`)

| Tuyến đường mới (URL Path) | Vai trò được phép (`allowedRoles`) | Component hiển thị | Ghi chú |
| :--- | :--- | :--- | :--- |
| `/van-hanh/warehouse-manager/kho` | `WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN` | `<WarehousePage />` | Thủ kho soạn đồ |
| `/van-hanh/shipper/giao-nhan` | `SHIPPER`, `WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN` | `<HandoverListPage />` | Danh sách phiếu giao nhận |
| `/van-hanh/shipper/giao-nhan/:recordCode` | `SHIPPER`, `WAREHOUSE_MANAGER`, `MANAGER`, `ADMIN`, `RESTAURANT_MANAGER`, `RESTAURANT_STAFF` | `<HandoverDetailPage />` | Chi tiết phiếu giao nhận |
| `/van-hanh/shipper/xang` | `SHIPPER` | `<FuelPage />` | Đề xuất tiền xăng |
| `/van-hanh/worker/tram-dem` | `WORKER`, `MANAGER`, `ADMIN` | `<PieceworkStationPage />` | Rạch bao đếm đồ |
| `/van-hanh/worker/khoan-viec` | `WORKER`, `MANAGER`, `ADMIN` | `<PieceworkStationPage />` | Chấm khoán sản lượng |
| `/van-hanh/restaurant-manager/nha-hang`| `RESTAURANT_MANAGER`, `MANAGER`, `ADMIN` | `<RestaurantPage />` | Cổng quản lý nhà hàng |
| `/van-hanh/restaurant-staff/nha-hang`  | `RESTAURANT_STAFF`, `RESTAURANT_MANAGER`, `MANAGER`, `ADMIN` | `<RestaurantPage />` | Cổng nhân viên nhà hàng |
| `/van-hanh/cham-cong` | *Mọi vai trò đăng nhập* | `<AttendancePage />` | Dùng chung toàn xưởng |
| `/van-hanh/phieu-luong` | `WORKER`, `SHIPPER`, `WAREHOUSE_MANAGER`, `MANAGER`, `ACCOUNTANT`, `ADMIN` | `<MyPayslipPage />` | Dùng chung nhân viên |
| `/van-hanh/bao-cao` | `ADMIN`, `MANAGER`, `ACCOUNTANT`, `WAREHOUSE_MANAGER` | `<BaoCaoPage />` | Dùng chung quản lý/thủ kho |
| `/quan-ly` | `ADMIN`, `MANAGER`, `ACCOUNTANT` | `<ManagementPage />` | Dùng chung Hub điều hành |
| `/quan-ly/phe-duyet` | `ADMIN`, `MANAGER`, `RESTAURANT_MANAGER` | `<ApprovalManagementView />` | Dùng chung duyệt tài khoản |
| `/quan-ly/manager/nhan-su` | `ADMIN`, `MANAGER` | `<StaffManagementView />` | Quản lý nhân sự xưởng |
| `/quan-ly/manager/doi-tac` | `ADMIN`, `MANAGER` | `<PartnersPage />` | Quản lý đối tác chuỗi |
| `/quan-ly/manager/cham-cong` | `ADMIN`, `MANAGER` | `<AttendanceReviewView />` | Duyệt công toàn xưởng |
| `/quan-ly/manager/khoan-viec` | `ADMIN`, `MANAGER` | `<PieceworkConfirmView />` | Chốt sản lượng ngày |
| `/quan-ly/accountant/xang` | `ADMIN`, `ACCOUNTANT` | `<FuelReviewView />` | Duyệt hóa đơn xăng |
| `/quan-ly/accountant/bang-luong` | `ADMIN`, `ACCOUNTANT` | `<PayrollManagementView />` | Bảng lương & kỳ lương |

### 2.3. Điều hướng mặc định sau đăng nhập (`getDefaultRouteForRole`)
Cập nhật trong [AuthContext.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx#L42-L60):
- `StaffRole.WORKER` $\rightarrow$ `/van-hanh/worker/khoan-viec`
- `StaffRole.SHIPPER` $\rightarrow$ `/van-hanh/shipper/giao-nhan`
- `StaffRole.WAREHOUSE_MANAGER` $\rightarrow$ `/van-hanh/warehouse-manager/kho`
- `StaffRole.RESTAURANT_MANAGER` $\rightarrow$ `/van-hanh/restaurant-manager/nha-hang`
- `StaffRole.RESTAURANT_STAFF` $\rightarrow$ `/van-hanh/restaurant-staff/nha-hang`
- `StaffRole.ACCOUNTANT`, `StaffRole.MANAGER`, `StaffRole.ADMIN` $\rightarrow$ `/tong-quan`

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Tạo cấu trúc thư mục và Page component mới
- [x] T1: Tạo thư mục và file `src/app/(internal)/van-hanh/warehouse-manager/kho/page.tsx` - bọc `<WarehousePage />` với `allowedRoles={[StaffRole.WAREHOUSE_MANAGER, StaffRole.ADMIN, StaffRole.MANAGER]}` - Depends on: none
- [x] T2: Tạo thư mục và files cho `shipper`:
  - `src/app/(internal)/van-hanh/shipper/giao-nhan/page.tsx` - bọc `<HandoverListPage />`
  - `src/app/(internal)/van-hanh/shipper/giao-nhan/[recordCode]/page.tsx` - bọc `<HandoverDetailPage />`
  - `src/app/(internal)/van-hanh/shipper/xang/page.tsx` - bọc `<FuelPage />` với `allowedRoles={[StaffRole.SHIPPER]}`
  - Depends on: none
- [x] T3: Tạo thư mục và files cho `worker`:
  - `src/app/(internal)/van-hanh/worker/tram-dem/page.tsx` - bọc `<PieceworkStationPage />`
  - `src/app/(internal)/van-hanh/worker/khoan-viec/page.tsx` - bọc `<PieceworkStationPage />`
  - Depends on: none
- [x] T4: Tạo thư mục và files cho đối tác nhà hàng:
  - `src/app/(internal)/van-hanh/restaurant-manager/nha-hang/page.tsx` - bọc `<RestaurantPage />` với `allowedRoles={[StaffRole.RESTAURANT_MANAGER, StaffRole.ADMIN, StaffRole.MANAGER]}`
  - `src/app/(internal)/van-hanh/restaurant-staff/nha-hang/page.tsx` - bọc `<RestaurantPage />` với `allowedRoles={[StaffRole.RESTAURANT_STAFF, StaffRole.RESTAURANT_MANAGER, StaffRole.ADMIN, StaffRole.MANAGER]}`
  - Depends on: none
- [x] T5: Tạo các route dùng chung đặt trực tiếp ngoài `van-hanh/`:
  - `src/app/(internal)/van-hanh/cham-cong/page.tsx` - bọc `<AttendancePage />`
  - `src/app/(internal)/van-hanh/phieu-luong/page.tsx` - bọc `<MyPayslipPage />`
  - `src/app/(internal)/van-hanh/bao-cao/page.tsx` - bọc `ReportsView` & `PageBanner`
  - Depends on: none
- [x] T6: Tạo thư mục và files cho `quan-ly/manager/`:
  - `src/app/(internal)/quan-ly/manager/nhan-su/page.tsx` - bọc `<StaffManagementView />`
  - `src/app/(internal)/quan-ly/manager/doi-tac/page.tsx` - bọc `<PartnersPage />`
  - `src/app/(internal)/quan-ly/manager/cham-cong/page.tsx` - bọc `<AttendanceReviewView />`
  - `src/app/(internal)/quan-ly/manager/khoan-viec/page.tsx` - bọc `<PieceworkConfirmView />`
  - Depends on: none
- [x] T7: Tạo thư mục và files cho `quan-ly/accountant/`:
  - `src/app/(internal)/quan-ly/accountant/xang/page.tsx` - bọc `<FuelReviewView />`
  - `src/app/(internal)/quan-ly/accountant/bang-luong/page.tsx` - bọc `<PayrollManagementView />`
  - Depends on: none

### Giai đoạn 2: Cập nhật Router, Dọn dẹp Thư mục cũ và Thiết lập Redirect
- [x] T8: Dọn dẹp/xóa các thư mục page cũ đã chuyển: `src/app/(internal)/kho/`, `tram-dem/`, `nha-hang/`, `cham-cong/`, `khoan-viec/`, `xang/`, `phieu-luong/`, `bao-cao/`, `giao-nhan/`, `quan-ly/nhan-su/`, `quan-ly/doi-tac/`, `quan-ly/cham-cong/`, `quan-ly/khoan-viec/`, `quan-ly/xang/`, `quan-ly/bang-luong/` - Depends on: T1, T2, T3, T4, T5, T6, T7
- [x] T9: Chỉnh sửa `src/app/router.tsx`:
  - Import tất cả các Page mới từ `van-hanh/...` và `quan-ly/...`.
  - Cấu hình các routes mới đúng theo ma trận định tuyến tại mục 2.2.
  - Bổ sung các redirect routes từ URL cũ sang URL mới (`/kho` $\rightarrow$ `/van-hanh/warehouse-manager/kho`, v.v.) nhằm giữ tương thích ngược.
  - Depends on: T8

### Giai đoạn 3: Đồng bộ Menu, Điều hướng nội bộ và Tài liệu
- [x] T10: Cập nhật `src/components/layout/nav-config.ts`:
  - Đổi toàn bộ thuộc tính `path` trong `NAV_GROUPS` sang tuyến đường mới.
  - Cập nhật hàm `getMobileQuickNavItems(role)` với đường dẫn mới cho từng vai trò tài khoản.
  - Depends on: T9
- [x] T11: Cập nhật `src/features/auth/AuthContext.tsx`: Cập nhật hàm `getDefaultRouteForRole` trả về đường dẫn mới theo role - Depends on: T9
- [x] T12: Cập nhật các liên kết `navigate(...)` trong components:
  - `src/features/management/ManagementPage.tsx`
  - `src/features/dashboard/DashboardPage.tsx`
  - `src/features/handover/HandoverListPage.tsx`
  - `src/features/handover/HandoverDetailPage.tsx`
  - Depends on: T9
- [x] T13: Cập nhật tài liệu `.agents/skills/create-react-feature/SKILL.md`:
  - Cập nhật Ma trận đối chiếu Backend API -> Frontend Routes tại Mục 1.
  - Cập nhật Cây thư mục định tuyến `src/app/` hoàn chỉnh tại Mục 2.
  - Depends on: T10, T11, T12

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm tra kỹ thuật
Chạy tại thư mục `fe-react-thanhxuan-internal/`:
```bash
# Typecheck
pnpm exec tsc --noEmit

# Build production bundle
pnpm build
```

### 4.2. Kịch bản kiểm chứng thực tế
1. **Kiểm tra đăng nhập & chuyển hướng theo Role:**
   - Đăng nhập thợ xưởng (`WORKER`) $\rightarrow$ Tự động chuyển hướng đến `/van-hanh/worker/khoan-viec`.
   - Đăng nhập tài xế (`SHIPPER`) $\rightarrow$ Tự động chuyển hướng đến `/van-hanh/shipper/giao-nhan`.
   - Đăng nhập thủ kho (`WAREHOUSE_MANAGER`) $\rightarrow$ Tự động chuyển hướng đến `/van-hanh/warehouse-manager/kho`.
   - Đăng nhập quản lý nhà hàng (`RESTAURANT_MANAGER`) $\rightarrow$ Tự động chuyển hướng đến `/van-hanh/restaurant-manager/nha-hang`.
   - Đăng nhập kế toán / quản lý / admin $\rightarrow$ Chuyển hướng đến `/tong-quan`.
2. **Kiểm tra phân quyền (`ProtectedRoute`):**
   - Tài khoản `WORKER` truy cập `/quan-ly/accountant/bang-luong` $\rightarrow$ Bị chặn và chuyển hướng về trang chủ mặc định của Worker.
   - Tài khoản `ACCOUNTANT` truy cập `/van-hanh/worker/tram-dem` $\rightarrow$ Bị chặn nếu không có quyền.
3. **Kiểm tra menu Sidebar & Drawer:**
   - Kiểm tra các liên kết trên Desktop Sidebar mở đúng trang, trạng thái active sáng màu đúng menu tương ứng.
   - Kiểm tra Mobile Bottom Bar hiển thị đúng các nút thao tác nhanh theo từng vai trò.
4. **Kiểm tra tương thích ngược (Redirects):**
   - Truy cập thủ công URL cũ (ví dụ `/kho`, `/xang`, `/quan-ly/nhan-su`) $\rightarrow$ Tự động chuyển hướng mượt mà đến URL mới tương ứng mà không bị màn hình trắng hay 404.

### 4.3. Definition of Done
1. Toàn bộ 17 tuyến route mới được tạo và kiểm chứng vai trò truy cập chính xác.
2. `pnpm exec tsc --noEmit` và `pnpm build` chạy thành công không có bất kỳ lỗi linter/type error nào.
3. Menu điều hướng trên desktop và mobile hoạt động đồng bộ với URL mới.
4. Tài liệu `create-react-feature/SKILL.md` được cập nhật đồng bộ.

---

## 5. Risks & Rollback

- **Rủi ro 1 (Broken links do hardcoded paths):** Một số component con có thể còn gọi `navigate('/kho')` hoặc `navigate('/quan-ly/...')`.
  - *Giải pháp:* Đã rà soát bằng `grep_search` và thiết lập toàn bộ danh sách redirect fallback trong `router.tsx`.
- **Rủi ro 2 (Xung đột cache trình duyệt PWA/ServiceWorker):** Nhân viên dùng PWA có thể tải cache cũ.
  - *Giải pháp:* Phiên bản app và router chuyển hướng đồng bộ, build Vite với hash bundle mới giúp trình duyệt tự cập nhật cache.
- **Phương án Rollback:** Sử dụng `git checkout` khôi phục lại trạng thái `src/app/` và `router.tsx` từ commit gần nhất nếu xảy ra sự cố không lường trước.

---

## Changelog
- 2026-10-05: Khởi tạo Plan 12 - Tái cấu trúc Định tuyến Vận hành (van-hanh) & Quản lý (quan-ly) theo Nhóm Tài khoản.
- 2026-10-05: Thực thi hoàn tất (Status: Done) - Hoàn thành 13/13 tasks T1..T13. Tạo cấu trúc thư mục mới `van-hanh/` và `quan-ly/`, xóa các thư mục cũ, cấu hình router với redirects, đồng bộ nav-config, AuthContext, các components và cập nhật tài liệu SKILL.md. Toàn bộ verify tsc và build production đều pass 100%.
