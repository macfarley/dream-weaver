import { useContext, useMemo, useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { DashboardContext } from "../../contexts/DashboardContext";
import { hasActiveSleepSession } from "../../utils/sleep/sleepStateUtils";
import sleepSessionService from "../../services/sleepSessionService";
import DWLogo from "../../assets/DW-Logo.png";

/**
 * BigActionButton - The main action button for DreamWeaver
 * 
 * A large, prominent button that serves as the primary call-to-action
 * for sleep tracking. Similar to Shazam's main button design.
 * 
 * Features:
 * - Automatically determines action based on sleep state
 * - Shows "Go to Bed" when no active sleep session
 * - Shows "Wake Up" when there's an active sleep session
 * - Large, circular design with DreamWeaver logo
 * - Responsive sizing and hover effects
 * - Theme-aware styling
 * 
 * Props:
 * - size: 'large' | 'medium' | 'small' (default: 'large')
 * - className: Additional CSS classes
 */
function BigActionButton({ 
  size = "large", 
  className = "",
  showLabel = true 
}) {
  const { user } = useContext(UserContext);
  const { dashboardData } = useContext(DashboardContext);

  // State to track active session from backend
  const [backendActiveSession, setBackendActiveSession] = useState(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  // Check backend for active session
  const checkBackendForActiveSession = async () => {
    try {
      setIsCheckingBackend(true);
      const result = await sleepSessionService.checkActiveSleepSession();
      setBackendActiveSession(result);
    } catch (err) {
      console.error('Failed to check backend for active session:', err);
      setBackendActiveSession(null);
    } finally {
      setIsCheckingBackend(false);
    }
  };

  // Check backend for active session when component mounts or user changes
  useEffect(() => {
    if (user?._id) {
      checkBackendForActiveSession();
    }
  }, [user?._id]);

  // Determine if user has an active sleep session 
  // Prioritize backend check, fallback to dashboard data
  const hasActiveSleep = useMemo(() => {
    // If we have a backend response, use that
    if (backendActiveSession !== null) {
      return backendActiveSession?.hasActiveSession || false;
    }
    // Fallback to dashboard data check
    return hasActiveSleepSession(dashboardData);
  }, [backendActiveSession, dashboardData]);

  // Configure button based on sleep state using useMemo for performance
  const buttonConfig = useMemo(() => {
    // Show loading state while checking backend
    if (isCheckingBackend) {
      return {
        text: "Checking...",
        path: null,
        variant: "loading",
        disabled: true
      };
    }

    if (hasActiveSleep) {
      return {
        text: "Wake Up",
        path: "/gotobed/wakeup",
        variant: "wake",
        disabled: false
      };
    } else {
      return {
        text: "Go to Bed",
        path: "/gotobed",
        variant: "sleep",
        disabled: false
      };
    }
  }, [isCheckingBackend, hasActiveSleep]);

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  const sizeClasses = {
    small: "big-action-button--small",
    medium: "big-action-button--medium",
    large: "big-action-button--large"
  };

  return (
    <div className={`big-action-button-container ${className}`}>
      {buttonConfig.disabled ? (
        <div
          className={`big-action-button big-action-button--${buttonConfig.variant} ${sizeClasses[size]} big-action-button--disabled`}
          aria-label={buttonConfig.text}
          title={buttonConfig.text}
        >
          {/* Main button circle */}
          <div className="big-action-button__circle">
            {/* Background logo */}
            <div className="big-action-button__logo-bg">
              <img
                src={DWLogo}
                alt="DreamWeaver"
                className="big-action-button__logo"
                loading="lazy"
              />
            </div>
          </div>

          {/* Button text */}
          {showLabel && (
            <div className="big-action-button__text">
              <div className="big-action-button__label">
                {buttonConfig.text}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          to={buttonConfig.path}
          className={`big-action-button big-action-button--${buttonConfig.variant} ${sizeClasses[size]}`}
          aria-label={buttonConfig.text}
          title={buttonConfig.text}
        >
          {/* Main button circle */}
          <div className="big-action-button__circle">
            {/* Background logo */}
            <div className="big-action-button__logo-bg">
              <img
                src={DWLogo}
                alt="DreamWeaver"
                className="big-action-button__logo"
                loading="lazy"
              />
            </div>
            
            {/* Pulse animation rings */}
            <div className="big-action-button__pulse-ring big-action-button__pulse-ring--1"></div>
            <div className="big-action-button__pulse-ring big-action-button__pulse-ring--2"></div>
            <div className="big-action-button__pulse-ring big-action-button__pulse-ring--3"></div>
          </div>

          {/* Button text */}
          {showLabel && (
            <div className="big-action-button__text">
              <div className="big-action-button__label">
                {buttonConfig.text}
              </div>
            </div>
          )}
        </Link>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(BigActionButton);
