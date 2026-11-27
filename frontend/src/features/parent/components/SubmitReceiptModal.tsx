import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { AvatarValidationError, processReceiptFile } from '@/shared/lib/imageProcessor';
import { useT } from '@/shared/i18n';
import type { ParentPaymentCard, SubmitReceiptInput } from '../types';

interface SubmitReceiptModalProps {
  isOpen: boolean;
  childName: string;
  defaultAmount: number;
  cards: ParentPaymentCard[];
  onClose: () => void;
  onSubmit: (input: SubmitReceiptInput) => Promise<void>;
}

const UZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

function getDefaultPeriodDates(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDayNum = new Date(year, month + 1, 0).getDate();
  const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;
  return { start: firstDay, end: lastDay };
}

function formatPeriodSummary(start: string, end: string): string {
  if (!start || !end) return '';
  const d = new Date(`${start}T00:00:00`);
  if (Number.isNaN(d.getTime())) return `${start} — ${end}`;
  return `${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()} (${start} — ${end})`;
}

export const SubmitReceiptModal: React.FC<SubmitReceiptModalProps> = ({
  isOpen,
  childName,
  defaultAmount,
  cards,
  onClose,
  onSubmit,
}) => {
  const { t } = useT();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const defaults = getDefaultPeriodDates();

  const [selectedCardId, setSelectedCardId] = useState('');
  const [amount, setAmount] = useState(defaultAmount || 1800000);
  const [periodStart, setPeriodStart] = useState(defaults.start);
  const [periodEnd, setPeriodEnd] = useState(defaults.end);
  const [receiptImage, setReceiptImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAmount(defaultAmount || 1800000);
    setSelectedCardId((prev) =>
      prev && cards.some((c) => c.id === prev) ? prev : cards[0]?.id || ''
    );
    setReceiptImage('');
  }, [isOpen, defaultAmount, cards]);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const periodPreview = formatPeriodSummary(periodStart, periodEnd);

  const handleCopyCard = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    navigator.clipboard?.writeText(clean).then(
      () => toast.success('Karta raqami nusxalandi!'),
      () => toast.info(`Karta raqami: ${num}`)
    );
  };

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    try {
      setIsProcessing(true);
      const dataUrl = await processReceiptFile(file);
      setReceiptImage(dataUrl);
    } catch (err) {
      if (err instanceof AvatarValidationError) {
        toast.error(err.message);
      } else {
        toast.error('Chek rasmini yuklashda xatolik yuz berdi');
      }
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) {
      toast.error('To‘lov kartasi mavjud emas');
      return;
    }
    if (!receiptImage) {
      toast.error('Iltimos, to‘lov cheki rasmini yuklang');
      return;
    }
    if (periodEnd < periodStart) {
      toast.error('Tugash sanasi boshlanish sanasidan kichik bo‘lmasligi kerak');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        paymentCardId: selectedCard.id,
        amount: Number(amount) || 0,
        periodStart,
        periodEnd,
        month: periodPreview,
        receiptImage,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('parent.submitReceiptTitle')} — ${childName}`}
      size="md"
    >
      {cards.length === 0 ? (
        <div style={{ padding: '24px 8px', textAlign: 'center' }}>
          <p className="text-muted" style={{ margin: 0 }}>
            {t('parent.noActiveCards')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Active payment cards picker */}
          <div>
            <label className="form-label">{t('parent.selectCardLabel')} *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cards.map((c) => {
                const isSelected = c.id === selectedCard?.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCardId(c.id)}
                    style={{
                      border: `1.5px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                      background: isSelected ? 'var(--brand-soft)' : 'var(--bg-canvas)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary)' }}>
                          {c.cardType.toUpperCase()}
                        </span>
                        <strong style={{ fontSize: 13 }}>{c.bankName}</strong>
                      </div>
                      <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>
                        {c.cardNumber}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {c.cardHolder}{c.note ? ` • ${c.note}` : ''}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCard(c.cardNumber);
                      }}
                    >
                      {t('parent.copyCard')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dates range & auto-generated period */}
          <div className="form-grid-2">
            <div>
              <label className="form-label">{t('parent.periodStart')} *</label>
              <input
                type="date"
                className="form-input"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">{t('parent.periodEnd')} *</label>
              <input
                type="date"
                className="form-input"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">{t('parent.periodFormatted')}</label>
              <input
                type="text"
                className="form-input"
                value={periodPreview}
                readOnly
                style={{ background: 'var(--bg-canvas)', fontSize: 12.5 }}
              />
            </div>
            <div>
              <label className="form-label">{t('dash.colAmount')} ({t('common.currency')}) *</label>
              <input
                type="number"
                className="form-input tabular-nums"
                min={1000}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Drag & Drop / Browse receipt image */}
          <div>
            <label className="form-label">{t('parent.uploadReceiptImg')} *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />

            {receiptImage ? (
              <div
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 12,
                  padding: 12,
                  background: 'var(--bg-canvas)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <img
                  src={receiptImage}
                  alt="Yuklangan chek"
                  style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('parent.changeReceiptImg')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    style={{ color: 'var(--danger-text)' }}
                    onClick={() => setReceiptImage('')}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  void handleFile(e.dataTransfer.files?.[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? '#3b82f6' : 'var(--border-color)'}`,
                  background: isDragging ? 'rgba(59, 130, 246, 0.06)' : 'var(--bg-surface)',
                  borderRadius: 14,
                  padding: '22px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {isProcessing ? t('common.loading') : t('avatar.dragDrop')}
                </span>
                <span className="text-muted" style={{ fontSize: 12 }}>
                  JPG, PNG, WebP (maks. 8 MB)
                </span>
                <Button type="button" variant="primary" size="sm" style={{ marginTop: 4 }}>
                  {t('avatar.browse')}
                </Button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || isProcessing || !receiptImage}>
              {isSubmitting ? t('common.loading') : t('parent.sendReceiptBtn')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
