import { useContext, useEffect } from 'react';
import { DashboardContext } from '../../contexts/DashboardContext';
import { UserContext } from '../../contexts/UserContext';
import DashboardBox from '../../components/ui/DashboardBox';
import BigActionButton from '../../components/ui/BigActionButton';
import { useNavigate } from 'react-router-dom';
import { usePreferenceSync } from '../../hooks/usePreferenceSync';
import { formatTemperature, formatDate, formatTime } from '../../utils/format/userPreferences';
import { calculateSleepStreaks, formatStreakDisplay } from '../../utils/sleep/sleepStreaks';

/**
 * Dashboard component displays user profile, bedroom info,
 * latest sleep session, and latest dream entry.
 */
function Dashboard() {
  // Get dashboard data and status from context
  const { dashboardData, loading, error } = useContext(DashboardContext);
  const { user, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Get user preferences for formatting
  const { prefersImperial, dateFormat, timeFormat } = usePreferenceSync();

  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/auth/login');
    }
  }, [user, userLoading, navigate]);

  // Show loading while user context is loading
  if (userLoading) {
    return <p>Loading...</p>;
  }

  // Show loading screen if redirecting
  if (!user) {
    return <p>Redirecting to login...</p>;
  }

  // Show loading or error states
  if (loading) {
    return <p>Loading dashboard...</p>;
  }
  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  // Destructure data for easier access
  const { profile, bedrooms, latestSleepData, latestDreamLog, allSleepSessions } = dashboardData;

  // Helper: Render profile summary
  function renderProfile(profile) {
    if (!profile) return <p>No profile data.</p>;
    return (
      <div>
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
        <p><strong>Email:</strong> {profile.email}</p>
      </div>
    );
  }

  // Helper: Render bedroom summary
  function renderBedroom(bedroom) {
    if (!bedroom) return <p>No bedroom data.</p>;
    return (
      <div>
        <p><strong>Name:</strong> {bedroom.bedroomName}</p>
        <p><strong>Temperature:</strong> {formatTemperature(bedroom.temperature, prefersImperial, true)}</p>
        <p><strong>Light Level:</strong> {bedroom.lightLevel}/5</p>
      </div>
    );
  }

  // Helper: Render latest sleep session summary
  function renderSleepSession(sleep) {
    if (!sleep) return <p>No sleep data.</p>;
    const started = sleep.createdAt ? formatDate(new Date(sleep.createdAt), dateFormat) + ' ' + formatTime(new Date(sleep.createdAt), timeFormat) : 'Unknown';
    const status = sleep.wakeUps?.length ? 'Completed' : 'Ongoing';
    
    // Calculate streak information
    const streakStats = calculateSleepStreaks(allSleepSessions || []);
    const { currentStreakText, longestStreakText, motivationalMessage } = formatStreakDisplay(streakStats);
    
    return (
      <div>
        <p><strong>Started:</strong> {started}</p>
        <p><strong>Status:</strong> {status}</p>
        <hr className="my-2" />
        <div className="streak-info">
          <p className="mb-1"><strong>Current Streak:</strong> {currentStreakText}</p>
          <p className="mb-1"><strong>Best Streak:</strong> {longestStreakText}</p>
          <small className="text-muted">{motivationalMessage}</small>
        </div>
      </div>
    );
  }

  // Helper: Render latest dream log summary
  function renderDreamLog(log) {
    if (!log) return <p>No dream log.</p>;
    // Truncate long logs for display
    const preview = log.slice(0, 120);
    return (
      <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
        <p>{preview}{log.length > 120 && '...'}</p>
      </div>
    );
  }

  // Main dashboard layout
  return (
    <div className="container py-4">
      {/* Big Action Button - Main CTA */}
      <div className="row mb-5">
        <div className="col-12 text-center">
          <BigActionButton size="large" />
        </div>
      </div>

      <div className="row g-4">
        {/* Profile Box */}
        <div className="col-md-6">
          <DashboardBox
            title="Profile"
            data={profile}
            renderContent={renderProfile}
            actions={[{ label: 'View Profile', onClick: () => navigate('/users/profile') }]}
          />
        </div>

        {/* Bedroom Summary */}
        <div className="col-md-6">
          <DashboardBox
            title="Bedroom"
            data={bedrooms && bedrooms[0]}
            renderContent={renderBedroom}
            actions={[{ label: 'View Bedrooms', onClick: () => navigate('/users/dashboard/bedrooms') }]}
          />
        </div>

        {/* Sleep Session Summary */}
        <div className="col-md-6">
          <DashboardBox
            title="Latest Sleep Session"
            data={latestSleepData}
            renderContent={renderSleepSession}
            actions={[{ label: 'View Sleep Data', onClick: () => navigate('/users/dashboard/sleepdata') }]}
          />
        </div>

        {/* Dream Log Summary */}
        <div className="col-md-6">
          <DashboardBox
            title="Latest Dream Entry"
            data={latestDreamLog}
            renderContent={renderDreamLog}
            actions={[{ label: 'View Dreams', onClick: () => navigate('/users/dashboard/dreams') }]}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
