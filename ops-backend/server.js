'use strict';

const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const { execSync } = require('child_process');
const bcrypt       = require('bcrypt'); // Added bcrypt

const app   = express();
const PORT  = process.env.PORT || 3001;    
const MONGO = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());

// ── Models ──────────────────────────────────────────────────────────────────

const Incident = mongoose.model('Incident', new mongoose.Schema({
  cpu         : Number,
  memory      : Number,
  disk        : Number,
  targetPid   : Number,
  reasoning   : String,
  processName : String,
  status      : { type: String, enum: ['active', 'resolved'], default: 'active' }
}, { timestamps: true }));

const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } 
}));

// ── SSE Broadcast ───────────────────────────────────────────────────────────

let clients = [];

function broadcast(payload) {
  const frame = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach(c => c.write(frame));
}

let liveMetrics = { cpu: 0, memory: 0, disk: 0 };

// ── Auth Routes ─────────────────────────────────────────────────────────────

app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Username already taken' });
    
    // Hash the password with a salt round of 10
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await new User({ username, password: hashedPassword }).save();
    res.json({ ok: true, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find the user by username only
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Compare the plaintext password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.json({ ok: true, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Metrics & Incidents Routes ──────────────────────────────────────────────

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.get('/api/events', (req, res) => {
  res.set({
    'Content-Type'  : 'text/event-stream',
    'Cache-Control' : 'no-cache',
    'Connection'    : 'keep-alive'
  });
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ type: 'metrics', data: liveMetrics })}\n\n`);
  clients.push(res);
  req.on('close', () => { clients = clients.filter(c => c !== res); });
});

app.post('/api/metrics', (req, res) => {
  liveMetrics = req.body;
  broadcast({ type: 'metrics', data: liveMetrics });
  res.json({ ok: true });
});

app.get('/api/metrics', (_, res) => res.json(liveMetrics));

app.post('/api/incident', async (req, res) => {
  try {
    const existing = await Incident.findOne({ targetPid: req.body.targetPid, status: 'active' });
    if (existing) {
      return res.json({ ok: true, message: 'Incident already active for this PID' });
    }

    await new Incident(req.body).save();

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

app.post('/api/kill-process', async (req, res) => {
  const { pid, incidentId } = req.body;
  if (!pid || !incidentId) return res.status(400).json({ error: 'pid and incidentId are required' });

  try {
    try {
      execSync(`kill -9 ${parseInt(pid)}`, { stdio: 'ignore' });
    } catch (e) {
      console.log(`[Backend] Process ${pid} might already be terminated.`);
    }
    
    await Incident.findByIdAndUpdate(incidentId, { status: 'resolved' });
    const latest = await Incident.find().sort({ createdAt: -1 }).limit(5);
    broadcast({ type: 'incident', data: latest });

    res.json({ ok: true, message: `PID ${pid} handled successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Database Init ───────────────────────────────────────────────────────────

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

