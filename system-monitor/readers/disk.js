// system-monitor/readers/disk.js
const { execSync } = require('child_process');

function getDisk() {
  try {
    const out = execSync("df / --output=pcent 2>/dev/null | tail -1", { encoding: 'utf8' });
    return parseInt(out.trim()) || 0;
  } catch { return 0; }
}

module.exports = { getDisk };