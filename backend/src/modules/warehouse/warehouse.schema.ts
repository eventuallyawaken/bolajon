import { z } from 'zod';

export const addStockItemSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Mahsulot nomini kiriting'),
    category: z.string().min(2, 'Kategoriyani tanlang'),
    quantity: z.number().min(0, 'Miqdor 0 dan kam bo‘lmasligi kerak'),
    unit: z.string().min(1, 'O‘lchov birligini tanlang'),
    minThreshold: z.number().min(0, 'Minimal me’yorni kiriting'),
    branchId: z.string().optional(),
  }),
});

export const updateStockItemSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Mahsulot nomini kiriting'),
    category: z.string().min(2, 'Kategoriyani tanlang'),
    quantity: z.number().min(0, 'Miqdor 0 dan kam bo‘lmasligi kerak'),
    unit: z.string().min(1, 'O‘lchov birligini tanlang'),
    minThreshold: z.number().min(0, 'Minimal me’yorni kiriting'),
  }),
});

const menuIngredientSchema = z.object({
  productId: z.string().min(1, 'Mahsulotni tanlang'),
  productName: z.string().optional(),
  amountPerChild: z.number().positive('Miqdor musbat bo‘lishi kerak'),
  unit: z.string().min(1, 'Birlikni kiriting'),
});

export const createMenuItemSchema = z.object({
  body: z.object({
    mealType: z.string().min(2, 'Taomnoma vaqtini tanlang'),
    dishName: z.string().min(2, 'Taom nomini kiriting'),
    description: z.string().optional().default(''),
    calories: z.string().optional().default(''),
    time: z.string().optional().default(''),
    branchId: z.string().optional(),
    ingredients: z.array(menuIngredientSchema).default([]),
  }),
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    mealType: z.string().min(2, 'Taomnoma vaqtini tanlang'),
    dishName: z.string().min(2, 'Taom nomini kiriting'),
    description: z.string().optional().default(''),
    calories: z.string().optional().default(''),
    time: z.string().optional().default(''),
    ingredients: z.array(menuIngredientSchema).default([]),
  }),
});
