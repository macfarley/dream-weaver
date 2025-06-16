import React, { useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { signIn } from "../../services/authService";

/**
 * LoginForm component handles user login.
 * @param {function} onShowSignup - Callback to show the signup form.
 */
function LoginForm({ onShowSignup }) {
    // Get setUser from UserContext to update user state after login
    const { setUser } = useContext(UserContext);

    // State for form fields
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // State for field-specific errors
    const [errors, setErrors] = useState({});

    // State to track if form is valid
    const [isValid, setIsValid] = useState(false);

    // State for submit error (e.g., wrong credentials)
    const [submitError, setSubmitError] = useState("");

    /**
     * Validate a single field by name and value.
     * @param {string} name - Field name
     * @param {string} value - Field value
     * @returns {string|null} - Error message or null if valid
     */
    const validateField = (name, value) => {
        if (name === "email") {
            // Simple email regex validation
            return /\S+@\S+\.\S+/.test(value) ? null : "Invalid email address";
        }
        if (name === "password") {
            // Password must be at least 6 characters
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
        let emailValid, passwordValid;
        if (name === "email") {
            emailValid = validateField("email", value) === null;
            passwordValid = validateField("password", formData.password) === null;
        } else if (name === "password") {
            emailValid = validateField("email", formData.email) === null;
            passwordValid = validateField("password", value) === null;
        }
        setIsValid(emailValid && passwordValid);
    };

    /**
     * Handle form submission.
     * Attempts to sign in and updates user context or shows error.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(""); // Clear previous submit errors

        try {
            // Attempt to sign in with form data
            const user = await signIn(formData);
            setUser(user); // Update user context on success
            navigate("/users/dashboard");

        } catch (err) {
            // Show error message if sign in fails
            setSubmitError(err.message || "Login failed. Please check your credentials.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="text-start  ">
            <h4 className="mb-3">Log In</h4>

            {/* Show submit error if present */}
            {submitError && <div className="alert alert-danger">{submitError}</div>}

            {/* Email Field */}
            <div className="mb-2">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                {/* Show email validation error */}
                {errors.email && <div className="text-warning small">{errors.email}</div>}
            </div>

            {/* Password Field */}
            <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                />
                {/* Show password validation error */}
                {errors.password && <div className="text-warning small">{errors.password}</div>}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-100" disabled={!isValid}>
                Log In
            </button>

            {/* Link to show signup form */}
            <div className="text-center mt-3">
                <button type="button" className="btn btn-link  " onClick={onShowSignup}>
                    Don’t have an account? Sign Up
                </button>
            </div>
        </form>
    );
}

export default LoginForm;
