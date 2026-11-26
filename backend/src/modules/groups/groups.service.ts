import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export const groupsService = {
  async getGroups(tenantId: string, branchId?: string) {
    const where: Record<string, unknown> = { tenantId, deletedAt: null };
    if (branchId) where.branchId = branchId;

    const groups = await prisma.group.findMany({
      where,
      include: {
        _count: { select: { children: { where: { deletedAt: null } } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      ageRange: g.ageRange,
      roomNumber: g.roomNumber,
      mainTeacher: g.mainTeacherName,
      assistantTeacher: g.assistantTeacher || 'Enaga biriktirilmagan',
      currentCount: g._count.children,
      capacity: g.capacity,
      colorTag: g.colorTag || '#0d9488',
      branchId: g.branchId,
    }));
  },

  async createGroup(tenantId: string, branchId: string | undefined, input: {
    name: string;
    ageRange: string;
    roomNumber: string;
    mainTeacherName: string;
    assistantTeacher?: string;
    capacity: number;
    colorTag?: string;
    branchId?: string;
  }) {
    // If branchId is not given, find first branch of tenant
    let targetBranchId = input.branchId || branchId;
    if (!targetBranchId) {
      const firstBranch = await prisma.branch.findFirst({
        where: { tenantId, deletedAt: null },
      });
      targetBranchId = firstBranch?.id;
    }
    if (!targetBranchId) throw new NotFoundError('Filial topilmadi');

    return prisma.group.create({
      data: {
        tenantId,
        branchId: targetBranchId,
        name: input.name,
        ageRange: input.ageRange,
        roomNumber: input.roomNumber,
        mainTeacherName: input.mainTeacherName,
        assistantTeacher: input.assistantTeacher,
        capacity: input.capacity,
        colorTag: input.colorTag || '#0d9488',
      },
    });
  },

  async updateGroup(tenantId: string, id: string, input: Record<string, unknown>) {
    const group = await prisma.group.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!group) throw new NotFoundError('Guruh topilmadi');

    return prisma.group.update({
      where: { id },
      data: input,
    });
  },

  async deleteGroup(tenantId: string, id: string) {
    const group = await prisma.group.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!group) throw new NotFoundError('Guruh topilmadi');

    await prisma.group.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
