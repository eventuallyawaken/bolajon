import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { KindergartenSettings } from '../types';
import { settingsApi } from '../api';
import type { BranchItem, CreateBranchInput } from '@/features/branches/types';
import { branchesApi } from '@/features/branches/api';
import { BranchesSettingsSection } from '../components/BranchesSettingsSection';
import { UserProfileSettingsSection } from '../components/UserProfileSettingsSection';
import { CreateBranchModal } from '@/features/branches/components/CreateBranchModal';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { Button } from '@/shared/ui/Button';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<KindergartenSettings | null>(null);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isDirectorOrAdmin = !user?.role || ['direktor', 'director', 'superadmin', 'admin'].includes(user.role.toLowerCase());

  useEffect(() => {
    Promise.all([settingsApi.getSettings(), branchesApi.getBranches()]).then(
      ([settingsData, branchesData]) => {
        setSettings(settingsData);
        setBranches(branchesData);
        setIsLoading(false);
      }
    );
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await settingsApi.updateSettings(settings);
    toast.success('Bog‘cha asosiy sozlamalari muvaffaqiyatli saqlandi!');
  };

  const handleCreateBranch = async (input: CreateBranchInput) => {
    const created = await branchesApi.createBranch(input);
    setBranches((prev) => [...prev, created]);
    setIsBranchModalOpen(false);
    toast.success(`"${created.name}" filiali muvaffaqiyatli qo‘shildi!`);
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" filialini o‘chirishni tasdiqlaysizmi?`)) return;
    await branchesApi.deleteBranch(id);
    setBranches((prev) => prev.filter((b) => b.id !== id));
    toast.warn(`"${name}" filiali o‘chirildi.`);
  };

  if (isLoading && isDirectorOrAdmin && !settings) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">Sozlamalar yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Har bitta profil egasi uchun shaxsiy profil va login/parol sozlamalari */}
      <UserProfileSettingsSection />

      {/* 2. Bog‘cha asosiy sozlamalari (Faqat rahbar/direktor uchun) */}
      {isDirectorOrAdmin && settings && (
        <>
          <div className="card" style={{ padding: '18px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  🏢 Bog‘cha asosiy sozlamalari
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                  Tashkilot rekvizitlari, oylik to‘lov stavkalari va tarmoq filiallari boshqaruvi
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBranchModalOpen(true)}
                >
                  + Yangi filial qo‘shish
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={(e) => handleSaveSettings(e)}
                >
                  Sozlamalarni saqlash
                </Button>
              </div>
            </div>
          </div>

          {/* 3 Main Settings Cards */}
          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {/* Tashkilot rekvizitlari */}
              <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  🏢 Tashkilot ma’lumotlari
                </h3>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Bog‘cha (Tashkilot) nomi
                  </label>
                  <input
                    type="text"
                    className="branch-select"
                    style={{ width: '100%', height: 40 }}
                    value={settings.orgName}
                    onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      STIR (INN)
                    </label>
                    <input
                      type="text"
                      className="branch-select"
                      style={{ width: '100%', height: 40 }}
                      value={settings.stir}
                      onChange={(e) => setSettings({ ...settings, stir: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      Rahbar (Direktor)
                    </label>
                    <input
                      type="text"
                      className="branch-select"
                      style={{ width: '100%', height: 40 }}
                      value={settings.directorName}
                      onChange={(e) => setSettings({ ...settings, directorName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Bog‘cha manzili
                  </label>
                  <input
                    type="text"
                    className="branch-select"
                    style={{ width: '100%', height: 40 }}
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Bank va To'lov sozlamalari */}
              <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  💳 Bank rekvizitlari va Tarif
                </h3>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Oylik bog‘cha to‘lovi (bola boshiga so‘mda)
                  </label>
                  <input
                    type="number"
                    className="branch-select"
                    style={{ width: '100%', height: 40 }}
                    value={settings.monthlyFee}
                    onChange={(e) => setSettings({ ...settings, monthlyFee: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Hisob raqam (20 xonali)
                  </label>
                  <input
                    type="text"
                    className="branch-select"
                    style={{ width: '100%', height: 40 }}
                    value={settings.bankAccount}
                    onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      MFO
                    </label>
                    <input
                      type="text"
                      className="branch-select"
                      style={{ width: '100%', height: 40 }}
                      value={settings.mfo}
                      onChange={(e) => setSettings({ ...settings, mfo: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      Xizmat ko‘rsatuvchi bank
                    </label>
                    <input
                      type="text"
                      className="branch-select"
                      style={{ width: '100%', height: 40 }}
                      value={settings.bankName}
                      onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Xabarnomalar va Tibbiy nazorat */}
              <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  🔔 Avtomatlashtirish va SMS
                </h3>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    checked={settings.smsNotificationsEnabled}
                    onChange={(e) => setSettings({ ...settings, smsNotificationsEnabled: e.target.checked })}
                  />
                  Ota-onalarga kunlik keldi/ketdi SMS xabarnomasi
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    checked={settings.autoRemindDebtors}
                    onChange={(e) => setSettings({ ...settings, autoRemindDebtors: e.target.checked })}
                  />
                  Har oyning 5-sanasida qarzdorlik bo‘yicha avtomatik eslatma
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    checked={settings.morningCheckStrict}
                    onChange={(e) => setSettings({ ...settings, morningCheckStrict: e.target.checked })}
                  />
                  Ertalabki tibbiy nazorat (harorat 37.2°C dan oshsa ogohlantirish)
                </label>
              </div>
            </div>
          </form>

          {/* 4th Section: Filiallar boshqaruvi va Yangi filial qo'shish */}
          <BranchesSettingsSection
            branches={branches}
            onOpenAddModal={() => setIsBranchModalOpen(true)}
            onDeleteBranch={handleDeleteBranch}
          />
        </>
      )}

      {/* Create Branch Modal */}
      <CreateBranchModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        onSubmit={handleCreateBranch}
      />
    </div>
  );
};

export default SettingsPage;
