/**
 * Image Optimization Middleware
 * Handles image compression and lazy loading optimization
 */

import { optimizeImageUrl, generateResponsiveImages } from '../utils/performance.js';

/**
 * Middleware to add image optimization headers
 */
export const addImageOptimizationHeaders = (req, res, next) => {
  // Add headers for better image caching
  res.set({
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache for images
    'Vary': 'Accept-Encoding',
    'X-Content-Type-Options': 'nosniff'
  });

  // Add WebP support detection
  const acceptsWebP = req.headers.accept && req.headers.accept.includes('image/webp');
  if (acceptsWebP) {
    res.set('X-Supports-WebP', 'true');
  }

  next();
};

/**
 * Middleware to optimize images in response data
 */
export const optimizeResponseImages = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // Check if response contains articles with images
    if (data && data.data) {
      if (Array.isArray(data.data)) {
        // Multiple articles
        data.data = data.data.map(article => optimizeArticleImages(article, req));
      } else if (data.data.featuredImage) {
        // Single article
        data.data = optimizeArticleImages(data.data, req);
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Optimize images in article object
 * @private
 */
function optimizeArticleImages(article, req) {
  if (!article.featuredImage?.url) return article;

  const optimized = { ...article };
  const imageSize = req.query.imageSize || 'medium';
  const includeResponsive = req.query.responsive === 'true';

  if (includeResponsive) {
    optimized.featuredImage.responsive = generateResponsiveImages(article.featuredImage.url);
  } else {
    optimized.featuredImage.url = optimizeImageUrl(article.featuredImage.url, imageSize);
  }

  return optimized;
}

/**
 * Middleware for lazy loading support
 */
export const addLazyLoadingSupport = (req, res, next) => {
  // Add headers to support lazy loading
  res.set({
    'X-Lazy-Loading': 'supported',
    'Link': '</css/lazy-loading.css>; rel=preload; as=style'
  });

  next();
};

/**
 * Middleware to add image preload hints
 */
export const addImagePreloadHints = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // Add preload hints for featured images
    if (data && data.data && Array.isArray(data.data)) {
      const preloadImages = data.data
        .slice(0, 3) // Only preload first 3 images
        .map(article => article.featuredImage?.url)
        .filter(Boolean)
        .map(url => optimizeImageUrl(url, 'medium'));

      if (preloadImages.length > 0) {
        const preloadLinks = preloadImages
          .map(url => `<${url}>; rel=preload; as=image`)
          .join(', ');
        
        res.set('Link', preloadLinks);
      }
    }

    return originalJson.call(this, data);
  };

  next();
};