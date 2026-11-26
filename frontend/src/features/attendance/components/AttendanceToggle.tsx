import React from 'react';

interface AttendanceToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title?: string;
}

export const AttendanceToggle: React.FC<AttendanceToggleProps> = ({
  checked,
  onChange,
  title,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      title={title || (checked ? 'Keldi' : 'Kelmadi')}
      onClick={() => onChange(!checked)}
      style={{
        width: 56,
        height: 28,
        borderRadius: 9999,
        background: checked ? '#10b981' : '#334155',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px',
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        transition: 'background-color 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: checked
          ? '0 2px 6px rgba(16, 185, 129, 0.35)'
          : '0 2px 5px rgba(15, 23, 42, 0.25)',
        flexShrink: 0,
      }}
    >
      {/* Track Icon: Checkmark on the left when checked */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: checked ? 1 : 0,
          transform: checked ? 'scale(1)' : 'scale(0.5)',
          transition: 'all 0.18s ease',
          pointerEvents: 'none',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Track Icon: Cross on the right when unchecked */}
      <div
        style={{
          position: 'absolute',
          right: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: !checked ? 1 : 0,
          transform: !checked ? 'scale(1)' : 'scale(0.5)',
          transition: 'all 0.18s ease',
          pointerEvents: 'none',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>

      {/* Thumb Circle */}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: checked ? '#ffffff' : '#e2e8f0',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
          transform: checked ? 'translateX(28px)' : 'translateX(0px)',
          transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.22s ease',
        }}
      />
    </button>
  );
};
