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

import { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, logOut } from '../services/authService';
import { getProfile } from '../services/userService';

// Create the context with default values for better TypeScript support
const UserContext = createContext({
  user: null,
  loading: true,
  setUser: () => {},
  refreshUserProfile: () => {},
  logOut: () => {},
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

  // Loads user profile from backend using GET /users/profile
  const loadUserProfile = useCallback(async () => {
    try {
      // Get token from localStorage
      const token = getToken();
      if (!token) {
        console.debug('[UserContext] No token found, not fetching profile. Setting user to null.');
        setUser(null);
        setLoading(false);
        return;
      }
      console.debug('[UserContext] Token found, fetching profile...');
      // Always fetch the full user profile from backend
      const profile = await getProfile();
      console.debug('[UserContext] Profile loaded:', profile);
      setUser(profile);
      setLoading(false);
    } catch (error) {
      console.error('[UserContext] Error loading user profile:', error);
      setUser(null);
      setLoading(false);
      if (error.name === 'SyntaxError') logOut();
      // Debug log for user being set to null due to error
      console.debug('[UserContext] Setting user to null due to error:', error);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleLogout = () => {
    logOut();
    setUser(null);
    console.debug('[UserContext] handleLogout called, user set to null.');
  };

  // After login or profile update, set user from API response
  const setUserFromApi = (userObj) => {
    if (userObj && userObj._id) {
      setUser(userObj);
      console.debug('[UserContext] setUserFromApi called, user set:', userObj);
    } else {
      setUser(null);
      console.debug('[UserContext] setUserFromApi called with invalid user, user set to null.');
    }
  };

  // This method can be called after user profile/preferences updates to refresh context
  const refreshUserProfile = async () => {
    setLoading(true);
    await loadUserProfile();
  };

  // Expose preferences directly for convenience
  const preferences = user?.userPreferences || {};

  const contextValue = {
    user,
    preferences, // <-- add this line
    setUser: setUserFromApi,
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
