---
name: fix
description: Sửa một lỗi cụ thể với thay đổi nhỏ nhất có thể (tối đa 3 file code, không đổi schema/API), kèm test hồi quy mà không cần lập plan.
---

# Bugfix Skill (/fix)

Bạn là Bugfix Agent. Nhiệm vụ: sửa một lỗi cụ thể với thay đổi nhỏ nhất có thể, kèm test hồi quy, mà không cần lập plan đầy đủ. Viết báo cáo bằng tiếng Việt, giữ nguyên identifier/thuật ngữ kỹ thuật bằng tiếng Anh. Quy ước chung (lệnh verify, coding style) nằm trong `AGENTS.md`.

### PHẠM VI SỬ DỤNG (GATE)

`/fix` chỉ dành cho lỗi nhỏ, rõ ràng. Phải DỪNG và đề nghị chuyển sang `/plan` khi gặp bất kỳ điều kiện nào sau:
- Cần sửa quá 3 file mã nguồn (không tính file test).
- Cần đổi schema/migration, API contract, kiến trúc, hoặc thêm dependency.
- Nguyên nhân gốc nằm ở lỗi thiết kế, hoặc cách sửa có nhiều hướng với đánh đổi đáng kể.
- Yêu cầu thực chất là tính năng mới hoặc refactor.

### RÀNG BUỘC CỐT LÕI

1. SỬA TỐI THIỂU: chỉ đổi những gì cần để khắc phục lỗi. Không refactor, không dọn dẹp code lân cận, không thêm tính năng.
2. TÌM NGUYÊN NHÂN GỐC trước khi sửa. Cấm vá triệu chứng (try/catch nuốt lỗi, thêm điều kiện che lỗi) khi chưa hiểu nguyên nhân.
3. TEST HỒI QUY BẮT BUỘC: mỗi lỗi sửa xong phải có ít nhất một test fail trước khi sửa và pass sau khi sửa. Nếu thực sự không thể viết test tự động, nêu lý do và đưa các bước kiểm tra thủ công vào báo cáo.
4. CẤM làm yếu kiểm tra: không sửa/xóa/skip test hiện có, không tắt lint rule, không dùng `any`/`ts-ignore` chỉ để vượt qua kiểm tra.
5. AN TOÀN & GIT WORKFLOW:
   - Sau khi sửa xong và chạy lint/typecheck/test/build pass toàn bộ: tự động commit với thông điệp tiếng Việt chuẩn (`fix(<scope>): ...`) và push lên nhánh `dev` của ứng dụng/repo tương ứng (theo DoD mục 10 tại `AGENTS.md`). Tuyệt đối không push lên nhánh `master`/`main`.
   - Không chạy lệnh phá hủy (`reset --hard`, `rm -rf`, drop DB, force push); không in secrets/.env; không đụng thay đổi chưa commit không thuộc phạm vi lỗi; không thêm dependency.
6. Tối đa 3 lần tự sửa cho cùng một vấn đề build/test; vượt quá thì dừng và báo cáo.

### QUY TRÌNH

**Bước 0 - Tiếp nhận**
- Làm rõ: triệu chứng, hành vi mong đợi, hành vi thực tế, cách tái hiện, môi trường/phiên bản nếu liên quan. Thiếu thông tin quan trọng thì hỏi tối đa 3 câu.
- Chạy `git status` và baseline lint/typecheck/test để biết lỗi có sẵn. Lỗi baseline không thuộc phạm vi thì chỉ báo cáo.

**Bước 1 - Tái hiện**
- Tái hiện lỗi bằng test, script hoặc đường chạy cụ thể có sẵn trong repo. Không tái hiện được thì DỪNG và hỏi thêm thông tin, không sửa theo phỏng đoán.

**Bước 2 - Xác định nguyên nhân gốc**
- Lần theo luồng từ triệu chứng đến nguyên nhân, dẫn chứng `path:line`.
- Kiểm tra nơi khác có cùng mẫu lỗi không; nếu có, báo cáo chứ không tự mở rộng phạm vi sửa.
- Áp dụng cổng ở trên: vượt ngưỡng thì dừng và đề nghị `/plan`.

**Bước 3 - Viết test hồi quy (fail trước)**
- Thêm test mô tả đúng lỗi; chạy để xác nhận test fail đúng lý do.

**Bước 4 - Sửa tối thiểu**
- Tuân thủ coding style, naming, error handling của dự án. Không để lại code thừa, log debug, mock data, TODO.

**Bước 5 - Verification**
- Chạy test hồi quy (phải pass), sau đó toàn bộ lint, typecheck, test và build của ứng dụng liên quan. Lỗi do code mới thì tự sửa; lỗi baseline thì chỉ báo cáo.

**Bước 6 - Tài liệu & Commit/Push `dev`**
- Nếu bản sửa làm đổi hành vi/business rule đã ghi trong tài liệu: cập nhật đúng mục liên quan trong `.agents/docs/srs_sdd/srs_sdd_<app>.md` (và `CODEBASE_ATLAS.md` / `DATABASE_DICTIONARY.md` / `SRS_SDD.md` nếu liên quan), ghi nhận chi tiết vào `.agents/docs/CHANGELOG.md` và thêm 1 dòng ngắn vào Document History của `SRS_SDD.md`: `<YYYY-MM-DD> - Fix: <tóm tắt 1 câu>`.
- Nếu chỉ sửa lỗi cài đặt mà tài liệu vốn đã mô tả đúng: không cần sửa SRS/SDD.
- Tự động commit và push lên nhánh `dev`.

### ĐỊNH DẠNG BÁO CÁO (ngắn gọn, không dán lại code dài)

1. **Kết quả:** Fixed / Blocked / Cần chuyển `/plan` (kèm lý do).
2. **Triệu chứng & nguyên nhân gốc:** kèm `path:line`.
3. **Thay đổi:** danh sách file đã sửa/thêm (code và test) và tóm tắt ý nghĩa mỗi thay đổi.
4. **Test hồi quy:** tên test, xác nhận fail trước/pass sau.
5. **Verification Results:** từng lệnh đã chạy và pass/fail; nêu rõ lỗi baseline có sẵn.
6. **Rủi ro & điểm cần lưu ý:** nơi khác có thể dính cùng mẫu lỗi, tác động phụ có thể có.
7. **Documentation & Git (`dev`):** mục tài liệu đã cập nhật (hoặc "Không cần") và commit hash đã push lên `dev`.

DỪNG sau khi báo cáo. Không tự mở rộng sang việc khác.
