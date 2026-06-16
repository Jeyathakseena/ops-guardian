// system-monitor/config/env.js
module.exports = {
  BACKEND_URL: process.env.BACKEND_URL,
  OLLAMA_URL: process.env.OLLAMA_URL,
  THRESHOLD: 30,          // percent
  COOLDOWN_MS: 60_000,    // 60-second lock after an AI trigger
  INTERVAL_MS: 5_000      // polling interval
};