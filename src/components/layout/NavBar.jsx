import { useRef, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import ThemeToggle from "../ui/ThemeToggle";
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
  // Hook for programmatic navigation (redirects, back button, etc.)
  const navigate = useNavigate();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const collapseRef = useRef(null);

  // User context for authentication state
  const { user, logOut } = useContext(UserContext);

  // Toggle the mobile menu open/closed state
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu (used when clicking nav links)
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      ref={navbarRef}
      className="navbar navbar-expand-lg px-3 custom-navbar navbar-light"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Left section: Back button and brand logo */}
      <div className="d-flex align-items-center me-3 custom-navbar-left">
        {/* Conditionally show back button on all pages except home */}
        {window.location.pathname !== '/' && (
          <button
            className="btn btn-outline-light me-2 custom-back-button"
            onClick={() => navigate(-1)}
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

      {/* Center section: Welcome message - hidden on larger screens */}
      <span className="navbar-text me-3 custom-navbar-welcome d-lg-none" aria-live="polite">
        Welcome to DreamWeaver
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
        role="menu"
      >
        <ul className="navbar-nav ms-auto custom-navbar-nav" role="menubar">
          {/* Always show all navigation links, relying on route protection for auth */}
          <li className="nav-item custom-nav-item">
            <Link className="nav-link" to="/about" onClick={closeMobileMenu} role="menuitem" title="About DreamWeaver">About</Link>
          </li>
          <li className="nav-item custom-nav-item">
            <Link className="nav-link" to="/join" onClick={closeMobileMenu} role="menuitem" title="Join DreamWeaver">Join Us</Link>
          </li>
          <li className="nav-item custom-nav-item">
            <Link className="nav-link" to="/dashboard" onClick={closeMobileMenu} role="menuitem" title="Your Dashboard">Dashboard</Link>
          </li>
          <li className="nav-item custom-nav-item">
            <Link className="nav-link" to="/dreams" onClick={closeMobileMenu} role="menuitem" title="Dream Journal">Dream Journal</Link>
          </li>
          <li className="nav-item custom-nav-item">
            <Link className="nav-link" to="/sleep" onClick={closeMobileMenu} role="menuitem" title="Sleep History">Sleep History</Link>
          </li>
          <li className="nav-item custom-nav-item">
            <Link className="nav-link" to="/bedrooms" onClick={closeMobileMenu} role="menuitem" title="Your Bedrooms">Bedrooms</Link>
          </li>
          <li className="nav-item custom-nav-item">
            <Link className="nav-link" to="/profile" onClick={closeMobileMenu} role="menuitem" title="Your Profile">Profile</Link>
          </li>
          <li className="nav-item custom-nav-item">
            <Link className="nav-link text-warning" to="/admin/dashboard" onClick={closeMobileMenu} role="menuitem" title="Admin Dashboard">Admin Dashboard</Link>
          </li>
          <li className="nav-item custom-nav-item">
            <Link className="nav-link" to="/" onClick={closeMobileMenu} role="menuitem" title="Home">Home</Link>
          </li>
          {/* Show logout if logged in */}
          {user && (
            <li className="nav-item custom-nav-item">
              <button className="nav-link btn btn-link text-danger" onClick={logOut} role="menuitem" title="Log out">Logout</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
