import { useState } from 'react';
import { login, signup } from '../services/api';

export function AuthForm({ view, onSuccess, onSwitch }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [confirmP, setConfirmP] = useState(''); 
  const [err, setErr] = useState('');

  const isLogin = view === 'login';

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    
    
    const username = u.trim();

    
    if (!isLogin) {
      const usernameRegex = /^[a-zA-Z0-9]+$/;
      if (username.length < 3 || username.length > 15) {
        setErr('Username must be between 3 and 15 characters long.');
        return;
      }
      if (!usernameRegex.test(username)) {
        setErr('Username can only contain letters and numbers.');
        return;
      }
      if (p.length < 6) {
        setErr('Password must be at least 6 characters long.');
        return;
      }
      if (p !== confirmP) {
        setErr('Passwords do not match.');
        return;
      }
    }
    // ---------------------------

    try {
      let data;
      
      if (isLogin) {
        data = await login(username, p); 
      } else {
        data = await signup(username, p); 
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      if (data && data.token) {
        localStorage.setItem('ops_token', data.token);
      }

      onSuccess(username);
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
          
          {!isLogin && (
            <input
              type="password"
              value={confirmP}
              onChange={e => setConfirmP(e.target.value)}
              placeholder="Confirm Password"
              required
              autoComplete="new-password"
            />
          )}

          {err && <p className="err">{err}</p>}
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <p
          style={{ marginTop: '1.25rem', fontSize: '0.88rem', cursor: 'pointer', color: '#64748b' }}
          onClick={() => { setErr(''); setConfirmP(''); onSwitch(); }}
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