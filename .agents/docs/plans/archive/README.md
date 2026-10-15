# Lưu Trữ Kế Hoạch Kỹ Thuật (Archived Plans)

Thư mục này lưu trữ các kế hoạch kỹ thuật (`plan1.md` $\rightarrow$ `plan28.md`) đã hoàn thành và nghiệm thu trong quá khứ nhằm giữ cho thư mục làm việc chính `.agents/docs/plans/` luôn tinh gọn, tránh làm loãng ngữ cảnh và tối ưu hiệu năng index/search của AI Agent.

---

## 📌 Nguyên Tắc Tra Cứu

1. **Nguồn Sự Thật Hiện Tại (Current Source of Truth):**
   - **Mã nguồn thực tế:** Là hiện trạng hệ thống đang chạy.
   - **Kiến trúc tổng thể & Chi tiết phân hệ:** Tra cứu tại [.agents/docs/SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) và thư mục [.agents/docs/srs_sdd/](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/).
   - **Từ điển dữ liệu Mongoose CSDL:** Tra cứu tại [.agents/docs/DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md).
   - **Bản đồ mã nguồn định vị nhanh:** Tra cứu tại [.agents/docs/CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md).
2. **Lịch Sử & Bài Luận Thay Đổi:**
   - Tra cứu đầy đủ toàn bộ nhật ký các Plan và Bugfix tại [.agents/docs/CHANGELOG.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CHANGELOG.md).
3. **Thư mục kế hoạch đang hoạt động (`.agents/docs/plans/`):**
   - Chỉ lưu trữ các kế hoạch gần nhất (từ Plan 29 trở đi) hoặc các kế hoạch đang `Draft` / `In progress` để phục vụ lệnh `/act` và `/review`.
