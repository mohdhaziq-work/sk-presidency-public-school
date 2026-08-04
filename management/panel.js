// SKPPS Management Panel - PHP + localStorage hybrid
if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){location.href='../staff-login.html'}
document.getElementById('uname').textContent=' - '+(sessionStorage.getItem('skpps_name')||'Admin');

// ===== DATA STORAGE: PHP first, localStorage fallback =====
var API_BASE = '../api/';
async function apiCall(endpoint, data) {
  try {
    var resp = await fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) throw new Error('API failed');
    return await resp.json();
  } catch(e) { return null; }
}

// Load from PHP, fallback to localStorage
async function loadStudents() {
  var res = await apiCall('list-students.php', {});
  if (res && Array.isArray(res)) {
    return res.map(function(r) { return {
      sid: r.student_id, name: r.full_name, cls: r.class, sec: r.section,
      roll: r.roll_no, house: r.house, phone: r.parent_phone, dob: r.date_of_birth,
      father: r.father_name, blood: r.blood_group
    }});
  }
  return JSON.parse(localStorage.getItem('skpps_students') || '[]');
}

async function loadTeachers() {
  var res = await apiCall('list-teachers.php', {});
  if (res && Array.isArray(res)) {
    return res.map(function(r) { return { user: r.username, name: r.full_name, email: r.email }; });
  }
  return JSON.parse(localStorage.getItem('skpps_teachers') || '[]');
}

function saveStudentsLocal(arr) { localStorage.setItem('skpps_students', JSON.stringify(arr)); }
function saveTeachersLocal(arr) { localStorage.setItem('skpps_teachers', JSON.stringify(arr)); }

var students = [], teachers = [], curTab = 'scan', dataLoaded = false;

async function initData() {
  students = await loadStudents();
  teachers = await loadTeachers();
  dataLoaded = true;
  render();
}

function logout() { sessionStorage.clear(); location.href = '../staff-login.html'; }
function showTab(t) { curTab = t; if (curTab !== 'scan') stopScanner(); render(); }

function render() {
  if (!dataLoaded) { document.getElementById('mc').innerHTML = '<div style="text-align:center;padding:40px;color:#5F6368">Loading data...</div>'; return; }
  var s = students, t = teachers, h = '';
  h += '<div class="stats"><div class="stat"><div class="v">' + s.length + '</div><div class="l">Students (MySQL)</div></div><div class="stat"><div class="v">' + t.length + '</div><div class="l">Teachers</div></div><div class="stat"><div class="v">' + (s.length ? new Set(s.map(function(x) { return x.cls; })).size : 0) + '</div><div class="l">Classes</div></div></div>';
  h += '<div class="tabs-nav"><button class="' + (curTab === 'scan' ? 'active' : '') + '" onclick="curTab=\'scan\';render()">ID Scanner</button><button class="' + (curTab === 'bulk' ? 'active' : '') + '" onclick="curTab=\'bulk\';render()">Bulk Import</button><button class="' + (curTab === 'teacher' ? 'active' : '') + '" onclick="curTab=\'teacher\';render()">Teachers</button><button class="' + (curTab === 'all' ? 'active' : '') + '" onclick="curTab=\'all\';render()">All Students</button></div>';
  if (curTab === 'scan') h += rScan();
  else if (curTab === 'bulk') h += rBulk();
  else if (curTab === 'teacher') h += rTeacher(t);
  else h += rAll(s);
  document.getElementById('mc').innerHTML = h;
  if (curTab === 'scan') setTimeout(startScanner, 300);
}

function rScan() {
  return '<div class="card"><div class="ch"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Smart ID Card Scanner</div><div class="cb">' +
    '<div style="background:#f0f7ff;padding:10px 14px;border-radius:8px;margin-bottom:12px;font-size:12px;color:#5F6368;display:flex;align-items:center;gap:8px;border-left:3px solid #1A73E8">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      '<span>Point camera at school ID card. Text auto-detected continuously.</span></div>' +
    '<div id="camBox" style="background:#000;border-radius:8px;overflow:hidden;position:relative;aspect-ratio:16/9;max-width:520px">' +
      '<video id="camVid" autoplay playsinline style="width:100%;height:100%;object-fit:cover"></video>' +
      '<canvas id="camCanvas" style="display:none"></canvas>' +
      '<div style="position:absolute;inset:0;pointer-events:none">' +
        '<div style="position:absolute;top:12%;left:15%;right:15%;bottom:12%;border:3px solid rgba(255,255,255,0.5);border-radius:12px"></div>' +
        '<div id="scanStatus" style="position:absolute;bottom:18px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:white;padding:6px 16px;border-radius:20px;font-size:11px;font-weight:500">Ready - Point at ID Card</div>' +
      '</div></div>' +
    '<div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-b" onclick="manualCapture()">Manual Capture</button><button class="btn btn-o" onclick="stopScanner();curTab=\'all\';render()">Stop Scanner</button></div>' +
    '<div id="scanOut" style="margin-top:12px"></div></div></div>';
}
function rBulk() {
  return '<div class="card"><div class="ch">Bulk Import (CSV)</div><div class="cb">' +
    '<p style="font-size:12px;color:#5F6368;margin-bottom:10px">Paste CSV from school software. Format per line:</p>' +
    '<code style="display:block;background:#F8F9FA;padding:8px;border-radius:8px;font-size:10px;margin-bottom:10px">ID,Name,Class,Section,Roll,DOB(YYYY-MM-DD),Father,Mother,Phone,Gender,House</code>' +
    '<textarea id="csvData" style="width:100%;height:140px;border:1.5px solid #DADCE0;border-radius:8px;padding:10px;font-family:monospace;font-size:10px" placeholder="SKPPS2024001,John Smith,V,A,8,2017-05-10,Robert Smith,Mary Smith,9876543210,Male,Earth"></textarea>' +
    '<button class="btn btn-b mt1" onclick="importCSV()">Import Students</button><div id="csvMsg" class="mt1"></div></div></div>';
}
function rTeacher(t) {
  var rows = '';
  if (t.length === 0) rows = '<tr><td colspan="3" style="text-align:center;padding:20px;color:#9AA0A6">No teachers yet. Add teachers who can login and view student data.</td></tr>';
  else for (var i = 0; i < t.length; i++) rows += '<tr><td>' + t[i].name + '</td><td>' + t[i].user + '</td><td><span class="badge-sm bg">Active</span></td></tr>';
  return '<div class="card"><div class="ch">Add Teacher</div><div class="cb">' +
    '<form onsubmit="return addTeacher(event)"><div class="r2"><div class="fg"><label>Full Name</label><input id="tn" required></div><div class="fg"><label>Username</label><input id="tu" required></div></div>' +
    '<div class="r2"><div class="fg"><label>Password (min 4 chars)</label><input type="password" id="tpw" required minlength="4"></div><div class="fg"><label>Email</label><input type="email" id="te"></div></div>' +
    '<button type="submit" class="btn btn-b mt1">Add Teacher</button></form>' +
    '<h4 style="font-size:12px;color:#5F6368;margin-top:16px;margin-bottom:8px">Teacher Accounts (' + t.length + ')</h4>' +
    '<div class="tw"><table class="dt"><tr><th>Name</th><th>Username</th><th>Status</th></tr>' + rows + '</table></div></div></div>';
}
function rAll(s) {
  var rows = '';
  if (s.length === 0) rows = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#9AA0A6">No students in database. Use ID Scanner or Bulk Import.</td></tr>';
  else for (var i = 0; i < s.length; i++) { var hc = s[i].house; rows += '<tr><td>' + s[i].sid + '</td><td><strong>' + s[i].name + '</strong></td><td>' + s[i].cls + '</td><td>' + s[i].sec + '</td><td>' + s[i].roll + '</td><td><span class="badge-sm ' + (hc === 'Earth' ? 'bg' : hc === 'Fire' ? 'br' : hc === 'Water' ? 'bb' : 'by') + '">' + hc + '</span></td><td>' + s[i].phone + '</td><td style="font-size:10px">' + s[i].dob + '</td></tr>'; }
  return '<div class="card"><div class="ch">All Students (' + s.length + ')</div><div class="cb">' +
    '<input style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:8px;font-size:12px;font-family:inherit;margin-bottom:10px" placeholder="Search..." oninput="filterStudents(this.value)">' +
    '<div class="tw"><table class="dt" id="stbl"><tr><th>ID</th><th>Name</th><th>Class</th><th>Sec</th><th>Roll</th><th>House</th><th>Phone</th><th>DOB</th></tr>' + rows + '</table></div></div></div>';
}
function filterStudents(q) { var r = document.querySelectorAll('#stbl tr'); for (var i = 1; i < r.length; i++) r[i].style.display = r[i].textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none'; }

async function addTeacher(e) {
  e.preventDefault();
  var n = document.getElementById('tn').value.trim(), u = document.getElementById('tu').value.trim(),
      p = document.getElementById('tpw').value.trim(), em = document.getElementById('te').value.trim();
  var teacher = { username: u, password: p, name: n, email: em };
  var apiRes = await apiCall('save-teacher.php', teacher);
  teachers.push({ user: u, pass: p, name: n, email: em });
  saveTeachersLocal(teachers);
  alert('Teacher ' + n + ' added' + (apiRes ? ' to MySQL database!' : ' to local storage.'));
  render();
  return false;
}

async function saveStudentToDB(st) {
  var apiRes = await apiCall('save-student.php', {
    student_id: st.sid, name: st.name, class: st.cls, section: st.sec,
    roll_no: st.roll, dob: st.dob, father: st.father, phone: st.phone,
    blood_group: st.blood, house: st.house
  });
  return apiRes;
}

async function importCSV() {
  var t = document.getElementById('csvData').value.trim(); if (!t) return;
  var l = t.split('\n'), added = 0, skipped = 0, dbSaved = 0;
  for (var i = 0; i < l.length; i++) {
    var c = l[i].split(',').map(function(x) { return x.trim(); });
    if (c.length < 6) { skipped++; continue; }
    var sid = c[0] || ('SKPPS' + Date.now().toString(36).toUpperCase()), name = c[1], cls = c[2], sec = c[3] || 'A',
        roll = parseInt(c[4]) || 0, dob = c[5] || '2000-01-01', father = c[6] || '', mother = c[7] || '',
        phone = c[8] || '', gender = c[9] || 'Male', house = c[10] || 'Earth';
    if (!name || !cls) { skipped++; continue; }
    var st = { sid: sid, roll: roll, name: name, father: father, mother: mother, dob: dob, gender: gender, cls: cls, sec: sec, house: house, phone: phone, blood: '', added: new Date().toISOString() };
    students.push(st);
    saveStudentsLocal(students);
    var db = await saveStudentToDB(st); if (db && db.success) dbSaved++;
    added++;
  }
  document.getElementById('csvMsg').innerHTML = '<div class="alert aok">Imported: ' + added + ' students' + (dbSaved > 0 ? ' (' + dbSaved + ' to MySQL)' : '') + '. Skipped: ' + skipped + '</div>';
  render();
}

// ===== AUTO-SCANNER =====
var camStream = null, scanTimer = null, scanActive = false, lastScanText = '', scanHits = 0;
function startScanner() {
  var v = document.getElementById('camVid'); if (!v) return;
  if (camStream) { scanActive = true; updateStatus('Scanning...', 'white'); startScanLoop(); return; }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } } }).then(function(s) {
    camStream = s; v.srcObject = s; v.onloadedmetadata = function() { scanActive = true; updateStatus('Scanning...', 'white'); startScanLoop(); };
  }).catch(function() { var b = document.getElementById('camBox'); if (b) b.innerHTML = '<div style="color:white;text-align:center;padding:30px">Camera unavailable</div>'; });
}
function stopScanner() { scanActive = false; if (scanTimer) clearInterval(scanTimer); if (camStream) { camStream.getTracks().forEach(function(t) { t.stop(); }); camStream = null; } lastScanText = ''; scanHits = 0; }
function updateStatus(m, c) { var e = document.getElementById('scanStatus'); if (e) { e.textContent = m; if (c) e.style.color = c; } }

function startScanLoop() { if (scanTimer) clearInterval(scanTimer); scanTimer = setInterval(function() { if (!scanActive) return; captureAndDetect(); }, 900); }

function captureAndDetect() {
  var v = document.getElementById('camVid'), c = document.getElementById('camCanvas'); if (!v || !c || v.readyState < 2) return;
  c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0);
  var imgData = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, tp = 0, tt = c.width * c.height;
  for (var i = 0; i < imgData.length; i += 16) { if (imgData[i] < 180) tp++; }
  if (tp / (tt / 16) < 0.08) { updateStatus('Waiting for ID card...', 'rgba(255,255,255,0.5)'); lastScanText = ''; scanHits = 0; return; }
  updateStatus('Detecting...', 'rgba(255,255,180,0.9)');
  Tesseract.recognize(c, 'eng', { logger: function(m) { if (m.status === 'recognizing text') updateStatus('Reading: ' + Math.round(m.progress * 100) + '%', 'rgba(150,255,200,0.9)'); } }).then(function(d) {
    if (!scanActive) return;
    var txt = d.data.text.replace(/[^a-zA-Z0-9\s\/\-\.\,\:\@]/g, ' ').replace(/\s+/g, ' ').trim(), lines = txt.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
    var hn = lines.some(function(l) { return l.match(/^[A-Z][a-z]+\s+[A-Z]/); }), hc = lines.some(function(l) { return l.match(/^(Nursery|LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i) || l.toLowerCase().includes('class'); }), hr = lines.some(function(l) { return l.match(/^\d{1,3}$/); }), sc = (hn ? 1 : 0) + (hc ? 1 : 0) + (hr ? 0.5 : 0);
    if (sc >= 1.5 && txt !== lastScanText) { scanHits++; if (scanHits >= 2) { updateStatus('Detected!', '#4ade80'); onCardDetected(txt); lastScanText = txt; scanHits = 0; } }
    else if (sc < 1.5) { scanHits = 0; updateStatus('Scanning...', 'rgba(255,255,255,0.5)'); } else { updateStatus('Hold steady...', 'rgba(255,255,180,0.9)'); }
    lastScanText = txt;
  }).catch(function() { updateStatus('Retrying...', 'rgba(255,150,150,0.6)'); });
}

function onCardDetected(text) {
  scanActive = false; if (scanTimer) clearInterval(scanTimer);
  var lines = text.split('\n').map(function(l) { return l.trim(); }).filter(Boolean), ex = { name: '', cls: '', roll: '', sid: '', father: '', phone: '', dob: '', blood: '' };
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i], lo = l.toLowerCase();
    if (!ex.name && (lo.match(/^[a-z]+\s+[a-z]+$/i) || lo.includes('name'))) { ex.name = l.replace(/name[: ]*/i, '').trim(); if (ex.name.split(' ').length < 2) ex.name = l; }
    else if (!ex.cls && lo.includes('class')) ex.cls = l.replace(/class[: ]*/i, '').trim().toUpperCase();
    else if (!ex.cls && l.match(/^(Nursery|LKG|UKG|[IVX]+)$/i)) ex.cls = l.toUpperCase();
    else if (!ex.roll && (lo.includes('roll') || lo.includes('rno'))) ex.roll = l.replace(/(roll|rno)[: .]*/i, '').trim();
    else if (!ex.roll && l.match(/^\d{1,3}$/)) ex.roll = l;
    else if (!ex.sid) ex.sid = l.replace(/(id|adm|admission|no)[: .]*/i, '').trim();
    else if (!ex.father && lo.includes('father')) ex.father = l.replace(/father[: ]*/i, '').trim();
    else if (!ex.phone && l.match(/^\d{10}$/)) ex.phone = l;
    else if (!ex.dob) ex.dob = l.replace(/(dob|birth|date)[: .]*/i, '').trim();
    else if (!ex.blood) ex.blood = l.replace(/(blood|bg|group)[: .]*/i, '').trim();
  }
  document.getElementById('scanOut').innerHTML = '<div style="background:#ECFDF5;padding:14px;border-radius:8px;border:2px solid #4ade80"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><strong style="color:#059669">ID Card Detected</strong></div><form onsubmit="return saveScanned(event)"><div class="r2"><div class="fg"><label>Student ID</label><input name="sid" value="' + ex.sid + '"></div><div class="fg"><label>Full Name *</label><input name="name" value="' + ex.name + '" required></div></div><div class="r2"><div class="fg"><label>Class *</label><input name="cls" value="' + ex.cls + '" required></div><div class="fg"><label>Section</label><select name="sec"><option>A</option><option>B</option><option>C</option></select></div></div><div class="r2"><div class="fg"><label>Roll No</label><input name="roll" value="' + ex.roll + '"></div><div class="fg"><label>Date of Birth</label><input name="dob" type="date" value="' + ex.dob + '"></div></div><div class="r2"><div class="fg"><label>Father</label><input name="father" value="' + ex.father + '"></div><div class="fg"><label>Phone</label><input name="phone" value="' + ex.phone + '"></div></div><div class="r2"><div class="fg"><label>Blood Group</label><input name="blood" value="' + ex.blood + '"></div><div class="fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div></div><div style="display:flex;gap:8px;margin-top:10px"><button type="submit" class="btn btn-b">Save to Database</button><button type="button" class="btn btn-o" onclick="scanActive=true;startScanLoop();document.getElementById(\'scanOut\').innerHTML=\'\';updateStatus(\'Scanning...\',\'white\')">Scan Another</button></div></form></div>';
}
function manualCapture() { if (scanTimer) clearInterval(scanTimer); updateStatus('Capturing...', '#4ade80'); captureAndDetect(); }

async function saveScanned(e) {
  e.preventDefault(); var f = e.target;
  var sid = f.sid.value || ('SKPPS' + Date.now().toString(36).toUpperCase()), name = f.name.value, cls = f.cls.value,
      sec = f.sec.value, roll = parseInt(f.roll.value) || 0, dob = f.dob.value || '2000-01-01',
      father = f.father.value, phone = f.phone.value, blood = f.blood.value, house = f.house.value;
  var st = { sid: sid, roll: roll, name: name, father: father, mother: '', dob: dob, cls: cls, sec: sec, house: house, blood: blood, phone: phone, added: new Date().toISOString() };
  students.push(st); saveStudentsLocal(students);
  var apiRes = await saveStudentToDB(st);
  document.getElementById('scanOut').innerHTML = '<div class="alert aok" style="font-size:13px;padding:16px"><strong>' + name + ' saved!</strong><br>ID: ' + sid + ' | Class: ' + cls + '-' + sec + ' | Password: ' + dob.replace(/-/g, '').substring(0, 8) + ' (DOB)<br><small>' + (apiRes ? 'Saved to MySQL database' : 'Saved to local storage') + '</small></div><button class="btn btn-o mt1" onclick="scanActive=true;startScanLoop();document.getElementById(\'scanOut\').innerHTML=\'\';updateStatus(\'Scanning...\',\'white\')">Scan Another</button>';
  render(); return false;
}

initData();
