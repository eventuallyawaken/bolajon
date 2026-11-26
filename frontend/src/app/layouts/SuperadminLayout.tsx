import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSuperadminContext } from '@/features/superadmin/context/SuperadminContext';
import type { SuperadminTab } from '@/features/superadmin/types';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useNotificationStore } from '@/shared/store/useNotificationStore';
import { NotificationDropdown } from '@/shared/ui/NotificationDropdown';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';

interface SuperadminLayoutProps {
  children?: React.ReactNode;
}

export const SuperadminLayout: React.FC<SuperadminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unreadCount, isOpen: isNotifOpen, setIsOpen: setIsNotifOpen } = useNotificationStore();
  const {
    activeTab,
    setActiveTab,
    tenantCounts,
    openCreateModal,
    openCreatePlanModal,
    searchQuery,
    setSearchQuery,
  } = useSuperadminContext();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleTabChange = (tab: SuperadminTab) => {
    setIsMobileSidebarOpen(false);
    setActiveTab(tab);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'tenants':
        return 'Ulangan bog‘chalar (Tenantlar)';
      case 'plans':
        return 'SaaS Obuna tariflari';
      case 'invoices':
        return 'To‘lovlar tarixi (Billing)';
      case 'logs':
        return 'Tizim loglari va monitoring';
      default:
        return 'SaaS Platforma boshqaruvi';
    }
  };

  return (
    <div className="app-shell">
      {/* Mobile sidebar overlay */}
      <div
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'active' : ''}`}
        id="sidebarOverlay"
        onClick={() => setIsMobileSidebarOpen(false)}
      ></div>

      {/* ================= SUPERADMIN SIDEBAR ================= */}
      <aside className={`sidebar ${isMobileSidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <div
            className="brand-mark"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div className="brand-info">
            <span className="brand-name">Bolajon SaaS</span>
            <span className="superadmin-brand-tag">Superadmin Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Superadmin navigatsiya">
          <div>
            <div className="nav-section-title">Platforma</div>
            <ul className="nav-list">
              <li>
                <button
                  type="button"
                  className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => handleTabChange('overview')}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="9" rx="2"></rect>
                    <rect x="14" y="3" width="7" height="5" rx="2"></rect>
                    <rect x="14" y="12" width="7" height="9" rx="2"></rect>
                    <rect x="3" y="16" width="7" height="5" rx="2"></rect>
                  </svg>
                  Platforma tahlili
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-item ${activeTab === 'tenants' ? 'active' : ''}`}
                  onClick={() => handleTabChange('tenants')}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21h18"></path>
                    <path d="M5 21V7l8-4v18"></path>
                    <path d="M19 21V11l-6-4"></path>
                  </svg>
                  Bog‘chalar (Tenantlar)
                  <span
                    className="nav-badge"
                    style={{ background: 'var(--brand-soft)', color: 'var(--brand-primary)' }}
                  >
                    {tenantCounts.all}
                  </span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`}
                  onClick={() => handleTabChange('plans')}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                  Obuna tariflari
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
                  onClick={() => handleTabChange('invoices')}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20"></path>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  To‘lovlar tarixi (Billing)
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
                  onClick={() => handleTabChange('logs')}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="4 17 10 11 4 5"></polyline>
                    <line x1="12" y1="19" x2="20" y2="19"></line>
                  </svg>
                  Tizim loglari va monitoring
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="nav-section-title">Tezkor o‘tish</div>
            <ul className="nav-list">
              <li>
                <Link to="/dashboard" className="nav-item" title="Demo bog‘cha ERP ga kirish">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  Bog‘cha ERP paneli
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="nav-item"
                  onClick={() => toast.info('Sitemap xaritasi tez orada ishga tushiriladi.')}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Sitemap xaritasi
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar" style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
              SA
            </div>
            <div className="profile-meta">
              <span className="profile-name">{user?.fullName || 'Bobur Alimov'}</span>
              <span className="profile-role">Superadmin (Platforma egasi)</span>
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
      </aside>

      {/* ================= MAIN WRAPPER ================= */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle"
              id="menuToggle"
              aria-label="Menyuni ochish"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>

          <div className="topbar-right">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="search"
                placeholder="Bog‘cha nomi yoki STIR qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Language & Theme Controls */}
            <LanguageSelector />
            <ThemeToggle />

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-icon notif-btn"
                aria-label="Bildirishnomalar"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
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

            {activeTab === 'plans' ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreatePlanModal}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Tarif qo‘shish
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreateModal}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Yangi bog‘cha ulash
              </button>
            )}
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default SuperadminLayout;
