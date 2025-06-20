import React, { useEffect, useState, useContext } from 'react';
import BedroomForm from './BedroomForm';
import { UserContext } from '../../contexts/UserContext';
import { DashboardContext } from '../../contexts/DashboardContext';
import * as bedroomService from '../../services/bedroomService';
import sleepSessionService from '../../services/sleepSessionService';
import { useNavigate } from 'react-router-dom';
import { hasActiveSleepSession } from '../../utils/sleepStateUtils';

/**
 * GoToBed component allows a user to start a new sleep session.
 * User selects a bedroom, optionally adds a new one, chooses a cuddle buddy, and enters sleepy thoughts.
 */
function GoToBed() {
    // Get user info from context
    const { user } = useContext(UserContext);

    // Get dashboard refresh function from context (optional chaining in case context is not provided)
    const { refreshDashboard, dashboardData } = useContext(DashboardContext) || {};

    // React Router navigation hook
    const navigate = useNavigate();

    // State for list of bedrooms owned by the user
    const [bedrooms, setBedrooms] = useState([]);

    // State for currently selected bedroom ID
    const [selectedBedroomId, setSelectedBedroomId] = useState('');

    // State to toggle display of the add-bedroom form
    const [showBedroomForm, setShowBedroomForm] = useState(false);

    // State for cuddle buddy selection
    const [cuddleBuddy, setCuddleBuddy] = useState('none');

    // State for user's sleepy thoughts input
    const [sleepyThoughts, setSleepyThoughts] = useState('');

    // State to indicate if form is submitting
    const [submitting, setSubmitting] = useState(false);

    // State for error messages
    const [error, setError] = useState('');

    /**
     * Fetch user's bedrooms when the user is loaded or changes.
     * Also check for active sleep sessions and redirect if needed.
     */
    useEffect(() => {
        if (user?._id) {
            loadBedrooms();
        }
        // eslint-disable-next-line
    }, [user]);

    /**
     * Check for active sleep sessions when dashboard data changes.
     */
    useEffect(() => {
        if (dashboardData?.latestSleepData) {
            checkForActiveSleepSession();
        }
    }, [dashboardData, navigate]);

    /**
     * Check if user has an active sleep session and redirect to wake up if so.
     */
    const checkForActiveSleepSession = () => {
        // Use centralized utility for consistent sleep state checking
        if (hasActiveSleepSession(dashboardData)) {
            // Redirect to wake up form if there's an active sleep session
            navigate('/gotobed/wakeup');
        }
    };

    /**
     * Helper function to check if a sleep session should be considered finished
     * based on the wakeUps array and finishedSleeping flag.
     */
    const isSessionActuallyFinished = (sleepData) => {
        if (!sleepData?.wakeUps || !Array.isArray(sleepData.wakeUps) || sleepData.wakeUps.length === 0) {
            return false;
        }
        // Check if the last wake-up event has finishedSleeping: true
        const lastWakeUp = sleepData.wakeUps[sleepData.wakeUps.length - 1];
        return lastWakeUp?.finishedSleeping === true;
    };

    /**
     * Loads bedrooms for the current user from the backend.
     */
    const loadBedrooms = async () => {
        try {
            // Fetch bedrooms using the bedroom service (token handled automatically)
            const res = await bedroomService.getBedrooms();
            setBedrooms(res);
        } catch (err) {
            // Log error and optionally show a message
            console.error('Failed to load bedrooms:', err);
        }
    };

    /**
     * Handler for when a new bedroom is added.
     * Refreshes the list and auto-selects the new bedroom.
     */
    const handleBedroomAdd = (newBedroom) => {
        setShowBedroomForm(false); // Hide the form
        loadBedrooms(); // Refresh the list
        setSelectedBedroomId(newBedroom._id); // Select the new bedroom
    };

    /**
     * Handles form submission to start a new sleep session.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Guard: must have user and selected bedroom
        if (!user || !selectedBedroomId) return;

        // Prepare data to send to backend
        const sleepData = {
            bedroom: selectedBedroomId,
            cuddleBuddy,
            sleepyThoughts,
        };

        try {
            setSubmitting(true); // Show loading spinner
            setError(''); // Clear previous errors

            // Get JWT token for authentication
            // Start sleep session using the service (token handled by interceptor)
            const newSleepSession = await sleepSessionService.startSleepSession(sleepData);

            // Optionally refresh dashboard data
            refreshDashboard?.();

            // Navigate back to dashboard
            navigate('/users/dashboard');
        } catch (err) {
            // Log error for debugging
            console.error('Error starting sleep session:', err);
            
            // Check if this is the "active session" error and our frontend thinks it's finished
            if (err.message?.includes('active sleep session') && 
                dashboardData?.latestSleepData && 
                isSessionActuallyFinished(dashboardData.latestSleepData)) {
                
                // Show a more helpful error message with options for sync issues
                setError(
                    'SYNC_ISSUE: Backend detected an active sleep session, but your last session appears to be finished. ' +
                    'This might be a synchronization issue. Try refreshing the page or go to the Wake Up page ' +
                    'to properly finish your session.'
                );
            } else {
                setError(err.message || 'Could not start sleep session.');
            }
        } finally {
            setSubmitting(false); // Reset submitting state
        }
    };

    return (
        <div className="container mt-4">
            <h2>Go To Bed</h2>

            {/* Show error message if any */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                    {/* Show action buttons if this is a session sync issue */}
                    {(error.includes('synchronization issue') || error.includes('SYNC_ISSUE:')) && (
                        <div className="mt-3">
                            <button 
                                type="button" 
                                className="btn btn-outline-primary btn-sm me-2"
                                onClick={() => {
                                    refreshDashboard?.();
                                    setError('');
                                }}
                            >
                                Refresh Data
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => navigate('/gotobed/wakeup')}
                            >
                                Go to Wake Up Page
                            </button>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Bedroom Selection Section */}
                <div className="mb-3">
                    <label className="form-label">Choose Bedroom</label>
                    <div className="d-flex gap-2 align-items-center">
                        {/* Dropdown for bedrooms */}
                        <select
                            className="form-select"
                            value={selectedBedroomId}
                            onChange={(e) => setSelectedBedroomId(e.target.value)}
                            required
                        >
                            <option value="">-- Select Bedroom --</option>
                            {bedrooms.map((b) => (
                                <option key={b._id} value={b._id}>
                                    {b.bedroomName}
                                </option>
                            ))}
                        </select>

                        {/* Button to toggle add-bedroom form */}
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setShowBedroomForm((prev) => !prev)}
                        >
                            {showBedroomForm ? 'Cancel' : 'Add Bedroom'}
                        </button>
                    </div>
                </div>

                {/* Embedded Bedroom Form (shown when toggled) */}
                {showBedroomForm && (
                    <BedroomForm
                        onSuccess={handleBedroomAdd}
                        onCancel={() => setShowBedroomForm(false)}
                    />
                )}

                {/* Cuddle Buddy Selection */}
                <div className="mb-3">
                    <label className="form-label">Cuddle Buddy</label>
                    <select
                        className="form-select"
                        value={cuddleBuddy}
                        onChange={(e) => setCuddleBuddy(e.target.value)}
                    >
                        <option value="none">None</option>
                        <option value="pillow">Pillow</option>
                        <option value="stuffed animal">Stuffed Animal</option>
                        <option value="pet">Pet</option>
                        <option value="person">Person</option>
                    </select>
                </div>

                {/* Sleepy Thoughts Textarea */}
                <div className="mb-3">
                    <label className="form-label">Sleepy Thoughts</label>
                    <textarea
                        className="form-control"
                        rows="3"
                        value={sleepyThoughts}
                        onChange={(e) => setSleepyThoughts(e.target.value)}
                        placeholder="What's on your mind?"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!selectedBedroomId || submitting}
                >
                    {submitting ? (
                        <>
                            {/* Spinner while submitting */}
                            <span className="spinner-border spinner-border-sm me-2" />
                            Snoozing...
                        </>
                    ) : (
                        'Start Sleep Session'
                    )}
                </button>
            </form>
        </div>
    );
}

export default GoToBed;
