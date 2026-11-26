import { prisma } from '../../config/db.js';
import { signAccessToken } from '../../common/utils/jwt.js';
import { hashPassword } from '../../common/utils/password.js';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError.js';

export const superadminService = {
  async getKpis() {
    const totalTenants = await prisma.tenant.count({ where: { deletedAt: null } });
    const activeTenants = await prisma.tenant.count({ where: { status: 'active', deletedAt: null } });
    const trialTenants = await prisma.tenant.count({ where: { status: 'trial', deletedAt: null } });

    // Calculate MRR from active subscription invoices or active plans
    const activeInvoices = await prisma.subscriptionInvoice.findMany({
      where: { status: 'paid' },
      select: { amount: true },
    });
    const totalRevenue = activeInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const activeChildrenTotal = await prisma.child.count({ where: { deletedAt: null } });

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      mrr: totalRevenue,
      activeChildrenTotal,
    };
  },

  async getTenants(search?: string, status?: string) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { directorName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    return prisma.tenant.findMany({
      where,
      include: {
        plan: true,
        branches: { select: { id: true, name: true } },
        _count: { select: { children: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createTenant(input: {
    name: string;
    subdomain: string;
    directorName: string;
    phone: string;
    email?: string;
    planId: string;
    branchesCount: number;
    isTrial: boolean;
  }) {
    const existing = await prisma.tenant.findUnique({
      where: { slug: input.subdomain.replace('.bolajon.uz', '') },
    });
    if (existing) {
      throw new BadRequestError('Ushbu subdomain allaqachon mavjud');
    }

    const cleanSlug = input.subdomain.replace('.bolajon.uz', '');
    const trialEndsAt = input.isTrial ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null;

    return prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.name,
          slug: cleanSlug,
          directorName: input.directorName,
          phone: input.phone,
          email: input.email,
          planId: input.planId,
          status: input.isTrial ? 'trial' : 'active',
          trialEndsAt,
        },
      });

      // Default branch
      const branch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: 'Asosiy filial',
          address: 'Markaziy bino',
          managerName: input.directorName,
          phone: input.phone,
          capacity: 100,
          groupsCount: 3,
        },
      });

      // Find director role
      let dirRole = await tx.role.findFirst({
        where: { slug: 'director' },
      });
      if (!dirRole) {
        dirRole = await tx.role.create({
          data: { name: 'Direktor', slug: 'director', tenantId: tenant.id },
        });
      }

      // Create Director user
      const defaultPassword = await hashPassword('Password123!');
      await tx.user.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          roleId: dirRole.id,
          fullName: input.directorName,
          phone: input.phone,
          email: input.email,
          passwordHash: defaultPassword,
          status: 'active',
        },
      });

      return tenant;
    });
  },

  async updateTenantStatus(id: string, status: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundError('Bog‘cha topilmadi');

    return prisma.tenant.update({
      where: { id },
      data: { status },
    });
  },

  async impersonateTenant(tenantId: string, superadminId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          where: { role: { slug: 'director' }, deletedAt: null },
          include: { role: true, branch: true },
        },
      },
    });

    if (!tenant) throw new NotFoundError('Bog‘cha topilmadi');
    const directorUser = tenant.users[0];
    if (!directorUser) throw new BadRequestError('Ushbu bog‘chada direktor hisobi topilmadi');

    // Issue special 30m impersonation token
    const accessToken = signAccessToken({
      userId: directorUser.id,
      tenantId: tenant.id,
      branchId: directorUser.branchId,
      role: 'director',
      impersonatedBy: superadminId,
    });

    return {
      accessToken,
      user: {
        id: directorUser.id,
        fullName: directorUser.fullName,
        role: 'director',
        tenantId: tenant.id,
        tenantName: tenant.name,
      },
    };
  },

  async getPlans() {
    return prisma.plan.findMany({ orderBy: { price: 'asc' } });
  },

  async createPlan(input: {
    name: string;
    price: number;
    period?: string;
    maxBranches: number;
    maxChildren: number;
    features: string[];
    isPopular?: boolean;
  }) {
    return prisma.plan.create({
      data: {
        name: input.name,
        price: BigInt(input.price),
        period: input.period || 'oyiga',
        maxBranches: input.maxBranches,
        maxChildren: input.maxChildren,
        features: input.features,
        isPopular: input.isPopular ?? false,
      },
    });
  },

  async updatePlan(id: string, input: Record<string, unknown>) {
    const data: Record<string, unknown> = { ...input };
    if (data.price !== undefined) {
      data.price = BigInt(data.price as number);
    }
    return prisma.plan.update({ where: { id }, data });
  },

  async getInvoices() {
    return prisma.subscriptionInvoice.findMany({
      include: { tenant: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },
};
