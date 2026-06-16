// ops-backend/queries/incidentQuery.js
const Incident = require('../models/Incident');

exports.findOneActiveByPid = (targetPid) =>
  Incident.findOne({ targetPid, status: 'active' });

exports.create = (incident) => Incident.create(incident);

exports.findAllSorted = () => Incident.find().sort({ createdAt: 1 });

exports.deleteMany = (ids) => Incident.deleteMany({ _id: { $in: ids } });

exports.findLatest = (limit = 5) =>
  Incident.find().sort({ createdAt: -1 }).limit(limit);

exports.updateResolved = (incidentId) =>
  Incident.findByIdAndUpdate(incidentId, { status: 'resolved' });