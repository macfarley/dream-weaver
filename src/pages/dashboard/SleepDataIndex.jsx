import { useEffect, useState, useContext } from 'react';
import { DashboardContext } from '../../contexts/DashboardContext';
import * as sleepDataService from '../../services/sleepDataService';
import { useNavigate } from 'react-router-dom';
import { usePreferenceSync } from '../../hooks/usePreferenceSync';
import { formatSessionLabel as formatSessionLabelWithPrefs } from '../../utils/format/userPreferences';
import { calculateSleepStreaks, formatStreakDisplay } from '../../utils/sleep/sleepStreaks';
import { formatDateKey, calculateSleepDuration } from '../../utils/sleep/sleepDataUtils';

/**
 * Displays a list of the user's sleep sessions.
 * Fetches data from DashboardContext or sleepDataService.
 */
function SleepDataIndex() {
  const { dashboardData, loading: dashLoading, error: dashError } = useContext(DashboardContext);
  const { dateFormat } = usePreferenceSync();
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
      
      {/* Streak Statistics Card */}
      {(() => {
        const streakStats = calculateSleepStreaks(sleepSessions);
        const { currentStreakText, longestStreakText, totalSessionsText, motivationalMessage } = formatStreakDisplay(streakStats);
        
        return (
          <div className="card mb-4 sleep-streak-card">
            <div className="card-body">
              <h5 className="card-title">🏆 Your Sleep Tracking Progress</h5>
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="streak-stat">
                    <h6 className="text-primary">Current Streak</h6>
                    <p className="mb-0 fw-bold">{currentStreakText}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="streak-stat">
                    <h6 className="text-success">Best Streak</h6>
                    <p className="mb-0 fw-bold">{longestStreakText}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="streak-stat">
                    <h6 className="text-info">Total Sessions</h6>
                    <p className="mb-0 fw-bold">{totalSessionsText}</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <span className="motivational-text text-muted fst-italic">{motivationalMessage}</span>
              </div>
            </div>
          </div>
        );
      })()}
      
      {sleepSessions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((session) => {
          // Prepare display values
          const label = formatSessionLabelWithPrefs(session.createdAt, dateFormat);
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
                  onClick={() => navigate(`/users/dashboard/sleepdata/${session._id}`, { 
                    state: { sessionData: session } 
                  })}
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

export default SleepDataIndex;
