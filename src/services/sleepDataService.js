import api from './apiConfig.js';

/**
 * Sleep Data Service
 * 
 * Handles all API calls related to sleep sessions and data.
 * Uses centralized axios instance with automatic authentication.
 * Backend endpoint: /sleep-data/
 */

// Get all sleep data for current user
const getAll = async () => {
  try {
    const response = await api.get('/sleep-data/');
    
    // Handle different response formats (similar to bedroom service)
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data.sleepSessions)) {
      return response.data.sleepSessions;
    } else {
      console.warn('Expected array of sleep data, got:', typeof response.data, response.data);
      return [];
    }
  } catch (error) {
    // If endpoint doesn't exist (404), return empty array instead of throwing
    if (error.response?.status === 404) {
      console.warn('Sleep data endpoint not available yet');
      return [];
    }
    
    console.error('Error fetching sleep data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch sleep data');
  }
};

// Get specific sleep session by ID
const get = async (id) => {
  try {
    const response = await api.get(`/sleep-data/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sleep session:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch sleep session');
  }
};

// Get sleep session by date (for pretty URL support)
const getByDate = async (date) => {
  try {
    const response = await api.get(`/sleep-data/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sleep session by date:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch sleep session');
  }
};

// Create new sleep session
const create = async (payload) => {
  try {
    const response = await api.post('/sleep-data/', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating sleep session:', error);
    throw new Error(error.response?.data?.message || 'Failed to create sleep session');
  }
};

// Update sleep session
const update = async (id, payload) => {
  try {
    const response = await api.put(`/sleep-data/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating sleep session:', error);
    throw new Error(error.response?.data?.message || 'Failed to update sleep session');
  }
};

// Delete sleep session (requires password confirmation)
const remove = async (id, password) => {
  try {
    const response = await api.delete(`/sleep-data/${id}`, {
      data: { password }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting sleep session:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete sleep session');
  }
};

// Get sleep data by user ID (for dashboard context)
const getSleepDataByUser = async () => {
  return getAll(); // Same as getAll since user is determined by token
};

// Alternative function name that matches some backend expectations
const getSleepDataByDate = async (date) => {
  return getByDate(date);
};

export {
  getAll,
  get,
  getByDate,
  getSleepDataByDate, // Alias for getByDate
  create,
  update,
  remove as delete,
  getSleepDataByUser,
};
