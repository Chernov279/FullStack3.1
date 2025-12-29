import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, ChefHat, DollarSign, FileText } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface DashboardStats {
  activeRecipes: number;
  averageFoodCost: string;
  monthlyExpenses: number;
  menuItems: number;
}

interface Activity {
  action: string;
  item: string;
  time: string;
}

interface DashboardProps {
  accessToken: string;
}

export function Dashboard({ accessToken }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      fetchDashboardData();
    }
  }, [accessToken]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Мокап данных для примера (замените на реальные запросы)
      // const [statsResponse, activityResponse] = await Promise.all([
      //   fetch(`${API_BASE_URL}/api/dashboard/stats`, {
      //     headers: {
      //       'Authorization': `Bearer ${accessToken}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }),
      //   fetch(`${API_BASE_URL}/api/dashboard/activity`, {
      //     headers: {
      //       'Authorization': `Bearer ${accessToken}`,
      //       'Content-Type': 'application/json'
      //     }
      //   })
      // ]);
      
      // Имитация загрузки данных
      setTimeout(() => {
        setStats({
          activeRecipes: 24,
          averageFoodCost: '35%',
          monthlyExpenses: 125000,
          menuItems: 45
        });
        
        setRecentActivity([
          { action: 'Добавлен рецепт', item: 'Паста Карбонара', time: '10 минут назад' },
          { action: 'Обновлен ингредиент', item: 'Сыр пармезан', time: '1 час назад' },
          { action: 'Создано списание', item: 'Овощи', time: '3 часа назад' },
          { action: 'Напечатаны этикетки', item: 'Заказ #1234', time: '5 часов назад' },
        ]);
        
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const displayStats = [
    { title: 'Активные рецепты', value: stats?.activeRecipes?.toString() || '0', icon: ChefHat, description: 'В вашей коллекции' },
    { title: 'Средняя себестоимость', value: stats?.averageFoodCost || '0%', icon: TrendingUp, description: 'От дохода' },
    { title: 'Месячные расходы', value: `₽${stats?.monthlyExpenses?.toFixed(2) || '0.00'}`, icon: DollarSign, description: 'В этом месяце' },
    { title: 'Позиции меню', value: stats?.menuItems?.toString() || '0', icon: FileText, description: 'Текущее меню' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Добро пожаловать, Шеф!</h2>
        <p className="text-muted-foreground">
          Вот что происходит на вашей кухне сегодня.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Загрузка панели управления...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayStats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Недавняя активность</CardTitle>
              <CardDescription>Ваши последние действия по управлению кухней</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.item}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>Обычные задачи для начала работы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                  <ChefHat className="h-8 w-8 mb-2 text-primary" />
                  <h4 className="font-medium">Добавить рецепт</h4>
                  <p className="text-sm text-muted-foreground">Создать новый рецепт</p>
                </div>
                <div className="p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                  <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                  <h4 className="font-medium">Рассчитать затраты</h4>
                  <p className="text-sm text-muted-foreground">Анализ стоимости продуктов</p>
                </div>
                <div className="p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                  <DollarSign className="h-8 w-8 mb-2 text-primary" />
                  <h4 className="font-medium">Отследить расходы</h4>
                  <p className="text-sm text-muted-foreground">Записать новые расходы</p>
                </div>
                <div className="p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                  <FileText className="h-8 w-8 mb-2 text-primary" />
                  <h4 className="font-medium">Написать меню</h4>
                  <p className="text-sm text-muted-foreground">Создать текст меню</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}