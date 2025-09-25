import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLoyaltyPoints } from '../redux/userSlice';
import loyaltyService from '../services/loyaltyService';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing loyalty points
 * @returns {object} Loyalty points state and methods
 */
export const useLoyaltyPoints = () => {
  const dispatch = useDispatch();
  const { loyaltyPoints, isAuthenticated } = useSelector(state => state.user);
  const point= useSelector(state => state.user);
  console.log('loyaltyPoints', point);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /**
   * Fetch current loyalty points from server
   */
  const fetchLoyaltyPoints = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await loyaltyService.getUserLoyaltyPoints();
      
      if (response.success) {
        dispatch(updateLoyaltyPoints(response.data.loyaltyPoints));
      }
    } catch (err) {
      console.error('Error fetching loyalty points:', err);
      setError('Không thể tải điểm tích lũy');
      toast.error('Lỗi khi tải điểm tích lũy');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch loyalty points history
   * @param {object} params - Query parameters
   */
  const fetchHistory = async (params = {}) => {
    if (!isAuthenticated) return;
    
    try {
      setHistoryLoading(true);
      
      const response = await loyaltyService.getLoyaltyPointsHistory(params);
      
      if (response.success) {
        setHistory(response.data);
      }
    } catch (err) {
      console.error('Error fetching loyalty points history:', err);
      toast.error('Lỗi khi tải lịch sử điểm tích lũy');
    } finally {
      setHistoryLoading(false);
    }
  };

  /**
   * Calculate maximum points that can be applied to an order
   * @param {number} orderTotal - Total order amount
   * @returns {number} Maximum applicable points
   */
  const getMaxApplicablePoints = (orderTotal) => {
    if (!orderTotal || orderTotal <= 0) return 0;
    
    // Maximum 50% of order total
    const maxByPercentage = Math.floor(orderTotal * 0.5);
    
    // Cannot exceed available points
    return Math.min(loyaltyPoints, maxByPercentage);
  };

  /**
   * Validate points amount
   * @param {number} points - Points to validate
   * @param {number} orderTotal - Order total amount
   * @returns {object} Validation result
   */
  const validatePoints = (points, orderTotal = 0) => {
    if (points < 0) {
      return { isValid: false, error: 'Số điểm không thể âm' };
    }
    
    if (points > loyaltyPoints) {
      return { 
        isValid: false, 
        error: `Bạn chỉ có ${loyaltyPoints.toLocaleString()} điểm` 
      };
    }
    
    const maxApplicable = getMaxApplicablePoints(orderTotal);
    if (points > maxApplicable) {
      return { 
        isValid: false, 
        error: `Chỉ có thể áp dụng tối đa ${maxApplicable.toLocaleString()} điểm cho đơn hàng này` 
      };
    }
    
    return { isValid: true, error: null };
  };

  /**
   * Format points for display
   * @param {number} points - Points to format
   * @returns {string} Formatted points string
   */
  const formatPoints = (points) => {
    return points.toLocaleString('vi-VN');
  };

  /**
   * Calculate points value in currency
   * @param {number} points - Points amount
   * @returns {number} Currency value (1 point = 1 VND)
   */
  const pointsToVND = (points) => {
    return points; // 1 point = 1 VND
  };

  /**
   * Format points value as currency
   * @param {number} points - Points amount
   * @returns {string} Formatted currency string
   */
  const formatPointsAsCurrency = (points) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(pointsToVND(points));
  };

  // Auto-fetch points when user logs in
  useEffect(() => {
    if (isAuthenticated && loyaltyPoints === 0) {
      fetchLoyaltyPoints();
    }
  }, [isAuthenticated]);

  return {
    // State
    loyaltyPoints,
    loading,
    error,
    history,
    historyLoading,
    
    // Methods
    fetchLoyaltyPoints,
    fetchHistory,
    getMaxApplicablePoints,
    validatePoints,
    formatPoints,
    pointsToVND,
    formatPointsAsCurrency,
    
    // Computed values
    hasPoints: loyaltyPoints > 0,
    isLoading: loading || historyLoading
  };
};

export default useLoyaltyPoints;