# Smart Attendance System - Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (or use the built-in memory server for development)

## Quick Start

### 1. Install Dependencies

#### Backend (Server)
```bash
cd server
npm install
```

#### Frontend (Client)
```bash
cd client
npm install
```

### 2. Configure Environment

The server `.env` file is already configured with:
- MongoDB connection (with automatic fallback to in-memory DB)
- JWT secret for authentication
- Cloudinary for image storage
- Twilio for SMS notifications

### 3. Start the Application

#### Option A: Run in Separate Terminals (Recommended)

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
Server will start on `http://localhost:5000`

**Terminal 2 - Frontend Client:**
```bash
cd client
npm run dev
```
Client will start on `http://localhost:5173`

#### Option B: Build and Run Production

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## Testing the Application

### 1. Access the Application
Open your browser and go to: `http://localhost:5173`

### 2. Register a New Account

#### For Students:
1. Click "Register here" on the login page
2. Select "Student" tab
3. Fill in:
   - Name, Email, Password
   - Phone (optional)
   - Roll Number (e.g., CS2024001)
   - Department (e.g., Computer Science)
   - Course (e.g., B.Tech)
   - Semester (1-8)
4. Click "Create Account"

#### For Faculty:
1. Click "Register here" on the login page
2. Select "Faculty" tab
3. Fill in:
   - Name, Email, Password
   - Phone (optional)
   - Department (e.g., Computer Science)
   - **Employee ID is OPTIONAL** (auto-generated if not provided)
   - Designation (Assistant Professor, etc.)
4. Click "Create Account"

### 3. Login
After registration, you'll be automatically logged in and redirected to:
- **Students:** `/student` dashboard
- **Faculty:** `/faculty` dashboard

## Troubleshooting

### "Cannot connect to server" Error
**Cause:** Backend server is not running on port 5000

**Solution:**
```bash
# In a new terminal
cd server
npm run dev
```

### "An error occurred" Messages
**Causes:**
1. Backend not running
2. Database connection issues
3. Network/CORS issues

**Solutions:**
1. Check that both client (5173) and server (5000) are running
2. Check server console for error messages
3. If MongoDB connection fails, the app will automatically use in-memory database

### Port Already in Use
**Solution:**
```bash
# Find and kill the process
# On Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# On Linux/Mac:
lsof -ti:5000 | xargs kill -9
```

### Module Not Found Errors
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Features

### Student Features:
- Face registration for attendance
- View attendance history
- Track attendance percentage
- View class schedules
- Receive attendance notifications

### Faculty Features:
- Create and manage classes
- Start attendance sessions
- Mark attendance via face recognition
- View attendance reports
- Export data to Excel/PDF
- Analytics dashboard

## Database

The system uses MongoDB with automatic fallback:
1. First tries to connect to MongoDB URI from `.env`
2. If connection fails, automatically starts an in-memory MongoDB server
3. Data persists during the session but is lost on restart (in memory mode)

For production, use a real MongoDB instance (local or cloud).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students/profile` - Get student profile
- `POST /api/students/face-descriptors` - Save face data
- `GET /api/students/attendance` - Get attendance records

### Faculty
- `POST /api/faculty/classes` - Create class
- `GET /api/faculty/classes` - Get all classes
- `POST /api/faculty/sessions` - Start attendance session
- `GET /api/faculty/analytics` - Get analytics data

## Security Notes

- JWT tokens are stored in localStorage
- Passwords are hashed with bcrypt
- CORS is configured for local development
- Rate limiting is enabled on API endpoints
- Helmet.js provides security headers

## Support

For issues or questions:
1. Check the console for error messages (F12 in browser)
2. Check server logs in the terminal
3. Verify both servers are running
4. Ensure ports 5000 and 5173 are available

## Recent Changes

### ✅ Employee ID is now OPTIONAL for Faculty
- Faculty can register without providing an Employee ID
- System auto-generates a unique ID if not provided
- Format: `FAC{timestamp}{random}`

### ✅ Improved Error Messages
- Better error messages when server is not connected
- Shows specific connection issues
- Guides users to start the backend server
