'use strict';

const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const { execSync } = require('child_process');

const app   = express();
const PORT  = process.env.PORT;     
const MONGO = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());

// ── Incident Model ──────────────────────────────────────────────────────────

const Incident = mongoose.model('Incident', new mongoose.Schema({
  cpu         : Number,
  memory      : Number,
  disk        : Number,
  targetPid   : Number,
  reasoning   : String,
  processName : String,
  status      : { type: String, enum: ['active', 'resolved'], default: 'active' }
}, { timestamps: true }));

// ── SSE Broadcast ───────────────────────────────────────────────────────────

let clients = [];

function broadcast(payload) {
  const frame = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach(c => c.write(frame));
}

// ── Live Metrics Cache (avoids DB reads for every tick) ─────────────────────

let liveMetrics = { cpu: 0, memory: 0, disk: 0 };

// ── Routes ──────────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// SSE — frontend connects here and stays connected
app.get('/api/events', (req, res) => {
  res.set({
    'Content-Type'  : 'text/event-stream',
    'Cache-Control' : 'no-cache',
    'Connection'    : 'keep-alive'
  });
  res.flushHeaders();

  // Push current metrics immediately on connect
  res.write(`data: ${JSON.stringify({ type: 'metrics', data: liveMetrics })}\n\n`);
  clients.push(res);

  req.on('close', () => { clients = clients.filter(c => c !== res); });
});

// System monitor pushes metrics every 5s
app.post('/api/metrics', (req, res) => {
  liveMetrics = req.body;
  broadcast({ type: 'metrics', data: liveMetrics });
  res.json({ ok: true });
});

app.get('/api/metrics', (_, res) => res.json(liveMetrics));

// System monitor pushes a new incident after AI analysis
app.post('/api/incident', async (req, res) => {
  try {
    await new Incident(req.body).save();

    // FIFO — keep only the 5 most recent incidents in the DB
    const all = await Incident.find().sort({ createdAt: 1 });
    if (all.length > 5) {
      const evict = all.slice(0, all.length - 5).map(d => d._id);
      await Incident.deleteMany({ _id: { $in: evict } });
    }

    const latest = await Incident.find().sort({ createdAt: -1 }).limit(5);
    broadcast({ type: 'incident', data: latest });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/incidents', async (_, res) => {
  try {
    const docs = await Incident.find().sort({ createdAt: -1 }).limit(5);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-triggered process kill — requires pid:"host" + privileged in compose
app.post('/api/kill-process', async (req, res) => {
  const { pid, incidentId } = req.body;
  if (!pid || !incidentId) {
    return res.status(400).json({ error: 'pid and incidentId are required' });
  }

  try {
    execSync(`kill -9 ${parseInt(pid)}`);
    await Incident.findByIdAndUpdate(incidentId, { status: 'resolved' });

    const latest = await Incident.find().sort({ createdAt: -1 }).limit(5);
    broadcast({ type: 'incident', data: latest });

    res.json({ ok: true, message: `PID ${pid} terminated` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── MongoDB connection with retry ───────────────────────────────────────────

async function start() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await mongoose.connect(MONGO);
      console.log('[Backend] MongoDB connected');
      break;
    } catch {
      console.log(`[Backend] MongoDB attempt ${attempt}/5 — retrying in 5s...`);
      if (attempt === 5) { console.error('[Backend] Could not connect. Exiting.'); process.exit(1); }
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  app.listen(PORT, () => console.log(`[Backend] Listening on port ${PORT}`));
}

start();