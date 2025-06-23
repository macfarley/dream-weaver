import { createContext, useContext, useEffect, useState } from 'react';

// Create the ThemeContext to hold theme state and functions
const ThemeContext = createContext();

/**
 * Retrieves the initial theme value.
 * - Checks localStorage for a saved theme.
 * - Defaults to 'dark' if none is found or window is undefined.
 */
function getInitialTheme() {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  }
  return 'dark'; // Default to dark theme for DreamWeaver
}

/**
 * ThemeProvider wraps your app and provides theme context.
 * - Manages theme state.
 * - Persists theme to localStorage.
 * - Updates document body attribute for CSS theming.
 * - Syncs with user preferences when available.
 */
function ThemeProvider({ children }) {
  // State to hold the current theme, initialized from localStorage or default
  const [theme, setTheme] = useState(getInitialTheme);

  /**
   * Updates the theme and persists it to localStorage.
   * This is used internally and by the sync functions.
   */
  const updateTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  /**
   * Toggles between 'light' and 'dark' themes.
   * - Updates state.
   * - Persists new theme to localStorage.
   * - Returns the new theme for potential backend sync.
   */
  function toggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(nextTheme);
    return nextTheme;
  }

  /**
   * Sets theme from user preferences (e.g., when loading user profile).
   * This allows external components to sync the theme without triggering toggle.
   */
  function setThemeFromPreferences(userTheme) {
    if (userTheme && (userTheme === 'light' || userTheme === 'dark')) {
      updateTheme(userTheme);
    }
  }

  /**
   * Side effect: Update the document body attribute
   * whenever the theme changes, for CSS selectors.
   */
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    // Only log theme changes for debugging if needed
    // console.info(`[ThemeContext] Theme set to: ${theme}`);
  }, [theme]);

  // Provide the theme and functions to children
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setThemeFromPreferences,
      updateTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access the ThemeContext.
 * - Returns the current theme and toggleTheme function.
 */
function useTheme() {
  return useContext(ThemeContext);
}

// Export ThemeProvider and useTheme at the bottom for clarity
export { ThemeProvider, useTheme };
