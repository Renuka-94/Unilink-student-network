import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './AdminPage.css';

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, postsRes, eventsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/reported-posts'),
        api.get('/admin/pending-events')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setReportedPosts(postsRes.data);
      setPendingEvents(eventsRes.data);
    } catch {}
    setLoading(false);
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleToggleUser = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: res.data.isActive } : u));
      showMsg(res.data.message);
    } catch {}
  };

  const handleClearReport = async (postId) => {
    try {
      await api.put(`/admin/posts/${postId}/clear-report`);
      setReportedPosts(prev => prev.filter(p => p._id !== postId));
      showMsg('Report cleared');
    } catch {}
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      setReportedPosts(prev => prev.filter(p => p._id !== postId));
      showMsg('Post deleted');
    } catch {}
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await api.put(`/events/${eventId}/approve`);
      setPendingEvents(prev => prev.filter(e => e._id !== eventId));
      showMsg('Event approved!');
      fetchAll();
    } catch {}
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      setPendingEvents(prev => prev.filter(e => e._id !== eventId));
      showMsg('Event deleted');
    } catch {}
  };

  if (loading) return <div className="spinner"><div className="spinner-circle"></div></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1><i className="fas fa-shield-alt" style={{color:'var(--secondary)',marginRight:12}}></i>Admin Dashboard</h1>
        <p>Manage users, content, and platform activities</p>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {/* Stats */}
      {stats && (
        <div className="admin-stats">
          <div className="stat-card card">
            <div className="stat-icon" style={{background:'rgba(99,102,241,0.15)'}}><i className="fas fa-users" style={{color:'var(--primary)'}}></i></div>
            <div><strong>{stats.totalUsers}</strong><span>Total Students</span></div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{background:'rgba(16,185,129,0.15)'}}><i className="fas fa-edit" style={{color:'var(--accent)'}}></i></div>
            <div><strong>{stats.totalPosts}</strong><span>Total Posts</span></div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{background:'rgba(245,158,11,0.15)'}}><i className="fas fa-calendar" style={{color:'var(--secondary)'}}></i></div>
            <div><strong>{stats.totalEvents}</strong><span>Active Events</span></div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{background:'rgba(139,92,246,0.15)'}}><i className="fas fa-users" style={{color:'#a78bfa'}}></i></div>
            <div><strong>{stats.totalGroups}</strong><span>Groups</span></div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{background:'rgba(239,68,68,0.15)'}}><i className="fas fa-flag" style={{color:'var(--danger)'}}></i></div>
            <div><strong>{stats.reportedPosts}</strong><span>Reported Posts</span></div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{background:'rgba(245,158,11,0.15)'}}><i className="fas fa-clock" style={{color:'var(--secondary)'}}></i></div>
            <div><strong>{stats.pendingEvents}</strong><span>Pending Events</span></div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab==='overview'?'active':''}`} onClick={()=>setActiveTab('overview')}>Users ({users.length})</button>
        <button className={`tab ${activeTab==='reports'?'active':''}`} onClick={()=>setActiveTab('reports')}>
          Reported Posts {reportedPosts.length>0&&<span className="badge badge-danger" style={{marginLeft:6}}>{reportedPosts.length}</span>}
        </button>
        <button className={`tab ${activeTab==='events'?'active':''}`} onClick={()=>setActiveTab('events')}>
          Pending Events {pendingEvents.length>0&&<span className="badge badge-warning" style={{marginLeft:6}}>{pendingEvents.length}</span>}
        </button>
      </div>

      {/* Users tab */}
      {activeTab === 'overview' && (
        <div className="card">
          <div style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th><th>Email</th><th>Department</th><th>Year</th><th>Role</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className="avatar" style={{width:34,height:34,fontSize:13}}>
                          {u.avatar?<img src={u.avatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/>:u.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{fontWeight:500}}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{fontSize:13,color:'var(--text-muted)'}}>{u.email}</td>
                    <td style={{fontSize:13}}>{u.department || '–'}</td>
                    <td style={{fontSize:13}}>{u.year || '–'}</td>
                    <td><span className={`badge badge-${u.role==='admin'?'warning':'primary'}`}>{u.role}</span></td>
                    <td><span className={`badge badge-${u.isActive?'success':'danger'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                    <td>
                      {u.role !== 'admin' && (
                        <button className={`btn btn-sm ${u.isActive?'btn-danger':'btn-success'}`} onClick={()=>handleToggleUser(u._id)}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reported posts */}
      {activeTab === 'reports' && (
        reportedPosts.length === 0 ? (
          <div className="empty-state"><i className="fas fa-check-circle"></i><h3>No reported posts</h3><p>All clear!</p></div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {reportedPosts.map(post => (
              <div key={post._id} className="card">
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div className="avatar" style={{width:36,height:36,fontSize:13}}>
                    {post.user?.avatar?<img src={post.user.avatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/>:post.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <span style={{fontWeight:600,fontSize:14}}>{post.user?.name}</span>
                    <span style={{display:'block',fontSize:11,color:'var(--text-muted)'}}>{post.user?.email}</span>
                  </div>
                  <div className="badge badge-danger" style={{marginLeft:'auto'}}><i className="fas fa-flag"></i> Reported</div>
                </div>
                <p style={{fontSize:14,marginBottom:8,lineHeight:1.6}}>{post.content}</p>
                {post.reportReason && <p style={{fontSize:12,color:'var(--danger)',marginBottom:12}}>Reason: {post.reportReason}</p>}
                <div style={{display:'flex',gap:10}}>
                  <button className="btn btn-success btn-sm" onClick={()=>handleClearReport(post._id)}><i className="fas fa-check"></i> Clear Report</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>handleDeletePost(post._id)}><i className="fas fa-trash"></i> Delete Post</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Pending events */}
      {activeTab === 'events' && (
        pendingEvents.length === 0 ? (
          <div className="empty-state"><i className="fas fa-calendar-check"></i><h3>No pending events</h3><p>All events have been reviewed!</p></div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {pendingEvents.map(ev => (
              <div key={ev._id} className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
                  <div>
                    <h3 style={{fontFamily:'Sora',fontSize:18,marginBottom:6}}>{ev.title}</h3>
                    <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:10}}>{ev.description}</p>
                    <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                      <span style={{fontSize:13,color:'var(--text-muted)'}}><i className="fas fa-calendar" style={{color:'var(--primary)',marginRight:6}}></i>{new Date(ev.date).toLocaleDateString()}</span>
                      <span style={{fontSize:13,color:'var(--text-muted)'}}><i className="fas fa-map-marker-alt" style={{color:'var(--primary)',marginRight:6}}></i>{ev.location}</span>
                      <span style={{fontSize:13,color:'var(--text-muted)'}}><i className="fas fa-user" style={{color:'var(--primary)',marginRight:6}}></i>by {ev.organizer?.name}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button className="btn btn-success btn-sm" onClick={()=>handleApproveEvent(ev._id)}><i className="fas fa-check"></i> Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>handleDeleteEvent(ev._id)}><i className="fas fa-trash"></i> Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AdminPage;
