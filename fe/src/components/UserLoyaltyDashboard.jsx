import React, { useState, useEffect } from 'react';
import { couponService } from '../services/couponService.js';
import { toast } from 'react-toastify';

const UserLoyaltyDashboard = () => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [couponHistory, setCouponHistory] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('points');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loyaltyRes, couponRes, statsRes] = await Promise.all([
        couponService.getUserLoyaltyPoints(),
        couponService.getUserCouponHistory({ limit: 5 }),
        couponService.getUserStats()
      ]);

      setLoyaltyData(loyaltyRes.data);
      setCouponHistory(couponRes.data);
      setUserStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemPoints = async (pointsToRedeem, discountValue) => {
    try {
      await couponService.redeemPoints({ pointsToRedeem, discountValue });
      toast.success(`Đã đổi ${pointsToRedeem} điểm thành ${discountValue.toLocaleString('vi-VN')} VNĐ`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error redeeming points:', error);
      toast.error('Không thể đổi điểm');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Điểm Thưởng & Mã Giảm Giá</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8">
        {['points', 'coupons', 'stats'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab === 'points' && 'Điểm Thưởng'}
            {tab === 'coupons' && 'Mã Giảm Giá'}
            {tab === 'stats' && 'Thống Kê'}
          </button>
        ))}
      </div>

      {/* Points Tab */}
      {activeTab === 'points' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Points */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Điểm Hiện Tại</h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">
                {loyaltyData?.availablePoints || 0}
              </div>
              <p className="text-gray-600">Điểm khả dụng</p>
            </div>

            {/* Redemption Options */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Tùy Chọn Đổi Điểm</h3>
              <div className="space-y-2">
                {loyaltyData?.redemptionOptions?.map((option, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>{option.points} điểm = {option.discount.toLocaleString('vi-VN')} VNĐ</span>
                    <button
                      onClick={() => handleRedeemPoints(option.points, option.discount)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Đổi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Points History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Lịch Sử Điểm</h2>
            <div className="space-y-3">
              {loyaltyData?.history?.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className={`font-bold ${
                    transaction.type === 'earned' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Coupons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Mã Giảm Giá Khả Dụng</h2>
            <div className="space-y-3">
              {couponHistory?.data?.filter(coupon => !coupon.usedAt).map((coupon, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{coupon.code}</h3>
                      <p className="text-gray-600">{coupon.description}</p>
                      <p className="text-sm text-gray-500">
                        HSD: {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-500">
                        -{coupon.discountValue > 100 ? `${coupon.discountValue.toLocaleString('vi-VN')} VNĐ` : `${coupon.discountValue}%`}
                      </div>
                      <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                        Sử dụng
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Lịch Sử Sử Dụng</h2>
            <div className="space-y-3">
              {couponHistory?.data?.filter(coupon => coupon.usedAt).map((coupon, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{coupon.code}</p>
                    <p className="text-sm text-gray-500">
                      Đã sử dụng: {new Date(coupon.usedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className="text-green-500 font-bold">
                    -{coupon.discountValue > 100 ? `${coupon.discountValue.toLocaleString('vi-VN')} VNĐ` : `${coupon.discountValue}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{userStats?.totalOrders || 0}</div>
            <p className="text-gray-600">Tổng Đơn Hàng</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {userStats?.totalSpent?.toLocaleString('vi-VN') || 0} VNĐ
            </div>
            <p className="text-gray-600">Tổng Chi Tiêu</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">{userStats?.totalPoints || 0}</div>
            <p className="text-gray-600">Tổng Điểm</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">{userStats?.availableCoupons || 0}</div>
            <p className="text-gray-600">Mã Khả Dụng</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLoyaltyDashboard;
