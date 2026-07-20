# 🎓 Smart Attendance System

An AI-powered face recognition attendance system for educational institutions, with separate dashboards for students and faculty.

## ✨ Features

### 👨‍🎓 Student Features
- **Face Registration**: Register facial biometrics for attendance marking
- **Attendance History**: View detailed attendance records across all classes
- **Real-time Tracking**: Monitor attendance percentage for each subject
- **Notifications**: Receive SMS alerts for low attendance
- **Dashboard**: Visual analytics of attendance trends

### 👨‍🏫 Faculty Features  
- **Class Management**: Create and manage multiple classes
- **Attendance Sessions**: Start live attendance sessions
- **Face Recognition**: Automatic attendance via AI face detection
- **Manual Override**: Mark attendance manually when needed
- **Analytics Dashboard**: View class-wide attendance statistics
- **Reports**: Export attendance data to Excel/PDF
- **Student Management**: Add/remove students from classes

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- npm or yarn
- MongoDB (optional - uses in-memory DB as fallback)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-attendance
   ```

2. **Install concurrently (for running both servers)**
   ```bash
   npm install -g concurrently
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend  
   cd ../client
   npm install
   cd ..
   ```

4. **Start the application**

   **⭐ EASIEST - Run Both Servers with One Command:**
   
   ```bash
   # On Windows - Just double-click:
   START-ALL.bat
   
   # On Linux/Mac:
   chmod +x START-ALL.sh
   ./START-ALL.sh
   ```
   
   This will start both frontend (5173) and backend (5000) together!

   **Alternative - Manual (Separate Terminals):**
   
   Open two terminal windows:
   
   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📝 Usage Guide

### First Time Setup

1. **Register as Student**
   - Go to http://localhost:5173/register
   - Select "Student" tab
   - Fill in details (Employee ID is optional)
   - Click "Create Account"

2. **Register as Faculty**
   - Go to http://localhost:5173/register
   - Select "Faculty" tab
   - Fill in details
   - **Employee ID is OPTIONAL** (auto-generated if blank)
   - Click "Create Account"

3. **Login**
   - Use your email and password
   - You'll be redirected to the appropriate dashboard

### For Students

1. **Register Your Face**
   - Navigate to "Face Registration" from sidebar
   - Allow camera access
   - Capture 3 different angles of your face
   - Click "Save Face Data"

2. **View Attendance**
   - Check your dashboard for overall statistics
   - Go to "Attendance History" for detailed records
   - View percentage for each subject

### For Faculty

1. **Create a Class**
   - Go to "Class Manager"
   - Click "New Class"
   - Fill in class details
   - Click "Save Class"

2. **Add Students**
   - Click "Manage Students" on a class card
   - Select students to enroll
   - Click "Save"

3. **Start Attendance Session**
   - Click "Start Class" on a class card
   - Enter topic (optional)
   - Session begins - students can mark attendance via face recognition
   - Monitor live attendance count
   - Click "End Session" when complete

4. **View Reports**
   - Go to "Attendance History"
   - Select a class to view detailed records
   - Export to Excel or PDF

## 🔧 Configuration

### Environment Variables

The `server/.env` file contains:

```env
PORT=5000
NODE_ENV=development

# MongoDB (falls back to in-memory DB if connection fails)
MONGODB_URI=your_mongodb_uri

# JWT Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=30d

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Twilio (for SMS notifications)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number

# CORS
CLIENT_URL=http://localhost:5173
```

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **face-api.js** for face recognition
- **Recharts** for analytics
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **TypeScript**
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Socket.io** for real-time updates
- **Cloudinary** for image storage
- **Twilio** for SMS
- **Bcrypt** for password hashing

## 📊 Database Schema

### Users
- Common fields: name, email, password, role, phone, avatar
- Roles: 'student' | 'faculty'

### Students
- Links to User
- Additional: rollNo, department, course, semester, year
- Face descriptors for recognition
- Face registration status

### Faculty
- Links to User  
- Additional: employeeId (auto-generated), department, designation

### Classes
- Created by faculty
- Contains: name, subject, department, students[], schedule
- Tracks enrollment and active status

### Attendance Sessions
- Belongs to a class
- Tracks: date, time, topic, status (active/closed)
- Real-time student count

### Attendance Records
- Individual student attendance entries
- Method: 'face' | 'manual'
- Status: 'present' | 'absent' | 'late'
- Confidence score for face recognition

## 🐛 Troubleshooting

### "Cannot connect to server" Error

**Problem**: Backend is not running

**Solution**:
```bash
cd server
npm run dev
```

### White Screen on Frontend

**Problem**: Client not loaded properly

**Solutions**:
1. Clear browser cache (Ctrl + Shift + Delete)
2. Restart the client:
   ```bash
   cd client
   npm run dev
   ```
3. Check browser console (F12) for errors

### Face Recognition Not Working

**Problems & Solutions**:
1. **Camera not detected**: Grant camera permissions in browser
2. **Models not loading**: Check internet connection (models downloaded on first use)
3. **Poor lighting**: Ensure good lighting conditions
4. **Low confidence**: Re-register face with clearer images

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues

The system automatically falls back to an in-memory MongoDB if the main connection fails. Check server console for connection status.

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Protected API routes with middleware
- ✅ CORS configuration
- ✅ Request rate limiting
- ✅ Helmet.js security headers
- ✅ Input validation and sanitization

## 📱 Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari (macOS/iOS)

**Note**: Camera access required for face recognition features.

## 🎨 UI Features

- 🌓 Dark mode support
- 📱 Fully responsive design
- ✨ Glass morphism effects
- 🎭 Smooth animations
- 📊 Interactive charts
- 🎯 Real-time updates

## 📄 API Documentation

### Authentication Endpoints

```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET  /api/auth/me - Get current user (protected)
PUT  /api/auth/update-profile - Update profile (protected)
PUT  /api/auth/change-password - Change password (protected)
```

### Student Endpoints

```
GET  /api/students/profile - Get student profile
POST /api/students/face-descriptors - Save face data
GET  /api/students/attendance - Get attendance records
GET  /api/students/classes - Get enrolled classes
```

### Faculty Endpoints

```
POST /api/faculty/classes - Create class
GET  /api/faculty/classes - Get all classes
GET  /api/faculty/classes/:id - Get class details
PUT  /api/faculty/classes/:id - Update class
DELETE /api/faculty/classes/:id - Delete class
POST /api/faculty/classes/:id/students - Add students
POST /api/faculty/sessions - Start attendance session
PUT  /api/faculty/sessions/:id/end - End session
GET  /api/faculty/analytics - Get analytics
```

### Attendance Endpoints

```
POST /api/attendance/mark - Mark attendance
GET  /api/attendance/session/:sessionId - Get session records
GET  /api/attendance/reports - Generate reports
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- face-api.js for face recognition
- TailwindCSS for beautiful UI
- MongoDB team for excellent database
- All open-source contributors

## 📞 Support

For issues, questions, or contributions:
- Check `SETUP_GUIDE.md` for detailed setup instructions
- Open an issue on GitHub
- Check console logs for error messages

---

**Made with ❤️ for educational institutions**
