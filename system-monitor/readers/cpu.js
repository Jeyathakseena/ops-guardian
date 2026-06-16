// system-monitor/readers/cpu.js
const fs = require('fs');

let prevCpu = null;  // stored between ticks for delta CPU calc

function readCpuStat() {
  const line = fs.readFileSync('/proc/stat', 'utf8').split('\n')[0];
  const nums = line.trim().split(/\s+/).slice(1).map(Number);
  return {
    total: nums.reduce((a, b) => a + b, 0),
    idle: nums[3] + (nums[4] || 0)  // idle + iowait fields
  };
}

function getCpu() {
  const curr = readCpuStat();
  if (!prevCpu) { prevCpu = curr; return 0; }
  const dTotal = curr.total - prevCpu.total;
  const dIdle = curr.idle - prevCpu.idle;
  prevCpu = curr;
  return dTotal > 0 ? Math.round(((dTotal - dIdle) / dTotal) * 100) : 0;
}

module.exports = { getCpu };