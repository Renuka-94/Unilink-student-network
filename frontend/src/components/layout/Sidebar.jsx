import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchNotifCount = async () => {
      try {
        const res = await api.get('/notifications');
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      } catch {}
    };
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/', icon: 'fa-home', label: 'Feed', exact: true },
    { to: '/explore', icon: 'fa-search', label: 'Explore' },
    { to: '/events', icon: 'fa-calendar-alt', label: 'Events' },
    { to: '/groups', icon: 'fa-users', label: 'Groups' },
    { to: '/notifications', icon: 'fa-bell', label: 'Notifications', badge: unreadCount },
    { to: `/profile/${user?._id}`, icon: 'fa-user', label: 'My Profile' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', icon: 'fa-shield-alt', label: 'Admin', admin: true });
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
        <i className={`fas fa-${mobileOpen ? 'times' : 'bars'}`}></i>
      </button>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon"><i className="fas fa-link"></i></div>
          <div>
            <span className="logo-text">UniLink</span>
            <span className="logo-sub">Student Network</span>
          </div>
        </div>

        {/* User info */}
        <div className="sidebar-user" onClick={() => { navigate(`/profile/${user?._id}`); setMobileOpen(false); }}>
          <div className="avatar" style={{ width: 42, height: 42, fontSize: 16 }}>
            {user?.avatar ? <img src={user.avatar} alt={user.name} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} /> : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-dept">{user?.department || 'Add department'}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${item.admin ? 'admin-link' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile/edit" className="nav-item" onClick={() => setMobileOpen(false)}>
            <i className="fas fa-cog"></i><span>Edit Profile</span>
          </NavLink>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i><span>Logout</span>
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
