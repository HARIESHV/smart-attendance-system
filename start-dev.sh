#!/bin/bash

echo "🚀 Starting Smart Attendance System..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to start server
start_server() {
    echo "📦 Starting Backend Server..."
    cd "$SCRIPT_DIR/server"
    npm run dev &
    SERVER_PID=$!
    echo "✅ Server started (PID: $SERVER_PID) on http://localhost:5000"
}

# Function to start client
start_client() {
    echo "🎨 Starting Frontend Client..."
    cd "$SCRIPT_DIR/client"
    npm run dev &
    CLIENT_PID=$!
    echo "✅ Client started (PID: $CLIENT_PID) on http://localhost:5173"
}

# Start both
start_server
sleep 3
start_client

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Smart Attendance System is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT
wait
