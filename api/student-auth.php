<?php
/**
 * SK PRESIDENCY PUBLIC SCHOOL
 * Student Authentication API
 * 
 * Database: MySQL
 * Table: students
 * 
 * Default password for new students: DDMMYYYY (Date of Birth)
 * School management adds students via admin panel
 */

session_start();
header('Content-Type: text/html; charset=UTF-8');

// ========== DATABASE CONFIG ==========
// Change these to your actual hosting credentials
$db_host = 'localhost';
$db_name = 'skpps_students';
$db_user = 'root';
$db_pass = '';

// ========== CONNECT ==========
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch(PDOException $e) {
    // If DB not set up yet, show a friendly message
    if (isset($_POST['student_id'])) {
        die('<script>alert("System setup in progress. Please contact school administration."); window.location.href="../student-login.html";</script>');
    }
    die("Database connection error. Please contact administrator.");
}

// ========== LOGIN HANDLER ==========
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $student_id = trim($_POST['student_id'] ?? '');
    $password   = trim($_POST['password'] ?? '');

    if (empty($student_id) || empty($password)) {
        header('Location: ../student-login.html?error=empty');
        exit;
    }

    // Find student by ID (roll number or admission number)
    $stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = :sid OR admission_no = :sid2 LIMIT 1");
    $stmt->execute(['sid' => $student_id, 'sid2' => $student_id]);
    $student = $stmt->fetch();

    if (!$student) {
        header('Location: ../student-login.html?error=invalid');
        exit;
    }

    // Verify password: Accept BOTH the stored password AND DOB-based password
    // Format: DDMMYYYY (from date_of_birth field)
    $dob_password = date('dmY', strtotime($student['date_of_birth']));

    if ($password === $student['password'] || $password === $dob_password) {
        // Login successful - set session
        $_SESSION['student_logged_in'] = true;
        $_SESSION['student_id']        = $student['student_id'];
        $_SESSION['student_name']      = $student['full_name'];
        $_SESSION['student_class']     = $student['class'];
        $_SESSION['student_section']   = $student['section'];
        $_SESSION['student_roll']      = $student['roll_no'];
        $_SESSION['student_db_id']     = $student['id'];

        // Log the login
        $log = $pdo->prepare("UPDATE students SET last_login = NOW(), login_count = login_count + 1 WHERE id = :id");
        $log->execute(['id' => $student['id']]);

        header('Location: ../student/dashboard.php');
        exit;
    } else {
        header('Location: ../student-login.html?error=invalid');
        exit;
    }
}

// If someone visits this page directly
header('Location: ../student-login.html');
exit;
