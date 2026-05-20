-- ============================================
-- EmpowerWork Database DDL (Data Definition Language)
-- Database: rag_jobs
-- Engine: MySQL/MariaDB
-- Character Set: utf8mb4
-- ============================================

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS `rag_jobs` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `rag_jobs`;

-- ============================================
-- Core Tables
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NULL,
    `user_type` VARCHAR(20) DEFAULT 'user',
    `photo` VARCHAR(500) NULL,
    `phone` VARCHAR(50) NULL,
    `age` INT NULL,
    `gender` VARCHAR(20) NULL,
    `location` VARCHAR(255) NULL,
    `experience_level` VARCHAR(50) NULL,
    `preferred_job_type` VARCHAR(50) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_user_type` (`user_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Disabilities Table
CREATE TABLE IF NOT EXISTS `disabilities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) UNIQUE NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(100) NULL,
    `icon` VARCHAR(100) NULL,
    `severity` VARCHAR(50) NULL,
    INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Skills Table
CREATE TABLE IF NOT EXISTS `skills` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Companies Table
CREATE TABLE IF NOT EXISTS `companies` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `website` VARCHAR(500) NULL,
    `logo` VARCHAR(500) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Locations Table
CREATE TABLE IF NOT EXISTS `locations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL,
    `address` VARCHAR(500) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Job-Related Tables
-- ============================================

-- Jobs Table
CREATE TABLE IF NOT EXISTS `jobs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `employment_type` VARCHAR(50) NULL,
    `remote_type` VARCHAR(50) NULL,
    `company_id` INT NULL,
    `location_id` INT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
    FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE SET NULL,
    INDEX `idx_company` (`company_id`),
    INDEX `idx_location` (`location_id`),
    INDEX `idx_employment_type` (`employment_type`),
    INDEX `idx_remote_type` (`remote_type`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Requirements Table
CREATE TABLE IF NOT EXISTS `job_requirements` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `job_id` INT NOT NULL,
    `requirement` VARCHAR(500) NOT NULL,
    FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE,
    INDEX `idx_job` (`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Applications Table
CREATE TABLE IF NOT EXISTS `job_applications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `job_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `cover_letter` TEXT NULL,
    `cv_path` VARCHAR(500) NULL,
    `cv_file_path` VARCHAR(500) NULL,
    `cv_extracted_info` TEXT NULL COMMENT 'JSON string containing extracted CV data',
    `manual_info` TEXT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `admin_notes` TEXT NULL,
    `reviewer_id` INT NULL,
    `applied_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at` DATETIME NULL,
    FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_job` (`job_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_reviewer` (`reviewer_id`),
    INDEX `idx_applied_at` (`applied_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Association Tables (Many-to-Many)
-- ============================================

-- User-Disabilities Association Table
CREATE TABLE IF NOT EXISTS `user_disabilities` (
    `user_id` INT NOT NULL,
    `disability_id` INT NOT NULL,
    PRIMARY KEY (`user_id`, `disability_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`disability_id`) REFERENCES `disabilities`(`id`) ON DELETE CASCADE,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_disability` (`disability_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User-Skills Association Table
CREATE TABLE IF NOT EXISTS `user_skills` (
    `user_id` INT NOT NULL,
    `skill_id` INT NOT NULL,
    PRIMARY KEY (`user_id`, `skill_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_skill` (`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job-Disability Support Association Table
CREATE TABLE IF NOT EXISTS `job_disability_support` (
    `job_id` INT NOT NULL,
    `disability_id` INT NOT NULL,
    PRIMARY KEY (`job_id`, `disability_id`),
    FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`disability_id`) REFERENCES `disabilities`(`id`) ON DELETE CASCADE,
    INDEX `idx_job` (`job_id`),
    INDEX `idx_disability` (`disability_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Assistive Tools Table
-- ============================================

-- Assistive Tools Table
CREATE TABLE IF NOT EXISTS `assistive_tools` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(100) NULL,
    `tool_type` VARCHAR(100) NULL,
    `platform` VARCHAR(100) NULL,
    `cost` VARCHAR(50) NULL,
    `website_url` VARCHAR(500) NULL,
    `icon` VARCHAR(100) NULL,
    `features` TEXT NULL,
    INDEX `idx_category` (`category`),
    INDEX `idx_platform` (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Disability-Tools Association Table
CREATE TABLE IF NOT EXISTS `disability_tools` (
    `disability_id` INT NOT NULL,
    `tool_id` INT NOT NULL,
    PRIMARY KEY (`disability_id`, `tool_id`),
    FOREIGN KEY (`disability_id`) REFERENCES `disabilities`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tool_id`) REFERENCES `assistive_tools`(`id`) ON DELETE CASCADE,
    INDEX `idx_disability` (`disability_id`),
    INDEX `idx_tool` (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Logging Tables
-- ============================================

-- Conversation Logs Table
CREATE TABLE IF NOT EXISTS `conversation_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `message` TEXT NOT NULL,
    `response` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Log Table
CREATE TABLE IF NOT EXISTS `activity_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `action` VARCHAR(255) NOT NULL,
    `detail` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_action` (`action`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security Logs Table
CREATE TABLE IF NOT EXISTS `security_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `ip_address` VARCHAR(45) NOT NULL COMMENT 'IPv6 support',
    `action` VARCHAR(255) NOT NULL COMMENT 'login_attempt, suspicious_activity, etc.',
    `severity` VARCHAR(20) NOT NULL DEFAULT 'info' COMMENT 'info, warning, critical',
    `threat_type` VARCHAR(100) NULL COMMENT 'sql_injection, xss, brute_force, etc.',
    `details` TEXT NULL,
    `detected_by` VARCHAR(50) DEFAULT 'system' COMMENT 'system, ids_model, manual',
    `blocked` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_severity` (`severity`),
    INDEX `idx_threat_type` (`threat_type`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_ip_address` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- End of DDL
-- ============================================

