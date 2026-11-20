# Enterprise IT Helpdesk & Asset Management System (ITSM)

**A Course Project Work Report & Application Implementation**  
**Course:** Building Enterprise Applications (BCS703B) — CCA Phase-1  
**Department:** Information Science and Engineering  
**Institution:** BMS Institute of Technology & Management (Autonomous Institution Under VTU), Yelahanka, Bengaluru - 560064  
**Academic Year:** 2026-2027  

### Project Team (Dept. of ISE)
* **Pavan R Bhat** — `1BY23IS145`
* **Pracheth Kashyap** — `1BY23IS152`
* **Pranab Bhardwaj** — `1BY23IS154`
* **Puneethgouda Patil** — `1BY23IS165`

**Under the Guidance of:**  
**Mrs. Poornima GJ**, Asst. Professor, Dept. of ISE, BMSIT&M

---

## 1. System Overview & Problem Statement

Modern organizations and educational institutions rely on vast IT infrastructure (laptops, workstations, switches, access points, and software licenses). Informal reporting channels (emails, phone calls, spreadsheets) lack centralized tracking, accountability, and service-level monitoring.

This **Enterprise IT Helpdesk & Asset Management System (ITSM)** integrates support ticket lifecycle management with organizational asset tracking into a unified multi-tier enterprise architecture.

### Key Capabilities:
- **Category-Based Auto-Routing (FR-2):** Routes tickets to the appropriate support department (Hardware, Software, Network, Asset Procurement) using least-loaded round-robin agent assignment.
- **SLA Escalation Engine (FR-3, FR-6):** Real-time background sweep monitoring resolution deadlines (Critical: 4h, Urgent: 12h, Routine: 48h, Low: 72h). Automatically flags 75% warning thresholds, detects breaches, and re-prioritizes escalated tickets to the top of the queue with supervisor reassignment.
- **Hardware Asset Register & Lifecycle (FR-5):** Central registry tracking device tags, serial numbers, warranty expiry dates, departmental locations, assigned personnel, and historical repair/maintenance logs.
- **Equipment Requests & Approval Workflow (FR-4):** Priority-tiered requests (Routine, Urgent, Critical) with supervisor/admin approval and in-stock inventory allocation.
- **Multi-Channel Notification System (FR-7):** In-app notification center, unread counters, and simulated SMTP/SMS dispatch tracing.
- **Executive Analytics Dashboard (FR-8):** SLA compliance rates, Mean Time to Resolution (MTTR), ticket distribution by category/department, and asset utilization metrics with CSV report export.
- **n8n Workflow Automation:** Automated webhook bridge with exportable workflow templates for supervisor notifications and scheduled escalations.
- **AI Assist (Gemini Integration):** Ticket categorization and preliminary troubleshooting suggestions.

---

## 2. Multi-Tier Architecture Alignment

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER (React 18)                     │
│  Employee Portal  │  Support Queue  │  Asset Register  │  Executive KPI│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST APIs over HTTPS
┌───────────────────────────────────▼────────────────────────────────────┐
│                  APPLICATION / SERVICE LAYER (Node.js/Express)         │
│  Auth (JWT/RBAC)  │ Routing Engine │ SLA Engine │ Asset Service        │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │ Webhook Events
┌───────────────────▼───────────────────────────┐   ┌────────────────────▼─────────────────┐
│         DATA LAYER (MongoDB / Resilient Store) │   │     AUTOMATION LAYER (n8n & AI)      │
│ Users │ Tickets │ Assets │ Logs │ Departments │   │ n8n Webhook Flows │ Gemini AI Engine │
└───────────────────────────────────────────────┘   └──────────────────────────────────────┘
```

1. **Presentation Layer:** React 18, Tailwind CSS, Lucide icons, responsive role-based navigation with a 1-click **Viva Demo Role Switcher**.
2. **Business / Service Layer:** Node.js + Express.js modular microservice-style controllers with JWT authentication, RBAC middleware, and background SLA sweep engines.
3. **Data Layer:** MongoDB / Mongoose support with an embedded zero-configuration fallback datastore (`backend/src/data/store.json`) pre-seeded with realistic BMSIT records.
4. **Integration & Infrastructure Layer:** n8n workflow template JSON (`n8n/itsm-sla-escalation-workflow.json`), Docker container configurations, and `docker-compose.yml`.

---

## 3. Evaluation Rubrics & SRS Verification Matrix

| Requirement | Description | Implementation Status |
|---|---|---|
| **FR-1** | Employee ticket raising with categories & priority | Implemented in `CreateTicketModal.jsx` & `ticketController.js` |
| **FR-2** | Category-to-department auto-routing rules | Implemented in `routingService.js` (Hardware, Software, Network, Procurement) |
| **FR-3** | SLA monitoring & auto-escalation | Implemented in `slaEngine.js` (4h, 12h, 48h tiers with 75% warnings) |
| **FR-4** | Equipment request & approval workflow | Implemented in `AssetRequestsView.jsx` & `assetRequestController.js` |
| **FR-5** | Asset register with warranty & maintenance logs | Implemented in `AssetRegisterView.jsx` & `assetController.js` |
| **FR-6** | Escalation queue re-prioritization | Implemented in `ticketController.js` (Urgent & Breached pinned to top) |
| **FR-7** | In-app alerts & simulated email/SMS logs | Implemented in `NotificationCenter.jsx` & `notificationService.js` |
| **FR-8** | Executive dashboard & CSV reporting | Implemented in `DashboardView.jsx` & `reportController.js` |
| **NFR-1** | 99% Availability & graceful degradation | Health endpoints & embedded store fallback in `server.js` |
| **NFR-2** | SLA evaluation &lt; 10 seconds under peak load | Verified in `AutomationCenterView.jsx` (&lt; 5ms evaluation time) |
| **NFR-3** | Role-Based Access Control & secure hashing | Enforced via `auth.js`, `rbac.js`, and `bcryptjs` |
| **NFR-4** | Modular horizontal scalability | Decoupled routing, notification, and SLA background runners |

---

## 4. Quick Start Guide (Run Locally in 1 Minute)

### Prerequisites:
* Node.js v18 or higher (v22 recommended)
* npm v9 or higher

### Launch the Entire Application:
From the root project directory:
```bash
npm start
```
This single command runs `run-app.js`, which concurrently boots:
1. **Backend REST API Server:** `http://localhost:5001`
2. **Frontend React Client (Vite):** `http://localhost:3000`

Open `http://localhost:3000` in your web browser.

---

## 5. Demo Accounts & Role Switcher

For academic evaluation and viva presentations, use the **Quick Role Switcher** dropdown in the top navigation bar to test all 4 perspectives instantly:

| Role | Name | Email | Password | Primary Features |
|---|---|---|---|---|
| **Student / Employee** | Pavan R Bhat | `employee@bmsit.ac.in` | `password123` | Raise tickets, view personal hardware, submit asset requests |
| **Support Agent** | Pracheth Kashyap | `agent@bmsit.ac.in` | `password123` | Triage assigned tickets, resolve issues, view SLA countdowns |
| **IT Supervisor** | Puneethgouda Patil | `supervisor@bmsit.ac.in` | `password123` | SLA breach alerts, escalated tickets, approve asset requests |
| **Administrator** | Mrs. Poornima GJ | `admin@bmsit.ac.in` | `password123` | Executive dashboard, asset registry CRUD, CSV exports, SLA sweep |

---

## 6. Project Structure

```
.
├── package.json                 # Root launcher scripts
├── run-app.js                   # Unified development launcher
├── docker-compose.yml           # Docker deployment (Mongo, Backend, Frontend, n8n)
├── README.md                    # Project documentation & rubrics mapping
├── n8n/
│   └── itsm-sla-escalation-workflow.json  # Importable n8n workflow template
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── server.js            # Express application entry & SLA background starter
│       ├── config/              # Constants & MongoDB Atlas connection
│       ├── models/              # Schemas and entities
│       ├── services/            # SLA Engine, Routing Engine, DataStore, AI Service
│       ├── middlewares/         # JWT Verification & RBAC authorization
│       ├── controllers/         # Tickets, Assets, Requests, Reports, Notifications
│       ├── routes/              # Modular Express REST endpoints
│       └── data/                # Pre-seeded BMSIT enterprise records
└── frontend/
    ├── package.json
    ├── Dockerfile
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx              # Main application orchestrator
        ├── context/             # AuthContext & 1-click Role Switcher
        ├── services/            # Frontend API client
        ├── components/          # Navbar, Modals (Create Ticket, Details, Notifs)
        └── pages/               # Dashboard, Tickets, Assets, Requests, SLA Engine
```

---

## 7. Docker Deployment (Optional)

To spin up the multi-tier containerized stack with MongoDB, Express, React, and n8n:
```bash
docker-compose up --build
```
* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:5001`
* **n8n Workflow UI:** `http://localhost:5678`
* **MongoDB:** `localhost:27017`

