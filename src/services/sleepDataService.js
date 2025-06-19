const API_BASE = import.meta.env.VITE_BACK_END_SERVER_URL;

// Get all sleep data for current user
const getAll = async (token) => {
  const res = await fetch(`${API_BASE}/sleepdata`, {
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
  return await res.json();
};

// Get specific sleep session by ID
const get = async (id, token) => {
  const res = await fetch(`${API_BASE}/sleepdata/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch sleep session');
  return await res.json();
};

// Get sleep session by date (for pretty URL support)
const getByDate = async (date, token) => {
  const res = await fetch(`${API_BASE}/sleepdata/date/${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch sleep session');
  return await res.json();
};

// Create new sleep session
const create = async (payload, token) => {
  const res = await fetch(`${API_BASE}/sleepdata`, {
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
  const res = await fetch(`${API_BASE}/sleepdata/${id}`, {
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
  const res = await fetch(`${API_BASE}/sleepdata/${id}`, {
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

export default {
  getAll,
  get,
  getByDate,
  create,
  update,
  delete: remove,
  getSleepDataByUser,
};
