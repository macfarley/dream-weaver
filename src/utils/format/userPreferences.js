/**
 * Utility functions for respecting user preferences throughout the app.
 */

/**
 * Formats a date according to user's preferred date format.
 * @param {Date|string} date - The date to format
 * @param {string} dateFormat - User's preferred date format ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, dateFormat = 'MM/DD/YYYY', options = {}) {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  // Default options
  const defaultOptions = {
    weekday: undefined,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    ...options
  };

  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return dateObj.toLocaleDateString('en-GB', defaultOptions);
    case 'YYYY-MM-DD':
      return dateObj.toLocaleDateString('en-CA', defaultOptions);
    case 'MM/DD/YYYY':
    default:
      return dateObj.toLocaleDateString('en-US', defaultOptions);
  }
}

/**
 * Formats a time according to user's preferred time format.
 * @param {Date|string} date - The date/time to format
 * @param {string} timeFormat - User's preferred time format ('12-hour' or '24-hour')
 * @returns {string} Formatted time string
 */
export function formatTime(date, timeFormat = '12-hour') {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12-hour'
  };

  return dateObj.toLocaleTimeString(undefined, options);
}

/**
 * Formats a session label (e.g., "Monday, Jan 1 night") according to user preferences.
 * @param {string} startDateStr - The session start date string
 * @param {string} dateFormat - User's preferred date format
 * @returns {string} Formatted session label
 */
export function formatSessionLabel(startDateStr, dateFormat = 'MM/DD/YYYY') {
  const date = new Date(startDateStr);
  const hour = date.getHours();
  const labelDate = new Date(date);

  // If session started before 4am, label as previous night
  const suffix = hour < 4 ? 'night' : 'morning';
  if (hour < 4) labelDate.setDate(labelDate.getDate() - 1);

  // Format according to user preference
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const formattedDate = formatDate(labelDate, dateFormat, options);
  
  return `${formattedDate} ${suffix}`;
}

/**
 * Converts temperature between Fahrenheit and Celsius.
 * @param {number} temp - Temperature value
 * @param {boolean} prefersImperial - Whether user prefers imperial units
 * @param {boolean} currentlyInFahrenheit - Whether the input temp is in Fahrenheit
 * @returns {number} Converted temperature
 */
export function convertTemperature(temp, prefersImperial, currentlyInFahrenheit = true) {
  if (prefersImperial && currentlyInFahrenheit) {
    return temp; // Already in Fahrenheit
  }
  if (!prefersImperial && !currentlyInFahrenheit) {
    return temp; // Already in Celsius
  }
  
  if (prefersImperial && !currentlyInFahrenheit) {
    // Convert C to F
    return Math.round((temp * 9/5) + 32);
  } else {
    // Convert F to C
    return Math.round((temp - 32) * 5/9);
  }
}

/**
 * Gets the temperature unit symbol based on user preference.
 * @param {boolean} prefersImperial - Whether user prefers imperial units
 * @returns {string} Temperature unit symbol
 */
export function getTemperatureUnit(prefersImperial) {
  return prefersImperial ? '°F' : '°C';
}

/**
 * Formats temperature with the appropriate unit based on user preference.
 * @param {number} temp - Temperature value
 * @param {boolean} prefersImperial - Whether user prefers imperial units
 * @param {boolean} currentlyInFahrenheit - Whether the input temp is in Fahrenheit
 * @returns {string} Formatted temperature with unit
 */
export function formatTemperature(temp, prefersImperial, currentlyInFahrenheit = true) {
  const convertedTemp = convertTemperature(temp, prefersImperial, currentlyInFahrenheit);
  const unit = getTemperatureUnit(prefersImperial);
  return `${convertedTemp}${unit}`;
}
