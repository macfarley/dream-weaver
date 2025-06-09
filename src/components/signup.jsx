import { useState } from "react";

const initialState = {
    username: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    password: "",
    preferredTimezone: "",
    prefersImperial: false,
};

const timezones = [
    "Pacific/Midway (UTC-11:00)",
    "America/Adak (UTC-10:00)",
    "America/Anchorage (UTC-09:00)",
    "America/Los_Angeles (UTC-08:00)",
    "America/Denver (UTC-07:00)",
    "America/Chicago (UTC-06:00)",
    "America/New_York (UTC-05:00)",
    "America/Sao_Paulo (UTC-03:00)",
    "Europe/London (UTC+00:00)",
    "Europe/Berlin (UTC+01:00)",
    "Europe/Moscow (UTC+03:00)",
    "Asia/Dubai (UTC+04:00)",
    "Asia/Kolkata (UTC+05:30)",
    "Asia/Hong_Kong (UTC+08:00)",
    "Asia/Tokyo (UTC+09:00)",
    "Australia/Sydney (UTC+10:00)",
    "Pacific/Auckland (UTC+12:00)",
];

function SignupForm() {
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const validate = () => {
        const errs = {};
        const emailRegex = /.+@.+\..+/;

        if (form.username.trim().length < 3) errs.username = "Minimum 3 characters.";
        if (form.firstName.trim().length < 2) errs.firstName = "Minimum 2 characters.";
        if (form.lastName.trim().length < 2) errs.lastName = "Minimum 2 characters.";

        if (!form.dateOfBirth) {
            errs.dateOfBirth = "Required.";
        } else {
            const dob = new Date(form.dateOfBirth);
            const now = new Date();
            const age = now.getFullYear() - dob.getFullYear();
            const m = now.getMonth() - dob.getMonth();
            const adjustedAge = m < 0 || (m === 0 && now.getDate() < dob.getDate()) ? age - 1 : age;
            if (dob > now) errs.dateOfBirth = "Date must be in the past.";
            else if (adjustedAge < 18) errs.dateOfBirth = "You must be at least 18.";
        }

        if (!emailRegex.test(form.email)) errs.email = "Invalid email format.";
        if (form.password.length < 6) errs.password = "Minimum 6 characters.";

        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            console.log("Submitting", form);
            // fetch() or axios() call here
        }
    };

    return (
        <form className="signup-form container mt-4" onSubmit={handleSubmit} noValidate>
            <h2 className="mb-4">Sign Up</h2>

            {[
                ["Username", "username"],
                ["First Name", "firstName"],
                ["Last Name", "lastName"],
                ["Date of Birth", "dateOfBirth", "date"],
                ["Email", "email", "email"],
                ["Password", "password", "password"]
            ].map(([label, name, type = "text"]) => (
                <div className="mb-3" key={name}>
                    <label htmlFor={name} className="form-label">{label}</label>
                    <input
                        type={type}
                        className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                        id={name}
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                    />
                    {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
                </div>
            ))}

            <div className="mb-3">
                <label htmlFor="preferredTimezone" className="form-label">Preferred Timezone</label>
                <select
                    name="preferredTimezone"
                    className="form-select"
                    value={form.preferredTimezone}
                    onChange={handleChange}
                >
                    <option value="">Select timezone</option>
                    {timezones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                    ))}
                </select>
            </div>

            <div className="form-check mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="prefersImperial"
                    name="prefersImperial"
                    checked={form.prefersImperial}
                    onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="prefersImperial">
                    Use Imperial units
                </label>
            </div>

            <button type="submit" className="btn btn-primary">Create Account</button>
        </form>
    );
}

export default SignupForm;
