// ops-backend/controllers/incidentsController.js
const incidentQuery = require('../queries/incidentQuery');
const broadcastService = require('../services/broadcastService');

exports.postIncident = async (incident) => {
  const existing = await incidentQuery.findOneActiveByPid(incident.targetPid);
  if (existing) {
    return { ok: true, message: 'Incident already active for this PID' };
  }

  await incidentQuery.create(incident);
  const latest = await incidentQuery.findLatest(5);
  broadcastService.broadcast({ type: 'incident', data: latest });

  return { ok: true };
};

exports.getIncidents = async () => {
  const docs = await incidentQuery.findLatest(5);
  return docs;
};