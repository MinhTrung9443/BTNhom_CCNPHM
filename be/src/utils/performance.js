/**
 * Performance Optimization Utilities
 * Provides functions for database query optimization and image processing
 */

/**
 * Build optimized aggregation pipeline for article queries
 * @param {Object} filter - MongoDB filter object
 * @param {Object} options - Query options (sort, limit, skip)
 * @returns {Array} Aggregation pipeline
 */
export function buildArticleAggregationPipeline(filter = {}, options = {}) {
  const pipeline = [];

  // Match stage - use indexes efficiently
  if (Object.keys(filter).length > 0) {
    pipeline.push({ $match: filter });
  }

  // Populate author if requested
  if (options.populateAuthor) {
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    });
    pipeline.push({
      $unwind: {
        path: '$author',
        preserveNullAndEmptyArrays: true
      }
    });
    pipeline.push({
      $addFields: {
        'author': {
          _id: '$author._id',
          name: '$author.name',
          email: '$author.email',
          avatar: '$author.avatar',
          role: '$author.role'
        }
      }
    });
  }

  // Add computed fields for sorting
  if (options.sortBy === 'popular') {
    pipeline.push({
      $addFields: {
        popularityScore: {
          $add: [
            { $multiply: ['$stats.views', 1] },
            { $multiply: ['$stats.likes', 3] },
            { $multiply: ['$stats.comments', 2] },
            { $multiply: ['$stats.shares', 4] }
          ]
        }
      }
    });
  }

  // Sort stage
  const sort = options.sort || { publishedAt: -1 };
  if (options.sortBy === 'popular') {
    sort.popularityScore = -1;
  }
  pipeline.push({ $sort: sort });

  // Skip and limit for pagination
  if (options.skip) {
    pipeline.push({ $skip: options.skip });
  }
  if (options.limit) {
    pipeline.push({ $limit: options.limit });
  }

  // Project only needed fields
  if (options.select) {
    const projection = {};
    options.select.split(' ').forEach(field => {
      if (field.startsWith('-')) {
        projection[field.substring(1)] = 0;
      } else {
        projection[field] = 1;
      }
    });
    pipeline.push({ $project: projection });
  }

  return pipeline;
}

/**
 * Optimize image URLs for different sizes
 * @param {String} imageUrl - Original image URL
 * @param {String} size - Size variant (thumbnail, medium, large)
 * @returns {String} Optimized image URL
 */
export function optimizeImageUrl(imageUrl, size = 'medium') {
  if (!imageUrl) return null;

  // If it's a Cloudinary URL, add transformation parameters
  if (imageUrl.includes('cloudinary.com')) {
    const sizeParams = {
      thumbnail: 'w_300,h_200,c_fill,f_auto,q_auto',
      medium: 'w_800,h_450,c_fill,f_auto,q_auto',
      large: 'w_1200,h_630,c_fill,f_auto,q_auto',
      original: 'f_auto,q_auto'
    };

    const params = sizeParams[size] || sizeParams.medium;
    
    // Insert transformation parameters into Cloudinary URL
    return imageUrl.replace('/upload/', `/upload/${params}/`);
  }

  // For non-Cloudinary images, return as-is
  return imageUrl;
}

/**
 * Generate responsive image srcset
 * @param {String} imageUrl - Original image URL
 * @returns {Object} Responsive image data
 */
export function generateResponsiveImages(imageUrl) {
  if (!imageUrl) return null;

  return {
    thumbnail: optimizeImageUrl(imageUrl, 'thumbnail'),
    medium: optimizeImageUrl(imageUrl, 'medium'),
    large: optimizeImageUrl(imageUrl, 'large'),
    original: optimizeImageUrl(imageUrl, 'original'),
    srcset: [
      `${optimizeImageUrl(imageUrl, 'thumbnail')} 300w`,
      `${optimizeImageUrl(imageUrl, 'medium')} 800w`,
      `${optimizeImageUrl(imageUrl, 'large')} 1200w`
    ].join(', '),
    sizes: '(max-width: 768px) 300px, (max-width: 1024px) 800px, 1200px'
  };
}

/**
 * Build efficient text search query
 * @param {String} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Object} MongoDB query object
 */
export function buildTextSearchQuery(searchTerm, fields = ['title', 'excerpt', 'content']) {
  if (!searchTerm) return {};

  // Use MongoDB text search if available, otherwise use regex
  const searchQuery = {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };

  return searchQuery;
}

/**
 * Optimize article data for API response
 * @param {Object} article - Article document
 * @param {Object} options - Optimization options
 * @returns {Object} Optimized article data
 */
export function optimizeArticleForResponse(article, options = {}) {
  const optimized = { ...article };


  // Remove content for list views
  if (options.excludeContent) {
    delete optimized.content;
  }

  // Truncate excerpt if needed
  if (options.maxExcerptLength && optimized.excerpt) {
    if (optimized.excerpt.length > options.maxExcerptLength) {
      optimized.excerpt = optimized.excerpt.substring(0, options.maxExcerptLength) + '...';
    }
  }

  return optimized;
}

/**
 * Calculate reading time for article content
 * @param {String} content - Article content (HTML)
 * @param {Number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {Number} Reading time in minutes
 */
export function calculateReadingTime(content, wordsPerMinute = 200) {
  if (!content) return 0;

  // Remove HTML tags and count words
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.trim().split(/\s+/).length;
  
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Build efficient pagination query
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} maxLimit - Maximum allowed limit
 * @returns {Object} Pagination parameters
 */
export function buildPaginationQuery(page = 1, limit = 10, maxLimit = 100) {
  const normalizedPage = Math.max(1, parseInt(page));
  const normalizedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit)));
  const skip = (normalizedPage - 1) * normalizedLimit;

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip
  };
}

/**
 * Optimize database query with proper indexing hints
 * @param {Object} query - Mongoose query object
 * @param {Object} filter - Filter conditions
 * @returns {Object} Optimized query
 */
export function optimizeQuery(query, filter = {}) {
  // Use lean() for read-only operations
  query = query.lean();

  // Add index hints based on filter conditions
  if (filter.status) {
    query = query.hint({ status: 1, publishedAt: -1 });
  } else if (filter.tags) {
    query = query.hint({ tags: 1 });
  } else if (filter.$text) {
    query = query.hint({ '$**': 'text' });
  } else {
    query = query.hint({ publishedAt: -1 });
  }

  return query;
}
