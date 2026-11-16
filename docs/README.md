# CampusConnect — College Event Management System (FSD EL)

> Comprehensive architectural, flow, and UI/UX design specifications for the **CampusConnect** Full Stack Development (FSD) Experiential Learning project.

---

## 📌 Project Overview

**CampusConnect** is a centralized college event management web platform built using the **MERN** stack (MongoDB, Express.js, React, Node.js). It eliminates fragmented event notices and registration chaos by providing students with self-service event registration and administrators with real-time event publishing and attendee oversight.

- **Technology Stack:** MongoDB Atlas, Express.js, React, Node.js, Tailwind CSS v4, Zod, JWT (HttpOnly cookies).
- **Primary Roles:** `Student` and `Administrator`.
- **Target Implementation Window:** 1–2 Weeks (Academic demonstration scope).
- **Design Philosophy:** Strict **Anti-AI-Slop** design principles derived from the [`heydamir/unslop`](https://github.com/heydamir/unslop) specification.

---

## 📑 Detailed Documentation Files

This repository contains three foundational markdown planning documents:

1. **[PROJECT_FLOW_AND_ARCHITECTURE.md](./PROJECT_FLOW_AND_ARCHITECTURE.md)**
   - Problem Statement and Academic Scope.
   - Comprehensive Technology Stack Breakdown (Presentation, Application, Persistence).
   - End-to-End System Flows (Student flow, Admin flow, Request-Response cycle).
   - Complete REST API Specification (Auth, Events, Registrations, Admin Oversight).
   - Database Schemas with Mongoose relationship diagrams and compound unique indexes.
   - Core Security & Integrity Rules (Atomic capacity check, role authorization, HttpOnly cookies).

2. **[SCREENS_AND_COMPONENTS.md](./SCREENS_AND_COMPONENTS.md)**
   - Complete Directory of all 12 Application Screens:
     - `/` — Home / Landing Page
     - `/login` — Unified Authentication Screen
     - `/register` — Student Registration Screen
     - `/events` — Event Catalog & Search Directory
     - `/events/:id` — Event Detail & Availability Screen
     - `/my-registrations` — Student Registered Events Dashboard
     - `/profile` — Student Profile Overview
     - `/admin` — Administrator Analytics Dashboard
     - `/admin/events` — Event Listing & Management Table
     - `/admin/events/new` — Create Event Authoring Form
     - `/admin/events/edit/:id` — Edit Event Form
     - `/admin/events/:id/participants` — Attendee & Participant Roster
   - Modular Component Inventory (Atoms, Molecules, Organisms).
   - Wireframe layouts, states (Loading, Empty, Success, Error), and interactive triggers.

3. **[UNSLOP_DESIGN_SYSTEM.md](./UNSLOP_DESIGN_SYSTEM.md)**
   - Direct Slop Audit: Explicit removal of neon purple gradients, floating orbs, decorative emoji labels, hype copy, and chaotic spacing.
   - 5-Line Creative Direction Statement for CampusConnect.
   - Implementation of the Nine Ordered Unslop Passes:
     1. *Spacing:* Strict 4px/8px modular scale.
     2. *Color:* Slate neutral ramp + 1 University Cobalt accent (`#2563eb`).
     3. *Icons:* Lucide React line icons (uniform 16px/20px, 1.75px stroke, 0 emojis).
     4. *Copy:* Direct, institutional, objective language.
     5. *Typography:* Sans system font, weights capped at 600, tabular monospaced numbers.
     6. *Layout:* Asymmetrical layouts and clean data tables over cookie-cutter cards.
     7. *Details:* Crisp 1px solid borders over blurry shadows.
     8. *Visuals:* Functional capacity bars and date chips over decorative blobs.
     9. *Motion:* 150ms ease-out transitions solely for active state changes.
   - Side-by-side component comparison: AI Slop vs. Human-Engineered Unslop.

---

## 🚀 Quick Reference: Routes & Roles

| Route | Role / Access | Key Purpose |
| :--- | :--- | :--- |
| `/` | Public | Institutional portal landing and upcoming event highlights |
| `/login` | Public | Secure credentialed login; routes based on role |
| `/register` | Public | Student account registration (forces `role: 'student'`) |
| `/events` | Public | Full event directory with search and category filtering |
| `/events/:id` | Public / Action Authed | Event details and seat reservation |
| `/my-registrations` | Student | Active registrations and seat cancellation |
| `/profile` | Student | User profile overview |
| `/admin` | Admin Only | Administrative overview and KPI metrics |
| `/admin/events` | Admin Only | Full event CRUD management table |
| `/admin/events/new` | Admin Only | Create and publish a new event |
| `/admin/events/edit/:id` | Admin Only | Modify existing event details and capacity |
| `/admin/events/:id/participants` | Admin Only | Event attendee list and registration timestamps |
