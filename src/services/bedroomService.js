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
 * @returns {Promise<Array>} Array of bedroom objects
 * @deprecated Use getBedrooms() instead
 */
async function getBedroomsByUser() {
  return getBedrooms();
}

/**
 * Fetches a specific bedroom by its name.
 * Names are matched case-insensitively and URL-encoded for safety.
 * 
 * @param {string} bedroomName - The name of the bedroom to fetch
 * @returns {Promise<Object>} Bedroom object
 * @throws {Error} If bedroom not found or user lacks permission
 */
async function getBedroomByName(bedroomName) {
  // Validate input parameters
  if (!bedroomName || typeof bedroomName !== 'string') {
    throw new Error('Bedroom name is required and must be a string');
  }

  try {
    // URL encode the bedroom name to handle special characters safely
    const encodedName = encodeURIComponent(bedroomName);
    
    const response = await api.get(`/bedrooms/by-name/${encodedName}`);
    
    // Basic validation of response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid bedroom data received from server');
    }
    
    return response.data;
    
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Bedroom "${bedroomName}" not found or you don't have permission to access it`);
    }
    
    console.error('Error in getBedroomByName:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch bedroom');
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
 * @returns {Promise<Object>} Created bedroom object with _id
 * @throws {Error} If validation fails or creation unsuccessful
 */
async function createBedroom(bedroomData) {
  // Validate input parameters
  if (!bedroomData || typeof bedroomData !== 'object') {
    throw new Error('Bedroom data is required and must be an object');
  }
  
  if (!bedroomData.bedroomName || typeof bedroomData.bedroomName !== 'string') {
    throw new Error('Bedroom name is required and must be a string');
  }

  try {
    const response = await api.post('/bedrooms/new', bedroomData);
    
    // Validate the response contains expected data
    if (!response.data || !response.data._id) {
      throw new Error('Invalid response: Created bedroom data is missing or malformed');
    }
    
    console.info('Successfully created bedroom:', response.data.bedroomName);
    return response.data;
    
  } catch (error) {
    console.error('Error in createBedroom:', error);
    throw new Error(error.response?.data?.message || 'Failed to create bedroom');
  }
}

/**
 * Updates an existing bedroom.
 * 
 * @param {string} id - Bedroom ID
 * @param {Object} data - Updated bedroom data
 * @returns {Promise<Object>} Updated bedroom object
 * @throws {Error} If update fails
 */
async function updateBedroom(id, data) {
  try {
    const response = await api.put(`/bedrooms/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating bedroom:', error);
    throw new Error(error.response?.data?.message || 'Failed to update bedroom');
  }
}

/**
 * Deletes a bedroom (requires password confirmation).
 * 
 * @param {string} id - Bedroom ID
 * @param {string} password - User's password for confirmation
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
async function deleteBedroom(id, password) {
  try {
    const response = await api.delete(`/bedrooms/${id}`, {
      data: { password }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting bedroom:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete bedroom');
  }
}

export { getBedrooms, getBedroomsByUser, getBedroomByName, createBedroom, updateBedroom, deleteBedroom };
