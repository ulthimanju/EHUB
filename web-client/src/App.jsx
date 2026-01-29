import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import OtpPage from './pages/OtpPage';
import ProfilePage from './pages/ProfilePage';

import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import EventFormPage from './pages/EventFormPage';
import MyEventsPage from './pages/MyEventsPage';
import UserDirectoryPage from './pages/UserDirectoryPage';
import JudgingPage from './pages/JudgingPage';

// Placeholder for protected route
const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  if (auth.isLoading) return <div>Loading...</div>;
  if (!auth.isAuthenticated) return <Navigate to="/" />;
  return children;
};

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div className="loading-screen">Loading EventHub...</div>;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/create" element={
          <ProtectedRoute>
            <EventFormPage />
          </ProtectedRoute>
        } />
        <Route path="/events/edit/:id" element={
          <ProtectedRoute>
            <EventFormPage />
          </ProtectedRoute>
        } />
        <Route path="/events/:id" element={<EventDetailsPage />} />

        <Route path="/my-events" element={
          <ProtectedRoute>
            <MyEventsPage />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/users/:id" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <UserDirectoryPage />
          </ProtectedRoute>
        } />
        <Route path="/events/:id/judging" element={
          <ProtectedRoute>
            <JudgingPage />
          </ProtectedRoute>
        } />
      </Routes>
    </MainLayout>
  );
}

export default App;
