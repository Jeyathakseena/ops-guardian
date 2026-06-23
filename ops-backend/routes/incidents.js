const express = require('express');
const router = express.Router();
const incidentsController = require('../controllers/incidentsController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/incident', (req, res, next) => {
  incidentsController.postIncident(req.body)
    .then((result) => res.json(result))
    .catch((err) => next(err)); // Passes errors directly to Express error middleware
});

router.get('/incidents', authenticate, (req, res, next) => {
  incidentsController.getIncidents()
    .then((result) => res.json(result))
    .catch((err) => next(err));
});

module.exports = router;