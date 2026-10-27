# 🌾 GramSeva – A Digital Platform for Accessible Local Services
> **Community Service Internship (CSI) Project**  
> Developed for Academic Evaluation, Mentor Inspection, and Community Technology Demonstration.

---

## 1. Project Overview

**GramSeva** is a complete, full-stack web application designed to bridge households in rural, semi-urban, and town clusters with verified, skilled local service workers (electricians, plumbers, carpenters, cleaning technicians, appliance mechanics, and domestic helpers).

Rather than relying on unorganized word-of-mouth or expensive middleman commissions, GramSeva introduces **digital accountability**, **transparent rule-based worker matching**, **email OTP verification**, and a **closed-loop feedback system**.

### Key Highlight
The application is structured for production-grade scalability:
- **MongoDB Database**: Persistent application data is backed by MongoDB (with full support for cloud clusters via **MongoDB Atlas** or local MongoDB instances), replacing local host disk files.
- **Comprehensive Dataset Schemas**: Complete data dictionary and JSON document formats for all 7 collections are documented in [`DATASET_SCHEMAS.md`](./DATASET_SCHEMAS.md).
- **Structured Modular Architecture**: Clean separation of concerns with `models/`, `controllers/`, `routes/`, `middlewares/`, `services/`, and `config/` inside `server/src/`.
- **Connected full-stack architecture**: Real React 19 + Vite frontend communicating with a modular Express backend API.
- **Honest Email Verification**: Supports EmailJS and Nodemailer SMTP, alongside a clearly identified development mode that displays verification OTPs directly for effortless testing.

---

## 2. Problem Statement

In rural and semi-urban panchayat clusters:
1. **Unorganized Services**: Finding reliable service technicians depends on informal word-of-mouth.
2. **Lack of Background Checks & Safety**: No administrative verification or approval of technician credentials.
3. **Unpredictable Pricing**: Customers are subjected to arbitrary labor fees with zero upfront estimates.
4. **No Grievance Redressal**: When repairs are substandard or cause property damage, customers have no recourse or dispute mechanism.
5. **Irregular Income for Artisans**: Skilled rural workers struggle to find consistent neighborhood employment.

---

## 3. Project Objectives

- Provide households with instant access to verified local trade professionals.
- Provide skilled workers with a professional digital identity, availability control, and fair earnings.
- Implement an algorithmic, rule-based candidate ranking system based on trade skills, calendar conflict checks, and locality/pincode proximity approximation.
- Equip platform administrators with comprehensive analytics, worker approval workflows, dispute resolution tools, and CSV data export.

---

## 4. User Roles & Core Features

### A. 👤 Customer
- **Registration & OTP Verification**: Input name, contact, password, and complete locality/pincode. Verified via 6-digit email OTP.
- **Service Booking Form**: Select service category, specify problem description, select preferred date and time slot (Morning, Afternoon, Evening), provide house address, locality, pincode, and optional image reference.
- **Transparent Base Price Estimates**: Live estimate displayed before booking creation.
- **Real-Time Booking Timeline**: Visual multi-stage status tracker:
  $$\text{REQUESTED} \longrightarrow \text{WORKER ASSIGNED} \longrightarrow \text{ACCEPTED} \longrightarrow \text{IN PROGRESS} \longrightarrow \text{AWAITING CONFIRMATION} \longrightarrow \text{COMPLETED}$$
- **Customer Cancellation**: Cancel bookings prior to service commencement with recorded reason.
- **Inspection & Completion Confirmation**: Review worker's completion notes, confirm completion, or raise a formal dispute.
- **Rating & Reviews**: Submit 1–5 star ratings, written feedback, and quality tags (*Punctuality, Work Quality, Professionalism*).

### B. 🛠️ Worker
- **Registration with Trade Profile**: Select skills, experience years, service area, and pincode.
- **Administrative Approval Gate**: Newly registered workers are placed in `PENDING_APPROVAL` status until vetted by the administrator.
- **Online/Offline Availability Toggle**: Real-time switch to indicate availability for new job dispatches.
- **Assignment Review**: Inspect assigned order details; choose to **Accept** or **Decline** (with mandatory reason forwarded to Admin).
- **Task Execution Workflow**: Mark task as **Started** (In Progress) and **Completed** (with detailed completion notes and timestamp).
- **Work History & Earnings**: Track completed bookings, cumulative calculated earnings, average star ratings, and customer reviews.

### C. 🛡️ Administrator
- **Secured Authentication**: Dedicated private admin login against backend environment credentials (no public admin registration).
- **Analytics & Metrics Cards**: Real-time stats for customers, approved workers, pending applications, active tasks, completed services, and disputes.
- **Visual Analytics (Recharts)**: Interactive category distribution bar chart and booking status pie chart.
- **Algorithmic Worker Matching**: Run transparent candidate ranking for any pending request. View mathematical score breakdown (0–100) and choose between **Manual Assignment** or **Auto-Assign Best Match**.
- **Worker Application Governance**: Inspect worker applications; approve, reject, suspend, or reactivate accounts.
- **Customer Directory**: View customer profiles, request counts, and toggle account access.
- **Dispute Resolution Center**: Review customer complaints, investigate issues, and record official administrative resolutions.
- **Data Export & Reset**: Download CSV activity reports; reset demo records to initial pristine state with one click.

---

## 5. Algorithmic Worker Matching Logic

GramSeva does **not** randomly assign workers. When an administrator inspects candidates for a booking, the backend calculates a transparent **0–100 Rule-Based Matching Score**:

| Factor | Points | Rule Description |
| :--- | :--- | :--- |
| **Skill Match** | **Mandatory** | Worker must possess the requested trade skill (e.g. Plumbing). Unqualified workers are filtered out. |
| **Approval Status** | **Mandatory** | Worker status must be `APPROVED` and account must be active. |
| **Availability Toggle** | **25 pts** | Worker is currently marked Online/Available (`isAvailable === true`). |
| **Schedule Conflict Check** | **25 pts** | Worker has **no** overlapping active booking on the requested date and time slot. |
| **Location Match** | **30 pts** | Exact Pincode Match (+20 pts) or sub-district match (+10 pts) + Locality text match (+10 pts). |
| **Customer Rating** | **10 pts** | Pro-rated by average rating: $(\text{Rating} / 5) \times 10$ points. |
| **Experience** | **10 pts** | Scaled by years in trade: $\min(\text{Experience} \times 2, 10)$ points. |

Candidates are ranked in descending order. Mentors and evaluators can inspect the exact score breakdown for each candidate inside the matching modal.

---

## 6. Technology Stack

- **Frontend**:
  - React 19
  - Vite (Build tool & development server)
  - Vanilla CSS Design System (Custom modern palette: Emerald `#16a34a`, Teal `#0d9488`, Slate neutrals)
  - Typography: Google Fonts `Outfit` (Headings) and `Inter` (UI/Body)
  - Icons: `lucide-react`
  - Analytics Charts: `recharts`
- **Backend**:
  - Node.js & Express.js
  - Authentication: JWT (`jsonwebtoken`) & `bcryptjs` password hashing
  - Email Verification: `nodemailer` (SMTP support + honest Dev Mode simulation)
  - ID Generation: `uuid`
- **Data Persistence**:
  - Concurrency-safe, atomic file writes using local JSON files in `server/data/`.

---

## 7. Folder Structure

```
csp/
├── package.json                 # Root script runner for starting both servers
├── README.md                    # Project documentation & presentation guide
├── .gitignore                   # Ignored files (node_modules, .env, .tmp)
├── scripts/
│   ├── start-all.js             # Concurrently runs server and client
│   └── test-e2e.js              # Complete 16-step automated test suite
├── server/
│   ├── package.json
│   ├── server.js                # Server entry point & seed initializer
│   ├── app.js                   # Express app, middleware & route definitions
│   ├── .env.example             # Environment template
│   ├── .env                     # Local configuration
│   ├── config/
│   │   └── db.js                # Concurrency-safe atomic JSON file manager
│   ├── data/                    # JSON database directory
│   │   ├── users.json           # Customers, workers, admin records
│   │   ├── workers.json         # Worker trade profiles & approval states
│   │   ├── categories.json      # Predefined local service categories
│   │   ├── bookings.json        # Service booking orders with audit timelines
│   │   ├── feedback.json        # Verified customer reviews and ratings
│   │   ├── notifications.json   # Role-based in-app notifications
│   │   └── otps.json            # Expiring, rate-limited email OTP hashes
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & role-based access control (RBAC)
│   │   └── errorHandler.js      # Centralized error handler
│   ├── controllers/
│   │   ├── authController.js    # Registration, OTP dispatch, login, profile
│   │   ├── customerController.js# Bookings creation, cancellation, completion, disputes
│   │   ├── workerController.js  # Tasks acceptance, rejection, start, complete
│   │   ├── adminController.js   # Stats, worker approvals, matching, CSV export
│   │   ├── categoryController.js# Service categories
│   │   ├── feedbackController.js# Customer reviews & ratings
│   │   └── notificationController.js # In-app notifications
│   └── services/
│       ├── matchingService.js   # Transparent rule-based worker ranking algorithm
│       ├── emailService.js      # Nodemailer SMTP & honest dev mode verification
│       └── seedService.js       # Realistic initial demo records & reset engine
└── client/
    ├── package.json
    ├── vite.config.js           # Vite dev server configuration & API proxy
    ├── index.html               # Responsive HTML5 entry with fonts & meta tags
    └── src/
        ├── main.jsx
        ├── App.jsx              # Root app component with providers & routing
        ├── index.css            # Custom CSS design system, cards, badges & animations
        ├── context/
        │   ├── AuthContext.jsx  # Authentication session, tokens & roles
        │   ├── ToastContext.jsx # Toast notification alert system
        │   └── NotificationContext.jsx # Live in-app notifications
        ├── components/
        │   ├── Navbar.jsx       # Header with branding, links, notifications & mobile drawer
        │   ├── Footer.jsx       # CSI project details & quick links
        │   ├── Sidebar.jsx      # Dashboard sidebar navigation
        │   ├── StatusBadge.jsx  # Distinct badges for all booking lifecycle states
        │   ├── StarRating.jsx   # Interactive & display star ratings
        │   ├── Modal.jsx        # Accessible dialog overlay
        │   └── ConfirmDialog.jsx# Action confirmation modal
        ├── pages/
        │   ├── LandingPage.jsx  # Public landing page with hero, categories, workflow & stats
        │   ├── CustomerLogin.jsx
        │   ├── CustomerRegister.jsx (with 6-digit OTP verification)
        │   ├── WorkerLogin.jsx
        │   ├── WorkerRegister.jsx (with skills selection, area & OTP)
        │   ├── AdminLogin.jsx
        │   ├── CustomerDashboard.jsx
        │   ├── WorkerDashboard.jsx
        │   └── AdminDashboard.jsx
        └── services/
            └── api.js           # Fetch wrapper with automatic JWT token attachment
```

---

## 8. Prerequisites

- **Node.js**: v18.0.0 or higher (Tested on Node v22.14.0)
- **npm**: v9.0.0 or higher (Tested on npm 10.9.2)
- **Web Browser**: Chrome, Edge, Firefox, or Safari

---

## 9. Installation & Setup Instructions

Open your terminal (Windows Command Prompt, PowerShell, or VS Code Terminal) in the project folder:

```bash
cd "c:\Users\Siva Kiran\Desktop\csp"
```

### Step 1: Install Dependencies
Run the install command for both backend and frontend:

```bash
# In Root directory
npm run install:all
```
*(Alternatively: `cd server && npm install && cd ../client && npm install`)*

### Step 2: Environment Configuration
Check `server/.env` (pre-configured out of the box):
```ini
PORT=5000
JWT_SECRET=gramseva_jwt_secret_token_key_2026_secure
ADMIN_EMAIL=admin@gramseva.in
ADMIN_PASSWORD=Admin@12345
ADMIN_NAME=GramSeva Administrator
DEV_MODE=true

# Optional: Add SMTP credentials to send actual emails
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=GramSeva <no-reply@gramseva.in>
```

> **Email Verification Note**:  
> If SMTP credentials are empty or `DEV_MODE=true`, the system operates in **Honest Development Mode**. Verification OTPs are logged in the terminal and displayed in an informative blue banner on screen, allowing evaluation without setting up an external mail server.

---

## 10. How to Run the Application

You can start both backend and frontend concurrently with a single command from the root directory:

```bash
npm run dev
```

### Alternatively, Start in Separate Terminals:

#### Terminal 1 (Backend API):
```powershell
cd server
npm run dev
```
*Backend runs at: `http://localhost:5000`*

#### Terminal 2 (Frontend Client):
```powershell
cd client
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 11. Preconfigured Demo Accounts

For project evaluation, realistic test accounts are pre-seeded:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Administrator | `admin@gramseva.in` | `Admin@12345` | Complete system access |
| **Customer** | Ramesh Kumar | `customer@gramseva.in` | `Customer@123` | Shanti Nagar (Pincode: 500001) |
| **Customer** | Priya Sharma | `priya.sharma@example.com` | `Customer@123` | Gandhi Chowk (Pincode: 500002) |
| **Worker** | Suresh Patil | `suresh.patil@gramseva.in` | `Worker@123` | Electrician (Approved, 6 yrs exp) |
| **Worker** | Anil Rao | `anil.rao@gramseva.in` | `Worker@123` | Plumber (Approved, 8 yrs exp) |
| **Worker** | Sunita Devi | `sunita.devi@gramseva.in` | `Worker@123` | House Cleaning (Approved, 4 yrs exp) |
| **Worker** | Manoj Kumar | `manoj.kumar@gramseva.in` | `Worker@123` | Painter (**Pending Approval**) |

> **Pro Tip**: Every login screen includes an **"Auto-Fill"** button for evaluators to test accounts in one click without typing credentials.

---

## 12. Complete Workflow Demonstration Guide

Follow these steps to demonstrate the end-to-end lifecycle to mentors or judges:

### 1. Public Portal & Landing Page (`http://localhost:5173`)
- Inspect the Hero section, Community Problem vs. Solution comparison, live Service Categories, interactive How It Works steps, and Testimonials.

### 2. Worker Application & Admin Approval
1. Click **Worker Portal** $\rightarrow$ **Register as a Worker**.
2. Enter details (e.g. *Kiran Varma*, skills: *Gardening*, experience: *4 years*, area: *Shanti Nagar*).
3. Click Continue; enter the 6-digit OTP displayed on the screen.
4. Profile registers with status `PENDING_APPROVAL`. Notice the informational alert banner explaining that tasks cannot be received yet.
5. Log out; sign in to **Admin Portal** (`admin@gramseva.in` / `Admin@12345`).
6. Navigate to **Worker Applications** tab. Locate *Kiran Varma* and click **Approve**. Worker status transitions to `APPROVED`.

### 3. Customer Service Request
1. Log out of admin; sign in as Customer (`customer@gramseva.in` / `Customer@123`).
2. Click **Request a Service**.
3. Select *Gardening*, describe the work (*"Lawn trimming and garden weed removal"*), choose preferred date and time slot.
4. Submit the request. Booking is created with status `REQUESTED` and unique ID `GSB-2026-xxxx`.

### 4. Algorithmic Matching & Assignment by Admin
1. Sign in to **Admin Portal**.
2. Go to **Service Bookings** tab; click **Match** next to the newly requested booking.
3. The **Algorithmic Worker Matching** modal appears, displaying ranked candidates with transparent score calculations (Skill match, conflict check, location proximity score, rating, experience).
4. Click **Assign this Worker** (or **Auto-Assign Best Match**).
5. Booking status updates to `WORKER_ASSIGNED`.

### 5. Worker Acceptance & Task Execution
1. Sign in as the assigned Worker.
2. Under **New Assignments**, view the assigned task. Click **Accept Assignment** (status becomes `ACCEPTED`).
3. Click **Start Service Work** when work begins (status becomes `IN_PROGRESS`).
4. Click **Mark as Completed**, enter completion notes (e.g., *"Completed garden trimming and waste bagged"*), and submit. Status becomes `AWAITING_CONFIRMATION`.

### 6. Customer Confirmation & Feedback
1. Sign in as the Customer.
2. Under **Active Bookings**, notice the booking is marked `AWAITING_CONFIRMATION` with the worker's notes.
3. Click **Confirm Completion**. Booking status finalizes to `COMPLETED`.
4. The rating modal appears: select 5 stars, choose quality tags (*Punctuality, Work Quality*), enter a review, and submit.

### 7. Administrative Verification
1. Sign in as Admin.
2. View the updated **Analytics & Metrics** cards (Total completed bookings incremented, category breakdown updated).
3. Open **Feedback & Disputes** tab to inspect the customer's review.
4. Click **Export CSV** to download the complete activity report.

---

## 13. Automated Test Suite

An automated end-to-end test script is included to verify all 16 technical requirements programmatically:

```powershell
node scripts/test-e2e.js
```

**Verification Output**:
```
====================================================
   🌾 GramSeva End-to-End Workflow Verification     
====================================================
[1/16] Customer OTP Request...
✓ Customer OTP generated: 599067
[2/16] Customer Registration with OTP...
✓ Customer registered successfully, token acquired.
[3/16] Customer Login Verification...
✓ Customer authentication verified.
[4/16] Worker OTP Request...
[5/16] Worker Registration with Skills & Area...
✓ Worker registered. Status: PENDING_APPROVAL
[6/16] Admin Login & Approving Worker...
✓ Worker approved by Admin: APPROVED
[7/16] Customer Submits Service Request...
✓ Booking created: GSB-2026-xxxx (Status: REQUESTED)
[8/16] Rule-Based Candidate Matching for Booking...
✓ Algorithmic matching found suitable candidate(s).
[9/16] Admin Assigns Worker to Booking...
✓ Worker assigned. Booking status: WORKER_ASSIGNED
[10/16] Worker Accepts Assignment...
✓ Worker accepted. Status: ACCEPTED
[11/16] Worker Commences and Completes Task...
✓ Worker marked complete. Status: AWAITING_CONFIRMATION
[12/16] Customer Confirms Completion...
✓ Completion confirmed. Final Status: COMPLETED
[13/16] Customer Submits Rating & Review...
✓ 5-Star feedback submitted successfully.
[14/16] Admin Dashboard Metrics Verification...
✓ Admin metrics updated.
[15/16] Verifying Role-Based Access Control (RBAC)...
✓ Customer correctly rejected from Admin endpoint (HTTP 403 Forbidden).
✓ Unauthenticated request blocked (HTTP 401 Unauthorized).
[16/16] Verifying Data Persistence in Local JSON Files...
✓ Booking found persistently stored in server/data/bookings.json.

====================================================
🎉 ALL 16 E2E WORKFLOW TESTS PASSED SUCCESSFULLY!    
====================================================
```

---

## 14. Architecture & Technical Limitations

- **JSON Storage**: Persistent storage uses atomic file writing (`.tmp` write and rename) with sequential promise queues to prevent concurrent write collisions. While suitable for prototypes, academic demonstrations, and single-instance deployments, high-concurrency production deployments would utilize PostgreSQL or MongoDB with transaction isolation.
- **Proximity Approximation**: Without live GPS geolocation APIs or map services, worker-to-customer proximity is approximated using locality names and 6-digit postal pincodes.
- **Email Delivery**: Operates in development simulation mode by default so evaluators are never blocked by missing SMTP credentials. If a real Gmail or SMTP service is configured in `server/.env`, real HTML emails are dispatched.

---

## 15. License & Project Attribution

Developed as a Community Service Internship (CSI) Capstone Project.  
© 2026 GramSeva Platform. All rights reserved.
