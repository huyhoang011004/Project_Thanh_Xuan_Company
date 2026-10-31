# AGENTS.md - Quy ước chung & Quy tắc kỹ thuật

Tài liệu này là nguồn quy ước chung cho mọi agent và workflow trong dự án.

## 1. Nguyên tắc cốt lõi & An toàn

- **Dẫn chứng:** Mọi nhận định về code hiện có phải kèm `path:line`. Chưa xác minh được thì nêu rõ trong câu hỏi.
- **Nguồn sự thật:** Code là hiện trạng; Plan là ý định thay đổi; `.agents/docs/SRS_SDD.md` phản ánh kiến trúc tổng thể và thư mục `.agents/docs/srs_sdd/` (`srs_sdd_backend.md`, `srs_sdd_fe_laundry.md`, `srs_sdd_fe_internal.md`, `srs_sdd_fe_moving.md`), `.agents/docs/DATABASE_DICTIONARY.md`, `.agents/docs/CODEBASE_ATLAS.md` phản ánh chi tiết từng phân hệ sau mỗi thay đổi hoàn tất.
- **An toàn & Chiến lược thực thi tiết kiệm Token:**
  - **Phân định 2 luồng công việc (Có Plan vs Chỉnh sửa lẻ không lên Plan):**
    - **Luồng 1 (Có Plan - /act):** Tính năng mới hoặc refactor lớn đã duyệt qua `/plan`. Agent triển khai code và thực hiện luôn toàn bộ quy trình kiểm thử DoD (Typecheck, Build, Đồng bộ 5 trụ cột tài liệu, tự động commit và push `dev`).
    - **Luồng 2 (Chỉnh sửa lẻ không lên Plan - Quick edits / Bugfix nhỏ / UI tweaks):** Để tránh lãng phí token và thời gian build lặp đi lặp lại:
      - **Pha 1:** Agent sửa code xong **CHỈ VIẾT BÁO CÁO GIẢI PHÁP / KẾT QUẢ ĐÃ SỬA VÀ DỪNG LẠI CHỜ NGƯỜI DÙNG DUYỆT OK**. Tuyệt đối KHÔNG tự ý chạy build, KHÔNG cập nhật CHANGELOG/SRS_SDD, KHÔNG commit/push git ở pha này.
      - **Pha 2:** **CHỈ KHI NGƯỜI DÙNG DUYỆT OK** (ví dụ: *"ok", "được rồi", "hoàn tất đi", "chốt commit"*), Agent mới thực hiện Bước 3 (DoD): chạy typecheck/build, cập nhật CHANGELOG.md & SRS_SDD.md, và tự động commit/push lên nhánh `dev`.
  - **Tự động commit và push lên nhánh `dev`:** Thực hiện theo đúng 2 luồng trên (sau khi có sự đồng thuận của người dùng đối với chỉnh sửa lẻ, hoặc tự động sau khi hoàn tất plan).
  - **Quy chuẩn thông điệp commit:** Viết bằng tiếng Việt tự nhiên, giữ nguyên thuật ngữ kỹ thuật/chuyên ngành bằng tiếng Anh (ví dụ: `feat(handovers): thêm Service xử lý kiểm kê và đồng bộ DTO`, `fix(auth): sửa lỗi Guard kiểm tra audience JWT`).
  - **Bảo vệ môi trường Production (`master`):** Không bao giờ push trực tiếp lên nhánh `master`. Nhánh `master` chỉ dùng khi người dùng yêu cầu merge/trigger phát hành lên Production VPS.
  - Không chạy lệnh phá hủy (`git reset --hard`, `rm -rf`, drop DB, force push).
  - Không đọc/in giá trị trong `.env`, secrets, token; chỉ nhắc tên biến.
  - Không tự ý cài dependency mới ngoài plan đã duyệt.
  - Không chạy lệnh ghi/xóa trực tiếp trên database thật.
- **Dừng và hỏi:** Hỏi thay vì tự đoán khi yêu cầu mơ hồ ảnh hưởng lớn đến kiến trúc hoặc cần vượt phạm vi đã định.

## 2. Thông tin dự án & Lệnh kiểm thử

Monorepo gồm 4 app, mỗi app chạy lệnh ở đúng thư mục của nó:

| Mục | Backend (`be-nestjs-thanhxuan/`) | Web Giặt Là & CMS (`fe-nextjs-thanhxuan-laundry/`) | Cổng Nội Bộ (`fe-react-thanhxuan-internal/`) | Web Chuyển Nhà (`fe-nextjs-chuyennhatietkiem/`) |
| :--- | :--- | :--- | :--- | :--- |
| **Port dev** | `5001` (`pnpm start:dev`) | `3000` (`pnpm dev`) | `3001` (`pnpm dev`) | `3002` (`pnpm dev`) |
| **Lint** | `pnpm lint` | `pnpm lint` | `pnpm lint` | `pnpm lint` |
| **Typecheck** | `pnpm exec tsc --noEmit` | `pnpm exec tsc --noEmit` | `pnpm exec tsc --noEmit` | `pnpm exec tsc --noEmit` |
| **Test** | `pnpm test` | `pnpm test` | `pnpm test` | `pnpm test` |
| **Build** | `pnpm build` | `pnpm build` | `pnpm build` | `pnpm build` |

## 3. Quy trình làm việc & Tài liệu

- **`/plan` & `/act` (Tính năng có Plan):** Tính năng mới hoặc đổi thiết kế/API -> Tạo kế hoạch tại `.agents/docs/plans/plan<N>.md`. Khi chạy `/act`, Agent sửa code, **làm luôn trọn gói Bước 3 (DoD)**: verify test/build pass 100%, tick checkbox trong plan, cập nhật đồng bộ 5 trụ cột tài liệu (`srs_sdd_<app>.md`, `SRS_SDD.md`, `DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md`, `CHANGELOG.md`), tự động commit & push lên nhánh `dev`.
- **Chỉnh sửa lẻ KHÔNG lên Plan (`/fix`, quick edits, tinh chỉnh UI, bugfix nhỏ):**
  - **Pha 1 (Sửa code & Báo cáo - Chờ duyệt để tránh tốn Token):** Sửa code chính xác $\rightarrow$ Viết báo cáo giải pháp/kết quả ngắn gọn $\rightarrow$ **DỪNG LẠI CHỜ NGƯỜI DÙNG DUYỆT OK**. Tuyệt đối **KHÔNG** chạy `pnpm build`, **KHÔNG** cập nhật `CHANGELOG.md`/`SRS_SDD.md`, và **KHÔNG** commit/push git ở pha này.
  - **Pha 2 (Thực hiện DoD sau khi duyệt):** **CHỈ KHI NGƯỜI DÙNG DUYỆT OK** (ví dụ: *"ok", "được rồi", "chốt commit", "hoàn tất đi"*), Agent mới thực hiện Bước 3 (DoD): chạy typecheck & build (`tsc --noEmit` và `pnpm build`), cập nhật tài liệu `CHANGELOG.md` & `SRS_SDD.md`, tự động commit và push lên nhánh `dev`.
- **`/review`:** Đánh giá chất lượng sau `/act` hoặc `/fix` -> Ghi nhận tại `.agents/docs/reviews/review<N>.md`.
- **`/docs-sync`:** Quét đồng bộ khi nghi ngờ tài liệu lệch code -> Cập nhật `.agents/docs/srs_sdd/srs_sdd_<app>.md`, `SRS_SDD.md`, `DATABASE_DICTIONARY.md`, `CODEBASE_ATLAS.md` & `CHANGELOG.md`.

*Quy tắc cập nhật tài liệu Modular SRS/SDD & Harness Data:*
- `SRS_SDD.md`: Là Living Architecture Specification TỔNG QUAN (System Context, Topology, Master Index liên kết sang 4 file phân hệ, Document History giữ 3-5 dòng mới nhất của toàn hệ sinh thái).
- `.agents/docs/srs_sdd/srs_sdd_<app>.md`: Đặc tả chi tiết từng phân hệ trong Monorepo. **Quy tắc bắt buộc: Sửa app nào thì cập nhật đúng file phân hệ của app đó, tuyệt đối không viết chéo hay viết nhầm file:**
  - `be-nestjs-thanhxuan/` $\rightarrow$ [srs_sdd_backend.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_backend.md)
  - `fe-nextjs-thanhxuan-laundry/` $\rightarrow$ [srs_sdd_fe_laundry.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_laundry.md)
  - `fe-react-thanhxuan-internal/` $\rightarrow$ [srs_sdd_fe_internal.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_internal.md)
  - `fe-nextjs-chuyennhatietkiem/` $\rightarrow$ [srs_sdd_fe_moving.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/srs_sdd/srs_sdd_fe_moving.md)
- `.agents/docs/DATABASE_DICTIONARY.md`: Từ điển dữ liệu toàn diện (các databases, 34+ collections, chi tiết từng trường, kiểu dữ liệu, index, quan hệ và tác dụng nghiệp vụ).
- `.agents/docs/CODEBASE_ATLAS.md`: Bản đồ định vị nhanh toàn bộ mã nguồn (Endpoint ↔ Controller ↔ Service ↔ Repository ↔ Schema và Route ↔ Page ↔ Component ↔ Hook) giúp Agent định vị file lập tức không cần grep dò tìm.
- `CHANGELOG.md`: Lưu trữ toàn bộ bài luận nhật ký chi tiết theo từng Plan/Fix.

## 4. Định nghĩa hoàn thành (Definition of Done)

> [!IMPORTANT]
> **Quy Chuẩn Kích Hoạt Bước Kiểm Thử & Hoàn Tất (DoD Trigger):**
> - **Khi có Plan (`/act`):** Agent tự động thực hiện liền mạch toàn bộ 10 tiêu chí DoD dưới đây ngay khi hoàn thành code.
> - **Khi chỉnh sửa lẻ KHÔNG lên Plan (`/fix`, quick edit, tinh chỉnh UI/CSS):** Agent sửa code xong **BẮT BUỘC DỪNG LẠI**, viết báo cáo giải pháp/kết quả để **NGƯỜI DÙNG DUYỆT OK TRƯỚC**. Tuyệt đối không tự ý chạy build, không cập nhật CHANGELOG/SRS_SDD, không commit/push git để tránh lãng phí token. **Chỉ khi người dùng duyệt OK**, Agent mới thực hiện các tiêu chí kiểm thử DoD dưới đây.

Một thay đổi coi là xong khi:
1. Mọi task trong plan (hoặc yêu cầu chỉnh sửa) đã hoàn tất và kiểm chứng thực tế.
2. Lint, typecheck và test pass cho **từng app bị ảnh hưởng** (`pnpm exec tsc --noEmit`).
3. Build pass cho từng app bị ảnh hưởng (`pnpm build`).
4. Thay đổi API contract (DTO, response) ở Backend thì phía gọi (Web, Internal) đã được cập nhật đồng bộ.
5. **Cập nhật Database Dictionary, Sắp Xếp Thứ Tự & Dọn Dẹp Bảng Đã Xóa:**
   - Bất kỳ thay đổi nào liên quan đến Schema/Field/Index/Collection MongoDB Mongoose bắt buộc cập nhật đồng bộ tại `.agents/docs/DATABASE_DICTIONARY.md`.
   - **Sắp xếp thứ tự bảng:** Đảm bảo thứ tự các bảng trong tài liệu luôn liền mạch, khoa học theo nhóm phân vùng nghiệp vụ (Auth $\rightarrow$ Thương hiệu/Đối tác $\rightarrow$ Giao nhận $\rightarrow$ Chấm công/Công thợ $\rightarrow$ Chi phí xe $\rightarrow$ Lương/Báo cáo), đánh số STT liên tục từ 1 đến N không đứt đoạn.
   - **Xóa bỏ hoàn toàn bảng đã xóa khỏi tài liệu:** Khi một bảng bị xóa hoặc thay thế, **tuyệt đối không để lại tên bảng đã xóa trong tài liệu** (kể cả ghi chú deprecated hay giữ dòng STT trong bảng tra cứu). Phải xóa triệt để định nghĩa và xóa khỏi bảng tra cứu.
   - **Dọn dẹp Database thực tế:** Bắt buộc cập nhật và chạy script dọn dẹp `pnpm run db:drop-legacy` để drop/rename các collection cũ đã bị xóa/đổi tên khỏi cơ sở dữ liệu MongoDB thực tế, đảm bảo DB sạch sẽ không tồn đọng rác dữ liệu.
6. **Cập nhật Codebase Atlas:** Tạo mới module, endpoint, service, hoặc cấu trúc component chính phải cập nhật tại `.agents/docs/CODEBASE_ATLAS.md`.
7. Tài liệu phân hệ tương ứng (`.agents/docs/srs_sdd/srs_sdd_<app>.md`) và `SRS_SDD.md` (nếu có đổi tổng thể) phản ánh đúng thay đổi, kèm 1 dòng Document History ở `SRS_SDD.md`.
8. Code sạch sẽ, không còn log debug, mock data thừa hay TODO chưa giải quyết.
9. **Xóa bỏ triệt để file/alias tương thích ngược tạm thời:** Các file re-export hoặc alias tạo ra trong quá trình refactor/đổi tên (DTO, Schema, Type...) chỉ là giải pháp tạm thời để chống lỗi compile tức thời giữa các bước trung gian. Khi hoàn tất code, BẮT BUỘC xóa bỏ các file re-export này, cập nhật mọi nơi gọi trỏ trực tiếp vào file mới, rồi mới được chạy test/build để verify.
10. **Tự động Commit & Push lên nhánh `dev`:** Sau khi hoàn thành và verify toàn bộ các tiêu chí trên, Agent tự động tạo commit với thông điệp tiếng Việt tự nhiên (giữ nguyên thuật ngữ kỹ thuật tiếng Anh) và push lên nhánh `dev` của ứng dụng/repo liên quan. Không tự ý merge hay push vào nhánh `master`.

## 5. Quy tắc code bắt buộc (Xem chi tiết tại `backend.md` & `frontend.md`)

### 5.1. Chung (Cả 4 app)
- **TypeScript Strict Mode:** Tuyệt đối không dùng `any`; dùng `unknown` rồi narrow, hoặc khai báo type/interface rõ ràng.
- **Naming:** File kebab-case (trừ React Component/Page/Modal PascalCase), class PascalCase, biến/hàm camelCase.
- **Environment:** Không commit `.env`; thêm biến mới phải cập nhật `.env.example`.

### 5.2. Backend (`be-nestjs-thanhxuan` - Chi tiết tại `.agents/rules/backend.md`)
- **Kiến trúc phân tầng nghiêm ngặt:** Controller -> Service -> Repository -> Model. Không gọi `@InjectModel` ngoài Repository.
- **Hiệu năng & Multi-Database:** Query chỉ đọc bắt buộc dùng `.lean()` và `.select()`; list API phải phân trang; kết nối đúng connection (`laundry_express`, `moving_express`, `internal_express`, `core_express`).
- **DTO & Validation:** Mọi `@Body()` dùng Class DTO; Nested Object đủ bộ 3 (`@IsDefined()` + `@ValidateNested()` + `@Type(() => DtoClass)`); không trả field nhạy cảm; không nhận filter thô.
- **Timezone & Auth:** Chuẩn hóa ngày giờ theo `Asia/Ho_Chi_Minh` qua `src/common/utils/date.util.ts` (`startOfDayVN`, `endOfDayVN`, `getDatePrefixVN`), cấm dùng `setHours(0,0,0,0)`. Auth nội bộ kiểm tra `aud: 'internal'`.

### 5.3. Frontend & UI (`fe-nextjs-*` & `fe-react-*` - Chi tiết tại `.agents/rules/frontend.md`)
- **Next.js (Web & CMS):** Server Components mặc định cho SEO; đẩy `"use client"` xuống component lá; trang bài viết/dịch vụ có CTA/form chuyển đổi kèm ngữ cảnh (`sourceUrl`, `category`, `slug`).
- **React Internal (`fe-react-thanhxuan-internal`):** Mobile-First PWA, tách logic ra Custom Hook/Service, biến môi trường `VITE_*`, chuẩn hóa ngày giờ `Asia/Ho_Chi_Minh`.
- **UI & Cấu trúc file (< 250-300 dòng):** Dùng `shadcn/ui`, TailwindCSS `cn()`, `lucide-react`, `react-hook-form` + `zod`. Chia tách rõ `[Tên]Page.tsx`, `modals/[Tên]Modal.tsx`, `components/[Tên]Component.tsx`, `hooks/use[Tên].ts`. Chủ động chia nhỏ file khi vượt 250-300 dòng. **Quy tắc Custom Hook:** Bắt buộc tách thành `use[Tên].ts` nếu logic (state, query, mutation, calculation) phức tạp hoặc nhiều dòng; nếu logic đơn giản, chỉ vài state cơ bản thì giữ nguyên tại component, không cần tách hook để tránh trừu tượng hóa thừa thãi (tuân thủ KISS).

## 6. Deployment & CI/CD

- **Phân định vai trò các nhánh (Branch Strategy & CI/CD):**
  - **Nhánh `dev`:** Nhánh phát triển hàng ngày của lập trình viên và Agent. Push code lên `dev` **không kích hoạt GitHub Actions workflow** để tiết kiệm phút chạy CI. Việc verify test/build được Agent tự kiểm tra ở local trước khi commit.
  - **Nhánh `build`:** Nhánh kiểm thử CI. Khi merge vào `build`, GitHub Actions tự động kích hoạt build và push image lên GHCR / build bundle tĩnh.
  - **Nhánh `master`/`main`:** Nhánh phát hành Production (CD). Khi merge vào `master`/`main`, GitHub Actions build image/static bundle -> Push GHCR/SCP -> SSH vào VPS pull image và `docker compose up -d`.
- **Build Docker Image chỉ thực hiện trên GitHub Actions.** Tuyệt đối không chạy `docker-compose build` trực tiếp trên VPS.
- **Biến môi trường:** Biến client (`NEXT_PUBLIC_*`, `VITE_*`) truyền qua GitHub Secrets dạng Build Arguments; biến bí mật Backend nằm trong `.env` trên VPS.

## 7. Bảng Nhận Diện Ý Định Tiếng Việt Tự Nhiên (Intent Classifier)

| Khẩu ngữ / Yêu cầu tiếng Việt | Bộ kỹ năng (Skill) kích hoạt | Trọng tâm thực thi |
| :--- | :--- | :--- |
| *"trau chuốt UI / audit UI / làm lại giao diện đỉnh cao / cân chỉnh lề-chữ"* | `impeccable` | Audit spacing, typography hierarchy, micro-interactions, accessibility. |
| *"chống phèn / nâng tầm thẩm mỹ / landing page có gu / bỏ kiểu AI generic"* | `design-taste-frontend` | Bỏ gradient tím/xanh nhạt nhẽo, áp dụng ngôn ngữ thiết kế độc bản, sang trọng. |
| *"chọn bảng màu / phối màu / phong cách UI / theme chuẩn"* | `ui-ux-pro-max` | Gợi ý bảng màu HSL, typography tokens, hơn 50+ phong cách UI chuẩn chỉ. |
| *"viết code đầy đủ / không viết tắt / cấm TODO / code chạy luôn"* | `full-output-enforcement` | Xuất code trọn vẹn 100%, không bỏ lửng, không placeholder. |
| *"tìm nguyên nhân gốc / tại sao bị lỗi này / truy vết bug"* | `systematic-debugging` | Điều tra nguyên nhân gốc rễ (root cause) bằng chứng cớ, không đoán mò. |
| *"tạo module backend / thêm bảng DB / viết API NestJS"* | `create-nestjs-module` | Chuẩn Repository Pattern, Multi-Database, Class DTO, strict validation. |
| *"làm trang web mới / thêm tính năng CMS / form liên hệ"* | `create-nextjs-feature` | Server Components SEO, Feature-based colocation, shadcn + Zod. |
| *"làm màn hình vận hành / phiếu giao nhận / chấm công xưởng"* | `create-react-feature` | Mobile-first, Vite SPA, TanStack Query, offline queue, ký số Canvas. |

## 8. Kỷ luật hoàn thiện mã nguồn (Senior Engineering & Anti-AI Slop)

1. **Anti-AI Slop & Full Output:** Nghiêm cấm code viết tắt (`// TODO`, `// ... rest of code`, `// implement later`). Mọi đoạn code xuất ra phải hoàn chỉnh, tích hợp ngay lập tức.
2. **Root-Cause First:** Tìm chính xác nguyên nhân gốc trước khi sửa bug, cấm che giấu lỗi bằng `try/catch` rỗng hay ép kiểu `any`.
3. **KISS & YAGNI:** Không tạo abstraction thừa thãi.
4. **Xóa file tương thích ngược tạm thời (No Stale Bridge/Re-export Files):** Sau khi refactor/đổi tên, bắt buộc xóa hoàn toàn các file bridge/re-export tạm thời và cập nhật import trỏ trực tiếp vào nguồn chuẩn trước khi chạy test/build.
5. **Kỷ luật chia nhỏ file (< 250 - 300 dòng):** Chủ động chia nhỏ file thành sub-components (`components/`), modals (`modals/`) và custom hooks (`hooks/`), tuyệt đối không để phát sinh "god-component" 500 - 1000 dòng.

## 9. Giám Sát Ngữ Cảnh & Chống Ảo Giác (Context Health & /compact)

- Ở cuối mỗi câu trả lời kỹ thuật hoặc kết thúc mỗi task/turn, Agent chủ động đính kèm 1 dòng thông tin ước lượng:
  > 🧭 *[Context Health: ~Xk tokens | Trạng thái: An toàn / Cần lưu ý / Quá tải | Gõ `/compact` khi cần cô đọng]*
- **Mức cảnh báo:** Dưới 50k tokens: **An toàn (Xanh)** | 50k - 100k tokens: **Cần lưu ý (Vàng)** | Trên 100k tokens: **Quá tải (Đỏ)**.
