import { useState } from 'react';
// 1. IMPORT your api helper functions here
import { login, signup } from '../services/api'; 

export function AuthForm({ view, onSuccess, onSwitch }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');

  const isLogin = view === 'login';

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      let data;
      
      // 2. USE the clean functions from api.js instead of writing raw fetch blocks
      if (isLogin) {
        data = await login(u, p);
      } else {
        data = await signup(u, p);
      }

      // 3. Handle errors if the server returned an error flag
      if (data && data.error) {
        throw new Error(data.error);
      }

      // 4. Save token to localStorage if returned
      if (data && data.token) {
        localStorage.setItem('ops_token', data.token);
      }

      onSuccess(u);
    } catch (error) {
      setErr(error.message || 'Authentication failed');
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
          {isLogin ? 'Need an account? ' : 'Already have an account? '}
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
            {isLogin ? 'Sign up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}