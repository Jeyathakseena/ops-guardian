// ops-frontend/src/pages/AuthPage.jsx
import { useState } from 'react';
import { AuthForm } from '../components/AuthForm';

export function AuthPage({ onLogin }) {
  const [view, setView] = useState('login');

  const handleAuth = (username) => {
    localStorage.setItem('ops_user', username);
    onLogin(username);
  };

  const toggleView = () => setView(view === 'login' ? 'signup' : 'login');

  return <AuthForm view={view} onSuccess={handleAuth} onSwitch={toggleView} />;
}