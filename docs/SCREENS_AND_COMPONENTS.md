# CampusConnect — Screen Directory & Component Specification

This document provides a comprehensive blueprint of all routes, page layouts, functional screen views, and reusable UI components required for the CampusConnect application.

---

## 1. Global Layouts & Route Wrappers

### 1.1 `RootLayout` / `PublicLayout`
- **Scope:** Accessible to all users (unauthenticated, students, administrators).
- **Structure:**
  - `Navbar`: Sticky top navigation bar with brand mark, navigation links, and auth action buttons.
  - `<main>` container: Centered max-width container (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`).
  - `Footer`: Clean institutional footer with academic copyright, system status indicator, and quick links.

### 1.2 `StudentLayout`
- **Scope:** Protected route for users with `role === 'student'`.
- **Structure:**
  - Inherits main header with personalized user menu dropdown (User name, "My Registrations", "Profile", "Sign Out").
  - Sub-navigation bar or breadcrumb track for student-specific tasks.

### 1.3 `AdminLayout`
- **Scope:** Protected route for authenticated users with `role === 'admin'`.
- **Structure:**
  - Distinct administrative header badge: `CampusConnect Admin Console`.
  - Admin Sub-navigation Bar:
    - *Dashboard* (`/admin`)
    - *All Events* (`/admin/events`)
    - *New Event* (`/admin/events/new`)
  - Admin Action Toolbar: Quick breadcrumb navigation and contextual action buttons (e.g., "+ Create Event").

---

## 2. Reusable Component Inventory

To maintain strict modularity, components are categorized into Atomic, Molecular, and Organism layers:

### 2.1 Atoms (Base Elements)
- `Button`: Primary, secondary, outline, destructive, and ghost variants. Includes `isLoading` spinner state and disabled styling.
- `Input`: Text, email, password, date/time, and number inputs with integrated label, error text, and focus ring.
- `Textarea`: Multi-line text input with character limit indicator for descriptions.
- `Select`: Accessible dropdown selector for categories and sorting.
- `Badge`: Status indicators (e.g., `Upcoming`, `Completed`, `Full`, `Registered`, `Admin`, `Student`).
- `Skeleton`: Monochromatic shimmer placeholders for loading cards, tables, and statistics.
- `Icon`: Lucide React standardized wrappers (16px and 20px).

### 2.2 Molecules (Composite Units)
- `FormField`: Combines Label, Input/Select/Textarea, Helper Text, and Error Message.
- `SearchBar`: Text input with an embedded search icon, clear button, and debounced callback.
- `CategoryFilterTabs`: Pill or horizontal bar for instant category switching (All, Technical, Cultural, Workshop, Sports).
- `StatCard`: Academic metric card displaying a single clean number, small descriptive label, and contextual trend/subtext.
- `ConfirmationModal`: Modal dialog for destructive actions (e.g., "Cancel Registration", "Delete Event") with explicit confirm/cancel buttons.
- `EmptyState`: Centered graphic icon, descriptive title, supportive subtext, and clear call-to-action button.
- `ToastAlert`: Discrete notification container for success, warning, and error messages.

### 2.3 Organisms (Complex Functional Sections)
- `EventCard`: Structured card displaying event category badge, title, formatted date/time, venue, capacity bar, and "View Details" action.
- `EventGrid`: Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop) with loading skeletons and empty state fallback.
- `EventForm`: Comprehensive form for creating and editing events with validation rules.
- `ParticipantTable`: Data table listing student attendee names, emails, registration timestamps, and serial index.
- `AdminEventTable`: Table listing all events with date, venue, capacity fill rates, and action menus (View, Edit, Delete, Participants).

---

## 3. Screen Specifications & Component Breakdown

---

### Screen 1: Home Page
- **Route:** `/`
- **Access Level:** Public (All users)
- **Primary Purpose:** Institutional landing page introducing CampusConnect, featuring a search-driven hero, upcoming events preview, and quick access to login/registration.
- **Wireframe Structure:**
  1. **Hero Section:** Clean, bold headline (*"Discover and Participate in Campus Events"*), brief explanatory subtext, and primary CTA ("Explore Events").
  2. **Quick Metrics Strip:** Live counts of upcoming workshops, cultural programs, and active student participants.
  3. **Featured Upcoming Events:** Curated list of next 3–6 upcoming events.
  4. **Call to Action Banner:** Direct card inviting students to register or log in to secure event seats.
- **Components Used:**
  - `Navbar`
  - `HeroHeader` (Headline, subtext, action links)
  - `MetricStrip` (`StatCard` x 3)
  - `SectionHeader` (Title, "View All" link)
  - `EventGrid` containing `EventCard` components
  - `Button`
  - `Footer`
- **States Handled:** Loading skeleton for featured cards, empty state if no upcoming events exist.

---

### Screen 2: Student & Admin Login Page
- **Route:** `/login`
- **Access Level:** Public (Redirects to `/events` or `/admin` if already logged in)
- **Primary Purpose:** Single unified login portal for both students and system administrators.
- **Wireframe Structure:**
  - Centered clean auth card (max width 420px).
  - Brand header with title (*"Sign In to CampusConnect"*).
  - Credentials form: Email address input, Password input.
  - Role-detection note: System automatically routes to student portal or admin dashboard based on authenticated account role.
  - Secondary link: *"Don't have an account? Register as student"*.
- **Components Used:**
  - `AuthCardLayout`
  - `FormField` (Email input)
  - `FormField` (Password input with show/hide toggle)
  - `Button` (Submit with loading spinner)
  - `InlineAlert` (For invalid credentials or network errors)
  - `TextLink` (Link to `/register`)

---

### Screen 3: Student Registration Page
- **Route:** `/register`
- **Access Level:** Public
- **Primary Purpose:** Self-service registration form allowing students to create their accounts.
- **Wireframe Structure:**
  - Centered auth card matching login layout.
  - Informational header (*"Create Student Account"*).
  - Account fields: Full Name, College Email Address, Password, Confirm Password.
  - Clear policy note: *"Public accounts are created with Student privileges. Faculty & Admin accounts are pre-configured."*
  - Submit button and link to `/login`.
- **Components Used:**
  - `AuthCardLayout`
  - `FormField` (Full Name)
  - `FormField` (College Email)
  - `FormField` (Password with minimum 8 characters rule)
  - `FormField` (Confirm Password)
  - `Button` (Primary submit)
  - `InlineAlert` (For email conflict HTTP 409 or validation errors)
  - `TextLink` (Link to `/login`)

---

### Screen 4: Event Browse & Catalog Page
- **Route:** `/events`
- **Access Level:** Public
- **Primary Purpose:** Comprehensive catalog allowing students to search, filter, and discover all active campus events.
- **Wireframe Structure:**
  1. **Page Header:** Clean title (*"Campus Events Catalog"*) and subtitle.
  2. **Filter & Search Bar:**
     - Left: Real-time search input (`SearchBar`) querying title/venue.
     - Right: Category filter tabs (`All`, `Technical`, `Workshop`, `Cultural`, `Seminar`, `Sports`).
     - Optional status toggle: *"Upcoming only"* vs *"All events"*.
  3. **Event Grid:** Responsive grid of cards.
  4. **Pagination / Count Bar:** Displays active result count (e.g., *"Showing 8 upcoming events"*).
- **Components Used:**
  - `Navbar`
  - `PageHeader`
  - `SearchBar` (Debounced)
  - `CategoryFilterTabs`
  - `EventGrid`
  - `EventCard` (Category badge, date chip, venue, capacity progress indicator, action button)
  - `SkeletonGrid` (During API fetch)
  - `EmptyState` (When search/filter produces 0 results)
  - `Footer`

---

### Screen 5: Event Details Page
- **Route:** `/events/:id`
- **Access Level:** Public (Action requires authentication)
- **Primary Purpose:** In-depth view of a specific event's full description, date, timing, venue, remaining seats, and registration trigger.
- **Wireframe Structure:**
  1. **Breadcrumb Bar:** `Events` > `[Event Name]`.
  2. **Two-Column Layout (Desktop):**
     - **Main Content (Left 65%):**
       - Category badge and event title.
       - Detailed schedule block (Date, Start Time, Duration).
       - Full event description and instructions.
       - Venue details (Hall/Auditorium number, campus building).
     - **Action & Availability Sidebar (Right 35%):**
       - Seat Availability Card: Total Capacity vs. Registered Count.
       - Visual progress indicator (e.g., *"42 of 60 seats filled"*).
       - Context-Aware Action Button:
         - **If Not Logged In:** Button labels *"Sign in to Register"* (routes to `/login`).
         - **If Logged In & Not Registered:** Button labels *"Register for Event"* (primary CTA).
         - **If Already Registered:** Green badge *"You are registered for this event"* + link to `/my-registrations`.
         - **If Event Full:** Disabled button *"Event at Full Capacity"*.
         - **If Past Event:** Disabled button *"Event has ended"*.
- **Components Used:**
  - `Breadcrumb`
  - `Badge` (Category & Status)
  - `ScheduleCallout` (Date, Time, Location icon chips)
  - `CapacityProgressBar`
  - `Button`
  - `ConfirmationModal` (To confirm registration)
  - `ToastAlert` (Success confirmation on registration)
  - `Skeleton` (Detail view skeleton)

---

### Screen 6: My Registrations Page
- **Route:** `/my-registrations`
- **Access Level:** Student Protected (`role === 'student'`)
- **Primary Purpose:** Personal student dashboard tracking all events the student has registered for, with quick cancellation options.
- **Wireframe Structure:**
  1. **Header:** Title (*"My Registered Events"*), subtext, and total registrations counter.
  2. **Registrations List / Table:**
     - Event Title (clickable link to `/events/:id`).
     - Category Badge.
     - Date & Venue.
     - Registered Date/Time.
     - Action: *"Cancel Registration"* (Destructive button).
  3. **Empty State:** Illustrated message when student has no active registrations with an *"Explore Events"* button.
- **Components Used:**
  - `Navbar`
  - `PageHeader`
  - `Badge`
  - `RegistrationListItem` / `RegistrationCard`
  - `ConfirmationModal` (Warning: *"Are you sure you want to cancel your registration? Your seat will be released to other students."*)
  - `Button` (Destructive variant for cancellation)
  - `EmptyState`
  - `ToastAlert`

---

### Screen 7: Student Profile Page
- **Route:** `/profile`
- **Access Level:** Student Protected (`role === 'student'`)
- **Primary Purpose:** View basic student account details, enrolled status, and summary statistics.
- **Wireframe Structure:**
  - Clean profile card displaying: Full Name, Registered Email Address, Assigned Role (`Student`), Registration date.
  - Summary metric: Total events attended/registered.
  - Security note: Information managed via campus credentials.
- **Components Used:**
  - `ProfileCard`
  - `AvatarPlaceholder` (Clean two-letter initials circle)
  - `Badge` (`Student`)
  - `StatCard` (Total Registrations)

---

### Screen 8: Admin Dashboard Overview
- **Route:** `/admin`
- **Access Level:** Admin Protected (`role === 'admin'`)
- **Primary Purpose:** High-level administrative hub showing real-time event analytics and quick operational shortcuts.
- **Wireframe Structure:**
  1. **Admin Header:** Title (*"Administrator Dashboard"*), timestamp of last sync, and quick "+ New Event" action button.
  2. **Key Metric KPI Cards:**
     - **Total Events:** Number of all hosted events.
     - **Upcoming Events:** Active events scheduled for future dates.
     - **Total Registrations:** Cumulative count of student event registrations.
     - **Average Seat Fill Rate:** Aggregate percentage of capacity utilized.
  3. **Recent Events Table Preview:** Compact list of the 5 most recent upcoming events with seat counters and direct links to participant lists.
  4. **Quick Navigation Links:** Jump to `/admin/events` or `/admin/events/new`.
- **Components Used:**
  - `AdminNavbar`
  - `PageHeader` with Action Button
  - `KPIStatCard` x 4
  - `DataTable` (Recent events)
  - `ProgressBar` (Capacity utilization)
  - `Badge` (Status)

---

### Screen 9: Admin Event Management List
- **Route:** `/admin/events`
- **Access Level:** Admin Protected (`role === 'admin'`)
- **Primary Purpose:** Full management table of all college events with search, sorting, and CRUD action controls.
- **Wireframe Structure:**
  1. **Header:** Title (*"Manage Events"*) and Primary Button (*"+ Create New Event"*).
  2. **Filter Strip:** Search bar + Category filter dropdown.
  3. **Management Table:**
     - Columns: `Event Title`, `Category`, `Date & Time`, `Venue`, `Capacity / Registered`, `Status`, `Actions`.
     - Actions menu per row:
       - *View Public Page* (External link)
       - *View Participants* (Navigates to `/admin/events/:id/participants`)
       - *Edit Event* (Navigates to `/admin/events/edit/:id`)
       - *Delete Event* (Opens confirmation modal)
- **Components Used:**
  - `AdminNavbar`
  - `SearchBar`
  - `Select` (Category filter)
  - `AdminTable`
  - `CapacityBadge` (e.g. `45/50 Filled`)
  - `ActionDropdown` / `ButtonGroup`
  - `ConfirmationModal` (Destructive event deletion warning)
  - `Pagination`

---

### Screen 10: Admin Create Event Page
- **Route:** `/admin/events/new`
- **Access Level:** Admin Protected (`role === 'admin'`)
- **Primary Purpose:** Authoring form to publish a new college event listing.
- **Wireframe Structure:**
  - Breadcrumb: `Admin` > `Events` > `Create Event`.
  - Form Card Container (Centered, max-width 720px):
    - Form Title & Description.
    - Title Input (Required text).
    - Category Select (`Technical`, `Workshop`, `Cultural`, `Seminar`, `Sports`, `Competition`).
    - Date & Time Picker (Validated to future dates).
    - Venue Input (e.g. *"Main Auditorium, Block C"*).
    - Capacity Input (Positive integer, e.g. `100`).
    - Event Description (Markdown or rich multi-line textarea).
    - Action Row: "Cancel" (Secondary button) and "Publish Event" (Primary submit button).
- **Components Used:**
  - `AdminNavbar`
  - `Breadcrumb`
  - `FormField` (Title)
  - `FormField` (Category Select)
  - `FormField` (Date and Time input)
  - `FormField` (Venue)
  - `FormField` (Capacity Number)
  - `FormField` (Description Textarea)
  - `Button` (Cancel & Submit)
  - `InlineAlert` (Validation feedback)

---

### Screen 11: Admin Edit Event Page
- **Route:** `/admin/events/edit/:id`
- **Access Level:** Admin Protected (`role === 'admin'`)
- **Primary Purpose:** Form pre-populated with existing event details allowing admins to adjust event schedules, venues, or capacities.
- **Wireframe Structure:**
  - Identical form structure to Create Event, pre-populated with current event document values.
  - Note on Capacity: Validation warning prevents lowering capacity below the count of students already registered.
  - Buttons: "Discard Changes" and "Save Changes".
- **Components Used:**
  - Same component set as Screen 10 (`EventForm`, `FormField`, `Button`), with initial state loading skeleton.

---

### Screen 12: Admin Event Participants Roster
- **Route:** `/admin/events/:id/participants`
- **Access Level:** Admin Protected (`role === 'admin'`)
- **Primary Purpose:** Dedicated attendee roster allowing organizers and faculty to inspect all registered students for a specific event.
- **Wireframe Structure:**
  1. **Event Header Banner:** Event Title, Date, Venue, and Total Registrations Count (e.g. *"48 students registered out of 50 seats"*).
  2. **Participant Data Table:**
     - Columns: `# (Serial)`, `Student Name`, `Student Email`, `Registration Timestamp`, `Status`.
  3. **Empty State:** Displayed when an event has 0 registrations yet: *"No students have registered for this event yet."*
  4. **Back Link:** Return to `/admin/events`.
- **Components Used:**
  - `AdminNavbar`
  - `Breadcrumb`
  - `EventSummaryCard`
  - `DataTable`
  - `Badge` (`Confirmed`)
  - `EmptyState`
  - `Button` (Back navigation)
