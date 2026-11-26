import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const variantClass = variant === 'icon' ? 'btn-icon' : `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button className={`btn ${variantClass} ${sizeClass} ${className}`.trim()} {...props}>
      {icon && <span className="btn-icon-wrapper" style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
