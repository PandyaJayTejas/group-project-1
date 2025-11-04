/*
  # Event Management System Database Schema

  ## Overview
  This migration creates the complete database schema for a modern event management system
  with support for events, attendees, categories, and analytics.

  ## New Tables
  
  ### `events`
  - `id` (uuid, primary key) - Unique event identifier
  - `title` (text) - Event title
  - `description` (text) - Detailed event description
  - `date` (date) - Event date
  - `time` (time) - Event start time
  - `location` (text) - Event venue/location
  - `capacity` (integer) - Maximum number of attendees
  - `category` (text) - Event category (Conference, Workshop, Seminar, Social, Other)
  - `status` (text) - Event status (upcoming, ongoing, completed, cancelled)
  - `image_url` (text) - Event banner/image URL
  - `tags` (text[]) - Array of event tags
  - `created_by` (uuid) - Reference to user who created the event
  - `created_at` (timestamptz) - Event creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `attendees`
  - `id` (uuid, primary key) - Unique attendee registration identifier
  - `event_id` (uuid, foreign key) - Reference to events table
  - `name` (text) - Attendee full name
  - `email` (text) - Attendee email address
  - `phone` (text) - Attendee phone number (optional)
  - `registration_date` (timestamptz) - When attendee registered
  - `status` (text) - Registration status (registered, checked_in, cancelled)
  - `notes` (text) - Additional notes about the attendee

  ### `event_categories`
  - `id` (uuid, primary key) - Category identifier
  - `name` (text) - Category name
  - `description` (text) - Category description
  - `color` (text) - Category color for UI display
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public read access for events (upcoming events visible to all)
  - Authenticated users can create events
  - Event creators can update/delete their own events
  - Attendee data is protected - only event creators can view/manage

  ## Indexes
  - Index on event dates for efficient calendar queries
  - Index on event status for filtering
  - Index on attendee email for quick lookups
  - Index on event categories for filtering

  ## Notes
  - All timestamps use timezone awareness for accurate scheduling
  - Event capacity is validated at the application level
  - Soft deletes not implemented - events can be marked as 'cancelled'
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  time time DEFAULT '09:00:00',
  location text NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  category text DEFAULT 'Other',
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  image_url text,
  tags text[] DEFAULT '{}',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendees table
CREATE TABLE IF NOT EXISTS attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  registration_date timestamptz DEFAULT now(),
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'cancelled')),
  notes text,
  UNIQUE(event_id, email)
);

-- Create event_categories table
CREATE TABLE IF NOT EXISTS event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO event_categories (name, description, color) VALUES
  ('Conference', 'Large-scale professional gatherings', '#3B82F6'),
  ('Workshop', 'Hands-on learning sessions', '#10B981'),
  ('Seminar', 'Educational presentations', '#F59E0B'),
  ('Social', 'Networking and social events', '#EC4899'),
  ('Other', 'Miscellaneous events', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_attendees_event_id ON attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for events table
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events table

-- Public can view upcoming events
CREATE POLICY "Anyone can view upcoming events"
  ON events FOR SELECT
  USING (status IN ('upcoming', 'ongoing'));

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own events
CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own events
CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for attendees table

-- Event creators can view attendees
CREATE POLICY "Event creators can view attendees"
  ON attendees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = attendees.event_id
      AND events.created_by = auth.uid()
    )
  );

-- Anyone can register as attendee (insert)
CREATE POLICY "Anyone can register as attendee"
  ON attendees FOR INSERT
  WITH CHECK (true);

-- Event creators can update attendees
CREATE POLICY "Event creators can update attendees"
  ON attendees FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = attendees.event_id
      AND events.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = attendees.event_id
      AND events.created_by = auth.uid()
    )
  );

-- Event creators can delete attendees
CREATE POLICY "Event creators can delete attendees"
  ON attendees FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = attendees.event_id
      AND events.created_by = auth.uid()
    )
  );

-- RLS Policies for event_categories table

-- Everyone can view categories
CREATE POLICY "Anyone can view categories"
  ON event_categories FOR SELECT
  USING (true);
