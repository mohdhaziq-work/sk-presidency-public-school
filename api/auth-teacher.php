<?php
header('Content-Type: application/json');
require_once __DIR__.'/db-config.php';
$data = json_decode(file_get_contents('php://input'), true);
$user = $data['username'] ?? '';
$pass = $data['password'] ?? '';
$db = getDB();
$stmt = $db->prepare("SELECT * FROM admin_users WHERE username = ? AND role = 'Teacher' AND is_active = 1");
$stmt->execute([$user]);
$teacher = $stmt->fetch();
if ($teacher && password_verify($pass, $teacher['password_hash'])) {
    echo json_encode(['success' => true, 'role' => 'teacher', 'name' => $teacher['full_name']]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
