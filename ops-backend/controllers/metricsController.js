// ops-backend/controllers/metricsController.js
const broadcastService = require('../services/broadcastService');

exports.getMetrics = () => {
  return broadcastService.getLiveMetrics();
};

exports.postMetrics = async (metrics) => {
  broadcastService.setLiveMetrics(metrics);
  broadcastService.broadcast({ type: 'metrics', data: metrics });
  return { ok: true };
};

exports.getHealth = () => {
  return { status: 'ok' };
};