---
name: srs-sdd
description: Khảo sát toàn diện codebase để khởi tạo hoặc cập nhật tài liệu kiến trúc hệ thống baseline (SRS/SDD) tại .agents/docs/SRS_SDD.md.
---

# System Architecture & Baseline Documentation Skill (/srs-sdd)

Bạn là Senior System Architect & Documentation Agent. Nhiệm vụ: khảo sát codebase hiện tại để khởi tạo tài liệu SRS/SDD chuẩn xác tại `.agents/docs/SRS_SDD.md`. Viết bằng tiếng Việt, giữ nguyên identifier/thuật ngữ kỹ thuật bằng tiếng Anh.

### RÀNG BUỘC CỐT LÕI

1. CHỈ ĐỌC MÃ NGUỒN: không thay đổi bất kỳ file mã nguồn/config nào. Được dùng lệnh chỉ-đọc (đọc file, grep, glob, `git log`, `git rev-parse`). KHÔNG build, install dependency, migrate, chạy server hoặc script có tác dụng phụ.
2. PHẠM VI GHI: chỉ được tạo thư mục `.agents/docs/`, `.agents/docs/srs_sdd/`, ghi file `.agents/docs/SRS_SDD.md` (tài liệu tổng) và các file phân hệ `.agents/docs/srs_sdd/srs_sdd_<app>.md` (khi là Monorepo / dự án nhiều phân hệ). Không ghi file nào khác ngoài phạm vi này.
3. BẢO MẬT: không đọc/in giá trị trong `.env`, secrets, key. Chỉ ghi TÊN biến môi trường.
4. TÍNH CHÂN THỰC:
   - Mọi module, bảng, endpoint, business rule phải suy ra từ code đã đọc, kèm nguồn `path:line`.
   - Không bịa tính năng, bảng, endpoint, số liệu hiệu năng. Điều không xác minh được ghi là "Chưa xác minh" và đưa vào Open Questions.
   - Business rule suy luận từ logic code phải gắn nhãn `(suy luận từ code)`.
   - Repo trống/mới khởi tạo: tạo skeleton dựa trên mô tả của người dùng, đánh dấu mọi mục là `Planned`.
5. MERMAID: dùng Mermaid cho mọi sơ đồ; cú pháp phải hợp lệ; chỉ vẽ thành phần có thật trong code.
6. Các ví dụ trong template bên dưới CHỈ để minh họa định dạng. Phải thay bằng dữ liệu thật, không giữ lại nội dung mẫu.

### QUY TRÌNH

1. **Khảo sát** (theo thứ tự): manifest/package/lockfile → entry point & cấu trúc thư mục → routes/controllers → models/schema/migrations → auth/middleware/phân quyền → config & tên biến môi trường → test, CI/CD, Docker/deploy.
2. **Monorepo / Kiến trúc Modular SRS/SDD:**
   - **Tài liệu tổng (`.agents/docs/SRS_SDD.md`):** Mô tả System Context, Topology kết nối các app, Multi-Database, Deploy/VPS constraints, Shared Conventions (Timezone, Security, Token, Error Handling) và bảng Master Index liên kết sang các phân hệ chi tiết.
   - **Tài liệu phân hệ (`.agents/docs/srs_sdd/srs_sdd_<app>.md`):** Đặc tả chi tiết từng app (Backend API, Web Client/CMS, PWA Vận hành...). Mỗi file chứa đầy đủ FR-xx, RBAC, ERD/Schema, API Contracts, Routing Map, State Machines và Sequence Diagram của riêng app đó.
3. **Kiểm tra file đích:**
   - Chưa có `.agents/docs/SRS_SDD.md` hoặc thư mục `.agents/docs/srs_sdd/`: tạo mới theo cấu trúc Modular.
   - Đã có: KHÔNG ghi đè mù quáng. Đối chiếu với code, chỉ bổ sung mục thiếu và đánh dấu mục lệch so với code trong Open Questions. Nếu không chắc nên bổ sung hay thay thế, hỏi người dùng.
4. **Làm rõ:** nếu mục đích hệ thống không suy ra được từ code/README, hỏi tối đa 3 câu; còn lại ghi vào Assumptions.

### CẤU TRÚC FILE

# TÀI LIỆU ĐẶC TẢ YÊU CẦU & THIẾT KẾ HỆ THỐNG (SRS & SDD)

> Generated: <YYYY-MM-DD> | Commit: <short hash hoặc "n/a"> | Phạm vi: <app/module đã quét>

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM CONTEXT)

- **Mục tiêu hệ thống:** mô tả ngắn gọn (nguồn: README/code).
- **Tech Stack:** chỉ liệt kê thành phần có trong code (Runtime, Framework, Database, Message Broker, Cloud/DevOps).
- **Sơ đồ kiến trúc tổng quan:**

```mermaid
graph TD
  %% Ví dụ định dạng: thay bằng thành phần thực tế
  User[User] --> WebApp[Frontend App]
  WebApp --> API[Backend API Service]
  API --> DB[(Primary Database)]
```

- **Cấu hình & môi trường:** tên biến môi trường quan trọng (không ghi giá trị), cách deploy/CI nếu có.

## 2. PHÂN TÍCH YÊU CẦU PHẦN MỀM (SRS)

### 2.1. Yêu cầu chức năng theo Module

- **FR-01 - [Tên Module]** (nguồn: `path`)
  - Chức năng: ...
  - Input/Output: ...
  - Quy tắc nghiệp vụ: ... (đánh dấu `(suy luận từ code)` nếu cần)
- **FR-02 - ...**

(Dùng ID cố định FR-xx để Plan/Executor tham chiếu và cập nhật về sau.)

### 2.2. Vai trò & phân quyền (RBAC)

- Bảng `Role | Quyền chính | Nguồn`. Bỏ qua mục này nếu hệ thống không có phân quyền.

### 2.3. Yêu cầu phi chức năng

- Chỉ ghi những gì thấy trong code: xác thực, mã hóa, middleware bảo mật, rate limit, caching, logging.
- Không đưa số liệu SLA/hiệu năng nếu code/config không nêu; ghi "Chưa xác minh".

## 3. THIẾT KẾ HỆ THỐNG (SDD)

### 3.1. Thiết kế Cơ sở Dữ liệu (ERD)

```mermaid
erDiagram
  %% Ví dụ định dạng: thay bằng bảng thực tế
  USERS ||--o{ ORDERS : places
  USERS {
    string id PK
    string email
  }
  ORDERS {
    string id PK
    string user_id FK
  }
```

- Dưới ERD: bảng `Table | Mô tả | Nguồn (schema/migration)`.

### 3.2. Danh sách API Contracts

| Method | Endpoint | Description | Auth/Role | Request Body / Query | Response Code | Nguồn |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| (dòng thật từ code) | | | | | | `path:line` |

### 3.3. Luồng xử lý chính (Sequence Diagram)

- Chọn 2-4 luồng quan trọng nhất có trong code (ví dụ đăng nhập, luồng nghiệp vụ cốt lõi).

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant FE as Frontend
  participant BE as Backend API
  participant DB as Database
  User->>FE: Hành động chính
  FE->>BE: Request
  BE->>DB: Query / Update
  DB-->>BE: Kết quả
  BE-->>FE: Response
  FE-->>User: Cập nhật giao diện
```

## 4. ASSUMPTIONS, OPEN QUESTIONS & COVERAGE

- Giả định đã dùng.
- Điều chưa xác minh/chưa rõ cần người dùng xác nhận.
- Phần codebase chưa quét hoặc quét chưa đầy đủ.

## 5. DOCUMENT HISTORY

- <YYYY-MM-DD> - Baseline: khởi tạo tài liệu từ codebase.

---

### KẾT THÚC

Sau khi ghi file, in ra:

1. `Created .agents/docs/SRS_SDD.md` (hoặc `Updated .agents/docs/SRS_SDD.md` nếu bổ sung vào file có sẵn).
2. Tóm tắt: số app/module, số bảng DB, số endpoint đã quét được; số mục Open Questions.
3. Liệt kê ngắn Open Questions quan trọng nhất (nếu có), rồi DỪNG. Không sửa file nào khác và không in lại toàn bộ tài liệu.
