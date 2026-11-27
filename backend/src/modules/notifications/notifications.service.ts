import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import { buildPhoneVariants } from '../../common/utils/phone.js';

const ROLE_NOTIF_ALIASES: Record<string, string[]> = {
  director: ['director', 'direktor'],
  direktor: ['director', 'direktor'],
  teacher: ['teacher', 'tarbiyachi'],
  tarbiyachi: ['teacher', 'tarbiyachi'],
  accountant: ['accountant', 'hisobchi'],
  hisobchi: ['accountant', 'hisobchi'],
  nurse: ['nurse', 'hamshira'],
  hamshira: ['nurse', 'hamshira'],
  parent: ['parent', 'ota_ona'],
  ota_ona: ['parent', 'ota_ona'],
};

function buildVisibilityWhere(tenantId: string, role?: string, userId?: string) {
  const roleSlug = (role || 'director').toLowerCase();
  const targetRoles = ROLE_NOTIF_ALIASES[roleSlug] || [roleSlug];

  return {
    tenantId,
    OR: [
      { userId: null, targetRole: 'all' },
      { userId: null, targetRole: { in: targetRoles } },
      ...(userId ? [{ userId }] : []),
    ],
  };
}

export const notificationsService = {
  async getNotifications(tenantId: string, role?: string, userId?: string) {
    // 1. Fetch real notifications from DB strictly scoped by userId or broadcast targetRole
    let notifications = await prisma.notification.findMany({
      where: buildVisibilityWhere(tenantId, role, userId),
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 2. Seed initial system alerts once for the tenant when no system alerts exist yet
    if (notifications.length === 0) {
      const anyExisting = await prisma.notification.count({ where: { tenantId } });
      if (anyExisting === 0) {
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
            link: '/medical',
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
          where: buildVisibilityWhere(tenantId, role, userId),
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
      }
    }

    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as 'info' | 'warning' | 'success' | 'danger',
      isRead: n.isRead,
      link: n.link || undefined,
      childId: n.childId || undefined,
      category: n.category || undefined,
      createdAt: n.createdAt.toISOString(),
      timeAgo: getTimeAgo(n.createdAt),
    }));
  },

  async markAsRead(tenantId: string, id: string, role?: string, userId?: string) {
    const existing = await prisma.notification.findFirst({
      where: { id, ...buildVisibilityWhere(tenantId, role, userId) },
    });
    if (!existing) throw new NotFoundError('Bildirishnoma topilmadi');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  async markAllAsRead(tenantId: string, role?: string, userId?: string) {
    await prisma.notification.updateMany({
      where: { ...buildVisibilityWhere(tenantId, role, userId), isRead: false },
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
    childId?: string;
    category?: string;
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
        childId: input.childId,
        category: input.category,
      },
    });
  },

  async notifyChildParents(
    tenantId: string,
    childId: string,
    input: {
      title: string;
      message: string;
      type?: 'info' | 'warning' | 'success' | 'danger';
      link?: string;
      category?: 'attendance' | 'medical' | 'payment' | 'system';
    }
  ): Promise<number> {
    const child = await prisma.child.findFirst({
      where: { id: childId, tenantId, deletedAt: null },
      include: {
        parents: { include: { parent: true } },
      },
    });
    if (!child || child.parents.length === 0) return 0;

    const phoneSet = new Set<string>();
    for (const cp of child.parents) {
      if (cp.parent?.phone) {
        for (const variant of buildPhoneVariants(cp.parent.phone)) {
          phoneSet.add(variant);
        }
      }
    }
    if (phoneSet.size === 0) return 0;

    const parentUsers = await prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: 'active',
        phone: { in: Array.from(phoneSet) },
        role: { slug: { in: ['parent', 'ota_ona'] } },
      },
      select: { id: true },
    });

    const uniqueUserIds = Array.from(new Set(parentUsers.map((u) => u.id)));
    if (uniqueUserIds.length === 0) return 0;

    await prisma.notification.createMany({
      data: uniqueUserIds.map((userId) => ({
        tenantId,
        userId,
        childId,
        category: input.category || 'system',
        targetRole: 'parent',
        title: input.title,
        message: input.message,
        type: input.type || 'info',
        link: input.link || '/parent',
      })),
    });

    return uniqueUserIds.length;
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
