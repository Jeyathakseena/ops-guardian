// ops-frontend/src/components/AuthForm.jsx
import { useState } from 'react';

export function AuthForm({ view, onSuccess, onSwitch }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');

  const isLogin = view === 'login';

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const apiUrl = view === 'login' ? 'login' : 'signup';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${apiUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      onSuccess(u);
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <h1>🛡️ Ops-Guardian</h1>
        <p className="subtitle">{isLogin ? 'Login to Dashboard' : 'Create an Account'}</p>
        <form onSubmit={submit}>
          <input
            value={u}
            onChange={e => setU(e.target.value)}
            placeholder="Username"
            required
            autoComplete="username"
          />
          <input
            type="password"
            value={p}
            onChange={e => setP(e.target.value)}
            placeholder="Password"
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
          {err && <p className="err">{err}</p>}
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <p 
          style={{ marginTop: '1.25rem', fontSize: '0.88rem', cursor: 'pointer', color: '#64748b' }} 
          onClick={onSwitch}
        >
          {isLogin ? "Need an account? " : "Already have an account? "}
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
            {isLogin ? "Sign up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}