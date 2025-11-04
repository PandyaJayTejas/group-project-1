import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

const EventForm = ({ categories, onSuccess, onCancel, showToast, eventToEdit = null }) => {
  const [formData, setFormData] = useState({
    title: eventToEdit?.title || '',
    description: eventToEdit?.description || '',
    date: eventToEdit?.date || '',
    time: eventToEdit?.time || '09:00',
    location: eventToEdit?.location || '',
    capacity: eventToEdit?.capacity || '',
    category: eventToEdit?.category || 'Conference',
    tags: eventToEdit?.tags?.join(', ') || '',
    status: eventToEdit?.status || 'upcoming'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      if (eventToEdit) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', eventToEdit.id);

        if (error) throw error;
        showToast('Event updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
        showToast('Event created successfully!', 'success');
      }

      onSuccess();
    } catch (error) {
      showToast(error.message || 'Failed to save event', 'error');
    } finally {
      setLoading(false);
    }
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
            {eventToEdit ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Fill in the details below to {eventToEdit ? 'update' : 'create'} your event.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onCancel}>
          <X size={18} />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ maxWidth: '800px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <label className="label">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <label className="label">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input"
                placeholder="Enter venue or address"
                required
              />
            </div>

            <div>
              <label className="label">
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="input"
                placeholder="Maximum attendees"
                min="1"
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="Enter event description"
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="input"
                placeholder="e.g., technology, networking, education (comma-separated)"
              />
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-tertiary)',
                marginTop: '0.5rem'
              }}>
                Separate tags with commas
              </p>
            </div>

            {eventToEdit && (
              <div>
                <label className="label">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (eventToEdit ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
