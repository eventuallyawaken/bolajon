import { prisma } from '../../config/db.js';
import { comparePassword, hashPassword } from '../../common/utils/password.js';
import { buildPhoneVariants } from '../../common/utils/phone.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../common/utils/jwt.js';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
} from '../../common/errors/AppError.js';
import type { LoginInput } from './auth.schema.js';

async function buildMobileContext(user: {
  id: string;
  fullName: string;
  phone: string;
  tenantId: string | null;
  branchId: string | null;
  role: { slug: string };
}) {
  let groupId: string | undefined;
  let groupName: string | undefined;
  let children: Array<{ id: string; fullName: string; groupName: string }> | undefined;

  if (!user.tenantId) {
    return { groupId, groupName, children };
  }

  if (user.role.slug === 'teacher' || user.role.slug === 'tarbiyachi') {
    const group = await prisma.group.findFirst({
      where: {
        tenantId: user.tenantId,
        deletedAt: null,
        ...(user.branchId ? { branchId: user.branchId } : {}),
        OR: [
          { mainTeacherName: { equals: user.fullName, mode: 'insensitive' } },
          { assistantTeacher: { equals: user.fullName, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, ageRange: true },
    });
    const fallbackGroup = group || (await prisma.group.findFirst({
      where: {
        tenantId: user.tenantId,
        deletedAt: null,
        ...(user.branchId ? { branchId: user.branchId } : {}),
      },
      select: { id: true, name: true, ageRange: true },
    }));
    if (fallbackGroup) {
      groupId = fallbackGroup.id;
      groupName = `${fallbackGroup.name}${fallbackGroup.ageRange ? ` (${fallbackGroup.ageRange})` : ''}`;
    }
  } else if (user.role.slug === 'parent' || user.role.slug === 'ota_ona') {
    const variants = buildPhoneVariants(user.phone);
    const parentRecords = await prisma.parent.findMany({
      where: { tenantId: user.tenantId, phone: { in: variants } },
      select: { id: true },
    });
    if (parentRecords.length > 0) {
      const links = await prisma.childParent.findMany({
        where: {
          parentId: { in: parentRecords.map((p) => p.id) },
          child: { deletedAt: null },
        },
        include: { child: { include: { group: true } } },
      });
      children = links.map((l) => ({
        id: l.child.id,
        fullName: l.child.fullName,
        groupName: l.child.group.name,
      }));
    }
  }

  return { groupId, groupName, children };
}

export const authService = {
  async login(input: LoginInput) {
    const variants = buildPhoneVariants(input.phone);
    const user = await prisma.user.findFirst({
      where: {
        phone: { in: variants },
        deletedAt: null,
      },
      include: {
        role: true,
        tenant: true,
        branch: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Telefon raqam yoki parol noto‘g‘ri');
    }

    if (user.status !== 'active') {
      throw new ForbiddenError('Foydalanuvchi hisobi faol emas');
    }

    if (user.tenant && (user.tenant.deletedAt || user.tenant.status === 'suspended')) {
      throw new ForbiddenError('Bog‘cha hisobi to‘xtatilgan (Suspended)');
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Telefon raqam yoki parol noto‘g‘ri');
    }

    const jwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      branchId: user.branchId,
      role: user.role.slug,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    // Save 1-day refresh token in database (Ledger pattern)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshToken,
        expiresAt,
      },
    });

    const extra = await buildMobileContext(user);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        avatarUrl: user.avatarUrl || null,
        role: user.role.slug,
        roleName: user.role.name,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name,
        tenant: user.tenant
          ? {
              id: user.tenant.id,
              name: user.tenant.name,
              slug: user.tenant.slug,
              status: user.tenant.status,
              features: user.tenant.features,
            }
          : null,
        branchId: user.branchId,
        branchName: user.branch?.name,
        groupId: extra.groupId,
        groupName: extra.groupName,
        children: extra.children,
      },
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(token: string) {
    if (!token) {
      throw new UnauthorizedError('Refresh token topilmadi');
    }

    try {
      verifyRefreshToken(token);

      const dbToken = await prisma.refreshToken.findUnique({
        where: { tokenHash: token },
        include: { user: { include: { role: true, tenant: true } } },
      });

      if (
        !dbToken ||
        dbToken.revokedAt ||
        dbToken.expiresAt < new Date() ||
        dbToken.user.deletedAt ||
        dbToken.user.status !== 'active'
      ) {
        throw new UnauthorizedError('Refresh token bekor qilingan yoki muddati o‘tgan');
      }

      if (
        dbToken.user.tenant &&
        (dbToken.user.tenant.deletedAt || dbToken.user.tenant.status === 'suspended')
      ) {
        throw new ForbiddenError('Bog‘cha hisobi to‘xtatilgan (Suspended)');
      }

      const newAccessToken = signAccessToken({
        userId: dbToken.user.id,
        tenantId: dbToken.user.tenantId,
        branchId: dbToken.user.branchId,
        role: dbToken.user.role.slug,
      });

      return { accessToken: newAccessToken };
    } catch (err) {
      if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
        throw err;
      }
      throw new UnauthorizedError('Refresh token yaroqsiz');
    }
  },

  async logout(token: string) {
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: token },
        data: { revokedAt: new Date() },
      });
    }
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        tenant: true,
        branch: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Foydalanuvchi topilmadi');
    }

    if (user.status !== 'active') {
      throw new ForbiddenError('Foydalanuvchi hisobi faol emas');
    }

    if (user.tenant && (user.tenant.deletedAt || user.tenant.status === 'suspended')) {
      throw new ForbiddenError('Bog‘cha hisobi to‘xtatilgan (Suspended)');
    }

    const extra = await buildMobileContext(user);

    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      role: user.role.slug,
      roleName: user.role.name,
      tenantId: user.tenantId,
      tenantName: user.tenant?.name,
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            slug: user.tenant.slug,
            status: user.tenant.status,
            features: user.tenant.features,
          }
        : null,
      branchId: user.branchId,
      branchName: user.branch?.name,
      groupId: extra.groupId,
      groupName: extra.groupName,
      children: extra.children,
    };
  },

  async updateProfile(
    userId: string,
    input: { fullName?: string; phone?: string; email?: string | null; avatarUrl?: string | null }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user || user.deletedAt) {
      throw new BadRequestError('Foydalanuvchi topilmadi');
    }

    if (input.phone && input.phone !== user.phone) {
      const existing = await prisma.user.findFirst({
        where: { phone: input.phone, id: { not: userId } },
      });
      if (existing) {
        throw new BadRequestError('Ushbu telefon raqami allaqachon boshqa profilga biriktirilgan');
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.fullName && { fullName: input.fullName }),
        ...(input.phone && { phone: input.phone }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
      include: {
        role: true,
        tenant: true,
        branch: true,
      },
    });

    // Agar foydalanuvchi direktor bo'lsa, bog'cha rahbar ma'lumotlarini ham yangilash
    if (updated.tenantId && (updated.role.slug === 'director' || updated.role.slug === 'direktor')) {
      await prisma.tenant.update({
        where: { id: updated.tenantId },
        data: {
          ...(input.fullName && { directorName: input.fullName }),
          ...(input.phone && { phone: input.phone }),
        },
      });
    }

    return {
      id: updated.id,
      fullName: updated.fullName,
      phone: updated.phone,
      email: updated.email,
      avatarUrl: updated.avatarUrl || null,
      role: updated.role.slug,
      tenantId: updated.tenantId,
      tenantName: updated.tenant?.name,
      branchId: updated.branchId,
      branchName: updated.branch?.name,
    };
  },

  async changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.deletedAt) {
      throw new BadRequestError('Foydalanuvchi topilmadi');
    }

    const isMatch = await comparePassword(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Joriy maxfiy parol noto‘g‘ri kiritildi');
    }

    const newHash = await hashPassword(input.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true, message: 'Maxfiy parol muvaffaqiyatli yangilandi' };
  },
};
