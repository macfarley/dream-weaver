import { useContext } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { UserContext } from '../../contexts/UserContext';
import { updateProfile } from '../../services/userService';
import { Sun, Moon } from 'lucide-react';

// Helper to decode JWT (minimal, for extracting _id)
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * ThemeToggle component provides a visual toggle switch for light/dark theme.
 */
function ThemeToggle() {
  // Get current theme and toggle function from ThemeContext
  const { theme, toggleTheme } = useTheme();
  // Get user context for backend synchronization
  const { setUser, preferences, user } = useContext(UserContext);

  // Determine current theme state for visual indicators
  const isDarkTheme = theme === 'dark';
  const isLightTheme = theme === 'light';

  /**
   * Handles theme toggle with both local and backend synchronization.
   */
  const handleThemeToggle = async () => {
    // Toggle theme immediately for responsive UI
    const newThemeValue = toggleTheme();
    // If user is authenticated, persist theme change to backend
    if (preferences && user) {
      try {
        const response = await updateProfile({
          ...preferences,
          theme: newThemeValue
        });
        // console.debug('[ThemeToggle] updateProfile response:', response);
        // If response has a token, decode it for _id and update user context
        if (response && response.token) {
          const decoded = decodeJwt(response.token);
          if (decoded && decoded._id) {
            setUser({ ...user, _id: decoded._id, userPreferences: { ...user.userPreferences, theme: newThemeValue } });
            // console.debug('[ThemeToggle] Updated user context from token:', decoded);
          } else {
            setUser({ ...user, userPreferences: { ...user.userPreferences, theme: newThemeValue } });
            // console.warn('[ThemeToggle] Token present but could not decode _id:', response.token);
          }
        } else if (response && response._id) {
          setUser({ ...user, userPreferences: { ...user.userPreferences, theme: newThemeValue } });
          // console.debug('[ThemeToggle] Updated user context with new theme:', newThemeValue);
        } else {
          setUser({ ...user, userPreferences: { ...user.userPreferences, theme: newThemeValue } });
          // console.warn('[ThemeToggle] updateProfile response missing _id and token:', response);
        }
      } catch {
        // console.error('Failed to sync theme preference to backend:', error);
        // The theme still works locally even if backend sync fails
      }
    }
  };

  return (
    <label className="theme-toggle-switch">
      <Sun
        className={`theme-toggle-icon sun ${isLightTheme ? 'active' : ''}`}
        size={18}
        aria-hidden="true"
      />
      <input
        type="checkbox"
        className="theme-toggle-input"
        checked={isDarkTheme}
        onChange={handleThemeToggle}
        aria-label="Toggle between light and dark theme"
      />
      <span className="theme-toggle-slider" />
      <Moon
        className={`theme-toggle-icon moon ${isDarkTheme ? 'active' : ''}`}
        size={18}
        aria-hidden="true"
      />
    </label>
  );
}

export default ThemeToggle;
