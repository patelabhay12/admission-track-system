# admission-track-system — University Admissions Dashboard

> A professional, role-based internal dashboard for tracking student leads, applications, and admissions across a university sales operation. Built with **React 18 + Tailwind CSS + Vite**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Getting Started](#3-getting-started)
4. [Demo Credentials](#4-demo-credentials)
5. [Project Structure](#5-project-structure)
6. [Pages & Features](#6-pages--features)
   - [Login Page](#61-login-page)
   - [Dashboard Overview](#62-dashboard-overview)
   - [Leads Management](#63-leads-management)
   - [Applications](#64-applications)
   - [Analytics](#65-analytics)
7. [Component Reference](#7-component-reference)
8. [Role-Based Access Control (RBAC)](#8-role-based-access-control-rbac)
9. [State Management & Contexts](#9-state-management--contexts)
10. [Data Architecture](#10-data-architecture)
11. [Filtering Engine](#11-filtering-engine)
12. [KPI Metrics Logic](#12-kpi-metrics-logic)
13. [Design System](#13-design-system)
14. [Security Constraints](#14-security-constraints)
15. [Connecting a Real Backend](#15-connecting-a-real-backend)
16. [Environment & Build](#16-environment--build)

---

## 1. Project Overview

UniTrack is a **single-page internal tool** for university admissions teams. It gives internal staff visibility into the three-stage student lifecycle:

```
Lead  →  Application (paid ₹500 reg. fee)  →  Admission (enrolled + full fee paid)
```

The dashboard is **view-only** — no data export, no download buttons anywhere. Access is strictly governed by role; each user only sees data within their permitted scope.

---

## 2. Tech Stack

| Layer        | Technology                            |
|--------------|---------------------------------------|
| UI Framework | React 18 (Hooks, Context API)         |
| Styling      | Tailwind CSS v3 + inline styles       |
| Build Tool   | Vite 5                                |
| Fonts        | Sora (headings) + DM Sans (body)      |
| State        | React Context API (no Redux)          |
| Routing      | Custom NavContext (no React Router)   |
| Data         | Mock JS data (swap with REST/GraphQL) |
| Package Mgr  | npm                                   |

---

## 3. Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/admission-track-system.git
cd admission-track-system

cd client
# 2. Install dependencies
npm install

cd server
# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# → http://localhost:5173
```

### Build for Production

```bash
npm run build     # Outputs to /dist
npm run preview   # Preview the production build locally
```

---

## 4. Demo Credentials

| Role    | Email                   | Password    | Access Scope                              |
|---------|-------------------------|-------------|-------------------------------------------|
| Admin   | admin@university.edu    | admin123    | All data, all teams, all filters          |
| Manager | priya@university.edu    | manager123  | Priya's team only (Amit, Sneha, Ravi)     |
| Manager | rahul@university.edu    | manager123  | Rahul's team only (Deepika, Karan, Meera) |

---

## 5. Project Structure

```
admissions-dashboard/
├── index.html                              # Vite HTML entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
│
└── src/
    ├── main.jsx                            # ReactDOM root mount
    ├── App.jsx                             # Auth guard → Login or Dashboard
    ├── index.css                           # Global styles + Tailwind directives
    │
    ├── context/
    │   ├── AuthContext.jsx                 # Login, logout, current user, role helpers
    │   ├── DashboardContext.jsx            # Dashboard filter state + metric computation
    │
    │
    ├── data/
    │   └── mockData.js                     # Seed data: users, leads, applications, team mapping
    │
    └── components/
        ├── auth/
        │   └── LoginPage.jsx               # Login form with demo credential buttons
        │
        ├── layout/
        │   ├── Sidebar.jsx                 # Navigation sidebar (nav-context aware)
        │   └── Topbar.jsx                  # Header: page title, role badge, date
        │
        ├── dashboard/
        │   ├── DashboardPage.jsx           # Root layout shell + SPA page router
        │   ├── KPIMetrics.jsx              # 6 KPI cards with animated progress bars
        │   ├── ProgramBreakdown.jsx        # Horizontal bar chart by program
        │   ├── CounsellorPerformance.jsx   # Ranked counsellor stats table
        │   ├── TopStates.jsx               # Top 5 states by lead volume
        │   └── RecentLeads.jsx             # Scrollable recent leads mini-table
        │   └── FiltersPanel.jsx            # Reactive filter dropdowns (RBAC-aware)
        │   └── LeadsPage.jsx               # Full leads table: search, sort, filter, pagination, drawer
        │   └── ApplicationsPage.jsx        # Applications + fee tracking table + detail drawer
            └── AnalyticsPage.jsx           # Charts: funnel, monthly trend, program bars, heatmap, geo
```

---

## 6. Pages & Features

### 6.1 Login Page

**File:** `src/components/auth/LoginPage.jsx`

The entry point of the app. Users must sign in before accessing any data.

**Features:**
- Email + password form with inline validation
- Show / hide password toggle button
- One-click **Demo: Admin** and **Demo: Manager** buttons that auto-fill credentials
- Animated error message box on failed login attempt
- Simulated async login delay (800ms) mimicking a real API call
- Gradient dark background with geometric decorative glow elements
- "View Only" and "Secure" status badges in the footer

**Authentication Flow:**
```
User submits form
  → Credentials checked against mockData.users
  → Match found:  user object (without password) stored in AuthContext → redirect to Dashboard
  → No match:     error message "Invalid credentials" displayed inline
```

---

### 6.2 Dashboard Overview

**File:** `src/components/dashboard/DashboardPage.jsx`

The default landing page after login. Provides a real-time bird's-eye view of the admissions pipeline.

**Fixed layout optimised for 1920×1080 (no vertical scrolling):**
```
┌──────────────────────────────────────────────────────────────────┐
│  Topbar: page title · date · role badge · view-only badge        │
├────────────────────────────────────────────────────────────────  │
│  KPI Row (6 metric cards)                                        │
├──────────────────────────────────────────────────────────────────│
│  Filters Panel (reactive dropdowns)                              │
├──────────────┬──────────────┬────────────┬───────────────────────┤
│  Program     │  Counsellor  │  Top       │  Recent Leads         │
│  Breakdown   │  Performance │  States    │  (scrollable table)   │
└──────────────┴──────────────┴────────────┴───────────────────────┘
```

**Sub-components on this page:**

#### KPI Metrics (`KPIMetrics.jsx`)

6 Key Performance Indicators in a responsive 6-column grid:

| # | KPI Card | Formula |
|---|----------|---------|
| 1 | Total Leads | All leads in RBAC scope |
| 2 | Total Applications | Leads with status = Application OR Admission |
| 3 | Total Admissions | Leads with status = Admission |
| 4 | Lead → Application % | Applications ÷ Total Leads × 100 |
| 5 | Lead → Admission % | Admissions ÷ Total Leads × 100 |
| 6 | Application → Admission % | Admissions ÷ Applications × 100 |

- Cards 4–6 (rate KPIs) include an animated progress bar fill
- All values update instantly when filters change
- Skeleton placeholder cards shown while data is computing

#### Program Breakdown (`ProgramBreakdown.jsx`)

Horizontal bar chart showing lead volume and admission conversion rate per program:
- **MBA** — indigo · **B.Tech** — cyan · **MCA** — emerald · **BCA** — amber
- Bar width proportional to lead count vs. the highest program
- Conversion rate badge (admitted ÷ leads × 100) shown per program

#### Counsellor Performance (`CounsellorPerformance.jsx`)

Ranked leaderboard sorted by admissions descending:
- 🥇 🥈 🥉 medals for top 3 performers, initials avatar for the rest
- Columns: Name | Leads | Applications | Admissions
- Admission count highlighted in emerald green when > 0

#### Top States (`TopStates.jsx`)

Bar chart of the top 5 states by total lead volume:
- Percentage of total leads shown per state
- Gold text highlight for rank #1
- Proportional gradient fill bars in distinct colours per rank

#### Recent Leads (`RecentLeads.jsx`)

Scrollable mini-table of the most recent leads in scope:
- Columns: Student (avatar + name) | State | Program tag | Owner | Status pill
- Status pills colour-coded: Lead (blue), Application (purple), Admission (green)

#### Filters Panel (`FiltersPanel.jsx`)

See Section 11 for full filtering documentation.

---

### 6.3 Leads Management

**File:** `src/components/leads/LeadsPage.jsx`

A full-featured sortable, searchable, filterable data table for all leads.

#### Summary Stat Cards

| Card | Value |
|------|-------|
| Total Leads | All leads in RBAC scope |
| At Lead Stage | Leads with `leadStatus = "Lead"` |
| Applications | Leads with `leadStatus = "Application"` |
| Admissions | Leads with `leadStatus = "Admission"` |

#### Search

- Real-time text search across: student name, user ID, city, lead owner
- Automatically resets to page 1 on input

#### Status Filter Tabs

Toggle button group: **All | Lead | Application | Admission**

- Active tab highlighted in indigo
- Resets pagination on change

#### Dropdown Filters

- **Program** — MBA / B.Tech / MCA / BCA
- **State** — All states in scope

#### Table Columns

| Column | Details |
|--------|---------|
| Student | Colour-coded initials avatar + full name |
| ID | `user_id` in monospace font |
| Contact | Mobile number |
| State / City | State (bold) + city (muted) stacked |
| Program | Colour-coded badge per program |
| Lead Owner | Assigned counsellor's full name |
| Reg. Date | Formatted: "10 Jan 2024" |
| Status | Coloured pill with animated dot indicator |

#### Sorting

- Click any column header to toggle asc / desc sort
- Active sort column header highlighted in indigo
- Chevron icon shows current direction

#### Pagination

- 10 records per page
- Controls: First « | ‹ Prev | page numbers | Next › | Last »
- Shows: "Page X of Y · Z total"
- Page number buttons highlight the current page in indigo

#### Detail Drawer

- Click any row → slide-in right-side drawer (280px wide)
- Highlights the selected row in indigo tint
- Drawer content: avatar, name, user ID, status badge, mobile, state, city, program, lead owner, registration date
- Click the same row again or the ✕ button to close the drawer

---

### 6.4 Applications

**File:** `src/components/applications/ApplicationsPage.jsx`

Focuses on students who entered the application pipeline (paid ₹500 registration fee), tracking their progress toward full admission and displaying fee details.

#### Data Merging

This page merges `leadsData` with `applicationsData` on `user_id` to combine:
- Lead fields: name, state, city, program interested, owner, status
- Application fields: programJoined, admissionFee, registrationFee

Only leads with `status = "Application"` or `"Admission"` are shown.

#### Revenue Summary Cards

| Card | Formula |
|------|---------|
| Total Applications | All applicants in RBAC scope |
| Admitted | Applicants with `status = "Admission"` |
| In Progress | Applicants with `status = "Application"` |
| Reg. Fee Collected | ₹500 × number of applicants |
| Admission Revenue | Sum of all `admissionFee` values |

#### Table Columns

| Column | Details |
|--------|---------|
| Student | Avatar + name + state, city |
| ID | `user_id` in monospace |
| Program Applied | Original program of interest |
| Program Joined | Program enrolled in (if admitted) — dash if not yet |
| Lead Owner | Assigned counsellor |
| Reg. Fee | Always ₹500 in emerald green |
| Admission Fee | Amount in indigo if > 0, "Pending" in muted gray otherwise |
| Stage | Application (purple) or Admission (green) pill |

#### Fee Display Logic

```
registrationFee > 0  → always ₹500, shown in emerald
admissionFee > 0     → shown in indigo (student is admitted)
admissionFee = 0     → "Pending" shown in muted gray
programJoined != null → colored program badge
programJoined = null  → dash "—"
```

#### Filters

Search (name / ID / owner), Status tabs (All | Application | Admission), Program dropdown

#### Detail Drawer

Click any row to open a right-side drawer showing:
- **Fee Summary card** — Registration Fee + Admission Fee + Total
- State / city, Program Applied, Program Joined, Lead Owner, Current Stage

---

### 6.5 Analytics

**File:** `src/components/analytics/AnalyticsPage.jsx`

A scrollable page of multiple charts and data visualisations, all computed from the logged-in user's RBAC-scoped data.

#### Revenue KPIs (top row — 5 cards)

| Card | Formula |
|------|---------|
| Total Revenue | All admission fees + all registration fees |
| Admission Revenue | Sum of `admissionFee` for admitted students |
| Avg Fee per Admission | Total admission fees ÷ admitted count |
| Lead → App Rate | Applications ÷ Leads × 100 |
| App → Admission Rate | Admissions ÷ Applications × 100 |

#### Conversion Funnel

Visual three-stage funnel with proportional horizontal bars:

```
Leads        ████████████████████████████████  25  (baseline 100%)
Applications ███████████████████  16  (64.0% → application)
Admissions   ██████████  9   (36.0% → admission)
```

- Each stage bar fills proportionally relative to lead total
- Drop arrows between stages show the conversion rate step
- Value label shown inside filled portion

#### Monthly Registration Trend (SVG Line Chart)

- Three overlapping series: **Leads** (blue), **Applications** (purple), **Admissions** (green)
- SVG drawn directly from computed data — no external chart library required
- Translucent area fills beneath each line
- Month labels on x-axis, horizontal grid lines at 0%, 25%, 50%, 75%, 100%
- Colour-coded legend above the chart

#### Lead Distribution by Program (Bar Chart)

- One bar per program: MBA, B.Tech, MCA, BCA
- Bar width = program's share of total leads
- Conversion rate badge (admitted ÷ leads × 100) per program
- Colour-coded dot + bar gradient per program

#### Counsellor Performance Breakdown (Stacked Bar)

- One entry per counsellor, sorted by lead volume
- Primary bar: total leads (blue→indigo gradient), proportional width
- Sub-bar beneath: Applications (purple tint) | Admissions (green tint) segments
- Conversion rate badge per counsellor
- Three-item legend below

#### Geographic Lead Distribution (Top 8 States)

4-column grid of state cards showing:
- State name + lead count
- Proportional fill bar (relative to the top state)
- Admission count below the bar
- Conversion rate badge (top-right of card)

#### Team Scope Badge (top-right of header)

| Role | Badge shows |
|------|-------------|
| Admin | "All Teams" (indigo) |
| Manager | "[Manager Name]'s Team" (cyan) |

---

## 7. Component Reference

| Component | File | Purpose |
|-----------|------|---------|
| `LoginPage` | `auth/LoginPage.jsx` | Authentication form with demo shortcuts |
| `DashboardPage` | `dashboard/DashboardPage.jsx` | Root layout shell + SPA page router |
| `KPIMetrics` | `dashboard/KPIMetrics.jsx` | 6 KPI stat cards |
| `ProgramBreakdown` | `dashboard/ProgramBreakdown.jsx` | Program-level bar chart |
| `CounsellorPerformance` | `dashboard/CounsellorPerformance.jsx` | Ranked counsellor leaderboard |
| `TopStates` | `dashboard/TopStates.jsx` | Top 5 states bar chart |
| `RecentLeads` | `dashboard/RecentLeads.jsx` | Mini scrollable leads table |
| `FiltersPanel` | `filters/FiltersPanel.jsx` | Reactive RBAC-aware filter dropdowns |
| `Sidebar` | `layout/Sidebar.jsx` | Left navigation with active page highlighting |
| `Topbar` | `layout/Topbar.jsx` | Header bar with title, role badge, date |
| `LeadsPage` | `leads/LeadsPage.jsx` | Full leads table with search, sort, filter, pagination, drawer |
| `ApplicationsPage` | `applications/ApplicationsPage.jsx` | Applications table with fee data + detail drawer |
| `AnalyticsPage` | `analytics/AnalyticsPage.jsx` | All analytics charts and KPIs |

---

## 8. Role-Based Access Control (RBAC)

### Roles

| Role | Scope |
|------|-------|
| `admin` | Global — sees all leads, all teams, all counsellors |
| `manager` | Restricted — sees only leads owned by counsellors in their team |

### Team Mapping

The `teamMapping` table in `mockData.js` defines which counsellors belong to which manager:

```js
export const teamMapping = [
  { managerName: "Priya Mehta", counsellorName: "Amit Kumar"    },
  { managerName: "Priya Mehta", counsellorName: "Sneha Patel"   },
  { managerName: "Priya Mehta", counsellorName: "Ravi Nair"     },
  { managerName: "Rahul Gupta", counsellorName: "Deepika Joshi" },
  { managerName: "Rahul Gupta", counsellorName: "Karan Singh"   },
  { managerName: "Rahul Gupta", counsellorName: "Meera Reddy"   },
];
```

### Scoping Logic (applied on every page)

```js
// Applied independently in: DashboardContext, LeadsPage, ApplicationsPage, AnalyticsPage
if (!isAdmin && currentUser?.managerName) {
  const myCounsellors = teamMapping
    .filter(t => t.managerName === currentUser.managerName)
    .map(t => t.counsellorName);
  leads = leads.filter(l => myCounsellors.includes(l.leadOwner));
}
```

### UI Differences by Role

| UI Element | Admin | Manager |
|------------|-------|---------|
| Manager filter dropdown (Dashboard) | ✅ Visible | ❌ Hidden |
| Counsellor filter options | All 6 counsellors | Only their team (3) |
| Analytics scope badge | "All Teams" | "[Name]'s Team" |
| Data shown | All 25 sample leads | Their team's leads only |
| Role badge colour in Topbar | Indigo | Cyan |
| Admin nav section in Sidebar | ✅ Visible | ❌ Hidden |

### View-Only Enforcement

- No export or download buttons on any page
- No print styles or triggers anywhere
- "View Only" badge permanently displayed in the Topbar
- No data mutation actions (no create, update, or delete)

---

## 9. State Management & Contexts

### AuthContext (`src/context/AuthContext.jsx`)

Manages authentication across the entire app. Wraps the root `App` component.

```js
const { currentUser, login, logout, error, loading, isAdmin, isManager } = useAuth();
```

| Value | Type | Description |
|-------|------|-------------|
| `currentUser` | object \| null | Logged-in user object (password stripped) |
| `login(email, pass)` | async fn | Validates credentials, sets user in state |
| `logout()` | fn | Clears user state, returns to login screen |
| `error` | string | Login failure message |
| `loading` | boolean | True during the async login delay |
| `isAdmin` | boolean | Shorthand: `currentUser?.role === 'admin'` |
| `isManager` | boolean | Shorthand: `currentUser?.role === 'manager'` |

Password security:
```js
// Password is stripped before storing in state
const { password: _, ...safeUser } = user;
setCurrentUser(safeUser);
```

---

### DashboardContext (`src/context/DashboardContext.jsx`)

Manages the Dashboard overview filter state and computes all metrics reactively. Only used on the Dashboard page — Leads/Applications/Analytics pages manage their own local filter state.

```js
const { filters, updateFilter, resetFilters, metrics, recentLeads, loading } = useDashboard();
```

| Value | Type | Description |
|-------|------|-------------|
| `filters` | object | `{ state, city, program, counsellor, manager }` |
| `updateFilter(key, value)` | fn | Updates one filter key, triggers recompute |
| `resetFilters()` | fn | Clears all active filters |
| `metrics` | object | All KPIs and chart datasets |
| `recentLeads` | array | First 8 leads after filtering |
| `loading` | boolean | True while async computation runs |

`metrics` object shape:
```js
{
  totalLeads,
  totalApplications,
  totalAdmissions,
  leadToApp,          // "48.0" (string, 1 decimal place)
  leadToAdm,          // "36.0"
  appToAdm,           // "56.3"
  programBreakdown: [ { program, leads, admissions } ],
  counsellorData:   [ { name, leads, applications, admissions } ],
  topStates:        [ { state, count } ],
}
```

---

### NavContext (`src/context/NavContext.jsx`)

Lightweight client-side routing. Controls which page component is rendered.

```js
const { activePage, setActivePage } = useNav();
// activePage: "dashboard" | "leads" | "applications" | "analytics" | "teams"
```

`DashboardPage.jsx` uses this to conditionally render pages:
```jsx
function PageContent() {
  const { activePage } = useNav();
  if (activePage === "leads")        return <LeadsPage />;
  if (activePage === "applications") return <ApplicationsPage />;
  if (activePage === "analytics")    return <AnalyticsPage />;
  if (activePage === "teams")        return <TeamsPlaceholder />;
  return <DashboardMain />;  // default
}
```

---

## 10. Data Architecture

### Users (`mockData.js`)

```js
{
  id: 1,
  name: "Arjun Sharma",
  email: "admin@university.edu",
  password: "admin123",          // Stripped before storing in state
  role: "admin",                 // "admin" | "manager"
  managerName: null,             // Set for managers — used for RBAC lookup
  avatar: "AS"                   // 2-letter initials string
}
```

### Leads (25 records)

```js
{
  user_id: "U001",
  studentName: "Ananya Roy",
  mobile: "9876543210",
  state: "Maharashtra",
  city: "Mumbai",
  programInterested: "MBA",         // "MBA" | "B.Tech" | "MCA" | "BCA"
  leadStatus: "Lead",               // "Lead" | "Application" | "Admission"
  registrationDate: "2024-01-10",
  leadOwner: "Amit Kumar"           // Counsellor name
}
```

### Applications (16 records)

Only students who have progressed beyond Lead stage:

```js
{
  user_id: "U003",           // Foreign key → Leads table
  studentName: "Ishaan Kapoor",
  mobile: "9876543212",
  state: "Karnataka",
  city: "Bangalore",
  programJoined: "MBA",      // null if application pending; program name if admitted
  admissionFee: 85000,       // 0 if not admitted; fee amount if enrolled
  registrationFee: 500       // Always 500 if application exists
}
```

### Team Mapping (6 records)

```js
{
  managerName: "Priya Mehta",
  counsellorName: "Amit Kumar"
}
```

---

## 11. Filtering Engine

### Dashboard Filters (DashboardContext)

Applied in sequence after RBAC scoping:

| Filter Key | Available To | Behaviour |
|------------|--------------|-----------|
| `state` | Both roles | Filters by `lead.state`; clears `city` on change |
| `city` | Both roles | Filters by `lead.city`; options limited to cities in selected state |
| `program` | Both roles | Filters by `lead.programInterested` |
| `counsellor` | Both roles | Manager sees only their team's counsellors |
| `manager` | Admin only | Filters all leads under that manager's counsellors |

**Cascade rule:** Selecting a State resets the City filter and repopulates the City dropdown with only cities from that state.

**Reactivity:** Every `updateFilter()` call triggers `computeMetrics()` → all 6 KPIs and 4 charts recompute and all Dashboard components re-render automatically.

**Visual feedback:**
- Active filter selects highlighted in indigo background + border
- Active filter count badge shown next to "Filters" heading
- "Clear all" button appears when at least one filter is active

### Leads Page Filters (local state in LeadsPage)

| Filter | Type | Affects |
|--------|------|---------|
| Search | Text input | name, user_id, city, leadOwner |
| Status | Button tabs | leadStatus (All / Lead / Application / Admission) |
| State | Dropdown | lead.state |
| Program | Dropdown | lead.programInterested |

### Applications Page Filters (local state in ApplicationsPage)

| Filter | Type | Affects |
|--------|------|---------|
| Search | Text input | name, user_id, leadOwner |
| Status | Button tabs | leadStatus (All / Application / Admission) |
| Program | Dropdown | lead.programInterested |

All page-level filters reset to page 1 when changed.

---

## 12. KPI Metrics Logic

All six KPIs are computed in `DashboardContext.jsx → computeMetrics()` after applying RBAC scope and all active filters:

```js
const totalLeads        = leads.length;

// An "Admission" counts as both an application AND an admission
const totalApplications = leads.filter(
  l => l.leadStatus === "Application" || l.leadStatus === "Admission"
).length;

const totalAdmissions   = leads.filter(
  l => l.leadStatus === "Admission"
).length;

const leadToApp = totalLeads > 0
  ? ((totalApplications / totalLeads) * 100).toFixed(1) : 0;

const leadToAdm = totalLeads > 0
  ? ((totalAdmissions / totalLeads) * 100).toFixed(1) : 0;

const appToAdm = totalApplications > 0
  ? ((totalAdmissions / totalApplications) * 100).toFixed(1) : 0;
```

> **Note:** A student with `leadStatus = "Admission"` is counted in `totalApplications` because reaching admission implies they also completed the application step (paid ₹500 registration fee).
---
