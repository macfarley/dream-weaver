import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { DashboardContext } from "../../contexts/DashboardContext";
import ThemeToggle from "../shared/ThemeToggle";
import Loading from "../shared/Loading";
import DWLogo from "../../assets/DW-Logo.png";

function Navbar() {
  // Get user and logout function from UserContext
  const { user, logOut } = useContext(UserContext);

  // Get dashboard context (dashboardData, loading, theme, toggleTheme)
  const dashboardCtx = useContext(DashboardContext);

  // For navigation (redirects, back, etc.)
  const navigate = useNavigate();

  // Show loading spinner while dashboard data is loading or context is missing
  if (!dashboardCtx || dashboardCtx.loading) {
    return <Loading />;
  }

  // Destructure dashboard data
  const { dashboardData, theme = "light", toggleTheme = () => {} } = dashboardCtx;

  // Get username from dashboard data, fallback to "Guest"
  const username = dashboardData?.profile?.username || "Guest";

  // Determine if user has an active sleep session (no wakeUps yet)
  const hasActiveSleep = dashboardData?.latestSleepData?.wakeUps?.length === 0;

  // Handle user logout: call logOut and redirect to home
  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  // Go back to previous page
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <nav
      className="navbar navbar-expand-lg px-3 custom-navbar"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Left: Back button (if logged in) and logo */}
      <div className="d-flex align-items-center me-3 custom-navbar-left">
        {user && (
          <button
            className="btn btn-outline-light me-2 custom-back-button"
            onClick={handleBack}
            title="Go back to previous page"
            aria-label="Go back"
          >
            ← Back
          </button>
        )}
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

      {/* Center: Welcome message */}
      <span className="navbar-text me-3 custom-navbar-welcome" aria-live="polite">
        Welcome, {username}
      </span>

      {/* Theme toggle button */}
      <div className="me-3 d-flex align-items-center custom-theme-toggle">
        <ThemeToggle />
      </div>

      {/* Navbar toggler for mobile view */}
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

      {/* Navigation links */}
      <div className="collapse navbar-collapse" id="navbarContent">
        <ul className="navbar-nav ms-auto custom-navbar-nav">
          {/* If not logged in, show guest links */}
          {!user && (
            <>
              <li className="nav-item custom-nav-item">
                <Link className="nav-link" to="/about" title="About DreamWeaver">
                  About
                </Link>
              </li>
              <li className="nav-item custom-nav-item">
                <Link className="nav-link" to="/join" title="Join DreamWeaver">
                  Join Us
                </Link>
              </li>
            </>
          )}

          {/* If logged in, show user links */}
          {user && (
            <>
              {/* Sleep session action: Wake Up or Go To Bed */}
              <li className="nav-item custom-nav-item">
                {hasActiveSleep ? (
                  <Link
                    className="nav-link fw-bold text-success"
                    to="/gotobed/wakeup"
                    title="Wake up from current sleep session"
                  >
                    Wake Up
                  </Link>
                ) : (
                  <Link
                    className="nav-link fw-bold text-info"
                    to="/gotobed"
                    title="Start a new sleep session"
                  >
                    Go To Bed
                  </Link>
                )}
              </li>
              {/* Main navigation links */}
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
              {/* Admin dashboard link (if user is admin) */}
              {user.role === "admin" && (
                <li className="nav-item custom-nav-item">
                  <Link
                    className="nav-link text-warning"
                    to="/admin"
                    title="Admin dashboard"
                  >
                    Admin Dashboard
                  </Link>
                </li>
              )}
              {/* Logout button */}
              <li className="nav-item custom-nav-item">
                <button
                  className="nav-link btn btn-link text-danger"
                  onClick={handleLogout}
                  title="Log out"
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
