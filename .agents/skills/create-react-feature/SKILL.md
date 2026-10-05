---
name: create-react-feature
description: Workflow chuẩn để phát triển tính năng Frontend cho Cổng Vận Hành Xưởng & Quản Trị Đối Tác Nội Bộ (fe-react-thanhxuan-internal). Tuân thủ kiến trúc thư mục tinh gọn đồng bộ với fe-nextjs-thanhxuan-laundry (Feature-Based Flat Colocation, Barrel index.ts), React Router v7, TanStack Query v5, react-hook-form + zod, TailwindCSS, tách biệt logic ra Custom Hooks, thiết kế Mobile-First cho thợ xưởng & tài xế xe tải (chữ ký số, offline/PWA). Dùng khi tạo màn hình vận hành, modal nghiệp vụ, giao nhận, chấm công hoặc khoán việc.
---

# Quy trình tạo Feature Frontend React (Internal Operations App)

Skill này hướng dẫn quy chuẩn kiến trúc, **bản đồ định tuyến toàn diện (Routing Map) bao phủ 100% các API Backend trong `SRS_SDD.md`**, và các bước phát triển tính năng mới trong ứng dụng `fe-react-thanhxuan-internal`. Cấu trúc thư mục được **chuẩn hóa đồng bộ với phong cách tinh gọn của `fe-nextjs-thanhxuan-laundry`** để lập trình viên dễ nhìn, dễ tìm kiếm và làm việc hiệu quả nhất.

---

## 1. Ma trận đối chiếu Backend API -> Frontend Routes

Để đảm bảo Frontend có đầy đủ tất cả các màn hình phục vụ mọi API mà Backend NestJS đã xây dựng trong tài liệu đặc tả [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) và tài liệu phân hệ [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md), hệ thống routes được phân tầng theo bảng ánh xạ sau:

| STT    | Phân hệ Backend (`SRS_SDD.md`)                    | Tuyến API Backend (`/api/v1/internal`)                                | Route Frontend (`fe-react-thanhxuan-internal`) | Màn hình & Vai trò chính                                    |
| :----- | :------------------------------------------------ | :-------------------------------------------------------------------- | :--------------------------------------------- | :---------------------------------------------------------- |
| **1**  | **Xác thực & Tài khoản**                          | `POST /auth/login`                                                    | `/dang-nhap`                                   | Đăng nhập nhân sự xưởng / nhà hàng                          |
|        |                                                   | `POST /auth/register`, `/verify-otp`, `/resend-otp`                   | `/dang-ky`                                     | Đăng ký tài khoản kèm xác thực OTP email                    |
|        |                                                   | `POST /auth/forgot-password`, `/reset-password`                       | `/quen-mat-khau`                               | Quên & đặt lại mật khẩu qua OTP                             |
| **2**  | **Dashboard Vận Hành**                            | Tổng hợp trạng thái xưởng                                             | `/tong-quan`                                   | Bảng điều khiển KPI vận hành theo ngày                      |
| **3**  | **Vận Hành: Dùng chung (Toàn xưởng)**             | `POST /attendance/check-in`, `/check-out`, `GET /today`, `/history`   | `/van-hanh/cham-cong`                          | Chấm công camera selfie cá nhân, xem lịch sử ca làm         |
|        |                                                   | `GET /payroll/me/payslips`                                            | `/van-hanh/phieu-luong`                        | Nhân viên tra cứu phiếu lương cá nhân (kỳ đã khóa/chi trả)  |
|        |                                                   | `GET /reports/*`, `GET /reports/export/excel`, `/export/pdf`          | `/van-hanh/bao-cao`                            | 6 Báo cáo tổng hợp Aggregation và xuất streaming file       |
| **4**  | **Vận Hành: Thủ kho (`warehouse-manager`)**       | `POST /handover/clean-planned`, `PATCH /:id/clean-delivery`           | `/van-hanh/warehouse-manager/kho`              | Thủ kho xưởng soạn đồ sạch xuất kho theo lịch               |
| **5**  | **Vận Hành: Tài xế (`shipper`)**                  | `GET, POST /handover`                                                 | `/van-hanh/shipper/giao-nhan`                  | Danh sách phiếu giao nhận (lọc ngày, trạng thái, shipper)   |
|        |                                                   | `GET /handover/:recordCode`, `PATCH /sign`, `/fields`, `/adjustments` | `/van-hanh/shipper/giao-nhan/:recordCode`      | Chi tiết phiếu, chữ ký cảm ứng Canvas, đối soát             |
|        |                                                   | `POST /fuel`, `GET /fuel/me`, `PATCH, DELETE /fuel/:id`               | `/van-hanh/shipper/xang`                       | Tài xế nộp đề xuất hoàn tiền xăng kèm ảnh công-tơ-mét       |
| **6**  | **Vận Hành: Thợ xưởng (`worker`)**                | `POST /handover/:id/request-recount`, `PATCH /complete-recount`       | `/van-hanh/worker/tram-dem`                    | Rạch bao niêm phong đếm lại đồ bẩn, đối chiếu chênh lệch    |
|        |                                                   | `GET /piecework/me`, `POST /piecework/me/tasks`                       | `/van-hanh/worker/khoan-viec`                  | Thợ xưởng chấm sản lượng khoán (gấp, ủi, đóng gói)          |
| **7**  | **Vận Hành: Quản lý nhà hàng (`restaurant-manager`)** | `GET /handover/monthly`, `PATCH /:id/receipt-check`                   | `/van-hanh/restaurant-manager/nha-hang`        | Nhà hàng đối soát nhận đồ sạch, tra cứu bảng kê tháng       |
| **8**  | **Vận Hành: Nhân viên nhà hàng (`restaurant-staff`)**   | `PATCH /:id/receipt-check`                                            | `/van-hanh/restaurant-staff/nha-hang`          | Nhân viên nhà hàng ký nhận đồ sạch / đếm đồ bẩn             |
| **9**  | **Trung Tâm Quản Lý (Dùng chung Quản trị)**       | Hub điều hành trung tâm                                               | `/quan-ly`                                     | Hub điều hành trung tâm dành cho Quản lý & Kế toán          |
|        |                                                   | `GET, PATCH /auth/approvals/:id`                                      | `/quan-ly/phe-duyet`                           | Phê duyệt đăng ký nhân viên nội bộ & nhân viên nhà hàng     |
| **10** | **Quản Lý: Điều Hành (`manager`)**                | `GET, POST, PATCH /auth/staffs`, `PATCH /:id/lock`                    | `/quan-ly/manager/nhan-su`                     | Danh sách nhân sự, phân quyền vai trò, khóa tài khoản       |
|        |                                                   | `CRUD /partners`, `CRUD /partners/catalogs`, `GET /schedule`          | `/quan-ly/manager/doi-tac`                     | Quản lý chuỗi đối tác, chi nhánh, danh mục đồ & đơn giá     |
|        |                                                   | `GET /attendance`, `PATCH /attendance/:id/review`                     | `/quan-ly/manager/cham-cong`                   | Bảng công toàn xưởng & duyệt ca bất thường (`NEEDS_REVIEW`) |
|        |                                                   | `GET /piecework`, `GET /piecework/report`, `PATCH /:id/confirm`       | `/quan-ly/manager/khoan-viec`                  | Báo cáo sản lượng toàn xưởng & chốt sản lượng cuối ngày     |
| **11** | **Quản Lý: Kế Toán (`accountant`)**               | `GET /fuel`, `PATCH /fuel/:id/approve`, `PATCH /reject`               | `/quan-ly/accountant/xang`                     | Kế toán duyệt/từ chối hóa đơn xăng của đội xe               |
|        |                                                   | `GET, PUT /payroll/settings`, `POST /calculate`, `PATCH /lock, /pay`  | `/quan-ly/accountant/bang-luong`               | Cấu hình tham số lương & chốt bảng lương chu kỳ tháng       |

---

## 2. Cấu trúc thư mục định tuyến `src/app/` hoàn chỉnh

Mô phỏng kiến trúc App Router tinh gọn tương tự `fe-nextjs-thanhxuan-laundry`, kết hợp bộ định tuyến `React Router v7`:

```
fe-react-thanhxuan-internal/src/
├── app/                                 # Hệ thống Routes
│   ├── (auth)/                          # Nhóm Route xác thực
│   │   ├── layout.tsx
│   │   ├── dang-nhap/page.tsx           # POST /auth/login
│   │   ├── dang-ky/page.tsx             # POST /auth/register, /verify-otp
│   │   └── quen-mat-khau/page.tsx       # POST /auth/forgot-password, /reset-password
│   │
│   ├── (internal)/                      # Nhóm Route vận hành xưởng nội bộ
│   │   ├── layout.tsx                   # Layout chung (Header chuông thông báo, Sidebar, BottomNav)
│   │   ├── tong-quan/page.tsx           # Dashboard tổng quan xưởng
│   │   │
│   │   ├── van-hanh/                    # Phân hệ Vận hành xưởng & Đối tác
│   │   │   ├── cham-cong/page.tsx       # Chấm công camera selfie cá nhân (Dành riêng cho WORKER mở ca khoán)
│   │   │   ├── phieu-luong/page.tsx     # Nhân viên nội bộ tra cứu phiếu lương (Ẩn với Nhà hàng)
│   │   │   ├── bao-cao/page.tsx         # 6 Báo cáo tổng hợp Aggregation & xuất Excel/PDF (Dùng chung)
│   │   │   ├── warehouse-manager/       # Nhóm Thủ kho
│   │   │   │   └── kho/page.tsx         # Thủ kho soạn đồ sạch xuất kho theo lịch
│   │   │   ├── shipper/                 # Nhóm Tài xế xe tải
│   │   │   │   ├── giao-nhan/page.tsx   # Danh sách phiếu giao nhận 2 chiều
│   │   │   │   ├── giao-nhan/[recordCode]/page.tsx # Chi tiết phiếu giao nhận & ký nhận
│   │   │   │   └── xang/page.tsx        # Tài xế nộp đề xuất hoàn tiền xăng kèm ảnh
│   │   │   ├── worker/                  # Nhóm Thợ xưởng
│   │   │   │   ├── tram-dem/page.tsx    # Trạm rạch bao đếm lại đồ bẩn xưởng
│   │   │   │   └── khoan-viec/page.tsx  # Thợ xưởng chấm sản lượng khoán (gấp, ủi, đóng gói)
│   │   │   ├── restaurant-manager/      # Nhóm Quản lý nhà hàng
│   │   │   │   └── nha-hang/page.tsx    # Bảng kê đối soát giao nhận tháng & duyệt nhân viên
│   │   │   └── restaurant-staff/        # Nhóm Nhân viên nhà hàng
│   │   │       └── nha-hang/page.tsx    # Đối soát giao nhận & ký nhận đồ vải
│   │   │
│   │   └── quan-ly/                     # Trung tâm Quản trị & Điều hành
│   │       ├── page.tsx                 # Hub tổng quan quản trị (Dùng chung ngoài)
│   │       ├── phe-duyet/page.tsx       # Phê duyệt tài khoản nhân viên & nhà hàng (Dùng chung ngoài)
│   │       ├── manager/                 # Nhóm Quản lý điều hành xưởng
│   │       │   ├── nhan-su/page.tsx     # Quản lý nhân sự, phân quyền, khóa tài khoản
│   │       │   ├── doi-tac/page.tsx     # Quản lý đối tác, chi nhánh, catalog đồ giặt
│   │       │   ├── cham-cong/page.tsx   # Bảng công toàn xưởng & duyệt ca bất thường
│   │       │   └── khoan-viec/page.tsx  # Báo cáo sản lượng toàn xưởng & chốt sản lượng
│   │       └── accountant/              # Nhóm Kế toán
│   │           ├── xang/page.tsx        # Kế toán duyệt/từ chối hóa đơn hoàn xăng
│   │           └── bang-luong/page.tsx  # Cấu hình lương & chốt bảng lương chu kỳ
│   │
│   ├── layout.tsx                       # RootLayout (QueryClientProvider, AuthProvider, Toaster)
│   └── router.tsx                       # Cấu hình createBrowserRouter
```

---

## 3. Cấu trúc thư mục Feature chuẩn (Đồng bộ với Next.js)

Toàn bộ các nghiệp vụ tương ứng được đóng gói theo mô hình **Feature-Based Flat Colocation** tại `src/features/<feature-name>/`:

```
src/features/<feature-name>/
├── components/                       # Chứa toàn bộ UI components, modals, cards của feature
│   ├── <FeatureName>Card.tsx
│   ├── <FeatureName>Table.tsx
│   ├── <FeatureName>Modal.tsx
│   └── index.ts                      # Re-export components
├── <feature-name>.service.ts         # API fetcher gọi Backend (Axios instance)
├── <feature-name>.types.ts           # Interfaces, types, filters
├── <feature-name>.schema.ts          # Zod schema validation (nếu có form)
├── use<FeatureName>.ts               # Custom Hook TanStack Query v5 (state, query, mutation)
└── index.ts                          # Barrel export duy nhất của Feature
```

### Danh sách các Features tương ứng trong `src/features/`:

- `auth/`: Đăng nhập, đăng ký, xác thực OTP, đổi/quên mật khẩu.
- `handover/`: Phiếu giao nhận kép, chữ ký cảm ứng Canvas, đối soát đồ bẩn/sạch, sửa ô sau ký.
- `warehouse/`: Thủ kho soạn đồ sạch xuất kho theo lịch đối tác.
- `recount/`: Trạm rạch bao đếm lại đồ bẩn tại xưởng, tính chênh lệch thừa/thiếu.
- `restaurant/`: Bảng kê tháng nhà hàng đối tác, kiểm nhận đồ sạch.
- `attendance/`: Chấm công camera selfie, lịch sử công, rà soát ca bất thường.
- `piecework/`: Chấm sản lượng khoán thợ, tính tiền công tự động, chốt sản lượng.
- `fuel/`: Nộp đề xuất hoàn tiền xăng, phê duyệt/từ chối xăng xe.
- `payroll/`: Cấu hình tham số lương, tính bảng lương chu kỳ, tra cứu phiếu lương cá nhân.
- `reports/`: 6 báo cáo aggregation, streaming export XLSX/PDF.
- `partners/`: Đối tác chuỗi, chi nhánh, lịch giao hàng, danh mục đồ giặt (`item_catalogs`).
- `management/`: Quản lý nhân sự, phân quyền RBAC 8 vai trò, phê duyệt tài khoản.

---

## 4. Nguyên tắc thiết kế & Nghiệp vụ xưởng

1. **Thiết kế Mobile-First & Môi trường Xưởng Giặt:**
   - Đối tượng sử dụng: Thợ xưởng, tài xế giao nhận, thủ kho, quản lý chi nhánh đối tác (Pizza 4P's, Haidilao...).
   - Thao tác nhanh bằng một tay trên điện thoại: Touch target tối thiểu `44px x 44px`, phông chữ to rõ, tương phản màu sắc cao.
   - Hỗ trợ ký điện tử 2 chiều trên màn hình cảm ứng bằng `react-signature-canvas`.
2. **State Management với TanStack Query v5:**
   - Mọi thao tác đọc (`useQuery`) và ghi (`useMutation`) bắt buộc bọc trong Custom Hook (`use<FeatureName>.ts`).
   - Tuyệt đối không gọi Axios trực tiếp trong UI Component.
   - Tự động làm mới cache bằng `queryClient.invalidateQueries` sau khi mutate thành công.
3. **Múi Giờ & Biến Môi Trường:**
   - Mọi ngày giờ hiển thị, điểm danh, lọc ca kíp, và gửi lên API phải chuẩn hóa theo múi giờ **`Asia/Ho_Chi_Minh` (GMT+7)**.
   - Biến môi trường client bắt buộc có tiền tố **`VITE_`** (ví dụ: `VITE_API_URL`).

---

## 5. Quy trình thực thi từng bước (Workflow)

Khi tạo một tính năng mới (ví dụ: quản lý đối tác `partners` hoặc phiếu giao nhận `handover`):

### Bước 1: Khai báo Types (`<feature-name>.types.ts`)

- **Đường dẫn:** `src/features/<feature-name>/<feature-name>.types.ts`
- Định nghĩa rõ ràng interface dữ liệu từ API và các tham số filter:

```typescript
// Adhering to SOLID & Design Patterns
export interface Partner {
  _id: string;
  name: string;
  code: string;
  address: string;
  phoneNumber: string;
  brand: string;
  isActive: boolean;
  itemCatalogsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerDto {
  name: string;
  code: string;
  address: string;
  phoneNumber: string;
  brand: string;
}

export interface PartnerFilters {
  search?: string;
  brand?: string;
  isActive?: boolean;
}
```

### Bước 2: Khai báo Zod Schema (`<feature-name>.schema.ts`)

- **Đường dẫn:** `src/features/<feature-name>/<feature-name>.schema.ts`
- Sử dụng Zod để kiểm tra dữ liệu form với thông điệp tiếng Việt thân thiện:

```typescript
// Adhering to SOLID & Design Patterns
import { z } from "zod";

export const partnerFormSchema = z.object({
  name: z.string().min(2, "Tên đối tác phải có ít nhất 2 ký tự"),
  code: z.string().min(2, "Mã đối tác không được để trống").toUpperCase(),
  address: z.string().min(5, "Vui lòng nhập địa chỉ chi tiết"),
  phoneNumber: z
    .string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
  brand: z.string().min(1, "Vui lòng chọn hoặc nhập thương hiệu chuỗi"),
});

export type PartnerFormValues = z.infer<typeof partnerFormSchema>;
```

### Bước 3: Tạo Service gọi API (`<feature-name>.service.ts`)

- **Đường dẫn:** `src/features/<feature-name>/<feature-name>.service.ts`
- Sử dụng axios instance từ `@/lib/api`:

```typescript
// Adhering to SOLID & Design Patterns
import api from "@/lib/api";
import {
  Partner,
  CreatePartnerDto,
  PartnerFilters,
} from "./<feature-name>.types";

export const partnerService = {
  getAll: async (filters?: PartnerFilters): Promise<Partner[]> => {
    const res = await api.get<Partner[]>("/internal/partners", {
      params: filters,
    });
    return res.data;
  },

  getById: async (id: string): Promise<Partner> => {
    const res = await api.get<Partner>(`/internal/partners/${id}`);
    return res.data;
  },

  create: async (data: CreatePartnerDto): Promise<Partner> => {
    const res = await api.post<Partner>("/internal/partners", data);
    return res.data;
  },
};
```

### Bước 4: Tạo Custom Hook (`use<FeatureName>.ts`)

- **Đường dẫn:** `src/features/<feature-name>/use<FeatureName>.ts`
- Tách toàn bộ TanStack Query, form handlers và toast thông báo:

```typescript
// Adhering to SOLID & Design Patterns
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partnerService } from "./<feature-name>.service";
import { CreatePartnerDto, PartnerFilters } from "./<feature-name>.types";

export const PARTNERS_QUERY_KEY = ["internal", "partners"];

export function usePartners(filters?: PartnerFilters) {
  const queryClient = useQueryClient();

  // Query: Lấy danh sách
  const partnersQuery = useQuery({
    queryKey: [...PARTNERS_QUERY_KEY, filters],
    queryFn: () => partnerService.getAll(filters),
    staleTime: 60 * 1000,
  });

  // Mutation: Tạo mới
  const createMutation = useMutation({
    mutationFn: (dto: CreatePartnerDto) => partnerService.create(dto),
    onSuccess: (newPartner) => {
      toast.success(`Đã thêm đối tác ${newPartner.name} thành công`);
      queryClient.invalidateQueries({ queryKey: PARTNERS_QUERY_KEY });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Không thể tạo đối tác";
      toast.error(msg);
    },
  });

  return {
    partners: partnersQuery.data ?? [],
    isLoading: partnersQuery.isLoading,
    isError: partnersQuery.isError,
    refetch: partnersQuery.refetch,
    createPartner: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
```

### Bước 5: Xây dựng UI Components (`components/`)

- **Đường dẫn:** `src/features/<feature-name>/components/`
- Chứa các thành phần:
  - `<FeatureName>Card.tsx`: Card hiển thị trên mobile.
  - `<FeatureName>Table.tsx`: Bảng dữ liệu hiển thị trên desktop/tablet.
  - `<FeatureName>Modal.tsx`: Form popup dùng `react-hook-form` + `zodResolver(partnerFormSchema)`.
  - `index.ts`: Re-export tất cả components.

### Bước 6: Tạo Barrel Export (`index.ts`)

- **Đường dẫn:** `src/features/<feature-name>/index.ts`
- Đóng gói toàn bộ Feature để các Page bên ngoài sử dụng:

```typescript
// Adhering to SOLID & Design Patterns
export * from "./<feature-name>.types";
export * from "./<feature-name>.schema";
export * from "./<feature-name>.service";
export * from "./use<FeatureName>";
export * from "./components";
```

### Bước 7: Tích hợp vào App Router (`src/app/`)

- Tạo page: `src/app/(internal)/<route-name>/page.tsx`.
- Import các components và hook từ `@/features/<feature-name>`.
- Đăng ký route tương ứng trong `src/app/router.tsx`.

---

## 6. Checklist Kiểm Định Trước Khi Hoàn Tất

- [ ] Route mới nằm đúng cấu trúc phân tầng `src/app/(auth)/` hoặc `src/app/(internal)/`.
- [ ] Cấu trúc thư mục feature phẳng gọn gàng: `components/`, `.service.ts`, `.types.ts`, `.schema.ts`, `use<Feature>.ts`, `index.ts`.
- [ ] Toàn bộ API và State quản lý qua Custom Hook TanStack Query, JSX thuần túy hiển thị.
- [ ] Giao diện tối ưu Mobile-First, nút bấm to dễ thao tác trong môi trường xưởng giặt.
- [ ] Dùng Zod schema và toast `sonner` thông báo tiếng Việt.
- [ ] Chạy typecheck và build xác thực:
  ```bash
  cd fe-react-thanhxuan-internal && pnpm exec tsc -b && pnpm run build
  ```
