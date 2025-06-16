import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import '../../styles/componentStyles/_themeToggle.scss';

// ThemeToggle component allows users to switch between light and dark themes
function ThemeToggle() {
  // Get current theme and toggle function from context
  const { theme, toggleTheme } = useTheme();

  // Determine if the current theme is dark
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  return (
    <label className="theme-toggle-switch">
      {/* Sun icon for light mode */}
      <Sun
        className={`theme-toggle-icon sun ${isLight ? 'active' : ''}`}
        size={18}
      />
      {/* Checkbox input to toggle theme */}
      <input
        type="checkbox"
        className="theme-toggle-input"
        checked={isDark}
        onChange={toggleTheme}
        aria-label="Toggle light/dark theme"
      />
      {/* Slider visual for toggle */}
      <span className="theme-toggle-slider" />
      {/* Moon icon for dark mode */}
      <Moon
        className={`theme-toggle-icon moon ${isDark ? 'active' : ''}`}
        size={18}
      />
    </label>
  );
}

export default ThemeToggle;
