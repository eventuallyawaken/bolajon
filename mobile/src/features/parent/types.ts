export interface ChildInfo {
  id: string;
  fullName: string;
  birthDate: string;
  groupId?: string;
  groupName: string;
  branchName?: string;
  avatarUrl?: string;
  bloodGroup?: string;
  allergies: string[];
  medicalNotes?: string;
  monthlyFee?: number;
  vaccinations: Array<{ name: string; date: string; status: 'completed' | 'pending' }>;
  emergencyPhone: string;
  teacherName: string;
  teacherPhone: string;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface MorningFilterResult {
  temperature: number;
  status: 'HEALTHY' | 'FLU' | 'QUARANTINE' | 'OBSERVATION';
  checkedBy: string;
  checkTime: string;
  note?: string;
}

export interface TodayAttendance {
  childId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  morningFilter: MorningFilterResult;
  teacherNote?: string;
}

export interface AttendanceMonthStats {
  month: string;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  totalDays: number;
}

export interface ParentNotice {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

export interface ParentChildOverview {
  childId: string;
  date: string;
  todayAttendance: TodayAttendance | null;
  monthStats: AttendanceMonthStats;
  latestNotification: ParentNotice | null;
}

export type MealType = 'BREAKFAST' | 'SECOND_BREAKFAST' | 'LUNCH' | 'AFTERNOON_SNACK' | 'DINNER';

export interface MealItem {
  type: MealType;
  title: string;
  time: string;
  items: string[];
  allergens: string[];
  calories: number;
}

export interface DayMenu {
  dayOfWeek: 'Dush' | 'Sesh' | 'Chor' | 'Pay' | 'Juma' | 'Shan';
  dayName: string;
  date: string;
  meals: MealItem[];
}

export interface MenuMeal {
  id: string;
  mealType: string;
  dishName: string;
  description: string;
  calories: string;
  time: string;
  ingredients: Array<{ name: string; amountPerChild: number; unit: string }>;
}

export interface PaymentItem {
  id: string;
  receiptNumber: string;
  date: string;
  month: string;
  amount: number;
  method: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  payerName: string;
  childName: string;
}

export interface BalanceOverview {
  currentBalance?: number;
  monthlyFee: number;
  debtAmount: number;
  lastPaymentDate: string;
  nextPaymentDeadline?: string;
}

export interface ParentPaymentsData {
  balanceOverview: BalanceOverview;
  payments: PaymentItem[];
}
