import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { DashboardContext } from '../context/DashboardContext';
import { useNavigate } from 'react-router-dom';

// Get the API base URL from environment variables
const API_BASE = import.meta.env.VITE_BACK_END_SERVER_URL;

function WakeUp() {
    // Get the current user from context
    const { user } = useContext(UserContext);

    // Get the dashboard refresh function from context (if available)
    const { refreshDashboard } = useContext(DashboardContext) || {};

    // For navigation after form submission
    const navigate = useNavigate();

    // State to hold the current sleep session data
    const [sleepData, setSleepData] = useState(null);

    // State for the dream journal input
    const [dreamJournal, setDreamJournal] = useState('');

    // State for the sleep quality slider (default 3)
    const [sleepQuality, setSleepQuality] = useState(3);

    // State to indicate if the form is submitting
    const [submitting, setSubmitting] = useState(false);

    // State for error messages
    const [error, setError] = useState('');

    // Fetch the most recent unfinished sleep session when the user changes
    useEffect(() => {
        const fetchCurrentSleepData = async () => {
            try {
                // Get the auth token from local storage
                const token = localStorage.getItem('token');

                // Request the current sleep session from the backend
                const res = await axios.get(`${API_BASE}/gotobed/current`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Save the sleep session data to state
                setSleepData(res.data);
            } catch (err) {
                // If no session is found or there's an error, show a message
                console.error('No active sleep session found:', err);
                setError('No current sleep session available.');
            }
        };

        // Only fetch if the user is logged in
        if (user?._id) fetchCurrentSleepData();
    }, [user]);

    // Handle form submission
    // finalWakeUp: true if the user is staying awake, false if going back to bed
    const handleSubmit = async (finalWakeUp = false) => {
        // Don't submit if there's no sleep session loaded
        if (!sleepData) return;

        try {
            setSubmitting(true); // Show loading state
            setError(''); // Clear previous errors

            // Get the auth token
            const token = localStorage.getItem('token');

            // Send the wakeup data to the backend
            await axios.post(
                `${API_BASE}/gotobed/wakeup`,
                {
                    sleepDataId: sleepData._id, // ID of the sleep session
                    dreamJournal,               // User's dream notes
                    sleepQuality,               // User's sleep quality rating
                    finalWakeUp,                // Whether the user is staying awake
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Refresh the dashboard if possible
            if (refreshDashboard) refreshDashboard();

            // Navigate to the dashboard page
            navigate('/dashboard');
        } catch (err) {
            // Show an error if the request fails
            console.error('Failed to update sleep session:', err);
            setError('Something went wrong while waking up.');
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

export default WakeUp;
