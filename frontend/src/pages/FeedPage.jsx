import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PostCard from '../components/posts/PostCard';
import CreatePost from '../components/posts/CreatePost';
import './FeedPage.css';

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, usersRes, eventsRes] = await Promise.all([
          api.get('/posts'),
          api.get('/users'),
          api.get('/events')
        ]);
        setPosts(postsRes.data);
        setSuggestedUsers(usersRes.data.slice(0, 4));
        setUpcomingEvents(eventsRes.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePostCreated = (newPost) => setPosts(prev => [newPost, ...prev]);
  const handlePostDeleted = (id) => setPosts(prev => prev.filter(p => p._id !== id));
  const handlePostUpdated = (updatedPost) => setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));

  const handleConnect = async (userId) => {
    try {
      await api.post(`/users/${userId}/connect`);
      setSuggestedUsers(prev => prev.filter(u => u._id !== userId));
    } catch {}
  };

  if (loading) return <div className="spinner"><div className="spinner-circle"></div></div>;

  return (
    <div className="feed-layout">
      {/* Main feed */}
      <div className="feed-main">
        <CreatePost onPostCreated={handlePostCreated} />
        {posts.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-stream"></i>
            <h3>No posts yet</h3>
            <p>Be the first to share something with your peers!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} onDelete={handlePostDeleted} onUpdate={handlePostUpdated} />
          ))
        )}
      </div>

      {/* Right sidebar */}
      <div className="feed-sidebar">
        {/* Profile quick view */}
        <div className="card feed-profile-card">
          <Link to={`/profile/${user?._id}`} className="feed-profile-link">
            <div className="avatar" style={{ width: 52, height: 52, fontSize: 20, margin: '0 auto 12px' }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <h3>{user?.name}</h3>
            <p>{user?.department || 'Add your department'}</p>
            <p>{user?.year || ''}</p>
          </Link>
          <div className="profile-stats">
            <div><strong>{user?.connections?.length || 0}</strong><span>Connections</span></div>
            <div><strong>{user?.skills?.length || 0}</strong><span>Skills</span></div>
          </div>
          <Link to="/profile/edit" className="btn btn-outline btn-sm btn-full" style={{ marginTop: 12 }}>
            <i className="fas fa-edit"></i> Edit Profile
          </Link>
        </div>

        {/* Suggested connections */}
        {suggestedUsers.length > 0 && (
          <div className="card">
            <h3 className="sidebar-section-title"><i className="fas fa-user-plus"></i> Suggested Connections</h3>
            <div className="suggested-list">
              {suggestedUsers.map(u => (
                <div key={u._id} className="suggested-user">
                  <Link to={`/profile/${u._id}`} className="suggested-info">
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                      {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="suggested-name">{u.name}</span>
                      <span className="suggested-dept">{u.department} · {u.year}</span>
                    </div>
                  </Link>
                  <button className="btn btn-outline btn-sm" onClick={() => handleConnect(u._id)}>Connect</button>
                </div>
              ))}
            </div>
            <Link to="/explore" className="btn btn-outline btn-sm btn-full" style={{ marginTop: 12 }}>
              See All Students
            </Link>
          </div>
        )}

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <div className="card">
            <h3 className="sidebar-section-title"><i className="fas fa-calendar-alt"></i> Upcoming Events</h3>
            <div className="sidebar-events">
              {upcomingEvents.map(ev => (
                <div key={ev._id} className="sidebar-event">
                  <div className="sidebar-event-date">
                    <span>{new Date(ev.date).toLocaleDateString('en',{month:'short'})}</span>
                    <strong>{new Date(ev.date).getDate()}</strong>
                  </div>
                  <div>
                    <span className="sidebar-event-name">{ev.title}</span>
                    <span className="sidebar-event-loc"><i className="fas fa-map-marker-alt"></i> {ev.location}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/events" className="btn btn-outline btn-sm btn-full" style={{ marginTop: 12 }}>
              View All Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
