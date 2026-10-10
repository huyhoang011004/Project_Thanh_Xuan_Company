# AGENTS.md - Quy ước chung & Quy tắc kỹ thuật

Tài liệu này là nguồn quy ước chung cho mọi agent và workflow trong dự án.

## 1. Nguyên tắc cốt lõi & An toàn

- **Dẫn chứng:** Mọi nhận định về code hiện có phải kèm `path:line`. Chưa xác minh được thì nêu rõ trong câu hỏi.
- **Nguồn sự thật:** Code là hiện trạng; Plan là ý định thay đổi; `.agents/docs/SRS_SDD.md` phản ánh kiến trúc tổng thể và thư mục `.agents/docs/srs_sdd/` (`srs_sdd_backend.md`, `srs_sdd_fe_nextjs.md`, `srs_sdd_fe_internal.md`) phản ánh chi tiết từng phân hệ sau mỗi thay đổi hoàn tất.
- **An toàn:**
  - Không commit/push trừ khi người dùng yêu cầu rõ.
  - Không chạy lệnh phá hủy (`git reset --hard`, `rm -rf`, drop DB, force push).
  - Không đọc/in giá trị trong `.env`, secrets, token; chỉ nhắc tên biến.
  - Không tự ý cài dependency mới ngoài plan đã duyệt.
  - Không đụng vào thay đổi chưa commit không thuộc phạm vi công việc.
  - Không chạy lệnh ghi/xóa trực tiếp trên database thật.
- **Dừng và hỏi:** Hỏi thay vì tự đoán khi yêu cầu mơ hồ ảnh hưởng lớn đến kiến trúc hoặc cần vượt phạm vi đã định.

## 2. Thông tin dự án & Lệnh kiểm thử

Monorepo gồm 3 app, mỗi app chạy lệnh ở đúng thư mục của nó:

| Mục | Backend (`be-nestjs-thanhxuan/`) | Web + CMS (`fe-nextjs-thanhxuan-laundry/`) | Internal (`fe-react-thanhxuan-internal/`) |
| :--- | :--- | :--- | :--- |
| **Port dev** | `5001` (`pnpm start:dev`) | `3000` (`pnpm dev`) | `3001` (`pnpm dev`) |
| **Lint** | `pnpm lint` | `pnpm lint` | `pnpm lint` |
| **Typecheck** | `pnpm exec tsc --noEmit` | `pnpm exec tsc --noEmit` | `pnpm exec tsc --noEmit` |
| **Test** | `pnpm test` | `pnpm test` | `pnpm test` |
| **Build** | `pnpm build` | `pnpm build` | `pnpm build` |

## 3. Quy trình làm việc & Tài liệu

- **`/plan`:** Tính năng mới hoặc đổi thiết kế/API -> Tạo kế hoạch tại `.agents/docs/plans/plan<N>.md`.
- **`/act`:** Thực thi plan đã duyệt -> Sửa code, verify test/build, tick checkbox trong plan, cập nhật phân hệ tương ứng tại `.agents/docs/srs_sdd/srs_sdd_<app>.md` (và `.agents/docs/SRS_SDD.md` nếu đổi kiến trúc tổng thể), ghi nhật ký chi tiết vào `.agents/docs/CHANGELOG.md`.
- **`/review`:** Đánh giá chất lượng sau `/act` hoặc `/fix` -> Ghi nhận tại `.agents/docs/reviews/review<N>.md`.
- **`/fix`:** Lỗi nhỏ, rõ ràng, tối đa 3 file code, không đổi schema/API contract.
- **`/docs-sync`:** Quét đồng bộ khi nghi ngờ tài liệu lệch code -> Cập nhật `.agents/docs/srs_sdd/srs_sdd_<app>.md` & `.agents/docs/SRS_SDD.md` & `CHANGELOG.md`.

*Quy tắc cập nhật tài liệu Modular SRS/SDD & Harness Data:*
- `SRS_SDD.md`: Là Living Architecture Specification TỔNG QUAN (System Context, Topology, Master Index liên kết sang 3 file phân hệ, Document History giữ 3-5 dòng mới nhất của toàn hệ sinh thái).
- `.agents/docs/srs_sdd/srs_sdd_<app>.md`: Đặc tả chi tiết từng phân hệ (`srs_sdd_backend.md`, `srs_sdd_fe_nextjs.md`, `srs_sdd_fe_internal.md`). Sửa app nào thì cập nhật file app đó.
- `.agents/docs/DATABASE_DICTIONARY.md`: Từ điển dữ liệu toàn diện (3 databases, 34+ collections, chi tiết từng trường, kiểu dữ liệu, index, quan hệ và tác dụng nghiệp vụ).
- `.agents/docs/CODEBASE_ATLAS.md`: Bản đồ định vị nhanh toàn bộ mã nguồn (Endpoint ↔ Controller ↔ Service ↔ Repository ↔ Schema và Route ↔ Page ↔ Component ↔ Hook) giúp Agent định vị file lập tức không cần grep dò tìm.
- `CHANGELOG.md`: Lưu trữ toàn bộ bài luận nhật ký chi tiết theo từng Plan/Fix.

## 4. Định nghĩa hoàn thành (Definition of Done)

Một thay đổi coi là xong khi:
1. Mọi task trong plan đã hoàn tất và kiểm chứng thực tế.
2. Lint, typecheck và test pass cho **từng app bị ảnh hưởng**.
3. Build pass cho từng app bị ảnh hưởng (`pnpm build`).
4. Thay đổi API contract (DTO, response) ở Backend thì phía gọi (Web, Internal) đã được cập nhật đồng bộ.
5. **Cập nhật Database Dictionary:** Bất kỳ thay đổi nào liên quan đến Schema/Field/Index MongoDB Mongoose bắt buộc cập nhật đồng bộ tại `.agents/docs/DATABASE_DICTIONARY.md`.
6. **Cập nhật Codebase Atlas:** Tạo mới module, endpoint, service, hoặc cấu trúc component chính phải cập nhật tại `.agents/docs/CODEBASE_ATLAS.md`.
7. Tài liệu phân hệ tương ứng (`.agents/docs/srs_sdd/srs_sdd_<app>.md`) và `SRS_SDD.md` (nếu có đổi tổng thể) phản ánh đúng thay đổi, kèm 1 dòng Document History ở `SRS_SDD.md`.
8. Code sạch sẽ, không còn log debug, mock data thừa hay TODO chưa giải quyết.

## 5. Quy tắc code bắt buộc

### 5.1. Chung (Cả 3 app)
- **TypeScript Strict Mode:** Tuyệt đối không dùng `any`; dùng `unknown` rồi narrow, hoặc khai báo type/interface rõ ràng. Ưu tiên Generics, Discriminated Unions.
- **Naming:** File kebab-case, class PascalCase, biến/hàm camelCase.
- **Environment:** Không commit `.env`; thêm biến mới phải cập nhật `.env.example`.
- **Form & Tracking:** Gửi kèm ngữ cảnh (`sourceUrl`, `category`, `slug`...).

### 5.2. Backend (`be-nestjs-thanhxuan`)
- **Kiến trúc phân tầng nghiêm ngặt:** Controller -> Service -> Repository -> Model. Mọi truy vấn DB phải nằm ở tầng Repository, không gọi Model trực tiếp từ Service/Controller. Tránh circular dependency.
- **Hiệu năng đọc:** Query chỉ đọc bắt buộc dùng `.lean()` và `.select()`; field hay filter/sort phải đánh Index; list API phải phân trang và giới hạn `limit` tối đa.
- **Multi-Database:** Kết nối đúng connection cho từng database (`laundry_express`, `moving_express`, `internal_express`).
- **DTO & Validation:**
  - Mọi `@Body()` bắt buộc dùng Class DTO (không dùng `interface` hay `Partial<T>`).
  - Thuộc tính Nested Object bắt buộc đủ bộ 3 decorator: `@IsDefined()` + `@ValidateNested()` + `@Type(() => DtoClass)`.
  - Global `ValidationPipe` với `whitelist: true`, `transform: true`.
  - Map document Mongoose sang response DTO, tuyệt đối không trả field nhạy cảm (password, token, hash).
  - Không nhận object filter thô từ client (tránh NoSQL injection).
- **Defensive Programming:** Dùng Optional Chaining `?.` và fallback hợp lý. Ném Exception chuẩn của NestJS (`NotFoundException`, `BadRequestException`...), không ném `Error` thô.
- **Timezone:** Chuẩn hóa toàn bộ ngày giờ (chấm công, báo cáo, tiền tố mã phiếu) theo múi giờ `Asia/Ho_Chi_Minh` qua helper `startOfDayVN`, `endOfDayVN`, `getDatePrefixVN`. Không dùng `setHours(0,0,0,0)` theo local của VPS.
- **Auth:** Passport JWT Strategy cho phân hệ nội bộ bắt buộc xác thực `audience` (`aud: 'internal'`) để chặn dùng chéo token.

### 5.3. Web + CMS (`fe-nextjs-thanhxuan-laundry`)
- **Server Components mặc định:** Đặc biệt các trang `(public)` để tối ưu SEO. Chỉ dùng `"use client"` khi cần DOM, state, event listener và đẩy xuống component lá.
- **Feature-based Colocation:** `src/features/<feature>/` chứa components, actions, hooks. Component dùng chung ở `src/components/`, API fetcher ở `src/services/`.
- **Tách logic và giao diện:** Tách logic xử lý và API call ra Custom Hook, Service hoặc Server Action, không để trong JSX/TSX.
- **Business rule:** Trang nội dung/bài viết (dịch vụ, tin tức, giới thiệu) tự động có form liên hệ/CTA chuyển đổi ở cuối trang.
- Đầy đủ metadata SEO cho trang public; có đủ trạng thái loading, empty, error cho màn hình dữ liệu.

### 5.4. Internal (`fe-react-thanhxuan-internal`)
- Tách logic và giao diện ra Custom Hook/Service, không viết trong JSX.
- Tổ chức code theo nghiệp vụ (`handover`, `piecework`, `attendance`, `partners`), không dồn vào `App.tsx`.
- Biến môi trường chỉ dùng tiền tố `VITE_`.
- Giờ giấc hiển thị và gửi lên API chuẩn hóa theo múi giờ `Asia/Ho_Chi_Minh`.

### 5.5. UI (Cả Web và Internal)
- Dùng **shadcn/ui** (`npx shadcn@latest add <component>`), không tự code lại component đã có.
- Style bằng **TailwindCSS** và `cn()`; dùng CSS variables tokens, không hardcode màu. Icon dùng **Lucide**.
- Form dùng **react-hook-form** + **zod** kết hợp `Form` của shadcn.
- Text hiển thị tiếng Việt tự nhiên, chú trọng accessibility (label, focus, keyboard).
- **Quy chuẩn cấu trúc & đặt tên file Frontend (Áp dụng cả Next.js và React Internal):**
  - File lớn nhất / màn hình chính cấp cao nhất: `[Tên]Page.tsx`.
  - Thư mục `modals/`: chứa các file `[Tên liên quan đến page]Modal.tsx`.
  - Thư mục `components/`: chứa các file `[Tên]Component.tsx`.
  - Kiểm tra và chia nhỏ file kịp thời khi kích thước vượt quá 250 - 300 dòng; bóc tách modal sang `modals/` và các thành phần con sang `components/`. Không dồn nhiều nghìn dòng trong một file.

## 6. Deployment & CI/CD

- **Build Docker Image chỉ thực hiện trên GitHub Actions.** Tuyệt đối không chạy `docker-compose build` trực tiếp trên VPS để tránh tràn tài nguyên.
- **Quy trình deploy:** GitHub Actions build image -> Push GHCR -> SSH vào VPS pull image và `docker compose up -d`.
- **Biến môi trường:** Biến client (`NEXT_PUBLIC_*`, `VITE_*`) truyền qua GitHub Secrets dạng Build Arguments khi build image; biến bí mật Backend nằm trong file `.env` trên VPS.

## 7. Bảng Nhận Diện Ý Định Tiếng Việt Tự Nhiên (Intent Classifier)

Agent chủ động thấu hiểu khẩu ngữ và cách diễn đạt tự nhiên của lập trình viên bằng tiếng Việt để kích hoạt đúng bộ kỹ năng chuyên biệt:

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

1. **Anti-AI Slop & Full Output (Tuyệt đối không bỏ dở code):**
   - Nghiêm cấm các đoạn mã viết tắt: `// TODO: tự code tiếp`, `// ... rest of code`, `/* các hàm khác giữ nguyên */`, `// implement later`.
   - Mọi đoạn code xuất ra phải hoàn chỉnh, có thể chạy và tích hợp vào hệ thống ngay lập tức.
2. **Root-Cause First:**
   - Trước khi sửa bất kỳ bug nào: tìm chính xác nguyên nhân gốc (đọc log, kiểm tra trace, phân tích điều kiện biên), tuyệt đối không che giấu lỗi bằng `try/catch` rỗng hay ép kiểu `any`.
3. **KISS & YAGNI:**
   - Không tạo abstraction thừa thãi. Giải pháp tốt nhất là giải pháp ít dòng code nhất mà vẫn thỏa mãn 100% ràng buộc nghiệp vụ và kiến trúc của dự án.

## 9. Giám Sát Ngữ Cảnh & Chống Ảo Giác (Context Health & /compact)

- **Nguyên tắc:** Khi một phiên trao đổi kéo dài nhiều lượt hoặc chứa quá nhiều file log, ngữ cảnh tích lũy lớn sẽ làm tăng nguy cơ mô hình bị phân tán chú ý hoặc ảo giác.
- **Dòng thông báo trạng thái ngữ cảnh (Context Monitor):** Ở cuối mỗi câu trả lời kỹ thuật hoặc kết thúc mỗi task/turn, Agent chủ động đính kèm 1 dòng thông tin ước lượng:
  > 🧭 *[Context Health: ~Xk tokens | Trạng thái: An toàn / Cần lưu ý / Quá tải | Gõ `/compact` khi cần cô đọng]*
- **Mức cảnh báo:**
  - *Dưới 50k tokens:* **An toàn (Xanh)** — Làm việc bình thường.
  - *50k - 100k tokens:* **Cần lưu ý (Vàng)** — Nên hoàn thành nốt công việc hiện tại rồi gõ `/compact` trước khi chuyển sang tính năng mới.
  - *Trên 100k tokens:* **Quá tải (Đỏ)** — Khuyến nghị gõ ngay `/compact` hoặc bắt đầu phiên mới để đảm bảo độ chính xác 100%.


