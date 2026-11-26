import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export const formatActionTime = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${mins}`;
};

export const warehouseService = {
  async getWarehouseItems(tenantId: string, branchId?: string, category?: string, search?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (branchId) where.branchId = branchId;
    if (category && category !== 'all') where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const items = await prisma.warehouseItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return items.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      quantity: i.quantity,
      unit: i.unit,
      minThreshold: i.minThreshold,
      lastActionType: i.lastActionType,
      lastActionAt: i.lastActionAt,
      status: i.status,
    }));
  },

  async addStockItem(tenantId: string, branchId: string | undefined, input: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minThreshold: number;
  }, userId?: string) {
    let targetBranchId = branchId;
    if (!targetBranchId) {
      const firstBranch = await prisma.branch.findFirst({ where: { tenantId, deletedAt: null } });
      if (!firstBranch) throw new NotFoundError('Filial topilmadi');
      targetBranchId = firstBranch.id;
    }

    const isOut = input.quantity <= 0;
    const isLow = input.quantity <= input.minThreshold;
    const status = isOut ? 'out_of_stock' : isLow ? 'low' : 'enough';
    const nowStr = formatActionTime();

    return prisma.$transaction(async (tx) => {
      const item = await tx.warehouseItem.create({
        data: {
          tenantId,
          branchId: targetBranchId!,
          name: input.name,
          category: input.category,
          quantity: input.quantity,
          unit: input.unit,
          minThreshold: input.minThreshold,
          lastActionType: 'created',
          lastActionAt: nowStr,
          status,
        },
      });

      await tx.warehouseTransaction.create({
        data: {
          tenantId,
          branchId: targetBranchId!,
          itemId: item.id,
          type: 'in',
          quantity: input.quantity,
          previousQty: 0,
          newQty: input.quantity,
          note: 'Yangi mahsulot zaxiraga kiritildi',
          createdById: userId,
        },
      });

      return item;
    });
  },

  async updateStockItem(tenantId: string, id: string, input: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minThreshold: number;
  }, userId?: string) {
    const existing = await prisma.warehouseItem.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundError('Mahsulot topilmadi');

    const isOut = input.quantity <= 0;
    const isLow = input.quantity <= input.minThreshold;
    const status = isOut ? 'out_of_stock' : isLow ? 'low' : 'enough';
    const nowStr = formatActionTime();
    const diff = input.quantity - existing.quantity;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.warehouseItem.update({
        where: { id },
        data: {
          name: input.name,
          category: input.category,
          quantity: input.quantity,
          unit: input.unit,
          minThreshold: input.minThreshold,
          lastActionType: 'updated',
          lastActionAt: nowStr,
          status,
        },
      });

      if (diff !== 0) {
        await tx.warehouseTransaction.create({
          data: {
            tenantId,
            branchId: existing.branchId,
            itemId: id,
            type: diff > 0 ? 'in' : 'out',
            quantity: Math.abs(diff),
            previousQty: existing.quantity,
            newQty: input.quantity,
            note: 'Mahsulot qoldig‘i tahrirlandi',
            createdById: userId,
          },
        });
      }

      return updated;
    });
  },

  async deleteStockItem(tenantId: string, id: string) {
    const existing = await prisma.warehouseItem.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundError('Mahsulot topilmadi');
    await prisma.warehouseItem.delete({ where: { id } });
    return { id };
  },

  async getDailyMenus(tenantId: string, branchId?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (branchId) where.branchId = branchId;

    const menus = await prisma.dailyMenu.findMany({
      where,
      include: {
        ingredients: {
          include: { item: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return menus.map((m) => ({
      id: m.id,
      mealType: m.mealType,
      dishName: m.dishName,
      description: m.description || '',
      calories: m.calories || '',
      time: m.time || '',
      ingredients: m.ingredients.map((ing) => ({
        productId: ing.warehouseItemId,
        productName: ing.item.name,
        amountPerChild: ing.amountPerChild,
        unit: ing.unit,
      })),
    }));
  },

  async createMenuItem(tenantId: string, branchId: string | undefined, input: {
    mealType: string;
    dishName: string;
    description?: string;
    calories?: string;
    time?: string;
    ingredients: Array<{ productId: string; amountPerChild: number; unit: string }>;
  }) {
    let targetBranchId = branchId;
    if (!targetBranchId) {
      const firstBranch = await prisma.branch.findFirst({ where: { tenantId, deletedAt: null } });
      if (!firstBranch) throw new NotFoundError('Filial topilmadi');
      targetBranchId = firstBranch.id;
    }

    return prisma.dailyMenu.create({
      data: {
        tenantId,
        branchId: targetBranchId,
        mealType: input.mealType,
        dishName: input.dishName,
        description: input.description,
        calories: input.calories,
        time: input.time,
        ingredients: {
          create: input.ingredients.map((ing) => ({
            warehouseItemId: ing.productId,
            amountPerChild: ing.amountPerChild,
            unit: ing.unit,
          })),
        },
      },
      include: {
        ingredients: {
          include: { item: { select: { name: true } } },
        },
      },
    });
  },

  async updateMenuItem(tenantId: string, id: string, input: {
    mealType: string;
    dishName: string;
    description?: string;
    calories?: string;
    time?: string;
    ingredients: Array<{ productId: string; amountPerChild: number; unit: string }>;
  }) {
    const existing = await prisma.dailyMenu.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundError('Taomnoma topilmadi');

    return prisma.$transaction(async (tx) => {
      await tx.menuIngredient.deleteMany({ where: { menuId: id } });

      return tx.dailyMenu.update({
        where: { id },
        data: {
          mealType: input.mealType,
          dishName: input.dishName,
          description: input.description,
          calories: input.calories,
          time: input.time,
          ingredients: {
            create: input.ingredients.map((ing) => ({
              warehouseItemId: ing.productId,
              amountPerChild: ing.amountPerChild,
              unit: ing.unit,
            })),
          },
        },
        include: {
          ingredients: {
            include: { item: { select: { name: true } } },
          },
        },
      });
    });
  },

  async deleteMenuItem(tenantId: string, id: string) {
    const existing = await prisma.dailyMenu.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundError('Taomnoma topilmadi');
    await prisma.dailyMenu.delete({ where: { id } });
    return { id };
  },
};
