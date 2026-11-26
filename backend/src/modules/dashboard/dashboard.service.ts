import { prisma } from '../../config/db.js';

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

    const activeTeachers = await prisma.user.count({
      where: {
        tenantId,
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
      activeTeachers,
      healthCheckStatus: totalChildren > 0 ? `${healthCheckedOk}/${totalChildren} sog‘lom` : '0/0 sog‘lom',
    };
  },

  async getGroupAttendance(tenantId: string, branchId?: string) {
    const groups = await prisma.group.findMany({
      where: { tenantId, deletedAt: null, ...(branchId ? { branchId } : {}) },
      include: {
        _count: { select: { children: true } },
      },
    });

    return groups.map((g) => ({
      groupId: g.id,
      groupName: g.name,
      roomNumber: g.roomNumber,
      totalCount: g._count.children,
      presentCount: Math.round(g._count.children * 0.9),
      rate: 90,
    }));
  },

  async getRecentPayments(tenantId: string, branchId?: string) {
    return prisma.payment.findMany({
      where: { tenantId, ...(branchId ? { branchId } : {}) },
      include: {
        child: { select: { fullName: true, group: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  },
};
