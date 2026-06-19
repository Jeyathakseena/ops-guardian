import { useState } from 'react';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('ops_user'));

  const handleAuth = (username) => {
    localStorage.setItem('ops_user', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('ops_user');
    localStorage.removeItem('ops_token');
    setUser(null);
  };

  if (user) {
    return <DashboardPage onLogout={handleLogout} />;
  }

  return <AuthPage onLogin={handleAuth} />;
}