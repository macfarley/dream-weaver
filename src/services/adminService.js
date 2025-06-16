const API_BASE = import.meta.env.VITE_BACK_END_SERVER_URL;
import { getToken } from './authService';

async function getAllUsers() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return await res.json();
}

async function getUserById(userId) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return await res.json();
}

export { getAllUsers, getUserById };
