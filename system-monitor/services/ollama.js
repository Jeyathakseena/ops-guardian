// system-monitor/services/ollama.js
async function callOllama(metrics, proc, OLLAMA_URL) {
  const prompt =
    `Linux system alert. CPU: ${metrics.cpu}%, Memory: ${metrics.memory}%, Disk: ${metrics.disk}%. ` +
    `Top process — PID: ${proc.pid}, Command: ${proc.cmd}, CPU: ${proc.cpu}%, MEM: ${proc.mem}%. ` +
    `Respond ONLY with this JSON (no markdown, no extra text): ` +
    `{"targetPid": ${proc.pid}, "reasoning": "brief diagnosis here"}`;

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'qwen:4b', prompt, stream: false, format: 'json' }),
    signal: AbortSignal.timeout(45_000)
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.response);

  if (typeof parsed.targetPid !== 'number' || typeof parsed.reasoning !== 'string') {
    throw new Error('LLM returned unexpected format');
  }
  return parsed;
}

module.exports = { callOllama };