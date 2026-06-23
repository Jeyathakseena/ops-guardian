// ops-backend/controllers/metricsController.js
const fs = require('fs');
const path = require('path');
const Metric = require('../models/Metric');
const broadcastService = require('../services/broadcastService');

exports.getHealth = () => {
  return Promise.resolve({ status: 'ok' });
};

exports.getMetrics = () => {
  return Promise.resolve(broadcastService.getLiveMetrics());
};

exports.postMetrics = async (metrics) => {
  broadcastService.setLiveMetrics(metrics);
  broadcastService.broadcast({ type: 'metrics', data: metrics });

  // Persist snapshot to MongoDB history
  await Metric.create({
    cpu: metrics.cpu,
    memory: metrics.memory,
    disk: metrics.disk
  });

  return { ok: true };
};

// Generates and returns a downloadable historical CSV file route
exports.exportMetricsToFile = async () => {
  const records = await Metric.find()
    .sort({ createdAt: -1 })
    .limit(2000);
  
  records.reverse();
  // Create CSV format Header and rows
  let csvContent = 'Timestamp,CPU (%),Memory (%),Disk (%)\n';
  
  records.forEach(record => {
    const time = record.createdAt.toISOString();
    csvContent += `${time},${record.cpu},${record.memory},${record.disk}\n`;
  });

  const fileName = 'historical-metrics.csv';
  const filePath = path.join(__dirname, '../../', fileName);
  
  fs.writeFileSync(filePath, csvContent, 'utf8');
  return filePath;
};