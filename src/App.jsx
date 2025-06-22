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
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import UserRedirect from './components/system/UserRedirect';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminOnlyRoute from './components/admin/AdminOnlyRoute';

// Admin Components - Lazy loaded since most users won't need them
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminUserProfile = lazy(() => import('./components/admin/AdminUserProfile'));

function App() {
  return (
    <>
      <PreferenceSync />
      <NavBar />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth/signup" element={<JoinUs />} />
          <Route path="/auth/login" element={<JoinUs />} />
          <Route path="/join" element={<JoinUs />} />

          {/* User-specific redirect protection */}
          <Route path="/users/:userId/*" element={<UserRedirect />} />

          {/* Private (authenticated user) routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/bedrooms" element={<PrivateRoute><BedroomIndex /></PrivateRoute>} />
          <Route path="/bedrooms/:bedroomid" element={<PrivateRoute><BedroomDetails /></PrivateRoute>} />
          <Route path="/sleep" element={<PrivateRoute><SleepDataIndex /></PrivateRoute>} />
          <Route path="/sleep/:id" element={<PrivateRoute><SleepSession /></PrivateRoute>} />
          <Route path="/dreams" element={<PrivateRoute><DreamIndex /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/gotobed" element={<PrivateRoute><GoToBedForm /></PrivateRoute>} />
          <Route path="/gotobed/wakeup" element={<PrivateRoute><WakeUpForm /></PrivateRoute>} />

          {/* Admin routes - protected by AdminOnlyRoute */}
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

          {/* Unauthorized route for forbidden access */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* 404 Catch-all Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
