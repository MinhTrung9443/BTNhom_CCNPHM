import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

/**
 * Reusable error state component
 * @param {{
 *   message?: string;
 *   onRetry?: () => void;
 *   variant?: string;
 * }} props
 */
const ErrorState = ({ 
  message = 'An error occurred. Please try again.',
  onRetry,
  variant = 'danger'
}) => {
  return (
    <Alert variant={variant} className="alert-custom">
      <Alert.Heading>
        <i className="bi bi-exclamation-triangle me-2"></i>
        Oops! Something went wrong
      </Alert.Heading>
      <p className="mb-3">{message}</p>
      {onRetry && (
        <div className="d-flex gap-2">
          <Button 
            variant={variant} 
            size="sm" 
            onClick={onRetry}
            className="btn-custom"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Try Again
          </Button>
        </div>
      )}
    </Alert>
  );
};

export default ErrorState;
