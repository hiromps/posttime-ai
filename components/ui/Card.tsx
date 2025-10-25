import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-lg';

  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverStyle = hover ? 'transition-transform duration-200 hover:scale-102 hover:shadow-2xl cursor-pointer' : '';

  return (
    <div className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyle} ${className}`}>
      {children}
    </div>
  );
};
