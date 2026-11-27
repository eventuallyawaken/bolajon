export interface ParentVaccination {
  name: string;
  date: string;
  status: 'completed' | 'scheduled';
}

export interface ParentMedicalRecord {
  id: string;
  recordType: string;
  description: string;
  recordedByRole: string;
  checkedAt: string;
}

export interface ParentChild {
  id: string;
  fullName: string;
  birthDate: string;
  gender?: string;
  address?: string;
  status?: string;
  groupId: string;
  groupName: string;
  branchId: string;
  branchName: string;
  allergies: string[];
  medicalNotes: string;
  monthlyFee: number;
  emergencyPhone: string;
  teacherName: string;
  teacherPhone: string;
  vaccinations: ParentVaccination[];
  medicalRecords?: ParentMedicalRecord[];
}

export interface ParentTodayAttendance {
  status: string;
  isPresent: boolean;
  temperature: number;
  healthStatus: string;
  checkedBy: string;
  checkTime: string;
  notes: string;
}

export interface ParentMonthStats {
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
  todayAttendance: ParentTodayAttendance | null;
  monthStats: ParentMonthStats;
  latestNotification: ParentNotice | null;
}

export interface ParentAttendanceDayRecord {
  id: string;
  date: string;
  status: string;
  isPresent: boolean;
  temperature: number;
  healthStatus: string;
  checkedBy: string;
  checkTime: string;
  notes: string;
}

export interface ParentAttendanceHistory {
  childId: string;
  month: string;
  summary: {
    presentDays: number;
    lateDays: number;
    absentDays: number;
    totalDays: number;
  };
  records: ParentAttendanceDayRecord[];
}

export interface ParentMenuIngredient {
  name: string;
  amountPerChild: number;
  unit: string;
}

export interface ParentMenuMeal {
  id: string;
  mealType: string;
  dishName: string;
  description: string;
  calories: string;
  time: string;
  ingredients: ParentMenuIngredient[];
}

export interface ParentPaymentCard {
  id: string;
  cardType: 'uzcard' | 'humo' | 'visa' | 'mastercard' | 'other' | string;
  bankName: string;
  cardNumber: string;
  cardHolder: string;
  note?: string;
}

export interface ParentPaymentItem {
  id: string;
  receiptNumber: string;
  date: string;
  month: string;
  periodStart?: string;
  periodEnd?: string;
  amount: number;
  method: string;
  status: string;
  payerName: string;
  childName: string;
  cardSnapshot?: {
    cardType?: string;
    bankName?: string;
    cardHolder?: string;
    last4?: string;
    cardNumberMasked?: string;
  };
  receiptImageUrl?: string;
  rejectionReason?: string;
}

export interface ParentPaymentsData {
  balanceOverview: {
    monthlyFee: number;
    debtAmount: number;
    pendingAmount?: number;
    lastPaymentDate: string;
  };
  payments: ParentPaymentItem[];
}

export interface SubmitReceiptInput {
  paymentCardId: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  month?: string;
  receiptImage: string;
}
