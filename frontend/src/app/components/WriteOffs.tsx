import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { WriteOffRead } from '../types';

// Базовый URL API
const API_BASE_URL = 'http://127.0.0.1:8000';

// Интерфейс для создания списания (соответствует WriteOffCreate на бэкенде)
interface WriteOffCreate {
  ingredient: string;
  quantity: number;
  reason?: string;
}

export function WriteOffs() {
  const [writeOffs, setWriteOffs] = useState<WriteOffRead[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newWriteOff, setNewWriteOff] = useState<WriteOffCreate>({
    ingredient: '',
    quantity: 0,
    reason: ''
  });
  const [loading, setLoading] = useState({
    list: false,
    add: false,
    delete: false
  });
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка списаний при монтировании компонента
  useEffect(() => {
    fetchWriteOffs();
  }, []);

  const fetchWriteOffs = async () => {
    setLoading(prev => ({ ...prev, list: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/writeoff/`);
      if (!response.ok) throw new Error('Ошибка при загрузке списаний');
      const data: WriteOffRead[] = await response.json();
      setWriteOffs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  };

  const handleAdd = async () => {
    if (!newWriteOff.ingredient.trim()) {
      setError('Введите название ингредиента');
      return;
    }

    if (newWriteOff.quantity <= 0) {
      setError('Количество должно быть больше 0');
      return;
    }

    setLoading(prev => ({ ...prev, add: true }));
    setError(null);
    
    try {
      // Создаем массив с одним списанием, так как API ожидает List[WriteOffCreate]
      const writeoffsToCreate: WriteOffCreate[] = [{
        ingredient: newWriteOff.ingredient,
        quantity: newWriteOff.quantity,
        reason: newWriteOff.reason?.trim() || undefined
      }];

      const response = await fetch(`${API_BASE_URL}/writeoff/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(writeoffsToCreate),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при создании списания');
      }
      
      // Получаем созданные списания (массив)
      const createdWriteOffs: WriteOffRead[] = await response.json();
      
      // Добавляем новые списания в начало списка
      setWriteOffs([...createdWriteOffs, ...writeOffs]);
      setNewWriteOff({ ingredient: '', quantity: 0, reason: '' });
      setIsAddDialogOpen(false);
      
      // Показываем успешное сообщение
      setError('success: Списание успешно добавлено');
      setTimeout(() => setError(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, add: false }));
    }
  };

  const handleDelete = async (id: number) => {
    // NOTE: В вашем бэкенде нет эндпоинта для удаления отдельных списаний
    // Если нужно удаление, нужно добавить эндпоинт на бэкенде
    setError('Функция удаления списаний временно недоступна');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Списания Товаров</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Записать списание
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Записать новое списание</DialogTitle>
              <DialogDescription>
                Введите информацию о списании товара
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="writeoff-ingredient">Название ингредиента *</Label>
                <Input
                  id="writeoff-ingredient"
                  placeholder="Название ингредиента"
                  value={newWriteOff.ingredient}
                  onChange={(e) => setNewWriteOff({ ...newWriteOff, ingredient: e.target.value })}
                  disabled={loading.add}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="writeoff-quantity">Количество (кг) *</Label>
                <Input
                  id="writeoff-quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  placeholder="0.000"
                  value={newWriteOff.quantity || ''}
                  onChange={(e) => setNewWriteOff({ 
                    ...newWriteOff, 
                    quantity: parseFloat(e.target.value) || 0 
                  })}
                  disabled={loading.add}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="writeoff-reason">Причина списания</Label>
                <Textarea
                  id="writeoff-reason"
                  placeholder="Укажите причину списания (например: порча, истечение срока годности)"
                  value={newWriteOff.reason || ''}
                  onChange={(e) => setNewWriteOff({ ...newWriteOff, reason: e.target.value })}
                  rows={3}
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
                  'Записать'
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
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Ингредиент</TableHead>
              <TableHead className="w-32">Количество (кг)</TableHead>
              <TableHead>Причина</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.list ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : writeOffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Списания не найдены
                </TableCell>
              </TableRow>
            ) : (
              writeOffs.map((writeOff) => (
                <TableRow key={writeOff.id}>
                  <TableCell>{writeOff.id}</TableCell>
                  <TableCell className="font-medium">{writeOff.ingredient}</TableCell>
                  <TableCell>{writeOff.quantity.toFixed(3)}</TableCell>
                  <TableCell>
                    {writeOff.reason ? (
                      <span className="text-slate-700">{writeOff.reason}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}