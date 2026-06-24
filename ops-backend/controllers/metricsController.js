// ops-backend/controllers/metricsController.js
const fs = require('fs');
const path = require('path');
const Metric = require('../models/Metric');
const broadcastService = require('../services/broadcastService');

exports.getHealth = () => {
  return Promise.resolve({ status: 'ok' });
};


exports.getMetrics = async (req, res) => {
  try {
    if (!req || !res) {
      return Promise.resolve(broadcastService.getLiveMetrics());
    }

    const { range } = req.query;
    let cutoff = new Date();

    // Map your new filter strings to precise timestamps
    if (range === '1h') {
      cutoff.setHours(cutoff.getHours() - 1);
    } else if (range === '2h') {
      cutoff.setHours(cutoff.getHours() - 2);
    } else if (range === '4h') {
      cutoff.setHours(cutoff.getHours() - 4);
    } else if (range === '2d') {
      cutoff.setDate(cutoff.getDate() - 2);
    } else if (range === '7d') {
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (range === '30d') {
      cutoff.setDate(cutoff.getDate() - 30);
    } else {
      // Default: Past 24 hours (1d)
      cutoff.setDate(cutoff.getDate() - 1);
    }
     // find in the database by giving custom fikters
    const metrics = await Metric.find({
      $or: [
        { timestamp: { $gte: cutoff } },
        { createdAt: { $gte: cutoff } }
      ]
    }).sort({ timestamp: 1, createdAt: 1 });

    return res.json(metrics);
  } catch (err) {
    if (res && res.status) {
      return res.status(500).json({ error: err.message });
    }
    return Promise.resolve(broadcastService.getLiveMetrics());
  }
};

// 3. Capture Snapshot & Broadcast
exports.postMetrics = async (metrics) => {
  broadcastService.setLiveMetrics(metrics);
  broadcastService.broadcast({ type: 'metrics', data: metrics });

  // Persist snapshot to MongoDB history
  await Metric.create({
    cpu: metrics.cpu,
    memory: metrics.memory,
    disk: metrics.disk,
    timestamp: new Date()
  });

  return { ok: true };
};

// 4. Modern Export Route matching the downloadable endpoints logic
exports.exportMetricsToFile = async (req, res) => {
  try {
    const records = await Metric.find().sort({ timestamp: 1, createdAt: 1 });
    
    // Create clean CSV raw format header string line 
    let csvContent = 'Timestamp,CPU (%),Memory (%),Disk (%)\n';
    
    records.forEach(record => {
      const dateVal = record.timestamp || record.createdAt || new Date();
      const time = new Date(dateVal).toISOString();
      csvContent += `${time},${record.cpu},${record.memory},${record.disk}\n`;
    });

    // Check if called directly from an HTTP controller attachment framework path
    if (res && res.setHeader) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=historical-metrics.csv');
      return res.status(200).send(csvContent);
    }

    // Legacy file-system write fallback configuration
    const fileName = 'historical-metrics.csv';
    const filePath = path.join(__dirname, '../../', fileName);
    fs.writeFileSync(filePath, csvContent, 'utf8');
    return filePath;
  } catch (err) {
    if (res && res.status) {
      return res.status(500).json({ error: err.message });
    }
    throw err;
  }
};