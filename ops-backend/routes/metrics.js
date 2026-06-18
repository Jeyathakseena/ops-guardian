const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const broadcastService = require('../services/broadcastService');

router.get('/health', (req, res) => {
  const result = metricsController.getHealth();
  res.json(result);
});

router.get('/metrics', (req, res) => {
  const result = metricsController.getMetrics();
  res.json(result);
});

router.post('/metrics', async (req, res) => {
  try {
    const result = await metricsController.postMetrics(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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