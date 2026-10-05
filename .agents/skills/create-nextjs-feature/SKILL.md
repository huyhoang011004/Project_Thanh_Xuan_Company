---
name: create-nextjs-feature
description: Workflow chuẩn để phát triển tính năng Frontend bằng Next.js (App Router) cho dự án Web Khách Hàng & CMS Quản Trị (fe-nextjs-thanhxuan-laundry). Tuân thủ nghiêm ngặt Server Components mặc định cho SEO, Feature-based Colocation, shadcn/ui, TailwindCSS design tokens, Zod schemas và Custom Hooks. Dùng khi tạo trang mới, thêm tính năng Web, form liên hệ, hoặc màn hình quản trị CMS.
---

# Quy trình tạo Feature Frontend (Next.js App Router & SEO)

Skill này hướng dẫn quy chuẩn kỹ thuật và các bước thực thi để phát triển tính năng mới trong ứng dụng `fe-nextjs-thanhxuan-laundry` (Website giặt là B2C/B2B và CMS quản trị).

---

## 1. Nguyên tắc kiến trúc cốt lõi

1. **Server Components Mặc Định (SEO First):**
   - Mọi trang và layout trong phân hệ công khai `src/app/(public)/` **bắt buộc là Server Components** để server render sẵn HTML, tối ưu Core Web Vitals (LCP, FCP, TTFB) và SEO Google.
   - Chỉ dùng chỉ thị `"use client"` khi thật sự cần tương tác DOM (onClick, onChange), Browser API (window, localStorage) hoặc React state/effect (`useState`, `useEffect`).
   - Luôn đẩy `"use client"` xuống component lá nhỏ nhất có thể (Leaf Component), không biến toàn bộ Page thành Client Component.
2. **Feature-Based Colocation:**
   - Toàn bộ components, hooks, schemas, types, actions thuộc cùng một nghiệp vụ phải được gom nhóm tập trung tại:
     `fe-nextjs-thanhxuan-laundry/src/features/<feature-name>/`
   - Component dùng chung cho toàn hệ thống đặt tại `src/components/ui/` hoặc `src/components/common/`.
3. **Tách Rời Giao Diện và Xử Lý Logic:**
   - JSX/TSX chỉ thuần túy hiển thị layout và binding dữ liệu.
   - Toàn bộ logic submit form, validate, biến đổi dữ liệu, hoặc gọi API phải tách ra **Custom Hook**, **Server Action** hoặc **Service**, tuyệt đối không viết logic nặng trực tiếp trong JSX.
4. **Quy chuẩn UI/UX & Design Tokens:**
   - Dùng **shadcn/ui** (`npx shadcn@latest add <component>`), không tự code lại component đã có trong design system.
   - Style bằng **TailwindCSS** kết hợp hàm `cn()`. Dùng CSS variables tokens (`bg-primary`, `text-muted-foreground`, `border-border`), không hardcode mã màu hex (`#...`).
   - Icon: Sử dụng thư viện **Lucide React**.
   - Form: Sử dụng **react-hook-form** kết hợp `@hookform/resolvers/zod` và component `Form` của shadcn.
   - **Xử lý đủ 3 trạng thái:** Loading (Skeleton/Suspense), Empty (giao diện trống thân thiện kèm CTA), và Error (thông báo lỗi tiếng Việt kèm nút thử lại).

---

## 2. Cấu trúc thư mục của một Feature

```
fe-nextjs-thanhxuan-laundry/src/features/<feature-name>/
├── components/
│   ├── <feature-name>-view.tsx          # Server Component hiển thị layout chính
│   ├── <feature-name>-card.tsx          # Component thẻ hiển thị
│   ├── <feature-name>-form.tsx          # Client Component ("use client") nếu có form nhập liệu
│   └── <feature-name>-skeleton.tsx      # Skeleton loading state
├── actions/
│   └── <feature-name>.actions.ts        # Server Actions ("use server") xử lý mutation, cache
├── hooks/
│   └── use-<feature-name>.ts            # Custom Hook ("use client") quản lý state & handlers
├── schemas/
│   └── <feature-name>.schema.ts         # Zod schemas kiểm tra dữ liệu form
├── types/
│   └── <feature-name>.types.ts          # TypeScript interfaces/types chuẩn xác
└── services/
    └── <feature-name>.service.ts        # Fetcher gọi API Backend NestJS qua fetch cache
```

---

## 3. Quy trình thực thi từng bước (Workflow)

### Bước 1: Khai báo Types & Zod Schemas
- **Đường dẫn:** `src/features/<feature-name>/types/` & `src/features/<feature-name>/schemas/`
- **Yêu cầu:**
  - TypeScript Strict: Tuyệt đối không dùng `any`.
  - Zod schema với thông báo lỗi tiếng Việt tự nhiên, rõ nghĩa cho người dùng:

```typescript
// src/features/booking/schemas/booking.schema.ts
import { z } from 'zod';

export const bookingFormSchema = z.object({
  customerName: z.string().min(2, 'Vui lòng nhập họ và tên (tối thiểu 2 ký tự)'),
  phoneNumber: z
    .string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ (10 chữ số)'),
  serviceType: z.string().min(1, 'Vui lòng chọn loại dịch vụ giặt sấy'),
  pickupAddress: z.string().min(5, 'Vui lòng nhập địa chỉ nhận đồ'),
  notes: z.string().optional(),
  sourceUrl: z.string().optional(),
  category: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
```

### Bước 2: Xây dựng Data Fetcher / Server Actions
- **Nếu là đọc dữ liệu (Queries):** Tạo service fetch với cơ chế caching của Next.js:
  ```typescript
  // src/features/articles/services/article.service.ts
  const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  export async function getPublishedArticles(category?: string) {
    const res = await fetch(`${API_URL}/api/v1/articles?category=${category ?? ''}`, {
      next: { revalidate: 3600, tags: ['articles'] }, // ISR Cache 1 giờ
    });
    if (!res.ok) throw new Error('Không thể tải danh sách bài viết');
    return res.json();
  }
  ```
- **Nếu là ghi dữ liệu (Mutations/Form Submit):** Tạo Server Action:
  ```typescript
  // src/features/booking/actions/booking.actions.ts
  'use server';

  import { revalidatePath } from 'next/cache';
  import { bookingFormSchema, BookingFormValues } from '../schemas/booking.schema';

  export async function submitBookingAction(data: BookingFormValues) {
    const validated = bookingFormSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.flatten().fieldErrors };
    }

    // Gửi sang Backend NestJS
    const res = await fetch(`${process.env.INTERNAL_API_URL}/api/v1/orders/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated.data),
    });

    if (!res.ok) return { success: false, message: 'Đăng ký đặt lịch thất bại' };
    revalidatePath('/tra-cuu-don-hang');
    return { success: true };
  }
  ```

### Bước 3: Tạo Custom Hook (Logic cho Client Component)
- **Đường dẫn:** `src/features/<feature-name>/hooks/`
- Tách toàn bộ state, `react-hook-form`, và gọi Server Action hoặc Toast thông báo ra Custom Hook:

```typescript
// src/features/booking/hooks/use-booking-form.ts
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingFormSchema, BookingFormValues } from '../schemas/booking.schema';
import { submitBookingAction } from '../actions/booking.actions';

export function useBookingForm(defaultContext?: { sourceUrl?: string; category?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      serviceType: '',
      pickupAddress: '',
      notes: '',
      sourceUrl: defaultContext?.sourceUrl ?? '',
      category: defaultContext?.category ?? '',
    },
  });

  const onSubmit = async (values: BookingFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await submitBookingAction(values);
      if (res.success) {
        form.reset();
        // Trigger Toast thành công
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, onSubmit, isSubmitting };
}
```

### Bước 4: Xây dựng UI Components với shadcn/ui
- **Đường dẫn:** `src/features/<feature-name>/components/`
- Component cần tương tác (Form, Dialog, Dropdown, Tabs) gắn `"use client"` và dùng Hook ở Bước 3.
- Component hiển thị danh sách tĩnh/bài viết giữ nguyên là **Server Component**.
- **Business Rule cốt lõi:** Các trang bài viết, giới thiệu, dịch vụ giặt sấy luôn có Form liên hệ / Báo giá nhanh ở cuối bài kèm thông tin ngữ cảnh (`sourceUrl`, `category`, `slug`) để tối đa hóa tỷ lệ chuyển đổi (CR).

### Bước 5: Tích hợp vào App Router & Khai báo SEO Metadata
- Đặt page tại đúng routing context:
  - Khách hàng: `src/app/(public)/[slug]/page.tsx`
  - Quản trị: `src/app/(admin)/admin/[feature]/page.tsx`
- **Bắt buộc khai báo Metadata cho trang public:**
  ```typescript
  import type { Metadata } from 'next';

  export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return {
      title: 'Giặt Sấy Lấy Ngay Hà Nội | Giặt Là Thanh Xuân',
      description: 'Dịch vụ giặt sấy cao cấp giao nhận tận nơi trong 2 giờ tại Thanh Xuân, Hà Nội.',
      openGraph: {
        title: 'Giặt Sấy Lấy Ngay Hà Nội | Giặt Là Thanh Xuân',
        description: 'Dịch vụ giặt sấy cao cấp giao nhận tận nơi trong 2 giờ.',
        url: 'https://thanhxuanlaundry.com/dich-vu/giat-say-nhanh',
        siteName: 'Giặt Là Thanh Xuân',
        locale: 'vi_VN',
        type: 'website',
      },
    };
  }
  ```
- Kết hợp `Suspense` và `Skeleton` cho các khối dữ liệu động để trang web hiển thị tức thì.

---

## 4. Checklist Kiểm Định Trước Khi Hoàn Tất
- [ ] Trang public là Server Component mặc định, chỉ đánh dấu `"use client"` ở component lá.
- [ ] Toàn bộ logic form và xử lý API được tách ra Custom Hook hoặc Server Action.
- [ ] Dùng Zod validation và react-hook-form với thông báo lỗi tiếng Việt tự nhiên.
- [ ] Giao diện dùng shadcn/ui, Tailwind token chuẩn, có đủ trạng thái Loading (Skeleton), Empty, Error.
- [ ] Có đầy đủ Title, Meta Description và OpenGraph cho SEO.
- [ ] Chạy typecheck và lint xác thực:
  ```bash
  cd fe-nextjs-thanhxuan-laundry && pnpm exec tsc --noEmit && pnpm lint
  ```
