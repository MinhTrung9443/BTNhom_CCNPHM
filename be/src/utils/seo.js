/**
 * SEO Utilities for Article System
 * Provides functions for generating meta tags, structured data, and canonical URLs
 */

/**
 * Generate SEO meta tags for an article
 * @param {Object} article - Article object
 * @param {String} baseUrl - Base URL of the website
 * @returns {Object} SEO meta tags
 */
export function generateArticleMetaTags(article, baseUrl) {
  const url = `${baseUrl}/articles/${article.slug}`;
  const imageUrl = article.featuredImage?.url || `${baseUrl}/default-article-image.jpg`;
  
  return {
    title: article.seoMeta?.title || article.title,
    description: article.seoMeta?.description || article.excerpt || '',
    keywords: article.seoMeta?.keywords || article.tags || [],
    canonical: url,
    ogType: 'article',
    ogTitle: article.seoMeta?.title || article.title,
    ogDescription: article.seoMeta?.description || article.excerpt || '',
    ogImage: imageUrl,
    ogUrl: url,
    twitterCard: 'summary_large_image',
    twitterTitle: article.seoMeta?.title || article.title,
    twitterDescription: article.seoMeta?.description || article.excerpt || '',
    twitterImage: imageUrl,
    articlePublishedTime: article.publishedAt?.toISOString(),
    articleModifiedTime: article.updatedAt?.toISOString(),
    articleAuthor: 'Đặc Sản Sóc Trăng',
    articleSection: article.tags?.[0] || 'Bài viết',
    articleTag: article.tags || []
  };
}

/**
 * Generate JSON-LD structured data for an article
 * @param {Object} article - Article object
 * @param {String} baseUrl - Base URL of the website
 * @returns {Object} JSON-LD structured data
 */
export function generateArticleStructuredData(article, baseUrl) {
  const url = `${baseUrl}/articles/${article.slug}`;
  const imageUrl = article.featuredImage?.url || `${baseUrl}/default-article-image.jpg`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || '',
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630
    },
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Đặc Sản Sóc Trăng',
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'Đặc Sản Sóc Trăng',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    articleSection: article.tags?.[0] || 'Bài viết',
    keywords: (article.tags || []).join(', '),
    wordCount: article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
    inLanguage: 'vi-VN',
    url: url
  };
}

/**
 * Generate BreadcrumbList structured data
 * @param {Object} article - Article object
 * @param {String} baseUrl - Base URL of the website
 * @returns {Object} BreadcrumbList JSON-LD
 */
export function generateBreadcrumbStructuredData(article, baseUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Bài viết',
        item: `${baseUrl}/articles`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${baseUrl}/articles/${article.slug}`
      }
    ]
  };
}

/**
 * Generate canonical URL for an article
 * @param {String} slug - Article slug
 * @param {String} baseUrl - Base URL of the website
 * @returns {String} Canonical URL
 */
export function generateCanonicalUrl(slug, baseUrl) {
  return `${baseUrl}/articles/${slug}`;
}

/**
 * Generate meta robots tag based on article status
 * @param {Object} article - Article object
 * @returns {String} Meta robots directive
 */
export function generateMetaRobots(article) {
  if (article.status !== 'published') {
    return 'noindex, nofollow';
  }
  
  // Check if article is too old (older than 2 years)
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  if (article.publishedAt && article.publishedAt < twoYearsAgo) {
    return 'index, follow, max-snippet:-1, max-image-preview:large';
  }
  
  return 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
}

/**
 * Optimize article excerpt for SEO
 * @param {String} content - Article content (HTML)
 * @param {Number} maxLength - Maximum length (default: 160)
 * @returns {String} Optimized excerpt
 */
export function generateSeoExcerpt(content, maxLength = 160) {
  if (!content) return '';
  
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const cleaned = plainText.replace(/\s+/g, ' ').trim();
  
  // Truncate to maxLength
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  // Find last complete word within limit
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Generate Open Graph tags for social sharing
 * @param {Object} article - Article object
 * @param {String} baseUrl - Base URL of the website
 * @returns {Object} Open Graph tags
 */
export function generateOpenGraphTags(article, baseUrl) {
  const url = `${baseUrl}/articles/${article.slug}`;
  const imageUrl = article.featuredImage?.url || `${baseUrl}/default-article-image.jpg`;
  
  return {
    'og:type': 'article',
    'og:title': article.seoMeta?.title || article.title,
    'og:description': article.seoMeta?.description || article.excerpt || '',
    'og:image': imageUrl,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': article.featuredImage?.alt || article.title,
    'og:url': url,
    'og:site_name': 'Đặc Sản Sóc Trăng',
    'og:locale': 'vi_VN',
    'article:published_time': article.publishedAt?.toISOString(),
    'article:modified_time': article.updatedAt?.toISOString(),
    'article:author': 'Đặc Sản Sóc Trăng',
    'article:section': article.tags?.[0] || 'Bài viết',
    'article:tag': article.tags || []
  };
}

/**
 * Generate Twitter Card tags
 * @param {Object} article - Article object
 * @param {String} baseUrl - Base URL of the website
 * @returns {Object} Twitter Card tags
 */
export function generateTwitterCardTags(article, baseUrl) {
  const imageUrl = article.featuredImage?.url || `${baseUrl}/default-article-image.jpg`;
  
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': article.seoMeta?.title || article.title,
    'twitter:description': article.seoMeta?.description || article.excerpt || '',
    'twitter:image': imageUrl,
    'twitter:image:alt': article.featuredImage?.alt || article.title
  };
}
