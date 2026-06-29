// ops-frontend/src/components/AuthForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import our new hook

const API = `${import.meta.env.VITE_API_URL}`;

export function AuthForm({ view, onSwitch }) {
  const { loginUser } = useAuth(); // Consume login function from Context API
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const endpoint = view === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (view === 'login') {
        // Success path: pass the data directly into our global context state
        loginUser(username, data.token);
      } else {
        setMessage('Registration successful! Please switch to login.');
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      setMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: '400px', margin: '80px auto', padding: '24px', background: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}>
      <h2 style={{ color: '#f8fafc', marginBottom: '16px', textAlign: 'center' }}>
        {view === 'login' ? 'Login to Ops-Guardian' : 'Create Account'}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', color: '#94a3b8', marginBottom: '4px', fontSize: '14px' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#94a3b8', marginBottom: '4px', fontSize: '14px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px', borderRadius: '4px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
        >
          {loading ? 'Processing...' : view === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '12px', padding: '8px', borderRadius: '4px', background: message.includes('successful') ? '#065f46' : '#991b1b', color: '#f8fafc', fontSize: '14px', textAlign: 'center' }}>
          {message}
        </p>
      )}

      <p style={{ marginTop: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
        {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <span onClick={onSwitch} style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}>
          {view === 'login' ? 'Sign Up' : 'Login'}
        </span>
      </p>
    </div>
  );
}