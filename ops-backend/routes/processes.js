// ops-backend/routes/processes.js
const express = require('express');
const router = express.Router();
const processesController = require('../controllers/processesController');

router.post('/kill-process', async (req, res) => {
  try {
    const result = await processesController.killProcess(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;