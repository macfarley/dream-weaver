import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Unauthorized component displayed when users try to access
 * resources they don't have permission for.
 */
function Unauthorized() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="card shadow">
            <div className="card-body py-5">
              <i className="fas fa-lock fa-4x text-danger mb-4"></i>
              <h2 className="card-title text-danger">Access Denied</h2>
              <p className="card-text lead mb-4">
                You don't have permission to access this page.
              </p>
              <p className="card-text text-muted mb-4">
                This area is restricted to administrators only. 
                If you believe you should have access, please contact the site administrator.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/dashboard" className="btn btn-primary">
                  <i className="fas fa-home me-2"></i>
                  Go to Dashboard
                </Link>
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;