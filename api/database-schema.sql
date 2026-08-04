-- ============================================================
-- SK PRESIDENCY PUBLIC SCHOOL - Student Management System
-- Database Schema for MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS skpps_students
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE skpps_students;

-- ============================================================
-- 1. STUDENTS TABLE
-- School management adds students through admin panel
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_id      VARCHAR(20)  NOT NULL UNIQUE COMMENT 'Unique Student ID (e.g., SKPPS2024001)',
    admission_no    VARCHAR(20)  DEFAULT NULL COMMENT 'CBSE Admission Number',
    roll_no         INT          DEFAULT NULL COMMENT 'Class Roll Number',
    full_name       VARCHAR(100) NOT NULL,
    father_name     VARCHAR(100) DEFAULT NULL,
    mother_name     VARCHAR(100) DEFAULT NULL,
    date_of_birth   DATE         NOT NULL,
    gender          ENUM('Male','Female','Other') DEFAULT NULL,
    class           VARCHAR(10)  NOT NULL COMMENT 'e.g., Nursery, I, II, ..., XII',
    section         VARCHAR(5)   DEFAULT NULL COMMENT 'A, B, C, etc.',
    house           ENUM('Earth','Fire','Water','Air') DEFAULT NULL,
    blood_group     VARCHAR(5)   DEFAULT NULL,
    address         TEXT         DEFAULT NULL,
    parent_phone    VARCHAR(15)  DEFAULT NULL,
    parent_email    VARCHAR(100) DEFAULT NULL,
    password        VARCHAR(255) NOT NULL COMMENT 'Hashed password (or DOB-based initially)',
    photo           VARCHAR(255) DEFAULT NULL COMMENT 'Path to student photo',
    is_active       TINYINT(1)   DEFAULT 1,
    admission_date  DATE         DEFAULT NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login      DATETIME     DEFAULT NULL,
    login_count     INT          DEFAULT 0,
    INDEX idx_class (class),
    INDEX idx_section (section),
    INDEX idx_house (house),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- 2. ACADEMIC RESULTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS academic_results (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_id      VARCHAR(20)  NOT NULL,
    exam_type       VARCHAR(30)  NOT NULL COMMENT 'Term-1, Term-2, Final, Unit Test, etc.',
    academic_year   VARCHAR(10)  NOT NULL COMMENT '2025-2026',
    subject         VARCHAR(50)  NOT NULL,
    marks_obtained  DECIMAL(6,2) DEFAULT NULL,
    marks_total     DECIMAL(6,2) DEFAULT NULL,
    grade           VARCHAR(5)   DEFAULT NULL,
    remarks         TEXT         DEFAULT NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_exam (student_id, exam_type, academic_year)
) ENGINE=InnoDB;

-- ============================================================
-- 3. ATTENDANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_id      VARCHAR(20)  NOT NULL,
    attendance_date DATE         NOT NULL,
    status          ENUM('Present','Absent','Late','Half-Day','Holiday') NOT NULL DEFAULT 'Present',
    marked_by       VARCHAR(100) DEFAULT NULL,
    remarks         VARCHAR(255) DEFAULT NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, attendance_date),
    INDEX idx_date (attendance_date)
) ENGINE=InnoDB;

-- ============================================================
-- 4. FEES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS fees (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_id      VARCHAR(20)  NOT NULL,
    fee_type        VARCHAR(50)  NOT NULL COMMENT 'Tuition, Transport, Lab, etc.',
    amount          DECIMAL(10,2) NOT NULL,
    paid_amount     DECIMAL(10,2) DEFAULT 0,
    due_date        DATE         DEFAULT NULL,
    paid_date       DATE         DEFAULT NULL,
    status          ENUM('Pending','Partial','Paid','Overdue') DEFAULT 'Pending',
    academic_year   VARCHAR(10)  NOT NULL,
    receipt_no      VARCHAR(50)  DEFAULT NULL,
    payment_mode    VARCHAR(30)  DEFAULT NULL,
    remarks         TEXT         DEFAULT NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_fee_status (student_id, status)
) ENGINE=InnoDB;

-- ============================================================
-- 5. NOTICES / ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    content         TEXT         NOT NULL,
    target_class    VARCHAR(50)  DEFAULT 'All' COMMENT 'All, or specific class like "X,XI,XII"',
    priority        ENUM('Low','Normal','High','Urgent') DEFAULT 'Normal',
    attachment      VARCHAR(255) DEFAULT NULL,
    posted_by       VARCHAR(100) DEFAULT NULL,
    expires_at      DATE         DEFAULT NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_target (target_class)
) ENGINE=InnoDB;

-- ============================================================
-- 6. TIMETABLE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS timetable (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    class           VARCHAR(10)  NOT NULL,
    section         VARCHAR(5)   DEFAULT NULL,
    day_of_week     TINYINT      NOT NULL COMMENT '1=Mon, 2=Tue, ..., 7=Sun',
    period_no       TINYINT      NOT NULL,
    subject         VARCHAR(50)  NOT NULL,
    teacher_name    VARCHAR(100) DEFAULT NULL,
    start_time      TIME         DEFAULT NULL,
    end_time        TIME         DEFAULT NULL,
    academic_year   VARCHAR(10)  NOT NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_class_day (class, section, day_of_week)
) ENGINE=InnoDB;

-- ============================================================
-- 7. ADMIN USERS TABLE (for school management)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    role            ENUM('Super Admin','Admin','Teacher','Accountant') DEFAULT 'Teacher',
    email           VARCHAR(100) DEFAULT NULL,
    phone           VARCHAR(15)  DEFAULT NULL,
    is_active       TINYINT(1)   DEFAULT 1,
    last_login      DATETIME     DEFAULT NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- SAMPLE DATA - Insert a test student
-- Password = DOB format: 01012010 (1st Jan 2010)
-- ============================================================
INSERT INTO students (student_id, admission_no, roll_no, full_name, father_name, date_of_birth,
    gender, class, section, house, parent_phone, password, admission_date)
VALUES
('SKPPS2024001', 'A2024001', 1, 'Aarav Sharma', 'Rajesh Sharma', '2010-01-01',
 'Male', 'IX', 'A', 'Earth', '8601735757', '01012010', '2024-04-01');

INSERT INTO admin_users (username, password_hash, full_name, role)
VALUES ('admin', '$2y$10$dummyhashreplacewithrealhash', 'School Administrator', 'Super Admin');
-- NOTE: Generate real password hash using: password_hash('yourpassword', PASSWORD_BCRYPT)

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'Database setup complete!' AS status;
SHOW TABLES;
