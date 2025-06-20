import api from './apiConfig.js';

/**
 * Sleep Session Service - matches the actual backend API structure
 * Backend endpoints: /gotobed and /gotobed/wakeup
 * 
 * Uses centralized axios instance with automatic authentication.
 */

/**
 * Start a new sleep session
 * POST /gotobed
 */
const startSleepSession = async (sessionData) => {
  try {
    const response = await api.post('/gotobed', sessionData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || 'Bad request';
      throw new Error(errorMessage);
    }
    throw new Error(error.response?.data?.message || 'Failed to start sleep session');
  }
};

/**
 * Add a wakeup event to the active sleep session
 * POST /gotobed/wakeup
 */
const addWakeupEvent = async (wakeupData) => {
  try {
    const response = await api.post('/gotobed/wakeup', wakeupData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || 'Bad request';
      throw new Error(errorMessage);
    }
    throw new Error(error.response?.data?.message || 'Failed to add wakeup event');
  }
};

/**
 * Check if user has an active sleep session
 * GET /gotobed/active
 */
const checkActiveSleepSession = async () => {
  try {
    const response = await api.get('/gotobed/active');
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // No active session found
      return { hasActiveSession: false };
    }
    throw new Error(error.response?.data?.message || 'Failed to check active sleep session');
  }
};

const sleepSessionService = {
  startSleepSession,
  addWakeupEvent,
  checkActiveSleepSession,
};

export default sleepSessionService;
