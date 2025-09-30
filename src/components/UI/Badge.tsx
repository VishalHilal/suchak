import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ children, variant, size = 'sm' }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800', 
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-slate-100 text-slate-800'
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;