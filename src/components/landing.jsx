import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/dream-weaver-logo.png";

function LandingPage() {
    return (
        <div className="landing-page bg-dark text-light min-vh-100 d-flex flex-column justify-content-center align-items-center text-center px-3">
            <img src={logo} alt="dreamWeaver logo" className="mb-4" style={{ maxWidth: "250px" }} />

            <h1 className="display-4 fw-bold">Welcome to dreamWeaver</h1>
            <p className="lead mb-4">Track your sleep. Record your dreams. Design your nights.</p>

            <Link to="/signup" className="btn btn-primary btn-lg mb-5">Start Tracking Your Sleep</Link>

            <div className="row w-100 justify-content-center g-3">
                <div className="col-10 col-md-3">
                    <div className="card h-100 bg-secondary text-light shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Track Your Sleep</h5>
                            <p className="card-text">Monitor when you fall asleep and wake up with ease.</p>
                        </div>
                    </div>
                </div>

                <div className="col-10 col-md-3">
                    <div className="card h-100 bg-secondary text-light shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Record Your Dreams</h5>
                            <p className="card-text">Capture your thoughts and dream logs every morning.</p>
                        </div>
                    </div>
                </div>

                <div className="col-10 col-md-3">
                    <div className="card h-100 bg-secondary text-light shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Your Sleep Spaces</h5>
                            <p className="card-text">Track how your environment affects your rest.</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-auto pt-5 small text-muted">© 2025 dreamWeaver</footer>
        </div>
    );
}

export default LandingPage;
