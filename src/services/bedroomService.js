import api from './apiConfig.js';

/**
 * Bedroom Service
 * 
 * Handles all bedroom-related API calls to the backend.
 * Uses centralized axios instance with automatic authentication.
 * 
 * Backend endpoints:
 * - GET /bedrooms - Get all bedrooms for authenticated user
 * - GET /bedrooms/by-name/:bedroomName - Get specific bedroom by name
 * - POST /bedrooms/new - Create new bedroom
 * - PUT /bedrooms/:id - Update existing bedroom
 * - DELETE /bedrooms/:id - Delete bedroom (requires password)
 */

/**
 * Fetches all bedrooms for the authenticated user.
 * 
 * @returns {Promise<Array>} Array of bedroom objects
 * @throws {Error} If request fails or user is not authenticated
 */
async function getBedrooms() {
  try {
    const response = await api.get('/bedrooms');
    
    // Log the actual response for debugging
    console.log('Bedrooms API response:', response.data);
    
    // Check if response has a data property (common API pattern)
    let bedroomArray;
    if (Array.isArray(response.data)) {
      bedroomArray = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      bedroomArray = response.data.data;
    } else if (response.data && Array.isArray(response.data.bedrooms)) {
      bedroomArray = response.data.bedrooms;
    } else {
      console.warn('Expected array of bedrooms, got:', typeof response.data, response.data);
      return [];
    }
    
    return bedroomArray;
    
  } catch (error) {
    // Backend returns 404 when user has no bedrooms - this is expected behavior
    if (error.response?.status === 404) {
      console.info('User has no bedrooms yet');
      return [];
    }
    
    // Handle other errors
    console.error('Error fetching bedrooms:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch bedrooms');
  }
}

/**
 * Legacy alias for getBedrooms function.
 * Maintained for backwards compatibility with existing code.
 * 
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} Array of bedroom objects
 * @deprecated Use getBedrooms() instead
 */
async function getBedroomsByUser(token) {
  return getBedrooms(token);
}

/**
 * Fetches a specific bedroom by its name.
 * Names are matched case-insensitively and URL-encoded for safety.
 * 
 * @param {string} bedroomName - The name of the bedroom to fetch
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Bedroom object
 * @throws {Error} If bedroom not found or user lacks permission
 */
async function getBedroomByName(bedroomName, token) {
  // Validate input parameters
  if (!bedroomName || typeof bedroomName !== 'string') {
    throw new Error('Bedroom name is required and must be a string');
  }
  
  if (!token || typeof token !== 'string') {
    throw new Error('Authentication token is required');
  }

  try {
    // URL encode the bedroom name to handle special characters safely
    const encodedName = encodeURIComponent(bedroomName);
    
    const response = await fetch(`${API_BASE}/bedrooms/by-name/${encodedName}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (response.status === 404) {
      throw new Error(`Bedroom "${bedroomName}" not found or you don't have permission to access it`);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch bedroom: ${response.status} - ${errorText}`);
    }
    
    const bedroomData = await response.json();
    
    // Basic validation of response structure
    if (!bedroomData || typeof bedroomData !== 'object') {
      throw new Error('Invalid bedroom data received from server');
    }
    
    return bedroomData;
    
  } catch (error) {
    console.error('Error in getBedroomByName:', error);
    throw error;
  }
}

/**
 * Creates a new bedroom for the authenticated user.
 * The user ID (ownerId) is automatically set by the backend using the JWT token.
 * 
 * @param {Object} bedroomData - Bedroom data object
 * @param {string} bedroomData.bedroomName - Name of the bedroom (required)
 * @param {string} bedroomData.bedType - Type of bed ('bed', 'futon', 'couch', 'floor')
 * @param {string} bedroomData.lightLevel - Light level ('pitch black', 'very dim', 'dim', 'normal', 'bright', 'daylight')
 * @param {string} bedroomData.noiseLevel - Noise level ('silent', 'very quiet', 'quiet', 'moderate', 'loud', 'very loud')
 * @param {number} bedroomData.temperature - Temperature in Fahrenheit (50-100)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Created bedroom object with _id
 * @throws {Error} If validation fails or creation unsuccessful
 */
async function createBedroom(bedroomData, token) {
  // Validate input parameters
  if (!bedroomData || typeof bedroomData !== 'object') {
    throw new Error('Bedroom data is required and must be an object');
  }
  
  if (!bedroomData.bedroomName || typeof bedroomData.bedroomName !== 'string') {
    throw new Error('Bedroom name is required and must be a string');
  }
  
  if (!token || typeof token !== 'string') {
    throw new Error('Authentication token is required');
  }

  try {
    const response = await fetch(`${API_BASE}/bedrooms/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bedroomData),
    });
    
    if (!response.ok) {
      // Try to extract detailed error message from backend
      let errorMessage = `Failed to create bedroom (${response.status})`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const newBedroom = await response.json();
    
    // Validate the response contains expected data
    if (!newBedroom || !newBedroom._id) {
      throw new Error('Invalid response: Created bedroom data is missing or malformed');
    }
    
    console.info('Successfully created bedroom:', newBedroom.bedroomName);
    return newBedroom;
    
  } catch (error) {
    console.error('Error in createBedroom:', error);
    throw error;
  }
}

async function updateBedroom(id, data, token) {
  const res = await fetch(`${API_BASE}/bedrooms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update bedroom');
  return await res.json();
}

async function deleteBedroom(id, password, token) {
  const res = await fetch(`${API_BASE}/bedrooms/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error('Failed to delete bedroom');
  return await res.json();
}

export { getBedrooms, getBedroomsByUser, getBedroomByName, createBedroom, updateBedroom, deleteBedroom };
