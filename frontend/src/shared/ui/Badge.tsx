import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default'
  | 'bank'
  | 'cash'
  | 'payme'
  | 'click'
  | 'purple';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  style,
  ...props
}) => {
  let variantClass = '';
  const customStyle: React.CSSProperties = { ...style };

  switch (variant) {
    case 'success':
      variantClass = 'badge-success';
      break;
    case 'warning':
      variantClass = 'badge-warning';
      break;
    case 'danger':
      variantClass = 'badge-danger';
      break;
    case 'info':
      variantClass = 'badge-info';
      break;
    case 'bank':
      variantClass = 'badge-bank';
      break;
    case 'cash':
      variantClass = 'badge-cash';
      break;
    case 'payme':
      variantClass = 'badge-payme';
      break;
    case 'click':
      variantClass = 'badge-click';
      break;
    case 'purple':
      customStyle.background = '#ede9fe';
      customStyle.color = '#6d28d9';
      break;
    default:
      customStyle.background = 'var(--bg-subtle)';
      customStyle.color = 'var(--text-secondary)';
      break;
  }

  return (
    <span className={`badge ${variantClass} ${className}`.trim()} style={customStyle} {...props}>
      {children}
    </span>
  );
};

export default Badge;
