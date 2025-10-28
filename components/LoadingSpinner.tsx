import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-500 border-t-transparent`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
};

export default LoadingSpinner;