import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import BigActionButton from '../components/ui/BigActionButton';

/**
 * NotFound component displayed when users navigate to non-existent routes.
 * Provides helpful navigation options based on authentication state.
 */
function NotFound() {
  const { user } = useContext(UserContext);
  const location = useLocation();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <div className="card shadow">
            <div className="card-body py-5">
              <div className="mb-4">
                <span className="display-1">🌙</span>
              </div>
              
              <h1 className="display-4 text-primary mb-3">404</h1>
              <h2 className="card-title">Lost in the Dream Realm</h2>
              
              <p className="card-text lead mb-4">
                😴 The page you're looking for seems to have drifted away like a dream...
              </p>
              
              <div className="text-muted mb-4">
                <small>
                  <strong>Path not found:</strong> <code>{location.pathname}</code>
                </small>
              </div>

              <div className="d-flex flex-column align-items-center gap-3">
                {user ? (
                  // Logged-in user options
                  <>
                    <p className="text-muted mb-3">
                      No worries, <strong>{user.username}</strong>! Let's get you back to your sleep journey.
                    </p>
                    
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                      <Link to="/users/dashboard" className="btn btn-primary">
                        <i className="fas fa-tachometer-alt me-2"></i>
                        Dashboard
                      </Link>
                      <Link to="/users/dashboard/bedrooms" className="btn btn-outline-primary">
                        <i className="fas fa-bed me-2"></i>
                        Bedrooms
                      </Link>
                      <Link to="/users/dashboard/sleepdata" className="btn btn-outline-primary">
                        <i className="fas fa-chart-line me-2"></i>
                        Sleep Data
                      </Link>
                    </div>

                    {/* Main action button for sleep tracking */}
                    <BigActionButton />
                  </>
                ) : (
                  // Guest user options
                  <>
                    <p className="text-muted mb-4">
                      Maybe it's time to join the DreamWeaver community?
                    </p>
                    
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                      <Link to="/" className="btn btn-primary">
                        <i className="fas fa-home me-2"></i>
                        Home
                      </Link>
                      <Link to="/about" className="btn btn-outline-primary">
                        <i className="fas fa-info-circle me-2"></i>
                        About
                      </Link>
                      <Link to="/join" className="btn btn-outline-success">
                        <i className="fas fa-user-plus me-2"></i>
                        Join DreamWeaver
                      </Link>
                    </div>
                  </>
                )}

                <div className="mt-4">
                  <small className="text-muted">
                    <i className="fas fa-lightbulb me-1"></i>
                    Tip: Use the navigation menu above to explore DreamWeaver features
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
