import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/shared/store/useNotificationStore';

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, isOpen, setIsOpen, markAsRead, markAllAsRead } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'danger':
        return { bg: '#fef2f2', border: '#fca5a5', text: '#ef4444', icon: '🚨' };
      case 'warning':
        return { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: '⚠️' };
      case 'success':
        return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: '✅' };
      default:
        return { bg: '#f0fdfa', border: '#99f6e4', text: '#0d9488', icon: 'ℹ️' };
    }
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '52px',
        right: '0',
        width: '380px',
        maxHeight: '480px',
        background: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
            Bildirishnomalar
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                background: '#ef4444',
                color: '#fff',
                padding: '2px 7px',
                borderRadius: '10px',
              }}
            >
              {unreadCount} yangi
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            style={{
              background: 'none',
              border: 'none',
              color: '#0d9488',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Barchasini o‘qish
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '36px 18px', textAlign: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🔔</span>
            <span style={{ fontSize: '13px' }}>Yangi bildirishnomalar mavjud emas</span>
          </div>
        ) : (
          notifications.map((n) => {
            const style = getTypeStyles(n.type);
            return (
              <div
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.link) {
                    navigate(n.link);
                    setIsOpen(false);
                  }
                }}
                style={{
                  padding: '12px 18px',
                  borderBottom: '1px solid #f8fafc',
                  background: n.isRead ? '#ffffff' : '#f0fdfa',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    fontSize: '18px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: style.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {style.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: '13px', fontWeight: n.isRead ? '600' : '700', color: '#0f172a' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {n.timeAgo}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#0d9488',
                      flexShrink: 0,
                      marginTop: '6px',
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
