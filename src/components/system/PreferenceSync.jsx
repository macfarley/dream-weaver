import { usePreferenceSync } from '../../hooks/usePreferenceSync';

/**
 * PreferenceSync component handles synchronization between user preferences
 * stored in UserContext and the ThemeContext. This component doesn't render
 * anything visible but ensures preferences are synced properly.
 */
function PreferenceSync() {
  // This hook handles all the preference synchronization logic
  usePreferenceSync();
  
  // Return null since this component doesn't render anything
  return null;
}

export default PreferenceSync;
