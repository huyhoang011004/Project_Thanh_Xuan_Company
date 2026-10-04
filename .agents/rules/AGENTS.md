# AGENTS.md - Quy ước chung & Quy tắc kỹ thuật

Tài liệu này là nguồn quy ước chung cho mọi agent và workflow trong dự án.

## 1. Nguyên tắc cốt lõi & An toàn

- **Dẫn chứng:** Mọi nhận định về code hiện có phải kèm `path:line`. Chưa xác minh được thì nêu rõ trong câu hỏi.
- **Nguồn sự thật:** Code là hiện trạng; Plan là ý định thay đổi; `.agents/docs/SRS_SDD.md` phản ánh hệ thống sau mỗi thay đổi hoàn tất.
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
- **`/act`:** Thực thi plan đã duyệt -> Sửa code, verify test/build, tick checkbox trong plan, cập nhật kiến trúc hiện tại vào `.agents/docs/SRS_SDD.md`, ghi nhật ký chi tiết vào `.agents/docs/CHANGELOG.md`.
- **`/review`:** Đánh giá chất lượng sau `/act` hoặc `/fix` -> Ghi nhận tại `.agents/docs/reviews/review<N>.md`.
- **`/fix`:** Lỗi nhỏ, rõ ràng, tối đa 3 file code, không đổi schema/API contract.
- **`/docs-sync`:** Quét đồng bộ khi nghi ngờ tài liệu lệch code -> Cập nhật `.agents/docs/SRS_SDD.md` & `CHANGELOG.md`.

*Quy tắc cập nhật tài liệu:* `SRS_SDD.md` là Living Architecture Specification (chỉ giữ kiến trúc, schema, API hiện hành; Document History chỉ giữ 3-5 dòng mới nhất). Toàn bộ bài luận nhật ký chi tiết theo từng Plan/Fix được lưu trữ tại `CHANGELOG.md`.

## 4. Định nghĩa hoàn thành (Definition of Done)

Một thay đổi coi là xong khi:
1. Mọi task trong plan đã hoàn tất và kiểm chứng thực tế.
2. Lint, typecheck và test pass cho **từng app bị ảnh hưởng**.
3. Build pass cho từng app bị ảnh hưởng (`pnpm build`).
4. Thay đổi API contract (DTO, response) ở Backend thì phía gọi (Web, Internal) đã được cập nhật đồng bộ.
5. `.agents/docs/SRS_SDD.md` phản ánh đúng thay đổi và có dòng Document History.
6. Code sạch sẽ, không còn log debug, mock data thừa hay TODO chưa giải quyết.

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

## 6. Deployment & CI/CD

- **Build Docker Image chỉ thực hiện trên GitHub Actions.** Tuyệt đối không chạy `docker-compose build` trực tiếp trên VPS để tránh tràn tài nguyên.
- **Quy trình deploy:** GitHub Actions build image -> Push GHCR -> SSH vào VPS pull image và `docker compose up -d`.
- **Biến môi trường:** Biến client (`NEXT_PUBLIC_*`, `VITE_*`) truyền qua GitHub Secrets dạng Build Arguments khi build image; biến bí mật Backend nằm trong file `.env` trên VPS.
