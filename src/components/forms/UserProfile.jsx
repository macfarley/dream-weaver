import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { updateProfile } from '../../services/userService';
import { getUserById, updateUserProfile, deleteUser } from '../../services/adminService';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../shared/Loading';

/**
 * UserProfile component allows users to view and update their profile information.
 * It can work in two modes:
 * 1. Regular user mode: Edit their own profile (no userId param)
 * 2. Admin mode: View/edit another user's profile (userId param present)
 * 
 * Admin features:
 * - Can edit usernames (regular users cannot)
 * - Can delete users (with password confirmation)
 * - Cannot edit other admins (view only)
 * - Cannot edit the MongoDB _id field
 */
function UserProfile() {
  // Access user and setUser from context
  const { user, setUser } = useContext(UserContext);
  const { setThemeFromPreferences } = useTheme();
  const navigate = useNavigate();
  const { userId } = useParams(); // Get userId from URL params for admin mode

  // Determine if this is admin mode (editing another user) or self mode
  const isAdminMode = userId && userId !== user?._id;
  const isCurrentUserAdmin = user?.role === 'admin';
  
  // State for the profile being viewed/edited
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Local state for form data
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    preferredTimezone: '',
    prefersImperial: true,
    theme: 'dark',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    sleepReminderEnabled: true,
    sleepReminderHours: 12,
  });

  // State for tracking related data counts for deletion warning
  const [relatedDataCounts, setRelatedDataCounts] = useState({
    bedrooms: 0,
    sleepSessions: 0
  });

  // Load user data - either from context (self) or fetch from API (admin mode)
  useEffect(() => {
    const loadUserData = async () => {
      if (isAdminMode) {
        // Admin mode - fetch the target user's data
        setLoading(true);
        try {
          const userData = await getUserById(userId);
          setProfileUser(userData);
          setFormData({
            username: userData.username || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            preferredTimezone: userData.preferredTimezone || '',
            prefersImperial: userData.prefersImperial ?? true,
            theme: userData.theme || 'dark',
            dateFormat: userData.dateFormat || 'MM/DD/YYYY',
            timeFormat: userData.timeFormat || '12-hour',
            sleepReminderEnabled: userData.sleepReminderEnabled ?? true,
            sleepReminderHours: userData.sleepReminderHours || 12,
          });
        } catch (error) {
          console.error('Failed to load user data:', error);
          toast.error('Failed to load user profile');
          navigate('/admin/dashboard');
        } finally {
          setLoading(false);
        }
      } else if (user) {
        // Self mode - use current user data
        setProfileUser(user);
        setFormData({
          username: user.username || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          preferredTimezone: user.preferredTimezone || '',
          prefersImperial: user.prefersImperial ?? true,
          theme: user.theme || 'dark',
          dateFormat: user.dateFormat || 'MM/DD/YYYY',
          timeFormat: user.timeFormat || '12-hour',
          sleepReminderEnabled: user.sleepReminderEnabled ?? true,
          sleepReminderHours: user.sleepReminderHours || 12,
        });
      }
    };

    loadUserData();
  }, [user, userId, isAdminMode, navigate]);

  /**
   * Handles changes to form fields.
   * Supports both text inputs and checkboxes.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Check if current user can edit this profile
  const canEdit = !isAdminMode || (isCurrentUserAdmin && profileUser?.role !== 'admin');
  const canEditUsername = isCurrentUserAdmin && isAdminMode;
  const canDelete = isCurrentUserAdmin && isAdminMode && profileUser?.role !== 'admin';

  // Loading state
  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  // If no profile data available
  if (!profileUser) {
    return <Loading message="Loading profile..." />;
  }

  /**
   * Handles form submission for updating profile.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let updatedUser;
      
      if (isAdminMode) {
        // Admin updating another user's profile
        updatedUser = await updateUserProfile(userId, formData);
        setProfileUser(updatedUser);
        toast.success(`Profile updated for ${updatedUser.username}`);
      } else {
        // User updating their own profile
        updatedUser = await updateProfile(formData);
        setUser(updatedUser);
        
        // Sync theme change with ThemeContext if theme was updated
        if (updatedUser.theme !== user?.theme) {
          setThemeFromPreferences(updatedUser.theme);
        }
        
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads related data counts for the user about to be deleted
   */
  const loadRelatedDataCounts = async () => {
    if (!isAdminMode || !userId) return;
    
    try {
      // Note: These would need to be implemented as admin endpoints
      // For now, we'll show a placeholder message
      // In a real implementation, you'd call something like:
      // const bedroomCount = await getBedroomCountByUserId(userId);
      // const sleepSessionCount = await getSleepSessionCountByUserId(userId);
      
      setRelatedDataCounts({
        bedrooms: '?', // Placeholder - would be actual count
        sleepSessions: '?' // Placeholder - would be actual count
      });
    } catch (err) {
      console.error('Failed to load related data counts:', err);
      // Set to unknown if we can't get the counts
      setRelatedDataCounts({
        bedrooms: '?',
        sleepSessions: '?'
      });
    }
  };

  /**
   * Shows the delete confirmation modal and loads related data counts
   */
  const showDeleteConfirmation = () => {
    setShowDeleteConfirm(true);
    loadRelatedDataCounts();
  };

  /**
   * Handles user deletion (admin only)
   */
  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your admin password');
      return;
    }
    
    try {
      await deleteUser(userId, deletePassword);
      toast.success(`User ${profileUser.username} has been deleted`);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user. Check your password.');
    }
  };

  // Render the profile form
  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow">
            <div className="card-header">
              <h2 className="mb-0">
                {isAdminMode 
                  ? `${canEdit ? 'Edit' : 'View'} Profile: ${profileUser.username}` 
                  : 'Edit Your Profile'
                }
              </h2>
              {isAdminMode && (
                <small className="text-muted">
                  Role: {profileUser.role} | ID: {profileUser._id}
                </small>
              )}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                
                {/* Username Field */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Username</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-text">Current:</div>
                      <div className="p-2 bg-light rounded border">
                        {profileUser.username}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-text">
                        {canEditUsername ? 'New Username:' : 'Cannot be changed'}
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!canEditUsername}
                        className="form-control"
                        placeholder={canEditUsername ? 'Enter new username' : 'Username cannot be changed'}
                      />
                    </div>
                  </div>
                </div>

                {/* First Name Field */}
                <div className="mb-4">
                  <label className="form-label fw-bold">First Name</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-text">Current:</div>
                      <div className="p-2 bg-light rounded border">
                        {profileUser.firstName || <em className="text-muted">Not set</em>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-text">Update:</div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="form-control"
                        placeholder="Enter first name"
                        autoComplete="given-name"
                      />
                    </div>
                  </div>
                </div>

                {/* Last Name Field */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Last Name</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-text">Current:</div>
                      <div className="p-2 bg-light rounded border">
                        {profileUser.lastName || <em className="text-muted">Not set</em>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-text">Update:</div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="form-control"
                        placeholder="Enter last name"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Email Address</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-text">Current:</div>
                      <div className="p-2 bg-light rounded border">
                        {profileUser.email || <em className="text-muted">Not set</em>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-text">Update:</div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="form-control"
                        placeholder="Enter email address"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </div>

                {/* Timezone Field */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Preferred Timezone</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-text">Current:</div>
                      <div className="p-2 bg-light rounded border">
                        {profileUser.preferredTimezone || <em className="text-muted">Not set</em>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-text">Update:</div>
                      <input
                        type="text"
                        name="preferredTimezone"
                        value={formData.preferredTimezone}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="form-control"
                        placeholder="e.g. America/New_York"
                      />
                    </div>
                  </div>
                </div>

                {/* Imperial Units Preference */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Units Preference</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-text">Current:</div>
                      <div className="p-2 bg-light rounded border">
                        {profileUser.prefersImperial ? 'Imperial (°F, miles)' : 'Metric (°C, kilometers)'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-text">Update:</div>
                      <div className="form-check mt-2">
                        <input
                          type="checkbox"
                          id="prefersImperial"
                          name="prefersImperial"
                          checked={formData.prefersImperial}
                          onChange={handleChange}
                          disabled={!canEdit}
                          className="form-check-input"
                        />
                        <label htmlFor="prefersImperial" className="form-check-label">
                          Use Imperial Units (°F, miles, etc)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Theme</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-text">Current:</div>
                      <div className="p-2 bg-light rounded border">
                        {profileUser.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-text">Update:</div>
                      <select
                        name="theme"
                        value={formData.theme}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="form-select"
                      >
                        <option value="light">☀️ Light</option>
                        <option value="dark">🌙 Dark</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date Format Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Date Format</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-text">Current:</div>
                      <div className="p-2 bg-light rounded border">
                        {profileUser.dateFormat || 'MM/DD/YYYY'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-text">Update:</div>
                      <select
                        name="dateFormat"
                        value={formData.dateFormat}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="form-select"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Time Format Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Time Format</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-text">Current:</div>
                      <div className="p-2 bg-light rounded border">
                        {profileUser.timeFormat === '24-hour' ? '24-hour (13:00)' : '12-hour (1:00 PM)'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-text">Update:</div>
                      <select
                        name="timeFormat"
                        value={formData.timeFormat}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="form-select"
                      >
                        <option value="12-hour">12-hour (AM/PM)</option>
                        <option value="24-hour">24-hour</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sleep Reminder Settings */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Sleep Reminders</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-text">Current:</div>
                      <div className="p-2 bg-light rounded border">
                        {profileUser.sleepReminderEnabled ?? true ? (
                          <>
                            ✅ Enabled
                            <br />
                            <small className="text-muted">
                              Remind after {profileUser.sleepReminderHours || 12} hours
                            </small>
                          </>
                        ) : (
                          '❌ Disabled'
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-text">Update:</div>
                      <div className="form-check mt-2 mb-3">
                        <input
                          type="checkbox"
                          id="sleepReminderEnabled"
                          name="sleepReminderEnabled"
                          checked={formData.sleepReminderEnabled}
                          onChange={handleChange}
                          disabled={!canEdit}
                          className="form-check-input"
                        />
                        <label htmlFor="sleepReminderEnabled" className="form-check-label">
                          Enable sleep reminders
                        </label>
                      </div>
                      {formData.sleepReminderEnabled && (
                        <div>
                          <label htmlFor="sleepReminderHours" className="form-label">
                            Remind me after:
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              id="sleepReminderHours"
                              name="sleepReminderHours"
                              value={formData.sleepReminderHours}
                              onChange={handleChange}
                              disabled={!canEdit}
                              className="form-control"
                              min="1"
                              max="48"
                            />
                            <span className="input-group-text">hours</span>
                          </div>
                          <div className="form-text">
                            Browser will remind you to log sleep after this many hours
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-3 mt-4">
                  {canEdit && (
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate(isAdminMode ? '/admin/dashboard' : '/dashboard')}
                  >
                    {isAdminMode ? 'Back to Admin Dashboard' : 'Back to Dashboard'}
                  </button>
                  
                  {canDelete && (
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={showDeleteConfirmation}
                    >
                      Delete User
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm User Deletion</h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={() => setShowDeleteConfirm(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="alert alert-danger">
                      <strong>⚠️ Warning:</strong> This action cannot be undone!
                    </div>
                    <p>
                      You are about to permanently delete user: <strong>{profileUser.username}</strong>
                    </p>
                    
                    <div className="alert alert-warning">
                      <strong>🗑️ Data that will be deleted:</strong>
                      <ul className="mb-0 mt-2">
                        <li>User account and profile information</li>
                        <li>Bedrooms: <strong>{relatedDataCounts.bedrooms}</strong> bedroom(s)</li>
                        <li>Sleep data: <strong>{relatedDataCounts.sleepSessions}</strong> sleep session(s)</li>
                        <li>Dreams and journal entries</li>
                        <li>All user preferences and settings</li>
                      </ul>
                      <p className="mb-0 mt-2 small">
                        <em>This includes ALL data associated with this user account.</em>
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Enter your admin password to confirm deletion:
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Your admin password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={handleDelete}
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export at the bottom for clarity
export default UserProfile;
