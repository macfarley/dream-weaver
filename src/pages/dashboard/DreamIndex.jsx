import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardContext } from '../../contexts/DashboardContext';
import * as sleepDataService from '../../services/sleepDataService';
import { usePreferenceSync } from '../../hooks/usePreferenceSync';
import { formatDate as formatDateWithPrefs } from '../../utils/format/userPreferences';

function DreamIndex() {
  // Get dashboard data from context
  const { dashboardData } = useContext(DashboardContext);
  
  // Navigation hook for programmatic navigation with state
  const navigate = useNavigate();
  
  // Get user preferences for date formatting
  const { dateFormat } = usePreferenceSync();

  // Local state for sleep data
  const [sleepData, setSleepData] = useState([]);

  // On mount or when dashboardData changes, update sleepData
  useEffect(() => {
    // If context has sleep data, use it (no backend call needed)
    if (dashboardData?.allSleepSessions?.length) {
      setSleepData(dashboardData.allSleepSessions);
    } else {
      // Otherwise, fetch from service as fallback (for users who haven't updated context)
      sleepDataService
        .getSleepDataByUser()
        .then(setSleepData)
        .catch(console.error);
    }
  }, [dashboardData]);

  // Render a single dream entry card
  function renderDreamEntry(entry) {
    // Format date for display
    const displayDate = formatDateWithPrefs(entry.createdAt, dateFormat);

    // Get bedroom name - check multiple possible locations for the bedroom data
    let bedroomName = 'Unknown Bedroom';
    if (entry.bedroom?.bedroomName) {
      bedroomName = entry.bedroom.bedroomName;
    } else if (entry.bedroomId && dashboardData?.bedrooms) {
      // Try to find bedroom by ID in dashboard context
      const bedroom = dashboardData.bedrooms.find(b => b._id === entry.bedroomId);
      bedroomName = bedroom?.bedroomName || 'Unknown Bedroom';
    }

    // Get all dreams from all wake-ups
    const allDreams = entry.wakeUps?.filter(wake => wake.dreamJournal) || [];
    
    // Check if this session has any dreams or sleepy thoughts
    const hasDreams = allDreams.length > 0;
    const hasSleepyThoughts = entry.sleepyThoughts?.trim();
    
    // Only show entries that have dreams or sleepy thoughts
    if (!hasDreams && !hasSleepyThoughts) {
      return null;
    }

    return (
      <div className="card mb-3 dream-journal-card" key={entry._id}>
        <div className="card-header dream-journal-header d-flex justify-content-between align-items-center">
          <strong>{displayDate}</strong>
          <span className="badge dream-journal-badge">{bedroomName}</span>
        </div>
        <div className="card-body">
          {/* Show sleepy thoughts if present */}
          {hasSleepyThoughts && (
            <div className="mb-3">
              <h6 className="text-muted">🧠 Sleepy Thoughts:</h6>
              <p className="dream-content">{entry.sleepyThoughts}</p>
            </div>
          )}
          
          {/* Show all dreams from all wake-ups */}
          {hasDreams && (
            <div className="mb-3">
              <h6 className="text-muted">💭 Dreams:</h6>
              {allDreams.map((wake, index) => (
                <div key={index} className="dream-entry mb-2">
                  <p className="dream-content mb-1">{wake.dreamJournal}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Single action button to view full session */}
          <div className="mt-3">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/users/dashboard/sleepdata/${entry._id}`, {
                state: { sessionData: entry }
              })}
            >
              View Full Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="container mt-4">
      <h2>Dream Journal</h2>
      <p className="text-muted">
        Explore your dreams and sleepy thoughts from all your sleep sessions.
      </p>

      {/* Show message if no data */}
      {sleepData.length === 0 ? (
        <div className="dream-journal-empty">
          <div className="dream-journal-empty-icon">🌙</div>
          <p>No sleep sessions with dreams or sleepy thoughts found.</p>
          <p className="text-muted">Start tracking your sleep to see your dream journal entries here!</p>
        </div>
      ) : (
        // Sort entries by date descending and render only entries with dreams
        sleepData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(renderDreamEntry)
          .filter(Boolean) // Remove null entries (sessions without dreams)
      )}
    </div>
  );
}

export default DreamIndex;
