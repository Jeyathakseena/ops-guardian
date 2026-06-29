import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux'; // 1. Import Redux Hooks
import { updateMetrics } from '../store/metricsSlice';  // 2. Import Action
import { MetricBar } from '../components/MetricBar';
import { IncidentBanner } from '../components/IncidentBanner';
import { getMetrics, getIncidents, killProcess } from '../services/api';

const API = `${import.meta.env.VITE_API_URL}`;

export function DashboardPage() {
  const { logoutUser } = useAuth();
  const navigate = useNavigate(); 
  const dispatch = useDispatch();

  // 3. Connect to Redux Global Live Metrics State
  const metrics = useSelector((state) => state.metrics.live);

  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial fetch for historical context or current snapshot
    getMetrics()
      .then(data => {
        if (data && !data.error) {
          dispatch(updateMetrics(data)); // Push snapshot straight to Redux
        }
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

    // Establish live system data stream
    const es = new EventSource(`${API}/api/metrics/events`);
    
    es.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'metrics') {
        // 4. Dispatch live metrics straight to the Redux Store
        dispatch(updateMetrics(msg.data));
      }
      if (msg.type === 'incident') {
        setIncidents(msg.data);
      }
    };

    return () => es.close();
  }, [dispatch]);

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
            style={{ background: '#22c55e', color: '#e2e8f0' }} 
            onClick={() => navigate('/dashboard')} 
          >
            Live Vitals
          </button>
          <button 
            className="kill-btn" 
            style={{ background: '#1e293b', color: '#e2e8f0' }}
            onClick={() => navigate('/analytics')} 
          >
            Metrics History
          </button>
          <button
            className="kill-btn"
            onClick={logoutUser}
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
  );
}