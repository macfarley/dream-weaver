/**
 * Sleep Session Reminder Utilities
 * 
 * Simple browser-based reminders for forgotten sleep sessions.
 * Uses localStorage and periodic checks - no PWA required.
 */

/**
 * Sets a reminder for an active sleep session
 * @param {string} sessionId - The sleep session ID
 * @param {Date} startTime - When the sleep session started
 */
export function setSleepReminder(sessionId, startTime) {
  const reminder = {
    sessionId,
    startTime: startTime.toISOString(),
    setAt: new Date().toISOString(),
    dismissed: false
  };
  
  localStorage.setItem('dreamweaver_sleep_reminder', JSON.stringify(reminder));
}

/**
 * Checks if there's an overdue sleep session (12+ hours)
 * @returns {Object|null} Reminder data if overdue, null otherwise
 */
export function checkOverdueSleepSession() {
  try {
    const reminderData = localStorage.getItem('dreamweaver_sleep_reminder');
    if (!reminderData) return null;
    
    const reminder = JSON.parse(reminderData);
    if (reminder.dismissed) return null;
    
    const startTime = new Date(reminder.startTime);
    const now = new Date();
    const hoursElapsed = (now - startTime) / (1000 * 60 * 60);
    
    // Consider session overdue after 12 hours
    if (hoursElapsed >= 12) {
      return {
        ...reminder,
        hoursElapsed: Math.round(hoursElapsed),
        startTime: startTime
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Error checking sleep reminder:', error);
    return null;
  }
}

/**
 * Dismisses the current sleep reminder
 */
export function dismissSleepReminder() {
  try {
    const reminderData = localStorage.getItem('dreamweaver_sleep_reminder');
    if (reminderData) {
      const reminder = JSON.parse(reminderData);
      reminder.dismissed = true;
      localStorage.setItem('dreamweaver_sleep_reminder', JSON.stringify(reminder));
    }
  } catch (error) {
    console.warn('Error dismissing sleep reminder:', error);
  }
}

/**
 * Clears all sleep reminders (call when sleep session ends)
 */
export function clearSleepReminder() {
  localStorage.removeItem('dreamweaver_sleep_reminder');
}

/**
 * Creates a bookmarkable URL for quick wake-up
 * @returns {string} URL that can be bookmarked
 */
export function getQuickWakeUpUrl() {
  const baseUrl = window.location.origin;
  return `${baseUrl}/gotobed/wakeup?quick=true`;
}

/**
 * Shows a browser notification if permissions allow
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} url - URL to open when clicked
 */
export function showBrowserNotification(title, body, url = null) {
  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.log('Browser notifications not supported');
    return false;
  }
  
  // If permission is granted, show notification
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'dreamweaver-sleep-reminder',
      requireInteraction: true
    });
    
    if (url) {
      notification.onclick = () => {
        window.focus();
        window.location.href = url;
        notification.close();
      };
    }
    
    return true;
  }
  
  // If permission not determined, request it
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        return showBrowserNotification(title, body, url);
      }
    });
  }
  
  return false;
}

/**
 * Starts periodic checking for overdue sleep sessions
 * Call this on app startup
 */
export function startSleepReminderCheck() {
  // Check every 30 minutes
  const checkInterval = 30 * 60 * 1000;
  
  const checkForOverdue = () => {
    const overdue = checkOverdueSleepSession();
    if (overdue) {
      const wakeUpUrl = getQuickWakeUpUrl();
      const notificationShown = showBrowserNotification(
        'DreamWeaver Sleep Reminder',
        `You've been asleep for ${overdue.hoursElapsed} hours. Time to wake up?`,
        wakeUpUrl
      );
      
      // If notification failed, could show an in-app banner instead
      if (!notificationShown) {
        console.log('Sleep reminder: User has been asleep for', overdue.hoursElapsed, 'hours');
      }
    }
  };
  
  // Check immediately
  checkForOverdue();
  
  // Then check periodically
  const intervalId = setInterval(checkForOverdue, checkInterval);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}
