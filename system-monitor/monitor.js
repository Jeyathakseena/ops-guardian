// system-monitor/monitor.js
const { getCpu } = require('./readers/cpu');
const { getMem } = require('./readers/memory');
const { getDisk } = require('./readers/disk');
const { getTopProc } = require('./readers/process');
const { callOllama } = require('./services/ollama');
const { post } = require('./services/backend');

async function tick(config) {
  const cpu = getCpu();
  const memory = getMem();
  const disk = getDisk();

  console.log(`[Monitor] CPU: ${cpu}%  MEM: ${memory}%  DISK: ${disk}%`);

  // Always send live metrics to the backend (for the dashboard bars)
  await post(config.BACKEND_URL + '/api/metrics/metrics', { cpu, memory, disk })
    .catch(e => console.error('[Metrics Push Error]', e.message));

  const now = Date.now();
  if (Math.max(cpu, memory, disk) > config.THRESHOLD && now > config.cooldownUntil) {
    console.log('[ALERT] Threshold breached — triggering AI analysis...');
    config.cooldownUntil = now + config.COOLDOWN_MS;  // lock for 60 seconds immediately

    const proc = getTopProc();
    try {
      const ai = await callOllama({ cpu, memory, disk }, proc, config.OLLAMA_URL);
      console.log(`[AI] Target PID: ${ai.targetPid} | Reason: ${ai.reasoning}`);

      await post(config.BACKEND_URL + '/api/incidents/incident', 
        {
          cpu, memory, disk,
          targetPid: ai.targetPid,
          reasoning: ai.reasoning,
          processName: proc.cmd
        });
    } catch (err) {
      console.error('[AI Error]', err.message);
      config.cooldownUntil = now + 10_000;  // shorter retry window on failure
    }
  }
}

module.exports = { tick };