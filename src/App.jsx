import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { DashboardProvider } from './contexts/DashboardContext';

import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import LandingPage from './components/LandingPage';
import Dashboard from './components/dashboard/Dashboard';
import JoinUs from './components/JoinUs';
import About from './components/About';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <DashboardProvider>
          <NavBar /> {/* Navigation bar stays outside Routes */}
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/join" element={<JoinUs />} />
              <Route path="/about" element={<About />} />
              {/* Add other routes here */}
            </Routes>
          </main>
          <Footer /> {/* Footer stays outside Routes */}
        </DashboardProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
