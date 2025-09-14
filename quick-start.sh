#!/bin/bash

# ADHD Reader - Quick Start Script
# This script helps you get started quickly with the ADHD Reader application

set -e

echo "🧠 ADHD Reader - Quick Start"
echo "============================="
echo ""

# Check if we're in the right directory
if [ ! -f "server/app.py" ] || [ ! -f "client/package.json" ]; then
    echo "❌ Error: Please run this script from the Book-Flow root directory"
    exit 1
fi

# Check for required tools
echo "🔍 Checking requirements..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed"
    exit 1
fi

echo "✅ All requirements found"
echo ""

# Check for API key
echo "🔑 Checking for Gemini API key..."
if [ ! -f "server/.env" ]; then
    echo "📝 Creating environment file..."
    cp env.example server/.env
    echo ""
    echo "⚠️  IMPORTANT: You need to add your Gemini API key!"
    echo "   1. Get your API key from: https://makersuite.google.com/app/apikey"
    echo "   2. Edit server/.env and replace 'your_gemini_api_key_here' with your actual key"
    echo ""
    read -p "Press Enter after you've added your API key..."
fi

# Check if API key is set
if grep -q "your_gemini_api_key_here" server/.env; then
    echo "❌ Please add your Gemini API key to server/.env first"
    echo "   Get your key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

echo "✅ API key configured"
echo ""

# Setup backend
echo "🐍 Setting up Python backend..."
cd server
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Backend setup complete"
echo ""

# Setup frontend
echo "📱 Setting up React frontend..."
cd ../client
npm install
echo "✅ Frontend setup complete"
echo ""

# Create static directories
echo "📁 Creating required directories..."
mkdir -p ../server/static/audio
mkdir -p ../server/static/images
echo "✅ Directories created"
echo ""

# Start services
echo "🚀 Starting services..."
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
echo "Starting backend server..."
cd ../server
source venv/bin/activate
uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 ADHD Reader is starting up!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait
