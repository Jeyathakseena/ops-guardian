// ops-frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

// 1. Create the blank context blueprint
const AuthContext = createContext(null);

// 2. Create the Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem('ops_user'));

  const loginUser = (username, token) => {
    localStorage.setItem('ops_user', username);
    localStorage.setItem('ops_token', token);
    setUser(username);
  };

  const logoutUser = () => {
    localStorage.removeItem('ops_user');
    localStorage.removeItem('ops_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Create a custom hook to avoid importing both useContext and AuthContext everywhere
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}