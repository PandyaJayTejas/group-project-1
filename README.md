# EventHub - Modern Event Management System

A professional, full-featured event management application built with React, Vite, and Supabase. Manage events, attendees, and track analytics with a beautiful, modern UI inspired by leading platforms like Eventbrite and Hopin.

## Features

### Core Features
- **Dashboard**: Overview of all events with key metrics and statistics
- **Event Management**: Create, edit, delete, and view events with rich details
- **Calendar View**: Visual calendar interface to see events by date
- **Attendee Management**: Register attendees, track check-ins, and manage registrations
- **Analytics**: Comprehensive insights into event performance and trends
- **Search & Filter**: Advanced filtering by category, status, and search terms
- **Export**: Export event data to CSV format
- **Dark Mode**: Toggle between light and dark themes

### Design Highlights
- Modern, card-based UI with smooth transitions
- Responsive design that works on all devices
- Professional color scheme (blue-based palette)
- Intuitive navigation with sidebar menu
- Real-time data synchronization with Supabase
- Toast notifications for user feedback

## Technology Stack

- **Frontend**: React 19, Vite 7
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Lucide React (icons), React Calendar
- **Utilities**: date-fns for date manipulation
- **Styling**: Custom CSS with CSS variables for theming

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Database Setup:
   - The database schema has already been created via migrations
   - Tables include: `events`, `attendees`, `event_categories`
   - Default categories are pre-populated

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Database Schema

### Events Table
- Event details (title, description, date, time, location)
- Capacity management
- Category classification
- Status tracking (upcoming, ongoing, completed, cancelled)
- Tag support for better organization

### Attendees Table
- Attendee information (name, email, phone)
- Registration tracking
- Check-in status management
- Notes for special requirements

### Event Categories Table
- Pre-defined categories with custom colors
- Categories: Conference, Workshop, Seminar, Social, Other

## Usage Guide

### Creating an Event
1. Click "Create Event" from the sidebar or dashboard
2. Fill in event details (title, date, time, location, capacity)
3. Select a category and add optional tags
4. Save to create the event

### Managing Attendees
1. Navigate to "Attendees" from the sidebar
2. Select an event from the dropdown
3. Add attendees with their contact information
4. Track registrations and check-in status
5. Export attendee lists as needed

### Viewing Analytics
1. Navigate to "Analytics" from the sidebar
2. View category distribution, status breakdown, and key insights
3. Track event performance over time

### Using Calendar View
1. Navigate to "Calendar" from the sidebar
2. Select any date to view events scheduled for that day
3. Dates with events show a blue indicator dot

## Security Features

- Row Level Security (RLS) enabled on all tables
- Public read access for upcoming events
- Authenticated users can create and manage their own events
- Event creators have exclusive access to attendee data
- Secure data isolation between different users

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Analytics.jsx
│   │   ├── AttendeeManagement.jsx
│   │   ├── CalendarView.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EventForm.jsx
│   │   ├── EventList.jsx
│   │   └── Sidebar.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

## Features in Detail

### Dark Mode
Toggle between light and dark themes using the button at the bottom of the sidebar. Theme preference is maintained throughout the session.

### Search & Filter
- Search events by title or location
- Filter by category (Conference, Workshop, Seminar, Social, Other)
- Filter by status (Upcoming, Ongoing, Completed, Cancelled)

### Export Functionality
Export filtered event lists to CSV format with all event details for external analysis or reporting.

### Responsive Design
The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## Future Enhancements

Potential features for future development:
- Email notifications for event reminders
- QR code generation for check-ins
- Event ticketing and payment integration
- Recurring events support
- Custom event templates
- Social media integration
- Advanced reporting and charts
- Multi-language support

## Contributing

This project was built as a modern replacement for the legacy Python-based event management system. Contributions are welcome!

## License

ISC