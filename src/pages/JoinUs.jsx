import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

/**
 * JoinUs component provides a unified authentication page that handles both login and signup.
 * 
 * Features:
 * - Automatically switches between login/signup based on URL path
 * - Routes like /signup, /auth/signup show signup form by default
 * - Routes like /login, /auth/login show login form by default  
 * - Users can toggle between forms using the provided form links
 * - Handles successful authentication by allowing forms to manage redirection
 * 
 * URL-based Form Selection:
 * - If URL contains 'signup', shows signup form initially
 * - Otherwise defaults to login form
 */
function JoinUs() {
  const location = useLocation();
  
  // State to control which form is displayed (true = login, false = signup)
  const [showLogin, setShowLogin] = useState(true);

  /**
   * Effect to set initial form based on current route.
   * This allows for direct links to signup or login pages to work correctly.
   */
  useEffect(() => {
    // Check if the current path indicates user wants to sign up
    const isSignupRoute = location.pathname.includes('/signup');
    
    if (isSignupRoute) {
      setShowLogin(false); // Show signup form
    } else {
      setShowLogin(true);  // Show login form (default)
    }
  }, [location.pathname]);

  /**
   * Switches from login form to signup form.
   * Called when user clicks "Don't have an account? Sign Up" in LoginForm.
   */
  const handleShowSignup = () => setShowLogin(false);
  
  /**
   * Switches from signup form to login form.
   * Called when user clicks "Already have an account? Log In" in SignupForm.
   */
  const handleShowLogin = () => setShowLogin(true);
  
  /**
   * Handles successful user signup.
   * After successful signup, the user is automatically logged in via the signup process.
   * The UserContext will update, and navigation is handled by the forms themselves.
   */
  const handleSignUpSuccess = () => {
    // Note: Navigation after signup is handled by the SignupForm component
    // The UserContext will be updated automatically through the signup process
    console.info('User signup completed successfully');
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          {/* Conditionally render either LoginForm or SignupForm based on showLogin state */}
          {showLogin ? (
            <LoginForm onShowSignup={handleShowSignup} />
          ) : (
            <SignupForm 
              onSignUpSuccess={handleSignUpSuccess}
              onShowLogin={handleShowLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default JoinUs;
