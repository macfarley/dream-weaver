const API_BASE = import.meta.env.VITE_BACK_END_SERVER_URL;

async function getBedrooms(token) {
  const res = await fetch(`${API_BASE}/bedrooms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch bedrooms');
  return await res.json();
}

async function createBedroom(data, token) {
  const res = await fetch(`${API_BASE}/bedrooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create bedroom');
  return await res.json();
}

// Similarly add updateBedroom(id, data, token), deleteBedroom(id, token)...

export { getBedrooms, createBedroom /*, updateBedroom, deleteBedroom */ };
