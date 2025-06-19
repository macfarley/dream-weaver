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
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Loads sleep session data.
     * If dashboardData has latestSleepData, use it.
     * Otherwise, fetch all sessions from the service.
     */
    const loadData = async () => {
      setLoading(true);
      try {
        if (dashboardData?.latestSleepData) {
          // In future, replace with full array if dashboard has all sessions
          setSleepSessions([dashboardData.latestSleepData]);
        } else {
          const data = await sleepDataService.getSleepDataByUser();
          setSleepSessions(data);
        }
      } catch (err) {
        console.error('Error loading sleep data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dashboardData]);

  // Loading and error states
  if (dashLoading || loading) return <p>Loading sleep data...</p>;
  if (dashError) return <p className="text-danger">{dashError}</p>;
  if (!sleepSessions.length) return <p>No sleep sessions logged yet.</p>;

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
