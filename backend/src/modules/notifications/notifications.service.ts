import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export const notificationsService = {
  async getNotifications(tenantId: string, role?: string, userId?: string) {
    const roleSlug = (role || 'direktor').toLowerCase();

    // 1. Fetch real notifications from DB
    let notifications = await prisma.notification.findMany({
      where: {
        tenantId,
        OR: [
          { targetRole: 'all' },
          { targetRole: roleSlug },
          ...(userId ? [{ userId }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 2. If empty, generate smart role-specific initial system alerts
    if (notifications.length === 0) {
      const initialAlerts = [
        {
          title: 'Tizimga xush kelibsiz!',
          message: 'Bolajon ERP tizimi muvaffaqiyatli ishga tushirildi. Yangi guruh va bolalarni kiritishingiz mumkin.',
          type: 'success',
          targetRole: 'all',
          link: '/dashboard',
        },
        {
          title: 'Ertalabki tibbiy filtr nazorati',
          message: 'Hamshira tomonidan bolalar harorati va salomatligi kunlik tekshirilishi kerak.',
          type: 'info',
          targetRole: 'hamshira',
          link: '/attendance',
        },
        {
          title: 'Ombor zaxiralari monitoringi',
          message: 'Haftalik taomnoma asosida mahsulotlar me’yori va qoldiqlarini nazorat qilib boring.',
          type: 'warning',
          targetRole: 'hisobchi',
          link: '/warehouse',
        },
        {
          title: 'Oylik to‘lovlar nazorati',
          message: 'Har oyning 5-sanasida qarzdorliklar bo‘yicha ota-onalarga eslatmalar yuboriladi.',
          type: 'info',
          targetRole: 'direktor',
          link: '/payments',
        },
      ];

      for (const alert of initialAlerts) {
        await prisma.notification.create({
          data: {
            tenantId,
            title: alert.title,
            message: alert.message,
            type: alert.type,
            targetRole: alert.targetRole,
            link: alert.link,
          },
        });
      }

      notifications = await prisma.notification.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });
    }

    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as 'info' | 'warning' | 'success' | 'danger',
      isRead: n.isRead,
      link: n.link || undefined,
      createdAt: n.createdAt.toISOString(),
      timeAgo: getTimeAgo(n.createdAt),
    }));
  },

  async markAsRead(tenantId: string, id: string) {
    const existing = await prisma.notification.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundError('Bildirishnoma topilmadi');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  async markAllAsRead(tenantId: string) {
    await prisma.notification.updateMany({
      where: { tenantId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  },

  async createNotification(tenantId: string, input: {
    title: string;
    message: string;
    type?: string;
    targetRole?: string;
    link?: string;
    userId?: string;
  }) {
    return prisma.notification.create({
      data: {
        tenantId,
        title: input.title,
        message: input.message,
        type: input.type || 'info',
        targetRole: input.targetRole || 'all',
        link: input.link,
        userId: input.userId,
      },
    });
  },
};

function getTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Hozirgina';
  if (diffMins < 60) return `${diffMins} daqiqa oldin`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} soat oldin`;
  return `${Math.floor(diffHours / 24)} kun oldin`;
}
