import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export const branchesService = {
  async getBranches(tenantId: string) {
    const branches = await prisma.branch.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        _count: {
          select: {
            children: { where: { deletedAt: null } },
            groups: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return branches.map((b) => ({
      id: b.id,
      name: b.name,
      address: b.address,
      manager: b.managerName,
      phone: b.phone,
      childrenCount: b._count.children,
      capacity: b.capacity,
      groupsCount: b.groupsCount || b._count.groups,
      status: b.status as 'active' | 'maintenance',
    }));
  },

  async createBranch(tenantId: string, input: {
    name: string;
    address: string;
    manager: string;
    phone: string;
    capacity: number;
    groupsCount?: number;
    status?: 'active' | 'maintenance';
  }) {
    const branch = await prisma.branch.create({
      data: {
        tenantId,
        name: input.name,
        address: input.address,
        managerName: input.manager,
        phone: input.phone,
        capacity: input.capacity,
        groupsCount: input.groupsCount || 1,
        status: input.status || 'active',
      },
    });

    return {
      id: branch.id,
      name: branch.name,
      address: branch.address,
      manager: branch.managerName,
      phone: branch.phone,
      childrenCount: 0,
      capacity: branch.capacity,
      groupsCount: branch.groupsCount,
      status: branch.status as 'active' | 'maintenance',
    };
  },

  async updateBranch(tenantId: string, id: string, input: {
    name?: string;
    address?: string;
    manager?: string;
    phone?: string;
    capacity?: number;
    groupsCount?: number;
    status?: 'active' | 'maintenance';
  }) {
    const existing = await prisma.branch.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Filial topilmadi');

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.address && { address: input.address }),
        ...(input.manager && { managerName: input.manager }),
        ...(input.phone && { phone: input.phone }),
        ...(input.capacity && { capacity: input.capacity }),
        ...(input.groupsCount && { groupsCount: input.groupsCount }),
        ...(input.status && { status: input.status }),
      },
      include: {
        _count: {
          select: {
            children: { where: { deletedAt: null } },
            groups: { where: { deletedAt: null } },
          },
        },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      address: updated.address,
      manager: updated.managerName,
      phone: updated.phone,
      childrenCount: updated._count.children,
      capacity: updated.capacity,
      groupsCount: updated.groupsCount || updated._count.groups,
      status: updated.status as 'active' | 'maintenance',
    };
  },

  async deleteBranch(tenantId: string, id: string) {
    const existing = await prisma.branch.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Filial topilmadi');

    await prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'maintenance' },
    });

    return { id, success: true };
  },
};
