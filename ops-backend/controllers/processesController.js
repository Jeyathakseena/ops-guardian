// ops-backend/controllers/processesController.js
const incidentQuery = require('../queries/incidentQuery');
const broadcastService = require('../services/broadcastService');
const { execSync } = require('child_process');

exports.killProcess = async (req, res, next) => {
  const { pid, incidentId } = req.body;
  if (!pid || !incidentId) return res.status(400).json({ error: 'pid and incidentId are required' });

  try {
    try {
      execSync(`kill -9 ${parseInt(pid)}`, { stdio: 'ignore' });
    } catch (e) {
      console.log(`[Backend] Process ${pid} might already be terminated.`);
    }
    
    await incidentQuery.updateResolved(incidentId);
    const latest = await incidentQuery.findLatest(5);
    broadcastService.broadcast({ type: 'incident', data: latest });

    res.json({ ok: true, message: `PID ${pid} handled successfully` });
  } catch (err) {
    next(err);
  }
};