import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dream-weaver-logo.png";
import { Bed, BarChart2, PenTool } from "lucide-react";
import SignupForm from "../components/forms/SignupForm.jsx";
import LoginForm from "../components/forms/LoginForm.jsx";

function LandingPage() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  // Get token inside the component so it's defined for handleStartClick
  const token = localStorage.getItem("token");

  const handleSignUpSuccess = (newUser) => {
    setShowSignup(false);
    setShowLogin(false);
    navigate("/dashboard");
  };

  function handleStartClick() {
    if (token) {
      navigate("/dashboard");
    } else {
      setShowSignup(true);
      setShowLogin(false);
    }
  }

  function openLogin() {
    setShowLogin(true);
    setShowSignup(false);
  }

  function openSignup() {
    setShowSignup(true);
    setShowLogin(false);
  }

  return (
    <div className="landing-page min-vh-100 d-flex flex-column align-items-center text-center pt-5 px-3">
      <img src={logo} alt="dreamWeaver logo" className="landing-logo my-4" />

      <h1 className="display-4 fw-bold mb-2">Welcome to dreamWeaver</h1>
      <p className="lead mb-4">Track your sleep. Record your dreams. Design your nights.</p>

      <button
        className="btn btn-primary btn-lg mb-3"
        onClick={handleStartClick}
        type="button"
      >
        Start Tracking Your Sleep
      </button>

      <div className="content-wrapper d-flex w-100 justify-content-center align-items-start gap-4">
        <div className="cards-container row w-100 justify-content-center g-4 px-3">
          <div className="col-10 col-md-3">
            <div className="card h-100 shadow-sm text-center p-3">
              <Bed size={32} className="mb-2" />
              <h5 className="card-title">Your Sleep Spaces</h5>
              <p className="card-text">Track how your environment affects your rest.</p>
            </div>
          </div>

          <div className="col-10 col-md-3">
            <div className="card h-100 shadow-sm text-center p-3">
              <BarChart2 size={32} className="mb-2" />
              <h5 className="card-title">Track Your Sleep</h5>
              <p className="card-text">Monitor when you fall asleep and wake up with ease.</p>
            </div>
          </div>

          <div className="col-10 col-md-3">
            <div className="card h-100 shadow-sm text-center p-3">
              <PenTool size={32} className="mb-2" />
              <h5 className="card-title">Record Your Dreams</h5>
              <p className="card-text">Capture your thoughts and dream logs every morning.</p>
            </div>
          </div>
        </div>

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
