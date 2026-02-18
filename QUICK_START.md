# Quick Start Guide

## ⚠️ Important: Start Backend First!

The "failed to fetch" error occurs when the backend server is not running. Follow these steps:

## Step 1: Start the Backend Server

**Option A - Using PowerShell:**
```powershell
cd server
npm run dev
```

**Option B - Using the provided script:**
```powershell
cd server
.\start-server.ps1
```

**Option C - Using Command Prompt:**
```cmd
cd server
start-server.bat
```

You should see:
```
MongoDB Connected: ...
Server running on port 3000
```

**Keep this terminal window open!**

## Step 2: Start the Frontend

Open a **NEW terminal window** and run:
```bash
npm run dev
```

The frontend will be available at: `http://localhost:8080`

## Troubleshooting

### "Failed to fetch" error
- ✅ Make sure the backend server is running on port 3000
- ✅ Check that you see "Server running on port 3000" in the backend terminal
- ✅ Verify MongoDB connection is successful

### Backend won't start
- Check if port 3000 is already in use
- Verify the `.env` file exists in the `server` directory
- Make sure MongoDB connection string is correct

### Test Backend Connection
Open your browser and go to: `http://localhost:3000/api/health`
You should see: `{"message":"Server is running"}`

## Both Servers Must Run Simultaneously

- **Terminal 1**: Backend server (port 3000)
- **Terminal 2**: Frontend server (port 8080)
