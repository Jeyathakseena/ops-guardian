// ops-frontend/src/services/api.js
const API = `${import.meta.env.VITE_API_URL}/api`;


const getToken = () => localStorage.getItem('ops_token');


export const signup = async (username, password) => {
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
};


export const login = async (username, password) => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
};


export const getMetrics = async () => {
  const token = getToken();
  const res = await fetch(`${API}/metrics/metrics`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.json();
};


export const getIncidents = async () => {
  const token = getToken();
  const res = await fetch(`${API}/incidents/incidents`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.json();
};


export const killProcess = async (pid, incidentId) => {
  const token = getToken();
  const res = await fetch(`${API}/process/kill-process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ pid, incidentId })
  });
  return res.json();
};