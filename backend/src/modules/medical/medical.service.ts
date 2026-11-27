import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import { notificationsService } from '../notifications/notifications.service.js';

const RECORD_TYPE_LABELS: Record<string, string> = {
  checkup: 'Tibbiy ko‘rik',
  vaccination: 'Emlash',
  illness: 'Kasallik / Karantin qaydnomasi',
};

export const medicalService = {
  async getOverview(tenantId: string, branchId?: string) {
    const today = new Date().toISOString().slice(0, 10);
    const childWhere = { tenantId, deletedAt: null, ...(branchId ? { branchId } : {}) };

    const [children, todayAttendances, recentRecords] = await Promise.all([
      prisma.child.findMany({
        where: childWhere,
        include: { group: { select: { id: true, name: true } } },
        orderBy: { fullName: 'asc' },
      }),
      prisma.attendance.findMany({
        where: { tenantId, date: today, ...(branchId ? { branchId } : {}) },
        include: {
          child: {
            select: {
              id: true,
              fullName: true,
              allergies: true,
              group: { select: { name: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.medicalRecord.findMany({
        where: {
          tenantId,
          child: childWhere,
        },
        include: {
          child: {
            select: {
              id: true,
              fullName: true,
              group: { select: { name: true } },
            },
          },
        },
        orderBy: { checkedAt: 'desc' },
        take: 25,
      }),
    ]);

    const flaggedAttendances = todayAttendances
      .filter(
        (a) =>
          a.temperature > 37.2 ||
          ['flu', 'quarantine', 'cold', 'fever', 'complaint'].includes(a.healthStatus)
      )
      .map((a) => ({
        id: a.id,
        childId: a.childId,
        childName: a.child.fullName,
        groupName: a.child.group?.name || 'Guruhsiz',
        temperature: a.temperature,
        healthStatus: a.healthStatus,
        notes: a.notes || '',
        checkedBy: a.checkedBy || 'Tarbiyachi',
      }));

    const allergyChildren = children
      .filter((c) => Boolean(c.allergies && c.allergies.trim()))
      .map((c) => ({
        id: c.id,
        fullName: c.fullName,
        groupName: c.group?.name || 'Guruhsiz',
        allergies: c.allergies || '',
        medicalNotes: c.medicalNotes || '',
      }));

    return {
      todayDate: today,
      kpis: {
        totalChildren: children.length,
        checkedTodayCount: todayAttendances.length,
        flaggedCount: flaggedAttendances.length,
        allergyChildrenCount: allergyChildren.length,
        recordsTotalCount: recentRecords.length,
      },
      flaggedAttendances,
      allergyChildren,
      childrenList: children.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        groupName: c.group?.name || 'Guruhsiz',
        allergies: c.allergies || '',
        medicalNotes: c.medicalNotes || '',
      })),
      recentRecords: recentRecords.map((r) => ({
        id: r.id,
        childId: r.childId,
        childName: r.child.fullName,
        groupName: r.child.group?.name || 'Guruhsiz',
        recordType: r.recordType,
        description: r.description,
        recordedByRole: r.recordedByRole,
        checkedAt: r.checkedAt.toISOString().slice(0, 10),
      })),
    };
  },

  async getRecords(tenantId: string, branchId?: string, childId?: string, recordType?: string) {
    const records = await prisma.medicalRecord.findMany({
      where: {
        tenantId,
        ...(childId && childId !== 'all' ? { childId } : {}),
        ...(recordType && recordType !== 'all' ? { recordType } : {}),
        child: {
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
        },
      },
      include: {
        child: {
          select: {
            id: true,
            fullName: true,
            group: { select: { name: true } },
          },
        },
      },
      orderBy: { checkedAt: 'desc' },
      take: 100,
    });

    return records.map((r) => ({
      id: r.id,
      childId: r.childId,
      childName: r.child.fullName,
      groupName: r.child.group?.name || 'Guruhsiz',
      recordType: r.recordType,
      description: r.description,
      recordedByRole: r.recordedByRole,
      checkedAt: r.checkedAt.toISOString().slice(0, 10),
    }));
  },

  async createRecord(
    tenantId: string,
    recorderRole: string,
    input: {
      childId: string;
      recordType: 'checkup' | 'vaccination' | 'illness';
      description: string;
      checkedAt?: string;
    }
  ) {
    const child = await prisma.child.findFirst({
      where: { id: input.childId, tenantId, deletedAt: null },
      select: { id: true, fullName: true },
    });
    if (!child) throw new NotFoundError('Tarbiyalanuvchi topilmadi');

    const parsedDate = input.checkedAt ? new Date(input.checkedAt) : new Date();
    const validDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    const created = await prisma.medicalRecord.create({
      data: {
        tenantId,
        childId: child.id,
        recordType: input.recordType,
        description: input.description,
        recordedByRole: recorderRole || 'Hamshira',
        checkedAt: validDate,
      },
      include: {
        child: {
          select: {
            id: true,
            fullName: true,
            group: { select: { name: true } },
          },
        },
      },
    });

    const typeLabel = RECORD_TYPE_LABELS[input.recordType] || 'Tibbiy qaydnoma';
    await notificationsService.notifyChildParents(tenantId, child.id, {
      title: `${typeLabel}: ${child.fullName}`,
      message: `${recorderRole || 'Hamshira'} tomonidan kiritildi: ${input.description}`,
      type: input.recordType === 'illness' ? 'warning' : 'info',
      link: '/parent/profile',
      category: 'medical',
    });

    return {
      id: created.id,
      childId: created.childId,
      childName: created.child.fullName,
      groupName: created.child.group?.name || 'Guruhsiz',
      recordType: created.recordType,
      description: created.description,
      recordedByRole: created.recordedByRole,
      checkedAt: created.checkedAt.toISOString().slice(0, 10),
    };
  },

  async updateChildMedical(
    tenantId: string,
    childId: string,
    recorderRole: string,
    input: { allergies?: string | null; medicalNotes?: string | null }
  ) {
    const child = await prisma.child.findFirst({
      where: { id: childId, tenantId, deletedAt: null },
    });
    if (!child) throw new NotFoundError('Tarbiyalanuvchi topilmadi');

    const updated = await prisma.child.update({
      where: { id: child.id },
      data: {
        ...(input.allergies !== undefined ? { allergies: input.allergies } : {}),
        ...(input.medicalNotes !== undefined ? { medicalNotes: input.medicalNotes } : {}),
      },
    });

    await notificationsService.notifyChildParents(tenantId, child.id, {
      title: `Tibbiy karta yangilandi: ${child.fullName}`,
      message: `${recorderRole || 'Hamshira'} allergiya va tibbiy eslatmalarni yangiladi${updated.allergies ? ` (Allergiya: ${updated.allergies})` : ''}.`,
      type: 'info',
      link: '/parent/profile',
      category: 'medical',
    });

    return {
      id: updated.id,
      fullName: updated.fullName,
      allergies: updated.allergies || '',
      medicalNotes: updated.medicalNotes || '',
    };
  },

  async getMenuAllergyAlerts(tenantId: string, branchId?: string) {
    const [menus, allergyChildren] = await Promise.all([
      prisma.dailyMenu.findMany({
        where: { tenantId, ...(branchId ? { branchId } : {}) },
        include: {
          ingredients: {
            include: { item: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.child.findMany({
        where: {
          tenantId,
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
          allergies: { not: null },
        },
        include: { group: { select: { name: true } } },
      }),
    ]);

    const parsedAllergyKids = allergyChildren
      .map((c) => ({
        id: c.id,
        fullName: c.fullName,
        groupName: c.group?.name || 'Guruhsiz',
        tokens: (c.allergies || '')
          .split(/[,;]/)
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        rawAllergies: c.allergies || '',
      }))
      .filter((c) => c.tokens.length > 0);

    return menus.map((m) => {
      const textPool = [
        m.dishName,
        m.description || '',
        ...m.ingredients.map((i) => i.item.name),
      ]
        .join(' ')
        .toLowerCase();

      const matchedChildren = parsedAllergyKids
        .filter((c) => c.tokens.some((tok) => textPool.includes(tok)))
        .map((c) => ({
          id: c.id,
          fullName: c.fullName,
          groupName: c.groupName,
          allergies: c.rawAllergies,
        }));

      return {
        id: m.id,
        mealType: m.mealType,
        dishName: m.dishName,
        description: m.description || '',
        time: m.time || '',
        calories: m.calories || '',
        ingredients: m.ingredients.map((i) => i.item.name),
        matchedChildren,
      };
    });
  },
};
