# 🚀 How to Start the Backend Server

## ⭐ NEW - Start Both Frontend & Backend Together!

### **The Easiest Way - Use START-ALL:**

**Windows:** Double-click `START-ALL.bat`

**Linux/Mac:** Run `./START-ALL.sh`

This runs **BOTH** frontend and backend with a single command using `concurrently`!

You'll see colored output:
- 🔵 **[SERVER]** - Backend logs (cyan)
- 🟢 **[CLIENT]** - Frontend logs (green)

---

## Original Instructions - Start Backend Only

## The Problem
You're seeing: **"Cannot connect to server. Please ensure the backend is running on http://localhost:5000"**

This means the backend server is not running yet.

## ✅ Solution - Start the Server Manually

### **Step 1: Open a New Terminal**

Open a **separate terminal window** (not in VS Code, use your system terminal)

### **Step 2: Navigate to Server Directory**

```bash
cd server
```

Or if you're in the project root:
```bash
cd "C:\Users\Hari\.gemini\antigravity\scratch\smart-attendance\server"
```

### **Step 3: Start the Server**

Run ONE of these commands:

**Option A - Using npm (Recommended):**
```bash
npm run dev
```

**Option B - Using npx directly:**
```bash
npx ts-node src/server.ts
```

**Option C - Build and run:**
```bash
npm run build
npm start
```

### **Step 4: Wait for Success Message**

You should see:
```
🚀 Server running on port 5000
📡 Environment: development
✅ MongoDB connected: (connection details)
```

OR if MongoDB connection fails (which is OK):
```
⚠️ Standard MongoDB connection failed. Booting in-memory MongoDB fallback...
✅ MongoDB Memory Server connected: (memory server details)
```

### **Step 5: Keep This Terminal Open**

⚠️ **Important**: Keep this terminal window open! The server needs to run continuously.

---

## 🧪 Test if Server is Running

### Test 1: Browser Test
Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{"status":"ok","timestamp":"2026-07-19T..."}
```

### Test 2: Command Line Test
In another terminal:
```bash
curl http://localhost:5000/api/health
```

---

## ✨ Once Server is Running

1. **Go back to your browser**: `http://localhost:5173`
2. **Click "Register here"**
3. **Try creating an account**:
   - As Student: Fill in roll number, department, etc.
   - As Faculty: Fill in department, designation (Employee ID is optional!)
4. **Login** with your new account
5. **You'll be redirected** to your dashboard!

---

## 🐛 Troubleshooting

### Error: "Port 5000 is already in use"

**Solution 1 - Find and kill the process:**
```bash
# On Windows PowerShell:
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# On Linux/Mac/WSL:
lsof -ti:5000 | xargs kill -9
```

**Solution 2 - Use a different port:**
Edit `server/.env`:
```env
PORT=5001
```

Then update `client/vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5001',  // Change to 5001
    changeOrigin: true,
  },
}
```

### Error: "Cannot find module"

**Solution - Reinstall dependencies:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Error: MongoDB connection timeout

**This is OK!** The server will automatically fall back to an in-memory database.

You'll see:
```
⚠️ Standard MongoDB connection failed. Booting in-memory MongoDB fallback...
✅ MongoDB Memory Server connected
```

### Server starts but immediately exits

**Check for:**
1. **Syntax errors** in code
2. **Missing environment variables** in `.env`
3. **Port conflicts**

**View full error** by running:
```bash
npm run dev 2>&1 | tee server-log.txt
```

---

## 📋 Quick Checklist

- [ ] Opened new terminal
- [ ] Navigated to `server` directory  
- [ ] Ran `npm run dev`
- [ ] Saw success message
- [ ] Kept terminal open
- [ ] Tested `http://localhost:5000/api/health`
- [ ] Frontend can now connect!

---

## 🎯 Expected Result

### Terminal Output:
```
> smart-attendance-server@1.0.0 dev
> nodemon --exec ts-node src/server.ts

[nodemon] 3.1.0
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node src/server.ts`
🚀 Server running on port 5000
📡 Environment: development
✅ MongoDB connected: localhost
```

### Frontend (http://localhost:5173):
- ✅ No more "Cannot connect" errors
- ✅ Registration works
- ✅ Login works
- ✅ Redirects to dashboard

---

## 🎊 Success!

Once you see the server running message and test the health endpoint, your authentication will work!

Go to `http://localhost:5173` and try:
1. **Register** a new account (Student or Faculty)
2. **Login** with your credentials  
3. **Explore** your dashboard!

---

**Need more help?** Check the main `README.md` or `SETUP_GUIDE.md` files.
