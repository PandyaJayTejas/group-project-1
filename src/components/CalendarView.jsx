import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { format, parseISO, isSameDay } from 'date-fns';
import { MapPin, Clock, Users } from 'lucide-react';

const CalendarView = ({ events, onRefresh, showToast }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const eventsOnSelectedDate = useMemo(() => {
    return events.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, selectedDate);
    });
  }, [events, selectedDate]);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = events.filter(event => {
        const eventDate = parseISO(event.date);
        return isSameDay(eventDate, date);
      });

      if (dayEvents.length > 0) {
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '2px'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: '50%'
            }}></div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Calendar View
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          View and manage events by date
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="card">
          <style>{`
            .react-calendar {
              width: 100%;
              border: none;
              font-family: inherit;
              background: transparent;
            }
            .react-calendar__tile {
              padding: 1rem;
              border-radius: var(--radius-md);
              transition: var(--transition);
              color: var(--color-text);
            }
            .react-calendar__tile:enabled:hover,
            .react-calendar__tile:enabled:focus {
              background-color: var(--color-bg-tertiary);
            }
            .react-calendar__tile--active {
              background-color: var(--color-primary) !important;
              color: white !important;
            }
            .react-calendar__tile--now {
              background-color: var(--color-bg-secondary);
            }
            .react-calendar__navigation button {
              color: var(--color-text);
              font-size: 1rem;
              font-weight: 600;
              padding: 0.75rem;
              border-radius: var(--radius-md);
              transition: var(--transition);
            }
            .react-calendar__navigation button:enabled:hover,
            .react-calendar__navigation button:enabled:focus {
              background-color: var(--color-bg-tertiary);
            }
            .react-calendar__month-view__weekdays {
              color: var(--color-text-secondary);
              font-weight: 600;
              font-size: 0.875rem;
            }
            .react-calendar__month-view__days__day--weekend {
              color: var(--color-danger);
            }
          `}</style>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
          />
        </div>

        <div className="card">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            Events on {format(selectedDate, 'MMMM d, yyyy')}
          </h2>

          {eventsOnSelectedDate.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'var(--color-text-secondary)'
            }}>
              <p>No events scheduled for this date</p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {eventsOnSelectedDate.map((event) => (
                <div
                  key={event.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '0.75rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600'
                    }}>
                      {event.title}
                    </h3>
                    <span className="badge badge-primary">
                      {event.category}
                    </span>
                  </div>

                  {event.description && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '0.75rem'
                    }}>
                      {event.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
