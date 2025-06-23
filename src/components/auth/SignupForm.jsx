import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { UserContext } from "../../contexts/UserContext";
import { signUp, getToken } from "../../services/authService";
import * as bedroomService from "../../services/bedroomService";
import { getProfile } from "../../services/userService";

// Define allowed options for preferences
const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const timeFormats = ['12-hour', '24-hour'];
const themes = ['light', 'dark'];

function SignupForm({ onSignUpSuccess, onShowLogin }) {
  const { setUser } = useContext(UserContext);
  const formId = useRef(`signup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`).current;

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

  const validateField = useCallback((name, value) => {
    switch (name) {
      case "username":
        return value.length >= 3 ? null : "Username must be at least 3 characters";
      case "firstName":
        return value.trim().length >= 1 ? null : "First name is required";
      case "lastName":
        return value.trim().length >= 1 ? null : "Last name is required";
      case "dateOfBirth": {
        if (!value) return "Date of birth is required";
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 ? null : "Must be at least 13 years old";
      }
      case "email":
        return /\S+@\S+\.\S+/.test(value) ? null : "Invalid email address";
      case "password":
        return value.length >= 6 ? null : "Password must be at least 6 characters";
      case "confirmPassword":
        return value === formData.password ? null : "Passwords do not match";
      default:
        return null;
    }
  }, [formData.password]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Validate the changed field (skip validation for preferences)
    if (!["useMetric", "dateFormat", "timeFormat", "theme"].includes(name)) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, fieldValue),
      }));
    }
  }

  useEffect(() => {
    // Check if all required fields are valid
    const requiredFields = ["username", "firstName", "lastName", "dateOfBirth", "email", "password", "confirmPassword"];
    const allFieldsValid = requiredFields.every(field => {
      const error = validateField(field, formData[field]);
      return error === null;
    });
    
    setIsValid(allFieldsValid);
  }, [formData, validateField]);

  // Update your handleSubmit function:
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitError("");
    
    try {
      // Prepare data - ALWAYS default role to 'user' for frontend signups
      const signupData = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'user', // ALWAYS 'user' from frontend - cannot be changed by client
        // User preferences
        useMetric: formData.useMetric,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat,
        theme: formData.theme
      };

      const user = await signUp(signupData);
      // After successful signup, create a default "Hotel Room" bedroom
      try {
        const token = getToken(); // Get the token that was just stored from signup
        if (token) {
          const defaultBedroom = {
            bedroomName: "Hotel Room",
            temperature: formData.useMetric ? 21 : 70, // 21°C or 70°F
            lightLevel: 2, // Moderate lighting
            noiseLevel: 1, // Quiet
            notes: "Default bedroom - feel free to edit these settings to match your actual sleeping environment"
          };
          
          await bedroomService.createBedroom(defaultBedroom);
        }
      } catch (bedroomError) {
        // Don't fail the entire signup if bedroom creation fails
        console.warn('Failed to create default bedroom:', bedroomError);
      }
      // Fetch full profile after signup and set user context
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch {
        setUser(user); // fallback to signup response
      }
      if (onSignUpSuccess) onSignUpSuccess();
    } catch (err) {
      console.error('Signup error details:', err);
      
      if (err.message.includes('500') || err.message.includes('Server error')) {
        setSubmitError("We're experiencing technical difficulties. Please try again in a moment.");
      } else if (err.message.includes('email')) {
        setSubmitError("This email address is already registered. Please use a different email or try logging in.");
      } else if (err.message.includes('username')) {
        setSubmitError("This username is already taken. Please choose a different username.");
      } else {
        setSubmitError(err.message || "Unable to create account. Please try again.");
      }
    }
  };

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

      <div className="signup-form-field">
        {/* Temperature Units Toggle */}
        <div className="signup-toggle-field d-flex align-items-center mb-2">
          <label className="form-label signup-label mb-0 me-2">Temperature Units</label>
          <div className="form-switch d-flex align-items-center">
            <input
              type="checkbox"
              id={`useMetric-${formId}`}
              name="useMetric"
              className="signup-toggle form-check-input"
              checked={formData.useMetric}
              onChange={handleChange}
              style={{ width: '2.5em', height: '1.5em' }}
            />
            <label htmlFor={`useMetric-${formId}`} className="form-check-label ms-2 mb-0">
              <span style={{fontWeight: formData.useMetric ? 'normal' : 'bold'}}>F</span>
              <span className="mx-1">/</span>
              <span style={{fontWeight: formData.useMetric ? 'bold' : 'normal'}}>C</span>
            </label>
          </div>
        </div>
        {formData.useMetric ? (
          <div className="signup-checkbox-explainer text-muted small ms-1">
            Temperature displayed in Celsius (°C)
          </div>
        ) : (
          <div className="signup-checkbox-explainer text-muted small ms-1">
            Temperature displayed in Fahrenheit (°F)
          </div>
        )}
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
