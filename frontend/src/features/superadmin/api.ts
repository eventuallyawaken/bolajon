import { http } from '@/shared/api/http';
import type {
  CreatePlanInput,
  CreateTenantInput,
  Plan,
  SubscriptionInvoice,
  SuperadminKpis,
  SystemLog,
  Tenant,
} from './types';

export const superadminApi = {
  async getKpis(): Promise<SuperadminKpis> {
    try {
      const res = await http.get('/superadmin/stats');
      const d = res.data.data;
      return {
        totalTenants: d?.totalTenants || 0,
        newThisMonth: d?.newThisMonth || 0,
        activeTenants: d?.activeTenants || 0,
        activePercent: d?.activePercent || '100%',
        monthlyMrr: d?.monthlyMrr || '0 so‘m',
        mrrGrowth: d?.mrrGrowth || '+0%',
        trialTenants: d?.trialTenants || 0,
      };
    } catch {
      return {
        totalTenants: 0,
        newThisMonth: 0,
        activeTenants: 0,
        activePercent: '100%',
        monthlyMrr: '0 so‘m',
        mrrGrowth: '+0%',
        trialTenants: 0,
      };
    }
  },

  async getTenants(): Promise<Tenant[]> {
    try {
      const res = await http.get('/superadmin/tenants');
      return res.data.data;
    } catch {
      return [];
    }
  },

  async getPlans(): Promise<Plan[]> {
    try {
      const res = await http.get('/superadmin/plans');
      return res.data.data;
    } catch {
      return [];
    }
  },

  async getInvoices(): Promise<SubscriptionInvoice[]> {
    try {
      const res = await http.get('/superadmin/invoices');
      return res.data.data;
    } catch {
      return [];
    }
  },

  async getSystemLogs(): Promise<SystemLog[]> {
    try {
      const res = await http.get('/superadmin/logs');
      return res.data.data;
    } catch {
      return [];
    }
  },

  async createTenant(input: CreateTenantInput): Promise<Tenant> {
    const res = await http.post('/superadmin/tenants', input);
    return res.data.data;
  },

  async updateTenantStatus(id: string, status: 'active' | 'suspended' | 'trial'): Promise<Tenant> {
    const res = await http.patch(`/superadmin/tenants/${id}/status`, { status });
    return res.data.data;
  },

  async toggleBlockTenant(id: string, nextStatus: 'active' | 'suspended'): Promise<Tenant> {
    const res = await http.patch(`/superadmin/tenants/${id}/status`, { status: nextStatus });
    return res.data.data;
  },

  async deleteTenant(id: string): Promise<void> {
    await http.delete(`/superadmin/tenants/${id}`);
  },

  async createPlan(input: CreatePlanInput): Promise<Plan> {
    const res = await http.post('/superadmin/plans', input);
    return res.data.data;
  },

  async updatePlan(plan: Plan | Partial<CreatePlanInput>, input?: Partial<CreatePlanInput>): Promise<Plan> {
    const planId = typeof plan === 'object' && 'id' in plan ? plan.id : '';
    const body = input || plan;
    const res = await http.put(`/superadmin/plans/${planId}`, body);
    return res.data.data;
  },

  async deletePlan(id: string): Promise<void> {
    await http.delete(`/superadmin/plans/${id}`);
  },

  async impersonateTenant(id: string) {
    const res = await http.post(`/superadmin/tenants/${id}/impersonate`);
    return res.data.data;
  },
};
