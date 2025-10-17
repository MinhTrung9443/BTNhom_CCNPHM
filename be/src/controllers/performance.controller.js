import { performanceService } from '../services/performance.service.js';

export const performanceController = {
  /**
   * Get database performance statistics (Admin only)
   */
  async getDatabaseStats(req, res, next) {
    const stats = await performanceService.getDatabaseStats();
    
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê database thành công',
      data: stats
    });
  },

  /**
   * Get article performance metrics (Admin only)
   */
  async getArticleMetrics(req, res, next) {
    const metrics = await performanceService.getArticlePerformanceMetrics();
    
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê hiệu năng bài viết thành công',
      data: metrics
    });
  },

  /**
   * Get image optimization statistics (Admin only)
   */
  async getImageStats(req, res, next) {
    const stats = await performanceService.getImageOptimizationStats();
    
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tối ưu hóa hình ảnh thành công',
      data: stats
    });
  },

  /**
   * Get caching performance metrics (Admin only)
   */
  async getCachingMetrics(req, res, next) {
    const metrics = await performanceService.getCachingMetrics();
    
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê caching thành công',
      data: metrics
    });
  },

  /**
   * Generate complete performance report (Admin only)
   */
  async getPerformanceReport(req, res, next) {
    const report = await performanceService.generatePerformanceReport();
    
    res.status(200).json({
      success: true,
      message: 'Tạo báo cáo hiệu năng thành công',
      data: report
    });
  }
};