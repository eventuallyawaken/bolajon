import { prisma } from '../../config/db.js';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError.js';
import { notificationsService } from '../notifications/notifications.service.js';

function normalizeCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 16) {
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
  return raw.trim();
}

export const paymentsService = {
  async getCards(tenantId: string, branchId?: string, activeOnly = false) {
    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
      ...(activeOnly ? { isActive: true } : {}),
    };
    if (branchId) {
      where.OR = [{ branchId }, { branchId: null }];
    }

    const cards = await prisma.paymentCard.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return cards.map((c) => ({
      id: c.id,
      cardType: c.cardType,
      bankName: c.bankName,
      cardNumber: c.cardNumber,
      cardHolder: c.cardHolder,
      note: c.note || '',
      isActive: c.isActive,
      branchId: c.branchId || undefined,
      createdAt: c.createdAt.toISOString(),
    }));
  },

  async createCard(
    tenantId: string,
    branchId: string | undefined,
    input: {
      cardType: string;
      bankName: string;
      cardNumber: string;
      cardHolder: string;
      note?: string;
      isActive?: boolean;
      branchId?: string | null;
    }
  ) {
    const finalBranchId = input.branchId === null ? null : input.branchId || branchId || null;
    const created = await prisma.paymentCard.create({
      data: {
        tenantId,
        branchId: finalBranchId,
        cardType: input.cardType,
        bankName: input.bankName,
        cardNumber: normalizeCardNumber(input.cardNumber),
        cardHolder: input.cardHolder,
        note: input.note,
        isActive: input.isActive ?? true,
      },
    });

    return {
      id: created.id,
      cardType: created.cardType,
      bankName: created.bankName,
      cardNumber: created.cardNumber,
      cardHolder: created.cardHolder,
      note: created.note || '',
      isActive: created.isActive,
      branchId: created.branchId || undefined,
      createdAt: created.createdAt.toISOString(),
    };
  },

  async updateCard(
    tenantId: string,
    id: string,
    input: {
      cardType?: string;
      bankName?: string;
      cardNumber?: string;
      cardHolder?: string;
      note?: string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.paymentCard.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Bank kartasi topilmadi');

    const updated = await prisma.paymentCard.update({
      where: { id },
      data: {
        ...(input.cardType !== undefined ? { cardType: input.cardType } : {}),
        ...(input.bankName !== undefined ? { bankName: input.bankName } : {}),
        ...(input.cardNumber !== undefined ? { cardNumber: normalizeCardNumber(input.cardNumber) } : {}),
        ...(input.cardHolder !== undefined ? { cardHolder: input.cardHolder } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });

    return {
      id: updated.id,
      cardType: updated.cardType,
      bankName: updated.bankName,
      cardNumber: updated.cardNumber,
      cardHolder: updated.cardHolder,
      note: updated.note || '',
      isActive: updated.isActive,
      branchId: updated.branchId || undefined,
      createdAt: updated.createdAt.toISOString(),
    };
  },

  async deleteCard(tenantId: string, id: string) {
    const existing = await prisma.paymentCard.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Bank kartasi topilmadi');

    await prisma.paymentCard.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },

  async getPayments(tenantId: string, branchId?: string, method?: string, search?: string, status?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (branchId) where.branchId = branchId;
    if (status && status !== 'all') {
      where.status = status;
    } else if (method && method !== 'all') {
      if (['overdue', 'pending', 'rejected', 'paid'].includes(method)) {
        where.status = method;
      } else {
        where.method = method;
      }
    }
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { child: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        child: {
          select: {
            fullName: true,
            group: { select: { name: true } },
            parents: { include: { parent: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((p) => {
      const parent = p.child.parents[0]?.parent;
      const dateSource = p.paidAt || p.createdAt;
      return {
        id: p.id,
        transactionId: p.transactionId,
        childId: p.childId,
        childName: p.child.fullName,
        groupName: p.child.group?.name || 'Guruhsiz',
        parentName: parent?.fullName || 'Ota-onasi',
        parentPhone: parent?.phone || '',
        amount: Number(p.amount),
        month: p.month,
        periodStart: p.periodStart || undefined,
        periodEnd: p.periodEnd || undefined,
        method: p.method,
        status: p.status,
        paidAt: dateSource ? dateSource.toISOString().slice(0, 16).replace('T', ' ') : '-',
        receiptNumber: p.receiptNumber || '-',
        paymentCardId: p.paymentCardId || undefined,
        cardSnapshot: (p.cardSnapshot as Record<string, unknown> | null) || undefined,
        receiptImageUrl: p.receiptImageUrl || undefined,
        rejectionReason: p.rejectionReason || undefined,
        reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString().slice(0, 16).replace('T', ' ') : undefined,
      };
    });
  },

  async getKpis(tenantId: string, branchId?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (branchId) where.branchId = branchId;

    const [paidPayments, overduePayments, pendingPayments, rejectedCount, totalChildren, tenant] =
      await Promise.all([
        prisma.payment.findMany({ where: { ...where, status: 'paid' }, select: { amount: true } }),
        prisma.payment.findMany({ where: { ...where, status: 'overdue' }, select: { amount: true } }),
        prisma.payment.findMany({ where: { ...where, status: 'pending' }, select: { amount: true } }),
        prisma.payment.count({ where: { ...where, status: 'rejected' } }),
        prisma.child.count({
          where: { tenantId, deletedAt: null, ...(branchId ? { branchId } : {}) },
        }),
        prisma.tenant.findUnique({ where: { id: tenantId }, select: { features: true } }),
      ]);

    // Pending and rejected receipts NEVER count toward monthly revenue until approved
    const totalRevenue = paidPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalDebt = overduePayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const pendingAmount = pendingPayments.reduce((acc, p) => acc + Number(p.amount), 0);

    const features = (tenant?.features as Record<string, any>) || {};
    const monthlyFee = Number(features.monthlyFee) || 1800000;
    const monthlyTarget = totalChildren * monthlyFee;

    return {
      totalRevenue,
      monthlyTarget,
      collectedCount: paidPayments.length,
      debtorCount: overduePayments.length,
      totalDebt,
      pendingCount: pendingPayments.length,
      pendingAmount,
      rejectedCount,
    };
  },

  async approvePayment(tenantId: string, id: string, reviewerUserId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        child: {
          select: { id: true, fullName: true, group: { select: { name: true } }, parents: { include: { parent: true } } },
        },
      },
    });
    if (!payment) throw new NotFoundError('To‘lov topilmadi');
    if (payment.status === 'paid') {
      throw new BadRequestError('Ushbu to‘lov allaqachon tasdiqlangan');
    }

    const now = new Date();
    const receiptNumber =
      payment.receiptNumber || `CHK-${now.getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'paid',
        paidAt: now,
        receiptNumber,
        reviewedByUserId: reviewerUserId,
        reviewedAt: now,
        rejectionReason: null,
      },
    });

    await notificationsService.notifyChildParents(tenantId, payment.childId, {
      title: `To‘lov cheki tasdiqlandi: ${payment.child.fullName}`,
      message: `${Number(updated.amount).toLocaleString()} so‘m (${updated.month}) to‘lovingiz hisobchi tomonidan tasdiqlandi. Chek: ${receiptNumber}.`,
      type: 'success',
      link: '/parent/payments',
      category: 'payment',
    });

    const parent = payment.child.parents[0]?.parent;
    return {
      id: updated.id,
      transactionId: updated.transactionId,
      childId: updated.childId,
      childName: payment.child.fullName,
      groupName: payment.child.group?.name || 'Guruhsiz',
      parentName: parent?.fullName || 'Ota-onasi',
      parentPhone: parent?.phone || '',
      amount: Number(updated.amount),
      month: updated.month,
      periodStart: updated.periodStart || undefined,
      periodEnd: updated.periodEnd || undefined,
      method: updated.method,
      status: updated.status,
      paidAt: updated.paidAt!.toISOString().slice(0, 16).replace('T', ' '),
      receiptNumber,
      paymentCardId: updated.paymentCardId || undefined,
      cardSnapshot: (updated.cardSnapshot as Record<string, unknown> | null) || undefined,
      receiptImageUrl: updated.receiptImageUrl || undefined,
      rejectionReason: undefined,
    };
  },

  async rejectPayment(tenantId: string, id: string, reviewerUserId: string, reason: string) {
    const payment = await prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        child: {
          select: { id: true, fullName: true, group: { select: { name: true } }, parents: { include: { parent: true } } },
        },
      },
    });
    if (!payment) throw new NotFoundError('To‘lov topilmadi');
    if (payment.status === 'paid') {
      throw new BadRequestError('Tasdiqlangan to‘lovni rad etib bo‘lmaydi');
    }

    const now = new Date();
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'rejected',
        paidAt: null,
        reviewedByUserId: reviewerUserId,
        reviewedAt: now,
        rejectionReason: reason,
      },
    });

    await notificationsService.notifyChildParents(tenantId, payment.childId, {
      title: `To‘lov cheki qaytarildi: ${payment.child.fullName}`,
      message: `${payment.month} uchun yuborilgan chek rad etildi. Sabab: ${reason}. Iltimos, qayta tekshirib yuboring.`,
      type: 'danger',
      link: '/parent/payments',
      category: 'payment',
    });

    const parent = payment.child.parents[0]?.parent;
    return {
      id: updated.id,
      transactionId: updated.transactionId,
      childId: updated.childId,
      childName: payment.child.fullName,
      groupName: payment.child.group?.name || 'Guruhsiz',
      parentName: parent?.fullName || 'Ota-onasi',
      parentPhone: parent?.phone || '',
      amount: Number(updated.amount),
      month: updated.month,
      periodStart: updated.periodStart || undefined,
      periodEnd: updated.periodEnd || undefined,
      method: updated.method,
      status: updated.status,
      paidAt: updated.createdAt.toISOString().slice(0, 16).replace('T', ' '),
      receiptNumber: updated.receiptNumber || '-',
      paymentCardId: updated.paymentCardId || undefined,
      cardSnapshot: (updated.cardSnapshot as Record<string, unknown> | null) || undefined,
      receiptImageUrl: updated.receiptImageUrl || undefined,
      rejectionReason: updated.rejectionReason || undefined,
    };
  },

  async createPayment(tenantId: string, branchId: string | undefined, input: {
    childId?: string;
    childName?: string;
    groupName?: string;
    amount: number;
    month: string;
    method: string;
    receiptNumber?: string;
  }) {
    let child = null;
    if (input.childId) {
      child = await prisma.child.findFirst({
        where: { id: input.childId, tenantId },
        include: { group: true },
      });
    }
    if (!child && input.childName) {
      child = await prisma.child.findFirst({
        where: { tenantId, fullName: { contains: input.childName, mode: 'insensitive' } },
        include: { group: true },
      });
    }
    if (!child) {
      const targetBranch = branchId || (await prisma.branch.findFirst({ where: { tenantId } }))?.id;
      if (!targetBranch) throw new NotFoundError('Filial topilmadi');
      let group = await prisma.group.findFirst({ where: { tenantId, deletedAt: null } });
      if (!group) {
        group = await prisma.group.create({
          data: {
            tenantId,
            branchId: targetBranch,
            name: input.groupName || 'Kichkintoylar guruhi',
            ageRange: '4-5 yosh',
            roomNumber: '101',
            mainTeacherName: 'Tarbiyachi',
          },
        });
      }
      child = await prisma.child.create({
        data: {
          tenantId,
          branchId: targetBranch,
          groupId: group.id,
          fullName: input.childName || 'Yangi bola',
          birthDate: new Date('2021-01-01'),
          monthlyFee: BigInt(Math.round(input.amount)),
        },
        include: { group: true },
      });
    }

    const now = new Date();
    const transactionId = `TX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 900) + 100}`;
    const receiptNumber = input.receiptNumber || `CHK-${Math.floor(Math.random() * 90000) + 10000}`;

    return prisma.payment.create({
      data: {
        tenantId,
        branchId: branchId || child.branchId,
        childId: child.id,
        transactionId,
        amount: BigInt(Math.round(input.amount)),
        month: input.month,
        method: input.method,
        status: 'paid',
        receiptNumber,
        paidAt: now,
      },
    });
  },
};
