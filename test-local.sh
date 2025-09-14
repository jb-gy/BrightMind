#!/bin/bash

# ADHD Reader - Local Testing Script
# This script starts both the backend and frontend for local testing

set -e

echo "🧠 ADHD Reader - Local Testing"
echo "==============================="
echo ""

# Check if we're in the right directory
if [ ! -f "server/app.py" ] || [ ! -f "client/package.json" ]; then
    echo "❌ Error: Please run this script from the Book-Flow root directory"
    exit 1
fi

# Check for API key
if [ ! -f "server/.env" ]; then
    echo "❌ Error: server/.env file not found"
    echo "Please create it with your Gemini API key:"
    echo "GEMINI_API_KEY=your_gemini_api_key_here"
    exit 1
fi

if grep -q "GEMINI_API_KEY=your_gemini_api_key_here" server/.env; then
    echo "❌ Error: Please add your Gemini API key to server/.env"
    echo "Get your key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

echo "✅ Configuration looks good"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "🐍 Starting backend server..."
cd server
source venv/bin/activate
/Users/ajibolaganiyu/CODE/Hackwest/Book-Flow/server/venv/bin/uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

echo "✅ Backend is running at http://localhost:8000"

# Start frontend
echo "📱 Starting frontend server..."
cd ../client
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 3

echo ""
echo "🎉 ADHD Reader is running!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait
