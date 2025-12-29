import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { DishListOut, AllergenMatrixOut } from '../types';

// Базовый URL API
const API_BASE_URL = 'http://127.0.0.1:8000';

// Интерфейс для себестоимости
interface DishCostOut {
  total_cost: number;
}

export function DishManagement() {
  const [dishes, setDishes] = useState<DishListOut[]>([]);
  const [selectedDish, setSelectedDish] = useState<DishListOut | null>(null);
  const [dishCost, setDishCost] = useState<number | null>(null);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [loading, setLoading] = useState({
    dishes: false,
    dishDetail: false,
    allergens: false,
    addDish: false
  });
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка блюд при монтировании компонента
  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    setLoading(prev => ({ ...prev, dishes: true }));
    setError(null);
    try {
      // Используем /dish/all для получения списка блюд
      const response = await fetch(`${API_BASE_URL}/dish/all`);
      if (!response.ok) throw new Error('Ошибка при загрузке блюд');
      const data: DishListOut[] = await response.json();
      setDishes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, dishes: false }));
    }
  };

  const fetchDishCost = async (id: number) => {
    setLoading(prev => ({ ...prev, dishDetail: true }));
    setError(null);
    try {
      // Запрашиваем себестоимость блюда
      const response = await fetch(`${API_BASE_URL}/dish/${id}`);
      if (!response.ok) throw new Error('Ошибка при загрузке себестоимости блюда');
      const data: DishCostOut = await response.json();
      setDishCost(data.total_cost);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, dishDetail: false }));
    }
  };

  const fetchAllergens = async (dishId: number) => {
    setLoading(prev => ({ ...prev, allergens: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/allergens/matrix?dish_id=${dishId}`);
      if (!response.ok) throw new Error('Ошибка при загрузке аллергенов');
      const data: AllergenMatrixOut = await response.json();
      setAllergens(data.allergens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, allergens: false }));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dish/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Ошибка при удалении блюда');
      setDishes(dishes.filter(d => d.id !== id));
      if (selectedDish?.id === id) {
        setSelectedDish(null);
        setDishCost(null);
        setAllergens([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  const handleAdd = async () => {
    if (!newDishName.trim()) {
      setError('Введите название блюда');
      return;
    }

    setLoading(prev => ({ ...prev, addDish: true }));
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/dish/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newDishName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.detail && errorData.detail.includes('уже существует')) {
          throw new Error(`Блюдо "${newDishName}" уже существует в базе данных`);
        }
        throw new Error(errorData.detail || 'Ошибка при добавлении блюда');
      }
      
      const createdDish: DishListOut = await response.json();
      setDishes([...dishes, createdDish]);
      setNewDishName('');
      setIsAddDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, addDish: false }));
    }
  };

  const handleDishClick = (dish: DishListOut) => {
    setSelectedDish(dish);
    setDishCost(null);
    setAllergens([]);
    fetchDishCost(dish.id);
  };

  const handleShowAllergens = () => {
    if (selectedDish) {
      fetchAllergens(selectedDish.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Управление Блюдами</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить блюдо
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новое блюдо</DialogTitle>
              <DialogDescription>
                Введите название нового блюда
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dish-name">Название *</Label>
                <Input
                  id="dish-name"
                  placeholder="Название блюда"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAdd} disabled={loading.addDish}>
                {loading.addDish ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Добавление...
                  </>
                ) : (
                  'Добавить'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead className="w-32 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.dishes ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : dishes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Блюда не найдены
                </TableCell>
              </TableRow>
            ) : (
              dishes.map((dish) => (
                <TableRow key={dish.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>{dish.id}</TableCell>
                  <TableCell onClick={() => handleDishClick(dish)}>
                    {dish.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить блюдо "{dish.name}"? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(dish.id)}>
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dish Detail Dialog */}
      <Dialog open={!!selectedDish} onOpenChange={(open) => {
        if (!open) {
          setSelectedDish(null);
          setDishCost(null);
          setAllergens([]);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            {loading.dishDetail ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <DialogTitle>Загрузка...</DialogTitle>
              </div>
            ) : (
              <>
                <DialogTitle>{selectedDish?.name}</DialogTitle>
                <DialogDescription>ID: {selectedDish?.id}</DialogDescription>
              </>
            )}
          </DialogHeader>
          
          {loading.dishDetail ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Себестоимость</h3>
                <p className="text-2xl font-bold text-slate-900">
                  {dishCost !== null ? `${dishCost.toFixed(2)} ₽` : 'Не рассчитана'}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleShowAllergens}
                  disabled={loading.allergens}
                >
                  {loading.allergens ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : allergens.length > 0 ? (
                    'Скрыть аллергены'
                  ) : (
                    'Показать аллергены'
                  )}
                </Button>
              </div>

              {allergens.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="mb-3 font-semibold">Аллергены</h4>
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((allergen, index) => (
                      <Badge key={index} variant="outline" className="bg-white">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}