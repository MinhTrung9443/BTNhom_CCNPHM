import React from 'react'
import './Skeleton.css'

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  )
}

export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="16px"
          width={index === lines - 1 ? '80%' : '100%'}
          className="mb-2"
        />
      ))}
    </div>
  )
}

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`card border-0 shadow-sm ${className}`}>
      <div className="card-body">
        <Skeleton height="24px" width="60%" className="mb-3" />
        <Skeleton height="40px" width="40%" className="mb-2" />
        <Skeleton height="16px" width="50%" />
      </div>
    </div>
  )
}

export const SkeletonTable = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="table-responsive">
      <table className="table mb-0">
        <thead className="bg-light">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index}>
                <Skeleton height="20px" width="80%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton height="16px" width="90%" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const SkeletonAvatar = ({ size = '48px', className = '' }) => {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="50%"
      className={className}
    />
  )
}

export const SkeletonButton = ({ width = '100px', height = '38px', className = '' }) => {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius="6px"
      className={className}
    />
  )
}

export const SkeletonImage = ({ width = '100%', height = '200px', className = '' }) => {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius="8px"
      className={className}
    />
  )
}

export const SkeletonUserRow = () => {
  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <SkeletonAvatar size="40px" className="me-3" />
          <div style={{ flex: 1 }}>
            <Skeleton height="16px" width="150px" className="mb-1" />
            <Skeleton height="14px" width="200px" />
          </div>
        </div>
      </td>
      <td>
        <Skeleton height="16px" width="120px" className="mb-1" />
        <Skeleton height="14px" width="180px" />
      </td>
      <td>
        <Skeleton height="24px" width="100px" borderRadius="12px" />
      </td>
      <td>
        <Skeleton height="14px" width="100px" />
      </td>
      <td>
        <div className="d-flex gap-2">
          <Skeleton height="32px" width="32px" borderRadius="4px" />
          <Skeleton height="32px" width="32px" borderRadius="4px" />
        </div>
      </td>
    </tr>
  )
}

export const SkeletonOrderRow = () => {
  return (
    <tr>
      <td>
        <Skeleton height="16px" width="100px" />
      </td>
      <td>
        <Skeleton height="14px" width="120px" />
      </td>
      <td>
        <Skeleton height="16px" width="100px" />
      </td>
      <td>
        <Skeleton height="24px" width="90px" borderRadius="12px" />
      </td>
      <td>
        <Skeleton height="32px" width="32px" borderRadius="4px" />
      </td>
    </tr>
  )
}

export const SkeletonProductCard = () => {
  return (
    <div className="card border-0 shadow-sm h-100">
      <SkeletonImage height="200px" className="card-img-top" />
      <div className="card-body">
        <Skeleton height="20px" width="100%" className="mb-2" />
        <Skeleton height="16px" width="80%" className="mb-3" />
        <div className="d-flex justify-content-between align-items-center">
          <Skeleton height="24px" width="80px" />
          <Skeleton height="32px" width="32px" borderRadius="4px" />
        </div>
      </div>
    </div>
  )
}

export const SkeletonProductRow = () => {
  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <Skeleton width="60px" height="60px" borderRadius="8px" className="me-3" />
          <div style={{ flex: 1 }}>
            <Skeleton height="16px" width="200px" className="mb-1" />
            <Skeleton height="14px" width="150px" />
          </div>
        </div>
      </td>
      <td>
        <Skeleton height="16px" width="120px" />
      </td>
      <td>
        <Skeleton height="16px" width="80px" />
      </td>
      <td>
        <Skeleton height="16px" width="60px" />
      </td>
      <td>
        <Skeleton height="24px" width="80px" borderRadius="12px" />
      </td>
      <td>
        <div className="d-flex gap-2">
          <Skeleton height="32px" width="32px" borderRadius="4px" />
          <Skeleton height="32px" width="32px" borderRadius="4px" />
        </div>
      </td>
    </tr>
  )
}

export const SkeletonVoucherRow = () => {
  return (
    <tr>
      <td>
        <Skeleton height="20px" width="100px" className="mb-1" />
        <Skeleton height="14px" width="80px" />
      </td>
      <td>
        <Skeleton height="16px" width="120px" />
      </td>
      <td>
        <Skeleton height="16px" width="100px" />
      </td>
      <td>
        <Skeleton height="14px" width="140px" />
      </td>
      <td>
        <Skeleton height="24px" width="90px" borderRadius="12px" />
      </td>
      <td>
        <div className="d-flex gap-2">
          <Skeleton height="32px" width="32px" borderRadius="4px" />
          <Skeleton height="32px" width="32px" borderRadius="4px" />
          <Skeleton height="32px" width="32px" borderRadius="4px" />
        </div>
      </td>
    </tr>
  )
}

export default Skeleton
