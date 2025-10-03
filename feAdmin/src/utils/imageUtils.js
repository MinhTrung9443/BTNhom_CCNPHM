/**
 * Utility functions for handling images in the application
 */

/**
 * Get a fallback image URL based on size
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to display in placeholder
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderImage = (width = 50, height = 50, text = 'No+Image') => {
  return `https://via.placeholder.com/${width}x${height}?text=${text}`
}

/**
 * Handle image error by setting a fallback image
 * @param {Event} e - Image error event
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to display in placeholder
 */
export const handleImageError = (e, width = 50, height = 50, text = 'No+Image') => {
  e.target.src = getPlaceholderImage(width, height, text)
}

/**
 * Get image source with fallback
 * @param {string} src - Original image source
 * @param {number} width - Image width for fallback
 * @param {number} height - Image height for fallback
 * @param {string} text - Text to display in placeholder
 * @returns {string} Image source or fallback
 */
export const getImageSrc = (src, width = 50, height = 50, text = 'No+Image') => {
  return src || getPlaceholderImage(width, height, text)
}

/**
 * Check if a URL is a valid HTTP/HTTPS URL
 * @param {string} url - URL to check
 * @returns {boolean} True if valid HTTP/HTTPS URL
 */
export const isValidHttpUrl = (url) => {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}