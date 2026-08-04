<?php
/**
 * SK PRESIDENCY PUBLIC SCHOOL
 * Student Dashboard - Protected Page
 * Accessible only after login
 */

session_start();

// ========== AUTH CHECK ==========
if (empty($_SESSION['student_logged_in'])) {
    header('Location: ../student-login.html');
    exit;
}

$student_name    = $_SESSION['student_name'];
$student_id      = $_SESSION['student_id'];
$student_class   = $_SESSION['student_class'];
$student_section = $_SESSION['student_section'];
$student_roll    = $_SESSION['student_roll'];

// ========== DATABASE CONFIG ==========
$db_host = 'localhost'; $db_name = 'skpps_students';
$db_user = 'root'; $db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $db_connected = true;
} catch(Exception $e) {
    $db_connected = false;
}

// ========== FETCH STUDENT DATA ==========
$student = null; $results = []; $attendance = []; $fees = []; $notices = []; $timetable = [];

if ($db_connected) {
    // Student details
    $stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = :sid");
    $stmt->execute(['sid' => $student_id]);
    $student = $stmt->fetch();

    // Recent results
    $stmt = $pdo->prepare("SELECT * FROM academic_results WHERE student_id = :sid ORDER BY academic_year DESC, exam_type DESC LIMIT 10");
    $stmt->execute(['sid' => $student_id]);
    $results = $stmt->fetchAll();

    // Attendance summary (last 30 days)
    $stmt = $pdo->prepare("SELECT status, COUNT(*) as cnt FROM attendance WHERE student_id = :sid AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY status");
    $stmt->execute(['sid' => $student_id]);
    $attendance_raw = $stmt->fetchAll();
    $attendance = ['Present' => 0, 'Absent' => 0, 'Late' => 0, 'Half-Day' => 0];
    $total_days = 0;
    foreach ($attendance_raw as $row) {
        $attendance[$row['status']] = (int)$row['cnt'];
        $total_days += (int)$row['cnt'];
    }
    $attendance_pct = $total_days > 0 ? round(($attendance['Present'] + $attendance['Late']) / $total_days * 100, 1) : 0;

    // Pending fees
    $stmt = $pdo->prepare("SELECT * FROM fees WHERE student_id = :sid AND status IN ('Pending','Partial','Overdue') ORDER BY due_date ASC LIMIT 5");
    $stmt->execute(['sid' => $student_id]);
    $fees = $stmt->fetchAll();

    // Active notices for this student's class
    $stmt = $pdo->prepare("SELECT * FROM notices WHERE (target_class = 'All' OR FIND_IN_SET(:cls, target_class)) AND (expires_at IS NULL OR expires_at >= CURDATE()) ORDER BY priority DESC, created_at DESC LIMIT 5");
    $stmt->execute(['cls' => $student_class]);
    $notices = $stmt->fetchAll();

    // Today's timetable
    $day_of_week = date('N');
    $stmt = $pdo->prepare("SELECT * FROM timetable WHERE class = :cls AND (section = :sec OR section IS NULL) AND day_of_week = :dow ORDER BY period_no");
    $stmt->execute(['cls' => $student_class, 'sec' => $student_section, 'dow' => $day_of_week]);
    $timetable = $stmt->fetchAll();
}

// ========== RENDER ==========
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard - <?= htmlspecialchars($student_name) ?> | SK Presidency Public School</title>
<style>
:root {
  --house-red: #E74C3C; --house-blue: #3498DB; --house-green: #27AE60; --house-yellow: #F39C12;
  --white: #fff; --gray-50: #F8F9FA; --gray-100: #F1F3F4; --gray-200: #E8EAED; --gray-300: #DADCE0;
  --gray-500: #9AA0A6; --gray-600: #80868B; --gray-700: #5F6368; --gray-800: #3C4043; --gray-900: #202124;
  --primary: #1A73E8; --primary-dark: #1557B0;
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 20px; --radius-xl: 28px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --font: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--gray-50);color:var(--gray-800);min-height:100vh}
/* Top Bar */
.topbar{background:var(--white);border-bottom:1px solid var(--gray-200);padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:60px;position:sticky;top:0;z-index:100;box-shadow:var(--shadow-sm);gap:12px}
.topbar .logo-area{display:flex;align-items:center;gap:12px}
.topbar .logo-area img{height:40px}
.topbar .logo-area h2{font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.topbar .user-area{display:flex;align-items:center;gap:16px}
.topbar .user-area .avatar{width:38px;height:38px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px}
.topbar .user-area .logout{color:var(--gray-600);text-decoration:none;font-size:13px;font-weight:500;padding:6px 14px;border:1.5px solid var(--gray-300);border-radius:var(--radius-xl);transition:all 0.2s}
.topbar .user-area .logout:hover{background:#FDE8E8;border-color:var(--house-red);color:var(--house-red)}
/* Mobile nav toggle */
.mobile-toggle{display:none;background:none;border:none;color:var(--gray-700);cursor:pointer;padding:8px}
@media(max-width:768px){.mobile-toggle{display:block}}

/* Main Layout */
.dashboard{display:flex;min-height:calc(100vh - 60px)}
/* Sidebar */
.sidebar{width:260px;background:var(--white);border-right:1px solid var(--gray-200);padding:20px 0;flex-shrink:0;overflow-y:auto}
.sidebar .nav-item{display:flex;align-items:center;gap:12px;padding:12px 24px;font-size:14px;font-weight:500;color:var(--gray-700);text-decoration:none;transition:all 0.2s;border-left:4px solid transparent}
.sidebar .nav-item svg{width:20px;height:20px;flex-shrink:0}
.sidebar .nav-item:hover{background:var(--gray-50);color:var(--primary);border-left-color:var(--primary)}
.sidebar .nav-item.active{background:#EEF4FF;color:var(--primary);border-left-color:var(--primary);font-weight:600}
.sidebar .section-label{padding:8px 24px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--gray-500);margin-top:16px}
@media(max-width:768px){
  .sidebar{position:fixed;left:-280px;top:60px;bottom:0;z-index:99;transition:left 0.3s;width:260px}
  .sidebar.open{left:0}
  .dashboard{margin-left:0}
}

/* Content */
.content{flex:1;padding:clamp(16px,3vw,28px);overflow-y:auto;min-width:0}
.content h1{font-size:clamp(20px,2.5vw,28px);font-weight:700;margin-bottom:4px}
.content .subtitle{color:var(--gray-600);font-size:14px;margin-bottom:24px}

/* Quick Stats Cards */
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px}
.stat-card{background:var(--white);border-radius:var(--radius-md);padding:20px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);display:flex;align-items:center;gap:16px;transition:all 0.3s}
.stat-card:hover{box-shadow:var(--shadow-md);transform:translateY(-2px)}
.stat-card .icon{width:48px;height:48px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.stat-card .icon svg{width:24px;height:24px}
.stat-card .info .value{font-size:24px;font-weight:700;color:var(--gray-900)}
.stat-card .info .label{font-size:12px;color:var(--gray-600);text-transform:uppercase;letter-spacing:0.5px}
.icon-red{background:#FDE8E8}.icon-red svg{stroke:var(--house-red)}
.icon-blue{background:#E3F0FD}.icon-blue svg{stroke:var(--house-blue)}
.icon-green{background:#E6F4EA}.icon-green svg{stroke:var(--house-green)}
.icon-yellow{background:#FEF3E0}.icon-yellow svg{stroke:var(--house-yellow)}
.icon-purple{background:#F3E8FF}.icon-purple svg{stroke:#9333EA}

/* Sections */
.card{background:var(--white);border-radius:var(--radius-md);box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);margin-bottom:24px}
.card-header{padding:16px 20px;border-bottom:1px solid var(--gray-100);display:flex;align-items:center;justify-content:space-between}
.card-header h3{font-size:16px;font-weight:600}
.card-body{padding:20px}
.table-wrap{overflow-x:auto}
table.data-table{width:100%;border-collapse:collapse;font-size:13px}
.data-table th{background:var(--gray-50);padding:10px 14px;text-align:left;font-weight:600;color:var(--gray-700);border-bottom:2px solid var(--gray-200);white-space:nowrap;font-size:12px}
.data-table td{padding:9px 14px;border-bottom:1px solid var(--gray-100);color:var(--gray-700)}
.data-table tr:hover td{background:var(--gray-50)}
.badge{display:inline-block;padding:3px 10px;border-radius:var(--radius-xl);font-size:11px;font-weight:600;letter-spacing:0.3px}
.badge-green{background:#E6F4EA;color:var(--house-green)}
.badge-red{background:#FDE8E8;color:var(--house-red)}
.badge-yellow{background:#FEF3E0;color:var(--house-yellow)}
.badge-blue{background:#E3F0FD;color:var(--house-blue)}
.empty-state{text-align:center;padding:32px;color:var(--gray-500);font-size:14px}
.empty-state svg{width:48px;height:48px;margin-bottom:12px;stroke:var(--gray-300)}
.progress-bar{height:8px;border-radius:4px;background:var(--gray-100);overflow:hidden;margin-top:8px}
.progress-bar .fill{height:100%;border-radius:4px;transition:width 0.5s}
.fill-green{background:var(--house-green)}.fill-red{background:var(--house-red)}.fill-yellow{background:var(--house-yellow)}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:768px){.grid-2{grid-template-columns:1fr}}

/* Student Info Profile */
.profile-card{display:flex;gap:24px;align-items:start;flex-wrap:wrap}
.profile-card .photo{width:100px;height:100px;border-radius:50%;background:var(--gray-200);overflow:hidden;flex-shrink:0}
.profile-card .photo img{width:100%;height:100%;object-fit:cover}
.profile-card .details{flex:1;min-width:200px}
.profile-card .details .row{display:flex;gap:8px;margin-bottom:6px;font-size:14px}
.profile-card .details .row strong{min-width:120px;color:var(--gray-600)}
</style>
</head>
<body>

<!-- TOP BAR -->
<div class="topbar">
  <div class="logo-area">
    <button class="mobile-toggle" onclick="document.querySelector('.sidebar').classList.toggle('open')" aria-label="Menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <img src="../images/logo-transparent.png" alt="Logo">
    <h2>SK Presidency Public School</h2>
  </div>
  <div class="user-area">
    <span style="font-size:13px;color:var(--gray-600)"><?= htmlspecialchars($student_name) ?></span>
    <div class="avatar"><?= strtoupper(substr($student_name, 0, 1)) ?></div>
    <a href="../api/student-logout.php" class="logout">Logout</a>
  </div>
</div>

<div class="dashboard">
  <!-- SIDEBAR -->
  <aside class="sidebar">
    <a href="dashboard.php" class="nav-item active">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      Dashboard
    </a>
    <div class="section-label">Academic</div>
    <a href="#" class="nav-item" onclick="alert('Feature coming soon!')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
      My Results
    </a>
    <a href="#" class="nav-item" onclick="alert('Feature coming soon!')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      Timetable
    </a>
    <a href="#" class="nav-item" onclick="alert('Feature coming soon!')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
      Assignments
    </a>
    <div class="section-label">Other</div>
    <a href="#" class="nav-item" onclick="alert('Feature coming soon!')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      Fee Status
    </a>
    <a href="#" class="nav-item" onclick="alert('Feature coming soon!')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
      Notices
    </a>
    <a href="../index.html" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
      School Website
    </a>
  </aside>

  <!-- ============ MAIN CONTENT ============ -->
  <main class="content">
    <h1>Welcome, <?= htmlspecialchars(explode(' ', $student_name)[0]) ?>!</h1>
    <p class="subtitle">Class <?= htmlspecialchars($student_class) ?>-<?= htmlspecialchars($student_section) ?> | Roll No: <?= htmlspecialchars($student_roll) ?></p>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="icon icon-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <div class="info"><div class="value"><?= $attendance_pct ?>%</div><div class="label">Attendance (30 days)</div><div class="progress-bar"><div class="fill <?= $attendance_pct>=75?'fill-green':($attendance_pct>=50?'fill-yellow':'fill-red') ?>" style="width:<?= $attendance_pct ?>%"></div></div></div>
      </div>
      <div class="stat-card">
        <div class="icon icon-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg></div>
        <div class="info"><div class="value"><?= $total_days ?></div><div class="label">School Days (30 days)</div></div>
      </div>
      <div class="stat-card">
        <div class="icon icon-yellow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <div class="info"><div class="value"><?= count($results) ?></div><div class="label">Exam Results</div></div>
      </div>
      <div class="stat-card">
        <div class="icon icon-red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div class="info"><div class="value"><?= count($fees) ?></div><div class="label">Pending Fees</div></div>
      </div>
    </div>

    <!-- Two column layout -->
    <div class="grid-2">
      <!-- Student Profile -->
      <div class="card">
        <div class="card-header"><h3 style="display:flex;align-items:center;gap:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> My Profile</h3></div>
        <div class="card-body">
          <?php if ($student): ?>
          <div class="profile-card">
            <div class="photo"><?= $student['photo'] ? '<img src="../'.$student['photo'].'" alt="Photo">' : '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' ?></div>
            <div class="details">
              <div class="row"><strong>Name:</strong> <?= htmlspecialchars($student['full_name']) ?></div>
              <div class="row"><strong>Father:</strong> <?= htmlspecialchars($student['father_name']) ?></div>
              <div class="row"><strong>Class:</strong> <?= htmlspecialchars($student['class']) ?>-<?= htmlspecialchars($student['section']) ?></div>
              <div class="row"><strong>Roll No:</strong> <?= htmlspecialchars($student['roll_no']) ?></div>
              <div class="row"><strong>House:</strong> <?= htmlspecialchars($student['house']) ?></div>
              <div class="row"><strong>Blood Group:</strong> <?= htmlspecialchars($student['blood_group'] ?: 'N/A') ?></div>
              <div class="row"><strong>Phone:</strong> <?= htmlspecialchars($student['parent_phone']) ?></div>
            </div>
          </div>
          <?php else: ?>
          <div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><p>Profile details loading...</p></div>
          <?php endif; ?>
        </div>
      </div>

      <!-- Notices -->
      <div class="card">
        <div class="card-header"><h3 style="display:flex;align-items:center;gap:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--house-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> Recent Notices</h3></div>
        <div class="card-body">
          <?php if ($notices): foreach ($notices as $n): ?>
          <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
            <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
              <strong style="font-size:14px;color:var(--gray-900)"><?= htmlspecialchars($n['title']) ?></strong>
              <span class="badge <?= $n['priority']=='Urgent'?'badge-red':($n['priority']=='High'?'badge-yellow':'badge-blue') ?>"><?= $n['priority'] ?></span>
            </div>
            <p style="font-size:13px;color:var(--gray-600);margin-top:4px"><?= htmlspecialchars(substr($n['content'],0,120)) ?>...</p>
          </div>
          <?php endforeach; else: ?>
          <div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg><p>No new notices</p></div>
          <?php endif; ?>
        </div>
      </div>
    </div>

    <!-- Timetable -->
    <div class="card" style="margin-top:16px">
      <div class="card-header"><h3 style="display:flex;align-items:center;gap:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--house-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Today's Timetable</h3></div>
      <div class="card-body">
        <?php if ($timetable): ?>
        <div class="table-wrap"><table class="data-table">
          <tr><th>Period</th><th>Subject</th><th>Teacher</th><th>Time</th></tr>
          <?php foreach ($timetable as $tt): ?>
          <tr><td><?= $tt['period_no'] ?></td><td><strong><?= htmlspecialchars($tt['subject']) ?></strong></td><td><?= htmlspecialchars($tt['teacher_name'] ?: '-') ?></td><td><?= htmlspecialchars(substr($tt['start_time'],0,5).' - '.substr($tt['end_time'],0,5)) ?></td></tr>
          <?php endforeach; ?>
        </table></div>
        <?php else: ?>
        <div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/></svg><p>Timetable not available for today</p></div>
        <?php endif; ?>
      </div>
    </div>

    <!-- Recent Results -->
    <?php if ($results): ?>
    <div class="card" style="margin-top:16px">
      <div class="card-header"><h3 style="display:flex;align-items:center;gap:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--house-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Recent Results</h3></div>
      <div class="card-body">
        <div class="table-wrap"><table class="data-table">
          <tr><th>Exam</th><th>Subject</th><th>Marks</th><th>Grade</th><th>Year</th></tr>
          <?php foreach ($results as $r): ?>
          <tr><td><?= htmlspecialchars($r['exam_type']) ?></td><td><?= htmlspecialchars($r['subject']) ?></td><td><?= $r['marks_obtained'] ?>/<?= $r['marks_total'] ?></td><td><span class="badge badge-green"><?= htmlspecialchars($r['grade']) ?></span></td><td><?= htmlspecialchars($r['academic_year']) ?></td></tr>
          <?php endforeach; ?>
        </table></div>
      </div>
    </div>
    <?php endif; ?>

  </main>
</div>

<script>
// Close sidebar when clicking outside on mobile
document.querySelector('.content')?.addEventListener('click', function() {
  document.querySelector('.sidebar')?.classList.remove('open');
});
</script>
</body>
</html>
