import { sitemapService } from '../services/sitemap.service.js';

export const sitemapController = {
  /**
   * Generate and serve articles sitemap
   */
  async getArticlesSitemap(req, res, next) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const sitemap = await sitemapService.generateArticlesSitemap(baseUrl);
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  },

  /**
   * Generate and serve sitemap index
   */
  async getSitemapIndex(req, res, next) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const sitemapIndex = await sitemapService.generateSitemapIndex(baseUrl);
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemapIndex);
  },

  /**
   * Get sitemap statistics (Admin only)
   */
  async getSitemapStats(req, res, next) {
    const stats = await sitemapService.getSitemapStats();
    
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê sitemap thành công',
      data: stats
    });
  }
};
