import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { MainLayout } from './components/MainLayout';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<LoginScreen />} />
        <Route 
          path="/app/*" 
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            localStorage.getItem('access_token') 
              ? <Navigate to="/app" replace /> 
              : <Navigate to="/auth" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;