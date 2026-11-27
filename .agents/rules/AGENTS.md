---
trigger: always_on
---

# AGENTS.md - Quy ước chung & Quy tắc kỹ thuật

Nguồn quy ước chung cho mọi agent và workflow trong hệ sinh thái **Thanh Xuân Company**.

## 1. Nguyên tắc cốt lõi & An toàn

- **Dẫn chứng:** Mọi nhận định về code hiện có phải kèm `path:line`. Chưa xác minh được thì nêu rõ.
- **Nguồn sự thật:** Code là hiện trạng; Plan là ý định thay đổi; 5 trụ cột tài liệu trong `.agents/docs/` (`SRS_SDD.md`, `.agents/docs/srs_sdd/srs_sdd_<app>.md`, `DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `CHANGELOG.md`) phản ánh kiến trúc sau khi hoàn tất.
- **Phân định 2 luồng công việc:**
  - **Luồng 1 (Có Plan - `/act`):** Code xong chạy luôn trọn gói DoD (Mục 4), đồng bộ docs, tự động commit và push `dev`.
  - **Luồng 2 (Chỉnh sửa lẻ không lên Plan - `/fix`, quick edits, UI tweaks):**
    - *Pha 1:* Sửa code xong **chỉ báo cáo ngắn gọn và DỪNG CHỜ USER DUYỆT OK** (không build, không sửa docs, không commit/push).
    - *Pha 2:* Chỉ khi user duyệt OK (*"ok", "chốt commit"*), mới chạy DoD, cập nhật `CHANGELOG.md`/`SRS_SDD.md`, và commit/push `dev`.
- **Git & Bảo mật:** Commit tiếng Việt tự nhiên + thuật ngữ kỹ thuật tiếng Anh (`feat(...)`, `fix(...)`). **CẤM** push trực tiếp `master`/`main`; cấm lệnh phá hủy (`git reset --hard`, `rm -rf`, drop DB thủ công, force push); cấm đọc/in `.env`/secrets; cấm tự cài dependency ngoài plan hoặc ghi/xóa DB thật.

## 2. Thông tin dự án & Lệnh kiểm thử

Monorepo 5 app, chạy lệnh tại đúng thư mục app:

| Mục | Backend (`be-nestjs-thanhxuan/`) | Web Giặt Là (`fe-nextjs-thanhxuan-laundry/`) | Cổng Nội Bộ (`fe-react-thanhxuan-internal/`) | Web Chuyển Nhà (`fe-nextjs-chuyennhatietkiem/`) | Cổng Admin (`fe-react-thanhxuan-admin/`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Port dev** | `5001` (`pnpm start:dev`) | `3000` (`pnpm dev`) | `3001` (`pnpm dev`) | `3002` (`pnpm dev`) | `3003` (`pnpm dev`) |
| **Verify** | `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build` | `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build` | `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build` | `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build` | `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build` |

## 3. Quy trình làm việc & Conditional Doc Sync

- `/plan` → `.agents/docs/plans/plan<N>.md` (giữ tối đa 10 plan; plan `Done` cũ chuyển vào `archive/`).
- `/act` → thực thi plan + DoD | `/fix` → sửa lỗi 2 pha | `/review` → `.agents/docs/reviews/review<N>.md` | `/docs-sync` → quét đồng bộ 5 trụ cột.
- **Conditional Doc Sync (chỉ sửa file thuộc phạm vi thay đổi):**
  - `SRS_SDD.md`: chỉ thêm 1 dòng Document History.
  - `CHANGELOG.md`: vượt 600 dòng tự archive phần cũ sang `.agents/docs/changelogs/CHANGELOG_ARCHIVE_V<N>.md`.
  - `srs_sdd_<app>.md`: chỉ cập nhật khi đổi Business Rule / Kiến trúc của app tương ứng (`srs_sdd_backend.md`, `srs_sdd_fe_laundry.md`, `srs_sdd_fe_internal.md`, `srs_sdd_fe_moving.md`, `srs_sdd_fe_admin.md`).
  - `DATABASE_DICTIONARY.md`: chỉ cập nhật khi đổi Schema / Collection / Field / Index MongoDB.
  - `CODEBASE_ATLAS.md`: chỉ cập nhật khi thêm/xóa Route / Endpoint / Controller / Service / Hook chính.

## 4. Định nghĩa hoàn thành (Definition of Done)

1. Hoàn tất & kiểm chứng mọi task; `lint`, `tsc --noEmit`, `test`, `build` pass ở **từng app bị ảnh hưởng**.
2. Đổi API contract Backend thì Frontend gọi API đó phải cập nhật đồng bộ.
3. Đổi MongoDB Schema/Collection: cập nhật `DATABASE_DICTIONARY.md` (STT liền mạch, xóa triệt để bảng đã xóa) và chạy `pnpm run db:drop-legacy` nếu có xóa/đổi tên collection.
4. Đổi kiến trúc/route/endpoint/service: cập nhật `CODEBASE_ATLAS.md`, `srs_sdd_<app>.md`, `SRS_SDD.md`.
5. Code sạch (không debug log, mock thừa, TODO); **xóa triệt để file re-export/alias tương thích ngược tạm thời** trước khi verify.
6. Tự động commit & push lên nhánh `dev` (Luồng 1 tự động; Luồng 2 chỉ sau khi user duyệt OK).

## 5. Tóm tắt quy chuẩn code (Chi tiết tại `backend.md` & `frontend.md`)

- **Chung:** TS Strict (cấm `any`, dùng `unknown` + narrow); file kebab-case (trừ React Component/Page/Modal PascalCase); chia nhỏ file `< 250–300` dòng; cập nhật `.env.example` khi thêm biến mới.
- **Backend (`be-nestjs-thanhxuan/`):** `Controller -> Service -> Repository -> Model` (cấm `@InjectModel` ngoài Repository); query đọc bắt buộc `.lean()` + `.select()`; list API phải phân trang; đúng connection (`laundry_express`, `moving_express`, `internal_express`, `core_express`); DTO Class + nested `@IsDefined()/@ValidateNested()/@Type()`; ngày giờ VN qua `src/common/utils/date.util.ts` (cấm `setHours(0,0,0,0)`); auth nội bộ kiểm tra `aud: 'internal'`.
- **Frontend (`fe-nextjs-*`, `fe-react-*`):** Next.js mặc định Server Component (đẩy `"use client"` xuống component lá); React Internal Mobile-First PWA (`44x44px` touch target, TanStack Query v5, tách `hooks/use[Tên].ts` khi logic phức tạp); date helper chuẩn VN.

## 6. Deployment & CI/CD

- `dev`: dev hàng ngày, không chạy GitHub Actions. | `build`: merge để test CI build/push GHCR. | `master`/`main`: CD deploy Production VPS.
- **Cấm** chạy `docker-compose build` trực tiếp trên VPS; client env (`NEXT_PUBLIC_*`, `VITE_*`) truyền qua GitHub Secrets build args.

## 7. Intent Classifier tiếng Việt

| Khẩu ngữ / Yêu cầu | Skill | Trọng tâm |
| :--- | :--- | :--- |
| *"chọn màu / trau chuốt UI / chống phèn / layout chuẩn"* | `ui-ux-pro-max` | Bảng màu HSL, typography, spacing, micro-interactions, anti-AI slop. |
| *"tìm nguyên nhân gốc / tại sao lỗi / truy vết bug"* | `fix` | Root cause bằng chứng cớ, test hồi quy, sửa tối thiểu (2 pha). |
| *"tạo module backend / thêm bảng DB / viết API NestJS"* | `create-nestjs-module` | Repository Pattern, Multi-Database MongoDB, Class DTO. |
| *"làm trang web mới / thêm tính năng CMS / form liên hệ"* | `create-nextjs-feature` | Server Components SEO, Feature-based colocation, shadcn + Zod. |
| *"làm màn hình vận hành / phiếu giao nhận / chấm công xưởng"* | `create-react-feature` | Mobile-first PWA, TanStack Query, offline queue, ký số Canvas. |
| *"cô đọng ngữ cảnh / compact / giải phóng token"* | `compact` | State Card hoặc `/compact` gốc của CLI. |

## 8. Kỷ luật kỹ thuật (Senior Engineering)

1. Code hoàn chỉnh (cấm `// TODO`, `// ... rest`); tìm root cause trước khi sửa; tuân thủ KISS/YAGNI; xóa bridge/re-export tạm trước khi test/build; giữ file `< 250–300` dòng.

## 9. Tối ưu Quota, Triage & Điều phối Subagent

1. **Kỷ luật tiết kiệm token & quota:**
   - Dùng `grep -rn` định vị trước rồi `read_file` với `StartLine`/`EndLine` (~40–100 dòng); cấm đọc nguyên file lớn nhiều lần.
   - Terminal output luôn giới hạn (`tail`, `head`, `--stat`, `-n`); sửa cục bộ bằng `edit_file`; gộp nhiều tool call độc lập song song trong 1 turn; báo cáo súc tích không paste code dài.
   - **Zero Polling:** Tận dụng Reactive Wakeup cho tác vụ nền/subagent, không gọi `manage_task(Action='status')` lặp lại.
   - **Giới hạn phiên:** Khuyến nghị chạy điều phối mặc định ở `Gemini 4 Hydrogen (Medium)`, tránh giữ 1 phiên `XHigh` chạy 60–90 turn; sau `/act` nên dùng `/compact` gốc của CLI hoặc mở phiên mới trước khi `/review`.
2. **Cơ chế Triage & Leo thang từ `Gemini 4 Hydrogen (Medium)` (Phiên chính):**
   - *Yêu cầu nhỏ (1–2 file):* Tự xử lý trực tiếp (tránh tốn overhead tạo subagent).
   - *Yêu cầu vừa / rõ phạm vi:* `Medium` tự phân tích, chia nhỏ việc tách biệt file/app và giao cho các subagent theo bảng bên dưới.
   - *Yêu cầu quá phức tạp* (kiến trúc đa app/module, đổi DB schema MongoDB/Auth/Idempotency, concurrency): Giao phân tích cho **`hydrogen-high`** (hoặc **`hydrogen-xhigh`** nếu cực khó) qua `bash .agents/scripts/subagent-run.sh --role hydrogen-high --mode plan ...` để phân rã thành các sub-task rõ ranh giới file, rồi `Medium` nhận kết quả đó chia việc cho subagent thực thi.
3. **Bảng phân tầng Subagent (Gemini chủ lực — Claude hạn chế dùng vì quota ít):**
   - **Native `invoke_subagent` (tác vụ nhẹ không cần chọn tier chi tiết):**
     - `Model="flash"` / `"flash_lite"` (`TypeName="research"` | `"self"`): khảo sát repo, đọc docs, thu thập `git diff`, sync 5 trụ cột docs cuối `/act`.
     - `Model="inherit"`: chạy song song 1 nhánh code cùng tier `Medium`.
   - **CLI `bash .agents/scripts/subagent-run.sh --role <role> --mode <plan|default>` (khi cần chỉ định đúng mức):**
     - `flash-low` / `flash-medium`: quét log, grep, đọc/tóm tắt file lớn, đồng bộ docs.
     - `flash-high`: viết unit test, chỉnh UI/component theo mẫu có sẵn, `/fix` đơn giản.
     - `hydrogen-low`: code CRUD/DTO/hook rõ spec, chi phí thấp hơn `Medium`.
     - `hydrogen-medium`: triển khai module Service/Feature hoàn chỉnh theo plan.
     - `hydrogen-high` / `hydrogen-xhigh`: leo thang phân tích yêu cầu phức tạp (`--mode plan`), truy vết bug khó, review chuyên sâu.
     - `sonnet` / `opus` *(Hạn mức rất ít — HẠN CHẾ)*: Chỉ dùng khi thật cần (phản biện chéo độc lập `opus --mode plan` cho module tài chính/bảo mật trọng yếu, hoặc `sonnet` làm backup khi quota Gemini căng).
     - *(Backup xoay profile OAuth khi cần:* `/usr/local/bin/spawn-worker <low|medium|high> "<nhiệm vụ>"`*).*
   - **Quy tắc đặt tên hiển thị (BẮT BUỘC):** Mọi lần gọi subagent đều phải ghi rõ tên model và mức trong ngoặc đơn `()` ngay sau tên subagent ở `Role` (với `invoke_subagent`), `toolSummary` (với `subagent-run.sh`), và khi báo cáo cho user:
     - Ví dụ `invoke_subagent`: `Role="Frontend Fix Worker (Gemini 3.8 Flash)"`, `Role="Repo Research (Gemini Flash Lite)"`, `Role="Backend Worker (Gemini 4 Hydrogen - Medium)"`.
     - Ví dụ `subagent-run.sh`: `toolSummary="UI Fix (Gemini 3.8 Flash - High)"`, `toolSummary="Docs Sync (Gemini 3.8 Flash - Low)"`, `toolSummary="Plan Escalation (Gemini 4 Hydrogen - High)"`, `toolSummary="Second Opinion (Claude Opus 4.6)"`.
   - *Quy tắc an toàn:* Không truyền `--effort` khi gọi Claude; khi chạy nhiều worker ghi file song song, bắt buộc chỉ định danh sách file sở hữu tách biệt 100%.

## 10. Giám Sát Ngữ Cảnh (Context Health)

Cuối mỗi câu trả lời kỹ thuật hoặc kết thúc turn, đính kèm 1 dòng:
> 🧭 *[Context Health: ~Xk tokens | Trạng thái: An toàn / Cần lưu ý / Quá tải | Gõ `/compact` khi cần cô đọng]*
- Dưới 50k: **An toàn** | 50k - 100k: **Cần lưu ý** | Trên 100k: **Quá tải** (cần chạy `/compact` gốc của CLI hoặc mở phiên mới).
