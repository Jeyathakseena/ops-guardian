const express = require('express');
const cors = require('cors');


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



app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;