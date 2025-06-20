import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import sleepDataService from '../../services/sleepDataService';
import { DashboardContext } from '../../contexts/DashboardContext';

function SleepSession() {
  // Get the id param from the URL (could be date for dreamjournal route or id for sleepdata route)
  const { date, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if this is being accessed via dreamjournal route
  const isDreamJournalFocus = location.pathname.includes('/dreamjournal/');

  // Get dashboard data and refresh function from context
  const { dashboardData } = useContext(DashboardContext);

  // Local state for sleep data and loading status
  const [sleepData, setSleepData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to find the sleep session for the given date/id from context, otherwise fetch from API
  useEffect(() => {
    // First check if we received session data via navigation state
    if (location.state?.sessionData) {
      setSleepData(location.state.sessionData);
      setLoading(false);
      return;
    }

    // Determine what we're looking for (date or id)
    const searchParam = id || date;
    
    let entry;
    if (id) {
      // Looking for specific ID (from sleepdata route)
      // First try to find in dashboardData.sleepSessions (if it exists)
      entry = dashboardData?.sleepSessions?.find(entry => entry._id === id);
      
      // If not found and we have latestSleepData, check if it matches
      if (!entry && dashboardData?.latestSleepData?._id === id) {
        entry = dashboardData.latestSleepData;
      }
    } else if (date) {
      // Looking for date (from dreamjournal route)
      entry = dashboardData?.sleepSessions?.find(entry =>
        new Date(entry.createdAt).toISOString().startsWith(date)
      );
      
      // Fallback: check latestSleepData
      if (!entry && dashboardData?.latestSleepData) {
        const latestDate = new Date(dashboardData.latestSleepData.createdAt).toISOString();
        if (latestDate.startsWith(date)) {
          entry = dashboardData.latestSleepData;
        }
      }
    }

    if (entry) {
      setSleepData(entry);
      setLoading(false);
    } else {
      // Only try to fetch from API if we don't have the data in context
      // For now, let's avoid the broken /sleep-data/:id endpoint
      if (date) {
        // For date-based lookups (dreamjournal), try the date endpoint
        sleepDataService.getSleepDataByDate(date)
          .then(data => setSleepData(data))
          .catch(err => {
            console.error('Failed to fetch by date:', err);
            setSleepData(null);
          })
          .finally(() => setLoading(false));
      } else {
        // For ID-based lookups, show an error since the endpoint is broken
        console.error('Sleep session not found in cache and backend /sleep-data/:id endpoint is unavailable');
        setSleepData(null);
        setLoading(false);
      }
    }
  }, [date, id, dashboardData, location.state]);

  // Smooth scroll to anchor if hash is present in URL (e.g. #dreamJournal)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        el.classList.add('highlight-flash');
        setTimeout(() => el.classList.remove('highlight-flash'), 2000);
      }
    }
  }, [location, sleepData]);

  // Show loading or not found messages
  if (loading) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Loading sleep data...
        </div>
      </div>
    );
  }
  
  if (!sleepData) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h5>Sleep Session Not Found</h5>
          <p>
            {id 
              ? `Could not find sleep session with ID: ${id}. The session might not be available or there may be a backend connectivity issue.`
              : `Could not find sleep session for date: ${date}.`
            }
          </p>
          <button 
            className="btn btn-outline-primary btn-sm me-2"
            onClick={() => navigate('/users/dashboard/sleepdata')}
          >
            Back to Sleep Data Index
          </button>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate('/users/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Destructure relevant fields from sleepData
  const { bedroom, cuddleBuddy, sleepyThoughts, wakeUps, createdAt } = sleepData;

  // Parse start time
  const start = new Date(createdAt);

  // Get the latest wake-up event (last in the array)
  const latestWake = wakeUps?.[wakeUps.length - 1];

  // Calculate total sleep duration in hours, if finished sleeping
  let totalSleepDuration = null;
  if (latestWake?.awakenAt) {
    const awakenTime = new Date(latestWake.awakenAt);
    totalSleepDuration = ((awakenTime - start) / (1000 * 60 * 60)).toFixed(2);
  }

  // Render the sleep session details
  return (
    <div className="container my-4">
      <h2>Sleep Session - {start.toLocaleDateString()}</h2>
      <p>
        <strong>Started at:</strong> {start.toLocaleTimeString()}
      </p>
      <p>
        <strong>Bedroom:</strong> {bedroom?.bedroomName || 'N/A'}
      </p>
      <p>
        <strong>Cuddle Buddy:</strong> {cuddleBuddy}
      </p>
      <p>
        <strong>Total Sleep:</strong>{' '}
        {totalSleepDuration ? `${totalSleepDuration} hours` : 'Still asleep'}
      </p>

      {/* Sleepy Thoughts Section */}
      <section id="sleepyThoughts" className="mt-4">
        <h4>Sleepy Thoughts</h4>
        <p>{sleepyThoughts || 'None recorded.'}</p>
      </section>

      {/* Dream Journal Section */}
      <section id="dreamJournal" className="mt-4">
        <h4>Dream Journal</h4>
        {latestWake?.dreamJournal ? (
          <p>{latestWake.dreamJournal}</p>
        ) : (
          <p>No dream journal entry.</p>
        )}
      </section>

      {/* Wake Ups Section */}
      <section className="mt-4">
        <h4>Wake Ups</h4>
        {wakeUps.length === 0 ? (
          <p>No wake-up events recorded yet.</p>
        ) : (
          wakeUps.map((wake, index) => {
            const awakenAt = wake.awakenAt
              ? new Date(wake.awakenAt).toLocaleTimeString()
              : 'N/A';
            const backToBedAt = wake.backToBedAt
              ? new Date(wake.backToBedAt).toLocaleTimeString()
              : null;

            return (
              <div key={index} className="mb-3 border rounded p-2  ">
                <p>
                  <strong>Awakened at:</strong> {awakenAt}
                </p>
                <p>
                  <strong>Sleep Quality:</strong> {wake.sleepQuality}
                </p>
                {wake.finishedSleeping && <p><em>Final wake-up</em></p>}
                {backToBedAt && (
                  <p>
                    <strong>Back to bed at:</strong> {backToBedAt}
                  </p>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Back Button */}
      <button
        className="btn btn-secondary mt-4"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
    </div>
  );
}

export default SleepSession;
