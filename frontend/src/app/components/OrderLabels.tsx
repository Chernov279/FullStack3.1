import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { CheckCircle2, Circle, Trash2, Loader2, Plus } from 'lucide-react';
import type { LabelOut } from '../types';

// Базовый URL API
const API_BASE_URL = 'http://127.0.0.1:8000';

export function OrderLabels() {
  const [labels, setLabels] = useState<LabelOut[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<LabelOut | null>(null);
  const [loading, setLoading] = useState({
    list: false,
    delete: false
  });
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка чеков при монтировании компонента
  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    setLoading(prev => ({ ...prev, list: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/labels/`);
      if (!response.ok) throw new Error('Ошибка при загрузке чеков');
      const data: LabelOut[] = await response.json();
      setLabels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  };

  const fetchLabelDetail = async (id: number) => {
    setLoading(prev => ({ ...prev, list: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/labels/${id}`);
      if (!response.ok) throw new Error('Ошибка при загрузке деталей чека');
      const data: LabelOut = await response.json();
      setSelectedLabel(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(prev => ({ ...prev, delete: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/labels/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Чек не найден');
        }
        throw new Error('Ошибка при удалении чека');
      }
      
      setLabels(labels.filter(label => label.id !== id));
      if (selectedLabel?.id === id) {
        setSelectedLabel(null);
      }
      
      // Показываем успешное сообщение
      setError('success: Чек успешно удален');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleLabelClick = (label: LabelOut) => {
    setSelectedLabel(label);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('ru-RU')} ₽`;
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('ru-RU');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Чеки Заказов</h1>
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
              <TableHead className="w-32">Номер заказа</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead className="w-32">Сумма</TableHead>
              <TableHead className="w-48">Время доставки</TableHead>
              <TableHead className="w-24 text-center">Напечатан</TableHead>
              <TableHead className="w-24 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.list ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : labels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Чеки не найдены
                </TableCell>
              </TableRow>
            ) : (
              labels.map((label) => (
                <TableRow 
                  key={label.id} 
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <TableCell onClick={() => handleLabelClick(label)}>{label.id}</TableCell>
                  <TableCell onClick={() => handleLabelClick(label)}>
                    <Badge variant="secondary">{label.order_id || '—'}</Badge>
                  </TableCell>
                  <TableCell onClick={() => handleLabelClick(label)}>
                    {label.customer_name || '—'}
                  </TableCell>
                  <TableCell onClick={() => handleLabelClick(label)}>
                    {formatCurrency(label.total_sum)}
                  </TableCell>
                  <TableCell onClick={() => handleLabelClick(label)}>
                    {label.delivery_time ? formatDateTime(label.delivery_time) : '—'}
                  </TableCell>
                  <TableCell onClick={() => handleLabelClick(label)} className="text-center">
                    {label.printed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => e.stopPropagation()}
                          disabled={loading.delete}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить чек {label.order_id ? `#${label.order_id}` : `ID: ${label.id}`}? 
                            Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={loading.delete}>Отмена</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(label.id)}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Label Detail Dialog */}
      <Dialog open={!!selectedLabel} onOpenChange={(open) => !open && setSelectedLabel(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLabel?.order_id ? `Детали заказа #${selectedLabel.order_id}` : 'Детали чека'}
            </DialogTitle>
            <DialogDescription>ID чека: {selectedLabel?.id}</DialogDescription>
          </DialogHeader>
          {selectedLabel && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-slate-500">Клиент</h3>
                  <p className="text-slate-900">{selectedLabel.customer_name || '—'}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-slate-500">Сумма заказа</h3>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(selectedLabel.total_sum)}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-slate-500">Время доставки</h3>
                  <p className="text-slate-900">
                    {selectedLabel.delivery_time ? formatDateTime(selectedLabel.delivery_time) : '—'}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-slate-500">Создан</h3>
                  <p className="text-slate-900">
                    {selectedLabel.created_at ? formatDateTime(selectedLabel.created_at) : '—'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-1 text-sm font-medium text-slate-500">Адрес доставки</h3>
                <p className="text-slate-900">{selectedLabel.address || '—'}</p>
              </div>

              {selectedLabel.comment && (
                <div>
                  <h3 className="mb-1 text-sm font-medium text-slate-500">Комментарий</h3>
                  <p className="text-slate-900 p-3 bg-slate-50 rounded-lg">{selectedLabel.comment}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-slate-500">Статус печати:</h3>
                <Badge variant={selectedLabel.printed ? "default" : "secondary"}>
                  {selectedLabel.printed ? "Напечатан" : "Не напечатан"}
                </Badge>
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3 text-lg font-medium text-slate-900">Состав заказа</h3>
                <div className="space-y-2">
                  {selectedLabel.items && selectedLabel.items.length > 0 ? (
                    selectedLabel.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <span className="text-slate-900 font-medium">{item.dish_name}</span>
                          <span className="text-slate-500 text-sm ml-2">ID: {item.dish_id}</span>
                        </div>
                        <Badge variant="outline" className="text-lg font-semibold">× {item.qty}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-4">Нет позиций в заказе</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}