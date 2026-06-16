// ops-frontend/src/components/IncidentBanner.jsx
export function IncidentBanner({ inc, onKill }) {
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