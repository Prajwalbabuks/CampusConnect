# CampusConnect — "Unslop" Design System & Interface Guidelines

This document applies the **Unslop** anti-AI-slop design methodology (originating from `heydamir/unslop`) to CampusConnect. It systematically removes generic, "vibecoded" AI design tropes and replaces them with an intentional, professional academic design system.

---

## 1. The Slop Audit: Identifying & Eliminating AI Tells

Standard AI-generated UI prototypes predictably suffer from visual clichés that make software look cheap and unpolished. Below is the explicit audit of AI slop and how CampusConnect systematically rejects it:

| AI Slop Trope (What AI typically generates) | The CampusConnect "Unslop" Rule |
| :--- | :--- |
| **Purple/Indigo Neon Gradients** (`bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600`) | **Single Tinted Neutral Ramp + 1 Accent**: Clean slate/zinc surfaces with one restrained University Cobalt accent (`#2563eb`). No multi-hue gradients. |
| **Decorative Emoji Spam** (`🎉 Welcome!`, `📅 Date:`, `📍 Venue:`, `🚀 Click Here!`) | **Zero Emojis in UI**: Strict line iconography via Lucide React (`Calendar`, `MapPin`, `Users`, `CheckCircle`) at uniform 16px/20px sizes. |
| **Hype / Marketing Copy** (*"Experience the revolutionary next-gen event experience loved by 10,000+ students!"*) | **Direct Institutional Tone**: Plain, factual language (*"College Event Management System"*, *"Discover upcoming academic seminars and workshops"*). |
| **Monotonous 3-Column Bento Cards** (Identical boxes stacked mechanically with no clear hierarchy) | **Purposeful Hierarchy**: Asymmetric layouts with primary focal points, dense data tables for administration, and clear 2-column split views for event details. |
| **Chaotic & Arbitrary Spacing** (`mt-[13px]`, `p-7`, `gap-[18px]`, uneven inner vs. outer padding) | **Strict 4px/8px Modular Scale**: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px). Spacing *inside* components is always strictly smaller than spacing *between* sections. |
| **Heavy Glowing Drop Shadows & Frosted Blur** (`shadow-2xl shadow-indigo-500/25 backdrop-blur-xl`) | **Solid Crisp Borders**: Subtle 1px structural borders (`border-zinc-200` in light mode, `border-zinc-800` in dark mode) with minimal, tight elevation shadows. |
| **Excessive Font Weights & All-Caps Badges** (`font-black uppercase tracking-widest`) | **Restrained Typography**: Sentence case for UI labels. Weights limited to 400 (regular), 500 (medium), and 600 (semi-bold). No font-black. |
| **Aimless Motion & Ambient Looping** (`animate-bounce`, continuous glowing pulses, lazy `transition-all duration-500`) | **Purposeful Spatial Transitions**: 150ms–200ms ease-out transitions applied strictly to hover, focus, and modal reveals. Zero ambient looping. |

---

## 2. Creative Direction: The CampusConnect Identity

To give the application an authentic, human-designed feel rather than a cookie-cutter template:

- **Character:** Authoritative, clean, collegiate utility.
- **World:** Where modern developer tools (like Linear, Vercel, and GitHub) meet institutional university operations.
- **Color Moments:** A neutral monochrome foundation punctuated by crisp University Cobalt (`#2563eb`) exclusively for primary triggers, active selection states, and focus rings.
- **Surfaces:** Flat, solid card surfaces with crisp 1px borders, subtle hover state changes (`hover:border-zinc-300`), and zero decorative gradients.
- **Signature Detail:** Monospaced tabular numerals (`font-mono` / `tabular-nums`) for event dates, schedule times, seat counters (`42/50`), and participant indices.

---

## 3. The Nine Unslop Polish Passes

### Pass 1: Spacing & Grid System
- All margins, paddings, and gaps strictly adhere to an 8-point base scale (with 4px for tight micro-elements):
  - Micro: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px)
  - Card Inner: `p-4` (16px) or `p-6` (24px)
  - Layout Separators: `space-y-6` (24px), `py-8` (32px), `py-12` (48px)
- Containers: Fixed `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` prevents horizontal drift on ultra-wide displays.

### Pass 2: Palette & Color Roles
- **Neutral Ramp (Zinc):**
  - Background: `#f8fafc` (Slate 50) or `#ffffff`
  - Card Surface: `#ffffff`
  - Border: `#e2e8f0` (Slate 200) / `#cbd5e1` (Slate 300 on hover)
  - Text Primary: `#0f172a` (Slate 900)
  - Text Secondary: `#475569` (Slate 600)
  - Text Muted: `#94a3b8` (Slate 400)
- **Primary Brand Accent (University Cobalt):**
  - Default: `#2563eb` (Blue 600)
  - Hover: `#1d4ed8` (Blue 700)
  - Light Tint: `#eff6ff` (Blue 50)
- **Semantic Status Colors (Desaturated, Functional):**
  - Success / Available: `#16a34a` (Green 600) with `#f0fdf4` (Green 50) badge
  - Warning / Low Seats (< 10%): `#d97706` (Amber 600) with `#fffbeb` (Amber 50) badge
  - Destructive / Full / Ended: `#dc2626` (Red 600) with `#fef2f2` (Red 50) badge

### Pass 3: Iconography Rules
- **Library:** Lucide React icons exclusively.
- **Icon Sizing:**
  - Micro / Inline: `w-3.5 h-3.5` (14px)
  - Standard UI: `w-4 h-4` (16px) or `w-5 h-5` (20px)
  - Empty State / Hero: `w-10 h-10` (40px)
- **Stroke Width:** `stroke-[1.75px]` uniformly. Never mix filled and line styles arbitrarily.

### Pass 4: Copywriting & Content Rules
- Tone: Institutional, objective, clear.
- Labels:
  - Prefer *"Register"* over *"Grab Your Ticket Now!"*
  - Prefer *"Cancel Registration"* over *"Oops, I can't make it!"*
  - Prefer *"Available Seats"* over *"Hurry! Spots flying fast!"*
- Case: Sentence case across all buttons, tab headers, table headers, and badges (e.g., *"Event schedule"*, *"Registered students"*, *"Upcoming events"*).

### Pass 5: Typography & Data Formatting
- **Font Stack:** Clean sans-serif system font or Inter (`font-sans`).
- **Hierarchy:**
  - Page Title: `text-2xl font-semibold tracking-tight text-slate-900`
  - Section Title: `text-lg font-medium text-slate-900`
  - Body Text: `text-sm text-slate-600 leading-relaxed`
  - Micro Label: `text-xs font-medium text-slate-500`
- **Data & Numbers:**
  - Any capacity numbers, dates, times, and table counters must use `font-mono text-sm tabular-nums` to ensure exact column alignment.

### Pass 6: Layout & Density
- **Public Catalog:** 3-column responsive grid on desktop, 2-column tablet, 1-column mobile. Cards emphasize date, venue, and remaining seats without overflowing fluff.
- **Event Detail Page:** Asymmetrical 2-column layout (65% content left, 35% sticky registration action card right).
- **Admin Management:** Professional tabular data view (`<table>`) with clear column sorting, density toggle, and row actions rather than oversized cards.

### Pass 7: Micro-Details & Borders
- **Borders over Shadows:** Replace heavy drop shadows with `border border-slate-200 shadow-sm`.
- **Corner Radii:** Consistent `rounded-lg` (8px) for cards and inputs; `rounded-md` (6px) for buttons and badges. No balloon-like `rounded-3xl`.
- **Form Controls:** Clean input fields with `focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors`.

### Pass 8: Visual Surfaces & Illustrations
- Zero floating 3D spheres, glowing ambient gradients, or decorative abstract shapes.
- Visual elements are 100% functional:
  - Clean capacity fill bars (`h-2 bg-slate-100 rounded-full overflow-hidden` with `bg-blue-600` fill).
  - Clean calendar date blocks: Left-aligned date chip showing 3-letter month and 2-digit day (`OCT 24`).

### Pass 9: Purposeful Motion & States
- **Transitions:** Target explicit properties only (e.g. `transition-colors duration-150 ease-out`). Never use `transition-all duration-500`.
- **States:**
  - **Loading:** Subtle monochromatic skeleton pulses (`bg-slate-200/70 animate-pulse`).
  - **Empty States:** Subtle Lucide icon inside a circular container + clean headline and action button.
  - **Interactive Feedback:** Modals fade in over a semi-transparent `bg-slate-900/40 backdrop-blur-sm` overlay.

---

## 4. Component Comparison: AI Slop vs. Unslop Standard

### Example: Event Card

#### AI Slop Version (To Avoid)
```jsx
// ❌ AI Slop: Gradients, random emojis, heavy purple drop shadow, hype copy
<div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] rounded-3xl shadow-2xl shadow-indigo-500/30">
  <div className="bg-slate-950 p-7 rounded-3xl">
    <span className="bg-purple-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
      🔥 HOT EVENT 🔥
    </span>
    <h3 className="text-2xl font-black text-white mt-3">⚡ AI Hackathon 2026 ⚡</h3>
    <p className="text-purple-200 mt-2">Join 1000+ top hackers for the most epic weekend ever!</p>
    <div className="mt-4 flex gap-4 text-purple-300">
      <span>📅 Nov 20</span>
      <span>📍 Main Hall</span>
    </div>
    <button className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-2xl animate-pulse">
      🚀 Claim Your Spot Now! 🚀
    </button>
  </div>
</div>
```

#### CampusConnect Unslop Version (To Implement)
```jsx
//  Unslop: Clean 1px border, neutral palette, Lucide icons, tabular numbers, direct copy
<div className="group rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors shadow-sm flex flex-col justify-between">
  <div>
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
        Workshop
      </span>
      <span className="font-mono text-xs text-slate-500 tabular-nums">
        12 seats left
      </span>
    </div>

    <h3 className="mt-3 text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
      Full Stack Web Development Workshop
    </h3>
    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
      Hands-on introduction to building REST APIs and interactive React applications.
    </p>

    <div className="mt-4 space-y-1.5 text-xs text-slate-500">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-slate-400 stroke-[1.75]" />
        <span className="font-mono tabular-nums">Nov 20, 2026 · 10:00 AM</span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-slate-400 stroke-[1.75]" />
        <span>Main Auditorium, Block C</span>
      </div>
    </div>
  </div>

  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
    <div className="w-32">
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full" style={{ width: '76%' }} />
      </div>
      <span className="font-mono text-[11px] text-slate-400 mt-1 block tabular-nums">
        38 / 50 registered
      </span>
    </div>
    <Link
      to={`/events/${event.id}`}
      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
    >
      View details
    </Link>
  </div>
</div>
```
