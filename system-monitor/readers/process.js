// system-monitor/readers/process.js
const { execSync } = require('child_process');

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

module.exports = { getTopProc };