/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls and token management.
 * Provides functions for user registration, login, logout, and token operations.
 * 
 * Features:
 * - JWT token storage and retrieval
 * - Secure token decoding and validation
 * - Error handling with user-friendly messages
 * - Automatic token cleanup on logout
 * 
 * Dependencies:
 * - Backend auth API endpoints
 * - localStorage for token persistence
 * - Base64 atob() for JWT decoding
 */

// Base URL for all authentication API endpoints
const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/auth`;

/**
 * Safely decodes a JWT token payload without verification.
 * 
 * Note: This only decodes the payload for reading user data.
 * Token verification happens on the backend.
 * 
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} Decoded payload object or null if invalid
 */
function decodeToken(token) {
  try {
    // JWT structure: header.payload.signature
    // We only need the payload (middle section)
    const payload = token.split('.')[1];
    
    // Decode base64 payload and parse JSON
    return JSON.parse(atob(payload));
  } catch (error) {
    console.warn('Failed to decode JWT token:', error.message);
    return null;
  }
}

/**
 * Retrieves the stored JWT token from localStorage.
 * 
 * @returns {string|null} The stored token or null if not found
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Logs out the user by removing the token from localStorage.
 * This effectively ends the user's session.
 */
function logOut() {
  localStorage.removeItem('token');
  console.info('User logged out - token removed');
}

/**
 * Handles authentication API responses consistently.
 * 
 * Processes the response, stores the token if present, and returns decoded user data.
 * Throws descriptive errors for various failure scenarios.
 * 
 * @param {Response} res - The fetch API response object
 * @returns {Promise<Object>} Decoded user data from the JWT token
 * @throws {Error} With user-friendly error messages
 */
async function handleAuthResponse(res) {
  let data;
  
  try {
    data = await res.json();
  } catch (parseError) {
    throw new Error('Server response was not valid JSON. Please try again.');
  }
  
  // Handle HTTP error status codes
  if (!res.ok) {
    const errorMessage = data.err || data.message || `Server error (${res.status})`;
    throw new Error(errorMessage);
  }
  
  // Handle application-level errors in successful HTTP responses
  if (data.err) {
    throw new Error(data.err);
  }
  
  // Successful authentication should include a token
  if (data.token) {
    // Store token for future API calls
    localStorage.setItem('token', data.token);
    
    // Decode and return user data
    const userData = decodeToken(data.token);
    if (!userData) {
      throw new Error('Received invalid token from server');
    }
    
    console.info('Authentication successful for user:', userData.username);
    return userData;
  }
  
  // No token in response indicates server error
  throw new Error('Authentication failed - no token received');
}

/**
 * Registers a new user account.
 * 
 * @param {Object} formData - User registration data
 * @param {string} formData.username - Desired username
 * @param {string} formData.email - User's email address
 * @param {string} formData.password - User's password
 * @param {string} formData.confirmPassword - Password confirmation
 * @param {string} formData.firstName - User's first name
 * @param {string} formData.lastName - User's last name
 * @param {string} formData.dateOfBirth - User's date of birth
 * @param {Object} [formData.preferences] - Optional user preferences
 * 
 * @returns {Promise<Object>} User data from decoded JWT token
 * @throws {Error} With user-friendly error messages
 */
async function signUp(formData) {
  try {
    const res = await fetch(`${BASE_URL}/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    return await handleAuthResponse(res);
  } catch (err) {
    console.error('SignUp service error:', err);
    
    // Re-throw with context for better debugging
    if (err.message.includes('fetch')) {
      throw new Error('Network error - please check your connection and try again');
    }
    
    throw err;
  }
}

/**
 * Authenticates an existing user.
 * 
 * @param {Object} formData - User login credentials
 * @param {string} formData.username - User's username
 * @param {string} formData.password - User's password
 * 
 * @returns {Promise<Object>} User data from decoded JWT token
 * @throws {Error} With user-friendly error messages
 */
async function signIn(formData) {
  try {
    const res = await fetch(`${BASE_URL}/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    return await handleAuthResponse(res);
  } catch (err) {
    console.error('SignIn service error:', err);
    
    // Re-throw with context for better debugging
    if (err.message.includes('fetch')) {
      throw new Error('Network error - please check your connection and try again');
    }
    
    throw err;
  }
}

/**
 * Exported authentication functions for use throughout the application.
 * 
 * Available functions:
 * - signUp: Register a new user account
 * - signIn: Authenticate an existing user
 * - getToken: Retrieve stored JWT token
 * - decodeToken: Decode JWT payload safely
 * - logOut: Remove token and end session
 */
export {
  signUp,
  signIn,
  getToken,
  decodeToken,
  logOut,
};
