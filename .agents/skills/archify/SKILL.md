---
name: archify
description: Biến kiến trúc hệ sinh thái, codebase, luồng nghiệp vụ hoặc state machine thành sơ đồ trực quan tương tác độc lập (interactive self-contained HTML/SVG). Hỗ trợ zoom/pan, tìm kiếm node, dark/light theme, trace dependency đường đi của dữ liệu, và xuất ảnh SVG/PNG. Kích hoạt khi cần vẽ kiến trúc dự án, trực quan hóa luồng vận hành, hoặc tạo dashboard hệ thống dễ đọc cho con người.
---

# Archify - Interactive System Architecture & Diagram Engine

Skill này hướng dẫn AI Agent chuyển đổi kiến trúc hệ thống, mã nguồn Monorepo, quy trình vận hành và máy trạng thái thành **file HTML tương tác độc lập (Self-contained Interactive HTML)**.

---

## 1. Mục Tiêu & Nguyên Tắc Hoạt Động

1. **Self-contained (Độc lập 100%):** File HTML xuất ra chứa toàn bộ CSS, SVG, JS nội tuyến (inline), không cần internet hay CDN phụ thuộc, có thể mở trực tiếp bằng bất kỳ trình duyệt nào (`file://...`).
2. **Interactive & Responsive (Tương tác cao):**
   - **Tìm kiếm node (Node Search):** Lọc nhanh tên component, service, controller, database.
   - **Trace Dependency:** Click/Hover vào 1 node sẽ làm sáng các đường kết nối (Inbound / Outbound flow), làm mờ các thành phần không liên quan.
   - **Theme:** Hỗ trợ chuyển đổi Dark Mode (Slate 900) / Light Mode (Slate 50).
   - **Controls:** Zoom In (+), Zoom Out (-), Reset View, Fit Screen.
   - **Inspection Drawer:** Click vào node sẽ mở panel chi tiết bên cạnh: xem cổng Port, đường dẫn code nguồn ([CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md)), database tương ứng và ghi chú kỹ thuật.
   - **Export:** Nút bấm tải về dạng SVG hoặc PNG để đính kèm báo cáo/tài liệu.
3. **Nguồn Sự Thật (Source-Grounded):**
   - Mọi thông số (Port, tên bảng, route, vai trò RBAC) bắt buộc khớp chính xác với [README.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/README.md), [SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md), [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md) và [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md).

---

## 2. 5 Loại Sơ Đồ Tiêu Chuẩn

Khi người dùng yêu cầu vẽ sơ đồ bằng Archify, Agent xác định đúng loại sơ đồ:

| STT | Loại Sơ Đồ | Trọng Tâm Trực Quan Hóa Trong Dự Án Thanh Xuân |
| :---: | :--- | :--- |
| **01** | **System Topology (Kiến Trúc Tổng Thể)** | Monorepo 4 apps, 3 MongoDB độc lập, cổng Port (5001, 3000, 3001, 3002), Zalo OA, Cloudinary, SMTP, VPS Docker. |
| **02** | **Workflow (Quy Trình Nghiệp Vụ)** | Phiếu giao nhận 2 chiều (Thủ kho $\rightarrow$ Tài xế $\rightarrow$ Đối tác ký số $\rightarrow$ Trạm rạch bao), Công thợ HourlyWork, Đề xuất xăng xe. |
| **03** | **Data-Flow (Luồng Dữ Liệu)** | Khách đặt báo giá / lead CRM $\rightarrow$ Điều phối $\rightarrow$ Giao nhận $\rightarrow$ Chốt công $\rightarrow$ Bảng lương Streaming PDF/Excel. |
| **04** | **Sequence (Trình Tự API & Tích Hợp)** | Xác thực JWT audience (`internal`), PWA Offline Queue lưu IndexedDB và đồng bộ kèm header `Idempotency-Key` (UUIDv4). |
| **05** | **Lifecycle / State Machine (Máy Trạng Thái)** | Vòng đời phiếu giao nhận (`DRAFT` $\rightarrow$ `CONFIRMED` $\rightarrow$ `DELIVERED` $\rightarrow$ `RECOUNTED`), Ca làm việc (`OPEN` $\rightarrow$ `CLOSED`). |

---

## 3. Cấu Trúc Khung Mẫu HTML Tương Tác Chuẩn (Archify Output Template)

File HTML xuất ra theo mẫu sau (lưu tại `.agents/docs/architecture-interactive.html` hoặc thư mục do người dùng chỉ định):

```html
<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thanh Xuan Company - Interactive Architecture</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #3b82f6;
      --accent: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    .light {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
      --primary: #2563eb;
      --accent: #059669;
      --warning: #d97706;
      --danger: #dc2626;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
    body { background: var(--bg); color: var(--text); overflow: hidden; height: 100vh; display: flex; flex-direction: column; }
    header { height: 60px; border-bottom: 1px solid var(--border); background: var(--card-bg); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 10; }
    .toolbar { display: flex; gap: 10px; align-items: center; }
    input[type="text"] { background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 8px 12px; border-radius: 6px; font-size: 14px; width: 220px; }
    button { background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; }
    button:hover { border-color: var(--primary); }
    main { flex: 1; position: relative; overflow: hidden; }
    svg#canvas { width: 100%; height: 100%; cursor: grab; }
    svg#canvas:active { cursor: grabbing; }
    .node-box { rx: 10px; cursor: pointer; transition: all 0.2s ease; }
    .node-box:hover { stroke-width: 3px !important; filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4)); }
    .node.dimmed { opacity: 0.15; }
    .node.highlighted .node-box { stroke: var(--primary) !important; stroke-width: 3px !important; }
    .edge { stroke-width: 2px; transition: all 0.2s ease; fill: none; }
    .edge.highlighted { stroke: var(--primary) !important; stroke-width: 3.5px !important; }
    .edge.dimmed { opacity: 0.08; }
    /* Side Drawer */
    #drawer { position: absolute; right: 0; top: 0; bottom: 0; width: 380px; background: var(--card-bg); border-left: 1px solid var(--border); padding: 24px; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); z-index: 20; overflow-y: auto; }
    #drawer.open { transform: translateX(0); }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  </style>
</head>
<body>
  <!-- Header Toolbar -->
  <header>
    <div style="display:flex;align-items:center;gap:12px;">
      <h1 style="font-size:16px;font-weight:700;">Thanh Xuan Ecosystem Architecture</h1>
      <span class="badge" style="background:#3b82f622;color:#3b82f6;">Interactive Topology</span>
    </div>
    <div class="toolbar">
      <input type="text" id="search" placeholder="🔍 Tìm node (backend, nextjs, mongo...)" />
      <button id="zoomIn">➕ Phóng to</button>
      <button id="zoomOut">➖ Thu nhỏ</button>
      <button id="resetView">🔄 Mặc định</button>
      <button id="themeToggle">🌓 Đổi Theme</button>
      <button id="exportSvg">💾 Tải SVG</button>
    </div>
  </header>

  <!-- Interactive SVG Canvas -->
  <main>
    <svg id="canvas" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
        </marker>
        <marker id="arrow-active" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
        </marker>
      </defs>
      <g id="viewport">
        <!-- Render nodes, edges, clusters dynamically -->
      </g>
    </svg>

    <!-- Detail Drawer -->
    <div id="drawer">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h2 id="nodeTitle" style="font-size:18px;">Chi tiết thành phần</h2>
        <button id="closeDrawer" style="padding:4px 8px;">✕</button>
      </div>
      <div id="nodeContent" style="font-size:14px;line-height:1.6;color:var(--text-muted);">
        Chọn một node trên sơ đồ để xem thông tin kiến trúc, API và vị trí file.
      </div>
    </div>
  </main>
  <script>
    /* Inline JS: Pan & Zoom, Node Selection, Trace Dependency, Search, Export */
  </script>
</body>
</html>
```

---

## 4. Quy Trình Tạo Sơ Đồ Bằng Archify

Khi nhận yêu cầu *"vẽ thiết kế dự án"* hoặc *"vẽ sơ đồ bằng archify"*:

1. **Khảo sát dữ liệu thực tế (Grounding):**
   - Đọc [.agents/docs/SRS_SDD.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/SRS_SDD.md) và [CODEBASE_ATLAS.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/CODEBASE_ATLAS.md) để lấy cấu trúc app, endpoint và đường dẫn file thực tế.
   - Đọc [DATABASE_DICTIONARY.md](file:///d:/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/DATABASE_DICTIONARY.md) để lấy chính xác 3 CSDL MongoDB (`laundry_express`, `moving_express`, `internal_express`) và các collections.
2. **Biên tập cấu trúc node & edge (IR):**
   - Phân chia cụm (Clusters): Client Layer $\rightarrow$ Gateway/Backend Layer $\rightarrow$ Persistence Layer $\rightarrow$ External Integration Layer.
   - Gắn thuộc tính cho từng node: `id`, `label`, `sublabel`, `type` (`app`, `db`, `service`, `external`), `port`, `tech`, `fileRef`, `connections`.
3. **Sinh file HTML hoàn chỉnh:**
   - Ghi file vào `.agents/docs/architecture-interactive.html`.
   - Cung cấp link mở file trên browser cho người dùng (`file:///mnt/d/PROJECT/Website_Thanh_Xuan_Company/.agents/docs/architecture-interactive.html`).
