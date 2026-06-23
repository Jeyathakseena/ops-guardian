// ops-frontend/src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { MetricBar } from '../components/MetricBar';
import { IncidentBanner } from '../components/IncidentBanner';
import { AnalyticsPage } from './AnalyticsPage';
import { getMetrics, getIncidents, killProcess } from '../services/api';

const API = `${import.meta.env.VITE_API_URL}`;

export function DashboardPage({ onLogout }) {
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, disk: 0 });
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('live');
  
  // Maintain metric stream history at the top level so it never unmounts
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getMetrics()
      .then(data => {
        if (data && !data.error) setMetrics(data);
      })
      .catch(() => {});

    getIncidents()
      .then(data => {
        if (data && data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          setIncidents(data);
        }
      })
      .catch(err => setError(err.message));

    const es = new EventSource(`${API}/api/metrics/events`);
    es.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'metrics') {
        setMetrics(msg.data);
        
        // Push to history directly from the SSE event listener
        setHistory(prev => {
          const next = [...prev, { ...msg.data, time: new Date().toLocaleTimeString() }];
          if (next.length > 30) next.shift();
          return next;
        });
      }
      if (msg.type === 'incident') setIncidents(msg.data);
    };

    return () => es.close();
  }, []);

  const handleKill = async (incidentId, pid) => {
    const data = await killProcess(pid, incidentId);
    if (data && data.error) {
      alert('Kill failed: ' + data.error);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1>🛡️ Ops-Guardian</h1>
          <span className="live-badge">● LIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="kill-btn" 
            style={{ background: activeTab === 'live' ? '#22c55e' : '#1e293b', color: '#e2e8f0' }}
            onClick={() => setActiveTab('live')}
          >
            Live Vitals
          </button>
          <button 
            className="kill-btn" 
            style={{ background: activeTab === 'analytics' ? '#22c55e' : '#1e293b', color: '#e2e8f0' }}
            onClick={() => setActiveTab('analytics')}
          >
            Metrics History
          </button>
          <button
            className="kill-btn"
            onClick={onLogout}
            style={{ background: '#334155', color: '#e2e8f0' }}
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div style={{ padding: '1rem', background: '#451a03', color: '#f59e0b', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #78350f' }}>
          <strong>Connection Issue:</strong> {error} (Try logging out and logging back in)
        </div>
      )}

      {/* Preserve layout views using hidden elements so state histories don't reset */}
      <div style={{ display: activeTab === 'live' ? 'block' : 'none' }}>
        <section>
          <h2 className="section-title">System Metrics</h2>
          <div className="metrics-row">
            <MetricBar label="CPU Usage" value={metrics.cpu} />
            <MetricBar label="Memory Usage" value={metrics.memory} />
            <MetricBar label="Disk Usage" value={metrics.disk} />
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

      <div style={{ display: activeTab === 'analytics' ? 'block' : 'none' }}>
        <AnalyticsPage history={history} />
      </div>
    </div>
  );
}