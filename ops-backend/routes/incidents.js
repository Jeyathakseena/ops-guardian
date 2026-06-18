// ops-backend/routes/incidents.js
const express = require('express');
const router = express.Router();
const incidentsController = require('../controllers/incidentsController');

router.post('/incident', async (req, res) => {
  try {
    const result = await incidentsController.postIncident(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/incidents', async (req, res) => {
  try {
    const result = await incidentsController.getIncidents();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;