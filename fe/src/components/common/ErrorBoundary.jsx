import React from 'react';
import { Alert, Button, Container } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error: error });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className='my-5'>
          <Alert variant='danger'>
            <Alert.Heading>
              <i className='fas fa-exclamation-triangle me-2'></i>
              Da xay ra loi
            </Alert.Heading>
            <p className='mb-3'>
              Xin loi, da xay ra loi khong mong muon. Vui long thu lai.
            </p>
            
            <div className='d-flex gap-2'>
              <Button variant='outline-danger' onClick={this.handleRetry}>
                <i className='fas fa-redo me-2'></i>Thu lai
              </Button>
              <Button variant='outline-secondary' onClick={() => window.location.href = '/'}>
                <i className='fas fa-home me-2'></i>Ve trang chu
              </Button>
            </div>
          </Alert>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;