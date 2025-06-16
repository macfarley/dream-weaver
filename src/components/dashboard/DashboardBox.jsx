import React from 'react';

/**
 * DashboardBox component displays a card with a title, content, and optional action buttons.
 *
 * Props:
 * - title: string - The title displayed at the top of the card.
 * - data: any - The data to be rendered in the content area.
 * - renderContent: function - Function to render the content based on the data.
 * - actions: array - Optional array of action objects for rendering buttons.
 */
const DashboardBox = (props) => {
  const { title, data, renderContent, actions } = props;

  // Render the main content area
  const renderMainContent = () => {
    if (data) {
      // If data is present, use the renderContent function to display it
      return renderContent(data);
    } else {
      // If no data, show a placeholder message
      return <p className="text-muted">No data available.</p>;
    }
  };

  // Render the action buttons if any actions are provided
  const renderActions = () => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="mt-3 d-flex gap-2 flex-wrap justify-content-end">
        {actions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            className={`btn btn-${action.variant || 'primary'} btn-sm`}
            onClick={action.onClick}
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="card h-100 shadow-sm p-3 dashboard-box" tabIndex="0">
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          {/* Card title */}
          <h5 className="card-title">{title}</h5>
          {/* Main content area */}
          <div>
            {renderMainContent()}
          </div>
        </div>
        {/* Optional actions section */}
        {renderActions()}
      </div>
    </div>
  );
};

export default DashboardBox;
