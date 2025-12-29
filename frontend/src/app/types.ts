// Data types for Chef's Assistant

export interface DishListOut {
  id: number;
  name: string;
}

export interface DishOut {
  id: number;
  name: string;
  description: string;
}

export interface AllergenMatrixOut {
  allergens: string[];
}

export interface IngredientOut {
  id: number;
  name: string;
  quantity: number;
}

export interface LabelItem {
  dish_name: string;
  qty: number;
}

export interface LabelOut {
  id: number;
  order_id: string;
  customer_name: string;
  total_sum: number;
  delivery_time: string;
  printed: boolean;
  address: string;
  comment: string;
  created_at: string;
  items: LabelItem[];
}

export interface WriteOffRead {
  id: number;
  ingredient_name: string;
  quantity: number;
  reason: string;
  date: string;
}
