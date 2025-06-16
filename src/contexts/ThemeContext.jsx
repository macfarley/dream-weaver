import React, { createContext, useContext, useEffect, useState } from 'react';

// Create the ThemeContext to hold theme state and toggler
const ThemeContext = createContext();

/**
 * Retrieves the initial theme value.
 * - Checks localStorage for a saved theme.
 * - Defaults to 'light' if none is found or window is undefined.
 */
function getInitialTheme() {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  }
  return 'light';
}

/**
 * ThemeProvider wraps your app and provides theme context.
 * - Manages theme state.
 * - Persists theme to localStorage.
 * - Updates document body attribute for CSS theming.
 */
function ThemeProvider({ children }) {
  // State to hold the current theme, initialized from localStorage or default
  const [theme, setTheme] = useState(getInitialTheme);

  /**
   * Toggles between 'light' and 'dark' themes.
   * - Updates state.
   * - Persists new theme to localStorage.
   */
  function toggleTheme() {
    setTheme(prevTheme => {
      const nextTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', nextTheme);
      return nextTheme;
    });
  }

  /**
   * Side effect: Update the document body attribute
   * whenever the theme changes, for CSS selectors.
   */
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Provide the theme and toggle function to children
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
