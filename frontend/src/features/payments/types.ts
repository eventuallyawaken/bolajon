export type PaymentMethod = 'Payme' | 'Click' | 'Bank o‘tkazmasi' | 'Naqd kassa';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface PaymentRecord {
  id: string;
  transactionId: string;
  childId: string;
  childName: string;
  groupName: string;
  parentName: string;
  parentPhone: string;
  amount: number;
  month: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  receiptNumber: string;
}

export interface CreatePaymentInput {
  childName: string;
  groupName: string;
  amount: number;
  month: string;
  method: PaymentMethod;
  receiptNumber?: string;
}

export interface PaymentKpis {
  totalRevenue: number;
  monthlyTarget: number;
  collectedCount: number;
  debtorCount: number;
  totalDebt: number;
}
