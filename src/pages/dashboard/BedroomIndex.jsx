import React, { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '../../contexts/DashboardContext';
import * as bedroomService from '../../services/bedroomService';
import { getToken } from '../../services/authService';
import { Link } from 'react-router-dom';
import BedroomForm from '../../components/sleep/BedroomForm';
import { sanitizeBedroomNameForUrl } from '../../utils/format/urlSafeNames';

const BedroomIndex = () => {
  const { dashboardData, loading, error, refreshDashboard } = useContext(DashboardContext);
  const [bedrooms, setBedrooms] = useState([]);
  const [showBedroomForm, setShowBedroomForm] = useState(false);

  // Handle successful bedroom creation
  const handleBedroomAdd = (newBedroom) => {
    setShowBedroomForm(false); // Hide the form
    // Refresh dashboard data to get updated bedroom list
    if (refreshDashboard) {
      refreshDashboard();
    } else {
      // Fallback: manually add to local state
      setBedrooms((prev) => [...prev, newBedroom]);
    }
  };

  useEffect(() => {
    // Wait for DashboardContext to finish loading
    if (loading) return;

    // If context has bedrooms, always use it (even if empty)
    if (dashboardData && Array.isArray(dashboardData.bedrooms)) {
      setBedrooms(dashboardData.bedrooms);
      return;
    }

    // If context is missing, fetch from API
    bedroomService.getBedrooms(getToken())
      .then((data) => setBedrooms(data))
      .catch((err) => {
        console.error('Failed to load bedrooms:', err);
      });
  }, [dashboardData, loading]);

  if (loading) return <p>Loading bedrooms...</p>;
  if (error) return <p>{error}</p>;

  if (!bedrooms.length) {
    return (
      <div className="bedroom-index container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Your Bedrooms</h2>
          <button
            onClick={() => setShowBedroomForm(true)}
            className="btn btn-primary"
          >
            Create Room
          </button>
        </div>
        
        {showBedroomForm ? (
          <BedroomForm
            onSuccess={handleBedroomAdd}
            onCancel={() => setShowBedroomForm(false)}
          />
        ) : (
          <p>No bedrooms found. Click "Create Room" to add your first bedroom.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bedroom-index container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Your Bedrooms</h2>
        <button
          onClick={() => setShowBedroomForm(!showBedroomForm)}
          className="btn btn-primary"
        >
          {showBedroomForm ? 'Cancel' : 'Create Room'}
        </button>
      </div>

      {/* Show bedroom form when toggled */}
      {showBedroomForm && (
        <div className="mb-4">
          <BedroomForm
            onSuccess={handleBedroomAdd}
            onCancel={() => setShowBedroomForm(false)}
          />
        </div>
      )}

      <div className="list-group">
        {bedrooms.map((bedroom) => (
          <div key={bedroom._id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong className="bedroom-name">{bedroom.bedroomName}</strong>{' '}
                {bedroom.favorite && <span className="badge bg-success">Favorite</span>}
              </div>

              <div>
                <Link
                  to={`/bedrooms/${bedroom._id}`}
                  className="btn btn-primary btn-sm"
                  aria-label={`View details for ${bedroom.bedroomName}`}
                  title={`View or edit details for ${bedroom.bedroomName}`}
                >
                  View/Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BedroomIndex;
