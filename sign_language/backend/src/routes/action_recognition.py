from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel
import os
import shutil
import uuid
from backend.src.services.action_recognition_service import ActionRecognitionSystem

router = APIRouter(prefix="/action-recognition", tags=["action-recognition"])

# Ensure uploads directory exists. Use /tmp since Vercel is a read-only file system
UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ActionRecognitionResponse(BaseModel):
    status: str
    message: str
    report: str

@router.post("/analyze", response_model=ActionRecognitionResponse)
async def analyze_video(
    file: UploadFile = File(...),
):
    """
    Upload a video file to be analyzed by the action recognition model.
    """
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File provided is not a video.")

    try:
        # Create a unique filename to prevent collisions
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Optional check for API key
        if not os.getenv('GROQ_API_KEY'):
            raise HTTPException(
                status_code=500, 
                detail="GROQ_API_KEY environment variable is missing."
            )
            
        # Initialize service
        service = ActionRecognitionSystem()
        
        # Process video asynchronously
        # Using frame_interval 30 means analyzing 1 frame per second for 30fps
        report = await service.process_video_file_async(file_path, frame_interval=30)
        
        return ActionRecognitionResponse(
            status="success",
            message="Video action recognition completed.",
            report=report
        )
        
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during analysis: {str(e)}")
    finally:
        # Clean up the file after processing
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Warning: Could not delete temporary video file {file_path}. Error: {str(e)}")
