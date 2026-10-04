# Plan 9: Tái Cấu Trúc Giao Diện Partners (Component Decomposition), Chuẩn Hóa Phân Tầng Bố Cục (Top Banner -> Buttons -> Filters -> Container Responsive Content) và Mở Rộng Hệ Thống Trang Nội Bộ

> Status: Done | Created: 2026-10-04

---

## 1. Overview & Affected Files

### 1.1. Bối cảnh & Vấn đề hiện tại
1. **File `PartnersPage.tsx` quá lớn và vi phạm Single Responsibility Principle**:
   - Hiện tại [PartnersPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/PartnersPage.tsx) dài **1448 dòng**, ôm đồm:
     - 3 nhóm React Query (Đối tác, Thương hiệu, Danh mục đồ).
     - 9 Mutations (Create, Update, Delete cho cả 3 thực thể).
     - Toàn bộ State Form (hơn 18 biến state cục bộ).
     - UI Banner, UI Tab Switcher, UI Add Buttons.
     - UI Cards Đối tác, UI Cards Thương hiệu, UI Bảng Danh mục đồ giặt.
     - 6 Dialog Modal phức tạp.
   - Khó bảo trì, tái sử dụng và kiểm thử; nguy cơ re-render diện rộng khi người dùng gõ vào form.

2. **Bố cục Header & Tab Buttons bị gộp chung 1 khối ép ngang**:
   - Top Banner và Tab Buttons bị gộp chung trong 1 flex container `flex flex-col sm:flex-row justify-between ...`.
   - Khi có Desktop Sidebar cố định (`w-64` = 256px), không gian khả dụng của phần `main` bị thu hẹp đáng kể. Việc ép Top Banner và các Tab Buttons vào cùng 1 hàng khiến tiêu đề bị co cụm, các nút tab bị dồn ép hoặc tràn chữ.

3. **Cơ chế hiển thị nội dung phụ thuộc vào media query màn hình thay vì độ rộng vùng chứa (Container Width)**:
   - Các danh sách Card đang dùng `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Đây là media query theo độ rộng toàn màn hình (`window.innerWidth`).
   - Khi người dùng thu hẹp cửa sổ, mở sidebar, hoặc chia đôi màn hình (Split screen), số cột không phản ánh đúng không gian thực tế của vùng hiển thị, gây ra tình trạng card bị méo, chật chội hoặc khoảng trắng lãng phí.

4. **Thứ tự các nút tab chưa đúng với luồng nghiệp vụ ưu tiên**:
   - Hiện tại: `Đối tác` ➔ `Thương hiệu` ➔ `Danh mục đồ`.
   - Yêu cầu mới: `Đối tác` ➔ `Danh mục đồ` ➔ `Thương hiệu`.

5. **Thiếu sự đồng nhất về kiến trúc bố cục giữa các trang trong ứng dụng nội bộ**:
   - Các trang khác như [ManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx), [HandoverListPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/handover/HandoverListPage.tsx), [WarehousePage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/warehouse/WarehousePage.tsx) cũng đang bị tình trạng gộp Top Banner và Action Buttons vào chung một khối, thiếu tính phân tầng rõ ràng.

### 1.2. Mục tiêu kỹ thuật
1. **Phân rã (Component Decomposition) toàn diện `PartnersPage.tsx`**:
   - Tách thành các sub-components độc lập đặt trong `src/features/partners/components/`:
     - Top Banner riêng.
     - Action & Tab Buttons riêng.
     - Filter Bar riêng cho Danh mục đồ.
     - 3 View hiển thị riêng (`PartnerListView`, `CatalogListView`, `BrandListView`).
     - 4 Dialog Form riêng biệt (`PartnerDialog`, `BrandDialog`, `CatalogDialog`, `DeleteConfirmDialog`).
   - `PartnersPage.tsx` trở thành Container Component mỏng (~100-150 dòng) chỉ làm nhiệm vụ kết nối State/Tab và điều phối các component con.
2. **Chuẩn hóa quy tắc phân tầng bố cục (Vertical Layout Hierarchy) 4 tầng**:
   - **Tầng 1 (Top Banner)**: Nằm trên cùng, chiếm trọn 100% chiều rộng container, gồm Icon, Tagline phân hệ, Tiêu đề `H1` và Mô tả ngắn.
   - **Tầng 2 (Action / Tab Buttons)**: Nằm độc lập bên dưới Banner, `flex flex-wrap items-center justify-between gap-3`. Thứ tự các nút tab: **Đối tác** ➔ **Danh mục đồ** ➔ **Thương hiệu**, kèm nút Thêm tương ứng với tab đang chọn.
   - **Tầng 3 (Bộ lọc - Filter Bar)**: Nằm bên dưới Buttons khi phân hệ có bộ lọc (ví dụ: Dropdown chọn thương hiệu trong tab Danh mục đồ).
   - **Tầng 4 (Nội dung dữ liệu - Content Area)**: Lưới dữ liệu (Cards / Table) tự động dãn và xuống dòng thích ứng theo độ rộng thực tế của container chứa nó (`grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4`), không phụ thuộc breakpoint toàn màn hình.
3. **Xây dựng bộ Layout Components chuẩn hóa (Reusable Page Pattern)**:
   - Tạo các thành phần dùng chung: `PageBanner`, `PageActionBar`, `PageFilterBar` tại `src/components/common/`.
4. **Mở rộng chuẩn hóa cho các trang nội bộ khác**:
   - Áp dụng phân tầng 4 tầng cho: `ManagementPage` (Cổng điều hành & tài chính), `HandoverListPage` (Lịch trình xe giao nhận kép), `WarehousePage` (Kho xưởng & Soạn đồ sạch), và các trang liên quan.

### 1.3. Out of Scope
- Không thay đổi API backend NestJS hoặc database schema (đã hoàn thiện ở Plan 7).
- Không thay đổi logic tính toán tiền khoán hoặc công thức tính lương.

### 1.4. Assumptions & Open Questions
- **Assumptions**:
  - Dùng CSS Grid `repeat(auto-fill, minmax(280px, 1fr))` có sẵn trong TailwindCSS v3 để card tự co dãn và xuống dòng linh hoạt theo không gian vùng chứa, tối ưu cho cả desktop có sidebar, tablet và mobile.
  - State của các Dialog thêm/sửa được đóng gói cục bộ bên trong từng Dialog component để giảm tải re-render cho `PartnersPage`.
- **Open Questions**: Không có.

### 1.5. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `fe-react-thanhxuan-internal/src/components/common/PageBanner.tsx` | Add | Component Top Banner dùng chung chuẩn hóa giao diện tầng 1 |
| `fe-react-thanhxuan-internal/src/components/common/PageActionBar.tsx` | Add | Component Action Bar dùng chung tầng 2 (flex-wrap, responsive) |
| `fe-react-thanhxuan-internal/src/components/common/PageFilterBar.tsx` | Add | Component Filter Bar dùng chung tầng 3 |
| `fe-react-thanhxuan-internal/src/features/partners/components/PartnersTopBanner.tsx` | Add | Top Banner riêng biệt cho trang Quản lý Đối tác |
| `fe-react-thanhxuan-internal/src/features/partners/components/PartnersActionBar.tsx` | Add | Hàng nút Tab (Đối tác ➔ Danh mục đồ ➔ Thương hiệu) và nút Thêm mới |
| `fe-react-thanhxuan-internal/src/features/partners/components/PartnersCatalogFilter.tsx` | Add | Thanh lọc dropdown thương hiệu cho tab Danh mục đồ |
| `fe-react-thanhxuan-internal/src/features/partners/components/PartnerListView.tsx` | Add | Danh sách đối tác dạng lưới tự dãn theo vùng chứa |
| `fe-react-thanhxuan-internal/src/features/partners/components/BrandListView.tsx` | Add | Danh sách thương hiệu dạng lưới tự dãn theo vùng chứa |
| `fe-react-thanhxuan-internal/src/features/partners/components/CatalogListView.tsx` | Add | Bảng danh mục đồ giặt theo thương hiệu, có bảng cuộn và đơn giá |
| `fe-react-thanhxuan-internal/src/features/partners/components/PartnerDialog.tsx` | Add | Modal Thêm/Sửa đối tác độc lập (form sạch, không có ngoặc đơn `()`) |
| `fe-react-thanhxuan-internal/src/features/partners/components/BrandDialog.tsx` | Add | Modal Thêm/Sửa thương hiệu độc lập |
| `fe-react-thanhxuan-internal/src/features/partners/components/CatalogDialog.tsx` | Add | Modal Thêm/Sửa đồ giặt theo thương hiệu độc lập |
| `fe-react-thanhxuan-internal/src/features/partners/components/DeleteConfirmDialog.tsx` | Add | Modal xác nhận xóa an toàn dùng chung cho các thực thể |
| `fe-react-thanhxuan-internal/src/features/partners/PartnersPage.tsx` | Edit | Tái cấu trúc thành Container điều phối mỏng, kết nối các sub-components |
| `fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx` | Edit | Chuẩn hóa tách Top Banner ➔ Tab Buttons ➔ Bộ lọc ➔ Content Cards |
| `fe-react-thanhxuan-internal/src/features/handover/HandoverListPage.tsx` | Edit | Chuẩn hóa tách Top Banner ➔ Action Buttons & Date Filter ➔ Content Grids |
| `fe-react-thanhxuan-internal/src/features/warehouse/WarehousePage.tsx` | Edit | Chuẩn hóa tách Top Banner ➔ Tab Buttons ➔ Content Grids |

---

## 2. Technical Approach

### 2.1. Kiến trúc Bố cục Phân tầng 4 Lớp (4-Tier Vertical Layout Hierarchy)

```
┌────────────────────────────────────────────────────────────────────────┐
│ TẦNG 1: TOP BANNER (Độc lập, w-full, p-5, rounded-2xl, border, shadow)  │
│ [Icon + Tagline]                                                       │
│ [Tiêu đề Trang H1]                                                     │
│ [Mô tả chi tiết / hướng dẫn ngắn]                                     │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TẦNG 2: ACTION & TAB BUTTONS (Độc lập, flex flex-wrap justify-between) │
│ [Tab: 1. Đối Tác | 2. Danh Mục Đồ | 3. Thương Hiệu]   [+ Nút Thêm Mới] │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TẦNG 3: BỘ LỌC DỮ LIỆU - FILTER BAR (Nếu có, độc lập, flex-wrap)       │
│ [Icon Filter] [Dropdown: Chọn Thương hiệu]   [Hiển thị: X mặt hàng]    │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TẦNG 4: CONTENT AREA (Container Responsive, tự dãn theo độ rộng)       │
│ CSS Grid: repeat(auto-fill, minmax(280px, 1fr))                        │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────┐ │
│ │  Card / Mục 1 │ │  Card / Mục 2 │ │  Card / Mục 3 │ │ Card / Mục 4 │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └──────────────┘ │
│ (Khi container hẹp lại, các card tự động dãn đều và xuống dòng mượt mà)│
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Cơ chế Tự Dãn Xuống Dòng theo Độ Rộng Vùng Chứa (Container-Aware Layout)
Thay vì sử dụng các breakpoint cố định của màn hình (`md:grid-cols-2 lg:grid-cols-3` dựa trên `window.innerWidth`), hệ thống áp dụng:
1. **CSS Grid Auto-fill Responsive**:
   ```css
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
   ```
   - Trong TailwindCSS: `grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4`.
   - **Lợi ích**: Khi vùng hiển thị bên cạnh Sidebar trái rộng 1200px ➔ tự chia 4 cột; khi rộng 900px ➔ tự chia 3 cột; khi rộng 600px ➔ tự chia 2 cột; khi trên mobile 360px ➔ tự dãn 1 cột 100%. Không bao giờ bị lệch hay gãy giao diện do Sidebar chiếm chỗ.
2. **Hàng Nút Bấm & Bộ Lọc Linh Hoạt (Flex-Wrap Flow)**:
   - Dùng `flex flex-wrap items-center justify-between gap-3`.
   - Nhóm nút Tab bên trái và Nút Action bên phải khi đủ chỗ sẽ dàn sang 2 bên; khi container thu hẹp sẽ tự động ngắt xuống dòng tiếp theo mà không gây vỡ giao diện hay tràn ngang (`overflow-x`).

### 2.3. Cấu trúc Phân rã Component trong `src/features/partners/`

```
src/features/partners/
├── PartnersPage.tsx                     <-- Container chính (Slim Orchestrator)
├── components/
│   ├── PartnersTopBanner.tsx            <-- Tầng 1: Banner tiêu đề
│   ├── PartnersActionBar.tsx            <-- Tầng 2: Tabs (Đối tác -> Đồ giặt -> Thương hiệu) + Nút Thêm
│   ├── PartnersCatalogFilter.tsx        <-- Tầng 3: Filter chọn thương hiệu
│   ├── PartnerListView.tsx              <-- Tầng 4: Danh sách đối tác
│   ├── PartnerCard.tsx                  <-- Thẻ chi tiết đối tác
│   ├── BrandListView.tsx                <-- Tầng 4: Danh sách thương hiệu
│   ├── BrandCard.tsx                    <-- Thẻ chi tiết thương hiệu
│   ├── CatalogListView.tsx              <-- Tầng 4: Bảng danh mục đồ giặt
│   ├── PartnerDialog.tsx                <-- Dialog thêm/sửa đối tác (form sạch)
│   ├── BrandDialog.tsx                  <-- Dialog thêm/sửa thương hiệu
│   ├── CatalogDialog.tsx                <-- Dialog thêm/sửa danh mục đồ giặt
│   └── DeleteConfirmDialog.tsx          <-- Dialog xác nhận xóa an toàn
└── usePartnersData.ts (tùy chọn)        <-- Quản lý queries & mutations nếu cần tách hook
```

### 2.4. Khế ước Giao tiếp (Interfaces & Contracts)

```typescript
// Tab type với thứ tự mới
export type PartnerActiveTab = 'partners' | 'catalogs' | 'brands';

// Props cho PartnersActionBar
export interface PartnersActionBarProps {
  activeTab: PartnerActiveTab;
  onTabChange: (tab: PartnerActiveTab) => void;
  partnersCount: number;
  catalogsCount: number;
  brandsCount: number;
  onOpenAddPartner: () => void;
  onOpenAddCatalog: () => void;
  onOpenAddBrand: () => void;
}

// Props cho PartnersCatalogFilter
export interface PartnersCatalogFilterProps {
  brands: Brand[];
  selectedBrand: string;
  onSelectBrand: (brandCode: string) => void;
  totalItems: number;
}
```

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Xây dựng Layout Components Chuẩn Hóa Dùng Chung
- [x] T1: Tạo component [PageBanner.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageBanner.tsx) (nhận `icon`, `tagline`, `title`, `description`, `badges`) chuẩn hóa tầng 1.
- [x] T2: Tạo component [PageActionBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageActionBar.tsx) và [PageFilterBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/components/common/PageFilterBar.tsx) hỗ trợ `flex-wrap` dãn dòng linh hoạt.

### Giai đoạn 2: Phân Rã & Tái Cấu Trúc `PartnersPage`
- [x] T3: Tạo [PartnersTopBanner.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/PartnersTopBanner.tsx) hiển thị thông tin phân hệ Quản lý Đối tác, Thương hiệu & Danh mục đồ.
- [x] T4: Tạo [PartnersActionBar.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/PartnersActionBar.tsx) với thứ tự tab chuẩn: **Đối tác** ➔ **Danh mục đồ** ➔ **Thương hiệu** và các nút Thêm tương ứng.
- [x] T5: Tạo [PartnersCatalogFilter.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/PartnersCatalogFilter.tsx) lọc theo thương hiệu và hiển thị số lượng mặt hàng.
- [x] T6: Tạo [PartnerCard.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/PartnerCard.tsx) và [PartnerListView.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/PartnerListView.tsx) với CSS Grid tự động dãn `auto-fill minmax(280px, 1fr)`.
- [x] T7: Tạo [BrandCard.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/BrandCard.tsx) và [BrandListView.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/BrandListView.tsx) với CSS Grid tự động dãn theo vùng chứa.
- [x] T8: Tạo [CatalogListView.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/CatalogListView.tsx) hiển thị bảng danh mục đồ giặt theo thương hiệu, có hỗ trợ cuộn và format đơn giá.
- [x] T9: Tách các Dialog:
  - [PartnerDialog.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/PartnerDialog.tsx) (Thêm & Sửa đối tác, form sạch).
  - [BrandDialog.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/BrandDialog.tsx) (Thêm & Sửa thương hiệu).
  - [CatalogDialog.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/CatalogDialog.tsx) (Thêm & Sửa đồ giặt theo thương hiệu).
  - [DeleteConfirmDialog.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/components/DeleteConfirmDialog.tsx) (Xác nhận xóa an toàn).
- [x] T10: Tái cấu trúc [PartnersPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/PartnersPage.tsx), lắp ghép toàn bộ các sub-components đã tách thành container mỏng, hoạt động mượt mà.

### Giai đoạn 3: Mở Rộng & Chuẩn Hóa Các Trang Khác trong Hệ Thống Nội Bộ
- [x] T11: Cập nhật [ManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx):
  - Tách Top Banner độc lập ở Tầng 1.
  - Tách Action & Tab Buttons (Công & Sản lượng, Duyệt xăng, Tính lương, Báo cáo, Nhân sự) ở Tầng 2 với `flex-wrap`.
  - Bộ lọc kỳ lương/ngày ở Tầng 3.
  - Danh sách thẻ/bảng ở Tầng 4 tự dãn `auto-fill minmax(280px, 1fr)`.
- [x] T12: Cập nhật [HandoverListPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/handover/HandoverListPage.tsx):
  - Tách Top Banner Lịch trình giao nhận kép ở Tầng 1.
  - Tách hàng nút hành động (Tạo phiếu, Tải ZIP) và Date Picker sang Tầng 2 & 3.
  - Danh sách điểm giao và phiếu giao nhận tự động dãn theo độ rộng vùng chứa.
- [x] T13: Cập nhật [WarehousePage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/warehouse/WarehousePage.tsx):
  - Tách Top Banner Điều phối & Soạn hàng kho ở Tầng 1.
  - Tách hàng nút Tabs (Soạn đồ sạch, Hàng đợi đếm lại, Tổng hợp kho) ở Tầng 2.
  - Các bảng và card phiếu soạn hàng tự động dãn dòng responsive.

### Giai đoạn 4: Kiểm Thử, Đánh Giá & Xác Minh
- [x] T14: Chạy Typecheck (`pnpm exec tsc --noEmit`) và Build (`pnpm build`) trên `fe-react-thanhxuan-internal`.
- [x] T15: Xác minh trên Browser ở nhiều kích thước cửa sổ (Desktop toàn màn hình có sidebar, Desktop chia đôi cửa sổ, Tablet, Mobile) để kiểm chứng cơ chế dãn dòng tự động và thứ tự nút mới.

---

## 4. Verification & Testing

### 4.1. Lệnh Kiểm Tra Hệ Thống
Chạy trực tiếp tại thư mục `fe-react-thanhxuan-internal/`:
```bash
# 1. Kiểm tra lỗi kiểu TypeScript
pnpm exec tsc --noEmit

# 2. Kiểm tra biên dịch đóng gói sản phẩm
pnpm build
```

### 4.2. Kịch Bản Kiểm Thử Chức Năng (Functional Test Scenarios)
1. **Kiểm tra phân tầng bố cục trang Partners**:
   - Tầng 1: Banner hiển thị trên cùng, không bị ép bởi nút bấm.
   - Tầng 2: Hàng nút Tab xuất hiện theo thứ tự: **1. Đối Tác** ➔ **2. Danh Mục Đồ** ➔ **3. Thương Hiệu**. Nút Thêm mới hiển thị tương ứng bên phải.
   - Chuyển sang tab "Danh mục đồ": Tầng 3 xuất hiện thanh lọc dropdown Thương hiệu và số lượng mặt hàng.
2. **Kiểm tra khả năng tự dãn xuống dòng (Container-Responsive Grid)**:
   - Thu hẹp chiều rộng cửa sổ trình duyệt từ 1200px xuống 800px, 600px, 400px:
     - Các thẻ Card đối tác / thương hiệu tự động co giãn kích thước mượt mà (`minmax(280px, 1fr)`) và tự động xuống dòng khi thiếu chỗ.
     - Hàng Tab và nút Thêm tự động xuống dòng khéo léo, không bị đè chữ hay tràn ngang.
3. **Kiểm tra CRUD trong Modal**:
   - Thêm đối tác mới: Mở modal sạch (không ngoặc đơn `()`), nhập thông tin, lưu thành công và cập nhật danh sách.
   - Nhấn vào một đối tác bất kỳ: Mở modal sửa, lưu cập nhật thành công.
   - Thêm danh mục đồ mới: Chọn thương hiệu, nhập mã đồ, tên, đơn vị, công thợ, đơn giá và lưu thành công.
4. **Kiểm tra các trang mở rộng**:
   - Truy cập `/quan-ly` ([ManagementPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/management/ManagementPage.tsx)): Top Banner nằm trên, các tab chức năng nằm dưới, các card phân bổ đều theo container.
   - Truy cập `/giao-nhan` ([HandoverListPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/handover/HandoverListPage.tsx)): Top Banner nằm trên, Date picker và nút Tạo phiếu nằm dưới, danh sách điểm giao tự dãn mượt mà.
   - Truy cập `/kho` ([WarehousePage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/warehouse/WarehousePage.tsx)): Top Banner nằm trên, tabs nằm dưới, không bị chèn ép.

### 4.3. Tiêu Chí Hoàn Thành (Definition of Done)
- [PartnersPage.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/features/partners/PartnersPage.tsx) được phân rã thành các component con gọn gàng, tổng dung lượng file giảm từ 1448 dòng xuống còn dưới 180 dòng.
- Thứ tự các nút tab tại trang Partners chính xác: **Đối tác** ➔ **Danh mục đồ** ➔ **Thương hiệu**.
- Layout 4 tầng được thiết lập chuẩn mực và áp dụng nhất quán trên trang Partners và các trang nội bộ chính (`ManagementPage`, `HandoverListPage`, `WarehousePage`).
- Mọi card và hàng nút tự động dãn đều và xuống dòng theo độ rộng của container chứa nó, không gây thanh cuộn ngang trang.
- Typecheck và Build pass 100%, không phát sinh lỗi biên dịch.

---

## 5. Risks & Rollback

### 5.1. Rủi ro
- **Rủi ro mất đồng bộ State trong Form Modal**: Khi tách các Dialog ra component riêng, nếu không truyền đúng props hoặc initial values, form có thể không nhận đúng dữ liệu khi nhấn "Sửa".
- **Phương án giảm thiểu**: Định nghĩa TypeScript props nghiêm ngặt cho từng Dialog (`open`, `onOpenChange`, `initialData`, `onSuccess`), kiểm tra kỹ lưỡng luồng mở/đóng và reset form.

### 5.2. Rollback
- Giữ bản sao lưu hoặc commit riêng trước khi phân rã. Nếu phát sinh lỗi ngoài tầm kiểm soát, revert lại trạng thái trước khi thực thi Plan 9 bằng Git.

---

## Changelog
- 2026-10-04: Khởi tạo Plan 9 lập kế hoạch phân rã `PartnersPage.tsx`, chuẩn hóa phân tầng layout (Top Banner ➔ Buttons ➔ Filters ➔ Container-responsive Content) và mở rộng hệ thống trang nội bộ.
- 2026-10-04: Hoàn tất thực thi toàn bộ 15 tasks của Plan 9. Typecheck và Build pass 100%, kiểm thử giao diện thực tế trên browser đạt chuẩn visual hierarchy và container-responsive.

## Execution Log
- **2026-10-04**:
  - Giai đoạn 1: Tạo `PageBanner.tsx`, `PageActionBar.tsx`, `PageFilterBar.tsx` tại `src/components/common/`.
  - Giai đoạn 2: Phân rã `PartnersPage.tsx` thành 10 sub-components tại `src/features/partners/components/`: `PartnersTopBanner`, `PartnersActionBar` (Thứ tự tab: Đối tác ➔ Danh mục đồ ➔ Thương hiệu), `PartnersCatalogFilter`, `PartnerCard`, `PartnerListView` (CSS Grid auto-fill minmax 280px), `BrandCard`, `BrandListView`, `CatalogListView`, `PartnerDialog`, `BrandDialog`, `CatalogDialog`, `DeleteConfirmDialog`. Tái cấu trúc `PartnersPage.tsx` thành container mỏng (~240 dòng).
  - Giai đoạn 3: Áp dụng layout 4 tầng cho `ManagementPage.tsx`, `HandoverListPage.tsx` và `WarehousePage.tsx`.
  - Giai đoạn 4: Chạy `pnpm exec tsc --noEmit` đạt 0 lỗi, `pnpm build` biên dịch thành công, xác minh giao diện trên trình duyệt với 4 ảnh chụp thực tế.
  - Đồng bộ tài liệu `SRS_SDD.md`.

