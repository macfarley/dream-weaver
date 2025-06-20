/**
 * URL-Safe Name Utilities
 * 
 * Handles sanitization and validation of user-generated names for use in URLs.
 * Prevents XSS, ensures valid URLs, and provides consistent formatting.
 */

/**
 * Validates if a bedroom name is safe and appropriate for URLs.
 * 
 * @param {string} name - The bedroom name to validate
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export function validateBedroomName(name) {
  // Check if name exists and is a string
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Bedroom name is required' };
  }

  // Trim whitespace
  const trimmed = name.trim();

  // Check minimum length
  if (trimmed.length < 1) {
    return { isValid: false, error: 'Bedroom name cannot be empty' };
  }

  // Check maximum length (reasonable for URLs and display)
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Bedroom name must be 50 characters or less' };
  }

  // Check for potentially problematic characters
  // Allow letters, numbers, spaces, hyphens, apostrophes, parentheses
  const allowedPattern = /^[a-zA-Z0-9\s\-'()&.]+$/;
  if (!allowedPattern.test(trimmed)) {
    return { isValid: false, error: 'Bedroom name contains invalid characters. Use only letters, numbers, spaces, hyphens, apostrophes, and parentheses.' };
  }

  // Check for suspicious patterns that might indicate script injection
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onclick/i,
    /onerror/i,
    /onload/i,
    /%3C/i, // encoded <
    /%3E/i, // encoded >
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(trimmed))) {
    return { isValid: false, error: 'Bedroom name contains potentially unsafe content' };
  }

  return { isValid: true };
}

/**
 * Sanitizes a bedroom name for safe URL usage.
 * Creates clean, readable URLs by converting to slug format.
 * 
 * @param {string} name - The bedroom name to sanitize
 * @returns {string} - URL-safe slug version of the name
 */
export function sanitizeBedroomNameForUrl(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Trim and normalize whitespace
  const cleaned = name.trim().replace(/\s+/g, ' ');
  
  // Convert to URL-friendly slug:
  // 1. Convert to lowercase
  // 2. Replace spaces with hyphens
  // 3. Remove apostrophes
  // 4. Replace other special characters with hyphens
  // 5. Remove multiple consecutive hyphens
  // 6. Remove leading/trailing hyphens
  const slug = cleaned
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/'/g, '')              // Remove apostrophes
    .replace(/[&().,!?]+/g, '-')    // Replace other special chars with hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');       // Remove leading/trailing hyphens
  
  return slug;
}

/**
 * Decodes a bedroom name from URL parameters safely.
 * Since we now use slugs, this primarily handles URL decoding and normalization.
 * The actual bedroom lookup should be done by comparing slugified versions.
 * 
 * @param {string} encodedName - The URL slug of the bedroom name
 * @returns {string} - The URL slug (for use in comparisons)
 */
export function decodeBedroomNameFromUrl(encodedName) {
  if (!encodedName || typeof encodedName !== 'string') {
    return '';
  }

  try {
    // URL decode first (in case there are any encoded characters)
    const decoded = decodeURIComponent(encodedName);
    
    // Return the slug as-is for comparison purposes
    return decoded.toLowerCase().trim();
  } catch (error) {
    console.warn('Failed to decode bedroom name from URL:', encodedName, error);
    // Return the original string if decoding fails
    return encodedName.toLowerCase().trim();
  }
}

/**
 * Normalizes bedroom names for comparison (case-insensitive, whitespace-normalized).
 * Useful for checking duplicates or finding matches.
 * 
 * @param {string} name - The bedroom name to normalize
 * @returns {string} - Normalized name for comparison
 */
export function normalizeBedroomName(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Checks if two bedroom names are equivalent.
 * Can compare original name with slug, or two original names.
 * 
 * @param {string} name1 - First bedroom name (could be original or slug)
 * @param {string} name2 - Second bedroom name (could be original or slug)  
 * @returns {boolean} - True if names are equivalent
 */
export function bedroomNamesMatch(name1, name2) {
  if (!name1 || !name2) return false;
  
  // Convert both to slugs for comparison
  const slug1 = sanitizeBedroomNameForUrl(name1);
  const slug2 = sanitizeBedroomNameForUrl(name2);
  
  return slug1 === slug2;
}
