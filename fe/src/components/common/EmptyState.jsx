import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

/**
 * Reusable empty state component
 * @param {{
 *   title?: string;
 *   message?: string;
 *   actionText?: string;
 *   onAction?: () => void;
 *   icon?: string;
 * }} props
 */
const EmptyState = ({ 
  title = 'No data found',
  message = 'There are no items to display at the moment.',
  actionText,
  onAction,
  icon = 'inbox'
}) => {
  return (
    <Card className="card-custom text-center">
      <Card.Body className="py-5">
        <div className="mb-4">
          <i className={`bi bi-${icon} text-muted`} style={{ fontSize: '4rem' }}></i>
        </div>
        <Card.Title className="h4 text-muted mb-3">{title}</Card.Title>
        <Card.Text className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
          {message}
        </Card.Text>
        {actionText && onAction && (
          <Button 
            variant="primary" 
            onClick={onAction}
            className="btn-custom"
          >
            <i className="bi bi-plus-circle me-2"></i>
            {actionText}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmptyState;
