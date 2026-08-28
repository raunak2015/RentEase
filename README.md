# RentEase — Mobile Rental Marketplace Application

RentEase is a full-stack mobile rental marketplace application built with React Native (Expo) and a Node.js/Express/MongoDB backend. It allows tenants to discover flat shares, rooms, PGs, and flats while enabling property owners to create listings and manage visit requests.

---

## Repository Structure

```text
RentEase/
├── backend/            # Node.js/Express Backend API Server
├── frontend/           # React Native Expo Mobile Frontend
├── .gitignore          # Git ignore rules (ignoring secrets, builds, and spec documents)
├── README.md           # This project overview and setup guide
└── progress.md         # Persistent tracking of development status (completed/remaining work)
```

---

## Local Development Setup

### Prerequisites

- **Node.js**: v20 or later (v26 is supported)
- **npm**: v10 or later
- **MongoDB**: A running MongoDB instance (Local or Atlas Cluster)
- **Expo Go** app (installed on your iOS/Android device for testing) or an Emulator

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Update the variables in `.env` (e.g., set your `MONGO_URI` and `JWT_SECRET`).
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code using the Expo Go app or press `a` (Android) / `i` (iOS) / `w` (Web) to open the application.

---

## Git Workflow and Version Control

Development is structured into phases, and each completed task corresponds to an isolated Git commit.

### Branch Strategy
- `develop`: Primary development branch.
- `main`: Production-ready, stable releases.
- `feature/*`: Specific feature branches.
- `fix/*`: Specific bug fix branches.

### Commit Guidelines
- Keep commits small, buildable, and focused on a single logical task.
- Format: `type(scope): description` (e.g., `feat(auth): add user registration API`).
- Pushes to the GitHub remote repository should occur immediately after task commits.
