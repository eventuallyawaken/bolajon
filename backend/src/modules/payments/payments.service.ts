import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export const paymentsService = {
  async getPayments(tenantId: string, branchId?: string, method?: string, search?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (branchId) where.branchId = branchId;
    if (method && method !== 'all') {
      if (method === 'overdue') {
        where.status = 'overdue';
      } else {
        where.method = method;
      }
    }
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
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
      return {
        id: p.id,
        transactionId: p.transactionId,
        childId: p.childId,
        childName: p.child.fullName,
        groupName: p.child.group.name,
        parentName: parent?.fullName || 'Ota-onasi',
        parentPhone: parent?.phone || '',
        amount: Number(p.amount),
        month: p.month,
        method: p.method,
        status: p.status,
        paidAt: p.paidAt ? p.paidAt.toISOString().slice(0, 16).replace('T', ' ') : '-',
        receiptNumber: p.receiptNumber || '-',
      };
    });
  },

  async getKpis(tenantId: string, branchId?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (branchId) where.branchId = branchId;

    const paidPayments = await prisma.payment.findMany({
      where: { ...where, status: 'paid' },
      select: { amount: true },
    });
    const totalRevenue = paidPayments.reduce((acc, p) => acc + Number(p.amount), 0);

    const overduePayments = await prisma.payment.findMany({
      where: { ...where, status: 'overdue' },
      select: { amount: true },
    });
    const totalDebt = overduePayments.reduce((acc, p) => acc + Number(p.amount), 0);

    const totalChildren = await prisma.child.count({
      where: { tenantId, deletedAt: null, ...(branchId ? { branchId } : {}) },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { features: true },
    });
    const features = (tenant?.features as Record<string, any>) || {};
    const monthlyFee = Number(features.monthlyFee) || 1800000;
    const monthlyTarget = totalChildren * monthlyFee;

    return {
      totalRevenue,
      monthlyTarget,
      collectedCount: paidPayments.length,
      debtorCount: overduePayments.length,
      totalDebt,
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
