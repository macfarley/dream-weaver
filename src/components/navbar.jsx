import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <Link className="navbar-brand" to="/dashboard">dreamWeaver</Link>
            
            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarContent"
                aria-controls="navbarContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="navbarContent">
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/gotobed">Go To Bed</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/gotobed/wakeup">Wake Up</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/journal">Dream Journal</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/bedrooms">Bedrooms</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/logout">Logout</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
