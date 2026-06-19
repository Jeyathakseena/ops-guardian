// ops-backend/routes/incidents.js
const express = require('express');
const router = express.Router();
const incidentsController = require('../controllers/incidentsController');
const { authenticate } = require('../middleware/authMiddleware');

// Allowed without token so the system-monitor container can report incidents
router.post('/incident', async (req, res) => {
  try {
    const result = await incidentsController.postIncident(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: Only authenticated users can view incidents on the dashboard
router.get('/incidents', authenticate, async (req, res) => {
  try {
    const result = await incidentsController.getIncidents();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;