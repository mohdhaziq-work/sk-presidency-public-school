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
    password_set    TINYINT(1)   DEFAULT 0 COMMENT '0=using DOB, 1=student set own password',
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
-- SAMPLE DATA
-- ============================================================

-- Test Student 1 (From ID Card)
INSERT INTO students (student_id, admission_no, roll_no, full_name, father_name, mother_name, date_of_birth,
    gender, class, section, house, blood_group, parent_phone, parent_email, password, admission_date, is_active)
VALUES
('SKPPS2024001', 'A2024001', 12, 'Mohd Haziq', 'Mohd Work', 'Shabana',
 '2016-03-15', 'Male', 'IV', 'A', 'Earth', 'B+', '8601735757', 'parent@email.com',
 '15032016', '2024-04-01', 1);

-- Test Student 2 (Sample)
INSERT INTO students (student_id, admission_no, roll_no, full_name, father_name, mother_name, date_of_birth,
    gender, class, section, house, blood_group, parent_phone, parent_email, password, admission_date, is_active)
VALUES
('SKPPS2024002', 'A2024002', 5, 'Deepanshi Gupta', 'Rajesh Gupta', 'Sunita Gupta',
 '2014-08-20', 'Female', 'VIII', 'B', 'Water', 'O+', '8601738180', 'gupta@email.com',
 '20082014', '2024-04-01', 1);

-- Test attendance for student 1
INSERT INTO attendance (student_id, attendance_date, status) VALUES
('SKPPS2024001', CURDATE(), 'Present'),
('SKPPS2024001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Present'),
('SKPPS2024001', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Present'),
('SKPPS2024001', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Late'),
('SKPPS2024001', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Present');

-- Test timetable for Class IV-A Monday
INSERT INTO timetable (class, section, day_of_week, period_no, subject, teacher_name, start_time, end_time, academic_year) VALUES
('IV', 'A', 1, 1, 'English', 'Mrs. Sharma', '08:00', '08:45', '2025-2026'),
('IV', 'A', 1, 2, 'Mathematics', 'Mr. Verma', '08:45', '09:30', '2025-2026'),
('IV', 'A', 1, 3, 'Hindi', 'Mrs. Singh', '09:45', '10:30', '2025-2026'),
('IV', 'A', 1, 4, 'Science', 'Mr. Kumar', '10:30', '11:15', '2025-2026'),
('IV', 'A', 1, 5, 'Social Studies', 'Mrs. Gupta', '11:30', '12:15', '2025-2026'),
('IV', 'A', 1, 6, 'Computer', 'Mr. Patel', '12:15', '13:00', '2025-2026');

-- Test notice
INSERT INTO notices (title, content, target_class, priority, expires_at) VALUES
('Parent-Teacher Meeting', 'PTM scheduled for next Saturday at 10:00 AM. All parents requested to attend.', 'All', 'High', DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
('Exam Schedule Released', 'Term-1 examination will begin from next month. Check timetable for details.', 'IV,V,VI,VII,VIII', 'Urgent', DATE_ADD(CURDATE(), INTERVAL 30 DAY));

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'Database setup complete!' AS status;
SHOW TABLES;
