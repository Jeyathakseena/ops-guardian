// ops-backend/controllers/incidentsController.js
const incidentQuery = require('../queries/incidentQuery');
const broadcastService = require('../services/broadcastService');

exports.postIncident = (incident) => {
  return incidentQuery.findOneActiveByPid(incident.targetPid)
    .then((existing) => {
      if (existing) {
        return { ok: true, message: 'Incident already active for this PID' };
      }

      return incidentQuery.create(incident)
        .then(() => incidentQuery.findLatest(5))
        .then((latest) => {
          broadcastService.broadcast({ type: 'incident', data: latest });
          return { ok: true };
        });
    });
};

exports.getIncidents = () => {
  return incidentQuery.findLatest(5);
};