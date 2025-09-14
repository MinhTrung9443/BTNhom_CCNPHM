import React from 'react'
import { Spinner } from 'react-bootstrap'

const LoadingSpinner = ({ 
  size = 'lg', 
  variant = 'primary', 
  text = 'Đang tải...',
  centered = true 
}) => {
  const containerClass = centered ? 'text-center p-4' : ''

  return (
    <div className={containerClass}>
      <Spinner 
        animation="border" 
        variant={variant} 
        size={size}
        role="status"
        className="loading-spinner"
        style={{ 
          color: 'var(--primary-brown)',
          width: '3rem',
          height: '3rem'
        }}
      >
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {text && centered && (
        <div className="mt-3 text-muted fw-medium">{text}</div>
      )}
    </div>
  )
}

export default LoadingSpinner