import React, { useContext } from 'react';
import { DashboardContext } from '@contexts/DashboardContext';
import DashboardBox from '@components/dashboard/DashboardBox';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard component displays user profile, bedroom info,
 * latest sleep session, and latest dream entry.
 */
function Dashboard() {
  // Get dashboard data and status from context
  const { dashboardData, loading, error } = useContext(DashboardContext);
  const navigate = useNavigate();

  // Show loading or error states
  if (loading) {
    return <p>Loading dashboard...</p>;
  }
  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  // Destructure data for easier access
  const { profile, bedrooms, latestSleepData, latestDreamLog } = dashboardData;

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
        <p><strong>Temperature:</strong> {bedroom.temperature}°</p>
        <p><strong>Light Level:</strong> {bedroom.lightLevel}/5</p>
      </div>
    );
  }

  // Helper: Render latest sleep session summary
  function renderSleepSession(sleep) {
    if (!sleep) return <p>No sleep data.</p>;
    const started = sleep.createdAt ? new Date(sleep.createdAt).toLocaleString() : 'Unknown';
    const status = sleep.wakeUps?.length ? 'Completed' : 'Ongoing';
    return (
      <div>
        <p><strong>Started:</strong> {started}</p>
        <p><strong>Status:</strong> {status}</p>
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
      <div className="row g-4">
        {/* Profile Box */}
        <div className="col-md-6">
          <DashboardBox
            title="Profile"
            data={profile}
            onClick={() => navigate('/profile')}
            renderContent={renderProfile}
          />
        </div>

        {/* Bedroom Summary */}
        <div className="col-md-6">
          <DashboardBox
            title="Bedroom"
            data={bedrooms && bedrooms[0]}
            onClick={() => navigate('/bedrooms')}
            renderContent={renderBedroom}
          />
        </div>

        {/* Sleep Session Summary */}
        <div className="col-md-6">
          <DashboardBox
            title="Latest Sleep Session"
            data={latestSleepData}
            onClick={() => navigate('/sleep')}
            renderContent={renderSleepSession}
          />
        </div>

        {/* Dream Log Summary */}
        <div className="col-md-6">
          <DashboardBox
            title="Latest Dream Entry"
            data={latestDreamLog}
            onClick={() => navigate('/dreams')}
            renderContent={renderDreamLog}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
