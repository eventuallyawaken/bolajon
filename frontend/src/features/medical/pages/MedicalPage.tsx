import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { medicalApi } from '../api';
import type {
  MedicalChildSummary,
  MedicalOverviewData,
  MedicalRecordType,
  MenuAllergyAlertItem,
} from '../types';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useT } from '@/shared/i18n';

const RECORD_TYPE_META: Record<MedicalRecordType, { label: string; variant: 'info' | 'success' | 'danger' }> = {
  checkup: { label: 'Tibbiy ko‘rik', variant: 'info' },
  vaccination: { label: 'Emlash', variant: 'success' },
  illness: { label: 'Kasallik / Karantin', variant: 'danger' },
};

export const MedicalPage: React.FC = () => {
  const { t } = useT();
  const [overview, setOverview] = useState<MedicalOverviewData | null>(null);
  const [menuAllergies, setMenuAllergies] = useState<MenuAllergyAlertItem[]>([]);
  const [activeTab, setActiveTab] = useState<'journal' | 'allergies' | 'menu'>('journal');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add Medical Record Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formChildId, setFormChildId] = useState('');
  const [formType, setFormType] = useState<MedicalRecordType>('checkup');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  // Edit Child Allergy/Medical Notes Modal
  const [editingChild, setEditingChild] = useState<MedicalChildSummary | null>(null);
  const [editAllergies, setEditAllergies] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingChild, setIsSavingChild] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [ov, menu] = await Promise.all([
        medicalApi.getOverview(),
        medicalApi.getMenuAllergies(),
      ]);
      setOverview(ov);
      setMenuAllergies(menu);
      if (ov.childrenList.length > 0 && !formChildId) {
        setFormChildId(ov.childrenList[0].id);
      }
    } catch {
      toast.error('Tibbiy nazorat ma’lumotlarini yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  }, [formChildId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleOpenAddForChild = (childId: string, presetType: MedicalRecordType = 'checkup') => {
    setFormChildId(childId);
    setFormType(presetType);
    setFormDesc('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setIsAddModalOpen(true);
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formChildId || formDesc.trim().length < 3) return;
    try {
      setIsSavingRecord(true);
      await medicalApi.createRecord({
        childId: formChildId,
        recordType: formType,
        description: formDesc.trim(),
        checkedAt: formDate,
      });
      toast.success('Tibbiy qaydnoma saqlandi va ota-onaga bildirishnoma yuborildi!');
      setIsAddModalOpen(false);
      setFormDesc('');
      await loadData();
    } catch {
      toast.error('Tibbiy qaydnoma saqlashda xatolik');
    } finally {
      setIsSavingRecord(false);
    }
  };

  const openEditChild = (c: MedicalChildSummary) => {
    setEditingChild(c);
    setEditAllergies(c.allergies || '');
    setEditNotes(c.medicalNotes || '');
  };

  const handleSaveChildMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChild) return;
    try {
      setIsSavingChild(true);
      await medicalApi.updateChildMedical(editingChild.id, {
        allergies: editAllergies.trim() || null,
        medicalNotes: editNotes.trim() || null,
      });
      toast.success(`"${editingChild.fullName}" tibbiy kartasi yangilandi!`);
      setEditingChild(null);
      await loadData();
    } catch {
      toast.error('Tibbiy kartani yangilashda xatolik');
    } finally {
      setIsSavingChild(false);
    }
  };

  if (isLoading || !overview) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">{t('common.loading')}</div>
      </div>
    );
  }

  const filteredRecords = overview.recentRecords.filter(
    (r) => filterType === 'all' || r.recordType === filterType
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Action Header */}
      <div className="card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('medical.title')}
            </h2>
            <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: 13 }}>
              {t('medical.subtitle')} — {overview.todayDate}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/attendance" className="btn btn-secondary btn-sm">
              {t('medical.openFilter')}
            </Link>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={overview.childrenList.length === 0}
              onClick={() => handleOpenAddForChild(overview.childrenList[0]?.id || '', 'checkup')}
            >
              + {t('medical.addRecord')}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 18 }}>
          <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>{t('medical.kpiChecked')}</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand-primary)', marginTop: 4 }}>
            {overview.kpis.checkedTodayCount} / {overview.kpis.totalChildren}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>Bugungi ertalabki filtr</div>
        </div>

        <div className="card" style={{ padding: 18, borderLeft: overview.kpis.flaggedCount > 0 ? '4px solid #ef4444' : undefined }}>
          <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>{t('medical.kpiFlagged')}</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: overview.kpis.flaggedCount > 0 ? '#ef4444' : '#16a34a', marginTop: 4 }}>
            {overview.kpis.flaggedCount} ta
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>37.2°C+ yoki shikoyatlar</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>{t('medical.kpiAllergies')}</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#d97706', marginTop: 4 }}>
            {overview.kpis.allergyChildrenCount} ta
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>Maxsus parhez nazorati</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>{t('medical.kpiRecords')}</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            {overview.kpis.recordsTotalCount} ta
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>Ko‘rik, emlash va tarix</div>
        </div>
      </div>

      {/* Flagged Today Section */}
      {overview.flaggedAttendances.length > 0 && (
        <div className="card" style={{ padding: 18, borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#b91c1c' }}>
              Bugungi tibbiy e’tibor talab bolalar ({overview.flaggedAttendances.length})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {overview.flaggedAttendances.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{item.childName}</strong>
                  <Badge variant="danger">{item.temperature}°C</Badge>
                </div>
                <div style={{ fontSize: 12, color: '#7f1d1d' }}>
                  {item.groupName} • Holat: {item.healthStatus}
                </div>
                {item.notes && <div style={{ fontSize: 12, color: '#991b1b' }}>Izoh: {item.notes}</div>}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  style={{ marginTop: 4 }}
                  onClick={() => handleOpenAddForChild(item.childId, 'illness')}
                >
                  Tibbiy qaydnoma yozish
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="filter-group">
        <button
          type="button"
          className={`chip ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
        >
          {t('medical.tabJournal')} ({overview.recentRecords.length})
        </button>
        <button
          type="button"
          className={`chip ${activeTab === 'allergies' ? 'active' : ''}`}
          onClick={() => setActiveTab('allergies')}
        >
          {t('medical.tabAllergies')} ({overview.childrenList.length})
        </button>
        <button
          type="button"
          className={`chip ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          {t('medical.tabMenu')} ({menuAllergies.length})
        </button>
      </div>

      {/* Tab 1: Medical Journal */}
      {activeTab === 'journal' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 className="card-title">{t('medical.journalTitle')}</h3>
              <span className="card-subtitle">Har bir yozuv saqlanganda bolaning ota-onasiga xabar boradi</span>
            </div>
            <div className="filter-group">
              {(['all', 'checkup', 'vaccination', 'illness'] as const).map((tKey) => (
                <button
                  key={tKey}
                  type="button"
                  className={`chip ${filterType === tKey ? 'active' : ''}`}
                  onClick={() => setFilterType(tKey)}
                >
                  {tKey === 'all' ? t('common.all') : RECORD_TYPE_META[tKey].label}
                </button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Tarbiyalanuvchi</th>
                  <th>Turi</th>
                  <th>Tavsif / Xulosa</th>
                  <th>Kiritgan xodim</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 32 }} className="text-muted">
                      Hozircha tibbiy qaydnomalar kiritilmagan.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const meta = RECORD_TYPE_META[rec.recordType] || RECORD_TYPE_META.checkup;
                    return (
                      <tr key={rec.id}>
                        <td className="tabular-nums text-secondary">{rec.checkedAt}</td>
                        <td>
                          <div className="font-bold text-primary">{rec.childName}</div>
                          <span className="text-muted" style={{ fontSize: 11.5 }}>{rec.groupName}</span>
                        </td>
                        <td>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </td>
                        <td>{rec.description}</td>
                        <td className="text-secondary" style={{ fontSize: 12.5 }}>{rec.recordedByRole}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Children Allergies & Medical Passports */}
      {activeTab === 'allergies' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{t('medical.allergyPassportsTitle')}</h3>
              <span className="card-subtitle">Bolalarning allergiyalari va maxsus tibbiy eslatmalarini boshqarish</span>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tarbiyalanuvchi</th>
                  <th>Guruh</th>
                  <th>Allergiyalar</th>
                  <th>Tibbiy eslatma</th>
                  <th style={{ textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {overview.childrenList.map((c) => (
                  <tr key={c.id}>
                    <td className="font-bold text-primary">{c.fullName}</td>
                    <td>{c.groupName}</td>
                    <td>
                      {c.allergies ? (
                        <Badge variant="warning">{c.allergies}</Badge>
                      ) : (
                        <span className="text-muted" style={{ fontSize: 12 }}>Yo‘q</span>
                      )}
                    </td>
                    <td className="text-secondary" style={{ fontSize: 12.5 }}>
                      {c.medicalNotes || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <Button type="button" variant="secondary" size="sm" onClick={() => openEditChild(c)}>
                          Tahrirlash
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAddForChild(c.id, 'vaccination')}
                        >
                          + Emlash / Ko‘rik
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Menu Allergen Check */}
      {activeTab === 'menu' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{t('medical.menuControlTitle')}</h3>
              <span className="card-subtitle">Kunlik taomnoma tarkibi va allergiyasi bor bolalar kesishmasi</span>
            </div>
          </div>
          {menuAllergies.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center' }} className="text-muted">
              Hozircha kunlik taomnoma kiritilmagan.
            </div>
          ) : (
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
              {menuAllergies.map((meal) => (
                <div
                  key={meal.id}
                  style={{
                    border: `1px solid ${meal.matchedChildren.length > 0 ? '#fecaca' : 'var(--border-light)'}`,
                    background: meal.matchedChildren.length > 0 ? '#fffbeb' : 'var(--bg-canvas)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant="default">{meal.mealType}</Badge>
                    {meal.time && <span className="text-muted" style={{ fontSize: 12 }}>{meal.time}</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{meal.dishName}</div>
                  {meal.ingredients.length > 0 && (
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      Masalliqlar: {meal.ingredients.join(', ')}
                    </div>
                  )}
                  {meal.matchedChildren.length > 0 ? (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#b45309', fontWeight: 600 }}>
                      Diqqat! Allergiya mos keldi: {meal.matchedChildren.map((mc) => `${mc.fullName} (${mc.allergies})`).join(', ')}
                    </div>
                  ) : (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                      Allergik xavf aniqlanmadi
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Medical Record */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Yangi tibbiy qaydnoma qo‘shish"
        size="md"
      >
        <form onSubmit={handleCreateRecord} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Tarbiyalanuvchi *</label>
            <select
              className="form-select"
              value={formChildId}
              onChange={(e) => setFormChildId(e.target.value)}
              required
            >
              {overview.childrenList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.groupName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">Qaydnoma turi *</label>
              <select
                className="form-select"
                value={formType}
                onChange={(e) => setFormType(e.target.value as MedicalRecordType)}
              >
                <option value="checkup">Tibbiy ko‘rik</option>
                <option value="vaccination">Emlash (Vaksina)</option>
                <option value="illness">Kasallik / Karantin</option>
              </select>
            </div>
            <div>
              <label className="form-label">Sana</label>
              <input
                type="date"
                className="form-input"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Xulosa / Tavsif *</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Masalan: Rejali emlash (KPK) o‘tkazildi, bola ahvoli yaxshi"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              required
              minLength={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSavingRecord}>
              {isSavingRecord ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Child Allergies & Medical Notes */}
      <Modal
        isOpen={Boolean(editingChild)}
        onClose={() => setEditingChild(null)}
        title={`Tibbiy karta — ${editingChild?.fullName || ''}`}
        size="md"
      >
        <form onSubmit={handleSaveChildMedical} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Allergiyalar (vergul bilan ajrating)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masalan: Sut, Yong‘oq, Sitrus mevalar"
              value={editAllergies}
              onChange={(e) => setEditAllergies(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Shifokor / Hamshira eslatmasi</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Masalan: Surunkali kasalliklar yo‘q, dori vositalariga sezgirlik bor"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button type="button" variant="secondary" onClick={() => setEditingChild(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSavingChild}>
              {isSavingChild ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicalPage;
