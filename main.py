class Event:
    def __init__(self, title, date, location, capacity):
        self.title = title
        self.date = date
        self.location = location
        self.capacity = capacity
        self.registered_attendees = 0

    def register_attendee(self):
        if self.registered_attendees < self.capacity:
            self.registered_attendees += 1
            return True
        return False

# List to store events
events = []

def create_event():
    title = input("Enter event title: ")
    date = input("Enter event date (YYYY-MM-DD): ")
    location = input("Enter event location: ")
    capacity = int(input("Enter event capacity: "))
    new_event = Event(title, date, location, capacity)
    events.append(new_event)
    print("Event created successfully!")
# Function to view all events
def view_events():
    if not events:
        print("No events available.")
        return
    for i, event in enumerate(events):
        print(f"{i+1}. {event.title} on {event.date} at {event.location} (Attendees: {event.registered_attendees}/{event.capacity})")

# Main loop for user interaction
if __name__ == "__main__":
    while True:
        print("\nEvent Management System Menu:")
        print("1. Create Event")
        print("2. View Events")
        print("3. Exit")
        choice = input("Enter your choice: ")

        if choice == '1':
            create_event()
        elif choice == '2':
            view_events()
        elif choice == '3':
            break
        else:
            print("Invalid choice. Please try again.")