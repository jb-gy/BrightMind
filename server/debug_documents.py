#!/usr/bin/env python3

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Debug Documents API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/debug-documents")
async def debug_upload(file: UploadFile = File(...), user_id: str = "demo_user"):
    try:
        print(f"Received file: {file.filename}")
        content = await file.read()
        print(f"File size: {len(content)}")
        
        if not content:
            raise HTTPException(400, "Empty file")
        
        # Test PDF extractor
        try:
            from services.pdf_extractor import extract_layout
            print("PDF extractor imported successfully")
            layout = extract_layout(content)
            print(f"Extracted layout with {len(layout.pages)} pages")
            
            # Test Gemini service
            try:
                from services.gemini_service import get_gemini_service
                print("Gemini service imported successfully")
                gemini = get_gemini_service()
                print("Gemini service created successfully")
                
                # Test MongoDB service
                try:
                    from services.mongodb_service import get_mongodb_service
                    print("MongoDB service imported successfully")
                    mongodb = get_mongodb_service()
                    print("MongoDB service created successfully")
                    
                    return {
                        "status": "success",
                        "filename": file.filename,
                        "file_size": len(content),
                        "pages": len(layout.pages),
                        "total_lines": sum(len(page.lines) for page in layout.pages),
                        "message": "All services working correctly"
                    }
                    
                except Exception as e:
                    return {"error": f"MongoDB service error: {str(e)}"}
                    
            except Exception as e:
                return {"error": f"Gemini service error: {str(e)}"}
                
        except Exception as e:
            return {"error": f"PDF extractor error: {str(e)}"}
            
    except Exception as e:
        return {"error": f"General error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
