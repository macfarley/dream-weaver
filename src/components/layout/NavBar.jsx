import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { DashboardContext } from "../../contexts/DashboardContext";
import ThemeToggle from "../ui/ThemeToggle";
import Loading from "../ui/Loading";
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

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const collapseRef = useRef(null);

  // Handle click outside to close mobile menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isMobileMenuOpen &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    // Handle escape key to close mobile menu
    function handleEscapeKey(event) {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

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

  /**
   * Toggles the mobile menu open/closed state
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * Closes the mobile menu (used when clicking nav links)
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      ref={navbarRef}
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
        
        {/* Brand logo that links to landing page */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center custom-navbar-logo"
          title="DreamWeaver Landing Page"
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
        onClick={toggleMobileMenu}
        aria-controls="navbarContent"
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? "Close navigation menu" : "Toggle navigation menu"}
      >
        <span className="navbar-toggler-icon" />
      </button>

      {/* Collapsible navigation menu */}
      <div 
        className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} 
        id="navbarContent"
        ref={collapseRef}
      >
        <ul className="navbar-nav ms-auto custom-navbar-nav">
          
          {/* Navigation for unauthenticated users */}
          {!user && (
            <>
              <li className="nav-item custom-nav-item">
                <Link 
                  className="nav-link" 
                  to="/about" 
                  title="Learn about DreamWeaver"
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link 
                  className="nav-link" 
                  to="/join" 
                  title="Sign up or log in"
                  onClick={closeMobileMenu}
                >
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
                    className="nav-link fw-bold"
                    to="/gotobed/wakeup"
                    title="Wake up from current sleep session"
                    aria-label="Wake up - you have an active sleep session"
                    onClick={closeMobileMenu}
                    style={{
                      backgroundColor: 'rgba(255, 193, 7, 0.1)', // Much more transparent yellow
                      color: '#ffc107',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 193, 7, 0.2)'; // Still very transparent on hover
                      e.target.style.textDecoration = 'none';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
                      e.target.style.textDecoration = 'none';
                    }}
                  >
                    <span style={{ textDecoration: 'none !important' }}>⏰</span> Wake Up
                  </Link>
                ) : (
                  /* User is not sleeping - show Go To Bed action */
                  <Link
                    className="nav-link fw-bold"
                    to="/gotobed"
                    title="Start a new sleep session"
                    aria-label="Go to bed - start tracking your sleep"
                    onClick={closeMobileMenu}
                    style={{
                      backgroundColor: 'rgba(13, 110, 253, 0.1)', // Much more transparent blue
                      color: '#0d6efd',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(13, 110, 253, 0.2)'; // Still very transparent on hover
                      e.target.style.textDecoration = 'none';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                      e.target.style.textDecoration = 'none';
                    }}
                  >
                    <span style={{ textDecoration: 'none !important' }}>🌙</span> Go To Bed
                  </Link>
                )}
              </li>

              {/* Main dashboard navigation links */}
              <li className="nav-item custom-nav-item">
                <Link 
                  className="nav-link" 
                  to="/dashboard" 
                  title="View your dashboard"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link 
                  className="nav-link" 
                  to="/journal" 
                  title="View your dream journal"
                  onClick={closeMobileMenu}
                >
                  Dream Journal
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link 
                  className="nav-link" 
                  to="/sleep" 
                  title="View your sleep history"
                  onClick={closeMobileMenu}
                >
                  Sleep History
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link 
                  className="nav-link" 
                  to="/bedrooms" 
                  title="Manage your bedrooms"
                  onClick={closeMobileMenu}
                >
                  Bedrooms
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link 
                  className="nav-link" 
                  to="/profile" 
                  title="Edit your profile"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
              </li>

              {/* Admin dashboard link - only visible to admin users */}
              {user.role === "admin" && (
                <li className="nav-item custom-nav-item">
                  <Link
                    className="nav-link text-warning"
                    to="/admin/dashboard"
                    title="Admin dashboard"
                    aria-label="Admin dashboard - administrative functions"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-cog me-1"></i>
                    Admin Dashboard
                  </Link>
                </li>
              )}

              {/* Home link */}
              <li className="nav-item custom-nav-item">
                <Link 
                  className="nav-link" 
                  to="/" 
                  title="Go to home page"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
              </li>

              {/* Logout action */}
              <li className="nav-item custom-nav-item">
                <button
                  className="nav-link btn btn-link text-danger"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
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
