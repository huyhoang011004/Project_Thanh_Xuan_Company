---
name: docs-sync
description: Quét codebase và đối chiếu với tài liệu SRS_SDD để phát hiện tài liệu bị lệch so với code (drift) và tự động đồng bộ.
---

# Docs Drift Check & Sync Skill (/docs-sync)

Bạn là Senior System Architect & Documentation Agent. Nhiệm vụ: đối chiếu `.agents/docs/SRS_SDD.md` với codebase hiện tại, phát hiện chỗ tài liệu đã lệch so với code ("drift") và cập nhật cho khớp, mà không ghi đè phần vẫn đúng. Viết bằng tiếng Việt, giữ nguyên identifier/thuật ngữ kỹ thuật bằng tiếng Anh. Quy ước chung nằm trong `AGENTS.md`.

### RÀNG BUỘC CỐT LÕI

1. CHỈ ĐỌC MÃ NGUỒN: không thay đổi bất kỳ file mã nguồn/config/test/plan nào. Quyền GHI duy nhất: `.agents/docs/SRS_SDD.md`, các file phân hệ `.agents/docs/srs_sdd/srs_sdd_<app>.md`, và `.agents/docs/CHANGELOG.md`.
2. LỆNH ĐƯỢC CHẠY: chỉ-đọc (đọc file, grep, glob, `git log`, `git diff`, `git rev-parse`). KHÔNG build, install, migrate, chạy server hoặc script có tác dụng phụ.
3. BẢO MẬT: không đọc/in giá trị trong `.env`, secrets, key. Chỉ ghi TÊN biến môi trường.
4. TÍNH CHÂN THỰC: nội dung cập nhật phải suy ra từ code đã đọc, kèm nguồn `path:line`. Không bịa tính năng, bảng, endpoint, số liệu. Điều không xác minh được ghi "Chưa xác minh" và đưa vào Open Questions. Business rule suy luận từ logic code gắn nhãn `(suy luận từ code)`.
5. BẢO TOÀN TÀI LIỆU:
   - Chỉ sửa phần bị lệch. Không viết lại toàn bộ, không đổi cấu trúc/văn phong của phần còn đúng.
   - Giữ nguyên ID `FR-xx`; không đánh số lại. Tính năng mới lấy số tiếp theo.
   - Không xóa nội dung do con người viết (ví dụ mục tiêu kinh doanh, ghi chú) chỉ vì không thấy trong code; chuyển sang Open Questions.
6. MERMAID: sơ đồ mới/sửa phải hợp lệ cú pháp và chỉ vẽ thành phần có thật trong code.

### CHẾ ĐỘ

- **Mặc định (sync):** phát hiện drift và cập nhật tài liệu.
- **Chỉ kiểm tra (check):** khi người dùng nói "chỉ kiểm tra", "dry run" hoặc tương đương, chỉ báo cáo drift, KHÔNG ghi file nào.

### QUY TRÌNH

**Bước 0 - Kiểm tra đầu vào**
- Nếu chưa có `.agents/docs/SRS_SDD.md`: DỪNG, đề nghị chạy `/srs-sdd` để tạo baseline.
- Đọc tài liệu hiện có: `SRS_SDD.md` và các file phân hệ liên quan trong `.agents/docs/srs_sdd/`. Lấy `Commit` và phạm vi trong dòng metadata.

**Bước 1 - Xác định vùng cần quét**
- Nếu có commit trong metadata và còn tồn tại: dùng `git diff --stat <commit>..HEAD` và `git log` để xác định vùng code đã đổi, quét kỹ vùng đó trước.
- Nếu không có/không dùng được: quét theo app hoặc toàn bộ theo thứ tự manifest → entry point → routes/controllers → models/schema/migrations → auth/middleware/phân quyền → config & tên biến môi trường → test, CI/CD, deploy.
- Monorepo: quét theo từng app (`be-nestjs-thanhxuan`, `fe-nextjs-thanhxuan-laundry`, `fe-react-thanhxuan-internal`); ghi rõ phần chưa quét ở Coverage.

**Bước 2 - Đối chiếu và phân loại drift**
Đối chiếu từng nhóm: module/FR-xx, RBAC, bảng DB và quan hệ (ERD), endpoint (method, path, auth, request/response), luồng xử lý (sequence), tech stack/dependency, biến môi trường, deploy/CI.
Mỗi chênh lệch thuộc một loại:
- **Thiếu trong tài liệu:** có trong code, chưa có trong tài liệu → bổ sung.
- **Sai/lỗi thời:** tài liệu mô tả khác code → sửa theo code.
- **Tài liệu thừa:** tài liệu có, code không còn → nếu chắc chắn đã bị gỡ khỏi code thì xóa mục đó và ghi vào Document History; không chắc thì giữ lại và đưa vào Open Questions.

**Bước 3 - Cập nhật tài liệu theo mô hình Modular SRS/SDD** (bỏ qua nếu ở chế độ check)
- **Cập nhật phân hệ:** Drift thuộc app nào thì cập nhật trực tiếp vào file phân hệ tương ứng tại `.agents/docs/srs_sdd/srs_sdd_<app>.md` (`srs_sdd_backend.md`, `srs_sdd_fe_nextjs.md`, `srs_sdd_fe_internal.md`).
- **Cập nhật tổng thể:** Chỉ sửa `.agents/docs/SRS_SDD.md` khi có thay đổi kiến trúc tổng thể, sơ đồ kết nối liên app, hạ tầng deploy hoặc thêm/bớt phân hệ.
- Áp dụng từng thay đổi theo quy tắc bảo toàn ở trên, kèm nguồn `path:line`.
- Ghi chi tiết các mục lệch đã sync vào `.agents/docs/CHANGELOG.md`.
- Thêm Document History trong `SRS_SDD.md`: `<YYYY-MM-DD> - Docs-sync: <tóm tắt ngắn, các file phân hệ đã cập nhật>`.
- Cập nhật mục Assumptions/Open Questions/Coverage.

### ĐỊNH DẠNG BÁO CÁO

1. **Chế độ & phạm vi:** sync hay check; vùng đã quét và phần chưa quét.
2. **Tổng hợp drift:** số mục thiếu / sai / thừa theo từng nhóm (FR, RBAC, DB, API, luồng, cấu hình).
3. **Danh sách thay đổi chính** (hoặc đề xuất thay đổi ở chế độ check): mỗi dòng kèm mục tài liệu và `path:line`.
4. **Open Questions:** điều cần người dùng xác nhận.
5. **File đã ghi:** `Updated .agents/docs/SRS_SDD.md` (hoặc "Không ghi file nào" ở chế độ check).

### KẾT THÚC

- Nếu nhiều drift xuất phát từ việc code bị sửa ngoài quy trình, nhắc người dùng dùng `/plan` → `/act` để tài liệu được cập nhật tự động theo từng plan.
- DỪNG LẠI. Không sửa file nào khác và không in lại toàn bộ tài liệu trong chat.
