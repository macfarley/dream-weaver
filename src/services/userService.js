import axios from 'axios';

// Create an Axios instance with base URL and credentials
const api = axios.create({
  baseURL: import.meta.env.VITE_BACK_END_SERVER_URL || '',
  withCredentials: true, // Allows cookies for authentication
});

// ====================
// Current User Routes
// ====================

/**
 * Fetch the current user's dashboard data.
 * @returns {Promise<Object>} Dashboard data
 */
function getDashboard() {
  return api.get('/users/dashboard')
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

/**
 * Fetch the current user's profile data.
 * @returns {Promise<Object>} Profile data
 */
function getProfile() {
  return api.get('/users/profile')
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

/**
 * Update the current user's profile data.
 * Uses Bearer token from localStorage for Authorization header.
 * @param {Object} data - Updated profile fields
 * @returns {Promise<Object>} Updated profile data
 */
async function updateProfile(data) {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${import.meta.env.VITE_BACK_END_SERVER_URL}/users/profile`,
    data,
    { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
  );
  return response.data;
}

/**
 * Fetch the current user's preferences.
 * @returns {Promise<Object>} Preferences data
 */
function getPreferences() {
  return api.get('/users/preferences')
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

/**
 * Update the current user's preferences.
 * @param {Object} data - Updated preferences
 * @returns {Promise<Object>} Updated preferences data
 */
function updatePreferences(data) {
  return api.put('/users/preferences', data)
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

// ====================
// Admin-only Routes
// ====================

/**
 * Fetch all users (admin only).
 * @returns {Promise<Array>} List of users
 */
function getAllUsers() {
  return api.get('/admin/users')
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

/**
 * Fetch a specific user by ID (admin only).
 * @param {string} id - User ID
 * @returns {Promise<Object>} User data
 */
function getUserById(id) {
  return api.get(`/admin/users/${id}`)
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

/**
 * Update a specific user by ID (admin only).
 * @param {string} id - User ID
 * @param {Object} data - Updated user fields
 * @returns {Promise<Object>} Updated user data
 */
function updateUserById(id, data) {
  return api.put(`/admin/users/${id}`, data)
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

/**
 * Delete a user by ID (admin only).
 * @param {string} id - User ID
 * @returns {Promise<Object>} Deletion result
 */
function deleteUserById(id) {
  return api.delete(`/admin/users/${id}`)
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

/**
 * Get the current user object from localStorage.
 * @returns {Object|null} User object or null if not found
 */
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Check if the current user has the admin role.
 * @returns {boolean} True if admin, false otherwise
 */
function isAdmin() {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Check if the given user ID matches the current user's ID.
 * @param {string} userId - ID to compare
 * @returns {boolean} True if same user, false otherwise
 */
function isSelf(userId) {
  const user = getCurrentUser();
  return user?._id === userId;
}


// ====================
// Exports
// ====================

export {
  getDashboard,
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  isAdmin,
  isSelf,
};
