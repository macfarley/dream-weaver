import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { DashboardProvider } from './contexts/DashboardContext';

import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import PreferenceSync from './components/shared/PreferenceSync';
import LandingPage from './components/LandingPage';
import Dashboard from './components/dashboard/Dashboard';
import BedroomIndex from './components/dashboard/BedroomIndex';
import BedroomDetails from './components/dashboard/BedroomDetails';
import DreamIndex from './components/dashboard/DreamIndex';
import SleepDataIndex from './components/dashboard/SleepDataIndex';
import SleepSession from './components/dashboard/SleepSession';
import UserProfile from './components/forms/UserProfile';
import GoToBedForm from './components/forms/GoToBedForm';
import WakeUpForm from './components/forms/WakeUpForm';
import JoinUs from './components/JoinUs';
import About from './components/About';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <DashboardProvider>
          <PreferenceSync />
          <NavBar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<About />} />
              
              <Route path="/auth/signup" element={<JoinUs />} />
              <Route path="/auth/login" element={<JoinUs />} />
              <Route path="/join" element={<JoinUs />} />
              
              <Route path="/users/dashboard" element={<Dashboard />} />
              <Route path="/users/dashboard/bedrooms" element={<BedroomIndex />} />
              <Route path="/users/dashboard/bedrooms/:bedroomname" element={<BedroomDetails />} />
              <Route path="/users/dashboard/sleepdata" element={<SleepDataIndex />} />
              <Route path="/users/dashboard/sleepdata/:date" element={<SleepSession />} />
              <Route path="/users/dashboard/dreamjournal/:date" element={<SleepSession />} />
              <Route path="/users/dashboard/dreams" element={<DreamIndex />} />
              <Route path="/users/profile" element={<UserProfile />} />
              
              {/* Sleep Session Routes */}
              <Route path="/gotobed" element={<GoToBedForm />} />
              <Route path="/gotobed/wakeup" element={<WakeUpForm />} />
              
              {/* Legacy Routes for Compatibility */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bedrooms" element={<BedroomIndex />} />
              <Route path="/dreams" element={<DreamIndex />} />
              <Route path="/sleep" element={<SleepDataIndex />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </main>
          <Footer />
        </DashboardProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
