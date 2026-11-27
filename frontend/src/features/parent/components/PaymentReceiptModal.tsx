import React from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { useT } from '@/shared/i18n';
import type { ParentPaymentItem } from '../types';

interface PaymentReceiptModalProps {
  payment: ParentPaymentItem | null;
  branchName?: string;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  branchName,
  onClose,
}) => {
  const { t } = useT();

  return (
    <Modal
      isOpen={Boolean(payment)}
      onClose={onClose}
      title={t('parent.receiptTitle')}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={() => window.print()}>
            {t('parent.printReceipt')}
          </Button>
        </>
      }
    >
      {payment && (
        <div className="receipt-paper">
          <div className="receipt-header">
            <span className="receipt-title">Bolajon ERP</span>
            <span className="receipt-subtitle">{branchName || 'Maktabgacha ta’lim tashkiloti'}</span>
          </div>

          <div className="receipt-rows">
            <div className="receipt-row">
              <span className="receipt-row-label">Chek #</span>
              <span className="receipt-row-val tabular-nums">{payment.receiptNumber}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">{t('dash.colChild')}</span>
              <span className="receipt-row-val">{payment.childName}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">{t('role.parent')}</span>
              <span className="receipt-row-val">{payment.payerName}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">{t('sa.invoices.colDate')}</span>
              <span className="receipt-row-val tabular-nums">{payment.date}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Davr</span>
              <span className="receipt-row-val">{payment.month}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">{t('dash.colMethod')}</span>
              <span className="receipt-row-val">{payment.method}</span>
            </div>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-total">
            <span>{t('dash.colAmount')}</span>
            <span className="tabular-nums">
              {payment.amount.toLocaleString()} {t('common.currency')}
            </span>
          </div>

          <div className="receipt-footer-stamp">
            <span>Elektron kvitansiya</span>
            <span className="receipt-stamp-badge">
              {payment.status === 'PAID'
                ? t('sa.invoices.paid')
                : payment.status === 'PENDING'
                  ? t('parent.statusPending')
                  : payment.status === 'REJECTED'
                    ? t('parent.statusRejected')
                    : payment.status}
            </span>
          </div>

          {payment.rejectionReason && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 12px',
                borderRadius: 8,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: 12.5,
              }}
            >
              <strong>Qaytarish sababi:</strong> {payment.rejectionReason}
            </div>
          )}

          {payment.receiptImageUrl && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <img
                src={payment.receiptImageUrl}
                alt="Yuborilgan chek"
                style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, border: '1px solid var(--border-light)' }}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
