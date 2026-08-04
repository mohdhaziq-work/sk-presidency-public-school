<?php
header('Content-Type: application/json');
require_once __DIR__.'/db-config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['name']) || empty($data['class'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Name and class required']));
}

$db = getDB();
$sid  = $data['student_id'] ?? ('SKPPS' . date('Y') . strtoupper(substr(uniqid(), -4)));
$name = trim($data['name']);
$cls  = trim($data['class']);
$sec  = trim($data['section'] ?? 'A');
$roll = (int)($data['roll_no'] ?? 0);
$dob  = trim($data['dob'] ?? date('Y-m-d'));
$father = trim($data['father'] ?? '');
$phone  = trim($data['phone'] ?? '');
$blood  = trim($data['blood_group'] ?? '');
$house  = trim($data['house'] ?? 'Earth');
$gender = trim($data['gender'] ?? 'Male');
$mother = trim($data['mother'] ?? '');
$email  = trim($data['email'] ?? '');
$admn   = trim($data['admission_no'] ?? '');
$password = date('dmY', strtotime($dob));

$stmt = $db->prepare("INSERT INTO students (student_id, admission_no, roll_no, full_name, father_name, mother_name, date_of_birth, gender, class, section, house, blood_group, parent_phone, parent_email, password, admission_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURDATE())");
$stmt->execute([$sid, $admn, $roll, $name, $father, $mother, $dob, $gender, $cls, $sec, $house, $blood, $phone, $email, $password]);

echo json_encode(['success' => true, 'student_id' => $sid, 'name' => $name, 'message' => 'Student saved to MySQL database']);
