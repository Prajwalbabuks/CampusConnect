# NIE CampusConnect — Full-Stack MERN System Roadmap

This document summarizes the full-stack architecture, API specifications, and operational guide for **NIE CampusConnect (National Institute of Engineering, Mysuru)**.

---

## 1. System Architecture

- **Client (`client/`)**: React 19 + Vite 8 SPA running on `http://localhost:5173`.
  - State management with React Context (`AuthContext.jsx`).
  - Axios client with `withCredentials: true` (`client/src/services/api.js`).
  - Built-in graceful fallbacks: seamless functionality if offline or before database URI is set.
- **Backend (`server/`)**: Node.js + Express REST API running on `http://localhost:5000`.
  - MongoDB connection via Mongoose ODM (`server/src/config/db.js`).
  - Authentication: JWT tokens in `HttpOnly` cookies + bcrypt password hashing.
  - Role-based authorization (`admin` vs. `student`).
  - Atomic seat registration with concurrency locking and duplicate prevention (`{ user: 1, event: 1 }`).
- **Orchestration**: Root `package.json` with `concurrently` enabling one-command startup (`npm run dev`).

---

## 2. API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status and collegiate metadata |
| `POST` | `/api/auth/register` | Public | Student signup (with institutional parsing) |
| `POST` | `/api/auth/login` | Public | Login (sets JWT in `HttpOnly` cookie) |
| `POST` | `/api/auth/logout` | Authenticated | Clears auth cookie |
| `GET` | `/api/auth/me` | Authenticated | Fetches current user profile |
| `GET` | `/api/events` | Public | Catalog with search & category filters |
| `GET` | `/api/events/:id` | Public | Event details with remaining seat count |
| `POST` | `/api/events` | Admin | Create new event listing |
| `PUT` | `/api/events/:id` | Admin | Update event logistics or capacity |
| `DELETE` | `/api/events/:id` | Admin | Delete event and cascade cancel registrations |
| `POST` | `/api/registrations/:eventId` | Student | Atomically reserve a seat & issue ticket |
| `GET` | `/api/registrations/my` | Student | List logged-in student's passes |
| `DELETE` | `/api/registrations/:eventId` | Student | Cancel registration & restore seat |
| `GET` | `/api/admin/dashboard` | Admin | Operational metrics & recent events |
| `GET` | `/api/admin/events/:id/participants` | Admin | Enrolled student roster |
| `PATCH` | `/api/admin/registrations/:id/checkin` | Admin | Toggle entry verification (Checked In / Confirmed) |

---

## 3. Running the Project

### Running Both Servers Simultaneously (Recommended)
From the project root:
```bash
npm run dev
```
This starts:
- Express API server on `http://localhost:5000`
- Vite frontend client on `http://localhost:5173`

### Running Individually
- Backend only: `npm run server` (or `cd server && npm run dev`)
- Frontend only: `npm run client` (or `cd client && npm run dev`)

---

## 4. Connecting MongoDB

In `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/nie_campusconnect
JWT_SECRET=nie_campusconnect_super_secret_jwt_key_2026_est1946
JWT_EXPIRES_IN=7d
```

### Option A: MongoDB Atlas (Cloud — Recommended)
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Copy your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/nie_campusconnect?retryWrites=true&w=majority`.
3. Paste it as `MONGO_URI` in `server/.env`.
4. Run the seeder to populate default events and the admin account:
   ```bash
   npm run seed
   ```

### Option B: Local MongoDB
1. Start the local MongoDB service on Windows.
2. Run the database seeder:
   ```bash
   npm run seed
   ```

---

## 5. Pre-Configured Accounts

- **NIE Administrator Account**:
  - Email: `admin@nie.ac.in`
  - Password: `niePass2026!`
  - Role: `admin` (Access to Operations Dashboard, Manage Events, Attendance Rosters)
- **Sample Student Account**:
  - Email: `2024cs_arun_a@nie.ac.in`
  - Password: `niePass2026!`
  - Role: `student` (USN: `4NI24CS021`, Branch: Computer Science & Engineering, Section: Section A)
