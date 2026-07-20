#!/bin/bash

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

clear
echo ""
echo "================================================"
echo "  Smart Attendance System - Starting All"
echo "================================================"
echo ""
echo "🔧 Checking for concurrently..."
echo ""

# Check if concurrently is installed
if ! command -v concurrently &> /dev/null; then
    echo "📦 Installing concurrently globally..."
    npm install -g concurrently
fi

echo ""
echo "================================================"
echo "  Starting Frontend and Backend Servers"
echo "================================================"
echo ""
echo "📦 Backend Server: http://localhost:5000"
echo "🎨 Frontend Client: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================"
echo ""

# Start both servers
cd "$SCRIPT_DIR" || exit 1
concurrently -n "SERVER,CLIENT" -c "cyan,green" \
  "cd server && npm run dev" \
  "cd client && npm run dev"
