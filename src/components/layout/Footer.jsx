import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import { UserContext } from '../../contexts/UserContext';
import { DashboardContext } from '../../contexts/DashboardContext';

/**
 * Footer component displays breadcrumbs, a main action button, and footer details.
 */
function Footer() {
  // Get current route location
  const location = useLocation();

  // Get user and dashboard data from contexts
  const { user } = useContext(UserContext);
  const { dashboardData } = useContext(DashboardContext);

  // Split the current path into segments for breadcrumbs
  const pathnames = location.pathname.split('/').filter(Boolean);

  // Determine if the user has an active sleep session (no wakeUps means still sleeping)
  const hasActiveSleep =
    dashboardData?.latestSleepData?.wakeUps?.length === 0;

  // Decide which primary action to show based on sleep state
  const primaryAction = hasActiveSleep
    ? {
        to: '/gotobed/wakeup',
        label: 'Wake Up',
        style: 'btn-success',
      }
    : {
        to: '/gotobed',
        label: 'Go To Bed',
        style: 'btn-info',
      };

  return (
    <footer className="    pt-3 px-3 mt-auto">
      <div className="container">


        {/* Main action button (only if user is logged in) */}
        {user && (
          <div className="my-3 text-center">
            <Link
              to={primaryAction.to}
              className={`btn ${primaryAction.style} btn-lg w-100`}
            >
              {primaryAction.label}
            </Link>
          </div>
        )}

        {/* Footer informational details */}
        <div className="text-center">
          <p className="mb-1">
            <Link to="/about" className="text-info">
              About / Help
            </Link>
          </p>
          <p className="mb-1 small">
            Not medical advice. For sleep disorders, consult a healthcare professional.
          </p>
          <p className="mb-0 small">
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
                {/* Breadcrumb navigation */}
        <Breadcrumb className="  mb-2">
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
      </div>
    </footer>
  );
}

export default Footer;
