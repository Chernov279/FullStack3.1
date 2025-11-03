import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { DollarSign, TrendingUp, TrendingDown, PlusCircle, Calendar } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  vendor: string;
}

interface Revenue {
  id: string;
  date: string;
  amount: number;
  source: string;
  description: string;
}

const expenseCategories = [
  'Продукты и ингредиенты',
  'Зарплата',
  'Коммунальные услуги',
  'Оборудование',
  'Аренда',
  'Маркетинг',
  'Расходные материалы',
  'Прочее'
];

export function AccountingTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingRevenue, setIsAddingRevenue] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    vendor: ''
  });
  const [newRevenue, setNewRevenue] = useState<Partial<Revenue>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    source: '',
    description: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchRevenue();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchRevenue = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/revenue`);
      if (!response.ok) throw new Error('Failed to fetch revenue');
      const data = await response.json();
      setRevenue(data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (newExpense.category && newExpense.description && newExpense.amount && newExpense.vendor) {
      const expense = {
        date: newExpense.date || new Date().toISOString().split('T')[0],
        category: newExpense.category,
        description: newExpense.description,
        amount: newExpense.amount,
        vendor: newExpense.vendor
      };

      try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(expense),
        });

        if (!response.ok) throw new Error('Failed to add expense');
        
        await fetchExpenses();
        setNewExpense({
          date: new Date().toISOString().split('T')[0],
          category: '',
          description: '',
          amount: 0,
          vendor: ''
        });
        setIsAddingExpense(false);
      } catch (error) {
        console.error('Error adding expense:', error);
      }
    }
  };

  const addRevenue = async () => {
    if (newRevenue.amount && newRevenue.source && newRevenue.description) {
      const revenueEntry = {
        date: newRevenue.date || new Date().toISOString().split('T')[0],
        amount: newRevenue.amount,
        source: newRevenue.source,
        description: newRevenue.description
      };

      try {
        const response = await fetch(`${API_BASE_URL}/revenue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(revenueEntry),
        });

        if (!response.ok) throw new Error('Failed to add revenue');
        
        await fetchRevenue();
        setNewRevenue({
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          source: '',
          description: ''
        });
        setIsAddingRevenue(false);
      } catch (error) {
        console.error('Error adding revenue:', error);
      }
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalRevenue = revenue.reduce((sum, rev) => sum + rev.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl">Бухгалтерия</h2>
          <p className="text-muted-foreground">
            Отслеживайте расходы, доходы и финансовые показатели
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Добавить расход
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить новый расход</DialogTitle>
                <DialogDescription>
                  Зафиксируйте новый бизнес-расход
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expenseDate">Дата</Label>
                    <Input
                      id="expenseDate"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenseAmount">Сумма (₽)</Label>
                    <Input
                      id="expenseAmount"
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="expenseCategory">Категория</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expenseVendor">Поставщик</Label>
                  <Input
                    id="expenseVendor"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="Название поставщика"
                  />
                </div>

                <div>
                  <Label htmlFor="expenseDescription">Описание</Label>
                  <Input
                    id="expenseDescription"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание расхода"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
                    Отмена
                  </Button>
                  <Button onClick={addExpense}>Добавить расход</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingRevenue} onOpenChange={setIsAddingRevenue}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Добавить доход
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить новый доход</DialogTitle>
                <DialogDescription>
                  Зафиксируйте новый доход или поступление
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="revenueDate">Дата</Label>
                    <Input
                      id="revenueDate"
                      type="date"
                      value={newRevenue.date}
                      onChange={(e) => setNewRevenue(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="revenueAmount">Сумма (₽)</Label>
                    <Input
                      id="revenueAmount"
                      type="number"
                      step="0.01"
                      value={newRevenue.amount}
                      onChange={(e) => setNewRevenue(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="revenueSource">Источник</Label>
                  <Input
                    id="revenueSource"
                    value={newRevenue.source}
                    onChange={(e) => setNewRevenue(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="Источник дохода"
                  />
                </div>

                <div>
                  <Label htmlFor="revenueDescription">Описание</Label>
                  <Input
                    id="revenueDescription"
                    value={newRevenue.description}
                    onChange={(e) => setNewRevenue(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание дохода"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingRevenue(false)}>
                    Отмена
                  </Button>
                  <Button onClick={addRevenue}>Добавить доход</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Загрузка финансовых данных...</p>
        </div>
      ) : (
        <>
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₽{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Весь доход за всё время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общие расходы</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₽{totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Все расходы за всё время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Чистая прибыль</CardTitle>
            <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₽{netProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Доход - Расходы</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Недавние расходы</CardTitle>
            <CardDescription>Последние бизнес-расходы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{expense.description}</h4>
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {expense.vendor} • {new Date(expense.date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-red-600">-${expense.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Недавние доходы</CardTitle>
            <CardDescription>Последние записи о доходах</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenue.slice(0, 5).map((rev) => (
                <div key={rev.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{rev.description}</h4>
                      <Badge variant="outline" className="text-xs">
                        {rev.source}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(rev.date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-green-600">+${rev.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Расходы по категориям</CardTitle>
          <CardDescription>Разбивка расходов по категориям</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-1">{category}</h4>
                <p className="text-2xl font-bold text-red-600">${amount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {((amount / totalExpenses) * 100).toFixed(1)}% от общей суммы
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}