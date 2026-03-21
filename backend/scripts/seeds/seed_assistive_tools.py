"""
Seed script to add common assistive tools to the database
Run: python seed_assistive_tools.py
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

from src.db.database import get_db
from src.db import models

# Common assistive tools organized by disability
ASSISTIVE_TOOLS = [
    # Tools for Deaf/Hard of Hearing
    {
        "name": "Otter.ai",
        "description": "AI-powered transcription service that converts speech to text in real-time. Great for meetings and conversations.",
        "category": "Software",
        "tool_type": "Speech-to-Text",
        "platform": "Web, iOS, Android",
        "cost": "Freemium",
        "website_url": "https://otter.ai",
        "icon": "🎤",
        "features": ["Real-time transcription", "Meeting notes", "Search transcripts"],
        "disability_names": ["Deaf", "Hard of Hearing"],
    },
    {
        "name": "Live Transcribe",
        "description": "Google's real-time speech-to-text app for Android devices. Converts speech to text instantly.",
        "category": "App",
        "tool_type": "Speech-to-Text",
        "platform": "Android",
        "cost": "Free",
        "website_url": "https://play.google.com/store/apps/details?id=com.google.audio.hearing.visualization.accessibility.scribe",
        "icon": "📱",
        "features": ["Real-time transcription", "Offline support", "Multiple languages"],
        "disability_names": ["Deaf", "Hard of Hearing"],
    },
    {
        "name": "Ava",
        "description": "Real-time captioning app for conversations. Shows who said what in group conversations.",
        "category": "App",
        "tool_type": "Speech-to-Text",
        "platform": "iOS, Android",
        "cost": "Freemium",
        "website_url": "https://www.ava.me",
        "icon": "💬",
        "features": ["Group conversation captions", "Speaker identification", "Save transcripts"],
        "disability_names": ["Deaf", "Hard of Hearing"],
    },
    
    # Tools for Blind/Low Vision
    {
        "name": "NVDA (NonVisual Desktop Access)",
        "description": "Free, open-source screen reader for Windows. Reads screen content aloud.",
        "category": "Software",
        "tool_type": "Screen Reader",
        "platform": "Windows",
        "cost": "Free",
        "website_url": "https://www.nvaccess.org",
        "icon": "🔊",
        "features": ["Screen reading", "Braille support", "Web navigation"],
        "disability_names": ["Blind", "Low Vision"],
    },
    {
        "name": "JAWS (Job Access With Speech)",
        "description": "Professional screen reader for Windows. Most popular screen reader for blind users.",
        "category": "Software",
        "tool_type": "Screen Reader",
        "platform": "Windows",
        "cost": "Paid",
        "website_url": "https://www.freedomscientific.com/products/software/jaws",
        "icon": "💻",
        "features": ["Advanced screen reading", "Braille support", "Office integration"],
        "disability_names": ["Blind", "Low Vision"],
    },
    {
        "name": "VoiceOver",
        "description": "Built-in screen reader for Apple devices (Mac, iPhone, iPad). Reads screen content aloud.",
        "category": "Software",
        "tool_type": "Screen Reader",
        "platform": "Mac, iOS",
        "cost": "Free",
        "website_url": "https://www.apple.com/accessibility/vision",
        "icon": "🍎",
        "features": ["Built-in accessibility", "Gesture navigation", "Braille support"],
        "disability_names": ["Blind", "Low Vision"],
    },
    {
        "name": "ZoomText",
        "description": "Screen magnification and reading software for low vision users. Magnifies screen up to 60x.",
        "category": "Software",
        "tool_type": "Screen Magnifier",
        "platform": "Windows",
        "cost": "Paid",
        "website_url": "https://www.zoomtext.com",
        "icon": "🔍",
        "features": ["Screen magnification", "Text reading", "Color enhancement"],
        "disability_names": ["Low Vision"],
    },
    {
        "name": "Be My Eyes",
        "description": "Free app connecting blind users with sighted volunteers via live video call for visual assistance.",
        "category": "App",
        "tool_type": "Visual Assistance",
        "platform": "iOS, Android",
        "cost": "Free",
        "website_url": "https://www.bemyeyes.com",
        "icon": "👁️",
        "features": ["Live video assistance", "24/7 volunteers", "Multiple languages"],
        "disability_names": ["Blind", "Low Vision"],
    },
    
    # Tools for Color Blindness
    {
        "name": "Color Oracle",
        "description": "Free color blindness simulator for Windows, Mac, and Linux. Shows how images look to color blind users.",
        "category": "Software",
        "tool_type": "Color Accessibility",
        "platform": "Windows, Mac, Linux",
        "cost": "Free",
        "website_url": "https://colororacle.org",
        "icon": "🎨",
        "features": ["Color blindness simulation", "Design testing", "Multiple types"],
        "disability_names": ["Color Blindness"],
    },
    {
        "name": "Colorblind Assistant",
        "description": "Mobile app that helps identify colors using your camera. Useful for shopping and daily tasks.",
        "category": "App",
        "tool_type": "Color Identification",
        "platform": "iOS, Android",
        "cost": "Free",
        "website_url": "https://apps.apple.com/app/colorblind-assistant/id1040548184",
        "icon": "📷",
        "features": ["Color identification", "Camera-based", "Multiple color types"],
        "disability_names": ["Color Blindness"],
    },
    
    # Tools for ADHD
    {
        "name": "Focus@Will",
        "description": "Music service designed to improve focus and productivity. Uses neuroscience-based music.",
        "category": "Service",
        "tool_type": "Focus Enhancement",
        "platform": "Web, iOS, Android",
        "cost": "Subscription",
        "website_url": "https://www.focusatwill.com",
        "icon": "🎵",
        "features": ["Focus music", "Productivity tracking", "Custom playlists"],
        "disability_names": ["ADHD"],
    },
    {
        "name": "Todoist",
        "description": "Task management app with features for organizing, prioritizing, and tracking tasks. Great for ADHD users.",
        "category": "App",
        "tool_type": "Task Management",
        "platform": "Web, iOS, Android, Windows, Mac",
        "cost": "Freemium",
        "website_url": "https://todoist.com",
        "icon": "✅",
        "features": ["Task organization", "Reminders", "Project management"],
        "disability_names": ["ADHD"],
    },
    {
        "name": "Forest",
        "description": "Focus timer app that helps you stay focused by growing virtual trees. Prevents phone distractions.",
        "category": "App",
        "tool_type": "Focus Timer",
        "platform": "iOS, Android",
        "cost": "Paid",
        "website_url": "https://www.forestapp.cc",
        "icon": "🌳",
        "features": ["Focus timer", "Distraction blocking", "Visual rewards"],
        "disability_names": ["ADHD"],
    },
    
    # Tools for Dyslexia
    {
        "name": "Natural Reader",
        "description": "Text-to-speech software that reads documents, PDFs, and web pages aloud. Helps with reading comprehension.",
        "category": "Software",
        "tool_type": "Text-to-Speech",
        "platform": "Web, Windows, Mac, iOS, Android",
        "cost": "Freemium",
        "website_url": "https://www.naturalreaders.com",
        "icon": "📖",
        "features": ["Text-to-speech", "Multiple voices", "Document reading"],
        "disability_names": ["Dyslexia"],
    },
    {
        "name": "Grammarly",
        "description": "Writing assistant that checks grammar, spelling, and style. Helps improve writing quality.",
        "category": "Software",
        "tool_type": "Writing Assistant",
        "platform": "Web, Windows, Mac, iOS, Android",
        "cost": "Freemium",
        "website_url": "https://www.grammarly.com",
        "icon": "✍️",
        "features": ["Grammar checking", "Spell check", "Style suggestions"],
        "disability_names": ["Dyslexia"],
    },
    {
        "name": "OpenDyslexic Font",
        "description": "Free open-source font designed to increase readability for readers with dyslexia.",
        "category": "Resource",
        "tool_type": "Font",
        "platform": "All",
        "cost": "Free",
        "website_url": "https://opendyslexic.org",
        "icon": "🔤",
        "features": ["Dyslexia-friendly font", "Open source", "Multiple weights"],
        "disability_names": ["Dyslexia"],
    },
    
    # Tools for Mobility Impairments
    {
        "name": "Dragon NaturallySpeaking",
        "description": "Voice recognition software that converts speech to text. Hands-free computer control.",
        "category": "Software",
        "tool_type": "Voice Control",
        "platform": "Windows, Mac",
        "cost": "Paid",
        "website_url": "https://www.nuance.com/dragon.html",
        "icon": "🐉",
        "features": ["Voice dictation", "Voice commands", "High accuracy"],
        "disability_names": ["Mobility Impairment", "Spinal Cord Injury", "Cerebral Palsy"],
    },
    {
        "name": "Windows Speech Recognition",
        "description": "Built-in voice recognition for Windows. Allows voice control of computer.",
        "category": "Software",
        "tool_type": "Voice Control",
        "platform": "Windows",
        "cost": "Free",
        "website_url": "https://support.microsoft.com/en-us/windows/use-voice-recognition-in-windows-83ff75bd-7599-6735-6550-8a40d93edd72",
        "icon": "🎤",
        "features": ["Voice commands", "Dictation", "Built-in"],
        "disability_names": ["Mobility Impairment", "Spinal Cord Injury"],
    },
    {
        "name": "Eye Gaze Technology",
        "description": "Eye tracking systems that allow computer control using eye movements. For severe mobility impairments.",
        "category": "Hardware",
        "tool_type": "Eye Tracking",
        "platform": "Windows, Mac",
        "cost": "Paid",
        "website_url": "https://www.tobii.com",
        "icon": "👀",
        "features": ["Eye tracking", "Hands-free control", "Communication"],
        "disability_names": ["Mobility Impairment", "Spinal Cord Injury", "Cerebral Palsy"],
    },
    
    # Tools for Mental Health
    {
        "name": "Headspace",
        "description": "Meditation and mindfulness app. Helps with anxiety, stress, and mental wellness.",
        "category": "App",
        "tool_type": "Meditation",
        "platform": "iOS, Android, Web",
        "cost": "Subscription",
        "website_url": "https://www.headspace.com",
        "icon": "🧘",
        "features": ["Meditation", "Sleep sounds", "Mindfulness exercises"],
        "disability_names": ["Anxiety Disorder", "Depression", "PTSD"],
    },
    {
        "name": "Calm",
        "description": "Meditation and sleep app. Provides guided meditations, sleep stories, and relaxation content.",
        "category": "App",
        "tool_type": "Meditation",
        "platform": "iOS, Android, Web",
        "cost": "Subscription",
        "website_url": "https://www.calm.com",
        "icon": "🌊",
        "features": ["Meditation", "Sleep stories", "Breathing exercises"],
        "disability_names": ["Anxiety Disorder", "Depression", "PTSD"],
    },
    {
        "name": "Daylio",
        "description": "Mood tracking journal app. Helps track mood patterns and identify triggers.",
        "category": "App",
        "tool_type": "Mood Tracking",
        "platform": "iOS, Android",
        "cost": "Freemium",
        "website_url": "https://daylio.webflow.io",
        "icon": "📊",
        "features": ["Mood tracking", "Journaling", "Statistics"],
        "disability_names": ["Depression", "Bipolar Disorder", "Anxiety Disorder"],
    },
    
    # General Tools
    {
        "name": "Microsoft Accessibility Features",
        "description": "Built-in Windows accessibility features including narrator, magnifier, speech recognition, and more.",
        "category": "Software",
        "tool_type": "Accessibility Suite",
        "platform": "Windows",
        "cost": "Free",
        "website_url": "https://www.microsoft.com/en-us/accessibility",
        "icon": "🪟",
        "features": ["Screen reader", "Magnifier", "Speech recognition", "High contrast"],
        "disability_names": ["Blind", "Low Vision", "Mobility Impairment", "Deaf"],
    },
    {
        "name": "Apple Accessibility Features",
        "description": "Built-in accessibility features for Mac, iPhone, and iPad including VoiceOver, Zoom, and more.",
        "category": "Software",
        "tool_type": "Accessibility Suite",
        "platform": "Mac, iOS",
        "cost": "Free",
        "website_url": "https://www.apple.com/accessibility",
        "icon": "🍎",
        "features": ["VoiceOver", "Zoom", "Voice Control", "Switch Control"],
        "disability_names": ["Blind", "Low Vision", "Mobility Impairment", "Deaf"],
    },
]


def seed_tools():
    """Add assistive tools to the database"""
    db = next(get_db())
    
    print("=" * 60)
    print("Seeding Assistive Tools Database")
    print("=" * 60)
    
    added_count = 0
    skipped_count = 0
    
    for tool_data in ASSISTIVE_TOOLS:
        # Check if tool already exists
        existing = db.query(models.AssistiveTool).filter(
            models.AssistiveTool.name == tool_data["name"]
        ).first()
        
        if existing:
            print(f"⏭️  Skipping: {tool_data['name']} (already exists)")
            skipped_count += 1
            continue
        
        # Create new tool
        tool = models.AssistiveTool(
            name=tool_data["name"],
            description=tool_data["description"],
            category=tool_data["category"],
            tool_type=tool_data["tool_type"],
            platform=tool_data["platform"],
            cost=tool_data["cost"],
            website_url=tool_data["website_url"],
            icon=tool_data["icon"],
            features=tool_data["features"],
        )
        
        db.add(tool)
        db.flush()
        
        # Link to disabilities
        disability_names = tool_data.get("disability_names", [])
        if disability_names:
            disabilities = db.query(models.Disability).filter(
                models.Disability.name.in_(disability_names)
            ).all()
            tool.disabilities.extend(disabilities)
        
        print(f"✅ Added: {tool_data['icon']} {tool_data['name']} ({tool_data['category']})")
        added_count += 1
    
    db.commit()
    
    print("=" * 60)
    print(f"✅ Successfully added {added_count} tools")
    print(f"⏭️  Skipped {skipped_count} existing tools")
    print("=" * 60)
    
    # Show summary by category
    print("\n📊 Summary by Category:")
    categories = db.query(models.AssistiveTool.category).distinct().all()
    for category_tuple in categories:
        category = category_tuple[0]
        if category:
            count = db.query(models.AssistiveTool).filter(
                models.AssistiveTool.category == category
            ).count()
            print(f"  {category}: {count} tools")


if __name__ == "__main__":
    try:
        seed_tools()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

