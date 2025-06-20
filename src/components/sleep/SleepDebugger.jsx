import React, { useContext } from 'react';
import { DashboardContext } from '../../contexts/DashboardContext';
import { hasActiveSleepSession } from '../../utils/sleep/sleepStateUtils';

/**
 * Debug component to help diagnose sleep session state issues
 * Temporary component for debugging - should be removed after issue is resolved
 */
function SleepDebugger() {
  const { dashboardData, refreshDashboard } = useContext(DashboardContext);

  const handleRefresh = () => {
    if (refreshDashboard) {
      refreshDashboard();
    }
  };

  const debugData = {
    hasLatestSleepData: !!dashboardData?.latestSleepData,
    latestSleepDataId: dashboardData?.latestSleepData?._id,
    wakeUps: dashboardData?.latestSleepData?.wakeUps,
    wakeUpsLength: dashboardData?.latestSleepData?.wakeUps?.length,
    isArray: Array.isArray(dashboardData?.latestSleepData?.wakeUps),
    hasActiveSleep: hasActiveSleepSession(dashboardData),
    createdAt: dashboardData?.latestSleepData?.createdAt
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h6>🐛 Sleep Debug Info</h6>
      <button 
        onClick={handleRefresh}
        style={{ 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          padding: '5px 10px', 
          borderRadius: '3px',
          marginBottom: '10px'
        }}
      >
        Refresh Dashboard
      </button>
      <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </div>
  );
}

export default SleepDebugger;
