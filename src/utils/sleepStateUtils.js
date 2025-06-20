/**
 * Sleep State Utilities
 * 
 * Centralized functions for determining sleep session state
 * to ensure consistency across all components.
 */

/**
 * Checks if the user has an active sleep session.
 * 
 * An active sleep session is one where:
 * - latestSleepData exists
 * - wakeUps is an array
 * - wakeUps array is empty (no wake-up events yet)
 * 
 * @param {Object} dashboardData - Dashboard context data
 * @returns {boolean} True if there's an active sleep session
 */
export const hasActiveSleepSession = (dashboardData) => {
  if (!dashboardData?.latestSleepData) {
    console.debug('No latestSleepData found');
    return false;
  }
  
  const { wakeUps } = dashboardData.latestSleepData;
  
  console.debug('Sleep state check:', {
    hasLatestSleepData: !!dashboardData.latestSleepData,
    wakeUps: wakeUps,
    isArray: Array.isArray(wakeUps),
    length: wakeUps?.length,
    sleepDataId: dashboardData.latestSleepData._id
  });
  
  // Check if wakeUps is an array and has no entries
  const isActive = Array.isArray(wakeUps) && wakeUps.length === 0;
  console.debug('Sleep session is active:', isActive);
  
  return isActive;
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
