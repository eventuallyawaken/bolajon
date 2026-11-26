import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { BranchItem } from '@/features/branches/types';
import { branchesApi } from '@/features/branches/api';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useNotificationStore } from '@/shared/store/useNotificationStore';
import { notificationService } from '@/shared/services/notificationService';
import { NotificationDropdown } from '@/shared/ui/NotificationDropdown';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';

interface ErpLayoutProps {
  children?: React.ReactNode;
}

type UserRole = 'direktor' | 'tarbiyachi' | 'hisobchi' | 'hamshira';

const ROLES_INFO: Record<UserRole, { name: string; title: string; avatar: string }> = {
  direktor: { name: 'Dilnoza Murodova', title: 'Direktor (Chilonzor)', avatar: 'DM' },
  tarbiyachi: { name: 'Zilola Rahimova', title: 'Katta tarbiyachi', avatar: 'ZR' },
  hisobchi: { name: 'Nodira Aliyeva', title: 'Bosh hisobchi', avatar: 'NA' },
  hamshira: { name: 'Feruza Karimova', title: 'Hamshira (Tibbiyot)', avatar: 'FK' },
};

export const ErpLayout: React.FC<ErpLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, activeBranchId, setActiveBranchId } = useAuthStore();
  const { unreadCount, isOpen: isNotifOpen, setIsOpen: setIsNotifOpen, fetchNotifications } = useNotificationStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(activeBranchId || '');
  const [currentRole, setCurrentRole] = useState<UserRole>('direktor');
  const [branches, setBranches] = useState<BranchItem[]>([]);

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
    fetchNotifications(currentRole);

    const interval = setInterval(() => {
      fetchNotifications(currentRole);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentRole, fetchNotifications]);

  const currentPath = location.pathname;

  const getPageTitle = () => {
    switch (currentPath) {
      case '/dashboard': return 'Boshqaruv paneli';
      case '/children': return 'Tarbiyalanuvchilar (Bolalar)';
      case '/groups': return 'Guruhlar boshqaruvi';
      case '/attendance': return 'Davomat va Tibbiy filtr';
      case '/payments': return 'Ota-onalar to‘lovlari';
      case '/expenses': return 'Xarajatlar va kassa';
      case '/warehouse': return 'Ombor va Oshxona hisobi';
      case '/staff': return 'Xodimlar va tarbiyachilar';
      case '/branches': return 'Bog‘cha filiallari';
      case '/settings': return 'Tizim sozlamalari';
      default: return 'Bog‘cha ERP tizimi';
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
      section: 'Asosiy',
      roles: ['direktor', 'tarbiyachi', 'hisobchi', 'hamshira'],
      items: [
        { to: '/dashboard', label: 'Boshqaruv paneli', roles: ['direktor', 'tarbiyachi', 'hisobchi'] },
        { to: '/children', label: 'Tarbiyalanuvchilar', roles: ['direktor', 'tarbiyachi', 'hamshira'] },
        { to: '/groups', label: 'Guruhlar', roles: ['direktor', 'tarbiyachi'] },
        { to: '/attendance', label: 'Davomat va Tibbiy filtr', roles: ['direktor', 'tarbiyachi', 'hamshira'] },
      ],
    },
    {
      section: 'Moliya va Ombor',
      roles: ['direktor', 'hisobchi'],
      items: [
        { to: '/payments', label: 'To‘lovlar', roles: ['direktor', 'hisobchi'] },
        { to: '/expenses', label: 'Xarajatlar va kassa', roles: ['direktor', 'hisobchi'] },
        { to: '/warehouse', label: 'Ombor va Oshxona', roles: ['direktor', 'hisobchi'] },
      ],
    },
    {
      section: 'Boshqaruv va Tizim',
      roles: ['direktor', 'tarbiyachi', 'hisobchi', 'hamshira'],
      items: [
        { to: '/staff', label: 'Xodimlar', roles: ['direktor'] },
        { to: '/branches', label: 'Filiallar', roles: ['direktor'] },
        { to: '/settings', label: 'Sozlamalar', roles: ['direktor', 'tarbiyachi', 'hisobchi', 'hamshira'] },
      ],
    },
  ];

  const profile = ROLES_INFO[currentRole];

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
            .filter((sec) => sec.roles.includes(currentRole))
            .map((sec, idx) => {
              const visibleItems = sec.items.filter((item) => item.roles.includes(currentRole));
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

          <div>
            <div className="nav-section-title">Platforma</div>
            <ul className="nav-list">
              <li>
                <Link to="/superadmin" className="nav-item" style={{ color: '#b45309' }}>
                  ⚡ Superadmin portali
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Role Selector & Profile */}
        <div className="sidebar-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <select
            className="branch-select"
            style={{ fontSize: 11.5, height: 32, padding: '2px 8px' }}
            value={currentRole}
            onChange={(e) => {
              const r = e.target.value as UserRole;
              setCurrentRole(r);
              toast.info(`Rol almashtirildi: ${ROLES_INFO[r].title}`);
            }}
          >
            <option value="direktor">👑 Rol: Direktor (Barchasi)</option>
            <option value="tarbiyachi">👩‍🏫 Rol: Tarbiyachi</option>
            <option value="hisobchi">💼 Rol: Hisobchi</option>
            <option value="hamshira">🩺 Rol: Hamshira</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar">
                {user?.fullName ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : profile.avatar}
              </div>
              <div className="profile-meta">
                <span className="profile-name">{user?.fullName || profile.name}</span>
                <span className="profile-role">{user?.role ? user.role.toUpperCase() : profile.title}</span>
              </div>
            </div>
            <button
              type="button"
              title="Tizimdan chiqish"
              onClick={async () => {
                await logout();
                toast.info('Tizimdan chiqildi');
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
              <input type="search" placeholder="Qidirish..." />
            </div>

            {/* Language & Theme Controls */}
            <LanguageSelector />
            <ThemeToggle />

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-icon notif-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                title="Bildirishnomalar"
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

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/children')}
            >
              + Bola qabuli
            </button>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default ErpLayout;
