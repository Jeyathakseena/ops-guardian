// system-monitor/services/backend.js
async function post(fullUrl, body) {
  const res = await fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000)
  });
  return res.json();
}

module.exports = { post };