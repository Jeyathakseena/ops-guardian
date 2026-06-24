// ops-backend/routes/metrics.js
const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const broadcastService = require('../services/broadcastService');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/health', (req, res) => {
  metricsController.getHealth()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.get('/metrics', (req, res) => {
  metricsController.getMetrics(req, res) //  Passing req and res fixes the timeline query & filters
    .catch((err) => {
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    });
});

router.post('/metrics', (req, res) => {
  metricsController.postMetrics(req.body)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});


router.get('/metrics/export', authenticate, (req, res) => {
  
  metricsController.exportMetricsToFile()
    .then((filePath) => {
      res.download(filePath); 
    })
    .catch((err) => {
      res.status(500).json({ error: 'Failed to generte metrics history CSV: ' + err.message });
    });
    
});


// Server-Sent Events (SSE) streaming update pipeline
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