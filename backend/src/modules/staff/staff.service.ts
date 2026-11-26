import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import { hashPassword } from '../../common/utils/password.js';

function resolveRoleSlug(roleLabel: string): string {
  const lower = roleLabel.trim().toLowerCase();
  if (lower.includes('tarbiyachi') || lower === 'teacher') return 'teacher';
  if (lower.includes('direktor') || lower === 'director') return 'director';
  if (lower.includes('hisobchi') || lower === 'accountant') return 'accountant';
  if (lower.includes('hamshira') || lower === 'nurse') return 'nurse';
  if (lower.includes('ota') || lower === 'parent') return 'parent';
  return lower.replace(/[^a-z0-9]/g, '_');
}

export const staffService = {
  async getStaffList(tenantId: string, branchId?: string, search?: string) {
    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    };
    if (branchId) where.branchId = branchId;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        role: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const groups = await prisma.group.findMany({
      where: { tenantId, deletedAt: null },
      select: { name: true, mainTeacherName: true },
    });
    const teacherGroupMap = new Map<string, string>();
    for (const g of groups) {
      teacherGroupMap.set(g.mainTeacherName.toLowerCase(), g.name);
    }

    return users.map((u) => {
      const assigned = teacherGroupMap.get(u.fullName.toLowerCase());
      return {
        id: u.id,
        fullName: u.fullName,
        role: u.role?.name || 'Xodim',
        phone: u.phone,
        groupAssigned: assigned || undefined,
        salary: Number(u.salaryAmount),
        status: (u.status === 'leave' ? 'leave' : 'active') as 'active' | 'leave',
        hiredDate: u.hiredDate ? u.hiredDate.toISOString().slice(0, 10) : u.createdAt.toISOString().slice(0, 10),
      };
    });
  },

  async createStaff(tenantId: string, branchId: string | undefined, input: {
    fullName: string;
    role: string;
    phone: string;
    groupAssigned?: string;
    salary: number;
  }) {
    let targetBranchId = branchId;
    if (!targetBranchId) {
      const firstBranch = await prisma.branch.findFirst({ where: { tenantId, deletedAt: null } });
      if (!firstBranch) throw new NotFoundError('Filial topilmadi');
      targetBranchId = firstBranch.id;
    }

    // Slug for role
    const roleSlug = resolveRoleSlug(input.role);
    let role = await prisma.role.findFirst({
      where: {
        OR: [
          { tenantId: 'system', slug: roleSlug },
          { tenantId, slug: roleSlug },
          { tenantId: null, slug: roleSlug },
        ],
      },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          tenantId,
          name: input.role,
          slug: roleSlug,
          description: `${input.role} lavozimi`,
        },
      });
    }

    const defaultPasswordHash = await hashPassword('12345678');
    const user = await prisma.user.create({
      data: {
        tenantId,
        branchId: targetBranchId,
        roleId: role.id,
        fullName: input.fullName,
        phone: input.phone,
        passwordHash: defaultPasswordHash,
        salaryAmount: BigInt(Math.round(input.salary)),
        status: 'active',
        hiredDate: new Date(),
      },
      include: { role: true },
    });

    return {
      id: user.id,
      fullName: user.fullName,
      role: user.role.name,
      phone: user.phone,
      groupAssigned: input.groupAssigned,
      salary: Number(user.salaryAmount),
      status: 'active' as const,
      hiredDate: user.hiredDate!.toISOString().slice(0, 10),
    };
  },

  async updateStaff(tenantId: string, id: string, input: {
    fullName?: string;
    role?: string;
    phone?: string;
    groupAssigned?: string;
    salary?: number;
    status?: 'active' | 'leave' | 'inactive';
  }) {
    const existing = await prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { role: true },
    });
    if (!existing) throw new NotFoundError('Xodim topilmadi');

    let roleId = existing.roleId;
    if (input.role && input.role !== existing.role.name) {
      const roleSlug = resolveRoleSlug(input.role);
      let role = await prisma.role.findFirst({
        where: {
          OR: [
            { tenantId: 'system', slug: roleSlug },
            { tenantId, slug: roleSlug },
            { tenantId: null, slug: roleSlug },
          ],
        },
      });
      if (!role) {
        role = await prisma.role.create({
          data: {
            tenantId,
            name: input.role,
            slug: roleSlug,
            description: `${input.role} lavozimi`,
          },
        });
      }
      roleId = role.id;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(input.fullName && { fullName: input.fullName }),
        ...(input.phone && { phone: input.phone }),
        ...(input.salary !== undefined && { salaryAmount: BigInt(Math.round(input.salary)) }),
        ...(input.status && { status: input.status }),
        roleId,
      },
      include: { role: true },
    });

    return {
      id: updated.id,
      fullName: updated.fullName,
      role: updated.role.name,
      phone: updated.phone,
      groupAssigned: input.groupAssigned,
      salary: Number(updated.salaryAmount),
      status: (updated.status === 'leave' ? 'leave' : 'active') as 'active' | 'leave',
      hiredDate: updated.hiredDate?.toISOString().slice(0, 10) || updated.createdAt.toISOString().slice(0, 10),
    };
  },

  async deleteStaff(tenantId: string, id: string) {
    const existing = await prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Xodim topilmadi');

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
    });

    return { id, success: true };
  },
};
