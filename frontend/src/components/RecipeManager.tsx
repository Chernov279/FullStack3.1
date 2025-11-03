import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { PlusCircle, Clock, Users, ChefHat } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: { name: string; amount: string; unit: string }[];
  instructions: string[];
  category: string;
}

export function RecipeManager() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    description: '',
    prepTime: 0,
    cookTime: 0,
    servings: 0,
    ingredients: [],
    instructions: [],
    category: ''
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/recipes`);
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), { name: '', amount: '', unit: '' }]
    }));
  };

  const addInstruction = () => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), '']
    }));
  };

  const saveRecipe = async () => {
    if (newRecipe.name && newRecipe.description) {
      const recipe = {
        name: newRecipe.name,
        description: newRecipe.description,
        prepTime: newRecipe.prepTime || 0,
        cookTime: newRecipe.cookTime || 0,
        servings: newRecipe.servings || 0,
        ingredients: newRecipe.ingredients || [],
        instructions: newRecipe.instructions || [],
        category: newRecipe.category || 'Uncategorized'
      };

      try {
        const response = await fetch(`${API_BASE_URL}/recipes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recipe),
        });

        if (!response.ok) throw new Error('Failed to save recipe');
        
        await fetchRecipes();
        setNewRecipe({
          name: '',
          description: '',
          prepTime: 0,
          cookTime: 0,
          servings: 0,
          ingredients: [],
          instructions: [],
          category: ''
        });
        setIsAddingRecipe(false);
      } catch (error) {
        console.error('Error saving recipe:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl">Менеджер рецептов</h2>
          <p className="text-muted-foreground">
            Организуйте и управляйте своими кулинарными творениями
          </p>
        </div>
        <Dialog open={isAddingRecipe} onOpenChange={setIsAddingRecipe}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить рецепт
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Добавить новый рецепт</DialogTitle>
              <DialogDescription>
                Создайте новый рецепт для вашей коллекции
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название рецепта</Label>
                  <Input
                    id="name"
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Input
                    id="category"
                    value={newRecipe.category}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prepTime">Время подготовки (мин)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={newRecipe.prepTime}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, prepTime: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cookTime">Время приготовления (мин)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={newRecipe.cookTime}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, cookTime: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Порций</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={newRecipe.servings}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Ингредиенты</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                    Добавить ингредиент
                  </Button>
                </div>
                {newRecipe.ingredients?.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="Название ингредиента"
                      value={ingredient.name}
                      onChange={(e) => {
                        const updated = [...(newRecipe.ingredients || [])];
                        updated[index].name = e.target.value;
                        setNewRecipe(prev => ({ ...prev, ingredients: updated }));
                      }}
                    />
                    <Input
                      placeholder="Количество"
                      value={ingredient.amount}
                      onChange={(e) => {
                        const updated = [...(newRecipe.ingredients || [])];
                        updated[index].amount = e.target.value;
                        setNewRecipe(prev => ({ ...prev, ingredients: updated }));
                      }}
                    />
                    <Input
                      placeholder="Единица"
                      value={ingredient.unit}
                      onChange={(e) => {
                        const updated = [...(newRecipe.ingredients || [])];
                        updated[index].unit = e.target.value;
                        setNewRecipe(prev => ({ ...prev, ingredients: updated }));
                      }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Инструкции</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                    Добавить шаг
                  </Button>
                </div>
                {newRecipe.instructions?.map((instruction, index) => (
                  <Textarea
                    key={index}
                    placeholder={`Шаг ${index + 1}`}
                    value={instruction}
                    onChange={(e) => {
                      const updated = [...(newRecipe.instructions || [])];
                      updated[index] = e.target.value;
                      setNewRecipe(prev => ({ ...prev, instructions: updated }));
                    }}
                    className="mb-2"
                  />
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingRecipe(false)}>
                  Отмена
                </Button>
                <Button onClick={saveRecipe}>Сохранить рецепт</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full max-w-sm">
        <Input
          placeholder="Поиск рецептов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Загрузка рецептов...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecipes.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Рецепты не найдены</p>
              <p className="text-sm">Создайте свой первый рецепт, чтобы начать</p>
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
          <Card key={recipe.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{recipe.name}</CardTitle>
                  <CardDescription>{recipe.description}</CardDescription>
                </div>
                <Badge variant="secondary">{recipe.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {recipe.prepTime + recipe.cookTime} мин
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {recipe.servings} порций
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Ингредиенты</h4>
                  <ul className="text-sm space-y-1">
                    {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.amount} {ingredient.unit} {ingredient.name}
                      </li>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <li className="text-muted-foreground">
                        +{recipe.ingredients.length - 3} ещё ингредиентов
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}