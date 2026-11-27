import { prisma } from '../../config/db.js';
import { notificationsService } from '../notifications/notifications.service.js';

const HEALTH_STATUS_LABELS: Record<string, string> = {
  healthy: 'Sog‘lom',
  flu: 'Shamollash alomati',
  cold: 'Shamollash alomati',
  fever: 'Isitmasi bor',
  quarantine: 'Karantin / Izolyatsiya',
  complaint: 'Tibbiy shikoyat',
};

function makeInitials(fullName: string) {
  const parts = fullName.split(' ').filter(Boolean).slice(0, 2);
  return parts.length > 0 ? parts.map((w) => w[0].toUpperCase()).join('') : 'TB';
}

export const attendanceService = {
  async getAttendance(tenantId: string, groupId: string, date: string, branchId?: string) {
    const children = await prisma.child.findMany({
      where: { tenantId, groupId, deletedAt: null, ...(branchId ? { branchId } : {}) },
      include: {
        group: { select: { name: true } },
        parents: {
          include: { parent: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    const existingRecords = await prisma.attendance.findMany({
      where: { tenantId, groupId, date },
    });

    const recordsMap = new Map(existingRecords.map((r) => [r.childId, r]));

    return children.map((c) => {
      const existing = recordsMap.get(c.id);
      const primaryParent = c.parents[0]?.parent;
      return {
        id: existing?.id || `temp-${c.id}`,
        childId: c.id,
        childName: c.fullName,
        initials: makeInitials(c.fullName),
        groupName: c.group?.name || 'Guruhsiz',
        birthDate: c.birthDate.toISOString().slice(0, 10),
        photoUrl: '',
        allergies: c.allergies ? c.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        medicalNotes: c.medicalNotes || '',
        parentName: primaryParent?.fullName || 'Ota-ona',
        parentPhone: primaryParent?.phone || '',
        isPresent: existing ? existing.isPresent : true,
        temperature: existing ? existing.temperature : 36.6,
        healthStatus: existing ? existing.healthStatus : 'healthy',
        notes: existing?.notes || '',
        status: existing?.status || 'present',
      };
    });
  },

  async saveAttendance(
    tenantId: string,
    branchId: string | undefined,
    input: {
      groupId: string;
      date: string;
      records: {
        childId: string;
        isPresent: boolean;
        status: string;
        temperature: number;
        healthStatus: string;
        notes?: string;
      }[];
      autoDeductWarehouse?: boolean;
    },
    checkedByName?: string
  ) {
    const group = await prisma.group.findUnique({
      where: { id: input.groupId },
      select: { branchId: true, name: true },
    });
    const finalBranchId = branchId || group?.branchId;

    const existingBefore = await prisma.attendance.findMany({
      where: {
        tenantId,
        date: input.date,
        childId: { in: input.records.map((r) => r.childId) },
      },
    });
    const prevMap = new Map(existingBefore.map((r) => [r.childId, r]));

    const txResult = await prisma.$transaction(async (tx) => {
      // 1. Upsert attendance records
      for (const rec of input.records) {
        const finalStatus = rec.isPresent ? (rec.status === 'absent' ? 'present' : rec.status) : 'absent';
        await tx.attendance.upsert({
          where: {
            childId_date: {
              childId: rec.childId,
              date: input.date,
            },
          },
          update: {
            isPresent: rec.isPresent,
            status: finalStatus,
            temperature: rec.temperature,
            healthStatus: rec.healthStatus,
            notes: rec.notes,
            ...(checkedByName ? { checkedBy: checkedByName } : {}),
          },
          create: {
            tenantId,
            branchId: finalBranchId || '',
            groupId: input.groupId,
            childId: rec.childId,
            date: input.date,
            isPresent: rec.isPresent,
            status: finalStatus,
            temperature: rec.temperature,
            healthStatus: rec.healthStatus,
            notes: rec.notes,
            checkedBy: checkedByName,
          },
        });
      }

      // 2. Auto-deduct warehouse ingredients for present children (avoid duplicate deduction on same day if already saved unless needed)
      const presentCount = input.records.filter((r) => r.isPresent).length;
      let deductedCount = 0;

      if (input.autoDeductWarehouse && presentCount > 0 && existingBefore.length === 0) {
        // Find today's daily menus and ingredients
        const dailyMenus = await tx.dailyMenu.findMany({
          where: { tenantId, ...(finalBranchId ? { branchId: finalBranchId } : {}) },
          include: { ingredients: true },
        });

        for (const menu of dailyMenus) {
          for (const ing of menu.ingredients) {
            const deductAmount = ing.amountPerChild * presentCount;
            const item = await tx.warehouseItem.findUnique({
              where: { id: ing.warehouseItemId },
            });

            if (item) {
              const previousQty = item.quantity;
              const newQty = Math.max(0, Number((previousQty - deductAmount).toFixed(2)));
              const status = newQty === 0 ? 'out_of_stock' : newQty <= item.minThreshold ? 'low' : 'enough';

              // Update stock
              await tx.warehouseItem.update({
                where: { id: item.id },
                data: {
                  quantity: newQty,
                  status,
                  lastActionType: 'updated',
                  lastActionAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                },
              });

              // Create Ledger Transaction
              await tx.warehouseTransaction.create({
                data: {
                  tenantId,
                  branchId: finalBranchId || item.branchId,
                  itemId: item.id,
                  type: 'attendance_deduct',
                  quantity: deductAmount,
                  previousQty,
                  newQty,
                  note: `${input.date} sanadagi ${presentCount} ta bola davomati hisobidan avtomatik chiqim`,
                },
              });

              deductedCount += 1;
            }
          }
        }
      }

      return {
        presentCount,
        deductedIngredients: deductedCount,
      };
    });

    // 3. Targeted parent & nurse notifications when clinically notable or changed
    const childIds = input.records.map((r) => r.childId);
    const childrenRows = await prisma.child.findMany({
      where: { id: { in: childIds }, tenantId },
      select: { id: true, fullName: true },
    });
    const childNameMap = new Map(childrenRows.map((c) => [c.id, c.fullName]));

    for (const rec of input.records) {
      const prev = prevMap.get(rec.childId);
      const childName = childNameMap.get(rec.childId) || 'Farzandingiz';
      const hasFever = rec.temperature > 37.2;
      const isUnwell = rec.healthStatus !== 'healthy';
      const hasNotes = Boolean(rec.notes && rec.notes.trim());
      const changed =
        !prev ||
        prev.isPresent !== rec.isPresent ||
        prev.healthStatus !== rec.healthStatus ||
        (prev.temperature <= 37.2 && hasFever) ||
        (hasNotes && (prev.notes || '') !== (rec.notes || ''));

      if (!changed) continue;

      if (hasFever || isUnwell) {
        const statusText = HEALTH_STATUS_LABELS[rec.healthStatus] || rec.healthStatus;
        await notificationsService.notifyChildParents(tenantId, rec.childId, {
          title: `Ertalabki tibbiy filtr: ${childName}`,
          message: `${input.date}: Harorat ${rec.temperature}°C, holat — ${statusText}${hasNotes ? `. Izoh: ${rec.notes}` : ''}`,
          type: hasFever ? 'danger' : 'warning',
          link: '/parent/attendance',
          category: 'attendance',
        });

        await notificationsService.createNotification(tenantId, {
          title: `Tibbiy nazorat ogohlantirishi: ${childName}`,
          message: `${group?.name || ''} (${input.date}): ${rec.temperature}°C — ${statusText}`,
          type: hasFever ? 'danger' : 'warning',
          targetRole: 'nurse',
          link: '/medical',
          childId: rec.childId,
          category: 'medical',
        });
      } else if (!rec.isPresent || hasNotes) {
        await notificationsService.notifyChildParents(tenantId, rec.childId, {
          title: !rec.isPresent ? `Davomat xabari: ${childName} kelmadi` : `Kunlik izoh: ${childName}`,
          message: !rec.isPresent
            ? `${input.date} sanasida ${childName} bog‘chaga kelmadi deb belgilandi.${hasNotes ? ` Izoh: ${rec.notes}` : ''}`
            : `${input.date} (${checkedByName || 'Tarbiyachi'}): ${rec.notes}`,
          type: !rec.isPresent ? 'warning' : 'info',
          link: '/parent/attendance',
          category: 'attendance',
        });
      }
    }

    return txResult;
  },

  async sendParentAlerts(tenantId: string, groupId?: string, dateStr?: string): Promise<number> {
    const date = dateStr || new Date().toISOString().slice(0, 10);
    const records = await prisma.attendance.findMany({
      where: {
        tenantId,
        date,
        ...(groupId ? { groupId } : {}),
        OR: [
          { isPresent: false },
          { temperature: { gt: 37.2 } },
          { healthStatus: { not: 'healthy' } },
        ],
      },
      include: {
        child: { select: { id: true, fullName: true } },
      },
    });

    let sent = 0;
    for (const r of records) {
      const reasons: string[] = [];
      if (!r.isPresent) reasons.push('bugun bog‘chaga kelmadi');
      if (r.temperature > 37.2) reasons.push(`harorati ${r.temperature}°C`);
      if (r.healthStatus !== 'healthy') {
        reasons.push(HEALTH_STATUS_LABELS[r.healthStatus] || r.healthStatus);
      }

      const count = await notificationsService.notifyChildParents(tenantId, r.childId, {
        title: `Davomat va salomatlik eslatmasi: ${r.child.fullName}`,
        message: `${date}: ${reasons.join(', ')}.${r.notes ? ` Izoh: ${r.notes}` : ''}`,
        type: r.temperature > 37.2 ? 'danger' : 'warning',
        link: '/parent/attendance',
        category: 'attendance',
      });
      sent += count;
    }

    return sent;
  },

  async markAllPresent(tenantId: string, groupId: string, date: string) {
    const children = await prisma.child.findMany({
      where: { tenantId, groupId, deletedAt: null },
    });

    for (const c of children) {
      await prisma.attendance.upsert({
        where: { childId_date: { childId: c.id, date } },
        update: { isPresent: true, status: 'present' },
        create: {
          tenantId,
          branchId: c.branchId,
          groupId,
          childId: c.id,
          date,
          isPresent: true,
          status: 'present',
          temperature: 36.6,
          healthStatus: 'healthy',
        },
      });
    }

    return this.getAttendance(tenantId, groupId, date);
  },
};
