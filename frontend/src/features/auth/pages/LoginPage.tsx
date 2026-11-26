import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/shared/store/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [phone, setPhone] = useState('+998 90 123 45 67');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error('Telefon raqam va parolni kiriting');
      return;
    }

    setLoading(true);
    const res = await login(phone, password);
    setLoading(false);

    if (res.success) {
      toast.success('Xush kelibsiz! Tizimga muvaffaqiyatli kirildi');
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'superadmin') {
        navigate('/superadmin');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(res.message || 'Kirishda xatolik yuz berdi');
    }
  };

  const handleFillDemo = (demoPhone: string) => {
    setPhone(demoPhone);
    setPassword('Password123!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        padding: '36px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
            Bolajon ERP
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Bog‘cha boshqaruvi va SaaS platformasiga kirish
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Telefon raqam
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Maxfiy parol
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: '#0d9488',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginTop: '6px'
            }}
          >
            {loading ? 'Tekshirilmoqda...' : 'Tizimga kirish'}
          </button>
        </form>

        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '10px', textAlign: 'center' }}>
            ⚡ Tezkor sinov hisoblari (1-bosishda to‘ldirish):
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleFillDemo('+998 90 123 45 67')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ fontWeight: '600', color: '#0f172a' }}>🏢 Bog‘cha Direktori</span>
              <span style={{ color: '#0d9488' }}>+998 90 123 45 67</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('+998 90 000 00 01')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ fontWeight: '600', color: '#0f172a' }}>👑 SaaS Superadmin</span>
              <span style={{ color: '#6366f1' }}>+998 90 000 00 01</span>
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
            Ikkala hisob uchun parol: <code>Password123!</code>
          </p>
        </div>
      </div>
    </div>
  );
};
