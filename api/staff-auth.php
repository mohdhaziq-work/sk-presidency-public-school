<?php
/**
 * STAFF AUTHENTICATION API
 * Management: security_code + password
 * Teacher: username + password
 */
session_start();

// ===== CONFIG =====
$MANAGEMENT_SECURITY_CODE = getenv('SKPPS_MGMT_CODE') ?: 'CHANGE_ME';
$MANAGEMENT_PASSWORD_HASH = getenv('SKPPS_MGMT_HASH') ?: '$2y$10$PLACEHOLDER_REPLACE_WITH_REAL_HASH';

// Teacher credentials (admin adds teachers via management panel)
$db_host = 'localhost'; $db_name = 'skpps_students';
$db_user = 'root'; $db_pass = '';

function redirect($url) { header("Location: $url"); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect('../staff-login.html');

$role = $_POST['role'] ?? '';

// ===== MANAGEMENT LOGIN =====
if ($role === 'management') {
    $code = trim($_POST['security_code'] ?? '');
    $pass = trim($_POST['password'] ?? '');

    if ($code !== $MANAGEMENT_SECURITY_CODE || !password_verify($pass, $MANAGEMENT_PASSWORD_HASH)) {
        redirect('../staff-login.html?e=1');
    }

    $_SESSION['staff_logged_in'] = true;
    $_SESSION['staff_role'] = 'management';
    $_SESSION['staff_name'] = 'Management';

    redirect('../management/dashboard.php');
}

// ===== TEACHER LOGIN =====
if ($role === 'teacher') {
    $username = trim($_POST['username'] ?? '');
    $pass     = trim($_POST['password'] ?? '');

    try {
        $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = :u AND role = 'Teacher' AND is_active = 1");
        $stmt->execute(['u' => $username]);
        $teacher = $stmt->fetch();

        if (!$teacher || !password_verify($pass, $teacher['password_hash'])) {
            redirect('../staff-login.html?e=1');
        }

        $_SESSION['staff_logged_in'] = true;
        $_SESSION['staff_role'] = 'teacher';
        $_SESSION['staff_name'] = $teacher['full_name'];
        $_SESSION['staff_id']   = $teacher['id'];

        $pdo->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = :id")->execute(['id' => $teacher['id']]);

        redirect('../staff/teacher-dashboard.php');
    } catch(Exception $e) {
        redirect('../staff-login.html?e=1');
    }
}

redirect('../staff-login.html?e=1');
