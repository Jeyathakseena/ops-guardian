// ops-frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Provider } from 'react-redux'; // 1. Import Redux Provider
import { store } from './store/store';   // 2. Import your Redux Store
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

function AppRoutes() {
  const { user } = useAuth(); // Consume the user state from context

  return (
    <Routes>
      {/* 1. AUTH / LOGIN ROUTE */}
      <Route 
        path="/" 
        element={!user ? <AuthPage /> : <Navigate to="/dashboard" replace />} 
      />

      {/* 2. DASHBOARD ROUTE */}
      <Route 
        path="/dashboard" 
        element={user ? <DashboardPage /> : <Navigate to="/" replace />} 
      />

      {/* 3. GRAPH ROUTE */}
      <Route 
        path="/analytics" 
        element={user ? <AnalyticsPage /> : <Navigate to="/" replace />} 
      />

      {/* CATCH-ALL ROUTE */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}