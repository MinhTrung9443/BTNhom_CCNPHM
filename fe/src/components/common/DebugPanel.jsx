import React, { useState } from 'react';
import { Card, Button, Collapse, Badge } from 'react-bootstrap';

const DebugPanel = ({ data, title = "Debug Data" }) => {
  const [show, setShow] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="mb-3 border-warning">
      <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-bug me-2"></i>
          {title}
          <Badge bg="dark" className="ms-2">DEV</Badge>
        </div>
        <Button 
          variant="outline-dark" 
          size="sm"
          onClick={() => setShow(!show)}
        >
          {show ? 'Hide' : 'Show'}
        </Button>
      </Card.Header>
      <Collapse in={show}>
        <Card.Body>
          <pre style={{ 
            fontSize: '12px', 
            maxHeight: '300px', 
            overflow: 'auto',
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </Card.Body>
      </Collapse>
    </Card>
  );
};

export default DebugPanel;