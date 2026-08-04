<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);
$code = $data['code'] ?? '';
$pass = $data['password'] ?? '';
$MGMT_CODE = 'SKPPS@2024#ADMIN';
$MGMT_HASH = '$2y$10$0F9JbHRdsAsCFbscq9CnbOlMIsUyKQqZ9mXtOqZkHZ0QLBu8PIRQW';
if ($code === $MGMT_CODE && password_verify($pass, $MGMT_HASH)) {
    echo json_encode(['success' => true, 'role' => 'management', 'name' => 'Management']);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
