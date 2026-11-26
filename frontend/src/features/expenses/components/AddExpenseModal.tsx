import React, { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import type { CreateExpenseInput, ExpenseCategory } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateExpenseInput) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Oziq-ovqat va oshxona');
  const [amount, setAmount] = useState(500000);
  const [recipient, setRecipient] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Naqd pul' | 'Bank hisobi' | 'Korporativ karta'>('Naqd pul');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !recipient.trim()) {
      alert('Iltimos, xarajat mazmuni va qabul qiluvchi shaxs/tashkilotni kiriting.');
      return;
    }
    onSubmit({
      title: title.trim(),
      category,
      amount: Number(amount) || 0,
      recipient: recipient.trim(),
      paymentMethod,
      notes: notes.trim() || undefined,
    });
    setTitle('');
    setRecipient('');
    setNotes('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi xarajat qo‘shish (Chiqim)" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Xarajat maqsadi *
          </label>
          <input
            type="text"
            className="branch-select"
            style={{ width: '100%', height: 40 }}
            placeholder="Masalan: Non va sut mahsulotlari uchun"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Kategoriya
            </label>
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              <option value="Oziq-ovqat va oshxona">Oziq-ovqat va oshxona</option>
              <option value="Xodimlar maoshi">Xodimlar maoshi</option>
              <option value="Kommunal to‘lovlar">Kommunal to‘lovlar</option>
              <option value="Xo‘jalik va gigiyena">Xo‘jalik va gigiyena</option>
              <option value="Ta’mirlash va inventar">Ta’mirlash va inventar</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              To‘lov usuli
            </label>
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as 'Naqd pul' | 'Bank hisobi' | 'Korporativ karta')
              }
            >
              <option value="Naqd pul">Naqd pul (Kassadan)</option>
              <option value="Bank hisobi">Bank hisobi (Hisob raqamdan)</option>
              <option value="Korporativ karta">Korporativ karta</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Summa (so‘m) *
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
              Qabul qiluvchi *
            </label>
            <input
              type="text"
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              placeholder="Kompaniya yoki shaxs"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Izoh yoki chek ma’lumotlari
          </label>
          <textarea
            className="branch-select"
            style={{ width: '100%', height: 60, padding: 8 }}
            placeholder="Qo‘shimcha tafsilotlar..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary">
            Chiqimni tasdiqlash
          </Button>
        </div>
      </form>
    </Modal>
  );
};
