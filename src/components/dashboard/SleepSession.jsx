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
    // Determine what we're looking for (date or id)
    const searchParam = id || date;
    
    let entry;
    if (id) {
      // Looking for specific ID (from sleepdata route)
      entry = dashboardData?.sleepSessions?.find(entry => entry._id === id);
    } else if (date) {
      // Looking for date (from dreamjournal route)
      entry = dashboardData?.sleepSessions?.find(entry =>
        new Date(entry.createdAt).toISOString().startsWith(date)
      );
    }

    if (entry) {
      setSleepData(entry);
      setLoading(false);
    } else {
      // Fetch from API if not found in context
      const fetchPromise = id 
        ? sleepDataService.get(id)  // Fetch by ID
        : sleepDataService.getSleepDataByDate(date); // Fetch by date (for dreamjournal)
        
      fetchPromise
        .then(data => setSleepData(data))
        .catch(err => {
          console.error(err);
          setSleepData(null);
        })
        .finally(() => setLoading(false));
    }
  }, [date, id, dashboardData]);

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
  if (loading) return <p>Loading sleep data...</p>;
  if (!sleepData) return <p>Sleep data not found.</p>;

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
