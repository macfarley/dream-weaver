import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isSelf } from "../../services/userService";
import Loading from "../ui/Loading";

/**
 * UserRedirect component handles automatic redirection based on user authentication state.
 *
 * This component is used for routes that need to redirect users based on whether
 * they are accessing their own resources or someone else's.
 *
 * Logic:
 * - If the userId in the URL matches the current user (isSelf), redirect to /dashboard
 * - If the userId doesn't match (not self), redirect to home page "/"
 * - Shows loading message while the redirect is being processed
 *
 * URL Parameters:
 * - userId: The user ID from the URL params to check against current user
 *
 * Security:
 * - Prevents users from accessing other users' private pages
 * - Provides graceful fallback to dashboard for authenticated users
 * - Redirects unauthenticated users to home page
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

  /**
   * Effect to handle the redirection logic on component mount.
   * Uses Promise.resolve() to ensure async behavior and prevent render conflicts.
   */
  useEffect(() => {
    // Wrap the redirect logic in a promise to avoid synchronous navigation during render
    Promise.resolve().then(() => {
      // Check if the URL userId matches the current authenticated user
      if (isSelf(userId)) {
        // User is accessing their own resources - redirect to their dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // User is not authenticated or accessing someone else's resources - go to home
        navigate("/", { replace: true });
      }
    });
  }, [userId, navigate]); // Re-run if userId or navigate function changes

  // Show loading component while redirect is being processed
  return <Loading message="Redirecting you..." />;
}

export default UserRedirect;
