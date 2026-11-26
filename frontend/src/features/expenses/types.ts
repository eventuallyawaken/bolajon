export type ExpenseCategory =
  | 'Oziq-ovqat va oshxona'
  | 'Xodimlar maoshi'
  | 'Kommunal to‘lovlar'
  | 'Xo‘jalik va gigiyena'
  | 'Ta’mirlash va inventar';

export interface ExpenseRecord {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  recipient: string;
  paymentMethod: 'Naqd pul' | 'Bank hisobi' | 'Korporativ karta';
  date: string;
  notes?: string;
}

export interface CreateExpenseInput {
  title: string;
  category: ExpenseCategory;
  amount: number;
  recipient: string;
  paymentMethod: 'Naqd pul' | 'Bank hisobi' | 'Korporativ karta';
  notes?: string;
}

export interface CashSummary {
  cashBalance: number;
  bankBalance: number;
  totalSpentThisMonth: number;
}
