import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, Download, Edit, Trash2, MapPin, Calendar as CalendarIcon, Users } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

const EventList = ({ events, categories, onRefresh, onViewChange, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, searchTerm, filterCategory, filterStatus]);

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      showToast('Event deleted successfully', 'success');
      onRefresh();
    } catch (error) {
      showToast(error.message || 'Failed to delete event', 'error');
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Date', 'Time', 'Location', 'Category', 'Capacity', 'Status'];
    const rows = filteredEvents.map(event => [
      event.title,
      event.date,
      event.time,
      event.location,
      event.category,
      event.capacity,
      event.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Events exported successfully', 'success');
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      upcoming: 'primary',
      ongoing: 'success',
      completed: 'warning',
      cancelled: 'danger'
    };
    return `badge-${statusColors[status] || 'primary'}`;
  };

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
            All Events
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onViewChange('create-event')}>
          Create Event
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div>
            <label className="label">Search</label>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)'
                }}
              />
              <input
                type="text"
                className="input"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button className="btn btn-secondary" onClick={exportToCSV}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '3rem 1rem'
        }}>
          <CalendarIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: 'var(--color-text-secondary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>No events found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredEvents.map((event) => (
            <div key={event.id} className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {event.title}
                </h3>
                <span className={`badge ${getStatusBadge(event.status)}`}>
                  {event.status}
                </span>
              </div>

              {event.description && (
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.5'
                }}>
                  {event.description.length > 100
                    ? `${event.description.substring(0, 100)}...`
                    : event.description}
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
                  <CalendarIcon size={16} />
                  <span>
                    {format(parseISO(event.date), 'MMM d, yyyy')} at {event.time}
                  </span>
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

              {event.tags && event.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-primary"
                      style={{ fontSize: '0.688rem' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-border)'
              }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => onViewChange('attendees')}
                >
                  <Users size={16} />
                  Manage
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {}}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(event.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
