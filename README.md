# Zenith Task — Modern MERN Stack Task Tracker

Zenith Task is a premium, fully responsive, and highly animated task tracker web application built using the decoupled MERN Stack. It features a modern dark-violet glassmorphic UI, rich interactive states, and automated task-management flows.

---

## ✨ Features

### 📊 Dashboard Analytics
- **Live Metrics**: Instantly tracks Total Tasks, Active Tasks, Completed Tasks, and Expired Tasks.
- **Dynamic Progress Bar**: Stacks a gradient completion progress indicator ($0\text{--}100\%$) directly in the dashboard.
- **Time Estimation Sums**: Aggregates and displays remaining estimated hours vs. total hours and minutes (formatted dynamically as `Xh Ym`, e.g., `2h 30m`).

### 🛠️ Task Management & Views
- **Kanban Board & List Views**: Switch seamlessly between a 4-column drag-and-drop board view and a dense list view.
- **Category Filter Dropdown**: Automatically detects categories from your database tasks so you can filter results dynamically.
- **Sorting Options**: Sort tasks dynamically by *Newest First*, *Oldest First*, *Due Date: Earliest/Latest*, *Priority*, and *Less Time* (shortest estimates).

### ⌛ Automated Expiration Rules
- **Automatic Classification**: Tasks with a past due date automatically shift into the **Expired** column (highlighted in red) to protect To Do/In Progress from clutter.
- **Drop Constraints**: Manual dragging of tasks *into* the Expired column is blocked.
- **Resolution Path**: Expired tasks can only be dragged into the **Completed** column.
- **Single-Click Completion**: Toggling the status of an expired card directly resolves it into Completed, updating stats in real-time.

### 🛡️ Dual-Side Form Validation
- **Frontend Highlights**: Validates that titles are at least 3 characters and minutes are between $0\text{--}59$, rendering error borders and inline text highlights.
- **Database Validation**: Mongoose schema enforces string bounds, ensures non-negative numbers, and rejects past due dates upon creation.

---

## 📂 Project Structure

```
Task_Editor/
├── backend/                  # Express REST API
│   ├── models/
│   │   └── Task.js           # Mongoose task schema & validation constraints
│   ├── server.js             # Express routes, controller logic & DB connection
│   ├── package.json          # Node dependencies (express, mongoose, dotenv, cors)
│   └── .env                  # Port and Atlas Database connection
└── frontend/                 # React client
    ├── src/
    │   ├── App.jsx           # State orchestrator & layout template
    │   ├── App.css           # Grid systems, layouts & glassmorphism styling
    │   ├── index.css         # CSS resets, variables & theme definitions
    │   ├── services/
    │   │   └── taskService.js# Decoupled Axios API service layer
    │   └── components/
    │       ├── StatsDashboard.jsx # Analytics cards & progress line
    │       ├── Toolbar.jsx        # Search, filters, custom dropdowns & sort options
    │       ├── TaskCard.jsx       # Individual drag card with status action button
    │       └── TaskModal.jsx      # Creation/Edition form modal (Hours/Mins inputs)
    ├── package.json          # Vite + React build configurations
    └── .env                  # API url configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB local instance](https://www.mongodb.com/try/download/community) or a [MongoDB Atlas Cluster](https://www.mongodb.com/cloud/atlas)

---

### 2. Backend Setup
1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `/backend` directory:
   ```ini
   PORT=5050
   MONGODB_URI=your_mongodb_connection_string
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5050`.*

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `/frontend` directory:
   ```ini
   VITE_API_URL=http://localhost:5050/api
   ```
4. Start the Vite React client:
   ```bash
   npm run dev
   ```
   *The web app will open at `http://localhost:5173/`.*

---

## 🌐 Render Deployment (Single Web Service)

This project is configured to deploy as a **single Web Service** on Render, bundling the backend server and the static frontend build into one hosting environment.

### 1. Repository Setup
Push this workspace repository to your GitHub account.

### 2. Configure Web Service on Render
1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the following service settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Expand the **Advanced** section and add the following Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://hriturajroy_db_user:Tilak%405000@cluster0.m6xdlah.mongodb.net/task_editor?retryWrites=true&w=majority`
   - `NODE_ENV`: `production`
5. Click **Create Web Service**.

Render will automatically run the build pipeline (installing backend + frontend dependencies and compiling static assets) and launch the server. Your app will be live on a public URL!
