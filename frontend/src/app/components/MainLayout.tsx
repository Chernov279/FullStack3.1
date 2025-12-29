import { useState } from 'react';
import { Button } from './ui/button';
import { ChefHat, UtensilsCrossed, Package, FileText, LogOut, Menu, X } from 'lucide-react';
import { DishManagement } from './DishManagement';
import { IngredientManagement } from './IngredientManagement';
import { OrderLabels } from './OrderLabels';
import { WriteOffs } from './WriteOffs';

type Screen = 'dishes' | 'ingredients' | 'orders' | 'writeoffs';

interface MainLayoutProps {
  onLogout: () => void;
}

export function MainLayout({ onLogout }: MainLayoutProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dishes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dishes' as Screen, label: 'Блюда', icon: UtensilsCrossed },
    { id: 'ingredients' as Screen, label: 'Ингредиенты', icon: Package },
    { id: 'orders' as Screen, label: 'Чеки', icon: FileText },
    { id: 'writeoffs' as Screen, label: 'Списания', icon: FileText }
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dishes':
        return <DishManagement />;
      case 'ingredients':
        return <IngredientManagement />;
      case 'orders':
        return <OrderLabels />;
      case 'writeoffs':
        return <WriteOffs />;
      default:
        return <DishManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-slate-700" />
              <h1 className="text-slate-900">Ассистент Шефа</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-slate-900">Администратор</p>
              <p className="text-xs text-slate-500">admin@restaurant.ru</p>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:static lg:translate-x-0 inset-y-0 left-0 z-20 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out mt-[73px] lg:mt-0`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentScreen === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setCurrentScreen(item.id);
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderScreen()}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
