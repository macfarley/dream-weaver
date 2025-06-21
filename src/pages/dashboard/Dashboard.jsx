import { useContext, useEffect } from 'react';
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
    // Check if user has an active sleep session (no wake-ups recorded)
    const hasActiveSleep = latestSleepData && (!latestSleepData.wakeUps || latestSleepData.wakeUps.length === 0);
    
    // Handler for clicking on dream clouds - navigate to specific sleep session by ID
    const handleDreamCloudClick = () => {
      if (latestSleepData && latestSleepData._id) {
        // Pass the session data through navigation state to avoid backend call
        navigate(`/users/dashboard/sleepdata/${latestSleepData._id}`, {
          state: { sessionData: latestSleepData }
        });
      } else {
        // Fallback to dreams index page  
        navigate('/users/dashboard/dreams');
      }
    };
    
    if (hasActiveSleep) {
      // User is currently sleeping - show encouraging message in a sleepy cloud
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
    
    // Check if latest sleep session has dreams or sleepy thoughts
    const hasContent = latestSleepData && (
      latestSleepData.sleepyThoughts?.trim() || 
      latestSleepData.wakeUps?.some(wake => wake.dreamJournal?.trim())
    );
    
    // If no content in recent session, show simple text message (no cloud)
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
    
    // User has dream log - show the latest entry in a single, reasonably-sized cloud
    if (log) {
      // Cap the text at 500 characters to avoid crowding the dashboard box
      const maxLength = 500;
      const displayText = log.length > maxLength ? log.slice(0, maxLength).trim() + '...' : log;
      
      // Determine cloud size based on actual display text length
      const cloudSize = displayText.length > 300 ? 'large' : displayText.length > 150 ? '' : 'small';
      
      // Single cloud - keep it simple and clean
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
    
    // Fallback - no cloud, just simple text message
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
            actions={[{ label: 'View Profile', onClick: () => navigate('/users/profile') }]}
          />
        </div>

        {/* Bedroom Summary */}
        <div className="col-md-6 col-lg-6">
          <DashboardBox
            title="Latest Bedroom Used"
            icon={<Bed />}
            data={bedrooms && bedrooms[0]}
            renderContent={renderBedroom}
            actions={[{ label: 'View Bedrooms', onClick: () => navigate('/users/dashboard/bedrooms') }]}
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
              onClick: () => navigate('/users/dashboard/sleepdata')
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
              onClick: () => navigate('/users/dashboard/dreams') 
            }]}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
