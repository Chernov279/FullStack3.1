import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { FileText, PlusCircle, Trash2, Edit3, Menu, Utensils, Star } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

interface Document {
  id: string;
  title: string;
  type: 'menu' | 'recipe-notes' | 'staff-notes' | 'supplier-notes' | 'other';
  content: string;
  createdAt: string;
  lastModified: string;
}

interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
}

const documentTypes = [
  { value: 'menu', label: 'Меню' },
  { value: 'recipe-notes', label: 'Заметки к рецептам' },
  { value: 'staff-notes', label: 'Заметки о персонале' },
  { value: 'supplier-notes', label: 'Заметки о поставщиках' },
  { value: 'other', label: 'Прочее' }
];

export function WritingTools() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    title: '',
    type: 'other',
    content: ''
  });

  // Menu creator state
  const [menuTitle, setMenuTitle] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newMenuItem, setNewMenuItem] = useState<MenuItem>({
    name: '',
    description: '',
    price: '',
    category: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async () => {
    if (newDocument.title && newDocument.content) {
      const document = {
        title: newDocument.title,
        type: newDocument.type as Document['type'],
        content: newDocument.content,
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };

      try {
        const response = await fetch(`${API_BASE_URL}/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(document),
        });

        if (!response.ok) throw new Error('Failed to save document');

        await fetchDocuments();
        setNewDocument({ title: '', type: 'other', content: '' });
        setIsAddingDocument(false);
      } catch (error) {
        console.error('Error saving document:', error);
      }
    }
  };

  const updateDocument = async () => {
    if (editingDocument && editingDocument.title && editingDocument.content) {
      const updatedDocument = {
        ...editingDocument,
        lastModified: new Date().toISOString().split('T')[0]
      };

      try {
        const response = await fetch(`${API_BASE_URL}/documents/${editingDocument.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedDocument),
        });

        if (!response.ok) throw new Error('Failed to update document');

        await fetchDocuments();
        setEditingDocument(null);
      } catch (error) {
        console.error('Error updating document:', error);
      }
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');

      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const addMenuItem = () => {
    if (newMenuItem.name && newMenuItem.description && newMenuItem.price) {
      setMenuItems(prev => [...prev, newMenuItem]);
      setNewMenuItem({ name: '', description: '', price: '', category: '' });
    }
  };

  const generateMenuDocument = async () => {
    if (menuTitle && menuItems.length > 0) {
      const categorizedItems = menuItems.reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {} as Record<string, MenuItem[]>);

      let content = `${menuTitle.toUpperCase()}\\n\\n`;
      
      Object.entries(categorizedItems).forEach(([category, items]) => {
        content += `${category.toUpperCase()}\\n\\n`;
        items.forEach(item => {
          content += `${item.name}\\n${item.description}\\n₽${item.price}\\n\\n`;
        });
      });

      const document = {
        title: menuTitle,
        type: 'menu' as Document['type'],
        content: content.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };

      try {
        const response = await fetch(`${API_BASE_URL}/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(document),
        });

        if (!response.ok) throw new Error('Failed to save menu');

        await fetchDocuments();
        setMenuTitle('');
        setMenuItems([]);
        setIsCreatingMenu(false);
      } catch (error) {
        console.error('Error saving menu:', error);
      }
    }
  };

  const filteredDocuments = documents.filter(doc => 
    filterType === 'all' || doc.type === filterType
  );

  const getTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'menu': return <Menu className="h-4 w-4" />;
      case 'recipe-notes': return <Utensils className="h-4 w-4" />;
      case 'staff-notes': return <Star className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: Document['type']) => {
    switch (type) {
      case 'menu': return 'default' as const;
      case 'recipe-notes': return 'secondary' as const;
      case 'staff-notes': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl">Инструменты для написания</h2>
          <p className="text-muted-foreground">
            Создавайте меню, заметки и документацию для вашей кухни
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreatingMenu} onOpenChange={setIsCreatingMenu}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Menu className="mr-2 h-4 w-4" />
                Создание меню
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Создание меню</DialogTitle>
                <DialogDescription>
                  Создайте профессиональное меню со структурированными позициями
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="menuTitle">Название меню</Label>
                  <Input
                    id="menuTitle"
                    value={menuTitle}
                    onChange={(e) => setMenuTitle(e.target.value)}
                    placeholder="напр., Зимнее меню 2024"
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Добавить позиции меню</h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Название позиции"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Цена (в ₽)"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div className="col-span-3">
                      <Textarea
                        placeholder="Описание"
                        value={newMenuItem.description}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Категория"
                        value={newMenuItem.category}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                      />
                      <Button onClick={addMenuItem} size="sm" className="w-full">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {menuItems.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Позиции меню ({menuItems.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {menuItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-sm text-muted-foreground">₽{item.price}</span>
                              {item.category && (
                                <Badge variant="outline" className="text-xs">{item.category}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setMenuItems(prev => prev.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingMenu(false)}>
                    Отмена
                  </Button>
                  <Button onClick={generateMenuDocument} disabled={!menuTitle || menuItems.length === 0}>
                    Создать меню
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Новый документ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Создать новый документ</DialogTitle>
                <DialogDescription>
                  Пишите заметки, процедуры или другую документацию
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="docTitle">Название</Label>
                    <Input
                      id="docTitle"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Название документа"
                    />
                  </div>
                  <div>
                    <Label htmlFor="docType">Тип</Label>
                    <Select value={newDocument.type} onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value as Document['type'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="docContent">Содержание</Label>
                  <Textarea
                    id="docContent"
                    value={newDocument.content}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Начните писать..."
                    rows={10}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingDocument(false)}>
                    Отмена
                  </Button>
                  <Button onClick={addDocument}>Сохранить документ</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label htmlFor="filter">Фильтр по типу:</Label>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Все типы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            {documentTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Загрузка документов...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDocuments.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Документы не найдены</p>
              <p className="text-sm">Создайте свой первый документ, чтобы начать</p>
            </div>
          ) : (
            filteredDocuments.map((document) => (
              <Card key={document.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(document.type)}
                      <CardTitle className="text-lg">{document.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeBadgeVariant(document.type)}>
                        {documentTypes.find(t => t.value === document.type)?.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDocument(document)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Создано: {new Date(document.createdAt).toLocaleDateString('ru-RU')} • 
                    Изменено: {new Date(document.lastModified).toLocaleDateString('ru-RU')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {document.content.length > 200 
                        ? document.content.substring(0, 200) + '...' 
                        : document.content
                      }
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Document Dialog */}
      <Dialog open={!!editingDocument} onOpenChange={() => setEditingDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать документ</DialogTitle>
            <DialogDescription>
              Внесите изменения в документ
            </DialogDescription>
          </DialogHeader>
          {editingDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editTitle">Название</Label>
                  <Input
                    id="editTitle"
                    value={editingDocument.title}
                    onChange={(e) => setEditingDocument(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="editType">Тип</Label>
                  <Select 
                    value={editingDocument.type} 
                    onValueChange={(value) => setEditingDocument(prev => prev ? { ...prev, type: value as Document['type'] } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="editContent">Содержание</Label>
                <Textarea
                  id="editContent"
                  value={editingDocument.content}
                  onChange={(e) => setEditingDocument(prev => prev ? { ...prev, content: e.target.value } : null)}
                  rows={15}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingDocument(null)}>
                  Отмена
                </Button>
                <Button onClick={updateDocument}>Обновить документ</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
