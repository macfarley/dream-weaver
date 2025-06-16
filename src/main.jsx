// src/main.jsx

import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';

import 'bootstrap/dist/css/bootstrap.min.css';             // Load Bootstrap CSS
import './styles/custom.scss';                             // ✅ Load custom styles after Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js';        // Load Bootstrap JS features

import App from './App.jsx';

// Get the root DOM element where the React app will be mounted
const rootElement = document.getElementById('root');

// Create a root for React 18+
const root = createRoot(rootElement);

// Render the application
root.render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
