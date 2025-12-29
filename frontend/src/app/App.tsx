import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { MainLayout } from './components/MainLayout';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="size-full">
      {!isAuthenticated ? (
        <LoginScreen onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <MainLayout onLogout={() => setIsAuthenticated(false)} />
      )}
    </div>
  );
}
