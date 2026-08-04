<?php
session_start();
if (empty($_SESSION['staff_logged_in']) || $_SESSION['staff_role'] !== 'management') {
    header('Location: ../staff-login.html'); exit;
}
$staff_name = $_SESSION['staff_name'];

// DB
$db_host = 'localhost'; $db_name = 'skpps_students'; $db_user = 'root'; $db_pass = '';
$db_ok = false; $counts = ['students' => 0, 'teachers' => 0, 'classes' => 0]; $recent = []; $teachers = [];

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $db_ok = true;
    $counts['students'] = $pdo->query("SELECT COUNT(*) FROM students WHERE is_active = 1")->fetchColumn();
    $counts['teachers'] = $pdo->query("SELECT COUNT(*) FROM admin_users WHERE role='Teacher' AND is_active=1")->fetchColumn();
    $counts['classes']  = $pdo->query("SELECT COUNT(DISTINCT class) FROM students")->fetchColumn();
    $recent = $pdo->query("SELECT * FROM students ORDER BY created_at DESC LIMIT 5")->fetchAll();
    $teachers = $pdo->query("SELECT * FROM admin_users WHERE role='Teacher' ORDER BY full_name")->fetchAll();
} catch(Exception $e) {}

// Handle add teacher
$msg = ''; $err = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_teacher'])) {
    $tname = trim($_POST['t_name'] ?? '');
    $tuser = trim($_POST['t_username'] ?? '');
    $tpass = trim($_POST['t_password'] ?? '');
    $tmail = trim($_POST['t_email'] ?? '');
    if ($tname && $tuser && strlen($tpass) >= 6) {
        try {
            $hash = password_hash($tpass, PASSWORD_BCRYPT);
            $pdo->prepare("INSERT INTO admin_users (username, password_hash, full_name, role, email, is_active) VALUES (?,?,?,?,?,1)")
                ->execute([$tuser, $hash, $tname, 'Teacher', $tmail]);
            $msg = "Teacher $tname added!";
        } catch(Exception $e) { $err = "Username may already exist."; }
    } else { $err = "All fields required. Password min 6 chars."; }
}

// Handle bulk CSV import
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['import_csv']) && !empty($_FILES['csv_file']['tmp_name'])) {
    $file = $_FILES['csv_file']['tmp_name'];
    $imported = 0; $skipped = 0;
    if (($handle = fopen($file, 'r')) !== false) {
        fgetcsv($handle); // skip header
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < 6) continue;
            try {
                $student_id  = trim($row[0] ?? '');
                $full_name   = trim($row[1] ?? '');
                $class       = trim($row[2] ?? '');
                $section     = trim($row[3] ?? 'A');
                $roll_no     = (int)($row[4] ?? 0);
                $dob         = trim($row[5] ?? '2000-01-01');
                $father      = trim($row[6] ?? '');
                $mother      = trim($row[7] ?? '');
                $phone       = trim($row[8] ?? '');
                $gender      = trim($row[9] ?? 'Male');
                $house       = trim($row[10] ?? 'Earth');
                $admission   = trim($row[11] ?? '');
                $blood       = trim($row[12] ?? '');
                $email       = trim($row[13] ?? '');

                if (!$student_id || !$full_name || !$class) { $skipped++; continue; }

                $password = date('dmY', strtotime($dob));
                $pdo->prepare("INSERT INTO students (student_id, admission_no, roll_no, full_name, father_name, mother_name, date_of_birth, gender, class, section, house, blood_group, parent_phone, parent_email, password, admission_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURDATE())")
                    ->execute([$student_id, $admission, $roll_no, $full_name, $father, $mother, $dob, $gender, $class, $section, $house, $blood, $phone, $email, $password]);
                $imported++;
            } catch(Exception $e) { $skipped++; }
        }
        fclose($handle);
    }
    $msg = "Imported: $imported students. Skipped: $skipped.";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Management Panel - SK Presidency Public School</title>
<style>
:root{--primary:#1A73E8;--primary-dark:#1557B0;--house-red:#E74C3C;--house-blue:#3498DB;--house-green:#27AE60;--house-yellow:#F39C12;
--white:#fff;--gray-50:#F8F9FA;--gray-100:#F1F3F4;--gray-200:#E8EAED;--gray-300:#DADCE0;--gray-500:#9AA0A6;--gray-600:#80868B;--gray-700:#5F6368;--gray-800:#3C4043;--gray-900:#202124;
--radius-sm:8px;--radius-md:14px;--font:'Segoe UI','Roboto',sans-serif;--shadow-sm:0 1px 3px rgba(0,0,0,0.06)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--gray-50);min-height:100vh}
.topbar{background:var(--gray-900);color:white;padding:0 20px;height:56px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.topbar .logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px}
.topbar .logo .badge{background:var(--house-yellow);color:#000;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase}
.topbar a{color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;padding:6px 14px;border-radius:20px;transition:all 0.2s}
.topbar a:hover{background:rgba(255,255,255,0.1);color:white}
.container{max-width:1280px;margin:0 auto;padding:20px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:24px}
.stat{background:white;border-radius:var(--radius-md);padding:20px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200)}
.stat .val{font-size:clamp(22px,3vw,32px);font-weight:700;color:var(--gray-900)}
.stat .lbl{font-size:12px;color:var(--gray-600);text-transform:uppercase;letter-spacing:0.5px;margin-top:4px}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:860px){.cards{grid-template-columns:1fr}}
.card{background:white;border-radius:var(--radius-md);box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);overflow:hidden}
.card-header{padding:14px 20px;border-bottom:1px solid var(--gray-100);font-weight:700;font-size:14px;color:var(--gray-800);display:flex;align-items:center;gap:8px}
.card-body{padding:20px}
.table-wrap{overflow-x:auto}
table.data{width:100%;border-collapse:collapse;font-size:12px}
.data th{background:var(--gray-50);padding:8px 12px;text-align:left;font-weight:600;color:var(--gray-700);border-bottom:2px solid var(--gray-200);white-space:nowrap}
.data td{padding:7px 12px;border-bottom:1px solid var(--gray-100);color:var(--gray-700)}
.data tr:hover td{background:var(--gray-50)}
.fg{margin-bottom:12px}.fg label{display:block;font-size:12px;font-weight:600;color:var(--gray-700);margin-bottom:4px}.fg input,.fg select{width:100%;padding:9px 12px;border:1.5px solid var(--gray-300);border-radius:var(--radius-sm);font-size:13px;font-family:var(--font)}.fg input:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(26,115,232,0.1)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:500px){.row2{grid-template-columns:1fr}}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border:none;border-radius:var(--radius-sm);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all 0.2s}
.btn-blue{background:var(--primary);color:white}.btn-blue:hover{background:var(--primary-dark)}
.btn-outline{background:white;color:var(--gray-700);border:1.5px solid var(--gray-300)}.btn-outline:hover{background:var(--gray-50)}
.btn-red{background:var(--house-red);color:white}.btn-red:hover{opacity:0.9}
.alert{padding:10px 14px;border-radius:var(--radius-sm);font-size:12px;margin-bottom:14px}.alert-ok{background:#ECFDF5;color:#059669;border-left:3px solid #059669}.alert-err{background:#FEF2F2;color:#DC2626;border-left:3px solid #DC2626}
.badge-sm{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600}.b-green{background:#E6F4EA;color:var(--house-green)}.b-red{background:#FDE8E8;color:var(--house-red)}.b-blue{background:#E3F0FD;color:var(--house-blue)}
.tabs-nav{display:flex;gap:0;margin-bottom:20px;border:1.5px solid var(--gray-200);border-radius:var(--radius-sm);overflow:hidden;width:fit-content}
.tabs-nav button{padding:8px 18px;border:none;background:white;font-size:13px;font-weight:500;cursor:pointer;font-family:var(--font);color:var(--gray-600);transition:all 0.2s}
.tabs-nav button.active{background:var(--primary);color:white}
.tab-panel{display:none}.tab-panel.active{display:block}
.mt-2{margin-top:12px}.mb-2{margin-bottom:12px}
</style>
</head>
<body>
<div class="topbar">
  <div class="logo">SKPPS <span class="badge">Management</span></div>
  <div style="display:flex;align-items:center;gap:12px">
    <a href="../staff/teacher-dashboard.php">Teacher View</a>
    <a href="../api/staff-logout.php">Logout</a>
  </div>
</div>

<div class="container">
  <?php if($msg):?><div class="alert alert-ok"><?=$msg?></div><?php endif?>
  <?php if($err):?><div class="alert alert-err"><?=$err?></div><?php endif?>

  <div class="stats">
    <div class="stat"><div class="val"><?=$counts['students']?></div><div class="lbl">Active Students</div></div>
    <div class="stat"><div class="val"><?=$counts['teachers']?></div><div class="lbl">Teachers</div></div>
    <div class="stat"><div class="val"><?=$counts['classes']?></div><div class="lbl">Classes</div></div>
    <div class="stat"><div class="val"><?=count($recent)?></div><div class="lbl">Recent Adds</div></div>
  </div>

  <div class="tabs-nav">
    <button class="active" onclick="showTab('scan')">Scan ID Card</button>
    <button onclick="showTab('bulk')">Bulk Import (CSV)</button>
    <button onclick="showTab('teacher')">Add Teacher</button>
    <button onclick="showTab('all')">All Students</button>
  </div>

  <!-- TAB 1: ID Card Scanner -->
  <div class="tab-panel active" id="tab-scan">
    <div class="card">
      <div class="card-header">Scan Student ID Card & Add to Database</div>
      <div class="card-body">
        <p style="font-size:13px;color:var(--gray-600);margin-bottom:16px">Use camera to scan the school ID card. Text will be auto-extracted and student added to database.</p>
        <div id="scannerArea" style="background:#000;border-radius:var(--radius-md);overflow:hidden;position:relative;aspect-ratio:16/9;max-width:600px">
          <video id="camVideo" autoplay playsinline style="width:100%;height:100%;object-fit:cover"></video>
          <div style="position:absolute;inset:clamp(20px,8%,60px);border:3px dashed rgba(255,255,255,0.5);border-radius:var(--radius-md);pointer-events:none"></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:12px">
          <button class="btn btn-blue" onclick="scanIDCard()" id="btnScan">Scan & Add Student</button>
          <button class="btn btn-outline" onclick="stopCamera()">Stop Camera</button>
        </div>
        <div id="scanResult" style="margin-top:14px"></div>
      </div>
    </div>
  </div>

  <!-- TAB 2: Bulk CSV Import -->
  <div class="tab-panel" id="tab-bulk">
    <div class="card">
      <div class="card-header">Bulk Import Students (CSV)</div>
      <div class="card-body">
        <p style="font-size:13px;color:var(--gray-600);margin-bottom:12px">Upload CSV from your existing school software. Format: Student ID, Name, Class, Section, Roll No, DOB, Father, Mother, Phone, Gender, House, Admission No, Blood Group, Email</p>
        <form method="post" enctype="multipart/form-data">
          <div class="fg"><label>Select CSV File</label><input type="file" name="csv_file" accept=".csv" required></div>
          <button type="submit" name="import_csv" class="btn btn-blue mt-2">Import Students</button>
        </form>
      </div>
    </div>
  </div>

  <!-- TAB 3: Add Teacher -->
  <div class="tab-panel" id="tab-teacher">
    <div class="card">
      <div class="card-header">Add New Teacher</div>
      <div class="card-body">
        <form method="post">
          <div class="row2">
            <div class="fg"><label>Full Name</label><input name="t_name" required></div>
            <div class="fg"><label>Username</label><input name="t_username" required></div>
          </div>
          <div class="row2">
            <div class="fg"><label>Password (min 6 chars)</label><input type="password" name="t_password" required minlength="6"></div>
            <div class="fg"><label>Email</label><input type="email" name="t_email"></div>
          </div>
          <button type="submit" name="add_teacher" class="btn btn-blue mt-2">Add Teacher</button>
        </form>
        <?php if($teachers):?>
        <h4 style="margin-top:20px;font-size:13px;color:var(--gray-600)">Current Teachers:</h4>
        <div class="table-wrap mt-2"><table class="data">
          <tr><th>Name</th><th>Username</th><th>Email</th><th>Status</th></tr>
          <?php foreach($teachers as $t):?>
          <tr><td><?=htmlspecialchars($t['full_name'])?></td><td><?=htmlspecialchars($t['username'])?></td><td><?=htmlspecialchars($t['email'])?></td><td><span class="badge-sm <?=$t['is_active']?'b-green':'b-red'?>"><?=$t['is_active']?'Active':'Inactive'?></span></td></tr>
          <?php endforeach?>
        </table></div>
        <?php endif?>
      </div>
    </div>
  </div>

  <!-- TAB 4: All Students -->
  <div class="tab-panel" id="tab-all">
    <div class="card">
      <div class="card-header">All Students</div>
      <div class="card-body">
        <div class="table-wrap"><table class="data">
          <tr><th>ID</th><th>Name</th><th>Class</th><th>Section</th><th>Roll</th><th>House</th><th>Phone</th></tr>
          <?php
          if($db_ok){
            $all = $pdo->query("SELECT * FROM students ORDER BY class, roll_no LIMIT 100")->fetchAll();
            foreach($all as $s):?>
          <tr><td><?=htmlspecialchars($s['student_id'])?></td><td><?=htmlspecialchars($s['full_name'])?></td><td><?=$s['class']?></td><td><?=$s['section']?></td><td><?=$s['roll_no']?></td><td><?=$s['house']?></td><td><?=$s['parent_phone']?></td></tr>
          <?php endforeach;
          }?>
        </table></div>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
<script>
function showTab(t){document.querySelectorAll('.tabs-nav button').forEach(function(b,i){
  var tabs=['scan','bulk','teacher','all'];b.classList.toggle('active',tabs[i]===t)
});document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active')})
document.getElementById('tab-'+t).classList.add('active')}

let camStream=null;
async function startCamera(){
  try{camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1920}}});document.getElementById('camVideo').srcObject=camStream}catch(e){}
}startCamera();
function stopCamera(){if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null}}

async function scanIDCard(){
  var btn=document.getElementById('btnScan');btn.disabled=true;btn.textContent='Scanning...';
  var vid=document.getElementById('camVideo');var canvas=document.createElement('canvas');
  canvas.width=vid.videoWidth;canvas.height=vid.videoHeight;
  canvas.getContext('2d').drawImage(vid,0,0);
  try{
    var worker=await Tesseract.createWorker('eng');
    var {data:{text}}=await worker.recognize(canvas);await worker.terminate();
    var lines=text.replace(/[^a-zA-Z0-9\s\/\-\.\,\:\@]/g,' ').replace(/\s+/g,' ').split('\n').map(l=>l.trim()).filter(Boolean);
    var data={name:'',cls:'',roll:'',sid:'',father:'',phone:'',dob:'',blood:''};
    for(var l of lines){
      var lo=l.toLowerCase();
      if(!data.name&&(lo.includes('name')||l.match(/^[A-Z][a-z]+ [A-Z]/)))data.name=l.replace(/name[: ]*/i,'').trim();
      else if(!data.cls&&lo.includes('class'))data.cls=l.replace(/class[: ]*/i,'').trim();
      else if(!data.cls&&l.match(/^(Nursery|LKG|UKG|[IVX]+)$/i))data.cls=l;
      else if(!data.roll&&(lo.includes('roll')||lo.includes('rno')))data.roll=l.replace(/(roll|rno)[: .]*/i,'').trim();
      else if(!data.roll&&l.match(/^\d{1,3}$/))data.roll=l;
      else if(!data.sid&&(lo.includes('id')||lo.includes('admission')))data.sid=l.replace(/(id|admission|adm)[: .]*/i,'').trim();
      else if(!data.father&&lo.includes('father'))data.father=l.replace(/father[: ]*/i,'').trim();
      else if(!data.phone&&l.match(/^\d{10}$/))data.phone=l;
      else if(!data.dob&&(lo.includes('dob')||lo.includes('birth')))data.dob=l.replace(/(dob|birth|date)[: .]*/i,'').trim();
      else if(!data.blood&&lo.includes('blood'))data.blood=l.replace(/(blood|bg|group)[: .]*/i,'').trim();
    }
    document.getElementById('scanResult').innerHTML=
      '<div style="background:var(--gray-50);padding:16px;border-radius:var(--radius-sm);margin-top:12px">'+
      '<h4 style="font-size:14px;margin-bottom:12px">Scanned Data - Add to Database</h4>'+
      '<form method="post" action="../api/add-student.php">'+
      '<div class="row2"><div class="fg"><label>Student ID</label><input name="student_id" value="'+data.sid+'"></div>'+
      '<div class="fg"><label>Full Name</label><input name="full_name" value="'+data.name+'" required></div></div>'+
      '<div class="row2"><div class="fg"><label>Class</label><input name="class" value="'+data.cls+'" required></div>'+
      '<div class="fg"><label>Section</label><select name="section"><option>A</option><option>B</option><option>C</option></select></div></div>'+
      '<div class="row2"><div class="fg"><label>Roll No</label><input name="roll_no" value="'+data.roll+'"></div>'+
      '<div class="fg"><label>Date of Birth</label><input name="date_of_birth" type="date" value="'+data.dob+'"></div></div>'+
      '<div class="row2"><div class="fg"><label>Father Name</label><input name="father_name" value="'+data.father+'"></div>'+
      '<div class="fg"><label>Parent Phone</label><input name="parent_phone" value="'+data.phone+'"></div></div>'+
      '<div class="row2"><div class="fg"><label>Blood Group</label><input name="blood_group" value="'+data.blood+'"></div>'+
      '<div class="fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div></div>'+
      '<input type="hidden" name="eco" value="1"><button type="submit" class="btn btn-blue mt-2">Save Student</button></form></div>';
  }catch(e){
    document.getElementById('scanResult').innerHTML='<div class="alert alert-err">OCR failed. Please try again.</div>';
  }
  btn.disabled=false;btn.textContent='Scan & Add Student';
}
</script>
</body>
</html>
