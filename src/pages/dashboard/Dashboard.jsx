import { useContext } from 'react';
import { DashboardContext } from '../../contexts/DashboardContext';
import { UserContext } from '../../contexts/UserContext';
import DashboardBox from '../../components/ui/DashboardBox';
import BigActionButton from '../../components/ui/BigActionButton';
import { useNavigate } from 'react-router-dom';
import { usePreferenceSync } from '../../hooks/usePreferenceSync';
import { formatTemperature, formatDate, formatTime } from '../../utils/format/userPreferences';
import { calculateSleepStreaks, formatStreakDisplay } from '../../utils/sleep/sleepStreaks';
import { calculateSleepDuration } from '../../utils/sleep/sleepDataUtils';
import { User, Bed, BarChart2, PenTool, Flame, Award } from 'lucide-react';
import Loading from '../../components/ui/Loading';

/**
 * Dashboard component displays user profile, bedroom info,
 * latest sleep session, and latest dream entry.
 */
function Dashboard() {
  // Get dashboard data and status from context
  const { dashboardData, loading, error } = useContext(DashboardContext);
  const { loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Get user preferences for formatting
  // Use preferences from profile if available, else from usePreferenceSync
  const preferences = dashboardData.profile?.userPreferences || {};
  const prefersImperial = preferences.prefersImperial ?? false;
  const dateFormat = preferences.dateFormat || 'yyyy-MM-dd';
  const timeFormat = preferences.timeFormat || 'HH:mm';

  // Show loading while user context or dashboard data is loading
  if (userLoading || loading) {
    return <Loading message="Loading dashboard..." />;
  }
  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  // Destructure data for easier access
  const { profile, bedrooms, latestSleepData, latestDreamLog, allSleepSessions } = dashboardData;

  // Debug: Log dashboardData to help diagnose loading issues
  console.log('DASHBOARD DATA:', dashboardData);

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
    const isFinished = sleep.wakeUps?.length > 0;
    const playfulStatus = isFinished ? 'Finished 😴' : 'Still Asleep 💤';
    
    // Handler for clicking on the date to navigate to specific session
    const handleDateClick = () => {
      if (sleep && sleep._id) {
        navigate(`/users/dashboard/sleepdata/${sleep._id}`, {
          state: { sessionData: sleep }
        });
      }
    };
    
    // Calculate duration for finished sessions
    let durationInfo = null;
    if (isFinished) {
      const duration = calculateSleepDuration(sleep.createdAt, sleep.wakeUps);
      if (duration) {
        durationInfo = <p><strong>Dream Duration:</strong> {duration}</p>;
      }
    }
    
    // Calculate streak information
    const streakStats = calculateSleepStreaks(allSleepSessions || []);
    const { currentStreakText, longestStreakText, motivationalMessage } = formatStreakDisplay(streakStats);
    
    return (
      <div>
        <p>
          <strong>Started:</strong>{' '}
          <button 
            className="btn btn-link p-0 text-decoration-underline fw-normal"
            onClick={handleDateClick}
            style={{ 
              fontSize: 'inherit',
              color: 'var(--bs-link-color)',
              border: 'none',
              background: 'none'
            }}
            title="Click to view this sleep session"
          >
            {started}
          </button>
        </p>
        <p><strong>Status:</strong> {playfulStatus}</p>
        {durationInfo}
        <hr className="my-2" />
        <div className="streak-info">
          <div className="d-flex align-items-center mb-1">
            <Flame className="me-2 text-warning" size={16} />
            <span><strong>Current Streak:</strong> {currentStreakText}</span>
          </div>
          <div className="d-flex align-items-center mb-1">
            <Award className="me-2 text-success" size={16} />
            <span><strong>Best Streak:</strong> {longestStreakText}</span>
          </div>
          <small className="text-muted">{motivationalMessage}</small>
        </div>
      </div>
    );
  }

  // Helper: Render latest dream log summary with context awareness and cloud navigation
  function renderDreamLog(log) {
    const hasActiveSleep = latestSleepData && (!latestSleepData.wakeUps || latestSleepData.wakeUps.length === 0);
    const handleDreamCloudClick = () => {
      if (latestSleepData && latestSleepData._id) {
        navigate(`/users/dashboard/sleepdata/${latestSleepData._id}`, {
          state: { sessionData: latestSleepData }
        });
      } else {
        navigate('/users/dashboard/dreams');
      }
    };
    if (hasActiveSleep) {
      return (
        <div className="py-2">
          <div
            className="sleepy-thought-cloud"
            onClick={handleDreamCloudClick}
            role="button"
            tabIndex="0"
            aria-label="View current sleep session"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDreamCloudClick();
              }
            }}
          >
            <span className="sleepy-emoji">😴</span>
            <p className="dream-cloud-text mb-0" style={{ color: '#2c3e50', fontWeight: '500' }}>
              <em>Sweet dreams are happening...</em>
            </p>
          </div>
        </div>
      );
    }
    // Only declare hasContent once
    let hasContent = latestSleepData && (
      latestSleepData.sleepyThoughts?.trim() ||
      latestSleepData.wakeUps?.some(wake => wake.dreamJournal?.trim())
    );
    if (!hasContent) {
      return (
        <div className="py-2">
          <p className="text-muted text-center mb-0">
            No dreams or sleepy thoughts recorded yet
          </p>
          <div className="text-center mt-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => navigate('/users/dashboard/dreams')}
            >
              View Dream Journal
            </button>
          </div>
        </div>
      );
    }
    if (log) {
      const maxLength = 500;
      const displayText = log.length > maxLength ? log.slice(0, maxLength).trim() + '...' : log;
      const cloudSize = displayText.length > 300 ? 'large' : displayText.length > 150 ? '' : 'small';
      return (
        <div className="py-2">
          <div
            className={`dream-cloud ${cloudSize}`}
            onClick={handleDreamCloudClick}
            role="button"
            tabIndex="0"
            aria-label="View sleep session for this dream"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDreamCloudClick();
              }
            }}
          >
            <p className="dream-cloud-text dream-content" style={{ color: '#2c3e50', fontWeight: '500' }}>
              {displayText}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="py-2">
        <p className="text-muted text-center mb-0">
          No dream content available
        </p>
        <div className="text-center mt-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => navigate('/users/dashboard/dreams')}
          >
            View Dream Journal
          </button>
        </div>
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

      <div className="row g-4 g-lg-5">
        {/* Profile Box */}
        <div className="col-md-6 col-lg-6">
          <DashboardBox
            title="Profile"
            icon={<User />}
            data={profile}
            renderContent={renderProfile}
            actions={[{ label: 'View Profile', onClick: () => navigate('/profile'), title: 'Go to your profile page' }]}
          />
        </div>

        {/* Bedroom Summary */}
        <div className="col-md-6 col-lg-6">
          <DashboardBox
            title="Latest Bedroom Used"
            icon={<Bed />}
            data={bedrooms && bedrooms[0]}
            renderContent={renderBedroom}
            actions={[{ label: 'View Bedrooms', onClick: () => navigate('/bedrooms'), title: 'See all your bedrooms' }]}
          />
        </div>

        {/* Sleep Session Summary */}
        <div className="col-md-6 col-lg-6">
          <DashboardBox
            title="Latest Sleep Session"
            icon={<BarChart2 />}
            data={latestSleepData}
            renderContent={renderSleepSession}
            actions={[{ 
              label: 'View Sleep Data', 
              onClick: () => navigate('/sleep'),
              title: 'See all your sleep sessions'
            }]}
          />
        </div>

        {/* Dream Log Summary */}
        <div className="col-md-6 col-lg-6">
          <DashboardBox
            title={(() => {
              // Dynamic title based on sleep state
              const hasActiveSleep = latestSleepData && (!latestSleepData.wakeUps || latestSleepData.wakeUps.length === 0);
              if (hasActiveSleep) return "Dream Journal";
              if (latestSleepData && latestSleepData.wakeUps?.length > 0 && !latestDreamLog) return "Dream Journal";
              return "Latest Dream Entry";
            })()}
            icon={<PenTool />}
            data={latestDreamLog}
            renderContent={renderDreamLog}
            actions={[{ 
              label: (() => {
                // Dynamic action label based on sleep state
                const hasActiveSleep = latestSleepData && (!latestSleepData.wakeUps || latestSleepData.wakeUps.length === 0);
                if (hasActiveSleep) return "View Dreams";
                if (latestSleepData && latestSleepData.wakeUps?.length > 0 && !latestDreamLog) return "View Dreams";
                return "View Dreams";
              })(), 
              onClick: () => navigate('/journal'),
              title: 'See your dream journal'
            }]}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
