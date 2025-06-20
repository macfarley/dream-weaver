import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { DashboardContext } from '../../contexts/DashboardContext';
import sleepSessionService from '../../services/sleepSessionService';
import { useNavigate } from 'react-router-dom';
import { hasActiveSleepSession } from '../../utils/sleep/sleepStateUtils';
import DWLogo from '../../assets/DW-Logo.png';

function WakeUpForm() {
    // Get the current user from context
    const { user } = useContext(UserContext);

    // Get the dashboard refresh function from context (if available)
    const { refreshDashboard, dashboardData } = useContext(DashboardContext) || {};

    // For navigation after form submission
    const navigate = useNavigate();

    // State to hold the current sleep session data
    const [sleepData, setSleepData] = useState(null);

    // State for the dream journal input
    const [dreamJournal, setDreamJournal] = useState('');

    // State for retroactive wake-up time
    const [actualWakeUpTime, setActualWakeUpTime] = useState('');
    const [useCustomWakeUpTime, setUseCustomWakeUpTime] = useState(false);

    // State to indicate if the form is submitting
    const [submitting, setSubmitting] = useState(false);

    // State for error messages
    const [error, setError] = useState('');

    // Get the current sleep session from dashboard context
    useEffect(() => {        
        if (dashboardData?.latestSleepData) {
            // Use centralized utility for consistent sleep state checking
            if (hasActiveSleepSession(dashboardData)) {
                const sleepSession = dashboardData.latestSleepData;
                setSleepData(sleepSession);
                setError(''); // Clear any previous errors
                
                // Set default wake-up time to now
                setActualWakeUpTime(new Date().toISOString().slice(0, 16));
            } else {
                setError('No active sleep session found. Please start a new sleep session first.');
            }
        } else {
            setError('No sleep session data available. Please start a new sleep session first.');
        }
    }, [dashboardData]);

    // Handle form submission
    const handleWakeUp = async () => {
        if (!sleepData) return;

        try {
            setSubmitting(true);
            setError('');

            // Prepare wakeup data - staying awake with current time
            const wakeupData = {
                sleepQuality: 4, // Default good quality
                dreamJournal,
                awakenAt: useCustomWakeUpTime && actualWakeUpTime 
                    ? new Date(actualWakeUpTime)  // Use custom time if provided
                    : new Date(),                 // Default to now
                finishedSleeping: true,
                backToBedAt: null,
            };

            await sleepSessionService.addWakeupEvent(wakeupData);

            // Refresh the dashboard if possible
            if (refreshDashboard) refreshDashboard();

            // Show success message temporarily then navigate
            setError(''); // Clear any errors
            
            // Navigate to dashboard with success state
            navigate('/users/dashboard', { 
                state: { 
                    message: 'Good morning! Sleep session completed successfully! 🌅',
                    type: 'success'
                }
            });
        } catch (err) {
            console.error('Failed to complete sleep session:', err);
            setError(err.message || 'Something went wrong while completing your sleep session.');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle going back to bed
    const handleBackToBed = async () => {
        if (!sleepData) return;

        try {
            setSubmitting(true);
            setError('');

            // Prepare wakeup data - going back to bed
            const wakeupData = {
                sleepQuality: 3, // Neutral quality for brief wake
                dreamJournal,
                awakenAt: new Date(),
                finishedSleeping: false,
                backToBedAt: new Date(),
            };

            await sleepSessionService.addWakeupEvent(wakeupData);

            // Refresh the dashboard if possible
            if (refreshDashboard) refreshDashboard();

            // Navigate back to dashboard
            navigate('/users/dashboard');
        } catch (err) {
            console.error('Failed to record back to bed:', err);
            setError(err.message || 'Something went wrong while recording your wake event.');
        } finally {
            setSubmitting(false);
        }
    };

    // If the user is not logged in, prompt them to log in
    if (!user) return <p className="text-center mt-4">Please log in.</p>;

    // If there's an error, display it
    if (error) return <p className="text-danger text-center mt-4">{error}</p>;

    // If sleep data is still loading, show a loading message
    if (!sleepData) return <p className="text-center mt-4">Looking for open sleep session...</p>;

    // Main form UI
    return (
        <div className="container mt-4">
            <div className="wakeup-form">
                <h2 className="wakeup-form__title">Good Morning! 🌅</h2>
                <p className="wakeup-form__subtitle">
                    Hope you slept well! Record any dreams before they fade away.
                </p>

                {/* Error display */}
                {error && (
                    <div className="alert alert-danger wakeup-form__error">
                        {error}
                    </div>
                )}

                {/* Dream Journal - High contrast, prominent position */}
                <div className="wakeup-form__dream-section">
                    <label className="wakeup-form__dream-label">
                        Dream Journal
                    </label>
                    <textarea
                        className="wakeup-form__dream-input"
                        rows={4}
                        value={dreamJournal}
                        onChange={(e) => setDreamJournal(e.target.value)}
                        placeholder="Capture your dreams while they're still fresh..."
                        disabled={submitting}
                    />
                    <small className="wakeup-form__dream-hint">
                        Optional - dreams fade quickly, so jot down anything you remember!
                    </small>
                </div>

                {/* Retroactive Wake-Up Time */}
                <div className="wakeup-form__time-section">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="useCustomTime"
                            checked={useCustomWakeUpTime}
                            onChange={(e) => setUseCustomWakeUpTime(e.target.checked)}
                            disabled={submitting}
                        />
                        <label className="form-check-label" htmlFor="useCustomTime">
                            I forgot, I actually woke up at a different time
                        </label>
                    </div>
                    
                    {useCustomWakeUpTime && (
                        <div className="wakeup-form__time-input">
                            <label className="form-label">Actual wake-up time:</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={actualWakeUpTime}
                                onChange={(e) => setActualWakeUpTime(e.target.value)}
                                max={new Date().toISOString().slice(0, 16)} // Can't be in the future
                                min={sleepData ? new Date(sleepData.createdAt).toISOString().slice(0, 16) : ''}
                                disabled={submitting}
                            />
                            <small className="form-text text-muted">
                                Leave unchecked to use current time ({new Date().toLocaleTimeString()})
                            </small>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="wakeup-form__actions">
                    {/* Small "Still Sleepy" button */}
                    <button
                        className="wakeup-form__sleepy-btn"
                        onClick={handleBackToBed}
                        disabled={submitting}
                        type="button"
                    >
                        {submitting ? 'Recording...' : 'Still sleepy, back to bed 😴'}
                    </button>

                    {/* Big Wake Up button for completing session */}
                    <div className="wakeup-form__main-action">
                        <button
                            className="wakeup-form__wake-btn"
                            onClick={handleWakeUp}
                            disabled={submitting}
                            type="button"
                        >
                            <div className="wakeup-form__wake-btn-content">
                                <img 
                                    src={DWLogo} 
                                    alt="DreamWeaver" 
                                    className="wakeup-form__wake-btn-icon"
                                />
                                <span className="wakeup-form__wake-btn-text">
                                    {submitting ? 'Completing...' : "I'm Awake!"}
                                </span>
                            </div>
                        </button>
                        <p className="wakeup-form__main-action-hint">
                            Complete your sleep session and see your stats!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WakeUpForm;
