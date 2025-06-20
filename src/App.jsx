import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import PreferenceSync from './components/system/PreferenceSync';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/dashboard/Dashboard';
import BedroomIndex from './pages/dashboard/BedroomIndex';
import BedroomDetails from './pages/dashboard/BedroomDetails';
import DreamIndex from './pages/dashboard/DreamIndex';
import SleepDataIndex from './pages/dashboard/SleepDataIndex';
import SleepSession from './pages/dashboard/SleepSession';
import UserProfile from './components/auth/UserProfile';
import GoToBedForm from './components/sleep/GoToBedForm';
import WakeUpForm from './components/sleep/WakeUpForm';
import JoinUs from './pages/JoinUs';
import About from './pages/About';

// Admin Components - Lazy loaded since most users won't need them
import AdminOnlyRoute from './components/admin/AdminOnlyRoute';
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminUserProfile = lazy(() => import('./components/admin/AdminUserProfile'));

function App() {
  return (
    <>
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
          <Route path="/users/dashboard/sleepdata/:id" element={<SleepSession />} />
          <Route path="/users/dashboard/dreamjournal/:date" element={<SleepSession />} />
          <Route path="/users/dashboard/dreams" element={<DreamIndex />} />
          <Route path="/users/profile" element={<UserProfile />} />
          
          {/* Sleep Session Routes */}
          <Route path="/gotobed" element={<GoToBedForm />} />
          <Route path="/gotobed/wakeup" element={<WakeUpForm />} />
          
          {/* Admin Routes - Protected by AdminOnlyRoute */}
          <Route path="/admin/dashboard" element={
            <AdminOnlyRoute>
              <Suspense fallback={<div>Loading admin dashboard...</div>}>
                <AdminDashboard />
              </Suspense>
            </AdminOnlyRoute>
          } />
          <Route path="/admin/userprofile/:userId" element={
            <AdminOnlyRoute>
              <Suspense fallback={<div>Loading admin profile...</div>}>
                <AdminUserProfile />
              </Suspense>
            </AdminOnlyRoute>
          } />
          
          {/* Legacy Routes for Compatibility */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bedrooms" element={<BedroomIndex />} />
          <Route path="/dreams" element={<DreamIndex />} />
          <Route path="/sleep" element={<SleepDataIndex />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
