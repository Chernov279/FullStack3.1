import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: ReactNode;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export function PrivateRoute({ children }: PrivateRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) {
      setIsAuthenticated(false);
      return;
    }

    try {
      // Проверяем валидность токена
      const isValid = await validateToken(accessToken);
      
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        const newAccessToken = await refreshAccessToken(refreshToken);
        if (newAccessToken) {
          localStorage.setItem('access_token', newAccessToken);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ token: token })
      });
      
      return response.ok;
    } catch {
      return false;
    }
  };

  const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.access_token;
      }
      return null;
    } catch {
      return null;
    }
  };

  if (isAuthenticated === null) {
    // Показываем загрузку
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Проверка авторизации...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Перенаправляем на страницу авторизации
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}