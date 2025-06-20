/**
 * Sleep State Utilities
 * 
 * Centralized functions for determining sleep session state
 * to ensure consistency across all components.
 */

/**
 * Checks if the user has an active sleep session according to frontend logic.
 * 
 * Frontend considers a session active when:
 * - latestSleepData exists
 * - wakeUps is an array
 * - wakeUps array is empty (no wake-up events yet)
 * 
 * Note: Backend may use different logic (e.g., checking finishedSleeping flag)
 * 
 * @param {Object} dashboardData - Dashboard context data
 * @returns {boolean} True if there's an active sleep session (frontend logic)
 */
export const hasActiveSleepSession = (dashboardData) => {
  if (!dashboardData?.latestSleepData) {
    return false;
  }
  
  const { wakeUps } = dashboardData.latestSleepData;
  
  // Check if wakeUps is an array and has no entries
  return Array.isArray(wakeUps) && wakeUps.length === 0;
};

/**
 * Checks if backend might consider the session active based on different criteria.
 * 
 * @param {Object} dashboardData - Dashboard context data
 * @returns {boolean} True if backend might consider session active
 */
export const backendMightConsiderActive = (dashboardData) => {
  if (!dashboardData?.latestSleepData) {
    return false;
  }
  
  const { wakeUps } = dashboardData.latestSleepData;
  
  // If no wakeUps or empty wakeUps, definitely active
  if (!Array.isArray(wakeUps) || wakeUps.length === 0) {
    return true;
  }
  
  // Check if the last wake-up doesn't have finishedSleeping: true
  const lastWakeUp = wakeUps[wakeUps.length - 1];
  return lastWakeUp?.finishedSleeping !== true;
};

/**
 * Gets the active sleep session data if one exists.
 * 
 * @param {Object} dashboardData - Dashboard context data
 * @returns {Object|null} Active sleep session data or null
 */
export const getActiveSleepSession = (dashboardData) => {
  if (hasActiveSleepSession(dashboardData)) {
    return dashboardData.latestSleepData;
  }
  return null;
};

/**
 * Checks if the user can start a new sleep session.
 * 
 * @param {Object} dashboardData - Dashboard context data
 * @returns {boolean} True if user can start a new sleep session
 */
export const canStartNewSleepSession = (dashboardData) => {
  return !hasActiveSleepSession(dashboardData);
};

/**
 * Gets a human-readable description of the current sleep state.
 * 
 * @param {Object} dashboardData - Dashboard context data
 * @returns {string} Description of current sleep state
 */
export const getSleepStateDescription = (dashboardData) => {
  if (hasActiveSleepSession(dashboardData)) {
    return 'You have an active sleep session';
  }
  return 'No active sleep session';
};
