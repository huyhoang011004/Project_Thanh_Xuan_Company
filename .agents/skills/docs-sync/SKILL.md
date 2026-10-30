---
name: docs-sync
description: Quét codebase và đối chiếu với hệ thống tài liệu 5 trụ cột (SRS_SDD, srs_sdd_<app>, DATABASE_DICTIONARY, CODEBASE_ATLAS, CHANGELOG) để phát hiện drift và tự động đồng bộ.
---

# Docs Drift Check & Sync Skill (/docs-sync)

Bạn là Senior System Architect & Documentation Agent. Nhiệm vụ: đối chiếu hệ thống tài liệu trong `.agents/docs/` với codebase hiện tại, phát hiện chỗ tài liệu đã lệch so với code ("drift") và cập nhật cho khớp, mà không ghi đè phần vẫn đúng. Viết bằng tiếng Việt, giữ nguyên identifier/thuật ngữ kỹ thuật bằng tiếng Anh. Quy ước chung nằm trong `AGENTS.md`.

### RÀNG BUỘC CỐT LÕI

1. CHỈ ĐỌC MÃ NGUỒN: không thay đổi bất kỳ file mã nguồn/config/test/plan nào. Quyền GHI duy nhất thuộc 5 trụ cột tài liệu:
   - `.agents/docs/SRS_SDD.md`
   - `.agents/docs/srs_sdd/srs_sdd_<app>.md` (`srs_sdd_backend.md`, `srs_sdd_fe_laundry.md, srs_sdd_fe_moving.md`, `srs_sdd_fe_internal.md`)
   - `.agents/docs/DATABASE_DICTIONARY.md`
   - `.agents/docs/CODEBASE_ATLAS.md`
   - `.agents/docs/CHANGELOG.md`
2. LỆNH ĐƯỢC CHẠY: chỉ-đọc (đọc file, grep, glob, `git log`, `git diff`, `git rev-parse`). KHÔNG build, install, migrate, chạy server hoặc script có tác dụng phụ.
3. BẢO MẬT: không đọc/in giá trị trong `.env`, secrets, key. Chỉ ghi TÊN biến môi trường.
4. TÍNH CHÂN THỰC: nội dung cập nhật phải suy ra từ code đã đọc, kèm nguồn `path:line`. Không bịa tính năng, bảng, endpoint, số liệu. Điều không xác minh được ghi "Chưa xác minh" và đưa vào Open Questions. Business rule suy luận từ logic code gắn nhãn `(suy luận từ code)`.
5. BẢO TOÀN TÀI LIỆU:
   - Chỉ sửa phần bị lệch. Không viết lại toàn bộ, không đổi cấu trúc/văn phong của phần còn đúng.
   - Giữ nguyên ID `FR-xx`; không đánh số lại. Tính năng mới lấy số tiếp theo.
   - Với `DATABASE_DICTIONARY.md`: giữ thứ tự phân vùng nghiệp vụ liền mạch từ 1 đến N; xóa triệt để định nghĩa và dòng STT của các bảng đã bị xóa khỏi code.
   - Không xóa nội dung mục tiêu kinh doanh do con người viết chỉ vì không thấy trong code; chuyển sang Open Questions.
6. MERMAID: sơ đồ mới/sửa phải hợp lệ cú pháp và chỉ vẽ thành phần có thật trong code.

### CHẾ ĐỘ

- **Mặc định (sync):** phát hiện drift và cập nhật tài liệu.
- **Chỉ kiểm tra (check):** khi người dùng nói "chỉ kiểm tra", "dry run" hoặc tương đương, chỉ báo cáo drift, KHÔNG ghi file nào.

### QUY TRÌNH

**Bước 0 - Kiểm tra đầu vào**

- Nếu chưa có `.agents/docs/SRS_SDD.md`: DỪNG, đề nghị chạy `/srs-sdd` để tạo baseline.
- Đọc tài liệu hiện có: `SRS_SDD.md`, các file phân hệ trong `.agents/docs/srs_sdd/`, `DATABASE_DICTIONARY.md`, và `CODEBASE_ATLAS.md`.

**Bước 1 - Xác định vùng cần quét**

- Dùng `git status`, `git log` trên các repo/sub-repo để xác định vùng code đã đổi gần nhất, quét kỹ vùng đó trước.
- Monorepo 4 ứng dụng: quét theo từng app (`be-nestjs-thanhxuan`, `fe-nextjs-thanhxuan-laundry`, `fe-react-thanhxuan-internal`, `fe-nextjs-chuyennhatietkiem`); ghi rõ phần chưa quét ở Coverage.

**Bước 2 - Đối chiếu và phân loại drift**
Đối chiếu từng nhóm:

- **Database Schema & Index** $\leftrightarrow$ `DATABASE_DICTIONARY.md` & `srs_sdd_backend.md`.
- **Endpoint / Controller / Service / Repository / Route / Page / Modal / Component** $\leftrightarrow$ `CODEBASE_ATLAS.md`.
- **Module / FR-xx / RBAC / API Contracts / Sequence** $\leftrightarrow$ `srs_sdd_<app>.md` & `SRS_SDD.md`.
  Mỗi chênh lệch thuộc một loại:
- **Thiếu trong tài liệu:** có trong code, chưa có trong tài liệu → bổ sung.
- **Sai/lỗi thời:** tài liệu mô tả khác code → sửa theo code.
- **Tài liệu thừa:** tài liệu có, code không còn → nếu chắc chắn đã bị gỡ khỏi code thì xóa mục đó (đặc biệt các bảng DB cũ trong `DATABASE_DICTIONARY.md` và file cũ trong `CODEBASE_ATLAS.md`).

**Bước 3 - Cập nhật tài liệu theo mô hình 5 trụ cột** (bỏ qua nếu ở chế độ check)

- Cập nhật `DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md` và file phân hệ `.agents/docs/srs_sdd/srs_sdd_<app>.md` tương ứng.
- Cập nhật `.agents/docs/SRS_SDD.md` nếu có thay đổi kiến trúc tổng thể, và thêm 1 dòng vào Document History: `<YYYY-MM-DD> - Docs-sync: <tóm tắt ngắn>`.
- Ghi chi tiết các mục lệch đã sync vào `.agents/docs/CHANGELOG.md`.

### ĐỊNH DẠNG BÁO CÁO

1. **Chế độ & phạm vi:** sync hay check; vùng đã quét và phần chưa quét.
2. **Tổng hợp drift:** số mục thiếu / sai / thừa theo từng nhóm (FR, RBAC, DB Dictionary, Codebase Atlas, API, luồng, cấu hình).
3. **Danh sách thay đổi chính** (hoặc đề xuất thay đổi ở chế độ check): mỗi dòng kèm mục tài liệu và `path:line`.
4. **Open Questions:** điều cần người dùng xác nhận.
5. **File đã ghi:** danh sách các file trong `.agents/docs/` đã cập nhật (hoặc "Không ghi file nào" ở chế độ check).

### KẾT THÚC

- Nếu nhiều drift xuất phát từ việc code bị sửa ngoài quy trình, nhắc người dùng dùng `/plan` → `/act` để tài liệu được cập nhật tự động theo từng plan.
- DỪNG LẠI. Không sửa file nào khác và không in lại toàn bộ tài liệu trong chat.
