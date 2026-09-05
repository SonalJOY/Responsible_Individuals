import React, { useEffect, useState } from 'react';
import { eventService } from '../../services/api';
import EventCard from '../../components/common/EventCard';
import Modal from '../../components/common/Modal';
import { Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    is_volunteer: false,
    notes: '',
  });

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleOpenRegister = (ev) => {
    setSelectedEvent(ev);
    setRegistered(false);
    setModalOpen(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setSubmitting(true);
    try {
      await eventService.registerEvent(selectedEvent.slug, formData);
      setRegistered(true);
      // Update local registered count
      setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, registered_count: ev.registered_count + 1 } : ev));
    } catch (err) {
      console.error(err);
      alert('Registration failed. You may already be registered with this email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="events-page-root">
      <section className="events-hero">
        <div className="container">
          <span className="section-badge">Participate</span>
          <h1 className="events-hero-title">Upcoming Drives & Orientations</h1>
          <p className="events-hero-subtitle">
            Join your neighbors, fellow volunteers, and environmental scientists on the ground for weekend restoration activities.
          </p>
        </div>
      </section>

      <section className="section bg-light-alt">
        <div className="container-narrow">
          <div className="events-list-wrap">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} onRegisterClick={handleOpenRegister} />
            ))}
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={registered ? 'Spot Confirmed!' : `Register: ${selectedEvent?.title || ''}`}
      >
        {registered ? (
          <div className="registration-success-box">
            <CheckCircle2 size={48} color="#10B981" />
            <h3 style={{ margin: '1rem 0 0.5rem 0' }}>You're Registered!</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
              We have reserved your spot for <strong>{selectedEvent?.title}</strong> on {selectedEvent?.date}. We have sent confirmation details to <strong>{formData.email}</strong>.
            </p>
            <button onClick={() => setModalOpen(false)} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="event-modal-info">
              <div className="modal-info-line"><Calendar size={15} /> <span>{selectedEvent?.date}</span></div>
              <div className="modal-info-line"><Clock size={15} /> <span>{selectedEvent?.start_time} onwards</span></div>
              <div className="modal-info-line"><MapPin size={15} /> <span>{selectedEvent?.venue}, {selectedEvent?.city}</span></div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Arun Kumar"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                placeholder="arun@example.com"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="is_volunteer_cb"
                checked={formData.is_volunteer}
                onChange={(e) => setFormData({ ...formData, is_volunteer: e.target.checked })}
              />
              <label htmlFor="is_volunteer_cb" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                I am interested in joining as an ongoing volunteer
              </label>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              {submitting ? 'Confirming Spot...' : 'Confirm Free Registration'}
            </button>
          </form>
        )}
      </Modal>

      <style>{`
        .events-hero {
          background: linear-gradient(135deg, #091712 0%, #0F4C3A 100%);
          color: white;
          padding: 5rem 0 4rem 0;
          text-align: center;
        }
        .events-hero .section-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.4);
        }
        .events-hero-title {
          color: white;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        .events-hero-subtitle {
          font-size: 1.15rem;
          color: #CBD5E1;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .events-list-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .event-modal-info {
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .modal-info-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.825rem;
          color: var(--slate-700);
        }
        .registration-success-box {
          text-align: center;
          padding: 1.5rem 0;
        }
      `}</style>
    </div>
  );
}
