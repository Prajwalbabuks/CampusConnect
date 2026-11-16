# NIE CampusConnect 🏛️

> **Full-Stack Campus Event Discovery, Seat Reservation & Attendance Management System**  
> Developed for the **National Institute of Engineering (NIE), Mysuru** · Full Stack Development (FSD) Experiential Learning (EL) Project.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture & Folder Structure](#-system-architecture--folder-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Installation](#1-installation)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Database Seeding](#3-database-seeding)
  - [4. Running the Application](#4-running-the-application)
- [Environment Variables](#-environment-variables)
- [Default Credentials](#-default-credentials)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Git & Security Policies](#-git--security-policies)
- [License & Institutional Context](#-license--institutional-context)

---

## 🎯 Project Overview

**NIE CampusConnect** replaces fragmented WhatsApp group notices and physical sign-up sheets with an institutional, centralized digital platform for the National Institute of Engineering.

It provides a seamless, self-service portal for students across all engineering branches to discover departmental seminars, hackathons, workshops, and sports tournaments, reserve admissions passes with **one seat per USN**, and present digital gate passes upon arrival. Concurrently, organizers and the NIE Academic Senate gain access to real-time seat capacities, live gate verification controls, and instant roster exports.

---

## ✨ Key Features

### 🎓 For NIE Students
* **Real Academic Onboarding:** Student accounts require an authentic University Seat Number (USN e.g., `4NI23CS045`), Department, Year/Semester, Section, and Mobile Phone.
* **Live Event Discovery & Filtering:** Explore events by Category (*Technical, Workshop, Cultural, Sports, Seminar*) and Academic Department (*CSE, ISE, ECE, EEE, AIML, ME, CV, CUL, PED*).
* **Guaranteed One Seat Per USN:** Enforced at the database level with compound unique indexes to eliminate duplicate reservations.
* **Instant Digital Admission Pass:** Real-time generation of digital passes carrying a unique reservation ID, student academic dossier, venue, and live status.
* **Self-Service Cancellation:** Cancel reservations at any time to instantly release the seat back to peer students.

### 🛡️ For Organizers & Administrators
* **Real-Time Capacity Monitoring:** Live fill rates, total capacities, and registered counts across all campus venues (Sir MV Auditorium, Turing Labs, Amphitheatre, etc.).
* **Atomic Seat Allocation:** Built with conditional MongoDB `$inc` operations to prevent race conditions and overbooking during high-traffic registration rushes.
* **Gate Attendance Verification:** Organizers can check in students at venue gates with a single click, automatically recording verified check-in timestamps.
* **Sticky Roster Controls:** 9-column participant table equipped with a sticky verification action column that remains visible across all viewport sizes.
* **CSV Roster Export:** One-click download of attendance rosters formatted with student names, USNs, branches, sections, emails, and check-in times.
* **Event Lifecycle Management:** Full CRUD capabilities for authorized administrative accounts to publish, modify, or archive campus events.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
* **Framework:** React 19 + Vite (Fast HMR & Rolldown bundling)
* **Routing:** React Router v7
* **Styling:** Tailwind CSS v4 + Custom Institutional Editorial Theme
* **Animation & UI Polish:** Motion (Framer Motion v14) & ReactBits Interactive Components (`PatternWaves`, `SpotlightCard`, `Magnet`)
* **Icons:** Lucide React
* **HTTP Client:** Axios (Configured with credentials, automatic error normalization, and 401 session revocation)

### Backend (`server/`)
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js
* **Database:** MongoDB Atlas (Cloud) via Mongoose 8 ORM
* **Authentication:** Stateless JSON Web Tokens (JWT) stored in secure `httpOnly` cookies with `SameSite` protections
* **Password Hashing:** `bcryptjs` (Salt factor: 10)
* **Input Validation:** Zod schemas applied as pre-handler middleware on all mutation endpoints
* **Security & Hardening:** Helmet (HTTP security headers), strict rate limiting (`express-rate-limit`), CORS whitelist, and sanitized query parsing

---

## 📂 System Architecture & Folder Structure

```
FSD EL/
├── .gitignore                      # Root Git exclusion rules (Secrets, node_modules, logs)
├── package.json                    # Workspace root scripts (concurrent dev runner)
├── package-lock.json
├── README.md                       # Master project documentation
│
├── client/                         # Frontend Application (React 19 + Vite + Tailwind 4)
│   ├── .env.example                # Client environment template (VITE_API_URL)
│   ├── .gitignore                  # Client-level Git exclusion rules
│   ├── index.html                  # HTML5 entry with preconnected Google Fonts
│   ├── package.json
│   ├── vite.config.js
│   ├── public/                     # Static assets (favicons, SVG icons)
│   └── src/
│       ├── App.jsx                 # Route definitions & protected route guards
│       ├── main.jsx                # Application entrypoint
│       ├── index.css               # Design tokens, CSS variables & typography
│       ├── assets/                 # Brand assets & institutional imagery
│       ├── components/             # Reusable UI & layout elements
│       │   ├── AdminNav.jsx        # Navigation bar for admin operational routes
│       │   ├── DepartmentStrip.jsx # NIE department selector strip
│       │   ├── FeaturedEvents.jsx  # Dynamic featured events carousel
│       │   ├── Footer.jsx          # Institutional footer
│       │   ├── HeroSection.jsx     # Landing hero with interactive waves & spotlight
│       │   ├── Navbar.jsx          # Public & student navigation bar
│       │   ├── reactbits/          # High-performance interactive UI components
│       │   └── ui/                 # Atomic design primitives (Button, Badge, Card, StatCard)
│       ├── context/
│       │   └── AuthContext.jsx     # Global authentication, session & student state
│       ├── pages/                  # 12 Application views
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── EventsPage.jsx
│       │   ├── EventDetailPage.jsx
│       │   ├── MyRegistrationsPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── AdminDashboardPage.jsx
│       │   ├── AdminEventsPage.jsx
│       │   ├── AdminCreateEventPage.jsx
│       │   ├── AdminEditEventPage.jsx
│       │   └── AdminParticipantsPage.jsx
│       ├── services/
│       │   ├── api.js              # Centralized Axios API service layer
│       │   └── catalog.js          # Canonical NIE departments & event categories
│       └── utils/
│           └── eventUi.js          # Category badge styling & date helpers
│
├── server/                         # Backend REST API (Node.js + Express + Mongoose)
│   ├── .env.example                # Server environment template (DB URI, JWT secret)
│   ├── .gitignore                  # Server-level Git exclusion rules
│   ├── package.json
│   └── src/
│       ├── server.js               # Express application entry, CORS & middleware pipeline
│       ├── config/
│       │   └── db.js               # MongoDB Mongoose connection manager
│       ├── controllers/
│       │   ├── adminController.js
│       │   ├── authController.js
│       │   ├── eventController.js
│       │   └── registrationController.js
│       ├── middleware/
│       │   ├── authMiddleware.js   # JWT verification & request user hydration
│       │   ├── errorMiddleware.js  # Global error handler with formatted JSON output
│       │   ├── rateLimitMiddleware.js # Strict auth & general API rate limiters
│       │   ├── roleMiddleware.js   # Admin-only authorization guard
│       │   └── securityMiddleware.js # Helmet & security headers
│       ├── models/
│       │   ├── Event.js            # Event schema, indexes & capacity validations
│       │   ├── Registration.js     # Compound unique index ([event, user]), check-in status
│       │   └── User.js             # Student profile schema (USN, branch, section, hashed password)
│       ├── routes/
│       │   ├── adminRoutes.js
│       │   ├── authRoutes.js
│       │   ├── eventRoutes.js
│       │   └── registrationRoutes.js
│       ├── scripts/
│       │   └── seed.js             # Automated database seeding utility
│       ├── utils/
│       │   ├── branches.js         # Canonical branch code mappings
│       │   ├── studentParser.js    # USN pattern validation & parser
│       │   └── token.js            # JWT token signing & cookie dispatch
│       └── validators/
│           └── schemas.js          # Zod schemas for auth, events & registrations
│
└── docs/                           # Academic Project Documentation & Specifications
    ├── CampusConnect_Project_Proposal.pdf
    ├── FULLSTACK_ROADMAP.md
    ├── PROJECT_FLOW_AND_ARCHITECTURE.md
    ├── SCREENS_AND_COMPONENTS.md
    └── UNSLOP_DESIGN_SYSTEM.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MongoDB:** A free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster (recommended) or a local MongoDB instance running on port 27017.

---

### 1. Installation

Clone the repository and install all root and submodule dependencies:

```bash
# Clone the repository
git clone <your-repository-url>
cd "FSD EL"

# Install root orchestrator dependencies (concurrently)
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root directory
cd ..
```

---

### 2. Environment Configuration

The application uses environment variables for database connections, JWT secrets, and client URLs. Secret files (`.env`) are excluded from version control. Templates are provided via `.env.example`.

#### Backend Setup (`server/.env`)
Create a `.env` file inside the `server/` directory:

```bash
# In server/
copy .env.example .env
```

Open `server/.env` and update the required values:

```env
# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nie_campusconnect?retryWrites=true&w=majority

# Authentication Secret (Generate using crypto random string)
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Client Origin (Must match Vite's development URL for CORS & cookies)
CLIENT_URL=http://localhost:5173

# Seed Script Safety Flag
SEED_CONFIRM=true
SEED_ADMIN_EMAIL=admin@nie.ac.in
SEED_ADMIN_PASSWORD=niePass2026!
```

#### Frontend Setup (`client/.env`)
Create a `.env` file inside the `client/` directory:

```bash
# In client/
copy .env.example .env
```

Verify that `client/.env` contains:

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Database Seeding

To initialize the database with the default administrative account and four authentic NIE events (with zero registrations):

```bash
# From the project root:
npm run seed

# Or directly from the server folder:
cd server
npm run seed
```

> **Note:** Seeding requires `SEED_CONFIRM=true` in `server/.env` or passing the `--force` flag.

---

### 4. Running the Application

You can start both the backend API and the frontend client simultaneously with a single command from the root directory:

```bash
npm run dev
```

* **Frontend Client:** [http://localhost:5173](http://localhost:5173)
* **Backend REST API:** [http://localhost:5000](http://localhost:5000)
* **API Health Check:** [http://localhost:5000/api/events](http://localhost:5000/api/events)

Alternatively, you can run them in separate terminals:

```bash
# Terminal 1: Backend Server
cd server
npm run dev

# Terminal 2: Frontend Client
cd client
npm run dev
```

---

## 🔐 Environment Variables

| Scope | Variable | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **Server** | `MONGO_URI` | **Yes** | — | MongoDB Atlas SRV URI or local MongoDB connection string. |
| **Server** | `JWT_SECRET` | **Yes** | — | Cryptographic key used to sign and verify session JWTs. |
| **Server** | `JWT_EXPIRES_IN` | No | `7d` | Token expiration duration. |
| **Server** | `PORT` | No | `5000` | Port on which the Express server listens. |
| **Server** | `NODE_ENV` | No | `development` | Node environment (`development` or `production`). |
| **Server** | `CLIENT_URL` | **Yes** | `http://localhost:5173` | Allowed origin for CORS and cookie dispatch. |
| **Server** | `SEED_CONFIRM` | No | `false` | Safety guard to prevent accidental database wiping. |
| **Server** | `SEED_ADMIN_EMAIL` | No | `admin@nie.ac.in` | Default seed administrator email. |
| **Server** | `SEED_ADMIN_PASSWORD` | No | `niePass2026!` | Default seed administrator password. |
| **Client** | `VITE_API_URL` | **Yes** | `http://localhost:5000/api` | Base URL consumed by the Axios client. |

---

## 🔑 Default Credentials

After running `npm run seed`, you can authenticate with the administrative account:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@nie.ac.in` | `niePass2026!` | Full Admin Operations Console, Gate Check-In, Event CRUD, CSV Export |
| **Student** | *Register on site* | *Chosen at registration* | Event Registration, Digital Admission Passes, Profile Management |

> 💡 *To test as a student, navigate to `/register` and complete the academic onboarding form with your USN (e.g. `4NI23CS045`), department, year, and section.*

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a student account with full academic profile.
* `POST /api/auth/login` — Authenticate and receive `httpOnly` session cookie.
* `GET /api/auth/me` — Retrieve active authenticated user profile.
* `POST /api/auth/logout` — Invalidate session and clear auth cookies.

### 📅 Events (`/api/events`)
* `GET /api/events` — Retrieve all published campus events (supports `?category=`, `?dept=`, `?search=`).
* `GET /api/events/:id` — Retrieve detailed information and real-time seat availability for a single event.
* `POST /api/events` — *(Admin only)* Create and publish a new campus event.
* `PUT /api/events/:id` — *(Admin only)* Update event details, date, venue, or capacity.
* `DELETE /api/events/:id` — *(Admin only)* Archive/delete an event and cascade cancel registrations.

### 🎟️ Registrations (`/api/registrations`)
* `POST /api/registrations/:eventId` — *(Student)* Atomically reserve one seat. Returns admission pass.
* `GET /api/registrations/my` — *(Student)* Fetch all active and past event passes for the logged-in student.
* `DELETE /api/registrations/:id` — *(Student)* Cancel a reservation and release the seat capacity back to the event.

### 📊 Admin Oversight (`/api/admin`)
* `GET /api/admin/dashboard` — *(Admin only)* Aggregate metrics: total events, upcoming events, total registrations, average fill rate.
* `GET /api/admin/events/:id/participants` — *(Admin only)* Detailed participant roster with USN, branch, section, and attendance status.
* `PATCH /api/admin/registrations/:id/checkin` — *(Admin only)* Toggle verified gate check-in status for an attendee.

---

## 🔒 Git & Security Policies

To safeguard production credentials and academic integrity:
1. **Never commit `.env` files**: All environment files (`server/.env`, `client/.env`, `*.local`) are explicitly ignored across root, server, and client `.gitignore` configurations.
2. **Commit templates only**: Changes to configuration keys must be reflected in `server/.env.example` and `client/.env.example`.
3. **Verify untracked secrets before pushing**:
   ```bash
   git status --ignored
   ```
   Ensure `.env` shows with `!!` (ignored) and does not appear under staged or untracked changes.

---

## 📜 License & Institutional Context

This project was engineered for academic demonstration and operational deployment as part of the **Full Stack Development Experiential Learning (FSD EL)** curriculum at the **National Institute of Engineering (NIE), Mysuru**.

All rights reserved © 2026 National Institute of Engineering, Mysuru.
