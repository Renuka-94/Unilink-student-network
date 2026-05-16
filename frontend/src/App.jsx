import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ExplorePage from './pages/ExplorePage';
import EventsPage from './pages/EventsPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';

// Layout
import Sidebar from './components/layout/Sidebar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner"><div className="spinner-circle"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner"><div className="spinner-circle"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : children;
};

const AppLayout = ({ children }) => (
  <div className="layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
      <Route path="/" element={<PrivateRoute><AppLayout><FeedPage /></AppLayout></PrivateRoute>} />
      <Route path="/profile/:id" element={<PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>} />
      <Route path="/profile/edit" element={<PrivateRoute><AppLayout><EditProfilePage /></AppLayout></PrivateRoute>} />
      <Route path="/explore" element={<PrivateRoute><AppLayout><ExplorePage /></AppLayout></PrivateRoute>} />
      <Route path="/events" element={<PrivateRoute><AppLayout><EventsPage /></AppLayout></PrivateRoute>} />
      <Route path="/groups" element={<PrivateRoute><AppLayout><GroupsPage /></AppLayout></PrivateRoute>} />
      <Route path="/groups/:id" element={<PrivateRoute><AppLayout><GroupDetailPage /></AppLayout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><AppLayout><NotificationsPage /></AppLayout></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AppLayout><AdminPage /></AppLayout></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
