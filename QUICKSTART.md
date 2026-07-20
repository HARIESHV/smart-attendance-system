# 🚀 Quick Start Guide

Get Smart Attendance System running in under 2 minutes!

## ⚡ Super Quick Start (One Command!)

### **Windows Users:**
1. Open the project folder
2. **Double-click** `START-ALL.bat`
3. Wait for both servers to start
4. Open browser: http://localhost:5173

### **Linux/Mac Users:**
1. Open terminal in project folder
2. Run:
   ```bash
   chmod +x START-ALL.sh
   ./START-ALL.sh
   ```
3. Wait for both servers to start
4. Open browser: http://localhost:5173

---

## 📋 What `START-ALL` Does:

1. ✅ Installs `concurrently` (if not already installed)
2. ✅ Starts **Backend Server** on port 5000
3. ✅ Starts **Frontend Client** on port 5173
4. ✅ Shows color-coded logs for both servers
5. ✅ Keeps both running until you press Ctrl+C

---

## 🎯 First Time Setup

### Step 1: Install Dependencies

**If you haven't installed dependencies yet:**

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
cd ..
```

### Step 2: Run the Application

**Windows:**
```bash
START-ALL.bat
```

**Linux/Mac:**
```bash
chmod +x START-ALL.sh
./START-ALL.sh
```

### Step 3: Wait for Success Messages

You'll see:
```
[SERVER] 🚀 Server running on port 5000
[SERVER] ✅ MongoDB connected (or fallback)
[CLIENT] VITE ready in XXX ms
[CLIENT] ➜  Local:   http://localhost:5173/
```

### Step 4: Open Browser

Go to: **http://localhost:5173**

---

## 👤 Create Your First Account

### **For Students:**
1. Click "Register here"
2. Select **"Student"** tab
3. Fill in:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Roll Number: `CS2024001`
   - Department: `Computer Science`
   - Course: `B.Tech`
   - Semester: `1`
4. Click "Create Account"
5. ✅ You're logged in! → Student Dashboard

### **For Faculty:**
1. Click "Register here"
2. Select **"Faculty"** tab
3. Fill in:
   - Name: `Dr. Smith`
   - Email: `smith@example.com`
   - Password: `password123`
   - Department: `Computer Science`
   - **Employee ID: Leave blank** (auto-generated!)
   - Designation: `Professor`
4. Click "Create Account"
5. ✅ You're logged in! → Faculty Dashboard

---

## 🛑 How to Stop

**Press** `Ctrl+C` in the terminal where START-ALL is running

Both servers will stop automatically.

---

## 🧪 Verify Everything Works

### Check Backend:
Open browser → http://localhost:5000/api/health

Should see:
```json
{"status":"ok","timestamp":"..."}
```

### Check Frontend:
Open browser → http://localhost:5173

Should see: Login page with beautiful UI

---

## 🆘 Troubleshooting

### Problem: "concurrently: command not found"

**Solution:**
```bash
npm install -g concurrently
```

Then run START-ALL again.

### Problem: "Port 5000 already in use"

**Solution:**
```bash
# Windows PowerShell:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill -9
```

### Problem: "Port 5173 already in use"

**Solution:**
```bash
# Windows PowerShell:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5173 | xargs kill -9
```

### Problem: Scripts not executable (Linux/Mac)

**Solution:**
```bash
chmod +x START-ALL.sh
chmod +x START-BACKEND.sh
chmod +x start-dev.sh
```

### Problem: MongoDB connection timeout

**This is OKAY!** ✅

The app automatically uses an in-memory database as fallback.

You'll see:
```
⚠️ Standard MongoDB connection failed. Booting in-memory MongoDB fallback...
✅ MongoDB Memory Server connected
```

---

## 📚 Next Steps

Once you're logged in:

### **Students:**
1. 📸 Register your face → Sidebar → "Face Registration"
2. 📊 View attendance → Sidebar → "Attendance History"
3. 🔔 Check notifications → Sidebar → "Notifications"

### **Faculty:**
1. 🎓 Create a class → "Class Manager" → "New Class"
2. 👥 Add students → "Manage Students" on class card
3. ▶️ Start session → "Start Class" button
4. 📈 View analytics → Sidebar → "Analytics"

---

## 🎊 You're All Set!

Both frontend and backend are running with one command. Now you can:

- ✅ Register and login as Student or Faculty
- ✅ Use face recognition for attendance
- ✅ Manage classes and students
- ✅ View analytics and reports
- ✅ Export data to Excel/PDF

**Need more help?** Check:
- `README.md` - Full documentation
- `SETUP_GUIDE.md` - Detailed setup
- `START_SERVER_INSTRUCTIONS.md` - Server-specific help

---

**Happy coding! 🚀**
