import type {
  ChildInfo,
  TodayAttendance,
  AttendanceMonthStats,
  PaymentItem,
  BalanceOverview,
} from './types';

export { mockWeeklyMenu } from './mockMenu';

export const mockChildren: ChildInfo[] = [
  {
    id: 'child-1',
    fullName: 'Aliyev Temur',
    birthDate: '2023-04-12',
    groupName: 'Kichkintoylar guruhi (2-3 yosh)',
    bloodGroup: 'II (A) Rh+',
    allergies: ['Yong‘oq', 'Asal'],
    vaccinations: [
      { name: 'BCG (Silga qarshi)', date: '2023-04-15', status: 'completed' },
      { name: 'Gepatit B', date: '2023-05-12', status: 'completed' },
      { name: 'DTP (Bo‘g‘ma, qoqshol)', date: '2023-08-10', status: 'completed' },
      { name: 'Qizamiqqa qarshi (KPK)', date: '2024-04-20', status: 'completed' },
    ],
    emergencyPhone: '+998 71 200 01 02',
    teacherName: 'Zilola Rahimova',
    teacherPhone: '+998 90 234 11 22',
  },
  {
    id: 'child-2',
    fullName: 'Aliyeva Madina',
    birthDate: '2021-08-25',
    groupName: 'Yulduzcha guruhi (4-5 yosh)',
    bloodGroup: 'I (0) Rh+',
    allergies: ['Sut mahsulotlari (Laktoza)'],
    vaccinations: [
      { name: 'BCG', date: '2021-08-28', status: 'completed' },
      { name: 'DTP', date: '2022-01-15', status: 'completed' },
      { name: 'Polio', date: '2022-04-10', status: 'completed' },
    ],
    emergencyPhone: '+998 71 200 01 02',
    teacherName: 'Gulnoza Karimova',
    teacherPhone: '+998 93 555 44 33',
  },
];

export const mockTodayAttendance: Record<string, TodayAttendance> = {
  'child-1': {
    childId: 'child-1',
    date: '2026-11-24',
    status: 'PRESENT',
    checkInTime: '08:25',
    morningFilter: {
      temperature: 36.6,
      status: 'HEALTHY',
      checkedBy: 'Zilola Rahimova (Tarbiyachi)',
      checkTime: '08:30',
      note: 'Kayfiyati a’lo, tomoq qizarishi yo‘q',
    },
    teacherNote: 'Bugun rasm chizish darsida faol qatnashdi',
  },
  'child-2': {
    childId: 'child-2',
    date: '2026-11-24',
    status: 'PRESENT',
    checkInTime: '08:15',
    morningFilter: {
      temperature: 36.5,
      status: 'HEALTHY',
      checkedBy: 'Nodira Hamshira',
      checkTime: '08:20',
      note: 'Umumiy holati yaxshi',
    },
    teacherNote: 'Bugun ingliz tili to‘garagida yangi so‘zlarni tez o‘rgandi',
  },
};

export const mockMonthStats: Record<string, AttendanceMonthStats> = {
  'child-1': {
    month: 'Noyabr 2026',
    presentDays: 18,
    lateDays: 2,
    absentDays: 1,
    totalDays: 21,
  },
  'child-2': {
    month: 'Noyabr 2026',
    presentDays: 20,
    lateDays: 1,
    absentDays: 0,
    totalDays: 21,
  },
};

export const mockBalanceOverview: Record<string, BalanceOverview> = {
  'child-1': {
    currentBalance: 0,
    monthlyFee: 2800000,
    debtAmount: 0,
    lastPaymentDate: '2026-11-05',
    nextPaymentDeadline: '2026-12-05',
  },
  'child-2': {
    currentBalance: 500000,
    monthlyFee: 2800000,
    debtAmount: 0,
    lastPaymentDate: '2026-11-03',
    nextPaymentDeadline: '2026-12-05',
  },
};

export const mockPaymentsHistory: Record<string, PaymentItem[]> = {
  'child-1': [
    {
      id: 'pay-001',
      receiptNumber: 'CHK-2026-11-8902',
      date: '2026-11-05 14:22',
      month: 'Noyabr 2026',
      amount: 2800000,
      method: 'Click',
      status: 'PAID',
      payerName: 'Shavkat Rahimov',
      childName: 'Aliyev Temur',
    },
    {
      id: 'pay-002',
      receiptNumber: 'CHK-2026-10-4411',
      date: '2026-10-04 11:10',
      month: 'Oktyabr 2026',
      amount: 2800000,
      method: 'Payme',
      status: 'PAID',
      payerName: 'Shavkat Rahimov',
      childName: 'Aliyev Temur',
    },
    {
      id: 'pay-003',
      receiptNumber: 'CHK-2026-09-1209',
      date: '2026-09-02 16:45',
      month: 'Sentabr 2026',
      amount: 2800000,
      method: 'Bank',
      status: 'PAID',
      payerName: 'Shavkat Rahimov',
      childName: 'Aliyev Temur',
    },
  ],
  'child-2': [
    {
      id: 'pay-101',
      receiptNumber: 'CHK-2026-11-9005',
      date: '2026-11-03 10:15',
      month: 'Noyabr 2026',
      amount: 2800000,
      method: 'Payme',
      status: 'PAID',
      payerName: 'Shavkat Rahimov',
      childName: 'Aliyeva Madina',
    },
    {
      id: 'pay-102',
      receiptNumber: 'CHK-2026-10-5522',
      date: '2026-10-02 09:30',
      month: 'Oktyabr 2026',
      amount: 2800000,
      method: 'Click',
      status: 'PAID',
      payerName: 'Shavkat Rahimov',
      childName: 'Aliyeva Madina',
    },
  ],
};
