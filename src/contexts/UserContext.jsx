/**
 * UserContext provides user authentication state and methods throughout the app.
 * 
 * This context handles:
 * - Loading user data from JWT tokens stored in localStorage
 * - Managing authentication state (loading, user data, errors)
 * - Providing logout functionality
 * - Handling token validation and refresh
 * 
 * The user data comes from JWT token payload since the backend doesn't have
 * a dedicated GET /users/profile endpoint.
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, decodeToken, logOut } from '../services/authService';

// Create the context with default values for better TypeScript support
const UserContext = createContext({
  user: null,
  loading: true,
  error: null,
  refreshUser: () => {},
  logout: () => {},
});

/**
 * UserProvider component manages user authentication state.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
function UserProvider({ children }) {
  // User state: contains user data from decoded JWT token
  const [user, setUser] = useState(null);
  
  // Loading state: true while checking authentication status
  const [loading, setLoading] = useState(true);
  
  // Error state: contains any authentication-related errors
  const [error, setError] = useState(null);

  /**
   * Loads user profile from JWT token stored in localStorage.
   * This function is memoized to prevent unnecessary re-renders.
   */
  const loadUserProfile = useCallback(async () => {
    try {
      // Clear any previous errors
      setError(null);
      
      // Get token from localStorage
      const token = getToken();
      
      // If no token exists, user is not logged in
      if (!token) {
        console.info('No authentication token found - user not logged in');
        setUser(null);
        return;
      }

      // Attempt to decode the JWT token
      const decodedUser = decodeToken(token);
      
      // If token is invalid or expired, clear it and log out
      if (!decodedUser) {
        console.warn('Invalid or expired token found, logging out');
        logOut(); // Remove invalid token from localStorage
        setUser(null);
        setError('Your session has expired. Please log in again.');
        return;
      }

      // Check if token has required user information
      if (!decodedUser._id || !decodedUser.username) {
        console.error('Token missing required user information:', decodedUser);
        logOut();
        setUser(null);
        setError('Invalid user session. Please log in again.');
        return;
      }

      // Token is valid - set user data
      console.info('Successfully loaded user from token:', decodedUser.username);
      setUser(decodedUser);
      
      // Development mode: handle mock user data for testing
      if (import.meta.env.DEV && token === 'mock-jwt-token') {
        try {
          const mockUser = localStorage.getItem('user');
          if (mockUser) {
            const parsedMockUser = JSON.parse(mockUser);
            console.info('🧪 Using mock user data for development:', parsedMockUser.username);
            setUser(parsedMockUser);
          }
        } catch (parseError) {
          console.warn('Failed to parse mock user data:', parseError);
          // Continue with decoded token data
        }
      }
      
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load user session. Please try logging in again.');
      setUser(null);
      
      // If there's a critical error, clear potentially corrupted token
      if (error.name === 'SyntaxError') {
        console.warn('Corrupted token detected, clearing localStorage');
        logOut();
      }
    }
  }, []); // No dependencies needed since we only use imported functions

  useEffect(() => {
    loadUserProfile();
    
    // Add listener for mock user updates in development
    if (import.meta.env.DEV) {
      const handleMockUserUpdate = (event) => {
        console.log('🔄 Mock user update received:', event.detail.user);
        setUser(event.detail.user);
      };
      
      window.addEventListener('mockUserUpdate', handleMockUserUpdate);
      
      return () => {
        window.removeEventListener('mockUserUpdate', handleMockUserUpdate);
      };
    }
  }, [loadUserProfile]);

  const handleLogout = () => {
    logOut();
    setUser(null);
  };

  // This method can be called after user profile/preferences updates to refresh context
  const refreshUserProfile = async () => {
    setLoading(true);
    await loadUserProfile();
  };

  const contextValue = {
    user,
    setUser,
    logOut: handleLogout,
    loading,
    refreshUserProfile,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export { UserProvider, UserContext };
