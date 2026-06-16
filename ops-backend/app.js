// ops-backend/app.js
const express = require('express');
const cors = require('cors');

// Import routes (we'll create these in Step 7)
const authRoutes = require('./routes/auth');
const metricsRoutes = require('./routes/metrics');
const incidentsRoutes = require('./routes/incidents');
const processesRoutes = require('./routes/processes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api', authRoutes);
app.use('/api', metricsRoutes);
app.use('/api', incidentsRoutes);
app.use('/api', processesRoutes);

module.exports = app;