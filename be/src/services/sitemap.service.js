/**
 * Sitemap Service
 * Generates XML sitemaps for articles and other content
 */

import Article from '../models/Article.js';

export const sitemapService = {
  /**
   * Generate XML sitemap for all published articles
   * @param {String} baseUrl - Base URL of the website
   * @returns {Promise<String>} XML sitemap
   */
  async generateArticlesSitemap(baseUrl) {
    // Get all published articles
    const articles = await Article.find({
      status: 'published',
      publishedAt: { $lte: new Date() }
    })
      .select('slug updatedAt publishedAt')
      .sort({ publishedAt: -1 })
      .lean();

    // Build XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add articles page
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/articles</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';

    // Add individual articles
    for (const article of articles) {
      const lastmod = article.updatedAt || article.publishedAt;
      const priority = this._calculatePriority(article.publishedAt);
      const changefreq = this._calculateChangeFreq(article.publishedAt);

      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/articles/${article.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    return xml;
  },

  /**
   * Generate sitemap index (for multiple sitemaps)
   * @param {String} baseUrl - Base URL of the website
   * @returns {Promise<String>} XML sitemap index
   */
  async generateSitemapIndex(baseUrl) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Articles sitemap
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/sitemap-articles.xml</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';

    // Main sitemap (products, categories, etc.)
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/sitemap-main.xml</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';

    xml += '</sitemapindex>';

    return xml;
  },

  /**
   * Get sitemap statistics
   * @returns {Promise<Object>} Sitemap statistics
   */
  async getSitemapStats() {
    const [totalArticles, recentArticles, oldArticles] = await Promise.all([
      Article.countDocuments({
        status: 'published',
        publishedAt: { $lte: new Date() }
      }),
      Article.countDocuments({
        status: 'published',
        publishedAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          $lte: new Date()
        }
      }),
      Article.countDocuments({
        status: 'published',
        publishedAt: {
          $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Older than 1 year
          $lte: new Date()
        }
      })
    ]);

    return {
      totalArticles,
      recentArticles,
      oldArticles,
      lastGenerated: new Date().toISOString()
    };
  },

  /**
   * Calculate priority based on article age
   * @private
   * @param {Date} publishedAt - Article publication date
   * @returns {String} Priority value (0.0 - 1.0)
   */
  _calculatePriority(publishedAt) {
    const now = new Date();
    const ageInDays = (now - publishedAt) / (1000 * 60 * 60 * 24);

    if (ageInDays <= 7) return '1.0';      // Last week
    if (ageInDays <= 30) return '0.9';     // Last month
    if (ageInDays <= 90) return '0.8';     // Last 3 months
    if (ageInDays <= 180) return '0.7';    // Last 6 months
    if (ageInDays <= 365) return '0.6';    // Last year
    return '0.5';                           // Older than 1 year
  },

  /**
   * Calculate change frequency based on article age
   * @private
   * @param {Date} publishedAt - Article publication date
   * @returns {String} Change frequency
   */
  _calculateChangeFreq(publishedAt) {
    const now = new Date();
    const ageInDays = (now - publishedAt) / (1000 * 60 * 60 * 24);

    if (ageInDays <= 7) return 'daily';     // Last week
    if (ageInDays <= 30) return 'weekly';   // Last month
    if (ageInDays <= 180) return 'monthly'; // Last 6 months
    return 'yearly';                        // Older than 6 months
  }
};
