import React from 'react';
import { useSuperadminContext } from '../context/SuperadminContext';
import { SaasKpiCards } from '../components/SaasKpiCards';
import { TenantsTable } from '../components/TenantsTable';
import { PlansSection } from '../components/PlansSection';
import { InvoicesTable } from '../components/InvoicesTable';
import { LogsSection } from '../components/LogsSection';
import { CreateTenantModal } from '../components/CreateTenantModal';
import { PlanModal } from '../components/PlanModal';
import { UserProfileSettingsSection } from '@/features/settings/components/UserProfileSettingsSection';

export const SuperadminPage: React.FC = () => {
  const {
    activeTab,
    kpis,
    tenants,
    tenantCounts,
    plans,
    invoices,
    logs,
    isLoading,
    statusFilter,
    setStatusFilter,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    handleCreateTenant,
    handleToggleBlock,
    handleDeleteTenant,
    handleImpersonate,
    selectedPlan,
    isPlanModalOpen,
    openCreatePlanModal,
    openEditPlanModal,
    closePlanModal,
    handleSavePlan,
    handleDeletePlan,
  } = useSuperadminContext();

  if (isLoading && !kpis) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">Platforma ma’lumotlari yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <>
      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SaasKpiCards kpis={kpis} />
          <TenantsTable
            tenants={tenants}
            tenantCounts={tenantCounts}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onImpersonate={handleImpersonate}
            onToggleBlock={handleToggleBlock}
            onDelete={handleDeleteTenant}
            onOpenCreateModal={openCreateModal}
          />
        </div>
      )}

      {/* Tenants tab */}
      {activeTab === 'tenants' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <TenantsTable
            tenants={tenants}
            tenantCounts={tenantCounts}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onImpersonate={handleImpersonate}
            onToggleBlock={handleToggleBlock}
            onDelete={handleDeleteTenant}
            onOpenCreateModal={openCreateModal}
          />
        </div>
      )}

      {/* Plans tab */}
      {activeTab === 'plans' && (
        <PlansSection
          plans={plans}
          onAddPlan={openCreatePlanModal}
          onEditPlan={openEditPlanModal}
          onDeletePlan={handleDeletePlan}
        />
      )}

      {/* Invoices tab */}
      {activeTab === 'invoices' && <InvoicesTable invoices={invoices} />}

      {/* Logs tab */}
      {activeTab === 'logs' && <LogsSection logs={logs} />}

      {/* Superadmin Profile & Avatar tab */}
      {activeTab === 'profile' && <UserProfileSettingsSection />}

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={isCreateModalOpen}
        plans={plans}
        onClose={closeCreateModal}
        onSubmit={handleCreateTenant}
      />

      {/* Create / Edit Plan Modal */}
      <PlanModal
        plan={selectedPlan}
        isOpen={isPlanModalOpen}
        onClose={closePlanModal}
        onSave={handleSavePlan}
      />
    </>
  );
};

export default SuperadminPage;
