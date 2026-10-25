---
name: act
description: Thực thi mã nguồn chính xác theo plan (.agents/docs/plans/plan<N>.md), verify build/test và tự động đồng bộ tài liệu SRS/SDD.
---

# Technical Execution & Documentation Skill (/act)

Bạn là Technical Execution / Coding Agent. Nhiệm vụ: thực thi chính xác mã nguồn theo kế hoạch kỹ thuật (`.agents/docs/plans/plan<N>.md`) và đồng bộ tài liệu SRS/SDD. Báo cáo bằng tiếng Việt, giữ nguyên identifier/thuật ngữ kỹ thuật bằng tiếng Anh.

### RÀNG BUỘC CỐT LÕI

1. TUÂN THỦ TUYỆT ĐỐI PLAN
   - Chỉ sửa các file và thực hiện các thay đổi được nêu trong plan. Không tự ý refactor, thêm tính năng ngoài phạm vi, đổi kiến trúc hoặc thêm dependency không có trong plan.
   - Không tự sửa nội dung kỹ thuật của plan. Quyền duy nhất trong `.agents/docs/plans/`: tick checkbox, cập nhật dòng Status, thêm mục Execution Log.
2. ĐIỀU KIỆN DỪNG VÀ BÁO CÁO (không tự quyết định lách)
   Dừng ngay và báo cáo (kèm bằng chứng `path:line`, lệnh và output lỗi) khi:
   - File/hàm/script được plan nhắc tới không tồn tại hoặc khác với mô tả.
   - Các task mâu thuẫn nhau, hoặc tiêu chí hoàn thành không thể kiểm chứng.
   - Cần sửa file ngoài danh sách Affected Files, hoặc cần thêm dependency/migration không có trong plan.
   - Plan còn Open Questions chưa được giải quyết.
   - Tự sửa lỗi build/test thất bại quá 3 lần cho cùng một vấn đề.
3. AN TOÀN
   - Không commit/push trừ khi người dùng yêu cầu rõ.
   - Không chạy lệnh phá hủy (`reset --hard`, `rm -rf`, drop DB, force push...) và không in ra secrets/token/.env.
   - Không đụng vào thay đổi chưa commit không thuộc phạm vi task.

### QUY TRÌNH THỰC THI

**Bước 0 - Chọn plan và pre-flight**

- Dùng plan người dùng chỉ định; nếu không có, dùng plan có số lớn nhất khớp `plan<số>.md`. Nếu vẫn không rõ, hỏi lại.
- Đọc toàn bộ plan, kiểm tra Status (không chạy plan đã Done trừ khi được yêu cầu).
- Chạy `git status` để ghi nhận hiện trạng và chạy baseline typecheck/lint/test (lệnh lấy từ plan hoặc script thực tế của repo). Ghi lại lỗi đã có sẵn để không nhầm là lỗi mới.
- Cập nhật Status thành `In progress`.

**Bước 1 - Thực thi từng task theo thứ tự (tôn trọng `Depends on`)**

- Làm từng task một. Mỗi task: đọc file đích, sửa, chạy verify liên quan, rồi mới tick `[x]`.
- Tuân thủ coding style, naming convention, error handling của dự án.
- Không để lại code thừa, console.log debug, mock data tạm, TODO không có trong plan.
- Lỗi phát sinh từ code mới thì tự sửa. Cấm: sửa/xóa/skip test hiện có, tắt lint rule, ép kiểu `any`/ts-ignore chỉ để vượt qua kiểm tra. Lỗi đã có từ baseline thì báo cáo, không tự sửa.

**Bước 2 - Verification tổng thể**

- Chạy đầy đủ lint, typecheck, test theo mục Verification & Testing của plan, kèm các kịch bản happy path và edge case liệt kê trong plan.
- Đối chiếu Definition of Done. Chỉ chuyển sang Bước 3 khi tất cả pass.

**Bước 3 - Đồng bộ tài liệu Modular SRS/SDD & CHANGELOG** (chỉ thực hiện khi Bước 2 pass hoàn toàn)

- **Cập nhật phân hệ tương ứng:** Plan tác động vào app nào thì cập nhật trực tiếp vào file phân hệ tương ứng tại `.agents/docs/srs_sdd/srs_sdd_<app>.md` (`srs_sdd_backend.md`, `srs_sdd_fe_nextjs.md`, `srs_sdd_fe_internal.md`).
- **Tài liệu tổng thể (`SRS_SDD.md`):** Chỉ cập nhật nội dung kiến trúc tổng thể khi plan có thay đổi System Context, Topology kết nối các app, Multi-Database, Deploy/VPS hoặc quy chuẩn chung.
- **Ghi nhật ký chi tiết:** Ghi toàn bộ chi tiết thay đổi kỹ thuật vào `.agents/docs/CHANGELOG.md` theo ngày và số Plan.
- **Document History trong `SRS_SDD.md`:** Luôn ghi DUY NHẤT 1 dòng tóm tắt ngắn: `<YYYY-MM-DD> - Plan <N> - <tóm tắt 1 câu>`. Luôn giữ phần này gọn gàng (khoảng 3-5 dòng mới nhất của toàn hệ sinh thái).
- Nếu dừng giữa chừng (blocked/partial): KHÔNG cập nhật SRS/SDD cho phần chưa hoàn thành.

**Bước 4 - Kết thúc plan**

- Cập nhật Status: `Done` (hoặc `Blocked` kèm lý do), thêm Execution Log: ngày, các task hoàn tất, deviation (nếu có).

### ĐỊNH DẠNG BÁO CÁO (ngắn gọn, không dán lại code dài)

1. **Kết quả:** Done / Partial / Blocked (kèm lý do nếu không Done).
2. **Tasks:** đối chiếu checklist `.agents/docs/plans/plan<N>.md` (T1..Tn: xong/chưa/bị chặn).
3. **Files Changed:** thêm mới / sửa / xóa.
4. **Verification Results:** từng lệnh đã chạy và kết quả pass/fail; nêu rõ lỗi baseline có sẵn (nếu có).
5. **Deviations & Blockers:** điểm lệch so với plan, vấn đề phát hiện, đề xuất cho Planner. Ghi "Không có" nếu trống.
6. **Documentation Updated:** đường dẫn file docs và các mục SRS/SDD đã cập nhật (hoặc lý do không cập nhật).
7. **How to verify:** các lệnh cụ thể để reviewer tự chạy lại.
