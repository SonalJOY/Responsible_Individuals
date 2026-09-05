import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export default function EventCard({ event, onRegisterClick }) {
  const {
    title,
    date,
    start_time,
    venue,
    city,
    capacity,
    registered_count,
    is_full,
    focus_area_name,
    description
  } = event;

  // Format date
  const eventDate = new Date(date);
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();

  return (
    <div className="card event-card-root">
      <div className="event-date-col">
        <span className="event-month">{month}</span>
        <span className="event-day">{day}</span>
      </div>

      <div className="event-content-col">
        {focus_area_name && (
          <span className="event-area-pill">{focus_area_name}</span>
        )}
        <h3 className="event-title">{title}</h3>
        
        <p className="event-desc">{description.slice(0, 110)}...</p>

        <div className="event-meta-row">
          <div className="meta-item">
            <Clock size={14} />
            <span>{start_time.slice(0, 5)} onwards</span>
          </div>
          <div className="meta-item">
            <MapPin size={14} />
            <span>{venue}, {city}</span>
          </div>
          <div className="meta-item">
            <Users size={14} />
            <span>{registered_count} / {capacity} registered</span>
          </div>
        </div>
      </div>

      <div className="event-action-col">
        <button
          onClick={() => onRegisterClick(event)}
          disabled={is_full}
          className={`btn ${is_full ? 'btn-secondary' : 'btn-primary'} btn-sm event-reg-btn`}
        >
          {is_full ? 'Event Full' : 'Register Free'}
        </button>
      </div>

      <style>{`
        .event-card-root {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          gap: 1.5rem;
          align-items: flex-start;
          background: #FFFFFF;
        }
        @media (min-width: 768px) {
          .event-card-root {
            flex-direction: row;
            align-items: center;
          }
        }
        .event-date-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 68px;
          height: 68px;
          border-radius: var(--radius-md);
          background: var(--primary-50);
          border: 1px solid var(--primary-100);
          flex-shrink: 0;
        }
        .event-month {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--primary-800);
          letter-spacing: 0.05em;
        }
        .event-day {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1;
          color: var(--primary-900);
        }
        .event-content-col {
          flex: 1;
        }
        .event-area-pill {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary-700);
          background: var(--primary-50);
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-pill);
          margin-bottom: 0.35rem;
        }
        .event-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
          color: var(--slate-900);
        }
        .event-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          line-height: 1.45;
        }
        .event-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          font-size: 0.8rem;
          color: var(--slate-600);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .event-action-col {
          align-self: flex-start;
        }
        @media (min-width: 768px) {
          .event-action-col {
            align-self: center;
          }
        }
        .event-reg-btn {
          min-width: 120px;
        }
      `}</style>
    </div>
  );
}
