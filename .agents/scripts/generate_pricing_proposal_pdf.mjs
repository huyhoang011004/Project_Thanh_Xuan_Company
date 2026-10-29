import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from '../../be-nestjs-thanhxuan/node_modules/.pnpm/node_modules/marked/lib/marked.esm.js';
import playwrightPkg from '../../fe-nextjs-thanhxuan-laundry/node_modules/@playwright/test/index.js';
const { chromium } = playwrightPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_MD_PATH = path.resolve(__dirname, '../docs/pricing/INTERNAL_COST_PROPOSAL_AND_NEGOTIATION.md');
const OUTPUT_PDF_PATH = path.resolve(__dirname, '../docs/pricing/INTERNAL_COST_PROPOSAL_AND_NEGOTIATION.pdf');

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
  <title>HỒ SƠ ĐỀ XUẤT CHI PHÍ & ĐÀM PHÁN HỢP ĐỒNG CHUYỂN ĐỔI SỐ - THANH XUÂN COMPANY</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
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
      font-size: 9.75pt;
      line-height: 1.6;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    /* Executive Cover Header */
    .proposal-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1e40af 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
      border-bottom: 4px solid #10b981;
      page-break-inside: avoid;
    }
    .proposal-header .brand-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 10px;
    }
    .proposal-header .brand-title {
      font-size: 10pt;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #93c5fd;
    }
    .proposal-header .confidential-tag {
      background-color: rgba(239, 68, 68, 0.2);
      border: 1px solid #f87171;
      color: #fecaca;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .proposal-header h1 {
      font-size: 17pt;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 6px 0;
      line-height: 1.3;
      border-bottom: none;
      padding-bottom: 0;
    }
    .proposal-header .sub-headline {
      font-size: 11pt;
      font-weight: 500;
      color: #cbd5e1;
      margin-bottom: 16px;
    }
    .proposal-header .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      background: rgba(255, 255, 255, 0.08);
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 8.5pt;
    }
    .proposal-header .meta-item strong {
      color: #e2e8f0;
      font-weight: 600;
    }
    .proposal-header .meta-item span {
      color: #94a3b8;
    }

    /* Headings */
    h1 {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 6px;
      margin-top: 26px;
      margin-bottom: 14px;
      line-height: 1.35;
      page-break-after: avoid;
    }
    h2 {
      font-size: 12.5pt;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 5px;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10.75pt;
      font-weight: 700;
      color: #0369a1;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    h4 {
      font-size: 10pt;
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
    .page-break-before {
      page-break-before: always;
    }
    .no-break {
      page-break-inside: avoid;
    }

    /* Blockquotes / Callout boxes */
    blockquote {
      margin: 14px 0;
      padding: 12px 18px;
      background-color: #f8fafc;
      border-left: 4px solid #3b82f6;
      border-radius: 6px;
      color: #334155;
      font-size: 9.25pt;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      page-break-inside: avoid;
    }
    blockquote p:last-child {
      margin-bottom: 0;
    }

    /* Highlight badge for specific callouts */
    blockquote:has(strong:contains("CAM KẾT")),
    blockquote:has(strong:contains("Cam Kết")) {
      background-color: #f0fdf4;
      border-left-color: #10b981;
      color: #166534;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 8.75pt;
      line-height: 1.45;
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
      padding: 8px 10px;
      border: 1px solid #1e3a8a;
      font-size: 8.5pt;
      letter-spacing: 0.3px;
    }
    th:first-child {
      text-align: center;
    }
    td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
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

    /* Mermaid Container */
    .mermaid-container {
      margin: 18px 0;
      padding: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      text-align: center;
      page-break-inside: avoid;
    }
    .mermaid svg {
      max-width: 100% !important;
      height: auto !important;
    }

    /* Code blocks & ASCII tables */
    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      line-height: 1.45;
      overflow-x: auto;
      margin: 14px 0;
      page-break-inside: avoid;
      border-left: 4px solid #10b981;
    }
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
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

    /* Special Pricing Tag */
    .highlight-price {
      background-color: #fef08a;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      color: #854d0e;
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
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #1e3a8a;
      margin-bottom: 4px;
    }
    .signature-box .role-sub {
      font-size: 8pt;
      color: #64748b;
      margin-bottom: 50px;
    }
    .signature-box .signer-name {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      border-top: 1px solid #e2e8f0;
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

      // 2. Render Mermaid
      try {
        if (typeof mermaid !== 'undefined') {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
              primaryColor: '#e0e7ff',
              primaryTextColor: '#1e1b4b',
              primaryBorderColor: '#6366f1',
              lineColor: '#4338ca',
              secondaryColor: '#f0fdf4',
              tertiaryColor: '#fef2f2',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif'
            },
            flowchart: {
              curve: 'basis',
              padding: 14
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

async function generateProposalPdf() {
  console.log('🚀 Bắt đầu quá trình biên dịch tài liệu Đề Xuất Chi Phí sang PDF...');
  console.log(`📄 Nguồn: ${INPUT_MD_PATH}`);
  console.log(`🎯 Đích:  ${OUTPUT_PDF_PATH}`);

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
    <div class="role-sub">(Ký, ghi rõ họ tên và đóng dấu)</div>
    <div class="signer-name">BAN GIÁM ĐỐC CÔNG TY</div>
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
  const page = await context.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__RENDER_DONE__ === true, { timeout: 25000 });
    // Chờ thêm 800ms để đảm bảo SVG vector Mermaid và Google Fonts render hoàn hảo
    await page.waitForTimeout(800);

    await page.pdf({
      path: OUTPUT_PDF_PATH,
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
        <div style="font-family: 'Inter', sans-serif; font-size: 8pt; color: #475569; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
          <span style="font-weight: 700; color: #1e3a8a;">CÔNG TY TNHH & CP GIẶT LÀ THANH XUÂN</span>
          <span style="color: #64748b;">HỒ SƠ ĐỀ XUẤT GIẢI PHÁP & CHI PHÍ CHUYỂN ĐỔI SỐ</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-family: 'Inter', sans-serif; font-size: 8pt; color: #64748b; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 4px;">
          <span>Tài liệu thương mại bảo mật • Hotline Kỹ Thuật: 098.243.2288</span>
          <span>Trang <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      `
    });

    const stats = fs.statSync(OUTPUT_PDF_PATH);
    const sizeKb = (stats.size / 1024).toFixed(1);
    console.log(`\n======================================================`);
    console.log(`✅ XUẤT THÀNH CÔNG HỒ SƠ PDF: ${path.basename(OUTPUT_PDF_PATH)}`);
    console.log(`📊 Dung lượng file: ${sizeKb} KB`);
    console.log(`📍 Đường dẫn: ${OUTPUT_PDF_PATH}`);
    console.log(`======================================================\n`);
  } finally {
    await page.close();
    await browser.close();
  }
}

generateProposalPdf().catch(err => {
  console.error('❌ Lỗi khi sinh PDF:', err);
  process.exit(1);
});
