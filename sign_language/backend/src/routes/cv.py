import os
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from groq import Groq
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib.utils import simpleSplit

router = APIRouter(prefix="/cv", tags=["cv"])

# Initialize Groq client
# The model uses the GROQ_API_KEY from environment variables as set up in the system
client = Groq()

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribes audio using Groq Whisper API"""
    try:
        # Read the file
        file_bytes = await file.read()
        
        # Call Groq API for transcription
        # Using whisper-large-v3-turbo for fast transcription
        transcription = client.audio.transcriptions.create(
            file=(file.filename, file_bytes),
            model="whisper-large-v3-turbo",
        )
        
        return {"text": transcription.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CVData(BaseModel):
    name: str
    title: str
    email: str
    phone: str
    experience: str
    education: str
    skills: str

@router.post("/generate")
async def generate_cv(data: CVData):
    """Generates a polished CV using Llama3 and returns a PDF"""
    try:
        cv_prompt = f"""
You are a professional resume writer.
Rewrite the following information into a clean, polished, well-structured resume.

FORMAT STRICTLY LIKE THIS:
Summary:
Experience:
Education:
Skills:
Contact:

Expand all points into strong professional sentences.
Do NOT add symbols or separators.
Do NOT use markdown.
Do NOT add colons at line beginnings except the section titles.

Name: {data.name}
Title: {data.title}
Email: {data.email}
Phone: {data.phone}
Experience:
{data.experience}
Education:
{data.education}
Skills:
{data.skills}
"""
        
        # Call Groq AI
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": cv_prompt}],
            temperature=0.4,
            max_completion_tokens=1500
        )
        ai_text = completion.choices[0].message.content.strip()

        # Extract sections
        sections = {"Summary": [], "Experience": [], "Education": [], "Skills": []}
        current = None

        proxies = {
            "summary": "Summary",
            "professional summary": "Summary",
            "experience": "Experience",
            "work experience": "Experience",
            "education": "Education",
            "education background": "Education",
            "skills": "Skills",
            "technical skills": "Skills",
        }

        for line in ai_text.split("\n"):
            clean = line.strip().lower().replace(":", "")
            if clean in proxies:
                current = proxies[clean]
            elif clean != "" and current is not None:
                sections[current].append(line.strip())

        # Generate PDF
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Header
        c.setFont("Helvetica-Bold", 26)
        c.drawCentredString(width/2, height - 2.5*cm, data.name)

        c.setFont("Helvetica", 14)
        c.drawCentredString(width/2, height - 3.5*cm, data.title)

        c.setFont("Helvetica", 11)
        c.drawCentredString(width/2, height - 4.3*cm, f"{data.email} | {data.phone}")

        c.line(2*cm, height - 4.8*cm, width - 2*cm, height - 4.8*cm)

        y = height - 6*cm
        line_height = 0.55*cm

        def draw_section(title, content, y_pos):
            c.setFont("Helvetica-Bold", 15)
            c.drawString(2*cm, y_pos, title)
            y_pos -= line_height

            c.setFont("Helvetica", 11)
            for text in content:
                wrapped = simpleSplit(text, "Helvetica", 11, width - 4*cm)
                for w in wrapped:
                    c.drawString(2.5*cm, y_pos, w)
                    y_pos -= line_height
                    if y_pos < 2.5*cm:
                        c.showPage()
                        y_pos = height - 3*cm
                        c.setFont("Helvetica", 11)

            y_pos -= 0.7*cm
            return y_pos

        # Draw sections
        for sec in sections:
            if sections[sec]:
                y = draw_section(sec, sections[sec], y)

        c.save()
        buffer.seek(0)

        # Return PDF
        headers = {
            'Content-Disposition': f'attachment; filename="{data.name.replace(" ", "_")}_resume.pdf"'
        }
        return Response(content=buffer.getvalue(), media_type="application/pdf", headers=headers)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
