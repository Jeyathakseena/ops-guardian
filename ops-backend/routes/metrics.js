// ops-backend/routes/metrics.js (CORRECTED)
const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const broadcastService = require('../services/broadcastService');

router.get('/health', metricsController.getHealth);
router.get('/metrics', metricsController.getMetrics);
router.post('/metrics', metricsController.postMetrics);

// SSE endpoint
router.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ type: 'metrics', data: broadcastService.getLiveMetrics() })}\n\n`);
  
  broadcastService.addClient(res);
});

module.exports = router;