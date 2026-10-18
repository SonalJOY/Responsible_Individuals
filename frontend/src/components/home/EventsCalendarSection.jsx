import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight, 
  Sparkles, ArrowRight, CheckCircle2, Info, X
} from 'lucide-react';
import { upcomingEvents } from '../../data/eventsData';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function EventsCalendarSection() {
  // Calendar state: Initialized to October 2026 (matching our active events)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 9 = October (0-indexed)
  const [selectedEvent, setSelectedEvent] = useState(upcomingEvents[1]); // Default to Oct 10 STEM event

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselTrackRef = useRef(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate calendar grid dates
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: currentMonth === 0 ? 11 : currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        day: d,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }

    // Next month filler days to complete standard 35 or 42 grid cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let n = 1; n <= remaining; n++) {
      days.push({
        day: n,
        month: currentMonth === 11 ? 0 : currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Find events for the displayed month
  const monthEvents = useMemo(() => {
    return upcomingEvents.filter(
      (ev) => ev.year === currentYear && ev.month === currentMonth
    );
  }, [currentYear, currentMonth]);

  // Carousel navigation
  const maxCarouselIndex = Math.max(0, upcomingEvents.length - 1);

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextCarousel = () => {
    setCarouselIndex((prev) => Math.min(maxCarouselIndex, prev + 1));
  };

  return (
    <section className="events-calendar-root" aria-label="Upcoming Events, Monthly Calendar, and Community Drives">
      <div className="container">
        {/* Section Header */}
        <div className="events-section-header">
          <div className="events-eyebrow">
            <CalendarIcon size={14} className="text-accent" />
            <span>Community Drives &amp; Orientations</span>
          </div>

          <h2 className="events-section-title">
            Upcoming Drives &amp; Monthly Calendar
          </h2>

          <p className="events-section-subtitle">
            Explore our scheduled grassroots volunteer drives and orientations on the ground. Check the monthly calendar overview or browse the upcoming event showcase.
          </p>
        </div>

        {/* 1. IMAGE-BASED UPCOMING EVENTS CAROUSEL (Requirement 7) */}
        <div className="events-carousel-block">
          <div className="carousel-top-bar">
            <div className="carousel-title-group">
              <span className="carousel-subhead">FEATURED UPCOMING ENGAGEMENTS</span>
              <h3 className="carousel-heading">Image-Led Drives Showcase</h3>
            </div>

            <div className="carousel-controls">
              <button 
                type="button" 
                onClick={handlePrevCarousel}
                disabled={carouselIndex === 0}
                className="carousel-nav-btn"
                aria-label="Previous event in carousel"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="carousel-index-counter">
                {carouselIndex + 1} / {upcomingEvents.length}
              </span>
              <button 
                type="button" 
                onClick={handleNextCarousel}
                disabled={carouselIndex >= maxCarouselIndex}
                className="carousel-nav-btn"
                aria-label="Next event in carousel"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Carousel Slide Track */}
          <div className="carousel-track-container" ref={carouselTrackRef}>
            <div 
              className="carousel-slider-track"
              style={{
                transform: `translateX(-${carouselIndex * 100}%)`,
              }}
            >
              {upcomingEvents.map((event) => (
                <div key={event.id} className="carousel-slide">
                  <div className="carousel-event-card">
                    {/* Event Photograph Banner */}
                    <div className="event-card-media">
                      <img
                        src={event.image}
                        alt={event.imageAlt}
                        className="event-banner-img"
                        loading="lazy"
                      />
                      <div className="event-banner-overlay" aria-hidden="true" />
                      <div className="event-banner-badges">
                        <span className="event-category-badge">{event.category}</span>
                        <span className="event-focus-badge">{event.focusArea}</span>
                      </div>
                    </div>

                    {/* Event Card Content */}
                    <div className="event-card-body">
                      <div className="event-card-date-line">
                        <CalendarIcon size={15} className="text-accent" />
                        <strong>{event.displayDate}</strong>
                        <span className="event-time-sep">•</span>
                        <Clock size={15} className="text-accent" />
                        <span>{event.time}</span>
                      </div>

                      <h4 className="event-card-title">
                        <Link to={event.link}>{event.title}</Link>
                      </h4>

                      <p className="event-card-description">
                        {event.description}
                      </p>

                      <div className="event-card-meta-bar">
                        <div className="event-meta-item">
                          <MapPin size={15} className="text-blue" />
                          <span>{event.venue}, {event.city}</span>
                        </div>
                        <div className="event-meta-item">
                          <Users size={15} className="text-blue" />
                          <span>{event.registered_count} / {event.capacity} spots filled</span>
                        </div>
                      </div>

                      <div className="event-card-footer">
                        <Link to={event.link} className="btn-participate-link">
                          <span>Register on Get Involved Page</span>
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="carousel-dots-row">
            {upcomingEvents.map((ev, i) => (
              <button
                key={ev.id}
                type="button"
                className={`carousel-dot ${i === carouselIndex ? 'is-active' : ''}`}
                onClick={() => setCarouselIndex(i)}
                aria-label={`Go to slide ${i + 1}: ${ev.title}`}
              />
            ))}
          </div>
        </div>

        {/* 2. MONTHLY EVENTS CALENDAR (Requirement 6) */}
        <div className="monthly-calendar-block">
          <div className="calendar-glass-panel">
            {/* Calendar Controls & Month Header */}
            <div className="calendar-header-bar">
              <div className="calendar-month-title-wrap">
                <span className="calendar-kicker">MONTHLY OVERVIEW</span>
                <h3 className="calendar-month-heading">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
              </div>

              <div className="calendar-nav-actions">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="calendar-nav-btn"
                  aria-label="Navigate to previous month"
                >
                  <ChevronLeft size={18} />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMonth(9); // October
                    setCurrentYear(2026);
                  }}
                  className="calendar-today-btn"
                >
                  Current Drives
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="calendar-nav-btn"
                  aria-label="Navigate to next month"
                >
                  <span>Next</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="calendar-weekdays-row" aria-hidden="true">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="calendar-weekday-cell">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="calendar-days-grid" role="grid" aria-label={`Calendar grid for ${MONTH_NAMES[currentMonth]} ${currentYear}`}>
              {calendarDays.map((dateObj, idx) => {
                const eventForDay = upcomingEvents.find(
                  (ev) => ev.year === dateObj.year && ev.month === dateObj.month && ev.day === dateObj.day
                );
                const isSelected = selectedEvent && selectedEvent.id === eventForDay?.id;

                return (
                  <div
                    key={`${dateObj.year}-${dateObj.month}-${dateObj.day}-${idx}`}
                    className={`calendar-date-cell ${
                      !dateObj.isCurrentMonth ? 'is-outside-month' : ''
                    } ${eventForDay ? 'has-event' : ''} ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      if (eventForDay) setSelectedEvent(eventForDay);
                    }}
                    onKeyDown={(e) => {
                      if (eventForDay && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setSelectedEvent(eventForDay);
                      }
                    }}
                    tabIndex={eventForDay ? 0 : -1}
                    role="gridcell"
                    aria-label={`${dateObj.day} ${MONTH_NAMES[dateObj.month]} ${dateObj.year}${
                      eventForDay ? `: ${eventForDay.title}. Press Enter to view details.` : ''
                    }`}
                  >
                    <div className="date-number-row">
                      <span className="date-number">{dateObj.day}</span>
                      {eventForDay && (
                        <span className="event-visual-marker" title="Event Scheduled">
                          <span className="marker-dot" aria-hidden="true" />
                          <span className="marker-label">Drive</span>
                        </span>
                      )}
                    </div>

                    {/* Event Pill Preview on Desktop */}
                    {eventForDay && (
                      <div className="calendar-event-preview-pill">
                        <span className="preview-pill-title">{eventForDay.title}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty Month Graceful Notice */}
            {monthEvents.length === 0 && (
              <div className="calendar-empty-month-notice">
                <Info size={18} className="empty-notice-icon" />
                <div className="empty-notice-text">
                  <strong>No public volunteer drives scheduled for {MONTH_NAMES[currentMonth]} {currentYear}.</strong>
                  <span>Explore September or October 2026 for upcoming lake restorations and STEM workshops, or join our volunteer dispatch list.</span>
                </div>
                <Link to="/volunteer" className="empty-notice-btn">
                  Join Volunteer Network
                </Link>
              </div>
            )}

            {/* Selected Event Details Spotlight Card */}
            {selectedEvent && (
              <div className="calendar-selected-event-card">
                <div className="selected-event-header">
                  <div className="selected-badge-group">
                    <span className="selected-flag">SELECTED EVENT DETAILS</span>
                    <span className="selected-date-badge">
                      <CalendarIcon size={13} /> {selectedEvent.displayDate}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedEvent(null)}
                    className="close-details-btn"
                    aria-label="Close event details"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="selected-event-body-grid">
                  <div className="selected-event-thumb">
                    <img 
                      src={selectedEvent.image} 
                      alt={selectedEvent.imageAlt}
                      className="selected-img"
                    />
                  </div>

                  <div className="selected-event-info">
                    <h4 className="selected-title">{selectedEvent.title}</h4>
                    <p className="selected-desc">{selectedEvent.description}</p>
                    
                    <div className="selected-meta-row">
                      <div className="selected-meta-item">
                        <Clock size={14} className="text-accent" />
                        <span>{selectedEvent.time}</span>
                      </div>
                      <div className="selected-meta-item">
                        <MapPin size={14} className="text-accent" />
                        <span>{selectedEvent.venue}, {selectedEvent.city}</span>
                      </div>
                      <div className="selected-meta-item">
                        <Users size={14} className="text-accent" />
                        <span>{selectedEvent.registered_count} / {selectedEvent.capacity} volunteers registered</span>
                      </div>
                    </div>

                    <div className="selected-action-row">
                      <Link to={selectedEvent.link} className="btn-selected-register">
                        <span>Register on Get Involved Page</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .events-calendar-root {
          background-color: var(--surface, #FFFFFF);
          padding: 6.5rem 0;
          position: relative;
        }

        .events-section-header {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 4.5rem auto;
        }

        .events-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.25);
          color: var(--primary-saffron-hover, #EA580C);
          padding: 0.35rem 1.1rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }

        .events-section-title {
          font-family: var(--font-heading);
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 1rem;
        }

        @media (min-width: 768px) {
          .events-section-title {
            font-size: 3.2rem;
          }
        }

        .events-section-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary, #475569);
          line-height: 1.65;
        }

        /* 1. CAROUSEL STYLING */
        .events-carousel-block {
          background: var(--cream-50, #FDFBF7);
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-radius: 28px;
          padding: 2.5rem;
          margin-bottom: 4.5rem;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
        }

        @media (min-width: 768px) {
          .events-carousel-block {
            padding: 3rem 3.5rem;
          }
        }

        .carousel-top-bar {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 640px) {
          .carousel-top-bar {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }

        .carousel-subhead {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--primary-saffron, #F97316);
          text-transform: uppercase;
        }

        .carousel-heading {
          font-family: var(--font-heading);
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          margin-top: 0.25rem;
        }

        .carousel-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .carousel-nav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          color: var(--charcoal-900, #0F172A);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
        }

        .carousel-nav-btn:hover:not(:disabled) {
          background: var(--primary-saffron, #F97316);
          border-color: var(--primary-saffron, #F97316);
          color: #FFFFFF;
          transform: scale(1.05);
        }

        .carousel-nav-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .carousel-index-counter {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted, #64748B);
          min-width: 48px;
          text-align: center;
        }

        .carousel-track-container {
          overflow: hidden;
          width: 100%;
          border-radius: 20px;
        }

        .carousel-slider-track {
          display: flex;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
        }

        .carousel-slide {
          flex: 0 0 100%;
          width: 100%;
          box-sizing: border-box;
        }

        .carousel-event-card {
          display: grid;
          grid-template-columns: 1fr;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
        }

        @media (min-width: 992px) {
          .carousel-event-card {
            grid-template-columns: 440px 1fr;
          }
        }

        .event-card-media {
          position: relative;
          min-height: 260px;
          background: #0F172A;
          overflow: hidden;
        }

        .event-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }

        .carousel-event-card:hover .event-banner-img {
          transform: scale(1.04);
        }

        .event-banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.55) 100%);
          pointer-events: none;
        }

        .event-banner-badges {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          z-index: 2;
        }

        .event-category-badge {
          background: var(--primary-saffron, #F97316);
          color: #FFFFFF;
          font-size: 0.725rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-pill);
        }

        .event-focus-badge {
          background: rgba(255, 255, 255, 0.95);
          color: var(--charcoal-900, #0F172A);
          font-size: 0.725rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-pill);
        }

        .event-card-body {
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 1.25rem;
        }

        .event-card-date-line {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.9rem;
          color: var(--charcoal-900, #0F172A);
        }

        .event-time-sep {
          color: var(--text-muted, #94A3B8);
          margin: 0 0.25rem;
        }

        .event-card-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1.25;
          color: var(--charcoal-900, #0F172A);
        }

        .event-card-title a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .event-card-title a:hover {
          color: var(--primary-saffron, #F97316);
        }

        .event-card-description {
          font-size: 1rem;
          color: var(--text-secondary, #475569);
          line-height: 1.6;
        }

        .event-card-meta-bar {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: var(--cream-50, #FDFBF7);
          border: 1px solid var(--border-subtle, #E2E8F0);
          padding: 0.9rem 1.25rem;
          border-radius: 12px;
          font-size: 0.875rem;
        }

        @media (min-width: 640px) {
          .event-card-meta-bar {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .event-meta-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: var(--charcoal-800, #1E293B);
          font-weight: 600;
        }

        .text-blue {
          color: var(--secondary-light-blue-hover, #0284C7);
        }

        .btn-participate-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary-saffron, #F97316);
          color: #FFFFFF;
          padding: 0.8rem 1.6rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          transition: all 0.2s ease;
          align-self: flex-start;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }

        .btn-participate-link:hover {
          background: var(--primary-saffron-hover, #EA580C);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(249, 115, 22, 0.45);
        }

        .carousel-dots-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #CBD5E1;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .carousel-dot.is-active {
          width: 28px;
          border-radius: var(--radius-pill);
          background: var(--primary-saffron, #F97316);
        }

        /* 2. CALENDAR STYLING */
        .monthly-calendar-block {
          width: 100%;
        }

        .calendar-glass-panel {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-radius: 28px;
          padding: 2.25rem;
          box-shadow: 0 15px 40px rgba(15, 23, 42, 0.06);
        }

        @media (min-width: 768px) {
          .calendar-glass-panel {
            padding: 3rem;
          }
        }

        .calendar-header-bar {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle, #E2E8F0);
        }

        @media (min-width: 640px) {
          .calendar-header-bar {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }

        .calendar-kicker {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--secondary-light-blue-hover, #0284C7);
          text-transform: uppercase;
        }

        .calendar-month-heading {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          margin-top: 0.2rem;
        }

        .calendar-nav-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .calendar-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--cream-50, #FDFBF7);
          border: 1px solid var(--border-subtle, #E2E8F0);
          color: var(--charcoal-900, #0F172A);
          padding: 0.5rem 0.9rem;
          border-radius: var(--radius-pill);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calendar-nav-btn:hover {
          background: #FFFFFF;
          border-color: var(--primary-saffron, #F97316);
          color: var(--primary-saffron, #F97316);
        }

        .calendar-today-btn {
          background: var(--secondary-blue-light, #F0F9FF);
          border: 1px solid rgba(14, 165, 233, 0.3);
          color: var(--secondary-light-blue-hover, #0284C7);
          padding: 0.5rem 0.9rem;
          border-radius: var(--radius-pill);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calendar-today-btn:hover {
          background: var(--secondary-light-blue, #0EA5E9);
          color: #FFFFFF;
        }

        .calendar-weekdays-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748B);
          text-transform: uppercase;
          padding-bottom: 0.75rem;
        }

        .calendar-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        @media (min-width: 768px) {
          .calendar-days-grid {
            gap: 10px;
          }
        }

        .calendar-date-cell {
          min-height: 70px;
          background: var(--cream-50, #FDFBF7);
          border: 1px solid rgba(226, 232, 240, 0.7);
          border-radius: 12px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          transition: all 0.2s ease;
          position: relative;
          outline: none;
        }

        @media (min-width: 768px) {
          .calendar-date-cell {
            min-height: 90px;
            padding: 0.65rem;
          }
        }

        .calendar-date-cell.is-outside-month {
          opacity: 0.35;
          background: #F8FAFC;
        }

        /* Event Day Styling: Visually distinguishable without relying on colour alone */
        .calendar-date-cell.has-event {
          background: #FFF7ED;
          border: 2px solid var(--primary-saffron, #F97316);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.12);
        }

        .calendar-date-cell.has-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(249, 115, 22, 0.25);
          background: #FFEDD5;
        }

        .calendar-date-cell.has-event:focus-visible {
          box-shadow: 0 0 0 3px #0284C7;
        }

        .calendar-date-cell.is-selected {
          border-color: var(--secondary-light-blue-hover, #0284C7);
          background: #F0F9FF;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.35);
        }

        .date-number-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.35rem;
        }

        .date-number {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--charcoal-900, #0F172A);
        }

        .has-event .date-number {
          font-weight: 800;
          color: #9A3412;
        }

        /* Visual marker for event dates */
        .event-visual-marker {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: var(--primary-saffron, #F97316);
          color: #FFFFFF;
          padding: 1px 5px;
          border-radius: var(--radius-pill);
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .marker-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #FFFFFF;
        }

        .calendar-event-preview-pill {
          display: none;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #FED7AA;
          border-radius: 6px;
          padding: 2px 4px;
          margin-top: 4px;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .calendar-event-preview-pill {
            display: block;
          }
        }

        .preview-pill-title {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          color: #9A3412;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Empty Month Notice */
        .calendar-empty-month-notice {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
          text-align: center;
          background: var(--cream-50, #FDFBF7);
          border: 1px dashed var(--border-subtle, #E2E8F0);
          border-radius: 16px;
          padding: 2rem;
          margin-top: 2rem;
        }

        @media (min-width: 640px) {
          .calendar-empty-month-notice {
            flex-direction: row;
            text-align: left;
            justify-content: space-between;
          }
        }

        .empty-notice-icon {
          color: var(--secondary-light-blue-hover, #0284C7);
          flex-shrink: 0;
        }

        .empty-notice-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.9rem;
          color: var(--text-secondary, #475569);
          line-height: 1.5;
        }

        .empty-notice-text strong {
          color: var(--charcoal-900, #0F172A);
        }

        .empty-notice-btn {
          display: inline-flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-pill);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--charcoal-900, #0F172A);
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .empty-notice-btn:hover {
          background: var(--cream-100, #F7F3EB);
          color: var(--primary-saffron, #F97316);
        }

        /* Selected Event Spotlight Card */
        .calendar-selected-event-card {
          margin-top: 2.5rem;
          background: linear-gradient(135deg, var(--cream-50, #FDFBF7) 0%, #FFFFFF 100%);
          border: 2px solid var(--primary-saffron, #F97316);
          border-radius: 20px;
          padding: 1.75rem 2rem;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.08);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .selected-event-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-subtle, #E2E8F0);
          margin-bottom: 1.5rem;
        }

        .selected-badge-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .selected-flag {
          font-size: 0.725rem;
          font-weight: 800;
          color: var(--primary-saffron, #F97316);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .selected-date-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--charcoal-900, #0F172A);
        }

        .close-details-btn {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted, #64748B);
          transition: all 0.2s ease;
        }

        .close-details-btn:hover {
          color: var(--charcoal-900, #0F172A);
          background: #F1F5F9;
        }

        .selected-event-body-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: center;
        }

        @media (min-width: 768px) {
          .selected-event-body-grid {
            grid-template-columns: 180px 1fr;
          }
        }

        .selected-event-thumb {
          height: 140px;
          border-radius: 14px;
          overflow: hidden;
          background: #0F172A;
        }

        .selected-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .selected-event-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .selected-title {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--charcoal-900, #0F172A);
          line-height: 1.25;
        }

        .selected-desc {
          font-size: 0.925rem;
          color: var(--text-secondary, #475569);
          line-height: 1.55;
        }

        .selected-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem 1.5rem;
          font-size: 0.85rem;
          color: var(--charcoal-800, #1E293B);
          font-weight: 600;
        }

        .selected-meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .selected-action-row {
          padding-top: 0.5rem;
        }

        .btn-selected-register {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary-saffron, #F97316);
          color: #FFFFFF;
          padding: 0.65rem 1.4rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
          transition: all 0.2s ease;
        }

        .btn-selected-register:hover {
          background: var(--primary-saffron-hover, #EA580C);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
        }

        @media (prefers-reduced-motion: reduce) {
          .carousel-slider-track,
          .calendar-selected-event-card {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
