// Antigravity Stop hook: trước khi agent kết thúc, typecheck các app có file .ts/.tsx thay đổi.
// Nếu lỗi, buộc agent tiếp tục sửa. Đặt tại: <root>/.agents/hooks/verify-on-stop.js
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const APPS = [
  'be-nestjs-thanhxuan',
  'fe-nextjs-thanhxuan-laundry',
  'fe-react-thanhxuan-internal',
  'fe-nextjs-chuyennhatietkiem',
];
const TYPECHECK_CMD = 'pnpm exec tsc --noEmit';
const MAX_EXECUTIONS = 2; // chống lặp vô hạn nếu lỗi baseline có sẵn
const TIMEOUT_MS = 120000;
const STOP_REASONS = new Set(['NO_TOOL_CALL', 'model_stop']);

const readStdin = () =>
  new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
  });

const respond = (obj) => {
  process.stdout.write(JSON.stringify(obj));
  process.exit(0);
};
const allowStop = () => {
  return respond({ decision: 'stop' });
};

(async () => {
  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    return allowStop();
  }

  if (!STOP_REASONS.has(input.terminationReason) || input.fullyIdle === false) return allowStop();

  const counterFile = path.join(__dirname, '.stop_counter');
  let execCount = 1;
  try {
    if (fs.existsSync(counterFile)) {
      const data = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
      if (Date.now() - (data.time || 0) < 5 * 60 * 1000) {
        execCount = (data.count || 0) + 1;
      }
    }
  } catch {}

  if (execCount >= MAX_EXECUTIONS || (input.executionNum ?? 1) >= MAX_EXECUTIONS) {
    try {
      fs.writeFileSync(counterFile, JSON.stringify({ count: execCount, time: Date.now() }), 'utf8');
    } catch {}
    return allowStop();
  }

  const root = (input.workspacePaths || [])[0];
  if (!root) return allowStop();

  const appsToVerify = [];

  for (const app of APPS) {
    const appDir = path.join(root, app);
    if (!fs.existsSync(appDir)) continue;

    // Kiểm tra thay đổi trong từng sub-repository
    const git = spawnSync('git', ['status', '--porcelain'], { cwd: appDir, encoding: 'utf8' });
    if (git.status !== 0 || !git.stdout) continue;

    const hasTsChanges = git.stdout
      .split('\n')
      .filter(Boolean)
      .some((line) => {
        const filePath = line.slice(3).split(' -> ').pop().replace(/"/g, '').trim();
        return /\.(ts|tsx)$/.test(filePath);
      });

    if (hasTsChanges) {
      appsToVerify.push(app);
    }
  }

  if (appsToVerify.length === 0) {
    try {
      if (fs.existsSync(counterFile)) fs.unlinkSync(counterFile);
    } catch {}
    return allowStop();
  }

  const failures = [];
  for (const app of appsToVerify) {
    const appDir = path.join(root, app);
    const r = spawnSync(TYPECHECK_CMD, { cwd: appDir, shell: true, encoding: 'utf8', timeout: TIMEOUT_MS });
    if (r.status !== 0) {
      const out = `${r.stdout || ''}${r.stderr || ''}`.split('\n').filter(Boolean).slice(0, 30).join('\n');
      failures.push(`[${app}] typecheck lỗi:\n${out}`);
    }
  }

  if (failures.length === 0) {
    try {
      if (fs.existsSync(counterFile)) fs.unlinkSync(counterFile);
    } catch {}
    return allowStop();
  }

  try {
    fs.writeFileSync(counterFile, JSON.stringify({ count: execCount, time: Date.now() }), 'utf8');
  } catch {}

  respond({
    decision: 'continue',
    reason: `Typecheck chưa pass, hãy sửa trước khi kết thúc (nếu là lỗi baseline có sẵn thì báo cáo riêng, không sửa lan man):\n${failures.join('\n\n')}`,
  });
})();
