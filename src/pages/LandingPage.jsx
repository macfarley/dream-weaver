import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import logo from "../assets/dream-weaver-logo.png";
import { Bed, BarChart2, PenTool } from "lucide-react";
import SignupForm from "../components/auth/SignupForm.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";
import BigActionButton from "../components/ui/BigActionButton";

/**
 * LandingPage component serves as the main entry point for new and returning users.
 *
 * Features:
 * - Welcome message and app overview with feature cards
 * - Smart action button that shows BigActionButton for logged-in users
 * - Shows "Start Tracking" button for non-authenticated users
 * - Conditional display of signup/login forms based on user interaction
 * - Responsive design with mobile-specific form positioning
 * - Handles successful signup/login by redirecting to dashboard
 *
 * State Management:
 * - showSignup: boolean - Controls visibility of signup form
 * - showLogin: boolean - Controls visibility of login form
 * - These are mutually exclusive (only one can be true at a time)
 */
function LandingPage() {
  // Get user authentication state from context
  const { user } = useContext(UserContext);
  
  // State for controlling which authentication form is displayed
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  /**
   * Handles successful user signup by hiding forms and navigating to dashboard.
   * Called by SignupForm component when registration is completed successfully.
   */
  const handleSignUpSuccess = () => {
    // Hide both authentication forms
    setShowSignup(false);
    setShowLogin(false);

    // Navigate to dashboard where user can start using the app
    navigate("/dashboard");
  };

  /**
   * Handles the main "Start Tracking Your Sleep" button click for non-authenticated users.
   * For authenticated users, the BigActionButton handles navigation directly.
   */
  function handleStartClick() {
    // Show signup form to get new users started
    setShowSignup(true);
    setShowLogin(false); // Ensure login form is hidden
  }

  /**
   * Shows the login form and hides the signup form.
   * Called when user clicks "Don't have an account? Sign Up" link.
   */
  function openLogin() {
    setShowLogin(true);
    setShowSignup(false);
  }

  /**
   * Shows the signup form and hides the login form.
   * Called when user clicks "Already have an account? Log In" link.
   */
  function openSignup() {
    setShowSignup(true);
    setShowLogin(false);
  }

  return (
    <div className="landing-page min-vh-100 d-flex flex-column align-items-center text-center pt-5 px-3">
      {/* App logo */}
      <img src={logo} alt="dreamWeaver logo" className="landing-logo my-4" />

      {/* Main heading and tagline */}
      <h1 className="display-4 fw-bold mb-2">Welcome to dreamWeaver</h1>
      <p className="lead mb-4">Track your sleep. Record your dreams. Design your nights.</p>

      {/* Primary call-to-action - BigActionButton for logged-in users, regular button for guests */}
      {user ? (
        <div className="mb-5">
          <BigActionButton size="large" />
        </div>
      ) : (
        <button
          className="btn btn-primary btn-lg mb-3"
          onClick={handleStartClick}
          type="button"
          aria-label="Sign up to start tracking"
        >
          Start Tracking Your Sleep
        </button>
      )}

      {/* Main content area with feature cards and authentication forms */}
      <div className="content-wrapper d-flex w-100 justify-content-center align-items-start gap-4">
        {/* Feature overview cards */}
        <div className="cards-container row w-100 justify-content-center g-4 px-3">
          {/* Sleep Environment Feature */}
          <div className="col-10 col-md-3">
            <div className="card h-100 shadow-sm text-center p-3">
              <Bed size={32} className="mb-2" aria-hidden="true" />
              <h5 className="card-title">Your Sleep Spaces</h5>
              <p className="card-text">Track how your environment affects your rest.</p>
            </div>
          </div>

          {/* Sleep Tracking Feature */}
          <div className="col-10 col-md-3">
            <div className="card h-100 shadow-sm text-center p-3">
              <BarChart2 size={32} className="mb-2" aria-hidden="true" />
              <h5 className="card-title">Track Your Sleep</h5>
              <p className="card-text">Monitor when you fall asleep and wake up with ease.</p>
            </div>
          </div>

          {/* Dream Journaling Feature */}
          <div className="col-10 col-md-3">
            <div className="card h-100 shadow-sm text-center p-3">
              <PenTool size={32} className="mb-2" aria-hidden="true" />
              <h5 className="card-title">Record Your Dreams</h5>
              <p className="card-text">Capture your thoughts and dream logs every morning.</p>
            </div>
          </div>
        </div>

        {/* Desktop authentication forms (shown to the right of cards on larger screens) */}
        {showSignup && (
          <div className="signup-panel p-4 rounded shadow-sm">
            <SignupForm
              onSignUpSuccess={handleSignUpSuccess}
              onShowLogin={openLogin}
            />
          </div>
        )}

        {showLogin && (
          <div className="login-panel p-4 rounded shadow-sm">
            <LoginForm onShowSignup={openSignup} />
          </div>
        )}
      </div>

      {/* Mobile authentication forms (shown below cards on smaller screens) */}
      <div className="signup-mobile mt-4 w-100 px-3 d-md-none">
        {showSignup && (
          <div className="mobile-signup-login p-3 rounded shadow-sm">
            <SignupForm onShowLogin={openLogin} onSignUpSuccess={handleSignUpSuccess} />
          </div>
        )}

        {showLogin && (
          <div className="mobile-signup-login p-3 rounded shadow-sm">
            <LoginForm onShowSignup={openSignup} />
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;
