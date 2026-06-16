// system-monitor/index.js
const config = require('./config/env');
const { tick } = require('./monitor');

// Add cooldown state to config
config.cooldownUntil = 0;  // epoch ms — no trigger allowed before this

async function main() {
  console.log('[OpsGuardian Monitor] Starting — waiting 8s for services to be ready...');
  await new Promise(r => setTimeout(r, 8_000));

  await tick(config);  // run once immediately
  setInterval(() => tick(config), config.INTERVAL_MS);  // then every 5 seconds
}

main().catch(console.error);