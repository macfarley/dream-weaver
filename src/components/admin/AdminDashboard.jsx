import React, { useEffect, useState } from "react";
import { getAllUsers } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import Loading from "../shared/Loading";
/**
 * AdminDashboard component displays a list of all users for admin management.
 * Fetches users on mount, handles loading and error states, and allows navigation to user detail pages.
 */
function AdminDashboard() {
  // State for user list, loading indicator, and error message
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // React Router navigation hook
  const navigate = useNavigate();

  // Fetch all users when component mounts
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true); // Start loading
      setError(null);   // Reset error state

      try {
        // Retrieve token from localStorage for authentication
        const token = localStorage.getItem("token");

        // Fetch all users from the API
        const allUsers = await getAllUsers(token);

        // Sort users alphabetically by username
        const sortedUsers = allUsers.sort((a, b) =>
          a.username.localeCompare(b.username)
        );

        // Update state with sorted users
        setUsers(sortedUsers);
      } catch (err) {
        // Handle errors during fetch
        setError("Failed to load users");
      } finally {
        // Stop loading indicator
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Show loading spinner while fetching data
  if (loading) {
    return <Spinner />;
  }

  // Show error message if fetch failed
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Render the list of users in cards
  return (
    <div className="container py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="row">
        {users.map((user) => (
          <div className="col-md-4 mb-3" key={user._id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{user.username}</h5>
                <p className="card-text">
                  <strong>Email:</strong> {user.email}<br />
                  <strong>Role:</strong> {user.role}<br />
                  <strong>Theme:</strong> {user.userPreferences?.theme}<br />
                  <strong>Date Format:</strong> {user.userPreferences?.dateFormat}
                </p>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate(`/admin/users/${user._id}`)}
                >
                  View/Edit Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export at the bottom for clarity
export default AdminDashboard;
