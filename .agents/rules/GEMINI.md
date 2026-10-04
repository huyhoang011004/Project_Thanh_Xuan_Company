# GEMINI.md - Hệ sinh thái Thanh Xuân Laundry

Tài liệu chỉ dẫn cho Gemini/Agent. Quy trình, lệnh verify và quy tắc code nằm ở `AGENTS.md`. Mỗi quy tắc chỉ nằm ở một nơi, không lặp lại ở đây.

## 1. Ngôn ngữ và giao tiếp

- Giao tiếp, giải thích luồng, lập kế hoạch, tài liệu và văn bản UI hiển thị: 100% tiếng Việt tự nhiên.
- **Giữ nguyên** thuật ngữ kỹ thuật tiếng Anh chuyên ngành (Controller, Repository, DTO, UseCase, Middleware, Caching, Bypass, Lean, Hook, Index, Props, State, Monorepo, Docker, v.v.). Không dịch gượng gạo sang tiếng Việt.
- Code, tên biến/hàm, comment, commit message: tiếng Anh.

## 2. Tổng quan hệ sinh thái

Website và hệ thống quản trị của Công ty Giặt Sấy Thanh Xuân: tiếp thị, SEO, đặt dịch vụ, tra cứu đơn cho khách hàng; vận hành xưởng và điều phối đối tác cho nội bộ. Gồm 3 ứng dụng trong cùng Monorepo:

| App | Vai trò | Stack | Port |
| :-- | :-- | :-- | :-- |
| `be-nestjs-thanhxuan/` | Backend API tập trung | NestJS 11+, Node.js 20+, MongoDB + Mongoose (Multi-Database: `laundry_express`, `moving_express`, `internal_express`) | 5001 |
| `fe-nextjs-thanhxuan-laundry/` | Website khách hàng `(public)` và CMS `(admin)/admin` | Next.js 15+ (App Router), React 19, TailwindCSS, shadcn/ui, Lucide | 3000 |
| `fe-react-thanhxuan-internal/` | Cổng vận hành nội bộ xưởng và điều phối đối tác (SPA) | React 18+, Vite 6+, TailwindCSS v3+, shadcn/ui, Lucide React | 3001 |

Tích hợp ở Backend: JWT Auth, Nodemailer (SMTP), Cloudinary, Zalo OA, AI (Gemini / OpenAI / OpenRouter).

Nghiệp vụ cốt lõi của app nội bộ:
- **Phiếu Giao Nhận Kép (`handover`)**: điều phối xe nhận hàng, kiểm kê, bàn giao đồ giặt đối tác.
- **Khoán Việc & Năng Suất (`piecework`)**: chấm công theo sản lượng giặt/ủi từng thợ.
- **Điểm Danh Chấm Công (`attendance`)**: theo dõi ca làm và công thợ.
- **Quản Lý Đối Tác (`partners`)**: thông tin và công nợ đối tác giặt là.

Cấu trúc thư mục chi tiết: đọc trực tiếp từ repo, không liệt kê ở đây vì dễ lỗi thời.

## 3. Quy trình làm việc

Làm theo `AGENTS.md`: `/srs-sdd`, `/plan`, `/act`, `/review`, `/fix`, `/docs-sync`. Lệnh verify theo từng app ở mục 2 của `AGENTS.md`, quy tắc code bắt buộc ở mục 8.

## 4. Skills hỗ trợ khi code Frontend

Các skill trong `.agents/skills/`, áp dụng khi viết hoặc review code Frontend:

- `vercel-react-best-practices`: tránh re-render thừa, giảm bundle, triệt tiêu data waterfall.
- `vercel-composition-patterns`: Compound Components, Render Props, Context cho component linh hoạt, dễ tái sử dụng.
- `shadcn`: tận dụng thành phần shadcn/ui thay vì tự code lại.
- `tailwind-design-system`: tuân thủ token màu, khoảng cách, responsive thống nhất.
- `typescript-advanced-types`: Generics, Discriminated Unions, Utility Types; cấm `any`.

Khi tạo mới: dùng `create-nestjs-module` cho Module Backend, `create-nextjs-feature` cho Feature Next.js.
