import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from '../../be-nestjs-thanhxuan/node_modules/.pnpm/node_modules/marked/lib/marked.esm.js';
import playwrightPkg from '../../fe-nextjs-thanhxuan-laundry/node_modules/@playwright/test/index.js';
const { chromium } = playwrightPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRICING_DIR = path.resolve(__dirname, '../docs/pricing');
const INPUT_MD_PATH = path.join(PRICING_DIR, 'INTERNAL_SYSTEM_CLIENT_PROPOSAL.md');

// Xuất ra cả 2 file PDF để đồng bộ, loại bỏ hoàn toàn phần kịch bản đàm phán
const OUTPUT_PDF_TARGETS = [
  path.join(PRICING_DIR, 'INTERNAL_SYSTEM_CLIENT_PROPOSAL.pdf'),
  path.join(PRICING_DIR, 'INTERNAL_COST_PROPOSAL_AND_NEGOTIATION.pdf')
];

function buildHtml(markdownContent) {
  // Cấu hình renderer của marked
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
  <title>HỒ SƠ ĐỀ XUẤT GIẢI PHÁP & CHI PHÍ ĐẦU TƯ PHÂN HỆ NỘI BỘ - CÔNG TY TNHH KINH DOANH THƯƠNG MẠI VÀ DỊCH VỤ THANH XUÂN</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
  <style>
    @page {
      size: A4 portrait;
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

    /* Headings */
    h1 {
      font-size: 16.5pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2.5px solid #1e3a8a;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 14px;
      line-height: 1.35;
      page-break-after: avoid;
    }
    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 5px;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11.25pt;
      font-weight: 700;
      color: #0369a1;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    h4 {
      font-size: 10.5pt;
      font-weight: 600;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    /* Paragraphs & Text */
    p {
      margin-top: 0;
      margin-bottom: 8px;
      text-align: justify;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 22px;
    }
    li {
      margin-bottom: 4px;
    }
    strong {
      color: #0f172a;
      font-weight: 600;
    }
    em {
      color: #475569;
    }

    /* Dividers & Page breaks */
    hr {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 20px 0;
    }

    /* Blockquotes / Callout boxes */
    blockquote {
      margin: 14px 0;
      padding: 12px 18px;
      background-color: #f8fafc;
      border-left: 4.5px solid #3b82f6;
      border-radius: 6px;
      color: #334155;
      font-size: 9.75pt;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      page-break-inside: avoid;
    }
    blockquote p:last-child {
      margin-bottom: 0;
    }

    /* Highlight badge for specific callouts */
    blockquote:has(strong:contains("CAM KẾT")),
    blockquote:has(strong:contains("ĐÁNH GIÁ")) {
      background-color: #f0fdf4;
      border-left-color: #10b981;
      color: #166534;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9.25pt;
      line-height: 1.5;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    thead {
      display: table-header-group;
    }
    th {
      background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 9px 10px;
      border: 1px solid #1e3a8a;
      font-size: 9pt;
      letter-spacing: 0.3px;
    }
    th:first-child {
      text-align: center;
    }
    td {
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
      color: #334155;
    }
    tbody tr:nth-child(even) {
      background-color: #f8fafc;
    }
    tbody tr:hover {
      background-color: #f1f5f9;
    }

    /* Table alignments */
    td:first-child {
      text-align: center;
      font-weight: 600;
      color: #1e3a8a;
    }
    td:last-child {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      text-align: right;
      color: #0f172a;
    }

    /* Mermaid Container - TO RÕ NÉT CĂNG TRÊN A4 */
    .mermaid-container {
      margin: 20px 0;
      padding: 18px 14px;
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      text-align: center;
      page-break-inside: avoid;
    }
    .mermaid {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .mermaid svg {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 180px;
    }
    .mermaid .node rect, 
    .mermaid .node circle, 
    .mermaid .node polygon {
      stroke-width: 2px !important;
      rx: 8px !important;
      ry: 8px !important;
    }
    .mermaid .node .label {
      font-size: 14.5px !important;
      font-weight: 700 !important;
      line-height: 1.4 !important;
      font-family: 'Inter', sans-serif !important;
    }
    .mermaid .edgeLabel {
      font-size: 13px !important;
      font-weight: 600 !important;
      font-family: 'Inter', sans-serif !important;
    }

    /* Code blocks & ASCII tables */
    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 14px 18px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.75pt;
      line-height: 1.45;
      overflow-x: auto;
      margin: 16px 0;
      page-break-inside: avoid;
      border-left: 4.5px solid #10b981;
    }
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9pt;
      padding: 1.5px 5px;
      background-color: #f1f5f9;
      color: #0f766e;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    pre code {
      background: transparent;
      padding: 0;
      color: inherit;
      border: none;
      font-size: inherit;
    }

    /* KaTeX Math Display */
    .katex-display {
      margin: 16px 0 !important;
      font-size: 1.1em !important;
    }

    /* Footer stamp / Signature blocks */
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 35px;
      page-break-inside: avoid;
    }
    .signature-box {
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      background-color: #f8fafc;
    }
    .signature-box .role-label {
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #1e3a8a;
      margin-bottom: 4px;
    }
    .signature-box .role-sub {
      font-size: 8pt;
      color: #64748b;
      margin-bottom: 55px;
    }
    .signature-box .signer-name {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      display: inline-block;
      min-width: 180px;
    }
  </style>
</head>
<body>

  <!-- Parsed Content from Markdown -->
  <div class="content-wrapper">
    ${parsedBody}
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", async function() {
      // 1. Render KaTeX
      try {
        if (typeof renderMathInElement === 'function') {
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
      } catch (e) {
        console.error('KaTeX error:', e);
      }

      // 2. Render Mermaid với font chữ TO RÕ NÉT
      try {
        if (typeof mermaid !== 'undefined') {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
              primaryColor: '#eef2ff',
              primaryTextColor: '#1e1b4b',
              primaryBorderColor: '#4f46e5',
              lineColor: '#2563eb',
              secondaryColor: '#f0fdf4',
              tertiaryColor: '#fff1f2',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif'
            },
            flowchart: {
              curve: 'basis',
              nodeSpacing: 45,
              rankSpacing: 45,
              padding: 16
            }
          });
          await mermaid.run();
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
      } finally {
        window.__RENDER_DONE__ = true;
      }
    });
  </script>
</body>
</html>`;
}

async function generateAllProposalPdfs() {
  console.log('🚀 Bắt đầu quá trình xuất PDF Hồ Sơ Đề Xuất Dành Cho Khách Hàng (Tối Ưu Typography & Độ Lớn Sơ Đồ)...');
  console.log(`📄 Nguồn: ${INPUT_MD_PATH}`);

  if (!fs.existsSync(INPUT_MD_PATH)) {
    throw new Error(`Không tìm thấy file nguồn Markdown: ${INPUT_MD_PATH}`);
  }

  const rawMarkdown = fs.readFileSync(INPUT_MD_PATH, 'utf8');

  // Thêm phần chữ ký 2 bên ở cuối tài liệu nếu chưa có
  let processedMarkdown = rawMarkdown;
  if (!processedMarkdown.includes('ĐẠI DIỆN KHÁCH HÀNG')) {
    processedMarkdown += `\n\n
<div class="signature-grid">
  <div class="signature-box">
    <div class="role-label">ĐẠI DIỆN KHÁCH HÀNG (BÊN A)</div>
    <div class="role-sub">CÔNG TY TNHH KINH DOANH THƯƠNG MẠI VÀ DỊCH VỤ THANH XUÂN</div>
    <div class="signer-name">BAN GIÁM ĐỐC</div>
  </div>
  <div class="signature-box">
    <div class="role-label">ĐẠI DIỆN ĐỘI NGŨ PHÁT TRIỂN (BÊN B)</div>
    <div class="role-sub">(Ký và xác nhận cam kết bàn giao)</div>
    <div class="signer-name">TRƯỞNG NHÓM GIẢI PHÁP & KỸ THUẬT</div>
  </div>
</div>
`;
  }

  const html = buildHtml(processedMarkdown);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (const targetPath of OUTPUT_PDF_TARGETS) {
    const page = await context.newPage();
    try {
      console.log(`⏳ Đang biên dịch: ${path.basename(targetPath)}...`);
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__RENDER_DONE__ === true, { timeout: 25000 });
      await page.waitForTimeout(800);

      await page.pdf({
        path: targetPath,
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
          <div style="font-family: 'Inter', sans-serif; font-size: 7.75pt; color: #475569; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
            <span style="font-weight: 700; color: #1e3a8a;">CÔNG TY TNHH KINH DOANH THƯƠNG MẠI VÀ DỊCH VỤ THANH XUÂN</span>
            <span style="color: #64748b;">HỒ SƠ ĐỀ XUẤT GIẢI PHÁP & CHI PHÍ ĐẦU TƯ PHÂN HỆ NỘI BỘ</span>
          </div>
        `,
        footerTemplate: `
          <div style="font-family: 'Inter', sans-serif; font-size: 7.75pt; color: #64748b; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 4px;">
            <span>Hồ sơ đề xuất thương mại • Hotline Kỹ Thuật: 0888.765.650</span>
            <span>Trang <span class="pageNumber"></span> / <span class="totalPages"></span></span>
          </div>
        `
      });

      const stats = fs.statSync(targetPath);
      const sizeKb = (stats.size / 1024).toFixed(1);
      console.log(`✅ Xuất thành công: ${path.basename(targetPath)} (${sizeKb} KB)`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n🎉 ĐÃ HOÀN TẤT BIÊN DỊCH BẢN PDF CHUẨN DÀNH CHO KHÁCH HÀNG!\n');
}

generateAllProposalPdfs().catch(err => {
  console.error('❌ Lỗi khi sinh PDF:', err);
  process.exit(1);
});
