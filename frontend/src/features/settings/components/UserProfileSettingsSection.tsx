import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { settingsApi } from '../api';
import { Button } from '@/shared/ui/Button';

export const UserProfileSettingsSection: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Login (telefon raqami) bo‘sh bo‘lishi mumkin emas!');
      return;
    }
    if (!fullName.trim()) {
      toast.error('Ism-familiya kiritilishi shart!');
      return;
    }

    try {
      setIsSavingProfile(true);
      const updated = await settingsApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      updateUser({ fullName: updated.fullName, phone: updated.phone });
      toast.success('Profil va login ma’lumotlari muvaffaqiyatli saqlandi!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Profilni yangilashda xatolik yuz berdi';
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Iltimos, amaldagi joriy parolingizni kiriting!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Yangi parol kamida 6 belgidan iborat bo‘lishi shart!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Yangi parol va tasdiqlovchi parol mos kelmadi!');
      return;
    }

    try {
      setIsSavingPassword(true);
      const res = await settingsApi.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success(res.message || 'Maxfiy parol muvaffaqiyatli yangilandi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Parolni yangilashda xatolik yuz berdi';
      toast.error(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'direktor':
      case 'director':
        return { label: 'Direktor (Rahbar)', color: '#0d9488', bg: '#ccfbf1' };
      case 'tarbiyachi':
      case 'teacher':
        return { label: 'Tarbiyachi', color: '#2563eb', bg: '#dbeafe' };
      case 'hisobchi':
      case 'accountant':
        return { label: 'Bosh Hisobchi', color: '#d97706', bg: '#fef3c7' };
      case 'hamshira':
      case 'nurse':
        return { label: 'Hamshira (Tibbiyot)', color: '#dc2626', bg: '#fee2e2' };
      case 'superadmin':
        return { label: 'SaaS Superadmin', color: '#7c3aed', bg: '#ede9fe' };
      default:
        return { label: role || 'Foydalanuvchi', color: '#475569', bg: '#f1f5f9' };
    }
  };

  const badge = getRoleBadge(user?.role);

  return (
    <div className="card" style={{ padding: 24, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>👤</span> Shaxsiy profil va Xavfsizlik sozlamalari
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>
            Har bir profil egasi o‘z login (telefon raqami) va maxfiy parolini erkin o‘zgartirishi mumkin
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tizimdagi rolingiz:</span>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              color: badge.color,
              background: badge.bg,
            }}
          >
            {badge.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Profile / Login Change Card */}
        <form
          onSubmit={handleUpdateProfile}
          style={{
            background: 'var(--bg-canvas)',
            padding: 20,
            borderRadius: 10,
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📱</span> Login va Shaxsiy ma’lumotlar
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
              F.I.O (To‘liq ism-sharif) *
            </label>
            <input
              type="text"
              className="branch-select"
              style={{ width: '100%', height: 40, background: 'var(--bg-surface)' }}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masalan: Dilnoza Murodova"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
              Login (Telefon raqam) *
            </label>
            <input
              type="text"
              className="branch-select"
              style={{ width: '100%', height: 40, background: 'var(--bg-surface)' }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              required
            />
            <span style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              ℹ️ Tizimga kirishda ushbu telefon raqam login sifatida ishlatiladi
            </span>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 6 }}>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSavingProfile}
              style={{ width: '100%', height: 38 }}
            >
              {isSavingProfile ? 'Saqlanmoqda...' : 'Login ma’lumotlarini saqlash'}
            </Button>
          </div>
        </form>

        {/* Password Change Card */}
        <form
          onSubmit={handleChangePassword}
          style={{
            background: 'var(--bg-canvas)',
            padding: 20,
            borderRadius: 10,
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔐</span> Maxfiy parolni o‘zgartirish
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
              Joriy maxfiy parol *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPass ? 'text' : 'password'}
                className="branch-select"
                style={{ width: '100%', height: 40, background: 'var(--bg-surface)', paddingRight: 38 }}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Amaldagi parolni kiriting"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#64748b',
                }}
                title={showCurrentPass ? 'Yashirish' : 'Ko‘rsatish'}
              >
                {showCurrentPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                Yangi parol *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  className="branch-select"
                  style={{ width: '100%', height: 40, background: 'var(--bg-surface)', paddingRight: 38 }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kamida 6 belgi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: '#64748b',
                  }}
                  title={showNewPass ? 'Yashirish' : 'Ko‘rsatish'}
                >
                  {showNewPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                Tasdiqlash *
              </label>
              <input
                type={showNewPass ? 'text' : 'password'}
                className="branch-select"
                style={{ width: '100%', height: 40, background: 'var(--bg-surface)' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Qayta kiriting"
                required
              />
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 6 }}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isSavingPassword}
              style={{ width: '100%', height: 38, borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}
            >
              {isSavingPassword ? 'Yangilanmoqda...' : 'Yangi parolni tasdiqlash'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
