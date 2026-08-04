-- ============================================================
-- SK PRESIDENCY PUBLIC SCHOOL - Database Schema
-- Run this ONCE on your server via phpMyAdmin or MySQL CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS skpps_students CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skpps_students;

-- 1. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    admission_no VARCHAR(20) DEFAULT NULL,
    roll_no INT DEFAULT NULL,
    full_name VARCHAR(100) NOT NULL,
    father_name VARCHAR(100) DEFAULT NULL,
    mother_name VARCHAR(100) DEFAULT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male','Female','Other') DEFAULT 'Male',
    class VARCHAR(10) NOT NULL,
    section VARCHAR(5) DEFAULT 'A',
    house ENUM('Earth','Fire','Water','Air') DEFAULT 'Earth',
    blood_group VARCHAR(5) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    parent_phone VARCHAR(15) DEFAULT NULL,
    parent_email VARCHAR(100) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    password_set TINYINT(1) DEFAULT 0,
    photo VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    admission_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT NULL,
    login_count INT DEFAULT 0,
    INDEX idx_class (class), INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- 2. ACADEMIC RESULTS
CREATE TABLE IF NOT EXISTS academic_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    exam_type VARCHAR(30) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    marks_obtained DECIMAL(6,2) DEFAULT NULL,
    marks_total DECIMAL(6,2) DEFAULT NULL,
    grade VARCHAR(5) DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present','Absent','Late','Half-Day','Holiday') NOT NULL DEFAULT 'Present',
    marked_by VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE KEY uniq_att (student_id, attendance_date)
) ENGINE=InnoDB;

-- 4. FEES
CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    fee_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    due_date DATE DEFAULT NULL,
    paid_date DATE DEFAULT NULL,
    status ENUM('Pending','Partial','Paid','Overdue') DEFAULT 'Pending',
    academic_year VARCHAR(10) NOT NULL,
    receipt_no VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. NOTICES
CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    target_class VARCHAR(50) DEFAULT 'All',
    priority ENUM('Low','Normal','High','Urgent') DEFAULT 'Normal',
    attachment VARCHAR(255) DEFAULT NULL,
    posted_by VARCHAR(100) DEFAULT NULL,
    expires_at DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. TIMETABLE
CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class VARCHAR(10) NOT NULL,
    section VARCHAR(5) DEFAULT NULL,
    day_of_week TINYINT NOT NULL,
    period_no TINYINT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    teacher_name VARCHAR(100) DEFAULT NULL,
    start_time TIME DEFAULT NULL,
    end_time TIME DEFAULT NULL,
    academic_year VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. ADMIN/TEACHER USERS
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('Super Admin','Admin','Teacher','Accountant') DEFAULT 'Teacher',
    email VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(15) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default admin - RUN THIS AFTER REPLACING THE HASH:
-- INSERT INTO admin_users (username, password_hash, full_name, role)
-- VALUES ('admin', 'REPLACE_WITH_BCRYPT_HASH', 'School Administrator', 'Super Admin');
-- Generate hash: php -r "echo password_hash('yourpassword', PASSWORD_BCRYPT);"

SELECT 'Database setup complete! Tables created.' AS status;
SHOW TABLES;
