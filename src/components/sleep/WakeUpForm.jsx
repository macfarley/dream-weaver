import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { DashboardContext } from '../../contexts/DashboardContext';
import sleepSessionService from '../../services/sleepSessionService';
import { useNavigate } from 'react-router-dom';
import { hasActiveSleepSession, getActiveSleepSession } from '../../utils/sleep/sleepStateUtils';

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

    // State for the sleep quality slider (default 3)
    const [sleepQuality, setSleepQuality] = useState(3);

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
                
                // Check if this is a long sleep session (over 12 hours)
                const sleepStart = new Date(sleepSession.createdAt);
                const now = new Date();
                const hoursAsleep = (now - sleepStart) / (1000 * 60 * 60);
                
                // For long sessions, suggest but don't force retroactive time setting
                if (hoursAsleep > 12) {
                    // Set a default time to 8 hours after sleep start as a suggestion
                    const defaultWakeTime = new Date(sleepStart.getTime() + (8 * 60 * 60 * 1000));
                    setActualWakeUpTime(defaultWakeTime.toISOString().slice(0, 16)); // Format for datetime-local input
                    // Don't automatically enable custom time - let user choose
                }
            } else {
                setError('No active sleep session found. Please start a new sleep session first.');
            }
        } else {
            setError('No sleep session data available. Please start a new sleep session first.');
        }
    }, [dashboardData]);

    // Handle form submission
    // finalWakeUp: true if the user is staying awake, false if going back to bed
    const handleSubmit = async (finalWakeUp = false) => {
        // Don't submit if there's no sleep session loaded
        if (!sleepData) return;

        try {
            setSubmitting(true); // Show loading state
            setError(''); // Clear previous errors

            // Prepare wakeup data according to backend expectations
            const wakeupData = {
                sleepQuality,
                dreamJournal,
                awakenAt: useCustomWakeUpTime && actualWakeUpTime 
                    ? new Date(actualWakeUpTime)  // Use custom time if provided
                    : new Date(),                 // Default to now for quick wake-ups
                finishedSleeping: finalWakeUp, // Whether user is staying awake
                backToBedAt: finalWakeUp ? null : new Date(), // If going back to bed, set time
            };

            // Send the wakeup data to the backend using the service (token handled by interceptor)
            await sleepSessionService.addWakeupEvent(wakeupData);

            // Refresh the dashboard if possible
            if (refreshDashboard) refreshDashboard();

            // Navigate to the dashboard page
            navigate('/users/dashboard');
        } catch (err) {
            // Show an error if the request fails
            console.error('Failed to update sleep session:', err);
            setError(err.message || 'Something went wrong while waking up.');
        } finally {
            setSubmitting(false); // Reset loading state
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
            <h2>Wake Up</h2>
            <p className="text-muted">
                Record how you slept and any dreams you remember.
            </p>

            {/* Quick Wake-Up Option */}
            <div className="mb-4 p-3 bg-light rounded">
                <h5>Quick Wake-Up</h5>
                <p className="mb-2">Just waking up and want to skip the details?</p>
                <button
                    className="btn btn-primary"
                    disabled={submitting}
                    onClick={() => handleSubmit(true)}
                >
                    {submitting ? 'Submitting...' : "I'm awake! (Skip details)"}
                </button>
            </div>

            <hr />
            <h5>Or add details about your sleep...</h5>

            {/* Show hint for long sleep sessions */}
            {(() => {
                const sleepStart = new Date(sleepData.createdAt);
                const now = new Date();
                const hoursAsleep = (now - sleepStart) / (1000 * 60 * 60);
                
                if (hoursAsleep > 12) {
                    return (
                        <div className="alert alert-info">
                            <strong>Long sleep session detected!</strong> You've been asleep for {Math.round(hoursAsleep)} hours. 
                            If you actually woke up earlier but forgot to log it, you can set your actual wake-up time below.
                        </div>
                    );
                }
                return null;
            })()}

            {/* Retroactive Wake-Up Time (Optional) */}
            <div className="mb-3">
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="useCustomTime"
                        checked={useCustomWakeUpTime}
                        onChange={(e) => setUseCustomWakeUpTime(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="useCustomTime">
                        I actually woke up at a different time
                    </label>
                </div>
                
                {useCustomWakeUpTime && (
                    <div className="mt-2">
                        <label className="form-label">Actual wake-up time:</label>
                        <input
                            type="datetime-local"
                            className="form-control"
                            value={actualWakeUpTime}
                            onChange={(e) => setActualWakeUpTime(e.target.value)}
                            max={new Date().toISOString().slice(0, 16)} // Can't be in the future
                            min={sleepData ? new Date(sleepData.createdAt).toISOString().slice(0, 16) : ''}
                        />
                        <small className="form-text text-muted">
                            Leave unchecked to use current time ({new Date().toLocaleTimeString()})
                        </small>
                    </div>
                )}
            </div>

            {/* Dream Journal Input */}
            <div className="mb-3">
                <label className="form-label">Dream Journal</label>
                <textarea
                    className="form-control"
                    rows={4}
                    value={dreamJournal}
                    onChange={(e) => setDreamJournal(e.target.value)}
                    placeholder="Describe your dreams here..."
                />
            </div>

            {/* Sleep Quality Slider */}
            <div className="mb-3">
                <label className="form-label">Sleep Quality (1–5)</label>
                <input
                    type="range"
                    min={1}
                    max={5}
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(Number(e.target.value))}
                    className="form-range"
                />
                <div>Rating: {sleepQuality}</div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-3">
                {/* Button for staying awake */}
                <button
                    className="btn btn-success"
                    disabled={submitting}
                    onClick={() => handleSubmit(true)}
                >
                    {submitting ? 'Submitting...' : "I'm staying awake"}
                </button>

                {/* Button for going back to bed */}
                <button
                    className="btn btn-secondary"
                    disabled={submitting}
                    onClick={() => handleSubmit(false)}
                >
                    {submitting ? 'Submitting...' : 'Too sleepy, back to bed'}
                </button>
            </div>
        </div>
    );
}

export default WakeUpForm;
