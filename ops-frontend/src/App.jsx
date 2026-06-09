import { useState, useEffect } from 'react';

// Backend URL — the browser always reaches it via the mapped host port
const API   = import.meta.env.VITE_API_URL;
const CREDS = { 
  user: import.meta.env.VITE_ADMIN_USER, 
  pass: import.meta.env.VITE_ADMIN_PASS 
};


// ── Metric Bar ──────────────────────────────────────────────────────────────

function MetricBar({ label, value }) {
  const color = value > 70 ? '#ef4444' : value > 50 ? '#f59e0b' : '#22c55e';
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <div className="metric-val" style={{ color }}>{value}%</div>
    </div>
  );
}

// ── Incident Banner ─────────────────────────────────────────────────────────

function IncidentBanner({ inc, onKill }) {
  const resolved = inc.status === 'resolved';
  return (
    <div className={`banner ${resolved ? 'banner-green' : 'banner-red'}`}>
      <div className="banner-top">
        <span className="banner-status">
          {resolved ? 'RESOLVED' : ' ACTIVE ALERT'}
        </span>
        <span className="banner-time">
          {new Date(inc.createdAt).toLocaleTimeString()}
        </span>
      </div>
      <div className="banner-metrics">
        CPU: {inc.cpu}% &nbsp;|&nbsp; MEM: {inc.memory}% &nbsp;|&nbsp; DISK: {inc.disk}%
      </div>
      <p className="banner-reason">{inc.reasoning}</p>
      {!resolved && (
        <button className="kill-btn" onClick={() => onKill(inc._id, inc.targetPid)}>
         Kill Process &nbsp;(PID {inc.targetPid})
        </button>
      )}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard() {
  const [metrics,   setMetrics]   = useState({ cpu: 0, memory: 0, disk: 0 });
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    // Load initial state from the API
    fetch(`${API}/api/metrics`).then(r => r.json()).then(setMetrics).catch(() => {});
    fetch(`${API}/api/incidents`).then(r => r.json()).then(setIncidents).catch(() => {});

    // SSE stream for real-time updates (stays open)
    const es = new EventSource(`${API}/api/events`);
    es.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'metrics')  setMetrics(msg.data);
      if (msg.type === 'incident') setIncidents(msg.data);
    };
    return () => es.close();
  }, []);

  const handleKill = async (incidentId, pid) => {
    const res = await fetch(`${API}/api/kill-process`, {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({ pid, incidentId })
    });
    if (!res.ok) {
      const body = await res.json();
      alert('Kill failed: ' + body.error);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1>🛡️ Ops-Guardian</h1>
        <span className="live-badge">● LIVE</span>
      </header>

      <section>
        <h2 className="section-title">System Metrics</h2>
        <div className="metrics-row">
          <MetricBar label="CPU Usage"    value={metrics.cpu}    />
          <MetricBar label="Memory Usage" value={metrics.memory} />
          <MetricBar label="Disk Usage"   value={metrics.disk}   />
        </div>
      </section>

      <section>
        <h2 className="section-title">Track Incidents</h2>
        {incidents.length === 0
          ? <p className="empty">All systems normal. No incidents detected.</p>
          : incidents.map(inc => (
              <IncidentBanner key={inc._id} inc={inc} onKill={handleKill} />
            ))
        }
      </section>
    </div>
  );
}

// ── Login ───────────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [u,   setU]   = useState('');
  const [p,   setP]   = useState('');
  const [err, setErr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (u === CREDS.user && p === CREDS.pass) {
      onLogin();
    } else {
      setErr('Invalid credentials. Hint: admin / admin123');
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <h1>🛡️ Ops-Guardian</h1>
        <p className="subtitle">AI-Driven Host System Health Monitoring Platform</p>
        <form onSubmit={submit}>
          <input
            value={u}
            onChange={e => setU(e.target.value)}
            placeholder="Username"
            autoComplete="username"
          />
          <input
            type="password"
            value={p}
            onChange={e => setP(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
          {err && <p className="err">{err}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────

export default function App() {
  const [auth, setAuth] = useState(false);
  return auth ? <Dashboard /> : <Login onLogin={() => setAuth(true)} />;
}