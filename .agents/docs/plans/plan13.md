# Plan 13: Tinh gọn Phân quyền Menu & Cơ chế Tự động Chấm công cho Shipper

> Status: Done | Created: 2026-10-05

## 1. Overview & Affected Files

### 1.1. Mục tiêu
1. **Tinh gọn giao diện & phân quyền các vai trò theo đúng nghiệp vụ thực tế**:
   - **Đối tác Nhà hàng (`RESTAURANT_MANAGER`, `RESTAURANT_STAFF`)**: Là nhân sự thuộc chuỗi đối tác ẩm thực (Pizza 4P's, Haidilao...), không phải nhân viên xưởng giặt. Ẩn hoàn toàn mục "Chấm công vào/ra ca" (`/van-hanh/cham-cong`) và "Phiếu lương cá nhân" (`/van-hanh/phieu-luong`). Chỉ thao tác duy nhất tại "Cổng Nhà Hàng" (`/van-hanh/restaurant-*/nha-hang`) và chức năng Phê duyệt nhân viên nhà hàng của chi nhánh.
   - **Tài xế giao nhận (`SHIPPER`)**: Đang di chuyển ngoài đường, không cần chấm công camera selfie cá nhân. Ẩn chức năng chấm công thủ công khỏi menu và Mobile Bottom Bar.
   - **Tài khoản Quản lý / Văn phòng (`WAREHOUSE_MANAGER`, `ACCOUNTANT`, `MANAGER`, `ADMIN`)**: Không yêu cầu chấm công camera selfie cá nhân. Ẩn menu `cham-cong` và nút "Điểm danh ca" trên Dashboard.
   - **Thợ xưởng (`WORKER`)**: Là đối tượng duy nhất bắt buộc chấm công camera selfie (`cham-cong`) để mở ca làm việc trước khi chấm khoán sản lượng gấp/ủi/đóng gói.
2. **Cơ chế Tự động Chấm công cho Shipper khi ký phiếu giao nhận**:
   - Khi Shipper thao tác ký xác nhận giao nhận chuyến đầu tiên trong ngày (chuyển trạng thái phiếu sang `IN_TRANSIT` tại API `PATCH /handover/:id/deliver`), Backend tự động kích hoạt tạo bản ghi chấm công ngày hôm đó (`status: AttendanceStatus.OPEN`, `note: 'Tự động check-in qua phiếu giao nhận <recordCode>'`, `photoId: 'AUTO_HANDOVER_SIGN'`) nếu Shipper chưa có bản ghi chấm công nào trong ngày (`dateKey`).

### 1.2. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `be-nestjs-thanhxuan/src/modules/internal/attendance/attendance.service.ts` | Edit | Bổ sung hàm `ensureCheckInForShipper(shipperId: string, recordCode: string)` |
| `be-nestjs-thanhxuan/src/modules/internal/handover/handover.module.ts` | Edit | Import `AttendanceModule` vào `HandoverModule` |
| `be-nestjs-thanhxuan/src/modules/internal/handover/handover.service.ts` | Edit | Gọi `ensureCheckInForShipper` khi shipper xác nhận giao hàng (`deliver`) |
| `be-nestjs-thanhxuan/src/modules/internal/handover/handover.service.spec.ts` | Edit | Bổ sung mock cho `AttendanceService` trong unit test |
| `fe-react-thanhxuan-internal/src/components/layout/nav-config.ts` | Edit | Giới hạn quyền `cham-cong` chỉ cho `WORKER`, loại bỏ `phieu-luong` với Nhà hàng, tinh gọn `getMobileQuickNavItems` |
| `fe-react-thanhxuan-internal/src/app/(internal)/van-hanh/cham-cong/page.tsx` | Edit | Bọc `ProtectedRoute` giới hạn `allowedRoles={[StaffRole.WORKER, StaffRole.ADMIN]}` |
| `fe-react-thanhxuan-internal/src/features/dashboard/DashboardPage.tsx` | Edit | Ẩn nút "Điểm danh ca" đối với các vai trò không phải `WORKER` |
| `.agents/skills/create-react-feature/SKILL.md` | Edit | Cập nhật phân quyền ma trận route cho `cham-cong` và `phieu-luong` |

---

## 2. Technical Approach

### 2.1. Backend: Tự động Check-in cho Shipper
1. Trong `AttendanceService`:
   ```ts
   async ensureCheckInForShipper(shipperId: string, recordCode: string): Promise<AttendanceRecordDocument | null> {
     const now = new Date();
     const dateKey = toDateKey(now);
     const existing = await this.attendanceRepo.findByWorkerAndDateKey(shipperId, dateKey);
     if (existing) {
       return existing;
     }

     return this.attendanceRepo.create({
       workerId: new Types.ObjectId(shipperId) as any,
       dateKey,
       check_in: {
         at: now,
         photoId: 'AUTO_HANDOVER_SIGN',
         note: `Tự động check-in qua phiếu giao nhận ${recordCode}`,
       },
       workedMinutes: 0,
       day_type: DayType.NORMAL,
       status: AttendanceStatus.OPEN,
     });
   }
   ```
2. Trong `HandoverService.deliver()`:
   ```ts
   if (actor.role === StaffRole.SHIPPER) {
     await this.attendanceService.ensureCheckInForShipper(actor.sub, record.recordCode);
   }
   ```
   Cơ chế này đảm bảo idempotent: chuyến thứ 2, thứ 3 trong ngày của cùng một tài xế sẽ không tạo trùng ca vì `findByWorkerAndDateKey` phát hiện đã có ca của ngày đó.

### 2.2. Frontend: Tinh gọn Phân quyền Menu & UI
1. Trong `nav-config.ts`:
   - `cham-cong`: `roles: [StaffRole.WORKER]` (chỉ Thợ xưởng hiển thị menu Chấm công selfie).
   - `phieu-luong`: `roles: [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.ACCOUNTANT, StaffRole.WORKER, StaffRole.SHIPPER, StaffRole.WAREHOUSE_MANAGER]` (loại bỏ hoàn toàn `RESTAURANT_MANAGER` và `RESTAURANT_STAFF`).
   - `getMobileQuickNavItems(role)`:
     - `SHIPPER`: Giao Nhận (`/van-hanh/shipper/giao-nhan`), Xăng Xe (`/van-hanh/shipper/xang`), Lương (`/van-hanh/phieu-luong`).
     - `RESTAURANT_STAFF`: Nhà Hàng (`/van-hanh/restaurant-staff/nha-hang`).
     - `RESTAURANT_MANAGER`: Nhà Hàng (`/van-hanh/restaurant-manager/nha-hang`), Phê Duyệt NV (`/quan-ly/phe-duyet`).
     - `WAREHOUSE_MANAGER`: Tổng Quan, Kho Sạch, Giao Nhận.
     - `ACCOUNTANT`: Tổng Quan, Báo Cáo, Bảng Lương, Duyệt Xăng.
     - `ADMIN` / `MANAGER`: Tổng Quan, Điều Hành, Giao Nhận.
     - `WORKER`: Khoán Việc, Chấm Công, Lương.
2. Trong `van-hanh/cham-cong/page.tsx`:
   Bọc `<ProtectedRoute allowedRoles={[StaffRole.WORKER, StaffRole.ADMIN]}>`. Nếu các vai trò khác cố ý truy cập URL này, hệ thống sẽ tự động chuyển hướng về trang chủ theo vai trò của họ.
3. Trong `DashboardPage.tsx`:
   Chỉ render nút `<Button onClick={() => navigate('/van-hanh/cham-cong')}>Điểm danh ca</Button>` khi `user?.role === StaffRole.WORKER`.

---

## 3. Implementation Tasks (Checklist)

### Giai đoạn 1: Backend Shipper Auto Check-in
- [x] T1: [Backend] Cập nhật `AttendanceService` bổ sung method `ensureCheckInForShipper(shipperId, recordCode)` - Depends on: none
- [x] T2: [Backend] Import `AttendanceModule` vào `HandoverModule` - Depends on: T1
- [x] T3: [Backend] Cập nhật `HandoverService.deliver()` gọi `ensureCheckInForShipper` khi shipper xác nhận giao hàng và cập nhật unit test `handover.service.spec.ts` - Depends on: T2

### Giai đoạn 2: Frontend Tinh gọn Menu & Phân quyền
- [x] T4: [Frontend] Cập nhật `src/components/layout/nav-config.ts`: giới hạn `cham-cong` cho `WORKER`, bỏ `phieu-luong` cho nhà hàng, cập nhật `getMobileQuickNavItems` - Depends on: none
- [x] T5: [Frontend] Cập nhật `src/app/(internal)/van-hanh/cham-cong/page.tsx`: bọc `ProtectedRoute` với `allowedRoles={[StaffRole.WORKER, StaffRole.ADMIN]}` - Depends on: none
- [x] T6: [Frontend] Cập nhật `src/features/dashboard/DashboardPage.tsx`: ẩn nút "Điểm danh ca" khi người dùng không phải `WORKER` - Depends on: none
- [x] T7: [Tài liệu] Đồng bộ tài liệu `create-react-feature/SKILL.md` và `SRS_SDD.md` - Depends on: T4, T5, T6

---

## 4. Verification & Testing

### 4.1. Lệnh kiểm thử
1. Backend (`be-nestjs-thanhxuan/`):
   ```bash
   pnpm test
   pnpm build
   ```
2. Frontend (`fe-react-thanhxuan-internal/`):
   ```bash
   pnpm exec tsc --noEmit
   pnpm build
   ```

### 4.2. Kịch bản kiểm chứng
1. Đăng nhập tài khoản `RESTAURANT_STAFF` / `RESTAURANT_MANAGER`:
   - Sidebar và Drawer chỉ hiển thị cổng Nhà Hàng (và duyệt tài khoản với Manager).
   - Không xuất hiện menu "Chấm công" hay "Phiếu lương".
2. Đăng nhập tài khoản `SHIPPER`:
   - Menu không còn mục "Chấm công".
   - Khi ký nhận phiếu giao nhận đầu tiên trong ngày, kiểm tra CSDL xuất hiện bản ghi chấm công `status: OPEN` ghi nhận check-in.
3. Đăng nhập tài khoản `WAREHOUSE_MANAGER`, `ACCOUNTANT`, `MANAGER`, `ADMIN`:
   - Menu và Dashboard không còn hiển thị nút Chấm công selfie.
4. Đăng nhập tài khoản `WORKER`:
   - Vẫn hiển thị đầy đủ chức năng Chấm công camera selfie để mở ca làm việc.

---

## 5. Definition of Done
1. Toàn bộ các vai trò hiển thị menu tinh gọn, không còn chức năng dư thừa.
2. Shipper tự động được ghi nhận check-in khi xử lý chuyến giao nhận đầu tiên trong ngày.
3. Test và build pass 100% ở cả 2 ứng dụng Backend và Frontend.
4. Tài liệu kỹ thuật được cập nhật đồng bộ.

---

## 6. Execution Log
- **2026-10-05**:
  - Hoàn tất T1-T3: Backend tự động ghi nhận check-in cho Shipper khi giao nhận chuyến đầu tiên trong ngày qua `ensureCheckInForShipper`, idempotent không tạo trùng ca. Bổ sung unit test cho cả `attendance.service.spec.ts` và `handover.service.spec.ts` (194 tests pass 100%). Build pass `nest build`.
  - Hoàn tất T4-T6: Frontend tinh gọn toàn bộ menu Sidebar/Drawer/BottomBar cho Nhà hàng, Quản lý, Kế toán, Tài xế; chỉ hiển thị Chấm công cho Thợ xưởng `WORKER`. Bọc `ProtectedRoute` và ẩn nút điểm danh trên Dashboard. Typecheck và Vite build pass 100%.
  - Hoàn tất T7: Đồng bộ tài liệu `create-react-feature/SKILL.md`, `SRS_SDD.md` (Document History) và `CHANGELOG.md`.

---

## Changelog
- 2026-10-05: Khởi tạo & hoàn thành Plan 13 - Tinh gọn Phân quyền Menu & Cơ chế Tự động Chấm công cho Shipper.
