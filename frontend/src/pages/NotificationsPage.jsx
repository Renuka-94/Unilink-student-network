import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const notifIcons = {
  connection_request: { icon: 'fa-user-plus', color: 'var(--primary)' },
  connection_accepted: { icon: 'fa-user-check', color: 'var(--accent)' },
  post_like: { icon: 'fa-heart', color: '#f472b6' },
  post_comment: { icon: 'fa-comment', color: 'var(--secondary)' },
  event_reminder: { icon: 'fa-bell', color: 'var(--secondary)' },
  group_invite: { icon: 'fa-users', color: 'var(--primary)' },
  new_post: { icon: 'fa-edit', color: 'var(--accent)' },
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [notifRes, userRes] = await Promise.all([
        api.get('/notifications'),
        api.get(`/users/${user._id}`)
      ]);
      setNotifications(notifRes.data);
      const pending = userRes.data.connectionRequests?.filter(r => r.status === 'pending') || [];
      setPendingRequests(pending);
    } catch {}
    setLoading(false);
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleRespond = async (fromId, action) => {
    try {
      await api.put(`/users/${fromId}/respond`, { action });
      setPendingRequests(prev => prev.filter(r => r.from?._id !== fromId && r.from !== fromId));
      fetchAll();
    } catch {}
  };

  if (loading) return <div className="spinner"><div className="spinner-circle"></div></div>;

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1>🔔 Notifications {unread > 0 && <span className="badge badge-danger" style={{fontSize:14,marginLeft:8}}>{unread}</span>}</h1>
          <p>Stay updated with your campus activities</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAllRead}><i className="fas fa-check-double"></i> Mark All Read</button>
        )}
      </div>

      {/* Connection Requests */}
      {pendingRequests.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily:'Sora', fontSize:16, marginBottom:16 }}><i className="fas fa-user-plus" style={{color:'var(--primary)',marginRight:8}}></i>Connection Requests ({pendingRequests.length})</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {pendingRequests.map((req, i) => {
              const from = req.from;
              const fromId = from?._id || from;
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                  <Link to={`/profile/${fromId}`} style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none', color:'inherit' }}>
                    <div className="avatar" style={{ width:44, height:44, fontSize:16 }}>
                      {from?.avatar ? <img src={from.avatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} /> : from?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <span style={{ display:'block', fontWeight:600, fontSize:15 }}>{from?.name || 'Unknown'}</span>
                      <span style={{ display:'block', fontSize:12, color:'var(--text-muted)' }}>{from?.department || ''} {from?.year || ''}</span>
                    </div>
                  </Link>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleRespond(fromId, 'accept')}><i className="fas fa-check"></i> Accept</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleRespond(fromId, 'reject')}><i className="fas fa-times"></i> Decline</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="empty-state"><i className="fas fa-bell-slash"></i><h3>No notifications yet</h3><p>You'll see updates here as you interact with the platform</p></div>
      ) : (
        <div className="card">
          <div style={{ display:'flex', flexDirection:'column' }}>
            {notifications.map((notif, i) => {
              const { icon, color } = notifIcons[notif.type] || { icon:'fa-bell', color:'var(--primary)' };
              return (
                <div key={notif._id} style={{
                  display:'flex', gap:14, padding:'16px 0',
                  borderBottom: i < notifications.length-1 ? '1px solid var(--border)' : 'none',
                  background: notif.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                  borderRadius: 8, margin: '0 -8px', padding: '16px 8px'
                }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:`${color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <i className={`fas ${icon}`} style={{ color, fontSize:16 }}></i>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                      <p style={{ fontSize:14, lineHeight:1.5 }}>
                        {notif.sender && (
                          <Link to={`/profile/${notif.sender._id}`} style={{ fontWeight:600, color:'var(--primary-light)', textDecoration:'none' }}>
                            {notif.sender.name}{' '}
                          </Link>
                        )}
                        {notif.message.replace(notif.sender?.name || '', '').trim()}
                      </p>
                      {!notif.isRead && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)', flexShrink:0, marginTop:6 }}></div>}
                    </div>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{timeAgo(notif.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
