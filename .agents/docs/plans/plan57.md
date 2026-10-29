# Plan 57: Cơ Chế Duy Trì Phiên Đăng Nhập Lâu Dài Như Mobile App Cho PWA (Long-Lived Session & Persistent Token Refresh)

> Status: Done | Created: 2026-10-30

## 1. Overview & Affected Files

### 1.1. Mục tiêu & Bối cảnh
- **Bối cảnh nghiệp vụ:** Cổng vận hành nội bộ `fe-react-thanhxuan-internal` được cài đặt dưới dạng PWA trên điện thoại của Tài xế xe tải (Shipper), Thợ xưởng (Worker), Thủ kho và Đối tác. Người dùng cần trải nghiệm "mở app là dùng ngay" (Instant Access) y hệt Native Mobile App, không bị đá ra màn hình đăng nhập mỗi ngày hoặc sau mỗi lần đóng mở ứng dụng.
- **Nguyên nhân gốc rễ (Root Cause) khiến người dùng bị đăng xuất liên tục:**
  1. **Access Token sống quá ngắn (15 phút):** `account-auth.service.ts:183,223` hardcode `expiresIn: '15m'` thay vì dùng cấu hình `jwt.staffExpiresIn` (12h - 24h).
  2. **Refresh Token sống quá ngắn (7 ngày):** `account-auth.helper.ts:14` hardcode `7 * 24 * 60 * 60 * 1000`. Khi thợ hoặc shipper nghỉ phép hoặc ít vào app quá 7 ngày, token chết hoàn toàn.
  3. **Lệch pha State trong React Context:** Khi `api-client.ts` bắt được lỗi 401 và tự động refresh token thành công vào `localStorage`, state `token` trong `AuthContext.tsx` không được đồng bộ, khiến ứng dụng giữ token cũ đã hết hạn.
  4. **Chỉ có cơ chế Refresh phản ứng (Reactive):** Khi mở lại PWA, hàng loạt API bắn ra cùng lúc (`/auth/me`, `/attendance`, `/handovers`), nếu access token hết hạn thì cùng nhận 401, dễ dẫn đến race condition hoặc redirect sang `/login` oan uổng.
  5. **Safari iOS ITP & Android Webview xóa LocalStorage:** Trên iOS Safari PWA, trình duyệt có thể tự dọn dẹp `localStorage` nếu không có tương tác, làm mất sạch token.

### 1.2. Giải pháp kiến trúc toàn diện

1. **Backend (`be-nestjs-thanhxuan`):**
   - **Tăng hạn Access Token & linh hoạt cấu hình:** Chuyển `expiresIn: '15m'` thành `this.configService.get('jwt.staffExpiresIn') || '1d'` (hoặc 12h), giảm tải tần suất refresh cho database và mạng.
   - **Tăng hạn Refresh Token & Cơ chế Sliding Expiration:** Tăng thời hạn Refresh Token lên **60 ngày** (hoặc 90 ngày). Mỗi lần gọi `POST /auth/refresh`, cấp Refresh Token mới với hạn +60 ngày tiếp theo. Miễn là người dùng mở app định kỳ trong vòng 60 ngày, họ **vĩnh viễn không bao giờ phải đăng nhập lại**.
   - Lưu trữ `isMobilePwa: boolean` trong bảng `refresh_tokens` để phân biệt phiên PWA dài hạn.

2. **Frontend (`fe-react-thanhxuan-internal`):**
   - **Lưu trữ bền vững kép (LocalStorage + IndexedDB Fallback):**
     - Tạo module `src/lib/auth-storage.ts` quản lý việc lưu và đọc `staff_token`, `staff_refresh_token`, `staff_user`.
     - Luôn ghi đồng thời vào `localStorage` và `IndexedDB` (thư viện `idb` đã có sẵn). Khi PWA mở lên, nếu `localStorage` bị hệ điều hành dọn sạch, tự động khôi phục ngay từ `IndexedDB` trước khi gọi API.
   - **Cơ chế Silent / Proactive Token Refresh (Chủ động làm mới trước khi hết hạn):**
     - Khi mở lại ứng dụng hoặc khi tab/PWA active trở lại (`visibilitychange` / `window.focus`), kiểm tra thời gian hết hạn (`exp`) của Access Token.
     - Nếu Access Token đã hết hạn hoặc sắp hết hạn (dưới 5 phút), tự động gọi refresh ngầm TRƯỚC KHI các trang con bắn request dữ liệu, loại bỏ hoàn toàn các lỗi 401 gián đoạn.
   - **Đồng bộ sự kiện Refresh Token toàn hệ thống:**
     - `api-client.ts` phát CustomEvent `auth:token-refreshed` khi refresh thành công.
     - `AuthContext.tsx` lắng nghe sự kiện để cập nhật ngay lập tức `setToken(newAccessToken)` trong state React.
   - **Bảo vệ khi Offline (Mất mạng):**
     - Nếu mở PWA khi đang ở hầm xe (mất mạng), không bao giờ tự ý xóa token hoặc đá về `/login` nếu lỗi là lỗi mất kết nối mạng (`!error.response` hoặc status 0). Cho phép người dùng tiếp tục xem dữ liệu offline và thao tác bình thường.

### 1.3. Bảng file ảnh hưởng

| Path | Action | Lý do |
| :--- | :---: | :--- |
| `be-nestjs-thanhxuan/src/modules/internal/auth/helpers/account-auth.helper.ts` | `edit` | Tăng thời hạn Refresh Token lên 60 ngày (Sliding Expiration) |
| `be-nestjs-thanhxuan/src/modules/internal/auth/services/account-auth.service.ts` | `edit` | Dùng cấu hình `jwt.staffExpiresIn` ('1d'/'12h') thay vì hardcode '15m' |
| `fe-react-thanhxuan-internal/src/lib/auth-storage.ts` | `create` | Quản lý lưu trữ bền vững kép LocalStorage + IndexedDB cho PWA |
| `fe-react-thanhxuan-internal/src/lib/api-client.ts` | `edit` | Tích hợp auth-storage, phát sự kiện `auth:token-refreshed`, chống logout oan khi offline |
| `fe-react-thanhxuan-internal/src/features/auth/AuthContext.tsx` | `edit` | Silent refresh khi active PWA, lắng nghe sự kiện token refresh, khôi phục từ IndexedDB |
| `.agents/docs/srs_sdd/srs_sdd_fe_internal.md` | `edit` | Cập nhật tài liệu kiến trúc cơ chế PWA Session |
| `.agents/docs/srs_sdd/srs_sdd_backend.md` | `edit` | Cập nhật thời hạn token và sliding expiration |
| `.agents/docs/CHANGELOG.md` | `edit` | Ghi chép nhật ký nâng cấp Plan 57 |

---

## 2. Kế hoạch triển khai (Task Checklist)

- [x] **T1: Nâng cấp Backend (`be-nestjs-thanhxuan`): Cấu hình thời hạn Access Token (1d) và Refresh Token 60 ngày (Sliding Expiration)**
- [x] **T2: Xây dựng module `auth-storage.ts` trong `fe-react-thanhxuan-internal` (Dual-Storage: LocalStorage + IndexedDB)**
- [x] **T3: Cập nhật `api-client.ts`: Đồng bộ token với `auth-storage`, phát sự kiện `auth:token-refreshed` và bảo vệ phiên khi offline**
- [x] **T4: Nâng cấp `AuthContext.tsx`: Khôi phục phiên từ IndexedDB khi mở PWA, lắng nghe cập nhật token và Proactive Refresh khi quay lại app**
- [x] **T5: Kiểm thử tự động (Verification & Build) cho cả Backend và Frontend Internal**
- [x] **T6: Đồng bộ tài liệu kỹ thuật SRS/SDD & Changelog**

## 3. Execution Log

- **2026-10-30:**
  - Hoàn tất T1: Tăng thời hạn Refresh Token lên 60 ngày trong `account-auth.helper.ts`, cấu hình thời hạn Access Token `1d` trong `auth.module.ts` và `account-auth.service.ts`.
  - Hoàn tất T2: Tạo `src/lib/auth-storage.ts` quản lý lưu trữ đồng thời `localStorage` và `IndexedDB`, kèm bộ giải mã kiểm tra hạn JWT (`isJwtExpired`).
  - Hoàn tất T3: Tích hợp `auth-storage` vào `api-client.ts`, phát CustomEvent `auth:token-refreshed`, bảo toàn session khi offline.
  - Hoàn tất T4: Nâng cấp `AuthContext.tsx` tự động khôi phục từ IndexedDB khi khởi động, silent refresh trước khi token hết hạn, lắng nghe sự kiện `visibilitychange` và `window.focus` khi mở app từ màn hình khóa.
  - Hoàn tất T5: `tsc --noEmit` và `pnpm build` pass 100% cho cả Backend và Frontend Internal.
  - Hoàn tất T6: Đồng bộ `srs_sdd_backend.md`, `srs_sdd_fe_internal.md`, `SRS_SDD.md`, `CODEBASE_ATLAS.md` và `CHANGELOG.md`.
