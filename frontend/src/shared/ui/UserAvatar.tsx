import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  fullName?: string | null;
  avatarUrl?: string | null;
  size?: number;
  background?: string;
  color?: string;
  borderColor?: string;
  fontSize?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  fullName,
  avatarUrl,
  size = 38,
  background = 'var(--brand-soft, #f0fdfa)',
  color = 'var(--brand-primary, #0d9488)',
  borderColor = 'var(--brand-border, #ccfbf1)',
  fontSize,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const initials =
    fullName
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'BJ';

  const computedFontSize = fontSize ?? Math.max(11, Math.round(size * 0.36));

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '9999px',
        overflow: 'hidden',
        background,
        color,
        border: `1.5px solid ${borderColor}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: computedFontSize,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={fullName || 'Avatar'}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
