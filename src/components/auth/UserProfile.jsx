import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { updateProfile } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../ui/Loading';
import { User, Mail, Clock, Thermometer, Calendar, Bell, Palette } from 'lucide-react';
import { clearAllAuthTokens } from '../../utils/clearAllAuthTokens';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';

/**
 * UserProfile component allows users to view and update their own profile information.
 * This component is for regular users only. Admins do not use this component to manage other users.
 */
function UserProfile() {
  // Access user and refreshUserProfile from context
  const { user, refreshUserProfile, setUser } = useContext(UserContext);
  const { setThemeFromPreferences, theme, updateTheme } = useTheme();
  const navigate = useNavigate();

  // State for the profile being viewed/edited
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Local state for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    prefersImperial: true,
    theme: 'dark',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    sleepReminderEnabled: true,
    sleepReminderHours: 12,
    dateOfBirth: '',
  });

  // Debug: Log profileUser before rendering
  useEffect(() => {
    if (profileUser) {
      // console.log('UserProfile: profileUser state:', profileUser);
    }
  }, [profileUser]);

  // Helper to normalize user object from backend
  function normalizeUser(raw) {
    let userObj = raw;
    if (raw && raw.data) userObj = raw.data;
    const prefs = userObj.userPreferences || {};
    return {
      ...userObj,
      prefersImperial: prefs.useMetric === undefined ? true : !prefs.useMetric,
      dateFormat: prefs.dateFormat || 'MM/DD/YYYY',
      timeFormat: prefs.timeFormat || '12-hour',
      theme: prefs.theme || 'dark',
      firstName: userObj.firstName || userObj.first_name || '',
      lastName: userObj.lastName || userObj.last_name || '',
      dateOfBirth: userObj.dateOfBirth || userObj.date_of_birth || '',
      email: userObj.email || '',
      role: userObj.role || '',
      username: userObj.username || '',
    };
  }

  // Loading state
  useEffect(() => {
    setLoading(true);
    if (user) {
      setProfileUser(normalizeUser(user));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  // Sync theme with user preferences when profileUser changes
  useEffect(() => {
    if (profileUser && profileUser.theme) {
      setThemeFromPreferences(profileUser.theme);
    }
  }, [profileUser, setThemeFromPreferences]);

  // Handler to update theme both in context and user profile
  const handleThemeToggle = async () => {
    // Toggle theme in context
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
    setThemeFromPreferences(newTheme);
    try {
      await updateProfile({ userPreferences: { theme: newTheme } });
      setProfileUser(prev => ({ ...prev, theme: newTheme }));
      setUser(prev => ({ ...prev, theme: newTheme }));
      await refreshUserProfile();
      toast.success(`Theme updated to ${newTheme}`);
    } catch {
      toast.error('Failed to update theme preference.');
    }
  };

  // Render the profile view
  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  if (!profileUser) {
    // If loading is done and no profile, show an error or redirect
    return (
      <div className="alert alert-warning my-5 text-center">
        No profile found. Please log in.
      </div>
    );
  }

  // Restore canEdit and handleChange definitions (needed for UI logic and form handling)
  const canEdit = true;
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Helper: Format month and day from date string
  const getMonthDay = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  };
  // Helper: Check if today is birthday
  const isBirthdayToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const d = new Date(dateStr);
    return today.getMonth() === d.getMonth() && today.getDate() === d.getDate();
  };

  /**
   * Handles form submission for updating profile.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build update payload with nested userPreferences
      const userEditableData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth,
        userPreferences: {
          useMetric: !formData.prefersImperial, // store as useMetric in backend
          theme: formData.theme,
          dateFormat: formData.dateFormat,
          timeFormat: formData.timeFormat,
          sleepReminderEnabled: formData.sleepReminderEnabled,
          sleepReminderHours: formData.sleepReminderHours,
        }
      };
      // Remove empty fields (optional, for PATCH semantics)
      Object.keys(userEditableData).forEach(key => {
        if (userEditableData[key] === '' || userEditableData[key] === undefined) {
          delete userEditableData[key];
        }
      });
      // Remove empty fields from userPreferences
      Object.keys(userEditableData.userPreferences).forEach(key => {
        if (userEditableData.userPreferences[key] === '' || userEditableData.userPreferences[key] === undefined) {
          delete userEditableData.userPreferences[key];
        }
      });
      const response = await updateProfile(userEditableData);
      if (response && response.token) {
        clearAllAuthTokens();
        localStorage.setItem('token', response.token);
        if (response.user) {
          setProfileUser(normalizeUser(response.user));
          setUser(normalizeUser(response.user));
          // Sync theme immediately after update
          setThemeFromPreferences(response.user.userPreferences?.theme || response.user.theme);
        } else {
          setProfileUser(prev => ({ ...prev, ...userEditableData }));
          setUser(prev => ({ ...prev, ...userEditableData }));
          setThemeFromPreferences(userEditableData.userPreferences?.theme || userEditableData.theme);
        }
        await refreshUserProfile();
        toast.success('Profile updated!');
      } else {
        await refreshUserProfile();
        setProfileUser(prev => ({ ...prev, ...userEditableData }));
        setUser(prev => ({ ...prev, ...userEditableData }));
        setThemeFromPreferences(userEditableData.userPreferences?.theme || userEditableData.theme);
        toast.success('Profile updated!');
      }
      setShowEditForm(false);
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the edit form and initializes form data with current values
   */
  const handleEditClick = () => {
    const newFormData = {
      firstName: profileUser.firstName || '',
      lastName: profileUser.lastName || '',
      email: profileUser.email || '',
      prefersImperial: profileUser.prefersImperial ?? true,
      theme: profileUser.theme || 'dark',
      dateFormat: profileUser.dateFormat || 'MM/DD/YYYY',
      timeFormat: profileUser.timeFormat || '12-hour',
      sleepReminderEnabled: profileUser.sleepReminderEnabled ?? true,
      sleepReminderHours: profileUser.sleepReminderHours || 12,
      dateOfBirth: profileUser.dateOfBirth || '',
    };
    setFormData(newFormData);
    setShowEditForm(true);
  };

  /**
   * Closes the edit form
   */
  const handleCancelEdit = () => {
    setShowEditForm(false);
  };

  /**
   * Gets the user's initials for the avatar
   */
  const getUserInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Render the profile view
  return (
    <div className="user-profile">
      <div className="container my-4">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            {/* Profile View */}
            <div className="profile-view">

              {/* Profile Header */}
              <div className="profile-header">
                <div className="profile-avatar">
                  {getUserInitials(profileUser)}
                </div>
                <div className="profile-name">
                  {profileUser.firstName && profileUser.lastName 
                    ? `${profileUser.firstName} ${profileUser.lastName}`
                    : profileUser.username
                  }
                </div>
                <div className="profile-username">@{profileUser.username}</div>
              </div>

              {/* Profile Details */}
              <div className="profile-details">
                
                {/* Personal Information */}
                <div className="detail-section">
                  <div className="section-title">
                    <User className="section-icon" size={20} />
                    Personal Information
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">First Name</div>
                      <div className={`detail-value ${!profileUser.firstName ? 'not-set' : ''}`}>
                        {profileUser.firstName || 'Not set'}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Last Name</div>
                      <div className={`detail-value ${!profileUser.lastName ? 'not-set' : ''}`}>
                        {profileUser.lastName || 'Not set'}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Email Address</div>
                      <div className={`detail-value ${!profileUser.email ? 'not-set' : ''}`}>
                        <Mail className="status-icon" size={16} />
                        {profileUser.email || 'Not set'}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Date of Birth</div>
                      <div className={`detail-value ${!profileUser.dateOfBirth ? 'not-set' : ''}`}>
                        {profileUser.dateOfBirth ? getMonthDay(profileUser.dateOfBirth) : 'Not set'}
                        {profileUser.dateOfBirth && isBirthdayToday(profileUser.dateOfBirth) && (
                          <span className="ms-2 text-success fw-bold">🎉 Happy Birthday!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="detail-section">
                  <div className="section-title">
                    <Palette className="section-icon" size={20} />
                    Preferences
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">Temperature Units</div>
                      <div className="detail-value">
                        <Thermometer className="status-icon" size={16} />
                        {profileUser.prefersImperial ? 'Fahrenheit (°F)' : 'Celsius (°C)'}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Theme</div>
                      <div className="detail-value d-flex align-items-center gap-2">
                        {profileUser.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                        {/* Theme toggle button */}
                        <ThemeToggle onToggle={handleThemeToggle} />
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Date Format</div>
                      <div className="detail-value">
                        <Calendar className="status-icon" size={16} />
                        {profileUser.dateFormat || 'MM/DD/YYYY'}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Time Format</div>
                      <div className="detail-value">
                        <Clock className="status-icon" size={16} />
                        {profileUser.timeFormat === '24-hour' ? '24-hour (13:00)' : '12-hour (1:00 PM)'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="detail-section">
                  <div className="section-title">
                    <Bell className="section-icon" size={20} />
                    Sleep Reminders
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">Status</div>
                      <div className="detail-value">
                        <Bell className="status-icon" size={16} />
                        {profileUser.sleepReminderEnabled ?? true ? '✅ Enabled' : '❌ Disabled'}
                      </div>
                    </div>
                    {(profileUser.sleepReminderEnabled ?? true) && (
                      <div className="detail-item">
                        <div className="detail-label">Reminder Frequency</div>
                        <div className="detail-value">
                          Every {profileUser.sleepReminderHours || 12} hours
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="profile-actions">
                {canEdit && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleEditClick}
                  >
                    <User size={18} className="me-2" />
                    Edit Profile
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            {/* Edit Form Modal */}
            {showEditForm && (
              <div className="profile-edit-overlay" onClick={(e) => e.target.classList.contains('profile-edit-overlay') && setShowEditForm(false)}>
                <div className="edit-form-container">
                  <form onSubmit={handleSubmit}>
                    <div className="edit-form-header">
                      <h3 className="edit-form-title">Edit Profile</h3>
                      <button 
                        type="button" 
                        className="close-button"
                        onClick={handleCancelEdit}
                        aria-label="Close edit form"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="edit-form-body">
                      <div className="form-section">
                        <div className="section-title">Personal Information</div>
                        
                        <div className="form-row">
                          <label className="form-label">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter your first name"
                            autoComplete="given-name"
                          />
                        </div>
                        
                        <div className="form-row">
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter your last name"
                            autoComplete="family-name"
                          />
                        </div>
                        
                        <div className="form-row">
                          <label className="form-label">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter your email address"
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      <div className="form-section">
                        <div className="section-title">Preferences</div>
                        
                        <div className="form-row d-flex align-items-center justify-content-between">
                          <label className="form-label mb-0">Temperature Units</label>
                          <div className="form-switch d-flex align-items-center">
                            <input
                              type="checkbox"
                              id="prefersImperial"
                              name="prefersImperial"
                              checked={formData.prefersImperial}
                              onChange={handleChange}
                              className="form-check-input"
                              style={{ width: '2.5em', height: '1.5em' }}
                            />
                            <label htmlFor="prefersImperial" className="form-check-label ms-2 mb-0">
                              {formData.prefersImperial ? 'Fahrenheit (°F)' : 'Celsius (°C)'}
                            </label>
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <label className="form-label">Theme</label>
                          <select
                            name="theme"
                            value={formData.theme}
                            onChange={handleChange}
                            className="form-select"
                          >
                            <option value="light">☀️ Light</option>
                            <option value="dark">🌙 Dark</option>
                          </select>
                        </div>
                        
                        <div className="form-row">
                          <label className="form-label">Date Format</label>
                          <select
                            name="dateFormat"
                            value={formData.dateFormat}
                            onChange={handleChange}
                            className="form-select"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                        
                        <div className="form-row">
                          <label className="form-label">Time Format</label>
                          <select
                            name="timeFormat"
                            value={formData.timeFormat}
                            onChange={handleChange}
                            className="form-select"
                          >
                            <option value="12-hour">12-hour (AM/PM)</option>
                            <option value="24-hour">24-hour</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-section">
                        <div className="section-title">Notifications</div>
                        
                        <div className="form-row">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              id="sleepReminderEnabled"
                              name="sleepReminderEnabled"
                              checked={formData.sleepReminderEnabled}
                              onChange={handleChange}
                              className="form-check-input"
                            />
                            <label htmlFor="sleepReminderEnabled" className="form-check-label">
                              Enable sleep reminders
                            </label>
                          </div>
                        </div>
                        
                        {formData.sleepReminderEnabled && (
                          <div className="form-row">
                            <label className="form-label">Reminder Frequency</label>
                            <div className="input-group">
                              <input
                                type="number"
                                name="sleepReminderHours"
                                value={formData.sleepReminderHours}
                                onChange={handleChange}
                                className="form-control"
                                min="1"
                                max="48"
                              />
                              <span className="input-group-text">hours</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="edit-form-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
