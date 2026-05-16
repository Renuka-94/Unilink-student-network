import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './EventsPage.css';

const categories = ['all','hackathon','workshop','seminar','cultural','sports','placement','club','other'];
const catColors = { hackathon:'primary', workshop:'success', seminar:'primary', cultural:'warning', sports:'success', placement:'warning', club:'primary', other:'primary' };

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [registering, setRegistering] = useState({});
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', date:'', location:'', category:'workshop', maxCapacity:100 });
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchEvents(); }, [category]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events', { params: { category } });
      setEvents(res.data);
      setMyRegistrations(res.data.filter(e => e.registeredStudents?.includes(user._id)).map(e => e._id));
    } catch {}
    setLoading(false);
  };

  const handleRegister = async (eventId) => {
    const isReg = myRegistrations.includes(eventId);
    setRegistering(prev => ({ ...prev, [eventId]: true }));
    try {
      if (isReg) {
        await api.put(`/events/${eventId}/unregister`);
        setMyRegistrations(prev => prev.filter(id => id !== eventId));
      } else {
        await api.put(`/events/${eventId}/register`);
        setMyRegistrations(prev => [...prev, eventId]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
    setRegistering(prev => ({ ...prev, [eventId]: false }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/events', form);
      setMsg(user.role === 'admin' ? 'Event created!' : 'Event submitted for admin approval!');
      setShowForm(false);
      fetchEvents();
      setForm({ title:'', description:'', date:'', location:'', category:'workshop', maxCapacity:100 });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error creating event');
    }
    setFormLoading(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>🗓️ Campus Events</h1>
          <p>Discover workshops, hackathons, and more happening around campus</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="fas fa-plus"></i> {showForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {msg && <div className={`alert ${msg.includes('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {/* Create Event Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20, fontFamily:'Sora' }}>Create New Event</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label>Event Title *</label>
                <input className="form-control" value={form.title} onChange={e => setForm({...form, title:e.target.value})} required placeholder="Campus Hackathon 2024" />
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label>Description *</label>
                <textarea className="form-control" value={form.description} onChange={e => setForm({...form, description:e.target.value})} required placeholder="Event description..." rows={3} />
              </div>
              <div className="form-group">
                <label>Date & Time *</label>
                <input className="form-control" type="datetime-local" value={form.date} onChange={e => setForm({...form, date:e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input className="form-control" value={form.location} onChange={e => setForm({...form, location:e.target.value})} required placeholder="Main Auditorium" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                  {categories.filter(c=>c!=='all').map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Max Capacity</label>
                <input className="form-control" type="number" value={form.maxCapacity} onChange={e => setForm({...form, maxCapacity:e.target.value})} min={1} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={formLoading}>
              {formLoading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-calendar-plus"></i> Submit Event</>}
            </button>
          </form>
        </div>
      )}

      {/* Category tabs */}
      <div className="tabs">
        {categories.map(c => (
          <button key={c} className={`tab ${category===c?'active':''}`} onClick={() => setCategory(c)}>
            {c.charAt(0).toUpperCase()+c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner"><div className="spinner-circle"></div></div> : (
        events.length === 0 ? (
          <div className="empty-state"><i className="fas fa-calendar-times"></i><h3>No events found</h3><p>Check back later or create one!</p></div>
        ) : (
          <div className="events-grid">
            {events.map(ev => {
              const isReg = myRegistrations.includes(ev._id);
              const isFull = ev.registeredStudents?.length >= ev.maxCapacity;
              const isPast = new Date(ev.date) < new Date();
              return (
                <div key={ev._id} className="event-card card">
                  <div className="event-card-header">
                    <span className={`badge badge-${catColors[ev.category]||'primary'}`}>{ev.category}</span>
                    {isPast && <span className="badge badge-danger">Past</span>}
                  </div>
                  <h3 className="event-title">{ev.title}</h3>
                  <p className="event-desc">{ev.description}</p>
                  <div className="event-meta">
                    <span><i className="fas fa-calendar"></i> {new Date(ev.date).toLocaleDateString('en',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</span>
                    <span><i className="fas fa-clock"></i> {new Date(ev.date).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}</span>
                    <span><i className="fas fa-map-marker-alt"></i> {ev.location}</span>
                    <span><i className="fas fa-users"></i> {ev.registeredStudents?.length || 0}/{ev.maxCapacity}</span>
                  </div>
                  {!isPast && (
                    <button
                      className={`btn btn-sm btn-full ${isReg ? 'btn-danger' : isFull ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => handleRegister(ev._id)}
                      disabled={registering[ev._id] || (isFull && !isReg)}
                      style={{ marginTop: 16 }}
                    >
                      {registering[ev._id] ? <i className="fas fa-spinner fa-spin"></i>
                        : isReg ? <><i className="fas fa-times"></i> Unregister</>
                        : isFull ? 'Event Full'
                        : <><i className="fas fa-ticket-alt"></i> Register</>}
                    </button>
                  )}
                  {isReg && !isPast && <div style={{ textAlign:'center', marginTop:8, fontSize:12, color:'var(--accent)' }}><i className="fas fa-check-circle"></i> You're registered!</div>}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default EventsPage;
