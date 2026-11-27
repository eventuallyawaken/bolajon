import { prisma } from '../../config/db.js';
import { signAccessToken } from '../../common/utils/jwt.js';
import { hashPassword } from '../../common/utils/password.js';
import { buildPhoneVariants } from '../../common/utils/phone.js';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError.js';

const AVATAR_COLORS = [
  '#0d9488',
  '#0284c7',
  '#6366f1',
  '#d97706',
  '#059669',
  '#e11d48',
];

const formatUzs = (val: number | bigint) =>
  `${Number(val).toLocaleString('ru-RU').replace(/,/g, ' ')} so‘m`;

const parseNumericInput = (val: number | string | undefined, fallback = 0): number => {
  if (typeof val === 'number' && !Number.isNaN(val)) return Math.round(val);
  if (typeof val === 'string') {
    const digits = val.replace(/[^\d]/g, '');
    if (digits) return Number(digits);
  }
  return fallback;
};

const getInitials = (name: string): string =>
  name
    .replace(/["'«»]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'BG';

function mapTenantDto(t: {
  id: string;
  name: string;
  slug: string;
  directorName: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  planId: string | null;
  expiresAt: Date | null;
  trialEndsAt: Date | null;
  plan?: { id: string; name: string; price: bigint } | null;
  branches?: Array<{ id: string }>;
  _count?: { children?: number };
}) {
  const mappedStatus =
    t.status === 'suspended' ? 'blocked' : t.status === 'trial' ? 'trial' : 'active';
  const endDate = t.status === 'trial' ? t.trialEndsAt : t.expiresAt;
  const trialDaysRemaining =
    t.status === 'trial' && t.trialEndsAt
      ? Math.max(0, Math.ceil((t.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : undefined;

  let colorIdx = 0;
  for (let i = 0; i < t.id.length; i++) colorIdx += t.id.charCodeAt(i);

  return {
    id: t.id,
    name: t.name,
    subdomain: `${t.slug}.bolajon.uz`,
    stir: t.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 9).toUpperCase(),
    branchesCount: t.branches?.length ?? 0,
    childrenCount: t._count?.children ?? 0,
    planId: t.plan?.id || t.planId || 'plan-start',
    planName: t.plan?.name || 'Tarifsiz',
    subscriptionEnd: endDate ? endDate.toISOString().slice(0, 10) : 'Faol',
    monthlyFee: t.plan ? formatUzs(t.plan.price) : '0 so‘m',
    status: mappedStatus as 'active' | 'trial' | 'blocked',
    directorName: t.directorName || 'Direktor',
    phone: t.phone || '-',
    email: t.email || '-',
    trialDaysRemaining,
    initials: getInitials(t.name),
    avatarColor: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length],
  };
}

function mapPlanDto(p: {
  id: string;
  name: string;
  price: bigint;
  period: string;
  maxBranches: number;
  maxChildren: number;
  features: unknown;
  isPopular: boolean;
  _count?: { tenants?: number };
}) {
  const features = Array.isArray(p.features)
    ? p.features.map((f) => String(f))
    : [];
  return {
    id: p.id,
    name: p.name,
    price: formatUzs(p.price),
    period: p.period || 'oyiga',
    description: `${p.maxBranches} tagacha filial va ${p.maxChildren} tagacha bola`,
    features,
    maxBranches: p.maxBranches,
    maxChildren: p.maxChildren,
    isPopular: p.isPopular,
    badge: p.isPopular ? 'Eng ommabop' : p.id.includes('enterprise') ? 'Korporativ' : undefined,
    activeTenantsCount: p._count?.tenants ?? 0,
  };
}

export const superadminService = {
  async getKpis() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalTenants,
      newThisMonth,
      activeTenants,
      trialTenants,
      activeChildrenTotal,
      paidInvoices,
      activeTenantPlans,
    ] = await Promise.all([
      prisma.tenant.count({ where: { deletedAt: null } }),
      prisma.tenant.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
      prisma.tenant.count({ where: { status: 'active', deletedAt: null } }),
      prisma.tenant.count({ where: { status: 'trial', deletedAt: null } }),
      prisma.child.count({ where: { deletedAt: null } }),
      prisma.subscriptionInvoice.findMany({
        where: { status: 'paid', createdAt: { gte: startOfMonth } },
        select: { amount: true },
      }),
      prisma.tenant.findMany({
        where: { status: 'active', deletedAt: null },
        include: { plan: { select: { price: true } } },
      }),
    ]);

    const invoiceMrr = paidInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const planMrr = activeTenantPlans.reduce(
      (acc, t) => acc + (t.plan ? Number(t.plan.price) : 0),
      0
    );
    const mrrNumber = invoiceMrr > 0 ? invoiceMrr : planMrr;
    const activePercent =
      totalTenants > 0 ? `${Math.round((activeTenants / totalTenants) * 100)}%` : '0%';

    return {
      totalTenants,
      newThisMonth,
      activeTenants,
      activePercent,
      monthlyMrr: formatUzs(mrrNumber),
      mrrGrowth: activeTenants > 0 ? '+12%' : '+0%',
      mrr: mrrNumber,
      trialTenants,
      activeChildrenTotal,
    };
  },

  async getTenants(search?: string, status?: string) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (status && status !== 'all') {
      where.status = status === 'blocked' ? 'suspended' : status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { directorName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        plan: { select: { id: true, name: true, price: true } },
        branches: { where: { deletedAt: null }, select: { id: true } },
        _count: { select: { children: { where: { deletedAt: null } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map(mapTenantDto);
  },

  async createTenant(
    input: {
      name: string;
      subdomain: string;
      directorName: string;
      phone: string;
      email?: string;
      planId: string;
      branchesCount: number;
      isTrial: boolean;
    },
    superadminId?: string
  ) {
    const cleanSlug = input.subdomain.trim().toLowerCase().replace('.bolajon.uz', '');
    const existing = await prisma.tenant.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      throw new BadRequestError('Ushbu subdomain allaqachon mavjud');
    }

    const phoneVariants = buildPhoneVariants(input.phone);
    const existingUser = await prisma.user.findFirst({
      where: { phone: { in: phoneVariants } },
    });
    if (existingUser) {
      throw new BadRequestError('Ushbu telefon raqami bilan foydalanuvchi allaqachon ro‘yxatdan o‘tgan');
    }

    const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
    const plan =
      plans.find((p) => p.id === input.planId) ||
      plans.find((p) => p.id === `plan-${input.planId}`) ||
      plans.find((p) => p.name.toLowerCase().includes(input.planId.toLowerCase())) ||
      plans[0];

    if (!plan) {
      throw new NotFoundError('Tanlangan obuna tarifi topilmadi');
    }

    const trialEndsAt = input.isTrial ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null;
    const expiresAt = input.isTrial ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const branchTotal = Math.max(1, Math.min(50, Number(input.branchesCount) || 1));

    const createdTenant = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.name.trim(),
          slug: cleanSlug,
          directorName: input.directorName.trim(),
          phone: input.phone.trim(),
          email: input.email?.trim() || null,
          planId: plan.id,
          status: input.isTrial ? 'trial' : 'active',
          trialEndsAt,
          expiresAt,
        },
      });

      const createdBranches = [];
      for (let i = 1; i <= branchTotal; i++) {
        const branch = await tx.branch.create({
          data: {
            tenantId: tenant.id,
            name: i === 1 ? 'Asosiy filial' : `Filial #${i}`,
            address: 'Markaziy bino',
            managerName: input.directorName.trim(),
            phone: input.phone.trim(),
            capacity: 100,
            groupsCount: 0,
            status: 'active',
          },
        });
        createdBranches.push(branch);
      }

      let dirRole = await tx.role.findFirst({
        where: { tenantId: 'system', slug: 'director' },
      });
      if (!dirRole) {
        dirRole = await tx.role.findFirst({ where: { slug: 'director' } });
      }
      if (!dirRole) {
        dirRole = await tx.role.create({
          data: { name: 'Direktor', slug: 'director', tenantId: tenant.id },
        });
      }

      const defaultPassword = await hashPassword('Password123!');
      await tx.user.create({
        data: {
          tenantId: tenant.id,
          branchId: createdBranches[0].id,
          roleId: dirRole.id,
          fullName: input.directorName.trim(),
          phone: input.phone.trim(),
          email: input.email?.trim() || null,
          passwordHash: defaultPassword,
          status: 'active',
        },
      });

      if (!input.isTrial) {
        await tx.subscriptionInvoice.create({
          data: {
            tenantId: tenant.id,
            amount: plan.price,
            status: 'paid',
            planName: plan.name,
            receiptNumber: `INV-${Date.now().toString().slice(-6)}`,
            paidAt: new Date(),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: superadminId || null,
          action: 'TENANT_CREATED',
          entity: 'Tenant',
          entityId: tenant.id,
          newData: { name: tenant.name, slug: tenant.slug, status: tenant.status },
        },
      });

      return tx.tenant.findUniqueOrThrow({
        where: { id: tenant.id },
        include: {
          plan: { select: { id: true, name: true, price: true } },
          branches: { where: { deletedAt: null }, select: { id: true } },
          _count: { select: { children: { where: { deletedAt: null } } } },
        },
      });
    });

    return mapTenantDto(createdTenant);
  },

  async updateTenantStatus(id: string, rawStatus: string, superadminId?: string) {
    const dbStatus = rawStatus === 'blocked' ? 'suspended' : rawStatus;
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant || tenant.deletedAt) throw new NotFoundError('Bog‘cha topilmadi');

    const updated = await prisma.$transaction(async (tx) => {
      const saved = await tx.tenant.update({
        where: { id },
        data: { status: dbStatus },
        include: {
          plan: { select: { id: true, name: true, price: true } },
          branches: { where: { deletedAt: null }, select: { id: true } },
          _count: { select: { children: { where: { deletedAt: null } } } },
        },
      });

      if (dbStatus === 'suspended') {
        await tx.refreshToken.updateMany({
          where: { user: { tenantId: id }, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId: id,
          userId: superadminId || null,
          action: dbStatus === 'suspended' ? 'TENANT_SUSPENDED' : 'TENANT_ACTIVATED',
          entity: 'Tenant',
          entityId: id,
          oldData: { status: tenant.status },
          newData: { status: dbStatus },
        },
      });

      return saved;
    });

    return mapTenantDto(updated);
  },

  async deleteTenant(id: string, superadminId?: string) {
    const existing = await prisma.tenant.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });
    if (!existing) throw new NotFoundError('Bog‘cha topilmadi');

    await prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { tenantId: id } });
      await tx.subscriptionInvoice.deleteMany({ where: { tenantId: id } });
      await tx.dailyMenu.deleteMany({ where: { tenantId: id } });
      await tx.warehouseTransaction.deleteMany({ where: { tenantId: id } });
      await tx.warehouseItem.deleteMany({ where: { tenantId: id } });
      await tx.expense.deleteMany({ where: { tenantId: id } });
      await tx.payment.deleteMany({ where: { tenantId: id } });
      await tx.medicalRecord.deleteMany({ where: { tenantId: id } });
      await tx.attendance.deleteMany({ where: { tenantId: id } });
      await tx.child.deleteMany({ where: { tenantId: id } });
      await tx.parent.deleteMany({ where: { tenantId: id } });
      await tx.group.deleteMany({ where: { tenantId: id } });
      await tx.refreshToken.deleteMany({ where: { user: { tenantId: id } } });
      await tx.user.deleteMany({ where: { tenantId: id } });
      await tx.rolePermission.deleteMany({ where: { role: { tenantId: id } } });
      await tx.role.deleteMany({ where: { tenantId: id } });
      await tx.branch.deleteMany({ where: { tenantId: id } });
      await tx.auditLog.deleteMany({ where: { tenantId: id } });
      await tx.tenant.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          tenantId: null,
          userId: superadminId || null,
          action: 'TENANT_DELETED',
          entity: 'Tenant',
          entityId: id,
          oldData: { name: existing.name, slug: existing.slug },
        },
      });
    });

    return { id, deleted: true };
  },

  async impersonateTenant(tenantId: string, superadminId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          where: { deletedAt: null, status: 'active' },
          include: { role: true, branch: true },
        },
      },
    });

    if (!tenant || tenant.deletedAt) throw new NotFoundError('Bog‘cha topilmadi');
    if (tenant.status === 'suspended') {
      throw new BadRequestError('Bloklangan bog‘chaga kirishdan oldin uni faollashtiring');
    }

    const directorUser =
      tenant.users.find((u) => ['director', 'direktor'].includes(u.role.slug.toLowerCase())) ||
      tenant.users[0];

    if (!directorUser) {
      throw new BadRequestError('Ushbu bog‘chada faol boshqaruvchi hisobi topilmadi');
    }

    const accessToken = signAccessToken({
      userId: directorUser.id,
      tenantId: tenant.id,
      branchId: directorUser.branchId,
      role: 'director',
      impersonatedBy: superadminId,
    });

    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: superadminId,
        action: 'TENANT_IMPERSONATED',
        entity: 'Tenant',
        entityId: tenant.id,
        newData: { targetUserId: directorUser.id, tenantName: tenant.name },
      },
    });

    return {
      accessToken,
      user: {
        id: directorUser.id,
        fullName: directorUser.fullName,
        phone: directorUser.phone,
        email: directorUser.email,
        avatarUrl: directorUser.avatarUrl || null,
        role: 'director',
        roleName: directorUser.role.name,
        tenantId: tenant.id,
        tenantName: tenant.name,
        branchId: directorUser.branchId,
        branchName: directorUser.branch?.name,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        features: tenant.features,
      },
    };
  },

  async getPlans() {
    const plans = await prisma.plan.findMany({
      where: { status: 'active' },
      include: {
        _count: { select: { tenants: { where: { deletedAt: null } } } },
      },
      orderBy: { price: 'asc' },
    });
    return plans.map(mapPlanDto);
  },

  async createPlan(
    input: {
      name: string;
      price: number | string;
      period?: string;
      maxBranches: number | string;
      maxChildren?: number | string;
      features: string[];
      isPopular?: boolean;
    },
    superadminId?: string
  ) {
    const priceInt = parseNumericInput(input.price, 1000000);
    const maxBranches = Math.max(1, parseNumericInput(input.maxBranches, 1));
    const maxChildren = Math.max(10, parseNumericInput(input.maxChildren, maxBranches * 100));

    const plan = await prisma.plan.create({
      data: {
        name: input.name.trim(),
        price: BigInt(priceInt),
        period: input.period || 'oyiga',
        maxBranches,
        maxChildren,
        features: input.features || [],
        isPopular: input.isPopular ?? false,
      },
      include: {
        _count: { select: { tenants: { where: { deletedAt: null } } } },
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: null,
        userId: superadminId || null,
        action: 'PLAN_CREATED',
        entity: 'Plan',
        entityId: plan.id,
        newData: { name: plan.name, price: priceInt },
      },
    });

    return mapPlanDto(plan);
  },

  async updatePlan(
    id: string,
    input: {
      name?: string;
      price?: number | string;
      period?: string;
      maxBranches?: number | string;
      maxChildren?: number | string;
      features?: string[];
      isPopular?: boolean;
    },
    superadminId?: string
  ) {
    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Tarif topilmadi');

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.price !== undefined) data.price = BigInt(parseNumericInput(input.price, Number(existing.price)));
    if (input.period !== undefined) data.period = input.period;
    if (input.maxBranches !== undefined) data.maxBranches = Math.max(1, parseNumericInput(input.maxBranches, existing.maxBranches));
    if (input.maxChildren !== undefined) data.maxChildren = Math.max(10, parseNumericInput(input.maxChildren, existing.maxChildren));
    if (input.features !== undefined) data.features = input.features;
    if (input.isPopular !== undefined) data.isPopular = input.isPopular;

    const updated = await prisma.plan.update({
      where: { id },
      data,
      include: {
        _count: { select: { tenants: { where: { deletedAt: null } } } },
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: null,
        userId: superadminId || null,
        action: 'PLAN_UPDATED',
        entity: 'Plan',
        entityId: id,
        newData: { name: updated.name },
      },
    });

    return mapPlanDto(updated);
  },

  async deletePlan(id: string, superadminId?: string) {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: { _count: { select: { tenants: { where: { deletedAt: null } } } } },
    });
    if (!plan) throw new NotFoundError('Tarif topilmadi');
    if (plan._count.tenants > 0) {
      throw new BadRequestError('Ushbu tarifga ulangan bog‘chalar mavjud. Avval ularning tarifini o‘zgartiring.');
    }

    await prisma.plan.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        tenantId: null,
        userId: superadminId || null,
        action: 'PLAN_DELETED',
        entity: 'Plan',
        entityId: id,
        oldData: { name: plan.name },
      },
    });

    return { id, deleted: true };
  },

  async getInvoices() {
    const invoices = await prisma.subscriptionInvoice.findMany({
      include: { tenant: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map((inv, idx) => ({
      id: inv.id,
      invoiceNumber: inv.receiptNumber || `INV-${String(invoices.length - idx).padStart(4, '0')}`,
      tenantId: inv.tenantId,
      tenantName: inv.tenant?.name || 'Bog‘cha',
      planName: inv.planName,
      amount: formatUzs(inv.amount),
      paymentMethod: 'bank' as const,
      status: (['paid', 'pending', 'overdue'].includes(inv.status) ? inv.status : 'paid') as
        | 'paid'
        | 'pending'
        | 'overdue',
      date: (inv.paidAt || inv.createdAt).toISOString().slice(0, 10),
    }));
  },

  async getLogs() {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return logs.map((l) => {
      const level = l.action.includes('SUSPEND') || l.action.includes('DELETE')
        ? ('warn' as const)
        : ('info' as const);
      const category = l.entity === 'Tenant'
        ? ('tenant' as const)
        : l.entity === 'Plan' || l.entity === 'SubscriptionInvoice'
          ? ('billing' as const)
          : ('system' as const);
      return {
        id: l.id,
        timestamp: l.createdAt.toISOString().replace('T', ' ').slice(0, 19),
        level,
        category,
        actor: l.user?.fullName || 'Superadmin / Tizim',
        message: `${l.action} (${l.entity})`,
        ip: l.ipAddress || '127.0.0.1',
      };
    });
  },
};
