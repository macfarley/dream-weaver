/**
 * Sleep Session Service - matches the actual backend API structure
 * Backend endpoints: /gotobed and /gotobed/wakeup
 */

const API_BASE = import.meta.env.VITE_BACK_END_SERVER_URL;

/**
 * Start a new sleep session
 * POST /gotobed
 */
const startSleepSession = async (sessionData, token) => {
  const response = await fetch(`${API_BASE}/gotobed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sessionData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to start sleep session');
  }

  return await response.json();
};

/**
 * Add a wakeup event to the active sleep session
 * POST /gotobed/wakeup
 */
const addWakeupEvent = async (wakeupData, token) => {
  const response = await fetch(`${API_BASE}/gotobed/wakeup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(wakeupData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add wakeup event');
  }

  return await response.json();
};

/**
 * Check if user has an active sleep session
 * This would require a GET endpoint on the backend that checks for active sessions
 * For now, we'll handle this in the component logic
 */
const checkActiveSleepSession = async (token) => {
  // TODO: Add a backend endpoint for this, like GET /gotobed/active
  // For now, return null (no active session check)
  return null;
};

const sleepSessionService = {
  startSleepSession,
  addWakeupEvent,
  checkActiveSleepSession,
};

export default sleepSessionService;
