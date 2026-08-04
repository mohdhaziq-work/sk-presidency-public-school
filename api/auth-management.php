<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);
$code = $data['code'] ?? '';
$pass = $data['password'] ?? '';
$MGMT_CODE = getenv('SKPPS_MGMT_CODE') ?: 'CHANGE_ME';
$MGMT_HASH = getenv('SKPPS_MGMT_HASH') ?: '$2y$10$PLACEHOLDER_REPLACE_WITH_REAL_HASH';
if ($code === $MGMT_CODE && password_verify($pass, $MGMT_HASH)) {
    echo json_encode(['success' => true, 'role' => 'management', 'name' => 'Management']);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
