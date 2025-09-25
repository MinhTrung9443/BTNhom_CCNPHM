import React from 'react'
import { Pagination as BootstrapPagination } from 'react-bootstrap'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading = false,
  showInfo = true 
}) => {
  if (totalPages <= 1) return null

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && !loading) {
      onPageChange(page)
    }
  }

  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // First page
    if (startPage > 1) {
      items.push(
        <BootstrapPagination.Item
          key={1}
          onClick={() => handlePageChange(1)}
          disabled={loading}
        >
          1
        </BootstrapPagination.Item>
      )
      if (startPage > 2) {
        items.push(<BootstrapPagination.Ellipsis key="start-ellipsis" />)
      }
    }

    // Visible pages
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <BootstrapPagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
          disabled={loading}
        >
          {page}
        </BootstrapPagination.Item>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<BootstrapPagination.Ellipsis key="end-ellipsis" />)
      }
      items.push(
        <BootstrapPagination.Item
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          disabled={loading}
        >
          {totalPages}
        </BootstrapPagination.Item>
      )
    }

    return items
  }

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      {showInfo && (
        <div className="pagination-info">
          <small className="text-muted">
            Trang {currentPage} / {totalPages}
          </small>
        </div>
      )}
      
      <BootstrapPagination className="mb-0">
        <BootstrapPagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        />
        {renderPaginationItems()}
        <BootstrapPagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        />
      </BootstrapPagination>
    </div>
  )
}

export default Pagination