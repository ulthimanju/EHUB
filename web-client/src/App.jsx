import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import EventCreatePage from './pages/EventCreatePage';
import EventDetailsPage from './pages/EventDetailsPage';
import EventEditPage from './pages/EventEditPage';
import WebSocketService from './services/WebSocketService';
import { LoadingProvider } from './contexts/LoadingContext';
import LoadingOverlay from './components/ui/LoadingOverlay';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

const App = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    WebSocketService.connect(
      () => console.log('WebSocket Connected'),
      (err) => console.error('WebSocket Error', err)
    );

    WebSocketService.registerCallback('/topic/notifications', (data) => {
      setNotification(data);
      setTimeout(() => setNotification(null), 5000);
    });

    return () => WebSocketService.disconnect();
  }, []);

  return (
    <LoadingProvider>
      <Router>
        <LoadingOverlay />
        <Navbar />
        {notification && (
          <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 border border-orange-200 z-50 animate-in slide-in-from-right flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-gray-900">Notification</h4>
              <p className="font-body text-sm text-gray-600">{notification.content || "New Message Received"}</p>
            </div>
          </div>
        )}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
          .font-heading { font-family: 'Space Grotesk', sans-serif; }
          .font-body { font-family: 'Inter', sans-serif; }
          .font-mono { font-family: 'JetBrains Mono', monospace; }
        `}</style>

        <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            } />
            <Route path="/events/new" element={
              <ProtectedRoute>
                <EventCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/events/:id/edit" element={
              <ProtectedRoute>
                <EventEditPage />
              </ProtectedRoute>
            } />
            <Route path="/events/:id" element={
              <ProtectedRoute>
                <EventDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/create-event" element={<Navigate to="/events/new" replace />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </LoadingProvider>
  );
};

export default App;

