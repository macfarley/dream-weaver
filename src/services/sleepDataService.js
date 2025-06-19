const API_BASE = import.meta.env.VITE_BACK_END_SERVER_URL;

/**
 * Sleep Data Service
 * 
 * Handles all API calls related to sleep sessions and data.
 * Uses the correct backend endpoint: /sleep-data/
 */

// Get all sleep data for current user
const getAll = async (token) => {
  const res = await fetch(`${API_BASE}/sleep-data/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    // If endpoint doesn't exist (404), return empty array instead of throwing
    if (res.status === 404) {
      console.warn('Sleep data endpoint not available yet');
      return [];
    }
    throw new Error('Failed to fetch sleep data');
  }
  
  const sleepData = await res.json();
  
  // Log the actual response for debugging
  console.log('Sleep data API response:', sleepData);
  
  // Handle different response formats (similar to bedroom service)
  if (Array.isArray(sleepData)) {
    return sleepData;
  } else if (sleepData && Array.isArray(sleepData.data)) {
    return sleepData.data;
  } else if (sleepData && Array.isArray(sleepData.sleepSessions)) {
    return sleepData.sleepSessions;
  } else {
    console.warn('Expected array of sleep data, got:', typeof sleepData, sleepData);
    return [];
  }
};

// Get specific sleep session by ID
const get = async (id, token) => {
  const res = await fetch(`${API_BASE}/sleep-data/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch sleep session');
  return await res.json();
};

// Get sleep session by date (for pretty URL support)
const getByDate = async (date, token) => {
  const res = await fetch(`${API_BASE}/sleep-data/date/${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch sleep session');
  return await res.json();
};

// Create new sleep session
const create = async (payload, token) => {
  const res = await fetch(`${API_BASE}/sleep-data/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create sleep session');
  return await res.json();
};

// Update sleep session
const update = async (id, payload, token) => {
  const res = await fetch(`${API_BASE}/sleep-data/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update sleep session');
  return await res.json();
};

// Delete sleep session (requires password confirmation)
const remove = async (id, password, token) => {
  const res = await fetch(`${API_BASE}/sleep-data/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error('Failed to delete sleep session');
  return await res.json();
};

// Get sleep data by user ID (for dashboard context)
const getSleepDataByUser = async (token) => {
  return getAll(token); // Same as getAll since user is determined by token
};

// Alternative function name that matches some backend expectations
const getSleepDataByDate = async (date, token) => {
  return getByDate(date, token);
};

export default {
  getAll,
  get,
  getByDate,
  getSleepDataByDate, // Alias for getByDate
  create,
  update,
  delete: remove,
  getSleepDataByUser,
};
