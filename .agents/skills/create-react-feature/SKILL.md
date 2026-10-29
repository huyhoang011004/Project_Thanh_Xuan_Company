---
name: create-react-feature
description: Workflow chuẩn để phát triển tính năng Frontend cho Cổng Vận Hành Xưởng & Quản Trị Đối Tác Nội Bộ (fe-react-thanhxuan-internal). Tuân thủ kiến trúc Feature-Based Colocation (operations/ và management/), React Router v7, TanStack Query v5, react-hook-form + zod, TailwindCSS, tách biệt logic ra Custom Hooks, chia nhỏ file (< 250-300 dòng), thiết kế Mobile-First cho thợ xưởng & tài xế xe tải (chữ ký số, offline/PWA). Dùng khi tạo màn hình vận hành, modal nghiệp vụ, giao nhận, chấm công hoặc công thợ theo giờ.
---

# Quy trình tạo Feature Frontend React (Internal Operations App)

Skill này hướng dẫn quy chuẩn kiến trúc, **bản đồ định tuyến toàn diện (Routing Map) bao phủ 100% các API Backend trong `SRS_SDD.md`**, và các bước phát triển tính năng mới trong ứng dụng `fe-react-thanhxuan-internal`.

---

## 1. Ma trận đối chiếu Backend API -> Frontend Routes

Hệ thống routes trong [router.tsx](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/app/router.tsx) được chuẩn hóa theo danh pháp tiếng Anh rõ ràng, phân tách 2 nhóm chính `operations/` (Vận hành) và `management/` (Quản trị):

| STT | Phân hệ Nghiệp vụ | Tuyến API Backend (`/api/v1/internal`) | Route Frontend (`fe-react-thanhxuan-internal`) | Màn hình & Vai trò chính |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Xác thực & Tài khoản** | `POST /auth/login` | `/login` | Đăng nhập nhân sự xưởng / đối tác |
| | | `POST /auth/register`, `/verify-otp`, `/resend-otp` | `/register` | Đăng ký tài khoản kèm xác thực OTP email |
| | | `POST /auth/forgot-password`, `/reset-password` | `/forgot-password` | Quên & đặt lại mật khẩu qua OTP |
| **2** | **Dashboard Vận Hành** | Tổng hợp trạng thái xưởng | `/dashboard` | Bảng điều khiển KPI vận hành theo ngày |
| **3** | **Vận Hành: Dùng chung** | `POST /attendance/check-in`, `/check-out`, `GET /today`, `/history` | `/operations/attendance` | Chấm công camera selfie cá nhân, xem lịch sử ca làm |
| | | `GET /payroll/me/payslips` | `/operations/payslip` | Nhân viên tra cứu phiếu lương cá nhân |
| | | `GET /reports/*`, `GET /reports/export/excel`, `/export/pdf` | `/operations/report` | 6 Báo cáo tổng hợp Aggregation và xuất streaming file |
| **4** | **Vận Hành: Thủ kho (`WAREHOUSE_MANAGER`)** | `POST /handovers/clean-planned`, `PATCH /:id/clean-delivery` | `/operations/warehouse-manager/warehouse` | Thủ kho xưởng soạn đồ sạch xuất kho (`PrepOrderModal`) |
| **5** | **Vận Hành: Tài xế (`SHIPPER`)** | `GET, POST /handovers`, `PATCH /sign`, `/fields` | `/operations/shipper/handover` | Phiếu giao nhận 2 chiều, ký số Canvas, thư viện ảnh phiếu |
| | | `POST /fuel`, `GET /fuel/me`, `PATCH, DELETE /fuel/:id` | `/operations/shipper/fuel` | Tài xế nộp đề xuất hoàn tiền xăng kèm ảnh ODO & hóa đơn |
| **6** | **Vận Hành: Thợ xưởng (`WORKER`)** | `POST /handovers/:id/request-recount`, `PATCH /complete-recount` | `/operations/worker/recount` | Trạm rạch bao đếm lại đồ bẩn tại xưởng (`RecountStationPage`) |
| | | `GET /piecework/me`, `POST /piecework/me/tasks` | `/operations/worker/piecework` | Trạm công thợ theo giờ (`HourlyWorkStationPage` - 7 khâu chuẩn) |
| **7** | **Vận Hành: Đối tác (`PARTNER`)** | `GET /handovers/monthly`, `PATCH /:id/receipt-check` | `/operations/partner-manager/partner` | Quản lý đối tác đối soát nhận đồ sạch, giao đồ bẩn, bảng kê tháng |
| | | `PATCH /:id/receipt-check` | `/operations/partner-staff/partner` | Nhân viên đối tác ký nhận đồ sạch / đếm đồ bẩn |
| **8** | **Trung Tâm Quản Lý** | Hub điều hành trung tâm | `/management` | Hub điều hành trung tâm dành cho Quản lý & Kế toán |
| | | `GET, PATCH /accounts/approvals/:id` | `/management/manager/approval` | Phê duyệt đăng ký nhân viên nội bộ & tài khoản đối tác |
| **9** | **Quản Lý: Điều Hành (`MANAGER`)** | `GET, POST, PATCH /accounts/staffs`, `PATCH /:id/lock` | `/management/manager/personnel` | Danh sách nhân sự, phân quyền vai trò, khóa tài khoản |
| | | `CRUD /partners`, `CRUD /partners/catalogs`, `GET /schedule` | `/management/manager/partner` | Quản lý chuỗi thương hiệu, đối tác, danh mục bảng giá `item_catalogs` |
| | | `GET /attendance`, `PATCH /attendance/:id/review` | `/management/manager/attendance` | Bảng công toàn xưởng & duyệt ca bất thường (`AttendanceReviewPage`) |
| | | `GET /piecework`, `GET /piecework/report`, `PATCH /:id/confirm` | `/management/manager/piecework` | Xét duyệt và chốt giờ công thợ (`HourlyWorkReviewPage`) |
| **10** | **Quản Lý: Kế Toán (`ACCOUNTANT`)** | `GET /fuel`, `PATCH /fuel/:id/approve`, `PATCH /reject` | `/management/accountant/fuel` | Kế toán thẩm định, phê duyệt và thanh toán chi phí xăng xe |
| | | `GET, PUT /payroll/settings`, `POST /calculate`, `PATCH /lock, /pay` | `/management/accountant/payroll` | Cấu hình tham số lương & chốt bảng lương chu kỳ tháng |

---

## 2. Cấu trúc thư mục Feature chuẩn & Kỷ luật chia nhỏ file (`< 250 - 300 dòng`)

Toàn bộ các nghiệp vụ được tổ chức tại `src/features/operations/<feature>/`, `src/features/management/<feature>/`, `src/features/auth/` và `src/features/dashboard/`:

```
src/features/operations/<feature-name>/
├── <FeatureName>Page.tsx             # File lớn nhất / Màn hình view chính cấp cao nhất (chỉ điều phối layout, tabs)
├── modals/                           # Thư mục chứa toàn bộ modals/dialogs liên quan đến feature/page
│   ├── <FeatureName>Modal.tsx
│   └── <Action>Modal.tsx
├── components/                       # Chứa các sub-components (bảng, thẻ, bộ lọc, action bar, canvas...)
│   ├── <FeatureName>CardComponent.tsx
│   ├── <FeatureName>TableComponent.tsx
│   └── <FeatureName>FilterComponent.tsx
├── hooks/                            # Chứa Custom Hooks quản lý state/query/mutation phức tạp
│   └── use<FeatureName>.ts
├── <feature-name>.service.ts         # API fetcher gọi Backend (Axios instance)
├── <feature-name>.types.ts           # Interfaces, types, filters
├── <feature-name>.schema.ts          # Zod schema validation (nếu có form)
└── index.ts                          # Barrel export duy nhất của Feature
```

> ⚠️ **Quy chuẩn kích thước file & phân tách bắt buộc:**
> - Tuyệt đối không để file gộp cồng kềnh quá 250 - 300 dòng.
> - Bóc tách ngay các dialog/modal sang thư mục `modals/` với tên `[Tên]Modal.tsx`.
> - Bóc tách các thành phần hiển thị con (card, table, form con, tabs, filter...) sang thư mục `components/` với tên `[Tên]Component.tsx`.
> - File gốc lớn nhất luôn là `[Tên]Page.tsx` đóng vai trò điều phối layout, state và kết nối components.

---

## 3. Nguyên tắc thiết kế & Nghiệp vụ xưởng

1. **Thiết kế Mobile-First & Môi trường Xưởng Giặt:**
   - Đối tượng sử dụng: Thợ xưởng, tài xế giao nhận, thủ kho, quản lý chi nhánh đối tác.
   - Thao tác nhanh bằng một tay trên điện thoại: Touch target tối thiểu `44px x 44px`, phông chữ to rõ, tương phản màu sắc cao.
   - Hỗ trợ ký điện tử 2 chiều trên màn hình cảm ứng (kèm tùy chọn chọn chữ ký mẫu đã lưu trong tài khoản qua `SignatureInputComponent`).
2. **State Management với TanStack Query v5:**
   - Mọi thao tác đọc (`useQuery`) và ghi (`useMutation`) bọc trong Custom Hook hoặc Service, tuyệt đối không viết logic gọi API trực tiếp trong JSX.
   - Không dùng kiểu `any` trong xử lý lỗi hay dữ liệu trả về; dùng `unknown` kèm hàm helper bóc tách thông báo lỗi.
3. **Múi Giờ & Biến Môi Trường:**
   - Mọi ngày giờ hiển thị, điểm danh, lọc ca kíp, và gửi lên API phải chuẩn hóa theo múi giờ **`Asia/Ho_Chi_Minh` (GMT+7)**.
   - Biến môi trường client bắt buộc có tiền tố **`VITE_`** (ví dụ: `VITE_API_URL`).

---

## 4. Quy trình thực thi từng bước (Workflow)

### Bước 1: Khai báo Types (`<feature-name>.types.ts`)

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

  create: async (data: CreatePartnerDto): Promise<Partner> => {
    const res = await api.post<Partner>("/internal/partners", data);
    return res.data;
  },
};
```

### Bước 4: Tạo Custom Hook (`hooks/use<FeatureName>.ts`)

```typescript
// Adhering to SOLID & Design Patterns
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partnerService } from "../<feature-name>.service";
import { CreatePartnerDto, PartnerFilters } from "../<feature-name>.types";

export const PARTNERS_QUERY_KEY = ["internal", "partners"];

function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }
  return fallback;
}

export function usePartners(filters?: PartnerFilters) {
  const queryClient = useQueryClient();

  const partnersQuery = useQuery({
    queryKey: [...PARTNERS_QUERY_KEY, filters],
    queryFn: () => partnerService.getAll(filters),
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreatePartnerDto) => partnerService.create(dto),
    onSuccess: (newPartner) => {
      toast.success(`Đã thêm đối tác ${newPartner.name} thành công`);
      queryClient.invalidateQueries({ queryKey: PARTNERS_QUERY_KEY });
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, "Không thể tạo đối tác"));
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

### Bước 5: Xây dựng UI Components (`components/` & `modals/`) & Tích hợp App Router

- Chia tách rõ `<FeatureName>Page.tsx`, `modals/<Action>Modal.tsx`, `components/<Sub>Component.tsx`.
- Đăng ký route trong `src/app/router.tsx` và cập nhật `.agents/docs/CODEBASE_ATLAS.md`.

---

## 5. Checklist Kiểm Định Trước Khi Hoàn Tất

- [ ] Route mới nằm đúng cấu trúc phân tầng `src/app/(auth)/` hoặc `src/app/(internal)/operations/` / `management/`.
- [ ] Không có file nào vượt quá 250 - 300 dòng mà chưa chia tách sub-components (`components/`) và modals (`modals/`).
- [ ] Tuyệt đối không dùng kiểu `any`, không để lại file re-export tạm thời.
- [ ] Giao diện tối ưu Mobile-First, nút bấm to dễ thao tác trong môi trường xưởng giặt.
- [ ] Đã cập nhật `.agents/docs/CODEBASE_ATLAS.md` và `.agents/docs/srs_sdd/srs_sdd_fe_internal.md`.
- [ ] Chạy typecheck, test và build xác thực:
  ```bash
  cd fe-react-thanhxuan-internal && pnpm exec tsc --noEmit && pnpm test && pnpm build
  ```
