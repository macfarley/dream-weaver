import axios from 'axios';

/**
 * User Service Module
 * 
 * This service handles all user-related API operations including:
 * - Current user profile management
 * - User preferences management  
 * - Admin user management operations
 * - User authentication state utilities
 * 
 * API Configuration:
 * - Uses base URL from environment variable VITE_BACK_END_SERVER_URL
 * - Includes credentials for cookie-based authentication
 * - Uses Bearer token authentication for protected routes
 */

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_BACK_END_SERVER_URL || '',
  withCredentials: true, // Allows cookies for authentication
});

// ====================
// Current User Profile Operations
// ====================

/**
 * Fetches the current authenticated user's profile data.
 * 
 * @returns {Promise<Object>} Promise that resolves to user profile data
 * @throws {Error} Throws error if request fails or user is not authenticated
 * 
 * Required: User must be authenticated with valid token in localStorage
 * 
 * Response includes: username, firstName, lastName, email, preferences, etc.
 */
async function getProfile() {
  // Get authentication token from localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACK_END_SERVER_URL}/users/profile`,
      { 
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    
    return response.data;
  } catch (error) {
    // Provide more specific error messages based on response status
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('User profile not found.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile.');
    }
  }
}

/**
 * Updates the current authenticated user's profile data.
 * 
 * @param {Object} profileData - Object containing profile fields to update
 * @param {string} [profileData.firstName] - User's first name
 * @param {string} [profileData.lastName] - User's last name  
 * @param {string} [profileData.email] - User's email address
 * @param {string} [profileData.theme] - User's theme preference ('light' or 'dark')
 * @param {boolean} [profileData.prefersImperial] - Temperature unit preference
 * @param {string} [profileData.dateFormat] - Date format preference
 * @param {string} [profileData.timeFormat] - Time format preference
 * @returns {Promise<Object>} Promise that resolves to updated profile data
 * @throws {Error} Throws error if request fails or validation errors occur
 */
async function updateProfile(profileData) {
  // Validate required data
  if (!profileData || typeof profileData !== 'object') {
    throw new Error('Profile data is required and must be an object.');
  }

  // Get authentication token from localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACK_END_SERVER_URL}/users/profile`,
      profileData,
      { 
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true 
      }
    );
    
    return response.data;
  } catch (error) {
    // Provide specific error messages based on response
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid profile data provided.');
    } else if (error.response?.status === 409) {
      throw new Error('Email address is already in use by another account.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to update profile.');
    }
  }
}

// ====================
// User Preferences Operations  
// ====================

/**
 * Fetches the current user's preferences (theme, units, formats, etc.).
 * 
 * @returns {Promise<Object>} Promise that resolves to user preferences object
 * @throws {Error} Throws error if request fails
 */
function getPreferences() {
  return api.get('/users/preferences')
    .then(response => response.data)
    .catch(error => {
      const message = error.response?.data?.message || 'Failed to fetch user preferences.';
      throw new Error(message);
    });
}

/**
 * Updates the current user's preferences.
 * 
 * @param {Object} preferencesData - Object containing preference fields to update
 * @returns {Promise<Object>} Promise that resolves to updated preferences
 * @throws {Error} Throws error if request fails or validation errors occur
 */
function updatePreferences(preferencesData) {
  if (!preferencesData || typeof preferencesData !== 'object') {
    throw new Error('Preferences data is required and must be an object.');
  }

  return api.put('/users/preferences', preferencesData)
    .then(response => response.data)
    .catch(error => {
      const message = error.response?.data?.message || 'Failed to update preferences.';
      throw new Error(message);
    });
}

// ====================
// Admin-Only Operations
// ====================

/**
 * Fetches all users in the system (admin only).
 * 
 * @returns {Promise<Array>} Promise that resolves to array of user objects
 * @throws {Error} Throws error if request fails or user lacks admin privileges
 */
function getAllUsers() {
  return api.get('/admin/users')
    .then(response => response.data)
    .catch(error => {
      if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      const message = error.response?.data?.message || 'Failed to fetch users.';
      throw new Error(message);
    });
}

/**
 * Fetches a specific user by their ID (admin only).
 * 
 * @param {string} userId - The unique ID of the user to fetch
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Promise that resolves to user data
 * @throws {Error} Throws error if user not found or insufficient privileges
 */
function getUserById(userId, token) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a string.');
  }

  if (!token) {
    throw new Error('Authentication token is required.');
  }

  return api.get(`/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(response => response.data)
    .catch(error => {
      if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      }
      const message = error.response?.data?.message || 'Failed to fetch user.';
      throw new Error(message);
    });
}

/**
 * Updates a specific user by their ID (admin only).
 * 
 * @param {string} userId - The unique ID of the user to update
 * @param {Object} updateData - Object containing fields to update
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Promise that resolves to updated user data
 * @throws {Error} Throws error if update fails or insufficient privileges
 */
function updateUserById(userId, updateData, token) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a string.');
  }
  
  if (!updateData || typeof updateData !== 'object') {
    throw new Error('Update data is required and must be an object.');
  }

  if (!token) {
    throw new Error('Authentication token is required.');
  }

  return api.put(`/admin/users/${userId}`, updateData, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(response => response.data)
    .catch(error => {
      if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid update data provided.');
      }
      const message = error.response?.data?.message || 'Failed to update user.';
      throw new Error(message);
    });
}

/**
 * Deletes a user by their ID (admin only).
 * 
 * @param {string} userId - The unique ID of the user to delete
 * @param {string} password - Admin password for confirmation
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Promise that resolves to deletion confirmation
 * @throws {Error} Throws error if deletion fails or insufficient privileges
 */
function deleteUserById(userId, password, token) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a string.');
  }

  if (!password) {
    throw new Error('Admin password confirmation is required.');
  }

  if (!token) {
    throw new Error('Authentication token is required.');
  }

  return api.delete(`/admin/users/${userId}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'x-admin-password': password // Send password in header as expected by backend
    }
  })
    .then(response => response.data)
    .catch(error => {
      if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid password provided.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      }
      const message = error.response?.data?.message || 'Failed to delete user.';
      throw new Error(message);
    });
}

// ====================
// User State Utility Functions
// ====================

/**
 * Retrieves the current user object from localStorage.
 * 
 * @returns {Object|null} User object if found, null if not logged in or data invalid
 * 
 * Note: This reads from localStorage, not from the server.
 * Use getProfile() if you need fresh data from the server.
 */
function getCurrentUser() {
  try {
    const userDataString = localStorage.getItem('user');
    
    if (!userDataString) {
      return null; // No user data found
    }
    
    const userData = JSON.parse(userDataString);
    
    // Basic validation that we have a valid user object
    if (!userData || typeof userData !== 'object' || !userData._id) {
      console.warn('Invalid user data found in localStorage');
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
}

/**
 * Checks if the current user has admin privileges.
 * 
 * @returns {boolean} True if current user is an admin, false otherwise
 * 
 * Usage: Use this before calling admin-only functions or showing admin UI elements
 */
function isAdmin() {
  const currentUser = getCurrentUser();
  return currentUser?.role === 'admin';
}

/**
 * Checks if the provided user ID matches the current authenticated user's ID.
 * 
 * @param {string} userIdToCheck - The user ID to compare against current user
 * @returns {boolean} True if the ID matches current user, false otherwise
 * 
 * Usage: Use this for authorization checks to ensure users only access their own data
 */
function isSelf(userIdToCheck) {
  const currentUser = getCurrentUser();
  
  if (!currentUser || !userIdToCheck) {
    return false;
  }
  
  // Compare both _id and id fields for compatibility with different JWT formats
  return currentUser._id === userIdToCheck || currentUser.id === userIdToCheck;
}

// ====================
// Module Exports
// ====================

export {
  // Profile operations
  getProfile,
  updateProfile,
  
  // Preferences operations
  getPreferences,
  updatePreferences,
  
  // Admin operations
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  
  // Utility functions
  getCurrentUser,
  isAdmin,
  isSelf,
};
