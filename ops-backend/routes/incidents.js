// ops-backend/routes/incidents.js
const express = require('express');
const router = express.Router();
const incidentsController = require('../controllers/incidentsController');

router.post('/incident', incidentsController.postIncident);
router.get('/incidents', incidentsController.getIncidents);

module.exports = router;