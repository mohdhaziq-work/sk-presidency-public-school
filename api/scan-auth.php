<?php
/**
 * SK PRESIDENCY PUBLIC SCHOOL
 * Smart ID Card Scanner - Auth API
 * 
 * Mode 1: POST raw_text/name/class/roll_no → JSON match result
 * Mode 2: POST confirm_login=student_id → Create session, redirect to dashboard
 */
session_start();

$db_host = 'localhost'; $db_name = 'skpps_students';
$db_user = 'root'; $db_pass = '';

header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch(PDOException $e) {
    echo json_encode(['found' => false, 'error' => 'Database unavailable']);
    exit;
}

// ===== MODE 2: Confirm login =====
if (!empty($_POST['confirm_login'])) {
    $sid = trim($_POST['confirm_login']);
    $stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = :sid LIMIT 1");
    $stmt->execute(['sid' => $sid]);
    $student = $stmt->fetch();

    if ($student) {
        $_SESSION['student_logged_in'] = true;
        $_SESSION['student_id']        = $student['student_id'];
        $_SESSION['student_name']      = $student['full_name'];
        $_SESSION['student_class']     = $student['class'];
        $_SESSION['student_section']   = $student['section'];
        $_SESSION['student_roll']      = $student['roll_no'];
        $_SESSION['student_db_id']     = $student['id'];

        $pdo->prepare("UPDATE students SET last_login = NOW(), login_count = login_count + 1 WHERE id = :id")
            ->execute(['id' => $student['id']]);

        // Check if needs password change
        $dob_pw = date('dmY', strtotime($student['date_of_birth']));
        if ($student['password'] === $dob_pw || !$student['password_set']) {
            $_SESSION['needs_password_change'] = true;
            header('Location: ../student/change-password.php');
            exit;
        }

        header('Location: ../student/dashboard.php');
        exit;
    }
    echo json_encode(['found' => false]);
    exit;
}

// ===== MODE 1: Search student =====
$name   = trim($_POST['name'] ?? '');
$class  = trim($_POST['class'] ?? '');
$roll   = trim($_POST['roll_no'] ?? '');
$sid    = trim($_POST['student_id'] ?? '');
$raw    = trim($_POST['raw_text'] ?? '');

$student = null;

// 1) Try exact student_id match
if ($sid) {
    $stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = :s1 OR admission_no = :s2 LIMIT 1");
    $stmt->execute(['s1' => $sid, 's2' => $sid]);
    $student = $stmt->fetch();
}

// 2) Try roll_no + class match
if (!$student && $roll && $class) {
    $stmt = $pdo->prepare("SELECT * FROM students WHERE roll_no = :rn AND class = :cl LIMIT 1");
    $stmt->execute(['rn' => (int)$roll, 'cl' => $class]);
    $student = $stmt->fetch();
}

// 3) Try name + class match
if (!$student && $name && $class) {
    $stmt = $pdo->prepare("SELECT * FROM students WHERE class = :cl AND full_name LIKE :nm LIMIT 1");
    $stmt->execute(['cl' => $class, 'nm' => "%$name%"]);
    $student = $stmt->fetch();
}

// 4) Try name fuzzy match
if (!$student && $name) {
    $stmt = $pdo->prepare("SELECT * FROM students WHERE full_name LIKE :nm LIMIT 1");
    $stmt->execute(['nm' => "%$name%"]);
    $student = $stmt->fetch();
}

// 5) Try searching raw text for any student ID
if (!$student && $raw) {
    // Look for any word that matches a student_id pattern
    $words = preg_split('/[\s,]+/', $raw);
    foreach ($words as $word) {
        if (strlen($word) >= 4) {
            $stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = :s OR admission_no = :s2 OR full_name LIKE :nm LIMIT 1");
            $stmt->execute(['s' => $word, 's2' => $word, 'nm' => "%$word%"]);
            $student = $stmt->fetch();
            if ($student) break;
        }
    }
}

if ($student) {
    echo json_encode([
        'found'      => true,
        'student_id' => $student['student_id'],
        'name'       => $student['full_name'],
        'initial'    => strtoupper(substr($student['full_name'], 0, 1)),
        'class'      => $student['class'],
        'section'    => $student['section'],
        'roll_no'    => $student['roll_no'],
        'house'      => $student['house'],
    ]);
} else {
    echo json_encode(['found' => false]);
}
