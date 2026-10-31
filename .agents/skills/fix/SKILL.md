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
5. AN TOÀN & QUY TRÌNH 2 PHA TIẾT KIỆM TOKEN:
   - **Pha 1 (Sửa code & Báo cáo):** Sửa code tối thiểu $\rightarrow$ Viết báo cáo giải pháp/kết quả $\rightarrow$ **DỪNG LẠI CHỜ NGƯỜI DÙNG DUYỆT OK**. Tuyệt đối không tự ý chạy build, không cập nhật CHANGELOG/SRS_SDD, không commit/push git để tránh lãng phí token khi người dùng còn muốn tinh chỉnh tiếp.
   - **Pha 2 (Kiểm thử DoD & Commit sau khi duyệt):** **CHỈ KHI NGƯỜI DÙNG DUYỆT OK**, Agent mới thực hiện: chạy typecheck/build pass 100%, cập nhật CHANGELOG.md & SRS_SDD.md, và tự động commit/push lên nhánh `dev` của ứng dụng/repo liên quan. Tuyệt đối không push lên nhánh `master`/`main`.
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

**Bước 5 - Báo Cáo & Chờ Người Dùng Duyệt (Pha 1 - Tiết Kiệm Token)**
- Kiểm tra cú pháp nhanh (typecheck nhẹ nếu cần).
- Xuất báo cáo ngắn gọn theo định dạng bên dưới.
- **DỪNG LẠI CHỜ NGƯỜI DÙNG DUYỆT OK**. Tuyệt đối không tự ý chạy full build, không sửa CHANGELOG/SRS_SDD, không commit/push git.

**Bước 6 - Verification DoD, Tài Liệu & Commit/Push `dev` (Pha 2 - Khi Người Dùng Đã Duyệt OK)**
- **CHỈ KHI NGƯỜI DÙNG DUYỆT OK**, Agent mới thực hiện:
  1. Chạy test hồi quy (phải pass), typecheck và build của ứng dụng liên quan (`pnpm build`).
  2. Cập nhật tài liệu: Ghi nhận bài luận chi tiết vào `.agents/docs/CHANGELOG.md` và thêm 1 dòng vào Document History của `SRS_SDD.md` (kèm cập nhật tài liệu phân hệ nếu đổi hành vi).
  3. Tự động commit với thông điệp chuẩn tiếng Việt và push lên nhánh `dev`.

### ĐỊNH DẠNG BÁO CÁO (ngắn gọn, không dán lại code dài)

1. **Kết quả:** Fixed / Blocked / Cần chuyển `/plan` (kèm lý do).
2. **Triệu chứng & nguyên nhân gốc:** kèm `path:line`.
3. **Thay đổi:** danh sách file đã sửa/thêm (code và test) và tóm tắt ý nghĩa mỗi thay đổi.
4. **Test hồi quy:** tên test, xác nhận fail trước/pass sau.
5. **Verification Results:** từng lệnh đã chạy và pass/fail; nêu rõ lỗi baseline có sẵn.
6. **Rủi ro & điểm cần lưu ý:** nơi khác có thể dính cùng mẫu lỗi, tác động phụ có thể có.
7. **Documentation & Git (`dev`):** mục tài liệu đã cập nhật (hoặc "Không cần") và commit hash đã push lên `dev`.

DỪNG sau khi báo cáo. Không tự mở rộng sang việc khác.
