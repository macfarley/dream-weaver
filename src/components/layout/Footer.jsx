import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { DashboardContext } from '../../contexts/DashboardContext';

/**
 * Compact Footer component with essential navigation and actions.
 * 
 * Features:
 * - Compact, always-visible design
 * - Context-aware primary action button (Go To Bed / Wake Up)
 * - Quick navigation links
 * - Copyright information
 * - Responsive layout
 * 
 * Dependencies:
 * - UserContext: For authentication state
 * - DashboardContext: For sleep session status
 * - React Router: For location and navigation
 */
function Footer() {
  // Get current route location 
  const location = useLocation();

  // Get user authentication state and dashboard data from contexts
  const { user } = useContext(UserContext);
  const { dashboardData } = useContext(DashboardContext);

  // Determine if user has an active sleep session
  const hasActiveSleep =
    dashboardData?.latestSleepData && 
    Array.isArray(dashboardData.latestSleepData.wakeUps) &&
    dashboardData.latestSleepData.wakeUps.length === 0;

  // Don't show footer on sleep-related routes
  const isOnSleepRoute = location.pathname.startsWith('/gotobed');

  // Don't render footer at all on sleep routes
  if (isOnSleepRoute) {
    return null;
  }

  // Configure primary action button based on current sleep state
  const primaryAction = hasActiveSleep
    ? {
        to: '/gotobed/wakeup',
        label: (
          <>
            Wake Up
            <br />
            ⏰
          </>
        ),
        style: 'btn-warning',
        ariaLabel: 'Wake up from current sleep session'
      }
    : {
        to: '/gotobed',
        label: (
          <>
            🌙
            <br />
            Sleep
          </>
        ),
        style: 'btn-primary',
        ariaLabel: 'Start a new sleep session'
      };

  return (
    <footer className="compact-footer" role="contentinfo" aria-label="Site footer">
      <div className="container-fluid">
        {/* Top row - About link and action button */}
        <div className="row align-items-center justify-content-between footer-top">
          <div className="col-auto">
            <Link 
              to="/about" 
              className="footer-link"
              title="Learn more about DreamWeaver"
              tabIndex={0}
              role="button"
              aria-label="About DreamWeaver"
            >
              About
            </Link>
          </div>
          <div className="col-auto">
            {user && (
              <Link
                to={primaryAction.to}
                className={`btn ${primaryAction.style} btn-sm footer-action-btn`}
                aria-label={primaryAction.ariaLabel}
                title={primaryAction.ariaLabel}
                tabIndex={0}
                role="button"
              >
                {primaryAction.label}
              </Link>
            )}
          </div>
        </div>

        {/* Bottom row - Copyright */}
        <div className="row footer-bottom">
          <div className="col-12 text-center">
            <div className="footer-copyright">
              <small>
                © {new Date().getFullYear()} DreamWeaver by{' '}
                <a
                  href="https://www.linkedin.com/in/travis-mccoy-630775b9/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  title="Visit Mac McCoy's LinkedIn profile"
                  tabIndex={0}
                  aria-label="Mac McCoy's LinkedIn profile (opens in new tab)"
                >
                  Mac McCoy
                </a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
