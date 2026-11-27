export type SuperadminTab = 'overview' | 'tenants' | 'plans' | 'invoices' | 'logs' | 'profile';

export type TenantStatus = 'active' | 'trial' | 'blocked';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  stir: string;
  branchesCount: number;
  childrenCount: number;
  planId: string;
  planName: string;
  subscriptionEnd: string;
  monthlyFee: string;
  status: TenantStatus;
  directorName: string;
  phone: string;
  email: string;
  trialDaysRemaining?: number;
  initials: string;
  avatarColor?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  maxBranches: number | string;
  isPopular?: boolean;
  badge?: string;
  activeTenantsCount: number;
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  planName: string;
  amount: string;
  paymentMethod: 'bank' | 'card' | 'payme' | 'click';
  status: 'paid' | 'pending' | 'overdue';
  date: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  category: 'tenant' | 'billing' | 'auth' | 'system';
  actor: string;
  message: string;
  ip: string;
}

export interface SuperadminKpis {
  totalTenants: number;
  newThisMonth: number;
  activeTenants: number;
  activePercent: string;
  monthlyMrr: string;
  mrrGrowth: string;
  trialTenants: number;
}

export interface CreateTenantInput {
  name: string;
  subdomain: string;
  directorName: string;
  phone: string;
  email: string;
  planId: string;
  branchesCount: number;
  isTrial: boolean;
}

export interface CreatePlanInput {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  maxBranches: number | string;
  isPopular?: boolean;
  badge?: string;
}
