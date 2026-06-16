// ops-backend/controllers/metricsController.js
const broadcastService = require('../services/broadcastService');

exports.getMetrics = (_, res) => {
  res.json(broadcastService.getLiveMetrics());
};

exports.postMetrics = (req, res) => {
  broadcastService.setLiveMetrics(req.body);
  broadcastService.broadcast({ type: 'metrics', data: req.body });
  res.json({ ok: true });
};

exports.getHealth = (_, res) => res.json({ status: 'ok' });