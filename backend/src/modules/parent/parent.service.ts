import { prisma } from '../../config/db.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors/AppError.js';
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

      const medicalRecords = c.medicalRecords.map((m) => ({
        id: m.id,
        recordType: m.recordType,
        description: m.description,
        recordedByRole: m.recordedByRole,
        checkedAt: m.checkedAt.toISOString().slice(0, 10),
      }));

      return {
        id: c.id,
        fullName: c.fullName,
        birthDate: c.birthDate.toISOString().slice(0, 10),
        gender: c.gender,
        address: c.address || '',
        status: c.status,
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
        medicalRecords,
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
          AND: [
            { OR: [{ userId }, { userId: null, targetRole: { in: ['all', 'parent', 'ota_ona'] } }] },
            { OR: [{ childId }, { childId: null }] },
          ],
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

  async getChildAttendanceHistory(
    tenantId: string,
    userId: string,
    childId: string,
    monthStr?: string
  ) {
    await this.verifyChildAccess(tenantId, userId, childId);
    const targetMonth = monthStr || new Date().toISOString().slice(0, 7);

    const records = await prisma.attendance.findMany({
      where: {
        tenantId,
        childId,
        date: { startsWith: targetMonth },
      },
      orderBy: { date: 'asc' },
    });

    const presentDays = records.filter((r) => r.status === 'present' || (r.isPresent && r.status !== 'late')).length;
    const lateDays = records.filter((r) => r.status === 'late').length;
    const absentDays = records.filter((r) => r.status === 'absent' || !r.isPresent).length;

    return {
      childId,
      month: targetMonth,
      summary: {
        presentDays,
        lateDays,
        absentDays,
        totalDays: records.length,
      },
      records: records.map((r) => ({
        id: r.id,
        date: r.date,
        status: r.status.toUpperCase(),
        isPresent: r.isPresent,
        temperature: r.temperature,
        healthStatus: r.healthStatus,
        checkedBy: r.checkedBy || '',
        checkTime: r.updatedAt.toTimeString().slice(0, 5),
        notes: r.notes || '',
      })),
    };
  },

  async submitAbsenceNotice(
    tenantId: string,
    userId: string,
    childId: string,
    input: { date: string; reason: string }
  ) {
    const child = await this.verifyChildAccess(tenantId, userId, childId);
    const parentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });

    const created = await prisma.$transaction(async (tx) => {
      const notif = await tx.notification.create({
        data: {
          tenantId,
          title: 'Ota-onadan sababli kelmaslik xabarnomasi',
          message: `${child.fullName} (${child.group.name}) — ${input.date}: ${input.reason} (${parentUser?.fullName || 'Ota-ona'})`,
          type: 'warning',
          targetRole: 'teacher',
          link: '/attendance',
        },
      });

      await tx.notification.create({
        data: {
          tenantId,
          title: 'Ota-onadan sababli kelmaslik xabarnomasi',
          message: `${child.fullName} (${child.group.name}) — ${input.date}: ${input.reason}`,
          type: 'info',
          targetRole: 'director',
          childId: child.id,
          category: 'attendance',
          link: '/attendance',
        },
      });

      await tx.notification.create({
        data: {
          tenantId,
          title: 'Tibbiy nazorat: kelmaslik xabarnomasi',
          message: `${child.fullName} (${child.group.name}) — ${input.date}: ${input.reason}`,
          type: 'info',
          targetRole: 'nurse',
          childId: child.id,
          category: 'medical',
          link: '/medical',
        },
      });

      return notif;
    });

    return {
      id: created.id,
      childId: created.id,
      date: input.date,
      reason: input.reason,
      createdAt: created.createdAt.toISOString(),
    };
  },

  async getPaymentCards(tenantId: string, userId: string, childId?: string) {
    let branchId: string | undefined;
    if (childId) {
      const child = await this.verifyChildAccess(tenantId, userId, childId);
      branchId = child.branchId;
    } else {
      const kids = await this.getMyChildren(tenantId, userId);
      branchId = kids[0]?.branchId;
    }

    const cards = await prisma.paymentCard.findMany({
      where: {
        tenantId,
        deletedAt: null,
        isActive: true,
        ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return cards.map((c) => ({
      id: c.id,
      cardType: c.cardType,
      bankName: c.bankName,
      cardNumber: c.cardNumber,
      cardHolder: c.cardHolder,
      note: c.note || '',
    }));
  },

  async submitPaymentReceipt(
    tenantId: string,
    userId: string,
    childId: string,
    input: {
      paymentCardId: string;
      amount: number;
      periodStart: string;
      periodEnd: string;
      month?: string;
      receiptImage: string;
    }
  ) {
    if (input.periodEnd < input.periodStart) {
      throw new BadRequestError('Tugash sanasi boshlanish sanasidan kichik bo‘lishi mumkin emas');
    }

    const child = await this.verifyChildAccess(tenantId, userId, childId);

    const card = await prisma.paymentCard.findFirst({
      where: { id: input.paymentCardId, tenantId, deletedAt: null, isActive: true },
    });
    if (!card) {
      throw new NotFoundError('Tanlangan to‘lov kartasi topilmadi yoki faol emas');
    }

    const now = new Date();
    const transactionId = `TX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`;
    const receiptNumber = `CHK-${now.getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const periodLabel = input.month?.trim() || `${input.periodStart} — ${input.periodEnd}`;
    const digits = card.cardNumber.replace(/\D/g, '');
    const cardSnapshot = {
      cardType: card.cardType,
      bankName: card.bankName,
      cardHolder: card.cardHolder,
      last4: digits.slice(-4),
      cardNumberMasked: digits.length >= 4 ? `•••• ${digits.slice(-4)}` : card.cardNumber,
    };

    const created = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          tenantId,
          branchId: child.branchId,
          childId: child.id,
          paymentCardId: card.id,
          cardSnapshot,
          transactionId,
          amount: BigInt(Math.round(input.amount)),
          month: periodLabel,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          method: 'card_transfer',
          status: 'pending',
          receiptNumber,
          receiptImageUrl: input.receiptImage,
          submittedByUserId: userId,
          paidAt: null,
        },
      });

      const notifMsg = `${child.fullName} (${child.group.name}) uchun ${Math.round(input.amount).toLocaleString()} so‘m (${periodLabel}) — ${card.bankName} (*${digits.slice(-4)}) kartasiga chek yuborildi.`;

      await tx.notification.createMany({
        data: [
          {
            tenantId,
            targetRole: 'accountant',
            childId: child.id,
            category: 'payment',
            title: 'Yangi to‘lov cheki tasdiqlashni kutmoqda',
            message: notifMsg,
            type: 'warning',
            link: '/payments',
          },
          {
            tenantId,
            targetRole: 'director',
            childId: child.id,
            category: 'payment',
            title: 'Yangi to‘lov cheki yuborildi',
            message: notifMsg,
            type: 'info',
            link: '/payments',
          },
        ],
      });

      return payment;
    });

    return {
      id: created.id,
      receiptNumber: created.receiptNumber || created.transactionId,
      date: created.createdAt.toISOString().slice(0, 16).replace('T', ' '),
      month: created.month,
      periodStart: created.periodStart || undefined,
      periodEnd: created.periodEnd || undefined,
      amount: Number(created.amount),
      method: created.method.toUpperCase(),
      status: created.status.toUpperCase(),
      cardSnapshot,
      receiptImageUrl: created.receiptImageUrl || undefined,
      childName: child.fullName,
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
      .filter((p) => p.status === 'overdue')
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const pendingAmount = payments
      .filter((p) => p.status === 'pending')
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const lastPaid = payments.find((p) => p.status === 'paid');

    return {
      balanceOverview: {
        monthlyFee: Number(child.monthlyFee),
        debtAmount: overdueDebt,
        pendingAmount,
        lastPaymentDate: lastPaid?.paidAt ? lastPaid.paidAt.toISOString().slice(0, 10) : '-',
      },
      payments: payments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber || p.transactionId,
        date: p.paidAt
          ? p.paidAt.toISOString().slice(0, 16).replace('T', ' ')
          : p.createdAt.toISOString().slice(0, 16).replace('T', ' '),
        month: p.month,
        periodStart: p.periodStart || undefined,
        periodEnd: p.periodEnd || undefined,
        amount: Number(p.amount),
        method: p.method.toUpperCase(),
        status: p.status.toUpperCase(),
        payerName: p.child.parents[0]?.parent?.fullName || 'Ota-ona',
        childName: p.child.fullName,
        cardSnapshot: (p.cardSnapshot as Record<string, unknown> | null) || undefined,
        receiptImageUrl: p.receiptImageUrl || undefined,
        rejectionReason: p.rejectionReason || undefined,
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
