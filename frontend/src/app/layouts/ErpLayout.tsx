import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { BranchItem } from '@/features/branches/types';
import { branchesApi } from '@/features/branches/api';
import { useAuthStore, normalizeRole } from '@/shared/store/useAuthStore';
import { useNotificationStore } from '@/shared/store/useNotificationStore';
import { notificationService } from '@/shared/services/notificationService';
import { NotificationDropdown } from '@/shared/ui/NotificationDropdown';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { UserAvatar } from '@/shared/ui/UserAvatar';
import { useT, type TranslationKey } from '@/shared/i18n';

interface ErpLayoutProps {
  children?: React.ReactNode;
}

const ROLE_DISPLAY_KEYS: Record<string, TranslationKey> = {
  director: 'role.director',
  teacher: 'role.teacher',
  accountant: 'role.accountant',
  nurse: 'role.nurse',
  superadmin: 'role.superadmin',
};

export const ErpLayout: React.FC<ErpLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useT();
  const {
    user,
    tenant,
    logout,
    activeBranchId,
    setActiveBranchId,
    superadminSession,
    exitImpersonation,
  } = useAuthStore();
  const { unreadCount, isOpen: isNotifOpen, setIsOpen: setIsNotifOpen, fetchNotifications } = useNotificationStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(activeBranchId || '');
  const [branches, setBranches] = useState<BranchItem[]>([]);

  const realRole = normalizeRole(user?.role);

  useEffect(() => {
    branchesApi.getBranches().then((list) => {
      setBranches(list);
      if (list[0]) {
        const branchToUse = activeBranchId || list[0].id;
        setSelectedBranch(branchToUse);
        if (!activeBranchId) setActiveBranchId(branchToUse);
      }
    });
    return branchesApi.subscribe(() => {
      branchesApi.getBranches().then(setBranches);
    });
  }, [activeBranchId, setActiveBranchId]);

  // Request browser notification permission upon site entry & start real-time monitoring
  useEffect(() => {
    notificationService.requestNotificationPermission();
    fetchNotifications(realRole);

    const interval = setInterval(() => {
      fetchNotifications(realRole);
    }, 30000);

    return () => clearInterval(interval);
  }, [realRole, fetchNotifications]);

  const currentPath = location.pathname;

  const getPageTitle = () => {
    switch (currentPath) {
      case '/dashboard': return t('title.dashboard');
      case '/children': return t('title.children');
      case '/groups': return t('title.groups');
      case '/attendance': return t('title.attendance');
      case '/medical': return t('title.medical');
      case '/payments': return t('title.payments');
      case '/expenses': return t('title.expenses');
      case '/warehouse': return t('title.warehouse');
      case '/staff': return t('title.staff');
      case '/branches': return t('title.branches');
      case '/settings': return t('title.settings');
      default: return 'Bolajon ERP';
    }
  };

  interface NavItem {
    to: string;
    label: string;
    badge?: string;
    roles: string[];
  }

  interface NavSection {
    section: string;
    roles: string[];
    items: NavItem[];
  }

  const allNavSections: NavSection[] = [
    {
      section: t('nav.section.main'),
      roles: ['director', 'teacher', 'accountant', 'nurse'],
      items: [
        { to: '/dashboard', label: t('nav.dashboard'), roles: ['director', 'accountant'] },
        { to: '/children', label: t('nav.children'), roles: ['director', 'teacher', 'nurse'] },
        { to: '/groups', label: t('nav.groups'), roles: ['director', 'teacher'] },
        { to: '/attendance', label: t('nav.attendance'), roles: ['director', 'teacher', 'nurse'] },
        { to: '/medical', label: t('nav.medical'), roles: ['director', 'nurse'] },
      ],
    },
    {
      section: t('nav.section.finance'),
      roles: ['director', 'accountant'],
      items: [
        { to: '/payments', label: t('nav.payments'), roles: ['director', 'accountant'] },
        { to: '/expenses', label: t('nav.expenses'), roles: ['director', 'accountant'] },
        { to: '/warehouse', label: t('nav.warehouse'), roles: ['director', 'accountant'] },
      ],
    },
    {
      section: t('nav.section.system'),
      roles: ['director', 'teacher', 'accountant', 'nurse'],
      items: [
        { to: '/staff', label: t('nav.staff'), roles: ['director'] },
        { to: '/branches', label: t('nav.branches'), roles: ['director'] },
        { to: '/settings', label: t('nav.settings'), roles: ['director', 'teacher', 'accountant', 'nurse'] },
      ],
    },
  ];

  const roleLabel = ROLE_DISPLAY_KEYS[realRole]
    ? t(ROLE_DISPLAY_KEYS[realRole])
    : user?.roleName || realRole.toUpperCase();

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${isMobileSidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2.5v2.5M12 19v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.5 12H5M19 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
            </svg>
          </div>
          <div className="brand-info">
            <span className="brand-name">Bolajon</span>
            <span className="brand-tag">Kindergarten ERP</span>
          </div>
        </div>

        {/* Filial tanlagich */}
        <div className="branch-switcher">
          <select
            className="branch-select"
            value={selectedBranch}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedBranch(val);
              setActiveBranchId(val);
              toast.info(`Filial: ${e.target.selectedOptions[0].text}`);
            }}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sidebar Navigatsiya */}
        <nav className="sidebar-nav">
          {allNavSections
            .filter((sec) => sec.roles.includes(realRole))
            .map((sec, idx) => {
              const visibleItems = sec.items.filter((item) => item.roles.includes(realRole));
              if (visibleItems.length === 0) return null;
              return (
                <div key={idx}>
                  <div className="nav-section-title">{sec.section}</div>
                  <ul className="nav-list">
                    {visibleItems.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className={`nav-item ${currentPath === item.to ? 'active' : ''}`}
                          onClick={() => setIsMobileSidebarOpen(false)}
                        >
                          {item.label}
                          {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </nav>

        {/* User Profile */}
        <div className="sidebar-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserAvatar fullName={user?.fullName} avatarUrl={user?.avatarUrl} size={38} />
              <div className="profile-meta">
                <span className="profile-name">{user?.fullName || 'Foydalanuvchi'}</span>
                <span className="profile-role">{roleLabel}</span>
              </div>
            </div>
            <button
              type="button"
              title={t('common.logout')}
              onClick={async () => {
                await logout();
                toast.info(t('common.loggedOut'));
                navigate('/login');
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '6px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="main-wrapper">
        {superadminSession && (
          <div
            style={{
              background: 'linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)',
              borderBottom: '1px solid #f59e0b',
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 13,
              color: '#92400e',
              fontWeight: 600,
            }}
          >
            <span>
              {t('topbar.impersonating', { name: tenant?.name || user?.tenantName || 'Bog‘cha' })}
            </span>
            <button
              type="button"
              onClick={() => {
                exitImpersonation();
                navigate('/superadmin');
              }}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                border: '1px solid #d97706',
                background: '#ffffff',
                color: '#b45309',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {t('topbar.returnSuperadmin')}
            </button>
          </div>
        )}
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>

          <div className="topbar-right">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="search" placeholder={t('common.search')} />
            </div>

            {/* Language & Theme Controls */}
            <LanguageSelector />
            <ThemeToggle />

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-icon notif-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                title={t('common.notifications')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: '#ef4444',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 2px #fff',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown />
            </div>

            {['director', 'teacher'].includes(realRole) && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/children')}
              >
                {t('topbar.admitChild')}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/settings')}
              title={`${user?.fullName || ''} — ${t('avatar.topbarTitle')}`}
              aria-label={t('avatar.topbarTitle')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                borderRadius: '9999px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserAvatar fullName={user?.fullName} avatarUrl={user?.avatarUrl} size={38} />
            </button>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default ErpLayout;
