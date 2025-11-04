import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Phone, Search, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const AttendeeManagement = ({ events, onRefresh, showToast }) => {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAttendee, setNewAttendee] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    if (selectedEventId) {
      loadAttendees();
    }
  }, [selectedEventId]);

  const loadAttendees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('registration_date', { ascending: false });

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      showToast('Failed to load attendees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttendee = async (e) => {
    e.preventDefault();
    if (!selectedEventId) {
      showToast('Please select an event first', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('attendees')
        .insert([{
          event_id: selectedEventId,
          ...newAttendee
        }]);

      if (error) throw error;

      showToast('Attendee registered successfully!', 'success');
      setShowAddModal(false);
      setNewAttendee({ name: '', email: '', phone: '', notes: '' });
      loadAttendees();
      onRefresh();
    } catch (error) {
      showToast(error.message || 'Failed to register attendee', 'error');
    }
  };

  const handleDeleteAttendee = async (attendeeId) => {
    if (!confirm('Are you sure you want to remove this attendee?')) return;

    try {
      const { error } = await supabase
        .from('attendees')
        .delete()
        .eq('id', attendeeId);

      if (error) throw error;

      showToast('Attendee removed successfully', 'success');
      loadAttendees();
      onRefresh();
    } catch (error) {
      showToast('Failed to remove attendee', 'error');
    }
  };

  const handleCheckIn = async (attendeeId, currentStatus) => {
    const newStatus = currentStatus === 'checked_in' ? 'registered' : 'checked_in';

    try {
      const { error } = await supabase
        .from('attendees')
        .update({ status: newStatus })
        .eq('id', attendeeId);

      if (error) throw error;

      showToast(`Attendee ${newStatus === 'checked_in' ? 'checked in' : 'check-in reversed'}`, 'success');
      loadAttendees();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const filteredAttendees = attendees.filter(attendee =>
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Attendee Management
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Manage event registrations and attendees
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div>
            <label className="label">Select Event</label>
            <select
              className="input"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="">Choose an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} - {format(new Date(event.date), 'MMM d, yyyy')}
                </option>
              ))}
            </select>
          </div>

          {selectedEventId && (
            <>
              <div>
                <label className="label">Search Attendees</label>
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
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <UserPlus size={18} />
                Add Attendee
              </button>
            </>
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.25rem'
              }}>
                Total Registrations
              </p>
              <p style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'var(--color-text)'
              }}>
                {attendees.length} / {selectedEvent.capacity}
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.25rem'
              }}>
                Checked In
              </p>
              <p style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'var(--color-success)'
              }}>
                {attendees.filter(a => a.status === 'checked_in').length}
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.25rem'
              }}>
                Available Spots
              </p>
              <p style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'var(--color-primary)'
              }}>
                {selectedEvent.capacity - attendees.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedEventId && (
        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: 'var(--color-text-secondary)'
            }}>
              <UserPlus size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No attendees registered yet</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid var(--color-border)',
                    textAlign: 'left'
                  }}>
                    <th style={{ padding: '0.75rem', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '0.75rem', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '0.75rem', fontWeight: '600' }}>Phone</th>
                    <th style={{ padding: '0.75rem', fontWeight: '600' }}>Registered</th>
                    <th style={{ padding: '0.75rem', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '0.75rem', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((attendee) => (
                    <tr
                      key={attendee.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'var(--transition)'
                      }}
                    >
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                        {attendee.name}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={14} />
                          {attendee.email}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {attendee.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={14} />
                            {attendee.phone}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {format(new Date(attendee.registration_date), 'MMM d, yyyy')}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${
                          attendee.status === 'checked_in' ? 'badge-success' : 'badge-primary'
                        }`}>
                          {attendee.status === 'checked_in' ? 'Checked In' : 'Registered'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className={`btn btn-sm ${
                              attendee.status === 'checked_in' ? 'btn-secondary' : 'btn-success'
                            }`}
                            onClick={() => handleCheckIn(attendee.id, attendee.status)}
                            title={attendee.status === 'checked_in' ? 'Reverse check-in' : 'Check in'}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteAttendee(attendee.id)}
                            title="Remove attendee"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{
            width: '90%',
            maxWidth: '500px',
            padding: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem'
            }}>
              Add New Attendee
            </h2>

            <form onSubmit={handleAddAttendee}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="label">Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={newAttendee.name}
                    onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    className="input"
                    value={newAttendee.email}
                    onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    className="input"
                    value={newAttendee.phone}
                    onChange={(e) => setNewAttendee({ ...newAttendee, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    value={newAttendee.notes}
                    onChange={(e) => setNewAttendee({ ...newAttendee, notes: e.target.value })}
                    placeholder="Any special notes..."
                    rows="3"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Add Attendee
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeeManagement;
