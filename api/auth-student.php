<?php
header('Content-Type: application/json');
require_once __DIR__.'/db-config.php';
$sid  = $_POST['student_id'] ?? '';
$pass = $_POST['password'] ?? '';
$db = getDB();
$stmt = $db->prepare("SELECT * FROM students WHERE student_id = ? OR admission_no = ? OR roll_no = ? LIMIT 1");
$stmt->execute([$sid, $sid, is_numeric($sid) ? (int)$sid : 0]);
$student = $stmt->fetch();
if (!$student) { echo json_encode(['error' => 'Student not found']); exit; }
$dobPw = date('dmY', strtotime($student['date_of_birth']));
if ($pass === $dobPw || $pass === $student['password'] || password_verify($pass, $student['password'])) {
    echo json_encode(['success' => true, 'student' => [
        'student_id' => $student['student_id'], 'name' => $student['full_name'],
        'class' => $student['class'], 'section' => $student['section'],
        'roll_no' => $student['roll_no'], 'house' => $student['house'],
        'father' => $student['father_name'], 'phone' => $student['parent_phone'],
        'dob' => $student['date_of_birth'], 'blood' => $student['blood_group']
    ]]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid password']);
}
