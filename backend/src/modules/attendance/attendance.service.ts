import { prisma } from '../../config/db.js';

export const attendanceService = {
  async getAttendance(tenantId: string, groupId: string, date: string, branchId?: string) {
    const children = await prisma.child.findMany({
      where: { tenantId, groupId, deletedAt: null, ...(branchId ? { branchId } : {}) },
      include: {
        parents: {
          include: { parent: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    const existingRecords = await prisma.attendance.findMany({
      where: { tenantId, groupId, date },
    });

    const recordsMap = new Map(existingRecords.map((r) => [r.childId, r]));

    return children.map((c) => {
      const existing = recordsMap.get(c.id);
      const primaryParent = c.parents[0]?.parent;
      return {
        id: existing?.id || `temp-${c.id}`,
        childId: c.id,
        childName: c.fullName,
        birthDate: c.birthDate.toISOString().slice(0, 10),
        photoUrl: '',
        allergies: c.allergies ? c.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        medicalNotes: c.medicalNotes || '',
        parentName: primaryParent?.fullName || 'Ota-ona',
        parentPhone: primaryParent?.phone || '',
        isPresent: existing ? existing.isPresent : true,
        temperature: existing ? existing.temperature : 36.6,
        healthStatus: existing ? existing.healthStatus : 'healthy',
        notes: existing?.notes || '',
        status: existing?.status || 'present',
      };
    });
  },

  async saveAttendance(tenantId: string, branchId: string | undefined, input: {
    groupId: string;
    date: string;
    records: {
      childId: string;
      isPresent: boolean;
      status: string;
      temperature: number;
      healthStatus: string;
      notes?: string;
    }[];
    autoDeductWarehouse?: boolean;
  }) {
    const group = await prisma.group.findUnique({
      where: { id: input.groupId },
      select: { branchId: true },
    });
    const finalBranchId = branchId || group?.branchId;

    return prisma.$transaction(async (tx) => {
      // 1. Upsert attendance records
      for (const rec of input.records) {
        await tx.attendance.upsert({
          where: {
            childId_date: {
              childId: rec.childId,
              date: input.date,
            },
          },
          update: {
            isPresent: rec.isPresent,
            status: rec.status,
            temperature: rec.temperature,
            healthStatus: rec.healthStatus,
            notes: rec.notes,
          },
          create: {
            tenantId,
            branchId: finalBranchId || '',
            groupId: input.groupId,
            childId: rec.childId,
            date: input.date,
            isPresent: rec.isPresent,
            status: rec.status,
            temperature: rec.temperature,
            healthStatus: rec.healthStatus,
            notes: rec.notes,
          },
        });
      }

      // 2. Auto-deduct warehouse ingredients for present children
      const presentCount = input.records.filter((r) => r.isPresent).length;
      let deductedCount = 0;

      if (input.autoDeductWarehouse && presentCount > 0) {
        // Find today's daily menus and ingredients
        const dailyMenus = await tx.dailyMenu.findMany({
          where: { tenantId, ...(finalBranchId ? { branchId: finalBranchId } : {}) },
          include: { ingredients: true },
        });

        for (const menu of dailyMenus) {
          for (const ing of menu.ingredients) {
            const deductAmount = ing.amountPerChild * presentCount;
            const item = await tx.warehouseItem.findUnique({
              where: { id: ing.warehouseItemId },
            });

            if (item) {
              const previousQty = item.quantity;
              const newQty = Math.max(0, Number((previousQty - deductAmount).toFixed(2)));
              const status = newQty === 0 ? 'out_of_stock' : newQty <= item.minThreshold ? 'low' : 'enough';

              // Update stock
              await tx.warehouseItem.update({
                where: { id: item.id },
                data: {
                  quantity: newQty,
                  status,
                  lastActionType: 'updated',
                  lastActionAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                },
              });

              // Create Ledger Transaction
              await tx.warehouseTransaction.create({
                data: {
                  tenantId,
                  branchId: finalBranchId || item.branchId,
                  itemId: item.id,
                  type: 'attendance_deduct',
                  quantity: deductAmount,
                  previousQty,
                  newQty,
                  note: `${input.date} sanadagi ${presentCount} ta bola davomati hisobidan avtomatik chiqim`,
                },
              });

              deductedCount += 1;
            }
          }
        }
      }

      return {
        presentCount,
        deductedIngredients: deductedCount,
      };
    });
  },

  async markAllPresent(tenantId: string, groupId: string, date: string) {
    const children = await prisma.child.findMany({
      where: { tenantId, groupId, deletedAt: null },
    });

    const now = new Date();
    for (const c of children) {
      await prisma.attendance.upsert({
        where: { childId_date: { childId: c.id, date } },
        update: { isPresent: true, status: 'present' },
        create: {
          tenantId,
          branchId: c.branchId,
          groupId,
          childId: c.id,
          date,
          isPresent: true,
          status: 'present',
          temperature: 36.6,
          healthStatus: 'healthy',
        },
      });
    }

    return this.getAttendance(tenantId, groupId, date);
  },
};
