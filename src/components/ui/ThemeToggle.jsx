import { useContext } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { UserContext } from '../../contexts/UserContext';
import { updateProfile } from '../../services/userService';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeToggle component provides a visual toggle switch for light/dark theme.
 * 
 * Features:
 * - Visual toggle with sun/moon icons
 * - Syncs theme changes with both ThemeContext and user profile in backend
 * - Graceful error handling - theme changes locally even if backend sync fails
 * - Accessible with proper labels and keyboard support
 * - Shows active state with visual highlighting of current theme icon
 * 
 * Integration:
 * - Uses ThemeContext for immediate UI updates
 * - Uses UserContext to sync preferences to user profile
 * - Calls backend API to persist theme preference
 * 
 * Error Handling:
 * - If backend sync fails, theme change still applies locally
 * - Errors are logged but don't show user-facing notifications (theme is non-critical)
 */
function ThemeToggle() {
  // Get current theme and toggle function from ThemeContext
  const { theme, toggleTheme } = useTheme();
  
  // Get user context for backend synchronization
  const { user, setUser } = useContext(UserContext);

  // Determine current theme state for visual indicators
  const isDarkTheme = theme === 'dark';
  const isLightTheme = theme === 'light';

  /**
   * Handles theme toggle with both local and backend synchronization.
   * 
   * Process:
   * 1. Toggle theme in ThemeContext (immediate UI update)
   * 2. If user is logged in, sync new theme to backend
   * 3. Update UserContext with new theme preference (only if different)
   * 4. Handle any errors gracefully without disrupting user experience
   */
  const handleThemeToggle = async () => {
    // Toggle theme immediately for responsive UI
    const newThemeValue = toggleTheme();
    
    // If user is authenticated, persist theme change to backend
    if (user) {
      try {
        // Update user profile with new theme preference
        const updatedUserProfile = await updateProfile({
          ...user,
          theme: newThemeValue
        });
        
        // Only update UserContext if the theme actually changed
        // This prevents unnecessary re-renders and context updates
        if (user.theme !== updatedUserProfile.theme) {
          setUser(updatedUserProfile);
        }
        
      } catch (error) {
        console.error('Failed to sync theme preference to backend:', error);
        // Note: We don't show error notifications for theme changes
        // The theme still works locally even if backend sync fails
      }
    }
  };

  return (
    <label className="theme-toggle-switch">
      {/* Sun icon for light mode - highlighted when light theme is active */}
      <Sun
        className={`theme-toggle-icon sun ${isLightTheme ? 'active' : ''}`}
        size={18}
        aria-hidden="true" // Decorative icon, label provides the context
      />
      
      {/* Checkbox input that controls the toggle state */}
      <input
        type="checkbox"
        className="theme-toggle-input"
        checked={isDarkTheme}
        onChange={handleThemeToggle}
        aria-label="Toggle between light and dark theme"
      />
      
      {/* Visual slider element that moves based on theme */}
      <span className="theme-toggle-slider" />
      
      {/* Moon icon for dark mode - highlighted when dark theme is active */}
      <Moon
        className={`theme-toggle-icon moon ${isDarkTheme ? 'active' : ''}`}
        size={18}
        aria-hidden="true" // Decorative icon, label provides the context
      />
    </label>
  );
}

export default ThemeToggle;
