import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux'; // 1. Import Redux Hooks
import { updateMetrics, setHistory } from '../store/metricsSlice';  // 2. Import Action
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = `${import.meta.env.VITE_API_URL}`;

export function AnalyticsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);
  
  // 3. Extract safe, persistent history directly from the Redux Store
  const history = useSelector((state) => state.metrics.history);

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1d'); 
  const [isMaximized, setIsMaximized] = useState(false);
  const [metricFocus, setMetricFocus] = useState('all'); 

  // Auto-scroll mechanism to shift view to the rightmost (newest) metrics
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [history]);

  const fetchHistoricalData = async (range) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ops_token');
      const res = await fetch(`${API}/api/metrics/metrics?range=${range}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
    
      if (Array.isArray(data)) {
      // Map all records from the database cleanly
        const mappedHistory = data.map(item => {
          const dateSource = item.createdAt || item.timestamp;
          return {
            ...item,
            timeLabel: new Date(dateSource).toLocaleString([], { 
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })
          };
        });

      // Dispatch the entire array to Redux at once!
        dispatch(setHistory(mappedHistory));
      }
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData(timeRange);
  }, [timeRange]);

  // 4. Live Stream listener channels its payload straight into Redux
  useEffect(() => {
    const es = new EventSource(`${API}/api/metrics/events`);
    es.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'metrics') {
        const newTick = {
          ...msg.data,
          timeLabel: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        dispatch(updateMetrics(newTick));
      }
    };
    return () => es.close();
  }, [dispatch]);

  const handleExportCSV = () => {
    const token = localStorage.getItem('ops_token');
    const exportUrl = `${API}/api/metrics/metrics/export?token=${token}`;
    window.open(exportUrl, '_blank');
  };

  const horizontalScaleSpacing = 65;
  const computedChartWidth = Math.max(1100, history.length * horizontalScaleSpacing);

  return (
    <div style={{ 
      padding: isMaximized ? '1rem' : '2rem', 
      maxWidth: isMaximized ? '100%' : '1350px', 
      margin: '0 auto',
      transition: 'all 0.2s'
    }}>
      
      {/* ACTION HEADER */}
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Live Metrics Graph</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="kill-btn" style={{ background: '#22c55e' }} onClick={handleExportCSV}>
            Export to CSV
          </button>
          <button className="kill-btn" style={{ background: '#334155' }} onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </header>

      {/* COMPACT FILTER CONTROL BAR */}
      <div style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        background: '#1e293b', 
        padding: '1.25rem', 
        borderRadius: '10px', 
        marginBottom: '2rem',
        border: '1px solid #334155'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Time Range Selection:</label>
          <select 
            value={timeRange} 
            onChange={e => setTimeRange(e.target.value)} 
            style={{ width: '100%', background: '#334155', color: '#fff', padding: '0.6rem', borderRadius: '6px', border: '1px solid #475569', cursor: 'pointer' }}
          >
            <option value="1h">Past 1 Hour</option>
            <option value="2h">Past 2 Hours</option>
            <option value="4h">Past 4 Hours</option>
            <option value="1d">Past 24 Hours</option>
            <option value="2d">Past 2 Days</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Resource Target Dropdown:</label>
          <select 
            value={metricFocus} 
            onChange={e => setMetricFocus(e.target.value)} 
            style={{ width: '100%', background: '#334155', color: '#fff', padding: '0.6rem', borderRadius: '6px', border: '1px solid #475569', cursor: 'pointer' }}
          >
            <option value="all">All Metrics (CPU, Memory, Disk)</option>
            <option value="cpu">CPU Only</option>
            <option value="memory">Memory Only</option>
            <option value="disk">Disk Space Only</option>
          </select>
        </div>
      </div>

      {/* SCROLLABLE GRAPH WORKSPACE */}
      <div style={{ 
        background: '#0f172a', 
        padding: '1.5rem', 
        borderRadius: '12px', 
        border: '1px solid #1e293b', 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#f8fafc' }}>
            System Monitor Metrics Tracking {loading && '...'}
          </h3>
          <button 
            onClick={() => setIsMaximized(!isMaximized)} 
            title={isMaximized ? "Exit Fullscreen" : "Maximize Graph View"}
            style={{ background: '#334155', color: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isMaximized ? '🗗' : '🗖'}
          </button>
        </div>

        {loading ? (
          <div style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            Loading database timelines...
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            style={{ overflowX: 'auto', paddingBottom: '0.75rem', scrollBehavior: 'smooth' }}
          >
            <div style={{ width: `${computedChartWidth}px`, height: isMaximized ? '580px' : '380px', transition: 'height 0.2s' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  
                  <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Timestamps', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Metrics (%)', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b' }} />
                  
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
                  
                  {(metricFocus === 'all' || metricFocus === 'cpu') && (
                    <Line type="monotone" dataKey="cpu" name="CPU Usage" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 1.5 }} activeDot={{ r: 4 }} isAnimationActive={false} />
                  )}

                  {(metricFocus === 'all' || metricFocus === 'memory') && (
                    <Line type="monotone" dataKey="memory" name="Memory Usage" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 1.5 }} activeDot={{ r: 4 }} isAnimationActive={false} />
                  )}

                  {(metricFocus === 'all' || metricFocus === 'disk') && (
                    <Line type="monotone" dataKey="disk" name="Disk Space" stroke="#10b981" strokeWidth={2.5} dot={{ r: 1.5 }} activeDot={{ r: 4 }} isAnimationActive={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}