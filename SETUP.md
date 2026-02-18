# Nino Care - Full Stack Setup Guide

This project consists of a React frontend and an Express.js backend with MongoDB.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (connection string provided)

## Quick Start

### 1. Backend Setup

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `server` directory:
```
MONGODB_URI=mongodb+srv://NINO:NiNo321@cluster0.wijuqkr.mongodb.net/nino-care
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### 2. Frontend Setup

In the root directory, install dependencies (if not already done):
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:8080`

## Running Both Servers

You need to run both servers simultaneously:

1. **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

## Project Structure

```
├── server/                 # Backend Express.js server
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── server.js          # Server entry point
├── src/                   # React frontend
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   ├── lib/              # Utilities and API client
│   └── App.tsx           # Main app component
└── package.json          # Frontend dependencies
```

## Features

- User authentication (Register/Login)
- Health log tracking
- Vaccination schedule management
- Parent-Practitioner query system
- Role-based access (Parent, Practitioner, Admin)

## API Base URL

The frontend is configured to use `http://localhost:3000/api` for API requests. This is proxied through Vite in development.

## Troubleshooting

- **Backend not connecting to MongoDB:** Check your `.env` file has the correct `MONGODB_URI`
- **CORS errors:** Ensure the backend is running on port 3000
- **Frontend can't reach API:** Make sure both servers are running
