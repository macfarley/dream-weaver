import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { updateProfile } from '../../services/userService';
import { getUserById, updateUserProfile, deleteUser } from '../../services/adminService';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../ui/Loading';
import { User, Mail, Clock, Thermometer, Calendar, Bell, Palette } from 'lucide-react';

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
  const [showEditForm, setShowEditForm] = useState(false);
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Local state for form data
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
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
        console.log('Loading user profile data:', user);
        setProfileUser(user);
        setFormData({
          username: user.username || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
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
        // User updating their own profile - only send fields with actual values (PATCH semantics)
        const userEditableData = {};
        
        // Only include fields that have actual values (not empty strings)
        if (formData.firstName.trim()) userEditableData.firstName = formData.firstName.trim();
        if (formData.lastName.trim()) userEditableData.lastName = formData.lastName.trim();
        if (formData.email.trim()) userEditableData.email = formData.email.trim();
        
        // Always include preferences and settings (these have defaults)
        userEditableData.prefersImperial = formData.prefersImperial;
        userEditableData.theme = formData.theme;
        userEditableData.dateFormat = formData.dateFormat;
        userEditableData.timeFormat = formData.timeFormat;
        userEditableData.sleepReminderEnabled = formData.sleepReminderEnabled;
        userEditableData.sleepReminderHours = formData.sleepReminderHours;
        
        console.log('Sending user profile update (filtered):', userEditableData);
        updatedUser = await updateProfile(userEditableData);
        setUser(updatedUser);
        
        // Sync theme change with ThemeContext if theme was updated
        if (updatedUser.theme !== user?.theme) {
          setThemeFromPreferences(updatedUser.theme);
        }
        
        // Check if this was a mock update (when backend endpoint isn't available)
        if (updatedUser.updatedAt && new Date(updatedUser.updatedAt).getTime() > Date.now() - 1000) {
          toast.success('Profile updated successfully! (Using mock data - backend restart needed for full functionality)');
        } else {
          toast.success('Profile updated successfully!');
        }
      }
      
      // Close the edit form
      setShowEditForm(false);
    } catch (err) {
      console.error('Profile update error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
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
      username: profileUser.username || '',
      firstName: profileUser.firstName || '', // Pre-fill with current value, empty string if not set
      lastName: profileUser.lastName || '',   // Pre-fill with current value, empty string if not set
      email: profileUser.email || '',         // Pre-fill with current value, empty string if not set
      prefersImperial: profileUser.prefersImperial ?? true,
      theme: profileUser.theme || 'dark',
      dateFormat: profileUser.dateFormat || 'MM/DD/YYYY',
      timeFormat: profileUser.timeFormat || '12-hour',
      sleepReminderEnabled: profileUser.sleepReminderEnabled ?? true,
      sleepReminderHours: profileUser.sleepReminderHours || 12,
    };
    
    console.log('Setting form data from profile user:', {
      profileUser: profileUser,
      formData: newFormData
    });
    
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

  // Render the profile view
  return (
    <div className={`user-profile ${isAdminMode ? 'admin-mode' : ''}`}>
      <div className="container my-4">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            
            {/* Profile View */}
            <div className="profile-view">
              
              {/* Admin Warning */}
              {isAdminMode && (
                <div className="admin-warning">
                  <span className="warning-icon">⚠️</span>
                  You are viewing/editing another user's profile as an administrator.
                </div>
              )}

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
                <div className={`profile-role-badge ${profileUser.role}`}>
                  {profileUser.role === 'admin' ? '👑 Administrator' : '👤 User'}
                </div>
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
                      <div className="detail-value">
                        {profileUser.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
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
                        
                        <div className="form-row">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              id="prefersImperial"
                              name="prefersImperial"
                              checked={formData.prefersImperial}
                              onChange={handleChange}
                              className="form-check-input"
                            />
                            <label htmlFor="prefersImperial" className="form-check-label">
                              Use Fahrenheit (°F) for temperature
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
            </div>            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
