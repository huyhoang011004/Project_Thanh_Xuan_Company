import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from '../../be-nestjs-thanhxuan/node_modules/.pnpm/node_modules/marked/lib/marked.esm.js';
import playwrightPkg from '../../fe-nextjs-thanhxuan-laundry/node_modules/@playwright/test/index.js';
const { chromium } = playwrightPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USER_GUIDES_DIR = path.resolve(__dirname, '../docs/user_guides');

// Role configuration for styling accent colors
const ROLE_THEMES = {
  admin: {
    title: 'QUẢN TRỊ VIÊN HỆ THỐNG',
    code: 'ADMIN',
    primary: '#4338ca',
    bg: '#eef2ff',
    badge: '#6366f1'
  },
  manager: {
    title: 'QUẢN LÝ XƯỞNG ĐIỀU HÀNH',
    code: 'MANAGER',
    primary: '#b45309',
    bg: '#fffbeb',
    badge: '#f59e0b'
  },
  warehouse_manager: {
    title: 'QUẢN LÝ KHO / THỦ KHO',
    code: 'WAREHOUSE_MANAGER',
    primary: '#0f766e',
    bg: '#f0fdfa',
    badge: '#14b8a6'
  },
  accountant: {
    title: 'KẾ TOÁN TIỀN LƯƠNG & XE',
    code: 'ACCOUNTANT',
    primary: '#047857',
    bg: '#ecfdf5',
    badge: '#10b981'
  },
  shipper: {
    title: 'TÀI XẾ GIAO NHẬN XE TẢI',
    code: 'SHIPPER',
    primary: '#1d4ed8',
    bg: '#eff6ff',
    badge: '#3b82f6'
  },
  worker: {
    title: 'THỢ XƯỞNG / CÔNG NHÂN',
    code: 'WORKER',
    primary: '#be123c',
    bg: '#fff1f2',
    badge: '#f43f5e'
  },
  partner_manager: {
    title: 'QUẢN LÝ ĐỐI TÁC B2B',
    code: 'PARTNER_MANAGER',
    primary: '#6d28d9',
    bg: '#f5f3ff',
    badge: '#8b5cf6'
  },
  partner_staff: {
    title: 'NHÂN VIÊN ĐỐI TÁC B2B',
    code: 'PARTNER_STAFF',
    primary: '#0369a1',
    bg: '#f0f9ff',
    badge: '#0ea5e9'
  },
  default: {
    title: 'TỔNG QUAN HỆ THỐNG NỘI BỘ',
    code: 'OVERVIEW',
    primary: '#1e3a8a',
    bg: '#f8fafc',
    badge: '#3b82f6'
  }
};

function getRoleTheme(filename) {
  for (const [key, theme] of Object.entries(ROLE_THEMES)) {
    if (filename.includes(key)) {
      return theme;
    }
  }
  return ROLE_THEMES.default;
}

function buildHtml(markdownContent, filename) {
  const theme = getRoleTheme(filename);

  // Configure marked custom renderer
  const renderer = new marked.Renderer();
  const originalCodeRenderer = renderer.code.bind(renderer);
  renderer.code = function(code, lang, escaped) {
    const text = typeof code === 'object' ? code.text : code;
    const language = typeof code === 'object' ? code.lang : lang;
    if (language === 'mermaid') {
      return `<div class="mermaid-container"><pre class="mermaid">${text}</pre></div>`;
    }
    return originalCodeRenderer(code, lang, escaped);
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: false
  });

  const parsedBody = marked.parse(markdownContent);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${theme.title} - Cẩm Nang Vận Hành</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
  <style>
    @page {
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    /* Document Top Banner */
    .doc-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      margin-bottom: 20px;
      border-radius: 6px;
      background: linear-gradient(135deg, ${theme.bg} 0%, #ffffff 100%);
      border: 1px solid #e2e8f0;
      border-left: 5px solid ${theme.primary};
      font-size: 8.5pt;
      color: #475569;
    }
    .doc-banner .brand-tag {
      font-weight: 700;
      color: ${theme.primary};
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .doc-banner .role-badge {
      display: inline-block;
      padding: 3px 10px;
      font-weight: 700;
      font-size: 8.5pt;
      color: #ffffff;
      background-color: ${theme.primary};
      border-radius: 9999px;
      text-transform: uppercase;
    }

    /* Headings */
    h1 {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2.5px solid ${theme.primary};
      padding-bottom: 8px;
      margin-top: 0;
      margin-bottom: 14px;
      line-height: 1.3;
      page-break-after: avoid;
    }
    h2 {
      font-size: 12.5pt;
      font-weight: 700;
      color: ${theme.primary};
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
      margin-top: 22px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10.5pt;
      font-weight: 600;
      color: #1e3a8a;
      margin-top: 16px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    h4 {
      font-size: 10pt;
      font-weight: 600;
      color: #334155;
      margin-top: 12px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }

    /* Text & Lists */
    p {
      margin-top: 0;
      margin-bottom: 8px;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 3px;
    }
    strong {
      color: #0f172a;
      font-weight: 600;
    }

    /* Callout & Blockquotes */
    blockquote {
      margin: 12px 0;
      padding: 10px 14px;
      background-color: ${theme.bg};
      border-left: 4px solid ${theme.primary};
      border-radius: 4px;
      color: #334155;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    blockquote p:last-child {
      margin-bottom: 0;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f8fafc;
      color: #0f172a;
      font-weight: 700;
      border-bottom: 2px solid #94a3b8;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    tr {
      page-break-inside: avoid;
    }

    /* Code & Technical Terms */
    code {
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 8.5pt;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    pre {
      margin: 12px 0;
      padding: 12px;
      background-color: #0f172a;
      border-radius: 6px;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    pre code {
      background-color: transparent;
      color: #f8fafc;
      padding: 0;
      border: none;
      font-size: 8pt;
      line-height: 1.45;
    }

    /* Mermaid Diagrams */
    .mermaid-container {
      margin: 16px 0;
      padding: 14px 10px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      text-align: center;
      page-break-inside: avoid;
    }
    .mermaid {
      margin: 0 auto;
      text-align: center;
    }
    .mermaid svg {
      max-width: 100% !important;
      height: auto !important;
    }

    /* KaTeX Mathematical Formulas */
    .katex-display {
      margin: 8px 0 !important;
      padding: 6px !important;
      background: #f8fafc;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      page-break-inside: avoid;
      font-size: 10pt;
    }
    .katex {
      font-size: 1.05em;
    }

    /* Dividers */
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 18px 0;
    }

    /* Links */
    a {
      color: ${theme.primary};
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="doc-banner">
    <div>
      <span class="brand-tag">THANH XUÂN LAUNDRY EXPRESS</span> &nbsp;|&nbsp; Hệ Thống Điều Hành Xưởng B2B
    </div>
    <div>
      <span class="role-badge">${theme.code}</span>
    </div>
  </div>

  ${parsedBody}

  <script>
    window.__RENDER_DONE__ = false;
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        if (window.renderMathInElement) {
          renderMathInElement(document.body, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\\(', right: '\\)', display: false},
              {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError: false
          });
        }
        if (window.mermaid) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            fontFamily: 'Inter, sans-serif',
            securityLevel: 'loose'
          });
          await mermaid.run();
        }
      } catch (err) {
        console.error('Render error:', err);
      } finally {
        window.__RENDER_DONE__ = true;
      }
    });
  </script>
</body>
</html>`;
}

async function generateAllPdfs() {
  console.log('🚀 Bắt đầu quá trình tạo các bản PDF hướng dẫn người dùng...');
  console.log(`📁 Thư mục nguồn: ${USER_GUIDES_DIR}`);

  const files = fs.readdirSync(USER_GUIDES_DIR).filter(f => f.endsWith('.md'));
  console.log(`📄 Tìm thấy ${files.length} tài liệu Markdown:`, files);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const results = [];

  for (const file of files) {
    const mdPath = path.join(USER_GUIDES_DIR, file);
    const pdfFileName = file.replace(/\.md$/, '.pdf');
    const pdfPath = path.join(USER_GUIDES_DIR, pdfFileName);
    const content = fs.readFileSync(mdPath, 'utf8');

    console.log(`\n⏳ Đang xử lý: ${file} -> ${pdfFileName}...`);
    const html = buildHtml(content, file);

    const page = await context.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__RENDER_DONE__ === true, { timeout: 20000 });
      // Thêm 600ms để SVG Mermaid định vị hoàn hảo
      await page.waitForTimeout(600);

      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '18mm',
          bottom: '18mm',
          left: '14mm',
          right: '14mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-family: 'Inter', sans-serif; font-size: 8pt; color: #64748b; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            <span>CÔNG TY CỔ PHẦN & TNHH GIẶT LÀ THANH XUÂN</span>
            <span>CẨM NANG HƯỚNG DẪN TÁC NGHIỆP NỘI BỘ</span>
          </div>
        `,
        footerTemplate: `
          <div style="font-family: 'Inter', sans-serif; font-size: 8pt; color: #64748b; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <span>Tài liệu nội bộ - noibo.thanhxuanlaundry.com</span>
            <span>Trang <span class="pageNumber"></span> / <span class="totalPages"></span></span>
          </div>
        `
      });

      const stats = fs.statSync(pdfPath);
      const sizeKb = (stats.size / 1024).toFixed(1);
      console.log(`✅ Xuất thành công: ${pdfFileName} (${sizeKb} KB)`);
      results.push({ file: pdfFileName, sizeKb });
    } catch (err) {
      console.error(`❌ Lỗi khi xuất PDF cho ${file}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n=============================================');
  console.log('🎉 ĐÃ HOÀN THÀNH TẠO TẤT CẢ CÁC BẢN PDF!');
  console.log('=============================================');
  results.forEach(r => console.log(` - ${r.file}: ${r.sizeKb} KB`));
}

generateAllPdfs().catch(err => {
  console.error('Fatal error in PDF generator:', err);
  process.exit(1);
});
