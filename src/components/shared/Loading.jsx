// src/components/Loading.jsx
import React from "react";

/**
 * Loading component displays a centered spinner with an optional message.
 * 
 * This component provides a consistent loading experience across the app
 * with Bootstrap styling and accessibility features.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.message="Loading..."] - Custom message to display below spinner
 * 
 * Features:
 * - Centers content both horizontally and vertically
 * - Uses Bootstrap spinner with primary color theme
 * - Includes proper ARIA labels for screen readers
 * - Responsive design that works on all screen sizes
 * - Customizable message text
 * 
 * Usage Examples:
 * - <Loading /> // Shows "Loading..."
 * - <Loading message="Signing you in..." />
 * - <Loading message="Saving your preferences..." />
 */
function Loading({ message = "Loading..." }) {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center">
        {/* Bootstrap spinner with accessibility support */}
        <div 
          className="spinner-border text-primary mb-3" 
          role="status" 
          aria-label="Loading spinner"
        >
          {/* Screen reader text - visually hidden but available to assistive technology */}
          <span className="visually-hidden">{message}</span>
        </div>
        
        {/* Visible loading message */}
        <div className="text-muted">{message}</div>
      </div>
    </div>
  );
}

export default Loading;
