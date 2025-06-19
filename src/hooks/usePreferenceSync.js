import { useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Custom hook to sync user preferences between UserContext and ThemeContext.
 * This ensures that theme changes are reflected in both contexts and that
 * user preferences are loaded properly on login.
 */
export function usePreferenceSync() {
  const { user } = useContext(UserContext);
  const { setThemeFromPreferences } = useTheme();

  // Sync theme when user data changes (e.g., on login or profile update)
  useEffect(() => {
    if (user && user.theme) {
      setThemeFromPreferences(user.theme);
    }
  }, [user, setThemeFromPreferences]);

  return {
    // Return user preferences for easy access
    theme: user?.theme || 'dark',
    prefersImperial: user?.prefersImperial ?? true,
    dateFormat: user?.dateFormat || 'MM/DD/YYYY',
    timeFormat: user?.timeFormat || '12-hour',
    preferredTimezone: user?.preferredTimezone || '',
  };
}
