import React, { useEffect, useState, useContext } from 'react';
import { DashboardContext } from '../../contexts/DashboardContext';
import sleepDataService from '../../services/sleepDataService';
import { useNavigate } from 'react-router-dom';

/**
 * Converts a date string to a compact YYYYMMDD format.
 * @param {string} dateStr - The date string to format.
 * @returns {string} - The formatted date key.
 */
function formatDateKey(dateStr) {
  const date = new Date(dateStr);
  // toISOString returns 'YYYY-MM-DDTHH:mm:ss.sssZ'
  // slice(0, 10) gets 'YYYY-MM-DD'
  // replace(/-/g, '') removes dashes
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Generates a human-readable label for a sleep session.
 * If the session started before 4am, it's considered the previous 'night'.
 * Otherwise, it's a 'morning' session.
 * @param {string} startDateStr - The session's start date string.
 * @returns {string} - The formatted session label.
 */
function formatSessionLabel(startDateStr) {
  const date = new Date(startDateStr);
  const hour = date.getHours();
  const labelDate = new Date(date);

  // If session started before 4am, label as previous night
  const suffix = hour < 4 ? 'night' : 'morning';
  if (hour < 4) labelDate.setDate(labelDate.getDate() - 1);

  // Format: "Monday, Jan 1 night"
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  return `${labelDate.toLocaleDateString(undefined, options)} ${suffix}`;
}

/**
 * Calculates the total sleep duration from session start to last wake-up.
 * @param {string} start - The session's start date string.
 * @param {Array} wakeUps - Array of wake-up objects with 'awakenAt' property.
 * @returns {string|null} - Duration in "Xh Ym" format, or null if incomplete.
 */
function calculateSleepDuration(start, wakeUps) {
  if (!wakeUps?.length) return null;
  const endTime = new Date(wakeUps[wakeUps.length - 1].awakenAt);
  const startTime = new Date(start);
  const durationMs = endTime - startTime;
  if (durationMs < 0) return null;

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Displays a list of the user's sleep sessions.
 * Fetches data from DashboardContext or sleepDataService.
 */
function SleepDataIndex() {
  const { dashboardData, loading: dashLoading, error: dashError } = useContext(DashboardContext);
  const [sleepSessions, setSleepSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Loads sleep session data.
     * Always fetch all sessions for the index page, don't just use latest from dashboard.
     */
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await sleepDataService.getSleepDataByUser();
        setSleepSessions(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error loading sleep data:', err);
        // Set a user-friendly error message
        setError(`Failed to load sleep sessions: ${err.message}`);
        setSleepSessions([]); // Clear sessions on error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dashboardData]);

  // Loading and error states
  if (dashLoading || loading) {
    return (
      <div>
        <h3>Your Sleep Sessions</h3>
        <div className="alert alert-info">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Loading sleep data...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <h3>Your Sleep Sessions</h3>
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
          <br />
          <button 
            className="btn btn-outline-primary btn-sm mt-2 me-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <button 
            className="btn btn-outline-secondary btn-sm mt-2"
            onClick={() => navigate('/users/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (dashError) {
    return (
      <div>
        <h3>Your Sleep Sessions</h3>
        <div className="alert alert-warning">
          <strong>Dashboard Error:</strong> {dashError}
          <br />
          <button 
            className="btn btn-outline-secondary btn-sm mt-2"
            onClick={() => navigate('/users/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (!sleepSessions.length) {
    return (
      <div>
        <h3>Your Sleep Sessions</h3>
        <div className="alert alert-info">
          <h5>No sleep sessions found!</h5>
          <p>
            {dashboardData?.latestSleepData 
              ? "It looks like you have sleep data, but no sessions are showing here. Try refreshing the page or check your connection."
              : "You haven't started tracking your sleep yet. Click the 'Go to Bed' button to start your first sleep session."
            }
          </p>
          <button 
            className="btn btn-primary me-2"
            onClick={() => navigate('/gotobed')}
          >
            Start New Sleep Session
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/users/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render sleep session cards
  return (
    <div>
      <h3>Your Sleep Sessions</h3>
      {sleepSessions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((session) => {
          // Prepare display values
          const label = formatSessionLabel(session.createdAt);
          const dateKey = formatDateKey(session.createdAt);
          const duration = calculateSleepDuration(session.createdAt, session.wakeUps);
          const restfulness = session.wakeUps?.[session.wakeUps.length - 1]?.sleepQuality || 'Not rated';
          const bedroomName = session.bedroom?.bedroomName || 'Unknown Bedroom';

          return (
            <div key={session._id || dateKey} className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{label}</h5>
                <p className="card-text"><strong>Bedroom:</strong> {bedroomName}</p>
                <p className="card-text"><strong>Total Sleep:</strong> {duration || 'Incomplete session'}</p>
                <p className="card-text"><strong>Restfulness:</strong> {restfulness}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/users/SleepData/${dateKey}`)}
                  aria-label={`View details for ${label}`}
                >
                  View Session
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}

// Export all at the bottom for clarity
export {
  formatDateKey,
  formatSessionLabel,
  calculateSleepDuration,
  SleepDataIndex as default,
};
