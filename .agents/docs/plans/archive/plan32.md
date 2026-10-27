# Plan 32: Tái Cấu Trúc Toàn Diện Thư Mục & Chuẩn Hóa Kiến Trúc `fe-nextjs-thanhxuan-laundry/src` Theo Chuẩn `fe-react-thanhxuan-internal`

> Status: Done | Created: 2026-10-25 | Completed: 2026-10-25
> Tham chiếu mẫu: [fe-react-thanhxuan-internal/src](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src)  
> Quy chuẩn áp dụng: [AGENTS.md (Mục 5.3, 5.5, 8)](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/rules/AGENTS.md), [GEMINI.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/rules/GEMINI.md), Skill `create-nextjs-feature`

---

## 1. Overview & Affected Files

### 1.1. Mục Tiêu & Bối Cảnh
Hiện tại, phân hệ `fe-react-thanhxuan-internal/src` đã đạt trạng thái chuẩn mực cao nhất về cấu trúc thư mục, phân lớp component, quy chuẩn đặt tên file theo [AGENTS.md Mục 5.5](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/rules/AGENTS.md#L151-L157):
1. **Trang cấp cao nhất:** Luôn đặt tên `[Tên]Page.tsx` đặt ở root feature folder.
2. **Thư mục `modals/`:** Chuyên biệt chứa các file `[Tên]Modal.tsx` và có `modals/index.ts`.
3. **Thư mục `components/`:** Chuyên biệt chứa các sub-component `[Tên]Component.tsx` và có `components/index.ts`.
4. **Shared Components (`src/components/`):** Phân chia rõ ràng thành `layout/`, `common/`, `ui/` (shadcn primitives).
5. **Định danh nhất quán:** Barrel export `index.ts` ở mỗi feature giúp import trong sáng, gọn gàng; không để file mồ côi hay re-export rác.

Trong khi đó, `fe-nextjs-thanhxuan-laundry/src` đang tồn tại nhiều điểm lệch chuẩn kiến trúc:
- Nhiều màn hình quản trị chính bản chất là một `Page` nhưng lại được đặt tên là `*Modal.tsx` và cất sâu trong `components/` (ví dụ: `ArticleManagerModal.tsx`, `CategoryManagerModal.tsx`, `ContactManagerModal.tsx`, `AccountManagerModal.tsx`...). Khi App Router route gọi tới, file `page.tsx` lại return `<ArticleManagerModal />` gây nhầm lẫn nghiêm trọng về mặt ngữ nghĩa và cấu trúc.
- Các modal thực sự (dialog) nằm lẫn lộn cùng thư mục `components/` với các sub-component bảng biểu, thanh công cụ mà không có thư mục `modals/` riêng biệt.
- Các component con đang mang hậu tố `*Form.tsx` hoặc `*Content.tsx` (như `ArticleManagerTableForm.tsx`, `ContactManagerToolbarForm.tsx`, `AdminCrmContent.tsx`) thay vì hậu tố chuẩn `*Component.tsx`.
- Thư mục `src/components/` phân nhánh theo `admin/` và `public/` phẳng, chứa lẫn lộn giữa layout shell, header/sidebar, modal profile và dialog xác nhận, chưa chia tách lớp `layout/` và `common/` như bên internal.
- Nhiều file vượt ngưỡng 250 - 300 dòng theo quy định [AGENTS.md Mục 5.5](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/rules/AGENTS.md#L156).

### 1.2. Phạm Vi Thực Hiện
- Toàn bộ thư mục `fe-nextjs-thanhxuan-laundry/src/`:
  - `src/components/`: Tái cấu trúc thành `layout/`, `common/`, `ui/`.
  - `src/features/admin/`: 11 module nghiệp vụ (`articles`, `auth`, `categories`, `contacts`, `crm`, `dashboard`, `email-marketing`, `orders`, `settings`, `users`, `zalo`).
  - `src/features/public/`: 6 module (`articles`, `categories`, `contacts`, `home`, `services`, `settings`).
  - `src/app/`: Cập nhật toàn bộ các route App Router trong `(admin)` và `(public)` để gọi chuẩn vào các Page và Component mới.
- Cập nhật tài liệu: [srs_sdd_fe_nextjs.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md), [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md), [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md), [CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).

### 1.3. Out of Scope
- Không thay đổi logic nghiệp vụ, API backend, hoặc payload network.
- Không sửa backend NestJS hay portal internal React SPA.
- Không cài thêm thư viện phụ thuộc mới (`npm`/`pnpm`).

### 1.4. Bảng File Ảnh Hưởng Chính (Tổng Quan)

| Khu Vực | Path Cũ | Action | Path Mới / Mục Đích |
| :--- | :--- | :--- | :--- |
| **Shared Layout** | `src/components/admin/AdminHeader.tsx` | rename | `src/components/layout/admin/AdminHeaderComponent.tsx` |
| **Shared Layout** | `src/components/admin/AdminShell.tsx` | rename | `src/components/layout/admin/AdminShellComponent.tsx` |
| **Shared Layout** | `src/components/admin/Sidebar.tsx` | rename | `src/components/layout/admin/AdminSidebarComponent.tsx` |
| **Shared Layout** | `src/components/public/Header.tsx` | rename | `src/components/layout/public/PublicHeaderComponent.tsx` |
| **Shared Layout** | `src/components/public/Footer.tsx` | rename | `src/components/layout/public/PublicFooterComponent.tsx` |
| **Shared Layout** | `src/components/public/DraggableFloatingContact.tsx` | rename | `src/components/layout/public/DraggableFloatingContactComponent.tsx` |
| **Shared Common** | `src/components/admin/ProfileModal.tsx` | rename | `src/components/common/ProfileModal.tsx` |
| **Shared Common** | `src/components/admin/confirmAlertDialog.tsx` | rename | `src/components/common/ConfirmAlertDialogComponent.tsx` |
| **Shared Common** | `src/components/ThemeToggle.tsx` | rename | `src/components/common/ThemeToggleComponent.tsx` |
| **Shared Common** | `src/components/ThemeProvider.tsx` | rename | `src/components/common/ThemeProvider.tsx` |
| **Feature Articles** | `src/features/admin/articles/components/ArticleManagerModal.tsx` | move/rename | `src/features/admin/articles/ArticleManagerPage.tsx` |
| **Feature Articles** | `src/features/admin/articles/components/ArticleEditorModal.tsx` | move | `src/features/admin/articles/modals/ArticleEditorModal.tsx` |
| **Feature Articles** | `src/features/admin/articles/components/ArticleTrashModal.tsx` | move | `src/features/admin/articles/modals/ArticleTrashModal.tsx` |
| **Feature Articles** | `src/features/admin/articles/components/*Form.tsx` | rename | `src/features/admin/articles/components/*Component.tsx` |
| **Feature Categories**| `src/features/admin/categories/components/CategoryManagerModal.tsx` | move/rename | `src/features/admin/categories/CategoryManagerPage.tsx` |
| **Feature Categories**| `src/features/admin/categories/components/CategoryEditorModal.tsx` | move | `src/features/admin/categories/modals/CategoryEditorModal.tsx` |
| **Feature Contacts** | `src/features/admin/contacts/components/ContactManagerModal.tsx` | move/rename | `src/features/admin/contacts/ContactManagerPage.tsx` |
| **Feature Contacts** | `src/features/admin/contacts/components/ContactTrashModal.tsx` | move | `src/features/admin/contacts/modals/ContactTrashModal.tsx` |
| **Feature Contacts** | `src/features/admin/contacts/components/*Form.tsx` | rename | `src/features/admin/contacts/components/*Component.tsx` |
| **Feature CRM** | `src/features/admin/crm/components/AdminCrmContent.tsx` | move/rename | `src/features/admin/crm/CrmManagerPage.tsx` |
| **Feature CRM** | `src/features/admin/crm/components/*Form.tsx` | rename | `src/features/admin/crm/components/*Component.tsx` |
| **Feature Dashboard** | `src/features/admin/dashboard/components/DashboardMain.tsx` | move/rename | `src/features/admin/dashboard/DashboardPage.tsx` |
| **Feature Email** | `src/features/admin/email-marketing/components/AdminEmailContent.tsx` | move/rename | `src/features/admin/email-marketing/EmailMarketingPage.tsx` |
| **Feature Email** | `src/features/admin/email-marketing/components/*Modal.tsx` | move | `src/features/admin/email-marketing/modals/*Modal.tsx` |
| **Feature Email** | `src/features/admin/email-marketing/components/*Form.tsx` | rename | `src/features/admin/email-marketing/components/*Component.tsx` |
| **Feature Orders** | `src/features/admin/orders/components/AdminOrdersContent.tsx` | move/rename | `src/features/admin/orders/OrdersManagerPage.tsx` |
| **Feature Orders** | `src/features/admin/orders/components/OrdersManagerModal.tsx` | move | `src/features/admin/orders/modals/OrdersManagerModal.tsx` |
| **Feature Orders** | `src/features/admin/orders/components/*Form.tsx` | rename | `src/features/admin/orders/components/*Component.tsx` |
| **Feature Settings** | `src/features/admin/settings/components/*Form.tsx` | rename | `src/features/admin/settings/components/*Component.tsx` |
| **Feature Settings** | `src/features/admin/settings/components/AdminZaloSettingsContent.tsx` | rename | `src/features/admin/settings/components/SettingEditorZaloComponent.tsx` |
| **Feature Users** | `src/features/admin/users/components/AccountManagerModal.tsx` | move/rename | `src/features/admin/users/AccountManagerPage.tsx` |
| **Feature Users** | `src/features/admin/users/components/AccountEditorModal.tsx` | move | `src/features/admin/users/modals/AccountEditorModal.tsx` |
| **Feature Zalo** | `src/features/admin/zalo/components/AdminZaloContent.tsx` | move/rename | `src/features/admin/zalo/ZaloMarketingPage.tsx` |
| **Public Features** | `src/features/public/home/components/*Section.tsx` | rename | `src/features/public/home/components/*Component.tsx` |
| **Public Features** | `src/features/public/articles/components/ArticlePageContent.tsx` | move/rename | `src/features/public/articles/components/ArticleListComponent.tsx` |
| **Public Features** | `src/features/public/contacts/components/ContactPageContent.tsx` | move/rename | `src/features/public/contacts/ContactPage.tsx` |
| **Public Features** | `src/features/public/services/components/ServicePageContent.tsx` | move/rename | `src/features/public/services/ServiceDetailPage.tsx` |
| **App Router** | `src/app/(admin)/**/page.tsx` & `src/app/(public)/**/page.tsx` | edit | Cập nhật toàn bộ import trỏ về chuẩn mới |

---

## 2. Technical Approach & Design Architecture

### 2.1. Cấu Trúc Thư Mục Chuẩn Ánh Xạ Giữa Hai Phân Hệ

```
fe-nextjs-thanhxuan-laundry/src/
├── app/                              # Next.js App Router (Chỉ làm Controller routing & metadata)
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx            # Dùng AdminShellComponent
│   │       ├── articles/page.tsx     # Return <ArticleManagerPage />
│   │       ├── categories/page.tsx   # Return <CategoryManagerPage />
│   │       ├── contacts/page.tsx     # Return <ContactManagerPage />
│   │       ├── crm/page.tsx          # Return <CrmManagerPage />
│   │       ├── dashboard/page.tsx    # Return <DashboardPage />
│   │       ├── email-marketing/page.tsx # Return <EmailMarketingPage />
│   │       ├── orders/page.tsx       # Return <OrdersManagerPage />
│   │       ├── settings/.../page.tsx # Render SettingEditor*Component
│   │       ├── accounts/page.tsx     # Return <AccountManagerPage />
│   │       └── zalo-marketing/page.tsx # Return <ZaloMarketingPage />
│   └── (public)/
│       ├── layout.tsx                # Dùng PublicHeaderComponent, PublicFooterComponent
│       ├── page.tsx                  # Server Component Page gọi HomePage hoặc Section components
│       ├── lien-he/page.tsx          # Return <ContactPage />
│       ├── dich-vu/[...slug]/page.tsx# Return <ServiceDetailPage />
│       └── tin-tuc/.../page.tsx      # Return <ArticleListPage /> / <ArticleDetailPage />
│
├── components/                       # Shared Components (Dùng chung toàn app)
│   ├── common/                       # Component/Modal tiện ích chung
│   │   ├── ConfirmAlertDialogComponent.tsx
│   │   ├── ProfileModal.tsx
│   │   ├── ThemeToggleComponent.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── index.ts
│   ├── layout/                       # Layout shells & navigations
│   │   ├── admin/
│   │   │   ├── AdminHeaderComponent.tsx
│   │   │   ├── AdminShellComponent.tsx
│   │   │   ├── AdminSidebarComponent.tsx
│   │   │   └── index.ts
│   │   └── public/
│   │       ├── PublicHeaderComponent.tsx
│   │       ├── PublicFooterComponent.tsx
│   │       ├── DraggableFloatingContactComponent.tsx
│   │       ├── HeaderClientWrapperComponent.tsx
│   │       ├── header/ (PublicTopBarComponent, PublicMainNavBarComponent, ...)
│   │       ├── footer/ (FooterBottomBarComponent, FooterCompanyInfoComponent, ...)
│   │       └── index.ts
│   └── ui/                           # Primitive components của shadcn/ui (button, dialog, input...)
│
├── features/                         # Feature-Based Flat Colocation
│   ├── admin/                        # 11 Module Quản Trị
│   │   ├── articles/
│   │   │   ├── ArticleManagerPage.tsx # Màn hình quản lý chính
│   │   │   ├── components/            # Subcomponents: *Component.tsx
│   │   │   │   ├── ArticleManagerTableComponent.tsx
│   │   │   │   ├── ArticleManagerToolbarComponent.tsx
│   │   │   │   ├── ArticleEditorAiAssistantComponent.tsx
│   │   │   │   ├── ArticleEditorBasicComponent.tsx
│   │   │   │   ├── ArticleEditorSeoComponent.tsx
│   │   │   │   ├── ArticleEditorSettingsComponent.tsx
│   │   │   │   └── index.ts
│   │   │   ├── modals/                # Modals: *Modal.tsx
│   │   │   │   ├── ArticleEditorModal.tsx
│   │   │   │   ├── ArticleTrashModal.tsx
│   │   │   │   └── index.ts
│   │   │   ├── admin-articles.service.ts
│   │   │   ├── admin-articles.types.ts
│   │   │   ├── useAdminArticles.ts
│   │   │   └── index.ts              # Barrel export sạch
│   │   ├── categories/
│   │   │   ├── CategoryManagerPage.tsx
│   │   │   ├── modals/ (CategoryEditorModal.tsx)
│   │   │   ├── admin-categories.service.ts
│   │   │   └── index.ts
│   │   ├── contacts/
│   │   │   ├── ContactManagerPage.tsx
│   │   │   ├── modals/ (ContactTrashModal.tsx)
│   │   │   ├── components/ (ContactManagerTableComponent, ...)
│   │   │   └── index.ts
│   │   ├── ... (crm, dashboard, email-marketing, orders, settings, users, zalo)
│   │   └── index.ts
│   │
│   └── public/                       # 6 Module Public Khách Hàng
│       ├── home/
│       │   ├── HomePage.tsx
│       │   ├── components/ (HeroSectionComponent, IntroSectionComponent, ...)
│       │   └── index.ts
│       ├── articles/ (ArticleListPage.tsx, ArticleDetailPage.tsx, components/, index.ts)
│       ├── contacts/ (ContactPage.tsx, components/, index.ts)
│       ├── services/ (ServiceDetailPage.tsx, components/, index.ts)
│       └── ...
│
├── lib/                              # utils.ts, api-url.ts...
├── services/                         # api.service.ts...
└── types/                            # index.ts (ApiResponse, Pagination...)
```

### 2.2. Nguyên Tắc & Quy Chuẩn Bắt Buộc (Rules Enforcement)
1. **Tuân thủ AGENTS.md Mục 5.5:**
   - Màn hình cấp cao nhất: `[Tên]Page.tsx`.
   - Modals: `[Tên]Modal.tsx` nằm trong thư mục con `modals/`.
   - Components: `[Tên]Component.tsx` nằm trong thư mục con `components/`.
2. **Tuân thủ AGENTS.md Mục 8.4 (Không để lại file re-export/alias tạm thời):**
   - Khi đổi tên hoặc di chuyển, xóa bỏ hoàn toàn file cũ, cập nhật toàn bộ import trực tiếp tại file gọi. Không để lại file trung gian gây rác dự án.
3. **Tuân thủ AGENTS.md Mục 5.1 (TypeScript Strict Mode):**
   - Không dùng `any` trong các file sửa đổi (loại bỏ `any` tại `src/app/(public)/page.tsx` line 45-57).

---

## 3. Implementation Tasks (Checklist)

### Giai Đoạn 1: Tái Cấu Trúc Thư Mục Shared Components (`src/components/`)
- [x] T1: Tạo cấu trúc thư mục mới `src/components/layout/admin/`, `src/components/layout/public/`, `src/components/common/`.
- [x] T2: Di chuyển và chuẩn hóa Shared Layout Admin:
  - `src/components/admin/AdminHeader.tsx` $\rightarrow$ `src/components/layout/admin/AdminHeaderComponent.tsx`
  - `src/components/admin/AdminShell.tsx` $\rightarrow$ `src/components/layout/admin/AdminShellComponent.tsx`
  - `src/components/admin/Sidebar.tsx` $\rightarrow$ `src/components/layout/admin/AdminSidebarComponent.tsx`
  - Tạo `src/components/layout/admin/index.ts`.
- [x] T3: Di chuyển và chuẩn hóa Shared Layout Public:
  - `src/components/public/Header.tsx` $\rightarrow$ `src/components/layout/public/PublicHeaderComponent.tsx`
  - `src/components/public/Footer.tsx` $\rightarrow$ `src/components/layout/public/PublicFooterComponent.tsx`
  - `src/components/public/DraggableFloatingContact.tsx` $\rightarrow$ `src/components/layout/public/DraggableFloatingContactComponent.tsx`
  - `src/components/public/HeaderClientWrapper.tsx` $\rightarrow$ `src/components/layout/public/HeaderClientWrapperComponent.tsx`
  - Di chuyển các subcomponent trong `src/components/public/header/` và `footer/` sang `src/components/layout/public/header/` và `footer/` với hậu tố `*Component.tsx`.
  - Tạo `src/components/layout/public/index.ts`.
- [x] T4: Di chuyển và chuẩn hóa Shared Common:
  - `src/components/admin/ProfileModal.tsx` $\rightarrow$ `src/components/common/ProfileModal.tsx`
  - `src/components/admin/confirmAlertDialog.tsx` $\rightarrow$ `src/components/common/ConfirmAlertDialogComponent.tsx`
  - `src/components/ThemeToggle.tsx` $\rightarrow$ `src/components/common/ThemeToggleComponent.tsx`
  - `src/components/ThemeProvider.tsx` $\rightarrow$ `src/components/common/ThemeProvider.tsx`
  - Tạo `src/components/common/index.ts`.
- [x] T5: Xóa bỏ triệt để 2 thư mục cũ `src/components/admin/` và `src/components/public/` sau khi đã chuyển hết file.

### Giai Đoạn 2: Tái Cấu Trúc & Chuẩn Hóa Phân Hệ Quản Trị (`src/features/admin/`)
- [x] T6: Chuẩn hóa feature `articles`:
  - `components/ArticleManagerModal.tsx` $\rightarrow$ `ArticleManagerPage.tsx`
  - Di chuyển `ArticleEditorModal.tsx` và `ArticleTrashModal.tsx` vào `modals/`
  - Đổi tên các subcomponent `*Form.tsx` trong `components/` thành `*Component.tsx`
  - Cập nhật `components/index.ts`, tạo `modals/index.ts`, cập nhật `index.ts`.
- [x] T7: Chuẩn hóa feature `categories`:
  - `components/CategoryManagerModal.tsx` $\rightarrow$ `CategoryManagerPage.tsx`
  - Di chuyển `CategoryEditorModal.tsx` vào `modals/`
  - Cập nhật `components/index.ts`, tạo `modals/index.ts`, cập nhật `index.ts`.
- [x] T8: Chuẩn hóa feature `contacts`:
  - `components/ContactManagerModal.tsx` $\rightarrow$ `ContactManagerPage.tsx`
  - Di chuyển `ContactTrashModal.tsx` vào `modals/`
  - Đổi tên các subcomponent `*Form.tsx` trong `components/` thành `*Component.tsx`
  - Cập nhật `components/index.ts`, tạo `modals/index.ts`, cập nhật `index.ts`.
- [x] T9: Chuẩn hóa feature `crm` & `dashboard`:
  - CRM: `components/AdminCrmContent.tsx` $\rightarrow$ `CrmManagerPage.tsx`, đổi các `*Form.tsx` thành `*Component.tsx`.
  - Dashboard: `components/DashboardMain.tsx` $\rightarrow$ `DashboardPage.tsx`.
  - Cập nhật barrel export `index.ts`.
- [x] T10: Chuẩn hóa feature `email-marketing` & `orders`:
  - Email: `components/AdminEmailContent.tsx` $\rightarrow$ `EmailMarketingPage.tsx`, di chuyển `EmailCampaignModal.tsx`, `EmailSequenceModal.tsx` vào `modals/`, đổi các `*Form.tsx` thành `*Component.tsx`.
  - Orders: `components/AdminOrdersContent.tsx` $\rightarrow$ `OrdersManagerPage.tsx`, di chuyển `OrdersManagerModal.tsx` vào `modals/`, đổi các `*Form.tsx` thành `*Component.tsx`.
  - Cập nhật barrel export `index.ts`.
- [x] T11: Chuẩn hóa feature `settings`, `users`, `auth`, `zalo`:
  - Settings: Tạo `SettingsPage.tsx`, đổi các `SettingEditor*Form.tsx` thành `SettingEditor*Component.tsx`. Đổi `AdminZaloSettingsContent.tsx` thành `SettingEditorZaloComponent.tsx`.
  - Users: `components/AccountManagerModal.tsx` $\rightarrow$ `AccountManagerPage.tsx`, di chuyển `AccountEditorModal.tsx` vào `modals/`.
  - Auth: `components/LoginForm.tsx` $\rightarrow$ `components/LoginFormComponent.tsx`.
  - Zalo: `components/AdminZaloContent.tsx` $\rightarrow$ `ZaloMarketingPage.tsx`.
  - Cập nhật barrel export `index.ts` cho từng feature và `src/features/admin/index.ts`.

### Giai Đoạn 3: Tái Cấu Trúc & Chuẩn Hóa Phân Hệ Khách Hàng (`src/features/public/`)
- [x] T12: Chuẩn hóa feature `home`:
  - Tạo `HomePage.tsx` tại root feature.
  - Đổi tên `FaqSection.tsx`, `HeroSection.tsx`, `IntroSection.tsx`, `ServicesGrid.tsx`, `WhyChooseUsSection.tsx` thành `*Component.tsx`.
  - Cập nhật `components/index.ts` và `index.ts`.
- [x] T13: Chuẩn hóa feature `articles`, `contacts`, `services`:
  - Articles: Tách `components/ArticlePageContent.tsx` thành `ArticleListPage.tsx` và các component hiển thị `*Component.tsx`. Đổi `ArticleSortFilter.tsx` thành `ArticleSortFilterComponent.tsx`.
  - Contacts: `components/ContactPageContent.tsx` $\rightarrow$ `ContactPage.tsx` và các sub-component `*Component.tsx`.
  - Services: `components/ServicePageContent.tsx` $\rightarrow$ `ServiceDetailPage.tsx` và các sub-component `*Component.tsx`.
  - Cập nhật barrel export `index.ts`.

### Giai Đoạn 4: Cập Nhật Toàn Bộ App Router Routes & Loại Bỏ TypeScript `any`
- [x] T14: Cập nhật App Router Admin:
  - `src/app/(admin)/admin/layout.tsx` (dùng `AdminShellComponent`)
  - `src/app/(admin)/admin/articles/page.tsx` (dùng `ArticleManagerPage`)
  - `src/app/(admin)/admin/categories/page.tsx` (dùng `CategoryManagerPage`)
  - `src/app/(admin)/admin/contacts/page.tsx` (dùng `ContactManagerPage`)
  - `src/app/(admin)/admin/crm/page.tsx` (dùng `CrmManagerPage`)
  - `src/app/(admin)/admin/dashboard/page.tsx` (dùng `DashboardPage`)
  - `src/app/(admin)/admin/email-marketing/page.tsx` (dùng `EmailMarketingPage`)
  - `src/app/(admin)/admin/orders/page.tsx` (dùng `OrdersManagerPage`)
  - `src/app/(admin)/admin/settings/**/page.tsx` (dùng `SettingEditor*Component`)
  - `src/app/(admin)/admin/accounts/page.tsx` (dùng `AccountManagerPage`)
  - `src/app/(admin)/admin/zalo-marketing/page.tsx` (dùng `ZaloMarketingPage`)
  - `src/app/(admin)/admin/login/page.tsx` (dùng `LoginFormComponent`)
- [x] T15: Cập nhật App Router Public:
  - `src/app/(public)/layout.tsx` (dùng `PublicHeaderComponent`, `PublicFooterComponent`, `DraggableFloatingContactComponent`)
  - `src/app/(public)/page.tsx` (xóa sạch `any`, gọi `HomePage` hoặc các section component chuẩn)
  - `src/app/(public)/lien-he/page.tsx` (dùng `ContactPage`)
  - `src/app/(public)/tin-tuc/page.tsx` & `tin-tuc/[...slug]/page.tsx` (dùng `ArticleListPage` / `ArticleDetailPage`)
  - `src/app/(public)/dich-vu/[...slug]/page.tsx` (dùng `ServiceDetailPage`)
- [x] T16: Quét toàn bộ codebase Next.js đảm bảo không còn bất kỳ import nào trỏ vào file cũ, không có file re-export tạm thời mồ côi.

### Giai Đoạn 5: Kiểm Tra & Đồng Bộ Tài Liệu Kỹ Thuật
- [x] T17: Chạy kiểm tra chất lượng mã nguồn:
  - `pnpm exec tsc --noEmit` tại `fe-nextjs-thanhxuan-laundry/`
  - `pnpm lint` tại `fe-nextjs-thanhxuan-laundry/`
  - `pnpm build` tại `fe-nextjs-thanhxuan-laundry/`
- [x] T18: Đồng bộ tài liệu kỹ thuật:
  - Cập nhật [.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_nextjs.md) phản ánh cấu trúc thư mục mới.
  - Cập nhật [.agents/docs/CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md) với danh sách Component, Page, Route mới.
  - Cập nhật [.agents/docs/SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) (thêm 1 dòng Document History).
  - Ghi nhật ký chi tiết vào [.agents/docs/CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).
- [x] T19: Tự động commit và push lên nhánh `dev` theo quy chuẩn [AGENTS.md Mục 1 & 4](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/rules/AGENTS.md#L14-L18).

---

## 4. Verification & Testing

### 4.1. Lệnh Kiểm Tra Cụ Thể (Chạy tại `fe-nextjs-thanhxuan-laundry/`)
```bash
# 1. Kiểm tra toàn bộ Type TypeScript
pnpm exec tsc --noEmit

# 2. Kiểm tra Lint ESLint
pnpm lint

# 3. Kiểm tra Build Production Next.js (bao gồm kiểm tra Static Page Generation & Dynamic Server Routes)
pnpm build
```

### 4.2. Kịch Bản Kiểm Thử
1. **Admin Portal Routes:**
   - Truy cập `/admin/login`, `/admin/dashboard`, `/admin/articles`, `/admin/categories`, `/admin/contacts`, `/admin/crm`, `/admin/orders`, `/admin/accounts`, `/admin/settings/header`, `/admin/zalo-marketing` đảm bảo các container Page mount hoàn hảo, không có lỗi render hay missing import.
2. **Public Website Routes:**
   - Trang chủ `/`, trang dịch vụ `/dich-vu/...`, trang tin tức `/tin-tuc`, trang liên hệ `/lien-he` build static/SSR trơn tru, đầy đủ thẻ meta SEO.
3. **Modal Triggers:**
   - Mở modal thêm/sửa bài viết (`ArticleEditorModal`), mở modal thùng rác (`ArticleTrashModal`), mở modal thêm/sửa chuyên mục (`CategoryEditorModal`), mở modal tài khoản (`AccountEditorModal`) hoạt động bình thường, state không bị mất.

### 4.3. Definition of Done
1. Mọi task trong plan đã hoàn tất và kiểm chứng thực tế.
2. `pnpm exec tsc --noEmit` không có bất kỳ lỗi nào.
3. `pnpm lint` không có lỗi.
4. `pnpm build` biên dịch thành công 100%.
5. Xóa bỏ triệt để toàn bộ file cũ/tương thích ngược mồ côi (không để lại bridge file).
6. Cập nhật đầy đủ `srs_sdd_fe_nextjs.md`, `CODEBASE_ATLAS.md`, `SRS_SDD.md`, `CHANGELOG.md`.
7. Tự động commit và push code lên nhánh `dev`.

---

## 5. Risks & Rollback

### 5.1. Rủi Ro Tiềm Ẩn
- **Lỗi Import Path vỡ:** Do số lượng file di chuyển lớn (~40 file), nếu có file nào sót import tương đối (`./` hoặc `../`) có thể gây gãy compile.
  - *Giải pháp giảm thiểu:* Dùng alias `@/features/...` và `@/components/...` triệt để; chạy `tsc --noEmit` ngay sau mỗi giai đoạn để cô lập lỗi.
- **Next.js Server Component vs Client Component directive:** Một số component chuyển từ modal sang page có thể thiếu `"use client"` nếu chứa hook hoặc state.
  - *Giải pháp giảm thiểu:* Giữ nguyên toàn bộ directives `"use client"` sẵn có ở đầu các file component, chỉ đổi vị trí thư mục và tên file.

### 5.2. Kế Hoạch Rollback
- Nếu quá trình refactor gặp sự cố không thể khắc phục trong một commit, sử dụng `git checkout` để khôi phục lại trạng thái commit gần nhất trên nhánh `dev`.

---

## Execution Log
- 2026-10-25: Hoàn tất toàn diện Plan 32 qua 5 giai đoạn:
  - Giai đoạn 1: Tái cấu trúc Shared Components (`layout/admin/`, `layout/public/`, `common/`, `ui/`). Xóa bỏ triệt để `components/admin/` và `components/public/`.
  - Giai đoạn 2: Chuẩn hóa 11 Feature Admin theo quy chuẩn `[Tên]Page.tsx`, `modals/[Tên]Modal.tsx`, `components/[Tên]Component.tsx` và barrel export tại `src/features/admin/index.ts`.
  - Giai đoạn 3: Chuẩn hóa 6 Feature Public với `HomePage.tsx`, `ArticleListPage.tsx`, `ContactPage.tsx`, `ServiceDetailPage.tsx` và barrel export tại `src/features/public/index.ts`.
  - Giai đoạn 4: Cập nhật toàn bộ App Router routes trong `(admin)` và `(public)`, loại bỏ 100% `any` trong `src/app/(public)/page.tsx`, xóa bỏ hoàn toàn file re-export mồ côi.
  - Giai đoạn 5: Verify `tsc --noEmit` pass 100%, `pnpm build` pass 100% (static & dynamic server routes). Đồng bộ `srs_sdd_fe_nextjs.md`, `CODEBASE_ATLAS.md`, `SRS_SDD.md`, `CHANGELOG.md`.

## Changelog
- 2026-10-25: Khởi tạo Plan 32 - Tái cấu trúc thư mục & chuẩn hóa kiến trúc `fe-nextjs-thanhxuan-laundry/src` theo chuẩn `fe-react-thanhxuan-internal`.
