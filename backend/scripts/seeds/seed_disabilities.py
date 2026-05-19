"""
Seed script to add common disabilities to the database
Run: python seed_disabilities.py
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

from src.db.database import get_db
from src.db import models

# Common disabilities with descriptions and categories
COMMON_DISABILITIES = [
    # Sensory Disabilities
    {
        "name": "Deaf",
        "description": "Complete or partial hearing loss. May use sign language, hearing aids, or cochlear implants.",
        "category": "Sensory",
        "icon": "👂",
        "severity": None,
    },
    {
        "name": "Hard of Hearing",
        "description": "Partial hearing loss. May benefit from hearing aids, assistive listening devices, or visual communication.",
        "category": "Sensory",
        "icon": "👂",
        "severity": None,
    },
    {
        "name": "Blind",
        "description": "Complete vision loss. May use screen readers, braille, guide dogs, or assistive technology.",
        "category": "Sensory",
        "icon": "👁️",
        "severity": None,
    },
    {
        "name": "Low Vision",
        "description": "Partial vision loss. May use magnifiers, screen readers, or other visual aids.",
        "category": "Sensory",
        "icon": "👁️",
        "severity": None,
    },
    {
        "name": "Color Blindness",
        "description": "Difficulty distinguishing between certain colors. May need color-coded information alternatives.",
        "category": "Sensory",
        "icon": "🎨",
        "severity": None,
    },
    
    # Cognitive Disabilities
    {
        "name": "ADHD",
        "description": "Attention Deficit Hyperactivity Disorder. May benefit from flexible schedules, quiet workspaces, and task management tools.",
        "category": "Cognitive",
        "icon": "🧠",
        "severity": None,
    },
    {
        "name": "Autism Spectrum Disorder",
        "description": "Neurodevelopmental condition affecting social interaction and communication. May need structured environments and clear communication.",
        "category": "Cognitive",
        "icon": "🧩",
        "severity": None,
    },
    {
        "name": "Dyslexia",
        "description": "Learning disability affecting reading and writing. May benefit from text-to-speech tools and alternative formats.",
        "category": "Cognitive",
        "icon": "📖",
        "severity": None,
    },
    {
        "name": "Dyscalculia",
        "description": "Learning disability affecting mathematical abilities. May need calculators or alternative assessment methods.",
        "category": "Cognitive",
        "icon": "🔢",
        "severity": None,
    },
    {
        "name": "Intellectual Disability",
        "description": "Limitations in intellectual functioning and adaptive behavior. May need simplified instructions and additional support.",
        "category": "Cognitive",
        "icon": "💭",
        "severity": None,
    },
    
    # Physical Disabilities
    {
        "name": "Mobility Impairment",
        "description": "Difficulty with movement or physical mobility. May use wheelchairs, walkers, or other mobility aids.",
        "category": "Physical",
        "icon": "♿",
        "severity": None,
    },
    {
        "name": "Cerebral Palsy",
        "description": "Group of disorders affecting movement and muscle tone. May need assistive technology or adaptive equipment.",
        "category": "Physical",
        "icon": "🦽",
        "severity": None,
    },
    {
        "name": "Muscular Dystrophy",
        "description": "Group of diseases causing progressive weakness and loss of muscle mass. May need assistive devices.",
        "category": "Physical",
        "icon": "💪",
        "severity": None,
    },
    {
        "name": "Spinal Cord Injury",
        "description": "Damage to the spinal cord affecting movement and sensation. May use wheelchairs or other mobility aids.",
        "category": "Physical",
        "icon": "🦽",
        "severity": None,
    },
    {
        "name": "Arthritis",
        "description": "Inflammation of joints causing pain and stiffness. May need ergonomic accommodations and flexible schedules.",
        "category": "Physical",
        "icon": "🦴",
        "severity": None,
    },
    {
        "name": "Chronic Pain",
        "description": "Persistent pain lasting longer than 3 months. May need flexible schedules and ergonomic accommodations.",
        "category": "Physical",
        "icon": "😣",
        "severity": None,
    },
    
    # Mental Health Conditions
    {
        "name": "Anxiety Disorder",
        "description": "Excessive worry or fear. May benefit from flexible schedules, quiet workspaces, and stress management support.",
        "category": "Mental Health",
        "icon": "😰",
        "severity": None,
    },
    {
        "name": "Depression",
        "description": "Persistent feelings of sadness and loss of interest. May need flexible schedules and mental health support.",
        "category": "Mental Health",
        "icon": "😔",
        "severity": None,
    },
    {
        "name": "Bipolar Disorder",
        "description": "Mood disorder with alternating periods of depression and mania. May need flexible schedules and mental health support.",
        "category": "Mental Health",
        "icon": "🌓",
        "severity": None,
    },
    {
        "name": "PTSD",
        "description": "Post-Traumatic Stress Disorder. May need trauma-informed support and flexible work arrangements.",
        "category": "Mental Health",
        "icon": "🛡️",
        "severity": None,
    },
    {
        "name": "OCD",
        "description": "Obsessive-Compulsive Disorder. May benefit from structured environments and understanding accommodations.",
        "category": "Mental Health",
        "icon": "🔄",
        "severity": None,
    },
    
    # Other
    {
        "name": "Speech Impairment",
        "description": "Difficulty with speech production or clarity. May use communication devices or alternative communication methods.",
        "category": "Other",
        "icon": "🗣️",
        "severity": None,
    },
    {
        "name": "Epilepsy",
        "description": "Neurological disorder causing seizures. May need flexible schedules and seizure management support.",
        "category": "Other",
        "icon": "⚡",
        "severity": None,
    },
    {
        "name": "Diabetes",
        "description": "Chronic condition affecting blood sugar regulation. May need flexible schedules for medical management.",
        "category": "Other",
        "icon": "💉",
        "severity": None,
    },
    {
        "name": "Multiple Sclerosis",
        "description": "Autoimmune disease affecting the nervous system. May need flexible schedules and mobility accommodations.",
        "category": "Other",
        "icon": "🧬",
        "severity": None,
    },
]


def seed_disabilities():
    """Add common disabilities to the database"""
    db = next(get_db())
    
    print("=" * 60)
    print("Seeding Disabilities Database")
    print("=" * 60)
    
    added_count = 0
    skipped_count = 0
    
    for disability_data in COMMON_DISABILITIES:
        # Check if disability already exists
        existing = db.query(models.Disability).filter(
            models.Disability.name == disability_data["name"]
        ).first()
        
        if existing:
            print(f"⏭️  Skipping: {disability_data['name']} (already exists)")
            skipped_count += 1
            continue
        
        # Create new disability
        disability = models.Disability(
            name=disability_data["name"],
            description=disability_data["description"],
            category=disability_data["category"],
            icon=disability_data["icon"],
            severity=disability_data["severity"],
        )
        
        db.add(disability)
        print(f"✅ Added: {disability_data['icon']} {disability_data['name']} ({disability_data['category']})")
        added_count += 1
    
    db.commit()
    
    print("=" * 60)
    print(f"✅ Successfully added {added_count} disabilities")
    print(f"⏭️  Skipped {skipped_count} existing disabilities")
    print("=" * 60)
    
    # Show summary by category
    print("\n📊 Summary by Category:")
    categories = db.query(models.Disability.category).distinct().all()
    for category_tuple in categories:
        category = category_tuple[0]
        if category:
            count = db.query(models.Disability).filter(models.Disability.category == category).count()
            print(f"  {category}: {count} disabilities")


if __name__ == "__main__":
    try:
        seed_disabilities()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

