import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from datetime import datetime
import json
import os
import csv
import uuid
from tkcalendar import Calendar, DateEntry
from PIL import Image, ImageTk
import sv_ttk  # For modern Fluent/Sun Valley theme

class ModernEventSystem(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Modern Event Management")
        self.geometry("1200x800")
        self.minsize(1000, 700)
        
        # Apply modern theme
        sv_ttk.set_theme("light")
        
        # Initialize data
        self.events_file = "events.json"
        self.events = self.load_events()
        
        # Setup UI
        self.setup_ui()
        self.center_window()

    def setup_ui(self):
        # Main container using grid
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Sidebar
        self.create_sidebar()

        # Main content area with card-like appearance
        self.main_frame = ttk.Frame(self, padding=20)
        self.main_frame.grid(row=0, column=1, sticky="nsew")
        self.main_frame.grid_columnconfigure(0, weight=1)
        self.main_frame.grid_rowconfigure(0, weight=1)

        # Show dashboard by default
        self.show_dashboard()

    def create_sidebar(self):
        sidebar = ttk.Frame(self, padding="10 20")
        sidebar.grid(row=0, column=0, sticky="ns")
        
        # App title/logo area
        title_frame = ttk.Frame(sidebar)
        title_frame.pack(fill="x", pady=(0, 20))
        ttk.Label(title_frame, text="Event Manager", font=("Segoe UI", 20, "bold")).pack()
        
        # Navigation buttons
        nav_buttons = [
            ("📊 Dashboard", self.show_dashboard),
            ("➕ New Event", self.show_create_event),
            ("📅 Calendar", self.show_calendar_view),
            ("👥 Attendees", self.show_attendees),
            ("📈 Analytics", self.show_analytics),
            ("⚙️ Settings", self.show_settings)
        ]
        
        for text, command in nav_buttons:
            btn = ttk.Button(sidebar, text=text, command=command, style="Accent.TButton", width=20)
            btn.pack(pady=5, fill="x")

    def show_dashboard(self):
        self.clear_main_frame()
        
        # Header
        header = ttk.Frame(self.main_frame)
        header.pack(fill="x", pady=(0, 20))
        ttk.Label(header, text="Dashboard", font=("Segoe UI", 24, "bold")).pack(side="left")
        ttk.Button(header, text="+ Quick Add Event", style="Accent.TButton").pack(side="right")

        # Stats cards container
        stats_frame = ttk.Frame(self.main_frame)
        stats_frame.pack(fill="x", pady=10)
        stats_frame.grid_columnconfigure((0,1,2,3), weight=1)

        # Calculate stats
        total_events = len(self.events)
        upcoming = len([e for e in self.events if not self.is_past_event(e)])
        total_attendees = sum(len(e.get('attendees', [])) for e in self.events)
        
        # Stats cards
        self.create_stat_card(stats_frame, "Total Events", total_events, "🎫", 0)
        self.create_stat_card(stats_frame, "Upcoming", upcoming, "📅", 1)
        self.create_stat_card(stats_frame, "Attendees", total_attendees, "👥", 2)
        self.create_stat_card(stats_frame, "Categories", len(set(e.get('category') for e in self.events)), "🏷️", 3)

        # Recent events section
        recent_frame = ttk.LabelFrame(self.main_frame, text="Recent Events", padding=10)
        recent_frame.pack(fill="both", expand=True, pady=20)
        
        # Create treeview for recent events
        columns = ('title', 'date', 'location', 'capacity', 'status')
        tree = ttk.Treeview(recent_frame, columns=columns, show='headings', height=10)
        
        # Define columns
        tree.heading('title', text='Event Title')
        tree.heading('date', text='Date & Time')
        tree.heading('location', text='Location')
        tree.heading('capacity', text='Capacity')
        tree.heading('status', text='Status')
        
        # Set column widths
        tree.column('title', width=300)
        tree.column('date', width=150)
        tree.column('location', width=200)
        tree.column('capacity', width=100)
        tree.column('status', width=100)
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(recent_frame, orient="vertical", command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        # Pack tree and scrollbar
        tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Populate with recent events
        sorted_events = sorted(self.events, key=lambda x: x.get('date', ''), reverse=True)[:10]
        for event in sorted_events:
            status = "Past" if self.is_past_event(event) else "Upcoming"
            tree.insert('', 'end', values=(
                event.get('title'),
                f"{event.get('date')} {event.get('time')}",
                event.get('location'),
                f"{len(event.get('attendees', []))}/{event.get('capacity')}",
                status
            ))

    def show_create_event(self):
        self.clear_main_frame()
        
        # Header
        ttk.Label(self.main_frame, text="Create New Event", font=("Segoe UI", 24, "bold")).pack(fill="x", pady=(0, 20))
        
        # Create form container with card-like appearance
        form_frame = ttk.Frame(self.main_frame, padding=20)
        form_frame.pack(fill="both", expand=True)
        
        # Form variables
        self.event_vars = {
            'title': tk.StringVar(),
            'location': tk.StringVar(),
            'capacity': tk.StringVar(),
            'category': tk.StringVar(),
            'description': tk.StringVar()
        }
        
        # Left column (Event Details)
        left_frame = ttk.LabelFrame(form_frame, text="Event Details", padding=15)
        left_frame.pack(side="left", fill="both", expand=True, padx=(0, 10))
        
        # Event Title
        ttk.Label(left_frame, text="Event Title*").pack(anchor="w", pady=(0, 5))
        title_entry = ttk.Entry(left_frame, textvariable=self.event_vars['title'])
        title_entry.pack(fill="x", pady=(0, 15))
        
        # Date and Time
        date_time_frame = ttk.Frame(left_frame)
        date_time_frame.pack(fill="x", pady=(0, 15))
        
        ttk.Label(date_time_frame, text="Date*").pack(side="left", padx=(0, 10))
        self.date_picker = DateEntry(date_time_frame, width=12, background='darkblue',
                                   foreground='white', borderwidth=2)
        self.date_picker.pack(side="left", padx=(0, 20))
        
        ttk.Label(date_time_frame, text="Time*").pack(side="left", padx=(0, 10))
        hour_spinbox = ttk.Spinbox(date_time_frame, from_=0, to=23, width=3)
        hour_spinbox.pack(side="left")
        ttk.Label(date_time_frame, text=":").pack(side="left", padx=2)
        minute_spinbox = ttk.Spinbox(date_time_frame, from_=0, to=59, width=3)
        minute_spinbox.pack(side="left")
        
        # Location
        ttk.Label(left_frame, text="Location*").pack(anchor="w", pady=(0, 5))
        location_entry = ttk.Entry(left_frame, textvariable=self.event_vars['location'])
        location_entry.pack(fill="x", pady=(0, 15))
        
        # Capacity and Category
        cap_cat_frame = ttk.Frame(left_frame)
        cap_cat_frame.pack(fill="x", pady=(0, 15))
        
        # Capacity
        ttk.Label(cap_cat_frame, text="Capacity*").pack(side="left", padx=(0, 10))
        capacity_entry = ttk.Spinbox(cap_cat_frame, from_=1, to=1000, width=10,
                                   textvariable=self.event_vars['capacity'])
        capacity_entry.pack(side="left", padx=(0, 20))
        
        # Category
        ttk.Label(cap_cat_frame, text="Category*").pack(side="left", padx=(0, 10))
        categories = ["Conference", "Workshop", "Seminar", "Social", "Other"]
        category_combo = ttk.Combobox(cap_cat_frame, values=categories, 
                                    textvariable=self.event_vars['category'], width=15)
        category_combo.pack(side="left")
        category_combo.set(categories[0])
        
        # Right column (Additional Details)
        right_frame = ttk.LabelFrame(form_frame, text="Additional Details", padding=15)
        right_frame.pack(side="right", fill="both", expand=True, padx=(10, 0))
        
        # Description
        ttk.Label(right_frame, text="Description").pack(anchor="w", pady=(0, 5))
        description_text = tk.Text(right_frame, height=10, width=40)
        description_text.pack(fill="both", expand=True, pady=(0, 15))
        
        # Image Upload (placeholder)
        ttk.Label(right_frame, text="Event Image").pack(anchor="w", pady=(0, 5))
        upload_frame = ttk.Frame(right_frame)
        upload_frame.pack(fill="x", pady=(0, 15))
        ttk.Button(upload_frame, text="Choose Image...").pack(side="left", padx=(0, 10))
        ttk.Label(upload_frame, text="No image selected").pack(side="left")
        
        # Tags
        ttk.Label(right_frame, text="Tags").pack(anchor="w", pady=(0, 5))
        tags_entry = ttk.Entry(right_frame)
        tags_entry.pack(fill="x", pady=(0, 5))
        ttk.Label(right_frame, text="Separate tags with commas", 
                 font=("Segoe UI", 8)).pack(anchor="w")
        
        # Action buttons at the bottom
        button_frame = ttk.Frame(self.main_frame)
        button_frame.pack(fill="x", pady=20)
        ttk.Button(button_frame, text="Clear Form", style="Secondary.TButton").pack(side="left")
        ttk.Button(button_frame, text="Create Event", style="Accent.TButton",
                  command=self.create_event).pack(side="right")

    def show_calendar_view(self):
        self.clear_main_frame()
        ttk.Label(self.main_frame, text="Calendar View", 
                 font=("Segoe UI", 24, "bold")).pack(pady=(0, 20))
        
        # Create calendar frame
        calendar_frame = ttk.Frame(self.main_frame)
        calendar_frame.pack(fill="both", expand=True)
        
        # Left side - Calendar
        left_frame = ttk.Frame(calendar_frame)
        left_frame.pack(side="left", fill="both", expand=True, padx=(0, 10))
        
        # Create the calendar widget
        cal = Calendar(left_frame, selectmode='day', date_pattern='yyyy-mm-dd',
                      showweeknumbers=False, weekenddays=[6,7],
                      font=("Segoe UI", 10))
        cal.pack(fill="both", expand=True)
        
        # Right side - Events list for selected date
        right_frame = ttk.LabelFrame(calendar_frame, text="Events", padding=10)
        right_frame.pack(side="right", fill="both", expand=True)
        
        def update_events(*args):
            # Clear previous events
            for widget in right_frame.winfo_children():
                widget.destroy()
            
            selected_date = cal.get_date()
            # Filter events for selected date
            day_events = [e for e in self.events 
                         if e.get('date') == selected_date]
            
            if not day_events:
                ttk.Label(right_frame, text="No events on this date",
                         font=("Segoe UI", 10)).pack(pady=20)
            else:
                for event in day_events:
                    event_frame = ttk.Frame(right_frame)
                    event_frame.pack(fill="x", pady=5)
                    
                    ttk.Label(event_frame, text=event['title'],
                            font=("Segoe UI", 11, "bold")).pack(anchor="w")
                    ttk.Label(event_frame, 
                            text=f"Time: {event.get('time', 'All day')}").pack(anchor="w")
                    ttk.Label(event_frame, 
                            text=f"Location: {event['location']}").pack(anchor="w")
                    ttk.Separator(right_frame, orient="horizontal").pack(fill="x", pady=5)
        
        # Bind selection
        cal.bind('<<CalendarSelected>>', update_events)
        
        # Initial update
        update_events()

    def show_attendees(self):
        self.clear_main_frame()
        ttk.Label(self.main_frame, text="Attendees Management", 
                 font=("Segoe UI", 24, "bold")).pack(pady=(0, 20))
        
        # Create main container
        container = ttk.Frame(self.main_frame)
        container.pack(fill="both", expand=True)
        
        # Left side - Event selection
        left_frame = ttk.LabelFrame(container, text="Select Event", padding=10)
        left_frame.pack(side="left", fill="both", expand=True, padx=(0, 10))
        
        # Event listbox
        events_list = tk.Listbox(left_frame, font=("Segoe UI", 10))
        events_list.pack(fill="both", expand=True)
        
        # Populate events list
        for event in self.events:
            events_list.insert(tk.END, event['title'])
        
        # Right side - Attendees list
        right_frame = ttk.LabelFrame(container, text="Attendees", padding=10)
        right_frame.pack(side="right", fill="both", expand=True)
        
        # Create attendees table
        columns = ('name', 'email', 'registration_date')
        attendees_tree = ttk.Treeview(right_frame, columns=columns, show='headings')
        
        # Define columns
        attendees_tree.heading('name', text='Name')
        attendees_tree.heading('email', text='Email')
        attendees_tree.heading('registration_date', text='Registration Date')
        
        # Set column widths
        attendees_tree.column('name', width=150)
        attendees_tree.column('email', width=200)
        attendees_tree.column('registration_date', width=150)
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(right_frame, orient=tk.VERTICAL, 
                                command=attendees_tree.yview)
        attendees_tree.configure(yscrollcommand=scrollbar.set)
        
        # Pack tree and scrollbar
        attendees_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Button frame
        button_frame = ttk.Frame(right_frame)
        button_frame.pack(fill="x", pady=(10, 0))
        
        def update_attendees_list(*args):
            # Clear current items
            for item in attendees_tree.get_children():
                attendees_tree.delete(item)
            
            # Get selected event
            selection = events_list.curselection()
            if not selection:
                return
            
            event = self.events[selection[0]]
            
            # Update attendees list
            for attendee in event.get('attendees', []):
                attendees_tree.insert('', tk.END, values=(
                    attendee.get('name', ''),
                    attendee.get('email', ''),
                    attendee.get('registration_date', '')
                ))
        
        def add_attendee():
            selection = events_list.curselection()
            if not selection:
                messagebox.showwarning("Warning", "Please select an event first!")
                return
            
            event = self.events[selection[0]]
            
            # Create popup for new attendee
            popup = tk.Toplevel(self)
            popup.title("Add Attendee")
            popup.geometry("300x200")
            popup.transient(self)
            popup.grab_set()
            
            ttk.Label(popup, text="Name:").pack(pady=(10, 0))
            name_var = tk.StringVar()
            ttk.Entry(popup, textvariable=name_var).pack(fill="x", padx=20)
            
            ttk.Label(popup, text="Email:").pack(pady=(10, 0))
            email_var = tk.StringVar()
            ttk.Entry(popup, textvariable=email_var).pack(fill="x", padx=20)
            
            def save():
                try:
                    name = name_var.get().strip()
                    email = email_var.get().strip()
                    
                    if not name or not email:
                        raise ValueError("Name and email are required!")
                    
                    event.setdefault('attendees', []).append({
                        'name': name,
                        'email': email,
                        'registration_date': datetime.now().strftime("%Y-%m-%d %H:%M")
                    })
                    
                    self.save_events()
                    update_attendees_list()
                    popup.destroy()
                    
                except ValueError as e:
                    messagebox.showerror("Error", str(e))
            
            ttk.Button(popup, text="Add", command=save).pack(pady=20)
        
        def remove_attendee():
            selection = events_list.curselection()
            if not selection:
                messagebox.showwarning("Warning", "Please select an event first!")
                return
            
            attendee_selection = attendees_tree.selection()
            if not attendee_selection:
                messagebox.showwarning("Warning", "Please select an attendee to remove!")
                return
            
            if messagebox.askyesno("Confirm", "Are you sure you want to remove this attendee?"):
                event = self.events[selection[0]]
                attendee_index = attendees_tree.index(attendee_selection[0])
                event['attendees'].pop(attendee_index)
                self.save_events()
                update_attendees_list()
        
        ttk.Button(button_frame, text="Add Attendee", 
                  command=add_attendee).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Remove Attendee", 
                  command=remove_attendee).pack(side=tk.LEFT, padx=5)
        
        # Bind event selection to update attendees list
        events_list.bind('<<ListboxSelect>>', update_attendees_list)

    def show_analytics(self):
        self.clear_main_frame()
        ttk.Label(self.main_frame, text="Analytics", 
                 font=("Segoe UI", 24, "bold")).pack(pady=(0, 20))
        
        # Create analytics dashboard
        dashboard = ttk.Frame(self.main_frame)
        dashboard.pack(fill="both", expand=True)
        
        # Top row - Quick stats
        stats_frame = ttk.LabelFrame(dashboard, text="Quick Statistics", padding=10)
        stats_frame.pack(fill="x", pady=(0, 20))
        
        # Calculate statistics
        total_events = len(self.events)
        total_attendees = sum(len(e.get('attendees', [])) for e in self.events)
        avg_attendance = total_attendees / total_events if total_events > 0 else 0
        categories = {}
        for event in self.events:
            cat = event.get('category', 'Other')
            categories[cat] = categories.get(cat, 0) + 1
        most_popular = max(categories.items(), key=lambda x: x[1])[0] if categories else "N/A"
        
        # Display stats in grid
        stats = [
            ("Total Events", total_events),
            ("Total Attendees", total_attendees),
            ("Average Attendance", f"{avg_attendance:.1f}"),
            ("Most Popular Category", most_popular)
        ]
        
        for i, (label, value) in enumerate(stats):
            ttk.Label(stats_frame, text=label).grid(row=0, column=i, padx=10, pady=5)
            ttk.Label(stats_frame, text=str(value), 
                     font=("Segoe UI", 16, "bold")).grid(row=1, column=i, padx=10, pady=5)
        
        # Middle - Charts (we'll use text representation for now)
        charts_frame = ttk.Frame(dashboard)
        charts_frame.pack(fill="both", expand=True, pady=10)
        
        # Category distribution
        cat_frame = ttk.LabelFrame(charts_frame, text="Category Distribution", padding=10)
        cat_frame.pack(fill="both", expand=True, pady=(0, 10))
        
        for category, count in categories.items():
            frame = ttk.Frame(cat_frame)
            frame.pack(fill="x", pady=2)
            ttk.Label(frame, text=category).pack(side="left")
            progress = ttk.Progressbar(frame, length=200, maximum=total_events)
            progress.pack(side="right")
            progress['value'] = count
        
        # Bottom - AI Insights
        if hasattr(self, 'ai_helper'):
            insights_frame = ttk.LabelFrame(dashboard, text="AI Insights", padding=10)
            insights_frame.pack(fill="x", pady=(10, 0))
            
            # Get AI-generated insights
            attendance_insights = self.ai_helper.generate_attendance_insights(self.events)
            ttk.Label(insights_frame, text=attendance_insights, 
                     wraplength=800).pack(pady=10)

    def show_settings(self):
        self.clear_main_frame()
        ttk.Label(self.main_frame, text="Settings", 
                 font=("Segoe UI", 24, "bold")).pack(pady=20)
        
        settings_frame = ttk.LabelFrame(self.main_frame, text="Application Settings", padding=20)
        settings_frame.pack(fill="x", padx=20)
        
        # Theme selection
        theme_frame = ttk.Frame(settings_frame)
        theme_frame.pack(fill="x", pady=10)
        ttk.Label(theme_frame, text="Theme:").pack(side="left", padx=(0, 10))
        ttk.Button(theme_frame, text="Light", 
                  command=lambda: sv_ttk.set_theme("light")).pack(side="left", padx=5)
        ttk.Button(theme_frame, text="Dark", 
                  command=lambda: sv_ttk.set_theme("dark")).pack(side="left", padx=5)

    def create_stat_card(self, parent, title, value, icon, column):
        card = ttk.Frame(parent, padding=15)
        card.grid(row=0, column=column, padx=5, sticky="nsew")
        
        ttk.Label(card, text=icon, font=("Segoe UI", 24)).pack(anchor="w")
        ttk.Label(card, text=str(value), 
                 font=("Segoe UI", 32, "bold")).pack(anchor="w")
        ttk.Label(card, text=title, 
                 font=("Segoe UI", 12)).pack(anchor="w")

    def clear_main_frame(self):
        for widget in self.main_frame.winfo_children():
            widget.destroy()

    def create_event(self):
        try:
            # Get form values
            title = self.event_vars['title'].get()
            location = self.event_vars['location'].get()
            capacity = int(self.event_vars['capacity'].get())
            category = self.event_vars['category'].get()
            
            if not all([title, location, capacity, category]):
                raise ValueError("Please fill in all required fields")
            
            # Create event object
            event = {
                'id': str(uuid.uuid4()),
                'title': title,
                'date': self.date_picker.get(),
                'location': location,
                'capacity': capacity,
                'category': category,
                'attendees': []
            }
            
            # Add to events list and save
            self.events.append(event)
            self.save_events()
            
            # Show success message and return to dashboard
            messagebox.showinfo("Success", "Event created successfully!")
            self.show_dashboard()
            
        except ValueError as e:
            messagebox.showerror("Error", str(e))

    def load_events(self):
        try:
            if os.path.exists(self.events_file):
                with open(self.events_file, 'r') as file:
                    return json.load(file)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load events: {str(e)}")
        return []

    def save_events(self):
        try:
            with open(self.events_file, 'w') as file:
                json.dump(self.events, file, indent=4)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save events: {str(e)}")

    def is_past_event(self, event):
        event_date = datetime.strptime(f"{event['date']} {event.get('time', '00:00')}", 
                                     "%Y-%m-%d %H:%M")
        return event_date < datetime.now()

    def center_window(self):
        self.update_idletasks()
        width = self.winfo_width()
        height = self.winfo_height()
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')

def main():
    # First, we need to install required packages
    try:
        import sv_ttk
        import tkcalendar
    except ImportError:
        print("Installing required packages...")
        import subprocess
        subprocess.check_call(['pip', 'install', 'sv-ttk', 'tkcalendar'])
        import sv_ttk
        import tkcalendar

    app = ModernEventSystem()
    app.mainloop()

if __name__ == "__main__":
    main()