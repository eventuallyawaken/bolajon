import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function ensureUser(params: {
  id: string;
  tenantId: string | null;
  branchId: string | null;
  roleId: string;
  fullName: string;
  phone: string;
  email?: string;
  passwordHash: string;
  salaryAmount?: bigint;
}) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ id: params.id }, { phone: params.phone }] },
  });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      id: params.id,
      tenantId: params.tenantId,
      branchId: params.branchId,
      roleId: params.roleId,
      fullName: params.fullName,
      phone: params.phone,
      email: params.email,
      passwordHash: params.passwordHash,
      salaryAmount: params.salaryAmount ?? BigInt(0),
      status: 'active',
    },
  });
}

async function main() {
  console.log('Seeding Bolajon ERP database...');

  // 1. SaaS Plans
  await prisma.plan.upsert({
    where: { id: 'plan-start' },
    update: {},
    create: {
      id: 'plan-start',
      name: 'Start tarifi',
      price: BigInt(1200000),
      period: 'oyiga',
      maxBranches: 1,
      maxChildren: 80,
      features: ['1 ta filial', '80 tagacha bola', 'Kunlik davomat va oylik to‘lovlar', 'SMS bildirishnomalar'],
      isPopular: false,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro',
      name: 'Pro tarifi',
      price: BigInt(2500000),
      period: 'oyiga',
      maxBranches: 3,
      maxChildren: 250,
      features: ['3 tagacha filial', '250 tagacha bola', 'To‘liq moliya + Ombor va Oshxona', 'Ertalabki tibbiy filtr va hamshira'],
      isPopular: true,
    },
  });

  await prisma.plan.upsert({
    where: { id: 'plan-enterprise' },
    update: {},
    create: {
      id: 'plan-enterprise',
      name: 'Enterprise / Network',
      price: BigInt(4500000),
      period: 'oyiga',
      maxBranches: 10,
      maxChildren: 1000,
      features: ['Cheksiz filiallar', 'Cheksiz bolalar va xodimlar bazasi', 'Konsolidatsiyalangan tarmoq moliyasi'],
      isPopular: false,
    },
  });

  // 2. Roles
  const roleDefs = [
    { id: 'role-superadmin', slug: 'superadmin', name: 'Superadmin', description: 'SaaS Platforma egasi va boshqaruvchisi' },
    { id: 'role-director', slug: 'director', name: 'Direktor', description: 'Bog‘cha bosh rahbari (To‘liq huquqlar)' },
    { id: 'role-teacher', slug: 'teacher', name: 'Tarbiyachi', description: 'Guruh va davomat mas’uli' },
    { id: 'role-accountant', slug: 'accountant', name: 'Hisobchi', description: 'Moliya, to‘lovlar, xarajatlar va ombor' },
    { id: 'role-nurse', slug: 'nurse', name: 'Hamshira', description: 'Ertalabki tibbiy filtr va bolalar salomatligi' },
    { id: 'role-parent', slug: 'parent', name: 'Ota-ona', description: 'Ota-ona mobil ilova foydalanuvchisi' },
  ];

  const rolesMap: Record<string, { id: string }> = {};
  for (const r of roleDefs) {
    rolesMap[r.slug] = await prisma.role.upsert({
      where: { tenantId_slug: { tenantId: 'system', slug: r.slug } },
      update: {},
      create: {
        id: r.id,
        tenantId: 'system',
        name: r.name,
        slug: r.slug,
        description: r.description,
      },
    });
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 3. Superadmin User
  await ensureUser({
    id: 'usr-superadmin',
    tenantId: null,
    branchId: null,
    roleId: rolesMap.superadmin.id,
    fullName: 'Bobur Alimov (Superadmin)',
    phone: '+998 90 000 00 01',
    email: 'superadmin@bolajon.uz',
    passwordHash,
  });

  // 4. Test Kindergarten Tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'bolajon-ziyo' },
    update: {},
    create: {
      id: 'tenant-demo',
      name: 'Bolajon Ziyo MChJ (Xususiy MTT)',
      slug: 'bolajon-ziyo',
      directorName: 'Dilnoza Murodova',
      phone: '+998 71 200 11 22',
      email: 'info@bolajon-ziyo.uz',
      planId: proPlan.id,
      status: 'active',
      features: { nurseModule: true, warehouse: true, smsNotice: true },
    },
  });

  // 5. Branch (use existing Chilonzor branch if present)
  let branchChilonzor = await prisma.branch.findFirst({
    where: { tenantId: demoTenant.id, deletedAt: null },
  });
  if (!branchChilonzor) {
    branchChilonzor = await prisma.branch.create({
      data: {
        id: 'branch-chilonzor',
        tenantId: demoTenant.id,
        name: 'Chilonzor filiali',
        address: 'Toshkent sh., Chilonzor tumani, 9-mavze, 24-uy',
        managerName: 'Dilnoza Murodova',
        phone: '+998 71 200 11 22',
        capacity: 150,
        groupsCount: 2,
        status: 'active',
      },
    });
  }

  // 6. Staff & Parent Users
  await ensureUser({
    id: 'usr-director',
    tenantId: demoTenant.id,
    branchId: branchChilonzor.id,
    roleId: rolesMap.director.id,
    fullName: 'Dilnoza Murodova',
    phone: '+998 90 123 45 66',
    email: 'director@bolajon-ziyo.uz',
    passwordHash,
    salaryAmount: BigInt(8500000),
  });

  await ensureUser({
    id: 'usr-teacher',
    tenantId: demoTenant.id,
    branchId: branchChilonzor.id,
    roleId: rolesMap.teacher.id,
    fullName: 'Zilola Rahimova',
    phone: '+998 90 234 11 22',
    passwordHash,
    salaryAmount: BigInt(4500000),
  });

  await ensureUser({
    id: 'usr-accountant',
    tenantId: demoTenant.id,
    branchId: branchChilonzor.id,
    roleId: rolesMap.accountant.id,
    fullName: 'Nodira Aliyeva',
    phone: '+998 93 456 33 44',
    passwordHash,
    salaryAmount: BigInt(6000000),
  });

  await ensureUser({
    id: 'usr-nurse',
    tenantId: demoTenant.id,
    branchId: branchChilonzor.id,
    roleId: rolesMap.nurse.id,
    fullName: 'Feruza Karimova',
    phone: '+998 97 567 44 55',
    passwordHash,
    salaryAmount: BigInt(3800000),
  });

  await ensureUser({
    id: 'usr-parent-demo',
    tenantId: demoTenant.id,
    branchId: branchChilonzor.id,
    roleId: rolesMap.parent.id,
    fullName: 'Shavkat Rahimov',
    phone: '+998 90 777 88 99',
    passwordHash,
  });

  // 7. Seed initial Group, Children, Parent, Attendance, Payment, Menu ONLY if DB has no children yet
  const existingChildrenCount = await prisma.child.count({ where: { tenantId: demoTenant.id } });
  if (existingChildrenCount === 0) {
    const group1 = await prisma.group.create({
      data: {
        id: 'grp-kichkintoylar',
        tenantId: demoTenant.id,
        branchId: branchChilonzor.id,
        name: 'Kichkintoylar guruhi',
        ageRange: '2–3 yosh',
        roomNumber: '101',
        mainTeacherName: 'Zilola Rahimova',
        assistantTeacher: 'Muhabbat Alimova',
        capacity: 25,
        colorTag: '#0d9488',
      },
    });

    const parent1 = await prisma.parent.create({
      data: {
        id: 'par-shavkat',
        tenantId: demoTenant.id,
        fullName: 'Shavkat Rahimov',
        phone: '+998 90 777 88 99',
        workplace: 'IT Park Tashkent',
      },
    });

    const child1 = await prisma.child.create({
      data: {
        id: 'ch-temur',
        tenantId: demoTenant.id,
        branchId: branchChilonzor.id,
        groupId: group1.id,
        fullName: 'Aliyev Temur',
        birthDate: new Date('2023-04-12'),
        gender: 'male',
        monthlyFee: BigInt(2800000),
        allergies: 'Yong‘oq, Asal',
        medicalNotes: 'Qon guruhi: II (A) Rh+. Yong‘oq va asalga allergiyasi bor.',
      },
    });

    const child2 = await prisma.child.create({
      data: {
        id: 'ch-madina',
        tenantId: demoTenant.id,
        branchId: branchChilonzor.id,
        groupId: group1.id,
        fullName: 'Aliyeva Madina',
        birthDate: new Date('2022-08-25'),
        gender: 'female',
        monthlyFee: BigInt(2800000),
        allergies: 'Sut mahsulotlari',
        medicalNotes: 'Qon guruhi: I (0) Rh+. Laktozasiz sut berilsin.',
      },
    });

    await prisma.childParent.createMany({
      data: [
        { childId: child1.id, parentId: parent1.id, relationType: 'Otasi', isPrimaryContact: true },
        { childId: child2.id, parentId: parent1.id, relationType: 'Otasi', isPrimaryContact: true },
      ],
    });

    await prisma.medicalRecord.createMany({
      data: [
        { tenantId: demoTenant.id, childId: child1.id, recordType: 'vaccination', description: 'BCG (Silga qarshi)', recordedByRole: 'Hamshira' },
        { tenantId: demoTenant.id, childId: child1.id, recordType: 'vaccination', description: 'DTP (Bo‘g‘ma, qoqshol)', recordedByRole: 'Hamshira' },
        { tenantId: demoTenant.id, childId: child2.id, recordType: 'vaccination', description: 'Qizamiqqa qarshi (KPK)', recordedByRole: 'Hamshira' },
      ],
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    await prisma.attendance.createMany({
      data: [
        {
          tenantId: demoTenant.id,
          branchId: branchChilonzor.id,
          groupId: group1.id,
          childId: child1.id,
          date: todayStr,
          isPresent: true,
          status: 'present',
          temperature: 36.6,
          healthStatus: 'healthy',
          notes: 'Kayfiyati a’lo, rasm chizish darsida faol qatnashdi',
          checkedBy: 'Zilola Rahimova',
        },
        {
          tenantId: demoTenant.id,
          branchId: branchChilonzor.id,
          groupId: group1.id,
          childId: child2.id,
          date: todayStr,
          isPresent: true,
          status: 'present',
          temperature: 36.5,
          healthStatus: 'healthy',
          notes: 'Umumiy holati yaxshi',
          checkedBy: 'Feruza Karimova (Hamshira)',
        },
      ],
    });

    await prisma.payment.createMany({
      data: [
        {
          tenantId: demoTenant.id,
          branchId: branchChilonzor.id,
          childId: child1.id,
          transactionId: 'TRX-202611-001',
          amount: BigInt(2800000),
          month: 'Noyabr 2026',
          method: 'click',
          status: 'paid',
          receiptNumber: 'CHK-2026-11-8902',
          paidAt: new Date(),
        },
        {
          tenantId: demoTenant.id,
          branchId: branchChilonzor.id,
          childId: child2.id,
          transactionId: 'TRX-202611-002',
          amount: BigInt(2800000),
          month: 'Noyabr 2026',
          method: 'payme',
          status: 'paid',
          receiptNumber: 'CHK-2026-11-9005',
          paidAt: new Date(),
        },
      ],
    });
  }

  // 8. Daily Menu if empty
  const existingMenus = await prisma.dailyMenu.count({ where: { tenantId: demoTenant.id } });
  if (existingMenus === 0) {
    await prisma.dailyMenu.createMany({
      data: [
        {
          tenantId: demoTenant.id,
          branchId: branchChilonzor.id,
          mealType: 'Nonushta',
          dishName: 'Suli bo‘tqasi sariyog‘ bilan',
          description: 'Pishloqli buterbrod, shirin choy (Tarkibida: Sut)',
          calories: '320 kkal',
          time: '08:30 - 09:00',
        },
        {
          tenantId: demoTenant.id,
          branchId: branchChilonzor.id,
          mealType: 'Ikkinchi nonushta',
          dishName: 'Olma sharbati va pechenye',
          description: 'Yangi siqilgan tabiiy olma sharbati',
          calories: '120 kkal',
          time: '10:30',
        },
        {
          tenantId: demoTenant.id,
          branchId: branchChilonzor.id,
          mealType: 'Tushlik',
          dishName: 'Frikadelkali sho‘rva va grechka',
          description: 'Mol go‘shtli podliv, yangi karam salati, non',
          calories: '540 kkal',
          time: '12:30 - 13:15',
        },
        {
          tenantId: demoTenant.id,
          branchId: branchChilonzor.id,
          mealType: 'Tolma choy',
          dishName: 'Tvorogli quymoq (sirnik)',
          description: 'Yalpizli choy (Tarkibida: Sut, Tuxum)',
          calories: '210 kkal',
          time: '15:45',
        },
        {
          tenantId: demoTenant.id,
          branchId: branchChilonzor.id,
          mealType: 'Kechki ovqat',
          dishName: 'Sabzavotli ragu tovuq go‘shti bilan',
          description: 'Quritilgan meva kompoti',
          calories: '380 kkal',
          time: '17:30 - 18:00',
        },
      ],
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
