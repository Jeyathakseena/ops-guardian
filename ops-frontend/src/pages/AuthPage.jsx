// ops-frontend/src/pages/AuthPage.jsx
import { useState } from 'react';
import { AuthForm } from '../components/AuthForm';

export function AuthPage() {
  const [view, setView] = useState('login');
  const toggleView = () => setView(view === 'login' ? 'signup' : 'login');

  // AuthForm will now handle context internally or we pass an empty shell 
  // since AuthForm can use context too! Let's update AuthForm right below.
  return <AuthForm view={view} onSwitch={toggleView} />;
}