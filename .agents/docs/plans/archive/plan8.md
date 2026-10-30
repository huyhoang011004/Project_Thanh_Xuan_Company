# Plan 8: Tái cấu trúc Menu & Điều hướng Hệ thống theo Kiến trúc UX Quản trị Chuẩn Công Nghiệp

> Status: Done | Created: 2026-10-04

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Bối cảnh
- **Vấn đề hiện tại**:
  - Giao diện nội bộ (`fe-react-thanhxuan-internal`) đang dùng chung một thanh Bottom Navigation cố định dưới chân trang cho mọi kích thước màn hình.
  - Trên màn hình Desktop lớn: Đáy màn hình bị chiếm chỗ bởi thanh điều hướng nhỏ hẹp (ép 9-10 icon vào giữa), đi ngược thói quen F-pattern (mắt quét từ trái sang phải), khó phân nhóm phân quyền và mở rộng menu nhiều cấp.
  - Trên màn hình Mobile: Thanh chân trang bị quá tải (9-10 icon chen chúc), nút bấm bé (`text-[10px]`), khó thao tác bằng ngón tay cái.
- **Mục tiêu tái cấu trúc theo UX khuyến nghị**:
  1. **Trên Desktop / Màn hình lớn (`lg:` >= 1024px)**:
     - Ẩn hoàn toàn Bottom Bar dưới chân trang.
     - Triển khai **Sidebar cố định bên trái (Left Sidebar)** chuẩn công nghiệp:
       - Chiều rộng chuẩn (`w-64`), bám cố định toàn bộ chiều cao màn hình (`fixed inset-y-0 left-0`).
       - Nhận diện thương hiệu ở trên cùng: Logo TX + Tên "THANH XUÂN LAUNDRY" + Tagline "Nội Bộ & Điều Hành B2B".
       - Danh mục menu được **gom nhóm phân quyền (Role-based Menu Groups)** rõ ràng:
         - *Nhóm Tổng Quan*: Dashboard `/tong-quan`.
         - *Nhóm Vận Hành Xưởng & Chuỗi (Operations)*: Nhà hàng, Kho sạch, Giao nhận 2 chiều, Trạm đếm sản lượng.
         - *Nhóm Quản Trị & Nghiệp Vụ B2B (Management)*: Cổng điều hành xưởng, Đối tác & Đồ giặt.
         - *Nhóm Cá Nhân & Chấm Công (Staff & Utilities)*: Chấm công vào/ra ca, Xăng xe, Phiếu lương cá nhân.
       - Thẻ hồ sơ người dùng (User Profile Card) ở chân Sidebar: Tên nhân viên, Role Badge, ThemeToggle (Sáng/Tối) và nút Đăng xuất nhanh.
       - Khu vực nội dung chính (`main`) tự động thụt lề trái trên Desktop (`lg:pl-64`), hỗ trợ cuộn độc lập mà Sidebar vẫn cố định.
  2. **Trên Mobile & Tablet nhỏ (`< lg:`)**:
     - **Thanh chân trang (Bottom Bar)**: Thu gọn chỉ còn **4–5 mục thiết yếu nhất** dựa theo vai trò nhân sự:
       - Mục 1: Tổng quan / Bảng điều khiển chính (`/tong-quan` hoặc trang chính theo vai trò).
       - Mục 2: Nghiệp vụ trọng tâm (Điều hành `/quan-ly` cho Quản lý/Admin; Giao nhận `/giao-nhan` cho Tài xế; Trạm đếm `/tram-dem` cho Thợ xưởng; Nhà hàng `/nha-hang` cho nhân viên nhà hàng; Kho sạch `/kho` cho Quản kho).
       - Mục 3: Chấm công (`/cham-cong`) - tác vụ hàng ngày của toàn bộ nhân viên.
       - Mục 4: Phiếu lương (`/phieu-luong`) hoặc Xăng xe (`/xang`).
       - Mục 5: Nút **"Thêm" (Menu / More)** (icon `Menu` hoặc `MoreHorizontal`).
     - **Ngăn kéo điều hướng đầy đủ (Mobile Navigation Drawer/Sheet)**:
       - Bấm vào nút "Thêm" ở Bottom Bar hoặc nút Hamburger ở Header Mobile sẽ kích hoạt mở một **Sheet trượt từ cạnh trái (Left Drawer)** hiển thị toàn bộ cây menu đa cấp phân nhóm và thông tin tài khoản.
     - **Nguyên tắc Menu bên phải**: Tuyệt đối không dùng menu bên phải làm điều hướng chính. Cạnh phải chỉ dành riêng cho **Bộ lọc bảng dữ liệu (Filter Drawer)** hoặc **Xem nhanh chi tiết dữ liệu (Preview/Inspector Drawer)**.

### 1.2. Out of Scope
- Không thay đổi router đường dẫn URL hoặc logic nghiệp vụ bên trong các trang.
- Không thay đổi quyền hạn RBAC của Backend NestJS.

### 1.3. Assumptions & Open Questions
- **Assumptions**:
  - Breakpoint phân tách Desktop và Mobile là `lg` (`1024px`) theo chuẩn TailwindCSS. Trên các màn hình iPad Pro/Laptop/Desktop, Left Sidebar sẽ xuất hiện cố định. Trên điện thoại và tablet nhỏ (`< 1024px`), áp dụng Bottom Bar 5 nút + Left Navigation Drawer.
- **Open Questions**: Không có.

### 1.4. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `fe-react-thanhxuan-internal/src/components/layout/nav-config.ts` | Add | Tập trung hóa định nghĩa các mục menu, phân nhóm (Groups), icon, route và phân quyền RBAC |
| `fe-react-thanhxuan-internal/src/components/layout/DesktopSidebar.tsx` | Add | Component Left Sidebar cố định trên desktop với các nhóm menu và user profile card |
| `fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx` | Add | Component thanh điều hướng chân trang trên mobile với 4-5 mục tối ưu ngón tay cái |
| `fe-react-thanhxuan-internal/src/components/layout/MobileNavDrawer.tsx` | Add | Ngăn kéo trượt (Sheet) từ cạnh trái mở toàn bộ phân hệ khi bấm nút "Thêm" trên mobile |
| `fe-react-thanhxuan-internal/src/components/layout/AppLayout.tsx` | Edit | Tái cấu trúc layout tổng: Tích hợp DesktopSidebar, MobileBottomBar, TopHeader tinh gọn và MobileNavDrawer |

---

## 2. Technical Approach

### 2.1. Kiến trúc Bố Cục Responsive (Responsive Layout Architecture)

```mermaid
flowchart TD
    subgraph DesktopView["🖥️ DESKTOP VIEW (>= 1024px)"]
        DS[Desktop Left Sidebar<br/>w-64 fixed inset-y-0 left-0]
        subgraph SidebarContent["Nội dung Sidebar cố định"]
            Logo[TX Brand Header]
            G1[Nhóm Tổng Quan]
            G2[Nhóm Vận Hành Xưởng & Chuỗi]
            G3[Nhóm Quản Trị & Nghiệp Vụ B2B]
            G4[Nhóm Nhân Sự & Tiện Ích]
            Profile[User Profile + Theme + Logout]
        end
        DS --> Logo & G1 & G2 & G3 & G4 & Profile

        DContent["Main Content Area (lg:pl-64)<br/>Header tối giản + Outlet cuộn độc lập"]
    end

    subgraph MobileView["📱 MOBILE VIEW (< 1024px)"]
        MH[Mobile Header: Hamburger Button + Logo + Notifications]
        MC[Main Content: Cuộn toàn màn hình, pb-20]
        MB[Mobile Bottom Bar: 4 Mục chính + Nút 'Thêm']
        MD[Mobile Nav Drawer (Sheet): Mở toàn bộ phân hệ từ cạnh trái]
        
        MH -.->|Bấm Hamburger| MD
        MB -.->|Bấm nút Thêm| MD
    end
```

### 2.2. Cấu trúc Menu Phân Nhóm theo Vai Trò (`nav-config.ts`)

```ts
export interface NavItemConfig {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: StaffRole[]; // Nếu undefined nghĩa là tất cả vai trò đều có quyền
  badge?: string;
  isQuickMobile?: boolean; // Mục ưu tiên hiển thị ở Bottom Bar mobile
}

export interface NavGroupConfig {
  id: string;
  title: string;
  items: NavItemConfig[];
}
```

Các nhóm chức năng chuẩn hóa:
1. **TỔNG QUAN**:
   - `Bảng Điều Khiển` (`/tong-quan`)
2. **VẬN HÀNH XƯỞNG & ĐỐI TÁC**:
   - `Quản Lý Nhà Hàng` (`/nha-hang`)
   - `Kho Sạch & Soạn Đồ` (`/kho`)
   - `Giao Nhận 2 Chiều` (`/giao-nhan`)
   - `Trạm Đếm Sản Lượng` (`/tram-dem`)
3. **QUẢN TRỊ & KINH DOANH B2B**:
   - `Cổng Điều Hành Xưởng` (`/quan-ly`)
   - `Đối Tác & Đồ Giặt` (`/quan-ly/doi-tac`)
4. **CÁ NHÂN & CHẤM CÔNG**:
   - `Chấm Công Vào / Ra` (`/cham-cong`)
   - `Đề Xuất Xăng Xe` (`/xang`)
   - `Phiếu Lương Cá Nhân` (`/phieu-luong`)

### 2.3. Logic lựa chọn 4-5 mục cho Mobile Bottom Bar
Để thanh Bottom Bar luôn tối ưu cho từng người dùng, các mục hiển thị sẽ dựa trên vai trò:
- **Admin / Quản lý / Kế toán (`ADMIN`, `MANAGER`, `ACCOUNTANT`)**:
  1. Tổng quan (`/tong-quan`)
  2. Điều hành (`/quan-ly`)
  3. Giao nhận (`/giao-nhan`)
  4. Chấm công (`/cham-cong`)
  5. **Thêm** (`Menu` Drawer)
- **Tài xế (`SHIPPER`)**:
  1. Giao nhận (`/giao-nhan`)
  2. Xăng xe (`/xang`)
  3. Chấm công (`/cham-cong`)
  4. Lương (`/phieu-luong`)
  5. **Thêm** (`Menu` Drawer)
- **Thợ xưởng (`WORKER`)**:
  1. Sản lượng (`/tram-dem`)
  2. Chấm công (`/cham-cong`)
  3. Lương (`/phieu-luong`)
  4. **Thêm** (`Menu` Drawer)
- **Nhân sự Nhà hàng (`RESTAURANT_STAFF`, `RESTAURANT_MANAGER`)**:
  1. Nhà hàng (`/nha-hang`)
  2. Chấm công (`/cham-cong`)
  3. **Thêm** (`Menu` Drawer)

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Chuẩn bị Cấu hình Menu & Navigation Data
- [x] T1: Tạo file [src/components/layout/nav-config.ts](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/nav-config.ts) khai báo đầy đủ các nhóm menu (Tổng quan, Vận hành, Quản trị, Cá nhân), danh sách icon Lucide, phân quyền vai trò cho từng mục và helper lấy danh sách menu theo vai trò người dùng (`getNavGroupsForRole`, `getMobileQuickNavForRole`).

### Giai đoạn 2: Xây dựng các Thành phần Giao diện Navigation
- [x] T2: Tạo component [DesktopSidebar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/DesktopSidebar.tsx):
  - Chiều rộng `w-64`, cố định bên trái trên desktop (`hidden lg:flex fixed inset-y-0 left-0 flex-col z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800`).
  - Header Sidebar: Logo TX badge, tên công ty và phụ đề phân hệ.
  - Danh mục cuộn: Render các nhóm menu kèm tiêu đề nhóm chữ in hoa nhỏ (`uppercase tracking-wider text-[11px]`), các liên kết `NavLink` có hiệu ứng active/hover, icon chuẩn và badge thông báo (nếu có).
  - Chân Sidebar (Footer Card): Hiển thị tên tài khoản, chức vụ / role badge, ThemeToggle (Chế độ sáng/tối) và nút Đăng xuất.
- [x] T3: Tạo component [MobileBottomBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileBottomBar.tsx):
  - Ẩn trên desktop (`lg:hidden`), cố định chân trang điện thoại (`fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800`).
  - Chỉ hiển thị 4 mục nghiệp vụ thiết yếu nhất + 1 nút "Thêm" (icon `Menu`).
  - Nút bấm to bản (`min-h-[52px]`), tối ưu thao tác ngón tay cái, active state nổi bật.
- [x] T4: Tạo component [MobileNavDrawer.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/MobileNavDrawer.tsx):
  - Sử dụng `Sheet` từ cạnh trái (`side="left"`).
  - Mở khi người dùng bấm nút "Thêm" ở Bottom Bar hoặc nút Hamburger ở Header Mobile.
  - Hiển thị đầy đủ thông tin nhân sự, toàn bộ các nhóm chức năng quản trị phức tạp còn lại.
  - Tự động đóng Sheet khi người dùng bấm vào liên kết chuyển trang.

### Giai đoạn 3: Tích hợp Layout Tổng Thể & Điều Chỉnh Đáp Ứng
- [x] T5: Tái cấu trúc [src/components/layout/AppLayout.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/layout/AppLayout.tsx):
  - Tích hợp `DesktopSidebar` cho màn hình lớn.
  - Tích hợp `MobileBottomBar` và `MobileNavDrawer` cho màn hình nhỏ.
  - Header phía trên:
    - Trên Desktop: Thu nhỏ thành thanh tiện ích mỏng (Breadcrumb / Title trang, NotificationBell, OfflineBanner).
    - Trên Mobile: Hiển thị Hamburger Button, Logo, NotificationBell, ThemeToggle và Avatar.
  - Nội dung chính (`main`): Cấu hình padding đáp ứng chuẩn (`lg:pl-64 pb-6 lg:pb-8 pt-3 sm:pt-4 px-3 sm:px-6`).
- [x] T6: Kiểm tra các Drawer bên phải (Filter Drawer, Inspector nếu có trong các trang danh sách) để đảm bảo không bị xung đột z-index với Left Sidebar và Bottom Bar.

### Giai đoạn 4: Kiểm thử và Hoàn thiện
- [x] T7: Chạy kiểm tra TypeScript (`pnpm exec tsc -b`) và Build (`pnpm build`) trong `fe-react-thanhxuan-internal`.
- [x] T8: Kiểm thử giao diện và tương tác trên cả 2 chế độ Viewport:
  - Desktop Viewport (1280x800): Left Sidebar hiển thị cố định bên trái, phân nhóm rõ ràng, cuộn trang độc lập, không có Bottom Bar dưới chân trang.
  - Mobile Viewport (375x667): Bottom Bar chỉ có 4-5 nút bấm to bản rõ ràng; bấm nút "Thêm" mở Sheet cạnh trái trượt ra mượt mà và chuyển hướng chính xác.

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm tra kỹ thuật
```bash
cd fe-react-thanhxuan-internal
pnpm exec tsc -b
pnpm build
```

### 4.2. Kịch bản kiểm thử (Test Scenarios)
1. **Kiểm thử trên Màn hình Desktop (Viewport >= 1024px)**:
   - Sidebar cố định bên trái xuất hiện đầy đủ, chiều rộng 256px (`w-64`).
   - Các nhóm menu hiển thị tách biệt: Tổng quan, Vận hành, Quản trị, Tiện ích nhân sự.
   - Thử cuộn trang dài (ví dụ trang Báo cáo hoặc Quản lý đối tác): Nội dung cuộn mượt mà trong khi Sidebar bên trái giữ nguyên vị trí.
   - Chân trang Desktop hoàn toàn sạch sẽ, không có bất kỳ thanh Bottom Bar nào choán chỗ.
2. **Kiểm thử trên Màn hình Mobile (Viewport < 1024px)**:
   - Thanh Bottom Bar chân trang chỉ hiển thị tối đa 5 nút bấm rộng rãi, không bị chen chúc hay tràn viền.
   - Bấm nút "Thêm" (hoặc icon Hamburger trên Header): Menu Drawer từ bên trái trượt ra êm ái, hiển thị toàn bộ các nhóm chức năng.
   - Chọn một mục trong Drawer (ví dụ: "Đối tác & Đồ giặt"): Trang chuyển đổi tức thì và Drawer tự động đóng lại.
3. **Kiểm thử Phân quyền (RBAC)**:
   - Đăng nhập tài khoản `WORKER`: Menu chỉ hiển thị Trạm đếm, Chấm công, Phiếu lương; không hiển thị Điều hành hay Đối tác B2B.
   - Đăng nhập tài khoản `ADMIN`: Menu hiển thị đầy đủ tất cả các phân hệ quản trị.

### 4.3. Definition of Done
- Desktop có Left Sidebar cố định theo F-pattern, hỗ trợ mở rộng nhiều cấp và phân nhóm chức năng.
- Mobile có Bottom Bar tối giản 4-5 nút + Left Navigation Drawer khi cần mở rộng.
- Cạnh phải giao diện không bị chiếm dụng cho điều hướng chính, sẵn sàng cho Filter/Inspector Drawer.
- Typecheck và Build Frontend Internal pass 100%.

---

## 5. Risks & Rollback

### 5.1. Rủi ro
- **Xung đột padding và z-index**: Khi có Left Sidebar (`w-64`), nội dung `main` nếu thiếu `lg:pl-64` có thể bị Sidebar che khuất một phần.
  - *Giải pháp*: Cấu trúc lớp bọc ngoài đồng nhất `lg:pl-64` cho container nội dung và đặt z-index hợp lý (`z-40` cho Sidebar/BottomBar, `z-50` cho Sheet/Modal).

### 5.2. Kế hoạch Rollback
- Revert các commit liên quan đến `AppLayout.tsx` để khôi phục lại thanh điều hướng cũ nếu phát sinh sự cố giao diện không lường trước.

---

## Changelog
- 2026-10-04: Khởi tạo Plan 8 tái cấu trúc Menu và Điều hướng theo kiến trúc UX chuẩn cho hệ thống quản trị nội bộ.

## Execution Log
- **2026-10-04**:
  - Hoàn tất 8/8 task (T1 - T8).
  - Đã tạo `nav-config.ts` tập trung hóa toàn bộ menu, phân nhóm và RBAC helpers.
  - Đã tạo `DesktopSidebar.tsx` cố định bên trái (w-64) trên desktop (>= 1024px) theo chuẩn F-pattern.
  - Đã tạo `MobileBottomBar.tsx` với 4 mục chính theo vai trò + nút "Thêm" mở rộng.
  - Đã tạo `MobileNavDrawer.tsx` (Sheet từ cạnh trái) mở toàn bộ cây phân hệ quản trị.
  - Tái cấu trúc `AppLayout.tsx`: ẩn Bottom Bar trên desktop, thêm `lg:pl-64`, header mỏng linh hoạt.
  - Verification: `tsc -b` và `vite build` đều pass 100%. Xác minh browser cả desktop viewport (1280x800) và mobile viewport (375x667) đều hiển thị và tương tác chính xác.
  - Documentation: Cập nhật Document History trong `.agents/docs/SRS_SDD.md`.

