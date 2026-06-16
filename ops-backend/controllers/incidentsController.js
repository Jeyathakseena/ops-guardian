// ops-backend/controllers/incidentsController.js
const incidentQuery = require('../queries/incidentQuery');
const broadcastService = require('../services/broadcastService');

exports.postIncident = async (req, res, next) => {
  try {
    const existing = await incidentQuery.findOneActiveByPid(req.body.targetPid);
    if (existing) {
      return res.json({ ok: true, message: 'Incident already active for this PID' });
    }

    await incidentQuery.create(req.body);

    const latest = await incidentQuery.findLatest(5);
    broadcastService.broadcast({ type: 'incident', data: latest });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.getIncidents = async (_, res, next) => {
  try {
    const docs = await incidentQuery.findLatest(5);
    res.json(docs);
  } catch (err) {
    next(err);
  }
};