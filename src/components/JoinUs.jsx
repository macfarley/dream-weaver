import React from "react";
import LoginForm from "./forms/LoginForm";
import SignupForm from "./forms/SignupForm";

function JoinUs() {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Join DreamWeaver</h2>
      <div className="row">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h4 className="text-center mb-3">Log In</h4>
            <LoginForm />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h4 className="text-center mb-3">Sign Up</h4>
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinUs;
