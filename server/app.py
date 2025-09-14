from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes import documents, analyze, tts, visualizations, auto_reader, image_generation
from services.mongodb_service import get_mongodb_service
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="BrightMind API", version="2.0.0")

origins = os.getenv("APP_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (audio, images)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Create static directories if they don't exist
os.makedirs("static/audio", exist_ok=True)
os.makedirs("static/images", exist_ok=True)

app.include_router(documents.router)
app.include_router(analyze.router)
app.include_router(tts.router)
app.include_router(visualizations.router)
app.include_router(auto_reader.router)
app.include_router(image_generation.router)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Initialize MongoDB connection
        mongodb = await get_mongodb_service()
        print("MongoDB connection established")
    except Exception as e:
        print(f"Warning: MongoDB connection failed: {e}")
        print("App will continue without MongoDB functionality")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    try:
        mongodb = await get_mongodb_service()
        await mongodb.disconnect()
        print("MongoDB connection closed")
    except Exception as e:
        print(f"Error closing MongoDB connection: {e}")

@app.get("/")
def root():
    return {
        "ok": True, 
        "service": "brightmind-api",
        "version": "2.0.0",
        "features": [
            "AI-powered content analysis",
            "Character voice switching",
            "Visual content generation",
            "ADHD-friendly reading aids",
            "Blockchain progress tracking",
            "Real-time word highlighting"
        ]
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "adhd-reader-api",
        "version": "2.0.0"
    }