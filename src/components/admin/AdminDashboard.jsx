import { useEffect, useState, useContext } from "react";
import { getAllUsers } from "../../services/adminService";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import Loading from "../ui/Loading";

/**
 * AdminDashboard component displays a list of all users for admin management.
 * Fetches users on mount, handles loading and error states, and allows navigation to user detail pages.
 * Users are sorted by role (admins first) then alphabetically by username.
 */
function AdminDashboard() {
  // State for user list, loading indicator, and error message
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user and preferences from context for admin verification
  const { user: currentUser } = useContext(UserContext);

  // React Router navigation hook
  const navigate = useNavigate();

  // Fetch all users when component mounts
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true); // Start loading
      setError(null);   // Reset error state

      try {
        // Fetch all users from the admin API (already sorted)
        const sortedUsers = await getAllUsers();
        setUsers(sortedUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        // Handle errors during fetch
        setError("Failed to load users. " + (err.message || ''));
      } finally {
        // Stop loading indicator
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Show loading spinner while fetching data
  if (loading) {
    return <Loading message="Loading user database..." />;
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Error Loading Users</h4>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Separate users by role for display
  const adminUsers = users.filter(user => user.role === 'admin');
  const regularUsers = users.filter(user => user.role !== 'admin');

  // Helper function to handle user card click
  const handleUserClick = (userId) => {
    navigate(`/admin/userprofile/${userId}`);
  };

  // Helper to format ISO date to readable string
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  // Helper to get last active date (profile update or sleep session)
  function getLastActive(user) {
    // Use updatedAt, lastSleepSession, or fallback to createdAt
    const profileUpdate = user.updatedAt || user.lastUpdated;
    const sleepSession = user.lastSleepSession;
    const joinDate = user.createdAt || user.joinedAt;
    let lastActive = joinDate;
    if (profileUpdate && (!lastActive || new Date(profileUpdate) > new Date(lastActive))) {
      lastActive = profileUpdate;
    }
    if (sleepSession && (!lastActive || new Date(sleepSession) > new Date(lastActive))) {
      lastActive = sleepSession;
    }
    return lastActive;
  }

  // Render the list of users in cards, separated by role
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <span className="badge bg-secondary">
          Total Users: {users.length} ({adminUsers.length} admins, {regularUsers.length} users)
        </span>
      </div>

      {/* Admin Users Section */}
      {adminUsers.length > 0 && (
        <>
          <h3 className="text-primary mb-3">
            <i className="fas fa-shield-alt me-2"></i>
            Administrators ({adminUsers.length})
          </h3>
          <div className="row mb-5">
            {adminUsers.map((user) => (
              <div className="col-lg-4 col-md-6 mb-3" key={user._id}>
                <div className="card h-100 shadow-sm border-primary">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-crown text-warning me-2"></i>
                      <h5 className="card-title mb-0">{user.username}</h5>
                    </div>
                    <p className="card-text mb-2">
                      <strong>Role:</strong> <span className="badge bg-primary">{user.role}</span><br />
                      <strong>Join Date:</strong> {formatDate(user.createdAt || user.joinedAt)}<br />
                      <strong>Last Active:</strong> {formatDate(getLastActive(user))}
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleUserClick(user._id)}
                        title="View admin profile (view-only for other admins)"
                      >
                        <i className="fas fa-eye me-1"></i>
                        View Profile
                      </button>
                      {currentUser?._id === user._id && (
                        <span className="badge bg-success align-self-center">You</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Regular Users Section */}
      <h3 className="text-secondary mb-3">
        <i className="fas fa-users me-2"></i>
        Users ({regularUsers.length})
      </h3>
      {regularUsers.length > 0 ? (
        <div className="row">
          {regularUsers.map((user) => (
            <div className="col-lg-4 col-md-6 mb-3" key={user._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{user.username}</h5>
                  <p className="card-text mb-2">
                    <strong>Role:</strong> <span className="badge bg-secondary">{user.role}</span><br />
                    <strong>Join Date:</strong> {formatDate(user.createdAt || user.joinedAt)}<br />
                    <strong>Last Active:</strong> {formatDate(getLastActive(user))}
                  </p>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleUserClick(user._id)}
                    title="View and edit user profile"
                  >
                    <i className="fas fa-edit me-1"></i>
                    View/Edit Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          No regular users found.
        </div>
      )}
    </div>
  );
}

// Export at the bottom for clarity
export default AdminDashboard;
