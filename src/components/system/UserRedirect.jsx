import { useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isSelf } from "../../services/userService";
import Loading from "../ui/Loading";
import { UserContext } from "../../contexts/UserContext";

/**
 * UserRedirect component handles automatic redirection based on user authentication state.
 *
 * This component is used for routes that need to redirect users based on whether
 * they are accessing their own resources or someone else's.
 *
 * Logic:
 * - If the userId in the URL matches the current user (isSelf), redirect to /dashboard
 * - If the userId doesn't match (not self), redirect to /unauthorized
 * - If not authenticated, redirect to /auth/login
 * - Shows loading message while the redirect is being processed
 *
 * URL Parameters:
 * - userId: The user ID from the URL params to check against current user
 *
 * Security:
 * - Prevents users from accessing other users' private pages
 * - Provides graceful fallback to dashboard for authenticated users
 * - Redirects unauthenticated users to login page
 *
 * Usage:
 * - Typically used on routes like "/users/:userId/*"
 * - Ensures users only see their own data
 */
function UserRedirect() {
  // Extract userId parameter from the current URL
  const { userId } = useParams();
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Get user authentication state
  const { user, loading } = useContext(UserContext);

  useEffect(() => {
    if (loading) return; // Wait for auth state
    Promise.resolve().then(() => {
      if (!user) {
        // Not logged in - redirect to login
        navigate("/auth/login", { replace: true });
      } else if (isSelf(userId)) {
        // User is accessing their own resources - redirect to their dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // Logged in but not owner - unauthorized
        navigate("/unauthorized", { replace: true });
      }
    });
  }, [userId, navigate, user, loading]);

  // Show loading component while redirect is being processed
  return <Loading message="Redirecting you..." />;
}

export default UserRedirect;
