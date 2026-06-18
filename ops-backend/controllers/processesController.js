// ops-backend/controllers/processesController.js
const incidentQuery = require('../queries/incidentQuery');
const broadcastService = require('../services/broadcastService');
const { execSync } = require('child_process');

exports.killProcess = async ({ pid, incidentId }) => {
  if (!pid || !incidentId) {
    throw new Error('pid and incidentId are required');
  }

  try {
    try {
      execSync(`kill -9 ${parseInt(pid)}`, { stdio: 'ignore' });
    } catch (e) {
      console.log(`[Backend] Process ${pid} might already be terminated.`);
    }

    await incidentQuery.updateResolved(incidentId);
    const latest = await incidentQuery.findLatest(5);
    broadcastService.broadcast({ type: 'incident', data: latest });

    return { ok: true, message: `PID ${pid} handled successfully` };
  } catch (err) {
    throw err;
  }
};