// system-monitor/readers/memory.js
const fs = require('fs');

function getMem() {
  const text = fs.readFileSync('/proc/meminfo', 'utf8');
  const get = key => parseInt(text.match(new RegExp(`${key}:\\s+(\\d+)`))?.[1] || '0');
  const total = get('MemTotal');
  const avail = get('MemAvailable');
  return total ? Math.round(((total - avail) / total) * 100) : 0;
}

module.exports = { getMem };