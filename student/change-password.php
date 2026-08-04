<?php
session_start();
if (empty($_SESSION['student_logged_in'])) { header('Location: ../student-login.html'); exit; }

$name = $_SESSION['student_name'];
$sid  = $_SESSION['student_id'];

// Handle password update
$msg = ''; $err = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $new_pw = trim($_POST['new_password'] ?? '');
    $confirm = trim($_POST['confirm_password'] ?? '');
    
    if (strlen($new_pw) < 6) {
        $err = 'Password must be at least 6 characters.';
    } elseif ($new_pw !== $confirm) {
        $err = 'Passwords do not match.';
    } else {
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=skpps_students;charset=utf8mb4", 'root', '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            $hash = password_hash($new_pw, PASSWORD_BCRYPT);
            $pdo->prepare("UPDATE students SET password = :pw WHERE student_id = :sid")
                ->execute(['pw' => $hash, 'sid' => $sid]);
            unset($_SESSION['needs_password_change']);
            $msg = 'Password changed successfully! Redirecting to dashboard...';
            header("Refresh:2; url=dashboard.php");
        } catch(Exception $e) {
            $err = 'Could not update password. Please try later.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Create Password - SK Presidency Public School</title>
<style>
:root{--primary:#1A73E8;--primary-dark:#1557B0;--house-red:#E74C3C;--house-green:#27AE60;
--white:#fff;--gray-50:#F8F9FA;--gray-100:#F1F3F4;--gray-200:#E8EAED;--gray-300:#DADCE0;
--gray-500:#9AA0A6;--gray-600:#80868B;--gray-700:#5F6368;--gray-800:#3C4043;--gray-900:#202124;
--radius-sm:8px;--radius-md:14px;--font:'Segoe UI','Roboto',sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:linear-gradient(160deg,#0f172a,#1e293b,#1a1a3e);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{background:white;border-radius:var(--radius-md);padding:clamp(24px,4vw,40px);width:100%;max-width:420px;box-shadow:0 12px 40px rgba(0,0,0,0.15);animation:fadeIn 0.5s ease}
.card .icon-wrap{width:64px;height:64px;border-radius:50%;background:#E8F0FE;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.card .icon-wrap svg{width:30px;height:30px;stroke:var(--primary)}
.card h2{font-size:20px;font-weight:700;text-align:center;color:var(--gray-900);margin-bottom:4px}
.card p{font-size:13px;color:var(--gray-600);text-align:center;margin-bottom:20px}
.alert{padding:10px 14px;border-radius:var(--radius-sm);font-size:12px;margin-bottom:14px}
.alert-err{background:#FEF2F2;color:#DC2626;border-left:3px solid #DC2626}
.alert-ok{background:#ECFDF5;color:#059669;border-left:3px solid #059669}
.input-group{position:relative;margin-bottom:14px}
.input-group svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--gray-400);z-index:2}
.input-group input{width:100%;padding:12px 14px 12px 42px;border:2px solid var(--gray-200);border-radius:var(--radius-sm);font-size:14px;font-family:var(--font)}
.input-group input:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 4px rgba(26,115,232,0.08)}
.btn{width:100%;padding:13px;background:var(--primary);color:white;border:none;border-radius:var(--radius-sm);font-size:15px;font-weight:600;cursor:pointer;font-family:var(--font)}
.btn:hover{background:var(--primary-dark)}
.rules{font-size:11px;color:var(--gray-500);margin-top:12px;text-align:center}
.rules span{display:block;margin-bottom:2px}
@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<div class="card">
  <div class="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
  <h2>Create Your Password</h2>
  <p>Welcome, <strong><?= htmlspecialchars($name) ?></strong>! For security, please create a new password.</p>
  
  <?php if($err): ?><div class="alert alert-err"><?= $err ?></div><?php endif; ?>
  <?php if($msg): ?><div class="alert alert-ok"><?= $msg ?></div><?php endif; ?>
  
  <form method="post">
    <div class="input-group">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <input type="password" name="new_password" placeholder="New Password (min 6 chars)" required minlength="6">
    </div>
    <div class="input-group">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/></svg>
      <input type="password" name="confirm_password" placeholder="Confirm Password" required minlength="6">
    </div>
    <button type="submit" class="btn">Set Password & Continue</button>
  </form>
  <div class="rules"><span>Password must be at least 6 characters</span><span>Use a mix of letters, numbers, and symbols for strength</span></div>
</div>
</body>
</html>
