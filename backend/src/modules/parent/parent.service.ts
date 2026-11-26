import { prisma } from '../../config/db.js';
import { ForbiddenError, NotFoundError } from '../../common/errors/AppError.js';
import { buildPhoneVariants } from '../../common/utils/phone.js';

export const parentService = {
  async findParentIdsByUser(tenantId: string, userId: string): Promise<{ ids: string[]; phone: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });
    if (!user) throw new NotFoundError('Foydalanuvchi topilmadi');

    const variants = buildPhoneVariants(user.phone);
    const parents = await prisma.parent.findMany({
      where: {
        tenantId,
        phone: { in: variants },
      },
      select: { id: true },
    });

    return {
      ids: parents.map((p) => p.id),
      phone: user.phone,
    };
  },

  async verifyChildAccess(tenantId: string, userId: string, childId: string) {
    const { ids: parentIds } = await this.findParentIdsByUser(tenantId, userId);
    if (parentIds.length === 0) {
      throw new ForbiddenError('Sizga biriktirilgan farzandlar topilmadi');
    }

    const link = await prisma.childParent.findFirst({
      where: {
        childId,
        parentId: { in: parentIds },
        child: { tenantId, deletedAt: null },
      },
      include: {
        child: {
          include: {
            group: true,
            branch: true,
          },
        },
      },
    });

    if (!link) {
      throw new ForbiddenError('Ushbu farzand ma’lumotlarini ko‘rish ruxsati yo‘q');
    }

    return link.child;
  },

  async getMyChildren(tenantId: string, userId: string) {
    const { ids: parentIds } = await this.findParentIdsByUser(tenantId, userId);
    if (parentIds.length === 0) return [];

    const links = await prisma.childParent.findMany({
      where: {
        parentId: { in: parentIds },
        child: { tenantId, deletedAt: null },
      },
      include: {
        child: {
          include: {
            group: true,
            branch: true,
            medicalRecords: {
              orderBy: { checkedAt: 'desc' },
              take: 20,
            },
          },
        },
      },
      orderBy: { child: { fullName: 'asc' } },
    });

    const uniqueChildren = new Map<string, (typeof links)[number]['child']>();
    for (const l of links) {
      if (!uniqueChildren.has(l.child.id)) {
        uniqueChildren.set(l.child.id, l.child);
      }
    }

    const teacherNames = Array.from(uniqueChildren.values())
      .map((c) => c.group.mainTeacherName)
      .filter(Boolean);

    const teachers = teacherNames.length
      ? await prisma.user.findMany({
          where: { tenantId, fullName: { in: teacherNames }, deletedAt: null },
          select: { fullName: true, phone: true },
        })
      : [];
    const teacherPhoneMap = new Map(teachers.map((t) => [t.fullName, t.phone]));

    return Array.from(uniqueChildren.values()).map((c) => {
      const allergiesList = c.allergies
        ? c.allergies.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const vaccinations = c.medicalRecords
        .filter((m) => m.recordType === 'vaccination')
        .map((m) => ({
          name: m.description,
          date: m.checkedAt.toISOString().slice(0, 10),
          status: 'completed' as const,
        }));

      return {
        id: c.id,
        fullName: c.fullName,
        birthDate: c.birthDate.toISOString().slice(0, 10),
        groupId: c.groupId,
        groupName: `${c.group.name}${c.group.ageRange ? ` (${c.group.ageRange})` : ''}`,
        branchId: c.branchId,
        branchName: c.branch.name,
        allergies: allergiesList,
        medicalNotes: c.medicalNotes || '',
        monthlyFee: Number(c.monthlyFee),
        emergencyPhone: c.branch.phone,
        teacherName: c.group.mainTeacherName,
        teacherPhone: teacherPhoneMap.get(c.group.mainTeacherName) || c.branch.phone,
        vaccinations,
      };
    });
  },

  async getChildOverview(tenantId: string, userId: string, childId: string, dateStr?: string) {
    const child = await this.verifyChildAccess(tenantId, userId, childId);
    const targetDate = dateStr || new Date().toISOString().slice(0, 10);
    const monthPrefix = targetDate.slice(0, 7); // YYYY-MM

    const [todayRecord, monthRecords, latestNotice] = await Promise.all([
      prisma.attendance.findUnique({
        where: { childId_date: { childId, date: targetDate } },
      }),
      prisma.attendance.findMany({
        where: { childId, date: { startsWith: monthPrefix } },
        select: { status: true, isPresent: true },
      }),
      prisma.notification.findFirst({
        where: {
          tenantId,
          OR: [{ userId }, { targetRole: { in: ['all', 'parent'] } }],
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const presentDays = monthRecords.filter((r) => r.status === 'present' || (r.isPresent && r.status !== 'late')).length;
    const lateDays = monthRecords.filter((r) => r.status === 'late').length;
    const absentDays = monthRecords.filter((r) => r.status === 'absent' || !r.isPresent).length;

    return {
      childId: child.id,
      date: targetDate,
      todayAttendance: todayRecord
        ? {
            status: todayRecord.status.toUpperCase(),
            isPresent: todayRecord.isPresent,
            temperature: todayRecord.temperature,
            healthStatus: todayRecord.healthStatus,
            checkedBy: todayRecord.checkedBy || child.group.mainTeacherName,
            checkTime: todayRecord.updatedAt.toTimeString().slice(0, 5),
            notes: todayRecord.notes || '',
          }
        : null,
      monthStats: {
        month: monthPrefix,
        presentDays,
        lateDays,
        absentDays,
        totalDays: monthRecords.length,
      },
      latestNotification: latestNotice
        ? {
            id: latestNotice.id,
            title: latestNotice.title,
            message: latestNotice.message,
            type: latestNotice.type,
            createdAt: latestNotice.createdAt.toISOString(),
          }
        : null,
    };
  },

  async getChildPayments(tenantId: string, userId: string, childId: string) {
    const child = await this.verifyChildAccess(tenantId, userId, childId);

    const payments = await prisma.payment.findMany({
      where: { tenantId, childId },
      orderBy: { createdAt: 'desc' },
      include: {
        child: {
          include: {
            parents: { include: { parent: true } },
          },
        },
      },
    });

    const overdueDebt = payments
      .filter((p) => p.status === 'overdue' || p.status === 'pending')
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const lastPaid = payments.find((p) => p.status === 'paid');

    return {
      balanceOverview: {
        monthlyFee: Number(child.monthlyFee),
        debtAmount: overdueDebt,
        lastPaymentDate: lastPaid?.paidAt ? lastPaid.paidAt.toISOString().slice(0, 10) : '-',
      },
      payments: payments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber || p.transactionId,
        date: p.paidAt
          ? p.paidAt.toISOString().slice(0, 16).replace('T', ' ')
          : p.createdAt.toISOString().slice(0, 16).replace('T', ' '),
        month: p.month,
        amount: Number(p.amount),
        method: p.method.toUpperCase(),
        status: p.status.toUpperCase(),
        payerName: p.child.parents[0]?.parent?.fullName || 'Ota-ona',
        childName: p.child.fullName,
      })),
    };
  },

  async getMenu(tenantId: string, userId: string, childId?: string) {
    let branchId: string | undefined;
    if (childId) {
      const child = await this.verifyChildAccess(tenantId, userId, childId);
      branchId = child.branchId;
    } else {
      const kids = await this.getMyChildren(tenantId, userId);
      branchId = kids[0]?.branchId;
    }

    const menus = await prisma.dailyMenu.findMany({
      where: {
        tenantId,
        ...(branchId ? { branchId } : {}),
      },
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
        name: ing.item.name,
        amountPerChild: ing.amountPerChild,
        unit: ing.unit,
      })),
    }));
  },
};
