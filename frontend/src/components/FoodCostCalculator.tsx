import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calculator, TrendingUp, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

interface CostItem {
  id: string;
  name: string;
  costPerUnit: number;
  unit: string;
  quantityUsed: number;
  totalCost: number;
}

interface CostAnalysis {
  id: string;
  dishName: string;
  items: CostItem[];
  totalCost: number;
  sellingPrice: number;
  foodCostPercentage: number;
  profit: number;
}

export function FoodCostCalculator() {
  const [analyses, setAnalyses] = useState<CostAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAnalysis, setCurrentAnalysis] = useState<Partial<CostAnalysis>>({
    dishName: '',
    items: [],
    sellingPrice: 0
  });
  const [newItem, setNewItem] = useState<Partial<CostItem>>({
    name: '',
    costPerUnit: 0,
    unit: 'lb',
    quantityUsed: 0
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cost-analyses`);
      if (!response.ok) throw new Error('Failed to fetch analyses');
      const data = await response.json();
      setAnalyses(data);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (newItem.name && newItem.costPerUnit && newItem.quantityUsed) {
      const totalCost = newItem.costPerUnit * newItem.quantityUsed;
      const item: CostItem = {
        id: Date.now().toString(),
        name: newItem.name,
        costPerUnit: newItem.costPerUnit,
        unit: newItem.unit || 'lb',
        quantityUsed: newItem.quantityUsed,
        totalCost
      };
      
      setCurrentAnalysis(prev => ({
        ...prev,
        items: [...(prev.items || []), item]
      }));
      
      setNewItem({
        name: '',
        costPerUnit: 0,
        unit: 'lb',
        quantityUsed: 0
      });
    }
  };

  const removeItem = (itemId: string) => {
    setCurrentAnalysis(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId) || []
    }));
  };

  const calculateAnalysis = async () => {
    if (currentAnalysis.dishName && currentAnalysis.items && currentAnalysis.sellingPrice) {
      const totalCost = currentAnalysis.items.reduce((sum, item) => sum + item.totalCost, 0);
      const profit = currentAnalysis.sellingPrice - totalCost;
      const foodCostPercentage = (totalCost / currentAnalysis.sellingPrice) * 100;
      
      const analysis = {
        dishName: currentAnalysis.dishName,
        items: currentAnalysis.items,
        totalCost,
        sellingPrice: currentAnalysis.sellingPrice,
        foodCostPercentage,
        profit
      };

      try {
        const response = await fetch(`${API_BASE_URL}/cost-analyses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(analysis),
        });

        if (!response.ok) throw new Error('Failed to save analysis');
        
        await fetchAnalyses();
        setCurrentAnalysis({
          dishName: '',
          items: [],
          sellingPrice: 0
        });
      } catch (error) {
        console.error('Error saving analysis:', error);
      }
    }
  };

  const currentTotalCost = currentAnalysis.items?.reduce((sum, item) => sum + item.totalCost, 0) || 0;
  const currentFoodCostPercentage = currentAnalysis.sellingPrice 
    ? (currentTotalCost / currentAnalysis.sellingPrice) * 100 
    : 0;

  const getFoodCostColor = (percentage: number) => {
    if (percentage <= 30) return 'text-green-600';
    if (percentage <= 35) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFoodCostBadge = (percentage: number) => {
    if (percentage <= 30) return { variant: 'default' as const, text: 'Отлично' };
    if (percentage <= 35) return { variant: 'secondary' as const, text: 'Хорошо' };
    return { variant: 'destructive' as const, text: 'Высокий' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Калькулятор себестоимости</h2>
        <p className="text-muted-foreground">
          Рассчитывайте и анализируйте затраты на продукты для оптимального ценообразования
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Калькулятор себестоимости
            </CardTitle>
            <CardDescription>
              Рассчитайте детализацию затрат на блюдо
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dishName">Название блюда</Label>
              <Input
                id="dishName"
                value={currentAnalysis.dishName}
                onChange={(e) => setCurrentAnalysis(prev => ({ ...prev, dishName: e.target.value }))}
                placeholder="Введите название блюда"
              />
            </div>

            <div>
              <Label htmlFor="sellingPrice">Цена продажи (₽)</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                value={currentAnalysis.sellingPrice}
                onChange={(e) => setCurrentAnalysis(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Добавить ингредиенты</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder="Название ингредиента"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Стоимость за единицу"
                  type="number"
                  step="0.01"
                  value={newItem.costPerUnit}
                  onChange={(e) => setNewItem(prev => ({ ...prev, costPerUnit: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <Select value={newItem.unit} onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Единица" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lb">фунт</SelectItem>
                    <SelectItem value="oz">унция</SelectItem>
                    <SelectItem value="kg">кг</SelectItem>
                    <SelectItem value="g">г</SelectItem>
                    <SelectItem value="cup">стакан</SelectItem>
                    <SelectItem value="tbsp">ст.л.</SelectItem>
                    <SelectItem value="tsp">ч.л.</SelectItem>
                    <SelectItem value="each">шт</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Использовано"
                  type="number"
                  step="0.01"
                  value={newItem.quantityUsed}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantityUsed: parseFloat(e.target.value) || 0 }))}
                />
                <Button onClick={addItem} size="sm">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {currentAnalysis.items && currentAnalysis.items.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Ингредиенты</h4>
                <div className="space-y-2">
                  {currentAnalysis.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {item.quantityUsed} {item.unit} × ₽{item.costPerUnit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">₽{item.totalCost.toFixed(2)}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentAnalysis.items && currentAnalysis.items.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Общая стоимость:</span>
                  <span className="font-medium">₽{currentTotalCost.toFixed(2)}</span>
                </div>
                {currentAnalysis.sellingPrice > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Процент себестоимости:</span>
                      <span className={`font-medium ${getFoodCostColor(currentFoodCostPercentage)}`}>
                        {currentFoodCostPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Прибыль:</span>
                      <span className="font-medium">₽{(currentAnalysis.sellingPrice - currentTotalCost).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <Button 
              onClick={calculateAnalysis} 
              className="w-full"
              disabled={!currentAnalysis.dishName || !currentAnalysis.items?.length || !currentAnalysis.sellingPrice}
            >
              Сохранить анализ
            </Button>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Сводка анализа затрат
            </CardTitle>
            <CardDescription>
              Обзор расчётов стоимости продуктов
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Загрузка анализов...</p>
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Анализов пока нет</p>
                <p className="text-sm">Создайте свой первый анализ затрат, чтобы увидеть результаты здесь</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{analysis.dishName}</h4>
                      <Badge {...getFoodCostBadge(analysis.foodCostPercentage)}>
                        {getFoodCostBadge(analysis.foodCostPercentage).text}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Общая стоимость:</span>
                        <span className="ml-2 font-medium">₽{analysis.totalCost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Цена продажи:</span>
                        <span className="ml-2 font-medium">₽{analysis.sellingPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Процент себестоимости:</span>
                        <span className={`ml-2 font-medium ${getFoodCostColor(analysis.foodCostPercentage)}`}>
                          {analysis.foodCostPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Прибыль:</span>
                        <span className="ml-2 font-medium">₽{analysis.profit.toFixed(2)}</span>
                      </div>
                    </div>
                    {analysis.foodCostPercentage > 35 && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        Процент себестоимости высокий. Рассмотрите возможность изменения цен или порций.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}