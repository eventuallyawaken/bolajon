import { http } from '@/shared/api/http';
import type {
  WarehouseItem,
  DailyMenuItem,
  AddStockInput,
  UpdateStockInput,
  CreateMenuItemInput,
} from './types';

export const warehouseApi = {
  async getWarehouseItems(search?: string, category?: string): Promise<WarehouseItem[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);
      const res = await http.get(`/warehouse/items?${params.toString()}`);
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async getDailyMenu(): Promise<DailyMenuItem[]> {
    try {
      const res = await http.get('/warehouse/menu');
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async addStockItem(input: AddStockInput): Promise<WarehouseItem> {
    const res = await http.post('/warehouse/items', input);
    return res.data.data;
  },

  async updateStockItem(id: string, input: UpdateStockInput): Promise<WarehouseItem> {
    const res = await http.put(`/warehouse/items/${id}`, input);
    return res.data.data;
  },

  async deleteStockItem(id: string): Promise<void> {
    await http.delete(`/warehouse/items/${id}`);
  },

  async addMenuItem(input: CreateMenuItemInput): Promise<DailyMenuItem> {
    const res = await http.post('/warehouse/menu', input);
    return res.data.data;
  },

  async updateMenuItem(id: string, input: CreateMenuItemInput): Promise<DailyMenuItem> {
    const res = await http.put(`/warehouse/menu/${id}`, input);
    return res.data.data;
  },

  async deleteMenuItem(id: string): Promise<void> {
    await http.delete(`/warehouse/menu/${id}`);
  },

  async deductDailyMenuStock(_presentChildrenCount: number): Promise<string[]> {
    return [];
  },
};
