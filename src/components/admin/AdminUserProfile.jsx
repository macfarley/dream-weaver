import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { getUserById, updateUserProfile, deleteUser, checkUsernameUnique } from '../../services/adminService';
import * as sleepDataService from '../../services/sleepDataService';
import Loading from '../ui/Loading';

/**
 * AdminUserProfile component allows admins to view and edit user profiles.
 * Admins can edit most fields for regular users, but only view other admin profiles.
 * Only admins can change usernames. Deletion requires password confirmation.
 */
function AdminUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(UserContext);

  // State management
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  // View/edit mode state
  const [viewMode, setViewMode] = useState(true);

  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    prefersImperial: true,
    theme: 'dark',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    dateOfBirth: '',
  });

  // Add password fields and username validation state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Add join date and last sleep session state
  const [joinDate, setJoinDate] = useState('');
  const [lastSleepSession, setLastSleepSession] = useState('');

  // Determine permissions
  const isTargetAdmin = targetUser?.role === 'admin';
  const isSelfEdit = currentUser?._id === userId;
  // Allow edit form for regular users (not self, not admin) and only if not in view mode
  const canEdit = !isTargetAdmin && !isSelfEdit && !viewMode;

  // Load user data and sleep session info
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const userData = await getUserById(userId);
        // Extract user data from userData.data if present (API returns { success, data })
        const user = userData && userData.data ? userData.data : userData;
        setTargetUser(user);
        setFormData({
          username: user.username || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          role: user.role || 'user',
          prefersImperial: user.prefersImperial ?? true,
          theme: user.theme || 'dark',
          dateFormat: user.dateFormat || 'MM/DD/YYYY',
          timeFormat: user.timeFormat || '12-hour',
          dateOfBirth: user.dateOfBirth || '',
        });
        setJoinDate(user.createdAt || user.joinedAt || '');
        // Fetch last sleep session for this user (admin only)
        try {
          const sleepSessions = await sleepDataService.getSleepDataByUser(userId);
          if (Array.isArray(sleepSessions) && sleepSessions.length > 0) {
            // Sort by createdAt descending
            const sorted = sleepSessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLastSleepSession(sorted[0].createdAt);
          } else {
            setLastSleepSession('');
          }
        } catch {
          setLastSleepSession('');
        }
        // Always start in view mode after loading user
        setViewMode(true);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setUsernameError('');
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Failed to load user profile: ' + (err.message || ''));
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      fetchUser();
    }
  }, [userId, currentUser?._id]);

  // Username uniqueness check
  const handleUsernameBlur = async () => {
    if (formData.username && formData.username !== targetUser?.username) {
      try {
        const isUnique = await checkUsernameUnique(formData.username);
        setUsernameError(isUnique ? '' : 'Username is already taken.');
      } catch {
        setUsernameError('Could not validate username uniqueness.');
      }
    } else {
      setUsernameError('');
    }
  };

  // Handle password change fields
  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setPasswordError('');
  };
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordError('');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    setSuccessMessage('');
    setPasswordError('');
    setUsernameError('');
    // Password validation
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match.');
        setSaving(false);
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters.');
        setSaving(false);
        return;
      }
    }
    // Username uniqueness validation
    if (formData.username && formData.username !== targetUser?.username) {
      try {
        const isUnique = await checkUsernameUnique(formData.username);
        if (!isUnique) {
          setUsernameError('Username is already taken.');
          setSaving(false);
          return;
        }
      } catch {
        setUsernameError('Could not validate username uniqueness.');
        setSaving(false);
        return;
      }
    }
    try {
      // Prepare update payload
      const updatePayload = { ...formData };
      if (newPassword) updatePayload.password = newPassword;
      // Remove dateOfBirth from payload (not editable)
      delete updatePayload.dateOfBirth;
      // Update user
      const updatedUser = await updateUserProfile(userId, updatePayload);
      setTargetUser(updatedUser);
      setSuccessMessage('User profile updated successfully!');
      setViewMode(true); // Return to view mode after save
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user: ' + (err.message || ''));
    } finally {
      setSaving(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your admin password');
      return;
    }
    const confirmMessage = `Are you absolutely sure you want to delete user "${targetUser.username}"? This action cannot be undone and will remove all their data including bedrooms, sleep sessions, and other records.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    setDeleteError('');
    try {
      await deleteUser(userId, deletePassword);
      navigate('/admin/dashboard', {
        state: { message: `User ${targetUser.username} has been deleted successfully.` }
      });
    } catch (err) {
      console.error('Failed to delete user:', err);
      setDeleteError('Failed to delete user: ' + (err.message || ''));
    }
  };

  // Show loading state
  if (loading || !targetUser) return <Loading />;
  if (error && !targetUser) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  // Helper to format ISO date to readable string
  function formatDate(dateStr, opts = {}) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    // If opts.short is true, show MM/DD/YYYY only
    if (opts.short) {
      return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Render view mode (read-only)
  const renderViewMode = () => (
    <div className="user-profile admin-user-profile">
      <div className="profile-view">
        <div className="profile-header">
          <div className="profile-avatar">
            {(targetUser?.firstName?.[0] || '') + (targetUser?.lastName?.[0] || '')}
          </div>
          <div className="profile-name">{targetUser?.firstName} {targetUser?.lastName}</div>
          <div className="profile-username">@{targetUser?.username}</div>
          <div className={`profile-role-badge ${targetUser?.role}`}>{targetUser?.role === 'admin' ? 'Admin' : 'User'}</div>
        </div>
        <div className="profile-details">
          <div className="detail-section">
            <div className="section-title"><span className="section-icon"><i className="fas fa-id-card"></i></span>Basic Info</div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value">{targetUser?.email || <span className="not-set">Not set</span>}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">User ID</div>
                <div className="detail-value">{targetUser?._id || <span className="not-set">Not set</span>}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Date of Birth</div>
                <div className="detail-value">{targetUser?.dateOfBirth ? formatDate(targetUser.dateOfBirth, { short: true }) : <span className="not-set">Not set</span>}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Join Date</div>
                <div className="detail-value">{formatDate(joinDate)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Last Sleep Session</div>
                <div className="detail-value">{lastSleepSession ? formatDate(lastSleepSession) : <span className="not-set">No sleep sessions logged</span>}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Profile actions for regular users (not admin, not self) */}
        {(!isTargetAdmin && !isSelfEdit && targetUser?.username) && (
          <div className="profile-actions">
            <button
              className="btn btn-primary"
              onClick={() => setViewMode(false)}
              type="button"
              disabled={!targetUser?.username}
            >
              <i className="fas fa-edit me-2"></i>
              Edit Profile
            </button>
            <button
              className="btn btn-danger ms-2"
              onClick={() => setShowDeleteModal(true)}
              type="button"
              disabled={!targetUser?.username}
            >
              <i className="fas fa-trash me-2"></i>
              Delete User
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render edit mode (form)
  const renderEditMode = () => (
    <form onSubmit={handleSubmit}>
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="username" className="form-label">
            Username *
            <i className="fas fa-lock ms-1 text-muted" title="Only admins can change usernames"></i>
          </label>
          <input
            type="text"
            className={`form-control${usernameError ? ' is-invalid' : ''}`}
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            onBlur={handleUsernameBlur}
            required
            disabled={isSelfEdit}
          />
          {usernameError && <div className="invalid-feedback">{usernameError}</div>}
          <div className="form-text">
            Only administrators can change usernames
          </div>
        </div>
        <div className="col-md-6">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="lastName" className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="role" className="form-label">
            Role
            <i className="fas fa-lock ms-1 text-muted" title="Read-only"></i>
          </label>
          <input
            type="text"
            className="form-control"
            id="role"
            value={formData.role}
            disabled
          />
          <div className="form-text">
            User roles cannot be changed through this interface
          </div>
        </div>
        <div className="col-md-6">
          <label htmlFor="userId" className="form-label">
            User ID
            <i className="fas fa-lock ms-1 text-muted" title="Read-only"></i>
          </label>
          <input
            type="text"
            className="form-control"
            id="userId"
            value={targetUser?._id || ''}
            disabled
          />
          <div className="form-text">
            MongoDB ObjectId (cannot be changed)
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="dateOfBirth" className="form-label">
            Date of Birth
            <i className="fas fa-lock ms-1 text-muted" title="Read-only"></i>
          </label>
          <input
            type="date"
            className="form-control"
            id="dateOfBirth"
            value={formData.dateOfBirth || ''}
            disabled
          />
          <div className="form-text">
            Date of birth cannot be changed for age restriction compliance
          </div>
        </div>
        <div className="col-md-6">
          <label htmlFor="newPassword" className="form-label">Set New Password</label>
          <input
            type="password"
            className={`form-control${passwordError ? ' is-invalid' : ''}`}
            id="newPassword"
            value={newPassword}
            onChange={handleNewPasswordChange}
            autoComplete="new-password"
            placeholder="New password"
          />
          <label htmlFor="confirmPassword" className="form-label mt-2">Confirm New Password</label>
          <input
            type="password"
            className={`form-control${passwordError ? ' is-invalid' : ''}`}
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            autoComplete="new-password"
            placeholder="Confirm new password"
          />
          {passwordError && <div className="invalid-feedback d-block">{passwordError}</div>}
          <div className="form-text">
            Password must be at least 8 characters. Admins never see the user's password.
          </div>
        </div>
      </div>
      <div className="d-flex gap-2 mt-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setViewMode(true)}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            {isTargetAdmin && !isSelfEdit ? 'View' : viewMode ? 'View' : 'Edit'} User Profile
            {isTargetAdmin && <i className="fas fa-crown text-warning ms-2" title="Administrator"></i>}
          </h2>
          <p className="text-muted mb-0">
            {isSelfEdit ? 'Editing your own profile' :
              isTargetAdmin ? 'Viewing admin profile (read-only)' :
              viewMode ? 'Viewing user profile' : 'Editing user profile'}
          </p>
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/admin/dashboard')}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>
      {successMessage && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
        </div>
      )}
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
      )}
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-user me-2"></i>
                Profile Information
              </h5>
            </div>
            <div className="card-body">
              {isTargetAdmin && !isSelfEdit ? (
                renderViewMode()
              ) : viewMode ? (
                // Only show view mode; edit/delete buttons are handled inside renderViewMode
                renderViewMode()
              ) : (
                // Only render the edit form if not in viewMode and not admin/self
                (!isTargetAdmin && !isSelfEdit && !viewMode && targetUser?.username) ? renderEditMode() : renderViewMode()
              )}
            </div>
          </div>
        </div>
        {/* Info Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Admin Notes
              </h6>
            </div>
            <div className="card-body">
              <div className="small">
                <p><strong>Permissions:</strong></p>
                <ul className="mb-3">
                  <li>✅ Admins can edit all user fields</li>
                  <li>✅ Only admins can change usernames</li>
                  <li>❌ Cannot edit other admin profiles</li>
                  <li>❌ Cannot delete admin accounts</li>
                  <li>❌ Cannot change user roles here</li>
                  <li>❌ Cannot modify MongoDB _id</li>
                </ul>
                <p><strong>Safety Features:</strong></p>
                <ul>
                  <li>Password required for deletion</li>
                  <li>Cannot delete your own account</li>
                  <li>Read-only view for admin profiles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                  Confirm User Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger">
                  <strong>Warning:</strong> This action cannot be undone!
                </div>
                <p>
                  You are about to permanently delete the user account for <strong>{targetUser?.username}</strong>.
                  This will remove all their data including sleep sessions, dreams, and preferences.
                </p>
                <div className="alert alert-info">
                  <small>
                    <strong>Note:</strong> If deletion fails with a server error, the backend deletion feature may not be fully implemented yet, 
                    or there may be database constraints preventing deletion of users with associated data.
                  </small>
                </div>
                {deleteError && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {deleteError}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="deletePassword" className="form-label">
                    Enter your admin password to confirm:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Your admin password"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteUser}
                  disabled={!deletePassword.trim()}
                >
                  <i className="fas fa-trash me-2"></i>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserProfile;
