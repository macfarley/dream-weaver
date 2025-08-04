import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { signIn } from "../../services/authService";
import { getProfile } from "../../services/userService";

/**
 * LoginForm component handles user login.
 * @param {function} onShowSignup - Callback to show the signup form.
 * @param {function} onLoginSuccess - Callback after successful login (optional)
 */
function LoginForm({ onShowSignup, onLoginSuccess }) {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    // State for form fields
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    // State for field-specific errors
    const [errors, setErrors] = useState({});

    // State to track if form is valid
    const [isValid, setIsValid] = useState(false);

    // State for submit error (e.g., wrong credentials)
    const [submitError, setSubmitError] = useState("");

    // State for loading during form submission
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Validate a single field by name and value.
     * @param {string} name - Field name
     * @param {string} value - Field value
     * @returns {string|null} - Error message or null if valid
     */
    const validateField = (name, value) => {
        if (name === "username") {
            return value.length >= 3 ? null : "Username must be at least 3 characters";
        }
        if (name === "password") {
            return value.length >= 6 ? null : "Password must be at least 6 characters";
        }
        return null;
    };

    /**
     * Handle input changes for form fields.
     * Updates formData, validates field, updates errors, and checks overall validity.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update form data
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Validate the changed field and update errors
        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value),
        }));

        // Validate both fields to determine if form is valid
        let usernameValid, passwordValid;
        if (name === "username") {
            usernameValid = validateField("username", value) === null;
            passwordValid = validateField("password", formData.password) === null;
        } else if (name === "password") {
            usernameValid = validateField("username", formData.username) === null;
            passwordValid = validateField("password", value) === null;
        }
        setIsValid(usernameValid && passwordValid);
    };

    /**
     * Handle form submission.
     * Attempts to sign in and updates user context or shows error.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(""); // Clear previous submit errors
        setIsLoading(true); // Show loading state

        try {
            // Attempt to sign in with form data
            console.log("Attempting login with username:", formData.username);
            const user = await signIn(formData);
            console.log("Login successful:", user);
            
            // Fetch full profile after login and set user context
            let profile = null;
            try {
                profile = await getProfile();
                setUser(profile);
                console.log("Profile fetched successfully:", profile);
            } catch (profileError) {
                console.warn("Could not fetch profile, using login response:", profileError);
                setUser(user); // fallback to login response
            }
            
            if (onLoginSuccess) {
                onLoginSuccess(profile || user);
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Login failed:", err);
            // Show error message if sign in fails
            const errorMessage = err.message || "Login failed. Please check your credentials and try again.";
            setSubmitError(errorMessage);
        } finally {
            setIsLoading(false); // Hide loading state
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h4 className="login-form-title">Log In</h4>

            {/* Show submit error if present */}
            {submitError && <div className="login-form-error">{submitError}</div>}

            {/* Username Field */}
            <div className="login-form-field">
                <label className="login-label">Username</label>
                <input
                    type="text"
                    className="login-input"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                />
                {/* Show username validation error */}
                {errors.username && <div className="login-error-msg">{errors.username}</div>}
            </div>

            {/* Password Field */}
            <div className="login-form-field">
                <label className="login-label">Password</label>
                <input
                    type="password"
                    className="login-input"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                />
                {/* Show password validation error */}
                {errors.password && <div className="login-error-msg">{errors.password}</div>}
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-submit w-100" disabled={!isValid || isLoading}>
                {isLoading ? "Signing In..." : "Log In"}
            </button>

            {/* Link to show signup form */}
            <div className="login-form-switch">
                <button type="button" className="login-switch-btn" onClick={onShowSignup}>
                    Don't have an account? Sign Up
                </button>
            </div>
        </form>
    );
}

export default LoginForm;
