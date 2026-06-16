const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  cpu: Number,
  memory: Number,
  disk: Number,
  targetPid: Number,
  reasoning: String,
  processName: String,
  status: { type: String, enum: ['active', 'resolved'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Incident', IncidentSchema);