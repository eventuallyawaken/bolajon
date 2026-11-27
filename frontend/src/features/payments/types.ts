export type PaymentMethod =
  | 'Payme'
  | 'Click'
  | 'Bank o‘tkazmasi'
  | 'Naqd kassa'
  | 'card_transfer'
  | string;
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'rejected';

export type PaymentCardType = 'uzcard' | 'humo' | 'visa' | 'mastercard' | 'other';

export interface PaymentCard {
  id: string;
  cardType: PaymentCardType;
  bankName: string;
  cardNumber: string;
  cardHolder: string;
  note?: string;
  isActive: boolean;
  branchId?: string;
  createdAt?: string;
}

export interface CreatePaymentCardInput {
  cardType: PaymentCardType;
  bankName: string;
  cardNumber: string;
  cardHolder: string;
  note?: string;
  isActive?: boolean;
}

export interface PaymentCardSnapshot {
  cardType?: string;
  bankName?: string;
  cardHolder?: string;
  last4?: string;
  cardNumberMasked?: string;
}

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
  periodStart?: string;
  periodEnd?: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  receiptNumber: string;
  paymentCardId?: string;
  cardSnapshot?: PaymentCardSnapshot;
  receiptImageUrl?: string;
  rejectionReason?: string;
  reviewedAt?: string;
}

export interface CreatePaymentInput {
  childId?: string;
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
  pendingCount: number;
  pendingAmount: number;
  rejectedCount: number;
}
