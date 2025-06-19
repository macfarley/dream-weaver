import api from './apiConfig.js';

/**
 * Admin Service
 * 
 * Handles all admin-specific API calls using the /admin/ routes.
 * These functions require admin authentication and use the admin endpoints.
 * Uses centralized axios instance with automatic authentication.
 */

// Get all users (admin only) - sorted by role (admins first), then alphabetically by username
async function getAllUsers() {
  try {
    const response = await api.get('/admin/users');
    const data = response.data;
    
    // Handle different response formats
    const users = Array.isArray(data) ? data : data.users || data.data || [];
    
    // Sort users: admins first, then regular users, both alphabetically by username
    return users.sort((a, b) => {
      // First sort by role (admin comes before user)
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (b.role === 'admin' && a.role !== 'admin') return 1;
      
      // Then sort alphabetically by username within the same role
      return (a.username || '').localeCompare(b.username || '');
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
}

// Get specific user by ID (admin can view any user)
async function getUserById(userId) {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    const data = response.data;
    
    // Handle different response formats
    return data.user || data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
}

// Update user profile (admin can edit any user)
async function updateUserProfile(userId, profileData) {
  try {
    const response = await api.put(`/admin/users/${userId}`, profileData);
    const data = response.data;
    
    // Handle different response formats
    return data.user || data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to update user profile');
  }
}

// Delete user (admin only, requires admin password confirmation)
async function deleteUser(userId, adminPassword) {
  try {
    const response = await api.delete(`/admin/users/${userId}`, {
      headers: {
        'x-admin-password': adminPassword, // Admin password in header as expected by backend
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    const errorMessage = error.response?.data?.message || 'Failed to delete user';
    throw new Error(errorMessage);
  }
}

export { 
  getAllUsers, 
  getUserById, 
  updateUserProfile, 
  deleteUser 
};
