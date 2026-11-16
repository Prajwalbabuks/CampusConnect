# CampusConnect — Project Flow & System Architecture Specification

## 1. Executive Summary & Problem Statement

### 1.1 Context
Colleges and universities host dozens of events every academic semester—ranging from technical hackathons, coding contests, and guest lectures to workshops, cultural fests, and sports meets. However, event coordination in most institutions is fragmented across noticeboards, WhatsApp groups, social media flyers, and manual Google Forms.

### 1.2 Core Problems Identified
1. **Information Fragmentation:** Students miss critical registration deadlines because announcements are scattered across disconnected channels.
2. **Registration Chaos & Inaccurate Headcounts:** Organizers struggle with duplicate submissions, unvalidated sign-ups, and lack of real-time seat tracking.
3. **Administrative Burden:** Faculty and student organizers spend excessive time manually collecting attendee details, verifying eligibility, and updating schedules.
4. **Lack of Self-Service for Students:** Students cannot easily view which events they have registered for, nor can they cancel to free up seats for peers.

### 1.3 Solution Overview: CampusConnect
**CampusConnect** is a centralized, role-based College Event Management System built on the MERN stack (MongoDB, Express.js, React, Node.js). It provides:
- A public-facing catalog with search and category filtering for prospective student attendees.
- Secure student self-service: one-click registration, seat availability tracking, and registration management/cancellation.
- Protected administrative portal: event authoring (CRUD), real-time capacity management, registration metrics, and attendee roster tracking.
- Strict data integrity: atomic capacity enforcement, duplicate prevention, and server-side validation.

---

## 2. Technology Stack Specification

As mandated in the project proposal, the system employs the modern MERN stack with strict architectural separation between presentation, application, and persistence layers:

| Layer | Technology | Version / Specifics | Purpose & Scope |
| :--- | :--- | :--- | :--- |
| **Presentation (Frontend)** | **React** | v18 / v19 | Single Page Application (SPA) component-driven UI |
| | **Vite** | Modern ESM bundler | Fast development server and optimized production build |
| | **React Router** | v6 / v7 | Client-side routing, protected routes, URL state |
| | **Tailwind CSS** | v4 | Modern styling engine; zero-runtime utility-first CSS |
| | **Axios** | HTTP client | Credentialed REST API calls with interceptors |
| | **Lucide React** | Icon library | Cohesive 24px/16px line icons (zero random emojis) |
| **Application (Backend)** | **Node.js** | v20+ LTS | JavaScript asynchronous runtime environment |
| | **Express.js** | v4 / v5 | RESTful API server, middleware pipeline, routing |
| | **JWT (jsonwebtoken)** | Token auth | Stateless session claims stored in **HttpOnly cookies** |
| | **bcryptjs** | Password hashing | Salted password hashing (cost factor 10-12) |
| | **Zod** | Schema validation | Type-safe runtime schema validation for bodies & params |
| | **CORS** | Middleware | Whitelisted frontend origin with `credentials: true` |
| **Data (Persistence)** | **MongoDB Atlas** | v7+ Cloud / Local | Document database for flexible document storage |
| | **Mongoose** | v8+ ODM | Data schemas, models, compound indexes, middleware |

---

## 3. End-to-End System Flows

### 3.1 Student Workflow
```
[ Open CampusConnect Portal (/) ]
              │
              ▼
   [ Browse Events (/events) ] ◄── Filter by Category / Search Title
              │
              ▼
   [ View Event Details (/events/:id) ]
              │
      ┌───────┴───────┐
   Not Logged In   Logged In
      │               │
      ▼               │
[ Redirect /login ]   │
      │               │
      ▼               │
[ Return to Event ] ──┘
              │
              ▼
   [ Click "Register" ]
              │
              ├── Check 1: Is event date in the future?
              ├── Check 2: Has student already registered? (Compound Index Guard)
              └── Check 3: Is current capacity < max capacity? (Atomic Check)
              │
      ┌───────┴───────────────┐
   Success                  Error / Full
      │                           │
      ▼                           ▼
[ Registration Stored ]   [ Error Toast: "Event Full" / "Already Registered" ]
[ Seat Decremented ]
      │
      ▼
[ Open "My Registrations" (/my-registrations) ]
      │
      ├── View registered events
      └── Option to "Cancel Registration" ──► Frees seat for other students
```

### 3.2 Administrator Workflow
```
[ Access /login with Seeded Admin Credentials ]
              │
              ▼
    [ Backend Auth Check: role === 'admin' ]
              │
              ▼
  [ Admin Dashboard Overview (/admin) ]
    • Metric: Total Active Events
    • Metric: Total Registrations
    • Metric: Upcoming vs Completed
              │
      ┌───────┼──────────────────────────────┐
      ▼       ▼                              ▼
[/admin/events/new]  [/admin/events]   [/admin/events/:id/participants]
      │               │                              │
 Create Event     Manage / Edit / Delete        View Live Attendee Roster
  • Title          • Inline status badges        • Student Name & Email
  • Date/Time      • Capacity utilization        • Registration Timestamp
  • Venue          • Quick actions               • Attendee Count Metric
  • Capacity
  • Category
```

### 3.3 Request-Response Data Cycle
1. **User Action:** User interacts with React UI (e.g., clicks "Register", submits login form).
2. **Client Dispatch:** Axios dispatches an asynchronous HTTP request with `withCredentials: true`.
3. **Security Middleware:** Express intercepts request:
   - CORS validation (origin check).
   - Rate limiting & request sanitization.
   - `authMiddleware`: Extracts JWT from HttpOnly cookie, verifies signature, injects `req.user`.
   - `roleMiddleware`: Verifies `req.user.role === 'admin'` on `/api/admin/*` endpoints.
4. **Schema Validation:** Zod validator checks `req.body` and `req.params`. Invalid inputs trigger HTTP `400 Bad Request` with structured error messages.
5. **Business Logic & Mongoose:** Controller queries MongoDB Atlas via Mongoose model.
   - For registrations: verifies event exists, date is in future, atomically checks capacity against existing registration count, and writes record.
6. **Persistence:** MongoDB writes document, enforcing unique compound index `{ user: 1, event: 1 }`.
7. **Response Serialization:** Express returns standard JSON response: `{ success: true, data: ... }` with appropriate HTTP status code (`200`, `201`, `400`, `401`, `403`, `404`, `409`).
8. **UI State Update:** React updates state, displays clean feedback toast/banner, and refreshes reactive UI components without full page reload.

---

## 4. REST API Specification

### 4.1 Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Request Body | Response Status | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ name, email, password }` | `201 Created` | Creates a student account only. Role defaults to `student`. |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | `200 OK` | Validates credentials, sets HttpOnly JWT cookie. |
| `POST` | `/api/auth/logout` | Authenticated | None | `200 OK` | Clears auth cookie. |
| `GET` | `/api/auth/me` | Authenticated | None | `200 OK` | Returns current user profile `{ id, name, email, role }`. |

### 4.2 Events Endpoints (`/api/events`)
| Method | Endpoint | Access | Query / Body Params | Response Status | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | `?search=...&category=...&status=upcoming` | `200 OK` | List events with filtering, search, and capacity stats. |
| `GET` | `/api/events/:id` | Public | Path: `id` | `200 OK` | Full event details + available seats count. |
| `POST` | `/api/events` | Admin only | `{ title, description, category, date, venue, capacity }` | `201 Created` | Create new event listing. |
| `PUT` | `/api/events/:id` | Admin only | `{ title, description, category, date, venue, capacity }` | `200 OK` | Update existing event. |
| `DELETE` | `/api/events/:id` | Admin only | Path: `id` | `200 OK` | Delete event and cascade cancel registrations. |

### 4.3 Registrations Endpoints (`/api/registrations`)
| Method | Endpoint | Access | Parameters | Response Status | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/registrations/:eventId` | Student | Path: `eventId` | `201 Created` | Register logged-in student for event (atomic capacity check). |
| `GET` | `/api/registrations/my` | Student | None | `200 OK` | Return list of events currently registered by student. |
| `DELETE` | `/api/registrations/:eventId` | Student | Path: `eventId` | `200 OK` | Cancel registration and release seat. |

### 4.4 Admin Oversight Endpoints (`/api/admin`)
| Method | Endpoint | Access | Parameters | Response Status | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin only | None | `200 OK` | Aggregate statistics: total events, total registrations, upcoming counts. |
| `GET` | `/api/admin/registrations/:eventId` | Admin only | Path: `eventId` | `200 OK` | Roster of registered participants (names, emails, timestamps). |

---

## 5. Database Schema & Data Models

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│         User Collection         │           │        Event Collection         │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ _id: ObjectId                   │ 1       * │ _id: ObjectId                   │
│ name: String                    │──────────<│ title: String                   │
│ email: String (unique, lower)   │ (created) │ description: String             │
│ password: String (bcrypt hash)  │           │ category: String                │
│ role: 'student' | 'admin'       │           │ date: Date                      │
│ createdAt: Date                 │           │ venue: String                   │
│ updatedAt: Date                 │           │ capacity: Number                │
└─────────────────────────────────┘           │ createdBy: ObjectId (ref: User) │
                 │ 1                          │ createdAt: Date                 │
                 │                            │ updatedAt: Date                 │
                 │                            └─────────────────────────────────┘
                 │                                             │ 1
                 │          ┌───────────────────────┐          │
                 │        * │Registration Collection│ *        │
                 └─────────<├───────────────────────┤>─────────┘
                            │ _id: ObjectId         │
                            │ user: ObjectId (User) │
                            │ event: ObjectId(Event)│
                            │ registeredAt: Date    │
                            └───────────────────────┘
                               INDEX: { user: 1, event: 1 } (UNIQUE)
```

### 5.1 Critical Constraints & Business Rules
1. **Zero Duplicate Registrations:**
   - Enforced by Mongoose compound index: `RegistrationSchema.index({ user: 1, event: 1 }, { unique: true })`.
   - Any duplicate POST receives HTTP `409 Conflict` with clear message: *"You have already registered for this event."*
2. **Atomic Capacity Verification:**
   - Registration check prevents overbooking even under concurrent clicks:
   - Query verifies `countDocuments({ event: eventId }) < event.capacity` prior to inserting registration.
   - If capacity is reached, returns HTTP `400 Bad Request` with message: *"Event capacity has been reached."*
3. **Past Event Registration Prevention:**
   - Backend validation: `new Date(event.date) > new Date()`.
   - Disables registration button on frontend and rejects API calls with HTTP `400 Bad Request`.
4. **Admin Protection & Seed Script:**
   - Public registration route `/api/auth/register` ignores any `role` field sent in payload and hardcodes `role: 'student'`.
   - Admin user is provisioned solely via backend CLI command: `node scripts/seedAdmin.js`.
5. **Cookie Security:**
   - JWT tokens stored in `HttpOnly`, `SameSite: 'lax'`, `Secure: process.env.NODE_ENV === 'production'`.
   - Prevents client-side XSS attacks from reading authentication tokens.
