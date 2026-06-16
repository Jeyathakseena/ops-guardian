// ops-frontend/src/services/api.js
const API = import.meta.env.VITE_API_URL;

export const signup = async (username, password) => {
  const res = await fetch(`${API}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
};

export const login = async (username, password) => {
  const res = await fetch(`${API}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
};

export const getMetrics = async () => {
  const res = await fetch(`${API}/api/metrics`);
  return res.json();
};

export const getIncidents = async () => {
  const res = await fetch(`${API}/api/incidents`);
  return res.json();
};

export const killProcess = async (pid, incidentId) => {
  const res = await fetch(`${API}/api/kill-process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pid, incidentId })
  });
  return res.json();
};