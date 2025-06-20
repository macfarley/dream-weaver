import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import { UserContext } from '../../contexts/UserContext';
import { DashboardContext } from '../../contexts/DashboardContext';

/**
 * Footer component provides navigation aids and primary action buttons.
 * 
 * Features:
 * - Dynamic breadcrumb navigation based on current route
 * - Context-aware primary action button (Go To Bed / Wake Up)
 * - Responsive layout with Bootstrap components
 * - Shows different content for authenticated vs unauthenticated users
 * 
 * The footer adapts its content based on:
 * - User authentication state
 * - Current sleep session status  
 * - Current page location for breadcrumbs
 * 
 * Primary Action Logic:
 * - If user has active sleep session → "Wake Up" button
 * - If user has no active sleep session → "Go To Bed" button
 * - If user not logged in → No action button shown
 * 
 * Dependencies:
 * - UserContext: For authentication state
 * - DashboardContext: For sleep session status
 * - React Router: For location and navigation
 */
function Footer() {
  // Get current route location for breadcrumb generation
  const location = useLocation();

  // Get user authentication state and dashboard data from contexts
  const { user } = useContext(UserContext);
  const { dashboardData } = useContext(DashboardContext);

  // Parse current URL path into segments for breadcrumb navigation
  // Filter out empty strings from leading/trailing slashes
  const pathnames = location.pathname.split('/').filter(Boolean);

  // Determine if user has an active sleep session
  // Active session = has sleep data but no wake-up events recorded yet
  const hasActiveSleep =
    dashboardData?.latestSleepData && 
    Array.isArray(dashboardData.latestSleepData.wakeUps) &&
    dashboardData.latestSleepData.wakeUps.length === 0;

  // Don't show sleep action buttons on sleep-related routes to avoid confusion
  const isOnSleepRoute = location.pathname.startsWith('/gotobed');

  // Configure primary action button based on current sleep state
  const primaryAction = hasActiveSleep
    ? {
        to: '/gotobed/wakeup',
        label: '⏰ Wake Up',
        style: 'btn-success',
        ariaLabel: 'Wake up from current sleep session'
      }
    : {
        to: '/gotobed',
        label: '🌙 Go To Bed',
        style: 'btn-primary',
        ariaLabel: 'Start a new sleep session'
      };

  return (
    <div className="custom-footer">
      <div className="container">
        {/* Footer informational details */}
        <div className="text-center">
          <p className="mb-1">
            <Link to="/about" className="text-info">
              About / Help
            </Link>
          </p>
          <p className="mb-2 small"> {/* Increased bottom margin for spacing */}
            © {new Date().getFullYear()} DreamWeaver. Built by{' '}
            <a
              href="https://www.linkedin.com/in/travis-mccoy-630775b9/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-info"
            >
              Macfarley (Mac McCoy)
            </a>
          </p>
        </div>

        {/* Breadcrumb navigation with label */}
        <div className="breadcrumb-container">
          <div className="breadcrumb-label">Where you are:</div>
          <Breadcrumb className="mb-0"> {/* Remove bottom margin */}
          {/* Always show Home link */}
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            Home
          </Breadcrumb.Item>
          {/* Dynamically render breadcrumbs for each path segment */}
          {pathnames.map((name, index) => {
            const routeTo = '/' + pathnames.slice(0, index + 1).join('/');
            // Capitalize first letter for display
            const label = name.charAt(0).toUpperCase() + name.slice(1);

            // Last breadcrumb is active, others are links
            return index === pathnames.length - 1 ? (
              <Breadcrumb.Item key={routeTo} active>
                {label}
              </Breadcrumb.Item>
            ) : (
              <Breadcrumb.Item
                key={routeTo}
                linkAs={Link}
                linkProps={{ to: routeTo }}
              >
                {label}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
        </div> {/* Close breadcrumb-container */}

        {/* Primary action button - only shown to authenticated users and not on sleep routes */}
        {user && !isOnSleepRoute && (
          <div className="my-3 text-center"> {/* Moved to bottom with more margin */}
            <Link
              to={primaryAction.to}
              className={`btn ${primaryAction.style} btn-lg w-100`}
              aria-label={primaryAction.ariaLabel}
              title={primaryAction.ariaLabel}
            >
              {primaryAction.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Footer;
