// ops-frontend/src/pages/AnalyticsPage.jsx
import { getCsvExportUrl } from '../services/api';

export function AnalyticsPage({ history }) {
  const maxPoints = 30;
  const width = 600;
  const height = 200;
  const padding = 25;

  const getPoints = (key) => {
    if (history.length < 2) return '';
    return history.map((d, index) => {
      const x = padding + (index / (maxPoints - 1)) * (width - padding * 2);
      const y = height - padding - (d[key] / 100) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Vitals Timeline Analysis</h2>
        <a 
          href={getCsvExportUrl()} 
          className="kill-btn" 
          style={{ textDecoration: 'none', background: '#22c55e', textAlign: 'center' }}
          download
        >
         Export History (CSV)
        </a>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>● CPU (%)</span>
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>● Memory (%)</span>
          <span style={{ color: '#22c55e', fontWeight: 'bold' }}>● Disk (%)</span>
        </div>

        {history.length < 2 ? (
          <p className="empty" style={{ background: 'transparent', border: 'none' }}>Gathering sufficient analytical system stream matrix ticks...</p>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: '#0f172a', borderRadius: '6px' }}>
            {/* Horizontal Grid Bounds */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" />

            {/* Polyline metric paths */}
            <polyline fill="none" stroke="#ef4444" strokeWidth="2" points={getPoints('cpu')} />
            <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={getPoints('memory')} />
            <polyline fill="none" stroke="#22c55e" strokeWidth="2" points={getPoints('disk')} />
          </svg>
        )}
      </div>
    </div>
  );
}