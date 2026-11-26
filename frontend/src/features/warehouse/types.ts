export type StockStatus = 'enough' | 'low' | 'out_of_stock';
export type StockActionType = 'created' | 'updated';

export interface WarehouseItem {
  id: string;
  name: string;
  category: 'Go‘sht va sut' | 'Don va un' | 'Sabzavot va meva' | 'Yog‘ va ziravor' | 'Xo‘jalik buyumi';
  quantity: number;
  unit: 'kg' | 'litr' | 'dona' | 'qadoq';
  minThreshold: number;
  lastActionType: StockActionType;
  lastActionAt: string; // Minutigacha format: "YYYY-MM-DD HH:mm"
  status: StockStatus;
}

export interface MenuIngredient {
  productId: string;
  productName: string;
  amountPerChild: number; // e.g. 0.08 kg
  unit: string;
}

export interface DailyMenuItem {
  id: string;
  mealType: 'Nonushta' | 'Ikkinchi nonushta' | 'Tushlik' | 'Kechki ovqat';
  dishName: string;
  description: string;
  calories: string;
  time: string;
  ingredients?: MenuIngredient[];
}

export interface AddStockInput {
  name: string;
  category: 'Go‘sht va sut' | 'Don va un' | 'Sabzavot va meva' | 'Yog‘ va ziravor' | 'Xo‘jalik buyumi';
  quantity: number;
  unit: 'kg' | 'litr' | 'dona' | 'qadoq';
  minThreshold: number;
}

export interface UpdateStockInput {
  name: string;
  category: 'Go‘sht va sut' | 'Don va un' | 'Sabzavot va meva' | 'Yog‘ va ziravor' | 'Xo‘jalik buyumi';
  quantity: number;
  unit: 'kg' | 'litr' | 'dona' | 'qadoq';
  minThreshold: number;
}

export interface CreateMenuItemInput {
  mealType: 'Nonushta' | 'Ikkinchi nonushta' | 'Tushlik' | 'Kechki ovqat';
  dishName: string;
  description: string;
  calories: string;
  time: string;
  ingredients: MenuIngredient[];
}
