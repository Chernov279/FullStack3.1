import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import type { IngredientOut } from '../types';

// Базовый URL API
const API_BASE_URL = 'http://127.0.0.1:8000';

export function IngredientManagement() {
  const [ingredients, setIngredients] = useState<IngredientOut[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientOut | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: 0 });
  const [editingIngredient, setEditingIngredient] = useState<IngredientOut | null>(null);
  const [loading, setLoading] = useState({
    list: false,
    add: false,
    delete: false,
    detail: false
  });
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка ингредиентов при монтировании компонента
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    setLoading(prev => ({ ...prev, list: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/`);
      if (!response.ok) throw new Error('Ошибка при загрузке ингредиентов');
      const data: IngredientOut[] = await response.json();
      setIngredients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  };

  const fetchIngredientDetail = async (id: number) => {
    setLoading(prev => ({ ...prev, detail: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/${id}`);
      if (!response.ok) throw new Error('Ошибка при загрузке деталей ингредиента');
      const data: IngredientOut = await response.json();
      setSelectedIngredient(data);
      setEditingIngredient({ ...data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, detail: false }));
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(prev => ({ ...prev, delete: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ингредиент не найден');
        }
        throw new Error('Ошибка при удалении ингредиента');
      }
      
      setIngredients(ingredients.filter(i => i.id !== id));
      if (selectedIngredient?.id === id) {
        setSelectedIngredient(null);
        setEditingIngredient(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleAdd = async () => {
    if (!newIngredient.name.trim()) {
      setError('Введите название ингредиента');
      return;
    }

    if (newIngredient.quantity < 0) {
      setError('Количество не может быть отрицательным');
      return;
    }

    setLoading(prev => ({ ...prev, add: true }));
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newIngredient.name,
          quantity: newIngredient.quantity
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при добавлении ингредиента');
      }
      
      const createdIngredient: IngredientOut = await response.json();
      setIngredients([...ingredients, createdIngredient]);
      setNewIngredient({ name: '', quantity: 0 });
      setIsAddDialogOpen(false);
      
      // Показываем успешное сообщение
      setError('success: Ингредиент успешно добавлен');
      setTimeout(() => setError(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, add: false }));
    }
  };

  const handleUpdate = async () => {
    if (!editingIngredient) return;

    if (editingIngredient.quantity < 0) {
      setError('Количество не может быть отрицательным');
      return;
    }

    setLoading(prev => ({ ...prev, add: true }));
    setError(null);
    
    try {
      // Создаем эндпоинт для обновления, если его нет на бэкенде
      // Если PUT метод не поддерживается, нужно добавить его на бэкенде
      const response = await fetch(`${API_BASE_URL}/ingredients/${editingIngredient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingIngredient.name,
          quantity: editingIngredient.quantity
        }),
      });
      
      if (!response.ok) {
        // Если 404 - метод не найден, значит обновление не поддерживается
        if (response.status === 404) {
          throw new Error('Редактирование ингредиентов временно недоступно');
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при обновлении ингредиента');
      }
      
      const updatedIngredient: IngredientOut = await response.json();
      setIngredients(ingredients.map(i => 
        i.id === updatedIngredient.id ? updatedIngredient : i
      ));
      setEditingIngredient(null);
      setSelectedIngredient(null);
      
      // Показываем успешное сообщение
      setError('success: Ингредиент успешно обновлен');
      setTimeout(() => setError(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, add: false }));
    }
  };

  const handleIngredientClick = (ingredient: IngredientOut) => {
    // Для получения деталей используем API
    fetchIngredientDetail(ingredient.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Управление Ингредиентами</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить ингредиент
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый ингредиент</DialogTitle>
              <DialogDescription>
                Введите информацию о новом ингредиенте
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ingredient-name">Название *</Label>
                <Input
                  id="ingredient-name"
                  placeholder="Название ингредиента"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  disabled={loading.add}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ingredient-quantity">Количество (кг)</Label>
                <Input
                  id="ingredient-quantity"
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="0"
                  value={newIngredient.quantity || ''}
                  onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 0 })}
                  disabled={loading.add}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading.add}>
                Отмена
              </Button>
              <Button onClick={handleAdd} disabled={loading.add}>
                {loading.add ? (
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
        <div className={`px-4 py-3 rounded-lg ${
          error.startsWith('success:') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {error.replace('success: ', '')}
        </div>
      )}

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead className="w-32">Количество (кг)</TableHead>
              <TableHead className="w-40 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.list ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : ingredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Ингредиенты не найдены
                </TableCell>
              </TableRow>
            ) : (
              ingredients.map((ingredient) => (
                <TableRow key={ingredient.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>{ingredient.id}</TableCell>
                  <TableCell onClick={() => handleIngredientClick(ingredient)}>
                    {ingredient.name}
                  </TableCell>
                  <TableCell onClick={() => handleIngredientClick(ingredient)}>
                    {ingredient.quantity.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} disabled={loading.delete}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить ингредиент "{ingredient.name}"? Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading.delete}>Отмена</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(ingredient.id)}
                              disabled={loading.delete}
                            >
                              {loading.delete ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Удаление...
                                </>
                              ) : (
                                'Удалить'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ingredient Detail Dialog */}
      <Dialog open={!!selectedIngredient} onOpenChange={(open) => !open && (setSelectedIngredient(null), setEditingIngredient(null))}>
        <DialogContent>
          <DialogHeader>
            {loading.detail ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <DialogTitle>Загрузка...</DialogTitle>
              </div>
            ) : (
              <>
                <DialogTitle>Детали ингредиента</DialogTitle>
                <DialogDescription>ID: {selectedIngredient?.id}</DialogDescription>
              </>
            )}
          </DialogHeader>
          
          {loading.detail ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : editingIngredient ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название</Label>
                <Input
                  id="edit-name"
                  value={editingIngredient.name}
                  onChange={(e) => setEditingIngredient({ ...editingIngredient, name: e.target.value })}
                  disabled={loading.add}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Количество (кг)</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  step="0.001"
                  value={editingIngredient.quantity}
                  onChange={(e) => setEditingIngredient({ ...editingIngredient, quantity: parseFloat(e.target.value) || 0 })}
                  disabled={loading.add}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => (setSelectedIngredient(null), setEditingIngredient(null))} disabled={loading.add}>
                  Закрыть
                </Button>
                <Button onClick={handleUpdate} disabled={loading.add}>
                  {loading.add ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить'
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}