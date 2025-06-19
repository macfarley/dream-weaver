import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { DashboardContext } from "../../contexts/DashboardContext";
import ThemeToggle from "../shared/ThemeToggle";
import Loading from "../shared/Loading";
import DWLogo from "../../assets/DW-Logo.png";

/**
 * Navbar component provides the main navigation interface for the DreamWeaver app.
 * 
 * Features:
 * - Responsive Bootstrap navbar with brand logo
 * - User authentication state display (login/logout)
 * - Sleep session status indicators 
 * - Back navigation button on non-home pages
 * - Theme toggle integration
 * - Quick access to key app functions (Go To Bed, Wake Up)
 * 
 * States:
 * - Shows loading while dashboard data is being fetched
 * - Adapts navigation options based on user login status
 * - Displays active sleep session indicators
 * - Shows appropriate actions based on current sleep state
 * 
 * Dependencies:
 * - UserContext: For user authentication state and logout
 * - DashboardContext: For dashboard data and sleep session status
 * - ThemeToggle: For theme switching functionality
 * 
 * Navigation Flow:
 * - Home page: Shows basic brand and login/signup options
 * - Dashboard pages: Shows user info, sleep actions, and full navigation
 * - Active sleep: Emphasizes wake up action
 * - No active sleep: Emphasizes go to bed action
 */
function Navbar() {
  // Get user authentication state and logout function from UserContext
  const { user, logOut } = useContext(UserContext);

  // Get dashboard context which provides loading state, data, and theme functions
  const dashboardCtx = useContext(DashboardContext);

  // Hook for programmatic navigation (redirects, back button, etc.)
  const navigate = useNavigate();

  // Show loading spinner while dashboard data is being fetched or context is not ready
  if (!dashboardCtx || dashboardCtx.loading) {
    return <Loading message="Loading navigation..." />;
  }

  // Destructure dashboard data with fallback defaults
  const { 
    dashboardData, 
    theme = "light", 
    toggleTheme = () => console.warn("toggleTheme not available") 
  } = dashboardCtx;

  // Extract username from dashboard data, with fallback to user context or "Guest"
  const username = dashboardData?.profile?.username || user?.username || "Guest";

  // Determine if user has an active sleep session by checking if latest session has no wake-ups
  const hasActiveSleep = 
    dashboardData?.latestSleepData && 
    Array.isArray(dashboardData.latestSleepData.wakeUps) &&
    dashboardData.latestSleepData.wakeUps.length === 0;

  /**
   * Handles user logout process.
   * Calls the logout function from UserContext and redirects to home page.
   */
  const handleLogout = () => {
    try {
      logOut(); // Clear user session and localStorage
      navigate("/"); // Redirect to home page
    } catch (error) {
      console.error("Logout error:", error);
      // Still try to navigate even if logout has issues
      navigate("/");
    }
  };

  /**
   * Navigates back to the previous page in browser history.
   * Uses React Router's navigate function with -1 to go back.
   */
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <nav
      className="navbar navbar-expand-lg px-3 custom-navbar"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Left section: Back button and brand logo */}
      <div className="d-flex align-items-center me-3 custom-navbar-left">
        {/* Conditionally show back button on all pages except home */}
        {window.location.pathname !== '/' && (
          <button
            className="btn btn-outline-light me-2 custom-back-button"
            onClick={handleBack}
            title="Go back to previous page"
            aria-label="Go back to previous page"
          >
            ← Back
          </button>
        )}
        
        {/* Brand logo that links to dashboard (if logged in) or home (if not) */}
        <Link
          to={user ? "/dashboard" : "/"}
          className="navbar-brand d-flex align-items-center custom-navbar-logo"
          title="DreamWeaver Home"
          tabIndex={0}
        >
          <img
            src={DWLogo}
            alt="DreamWeaver Logo"
            style={{
              maxHeight: "40px",
              maxWidth: "120px",
              objectFit: "contain",
            }}
            loading="lazy"
          />
        </Link>
      </div>

      {/* Center section: Welcome message with username */}
      <span className="navbar-text me-3 custom-navbar-welcome" aria-live="polite">
        Welcome, {username}
      </span>

      {/* Theme toggle section */}
      <div className="me-3 d-flex align-items-center custom-theme-toggle">
        <ThemeToggle />
      </div>

      {/* Mobile navigation toggle button */}
      <button
        className="navbar-toggler custom-navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation menu"
      >
        <span className="navbar-toggler-icon" />
      </button>

      {/* Collapsible navigation menu */}
      <div className="collapse navbar-collapse" id="navbarContent">
        <ul className="navbar-nav ms-auto custom-navbar-nav">
          
          {/* Navigation for unauthenticated users */}
          {!user && (
            <>
              <li className="nav-item custom-nav-item">
                <Link className="nav-link" to="/about" title="Learn about DreamWeaver">
                  About
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link className="nav-link" to="/join" title="Sign up or log in">
                  Join Us
                </Link>
              </li>
            </>
          )}

          {/* Navigation for authenticated users */}
          {user && (
            <>
              {/* Primary sleep action based on current sleep state */}
              <li className="nav-item custom-nav-item">
                {hasActiveSleep ? (
                  /* User is currently sleeping - show Wake Up action */
                  <Link
                    className="nav-link fw-bold text-success"
                    to="/gotobed/wakeup"
                    title="Wake up from current sleep session"
                    aria-label="Wake up - you have an active sleep session"
                  >
                    ⏰ Wake Up
                  </Link>
                ) : (
                  /* User is not sleeping - show Go To Bed action */
                  <Link
                    className="nav-link fw-bold text-primary"
                    to="/gotobed"
                    title="Start a new sleep session"
                    aria-label="Go to bed - start tracking your sleep"
                  >
                    🌙 Go To Bed
                  </Link>
                )}
              </li>

              {/* Main dashboard navigation links */}
              <li className="nav-item custom-nav-item">
                <Link className="nav-link" to="/dashboard" title="View your dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link className="nav-link" to="/journal" title="View your dream journal">
                  Dream Journal
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link className="nav-link" to="/sleep" title="View your sleep history">
                  Sleep History
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link className="nav-link" to="/bedrooms" title="Manage your bedrooms">
                  Bedrooms
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link className="nav-link" to="/profile" title="Edit your profile">
                  Profile
                </Link>
              </li>

              {/* Admin dashboard link - only visible to admin users */}
              {user.role === "admin" && (
                <li className="nav-item custom-nav-item">
                  <Link
                    className="nav-link text-warning"
                    to="/admin"
                    title="Admin dashboard"
                    aria-label="Admin dashboard - administrative functions"
                  >
                    Admin Dashboard
                  </Link>
                </li>
              )}

              {/* Logout action */}
              <li className="nav-item custom-nav-item">
                <button
                  className="nav-link btn btn-link text-danger"
                  onClick={handleLogout}
                  title="Log out of your account"
                  aria-label="Log out"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
