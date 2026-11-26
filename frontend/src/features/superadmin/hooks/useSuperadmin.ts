import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import type {
  CreatePlanInput,
  CreateTenantInput,
  Plan,
  SubscriptionInvoice,
  SuperadminKpis,
  SuperadminTab,
  SystemLog,
  Tenant,
  TenantStatus,
} from '../types';
import { superadminApi } from '../api';

export function useSuperadmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const validTabs: SuperadminTab[] = ['overview', 'tenants', 'plans', 'invoices', 'logs'];
  const activeTab: SuperadminTab = validTabs.includes(rawTab as SuperadminTab)
    ? (rawTab as SuperadminTab)
    : 'overview';

  const setActiveTab = useCallback(
    (tab: SuperadminTab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'overview') {
          next.delete('tab');
        } else {
          next.set('tab', tab);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  // Data states
  const [kpis, setKpis] = useState<SuperadminKpis | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Modal states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TenantStatus>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [kpisData, tenantsData, plansData, invoicesData, logsData] = await Promise.all([
        superadminApi.getKpis(),
        superadminApi.getTenants(),
        superadminApi.getPlans(),
        superadminApi.getInvoices(),
        superadminApi.getSystemLogs(),
      ]);

      setKpis(kpisData);
      setTenants(tenantsData);
      setPlans(plansData);
      setInvoices(invoicesData);
      setLogs(logsData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  // Filtered tenants calculation
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      // Status filter
      if (statusFilter !== 'all' && tenant.status !== statusFilter) {
        return false;
      }
      // Search query filter (name, subdomain, stir, directorName)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = tenant.name.toLowerCase().includes(q);
        const matchesSubdomain = tenant.subdomain.toLowerCase().includes(q);
        const matchesStir = tenant.stir.includes(q);
        const matchesDirector = tenant.directorName.toLowerCase().includes(q);
        return matchesName || matchesSubdomain || matchesStir || matchesDirector;
      }
      return true;
    });
  }, [tenants, statusFilter, searchQuery]);

  // Counts for filter chips
  const tenantCounts = useMemo(() => {
    return {
      all: tenants.length,
      active: tenants.filter((t) => t.status === 'active').length,
      trial: tenants.filter((t) => t.status === 'trial').length,
      blocked: tenants.filter((t) => t.status === 'blocked').length,
    };
  }, [tenants]);

  // Handlers
  const handleCreateTenant = async (input: CreateTenantInput) => {
    const newTenant = await superadminApi.createTenant(input);
    setTenants((prev) => [newTenant, ...prev]);
    const updatedKpis = await superadminApi.getKpis();
    const updatedLogs = await superadminApi.getSystemLogs();
    setKpis(updatedKpis);
    setLogs(updatedLogs);
    setIsCreateModalOpen(false);
    toast.success(`"${newTenant.name}" bog‘chasi muvaffaqiyatli ulandi!`);
  };

  const handleToggleBlock = async (tenantId: string) => {
    const updated = await superadminApi.toggleBlockTenant(tenantId);
    setTenants((prev) => prev.map((t) => (t.id === tenantId ? updated : t)));
    const updatedKpis = await superadminApi.getKpis();
    const updatedLogs = await superadminApi.getSystemLogs();
    setKpis(updatedKpis);
    setLogs(updatedLogs);
    if (updated.status === 'blocked') {
      toast.warn(`"${updated.name}" hisobi to‘xtatildi (bloklandi).`);
    } else {
      toast.success(`"${updated.name}" hisobi qayta faollashtirildi!`);
    }
  };

  const handleImpersonate = (tenant: Tenant) => {
    toast.info(`"${tenant.name}" direktor paneliga ulanmoqda... (https://${tenant.subdomain})`);
  };

  const openCreatePlanModal = () => {
    setSelectedPlan(null);
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsPlanModalOpen(true);
  };

  const closePlanModal = () => {
    setSelectedPlan(null);
    setIsPlanModalOpen(false);
  };

  const handleSavePlan = async (data: Plan | CreatePlanInput) => {
    if ('id' in data) {
      // Edit existing plan
      const updated = await superadminApi.updatePlan(data as Plan);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(`"${updated.name}" tarifi muvaffaqiyatli yangilandi!`);
    } else {
      // Create new plan
      const created = await superadminApi.createPlan(data as CreatePlanInput);
      setPlans((prev) => [...prev, created]);
      toast.success(`"${created.name}" yangi tarifi muvaffaqiyatli qo‘shildi!`);
    }
    const updatedLogs = await superadminApi.getSystemLogs();
    setLogs(updatedLogs);
    closePlanModal();
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    await superadminApi.deletePlan(planId);
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    const updatedLogs = await superadminApi.getSystemLogs();
    setLogs(updatedLogs);
    toast.warn(`"${planName}" tarifi tizimdan o‘chirildi.`);
  };

  return {
    activeTab,
    setActiveTab,
    kpis,
    tenants: filteredTenants,
    allTenants: tenants,
    tenantCounts,
    plans,
    invoices,
    logs,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isCreateModalOpen,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    selectedPlan,
    isPlanModalOpen,
    openCreatePlanModal,
    openEditPlanModal,
    closePlanModal,
    handleSavePlan,
    handleDeletePlan,
    handleCreateTenant,
    handleToggleBlock,
    handleImpersonate,
  };
}
