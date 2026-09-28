# Gujarat R&B InfraTrack 🏛️🛣️
### Unified Infrastructure Lifecycle Monitoring & Asset Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-emerald.svg)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS_Maps-brightgreen.svg)](https://leafletjs.com/)

**Gujarat R&B InfraTrack** is an enterprise-grade digital twin and infrastructure asset lifecycle management platform designed for the **Roads & Buildings Department, Government of Gujarat**. It empowers department executives, district engineers, and field inspectors with real-time condition analytics, GIS spatial visualization, predictive degradation modeling, inspection workflows, and work-order management across roads, bridges, culverts, and government administrative complexes.

---

## 🌟 Key Features & Modules

### 1. Executive Command Center (Dashboard)
- **Real-Time KPIs**: Live tracking of Total Assets, Road/Bridge network volume, Government Buildings, Critical Risk Assets, Overdue Inspections, and Active Maintenance work orders.
- **Visual Distribution Charts**:
  - Condition Health Distribution (Good, Fair, Poor, Critical).
  - Asset Category Breakdown.
  - Assets by District (Ahmedabad, Gandhinagar, Surat, Vadodara, Rajkot, Bharuch, Mehsana).
  - Work Order Progress Distribution.
- **Interactive Drill-Down**: Direct click-to-filter capability on chart bars (e.g., clicking the Ahmedabad bar instantly isolates Ahmedabad assets).
- **"What Needs Attention?" Engine**: Automated detection and prioritization of critical-condition assets and overdue inspection audits.

### 2. Physical Asset Registry & Advanced Inventory
- **Comprehensive Asset Dossiers**: Covers Bridges (RCC, Cable-Stayed, Steel Bowstring), Expressways, Highways, Box Culverts, and Government Complex Buildings.
- **Multi-Parametric Filter Drawer**:
  - Filter by Category, District, Condition Grade, and Lifecycle Status.
  - Multi-criteria sorting (Recency, Condition Score, Asset ID, Name).
  - Quick filter pills and direct single-click district selection.
- **Deep Geographic & Keyword Search**: Unified search engine querying Asset IDs, Names, Districts, Talukas, Divisions, Landmarks, and Street Addresses.
- **Full Asset Lifecycle Management**: Create new assets with auto-generated state IDs (`BR-GJ-...`, `RD-GJ-...`, etc.) and full editing capabilities (`/assets/:id/edit`).

### 3. Interactive GIS Infrastructure Map
- **Live OpenStreetMap Integration**: Geospatial visualization of state assets across Gujarat with GPS coordinates.
- **Condition-Coded Map Markers**: Color-coded pins (Green = Good, Amber = Fair, Orange = Poor, Red = Critical).
- **Regional Camera Navigation**: Dynamic pan-and-fly (`flyTo`) focusing the camera directly over specific districts (Ahmedabad, Gandhinagar, Surat, etc.).
- **Asset Inspection Popups**: Instant popups showing asset specifications, structural condition scores, and direct links to full dossiers.

### 4. Predictive Analytics & Lifecycle Intelligence
- **Degradation Modeling**: Condition Score vs. Age (years) curve analysis identifying non-linear infrastructure deterioration.
- **Capital Expenditure (CapEx) & Backlog Analysis**: Estimation of 5-year structural rehabilitation backlogs and budget forecasting.
- **District Infrastructure Benchmark**: Inter-district comparative metrics balancing asset counts against average health scores.
- **At-Risk Asset Forecasting**: Prioritized ranking of structures approaching critical deterioration thresholds.

### 5. Quality Inspections & Health Audits
- **Standardized Inspection Workflows**: Comprehensive inspection records tracking structural components (Deck/Pavement, Superstructure, Substructure, Bearings, Drainage).
- **Automated Score Recalculation**: Inspection submissions automatically update the master asset health score and recalculate next due dates.

### 6. Maintenance Work Orders & Contractor Allocation
- **End-to-End Maintenance Tracking**: Work order creation, priority assignment (Low, Medium, High, Emergency), milestone progress, and budget tracking.
- **Contractor Registry**: Association with pre-qualified engineering firms (e.g., Sadbhav Engineering, Patel Infra, PSP Projects, Dilip Buildcon, L&T Civil).

### 7. Multi-Tier Role Switcher
- **Interactive Role & Profile Switcher**: Switch between personas directly from the navigation bar without re-authenticating:
  - **Super Admin** (State-wide administrative access)
  - **District Officers** (Ahmedabad, Gandhinagar, Vadodara)
  - **Field Inspectors** (Ahmedabad, Surat)

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, React Router v6, Tailwind CSS, Lucide React Icons |
| **Data Visualization** | Recharts (Responsive bar, pie, and line charts) |
| **Geospatial (GIS)** | React-Leaflet, Leaflet, OpenStreetMap tiles |
| **Backend API** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB Atlas (Cloud NoSQL Database) |
| **State & HTTP** | React Context API, Axios |

---

## 📁 Repository Structure

```text
gujrb-infratrack/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── public/                 # Static assets & map icons
│   ├── src/
│   │   ├── components/         # Reusable UI & Layout Components
│   │   │   └── layout/         # Sidebar, TopBar (with Role Switcher)
│   │   ├── context/            # UserContext (Multi-role profile state)
│   │   ├── pages/              # Primary Application Views
│   │   │   ├── Dashboard.jsx       # Command center & analytics charts
│   │   │   ├── AssetInventory.jsx  # Registry with filter drawer & quick chips
│   │   │   ├── AssetDetails.jsx    # Full dossier with specs & timeline
│   │   │   ├── AddEditAsset.jsx    # Asset creation & modification form
│   │   │   ├── AssetMap.jsx        # GIS map with regional flyTo
│   │   │   ├── Analytics.jsx       # Degradation modeling & CapEx backlog
│   │   │   ├── InspectionsList.jsx # Audit records & schedules
│   │   │   ├── InspectionForm.jsx  # New inspection entry form
│   │   │   ├── WorkOrders.jsx      # Work order status & maintenance
│   │   │   └── WorkOrderForm.jsx   # Work order creation form
│   │   ├── services/           # Axios API configuration
│   │   ├── App.jsx             # Route definitions
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # React root with UserProvider
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Application (Node.js + Express)
│   ├── controllers/            # Route business logic
│   │   ├── assets.js           # Asset CRUD & multi-field regex search
│   │   ├── analytics.js        # Degradation & CapEx calculations
│   │   ├── dashboard.js        # KPI & attention-required aggregations
│   │   ├── inspections.js      # Inspection submissions & condition updates
│   │   ├── workOrders.js       # Maintenance work order lifecycle
│   │   └── users.js            # User profiles & role directories
│   ├── models/                 # Mongoose Data Schemas
│   │   ├── Asset.js            # Core asset schema (Technical, GIS, Condition)
│   │   ├── Inspection.js       # Audit findings & component scores
│   │   ├── WorkOrder.js        # Contractor tasks & budgets
│   │   ├── Contractor.js       # Registered engineering vendors
│   │   ├── User.js             # Administrative & field user profiles
│   │   ├── LifecycleEvent.js   # Audit logs & maintenance milestones
│   │   └── Notification.js     # System alerts & overdue notices
│   ├── routes/                 # Express API routes
│   ├── seed/                   # Database Seeder & Mock Data
│   │   ├── index.js            # Automated MongoDB Atlas seeder
│   │   └── seedData.js         # 35 Realistic Gujarat infrastructure records
│   ├── index.js                # Express app entry & MongoDB connection
│   └── package.json
│
├── .env                        # Root Environment Configuration
└── README.md                   # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or later installed
- **npm**: v9.x or later
- **MongoDB Atlas** account or a local MongoDB instance running

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Mansi2212/gujrb-infratrack.git
cd gujrb-infratrack
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the project root (or inside `server/.env`):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gujrb_infratrack?retryWrites=true&w=majority
```

In `client/.env` (optional, defaults to `http://localhost:5000/api`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 3: Seed the Database

Populate MongoDB Atlas with realistic Gujarat state assets across Ahmedabad, Gandhinagar, Surat, Vadodara, Rajkot, Bharuch, and Mehsana:

```bash
cd server
npm install
npm run seed
```

*Expected output: Seed script will generate 35 assets, 6 contractors, 6 user profiles, 7 inspections, 6 work orders, and 80+ lifecycle events.*

---

### Step 4: Run the Development Servers

#### 1. Start the Backend API (Port 5000)
```bash
cd server
npm run dev
# Server will run at: http://localhost:5000
```

#### 2. Start the Frontend Client (Port 5173)
```bash
cd client
npm install
npm run dev
# Web application will open at: http://localhost:5173
```

---

## 📡 Core API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/assets` | `GET` | Get paginated assets with query filters (`search`, `category`, `district`, `status`, `sortBy`) |
| `/api/assets/:id` | `GET` | Retrieve single asset dossier by MongoDB ObjectId or Asset ID (`BR-GJ-...`) |
| `/api/assets` | `POST` | Register a new infrastructure asset |
| `/api/assets/:id` | `PUT` | Update an existing asset's technical specifications and location |
| `/api/dashboard/stats` | `GET` | Fetch aggregate KPIs, condition split, category and district distributions |
| `/api/dashboard/attention` | `GET` | Retrieve critical condition assets and overdue inspections |
| `/api/analytics` | `GET` | Get predictive degradation curves, CapEx valuation, and rehabilitation backlog |
| `/api/inspections` | `GET` / `POST` | List audit records or record a new structural inspection |
| `/api/work-orders` | `GET` / `POST` | Fetch or generate maintenance work orders |
| `/api/users` | `GET` | Fetch user directory for the multi-role switcher |
| `/api/health` | `GET` | Server health check probe |

---

## 🧪 Testing Search & Filtering

Try these sample queries in the search bar or filter drawer:
- **Search `"ahmedabad"`**: Displays all 9 Ahmedabad assets (Subhash Bridge, Nehru Bridge, SG Highway, SP Ring Road, Civil Hospital Trauma Center, etc.).
- **Search `"bridge"`**: Displays all RCC, Girder, and Bowstring arch bridges across Gujarat.
- **Filter `"Critical"`**: Identifies assets with condition scores $< 40$ requiring immediate intervention.
- **GIS Map**: Select **"Ahmedabad"** from the map dropdown to fly directly over the Sabarmati corridor.

---

## 📄 License
This project is developed for educational, demonstration, and administrative evaluation purposes under the **Roads & Buildings Department, Gujarat**.