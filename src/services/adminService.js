const API_BASE = import.meta.env.VITE_BACK_END_SERVER_URL;
import { getToken } from './authService';

/**
 * Admin Service
 * 
 * Handles all admin-specific API calls using the /admin/ routes.
 * These functions require admin authentication and use the admin endpoints.
 */

// Get all users (admin only) - sorted by role (admins first), then alphabetically by username
async function getAllUsers() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  
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
}

// Get specific user by ID (admin can view any user)
async function getUserById(userId) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  const data = await res.json();
  
  // Handle different response formats
  return data.user || data;
}

// Update user profile (admin can edit any user)
async function updateUserProfile(userId, profileData) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  const data = await res.json();
  
  // Handle different response formats
  return data.user || data;
}

// Delete user (admin only, requires admin password confirmation)
async function deleteUser(userId, adminPassword) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-admin-password': adminPassword, // Admin password in header as expected by backend
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete user');
  }
  return await res.json();
}

export { 
  getAllUsers, 
  getUserById, 
  updateUserProfile, 
  deleteUser 
};
