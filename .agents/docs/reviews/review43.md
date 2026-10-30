# Review 43: Vá Lỗ Hổng Bảo Mật Trọng Yếu (Critical/High), Khôi Phục 5 Luồng Nghiệp Vụ Đứt Gãy & Tối Ưu Kiến Trúc

> Plan: [.agents/docs/plans/plan43.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/plans/plan43.md) | Reviewed: 2026-10-27 | Base: `d38dca0` -> `b4d60d9` | Verdict: **Request changes**

---

## 1. Tóm tắt

Plan 43 tập trung vào việc khắc phục các lỗ hổng bảo mật mức CRITICAL / HIGH, khôi phục 5 luồng nghiệp vụ đứt gãy và tối ưu hóa kiến trúc trong 3 phân hệ `be-nestjs-thanhxuan/src/modules/core`, `be-nestjs-thanhxuan/src/modules/internal` và `fe-react-thanhxuan-internal/src`.

Nhìn chung:

- **Đạt được:** Đã vá thành công nhiều lỗ hổng cốt lõi gồm: bảo vệ `passwordHash` với `select: false`, gắn `PermissionsGuard` + `PayFieldFilterInterceptor` + kiểm tra ownership tại `AccountsController`, sửa `PermissionsGuard` sang logic `.some()` (OR), xóa bỏ `StaffJwtGuard` lỗi thời, vá Path Traversal trong `UploadService`, sửa `ArchiveService` không xóa nhầm ảnh chấm công/xăng xe, khôi phục `PayFieldFilterInterceptor` tại `ReportsController` (bỏ `res.json()`), đồng bộ API Contract Auth phía Frontend (`code`, `oldPassword`), chặn phiên đăng nhập tài khoản pending, áp dụng code splitting (`React.lazy`) và chuẩn hóa múi giờ `Asia/Ho_Chi_Minh`.
- **Hạn chế tồn đọng:** Một số hạng mục an ninh đã cam kết trong plan chưa được thực hiện triệt để: kiểm tra NoSQL Operator Injection trên `patchFields` (`HandoverRecordService`), bảo mật phân hệ `AiModule`, ẩn `wifiIps` tại `GET /attendance/workshop-config`, cô lập `userId` trong `offline-queue.ts`. Đồng thời, 5 trụ cột tài liệu chưa đồng bộ đầy đủ (thiếu Plan 43 trong `SRS_SDD.md`, `CHANGELOG.md` và `DATABASE_DICTIONARY.md`).

---

## 2. Đối chiếu với Plan

| Task   | Hạng mục cam kết                                                                                            | Trạng thái | Ghi chú đối chiếu                                                                                                                                                                                                                                                      |
| :----- | :---------------------------------------------------------------------------------------------------------- | :--------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T1** | Vá bảo mật & dọn dẹp re-export trong `src/modules/core`                                                     | **Thiếu**  | Đã sửa `PermissionsGuard` (.some), xóa 3 re-export auth, vá Path Traversal `upload.service.ts`, thêm index `NotificationSchema` & `MediaFileSchema`. Tuy nhiên, chưa thực hiện hardening cho `AiModule` (`ai.controller.ts`, `ai.service.ts`, `gemini.provider.ts`).   |
| **T2** | Vá bảo mật `AuthModule` & `Common` trong `src/modules/internal`                                             |  **Đạt**   | Đã đặt `select: false` cho `passwordHash`, xóa `StaffJwtGuard`, gắn `PermissionsGuard` + `PayFieldFilterInterceptor` cho `AccountsController`, kiểm tra ownership `GET /accounts/:id`, tạo `account-otp.service.ts` dùng `crypto.randomInt`.                           |
| **T3** | Vá bảo mật & sửa lỗi nghiệp vụ trong `Handovers`, `Attendance`, `Archive`, `Partners`, `Payroll`, `Reports` | **Thiếu**  | Đã sửa `ArchiveService.cleanupOrphanedImages`, bỏ `res.json()` tại `ReportsController`, sửa các trường báo cáo kho/đối soát, chuẩn hóa ngày giờ VN. Tuy nhiên, chưa chặn key chứa `$` trong `patchFields` và chưa ẩn `wifiIps` trên `GET /attendance/workshop-config`. |
| **T4** | Đồng bộ API Contract, Bảo mật Auth/Route/Offline Queue & Tối ưu Frontend                                    | **Thiếu**  | Đã đồng bộ payload `{ code }`, `{ oldPassword }`, chặn `PENDING_*` trong `AuthContext` & `ProtectedRoute`, thêm `clearOfflineQueue()` khi logout, lazy loading route. Tuy nhiên, chưa gắn `userId` vào `OfflineMutation` và chưa có mutex `isSyncing`.                 |
| **T5** | Kiểm thử Tự động (Lint, Typecheck, Unit Test, Build)                                                        |  **Đạt**   | Backend: 49/49 suites (226 tests) PASS, `tsc --noEmit` PASS, `nest build` PASS. Frontend: `tsc --noEmit` PASS, `vite build` PASS.                                                                                                                                      |
| **T6** | Đồng bộ 5 Trụ cột Tài liệu & Commit/Push nhánh `dev`                                                        | **Thiếu**  | `srs_sdd_backend.md`, `srs_sdd_fe_internal.md` và `CODEBASE_ATLAS.md` đã cập nhật. Tuy nhiên, `DATABASE_DICTIONARY.md` chưa cập nhật index và `select: false`; `SRS_SDD.md` và `CHANGELOG.md` bị bỏ sót hoàn toàn bài luận Plan 43.                                    |

---

## 3. Danh Sách Phát Hiện (Findings)

| ID     |  Mức độ   | Vị trí (path:line)                                                                                                                                                                                                                                                                                                   | Vấn đề                                                                                                                                                                                                                                                       | Hướng xử lý đề xuất                                                                                                                                                                                 |
| :----- | :-------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1** | **Major** | [`be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts:255-273`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/handovers/services/handover-record.service.ts#L255-L273)                                                                   | `patchFields` chưa kiểm tra từ chối các key bắt đầu bằng `$` hoặc chứa `__proto__` / `constructor`. Tại `handover-record.repository.ts:58`, query vẫn spread trực tiếp `{ ...update, $inc: { version: 1 } }` thay vì bọc `$set`.                             | Kiểm tra whitelist các prefix trường hợp lệ; ném `BadRequestException` nếu bất kỳ key nào bắt đầu bằng `$` hoặc chứa prototype keys. Bọc `{ $set: update, $inc: { version: 1 } }` trong repository. |
| **R2** | **Major** | [`be-nestjs-thanhxuan/src/modules/core/ai/ai.service.ts:24`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/ai/ai.service.ts#L24) & [`ai.controller.ts:99-183`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/core/ai/ai.controller.ts#L99-L183) | Cam kết của Plan 43 về `AiModule` (loại bỏ biến instance `this.currentProvider` gây race condition, gắn Guard phân quyền, loại bỏ nhận `apiKey` qua query) chưa được triển khai vào mã nguồn.                                                                | Cập nhật `AiService` nhận `providerName` theo từng hàm (stateless); gắn `@UseGuards(JwtAuthGuard, RolesGuard)` cho các endpoint trong `AiController`.                                               |
| **R3** | **Major** | [`.agents/docs/SRS_SDD.md:157`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md#L157) & [`.agents/docs/CHANGELOG.md:5-7`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md#L5-L7)                                                                                       | Bài luận chi tiết và dòng Document History của Plan 43 bị bỏ sót hoàn toàn trong `SRS_SDD.md` và `CHANGELOG.md` (commit `b4d60d9` chỉ thay đổi ký tự đầu file).                                                                                              | Bổ sung 1 dòng Document History cho Plan 43 trong `SRS_SDD.md` và bổ sung bài luận phân tích chi tiết của Plan 43 vào `CHANGELOG.md`.                                                               |
| **R4** | **Major** | [`.agents/docs/DATABASE_DICTIONARY.md:557-585`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md#L557-L585)                                                                                                                                                                         | `DATABASE_DICTIONARY.md` chưa được cập nhật các thuộc tính mới của Plan 43: compound index `{ toAccountId: 1, readAt: 1, createdAt: -1 }` của bảng `notifications`, index của `media_files` và thuộc tính `select: false` của `staff_accounts.passwordHash`. | Cập nhật định nghĩa các trường và index tương ứng trong `DATABASE_DICTIONARY.md`.                                                                                                                   |
| **R5** | **Minor** | [`be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.controller.ts:55-58`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.controller.ts#L55-L58)                                                                                           | Endpoint `GET /attendance/workshop-config` cho phép mọi nhân sự có token đọc toàn bộ danh sách `wifiIps` xưởng mà chưa gắn quyền `ADMIN` hoặc ẩn trường `wifiIps` với role thường.                                                                           | Thêm logic ẩn `wifiIps` hoặc chỉ trả về cho vai trò quản lý (`ADMIN`, `MANAGER`).                                                                                                                   |
| **R6** | **Minor** | [`fe-react-thanhxuan-internal/src/lib/offline-queue.ts:5-14`](file:///d:/PROJECT/Website_Thanh_Xuan_Company/fe-react-thanhxuan-internal/src/lib/offline-queue.ts#L5-L14)                                                                                                                                             | `OfflineMutation` chưa bổ sung trường `userId` để cô lập hàng đợi ngoại tuyến theo từng người dùng khi nhiều tài khoản dùng chung 1 thiết bị/trình duyệt; chưa có cờ mutex `isSyncing` chống đồng bộ song song.                                              | Bổ sung trường `userId?: string` vào `OfflineMutation` và biến cờ `let isSyncing = false` trong `syncOfflineQueue`.                                                                                 |

---

## 4. Kết Quả Verification

| Lệnh kiểm chứng                                       |                        Kết quả                        | Khớp với báo cáo của Executor? |
| :---------------------------------------------------- | :---------------------------------------------------: | :----------------------------: |
| `be-nestjs-thanhxuan: pnpm exec tsc --noEmit`         |           **PASS (Exit code 0, 0 errors)**            |           Khớp 100%            |
| `be-nestjs-thanhxuan: pnpm test`                      |    **PASS (49 test suites, 226 passed, 0 failed)**    |           Khớp 100%            |
| `be-nestjs-thanhxuan: pnpm build`                     |        **PASS (NestJS bundle tạo thành công)**        |           Khớp 100%            |
| `fe-react-thanhxuan-internal: pnpm exec tsc --noEmit` |           **PASS (Exit code 0, 0 errors)**            |           Khớp 100%            |
| `fe-react-thanhxuan-internal: pnpm build`             | **PASS (Vite build + PWA service worker thành công)** |           Khớp 100%            |

---

## 5. Kiểm Tra Tài Liệu (5 Trụ Cột)

- [x] **`srs_sdd_backend.md`**: Đã cập nhật các thay đổi bảo mật phân hệ Auth, Handover, Upload, Archive, Reports.
- [x] **`srs_sdd_fe_internal.md`**: Đã cập nhật kiến trúc Lazy Routing và Auth Context.
- [x] **`CODEBASE_ATLAS.md`**: Đã cập nhật Guard/Controller và dọn các file re-export đã xóa.
- [ ] **`DATABASE_DICTIONARY.md`**: **Chưa đồng bộ** (thiếu index mới của `notifications`, `media_files` và `select: false` của `staff_accounts.passwordHash`).
- [ ] **`SRS_SDD.md`**: **Chưa đồng bộ** (thiếu dòng lịch sử Document History cho Plan 43).
- [ ] **`CHANGELOG.md`**: **Chưa đồng bộ** (thiếu toàn bộ bài luận chi tiết của Plan 43).

---

## 6. Open Questions & Khuyến nghị

1. **Khắc phục bảo mật NoSQL Injection cho Handover**: Cần bổ sung ngay logic validate key trong `patchFields` để triệt tiêu nguy cơ NoSQL Operator Injection.
2. **Đồng bộ hóa tài liệu**: Bổ sung nội dung Plan 43 vào `CHANGELOG.md`, `SRS_SDD.md` và `DATABASE_DICTIONARY.md` để đảm bảo tính toàn vẹn 5 trụ cột tài liệu của dự án.
