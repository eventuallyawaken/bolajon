export interface DashboardKpiItem {
  id: string;
  label: string;
  value: string;
  subValue: string;
  trendText?: string;
  isUp?: boolean;
  colorClass: 'teal' | 'green' | 'blue' | 'amber';
}

export interface RecentPaymentItem {
  id: string;
  childName: string;
  groupName: string;
  amount: string;
  method: 'payme' | 'click' | 'bank' | 'cash' | 'card_transfer' | string;
  time: string;
  status: 'success' | 'pending';
}

export interface GroupAttendanceItem {
  id: string;
  groupName: string;
  ageCategory: string;
  presentCount: number;
  totalCount: number;
  healthCheckedCount: number;
  percent: number;
  teacherName: string;
}

export interface DashboardFinanceSummary {
  monthlyRevenue: number;
  monthlyExpenses: number;
  pendingReceiptsCount: number;
  pendingReceiptsAmount: number;
  totalDebt: number;
  netBalance: number;
}

export interface DashboardData {
  branchName: string;
  greetingUser: string;
  todayDate: string;
  kpis: DashboardKpiItem[];
  recentPayments: RecentPaymentItem[];
  groupAttendance: GroupAttendanceItem[];
  financeSummary?: DashboardFinanceSummary;
}
