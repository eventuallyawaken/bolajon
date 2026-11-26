import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export const expensesService = {
  async getExpenses(tenantId: string, branchId?: string, category?: string, search?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (branchId) where.branchId = branchId;
    if (category && category !== 'all') where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { recipient: { contains: search, mode: 'insensitive' } },
      ];
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return expenses.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      amount: Number(e.amount),
      recipient: e.recipient,
      paymentMethod: e.paymentMethod,
      date: e.date,
      notes: e.notes || undefined,
    }));
  },

  async getCashSummary(tenantId: string, branchId?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (branchId) where.branchId = branchId;

    const allExpenses = await prisma.expense.findMany({
      where,
      select: { amount: true, paymentMethod: true },
    });

    const totalSpentThisMonth = allExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const paidPayments = await prisma.payment.findMany({
      where: { ...where, status: 'paid' },
      select: { amount: true, method: true },
    });

    const cashRevenue = paidPayments
      .filter((p) => p.method.toLowerCase().includes('naqd'))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const bankRevenue = paidPayments
      .filter((p) => !p.method.toLowerCase().includes('naqd'))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const cashSpent = allExpenses
      .filter((e) => e.paymentMethod.toLowerCase().includes('naqd'))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const bankSpent = allExpenses
      .filter((e) => !e.paymentMethod.toLowerCase().includes('naqd'))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const baseCash = 0;
    const baseBank = 0;

    return {
      cashBalance: cashRevenue - cashSpent,
      bankBalance: bankRevenue - bankSpent,
      totalSpentThisMonth: totalSpentThisMonth,
    };
  },

  async createExpense(tenantId: string, branchId: string | undefined, input: {
    title: string;
    category: string;
    amount: number;
    recipient: string;
    paymentMethod: string;
    date?: string;
    notes?: string;
  }) {
    let targetBranchId = branchId;
    if (!targetBranchId) {
      const firstBranch = await prisma.branch.findFirst({
        where: { tenantId, deletedAt: null },
      });
      if (!firstBranch) throw new NotFoundError('Filial topilmadi');
      targetBranchId = firstBranch.id;
    }

    const today = new Date().toISOString().slice(0, 10);
    const expense = await prisma.expense.create({
      data: {
        tenantId,
        branchId: targetBranchId,
        title: input.title,
        category: input.category,
        amount: BigInt(Math.round(input.amount)),
        recipient: input.recipient,
        paymentMethod: input.paymentMethod,
        date: input.date || today,
        notes: input.notes,
      },
    });

    return {
      id: expense.id,
      title: expense.title,
      category: expense.category,
      amount: Number(expense.amount),
      recipient: expense.recipient,
      paymentMethod: expense.paymentMethod,
      date: expense.date,
      notes: expense.notes || undefined,
    };
  },
};
