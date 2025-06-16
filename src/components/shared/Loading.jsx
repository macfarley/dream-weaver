// src/components/Loading.jsx
import React from "react";

function Loading({ message = "Loading..." }) {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100    ">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status" aria-label="Loading spinner">
          <span className="visually-hidden">{message}</span>
        </div>
        <div>{message}</div>
      </div>
    </div>
  );
}

export default Loading;
