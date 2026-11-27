import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import { hashPassword } from '../../common/utils/password.js';
import { buildPhoneVariants, formatUzPhoneSpaced } from '../../common/utils/phone.js';
import { notificationsService } from '../notifications/notifications.service.js';

export const childrenService = {
  async getChildren(tenantId: string, branchId?: string, groupId?: string, search?: string) {
    const where: Record<string, unknown> = { tenantId, deletedAt: null };
    if (branchId) where.branchId = branchId;
    if (groupId && groupId !== 'all') where.groupId = groupId;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { parents: { some: { parent: { fullName: { contains: search, mode: 'insensitive' } } } } },
        { parents: { some: { parent: { phone: { contains: search } } } } },
      ];
    }

    const children = await prisma.child.findMany({
      where,
      include: {
        group: { select: { id: true, name: true } },
        parents: { include: { parent: true } },
        payments: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { status: true, amount: true, month: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return children.map((c) => {
      const primaryParent = c.parents[0]?.parent;
      const latestPayment = c.payments[0];

      return {
        id: c.id,
        fullName: c.fullName,
        birthDate: c.birthDate.toISOString().slice(0, 10),
        gender: c.gender,
        groupId: c.groupId,
        groupName: c.group.name,
        parentName: primaryParent?.fullName || 'Noma’lum',
        parentPhone: primaryParent?.phone || '',
        parentRelation: c.parents[0]?.relationType || 'Ota-onasi',
        balance: latestPayment?.status === 'overdue' ? -Number(c.monthlyFee) : 0,
        monthlyFee: Number(c.monthlyFee),
        status: c.status,
        allergies: c.allergies,
        medicalNotes: c.medicalNotes,
      };
    });
  },

  async getChildById(tenantId: string, id: string) {
    const child = await prisma.child.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        group: true,
        parents: { include: { parent: true } },
        attendances: { take: 30, orderBy: { date: 'desc' } },
        payments: { take: 12, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!child) throw new NotFoundError('Bola topilmadi');
    return child;
  },

  async createChild(tenantId: string, branchId: string | undefined, input: {
    fullName: string;
    birthDate: string;
    gender: string;
    groupId: string;
    parentName: string;
    parentPhone: string;
    parentRelation: string;
    monthlyFee: number;
    allergies?: string;
    medicalNotes?: string;
    address?: string;
  }) {
    // If branchId is not provided, pick group's branchId
    let group = await prisma.group.findFirst({
      where: {
        tenantId,
        deletedAt: null,
        OR: [{ id: input.groupId }, { name: input.groupId }],
      },
      select: { id: true, branchId: true },
    });

    if (!group) {
      // If group doesn't exist yet, auto-create a default group
      const targetBranch = branchId || (await prisma.branch.findFirst({ where: { tenantId } }))?.id;
      if (!targetBranch) throw new NotFoundError('Filial aniqlanmadi');
      group = await prisma.group.create({
        data: {
          tenantId,
          branchId: targetBranch,
          name: input.groupId,
          ageRange: '4-5 yosh',
          roomNumber: '101',
          mainTeacherName: 'Tarbiyachi',
        },
        select: { id: true, branchId: true },
      });
    }

    const finalBranchId = branchId || group.branchId;
    const finalGroupId = group.id;

    return prisma.$transaction(async (tx) => {
      // 1. Find or create parent
      const phoneVariants = buildPhoneVariants(input.parentPhone);
      const formattedParentPhone = formatUzPhoneSpaced(input.parentPhone);
      let parent = await tx.parent.findFirst({
        where: { tenantId, phone: { in: phoneVariants } },
      });
      if (!parent) {
        parent = await tx.parent.create({
          data: {
            tenantId,
            fullName: input.parentName,
            phone: formattedParentPhone,
          },
        });
      }

      // 1b. Ensure Parent user account exists and is active for portal/mobile login
      const existingParentUser = await tx.user.findFirst({
        where: { phone: { in: phoneVariants } },
      });
      if (!existingParentUser) {
        const parentRole = await tx.role.upsert({
          where: { tenantId_slug: { tenantId: 'system', slug: 'parent' } },
          update: {},
          create: {
            id: 'role-parent',
            tenantId: 'system',
            name: 'Ota-ona',
            slug: 'parent',
            description: 'Ota-ona mobil ilova foydalanuvchisi',
          },
        });
        const defaultHash = await hashPassword('Password123!');
        await tx.user.create({
          data: {
            tenantId,
            branchId: finalBranchId,
            roleId: parentRole.id,
            fullName: input.parentName,
            phone: formattedParentPhone,
            passwordHash: defaultHash,
            status: 'active',
          },
        });
      } else if (existingParentUser.deletedAt || existingParentUser.status !== 'active') {
        await tx.user.update({
          where: { id: existingParentUser.id },
          data: { deletedAt: null, status: 'active' },
        });
      }

      // 2. Create Child
      const child = await tx.child.create({
        data: {
          tenantId,
          branchId: finalBranchId,
          groupId: finalGroupId,
          fullName: input.fullName,
          birthDate: new Date(input.birthDate),
          gender: input.gender,
          monthlyFee: BigInt(input.monthlyFee),
          allergies: input.allergies,
          medicalNotes: input.medicalNotes,
          address: input.address,
        },
      });

      // 3. Link child & parent
      await tx.childParent.create({
        data: {
          childId: child.id,
          parentId: parent.id,
          relationType: input.parentRelation,
          isPrimaryContact: true,
        },
      });

      return child;
    }).then(async (createdChild) => {
      await notificationsService.notifyChildParents(tenantId, createdChild.id, {
        title: `Farzandingiz ro‘yxatga olindi: ${createdChild.fullName}`,
        message: `${createdChild.fullName} bog‘chamizga muvaffaqiyatli qabul qilindi. Ota-ona kabineti orqali kunlik holatni kuzatishingiz mumkin.`,
        type: 'success',
        link: '/parent',
        category: 'system',
      });
      return createdChild;
    });
  },

  async updateChild(tenantId: string, id: string, input: Record<string, unknown>) {
    const child = await prisma.child.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!child) throw new NotFoundError('Bola topilmadi');

    const data: Record<string, unknown> = { ...input };
    if (data.monthlyFee !== undefined) {
      data.monthlyFee = BigInt(data.monthlyFee as number);
    }
    if (data.birthDate) {
      data.birthDate = new Date(data.birthDate as string);
    }

    const updated = await prisma.child.update({
      where: { id },
      data,
    });

    await notificationsService.notifyChildParents(tenantId, updated.id, {
      title: `Farzandingiz profili yangilandi: ${updated.fullName}`,
      message: `${updated.fullName} bo‘yicha shaxsiy yoki tibbiy ma’lumotlar yangilandi.`,
      type: 'info',
      link: '/parent/profile',
      category: 'system',
    });

    return updated;
  },

  async deleteChild(tenantId: string, id: string) {
    const child = await prisma.child.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!child) throw new NotFoundError('Bola topilmadi');

    // Soft delete rule
    await prisma.child.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
