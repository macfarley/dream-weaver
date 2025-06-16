import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { signUp } from "../../services/authService";

// Define allowed options for preferences
const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const timeFormats = ['12-hour', '24-hour'];
const themes = ['light', 'dark'];

function SignupForm({ onSignUpSuccess, onShowLogin }) {
  const { setUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    password: "",
    confirmPassword: "",
    useMetric: false,
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12-hour",
    theme: "dark",
  });

  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function validateField(name, value) {
    // ...validation logic unchanged...
  }

  function handleChange(e) {
    // ...unchanged...
  }

  useEffect(() => {
    // ...unchanged...
  }, [formData]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    // ...unchanged...
  }

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <h4 className="signup-form-title mb-3">Create Account</h4>

      {submitError && (
        <div className="signup-form-error alert alert-danger">
          {submitError}
        </div>
      )}

      <div className="signup-field mb-2">
        <label className="form-label signup-label">Username</label>
        <input
          type="text"
          className="form-control signup-input"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && (
          <div className="signup-error-msg text-warning small">
            {errors.username}
          </div>
        )}
      </div>

      <div className="signup-field mb-2">
        <label className="form-label signup-label">First Name</label>
        <input
          type="text"
          className="form-control signup-input"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
        />
        {errors.firstName && (
          <div className="signup-error-msg text-warning small">
            {errors.firstName}
          </div>
        )}
      </div>

      <div className="signup-field mb-2">
        <label className="form-label signup-label">Last Name</label>
        <input
          type="text"
          className="form-control signup-input"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />
        {errors.lastName && (
          <div className="signup-error-msg text-warning small">
            {errors.lastName}
          </div>
        )}
      </div>

      <div className="signup-field mb-2">
        <label className="form-label signup-label">Date of Birth</label>
        <input
          type="date"
          className="form-control signup-input"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />
        {errors.dateOfBirth && (
          <div className="signup-error-msg text-warning small">
            {errors.dateOfBirth}
          </div>
        )}
      </div>

      <div className="signup-field mb-2">
        <label className="form-label signup-label">Email</label>
        <input
          type="email"
          className="form-control signup-input"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && (
          <div className="signup-error-msg text-warning small">
            {errors.email}
          </div>
        )}
      </div>

      <div className="signup-field mb-2">
        <label className="form-label signup-label">Password</label>
        <input
          type="password"
          className="form-control signup-input"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && (
          <div className="signup-error-msg text-warning small">
            {errors.password}
          </div>
        )}
      </div>

      <div className="signup-field mb-2">
        <label className="form-label signup-label">
          Confirm Password
        </label>
        <input
          type="password"
          className="form-control signup-input"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && (
          <div className="signup-error-msg text-warning small">
            {errors.confirmPassword}
          </div>
        )}
      </div>

      <hr className="signup-divider" />

      <div className="form-check mb-2 signup-checkbox-field">
        <input
          className="form-check-input signup-checkbox"
          type="checkbox"
          name="useMetric"
          checked={formData.useMetric}
          onChange={handleChange}
          id="useMetric"
        />
        <label className="form-check-label signup-checkbox-label" htmlFor="useMetric">
          Use metric units
        </label>
      </div>

      <div className="signup-field mb-2">
        <label className="form-label signup-label">Date Format</label>
        <select
          className="form-select signup-select"
          name="dateFormat"
          value={formData.dateFormat}
          onChange={handleChange}
        >
          {dateFormats.map((fmt) => (
            <option key={fmt} value={fmt}>{fmt}</option>
          ))}
        </select>
      </div>

      <div className="signup-field mb-2">
        <label className="form-label signup-label">Time Format</label>
        <select
          className="form-select signup-select"
          name="timeFormat"
          value={formData.timeFormat}
          onChange={handleChange}
        >
          {timeFormats.map((fmt) => (
            <option key={fmt} value={fmt}>{fmt}</option>
          ))}
        </select>
      </div>

      <div className="signup-field mb-3">
        <label className="form-label signup-label">Theme</label>
        <select
          className="form-select signup-select"
          name="theme"
          value={formData.theme}
          onChange={handleChange}
        >
          {themes.map((th) => (
            <option key={th} value={th}>{th}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="btn btn-success signup-submit w-100"
        disabled={!isValid}
      >
        Sign Up
      </button>

      <div className="text-center mt-3 signup-switch">
        <button
          type="button"
          className="btn btn-link signup-switch-btn"
          onClick={onShowLogin}
        >
          Already have an account? Log In
        </button>
      </div>
    </form>
  );
}

export default SignupForm;
