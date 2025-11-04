import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import CalendarView from './components/CalendarView';
import AttendeeManagement from './components/AttendeeManagement';
import Analytics from './components/Analytics';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadEvents(),
        loadCategories()
      ]);
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    setEvents(data || []);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    setCategories(data || []);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            events={events}
            onViewChange={setCurrentView}
            onRefresh={loadEvents}
            showToast={showToast}
          />
        );
      case 'create-event':
        return (
          <EventForm
            categories={categories}
            onSuccess={() => {
              loadEvents();
              setCurrentView('events');
              showToast('Event created successfully!', 'success');
            }}
            onCancel={() => setCurrentView('dashboard')}
            showToast={showToast}
          />
        );
      case 'events':
        return (
          <EventList
            events={events}
            categories={categories}
            onRefresh={loadEvents}
            onViewChange={setCurrentView}
            showToast={showToast}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            events={events}
            onRefresh={loadEvents}
            showToast={showToast}
          />
        );
      case 'attendees':
        return (
          <AttendeeManagement
            events={events}
            onRefresh={loadEvents}
            showToast={showToast}
          />
        );
      case 'analytics':
        return (
          <Analytics
            events={events}
            categories={categories}
          />
        );
      default:
        return <Dashboard events={events} onViewChange={setCurrentView} />;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {renderView()}
      </main>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
