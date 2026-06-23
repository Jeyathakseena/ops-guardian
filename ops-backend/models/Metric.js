const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({
  cpu: { type: Number, required: true },
  memory: { type: Number, required: true },
  disk: { type: Number, required: true }
}, { timestamps: true });

MetricSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Metric', MetricSchema);