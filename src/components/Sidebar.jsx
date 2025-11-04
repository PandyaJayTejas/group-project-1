import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  PlusCircle,
  List,
  Moon,
  Sun
} from 'lucide-react';

const Sidebar = ({ currentView, onNavigate, darkMode, onToggleDarkMode }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-event', label: 'Create Event', icon: PlusCircle },
    { id: 'events', label: 'All Events', icon: List },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--color-primary)',
          marginBottom: '0.5rem'
        }}>
          EventHub
        </h1>
        <p style={{
          fontSize: '0.813rem',
          color: 'var(--color-text-secondary)'
        }}>
          Manage your events
        </p>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-text)',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.875rem',
                textAlign: 'left',
                transition: 'var(--transition)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={onToggleDarkMode}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-bg-tertiary)',
          color: 'var(--color-text)',
          fontSize: '0.875rem',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    </aside>
  );
};

export default Sidebar;
