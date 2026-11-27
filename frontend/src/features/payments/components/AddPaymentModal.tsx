import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { groupsApi } from '@/features/groups/api';
import { childrenApi } from '@/features/children/api';
import type { KindergartenGroup } from '@/features/groups/types';
import type { Child } from '@/features/children/types';
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
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [groups, setGroups] = useState<KindergartenGroup[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [childName, setChildName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [amount, setAmount] = useState(1800000);
  const [month, setMonth] = useState('Noyabr 2026');
  const [method, setMethod] = useState<PaymentMethod>('Payme');
  const [receiptNumber, setReceiptNumber] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([childrenApi.getChildren(), groupsApi.getGroups()]).then(([kids, grps]) => {
      setChildrenList(kids);
      setGroups(grps);
      if (kids.length > 0 && !selectedChildId) {
        const first = kids[0];
        setSelectedChildId(first.id);
        setChildName(first.fullName);
        setGroupName(first.groupName);
        const numericFee = Number(String(first.monthlyFee).replace(/[^\d]/g, ''));
        if (numericFee > 0) setAmount(numericFee);
      } else if (grps.length > 0 && !groupName) {
        setGroupName(grps[0].name);
      }
    });
  }, [isOpen, selectedChildId, groupName]);

  const handleSelectChild = (id: string) => {
    setSelectedChildId(id);
    const found = childrenList.find((c) => c.id === id);
    if (found) {
      setChildName(found.fullName);
      setGroupName(found.groupName);
      const numericFee = Number(String(found.monthlyFee).replace(/[^\d]/g, ''));
      if (numericFee > 0) setAmount(numericFee);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) {
      alert('Iltimos, bolani tanlang yoki ism-sharifini kiriting.');
      return;
    }
    onSubmit({
      ...(selectedChildId ? { childId: selectedChildId } : {}),
      childName: childName.trim(),
      groupName: groupName || groups[0]?.name || '',
      amount: Number(amount) || 0,
      month,
      method,
      receiptNumber: receiptNumber.trim() || undefined,
    });
    setReceiptNumber('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="To‘lov qabul qilish (Kirim)" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Tarbiyalanuvchi (Bola) *
          </label>
          {childrenList.length > 0 ? (
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={selectedChildId}
              onChange={(e) => handleSelectChild(e.target.value)}
            >
              {childrenList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.groupName}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              placeholder="Masalan: Ali Vohidov"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              required
            />
          )}
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
              {groups.length === 0 ? (
                <option value={groupName}>{groupName || 'Guruh mavjud emas'}</option>
              ) : (
                groups.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))
              )}
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
