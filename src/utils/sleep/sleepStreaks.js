/**
 * Sleep Streak Utilities
 * 
 * Functions to calculate sleep streaks for user engagement features.
 */

/**
 * Determines if a date represents a consecutive day for sleep tracking.
 * Sessions that start before 4am are considered part of the previous day.
 * @param {string} dateStr - ISO date string of sleep session start
 * @returns {Date} - The sleep "day" this session represents
 */
function getSleepDay(dateStr) {
  const date = new Date(dateStr);
  const hour = date.getHours();
  
  // If session started before 4am, it's part of the previous day
  if (hour < 4) {
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    return new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate());
  }
  
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Calculates sleep streak statistics from an array of sleep sessions.
 * @param {Array} sleepSessions - Array of sleep session objects with createdAt dates
 * @returns {Object} - {currentStreak, longestStreak, totalSessions}
 */
export function calculateSleepStreaks(sleepSessions) {
  if (!sleepSessions || sleepSessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0
    };
  }

  // Filter out incomplete sessions (those without wake-ups) for streak calculation
  const completedSessions = sleepSessions.filter(session => 
    session.wakeUps && session.wakeUps.length > 0
  );

  const totalSessions = completedSessions.length;

  if (totalSessions === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0
    };
  }

  // Convert sessions to unique sleep days, sorted by date (newest first)
  const sleepDayTimes = [...new Set(
    completedSessions.map(session => getSleepDay(session.createdAt).getTime())
  )].sort((a, b) => b - a); // Sort descending (newest first)

  // Calculate current streak (consecutive days from most recent backward)
  let currentStreak = 0;
  
  if (sleepDayTimes.length > 0) {
    // Start with the most recent sleep day
    const mostRecentDay = sleepDayTimes[0];
    const today = new Date();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const yesterdayTime = todayTime - (24 * 60 * 60 * 1000);
    
    // Check if the most recent session was today or yesterday
    if (mostRecentDay === todayTime || mostRecentDay === yesterdayTime) {
      currentStreak = 1; // Start the streak
      
      // Count consecutive days backward from the most recent
      for (let i = 1; i < sleepDayTimes.length; i++) {
        const currentDay = sleepDayTimes[i];
        const expectedDay = mostRecentDay - (i * 24 * 60 * 60 * 1000);
        
        if (currentDay === expectedDay) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }
    }
  }

  // Calculate longest streak by checking all consecutive sequences
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sleepDayTimes.length; i++) {
    const currentDay = sleepDayTimes[i];
    const previousDay = sleepDayTimes[i - 1];
    const expectedDifference = 24 * 60 * 60 * 1000; // One day in milliseconds

    if (previousDay - currentDay === expectedDifference) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    totalSessions
  };
}

/**
 * Formats streak information for display
 * @param {Object} streakStats - Result from calculateSleepStreaks
 * @returns {Object} - Formatted display strings
 */
export function formatStreakDisplay(streakStats) {
  const { currentStreak, longestStreak, totalSessions } = streakStats;
  
  return {
    currentStreakText: currentStreak === 0 
      ? "No current streak" 
      : `${currentStreak} day${currentStreak === 1 ? '' : 's'}`,
    longestStreakText: longestStreak === 0 
      ? "No streaks yet" 
      : `${longestStreak} day${longestStreak === 1 ? '' : 's'}`,
    totalSessionsText: `${totalSessions} session${totalSessions === 1 ? '' : 's'}`,
    motivationalMessage: getMotivationalMessage(currentStreak, longestStreak)
  };
}

/**
 * Returns a motivational message based on streak performance
 * @param {number} currentStreak - Current consecutive days
 * @param {number} longestStreak - Longest streak achieved
 * @returns {string} - Motivational message
 */
function getMotivationalMessage(currentStreak, longestStreak) {
  if (currentStreak === 0) {
    return "Start a new streak today! 🌟";
  } else if (currentStreak === 1) {
    return "Great start! Keep it going! 💪";
  } else if (currentStreak >= longestStreak && currentStreak >= 7) {
    return "New personal record! You're on fire! 🔥";
  } else if (currentStreak >= 7) {
    return "Amazing consistency! 🏆";
  } else if (currentStreak >= 3) {
    return "Building momentum! 🚀";
  } else {
    return "Keep up the good work! ⭐";
  }
}
