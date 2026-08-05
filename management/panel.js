/**
 * SKPPS Management Panel — Complete, Self-Contained
 * Google Labs-inspired clean design | Firebase | OCR Scanner
 */

// ===== Firebase (self-contained, no external file needed) =====
(function initFirebase(){
  if(window._fbReady) return;
  window.FIREBASE_CONFIG = {};
  var s = localStorage.getItem("skpps_firebase_config");
  if(s) try { FIREBASE_CONFIG = JSON.parse(s) } catch(e) {}

  var _fb=null, _fbP=null;
  window._fbReady = function() {
    if(_fbP) return _fbP;
    _fbP = new Promise(function(ok){
      if(_fb&&_fb.db) return ok(_fb);
      if(!FIREBASE_CONFIG.apiKey) { ok(null); return; }
      function ld(u) { return new Promise(function(y,n){
        if(document.querySelector('script[src="'+u+'"]')) return y();
        var s=document.createElement('script'); s.src=u; s.onload=y; s.onerror=n; document.head.appendChild(s);
      })}
      ld('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
        .then(function(){ return ld('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js') })
        .then(function(){ if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG); _fb={db:firebase.firestore()}; ok(_fb) })
        .catch(function(){ ok(null) });
    });
    return _fbP;
  };
  window.fbGetStudents = async function() { var f=await _fbReady(); if(!f) return []; var s=await f.db.collection('students').where('is_active','==',true).orderBy('class').orderBy('roll_no').get(); return s.docs.map(function(d){var r=d.data(); r.student_id=d.id; return r}) };
  window.fbAddStudent = async function(d) { var f=await _fbReady(); if(!f) throw new Error('Firebase not connected. Run firebase-setup.html first.'); if(!d.student_id) { d.student_id = 'SKPPS'+new Date().getFullYear()+String(Date.now()%10000).padStart(4,'0') } d.password = d.password||(d.date_of_birth||'').replace(/-/g,'').substring(0,8); d.created_at = firebase.firestore.FieldValue.serverTimestamp(); d.is_active=true; await f.db.collection('students').doc(d.student_id).set(d,{merge:true}); return d };
  window.fbFindStudent = async function(id) { var f=await _fbReady(); if(!f) return null; var d=await f.db.collection('students').doc(id).get(); if(d.exists){var r=d.data();r.student_id=d.id;return r} return null };
  window.fbGetTeachers = async function() { var f=await _fbReady(); if(!f) return []; var s=await f.db.collection('teachers').where('is_active','==',true).get(); return s.docs.map(function(d){var r=d.data();r.username=d.id;return r}) };
  window.fbAddTeacher = async function(d) { var f=await _fbReady(); if(!f) throw new Error('Firebase not connected'); d.created_at=firebase.firestore.FieldValue.serverTimestamp(); d.is_active=true; await f.db.collection('teachers').doc(d.username).set(d,{merge:true}); return d };
  window.fbFindTeacher = async function(u) { var f=await _fbReady(); if(!f) return null; var d=await f.db.collection('teachers').doc(u).get(); return d.exists?d.data():null };
})();

// ===== MAIN APP =====
(function(){
  if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){
    location.href='../staff-login.html';
  }
  document.getElementById('uname').textContent = ' \u2014 '+(sessionStorage.getItem('skpps_name')||'Admin');

  var students=[], teachers=[], curTab='scan', camStream=null, ocrWorker=null;

  async function loadOCR(){ if(!ocrWorker) ocrWorker = await Tesseract.createWorker('eng'); return ocrWorker }

  async function loadDB(){
    document.getElementById('mc').innerHTML = spinnerHTML('Connecting to Firestore...');
    try { students = await fbGetStudents() || []; teachers = await fbGetTeachers() || [] } catch(e) { students=[]; teachers=[] }
    render();
  }

  function spinnerHTML(msg) {
    return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;color:#5F6368">'+
      '<div style="width:40px;height:40px;border:3px solid #E8EAED;border-top-color:#1A73E8;border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:16px"></div>'+
      '<p style="font-size:14px">'+msg+'</p></div>';
  }

  window.logout = function(){ sessionStorage.clear(); location.href='../staff-login.html' };
  window.navTo = function(t){ curTab=t; closeCam(); render(); };

  function render(){
    var h = '';
    h += '<div class="g-stats"><div class="g-stat"><div class="g-stat-v">'+students.length+'</div><div class="g-stat-l">Students</div></div><div class="g-stat"><div class="g-stat-v">'+teachers.length+'</div><div class="g-stat-l">Teachers</div></div><div class="g-stat"><div class="g-stat-v">'+(students.length?new Set(students.map(function(s){return s.class||s.cls})).size:0)+'</div><div class="g-stat-l">Classes</div></div></div>';
    h += '<div class="g-tabs">'+tabBtn('scan','Scanner')+tabBtn('bulk','Import')+tabBtn('teacher','Teachers')+tabBtn('all','Students')+'</div>';
    if(curTab==='scan') h += renderScanner();
    else if(curTab==='bulk') h += renderBulk();
    else if(curTab==='teacher') h += renderTeachers();
    else h += renderAll();
    document.getElementById('mc').innerHTML = h;
  }
  function tabBtn(id,label){ return '<button class="g-tab'+(curTab===id?' active':'')+'" onclick="navTo(\''+id+'\')">'+label+'</button>' }

  // ===== SCANNER =====
  function renderScanner(){
    return '<div class="g-scan-grid"><div class="g-scan-card" onclick="document.getElementById(\'fileInp\').click()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><h3>Upload Photo</h3><p>Select ID card image</p><input type="file" id="fileInp" accept="image/*" onchange="handleUpload(event)"></div><div class="g-scan-card" onclick="openCam()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><h3>Take Photo</h3><p>Use camera</p></div></div><div id="procArea"></div><div id="rawOcr" style="display:none;background:#F8F9FA;border-radius:12px;padding:12px;margin:12px 0;font-family:monospace;font-size:11px;white-space:pre-wrap;max-height:120px;overflow:auto;color:#5F6368"></div><div id="resultArea"></div>';
  }

  window.handleUpload = function(e){ var f=e.target.files[0]; if(!f) return; showProgress(); scanFile(f); e.target.value='' };
  function showProgress(){
    document.getElementById('procArea').innerHTML = '<div class="g-card" style="text-align:center;padding:24px;margin-bottom:12px"><p style="font-size:14px;color:#5F6368;margin-bottom:12px">Scanning ID Card...</p><div class="g-progress"><div class="g-progress-fill" id="ocrBar" style="width:0%"></div></div><p style="font-size:11px;color:#9AA0A6;margin-top:8px" id="ocrText">Loading OCR...</p></div>';
    document.getElementById('resultArea').innerHTML=''; document.getElementById('rawOcr').style.display='none';
  }

  async function scanFile(file){
    try {
      var img = await new Promise(function(ok,fail){ var r=new FileReader(); r.onload=function(){ var i=new Image(); i.onload=function(){ok(i)}; i.onerror=fail; i.src=r.result }; r.onerror=fail; r.readAsDataURL(file) });
      pct(10,'OCR engine ready'); var w = await loadOCR();
      pct(25,'Reading text from image...'); var result = await w.recognize(img);
      pct(100,'Complete!');
      document.getElementById('rawOcr').textContent = 'RAW OCR OUTPUT:\n'+result.data.text;
      document.getElementById('rawOcr').style.display='block';
      var data = parseIDCard(result.data.text);
      showForm(data, result.data.text);
    } catch(e) { showError('Scan failed: '+e.message); console.error(e) }
    setTimeout(function(){ document.getElementById('procArea').innerHTML='' }, 500);
  }
  function pct(v,m){ var b=document.getElementById('ocrBar'),t=document.getElementById('ocrText'); if(b)b.style.width=v+'%'; if(t)t.textContent=m||'' }

  window.openCam = function(){ document.getElementById('camModal').classList.add('open'); var v=document.getElementById('camVid'); navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1920}}}).then(function(s){camStream=s;v.srcObject=s}).catch(function(){alert('Camera unavailable');closeCam()}) };
  window.closeCam = function(){ document.getElementById('camModal').classList.remove('open'); if(camStream){camStream.getTracks().forEach(function(t){t.stop()});camStream=null} };
  window.capturePhoto = function(){ var v=document.getElementById('camVid'); if(!v||v.readyState<2)return; var c=document.createElement('canvas'); c.width=v.videoWidth; c.height=v.videoHeight; c.getContext('2d').drawImage(v,0,0); closeCam(); c.toBlob(function(blob){showProgress();scanFile(blob)},'image/jpeg',0.85) };

  // ===== SMART OCR PARSER — Field-by-field, no cross-contamination =====
  function parseIDCard(raw){
    var txt = raw.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
    txt = txt.replace(/[^a-zA-Z0-9\s\n\/\-.,:@()#'"]/g,' ').replace(/ +/g,' ').trim();
    var lines = txt.split('\n').map(function(l){return l.trim()}).filter(Boolean);
    var lo = txt.toLowerCase();
    var f = {name:'',className:'',section:'',studentID:'',father:'',phone:'',dob:'',blood:'',gender:'Male'};

    /* Extract VALUE after a KEYWORD on a SINGLE LINE — avoids cross-field contamination */
    function getVal(keyword, line) {
      var patterns = [
        new RegExp(keyword+'[\\s\'\\w]*?[:=\\s]+([a-z0-9]{2,}(?:\\s+[a-z0-9]{2,}){1,3})','i'),
        new RegExp(keyword+'[\\s\'\\w]*?[:=\\s]+(\\d{5}[\\s\\-]?\\d{5}|\\d{10})','i')
      ];
      for(var p=0;p<patterns.length;p++){
        var m = line.match(patterns[p]);
        if(m) return m[1].trim();
      }
      return '';
    }

    /* Process each line for the field it starts with */
    for(var i=0;i<lines.length;i++){
      var l = lines[i], ll = l.toLowerCase();

      /* NAME: line starts with "Name" */
      if(ll.match(/^name\b/i)) { var v=getVal('name',ll); if(v&&!/father|mother|class|blood|phone|dob|school/i.test(v)) f.name=v; continue }
      /* FATHER: line starts with "Father" */
      if(ll.match(/^father/i)) { var v=getVal('father',ll); if(v&&!/mother|name|class|blood|phone|dob/i.test(v)) f.father=v; continue }
      /* MOTHER: line starts with "Mother" */
      if(ll.match(/^mother/i)) { var v=getVal('mother',ll); if(v)f.mother=v; continue }
      /* CLASS: line starts with "Class" */
      if(ll.match(/^class\b/i)) { var v=getVal('class',ll); if(v)f.className=v.toUpperCase(); if(ll.match(/\b([a-c])\b/i)) f.section=ll.match(/\b([a-c])\b/i)[1].toUpperCase(); continue }
      /* SECTION: line starts with "Section" */
      if(ll.match(/^section/i)) { var m=ll.match(/([a-c])\b/i); if(m)f.section=m[1].toUpperCase(); continue }
      /* DOB: line starts with "DOB" or "Date of Birth" */
      if(ll.match(/^dob|^date\s+of\s+birth|^birth/i)) { var m=ll.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/); if(m){var p=m[1].split(/[\/\-.]/);if(p[2].length===2)p[2]='20'+p[2];f.dob=p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')} continue }
      /* BLOOD: line starts with "Blood" */
      if(ll.match(/^blood|^bg/i)) { var m=ll.match(/((?:a|b|ab|o)[+-])/i); if(m)f.blood=m[1].toUpperCase(); continue }
      /* PHONE: line starts with "Phone" or "Mobile" or "Contact" */
      if(ll.match(/^phone|^mobile|^contact|^tel/i)) { var m=ll.match(/(\d{5}[\s\-]?\d{5}|\d{10})/); if(m)f.phone=m[1].replace(/\D/g,''); continue }
      /* STUDENT ID */
      if(ll.match(/^student\s*id|^admission|^adm\s*no|^id\s*no/i)) { var m=ll.match(/([\w\-]{3,})/); if(m)f.studentID=m[1].toUpperCase(); continue }
      if(ll.match(/^house/i)) { var m=ll.match(/\b(earth|fire|water|air)\b/i); if(m)f.house=m[1].charAt(0).toUpperCase()+m[1].slice(1); continue }
    }

    /* Fallbacks for missed fields */
    if(!f.name){ for(var i=0;i<lines.length;i++){ if(!/^name|^father|^mother|^class|^section|^dob|^blood|^phone|^house|^student|^admission|^id|^school|^presidency/i.test(lines[i].toLowerCase())&&lines[i].split(/\s+/).length>=2&&!/[:#\d]/.test(lines[i])){f.name=lines[i];break} } }
    if(!f.className){ for(var i=0;i<lines.length;i++){ var cm=lines[i].toLowerCase().match(/\b(nursery|lkg|ukg|iv|iii|ii|vi|vii|viii|ix|xi|xii)\b/i); if(cm){f.className=cm[1].toUpperCase();break} } }
    if(!f.dob){ var dm=txt.match(/(\d{2}[\/\-.]\d{2}[\/\-.]\d{4})/); if(dm){var p=dm[1].split(/[\/\-.]/); f.dob=p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')} }
    if(!f.phone){ var pm=txt.match(/(\d{10})/); if(pm)f.phone=pm[1] }

    f.name = titleCase(f.name); f.father = titleCase(f.father);
    return f;
  }
  function titleCase(s){ if(!s) return ''; return s.replace(/\b\w/g,function(c){return c.toUpperCase()}) }

  // ===== SHOW FORM =====
  function showForm(data,raw){
    var sid = data.studentID || ('SKPPS'+new Date().getFullYear()+String(Date.now()%10000).padStart(4,'0'));
    var checks = {name:!!data.name, cls:!!data.className, dob:!!data.dob, blood:!!data.blood, father:!!data.father, phone:!!data.phone};
    var anyDetected = checks.name||checks.cls||checks.dob||checks.blood||checks.father||checks.phone;

    function greenIf(ok){ return ok?'style="background:#f0fdf4;border-color:#86efac"' : '' }
    function checkIcon(ok){ return ok?'\u2713':'\u2717' }
    function checkColor(ok){ return ok?'#059669':'#DC2626' }

    var h = '<div class="g-card" style="border:2px solid #4ade80;margin-bottom:12px"><div class="g-card-hd" style="color:#059669"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ID Card Scanned '+(anyDetected?'\u2014 Details auto-filled':'\u2014 Verify details')+'</div>';
    h += '<div class="g-card-bd">';
    h += '<details style="margin-bottom:12px"><summary style="font-size:11px;color:#9AA0A6;cursor:pointer">View OCR text</summary><pre style="font-size:10px;background:#F8F9FA;padding:10px;border-radius:8px;max-height:70px;overflow:auto;margin-top:6px;font-family:monospace;white-space:pre-wrap">'+esc(raw)+'</pre></details>';
    h += '<div style="font-size:11px;color:#9AA0A6;margin-bottom:12px;background:#F0FDF4;padding:8px 12px;border-radius:8px;display:flex;flex-wrap:wrap;gap:6px 16px">';
    for(var k in checks){ h += '<span style="color:'+checkColor(checks[k])+'">'+checkIcon(checks[k])+' '+k.charAt(0).toUpperCase()+k.slice(1)+'</span>' }
    h += '</div>';

    h += '<form onsubmit="return saveStudent(event)"><input type="hidden" name="sid" value="'+esc(sid)+'">';
    h += '<div class="g-frow"><div class="g-fg"><label>Student ID</label><input name="stid" value="'+esc(sid)+'" style="background:#f0fdf4;color:#065f46;border-color:#86efac" readonly></div><div class="g-fg"><label>Full Name *</label><input name="name" value="'+esc(data.name)+'" '+greenIf(checks.name)+' required></div></div>';
    h += '<div class="g-frow"><div class="g-fg"><label>Class *</label><input name="cls" value="'+esc(data.className)+'" '+greenIf(checks.cls)+' required></div><div class="g-fg"><label>Section</label><select name="sec"><option '+(data.section==='A'?'selected':'')+'>A</option><option '+(data.section==='B'?'selected':'')+'>B</option><option '+(data.section==='C'?'selected':'')+'>C</option></select></div></div>';
    h += '<div class="g-frow"><div class="g-fg"><label>Date of Birth</label><input name="dob" type="date" value="'+esc(data.dob)+'" '+greenIf(checks.dob)+'></div><div class="g-fg"><label>Blood Group</label><input name="blood" value="'+esc(data.blood)+'" '+greenIf(checks.blood)+'></div></div>';
    h += '<div class="g-frow"><div class="g-fg"><label>Father Name</label><input name="father" value="'+esc(data.father)+'" '+greenIf(checks.father)+'></div><div class="g-fg"><label>Parent Phone</label><input name="phone" value="'+esc(data.phone)+'" type="tel" '+greenIf(checks.phone)+'></div></div>';
    h += '<div class="g-frow"><div class="g-fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div><div class="g-fg"><label>Gender</label><select name="gender"><option '+(data.gender==='Male'?'selected':'')+'>Male</option><option '+(data.gender==='Female'?'selected':'')+'>Female</option></select></div></div>';
    h += '<div style="display:flex;gap:10px;margin-top:14px"><button type="submit" class="g-btn g-btn-pri"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save to Firestore</button><button type="button" class="g-btn g-btn-sec" onclick="clearRes()">Cancel</button></div>';
    h += '</form></div></div>';
    document.getElementById('resultArea').innerHTML = h;
  }
  function esc(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
  function showError(msg){ document.getElementById('resultArea').innerHTML='<div class="g-card"><div class="g-card-hd" style="color:#DC2626">Scan Failed</div><div class="g-card-bd"><div class="g-alert g-alert-err">'+msg+'</div><button onclick="clearRes()" class="g-btn g-btn-sec">Try Again</button></div></div>' }
  window.clearRes = function(){ document.getElementById('resultArea').innerHTML=''; document.getElementById('procArea').innerHTML=''; document.getElementById('rawOcr').style.display='none' }

  window.saveStudent = async function(e){
    e.preventDefault(); var f = e.target;
    var sid=f.stid.value, name=f.name.value, cls=f.cls.value, sec=f.sec.value, dob=f.dob.value||'2000-01-01', father=f.father.value, phone=f.phone.value, blood=f.blood.value, house=f.house.value, gender=f.gender.value;
    if(!name||!cls) { alert('Name and Class are required'); return false }
    try {
      await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,date_of_birth:dob,father_name:father,parent_phone:phone,blood_group:blood,house:house,gender:gender,is_active:true,password:dob.replace(/-/g,'').substring(0,8)});
      document.getElementById('resultArea').innerHTML='<div class="g-card" style="border:2px solid #059669"><div class="g-card-hd" style="color:#059669">Student Saved!</div><div class="g-card-bd"><p style="font-size:14px"><strong>'+esc(name)+'</strong> added to Firestore</p><p style="font-size:11px;color:#5F6368;margin-top:6px">ID: '+esc(sid)+' | Password: '+dob.replace(/-/g,'').substring(0,8)+' (DOB)</p><button onclick="clearRes()" class="g-btn g-btn-sec" style="margin-top:12px">Scan Another</button></div></div>';
      loadDB();
    } catch(e) { alert('Save failed: '+e.message) }
    return false;
  };

  // ===== BULK IMPORT =====
  function renderBulk(){ return '<div class="g-card"><div class="g-card-hd">Bulk Import (CSV)</div><div class="g-card-bd"><p style="font-size:12px;color:#5F6368;margin-bottom:12px">Paste data from school software. Format per line: ID,Name,Class,Section,DOB,Father,Mother,Phone,Gender,House</p><textarea id="csvIn" style="width:100%;height:160px;border:1.5px solid #DADCE0;border-radius:8px;padding:12px;font-family:monospace;font-size:11px" placeholder="SKPPS2024001,John Smith,V,A,2017-05-10,Robert Smith,Mary Smith,9876543210,Male,Earth"></textarea><button class="g-btn g-btn-pri" style="margin-top:10px" onclick="doImport()">Import to Firestore</button><div id="csvMsg" style="margin-top:10px"></div></div></div>' }
  window.doImport = async function(){
    var t=document.getElementById('csvIn').value.trim(); if(!t) return;
    var lines=t.split('\n').filter(Boolean), a=0, s=0;
    for(var i=0;i<lines.length;i++){ var c=lines[i].split(',').map(function(x){return x.trim()}); if(c.length<5){s++;continue}
      var sid=c[0]||('SKPPS'+new Date().getFullYear()+String(a+1).padStart(3,'0')), name=c[1], cls=c[2], sec=c[3]||'A', dob=c[4]||'2000-01-01', father=c[5]||'', mother=c[6]||'', phone=c[7]||'', gender=c[8]||'Male', house=c[9]||'Earth';
      if(!name||!cls){s++;continue}
      try { await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,date_of_birth:dob,father_name:father,mother_name:mother,parent_phone:phone,gender:gender,house:house,is_active:true,password:dob.replace(/-/g,'').substring(0,8)}); a++ } catch(e){ s++ }
    }
    document.getElementById('csvMsg').innerHTML='<div class="g-alert g-alert-ok">Imported: '+a+'. Skipped: '+s+'</div>'; loadDB();
  };

  // ===== TEACHERS =====
  function renderTeachers(){
    var rows=''; if(!teachers.length) rows='<tr><td colspan="3" style="text-align:center;padding:24px;color:#9AA0A6">No teachers yet</td></tr>';
    else for(var i=0;i<teachers.length;i++){ var t=teachers[i]; rows+='<tr><td><strong>'+esc(t.full_name)+'</strong></td><td>'+esc(t.username)+'</td><td><span class="g-badge g-badge-gr">Active</span></td></tr>' }
    return '<div class="g-card"><div class="g-card-hd">Teacher Accounts</div><div class="g-card-bd"><form onsubmit="return addTchr(event)" style="margin-bottom:16px"><div class="g-frow"><div class="g-fg"><label>Full Name</label><input id="tn" required></div><div class="g-fg"><label>Username</label><input id="tu" required></div></div><div class="g-frow"><div class="g-fg"><label>Password</label><input type="password" id="tpw" required minlength="4"></div><div class="g-fg"><label>Email</label><input type="email" id="te"></div></div><button type="submit" class="g-btn g-btn-pri">Add Teacher</button></form><div class="g-tbl"><table class="g-tbl-tbl"><tr><th>Name</th><th>Username</th><th>Status</th></tr>'+rows+'</table></div></div></div>';
  }
  window.addTchr = async function(e){ e.preventDefault(); var n=document.getElementById('tn').value.trim(), u=document.getElementById('tu').value.trim(), p=document.getElementById('tpw').value.trim(), em=document.getElementById('te').value.trim(); try { await fbAddTeacher({username:u,password:p,full_name:n,email:em,is_active:true}) } catch(er){ alert('Failed'); return false } loadDB(); return false };

  // ===== ALL STUDENTS =====
  function renderAll(){
    var rows=''; if(!students.length) rows='<tr><td colspan="8" style="text-align:center;padding:36px;color:#9AA0A6">No students yet. Use Scanner or Import to add.</td></tr>';
    else for(var i=0;i<students.length;i++){ var s=students[i], hc=s.house||'Earth', bc=(hc==='Earth'?'g-badge-gr':hc==='Fire'?'g-badge-rd':hc==='Water'?'g-badge-bl':'g-badge-yl'); rows+='<tr><td>'+esc(s.student_id)+'</td><td><strong>'+esc(s.full_name)+'</strong></td><td>'+esc(s.class)+'</td><td>'+esc(s.section||'')+'</td><td style="font-size:11px">'+esc(s.date_of_birth||'')+'</td><td><span class="g-badge '+bc+'">'+hc+'</span></td><td>'+esc(s.parent_phone||'')+'</td><td style="font-size:10px">'+esc(s.blood_group||'')+'</td></tr>' }
    return '<div class="g-card"><div class="g-card-hd">All Students ('+students.length+')</div><div class="g-card-bd"><input style="width:100%;padding:10px 14px;border:1.5px solid #DADCE0;border-radius:24px;font-size:13px;font-family:inherit;margin-bottom:14px" placeholder="Search students..." oninput="filterTbl(this.value)"><div class="g-tbl"><table class="g-tbl-tbl" id="stbl"><tr><th>ID</th><th>Name</th><th>Class</th><th>Section</th><th>DOB</th><th>House</th><th>Phone</th><th>Blood</th></tr>'+rows+'</table></div></div></div>';
  }
  window.filterTbl = function(q){ var r=document.querySelectorAll('#stbl tr'); for(var i=1;i<r.length;i++) r[i].style.display = r[i].textContent.toLowerCase().includes(q.toLowerCase())?'':'none' }

  loadDB();
  setTimeout(function(){ loadOCR().catch(function(){}) }, 1000);
})();
