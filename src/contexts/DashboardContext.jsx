import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import * as userService from '../services/userService';
import * as bedroomService from '../services/bedroomService';
import * as sleepDataService from '../services/sleepDataService';

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
            // Fetch everything in parallel
            const [profile, bedrooms, sleepEntries] = await Promise.all([
                userService.getUserById(user._id),
                bedroomService.getBedroomsByUser(user._id),
                sleepDataService.getSleepDataByUser(user._id),
            ]);

            const sortedSleep = sleepEntries?.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            ) || [];

            const latestSleepData = sortedSleep[0] || null;

            let latestDreamLog = null;
            if (latestSleepData?.wakeUps?.length) {
                const wakeWithDream = [...latestSleepData.wakeUps]
                    .reverse()
                    .find((w) => w.dreamJournal);
                latestDreamLog = wakeWithDream?.dreamJournal || null;
            }

            setDashboardData({
                profile,
                bedrooms: bedrooms || [],
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
