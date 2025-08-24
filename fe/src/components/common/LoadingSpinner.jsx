import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

/**
 * Reusable loading spinner component
 * @param {{
 *   size?: 'sm' | 'lg';
 *   variant?: string;
 *   text?: string;
 *   centered?: boolean;
 * }} props
 */
const LoadingSpinner = ({ 
  size = 'lg', 
  variant = 'primary', 
  text = 'Loading...',
  centered = true 
}) => {
  const containerClass = centered ? 'text-center p-4' : '';

  return (
    <div className={containerClass}>
      <Spinner 
        animation="border" 
        variant={variant} 
        size={size}
        role="status"
        className="loading-spinner"
      >
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {text && centered && (
        <div className="mt-2 text-muted">{text}</div>
      )}
    </div>
  );
};

export default LoadingSpinner;
