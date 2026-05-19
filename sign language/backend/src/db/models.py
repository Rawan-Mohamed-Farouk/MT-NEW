from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.src.db.database import Base

# Association tables
user_disabilities = Table(
    'user_disabilities',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('disability_id', Integer, ForeignKey('disabilities.id'), primary_key=True)
)

user_skills = Table(
    'user_skills',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id'), primary_key=True)
)

job_disability_support = Table(
    'job_disability_support',
    Base.metadata,
    Column('job_id', Integer, ForeignKey('jobs.id'), primary_key=True),
    Column('disability_id', Integer, ForeignKey('disabilities.id'), primary_key=True)
)

disability_tools = Table(
    'disability_tools',
    Base.metadata,
    Column('disability_id', Integer, ForeignKey('disabilities.id'), primary_key=True),
    Column('tool_id', Integer, ForeignKey('assistive_tools.id'), primary_key=True)
)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=True)
    user_type = Column(String(20), default='user')
    photo = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    location = Column(String(255), nullable=True)
    experience_level = Column(String(50), nullable=True)
    preferred_job_type = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    disabilities = relationship("Disability", secondary=user_disabilities, back_populates="users")
    skills = relationship("Skill", secondary=user_skills, back_populates="users")


class Disability(Base):
    __tablename__ = "disabilities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    icon = Column(String(100), nullable=True)
    severity = Column(String(50), nullable=True)
    
    users = relationship("User", secondary=user_disabilities, back_populates="disabilities")
    jobs = relationship("Job", secondary=job_disability_support, back_populates="disabilities")
    tools = relationship("AssistiveTool", secondary=disability_tools, back_populates="disabilities")


class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    
    users = relationship("User", secondary=user_skills, back_populates="skills")


class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)
    logo = Column(String(500), nullable=True)


class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    address = Column(String(500), nullable=True)


class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    employment_type = Column(String(50), nullable=True)
    remote_type = Column(String(50), nullable=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=True)
    location_id = Column(Integer, ForeignKey('locations.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    
    company = relationship("Company")
    location = relationship("Location")
    requirements = relationship("JobRequirement", back_populates="job", cascade="all, delete-orphan")
    disabilities = relationship("Disability", secondary=job_disability_support, back_populates="jobs")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")
    
    # Alias for backward compatibility (use disabilities for new code)
    @property
    def disabilities_supported(self):
        return self.disabilities
    
    # Alias for backward compatibility (posted_at -> created_at)
    @property
    def posted_at(self):
        return self.created_at


class JobRequirement(Base):
    __tablename__ = "job_requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    requirement = Column(String(500), nullable=False)
    
    job = relationship("Job", back_populates="requirements")


class JobApplication(Base):
    __tablename__ = "job_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    cover_letter = Column(Text, nullable=True)
    cv_path = Column(String(500), nullable=True)
    cv_file_path = Column(String(500), nullable=True)  # Alias for cv_path
    cv_extracted_info = Column(Text, nullable=True)  # JSON stored as TEXT
    manual_info = Column(Text, nullable=True)
    status = Column(String(50), default='pending')
    admin_notes = Column(Text, nullable=True)
    reviewer_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    
    job = relationship("Job", back_populates="applications")
    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    
    @property
    def cv_extracted_info_dict(self):
        """Parse cv_extracted_info JSON string to dict"""
        if not self.cv_extracted_info:
            return None
        try:
            import json
            return json.loads(self.cv_extracted_info)
        except:
            return None


class AssistiveTool(Base):
    __tablename__ = "assistive_tools"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    tool_type = Column(String(100), nullable=True)
    platform = Column(String(100), nullable=True)
    cost = Column(String(50), nullable=True)
    website_url = Column(String(500), nullable=True)
    icon = Column(String(100), nullable=True)
    features = Column(Text, nullable=True)
    
    disabilities = relationship("Disability", secondary=disability_tools, back_populates="tools")


class ConversationLog(Base):
    __tablename__ = "conversation_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")


class ActivityLog(Base):
    __tablename__ = "activity_log"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    action = Column(String(255), nullable=False)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")


class SecurityLog(Base):
    __tablename__ = "security_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    ip_address = Column(String(45), nullable=False)  # IPv6 support
    action = Column(String(255), nullable=False)  # login_attempt, suspicious_activity, etc.
    severity = Column(String(20), nullable=False, default='info')  # info, warning, critical
    threat_type = Column(String(100), nullable=True)  # sql_injection, xss, brute_force, etc.
    details = Column(Text, nullable=True)
    detected_by = Column(String(50), default='system')  # system, ids_model, manual
    blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
