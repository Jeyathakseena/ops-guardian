// ops-backend/routes/processes.js
const express = require('express');
const router = express.Router();
const processesController = require('../controllers/processesController');

router.post('/kill-process', processesController.killProcess);

module.exports = router;