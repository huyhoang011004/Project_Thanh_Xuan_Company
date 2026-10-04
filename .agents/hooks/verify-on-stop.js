// Antigravity Stop hook: trước khi agent kết thúc, typecheck các app có file .ts/.tsx thay đổi.
// Nếu lỗi, buộc agent tiếp tục sửa. Đặt tại: <root>/.agents/hooks/verify-on-stop.js
const { spawnSync } = require('child_process');

const APPS = ['be-nestjs-thanhxuan', 'fe-nextjs-thanhxuan-laundry', 'fe-react-thanhxuan-internal'];
const TYPECHECK_CMD = 'pnpm exec tsc --noEmit'; // sửa cho đúng package manager thật
const MAX_EXECUTIONS = 2; // chống lặp vô hạn nếu lỗi baseline có sẵn
const TIMEOUT_MS = 120000;

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
const allowStop = () => respond({ decision: 'stop' });

(async () => {
  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    return allowStop();
  }

  if (input.terminationReason !== 'model_stop' || input.fullyIdle === false) return allowStop();
  if ((input.executionNum ?? 1) > MAX_EXECUTIONS) return allowStop();

  const root = (input.workspacePaths || [])[0];
  if (!root) return allowStop();

  const git = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  if (git.status !== 0) return allowStop();

  const changed = git.stdout
    .split('\n')
    .filter(Boolean)
    .map((l) => l.slice(3).split(' -> ').pop().replace(/"/g, ''))
    .filter((f) => /\.(ts|tsx)$/.test(f));

  const apps = APPS.filter((app) => changed.some((f) => f.startsWith(app + '/')));
  if (apps.length === 0) return allowStop();

  const failures = [];
  for (const app of apps) {
    const r = spawnSync(TYPECHECK_CMD, { cwd: `${root}/${app}`, shell: true, encoding: 'utf8', timeout: TIMEOUT_MS });
    if (r.status !== 0) {
      const out = `${r.stdout || ''}${r.stderr || ''}`.split('\n').filter(Boolean).slice(0, 30).join('\n');
      failures.push(`[${app}] typecheck lỗi:\n${out}`);
    }
  }

  if (failures.length === 0) return allowStop();
  respond({
    decision: 'continue',
    reason: `Typecheck chưa pass, hãy sửa trước khi kết thúc (nếu là lỗi baseline có sẵn thì báo cáo riêng, không sửa lan man):\n${failures.join('\n\n')}`,
  });
})();
