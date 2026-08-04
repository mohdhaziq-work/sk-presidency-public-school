<?php
header('Content-Type: application/json');
require_once __DIR__.'/db-config.php';
$db = getDB();
$teachers = $db->query("SELECT username, full_name, email, is_active FROM admin_users WHERE role = 'Teacher' ORDER BY full_name")->fetchAll();
echo json_encode($teachers);
