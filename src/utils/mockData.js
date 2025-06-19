/**
 * Mock Data Module for Development and Testing
 * 
 * This module provides mock user data and API functions for development
 * and testing purposes. These should not be used in production.
 * 
 * Usage:
 * - Import these functions in test files or during development
 * - Useful for testing components without a real backend
 * - Helps with UI development when backend is not available
 */

/**
 * Mock user profile data representing a typical user in the system.
 * 
 * This data structure matches the expected user object format
 * from the backend API and includes all standard user fields.
 * 
 * @type {Object}
 */
export const mockUserProfile = {
  _id: "mock-user-123",
  username: "testuser",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  role: "user",
  
  // User preferences
  theme: "dark",
  prefersImperial: true,
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12-hour",
  preferredTimezone: "America/New_York",
  
  // Timestamps (typically added by backend)
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
};

/**
 * Mock function that simulates updating a user profile.
 * 
 * @param {Object} updateData - The profile data to update
 * @returns {Promise<Object>} Promise that resolves to updated mock user profile
 * 
 * Usage:
 * ```javascript
 * const updatedUser = await mockUpdateProfile({ theme: 'light' });
 * ```
 */
export const mockUpdateProfile = async (updateData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Merge update data with existing mock profile
  const updatedProfile = { 
    ...mockUserProfile, 
    ...updateData,
    updatedAt: new Date().toISOString() // Update timestamp
  };
  
  return updatedProfile;
};

/**
 * Mock function that simulates fetching a user profile.
 * 
 * @returns {Promise<Object>} Promise that resolves to mock user profile
 * 
 * Usage:
 * ```javascript
 * const userProfile = await mockGetProfile();
 * ```
 */
export const mockGetProfile = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockUserProfile;
};

/**
 * Mock function that simulates authentication failure.
 * 
 * @returns {Promise} Promise that rejects with an authentication error
 * 
 * Usage:
 * ```javascript
 * try {
 *   await mockAuthFailure();
 * } catch (error) {
 *   console.log('Expected auth error:', error.message);
 * }
 * ```
 */
export const mockAuthFailure = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  throw new Error('Authentication failed - invalid credentials');
};

/**