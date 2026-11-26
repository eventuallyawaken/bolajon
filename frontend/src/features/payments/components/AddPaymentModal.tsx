import React, { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import type { CreatePaymentInput, PaymentMethod } from '../types';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreatePaymentInput) => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [childName, setChildName] = useState('');
  const [groupName, setGroupName] = useState('Kichkintoylar guruhi');
  const [amount, setAmount] = useState(1800000);
  const [month, setMonth] = useState('Noyabr 2026');
  const [method, setMethod] = useState<PaymentMethod>('Payme');
  const [receiptNumber, setReceiptNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) {
      alert('Iltimos, bolaning ism-sharifini kiriting.');
      return;
    }
    onSubmit({
      childName: childName.trim(),
      groupName,
      amount: Number(amount) || 0,
      month,
      method,
      receiptNumber: receiptNumber.trim() || undefined,
    });
    setChildName('');
    setReceiptNumber('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="To‘lov qabul qilish (Kirim)" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Tarbiyalanuvchi (Bola) *
          </label>
          <input
            type="text"
            className="branch-select"
            style={{ width: '100%', height: 40 }}
            placeholder="Masalan: Ali Vohidov"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Guruhi
            </label>
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            >
              <option value="Kichkintoylar guruhi">Kichkintoylar guruhi</option>
              <option value="Qaldirg‘och guruhi">Qaldirg‘och guruhi</option>
              <option value="Zukko bolajonlar">Zukko bolajonlar</option>
              <option value="Yulduzcha guruhi">Yulduzcha guruhi</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Qaysi oy uchun
            </label>
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="Noyabr 2026">Noyabr 2026</option>
              <option value="Dekabr 2026">Dekabr 2026</option>
              <option value="Yanvar 2027">Yanvar 2027</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              To‘lov summasi (so‘m) *
            </label>
            <input
              type="number"
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              To‘lov turi
            </label>
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              <option value="Payme">Payme</option>
              <option value="Click">Click</option>
              <option value="Bank o‘tkazmasi">Bank o‘tkazmasi</option>
              <option value="Naqd kassa">Naqd kassa</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Kvitansiya / Chek raqami (ixtiyoriy)
          </label>
          <input
            type="text"
            className="branch-select"
            style={{ width: '100%', height: 40 }}
            placeholder="CHK-12345"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary">
            To‘lovni qabul qilish
          </Button>
        </div>
      </form>
    </Modal>
  );
};
