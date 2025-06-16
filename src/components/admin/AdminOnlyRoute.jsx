import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AdminOnlyRoute is a wrapper component that restricts access
 * to its children based on the user's admin status.
 */
function AdminOnlyRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const userIsAdmin = user?.role === 'admin';

  if (!userIsAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default AdminOnlyRoute;
