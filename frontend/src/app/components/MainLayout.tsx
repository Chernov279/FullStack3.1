import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChefHat, Calculator, DollarSign, FileText, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { DishManagement } from './DishManagement';
import { IngredientManagement } from './IngredientManagement';
import { WriteOffs } from './WriteOffs';
import { OrderLabels } from './OrderLabels';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Массив доступных вкладок
const TAB_OPTIONS = [
  { key: 'recipes', label: 'Менеджер рецептов', icon: ChefHat },
  { key: 'costing', label: 'Калькуляция продуктов', icon: Calculator },
  { key: 'accounting', label: 'Бухгалтерия', icon: DollarSign },
  { key: 'writing', label: 'Списания', icon: FileText },
];

export function MainLayout() {
  const navigate = useNavigate();
  
  // Загружаем сохраненную вкладку из localStorage при инициализации
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    // Проверяем, что сохраненная вкладка существует в массиве TAB_OPTIONS
    return savedTab && TAB_OPTIONS.some(tab => tab.key === savedTab) 
      ? savedTab 
      : 'recipes'; // вкладка по умолчанию
  });
  
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token') || '');

  // Сохраняем активную вкладку в localStorage при ее изменении
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!token || !refreshToken) {
        handleLogout();
        return;
      }

      const isValid = await validateToken(token);
      if (!isValid) {
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) {
          localStorage.setItem('access_token', newToken);
          setAccessToken(newToken);
        } else {
          handleLogout();
        }
      }
    };

    checkToken();
    
    const interval = setInterval(checkToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
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

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('activeTab'); // Очищаем сохраненную вкладку при выходе
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border min-h-screen">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold">Помощник Шефа</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Профессиональное управление кухней
            </p>
          </div>
          
          <nav className="p-4 space-y-2">
            {/* Генерация кнопок навигации из массива TAB_OPTIONS */}
            {TAB_OPTIONS.map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleTabChange(tab.key)}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            ))}
            
            {/* Кнопка выхода */}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-700 mt-8"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Отображение компонента в зависимости от активной вкладки */}
          {activeTab === 'recipes' && <DishManagement accessToken={accessToken} />}
          {activeTab === 'costing' && <IngredientManagement accessToken={accessToken} />}
          {activeTab === 'accounting' && <WriteOffs accessToken={accessToken} />}
          {activeTab === 'writing' && <OrderLabels accessToken={accessToken} />}
        </div>
      </div>
    </div>
  );
}