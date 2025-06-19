import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { DashboardContext } from "../../contexts/DashboardContext";
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

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  // Determine if user has an active sleep session
  const hasActiveSleep = 
    dashboardData?.latestSleepData && 
    Array.isArray(dashboardData.latestSleepData.wakeUps) &&
    dashboardData.latestSleepData.wakeUps.length === 0;

  // Configure button based on sleep state
  const buttonConfig = hasActiveSleep
    ? {
        to: "/gotobed/wakeup",
        label: "Wake Up",
        icon: "⏰",
        subtext: "End your sleep session",
        variant: "wake",
        ariaLabel: "Wake up - you have an active sleep session"
      }
    : {
        to: "/gotobed",
        label: "Go to Bed",
        icon: "🌙",
        subtext: "Start tracking your sleep",
        variant: "sleep",
        ariaLabel: "Go to bed - start tracking your sleep"
      };

  const sizeClasses = {
    small: "big-action-button--small",
    medium: "big-action-button--medium",
    large: "big-action-button--large"
  };

  return (
    <div className={`big-action-button-container ${className}`}>
      <Link
        to={buttonConfig.to}
        className={`big-action-button big-action-button--${buttonConfig.variant} ${sizeClasses[size]}`}
        aria-label={buttonConfig.ariaLabel}
        title={buttonConfig.ariaLabel}
      >
        {/* Main button circle */}
        <div className="big-action-button__circle">
          {/* Background logo */}
          <div className="big-action-button__logo-bg">
            <img
              src={DWLogo}
              alt=""
              className="big-action-button__logo"
              loading="lazy"
            />
          </div>
          
          {/* Action icon overlay */}
          <div className="big-action-button__icon">
            {buttonConfig.icon}
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
              {buttonConfig.label}
            </div>
            <div className="big-action-button__subtext">
              {buttonConfig.subtext}
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}

export default BigActionButton;
