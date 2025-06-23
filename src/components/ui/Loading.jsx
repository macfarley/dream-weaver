// src/components/Loading.jsx

/**
 * Loading component displays a themed animated spinner with an optional message.
 * 
 * This component provides a beautiful, on-brand loading experience with
 * custom animations, theme-aware styling, and accessibility features.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.message="Loading..."] - Custom message to display below spinner
 * 
 * Features:
 * - Custom DreamWeaver-themed animations (floating moons and stars)
 * - Theme-aware colors that adapt to light/dark mode
 * - Multiple animation layers for visual interest
 * - Proper ARIA labels for screen readers
 * - Responsive design that works on all screen sizes
 * - Customizable message text with fade-in animation
 * 
 * Usage Examples:
 * - <Loading /> // Shows "Loading..."
 * - <Loading message="Weaving your dreams..." />
 * - <Loading message="Preparing your sleep sanctuary..." />
 */
function Loading({ message = "Loading..." }) {
  return (
    <div className="loading-container">
      <div className="loading-content">
        {/* Custom animated spinner with dream theme */}
        <div className="dream-spinner" role="status" aria-label="Loading spinner">
          {/* Central moon/sun that rotates */}
          <div className="central-orb">
            <div className="orb-glow"></div>
            🌙
          </div>
          
          {/* Orbiting stars */}
          <div className="orbit orbit-1">
            <div className="star">✨</div>
          </div>
          <div className="orbit orbit-2">
            <div className="star">⭐</div>
          </div>
          <div className="orbit orbit-3">
            <div className="star">💫</div>
          </div>
          
          {/* Floating dream elements */}
          <div className="floating-element cloud-1">☁️</div>
          <div className="floating-element cloud-2">☁️</div>
          
          {/* Screen reader text */}
          <span className="visually-hidden">{message}</span>
        </div>
        
        {/* Animated loading message */}
        <div className="loading-message">{message}</div>
        
        {/* Subtle breathing animation dots */}
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
}

export default Loading;
