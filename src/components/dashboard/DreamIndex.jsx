import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardContext } from '../../contexts/DashboardContext';
import sleepDataService from '../../services/sleepDataService';

/**
 * Helper to format ISO date string to a readable format.
 * Example: "2024-06-01T12:00:00Z" -> "Jun 1, 2024"
 */
function formatDate(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Helper to format ISO date string to YYYYMMDD.
 * Example: "2024-06-01T12:00:00Z" -> "20240601"
 */
function formatYYYYMMDD(iso) {
  return new Date(iso).toISOString().slice(0, 10).replace(/-/g, '');
}

function DreamIndex() {
  // Get dashboard data from context
  const { dashboardData } = useContext(DashboardContext);

  // Local state for sleep data
  const [sleepData, setSleepData] = useState([]);

  // On mount or when dashboardData changes, update sleepData
  useEffect(() => {
    // If context has sleep data, use it
    if (dashboardData?.sleepData?.length) {
      setSleepData(dashboardData.sleepData);
    } else {
      // Otherwise, fetch from service as fallback
      sleepDataService
        .getUserSleepData()
        .then(setSleepData)
        .catch(console.error);
    }
  }, [dashboardData]);

  // Render a single sleep entry card
  function renderSleepEntry(entry) {
    // Format date for display and for URL key
    const dateKey = formatYYYYMMDD(entry.createdAt);
    const displayDate = formatDate(entry.createdAt);

    // Get the last wake event (if any)
    const lastWake = entry.wakeUps[entry.wakeUps.length - 1] || {};

    // Bedroom name fallback
    const bedroomName = entry.bedroom?.bedroomName || 'Unknown Bedroom';

    return (
      <div className="card mb-3" key={entry._id}>
        <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
          <strong>{displayDate}</strong>
          <span className="badge bg-info">{bedroomName}</span>
        </div>
        <div className="card-body">
          {/* Show sleepy thoughts if present */}
          {entry.sleepyThoughts && (
            <p>
              <strong>🧠 Sleepy Thoughts:</strong>{' '}
              {entry.sleepyThoughts.slice(0, 100)}...
            </p>
          )}
          {/* Show dream journal if present */}
          {lastWake.dreamJournal && (
            <p>
              <strong>💭 Dream:</strong> {lastWake.dreamJournal.slice(0, 100)}...
            </p>
          )}
          {/* Action buttons */}
          <div className="d-flex gap-2 mt-2">
            {lastWake.dreamJournal && (
              <Link
                className="btn btn-outline-info btn-sm"
                to={`/users/sleepdata/${dateKey}#dreamJournal`}
              >
                View Dream
              </Link>
            )}
            {entry.sleepyThoughts && (
              <Link
                className="btn btn-outline-primary btn-sm"
                to={`/users/sleepdata/${dateKey}#sleepyThoughts`}
              >
                Sleepy Thoughts
              </Link>
            )}
            <Link
              className="btn btn-outline-secondary btn-sm"
              to={`/users/sleepdata/${dateKey}`}
            >
              Full Session
            </Link>
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
        Explore your dream entries and sleepy thoughts.
      </p>

      {/* Show message if no data */}
      {sleepData.length === 0 ? (
        <p>No sleep data found.</p>
      ) : (
        // Sort entries by date descending and render each
        sleepData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(renderSleepEntry)
      )}
    </div>
  );
}

export default DreamIndex;
