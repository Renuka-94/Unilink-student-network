import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PostCard from '../components/posts/PostCard';
import './ProfilePage.css';

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [connectStatus, setConnectStatus] = useState('none'); // none, pending, connected

  const isOwn = id === user?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (id === 'edit') { navigate('/profile/edit'); return; }
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get('/posts')
        ]);
        setProfile(profileRes.data);
        const userPosts = postsRes.data.filter(p => p.user?._id === id);
        setPosts(userPosts);

        // Check connection status
        if (!isOwn) {
          const isConnected = profileRes.data.connections?.some(c => c._id === user?._id || c === user?._id);
          setConnectStatus(isConnected ? 'connected' : 'none');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleConnect = async () => {
    try {
      await api.post(`/users/${id}/connect`);
      setConnectStatus('pending');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  if (loading) return <div className="spinner"><div className="spinner-circle"></div></div>;
  if (!profile) return <div className="empty-state"><h3>User not found</h3></div>;

  return (
    <div className="profile-page">
      {/* Cover & Avatar */}
      <div className="profile-cover">
        <div className="profile-cover-bg"></div>
        <div className="profile-avatar-wrap">
          <div className="avatar profile-avatar">
            {profile.avatar
              ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : profile.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="profile-content">
        {/* Info */}
        <div className="profile-info-card card">
          <div className="profile-info-header">
            <div>
              <h1 className="profile-name">{profile.name}</h1>
              <p className="profile-dept">{profile.department} {profile.year ? `· ${profile.year}` : ''}</p>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            </div>
            <div className="profile-actions">
              {isOwn ? (
                <button className="btn btn-primary" onClick={() => navigate('/profile/edit')}>
                  <i className="fas fa-edit"></i> Edit Profile
                </button>
              ) : (
                <button
                  className={`btn ${connectStatus === 'connected' ? 'btn-success' : connectStatus === 'pending' ? 'btn-outline' : 'btn-primary'}`}
                  onClick={handleConnect}
                  disabled={connectStatus !== 'none'}
                >
                  {connectStatus === 'connected' && <><i className="fas fa-user-check"></i> Connected</>}
                  {connectStatus === 'pending' && <><i className="fas fa-clock"></i> Request Sent</>}
                  {connectStatus === 'none' && <><i className="fas fa-user-plus"></i> Connect</>}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div><strong>{posts.length}</strong><span>Posts</span></div>
            <div><strong>{profile.connections?.length || 0}</strong><span>Connections</span></div>
            <div><strong>{profile.skills?.length || 0}</strong><span>Skills</span></div>
          </div>
        </div>

        <div className="profile-main">
          {/* Left column */}
          <div className="profile-sidebar-left">
            {profile.skills?.length > 0 && (
              <div className="card">
                <h3 className="profile-section-title"><i className="fas fa-code"></i> Skills</h3>
                <div className="skills-grid">
                  {profile.skills.map(skill => <span key={skill} className="badge badge-primary skill-badge">{skill}</span>)}
                </div>
              </div>
            )}
            {profile.interests?.length > 0 && (
              <div className="card">
                <h3 className="profile-section-title"><i className="fas fa-heart"></i> Interests</h3>
                <div className="skills-grid">
                  {profile.interests.map(i => <span key={i} className="badge badge-success skill-badge">{i}</span>)}
                </div>
              </div>
            )}
            {profile.achievements?.length > 0 && (
              <div className="card">
                <h3 className="profile-section-title"><i className="fas fa-trophy"></i> Achievements</h3>
                <ul className="achievements-list">
                  {profile.achievements.map((ach, i) => (
                    <li key={i}><i className="fas fa-star"></i>{ach}</li>
                  ))}
                </ul>
              </div>
            )}
            {profile.connections?.length > 0 && (
              <div className="card">
                <h3 className="profile-section-title"><i className="fas fa-users"></i> Connections ({profile.connections.length})</h3>
                <div className="connections-grid">
                  {profile.connections.slice(0, 8).map(conn => (
                    <div key={conn._id} className="connection-chip" onClick={() => navigate(`/profile/${conn._id}`)}>
                      <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                        {conn.avatar ? <img src={conn.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : conn.name?.[0]?.toUpperCase()}
                      </div>
                      <span>{conn.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Posts */}
          <div className="profile-posts">
            <div className="tabs" style={{ marginBottom: 20 }}>
              <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
                <i className="fas fa-th"></i> Posts ({posts.length})
              </button>
            </div>
            {posts.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-edit"></i>
                <h3>No posts yet</h3>
                <p>{isOwn ? 'Share your first post!' : `${profile.name} hasn't posted yet`}</p>
              </div>
            ) : (
              posts.map(post => <PostCard key={post._id} post={post} onDelete={id => setPosts(prev => prev.filter(p => p._id !== id))} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
