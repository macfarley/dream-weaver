import React from 'react';

/**
 * DashboardBox component displays a reusable card with title, content, and optional action buttons.
 * 
 * This component provides a consistent layout for dashboard widgets and data displays.
 * It handles various states including empty data and provides accessible button actions.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The title displayed at the top of the card
 * @param {any} props.data - The data to be rendered in the content area (can be object, array, etc.)
 * @param {function} props.renderContent - Function that receives data and returns JSX content
 * @param {React.ReactElement} [props.icon] - Optional Lucide icon to display in corner
 * @param {Array<Object>} [props.actions] - Optional array of action button configurations
 * @param {string} props.actions[].label - Button text
 * @param {function} props.actions[].onClick - Click handler function
 * @param {string} [props.actions[].variant='primary'] - Bootstrap button variant (primary, secondary, success, etc.)
 * 
 * Features:
 * - Responsive Bootstrap card layout
 * - Graceful handling of empty/missing data
 * - Flexible content rendering via render prop pattern
 * - Action buttons with customizable styling
 * - Accessibility support with proper tabIndex and ARIA labels
 * 
 * Usage Examples:
 * <DashboardBox 
 *   title="Sleep Sessions" 
 *   data={sleepData} 
 *   renderContent={(data) => <SleepList sessions={data} />}
 *   actions={[
 *     { label: "View All", onClick: handleViewAll },
 *     { label: "Add New", onClick: handleAdd, variant: "success" }
 *   ]}
 * />
 */
const DashboardBox = (props) => {
  const { title, data, renderContent, actions, icon } = props;

  /**
   * Renders the main content area of the dashboard box.
   * Uses the provided renderContent function if data exists, otherwise shows placeholder.
   * 
   * @returns {JSX.Element} The rendered content
   */
  const renderMainContent = () => {
    // Check if data exists and is not empty
    if (data !== null && data !== undefined) {
      // Use the provided render function to display the data
      return renderContent(data);
    } else {
      // Show user-friendly message when no data is available
      return (
        <p className="text-muted mb-0">
          No data available.
        </p>
      );
    }
  };

  /**
   * Renders action buttons if any actions are provided.
   * Each action becomes a clickable button with customizable styling.
   * 
   * @returns {JSX.Element|null} Action buttons container or null if no actions
   */
  const renderActions = () => {
    // Return null if no actions provided or actions array is empty
    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 d-flex gap-2 flex-wrap justify-content-end">
        {actions.map((action, index) => {
          // Validate that each action has required properties
          if (!action.label || typeof action.onClick !== 'function') {
            console.warn(`DashboardBox: Invalid action at index ${index}`, action);
            return null;
          }

          return (
            <button
              key={index}
              type="button"
              className={`btn btn-${action.variant || 'primary'} btn-sm`}
              onClick={action.onClick}
              style={{ 
                minWidth: '44px', 
                minHeight: '44px' // Ensure buttons meet accessibility touch target size
              }}
              aria-label={action.label}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      className="card h-100 shadow-sm p-3 dashboard-box position-relative" 
      tabIndex="0"
      role="region"
      aria-labelledby={`dashboard-box-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Corner icon */}
      {icon && (
        <div className="position-absolute" style={{ top: '12px', right: '12px', opacity: 0.3 }}>
          {React.cloneElement(icon, { size: 24, 'aria-hidden': 'true' })}
        </div>
      )}
      
      <div className="card-body d-flex flex-column justify-content-between">
        {/* Content section - takes up available space */}
        <div className="flex-grow-1">
          {/* Card title with semantic heading */}
          <h5 
            className="card-title mb-3" 
            id={`dashboard-box-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {title}
          </h5>
          
          {/* Main content area */}
          <div className="dashboard-box-content">
            {renderMainContent()}
          </div>
        </div>
        
        {/* Actions section - pinned to bottom */}
        <div className="dashboard-box-actions">
          {renderActions()}
        </div>
      </div>
    </div>
  );
};

export default DashboardBox;
