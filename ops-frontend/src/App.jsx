import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

function Dashboard({ onLogout }) {
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, disk: 0 });
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/metrics`).then(r => r.json()).then(setMetrics).catch(() => {});
    fetch(`${API}/api/incidents`).then(r => r.json()).then(setIncidents).catch(() => {});

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1>🛡️ Ops-Guardian</h1>
          <span className="live-badge">● LIVE</span>
        </div>
        <button 
          className="kill-btn" 
          onClick={onLogout} 
          style={{ background: '#334155', color: '#e2e8f0' }}
        >
          Logout
        </button>
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

// ── Auth Form (Login / Signup) ──────────────────────────────────────────────

function AuthForm({ view, onSuccess, onSwitch }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');

  const isLogin = view === 'login';

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch(`${API}/api/${view}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      onSuccess(u);
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <h1>🛡️ Ops-Guardian</h1>
        <p className="subtitle">{isLogin ? 'Login to Dashboard' : 'Create an Account'}</p>
        <form onSubmit={submit}>
          <input
            value={u}
            onChange={e => setU(e.target.value)}
            placeholder="Username"
            required
            autoComplete="username"
          />
          <input
            type="password"
            value={p}
            onChange={e => setP(e.target.value)}
            placeholder="Password"
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
          {err && <p className="err">{err}</p>}
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <p 
          style={{ marginTop: '1.25rem', fontSize: '0.88rem', cursor: 'pointer', color: '#64748b' }} 
          onClick={onSwitch}
        >
          {isLogin ? "Need an account? " : "Already have an account? "}
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
            {isLogin ? "Sign up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('ops_user'));
  const [view, setView] = useState('login'); 

  const handleAuth = (username) => {
    localStorage.setItem('ops_user', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('ops_user');
    setUser(null);
  };

  if (user) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <AuthForm 
      view={view} 
      onSuccess={handleAuth} 
      onSwitch={() => setView(view === 'login' ? 'signup' : 'login')} 
    />
  );
}

