// ops-frontend/src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { MetricBar } from '../components/MetricBar';
import { IncidentBanner } from '../components/IncidentBanner';

const API = import.meta.env.VITE_API_URL;

export function DashboardPage({ onLogout }) {
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pid, incidentId })
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