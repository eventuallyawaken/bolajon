import { prisma } from '../../config/db.js';

const formatUzs = (val: number | bigint) =>
  `${Number(val).toLocaleString('ru-RU').replace(/,/g, ' ')} so‘m`;

export const dashboardService = {
  async getKpis(tenantId: string, branchId?: string) {
    const whereBranch = branchId ? { branchId } : {};

    const totalChildren = await prisma.child.count({
      where: { tenantId, deletedAt: null, ...whereBranch },
    });

    const today = new Date().toISOString().slice(0, 10);
    const todayAttendances = await prisma.attendance.findMany({
      where: { tenantId, date: today, ...(branchId ? { branchId } : {}) },
      select: { isPresent: true, temperature: true },
    });

    const presentCount = todayAttendances.filter((a) => a.isPresent).length;
    const attendanceRate =
      totalChildren > 0
        ? Math.round((presentCount / totalChildren) * 100)
        : 0;

    const healthCheckedOk =
      todayAttendances.filter((a) => a.temperature <= 37.2).length;

    const payments = await prisma.payment.findMany({
      where: { tenantId, status: 'paid', ...(branchId ? { branchId } : {}) },
      select: { amount: true },
    });
    const monthlyRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0);

    const [pendingPayments, overduePayments, expenses] = await Promise.all([
      prisma.payment.findMany({
        where: { tenantId, status: 'pending', ...(branchId ? { branchId } : {}) },
        select: { amount: true },
      }),
      prisma.payment.findMany({
        where: { tenantId, status: 'overdue', ...(branchId ? { branchId } : {}) },
        select: { amount: true },
      }),
      prisma.expense.findMany({
        where: { tenantId, ...(branchId ? { branchId } : {}) },
        select: { amount: true },
      }),
    ]);

    const pendingReceiptsCount = pendingPayments.length;
    const pendingReceiptsAmount = pendingPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalDebt = overduePayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const monthlyExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

    const activeTeachers = await prisma.user.count({
      where: {
        tenantId,
        ...(branchId ? { branchId } : {}),
        role: { slug: { in: ['teacher', 'educator', 'tarbiyachi'] } },
        status: 'active',
        deletedAt: null,
      },
    });

    return {
      totalChildren,
      attendanceRate,
      presentToday: presentCount,
      monthlyRevenue,
      pendingReceiptsCount,
      pendingReceiptsAmount,
      totalDebt,
      monthlyExpenses,
      activeTeachers,
      healthCheckStatus: totalChildren > 0 ? `${healthCheckedOk}/${totalChildren} sog‘lom` : '0/0 sog‘lom',
    };
  },

  async getGroupAttendance(tenantId: string, branchId?: string) {
    const today = new Date().toISOString().slice(0, 10);
    const groups = await prisma.group.findMany({
      where: { tenantId, deletedAt: null, ...(branchId ? { branchId } : {}) },
      include: {
        children: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const todayAtts = await prisma.attendance.findMany({
      where: { tenantId, date: today, ...(branchId ? { branchId } : {}) },
      select: { groupId: true, isPresent: true, temperature: true },
    });

    return groups.map((g) => {
      const totalCount = g.children.length;
      const groupAtts = todayAtts.filter((a) => a.groupId === g.id);
      const presentCount = groupAtts.filter((a) => a.isPresent).length;
      const healthCheckedCount = groupAtts.filter((a) => a.isPresent && a.temperature <= 37.2).length;
      const percent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

      return {
        id: g.id,
        groupId: g.id,
        groupName: g.name,
        ageCategory: g.ageRange,
        roomNumber: g.roomNumber,
        teacherName: g.mainTeacherName,
        totalCount,
        presentCount,
        healthCheckedCount,
        percent,
        rate: percent,
      };
    });
  },

  async getRecentPayments(tenantId: string, branchId?: string) {
    const payments = await prisma.payment.findMany({
      where: { tenantId, ...(branchId ? { branchId } : {}) },
      include: {
        child: { select: { fullName: true, group: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    return payments.map((p) => ({
      id: p.id,
      childName: p.child.fullName,
      groupName: p.child.group?.name || 'Guruhsiz',
      amount: formatUzs(p.amount),
      amountNumeric: Number(p.amount),
      method: (p.method as 'payme' | 'click' | 'bank' | 'cash') || 'payme',
      time: (p.paidAt || p.createdAt).toLocaleString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: p.status === 'paid' ? ('success' as const) : ('pending' as const),
    }));
  },

  async getDashboardStats(tenantId: string, userId?: string, branchId?: string) {
    const [kpis, groupAttendance, recentPayments, tenant, branch, currentUser] = await Promise.all([
      this.getKpis(tenantId, branchId),
      this.getGroupAttendance(tenantId, branchId),
      this.getRecentPayments(tenantId, branchId),
      prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
      branchId
        ? prisma.branch.findFirst({ where: { id: branchId, tenantId, deletedAt: null }, select: { name: true } })
        : prisma.branch.findFirst({ where: { tenantId, deletedAt: null }, select: { name: true }, orderBy: { createdAt: 'asc' } }),
      userId ? prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } }) : Promise.resolve(null),
    ]);

    return {
      branchName: branch?.name || tenant?.name || 'Asosiy filial',
      greetingUser: currentUser?.fullName || 'Rahbar',
      todayDate: new Date().toLocaleDateString('uz-UZ'),
      totalChildren: kpis.totalChildren,
      todayAttendancePercent: kpis.attendanceRate,
      totalTeachers: kpis.activeTeachers,
      monthlyRevenue: kpis.monthlyRevenue,
      financeSummary: {
        monthlyRevenue: kpis.monthlyRevenue,
        monthlyExpenses: kpis.monthlyExpenses,
        pendingReceiptsCount: kpis.pendingReceiptsCount,
        pendingReceiptsAmount: kpis.pendingReceiptsAmount,
        totalDebt: kpis.totalDebt,
        netBalance: kpis.monthlyRevenue - kpis.monthlyExpenses,
      },
      kpis: [
        {
          id: '1',
          label: 'Jami bolalar',
          value: String(kpis.totalChildren),
          subValue: 'Faol tarbiyalanuvchilar',
          colorClass: 'teal' as const,
        },
        {
          id: '2',
          label: 'Bugungi davomat',
          value: `${kpis.attendanceRate}%`,
          subValue: `${kpis.presentToday} ta kelgan bola`,
          colorClass: 'green' as const,
        },
        {
          id: '3',
          label: 'Tarbiyachilar',
          value: String(kpis.activeTeachers),
          subValue: 'Faol pedagoglar',
          colorClass: 'blue' as const,
        },
        {
          id: '4',
          label: 'Oylik tushum',
          value: formatUzs(kpis.monthlyRevenue),
          subValue: 'Kassa va bank',
          colorClass: 'amber' as const,
        },
      ],
      recentPayments,
      groupAttendance,
    };
  },
};
