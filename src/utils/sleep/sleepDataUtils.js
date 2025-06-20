/**
 * Sleep Data Utilities
 * 
 * Utility functions for processing sleep session data.
 */

/**
 * Converts a date string to a compact YYYYMMDD format.
 * @param {string} dateStr - The date string to format.
 * @returns {string} - The formatted date key.
 */
export function formatDateKey(dateStr) {
  const date = new Date(dateStr);
  // toISOString returns 'YYYY-MM-DDTHH:mm:ss.sssZ'
  // slice(0, 10) gets 'YYYY-MM-DD'
  // replace(/-/g, '') removes dashes
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Generates a human-readable label for a sleep session.
 * If the session started before 4am, it's considered the previous 'night'.
 * Otherwise, it's a 'morning' session.
 * @param {string} startDateStr - The session's start date string.
 * @returns {string} - The formatted session label.
 */
export function formatSessionLabel(startDateStr) {
  const date = new Date(startDateStr);
  const hour = date.getHours();
  const labelDate = new Date(date);

  // If session started before 4am, label as previous night
  const suffix = hour < 4 ? 'night' : 'morning';
  if (hour < 4) labelDate.setDate(labelDate.getDate() - 1);

  // Format: "Monday, Jan 1 night"
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  return `${labelDate.toLocaleDateString(undefined, options)} ${suffix}`;
}

/**
 * Calculates the total sleep duration from session start to last wake-up.
 * @param {string} start - The session's start date string.
 * @param {Array} wakeUps - Array of wake-up objects with 'awakenAt' property.
 * @returns {string|null} - Duration in "Xh Ym" format, or null if incomplete.
 */
export function calculateSleepDuration(start, wakeUps) {
  if (!wakeUps?.length) return null;
  const endTime = new Date(wakeUps[wakeUps.length - 1].awakenAt);
  const startTime = new Date(start);
  const durationMs = endTime - startTime;
  if (durationMs < 0) return null;

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  return `${hours}h ${minutes}m`;
}
