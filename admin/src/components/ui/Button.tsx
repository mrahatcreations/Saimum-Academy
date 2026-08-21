import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className = '',
  loading = false,
  disabled,
  style,
  ...props
}) => {
  const getVariantClass = () => {
    const sizeClass = size === 'sm' ? 'btnSm' : size === 'lg' ? 'btnLg' : '';
    let varClass = 'btnSecondary';
    switch (variant) {
      case 'primary': varClass = 'btnPrimary'; break;
      case 'icon': varClass = 'iconBtn'; break;
      case 'danger': varClass = 'btnDanger'; break;
      case 'ghost': varClass = 'btnGhost'; break;
      default: varClass = 'btnSecondary'; break;
    }
    return `${varClass} ${sizeClass}`.trim();
  };

  return (
    <button
      className={`${getVariantClass()} ${className}`}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
