'use strict';

const fs             = require('fs');
const { execSync }   = require('child_process');

const BACKEND_URL = process.env.BACKEND_URL || 'http://ops-backend:3001';
const OLLAMA_URL  = process.env.OLLAMA_URL  || 'http://ops-llm:11434';
const THRESHOLD   = 30;          // percent
const COOLDOWN_MS = 60_000;      // 60-second lock after an AI trigger
const INTERVAL_MS = 5_000;       // polling interval

let cooldownUntil = 0;           // epoch ms — no trigger allowed before this
let prevCpu       = null;        // stored between ticks for delta CPU calc

// ── Metric Readers ──────────────────────────────────────────────────────────

function readCpuStat() {
  const line = fs.readFileSync('/proc/stat', 'utf8').split('\n')[0];
  const nums = line.trim().split(/\s+/).slice(1).map(Number);
  return {
    total : nums.reduce((a, b) => a + b, 0),
    idle  : nums[3] + (nums[4] || 0)   // idle + iowait fields
  };
}

function getCpu() {
  const curr = readCpuStat();
  if (!prevCpu) { prevCpu = curr; return 0; }
  const dTotal = curr.total - prevCpu.total;
  const dIdle  = curr.idle  - prevCpu.idle;
  prevCpu = curr;
  return dTotal > 0 ? Math.round(((dTotal - dIdle) / dTotal) * 100) : 0;
}

function getMem() {
  const text  = fs.readFileSync('/proc/meminfo', 'utf8');
  const get   = key => parseInt(text.match(new RegExp(`${key}:\\s+(\\d+)`))?.[1] || '0');
  const total = get('MemTotal');
  const avail = get('MemAvailable');
  return total ? Math.round(((total - avail) / total) * 100) : 0;
}

function getDisk() {
  try {
    const out = execSync("df / --output=pcent 2>/dev/null | tail -1", { encoding: 'utf8' });
    return parseInt(out.trim()) || 0;
  } catch { return 0; }
}

function getTopProc() {
  try {
    const out = execSync(
      "ps -eo pid,pcpu,pmem,comm --sort=-pcpu --no-headers 2>/dev/null | head -1",
      { encoding: 'utf8' }
    ).trim();
    const [pid, cpu, mem, ...cmd] = out.split(/\s+/);
    return { pid: parseInt(pid), cpu: parseFloat(cpu), mem: parseFloat(mem), cmd: cmd.join(' ') };
  } catch {
    return { pid: 1, cpu: 0, mem: 0, cmd: 'unknown' };
  }
}

// ── Ollama AI Call ──────────────────────────────────────────────────────────

async function callOllama(metrics, proc) {
  const prompt =
    `Linux system alert. CPU: ${metrics.cpu}%, Memory: ${metrics.memory}%, Disk: ${metrics.disk}%. ` +
    `Top process — PID: ${proc.pid}, Command: ${proc.cmd}, CPU: ${proc.cpu}%, MEM: ${proc.mem}%. ` +
    `Respond ONLY with this JSON (no markdown, no extra text): ` +
    `{"targetPid": ${proc.pid}, "reasoning": "brief diagnosis here"}`;

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method  : 'POST',
    headers : { 'Content-Type': 'application/json' },
    body    : JSON.stringify({ model: 'qwen:4b', prompt, stream: false, format: 'json' }),
    signal  : AbortSignal.timeout(45_000)
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data   = await res.json();
  const parsed = JSON.parse(data.response);

  if (typeof parsed.targetPid !== 'number' || typeof parsed.reasoning !== 'string') {
    throw new Error('LLM returned unexpected format');
  }
  return parsed;
}

// ── HTTP Helper ─────────────────────────────────────────────────────────────

async function post(path, body) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method  : 'POST',
    headers : { 'Content-Type': 'application/json' },
    body    : JSON.stringify(body),
    signal  : AbortSignal.timeout(10_000)
  });
  return res.json();
}

// ── Main Tick ───────────────────────────────────────────────────────────────

async function tick() {
  const cpu    = getCpu();
  const memory = getMem();
  const disk   = getDisk();

  console.log(`[Monitor] CPU: ${cpu}%  MEM: ${memory}%  DISK: ${disk}%`);

  // Always send live metrics to the backend (for the dashboard bars)
  await post('/api/metrics', { cpu, memory, disk })
    .catch(e => console.error('[Metrics Push Error]', e.message));

  const now = Date.now();
  if (Math.max(cpu, memory, disk) > THRESHOLD && now > cooldownUntil) {
    console.log('[ALERT] Threshold breached — triggering AI analysis...');
    cooldownUntil = now + COOLDOWN_MS;   // lock for 60 seconds immediately

    const proc = getTopProc();
    try {
      const ai = await callOllama({ cpu, memory, disk }, proc);
      console.log(`[AI] Target PID: ${ai.targetPid} | Reason: ${ai.reasoning}`);

      await post('/api/incident', {
        cpu, memory, disk,
        targetPid   : ai.targetPid,
        reasoning   : ai.reasoning,
        processName : proc.cmd
      });
    } catch (err) {
      console.error('[AI Error]', err.message);
      cooldownUntil = now + 10_000;  // shorter retry window on failure
    }
  }
}

// ── Entry Point ─────────────────────────────────────────────────────────────

async function main() {
  console.log('[OpsGuardian Monitor] Starting — waiting 8s for services to be ready...');
  await new Promise(r => setTimeout(r, 8_000));

  await tick();                           // run once immediately
  setInterval(tick, INTERVAL_MS);         // then every 5 seconds
}

main().catch(console.error);