import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { getUserById, updateUserProfile, deleteUser } from '../../services/adminService';
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

  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    preferredTimezone: '',
    prefersImperial: true,
    theme: 'dark',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
  });

  // Determine permissions
  const isTargetAdmin = targetUser?.role === 'admin';
  const isSelfEdit = currentUser?._id === userId;
  const canEdit = !isTargetAdmin || isSelfEdit; // Can edit non-admins or self
  const canDelete = !isTargetAdmin && !isSelfEdit; // Can't delete admins or self

  // Load user data
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);

      try {
        const userData = await getUserById(userId);
        setTargetUser(userData);

        // Populate form with user data
        setFormData({
          username: userData.username || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          role: userData.role || 'user',
          preferredTimezone: userData.preferredTimezone || '',
          prefersImperial: userData.prefersImperial ?? true,
          theme: userData.theme || 'dark',
          dateFormat: userData.dateFormat || 'MM/DD/YYYY',
          timeFormat: userData.timeFormat || '12-hour',
        });
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
  }, [userId]);

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

    try {
      // Update user
      const updatedUser = await updateUserProfile(userId, formData);
      setTargetUser(updatedUser);
      setSuccessMessage('User profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your admin password');
      return;
    }

    // Additional confirmation for safety
    const confirmMessage = `Are you absolutely sure you want to delete user "${targetUser.username}"? This action cannot be undone and will remove all their data including bedrooms, sleep sessions, and other records.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleteError(''); // Clear any previous errors
    
    try {
      await deleteUser(userId, deletePassword);
      
      // Success - redirect to admin dashboard
      navigate('/admin/dashboard', { 
        state: { message: `User ${targetUser.username} has been deleted successfully.` } 
      });
    } catch (err) {
      console.error('Failed to delete user:', err);
      
      // More specific error messages based on error type
      let errorMessage = 'Failed to delete user: ';
      
      if (err.message.includes('Status: 500')) {
        errorMessage += 'Server error - the user may have associated data that needs to be handled first, or the admin deletion feature may not be fully implemented on the backend.';
      } else if (err.message.includes('Status: 401') || err.message.includes('Status: 403')) {
        errorMessage += 'Invalid admin password or insufficient permissions.';
      } else if (err.message.includes('Status: 404')) {
        errorMessage += 'User not found or already deleted.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setDeleteError(errorMessage);
    }
  };

  // Show loading state
  if (loading) {
    return <Loading message="Loading user profile..." />;
  }

  // Show error state
  if (error && !targetUser) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Error Loading Profile</h4>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={() => navigate('/admin/dashboard')}
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            {canEdit ? 'Edit' : 'View'} User Profile
            {isTargetAdmin && <i className="fas fa-crown text-warning ms-2" title="Administrator"></i>}
          </h2>
          <p className="text-muted mb-0">
            {isSelfEdit ? 'Editing your own profile' : 
             isTargetAdmin ? 'Viewing admin profile (read-only)' : 
             'Editing user profile'}
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

      {/* Success/Error Messages */}
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

      {/* User Profile Form */}
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
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="username" className="form-label">
                      Username *
                      {!canEdit && <i className="fas fa-lock ms-1 text-muted" title="Read-only"></i>}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!canEdit}
                      required
                    />
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                {/* Role (read-only display) */}
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

                {/* Preferences */}
                <h6 className="mt-4 mb-3">User Preferences</h6>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="theme" className="form-label">Theme</label>
                    <select
                      className="form-select"
                      id="theme"
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      disabled={!canEdit}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="dateFormat" className="form-label">Date Format</label>
                    <select
                      className="form-select"
                      id="dateFormat"
                      name="dateFormat"
                      value={formData.dateFormat}
                      onChange={handleInputChange}
                      disabled={!canEdit}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="timeFormat" className="form-label">Time Format</label>
                    <select
                      className="form-select"
                      id="timeFormat"
                      name="timeFormat"
                      value={formData.timeFormat}
                      onChange={handleInputChange}
                      disabled={!canEdit}
                    >
                      <option value="12-hour">12-hour (AM/PM)</option>
                      <option value="24-hour">24-hour</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="prefersImperial"
                        name="prefersImperial"
                        checked={formData.prefersImperial}
                        onChange={handleInputChange}
                        disabled={!canEdit}
                      />
                      <label className="form-check-label" htmlFor="prefersImperial">
                        Use Imperial Units (vs Metric)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 mt-4">
                  {canEdit && (
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
                  )}
                  
                  {canDelete && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Delete User
                    </button>
                  )}
                </div>
              </form>
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

      {/* Delete Confirmation Modal */}
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
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
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
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
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
