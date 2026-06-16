// ops-frontend/src/components/MetricBar.jsx
export function MetricBar({ label, value }) {
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