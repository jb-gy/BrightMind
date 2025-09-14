#!/usr/bin/env python3

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Test API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test")
async def test():
    return {"message": "Test endpoint working"}

@app.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):
    try:
        content = await file.read()
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content),
            "first_100_chars": content[:100].decode('utf-8', errors='ignore')
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
