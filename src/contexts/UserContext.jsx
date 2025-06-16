import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, decodeToken, logOut } from '../services/authService';
import * as userService from '../services/userService';

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token + fetch full profile with preferences
  const loadUserProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const decoded = decodeToken(token);
      if (!decoded) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Fetch full user data from backend by id, including preferences
      const fullUser = await userService.getUserById(decoded._id);
      setUser(fullUser);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
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
