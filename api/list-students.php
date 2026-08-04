<?php
header('Content-Type: application/json');
require_once __DIR__.'/db-config.php';
$db = getDB();
$students = $db->query("SELECT student_id, full_name, class, section, roll_no, house, parent_phone, date_of_birth, father_name, blood_group FROM students WHERE is_active = 1 ORDER BY class, roll_no")->fetchAll();
echo json_encode($students);
