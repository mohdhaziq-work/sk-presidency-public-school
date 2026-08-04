<?php
header('Content-Type: application/json');
require_once __DIR__.'/db-config.php';
$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['username']) || empty($data['password']) || empty($data['name'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Username, password, and name required']));
}
$db = getDB();
$hash = password_hash($data['password'], PASSWORD_BCRYPT);
$stmt = $db->prepare("INSERT INTO admin_users (username, password_hash, full_name, role, email, is_active) VALUES (?,?,?,'Teacher',?,1)");
$stmt->execute([$data['username'], $hash, $data['name'], $data['email'] ?? '']);
echo json_encode(['success' => true, 'message' => 'Teacher saved to MySQL']);
