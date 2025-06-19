import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import Loading from '../shared/Loading';

/**
 * AdminOnlyRoute is a wrapper component that restricts access
 * to its children based on the user's admin status.
 * Uses UserContext for proper authentication state management.
 */
function AdminOnlyRoute({ children }) {
  const { user, loading } = useContext(UserContext);
  
  // Show loading while checking authentication
  if (loading) {
    return <Loading message="Verifying admin access..." />;
  }
  
  // Check if user is logged in and has admin role
  const userIsAdmin = user?.role === 'admin';

  if (!user) {
    // Not logged in - redirect to login
    return <Navigate to="/auth/login" replace />;
  }

  if (!userIsAdmin) {
    // Logged in but not admin - redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // User is admin - render the protected content
  return children;
}

export default AdminOnlyRoute;
