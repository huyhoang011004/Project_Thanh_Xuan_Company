// Antigravity PreToolUse hook: chặn thao tác nguy hiểm và vi phạm rule kiểm tra được bằng regex.
// Đặt tại: <root>/.agents/hooks/guard.js
const DEFAULT_DECISION = "allow";

const readStdin = () =>
  new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
  });

const respond = (decision, reason) => {
  process.stdout.write(
    JSON.stringify(reason ? { decision, reason } : { decision }),
  );
  process.exit(0);
};

// Lệnh bị chặn cứng (khớp AGENTS.md mục 1 và 6)
const DENY_COMMANDS = [
  [
    /\brm\s+.*(-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)\b/,
    "Không chạy rm đệ quy. Hãy xóa từng file cụ thể hoặc hỏi người dùng.",
  ],
  [/\brmdir\s+.*\/s\b/i, "Không xóa thư mục đệ quy."],
  [/\bRemove-Item\b.*-Recurse/i, "Không xóa thư mục đệ quy."],
  [/\bdel\s+.*\/s\b/i, "Không xóa đệ quy."],
  [/\bgit\s+reset\s+--hard\b/, "Không chạy git reset --hard."],
  [/\bgit\s+clean\s+-[a-zA-Z]*f/, "Không chạy git clean -f."],
  [
    /\bgit\s+push\b.*(--force\b|--force-with-lease\b|\s-f\b)/,
    "Không force push.",
  ],
  [
    /\bgit\s+push\s+(?:--\S+\s+)*(?:origin\s+)?(?:HEAD:)?(master|main)\b/,
    "Không push trực tiếp lên nhánh master/main (bảo vệ môi trường Production). Chỉ push lên nhánh dev.",
  ],
  [
    /\bdocker[- ]compose\b.*\bbuild\b/,
    "Build Docker image chỉ thực hiện trên GitHub Actions, không build trên VPS/local bằng docker compose.",
  ],
  [
    /dropDatabase|\.drop\(\)|\bdrop\s+(database|collection)\b|deleteMany\(\s*\{\s*\}\s*\)/i,
    "Không chạy lệnh phá hủy dữ liệu trên database.",
  ],
  [
    /(^|[\s"'\/\\=])\.env(\.(?!example\b)[\w.-]+)?(?=$|[\s"'|;&)])/,
    "Không đọc/in/sửa file .env. Chỉ nhắc tên biến và cập nhật .env.example.",
  ],
];

// Lệnh cần người dùng xác nhận
const ASK_COMMANDS = [
  [/\b(pnpm|npm|yarn)\s+add\b/, "Cài dependency mới cần nằm trong plan."],
  [
    /\b(pnpm|npm)\s+(i|install)\s+[^-\s]/,
    "Cài dependency mới cần nằm trong plan.",
  ],
];

const ENV_PATH = /(^|\/)\.env(\.(?!example$)[^/]*)?$/;
const SENSITIVE_PATH =
  /(^|\/)(\.github\/workflows\/|docker-compose[^/]*\.ya?ml$|Dockerfile[^/]*$)/;
const WRITE_TOOLS = new Set([
  "write_file",
  "edit_file",
  "write_to_file",
  "replace_file_content",
  "multi_replace_file_content",
]);

const collectContent = (a = {}) =>
  [
    a.Content,
    a.Replacement,
    a.CodeContent,
    a.ReplacementContent,
    ...(a.ReplacementChunks || []).map((c) => c.ReplacementContent),
  ]
    .filter((x) => typeof x === "string")
    .join("\n");

// Rule code kiểm tra được bằng regex (khớp AGENTS.md mục 5)
const CODE_RULES = [
  {
    test: (p) => /\.(ts|tsx)$/.test(p),
    re: /(:\s*any\b|\bas\s+any\b|<any\b|\bany\[\])/,
    reason:
      "Cấm dùng kiểu any. Dùng unknown rồi narrow, hoặc khai báo type/interface rõ ràng.",
  },
  {
    test: (p) => /\.(ts|tsx)$/.test(p),
    re: /setHours\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/,
    reason:
      "Không dùng setHours(0,0,0,0). Dùng startOfDayVN/endOfDayVN/getDatePrefixVN (Asia/Ho_Chi_Minh).",
  },
  {
    test: (p) => /\.(service|controller)\.ts$/.test(p),
    re: /@InjectModel\b/,
    reason:
      "Không inject Mongoose Model vào Service/Controller. Mọi truy vấn DB nằm ở tầng Repository.",
  },
];

(async () => {
  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    return respond(DEFAULT_DECISION);
  }

  const name = input?.toolCall?.name;
  const args = input?.toolCall?.args || {};

  if (name === "run_command") {
    const cmd = String(args.CommandLine || "");
    for (const [re, reason] of DENY_COMMANDS)
      if (re.test(cmd)) return respond("deny", reason);
    for (const [re, reason] of ASK_COMMANDS)
      if (re.test(cmd)) return respond("force_ask", reason);
    return respond(DEFAULT_DECISION);
  }

  const target = String(
    args.Path || args.TargetFile || args.AbsolutePath || "",
  ).replace(/\\/g, "/");

  if (target && ENV_PATH.test(target)) {
    return respond(
      "deny",
      "Không đọc/ghi file .env. Chỉ nhắc tên biến và cập nhật .env.example.",
    );
  }

  if (WRITE_TOOLS.has(name)) {
    if (SENSITIVE_PATH.test(target)) {
      return respond(
        "force_ask",
        "File CI/CD hoặc Docker chỉ sửa khi plan đã duyệt cho phép.",
      );
    }
    const content = collectContent(args);
    for (const rule of CODE_RULES) {
      if (rule.test(target) && rule.re.test(content))
        return respond("deny", rule.reason);
    }
  }

  return respond(DEFAULT_DECISION);
})();
