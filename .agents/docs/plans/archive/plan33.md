# Plan 33: Tái Cấu Trúc Thư Mục Laundry Đồng Bộ Với Internal & Chuẩn NestJS

> Status: Done | Created: 2026-10-25

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Phạm vi
- Đồng bộ hóa kiến trúc thư mục `be-nestjs-thanhxuan/src/modules/laundry` theo đúng mô hình của `be-nestjs-thanhxuan/src/modules/internal`, tuân thủ quy tắc trong `AGENTS.md` và skill `create-nestjs-module`.
- **Root Level Domain:** Tạo `laundry.module.ts` và `laundry.constants.ts` để đóng gói 12 submodule giặt là, tái cấu trúc `app.module.ts` import tập trung `LaundryModule` (tương tự như `InternalModule` và `MovingModule`).
- **Submodule Level:** Chuẩn hóa cấu trúc thư mục con bên trong 12 submodules của `laundry`:
  - Di chuyển toàn bộ các file `*.repository.ts` đang nằm ở root của các module con vào thư mục `repositories/`.
  - Cập nhật toàn bộ các file import (`controller`, `service`, `module`, `specs`) trỏ chính xác về đường dẫn mới.
  - Tuyệt đối không để lại file rác / alias re-export tương thích ngược (tuân thủ Rule 4 & Rule 8 trong `AGENTS.md`).
- **Out of scope:** Không thay đổi API Contract, HTTP route prefixes hay logic nghiệp vụ của các Controller và Service nhằm bảo đảm tương thích 100% với Frontend Next.js (`fe-nextjs-thanhxuan-laundry`).

### 1.2. Assumptions & Open Questions
- **Assumptions:** 
  - Routing của các controller trong `laundry` giữ nguyên các prefix hiện có (`@Controller('articles')`, `@Controller('auth')`...) để không ảnh hưởng đến Frontend.
  - 12 submodule của `laundry` gồm: `articles`, `auth`, `categories`, `contacts`, `crm`, `dashboard`, `email-marketing`, `orders`, `settings`, `users`, `zalo`, `zalo-marketing`.
- **Open Questions:** Không có.

### 1.3. Bảng File Ảnh Hưởng

| Path | Action | Lý do |
| :--- | :--- | :--- |
| `src/modules/laundry/laundry.constants.ts` | Add | Khởi tạo hằng số cho domain laundry |
| `src/modules/laundry/laundry.module.ts` | Add | Đóng gói và export 12 submodule giặt là |
| `src/app.module.ts` | Edit | Thay thế import 12 submodules lẻ tẻ bằng `LaundryModule` |
| `src/modules/laundry/articles/repositories/articles.repository.ts` | Add | Di chuyển từ `articles/articles.repository.ts` |
| `src/modules/laundry/articles/articles.repository.ts` | Delete | Xóa file cũ tại root submodule |
| `src/modules/laundry/articles/articles.module.ts` | Edit | Cập nhật import `ArticlesRepository` |
| `src/modules/laundry/articles/articles.service.ts` | Edit | Cập nhật import `ArticlesRepository` |
| `src/modules/laundry/articles/specs/articles.service.spec.ts` | Edit | Cập nhật import `ArticlesRepository` |
| `src/modules/laundry/categories/repositories/categories.repository.ts` | Add | Di chuyển từ `categories/categories.repository.ts` |
| `src/modules/laundry/categories/categories.repository.ts` | Delete | Xóa file cũ tại root submodule |
| `src/modules/laundry/categories/categories.module.ts` | Edit | Cập nhật import `CategoriesRepository` |
| `src/modules/laundry/categories/categories.service.ts` | Edit | Cập nhật import `CategoriesRepository` và `ArticlesRepository` |
| `src/modules/laundry/categories/specs/categories.service.spec.ts` | Edit | Cập nhật import `CategoriesRepository` và `ArticlesRepository` |
| `src/modules/laundry/contacts/repositories/contacts.repository.ts` | Add | Di chuyển từ `contacts/contacts.repository.ts` |
| `src/modules/laundry/contacts/contacts.repository.ts` | Delete | Xóa file cũ tại root submodule |
| `src/modules/laundry/contacts/contacts.module.ts` | Edit | Cập nhật import `ContactsRepository` |
| `src/modules/laundry/contacts/contacts.service.ts` | Edit | Cập nhật import `ContactsRepository` |
| `src/modules/laundry/contacts/specs/contacts.service.spec.ts` | Edit | Cập nhật import `ContactsRepository` |
| `src/modules/laundry/crm/repositories/crm.repository.ts` | Add | Di chuyển từ `crm/crm.repository.ts` |
| `src/modules/laundry/crm/crm.repository.ts` | Delete | Xóa file cũ tại root submodule |
| `src/modules/laundry/crm/crm.module.ts` | Edit | Cập nhật import `CrmRepository` |
| `src/modules/laundry/crm/crm.service.ts` | Edit | Cập nhật import `CrmRepository` |
| `src/modules/laundry/orders/repositories/orders.repository.ts` | Add | Di chuyển từ `orders/orders.repository.ts` |
| `src/modules/laundry/orders/orders.repository.ts` | Delete | Xóa file cũ tại root submodule |
| `src/modules/laundry/orders/orders.module.ts` | Edit | Cập nhật import `OrdersRepository` |
| `src/modules/laundry/orders/orders.service.ts` | Edit | Cập nhật import `OrdersRepository` |
| `src/modules/laundry/settings/repositories/settings.repository.ts` | Add | Di chuyển từ `settings/settings.repository.ts` |
| `src/modules/laundry/settings/settings.repository.ts` | Delete | Xóa file cũ tại root submodule |
| `src/modules/laundry/settings/settings.module.ts` | Edit | Cập nhật import `SettingsRepository` |
| `src/modules/laundry/settings/settings.service.ts` | Edit | Cập nhật import `SettingsRepository` |
| `src/modules/laundry/settings/specs/settings.service.spec.ts` | Edit | Cập nhật import `SettingsRepository` |
| `src/modules/laundry/users/repositories/users.repository.ts` | Add | Di chuyển từ `users/users.repository.ts` |
| `src/modules/laundry/users/users.repository.ts` | Delete | Xóa file cũ tại root submodule |
| `src/modules/laundry/users/users.module.ts` | Edit | Cập nhật import `UsersRepository` |
| `src/modules/laundry/users/users.service.ts` | Edit | Cập nhật import `UsersRepository` |
| `src/modules/laundry/users/specs/users.service.spec.ts` | Edit | Cập nhật import `UsersRepository` |
| `src/modules/laundry/dashboard/dashboard.service.ts` | Edit | Cập nhật import `ArticlesRepository`, `CategoriesRepository`, `ContactsRepository` |
| `src/modules/laundry/dashboard/specs/dashboard.service.spec.ts` | Edit | Cập nhật import `ArticlesRepository`, `CategoriesRepository`, `ContactsRepository` |
| `src/modules/laundry/zalo/zalo.service.ts` | Edit | Cập nhật import `CrmRepository` |
| `src/modules/laundry/zalo-marketing/zalo-marketing.service.ts` | Edit | Cập nhật import `CrmRepository` |
| `.agents/docs/CODEBASE_ATLAS.md` | Edit | Cập nhật bản đồ định vị mã nguồn cho domain laundry |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | Edit | Cập nhật tài liệu kiến trúc Backend với `LaundryModule` |
| `.agents/docs/SRS_SDD.md` | Edit | Thêm 1 dòng Document History |

---

## 2. Technical Approach

### 2.1. Kiến Trúc Cấu Trúc Thư Mục Chuẩn
Tuân thủ cấu trúc của `src/modules/internal`:
```
src/modules/laundry/
├── laundry.constants.ts          # Hằng số cấu hình domain
├── laundry.module.ts             # Module tổng đóng gói 12 submodule
├── articles/
│   ├── dto/
│   ├── schemas/
│   ├── repositories/             # [MỚI] articles.repository.ts
│   ├── specs/                    # 100% unit tests
│   ├── articles.controller.ts
│   ├── articles.service.ts
│   └── articles.module.ts
├── categories/
│   ├── dto/
│   ├── schemas/
│   ├── repositories/             # [MỚI] categories.repository.ts
│   ├── specs/
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── categories.module.ts
├── contacts/
│   ├── dto/
│   ├── schemas/
│   ├── repositories/             # [MỚI] contacts.repository.ts
│   ├── specs/
│   ├── contacts.controller.ts
│   ├── contacts.service.ts
│   └── contacts.module.ts
├── crm/
│   ├── dto/
│   ├── schemas/
│   ├── repositories/             # [MỚI] crm.repository.ts
│   ├── crm.controller.ts
│   ├── crm.service.ts
│   └── crm.module.ts
├── orders/
│   ├── dto/
│   ├── schemas/
│   ├── repositories/             # [MỚI] orders.repository.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
├── settings/
│   ├── dto/
│   ├── schemas/
│   ├── repositories/             # [MỚI] settings.repository.ts
│   ├── specs/
│   ├── settings.controller.ts
│   ├── settings.service.ts
│   └── settings.module.ts
├── users/
│   ├── schemas/
│   ├── repositories/             # [MỚI] users.repository.ts
│   ├── specs/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── auth/                         # Đã chuẩn dto/, guards/, strategies/, specs/
├── dashboard/                    # Đã chuẩn specs/
├── email-marketing/              # schemas/, controllers, services
├── zalo/
└── zalo-marketing/
```

### 2.2. LaundryModule & AppModule
`laundry.module.ts`:
```typescript
// Adhering to SOLID & Design Patterns
import { Module } from '@nestjs/common';
import { ArticlesModule } from './articles/articles.module';
import { ContactsModule } from './contacts/contacts.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { CrmModule } from './crm/crm.module';
import { OrdersModule } from './orders/orders.module';
import { ZaloModule } from './zalo/zalo.module';
import { ZaloMarketingModule } from './zalo-marketing/zalo-marketing.module';
import { EmailMarketingModule } from './email-marketing/email-marketing.module';

@Module({
  imports: [
    ArticlesModule,
    ContactsModule,
    CategoriesModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    SettingsModule,
    CrmModule,
    OrdersModule,
    ZaloModule,
    ZaloMarketingModule,
    EmailMarketingModule,
  ],
  exports: [
    ArticlesModule,
    ContactsModule,
    CategoriesModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    SettingsModule,
    CrmModule,
    OrdersModule,
    ZaloModule,
    ZaloMarketingModule,
    EmailMarketingModule,
  ],
})
export class LaundryModule {}
```
Trong `app.module.ts`, thay vì khai báo 12 modules giặt là rời rạc, ta chỉ cần import `LaundryModule`, tương tự như `MovingModule` và `InternalModule`.

---

## 3. Implementation Tasks (Checklist)

- [x] T1: Tạo `src/modules/laundry/laundry.constants.ts` và `src/modules/laundry/laundry.module.ts`. Depends on: none
- [x] T2: Di chuyển `articles.repository.ts` vào `src/modules/laundry/articles/repositories/` và cập nhật các file import liên quan (`articles.module.ts`, `articles.service.ts`, `articles.service.spec.ts`, `categories.service.ts`, `dashboard.service.ts`). Depends on: none
- [x] T3: Di chuyển `categories.repository.ts` vào `src/modules/laundry/categories/repositories/` và cập nhật các file import liên quan (`categories.module.ts`, `categories.service.ts`, `categories.service.spec.ts`, `articles.service.ts`, `dashboard.service.ts`). Depends on: none
- [x] T4: Di chuyển `contacts.repository.ts` vào `src/modules/laundry/contacts/repositories/` và cập nhật các file import liên quan (`contacts.module.ts`, `contacts.service.ts`, `contacts.service.spec.ts`, `dashboard.service.ts`). Depends on: none
- [x] T5: Di chuyển `crm.repository.ts` vào `src/modules/laundry/crm/repositories/` và cập nhật các file import liên quan (`crm.module.ts`, `crm.service.ts`, `zalo.service.ts`, `zalo-marketing.service.ts`). Depends on: none
- [x] T6: Di chuyển `orders.repository.ts` vào `src/modules/laundry/orders/repositories/` và cập nhật các file import (`orders.module.ts`, `orders.service.ts`). Depends on: none
- [x] T7: Di chuyển `settings.repository.ts` vào `src/modules/laundry/settings/repositories/` và cập nhật các file import (`settings.module.ts`, `settings.service.ts`, `settings.service.spec.ts`). Depends on: none
- [x] T8: Di chuyển `users.repository.ts` vào `src/modules/laundry/users/repositories/` và cập nhật các file import (`users.module.ts`, `users.service.ts`, `users.service.spec.ts`). Depends on: none
- [x] T9: Xóa toàn bộ 7 file repository cũ tại root các submodule để đảm bảo sạch sẽ và không tồn đọng file thừa. Depends on: T2, T3, T4, T5, T6, T7, T8
- [x] T10: Cập nhật `src/app.module.ts` import `LaundryModule` thay cho 12 module giặt là riêng lẻ. Depends on: T1
- [x] T11: Cập nhật tài liệu kỹ thuật: `.agents/docs/CODEBASE_ATLAS.md`, `.agents/docs/srs_sdd/srs_sdd_backend.md`, `.agents/docs/SRS_SDD.md` (Document History) và `.agents/docs/CHANGELOG.md`. Depends on: T9, T10

---

## 4. Verification & Testing

- **Kiểm tra biên dịch & Build:**
  - `pnpm exec tsc --noEmit` trong thư mục `be-nestjs-thanhxuan`
  - `pnpm build` trong thư mục `be-nestjs-thanhxuan`
- **Kiểm tra Unit Tests:**
  - `pnpm test src/modules/laundry` bảo đảm 100% tests của phân hệ laundry pass.
- **Definition of Done:**
  - Tất cả repository nằm trong `repositories/`.
  - Không còn file re-export hoặc file thừa ở root các module con.
  - `LaundryModule` gom toàn bộ 12 submodule và được đăng ký chuẩn trong `AppModule`.
  - Build và test của laundry thành công.
  - Cập nhật tài liệu kiến trúc và nhật ký thay đổi.

---

## 5. Risks & Rollback

- **Rủi ro:** Một số file spec/service ở module khác hoặc dashboard import sai đường dẫn mới của repository.
- **Biện pháp giảm thiểu:** Dùng grep toàn bộ codebase trước và sau khi refactor; chạy `pnpm build` và `pnpm test src/modules/laundry` để bắt toàn bộ lỗi import.
- **Rollback:** Khôi phục qua git commit gần nhất nếu phát sinh lỗi không tương thích.

---

## Changelog

- 2026-10-25: Khởi tạo Plan 33 tái cấu trúc thư mục Laundry đồng bộ với Internal và skill `create-nestjs-module`.

---

## 6. Execution Log

- **Ngày thực thi:** 2026-10-25
- **Các task hoàn tất:** T1 - T11 (100% hoàn thành).
- **Kết quả kiểm thử:**
  - `pnpm exec tsc -p tsconfig.build.json --noEmit` pass 100% (0 errors).
  - `pnpm build` (`nest build`) thành công 100%.
  - `pnpm test src/modules/laundry` pass 100% (14 test suites, 36/36 tests passed).
- **Lệch so với plan (Deviations):** Không có. Toàn bộ thực thi chính xác 100% theo kế hoạch.
