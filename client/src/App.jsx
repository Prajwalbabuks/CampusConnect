import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminCreateEventPage from './pages/AdminCreateEventPage';
import AdminEditEventPage from './pages/AdminEditEventPage';
import AdminParticipantsPage from './pages/AdminParticipantsPage';
import SuperAdminUsersPage from './pages/SuperAdminUsersPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

function ProtectedRoute({ children, role, superAdmin = false }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />;
  }

  if (superAdmin && user?.isSuperAdmin !== true) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />;
  }

  return children;
}

function StudentRoute({ children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Administrators cannot access student-only pass and registration pages
  if (user?.role === 'admin') {
    return <Navigate to="/admin/events" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public & Preview Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Authenticated Student Routes */}
          <Route
            path="/my-registrations"
            element={
              <StudentRoute>
                <MyRegistrationsPage />
              </StudentRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Administrator Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute role="admin">
                <AdminEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <ProtectedRoute role="admin">
                <AdminCreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/edit/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminEditEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:id/participants"
            element={
              <ProtectedRoute role="admin">
                <AdminParticipantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin" superAdmin>
                <SuperAdminUsersPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
