import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from '../../be-nestjs-thanhxuan/node_modules/.pnpm/marked@15.0.12/node_modules/marked/lib/marked.esm.js';
import { chromium } from '../../fe-nextjs-thanhxuan-laundry/node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRICING_DIR = path.resolve(__dirname, '../docs/client/pricing');

// Danh sách 3 bộ hồ sơ định giá cần xuất PDF
const PROPOSAL_DOCUMENTS = [
  {
    inputMd: path.join(PRICING_DIR, 'pricing_laundry.md'),
    outputPdf: path.join(PRICING_DIR, 'pricing_laundry.pdf'),
    docTitle: 'HỒ SƠ ĐỀ XUẤT GIẢI PHÁP & CHI PHÍ WEBSITE LAUNDRY EXPRESS & MARKETING AUTOMATION',
    headerSub: 'WEB GIẶT LÀ & MARKETING CSKH AUTOMATION'
  },
  {
    inputMd: path.join(PRICING_DIR, 'pricing_moving.md'),
    outputPdf: path.join(PRICING_DIR, 'pricing_moving.pdf'),
    docTitle: 'HỒ SƠ ĐỀ XUẤT GIẢI PHÁP & CHI PHÍ WEBSITE CHUYỂN NHÀ TIẾT KIỆM & BÁO GIÁ XE TẢI',
    headerSub: 'WEB CHUYỂN NHÀ & BÁO GIÁ CƯỚC XE TẢI'
  },
  {
    inputMd: path.join(PRICING_DIR, 'pricing_internal.md'),
    outputPdf: path.join(PRICING_DIR, 'pricing_internal.pdf'),
    docTitle: 'HỒ SƠ ĐỀ XUẤT GIẢI PHÁP & CHI PHÍ ĐẦU TƯ CỔNG VẬN HÀNH NỘI BỘ & LOGISTICS PWA',
    headerSub: 'CỔNG VẬN HÀNH XƯỞNG & LOGISTICS B2B PWA'
  }
];

function sanitizeContent(text) {
  return text
    // Chuyển toàn bộ Emoji sang ký tự vector đơn sắc nằm trong font chuẩn, triệt tiêu 100% Type 3 Font Pattern
    .replace(/🎯/g, '●')
    .replace(/👉/g, '▶')
    .replace(/💰/g, '●')
    .replace(/🌐/g, '●')
    .replace(/🏷️/g, '●')
    .replace(/🏷/g, '●')
    .replace(/⚙️/g, '●')
    .replace(/⚙/g, '●')
    .replace(/⚡/g, '★')
    .replace(/❌/g, '✕')
    .replace(/⚖️/g, '●')
    .replace(/⚖/g, '●')
    .replace(/\$\\rightarrow\$/g, ' &rarr; ')
    .replace(/\\rightarrow/g, ' &rarr; ');
}

function buildHtml(markdownContent, documentTitle) {
  const renderer = new marked.Renderer();
  const originalCodeRenderer = renderer.code.bind(renderer);
  
  // Dùng <div> thay vì <pre> cho Mermaid để không bị dính background đen và style của code block
  renderer.code = function(code, lang, escaped) {
    const text = typeof code === 'object' ? code.text : code;
    const language = typeof code === 'object' ? code.lang : lang;
    if (language === 'mermaid') {
      return `<div class="mermaid-container"><div class="mermaid">${text}</div></div>`;
    }
    return originalCodeRenderer(code, lang, escaped);
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: false
  });

  // 1. Sanitize emoji sang vector symbols chuẩn
  const cleanMarkdown = sanitizeContent(markdownContent);

  // 2. Tự động thêm ngắt trang trước PHẦN 1 để Trang 1 là Bìa & Mục lục tổng quan trang trọng,
  // giúp Trang 2 bắt đầu trọn vẹn từ đỉnh trang, không bao giờ bị trang trắng hay đứt đoạn!
  let adjustedMarkdown = cleanMarkdown.replace(
    /(\n##\s+PHẦN\s+1[:\s])/i,
    '\n<div class="page-break-section"></div>\n$1'
  );

  const parsedBody = marked.parse(adjustedMarkdown);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
  <style>
    @page {
      size: A4 portrait;
      /* Không đặt margin tại đây để Chromium tuân thủ 100% margin truyền vào page.pdf() */
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      /* Dùng Segoe UI chuẩn hệ thống Windows hỗ trợ 100% tiếng Việt mượt mà không lỗi font */
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Tahoma, Geneva, Verdana, sans-serif;
      font-size: 9.5pt;
      line-height: 1.55;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    /* Ngắt trang chủ động */
    .page-break-section {
      page-break-before: always;
      break-before: always;
      height: 0;
      margin: 0;
      padding: 0;
    }

    /* Headings */
    h1 {
      font-size: 15pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 12px;
      line-height: 1.35;
      page-break-after: avoid;
      break-after: avoid;
    }
    h2 {
      font-size: 11.5pt;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
      break-after: avoid;
    }
    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0369a1;
      margin-top: 12px;
      margin-bottom: 6px;
      page-break-after: avoid;
      break-after: avoid;
    }
    h4 {
      font-size: 9.75pt;
      font-weight: 600;
      color: #334155;
      margin-top: 8px;
      margin-bottom: 4px;
      page-break-after: avoid;
      break-after: avoid;
    }

    /* Paragraphs & Text */
    p {
      margin-top: 0;
      margin-bottom: 6px;
      text-align: justify;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 8px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 3px;
      text-align: justify;
    }
    strong {
      color: #0f172a;
      font-weight: 700;
    }
    em {
      color: #475569;
    }

    /* Dividers */
    hr {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 14px 0;
    }

    /* Blockquotes / Callout boxes */
    blockquote {
      margin: 10px 0;
      padding: 9px 13px;
      background-color: #f8fafc;
      border-left: 4px solid #2563eb;
      border-radius: 4px;
      color: #334155;
      font-size: 9.25pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    blockquote p:last-child {
      margin-bottom: 0;
    }

    /* Tables - DÙNG MÀU ĐƠN SẮC TRÁNH LỖI PDF.js PATTERN */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 8.5pt;
      line-height: 1.45;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    thead {
      display: table-header-group;
    }
    th {
      background-color: #1e3a8a;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #1e3a8a;
      font-size: 8.5pt;
    }
    th:first-child {
      text-align: center;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
      color: #334155;
    }
    tbody tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Table alignments */
    td:first-child {
      text-align: center;
      font-weight: 600;
      color: #1e3a8a;
    }
    td:last-child {
      font-weight: 600;
      color: #0f172a;
    }

    /* Mermaid Sơ Đồ - NỀN TRẮNG SÁNG RÕ NÉT */
    .mermaid-container {
      margin: 16px 0;
      padding: 16px 10px 10px 10px;
      background: #ffffff !important;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .mermaid {
      background: #ffffff !important;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .mermaid svg {
      background-color: #ffffff !important;
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
    }
    .mermaid .node rect, 
    .mermaid .node circle, 
    .mermaid .node polygon {
      stroke-width: 1.5px !important;
      rx: 5px !important;
      ry: 5px !important;
    }
    .mermaid .node .label {
      font-size: 12.5px !important;
      font-weight: 700 !important;
      font-family: 'Segoe UI', Arial, sans-serif !important;
      fill: #0f172a !important;
    }
    .mermaid .edgeLabel {
      font-size: 11px !important;
      font-weight: 600 !important;
      font-family: 'Segoe UI', Arial, sans-serif !important;
      fill: #1e293b !important;
    }
    .mermaid .messageText {
      font-size: 11.5px !important;
      font-weight: 600 !important;
      fill: #0f172a !important;
      font-family: 'Segoe UI', Arial, sans-serif !important;
    }
    .mermaid .actor {
      font-size: 12px !important;
      font-weight: 700 !important;
      fill: #0f172a !important;
      font-family: 'Segoe UI', Arial, sans-serif !important;
    }
    .mermaid .actor-line {
      stroke: #2563eb !important;
      stroke-width: 1.5px !important;
    }
    .mermaid .noteText {
      font-size: 11px !important;
      font-weight: 600 !important;
      fill: #78350f !important;
      font-family: 'Segoe UI', Arial, sans-serif !important;
    }

    /* Code blocks & Inline Code */
    pre {
      background: #f8fafc;
      color: #0f172a;
      padding: 9px 12px;
      border-radius: 5px;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 8pt;
      line-height: 1.35;
      overflow-x: auto;
      margin: 10px 0;
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-left: 3.5px solid #2563eb;
    }
    code {
      font-family: Consolas, monospace;
      font-size: 8.5pt;
      padding: 1px 4px;
      background-color: #f1f5f9;
      color: #0369a1;
      border-radius: 3px;
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
      margin: 8px 0 !important;
      font-size: 1.02em !important;
    }

    /* Footer signature block */
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 22px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .signature-box {
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
      background-color: #f8fafc;
    }
    .signature-box .role-label {
      font-size: 8.25pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #1e3a8a;
      margin-bottom: 3px;
    }
    .signature-box .role-sub {
      font-size: 7.5pt;
      color: #64748b;
      margin-bottom: 40px;
    }
    .signature-box .signer-name {
      font-size: 8.75pt;
      font-weight: 700;
      color: #0f172a;
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      display: inline-block;
      min-width: 160px;
    }
  </style>
</head>
<body>

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
              {left: '\\\\(', right: '\\\\)', display: false},
              {left: '\\\\[', right: '\\\\]', display: true}
            ],
            throwOnError: false
          });
        }
      } catch (e) {
        console.error('KaTeX error:', e);
      }

      // 2. Render Mermaid - CẤU HÌNH SÁNG RÕ NÉT, NỀN TRẮNG
      try {
        if (typeof mermaid !== 'undefined') {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            themeVariables: {
              darkMode: false,
              background: '#ffffff',
              primaryColor: '#eff6ff',
              primaryTextColor: '#0f172a',
              primaryBorderColor: '#2563eb',
              lineColor: '#2563eb',
              textColor: '#0f172a',
              mainBkg: '#ffffff',
              nodeBorder: '#2563eb',
              actorBkg: '#eff6ff',
              actorBorder: '#2563eb',
              actorTextColor: '#0f172a',
              actorLineColor: '#3b82f6',
              signalColor: '#1e3a8a',
              signalTextColor: '#0f172a',
              labelBoxBkgColor: '#fef3c7',
              labelBoxBorderColor: '#d97706',
              labelTextColor: '#78350f',
              loopTextColor: '#0f172a',
              noteBkgColor: '#fef3c7',
              noteBorderColor: '#d97706',
              noteTextColor: '#78350f',
              activationBorderColor: '#2563eb',
              activationBkgColor: '#dbeafe',
              sequenceNumberColor: '#ffffff',
              fontSize: '12px',
              fontFamily: "'Segoe UI', Arial, sans-serif"
            },
            sequence: {
              diagramMarginX: 12,
              diagramMarginY: 25,
              actorMargin: 40,
              width: 125,
              height: 42,
              boxMargin: 8,
              boxTextMargin: 5,
              noteMargin: 10,
              messageMargin: 26,
              mirrorActors: true,
              useMaxWidth: true,
              showSequenceNumbers: true
            },
            flowchart: {
              curve: 'basis',
              nodeSpacing: 30,
              rankSpacing: 30,
              padding: 10,
              useMaxWidth: true
            }
          });
          await mermaid.run();

          // Xử lý trực tiếp DOM SVG để đảm bảo 100% nền trắng tinh, chữ đen rõ nét, không bị đen chìm
          document.querySelectorAll('.mermaid svg').forEach(svg => {
            svg.style.backgroundColor = '#ffffff';
            
            // Chèn rect màu trắng ở tầng đáy SVG chống suốt hoặc đen
            const firstChild = svg.firstElementChild;
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', '0');
            bgRect.setAttribute('y', '0');
            bgRect.setAttribute('width', '100%');
            bgRect.setAttribute('height', '100%');
            bgRect.setAttribute('fill', '#ffffff');
            svg.insertBefore(bgRect, firstChild);

            // Đảm bảo chữ actor và message hiển thị sắc nét
            svg.querySelectorAll('text').forEach(t => {
              const currentFill = t.getAttribute('fill');
              if (!currentFill || currentFill === '#ffffff' || currentFill === 'white') {
                // Giữ số sequence trong vòng tròn màu trắng
                if (!t.classList.contains('sequenceNumber')) {
                  t.setAttribute('fill', '#0f172a');
                }
              }
            });
          });
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

async function generateAllPdfs() {
  console.log('🚀 Bắt đầu quá trình xuất PDF chuẩn đẹp, sửa lỗi font tiếng Việt & Mermaid...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (const doc of PROPOSAL_DOCUMENTS) {
    if (!fs.existsSync(doc.inputMd)) {
      console.warn(`⚠️ Không tìm thấy file: ${doc.inputMd}, bỏ qua...`);
      continue;
    }

    console.log(`\n📄 Đang xử lý: ${path.basename(doc.inputMd)} -> ${path.basename(doc.outputPdf)}`);
    const rawMarkdown = fs.readFileSync(doc.inputMd, 'utf8');

    // Thêm khung chữ ký nếu chưa có
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
    <div class="signer-name">NGUYỄN VĂN HUY HOÀNG</div>
  </div>
</div>
`;
    }

    const html = buildHtml(processedMarkdown, doc.docTitle);
    const page = await context.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__RENDER_DONE__ === true, { timeout: 25000 });
      await page.waitForTimeout(800);

      await page.pdf({
        path: doc.outputPdf,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '18mm',
          left: '16mm',
          right: '16mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 7.75pt; color: #475569; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">
            <span style="font-weight: 700; color: #1e3a8a;">CÔNG TY TNHH KINH DOANH THƯƠNG MẠI VÀ DỊCH VỤ THANH XUÂN</span>
            <span style="color: #64748b; font-weight: 600;">${doc.headerSub}</span>
          </div>
        `,
        footerTemplate: `
          <div style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 7.75pt; color: #64748b; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 3px;">
            <span>Hồ sơ đề xuất thương mại • Hotline Kỹ Thuật: 0888.765.650</span>
            <span>Trang <span class="pageNumber"></span> / <span class="totalPages"></span></span>
          </div>
        `
      });

      const stats = fs.statSync(doc.outputPdf);
      const sizeKb = (stats.size / 1024).toFixed(1);
      console.log(`✅ Xuất thành công: ${path.basename(doc.outputPdf)} (${sizeKb} KB)`);
    } catch (err) {
      console.error(`❌ Lỗi khi xuất PDF ${doc.outputPdf}:`, err);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n🎉 ĐÃ HOÀN TẤT BIÊN DỊCH TRỌN BỘ 3 FILE PDF SÁNG ĐẸP, SỬA HẾT LỖI!\n');
}

generateAllPdfs().catch(err => {
  console.error('❌ Lỗi chương trình:', err);
  process.exit(1);
});
