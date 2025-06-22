import { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import * as sleepDataService from '../../services/sleepDataService';
import { DashboardContext } from '../../contexts/DashboardContext';
import { usePreferenceSync } from '../../hooks/usePreferenceSync';
import { formatDate, formatTime } from '../../utils/format/userPreferences';

function SleepSession() {
  // Get the id param from the URL (could be date for dreamjournal route or id for sleepdata route)
  const { date, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get dashboard data and refresh function from context
  const { dashboardData, refreshDashboard } = useContext(DashboardContext);
  
  // Get user preferences for date/time formatting
  const { dateFormat, timeFormat } = usePreferenceSync();

  // Local state for sleep data and loading status
  const [sleepData, setSleepData] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for editing functionality
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [deletePassword, setDeletePassword] = useState('');

  // Try to find the sleep session for the given date/id from context, otherwise fetch from API
  useEffect(() => {
    // First check if we received session data via navigation state
    if (location.state?.sessionData) {
      setSleepData(location.state.sessionData);
      setLoading(false);
      return;
    }

    // Determine what we're looking for (date or id)
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

  // Initialize form data when sleepData changes
  useEffect(() => {
    if (sleepData) {
      const latestWake = sleepData.wakeUps?.[sleepData.wakeUps.length - 1] || {};
      setFormData({
        cuddleBuddy: sleepData.cuddleBuddy || '',
        sleepyThoughts: sleepData.sleepyThoughts || '',
        dreamJournal: latestWake.dreamJournal || '',
        restfulness: latestWake.restfulness || 5,
        awakenAt: latestWake.awakenAt ? new Date(latestWake.awakenAt).toISOString().slice(0, 16) : ''
      });
    }
  }, [sleepData]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'range' ? Number(value) : value
    }));
  };

  // Handle form submission for editing sleep session
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare the update payload
      const updatePayload = {
        cuddleBuddy: formData.cuddleBuddy,
        sleepyThoughts: formData.sleepyThoughts,
      };

      // If there are wake-ups, update the latest one with dream journal, restfulness, and awakenAt
      if (sleepData.wakeUps && sleepData.wakeUps.length > 0) {
        const updatedWakeUps = [...sleepData.wakeUps];
        const latestWakeIndex = updatedWakeUps.length - 1;
        updatedWakeUps[latestWakeIndex] = {
          ...updatedWakeUps[latestWakeIndex],
          dreamJournal: formData.dreamJournal,
          restfulness: parseInt(formData.restfulness),
          awakenAt: formData.awakenAt ? new Date(formData.awakenAt).toISOString() : updatedWakeUps[latestWakeIndex].awakenAt
        };
        updatePayload.wakeUps = updatedWakeUps;
      }

      await sleepDataService.update(sleepData._id, updatePayload);

      // Refresh dashboard context and fetch latest data for this session
      if (refreshDashboard) {
        await refreshDashboard();
      }
      // Optionally, fetch the latest session data from context after refresh
      let updatedSession = null;
      if (id) {
        updatedSession = dashboardData?.sleepSessions?.find(entry => entry._id === id);
      } else if (date) {
        updatedSession = dashboardData?.sleepSessions?.find(entry => new Date(entry.createdAt).toISOString().startsWith(date));
      }
      setSleepData(updatedSession || sleepData);
      setIsEditing(false);
      alert('Sleep session updated successfully!');
    } catch (err) {
      console.error('Error updating sleep session:', err);
      alert('Failed to update sleep session. Please try again.');
    }
  };

  // Handle sleep session deletion
  const handleDelete = async () => {
    if (!deletePassword) {
      alert('Password required for deletion');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this sleep session? This action cannot be undone.')) {
      return;
    }

    try {
      await sleepDataService.delete(sleepData._id, deletePassword);
      
      // Refresh dashboard context if available
      if (refreshDashboard) {
        refreshDashboard();
      }
      
      alert('Sleep session deleted successfully!');
      navigate('/users/dashboard/sleepdata');
    } catch (err) {
      console.error('Error deleting sleep session:', err);
      alert('Failed to delete sleep session. Please check your password and try again.');
    }
  };

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
  const { wakeUps, createdAt } = sleepData;

  // Parse start time
  const start = new Date(createdAt);

  // Get the latest wake-up event (last in the array)
  const latestWake = wakeUps?.[wakeUps.length - 1];

  // Calculate total sleep duration in hours, if finished sleeping
  let totalSleepDuration = null;
  if (latestWake?.awakenAt) {
    const awakenTime = new Date(latestWake.awakenAt);
    // Calculate total sleep in minutes, round to nearest minute
    const totalMinutes = Math.round((awakenTime - start) / (1000 * 60));
    // Format as H:MM (e.g., 7:23 hours)
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    totalSleepDuration = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  // Render the sleep session details
  return (
    <div className="container my-4">
      <div className="mb-4">
        <h2>Sleep Session - {formatDate(start, dateFormat)}</h2>
      </div>

      <div className="row">
        {/* Left column: Session details */}
        <div className="col-md-8">
          {!isEditing ? (
            <SleepSessionInfo 
              sleepData={sleepData}
              start={start}
              totalSleepDuration={totalSleepDuration}
              timeFormat={timeFormat}
            />
          ) : (
            <SleepSessionEditForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
              sleepData={sleepData}
              start={start}
              totalSleepDuration={totalSleepDuration}
              timeFormat={timeFormat}
            />
          )}
        </div>

        {/* Right column: Actions */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body bg-nav-footer">
              <h5 className="card-title">Actions</h5>
              
              {/* Edit Session Button */}
              {!isEditing && (
                <button 
                  className="btn btn-primary btn-sm mb-2 w-100"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Session
                </button>
              )}
              
              <button 
                className="btn btn-outline-primary btn-sm mb-2 w-100"
                onClick={() => navigate('/users/dashboard/sleepdata')}
              >
                Back to Sleep Data Index
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm mb-3 w-100"
                onClick={() => navigate('/users/dashboard')}
              >
                Back to Dashboard
              </button>

              {/* Delete Section */}
              <div className="border-top pt-3">
                <h6 className="text-danger">Danger Zone</h6>
                <div className="mb-2">
                  <label htmlFor="deletePassword" className="form-label">
                    <small>Password (required for deletion):</small>
                  </label>
                  <input
                    type="password"
                    id="deletePassword"
                    className="form-control form-control-sm"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
                <button 
                  className="btn btn-danger btn-sm w-100"
                  onClick={handleDelete}
                  disabled={!deletePassword}
                >
                  Delete Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Display sleep session info (view mode)
function SleepSessionInfo({ sleepData, start, totalSleepDuration, timeFormat }) {
  const { bedroom, cuddleBuddy, sleepyThoughts, wakeUps } = sleepData;

  // In SleepSessionInfo, update accent classes and card body backgrounds
  return (
    <>
      <div className="card mb-4">
        <div className="card-body bg-nav-footer">
          <h5 className="card-title">Session Overview</h5>
          <p><strong>Started at:</strong> {formatTime(start, timeFormat)}</p>
          <p><strong>Bedroom:</strong> {bedroom?.bedroomName || 'N/A'}</p>
          <p><strong>Cuddle Buddy:</strong> {cuddleBuddy || 'None'}</p>
          <p>
            <strong>Total Sleep:</strong>{' '}
            {totalSleepDuration ? `${totalSleepDuration} hours` : 'Still asleep'}
          </p>
        </div>
      </div>

      {/* Combined Dream Journal Section */}
      <section id="dreamJournal" className="mb-4">
        <div className="card">
          <div className="card-body bg-nav-footer">
            <h5 className="card-title">Dream Journal</h5>
            
            {/* Sleepy Thoughts */}
            {sleepyThoughts && (
              <div className="mb-3 sleep-accent-lilac">
                <h6 className="text-muted">🧠 Sleepy Thoughts:</h6>
                <p className="mb-3">
                  {sleepyThoughts}
                </p>
              </div>
            )}
            
            {/* Dreams from all wake-ups */}
            {wakeUps.some(wake => wake.dreamJournal) ? (
              <div className="mb-3">
                <h6 className="text-muted">💭 Dreams:</h6>
                {wakeUps.map((wake, index) => 
                  wake.dreamJournal && (
                    <div key={index} className="sleep-accent-lilac">
                      <p className="mb-1">{wake.dreamJournal}</p>
                      {wake.restfulness && (
                        <small className="text-muted">Restfulness: {wake.restfulness}/10</small>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : !sleepyThoughts ? (
              <p className="text-muted">No dreams or sleepy thoughts recorded.</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Wake Ups Section */}
      <section className="mb-4">
        <div className="card">
          <div className="card-body bg-nav-footer">
            <h5 className="card-title">Wake Ups</h5>
            {wakeUps.length === 0 ? (
              <p className="text-muted">No wake-up events recorded yet.</p>
            ) : (
              <div className="row g-2">
                {wakeUps.map((wake, index) => {
                  const awakenAt = wake.awakenAt
                    ? formatTime(new Date(wake.awakenAt), timeFormat)
                    : 'N/A';
                  const backToBedAt = wake.backToBedAt
                    ? formatTime(new Date(wake.backToBedAt), timeFormat)
                    : null;

                  return (
                    <div key={index} className="col-md-6 col-lg-4">
                      <div className="card border-secondary sleep-accent-lilac" style={{fontSize: '0.9rem'}}>
                        <div className="card-body p-3 bg-nav-footer">
                          <div className="mb-2">
                            <strong>Awaken:</strong> {awakenAt}
                          </div>
                          <div className="mb-2">
                            <strong>Quality:</strong> {wake.sleepQuality}
                          </div>
                          {backToBedAt && (
                            <div className="mb-2">
                              <strong>Back to bed:</strong> {backToBedAt}
                            </div>
                          )}
                          {wake.finishedSleeping && (
                            <div className="text-success">
                              <small><em>Final wake-up</em></small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// Subcomponent: Edit form for sleep session
function SleepSessionEditForm({ formData, handleChange, handleSubmit, onCancel, sleepData, start, totalSleepDuration, timeFormat }) {
  const { bedroom, wakeUps } = sleepData;

  // Find the latest wake-up event
  const latestWake = wakeUps?.[wakeUps.length - 1] || {};

  // Helper to format datetime-local value
  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    // Pad with zeros for month, day, hour, minute
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Edit Sleep Session</h5>
          {/* Read-only session info */}
          <div className="mb-3">
            <p><strong>Started at:</strong> {formatTime(start, timeFormat)}</p>
            <p><strong>Bedroom:</strong> {bedroom?.bedroomName || 'N/A'}</p>
            <p>
              <strong>Total Sleep:</strong>{' '}
              {totalSleepDuration ? `${totalSleepDuration} hours` : 'Still asleep'}
            </p>
          </div>

          {/* Editable fields */}
          <div className="mb-3">
            <label htmlFor="cuddleBuddy" className="form-label">Cuddle Buddy</label>
            <select
              id="cuddleBuddy"
              name="cuddleBuddy"
              className="form-select"
              value={formData.cuddleBuddy}
              onChange={handleChange}
            >
              <option value="none">None</option>
              <option value="pillow">Pillow</option>
              <option value="stuffed animal">Stuffed Animal</option>
              <option value="pet">Pet</option>
              <option value="person">Person</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="sleepyThoughts" className="form-label">Sleepy Thoughts</label>
            <textarea
              id="sleepyThoughts"
              name="sleepyThoughts"
              className="form-control"
              rows="3"
              value={formData.sleepyThoughts}
              onChange={handleChange}
              placeholder="What were you thinking about as you went to sleep?"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="dreamJournal" className="form-label">Dream Journal</label>
            <textarea
              id="dreamJournal"
              name="dreamJournal"
              className="form-control"
              rows="4"
              value={formData.dreamJournal}
              onChange={handleChange}
              placeholder="Describe your dreams..."
            />
          </div>

          <div className="mb-3">
            <label htmlFor="restfulness" className="form-label">
              Restfulness (1-10): {formData.restfulness}
            </label>
            <input
              type="range"
              id="restfulness"
              name="restfulness"
              className="form-range"
              min="1"
              max="10"
              value={formData.restfulness}
              onChange={handleChange}
            />
            <div className="d-flex justify-content-between">
              <small>1 - Terrible</small>
              <small>10 - Perfect</small>
            </div>
          </div>

          {/* New: Ending timestamp (awakenAt) for latest wake-up */}
          <div className="mb-3">
            <label htmlFor="awakenAt" className="form-label">Ending Time (Awaken At)</label>
            <input
              type="datetime-local"
              id="awakenAt"
              name="awakenAt"
              className="form-control"
              value={formData.awakenAt || formatDateTimeLocal(latestWake.awakenAt)}
              onChange={handleChange}
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default SleepSession;
