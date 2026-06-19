// ops-backend/routes/processes.js
const express = require('express');
const router = express.Router();
const processesController = require('../controllers/processesController');
const { authenticate } = require('../middleware/authMiddleware');

// Protected: Only authenticated users can trigger process remediation
router.post('/kill-process', authenticate, async (req, res) => {
  try {
    const result = await processesController.killProcess(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;