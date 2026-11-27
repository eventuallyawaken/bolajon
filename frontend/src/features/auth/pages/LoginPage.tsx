import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore, getDefaultRouteForRole } from '@/shared/store/useAuthStore';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { useT } from '@/shared/i18n';

const SHOW_DEMO_ACCOUNTS =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === 'true';

const DEMO_ACCOUNTS = [
  { roleKey: 'role.superadmin' as const, icon: '👑', phone: '+998 90 000 00 01', color: '#6366f1' },
  { roleKey: 'role.director' as const, icon: '🏢', phone: '+998 90 123 45 66', color: '#0d9488' },
  { roleKey: 'role.teacher' as const, icon: '👩‍🏫', phone: '+998 90 234 11 22', color: '#0284c7' },
  { roleKey: 'role.accountant' as const, icon: '💼', phone: '+998 93 456 33 44', color: '#d97706' },
  { roleKey: 'role.nurse' as const, icon: '🩺', phone: '+998 97 567 44 55', color: '#059669' },
  { roleKey: 'role.parent' as const, icon: '👨‍👩‍👧', phone: '+998 90 777 88 99', color: '#db2777' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t } = useT();
  const [phone, setPhone] = useState(SHOW_DEMO_ACCOUNTS ? '+998 90 123 45 66' : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password) {
      toast.error(t('login.fillRequired'));
      return;
    }

    setLoading(true);
    const res = await login(phone.trim(), password);
    setLoading(false);

    if (res.success) {
      toast.success(t('login.welcome'));
      const role = res.role || useAuthStore.getState().user?.role;
      navigate(getDefaultRouteForRole(role), { replace: true });
    } else {
      toast.error(res.message || t('login.error'));
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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '24px' }}>
        <LanguageSelector />
      </div>
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
            {t('login.title')}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              {t('login.phone')}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 66"
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
              {t('login.password')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '11px 42px 11px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={t('login.show')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {showPassword ? t('login.hide') : t('login.show')}
              </button>
            </div>
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
            {loading ? t('login.checking') : t('login.submit')}
          </button>
        </form>

        {SHOW_DEMO_ACCOUNTS && (
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px dashed #e2e8f0' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '10px', textAlign: 'center' }}>
              ⚡ {t('login.demoTitle')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.phone}
                  type="button"
                  onClick={() => handleFillDemo(acc.phone)}
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
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{acc.icon} {t(acc.roleKey)}</span>
                  <span style={{ color: acc.color }}>{acc.phone}</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
              {t('login.demoPassNote')} <code>Password123!</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
