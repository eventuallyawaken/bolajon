import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useT } from '@/shared/i18n';
import type { PaymentRecord } from '../types';

interface PaymentReviewModalProps {
  payment: PaymentRecord | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export const PaymentReviewModal: React.FC<PaymentReviewModalProps> = ({
  payment,
  onClose,
  onApprove,
  onReject,
}) => {
  const { t } = useT();
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRejectMode(false);
    setReason('');
  }, [payment?.id]);

  if (!payment) return null;

  const isPending = payment.status === 'pending';

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await onApprove(payment.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 3) return;
    try {
      setIsSubmitting(true);
      await onReject(payment.id, reason.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(payment)}
      onClose={onClose}
      title={`${t('payments.reviewTitle')} — ${payment.receiptNumber}`}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            padding: 14,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
            fontSize: 13,
          }}
        >
          <div>
            <span className="text-muted" style={{ fontSize: 11.5 }}>Tarbiyalanuvchi</span>
            <div style={{ fontWeight: 700 }}>{payment.childName}</div>
            <div className="text-muted" style={{ fontSize: 11.5 }}>{payment.groupName}</div>
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: 11.5 }}>Summa va holat</span>
            <div style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: 15 }}>
              {payment.amount.toLocaleString()} {t('common.currency')}
            </div>
            <div style={{ marginTop: 2 }}>
              {payment.status === 'paid' && <Badge variant="success">Tasdiqlangan</Badge>}
              {payment.status === 'pending' && <Badge variant="warning">Tekshirilmoqda</Badge>}
              {payment.status === 'rejected' && <Badge variant="danger">Qaytarilgan</Badge>}
              {payment.status === 'overdue' && <Badge variant="danger">Qarzdorlik</Badge>}
            </div>
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: 11.5 }}>To‘lov davri</span>
            <div style={{ fontWeight: 600 }}>
              {payment.periodStart && payment.periodEnd
                ? `${payment.periodStart} — ${payment.periodEnd}`
                : payment.month}
            </div>
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: 11.5 }}>Ota-ona / Karta</span>
            <div style={{ fontWeight: 600 }}>{payment.parentName}</div>
            {payment.cardSnapshot && (
              <div className="text-muted" style={{ fontSize: 11.5 }}>
                {payment.cardSnapshot.bankName} ({payment.cardSnapshot.cardNumberMasked || payment.cardSnapshot.last4})
              </div>
            )}
          </div>
        </div>

        {payment.rejectionReason && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
            }}
          >
            <strong>Qaytarish sababi:</strong> {payment.rejectionReason}
          </div>
        )}

        {payment.receiptImageUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {t('payments.uploadedReceipt')}
            </span>
            <div
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 12,
                padding: 8,
                background: 'var(--bg-canvas)',
                textAlign: 'center',
                maxHeight: 340,
                overflow: 'auto',
              }}
            >
              <img
                src={payment.receiptImageUrl}
                alt="To'lov cheki"
                style={{ maxWidth: '100%', maxHeight: 310, borderRadius: 8, objectFit: 'contain' }}
              />
            </div>
          </div>
        ) : (
          <div className="text-muted" style={{ fontSize: 13, fontStyle: 'italic' }}>
            Kvitansiya rasmi ilova qilinmagan ({payment.method}).
          </div>
        )}

        {isPending && !rejectMode && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
            <Button
              type="button"
              variant="outline"
              style={{ color: 'var(--danger-text)', borderColor: '#fecaca' }}
              disabled={isSubmitting}
              onClick={() => setRejectMode(true)}
            >
              {t('payments.rejectBtn')}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isSubmitting}
              onClick={() => void handleApprove()}
            >
              {isSubmitting ? t('common.loading') : t('payments.approveBtn')}
            </Button>
          </div>
        )}

        {isPending && rejectMode && (
          <form onSubmit={handleReject} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="form-label">{t('payments.rejectReasonLabel')} *</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Masalan: Chekdagi summa noto‘g‘ri yoki rasm tiniq emas"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={3}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button type="button" variant="secondary" onClick={() => setRejectMode(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                disabled={isSubmitting || reason.trim().length < 3}
              >
                {t('payments.confirmReject')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
