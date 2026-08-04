<?php
/**
 * SK PRESIDENCY PUBLIC SCHOOL
 * Admin - Add Student (for school management)
 */

session_start();

// ========== SIMPLE AUTH (change these!) ==========
$admin_password = 'skppsadmin2024';

$error = ''; $success = '';
$is_authenticated = false;

if (isset($_POST['admin_password']) && $_POST['admin_password'] === $admin_password) {
    $_SESSION['admin_logged_in'] = true;
}
if (!empty($_SESSION['admin_logged_in'])) {
    $is_authenticated = true;
}

// ========== DATABASE ==========
$db_host = 'localhost'; $db_name = 'skpps_students';
$db_user = 'root'; $db_pass = '';

if ($is_authenticated && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['full_name'])) {
    try {
        $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);

        $student_id  = trim($_POST['student_id']);
        $admission_no = trim($_POST['admission_no'] ?? '');
        $roll_no     = (int)($_POST['roll_no'] ?? 0);
        $full_name   = trim($_POST['full_name']);
        $father_name = trim($_POST['father_name'] ?? '');
        $mother_name = trim($_POST['mother_name'] ?? '');
        $dob         = trim($_POST['date_of_birth']);
        $gender      = trim($_POST['gender'] ?? 'Male');
        $class       = trim($_POST['class']);
        $section     = trim($_POST['section'] ?? 'A');
        $house       = trim($_POST['house'] ?? 'Earth');
        $blood_group = trim($_POST['blood_group'] ?? '');
        $address     = trim($_POST['address'] ?? '');
        $parent_phone = trim($_POST['parent_phone'] ?? '');
        $parent_email = trim($_POST['parent_email'] ?? '');
        $password    = date('dmY', strtotime($dob)); // DOB format DDMMYYYY
        $admission_date = trim($_POST['admission_date'] ?? date('Y-m-d'));

        $stmt = $pdo->prepare("INSERT INTO students (student_id, admission_no, roll_no, full_name, father_name, mother_name, date_of_birth, gender, class, section, house, blood_group, address, parent_phone, parent_email, password, admission_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([$student_id, $admission_no, $roll_no, $full_name, $father_name, $mother_name, $dob, $gender, $class, $section, $house, $blood_group, $address, $parent_phone, $parent_email, $password, $admission_date]);

        $success = "Student <strong>" . htmlspecialchars($full_name) . "</strong> added successfully!<br>Student ID: <strong>" . htmlspecialchars($student_id) . "</strong><br>Default Password (DOB): <strong>" . $password . "</strong>";
    } catch(PDOException $e) {
        $error = "Error: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Panel - Add Student | SK Presidency Public School</title>
<style>
:root {
  --primary: #1A73E8; --primary-dark: #1557B0; --house-red: #E74C3C; --house-green: #27AE60;
  --white: #fff; --gray-50: #F8F9FA; --gray-100: #F1F3F4; --gray-200: #E8EAED;
  --gray-300: #DADCE0; --gray-500: #9AA0A6; --gray-600: #80868B; --gray-700: #5F6368; --gray-800: #3C4043; --gray-900: #202124;
  --radius-sm: 8px; --radius-md: 12px; --font: 'Segoe UI', 'Roboto', sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--gray-50);min-height:100vh}
.admin-header{background:var(--gray-900);color:white;padding:16px 24px;display:flex;justify-content:space-between;align-items:center}
.admin-header h2{font-size:18px}
.admin-header a{color:white;text-decoration:none;font-size:13px;opacity:0.8}
.admin-header a:hover{opacity:1}
.container{max-width:900px;margin:0 auto;padding:24px 20px}
.card{background:white;border-radius:var(--radius-md);box-shadow:0 2px 8px rgba(0,0,0,0.08);padding:clamp(20px,3vw,32px);margin-bottom:24px}
.card h3{font-size:18px;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--gray-100)}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.form-group{margin-bottom:16px}
.form-group label{display:block;font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:5px}
.form-group .required{color:var(--house-red)}
.form-group input,.form-group select{width:100%;padding:10px 14px;border:1.5px solid var(--gray-300);border-radius:var(--radius-sm);font-size:14px;font-family:var(--font);transition:all 0.2s;background:var(--white)}
.form-group input:focus,.form-group select:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(26,115,232,0.1)}
.btn-submit{background:var(--primary);color:white;border:none;padding:12px 28px;border-radius:var(--radius-sm);font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s}
.btn-submit:hover{background:var(--primary-dark)}
.alert{padding:14px 18px;border-radius:var(--radius-sm);margin-bottom:16px;font-size:14px}
.alert-success{background:#E6F4EA;color:var(--house-green);border-left:4px solid var(--house-green)}
.alert-error{background:#FDE8E8;color:var(--house-red);border-left:4px solid var(--house-red)}
.login-box{max-width:400px;margin:60px auto}
@media(max-width:640px){.form-row{grid-template-columns:1fr}}
</style>
</head>
<body>

<div class="admin-header">
  <h2>SKPPS Admin Panel</h2>
  <?php if ($is_authenticated): ?>
  <a href="?logout=1">Logout</a>
  <?php endif; ?>
</div>

<div class="container">
  <?php if (!$is_authenticated): ?>
    <!-- Admin Login -->
    <div class="card login-box">
      <h3>Admin Login</h3>
      <form method="post">
        <div class="form-group">
          <label>Admin Password</label>
          <input type="password" name="admin_password" required placeholder="Enter admin password">
        </div>
        <button type="submit" class="btn-submit" style="width:100%">Login</button>
      </form>
    </div>
  <?php else: ?>
    <!-- Add Student Form -->
    <?php if ($success): ?><div class="alert alert-success"><?= $success ?></div><?php endif; ?>
    <?php if ($error): ?><div class="alert alert-error"><?= $error ?></div><?php endif; ?>

    <div class="card">
      <h3>Add New Student</h3>
      <form method="post">
        <div class="form-row">
          <div class="form-group"><label><span class="required">*</span> Student ID</label><input name="student_id" required placeholder="e.g., SKPPS2024001"></div>
          <div class="form-group"><label>Admission No.</label><input name="admission_no" placeholder="CBSE Admission Number"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label><span class="required">*</span> Full Name</label><input name="full_name" required></div>
          <div class="form-group"><label>Roll No.</label><input name="roll_no" type="number"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Father's Name</label><input name="father_name"></div>
          <div class="form-group"><label>Mother's Name</label><input name="mother_name"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label><span class="required">*</span> Date of Birth</label><input name="date_of_birth" type="date" required></div>
          <div class="form-group"><label>Gender</label><select name="gender"><option>Male</option><option>Female</option><option>Other</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label><span class="required">*</span> Class</label><select name="class" required>
            <option value="">Select</option>
            <?php foreach(['Nursery','LKG','UKG','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'] as $c): ?>
            <option><?= $c ?></option><?php endforeach; ?>
          </select></div>
          <div class="form-group"><label>Section</label><select name="section"><option>A</option><option>B</option><option>C</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div>
          <div class="form-group"><label>Blood Group</label><select name="blood_group"><option value="">N/A</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></div>
        </div>
        <div class="form-group"><label>Address</label><input name="address"></div>
        <div class="form-row">
          <div class="form-group"><label>Parent Phone</label><input name="parent_phone" type="tel"></div>
          <div class="form-group"><label>Parent Email</label><input name="parent_email" type="email"></div>
        </div>
        <div class="form-group"><label>Admission Date</label><input name="admission_date" type="date" value="<?= date('Y-m-d') ?>"></div>
        <p style="font-size:12px;color:var(--gray-600);margin-bottom:16px;background:var(--gray-50);padding:10px;border-radius:var(--radius-sm)">
          <strong>Note:</strong> Default password will be set as DOB in DDMMYYYY format (e.g., 01012010 for 1st Jan 2010).
        </p>
        <button type="submit" class="btn-submit">Add Student</button>
      </form>
    </div>
  <?php endif; ?>
</div>
</body>
</html>
