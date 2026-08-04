<?php
session_start();
if (empty($_SESSION['staff_logged_in'])) { header('Location: ../staff-login.html'); exit; }
$role = $_SESSION['staff_role'];
$name = $_SESSION['staff_name'];

$db_host = 'localhost'; $db_name = 'skpps_students'; $db_user = 'root'; $db_pass = '';
$db_ok = false; $students = []; $counts = ['total' => 0, 'classes' => 0];

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $db_ok = true;
    $counts['total'] = $pdo->query("SELECT COUNT(*) FROM students WHERE is_active=1")->fetchColumn();
    $counts['classes'] = $pdo->query("SELECT COUNT(DISTINCT class) FROM students")->fetchColumn();
    $students = $pdo->query("SELECT * FROM students WHERE is_active=1 ORDER BY class, roll_no LIMIT 200")->fetchAll();
} catch(Exception $e) {}
$is_mgmt = ($role === 'management');
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?=$is_mgmt?'Management':'Teacher'?> Dashboard - SK Presidency Public School</title>
<style>
:root{--primary:#1A73E8;--primary-dark:#1557B0;--house-red:#E74C3C;--house-blue:#3498DB;--house-green:#27AE60;--house-yellow:#F39C12;
--white:#fff;--gray-50:#F8F9FA;--gray-100:#F1F3F4;--gray-200:#E8EAED;--gray-300:#DADCE0;--gray-500:#9AA0A6;--gray-600:#80868B;--gray-700:#5F6368;--gray-800:#3C4043;--gray-900:#202124;
--radius-sm:8px;--radius-md:14px;--font:'Segoe UI','Roboto',sans-serif;--shadow-sm:0 1px 3px rgba(0,0,0,0.06)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--gray-50);min-height:100vh}
.topbar{background:var(--gray-900);color:white;padding:0 20px;height:56px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.topbar span{font-size:14px}.topbar .badge-sm{background:<?=$is_mgmt?'var(--house-yellow)':'var(--house-blue)'?>;color:<?=$is_mgmt?'#000':'white'?>;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase}
.topbar a{color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;padding:6px 14px;border-radius:20px;transition:all 0.2s}
.topbar a:hover{background:rgba(255,255,255,0.1);color:white}
.container{max-width:1280px;margin:0 auto;padding:20px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px}
.stat{background:white;padding:18px;border-radius:var(--radius-md);box-shadow:var(--shadow-sm);border:1px solid var(--gray-200)}
.stat .v{font-size:28px;font-weight:700}.stat .l{font-size:11px;color:var(--gray-600);text-transform:uppercase;letter-spacing:0.5px;margin-top:4px}
.card{background:white;border-radius:var(--radius-md);box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);overflow:hidden;margin-bottom:20px}
.card-header{padding:14px 20px;border-bottom:1px solid var(--gray-100);font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px}
.card-body{padding:20px}
.table-wrap{overflow-x:auto}
.data{width:100%;border-collapse:collapse;font-size:12px}
.data th{background:var(--gray-50);padding:8px 12px;text-align:left;font-weight:600;color:var(--gray-700);border-bottom:2px solid var(--gray-200);white-space:nowrap}
.data td{padding:7px 12px;border-bottom:1px solid var(--gray-100)}.data tr:hover td{background:var(--gray-50)}
.badge-sm{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600}.b-green{background:#E6F4EA;color:var(--house-green)}.b-blue{background:#E3F0FD;color:var(--house-blue)}.b-y{background:#FEF3E0;color:var(--house-yellow)}.b-r{background:#FDE8E8;color:var(--house-red)}
input.search-input{width:100%;padding:10px 14px;border:1.5px solid var(--gray-300);border-radius:var(--radius-sm);font-size:14px;font-family:var(--font);margin-bottom:16px}
input.search-input:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(26,115,232,0.1)}
@media(max-width:600px){.topbar span{font-size:12px}}
</style>
</head>
<body>
<div class="topbar">
  <span>SKPPS <span class="badge-sm"><?=$is_mgmt?'Management':'Teacher'?></span> &nbsp; <?=htmlspecialchars($name)?></span>
  <div style="display:flex;gap:8px">
    <?php if($is_mgmt):?><a href="../management/dashboard.php">Full Panel</a><?php endif?>
    <a href="../api/staff-logout.php">Logout</a>
  </div>
</div>

<div class="container">
  <div class="stats">
    <div class="stat"><div class="v"><?=$counts['total']?></div><div class="l">Total Students</div></div>
    <div class="stat"><div class="v"><?=$counts['classes']?></div><div class="l">Active Classes</div></div>
  </div>

  <div class="card">
    <div class="card-header">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      Student Directory
    </div>
    <div class="card-body">
      <input class="search-input" type="text" placeholder="Search by name, class, roll no, or student ID..." oninput="filterTable(this.value)">
      <div class="table-wrap"><table class="data" id="studentTable">
        <tr><th>Student ID</th><th>Name</th><th>Class</th><th>Sec</th><th>Roll</th><th>House</th><th>Parent Phone</th><th>DOB</th></tr>
        <?php foreach($students as $s):?>
        <tr data-search="<?=htmlspecialchars(strtolower($s['student_id'].' '.$s['full_name'].' '.$s['class'].' '.$s['roll_no'].' '.$s['parent_phone']))?>">
          <td><?=htmlspecialchars($s['student_id'])?></td><td><strong><?=htmlspecialchars($s['full_name'])?></strong></td>
          <td><?=$s['class']?></td><td><?=$s['section']?></td><td><?=$s['roll_no']?></td>
          <td><span class="badge-sm <?=$s['house']=='Earth'?'b-green':($s['house']=='Fire'?'b-r':($s['house']=='Water'?'b-blue':'b-y'))?>"><?=$s['house']?></span></td>
          <td><?=$s['parent_phone']?></td><td><?=$s['date_of_birth']?></td>
        </tr>
        <?php endforeach?>
      </table></div>
    </div>
  </div>
</div>

<script>
function filterTable(query){
  var q=query.toLowerCase(),rows=document.querySelectorAll('#studentTable tr[data-search]');
  rows.forEach(function(r){r.style.display=r.getAttribute('data-search').includes(q)?'':'none'});
}
</script>
</body>
</html>
