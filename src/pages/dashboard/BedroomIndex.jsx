import React, { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '../../contexts/DashboardContext';
import * as bedroomService from '../../services/bedroomService';
import { getToken } from '../../services/authService';
import { Link, useNavigate } from 'react-router-dom';
import BedroomForm from '../../components/sleep/BedroomForm';
import { sanitizeBedroomNameForUrl } from '../../utils/format/urlSafeNames';

const BedroomIndex = () => {
  const { dashboardData, loading, error, refreshDashboard } = useContext(DashboardContext);
  const [bedrooms, setBedrooms] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showBedroomForm, setShowBedroomForm] = useState(false);
  const navigate = useNavigate();

  // Helper: toggle usage history section
  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle successful bedroom creation
  const handleBedroomAdd = (newBedroom) => {
    setShowBedroomForm(false); // Hide the form
    // Refresh dashboard data to get updated bedroom list
    if (refreshDashboard) {
      refreshDashboard();
    } else {
      // Fallback: manually add to local state
      setBedrooms((prev) => processBedrooms([...prev, newBedroom]));
    }
  };

  // Calculate total nights and sort by favorite descending
  const processBedrooms = (bedroomArray) => {
    // Map bedroom usage dates from dashboardData.sleepData
    const sleepData = dashboardData?.sleepData || [];
    
    // Map bedroomId => array of sleep session start dates (YYYYMMDD)
    const usageMap = {};
    sleepData.forEach((session) => {
      if (!session.bedroom) return;
      const bId = session.bedroom._id || session.bedroom;
      if (!usageMap[bId]) usageMap[bId] = [];
      // Extract date as YYYYMMDD string (from createdAt)
      const dateStr = new Date(session.createdAt).toISOString().slice(0, 10).replace(/-/g, '');
      usageMap[bId].push({ date: dateStr, display: new Date(session.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) });
    });

    // Add usage info to bedrooms
    const withUsage = bedroomArray.map((b) => {
      const usageDates = usageMap[b._id] || [];
      // Sort usageDates ascending by date
      usageDates.sort((a, b) => (a.date > b.date ? 1 : -1));
      return {
        ...b,
        usageDates,
        totalNights: usageDates.length,
      };
    });

    // Sort by favorite descending (true first), fallback to 0, then alphabetically
    withUsage.sort((a, b) => {
      if ((b.favorite === true) && (a.favorite !== true)) return 1;
      if ((a.favorite === true) && (b.favorite !== true)) return -1;
      if (a.favorite === b.favorite) return a.bedroomName.localeCompare(b.bedroomName);
      return 0;
    });

    return withUsage;
  };

  useEffect(() => {
    if (!dashboardData?.bedrooms?.length) {
      setLocalLoading(true);
      const token = getToken();
      if (!token) {
        setLocalError('Authentication required');
        setLocalLoading(false);
        return;
      }
      
      bedroomService.getBedrooms(token)
        .then((data) => setBedrooms(processBedrooms(data)))
        .catch((err) => {
          console.error('Failed to load bedrooms:', err);
          setLocalError('Failed to load bedrooms');
        })
        .finally(() => setLocalLoading(false));
    } else {
      setBedrooms(processBedrooms(dashboardData.bedrooms));
    }
  }, [dashboardData]);

  if (loading || localLoading) return <p>Loading bedrooms...</p>;
  if (error || localError) return <p>{error || localError}</p>;

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
                <br />
                <small className="nights-used">Total Nights Used: {bedroom.totalNights}</small>
              </div>

              <div>
                <button
                  onClick={() => toggleExpanded(bedroom._id)}
                  className="btn btn-link btn-sm"
                  aria-expanded={expandedIds.has(bedroom._id)}
                >
                  {expandedIds.has(bedroom._id) ? 'Hide Usage' : 'Show Usage'}
                </button>
                {' '}
                {/* Using safe URL encoding for bedroom names */}
                <Link
                  to={`/users/dashboard/bedrooms/${sanitizeBedroomNameForUrl(bedroom.bedroomName)}`}
                  className="btn btn-primary btn-sm"
                  aria-label={`View details for ${bedroom.bedroomName}`}
                >
                  View/Edit
                </Link>
              </div>
            </div>

            {expandedIds.has(bedroom._id) && (
              <div className="mt-2 usage-list ps-3">
                <h6>Used On:</h6>
                {bedroom.usageDates.length === 0 ? (
                  <p>No sleep sessions recorded for this bedroom.</p>
                ) : (
                  <ul>
                    {bedroom.usageDates.map(({ date, display }) => (
                      <li key={date}>
                        <button
                          onClick={() => navigate(`/users/SleepData/${date}`)}
                          className="btn btn-link p-0"
                          aria-label={`View sleep session for ${display}`}
                          type="button"
                        >
                          {display}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BedroomIndex;
