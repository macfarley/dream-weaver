const SignUp = async (e, formData, setError, setSuccess) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
        const response = await fetch("/api/users/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...formData,
                hashedPassword: formData.password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Signup failed");
        }

        setSuccess(true);
    } catch (err) {
        setError(err.message);
    }
};

export default { SignUp };
