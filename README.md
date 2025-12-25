# 🔥 HabitGraph

A modern habit tracking application built with React, TypeScript, and Node.js. Track your daily habits, visualize your progress with beautiful charts, and build lasting habits.

![HabitGraph](https://img.shields.io/badge/HabitGraph-Habit%20Tracker-orange)

## ✨ Features

- **Daily Habit Tracking** - Check off habits with optimistic UI updates
- **Analytics Dashboard** - Visualize progress with area charts, bar charts, and radial progress rings
- **Calendar Heatmap** - See your habit completion history at a glance
- **User Authentication** - Secure JWT-based auth with refresh tokens
- **Profile Management** - Update name and change password
- **Dark/Light Mode** - Toggle between themes
- **Real-time Sync** - All charts update instantly when you toggle habits

## 🛠️ Tech Stack

### Frontend

- **React 19** + TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Recharts** - Charts and visualizations
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors

### Backend

- **Node.js** + Express
- **TypeScript**
- **MongoDB** + Mongoose
- **JWT** - Authentication with refresh tokens
- **Zod** - Schema validation

## 📁 Project Structure

```
HabitGraph/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # React contexts
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript types
│   │   └── lib/            # Utilities
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # Mongoose models
│   │   ├── middleware/     # Auth, validation
│   │   └── schemas/        # Zod schemas
│   └── ...
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/HabitGraph.git
   cd HabitGraph
   ```

2. **Install dependencies**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**

   Create `.env` in `/server`:

   ```env
   MONGODB_URI=mongodb://localhost:27017/habitgraph
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   PORT=8000
   ```

   Create `.env` in `/client`:

   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Run the application**

   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev

   # Terminal 2 - Start client
   cd client
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📡 API Endpoints

### Authentication

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| POST   | `/api/auth/register` | Register new user    |
| POST   | `/api/auth/login`    | Login user           |
| POST   | `/api/auth/logout`   | Logout user          |
| POST   | `/api/auth/refresh`  | Refresh access token |
| GET    | `/api/auth/me`       | Get current user     |
| PUT    | `/api/auth/profile`  | Update profile       |
| PUT    | `/api/auth/password` | Change password      |

### Habits

| Method | Endpoint          | Description    |
| ------ | ----------------- | -------------- |
| GET    | `/api/habits`     | Get all habits |
| POST   | `/api/habits`     | Create habit   |
| PUT    | `/api/habits/:id` | Update habit   |
| DELETE | `/api/habits/:id` | Delete habit   |

### Check-ins

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| PATCH  | `/api/checkin/toggle` | Toggle habit status |

### Analytics

| Method | Endpoint                   | Description      |
| ------ | -------------------------- | ---------------- |
| GET    | `/api/analytics/dashboard` | Dashboard data   |
| GET    | `/api/analytics/year`      | Yearly overview  |
| GET    | `/api/analytics/rings`     | Habit ring data  |
| GET    | `/api/analytics/calendar`  | Calendar heatmap |

## 📝 License

MIT License

---

Built with ❤️ by A U S T E N.
