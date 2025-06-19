import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import { getToken } from '../services/authService';
import * as userService from '../services/userService';
import * as bedroomService from '../services/bedroomService';
import sleepDataService from '../services/sleepDataService';

// Create context
const DashboardContext = createContext();

const DashboardProvider = ({ children }) => {
    const { user } = useContext(UserContext);

    const [dashboardData, setDashboardData] = useState({
        profile: null,
        bedrooms: [],
        latestSleepData: null,
        latestDreamLog: null,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        if (!user || !user._id) return;

        setLoading(true);
        setError(null);

        try {
            // Get token for API calls
            const token = getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Fetch data in parallel (using user data from context for profile)
            const [bedrooms, sleepEntries] = await Promise.allSettled([
                bedroomService.getBedrooms(token),
                sleepDataService.getSleepDataByUser(token),
            ]);

            // Handle bedrooms result
            let bedroomsData = [];
            if (bedrooms.status === 'fulfilled') {
                bedroomsData = bedrooms.value || [];
            } else {
                console.warn('Failed to load bedrooms:', bedrooms.reason?.message);
            }

            // Handle sleep data result
            let sleepEntriesResult = [];
            if (sleepEntries.status === 'fulfilled') {
                sleepEntriesResult = sleepEntries.value || [];
            } else {
                console.warn('Failed to load sleep data:', sleepEntries.reason?.message);
            }
            
            // Log the actual sleep data response for debugging
            console.log('Sleep data response:', sleepEntriesResult);
            console.log('Type of sleep data response:', typeof sleepEntriesResult);
            console.log('Is Array:', Array.isArray(sleepEntriesResult));

            // Ensure we have an array for sorting (handle different response formats)
            let sleepArray = [];
            
            if (Array.isArray(sleepEntriesResult)) {
                // Direct array response
                sleepArray = sleepEntriesResult;
            } else if (sleepEntriesResult && typeof sleepEntriesResult === 'object') {
                // Object response - check for different properties
                if (Array.isArray(sleepEntriesResult.data)) {
                    sleepArray = sleepEntriesResult.data;
                } else if (Array.isArray(sleepEntriesResult.sleepSessions)) {
                    sleepArray = sleepEntriesResult.sleepSessions;
                } else {
                    console.warn('Expected array in response data property, got:', sleepEntriesResult);
                    sleepArray = [];
                }
            } else {
                console.warn('Expected array or object with array property, got:', typeof sleepEntriesResult, sleepEntriesResult);
                sleepArray = [];
            }

            // Safety check before sorting
            if (!Array.isArray(sleepArray)) {
                console.error('sleepArray is not an array after processing:', sleepArray);
                sleepArray = [];
            }

            const sortedSleep = sleepArray.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            const latestSleepData = sortedSleep[0] || null;

            let latestDreamLog = null;
            if (latestSleepData?.wakeUps?.length) {
                const wakeWithDream = [...latestSleepData.wakeUps]
                    .reverse()
                    .find((w) => w.dreamJournal);
                latestDreamLog = wakeWithDream?.dreamJournal || null;
            }

            setDashboardData({
                profile: user, // Use user data from context
                bedrooms: bedroomsData || [],
                latestSleepData,
                latestDreamLog,
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Unable to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    // Add these functions:
    const updateSleepData = (updatedSleep) => {
        setDashboardData((prev) => {
            // If latestSleepData matches, update it
            let latestSleepData = prev.latestSleepData;
            if (latestSleepData && latestSleepData._id === updatedSleep._id) {
                latestSleepData = updatedSleep;
            }
            // Optionally, update other sleep data arrays if you store them
            // Recalculate latestDreamLog if needed
            let latestDreamLog = prev.latestDreamLog;
            if (latestSleepData?.wakeUps?.length) {
                const wakeWithDream = [...latestSleepData.wakeUps]
                    .reverse()
                    .find((w) => w.dreamJournal);
                latestDreamLog = wakeWithDream?.dreamJournal || null;
            }
            return {
                ...prev,
                latestSleepData,
                latestDreamLog,
            };
        });
    };

    const removeSleepData = (sleepId) => {
        setDashboardData((prev) => {
            let latestSleepData = prev.latestSleepData;
            if (latestSleepData && latestSleepData._id === sleepId) {
                latestSleepData = null;
            }
            // Recalculate latestDreamLog if needed
            return {
                ...prev,
                latestSleepData,
                latestDreamLog: null,
            };
        });
    };

useEffect(() => {
  if (user && user._id) {
    fetchDashboardData();
  } else {
    setLoading(false); // Prevents infinite spinner if no user
  }
}, [user]);

    return (
        <DashboardContext.Provider
            value={{
                dashboardData,
                loading,
                error,
                refreshDashboard: fetchDashboardData,
                updateSleepData,
                removeSleepData,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export { DashboardContext, DashboardProvider };
