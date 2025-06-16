import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { updateProfile } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * UserProfile component allows users to view and update their profile information.
 * It loads the current user data from context and updates it on submit.
 */
function UserProfile() {
  // Access user and setUser from context
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

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
  });

  // Populate form data when user context changes
  useEffect(() => {
    if (user) {
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
      });
    }
  }, [user]);

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

  /**
   * Handles form submission.
   * Calls updateProfile service and updates user context.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile(formData);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      navigate('/users/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  // Render the profile form
  return (
    <div className="container my-4">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        {/* Username (read-only) */}
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username (cannot be changed)
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            disabled
            className="form-control"
          />
        </div>

        {/* First Name */}
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input
            required
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="form-control"
            autoComplete="given-name"
          />
        </div>

        {/* Last Name */}
        <div className="mb-3">
          <label htmlFor="lastName" className="form-label">Last Name</label>
          <input
            required
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="form-control"
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            required
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            autoComplete="email"
          />
        </div>

        {/* Preferred Timezone */}
        <div className="mb-3">
          <label htmlFor="preferredTimezone" className="form-label">
            Preferred Timezone
          </label>
          <input
            type="text"
            id="preferredTimezone"
            name="preferredTimezone"
            value={formData.preferredTimezone}
            onChange={handleChange}
            placeholder="e.g. America/New_York"
            className="form-control"
          />
        </div>

        {/* Imperial Units Preference */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            id="prefersImperial"
            name="prefersImperial"
            checked={formData.prefersImperial}
            onChange={handleChange}
            className="form-check-input"
          />
          <label htmlFor="prefersImperial" className="form-check-label">
            Use Imperial Units (Fahrenheit, miles, etc)
          </label>
        </div>

        {/* Theme Selection */}
        <div className="mb-3">
          <label htmlFor="theme" className="form-label">Theme</label>
          <select
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            className="form-select"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Date Format Selection */}
        <div className="mb-3">
          <label htmlFor="dateFormat" className="form-label">Date Format</label>
          <select
            id="dateFormat"
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

        {/* Time Format Selection */}
        <div className="mb-4">
          <label htmlFor="timeFormat" className="form-label">Time Format</label>
          <select
            id="timeFormat"
            name="timeFormat"
            value={formData.timeFormat}
            onChange={handleChange}
            className="form-select"
          >
            <option value="12-hour">12-hour (AM/PM)</option>
            <option value="24-hour">24-hour</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
}

// Export at the bottom for clarity
export default UserProfile;
