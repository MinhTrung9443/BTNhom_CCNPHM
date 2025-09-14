import React from 'react';
import { Button } from 'react-bootstrap';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading = false,
  showInfo = true 
}) => {
  console.log('Pagination props:', { currentPage, totalPages, loading }); // Debug log
  
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-wrapper d-flex justify-content-between align-items-center mt-4">
      {showInfo && (
        <div className="pagination-info">
          <small className="text-muted">
            Trang {currentPage} / {totalPages}
          </small>
        </div>
      )}
      
      <div className="pagination-controls d-flex gap-2">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1 || loading}
          className="pagination-btn"
        >
          <i className="fas fa-chevron-left me-1"></i>
          Trước
        </Button>
        
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages || loading}
          className="pagination-btn"
        >
          Tiếp
          <i className="fas fa-chevron-right ms-1"></i>
        </Button>
      </div>
    </div>
  );
};

export default Pagination;