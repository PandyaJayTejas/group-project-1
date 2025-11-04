import React, { useMemo } from 'react';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';

const Dashboard = ({ events, onViewChange, onRefresh, showToast }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const upcomingEvents = events.filter(e => !isPast(parseISO(e.date)));
    const pastEvents = events.filter(e => isPast(parseISO(e.date)));

    const totalAttendees = events.reduce((sum, event) => {
      return sum + (event.attendee_count || 0);
    }, 0);

    const avgAttendance = events.length > 0
      ? Math.round(totalAttendees / events.length)
      : 0;

    return {
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      totalAttendees,
      avgAttendance
    };
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => !isPast(parseISO(e.date)))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [events]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      minHeight: '120px'
    }}>
      <div style={{
        backgroundColor: `${color}15`,
        color: color,
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={28} />
      </div>
      <div>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '0.25rem'
        }}>
          {title}
        </p>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: 'var(--color-text)'
        }}>
          {value}
        </h2>
        {subtitle && (
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-tertiary)',
            marginTop: '0.25rem'
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Welcome back! Here's your event overview.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onViewChange('create-event')}
        >
          <TrendingUp size={18} />
          Create Event
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon={Calendar}
          title="Total Events"
          value={stats.totalEvents}
          subtitle={`${stats.upcomingEvents} upcoming`}
          color="#2563eb"
        />
        <StatCard
          icon={Clock}
          title="Upcoming Events"
          value={stats.upcomingEvents}
          subtitle={`${stats.pastEvents} completed`}
          color="#10b981"
        />
        <StatCard
          icon={Users}
          title="Total Attendees"
          value={stats.totalAttendees}
          subtitle={`Avg. ${stats.avgAttendance} per event`}
          color="#f59e0b"
        />
        <StatCard
          icon={TrendingUp}
          title="Event Rate"
          value={`${stats.upcomingEvents > 0 ? '100%' : '0%'}`}
          subtitle="Active events"
          color="#ec4899"
        />
      </div>

      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            Upcoming Events
          </h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onViewChange('events')}
          >
            View All
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--color-text-secondary)'
          }}>
            <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No upcoming events</p>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: '1rem' }}
              onClick={() => onViewChange('create-event')}
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  transition: 'var(--transition)',
                  cursor: 'pointer'
                }}
                onClick={() => onViewChange('events')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  minWidth: '60px',
                  textAlign: 'center',
                  padding: '0.5rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {format(parseISO(event.date), 'd')}
                  </div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {format(parseISO(event.date), 'MMM')}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem'
                  }}>
                    {event.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <span>{event.location}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </p>
                </div>
                <span className={`badge badge-primary`}>
                  {event.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
