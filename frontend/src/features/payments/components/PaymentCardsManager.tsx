import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Modal } from '@/shared/ui/Modal';
import { useT } from '@/shared/i18n';
import type { CreatePaymentCardInput, PaymentCard, PaymentCardType } from '../types';

interface PaymentCardsManagerProps {
  cards: PaymentCard[];
  onCreate: (input: CreatePaymentCardInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<CreatePaymentCardInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const CARD_TYPE_META: Record<PaymentCardType, { label: string; bg: string; color: string }> = {
  uzcard: { label: 'UZCARD', bg: '#eff6ff', color: '#1d4ed8' },
  humo: { label: 'HUMO', bg: '#fff7ed', color: '#c2410c' },
  visa: { label: 'VISA', bg: '#eef2ff', color: '#4338ca' },
  mastercard: { label: 'MASTERCARD', bg: '#fef2f2', color: '#b91c1c' },
  other: { label: 'KARTA', bg: '#f1f5f9', color: '#334155' },
};

const EMPTY_FORM: CreatePaymentCardInput = {
  cardType: 'uzcard',
  bankName: '',
  cardNumber: '',
  cardHolder: '',
  note: '',
  isActive: true,
};

export const PaymentCardsManager: React.FC<PaymentCardsManagerProps> = ({
  cards,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const { t } = useT();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);
  const [form, setForm] = useState<CreatePaymentCardInput>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = () => {
    setEditingCard(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (card: PaymentCard) => {
    setEditingCard(card);
    setForm({
      cardType: card.cardType,
      bankName: card.bankName,
      cardNumber: card.cardNumber,
      cardHolder: card.cardHolder,
      note: card.note || '',
      isActive: card.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bankName.trim() || !form.cardNumber.trim() || !form.cardHolder.trim()) {
      toast.error('Bank nomi, karta raqami va karta egasini kiriting');
      return;
    }
    try {
      setIsSaving(true);
      if (editingCard) {
        await onUpdate(editingCard.id, form);
      } else {
        await onCreate(form);
      }
      setIsFormOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('cards.title')}
            </h3>
            <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: 12.5 }}>
              {t('cards.subtitle')}
            </p>
          </div>
          <Button type="button" variant="primary" size="sm" onClick={openAdd}>
            + {t('cards.addBtn')}
          </Button>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p className="text-muted" style={{ margin: 0 }}>
            {t('cards.empty')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {cards.map((card) => {
            const meta = CARD_TYPE_META[card.cardType] || CARD_TYPE_META.other;
            return (
              <div
                key={card.id}
                className="card"
                style={{
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  opacity: card.isActive ? 1 : 0.65,
                  borderTop: `3px solid ${card.isActive ? 'var(--brand-primary)' : '#94a3b8'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      padding: '3px 9px',
                      borderRadius: 6,
                      background: meta.bg,
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                  <Badge variant={card.isActive ? 'success' : 'default'}>
                    {card.isActive ? t('common.active') : t('cards.paused')}
                  </Badge>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {card.bankName}
                  </div>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      letterSpacing: '0.04em',
                      marginTop: 4,
                    }}
                  >
                    {card.cardNumber}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {card.cardHolder}
                  </div>
                  {card.note && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>
                      {card.note}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(card)}
                  >
                    {t('cards.edit')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void onUpdate(card.id, { isActive: !card.isActive })}
                  >
                    {card.isActive ? t('cards.disable') : t('cards.enable')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    style={{ color: 'var(--danger-text)', marginLeft: 'auto' }}
                    onClick={() => {
                      if (window.confirm(`"${card.bankName} — ${card.cardNumber}" kartasini o‘chirasizmi?`)) {
                        void onDelete(card.id);
                      }
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCard ? t('cards.editTitle') : t('cards.addTitle')}
        size="md"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-grid-2">
            <div>
              <label className="form-label">{t('cards.typeLabel')}</label>
              <select
                className="form-select"
                value={form.cardType}
                onChange={(e) => setForm({ ...form, cardType: e.target.value as PaymentCardType })}
              >
                <option value="uzcard">UZCARD</option>
                <option value="humo">HUMO</option>
                <option value="visa">VISA</option>
                <option value="mastercard">MASTERCARD</option>
                <option value="other">Boshqa karta</option>
              </select>
            </div>

            <div>
              <label className="form-label">{t('cards.bankLabel')} *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Masalan: Kapitalbank / TBC"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">{t('cards.numberLabel')} *</label>
            <input
              type="text"
              className="form-input tabular-nums"
              placeholder="8600 1234 5678 9012"
              value={form.cardNumber}
              onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="form-label">{t('cards.holderLabel')} *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masalan: NODIRA ALIYEVA / BOLAJON MCHJ"
              value={form.cardHolder}
              onChange={(e) => setForm({ ...form, cardHolder: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="form-label">{t('cards.noteLabel')}</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masalan: Izohga bola ismini yozib o‘tkazing"
              value={form.note || ''}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            {t('cards.activeCheckbox')}
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
