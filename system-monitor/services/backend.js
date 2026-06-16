// system-monitor/services/backend.js
async function post(path, body, BACKEND_URL) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000)
  });
  return res.json();
}

module.exports = { post };