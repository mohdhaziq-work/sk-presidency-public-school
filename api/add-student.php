<?php
session_start();
if (empty($_SESSION['staff_logged_in']) || $_SESSION['staff_role'] !== 'management') {
    header('Location: ../staff-login.html'); exit;
}

$db_host = 'localhost'; $db_name = 'skpps_students'; $db_user = 'root'; $db_pass = '';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: ../management/dashboard.php'); exit; }

$student_id  = trim($_POST['student_id'] ?? '');
$full_name   = trim($_POST['full_name'] ?? '');
$class       = trim($_POST['class'] ?? '');
$section     = trim($_POST['section'] ?? 'A');
$roll_no     = (int)($_POST['roll_no'] ?? 0);
$dob         = trim($_POST['date_of_birth'] ?? date('Y-m-d'));
$father      = trim($_POST['father_name'] ?? '');
$phone       = trim($_POST['parent_phone'] ?? '');
$blood       = trim($_POST['blood_group'] ?? '');
$house       = trim($_POST['house'] ?? 'Earth');
$gender      = trim($_POST['gender'] ?? 'Male');
$mother      = trim($_POST['mother_name'] ?? '');
$admission   = trim($_POST['admission_no'] ?? '');
$email       = trim($_POST['parent_email'] ?? '');

if (!$student_id) $student_id = 'SKPPS' . date('Y') . str_pad(rand(1,999), 3, '0', STR_PAD_LEFT);
if (!$full_name || !$class) die('Name and Class are required.');

$password = date('dmY', strtotime($dob));

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $pdo->prepare("INSERT INTO students (student_id, admission_no, roll_no, full_name, father_name, mother_name, date_of_birth, gender, class, section, house, blood_group, parent_phone, parent_email, password, admission_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURDATE())")
        ->execute([$student_id, $admission, $roll_no, $full_name, $father, $mother, $dob, $gender, $class, $section, $house, $blood, $phone, $email, $password]);
    header('Location: ../management/dashboard.php?msg=Student+added');
} catch(Exception $e) {
    header('Location: ../management/dashboard.php?err='.urlencode($e->getMessage()));
}
exit;
