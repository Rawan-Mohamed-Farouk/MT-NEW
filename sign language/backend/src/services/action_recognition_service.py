import cv2
import base64
import time
from groq import Groq
import os
import asyncio
from fastapi.concurrency import run_in_threadpool

class ActionRecognitionSystem:
    def __init__(self, api_key=None, model=None):
        """Initialize the Groq client with API key"""
        api_key = api_key or os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("Groq API key not found. Please set GROQ_API_KEY environment variable.")
        self.client = Groq(api_key=api_key)
        self.model = model or "meta-llama/llama-4-scout-17b-16e-instruct"
        
    def frame_to_base64(self, frame):
        """Convert OpenCV frame to base64 string"""
        _, buffer = cv2.imencode('.jpg', frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        return frame_base64
    
    def analyze_frame(self, frame_base64, frame_number, total_frames=None):
        """Send frame to Groq API for analysis"""
        progress = f" ({frame_number}/{total_frames})" if total_frames else f" (Frame {frame_number})"
        
        prompt = f"""Analyze this video frame and describe:
1. What actions or activities are visible
2. Who or what is in the frame
3. Any notable movements or gestures
4. The context or setting

Frame{progress}:"""
        
        try:
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{frame_base64}"
                            }
                        }
                    ]
                }
            ]
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_completion_tokens=512,
                top_p=1,
                stream=False
            )
            
            return completion.choices[0].message.content
        except Exception as e:
            error_msg = str(e)
            if "vision" in error_msg.lower() or "image" in error_msg.lower():
                return f"Error: Model '{self.model}' may not support vision. Try using --model llama-3.2-11b-vision-preview"
            return f"Error analyzing frame: {error_msg}"
    
    def get_video_summary_blocking(self, video_path: str, frame_interval: int = 30) -> str:
        """Process a recorded video file synchronously"""
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            return "Error: Could not open video file."
        
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        frame_analyses = []
        frame_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Analyze every Nth frame
            if frame_count % frame_interval == 0:
                frame_base64 = self.frame_to_base64(frame)
                analysis = self.analyze_frame(frame_base64, frame_count, total_frames)
                frame_analyses.append({
                    'frame': frame_count,
                    'time': frame_count / fps if fps > 0 else 0,
                    'analysis': analysis
                })
                # Add slight delay for rate limits if making sync calls on large files
                time.sleep(0.5) 
            
            frame_count += 1
            
            # Limit the number of analyzed frames if video is extremely long, to prevent memory/rate-limit issues
            if len(frame_analyses) > 30: # Limit to ~15-30 seconds if interval is 30 on 30fps
                break
        
        cap.release()
        return self.generate_summary(frame_analyses, duration)

    async def process_video_file_async(self, video_path: str, frame_interval: int = 30) -> str:
        """Asynchronously process the video by running the blocking logic in a threadpool."""
        return await run_in_threadpool(self.get_video_summary_blocking, video_path, frame_interval)
    
    def generate_summary(self, frame_analyses, duration):
        """Generate final summary report from all frame analyses"""
        if not frame_analyses:
            return "No frames were analyzed."
        
        # Combine all analyses
        combined_analysis = "\\n\\n".join([
            f"[Frame {fa['frame']} at {fa['time']:.1f}s]: {fa['analysis']}"
            for fa in frame_analyses
        ])
        
        summary_prompt = f"""Based on the following frame-by-frame analysis of a video ({duration:.1f} seconds), create a comprehensive summary report:

{combined_analysis}

Please provide:
1. Overall summary of the actions and activities observed
2. Key moments and notable events
3. Description of participants/objects
4. Timeline of main activities
5. Any patterns or trends noticed

Format as a clear, structured report."""
        
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": summary_prompt}],
                temperature=0.7,
                max_completion_tokens=1024,
                top_p=1,
                stream=False
            )
            
            summary = completion.choices[0].message.content
            
            summary_prompt_final = f"""Based on the following comprehensive video analysis report, create a brief executive summary (2-3 sentences) that captures the most important points:

{summary}

Provide a concise summary that highlights:
- Main activities and actions
- Key participants or objects
- Most notable events or moments

Keep it brief and to the point."""
            
            try:
                final_summary_completion = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": summary_prompt_final}],
                    temperature=0.7,
                    max_completion_tokens=256,
                    top_p=1,
                    stream=False
                )
                final_summary = final_summary_completion.choices[0].message.content
                
                # Append summary to the report
                detailed_report = summary
                
                final_output = f"EXECUTIVE SUMMARY\\n==================\\n{final_summary}\\n\\nDETAILED REPORT\\n===============\\n{detailed_report}"
                return final_output
                
            except Exception as e:
                return f"Partial analysis completed, but final summary failed: {str(e)}\\n\\nDetailed Report:\\n{summary}"
            
        except Exception as e:
            return f"Error generating summary: {str(e)}"
