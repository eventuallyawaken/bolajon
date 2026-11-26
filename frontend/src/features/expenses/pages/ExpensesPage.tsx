import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import type { ExpenseRecord, CashSummary, CreateExpenseInput } from '../types';
import { expensesApi } from '../api';
import { ExpensesTable } from '../components/ExpensesTable';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { Button } from '@/shared/ui/Button';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([expensesApi.getExpenses(), expensesApi.getCashSummary()]).then(([expList, summ]) => {
      setExpenses(expList);
      setSummary(summ);
      setIsLoading(false);
    });
  }, []);

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return expenses;
    return expenses.filter((e) => e.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const handleCreateExpense = async (input: CreateExpenseInput) => {
    const created = await expensesApi.createExpense(input);
    setExpenses((prev) => [created, ...prev]);
    expensesApi.getCashSummary().then(setSummary);
    setIsModalOpen(false);
    toast.success(`"${created.title}" xarajati ro‘yxatga olindi.`);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">Kassa va xarajatlar yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Cash Register Balances */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 18, borderLeft: '4px solid #10b981' }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>NAQD KASSA QOLDIG‘I</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {summary.cashBalance.toLocaleString()} so‘m
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
              Filial seyfidagi naqd mablag‘
            </div>
          </div>

          <div className="card" style={{ padding: 18, borderLeft: '4px solid #3b82f6' }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>BANK HISOB RAQAMIDAGI QOLDIQ</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>
              {summary.bankBalance.toLocaleString()} so‘m
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
              Asosiy hisob raqam
            </div>
          </div>

          <div className="card" style={{ padding: 18, borderLeft: '4px solid #ef4444' }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>SHU OYGI JAMI XARAJAT</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
              {summary.totalSpentThisMonth.toLocaleString()} so‘m
            </div>
            <div style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4 }}>
              Oziq-ovqat, maosh, kommunal
            </div>
          </div>
        </div>
      )}

      {/* Filter and Actions Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div className="filter-group">
            <button
              type="button"
              className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Barcha xarajatlar ({expenses.length})
            </button>
            <button
              type="button"
              className={`chip ${selectedCategory === 'Oziq-ovqat va oshxona' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Oziq-ovqat va oshxona')}
            >
              Oziq-ovqat
            </button>
            <button
              type="button"
              className={`chip ${selectedCategory === 'Xodimlar maoshi' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Xodimlar maoshi')}
            >
              Ish haqi
            </button>
            <button
              type="button"
              className={`chip ${selectedCategory === 'Kommunal to‘lovlar' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Kommunal to‘lovlar')}
            >
              Kommunal
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            + Yangi xarajat (Chiqim)
          </Button>
        </div>
      </div>

      {/* Expenses Table */}
      <ExpensesTable expenses={filteredExpenses} />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateExpense}
      />
    </div>
  );
};

export default ExpensesPage;
