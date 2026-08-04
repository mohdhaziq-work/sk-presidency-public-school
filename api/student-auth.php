<?php
/**
 * SK PRESIDENCY PUBLIC SCHOOL
 * Student Authentication API v2
 * Supports: Student ID login + Mobile/Name/Class login
 * First-time: requires password creation
 */
session_start();

$db_host = 'localhost'; $db_name = 'skpps_students';
$db_user = 'root'; $db_pass = '';

function redirect($url) { header("Location: $url"); exit; }

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch(PDOException $e) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        die('<script>alert("System under maintenance. Please try later.");window.location.href="../student-login.html";</script>');
    }
    redirect('../student-login.html');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('../student-login.html');
}

$student = null;

// ===== MODE 1: Student ID Login =====
if (!empty($_POST['student_id'])) {
    $sid = trim($_POST['student_id']);
    $pw  = trim($_POST['password'] ?? '');
    
    if (empty($pw)) redirect('../student-login.html?error=empty');
    
    $stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = :s1 OR admission_no = :s2 OR roll_no = :s3 LIMIT 1");
    $stmt->execute(['s1' => $sid, 's2' => $sid, 's3' => is_numeric($sid) ? (int)$sid : 0]);
    $student = $stmt->fetch();
}

// ===== MODE 2: Mobile + Name + Class Login =====
if (!$student && !empty($_POST['mobile'])) {
    $mobile = trim($_POST['mobile']);
    $name   = trim($_POST['student_name'] ?? '');
    $class  = trim($_POST['class'] ?? '');
    $pw     = trim($_POST['password'] ?? '');
    
    if (empty($name) || empty($class) || empty($pw)) redirect('../student-login.html?error=empty');
    
    $stmt = $pdo->prepare("SELECT * FROM students WHERE parent_phone = :ph AND class = :cl AND full_name LIKE :nm LIMIT 1");
    $stmt->execute(['ph' => $mobile, 'cl' => $class, 'nm' => "%$name%"]);
    $student = $stmt->fetch();
}

// ===== No student found =====
if (!$student) {
    redirect('../student-login.html?error=invalid');
}

// ===== VERIFY PASSWORD =====
$input_password = trim($_POST['password'] ?? '');
$dob_password   = date('dmY', strtotime($student['date_of_birth']));
$stored_hash    = $student['password'];

$is_valid = false;

// Check: stored password (could be hash or DOB)
if (password_verify($input_password, $stored_hash)) {
    $is_valid = true;
} elseif ($input_password === $stored_hash) {
    // Plaintext match (legacy DOB passwords)
    $is_valid = true;
} elseif ($input_password === $dob_password) {
    // Match against computed DOB
    $is_valid = true;
}

if (!$is_valid) {
    redirect('../student-login.html?error=invalid');
}

// ===== LOGIN SUCCESS =====
$_SESSION['student_logged_in'] = true;
$_SESSION['student_id']        = $student['student_id'];
$_SESSION['student_name']      = $student['full_name'];
$_SESSION['student_class']     = $student['class'];
$_SESSION['student_section']   = $student['section'];
$_SESSION['student_roll']      = $student['roll_no'];
$_SESSION['student_db_id']     = $student['id'];

// Update login stats
$pdo->prepare("UPDATE students SET last_login = NOW(), login_count = login_count + 1 WHERE id = :id")
    ->execute(['id' => $student['id']]);

// ===== CHECK IF FIRST LOGIN (still using DOB password) =====
$is_dob_password = ($input_password === $dob_password || $input_password === $student['date_of_birth']);

if ($is_dob_password) {
    $_SESSION['needs_password_change'] = true;
    redirect('../student/change-password.php');
}

redirect('../student/dashboard.php');
