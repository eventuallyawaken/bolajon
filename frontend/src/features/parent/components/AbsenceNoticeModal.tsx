import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { useT } from '@/shared/i18n';
import { parentApi } from '../api';

interface AbsenceNoticeModalProps {
  isOpen: boolean;
  childId: string;
  childName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AbsenceNoticeModal: React.FC<AbsenceNoticeModalProps> = ({
  isOpen,
  childId,
  childName,
  onClose,
  onSuccess,
}) => {
  const { t } = useT();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      toast.error(t('parent.absenceReason'));
      return;
    }

    try {
      setIsSubmitting(true);
      await parentApi.submitAbsenceNotice(childId, { date, reason: reason.trim() });
      toast.success(t('parent.absenceSuccess'));
      setReason('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xabarnoma yuborishda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={`${t('parent.sendAbsence')} — ${childName}`}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="absenceNoticeForm" variant="primary" disabled={isSubmitting}>
            {t('parent.absenceSubmit')}
          </Button>
        </>
      }
    >
      <form id="absenceNoticeForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">{t('parent.absenceDate')}</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('parent.absenceReason')}</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder={t('parent.absencePlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
};
