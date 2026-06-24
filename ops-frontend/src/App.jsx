import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export default function App() {
  // Check if a user is logged in
  const [user, setUser] = useState(() => localStorage.getItem('ops_user'));

  const [history, setHistory] = useState([]);

  const handleAuth = (username) => {
    localStorage.setItem('ops_user', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('ops_user');
    localStorage.removeItem('ops_token');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. AUTH / LOGIN ROUTE */}
        <Route 
          path="/" 
          element={
            !user ? <AuthPage onLogin={handleAuth} /> : <Navigate to="/dashboard" replace />
          } 
        />

        {/* 2. DASHBOARD ROUTE */}
        <Route 
          path="/dashboard" 
          element={
            user ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/" replace />
          } 
        />

        {/* 3. GRAPH ROUTE */}
        <Route 
          path="/analytics" 
          element={
            user ? (
              <div className="page">
                <AnalyticsPage history={history} />
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* CATCH-ALL ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}