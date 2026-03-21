"""
Seed script to add sample jobs, companies, locations, disabilities, and skills to the database.
Run this script to populate your database with sample data.
"""

from src.db.database import SessionLocal
from src.db import models
from datetime import datetime

db = SessionLocal()

def seed_data():
    print("Starting to seed database...")
    
    # 1. Create Disabilities
    print("Creating disabilities...")
    disabilities_data = [
        {"name": "Visual Impairment"},
        {"name": "Hearing Impairment"},
        {"name": "Mobility Impairment"},
        {"name": "Autism Spectrum Disorder"},
        {"name": "ADHD"},
        {"name": "Dyslexia"},
        {"name": "Chronic Pain"},
        {"name": "Mental Health Condition"},
    ]
    
    disabilities = {}
    for dis_data in disabilities_data:
        existing = db.query(models.Disability).filter(models.Disability.name == dis_data["name"]).first()
        if not existing:
            disability = models.Disability(**dis_data)
            db.add(disability)
            db.flush()
            disabilities[dis_data["name"]] = disability
            print(f"  Created disability: {dis_data['name']}")
        else:
            disabilities[dis_data["name"]] = existing
            print(f"  Disability already exists: {dis_data['name']}")
    
    # 2. Create Skills
    print("\nCreating skills...")
    skills_data = [
        {"name": "Python"},
        {"name": "JavaScript"},
        {"name": "Data Entry"},
        {"name": "Customer Service"},
        {"name": "Content Writing"},
        {"name": "Graphic Design"},
        {"name": "Web Development"},
        {"name": "Project Management"},
        {"name": "Microsoft Office"},
        {"name": "Communication"},
    ]
    
    skills = {}
    for skill_data in skills_data:
        existing = db.query(models.Skill).filter(models.Skill.name == skill_data["name"]).first()
        if not existing:
            skill = models.Skill(**skill_data)
            db.add(skill)
            db.flush()
            skills[skill_data["name"]] = skill
            print(f"  Created skill: {skill_data['name']}")
        else:
            skills[skill_data["name"]] = existing
            print(f"  Skill already exists: {skill_data['name']}")
    
    # 3. Create Companies
    print("\nCreating companies...")
    companies_data = [
        {
            "name": "TechAccess Solutions",
            "website": "https://techaccess.com",
            "industry": "Technology",
            "size": "50-200"
        },
        {
            "name": "Inclusive Works",
            "website": "https://inclusiveworks.com",
            "industry": "Consulting",
            "size": "10-50"
        },
        {
            "name": "RemoteFirst Inc",
            "website": "https://remotefirst.com",
            "industry": "Software",
            "size": "200-500"
        },
        {
            "name": "Accessible Services Co",
            "website": "https://accessibleservices.com",
            "industry": "Services",
            "size": "50-200"
        },
        {
            "name": "Diverse Talent Hub",
            "website": "https://diversetalent.com",
            "industry": "Recruitment",
            "size": "10-50"
        },
    ]
    
    companies = {}
    for comp_data in companies_data:
        existing = db.query(models.Company).filter(models.Company.name == comp_data["name"]).first()
        if not existing:
            company = models.Company(**comp_data)
            db.add(company)
            db.flush()
            companies[comp_data["name"]] = company
            print(f"  Created company: {comp_data['name']}")
        else:
            companies[comp_data["name"]] = existing
            print(f"  Company already exists: {comp_data['name']}")
    
    # 4. Create Locations
    print("\nCreating locations...")
    locations_data = [
        {"city": "New York", "country": "USA", "company_id": companies["TechAccess Solutions"].id},
        {"city": "San Francisco", "country": "USA", "company_id": companies["RemoteFirst Inc"].id},
        {"city": "London", "country": "UK", "company_id": companies["Inclusive Works"].id},
        {"city": "Toronto", "country": "Canada", "company_id": companies["Accessible Services Co"].id},
        {"city": "Sydney", "country": "Australia", "company_id": companies["Diverse Talent Hub"].id},
    ]
    
    locations = {}
    for loc_data in locations_data:
        location = models.Location(**loc_data)
        db.add(location)
        db.flush()
        locations[f"{loc_data['city']}, {loc_data['country']}"] = location
        print(f"  Created location: {loc_data['city']}, {loc_data['country']}")
    
    # 5. Create Jobs
    print("\nCreating jobs...")
    jobs_data = [
        {
            "title": "Remote Python Developer",
            "description": "We are looking for a Python developer to join our remote team. This position is fully remote and we provide accommodations for various disabilities. You'll work on web applications and APIs.",
            "employment_type": "full-time",
            "remote_type": "remote",
            "company": companies["RemoteFirst Inc"],
            "location": locations["San Francisco, USA"],
            "requirements": ["Python", "REST APIs", "Git", "3+ years experience"],
            "disabilities": ["Visual Impairment", "Mobility Impairment", "Autism Spectrum Disorder"]
        },
        {
            "title": "Data Entry Specialist",
            "description": "Part-time data entry position. Flexible hours, work from home. Perfect for individuals who need flexible scheduling. We provide screen reader support and other accessibility tools.",
            "employment_type": "part-time",
            "remote_type": "remote",
            "company": companies["TechAccess Solutions"],
            "location": locations["New York, USA"],
            "requirements": ["Microsoft Office", "Attention to detail", "Typing speed 50+ WPM"],
            "disabilities": ["Visual Impairment", "Mobility Impairment", "Chronic Pain"]
        },
        {
            "title": "Customer Service Representative",
            "description": "Join our customer service team! We offer flexible hours and remote work options. Training provided. We welcome applicants with various disabilities and provide necessary accommodations.",
            "employment_type": "full-time",
            "remote_type": "hybrid",
            "company": companies["Accessible Services Co"],
            "location": locations["Toronto, Canada"],
            "requirements": ["Communication", "Customer Service", "Problem-solving"],
            "disabilities": ["Hearing Impairment", "ADHD", "Mental Health Condition"]
        },
        {
            "title": "Content Writer",
            "description": "Remote content writing position. Write articles, blog posts, and web content. Flexible schedule, work from anywhere. We support writers with dyslexia and provide writing assistance tools.",
            "employment_type": "contract",
            "remote_type": "remote",
            "company": companies["Inclusive Works"],
            "location": locations["London, UK"],
            "requirements": ["Content Writing", "SEO knowledge", "Research skills"],
            "disabilities": ["Dyslexia", "ADHD", "Mental Health Condition"]
        },
        {
            "title": "Frontend Web Developer",
            "description": "Build accessible web interfaces. We prioritize accessibility and welcome developers with disabilities. Remote work available. You'll work with React, JavaScript, and accessibility standards.",
            "employment_type": "full-time",
            "remote_type": "remote",
            "company": companies["TechAccess Solutions"],
            "location": locations["New York, USA"],
            "requirements": ["JavaScript", "React", "Web Development", "Accessibility standards"],
            "disabilities": ["Visual Impairment", "Autism Spectrum Disorder"]
        },
        {
            "title": "Graphic Designer",
            "description": "Create visual designs for digital and print media. Remote position with flexible hours. We provide design software and tools that support various accessibility needs.",
            "employment_type": "part-time",
            "remote_type": "remote",
            "company": companies["Diverse Talent Hub"],
            "location": locations["Sydney, Australia"],
            "requirements": ["Graphic Design", "Adobe Creative Suite", "Creativity"],
            "disabilities": ["Visual Impairment", "Mobility Impairment"]
        },
        {
            "title": "Project Manager",
            "description": "Manage software development projects. Coordinate teams, track progress, and ensure deliverables. Remote work with flexible scheduling. We support project managers with various needs.",
            "employment_type": "full-time",
            "remote_type": "hybrid",
            "company": companies["RemoteFirst Inc"],
            "location": locations["San Francisco, USA"],
            "requirements": ["Project Management", "Communication", "Agile methodology"],
            "disabilities": ["ADHD", "Mental Health Condition"]
        },
        {
            "title": "JavaScript Developer",
            "description": "Develop interactive web applications using JavaScript. Fully remote position. We welcome developers with disabilities and provide necessary accommodations and tools.",
            "employment_type": "full-time",
            "remote_type": "remote",
            "company": companies["TechAccess Solutions"],
            "location": locations["New York, USA"],
            "requirements": ["JavaScript", "Web Development", "Git", "2+ years experience"],
            "disabilities": ["Autism Spectrum Disorder", "ADHD"]
        },
    ]
    
    for job_data in jobs_data:
        # Extract disabilities list
        disability_names = job_data.pop("disabilities")
        requirements_list = job_data.pop("requirements")
        
        # Create job
        job = models.Job(**job_data)
        db.add(job)
        db.flush()
        
        # Add requirements
        for req in requirements_list:
            req_obj = models.JobRequirement(job_id=job.id, requirement=req)
            db.add(req_obj)
        
        # Add disability support
        for dis_name in disability_names:
            if dis_name in disabilities:
                job.disabilities_supported.append(disabilities[dis_name])
        
        print(f"  Created job: {job.title} at {job.company.name}")
    
    # Commit all changes
    db.commit()
    print("\n[SUCCESS] Database seeding completed successfully!")
    print(f"\nSummary:")
    print(f"  - Disabilities: {len(disabilities)}")
    print(f"  - Skills: {len(skills)}")
    print(f"  - Companies: {len(companies)}")
    print(f"  - Locations: {len(locations)}")
    print(f"  - Jobs: {len(jobs_data)}")

if __name__ == "__main__":
    try:
        seed_data()
    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Error seeding database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

